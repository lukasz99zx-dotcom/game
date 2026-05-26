import Phaser from 'phaser';
import { EnemyType, ENEMY_TYPES, WAVE_DURATION, BOSS_WAVE_INTERVAL } from '../constants';

interface WaveConfig {
  enemies: { type: EnemyType; count: number; weight: number }[];
  spawnInterval: number; // ms between spawns
}

function buildWaveConfig(wave: number): WaveConfig {
  const pool: { type: EnemyType; weight: number }[] = [];

  if (wave <= 3) {
    pool.push({ type: ENEMY_TYPES.WOLF, weight: 3 });
    pool.push({ type: ENEMY_TYPES.SKELETON, weight: 2 });
  } else if (wave <= 6) {
    pool.push({ type: ENEMY_TYPES.WOLF, weight: 1 });
    pool.push({ type: ENEMY_TYPES.ZOMBIE, weight: 3 });
    pool.push({ type: ENEMY_TYPES.GOBLIN, weight: 2 });
  } else if (wave <= 9) {
    pool.push({ type: ENEMY_TYPES.ZOMBIE, weight: 1 });
    pool.push({ type: ENEMY_TYPES.GOBLIN, weight: 2 });
    pool.push({ type: ENEMY_TYPES.NECROMANCER, weight: 1 });
  } else if (wave <= 12) {
    pool.push({ type: ENEMY_TYPES.GOBLIN, weight: 1 });
    pool.push({ type: ENEMY_TYPES.DEMON, weight: 2 });
    pool.push({ type: ENEMY_TYPES.VAMPIRE, weight: 2 });
  } else {
    pool.push({ type: ENEMY_TYPES.DEMON, weight: 2 });
    pool.push({ type: ENEMY_TYPES.VAMPIRE, weight: 2 });
    pool.push({ type: ENEMY_TYPES.NECROMANCER, weight: 1 });
  }

  // Aggressive spawn scaling
  const spawnInterval = Math.max(150, 900 - wave * 35);  // down to 150ms at wave 21+

  return {
    enemies: pool.map(p => ({ ...p, count: 0 })),
    spawnInterval,
  };
}

function getBossType(wave: number): EnemyType | null {
  if (wave % BOSS_WAVE_INTERVAL !== 0) return null;
  if (wave === 5) return ENEMY_TYPES.OGRE_WARLORD;
  if (wave === 10) return ENEMY_TYPES.BLACK_KNIGHT;
  if (wave === 15) return ENEMY_TYPES.ARCLICH;
  if (wave >= 20) return ENEMY_TYPES.CHAOS_DRAGON;
  return ENEMY_TYPES.OGRE_WARLORD;
}

export class WaveSystem {
  scene: Phaser.Scene;
  currentWave: number = 0;
  waveTimer: number = 0;
  spawnTimer: number = 0;
  bossSpawned: boolean = false;
  config: WaveConfig;
  weightTotal: number = 0;
  isActive: boolean = false;

  private worldWidth: number;
  private worldHeight: number;

  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
    this.scene = scene;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.config = buildWaveConfig(1);
    this.weightTotal = this.config.enemies.reduce((s, e) => s + e.weight, 0);
  }

  startNextWave(): void {
    this.currentWave++;
    this.waveTimer = WAVE_DURATION;
    this.bossSpawned = false;
    this.config = buildWaveConfig(this.currentWave);
    this.weightTotal = this.config.enemies.reduce((s, e) => s + e.weight, 0);
    this.spawnTimer = 0;
    this.isActive = true;
    this.scene.events.emit('wave-started', this.currentWave);

    // Announce boss wave
    const bossType = getBossType(this.currentWave);
    if (bossType) {
      this.scene.time.delayedCall(3000, () => {
        this.scene.events.emit('boss-incoming', bossType);
      });
    }
  }

  update(dt: number): void {
    if (!this.isActive) return;
    this.waveTimer -= dt;
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.config.spawnInterval;
      // Batch size: grows dramatically over wave time AND over wave number
      const waveProgress = 1 - this.waveTimer / WAVE_DURATION; // 0→1
      const baseBatch = Math.min(12, 1 + Math.floor(this.currentWave / 2));
      const batch = Math.ceil(baseBatch * (0.4 + waveProgress * 1.6)); // 40% → 200% of base
      for (let i = 0; i < batch; i++) {
        this.spawnEnemy();
      }
    }

    // Boss at 50% wave
    const bossType = getBossType(this.currentWave);
    if (bossType && !this.bossSpawned && this.waveTimer < WAVE_DURATION * 0.5) {
      this.bossSpawned = true;
      this.scene.events.emit('spawn-boss', bossType, ...this.getSpawnPosition());
    }
  }

  private spawnEnemy(): void {
    const type = this.pickEnemyType();
    const [x, y] = this.getSpawnPosition();
    this.scene.events.emit('spawn-enemy', type, x, y);
  }

  private pickEnemyType(): EnemyType {
    let r = Math.random() * this.weightTotal;
    for (const e of this.config.enemies) {
      r -= e.weight;
      if (r <= 0) return e.type;
    }
    return this.config.enemies[0].type;
  }

  getSpawnPosition(): [number, number] {
    const margin = 30;
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    switch (side) {
      case 0: x = margin + Math.random() * (this.worldWidth - 2*margin); y = margin; break;
      case 1: x = margin + Math.random() * (this.worldWidth - 2*margin); y = this.worldHeight - margin; break;
      case 2: x = margin; y = margin + Math.random() * (this.worldHeight - 2*margin); break;
      case 3: x = this.worldWidth - margin; y = margin + Math.random() * (this.worldHeight - 2*margin); break;
    }
    return [x, y];
  }

  getWaveTimeLeft(): number {
    return Math.max(0, this.waveTimer);
  }

  getProgress(): number {
    return Math.max(0, 1 - this.waveTimer / WAVE_DURATION);
  }
}
