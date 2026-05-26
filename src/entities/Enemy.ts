import Phaser from 'phaser';
import { EnemyType, ENEMY_TYPES, COLORS } from '../constants';
import { EnemyStats } from '../types';

export const ENEMY_DATA: Record<EnemyType, EnemyStats> = {
  [ENEMY_TYPES.WOLF]:        { id: ENEMY_TYPES.WOLF,        name: 'Wolf',         hp: 135,  speed: 110, damage: 10, xpDrop: 3,  goldDrop: 1,  color: 0x8B7355, size: 24, isBoss: false },
  [ENEMY_TYPES.SKELETON]:    { id: ENEMY_TYPES.SKELETON,    name: 'Skeleton',     hp: 105,  speed: 80,  damage: 8,  xpDrop: 2,  goldDrop: 1,  color: 0xF5F5DC, size: 24, isBoss: false },
  [ENEMY_TYPES.ZOMBIE]:      { id: ENEMY_TYPES.ZOMBIE,      name: 'Zombie',       hp: 270,  speed: 55,  damage: 15, xpDrop: 5,  goldDrop: 2,  color: 0x5A8A5A, size: 28, isBoss: false },
  [ENEMY_TYPES.GOBLIN]:      { id: ENEMY_TYPES.GOBLIN,      name: 'Goblin',       hp: 150,  speed: 100, damage: 12, xpDrop: 4,  goldDrop: 3,  color: 0x3CB371, size: 22, isBoss: false },
  [ENEMY_TYPES.NECROMANCER]: { id: ENEMY_TYPES.NECROMANCER, name: 'Necromancer',  hp: 330,  speed: 65,  damage: 0,  xpDrop: 10, goldDrop: 5,  color: 0x4B0082, size: 28, isBoss: false },
  [ENEMY_TYPES.DEMON]:       { id: ENEMY_TYPES.DEMON,       name: 'Demon',        hp: 480,  speed: 120, damage: 25, xpDrop: 12, goldDrop: 6,  color: 0xCC2200, size: 30, isBoss: false },
  [ENEMY_TYPES.VAMPIRE]:     { id: ENEMY_TYPES.VAMPIRE,     name: 'Vampire',      hp: 390,  speed: 140, damage: 20, xpDrop: 12, goldDrop: 6,  color: 0x2A0A2A, size: 28, isBoss: false },
  [ENEMY_TYPES.OGRE_WARLORD]:{ id: ENEMY_TYPES.OGRE_WARLORD,name: 'Ogre Warlord',hp: 1600, speed: 50,  damage: 40, xpDrop: 80, goldDrop: 40, color: 0x8B6914, size: 64, isBoss: true  },
  [ENEMY_TYPES.BLACK_KNIGHT]:{ id: ENEMY_TYPES.BLACK_KNIGHT, name: 'Black Knight',hp: 2400, speed: 110, damage: 35, xpDrop: 120,goldDrop: 60, color: 0x111111, size: 64, isBoss: true  },
  [ENEMY_TYPES.ARCLICH]:     { id: ENEMY_TYPES.ARCLICH,     name: 'Arclich',      hp: 1200, speed: 55,  damage: 0,  xpDrop: 150,goldDrop: 75, color: 0x4B0082, size: 64, isBoss: true  },
  [ENEMY_TYPES.CHAOS_DRAGON]:{ id: ENEMY_TYPES.CHAOS_DRAGON,name: 'Chaos Dragon', hp: 4000, speed: 70,  damage: 50, xpDrop: 200,goldDrop: 100,color: 0x8B0000, size: 64, isBoss: true  },
};

export class Enemy {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpDrop: number;
  goldDrop: number;
  isBoss: boolean;
  isSlowed: boolean = false;
  slowTimer: number = 0;
  isStunned: boolean = false;
  stunTimer: number = 0;
  isFrozen: boolean = false;
  frozenTimer: number = 0;
  frozenSlowFactor: number = 0.9;
  isBlocking: boolean = false;

