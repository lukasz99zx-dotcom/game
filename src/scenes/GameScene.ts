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
import { showDamageNumber } from '../utils/damage';

const UPGRADE_POOL: UpgradeOption[] = [
  { id: 'w_sword',      name: 'Lightning Sword',    description: 'Circular sword attack. Hits all nearby enemies.',  type: 'weapon', weaponType: WEAPON_TYPES.LIGHTNING_SWORD },
  { id: 'w_bow',        name: 'Enchanted Crossbow',  description: 'Piercing arrow. Hits up to 3 enemies in a line.', type: 'weapon', weaponType: WEAPON_TYPES.ENCHANTED_CROSSBOW },
  { id: 'w_fire',       name: 'Fireball',            description: 'AOE explosion on impact.',                        type: 'weapon', weaponType: WEAPON_TYPES.FIREBALL },
  { id: 'w_cross',      name: 'Holy Cross',          description: 'Orbiting cross hits nearby enemies.',             type: 'weapon', weaponType: WEAPON_TYPES.HOLY_CROSS },
  { id: 'w_frost',      name: 'Frost Aura',          description: 'Slows all enemies in range by 50%.',              type: 'weapon', weaponType: WEAPON_TYPES.FROST_AURA },
  { id: 'w_chain',      name: 'Chain Lightning',     description: 'Jumps between 4 enemies.',                       type: 'weapon', weaponType: WEAPON_TYPES.CHAIN_LIGHTNING },
  { id: 's_hp',         name: '+40 Max HP',          description: 'Increases maximum health by 40.',                 type: 'stat', statKey: 'maxHp', statValue: 40 },
  { id: 's_heal',       name: 'Healing Potion',      description: 'Restore 30 HP immediately.',                     type: 'stat', statKey: 'healHp', statValue: 30 },
  { id: 's_speed',      name: 'Swift Boots',         description: 'Increase movement speed by 20.',                  type: 'stat', statKey: 'speed', statValue: 20 },
  { id: 's_dmg',        name: 'Sharp Blade',         description: 'Increase all damage by 15%.',                    type: 'stat', statKey: 'damage', statValue: 0.15 },
  { id: 's_atkspd',     name: 'Combat Training',     description: 'Increase attack speed by 20%.',                  type: 'stat', statKey: 'attackSpeed', statValue: 0.20 },
  { id: 's_magnet',     name: 'Gold Magnet',         description: 'Increase pickup range by 30.',                   type: 'stat', statKey: 'pickupRange', statValue: 30 },
  { id: 's_armor',      name: 'Iron Skin',           description: 'Reduce incoming damage by 10%.',                 type: 'stat', statKey: 'damageReduction', statValue: 0.10 },
  { id: 's_regen',      name: 'Regeneration',        description: 'Regenerate 1 HP per second.',                    type: 'stat', statKey: 'hpRegen', statValue: 1 },
  { id: 's_regen2',     name: 'Vitality',            description: 'Regenerate 2 HP per second.',                    type: 'stat', statKey: 'hpRegen', statValue: 2 },
  { id: 's_lifesteal',  name: 'Vampiric Touch',      description: 'Steal 4% of damage dealt as HP.',                type: 'stat', statKey: 'lifesteal', statValue: 0.04 },
  { id: 's_lifesteal2', name: 'Blood Pact',          description: 'Steal 7% of damage dealt as HP.',                type: 'stat', statKey: 'lifesteal', statValue: 0.07 },
  { id: 's_fullheal',   name: 'Divine Potion',       description: 'Restore 60 HP immediately.',                     type: 'stat', statKey: 'healHp', statValue: 60 },

  // === 10 NEW SKILLS ===

  // OFFENSIVE WEAPONS
  { id: 'w_whirlwind',   name: 'Whirlwind Blade',   description: 'Massive spinning slash hitting all enemies nearby.', type: 'weapon', weaponType: WEAPON_TYPES.WHIRLWIND },
  { id: 'w_deathray',    name: 'Death Ray',          description: 'Piercing laser beam through all enemies in line.',   type: 'weapon', weaponType: WEAPON_TYPES.DEATH_RAY },
  { id: 'w_explosive',   name: 'Explosive Bolts',    description: 'Crossbow bolts explode on impact (AOE r=55).',       type: 'weapon', weaponType: WEAPON_TYPES.EXPLOSIVE_BOLTS },
  { id: 'w_shockwave',   name: 'Shockwave',          description: 'Ground shockwave erupts, knocking back all nearby enemies.', type: 'weapon', weaponType: WEAPON_TYPES.SHOCKWAVE },

  // OFFENSIVE PASSIVES
  { id: 's_crit',        name: 'Eagle Eye',          description: '20% critical strike chance — deals 3× damage.',      type: 'stat', statKey: 'critChance', statValue: 0.20 },
  { id: 's_overkill',    name: 'Overkill',           description: 'Enemies killed explode dealing 40 dmg in radius 80.', type: 'stat', statKey: 'overkill', statValue: 1 },
  { id: 's_execute',     name: 'Execute',            description: 'Instantly kill enemies below 10% HP.',               type: 'stat', statKey: 'execute', statValue: 0.10 },

  // DEFENSIVE PASSIVES
  { id: 's_thorns',      name: 'Thorns',             description: 'Return 25% of damage taken back to attackers.',      type: 'stat', statKey: 'thorns', statValue: 0.25 },
  { id: 's_secondwind',  name: 'Second Wind',        description: 'When HP drops below 20%, auto-heal 35% of max HP.', type: 'stat', statKey: 'secondWind', statValue: 0.35 },
  { id: 's_xpsurge',     name: 'Scholar\'s Tome',    description: '+60% XP gain from all sources.',                    type: 'stat', statKey: 'xpBonus', statValue: 0.60 },
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

  // Death processing guard — prevents recursive overkill chain crashes
  private _dyingEnemies = new Set<Enemy>();

  // State
  private isGameOver: boolean = false;
  private heroClass: HeroClass = HERO_CLASSES.KNIGHT;
  private startTime: number = 0;
  private enemiesKilled: number = 0;
  private bossEnemy: Enemy | null = null;

  // XP orbs and gold coins as simple physics sprites
  private xpOrbs!: Phaser.Physics.Arcade.Group;
  private goldCoins!: Phaser.Physics.Arcade.Group;

  // Loot magnet pickups
  private lootMagnets!: Phaser.Physics.Arcade.Group;
  private lootMagnetTimer: number = 0;
  private lootMagnetCount: number = 0;
  private MAX_MAGNETS: number = 2;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  init(data: { heroClass?: HeroClass }): void {
    this.heroClass = data?.heroClass ?? HERO_CLASSES.KNIGHT;
    this.enemies = [];
    this.bossEnemy = null;
    this.isGameOver = false;
    this.enemiesKilled = 0;
  }

  create(): void {
    this.startTime = this.time.now;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.createWorld();
    this.createPlayer();
    this.createPickupGroups();
    this.createLootMagnetGroup();
    this.createJoystick();
    this.setupCamera();
    this.createSystems();
    this.setupEvents();
    this.createPauseButton();

    // Start first wave after a short delay
    this.time.delayedCall(1500, () => {
      this.waveSystem.startNextWave();
    });
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    this.player.update(delta);
    this.movePlayer(delta);
    this.updateEnemies(delta);
    this.weaponSystem.update(delta);
    this.weaponSystem.checkProjectileHits();
    this.waveSystem.update(delta);
    this.updatePickupMagnetism();
    this.updatePickupOverlaps();
    this.trySpawnLootMagnet(delta);
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

  private createLootMagnetGroup(): void {
    this.lootMagnets = this.physics.add.group();
  }

  private trySpawnLootMagnet(delta: number): void {
    this.lootMagnetTimer += delta;
    if (this.lootMagnetTimer >= 25000 && this.lootMagnetCount < this.MAX_MAGNETS) {
      this.lootMagnetTimer = 0;
      // Spawn at random position near center of world (not edge)
      const x = 200 + Math.random() * (WORLD_WIDTH - 400);
      const y = 200 + Math.random() * (WORLD_HEIGHT - 400);
      const mag = this.physics.add.sprite(x, y, 'loot_magnet', 0).setDepth(4);
      if (this.anims.exists('loot_magnet_pulse')) mag.play('loot_magnet_pulse');
      (mag.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      this.lootMagnets.add(mag);
      this.lootMagnetCount++;

      // Pulsing glow effect
      this.tweens.add({ targets: mag, scaleX: 1.2, scaleY: 1.2, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  private spawnXpOrb(x: number, y: number, amount: number): void {
    if (this.xpOrbs.getLength() >= 300) {
      // Auto-collect oldest orb to keep pool size bounded
      const oldest = this.xpOrbs.getChildren()[0] as Phaser.Physics.Arcade.Sprite;
      if (oldest?.active) {
        this.player.addXp(oldest.getData('value') || 1);
        oldest.destroy();
      }
    }
    const orb = this.physics.add.sprite(x, y, 'xp_crystal').setDepth(3);
    orb.setData('value', amount);
    (orb.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (orb.body as Phaser.Physics.Arcade.Body).setVelocity(
      (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80
    );
    this.time.delayedCall(300, () => {
      if (orb.active) (orb.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    });
    this.xpOrbs.add(orb);
  }

  private spawnGoldCoin(x: number, y: number, amount: number): void {
    if (this.goldCoins.getLength() >= 200) {
      const oldest = this.goldCoins.getChildren()[0] as Phaser.Physics.Arcade.Sprite;
      if (oldest?.active) {
        this.player.addGold(oldest.getData('value') || 1);
        oldest.destroy();
      }
    }
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
      // Right side: check special button hit directly (works even during joystick use)
      if (pointer.x > GAME_WIDTH * 0.55) {
        const sbx = GAME_WIDTH - 60, sby = GAME_HEIGHT - 60;
        if (Math.hypot(pointer.x - sbx, pointer.y - sby) < 48) {
          this.player.useSpecial();
        }
        return;
      }
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

  // ── Pause Button ───────────────────────────────────────────────────────────

  private createPauseButton(): void {
    const x = GAME_WIDTH - 26, y = 68 + 18; // below the XP bar
    const btn = this.add.graphics().setScrollFactor(0).setDepth(200);

    const draw = (hover: boolean) => {
      btn.clear();
      btn.fillStyle(hover ? 0x443300 : 0x000000, 0.8);
      btn.fillRoundedRect(x - 20, y - 14, 40, 28, 4);
      btn.lineStyle(2, 0xB8860B);
      btn.strokeRoundedRect(x - 20, y - 14, 40, 28, 4);
      btn.fillStyle(0xFFD700);
      btn.fillRect(x - 8, y - 8, 5, 16);
      btn.fillRect(x + 3, y - 8, 5, 16);
    };
    draw(false);

    const zone = this.add.zone(x, y, 40, 28).setScrollFactor(0).setDepth(201).setInteractive();
    zone.on('pointerover', () => draw(true));
    zone.on('pointerout', () => draw(false));
    zone.on('pointerdown', () => this.openPauseMenu());
  }

  private openPauseMenu(): void {
    this.scene.pause();
    this.scene.launch(SCENE_KEYS.PAUSE);
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  private readonly MAX_ENEMIES = 160;

  private setupEvents(): void {
    this.events.on('spawn-enemy', (type: EnemyType, x: number, y: number) => {
      if (this.enemies.length >= this.MAX_ENEMIES) return;
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
      this.hud.announce('BOSS INCOMING!', 2500);
    });

    // Legacy events (kept for compatibility)
    this.events.on('archer-salvo', (x: number, y: number) => {
      this.weaponSystem.fireSalvo(x, y);
    });

    this.events.on('mage-meteor', (x: number, y: number) => {
      this.weaponSystem.fireMeteor(x, y);
    });

    this.events.on('rogue-smoke', (x: number, y: number) => {
      this.weaponSystem.fireSmokeBomb(x, y);
    });

    // New class specials
    this.events.on('knight-warcry', (x: number, y: number) => {
      // Stun all enemies within 180px for 3s
      const stunRadius = 180;
      this.enemies.forEach(e => {
        if (!e.sprite.active) return;
        const dist = Phaser.Math.Distance.Between(x, y, e.sprite.x, e.sprite.y);
        if (dist <= stunRadius) e.stun(3000);
      });
      // Visual: golden shockwave
      this.createShockwave(x, y, stunRadius, COLORS.GOLD);
    });

    this.events.on('archer-rain', (x: number, y: number) => {
      // 12 arrows in circle
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const tx = x + Math.cos(angle) * 400;
        const ty = y + Math.sin(angle) * 400;
        this.weaponSystem.fireArrow(x, y, tx, ty, true);
      }
    });

    this.events.on('mage-timefreeze', () => {
      // Slow ALL enemies 90% for 5s
      this.enemies.forEach(e => {
        if (e.sprite.active) e.freeze(0.9, 5000);
      });
      // Visual: screen flash blue
      const flash = this.add.graphics().setScrollFactor(0).setDepth(300);
      flash.fillStyle(0x0044FF, 0.3);
      flash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      this.tweens.add({ targets: flash, alpha: 0, duration: 600, onComplete: () => flash.destroy() });
    });

    this.events.on('rogue-shadowstep', (px: number, py: number) => {
      // Find nearest enemy within 400px
      let nearest: Enemy | null = null;
      let minDist = 400;
      for (const e of this.enemies) {
        if (!e.sprite.active) continue;
        const d = Phaser.Math.Distance.Between(px, py, e.sprite.x, e.sprite.y);
        if (d < minDist) { minDist = d; nearest = e; }
      }
      if (!nearest) return;

      // Leave shadow at origin
      const shadow = this.add.sprite(px, py, this.player.heroClass + '_0')
        .setAlpha(0.4).setTint(0x000000).setDepth(10);
      this.tweens.add({ targets: shadow, alpha: 0, duration: 500, onComplete: () => shadow.destroy() });

      // Teleport player behind enemy
      const ex = nearest.sprite.x, ey = nearest.sprite.y;
      const angle = Math.atan2(ey - py, ex - px);
      this.player.sprite.setPosition(
        ex - Math.cos(angle) * 30,
        ey - Math.sin(angle) * 30
      );

      // 5x damage backstab
      const backstabDamage = Math.floor(this.player.stats.damage * 80 * 5);
      const dead = nearest.takeDamage(backstabDamage);
      showDamageNumber(this, nearest.sprite.x, nearest.sprite.y, backstabDamage, true);
      nearest.stun(2000);
      if (dead) this.events.emit('enemy-died', nearest);
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

    // Thorns reflect
    this.events.on('thorns-reflect', (x: number, y: number, dmg: number) => {
      const radius = 80;
      this.enemies.forEach(e => {
        if (!e.sprite.active) return;
        const d = Phaser.Math.Distance.Between(x, y, e.sprite.x, e.sprite.y);
        if (d <= radius) {
          const dead = e.takeDamage(dmg);
          showDamageNumber(this, e.sprite.x, e.sprite.y, dmg, false);
          if (dead) this.handleEnemyDeath(e);
        }
      });
      const g = this.add.graphics().setDepth(20);
      g.lineStyle(3, 0xFF4444, 0.8);
      g.strokeCircle(x, y, radius);
      this.tweens.add({ targets: g, alpha: 0, duration: 300, onComplete: () => g.destroy() });
    });

    // Second wind visual
    this.events.on('second-wind-triggered', () => {
      this.hud.announce('SECOND WIND!', 1500);
      const flash = this.add.graphics().setScrollFactor(0).setDepth(300);
      flash.fillStyle(0x00FF88, 0.3);
      flash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      this.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() });
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

  // ── Shockwave Visual ───────────────────────────────────────────────────────

  private createShockwave(x: number, y: number, maxRadius: number, color: number): void {
    const g = this.add.graphics().setDepth(50);
    let radius = 10;
    const timer = this.time.addEvent({
      delay: 16,
      repeat: Math.floor(maxRadius / 8),
      callback: () => {
        g.clear();
        g.lineStyle(3, color, 1 - radius / maxRadius);
        g.strokeCircle(x, y, radius);
        radius += 8;
      },
      callbackScope: this,
    });
    this.time.delayedCall(maxRadius / 8 * 16 + 100, () => { timer.remove(); g.destroy(); });
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
      this.player.setMoving(true);
    } else {
      this.player.sprite.setVelocity(0, 0);
      this.player.setMoving(false);
    }
  }

  private updateEnemies(dt: number): void {
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const toExecute: Enemy[] = [];
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      enemy.update(dt, px, py);
      // Collect execute candidates — process AFTER loop to avoid array mutation
      if (this.player.stats.execute > 0 && enemy.hp > 0 &&
          enemy.hp < enemy.maxHp * this.player.stats.execute) {
        toExecute.push(enemy);
      }
    }
    for (const enemy of toExecute) {
      if (!enemy.sprite.active) continue;
      showDamageNumber(this, enemy.sprite.x, enemy.sprite.y, enemy.hp, true);
      enemy.takeDamage(enemy.hp);
      this.handleEnemyDeath(enemy);
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

    this.lootMagnets.getChildren().forEach((obj) => {
      const sprite = obj as Phaser.Physics.Arcade.Sprite;
      if (!sprite.active) return;
      const dist = Phaser.Math.Distance.Between(px, py, sprite.x, sprite.y);
      if (dist < 24) {
        // Collect ALL xp orbs and gold on screen
        this.xpOrbs.getChildren().forEach((o) => {
          const os = o as Phaser.Physics.Arcade.Sprite;
          if (!os.active) return;
          const val = os.getData('value') || 1;
          this.player.addXp(val);
          os.destroy();
        });
        this.goldCoins.getChildren().forEach((o) => {
          const os = o as Phaser.Physics.Arcade.Sprite;
          if (!os.active) return;
          const val = os.getData('value') || 1;
          this.player.addGold(val);
          os.destroy();
        });
        this.lootMagnetCount--;
        sprite.destroy();
        this.hud.announce('LOOT MAGNET', 1800);
        this.checkLevelUp();
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
    // Pause the game scene physics/updates
    this.scene.pause();
    const options = this.buildUpgradeOptions();
    this.scene.launch(SCENE_KEYS.LEVEL_UP, {
      options,
      onChoose: (option: UpgradeOption) => {
        this.applyUpgrade(option);
        this.hud.announce(`${option.name} acquired!`, 1500);
      },
    });
  }

  private buildUpgradeOptions(): UpgradeOption[] {
    const available = UPGRADE_POOL.filter(opt => {
      if (opt.type === 'weapon') {
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
    // Guard against recursive overkill chains
    if (this._dyingEnemies.has(enemy)) return;
    this._dyingEnemies.add(enemy);

    this.enemiesKilled++;

    const ex = enemy.sprite.x, ey = enemy.sprite.y;

    // Drop XP and gold
    this.spawnXpOrb(ex, ey, enemy.xpDrop);
    if (enemy.goldDrop > 0) this.spawnGoldCoin(ex, ey, enemy.goldDrop);

    // Death particles (capped at 6 to avoid GC spikes)
    this.add.particles(ex, ey, 'particle', {
      speed: { min: 40, max: 100 },
      scale: { start: 0.7, end: 0 },
      tint: [0xFF4444, 0xFF8844],
      quantity: 6,
      lifespan: 450,
    }).explode(6);

    if (enemy.isBoss) {
      this.hud.announce('BOSS DEFEATED!', 3000);
      this.bossEnemy = null;
    }

    // Overkill: non-recursive — collect victims first, apply after
    if (this.player.stats.overkill > 0) {
      const victims: Enemy[] = [];
      for (const e of this.enemies) {
        if (!e.sprite.active || e === enemy || this._dyingEnemies.has(e)) continue;
        if (Phaser.Math.Distance.Between(ex, ey, e.sprite.x, e.sprite.y) <= 80) {
          victims.push(e);
        }
      }
      for (const v of victims) {
        showDamageNumber(this, v.sprite.x, v.sprite.y, 40);
        v.takeDamage(40);
        this.handleEnemyDeath(v);
      }
    }

    enemy.destroy();
    this._dyingEnemies.delete(enemy);
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
