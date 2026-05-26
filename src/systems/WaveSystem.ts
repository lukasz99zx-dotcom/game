import Phaser from 'phaser';
import { EnemyType, ENEMY_TYPES, WAVE_DURATION, BOSS_WAVE_INTERVAL } from '../constants';

interface WaveConfig {
  enemies: { type: EnemyType; count: number; weight: number }[];
  spawnInterval: number; // ms between spawns
  totalEnemies: number;
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

  const totalEnemies = 8 + wave * 3;
  const spawnInterval = Math.max(200, 800 - wave * 30);

  return {
    enemies: pool.map(p => ({ ...p, count: 0 })),
    spawnInterval,
    totalEnemies,
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
  spawned: number = 0;
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
    this.spawned = 0;
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

    if (this.spawnTimer <= 0 && this.spawned < this.config.totalEnemies) {
      this.spawnTimer = this.config.spawnInterval;
      this.spawnEnemy();
    }

    // Spawn boss mid-wave
    const bossType = getBossType(this.currentWave);
    if (bossType && !this.bossSpawned && this.waveTimer < WAVE_DURATION * 0.6) {
      this.bossSpawned = true;
      this.scene.events.emit('spawn-boss', bossType, ...this.getSpawnPosition());
    }
  }

  private spawnEnemy(): void {
    const type = this.pickEnemyType();
    const [x, y] = this.getSpawnPosition();
    this.scene.events.emit('spawn-enemy', type, x, y);
    this.spawned++;
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
    const cam = this.scene.cameras.main;
    const margin = 80;
    const side = Math.floor(Math.random() * 4);
    const cx = cam.scrollX + cam.width / 2;
    const cy = cam.scrollY + cam.height / 2;
    const halfW = cam.width / 2 + margin;
    const halfH = cam.height / 2 + margin;

    let x = 0, y = 0;
    switch (side) {
      case 0: x = cx + (Math.random() - 0.5) * cam.width; y = cy - halfH; break;
      case 1: x = cx + (Math.random() - 0.5) * cam.width; y = cy + halfH; break;
      case 2: x = cx - halfW; y = cy + (Math.random() - 0.5) * cam.height; break;
      case 3: x = cx + halfW; y = cy + (Math.random() - 0.5) * cam.height; break;
    }
    x = Phaser.Math.Clamp(x, margin, this.worldWidth - margin);
    y = Phaser.Math.Clamp(y, margin, this.worldHeight - margin);
    return [x, y];
  }

  getWaveTimeLeft(): number {
    return Math.max(0, this.waveTimer);
  }

  getProgress(): number {
    return Math.max(0, 1 - this.waveTimer / WAVE_DURATION);
  }
}