  private specialTimer: number = 0;
  private specialCooldown: number = 3000;
  private hpBar!: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType) {
    this.scene = scene;
    this.type = type;
    const data = ENEMY_DATA[type];
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.speed = data.speed;
    this.damage = data.damage;
    this.xpDrop = data.xpDrop;
    this.goldDrop = data.goldDrop;
    this.isBoss = data.isBoss;

    const textureKey = this.getTextureKey();
    this.sprite = scene.physics.add.sprite(x, y, textureKey) as Phaser.Physics.Arcade.Sprite;
    this.sprite.setDepth(5);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setSize(Math.min(data.size, 48), Math.min(data.size, 48));

    if (data.isBoss) {
      this.sprite.setScale(1.0);
    }

    // Play walk animation if it exists
    const walkKey = type + '_walk';
    if (scene.anims.exists(walkKey)) {
      this.sprite.play(walkKey);
    }

    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(6);

    if (data.isBoss) {
      this.nameText = scene.add.text(x, y - data.size * 0.6 - 14, data.name.toUpperCase(), {
        fontSize: '11px', fontFamily: 'Georgia, serif', color: '#FFD700',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(7);
    }

    // Randomize special cooldowns
    this.specialTimer = Math.random() * this.specialCooldown;
  }

  private getTextureKey(): string {
    switch (this.type) {
      case ENEMY_TYPES.OGRE_WARLORD: return 'ogre_warlord';
      case ENEMY_TYPES.BLACK_KNIGHT: return 'black_knight';
      case ENEMY_TYPES.ARCLICH: return 'arclich';
      case ENEMY_TYPES.CHAOS_DRAGON: return 'chaos_dragon';
      default: return this.type;
    }
  }

  update(dt: number, playerX: number, playerY: number): void {
    const now = this.scene.time.now;

    // Handle stun
    if (this.isStunned) {
      this.stunTimer -= dt;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
        this.sprite.clearTint();
      } else {
        this.sprite.setTint(0xFFFF00);
        this.sprite.setVelocity(0, 0);
        this.updateHpBar();
        if (this.nameText) {
          this.nameText.setPosition(this.sprite.x, this.sprite.y - ENEMY_DATA[this.type].size * 0.5 - 14);
        }
        return;
      }
    }

    // Handle freeze
    if (this.isFrozen) {
      this.frozenTimer -= dt;
      if (this.frozenTimer <= 0) {
        this.isFrozen = false;
        this.sprite.clearTint();
      } else {
        this.sprite.setTint(0x8888FF);
      }
    }

    if (this.isSlowed) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.isSlowed = false;
    }

    let effectiveSpeed = this.speed;
    if (this.isFrozen) {
      effectiveSpeed = this.speed * (1 - this.frozenSlowFactor);
    } else if (this.isSlowed) {
      effectiveSpeed = this.speed * 0.5;
    }

    this.specialTimer -= dt;

    const dx = playerX - this.sprite.x;
    const dy = playerY - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.performAI(dt, playerX, playerY, dx, dy, dist, effectiveSpeed);
    this.updateHpBar();

    if (this.nameText) {
      this.nameText.setPosition(this.sprite.x, this.sprite.y - ENEMY_DATA[this.type].size * 0.5 - 14);
    }

    // Flip sprite toward player
    if (dx < 0) this.sprite.setFlipX(true);
    else this.sprite.setFlipX(false);
  }

  private performAI(dt: number, playerX: number, playerY: number, dx: number, dy: number, dist: number, speed: number): void {
    switch (this.type) {
      case ENEMY_TYPES.GOBLIN: {
        if (dist > 180) {
          this.moveToward(dx, dy, dist, speed);
        } else {
          this.sprite.setVelocity(0, 0);
          if (this.specialTimer <= 0) {
            this.specialTimer = 2000 + Math.random() * 1000;
            this.scene.events.emit('goblin-shoot', this.sprite.x, this.sprite.y, playerX, playerY);
          }
        }
        break;
      }
      case ENEMY_TYPES.NECROMANCER: {
        if (dist > 220) {
          this.moveToward(dx, dy, dist, speed);
        } else {
          this.sprite.setVelocity(0, 0);
          if (this.specialTimer <= 0) {
            this.specialTimer = 6000 + Math.random() * 2000;
            this.scene.events.emit('necro-resurrect', this.sprite.x, this.sprite.y);
          }
        }
        break;
      }
      case ENEMY_TYPES.DEMON: {
        this.moveToward(dx, dy, dist, speed);
        if (this.specialTimer <= 0) {
          this.specialTimer = 3000 + Math.random() * 1000;
          const angle = Math.random() * Math.PI * 2;
          const tpDist = 80 + Math.random() * 60;
          this.sprite.setPosition(
            this.sprite.x + Math.cos(angle) * tpDist,
            this.sprite.y + Math.sin(angle) * tpDist,
          );
          this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
            speed: 60, scale: { start: 0.5, end: 0 }, tint: 0xFF4400,
            quantity: 6, lifespan: 300,
          }).explode(6);
        }
        break;
      }
      case ENEMY_TYPES.VAMPIRE: {
        if (dist < 80) {
          // Dodge away
          const angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5);
          this.sprite.setVelocity(Math.cos(angle) * speed * 1.5, Math.sin(angle) * speed * 1.5);
        } else {
          this.moveToward(dx, dy, dist, speed);
        }
        break;
      }
      case ENEMY_TYPES.BLACK_KNIGHT: {
        this.moveToward(dx, dy, dist, speed);
        if (this.specialTimer <= 0) {
          this.specialTimer = 4000;
          this.isBlocking = true;
          this.scene.time.delayedCall(1500, () => { this.isBlocking = false; });
        }
        break;
      }
      case ENEMY_TYPES.ARCLICH: {
        if (dist > 200) {
          this.moveToward(dx, dy, dist, speed);
        } else {
          this.sprite.setVelocity(0, 0);
          if (this.specialTimer <= 0) {
            this.specialTimer = 5000;
            this.scene.events.emit('arclich-cast', this.sprite.x, this.sprite.y, playerX, playerY);
          }
        }
        break;
      }
      case ENEMY_TYPES.CHAOS_DRAGON: {
        this.moveToward(dx, dy, dist, speed);
        if (this.specialTimer <= 0) {
          this.specialTimer = 3000;
          this.scene.events.emit('dragon-breath', this.sprite.x, this.sprite.y, playerX, playerY);
        }
        break;
      }
      default:
        this.moveToward(dx, dy, dist, speed);
        break;
    }
  }

  private moveToward(dx: number, dy: number, dist: number, speed: number): void {
    if (dist < 2) { this.sprite.setVelocity(0, 0); return; }
    this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
  }

  takeDamage(amount: number): boolean {
    if (this.isBlocking && Math.random() < 0.5) {
      this.scene.events.emit('blocked', this.sprite.x, this.sprite.y);
      return false;
    }
    this.hp -= amount;
    // Flash red (only if not stunned/frozen - those have their own tint)
    if (!this.isStunned && !this.isFrozen) {
      this.sprite.setTint(0xFF4444);
      this.scene.time.delayedCall(80, () => {
        if (this.sprite && this.sprite.active) this.sprite.clearTint();
      });
    }
    return this.hp <= 0;
  }

  slow(duration: number): void {
    this.isSlowed = true;
    this.slowTimer = duration;
  }

  stun(durationMs: number): void {
    this.isStunned = true;
    this.stunTimer = durationMs;
    this.sprite.setVelocity(0, 0);
  }

  freeze(slowFactor: number, durationMs: number): void {
    this.isFrozen = true;
    this.frozenSlowFactor = slowFactor;
    this.frozenTimer = durationMs;
  }

  private updateHpBar(): void {
    this.hpBar.clear();
    if (this.hp >= this.maxHp) return;
    const data = ENEMY_DATA[this.type];
    const barW = data.isBoss ? 60 : 30;
    const bx = this.sprite.x - barW / 2;
    const by = this.sprite.y - data.size * 0.55;
    this.hpBar.fillStyle(0x440000);
    this.hpBar.fillRect(bx, by, barW, 4);
    const pct = Math.max(0, this.hp / this.maxHp);
    this.hpBar.fillStyle(0xFF2222);
    this.hpBar.fillRect(bx, by, Math.floor(barW * pct), 4);
  }

  destroy(): void {
    this.hpBar.destroy();
    if (this.nameText) this.nameText.destroy();
    this.sprite.destroy();
  }
}
