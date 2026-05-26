import Phaser from 'phaser';
import {
  SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT,
  HeroClass, HERO_CLASSES, WeaponType, WEAPON_TYPES, XP_PER_LEVEL, MAX_WEAPONS,
} from '../constants';
import { Player } from '../entities/Player';
import { Enemy, ENEMY_DATA } from '../entities/Enemy';
import { WaveSystem } from '../systems/WaveSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { HUD } from '../ui/HUD';
import { UpgradeOption } from '../types';
import { EnemyType } from '../constants';

const UPGRADE_POOL: UpgradeOption[] = [
  { id: 'w_sword',     name: 'Lightning Sword',    description: 'Circular sword attack. Hits all nearby enemies.',  type: 'weapon', weaponType: WEAPON_TYPES.LIGHTNING_SWORD },
  { id: 'w_bow',       name: 'Enchanted Crossbow',  description: 'Piercing arrow. Hits up to 3 enemies in a line.', type: 'weapon', weaponType: WEAPON_TYPES.ENCHANTED_CROSSBOW },
  { id: 'w_fire',      name: 'Fireball',            description: 'AOE explosion on impact.',                        type: 'weapon', weaponType: WEAPON_TYPES.FIREBALL },
  { id: 'w_cross',     name: 'Holy Cross',          description: 'Orbiting cross hits nearby enemies.',             type: 'weapon', weaponType: WEAPON_TYPES.HOLY_CROSS },
  { id: 'w_frost',     name: 'Frost Aura',          description: 'Slows all enemies in range by 50%.',              type: 'weapon', weaponType: WEAPON_TYPES.FROST_AURA },
  { id: 'w_chain',     name: 'Chain Lightning',     description: 'Jumps between 4 enemies.',                       type: 'weapon', weaponType: WEAPON_TYPES.CHAIN_LIGHTNING },
  { id: 's_hp',        name: '+40 Max HP',          description: 'Increases maximum health by 40.',                 type: 'stat', statKey: 'maxHp', statValue: 40 },
  { id: 's_heal',      name: 'Healing Potion',      description: 'Restore 50 HP immediately.',                     type: 'stat', statKey: 'healHp', statValue: 50 },
  { id: 's_speed',     name: 'Swift Boots',         description: 'Increase movement speed by 20.',                  type: 'stat', statKey: 'speed', statValue: 20 },
  { id: 's_dmg',       name: 'Sharp Blade',         description: 'Increase all damage by 15%.',                    type: 'stat', statKey: 'damage', statValue: 0.15 },
  { id: 's_atkspd',    name: 'Combat Training',     description: 'Increase attack speed by 20%.',                  type: 'stat', statKey: 'attackSpeed', statValue: 0.20 },
  { id: 's_magnet',    name: 'Gold Magnet',         description: 'Increase pickup range by 30.',                   type: 'stat', statKey: 'pickupRange', statValue: 30 },
  { id: 's_armor',     name: 'Iron Skin',           description: 'Reduce incoming damage by 10%.',                 type: 'stat', statKey: 'damageReduction', statValue: 0.10 },
];

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private waveSystem!: WaveSystem;
  private weaponSystem!: WeaponSystem;
  private hud!: HUD;

  // Joystick
  private joystickActive: boolean = false;
  private joystickPointer: Phaser.Input.Pointer | null = null;
  private joystickOrigin = { x: 0, y: 0 };
  private joystickVec = { x: 0, y: 0 };
  private joystickRadius = 50;
  private joystickBaseGfx!: Phaser.GameObjects.Graphics;
  private joystickThumbGfx!: Phaser.GameObjects.Graphics;

  // State
  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private heroClass: HeroClass = HERO_CLASSES.KNIGHT;
  private startTime: number = 0;
  private enemiesKilled: number = 0;
  private bossEnemy: Enemy | null = null;

  // XP orbs and gold coins as simple physics sprites
  private xpOrbs!: Phaser.Physics.Arcade.Group;
  private goldCoins!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  init(data: { heroClass?: HeroClass }): void {
    this.heroClass = data?.heroClass ?? HERO_CLASSES.KNIGHT;
    this.enemies = [];
    this.bossEnemy = null;
    this.isPaused = false;
    this.isGameOver = false;
    this.enemiesKilled = 0;
  }

  create(): void {
    this.startTime = this.time.now;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.createWorld();
    this.createPlayer();
    this.createPickupGroups();
    this.createJoystick();
    this.setupCamera();
    this.createSystems();
    this.setupEvents();

    // Start first wave after a short delay
    this.time.delayedCall(1500, () => {
      this.waveSystem.startNextWave();
    });
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver || this.isPaused) return;

    this.player.update(delta);
    this.movePlayer(delta);
    this.updateEnemies(delta);
    this.weaponSystem.update(delta);
    this.weaponSystem.checkProjectileHits();
    this.waveSystem.update(delta);
    this.updatePickupMagnetism();
    this.updatePickupOverlaps();
    this.updateHUD();

    // Remove dead enemies
    this.enemies = this.enemies.filter(e => e.sprite.active);
    this.weaponSystem.enemies = this.enemies;
  }

  // ── World ──────────────────────────────────────────────────────────────────

  private createWorld(): void {
    // Ground grid
    const ground = this.add.graphics().setDepth(0);
    ground.fillStyle(COLORS.DEEP_GREEN);
    ground.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Grid lines
    ground.lineStyle(1, 0x1E3A0E, 0.5);
    for (let x = 0; x <= WORLD_WIDTH; x += 64) {
      ground.beginPath(); ground.moveTo(x, 0); ground.lineTo(x, WORLD_HEIGHT); ground.strokePath();
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 64) {
      ground.beginPath(); ground.moveTo(0, y); ground.lineTo(WORLD_WIDTH, y); ground.strokePath();
    }

    // Random grass tufts
    const details = this.add.graphics().setDepth(1);
    details.fillStyle(COLORS.FOREST_GREEN, 0.6);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      details.fillRect(x, y, 4 + Math.random() * 4, 2);
    }

    // Castle silhouette in center background
    this.drawCastleBackground();

    // World border wall
    const border = this.add.graphics().setDepth(2);
    border.lineStyle(8, COLORS.DARK_STONE, 0.8);
    border.strokeRect(4, 4, WORLD_WIDTH - 8, WORLD_HEIGHT - 8);
    border.lineStyle(4, COLORS.STONE_GRAY, 0.4);
    border.strokeRect(8, 8, WORLD_WIDTH - 16, WORLD_HEIGHT - 16);
  }

  private drawCastleBackground(): void {
    const cx = WORLD_WIDTH / 2;
    const cy = WORLD_HEIGHT / 2;
    const g = this.add.graphics().setDepth(1).setAlpha(0.25);

    g.fillStyle(0x1A1A2A);
    g.fillRect(cx - 120, cy - 180, 240, 185);
    g.fillRect(cx - 140, cy - 200, 60, 205);
    g.fillRect(cx + 80, cy - 200, 60, 205);
    g.fillStyle(0x111118);
    for (let i = 0; i < 4; i++) g.fillRect(cx - 140 + i * 16, cy - 210, 10, 14);
    for (let i = 0; i < 4; i++) g.fillRect(cx + 80 + i * 16, cy - 210, 10, 14);
    for (let i = 0; i < 10; i++) g.fillRect(cx - 116 + i * 22, cy - 188, 12, 12);
    g.fillStyle(0x050508);
    g.fillRect(cx - 26, cy - 90, 52, 92);
    g.fillCircle(cx, cy - 90, 26);
  }

  // ── Player ─────────────────────────────────────────────────────────────────

  private createPlayer(): void {
    const cx = WORLD_WIDTH / 2;
    const cy = WORLD_HEIGHT / 2;
    this.player = new Player(this, cx, cy, this.heroClass);
    this.player.sprite.setData('isPlayer', true);
  }

  // ── Pickups ─────────────────────────────────────────────────────────────────

  private createPickupGroups(): void {
    this.xpOrbs = this.physics.add.group();
    this.goldCoins = this.physics.add.group();
  }

  private spawnXpOrb(x: number, y: number, amount: number): void {
    const orb = this.physics.add.sprite(x, y, 'xp_crystal').setDepth(3);
    orb.setData('value', amount);
    (orb.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    // Small random scatter
    (orb.body as Phaser.Physics.Arcade.Body).setVelocity(
      (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80
    );
    this.time.delayedCall(300, () => {
      if (orb.active) (orb.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    });
    this.xpOrbs.add(orb);
  }

  private spawnGoldCoin(x: number, y: number, amount: number): void {
    const coin = this.physics.add.sprite(x, y, 'gold_coin').setDepth(3);
    coin.setData('value', amount);
    (coin.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (coin.body as Phaser.Physics.Arcade.Body).setVelocity(
      (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60
    );
    this.time.delayedCall(300, () => {
      if (coin.active) (coin.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    });
    this.goldCoins.add(coin);
  }

  // ── Joystick ────────────────────────────────────────────────────────────────

  private createJoystick(): void {
    this.joystickBaseGfx = this.add.graphics().setScrollFactor(0).setDepth(150).setAlpha(0);
    this.joystickThumbGfx = this.add.graphics().setScrollFactor(0).setDepth(151).setAlpha(0);

    this.drawJoystickBase(100, GAME_HEIGHT - 90);
    this.drawJoystickThumb(100, GAME_HEIGHT - 90);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x > GAME_WIDTH * 0.6) return; // Right side is for special button
      if (this.joystickPointer) return;
      this.joystickPointer = pointer;
      this.joystickActive = true;
      this.joystickOrigin.x = pointer.x;
      this.joystickOrigin.y = pointer.y;
      this.joystickBaseGfx.clear().setAlpha(1);
      this.joystickThumbGfx.clear().setAlpha(1);
      this.drawJoystickBase(pointer.x, pointer.y);
      this.drawJoystickThumb(pointer.x, pointer.y);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer !== this.joystickPointer) return;
      const dx = pointer.x - this.joystickOrigin.x;
      const dy = pointer.y - this.joystickOrigin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(dist, this.joystickRadius);
      const angle = Math.atan2(dy, dx);
      this.joystickVec.x = Math.cos(angle) * (clamped / this.joystickRadius);
      this.joystickVec.y = Math.sin(angle) * (clamped / this.joystickRadius);
      const tx = this.joystickOrigin.x + Math.cos(angle) * clamped;
      const ty = this.joystickOrigin.y + Math.sin(angle) * clamped;
      this.joystickThumbGfx.clear();
      this.drawJoystickThumb(tx, ty);
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer !== this.joystickPointer) return;
      this.joystickPointer = null;
      this.joystickActive = false;
      this.joystickVec.x = 0;
      this.joystickVec.y = 0;
      this.joystickBaseGfx.setAlpha(0);
      this.joystickThumbGfx.setAlpha(0);
    });
  }

  private drawJoystickBase(x: number, y: number): void {
    this.joystickBaseGfx.fillStyle(0xFFFFFF, 0.15);
    this.joystickBaseGfx.fillCircle(x, y, this.joystickRadius);
    this.joystickBaseGfx.lineStyle(2, 0xFFFFFF, 0.4);
    this.joystickBaseGfx.strokeCircle(x, y, this.joystickRadius);
  }

  private drawJoystickThumb(x: number, y: number): void {
    this.joystickThumbGfx.fillStyle(0xFFFFFF, 0.6);
    this.joystickThumbGfx.fillCircle(x, y, 22);
    this.joystickThumbGfx.lineStyle(2, 0xFFFFFF, 0.8);
    this.joystickThumbGfx.strokeCircle(x, y, 22);
  }

  // ── Camera ─────────────────────────────────────────────────────────────────

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.0);
  }

  // ── Systems ────────────────────────────────────────────────────────────────

  private createSystems(): void {
    this.waveSystem = new WaveSystem(this, WORLD_WIDTH, WORLD_HEIGHT);
    this.weaponSystem = new WeaponSystem(this, this.player);
    this.hud = new HUD(this, this.player);
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  private setupEvents(): void {
    this.events.on('spawn-enemy', (type: EnemyType, x: number, y: number) => {
      this.spawnEnemy(type, x, y);
    });

    this.events.on('spawn-boss', (type: EnemyType, x: number, y: number) => {
      this.spawnEnemy(type, x, y, true);
    });

    this.events.on('enemy-died', (enemy: Enemy) => {
      this.handleEnemyDeath(enemy);
    });

    this.events.on('wave-started', (wave: number) => {
      this.hud.announce(`Wave ${wave}!`, 2000);
    });

    this.events.on('boss-incoming', () => {
      this.hud.announce('⚠ BOSS INCOMING! ⚠', 2500);
    });

    this.events.on('archer-salvo', (x: number, y: number) => {
      this.weaponSystem.fireSalvo(x, y);
    });

    this.events.on('mage-meteor', (x: number, y: number) => {
      this.weaponSystem.fireMeteor(x, y);
    });

    this.events.on('rogue-smoke', (x: number, y: number) => {
      this.weaponSystem.fireSmokeBomb(x, y);
    });

    this.events.on('goblin-shoot', (fx: number, fy: number, tx: number, ty: number) => {
      this.spawnEnemyProjectile(fx, fy, tx, ty, 'goblin_arrow', 12, 220, 1);
    });

    this.events.on('arclich-cast', (fx: number, fy: number, tx: number, ty: number) => {
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const ex = tx + Math.cos(angle) * 60;
        const ey = ty + Math.sin(angle) * 60;
        this.time.delayedCall(i * 200, () => {
          this.spawnEnemyProjectile(fx, fy, ex, ey, 'necro_spell', 30, 180, 1);
        });
      }
    });

    this.events.on('dragon-breath', (fx: number, fy: number, tx: number, ty: number) => {
      for (let i = 0; i < 3; i++) {
        const spread = (i - 1) * 0.3;
        const angle = Math.atan2(ty - fy, tx - fx) + spread;
        this.time.delayedCall(i * 100, () => {
          const speed = 300;
          const proj = this.physics.add.sprite(fx, fy, 'fireball').setDepth(8).setScale(1.5);
          (proj.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
          (proj.body as Phaser.Physics.Arcade.Body).setVelocity(
            Math.cos(angle) * speed, Math.sin(angle) * speed
          );
          proj.setData('damage', 50);
          proj.setData('isEnemyProj', true);
          this.time.delayedCall(2000, () => { if (proj.active) proj.destroy(); });
          // Check player hit each frame via overlap
          this.physics.add.overlap(this.player.sprite, proj, () => {
            if (!proj.active) return;
            const dead = this.player.takeDamage(50);
            proj.destroy();
            if (dead) this.triggerGameOver();
          });
        });
      }
    });

    this.events.on('necro-resurrect', (x: number, y: number) => {
      // Spawn 2 skeletons near necromancer
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 40;
        this.spawnEnemy(
          Math.random() < 0.5 ? 'skeleton' as EnemyType : 'wolf' as EnemyType,
          x + Math.cos(angle) * dist, y + Math.sin(angle) * dist
        );
      }
      const g = this.add.graphics().setDepth(15);
      g.fillStyle(0x9400D3, 0.5);
      g.fillCircle(x, y, 50);
      this.tweens.add({ targets: g, alpha: 0, duration: 600, onComplete: () => g.destroy() });
    });
  }

  private spawnEnemyProjectile(
    fx: number, fy: number, tx: number, ty: number,
    texture: string, damage: number, speed: number, pierce: number
  ): void {
    const dx = tx - fx, dy = ty - fy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.1) return;
    const proj = this.physics.add.sprite(fx, fy, texture).setDepth(8);
    (proj.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (proj.body as Phaser.Physics.Arcade.Body).setVelocity((dx / dist) * speed, (dy / dist) * speed);
    proj.setRotation(Math.atan2(dy, dx));
    this.time.delayedCall(2500, () => { if (proj.active) proj.destroy(); });
    this.physics.add.overlap(this.player.sprite, proj, () => {
      if (!proj.active) return;
      const dead = this.player.takeDamage(damage);
      proj.destroy();
      if (dead) this.triggerGameOver();
    });
  }

  // ── Enemy Spawning ──────────────────────────────────────────────────────────

  private spawnEnemy(type: EnemyType, x: number, y: number, _isBoss: boolean = false): void {
    const enemy = new Enemy(this, x, y, type);
    const id = this.enemies.length + Math.floor(Math.random() * 100000);
    enemy.sprite.setData('id', id);
    this.enemies.push(enemy);
    this.weaponSystem.enemies = this.enemies;

    // Setup player contact damage
    this.physics.add.overlap(this.player.sprite, enemy.sprite, () => {
      if (!enemy.sprite.active || !this.player.sprite.active) return;
      const dead = this.player.takeDamage(enemy.damage);
      if (dead) this.triggerGameOver();
    });

    if (enemy.isBoss) this.bossEnemy = enemy;
  }

  // ── Update ─────────────────────────────────────────────────────────────────

  private movePlayer(_dt: number): void {
    if (!this.player.sprite.active) return;
    const speed = this.player.speed;
    if (this.joystickActive) {
      this.player.sprite.setVelocity(
        this.joystickVec.x * speed,
        this.joystickVec.y * speed,
      );
    } else {
      this.player.sprite.setVelocity(0, 0);
    }
  }

  private updateEnemies(dt: number): void {
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      enemy.update(dt, px, py);
    }
  }

  private updatePickupMagnetism(): void {
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const range = this.player.stats.pickupRange;

    this.xpOrbs.getChildren().forEach((obj) => {
      const sprite = obj as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active) return;
      const dx = px - sprite.x;
      const dy = py - sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < range) {
        const speed = Math.max(100, (range - dist) / range * 300);
        (sprite.body as Phaser.Physics.Arcade.Body).setVelocity(
          (dx / dist) * speed, (dy / dist) * speed
        );
      }
    });

    this.goldCoins.getChildren().forEach((obj) => {
      const sprite = obj as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active) return;
      const dx = px - sprite.x;
      const dy = py - sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < range * 0.7) {
        const speed = Math.max(80, (range - dist) / range * 250);
        (sprite.body as Phaser.Physics.Arcade.Body).setVelocity(
          (dx / dist) * speed, (dy / dist) * speed
        );
      }
    });
  }

  private updatePickupOverlaps(): void {
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const pickupRadius = 16;

    this.xpOrbs.getChildren().forEach((obj) => {
      const sprite = obj as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active) return;
      const dist = Phaser.Math.Distance.Between(px, py, sprite.x, sprite.y);
      if (dist < pickupRadius) {
        const val = sprite.getData('value') || 1;
        this.player.addXp(val);
        sprite.destroy();
        this.checkLevelUp();
      }
    });

    this.goldCoins.getChildren().forEach((obj) => {
      const sprite = obj as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active) return;
      const dist = Phaser.Math.Distance.Between(px, py, sprite.x, sprite.y);
      if (dist < pickupRadius) {
        const val = sprite.getData('value') || 1;
        this.player.addGold(val);
        sprite.destroy();
      }
    });
  }

  private updateHUD(): void {
    // Check if boss is still alive
    if (this.bossEnemy && (!this.bossEnemy.sprite.active || this.bossEnemy.hp <= 0)) {
      this.bossEnemy = null;
    }

    const bossData = this.bossEnemy ? {
      hp: this.bossEnemy.hp,
      maxHp: this.bossEnemy.maxHp,
      name: this.bossEnemy.type,
    } : null;

    this.hud.update(this.waveSystem.currentWave, this.waveSystem.getWaveTimeLeft(), bossData);

    // Check wave timer → start next wave
    if (this.waveSystem.isActive && this.waveSystem.getWaveTimeLeft() <= 0) {
      this.waveSystem.isActive = false;
      this.time.delayedCall(2000, () => {
        this.waveSystem.startNextWave();
      });
    }
  }

  // ── Level Up ───────────────────────────────────────────────────────────────

  private checkLevelUp(): void {
    const nextXp = XP_PER_LEVEL[Math.min(this.player.level, XP_PER_LEVEL.length - 1)];
    if (this.player.xp >= nextXp) {
      this.player.level++;
      this.player.xp -= nextXp;
      this.triggerLevelUp();
    }
  }

  private triggerLevelUp(): void {
    this.isPaused = true;
    const options = this.buildUpgradeOptions();
    this.scene.launch(SCENE_KEYS.LEVEL_UP, {
      options,
      onChoose: (option: UpgradeOption) => {
        this.applyUpgrade(option);
        this.isPaused = false;
        this.hud.announce(`${option.name} acquired!`, 1500);
      },
    });
  }

  private buildUpgradeOptions(): UpgradeOption[] {
    const available = UPGRADE_POOL.filter(opt => {
      if (opt.type === 'weapon') {
        // Only show weapons not already owned, or if at max weapons, show only stat upgrades
        if (this.player.weapons.length >= MAX_WEAPONS) return false;
        return !this.player.weapons.includes(opt.weaponType!);
      }
      return true;
    });

    // Shuffle and pick 3
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  private applyUpgrade(option: UpgradeOption): void {
    if (option.type === 'weapon' && option.weaponType) {
      this.player.addWeapon(option.weaponType);
      this.weaponSystem.syncWeapons();
    } else if (option.type === 'stat' && option.statKey) {
      this.player.upgradeStat(option.statKey, option.statValue!);
    }
  }

  // ── Enemy Death ─────────────────────────────────────────────────────────────

  private handleEnemyDeath(enemy: Enemy): void {
    if (!enemy.sprite.active) return;
    this.enemiesKilled++;

    // Drop XP and gold
    this.spawnXpOrb(enemy.sprite.x, enemy.sprite.y, enemy.xpDrop);
    if (enemy.goldDrop > 0) this.spawnGoldCoin(enemy.sprite.x, enemy.sprite.y, enemy.goldDrop);

    // Death particles
    this.add.particles(enemy.sprite.x, enemy.sprite.y, 'particle', {
      speed: { min: 40, max: 120 },
      scale: { start: 0.8, end: 0 },
      tint: [0xFF4444, 0xFF8844, 0xFFAA44],
      quantity: 8,
      lifespan: 500,
    }).explode(8);

    if (enemy.isBoss) {
      this.hud.announce('🏆 BOSS DEFEATED!', 3000);
      this.bossEnemy = null;
    }

    enemy.destroy();
  }

  // ── Game Over ───────────────────────────────────────────────────────────────

  private triggerGameOver(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.sprite.setActive(false).setVisible(false);

    // Death effect
    this.add.particles(this.player.sprite.x, this.player.sprite.y, 'particle', {
      speed: { min: 60, max: 200 },
      scale: { start: 1.2, end: 0 },
      tint: [0xFF2222, 0xFF8844],
      quantity: 16,
      lifespan: 800,
    }).explode(16);

    this.time.delayedCall(1500, () => {
      this.weaponSystem.destroy();
      this.hud.destroy();
      this.scene.start(SCENE_KEYS.GAME_OVER, {
        victory: false,
        wave: this.waveSystem.currentWave,
        enemiesKilled: this.enemiesKilled,
        gold: this.player.gold,
        level: this.player.level,
        survivalTime: this.time.now - this.startTime,
      });
    });
  }
}
