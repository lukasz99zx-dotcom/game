import Phaser from 'phaser';
import { HeroClass, WeaponType, HERO_CLASSES, WEAPON_TYPES, COLORS } from '../constants';
import { HeroStats } from '../types';

export const HERO_DATA: Record<HeroClass, HeroStats> = {
  [HERO_CLASSES.KNIGHT]: {
    id: HERO_CLASSES.KNIGHT, name: 'Knight', hp: 200, speed: 120,
    startWeapon: WEAPON_TYPES.LIGHTNING_SWORD, specialName: 'War Cry',
    specialCooldown: 15000, description: 'High HP tank. War Cry stuns enemies.',
    color: COLORS.STONE_GRAY,
  },
  [HERO_CLASSES.ARCHER]: {
    id: HERO_CLASSES.ARCHER, name: 'Archer', hp: 120, speed: 170,
    startWeapon: WEAPON_TYPES.ENCHANTED_CROSSBOW, specialName: 'Rain of Arrows',
    specialCooldown: 10000, description: 'Fast and agile. Fires piercing arrows.',
    color: COLORS.BROWN,
  },
  [HERO_CLASSES.MAGE]: {
    id: HERO_CLASSES.MAGE, name: 'Mage', hp: 80, speed: 140,
    startWeapon: WEAPON_TYPES.FIREBALL, specialName: 'Time Freeze',
    specialCooldown: 14000, description: 'Powerful AOE spells. Slows all enemies.',
    color: COLORS.PURPLE,
  },
  [HERO_CLASSES.ROGUE]: {
    id: HERO_CLASSES.ROGUE, name: 'Rogue', hp: 150, speed: 190,
    startWeapon: WEAPON_TYPES.CHAIN_LIGHTNING, specialName: 'Shadow Step',
    specialCooldown: 8000, description: 'Fastest hero. Teleports behind enemies.',
    color: 0x222222,
  },
};

export class Player {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  heroClass: HeroClass;
  hp: number;
  maxHp: number;
  speed: number;
  level: number = 1;
  xp: number = 0;
  gold: number = 0;
  weapons: WeaponType[] = [];
  stats = {
    damage: 1.0,
    attackSpeed: 1.0,
    pickupRange: 60,
    damageReduction: 0,
    hpRegen: 0,      // HP per second
    lifesteal: 0,    // fraction of damage healed
  };
  specialCooldown: number;
  specialTimer: number = 0;
  isInvincible: boolean = false;
  invincibleTimer: number = 0;
  isShielded: boolean = false;
  shieldTimer: number = 0;

  // Attack speed buff (used by War Cry)
  private attackSpeedBuff: number = 0;
  private attackSpeedBuffTimer: number = 0;

  private flashTween: Phaser.Tweens.Tween | null = null;
  private hpBar!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, heroClass: HeroClass) {
    this.scene = scene;
    this.heroClass = heroClass;
    const data = HERO_DATA[heroClass];
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.speed = data.speed;
    this.specialCooldown = data.specialCooldown;
    this.weapons = [data.startWeapon];

    this.sprite = scene.physics.add.sprite(x, y, heroClass + '_0') as Phaser.Physics.Arcade.Sprite;
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setSize(24, 24);

    // Start walk animation
    if (scene.anims.exists(heroClass + '_walk')) {
      this.sprite.play(heroClass + '_walk');
    }

    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(11);
  }

  update(delta: number): void {
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.sprite.setAlpha(1);
      }
    }
    if (this.shieldTimer > 0) {
      this.shieldTimer -= delta;
      if (this.shieldTimer <= 0) this.isShielded = false;
    }
    if (this.specialTimer > 0) this.specialTimer -= delta;

    // Attack speed buff timer
    if (this.attackSpeedBuffTimer > 0) {
      this.attackSpeedBuffTimer -= delta;
      if (this.attackSpeedBuffTimer <= 0) {
        this.stats.attackSpeed = Math.max(0, this.stats.attackSpeed - this.attackSpeedBuff);
        this.attackSpeedBuff = 0;
      }
    }

    // HP regen
    if (this.stats.hpRegen > 0) {
      this.hp = Math.min(this.maxHp, this.hp + this.stats.hpRegen * delta / 1000);
    }

    // HP bar above player
    this.hpBar.clear();
    if (this.hp < this.maxHp) {
      const bx = this.sprite.x - 18;
      const by = this.sprite.y - 24;
      this.hpBar.fillStyle(0x440000);
      this.hpBar.fillRect(bx, by, 36, 5);
      const pct = this.hp / this.maxHp;
      const col = pct > 0.5 ? 0x00CC00 : pct > 0.25 ? 0xFFAA00 : 0xFF2200;
      this.hpBar.fillStyle(col);
      this.hpBar.fillRect(bx, by, Math.floor(36 * pct), 5);
    }
  }

  setMoving(isMoving: boolean): void {
    const walkKey = this.heroClass + '_walk';
    const idleKey = this.heroClass + '_idle';
    if (isMoving) {
      if (this.sprite.anims.currentAnim?.key !== walkKey && this.scene.anims.exists(walkKey)) {
        this.sprite.play(walkKey);
      }
    } else {
      if (this.sprite.anims.currentAnim?.key !== idleKey && this.scene.anims.exists(idleKey)) {
        this.sprite.play(idleKey);
      }
    }
  }

  takeDamage(amount: number): boolean {
    if (this.isInvincible || this.isShielded) return false;
    const dmg = Math.max(1, amount * (1 - this.stats.damageReduction));
    this.hp = Math.max(0, this.hp - dmg);
    this.isInvincible = true;
    this.invincibleTimer = 800;
    this.sprite.setAlpha(0.5);
    if (this.flashTween) this.flashTween.stop();
    this.flashTween = this.scene.tweens.add({
      targets: this.sprite, alpha: { from: 0.2, to: 1 },
      duration: 100, repeat: 4, yoyo: true,
      onComplete: () => { if (this.hp > 0) this.sprite.setAlpha(1); },
    });
    return this.hp <= 0;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addXp(amount: number): number {
    this.xp += amount;
    return this.xp;
  }

  addGold(amount: number): void {
    this.gold += amount;
  }

  addWeapon(weaponType: WeaponType): boolean {
    if (this.weapons.includes(weaponType)) return false;
    if (this.weapons.length >= 6) return false;
    this.weapons.push(weaponType);
    return true;
  }

  upgradeStat(statKey: string, value: number): void {
    switch (statKey) {
      case 'maxHp': this.maxHp += value; this.hp = Math.min(this.hp + value, this.maxHp); break;
      case 'healHp': this.heal(value); break;
      case 'speed': this.speed += value; break;
      case 'damage': this.stats.damage += value; break;
      case 'attackSpeed': this.stats.attackSpeed += value; break;
      case 'pickupRange': this.stats.pickupRange += value; break;
      case 'damageReduction': this.stats.damageReduction = Math.min(0.75, this.stats.damageReduction + value); break;
      case 'hpRegen': this.stats.hpRegen += value; break;
      case 'lifesteal': this.stats.lifesteal = Math.min(0.5, this.stats.lifesteal + value); break;
    }
  }

  useSpecial(): void {
    if (this.specialTimer > 0) return;
    this.specialTimer = this.specialCooldown;
    switch (this.heroClass) {
      case HERO_CLASSES.KNIGHT:
        // War Cry - stun enemies + attack speed buff
        this.attackSpeedBuff = 0.5;
        this.stats.attackSpeed += 0.5;
        this.attackSpeedBuffTimer = 5000;
        this.scene.events.emit('knight-warcry', this.sprite.x, this.sprite.y);
        break;
      case HERO_CLASSES.ARCHER:
        // Rain of Arrows - 12 arrows in all directions
        this.scene.events.emit('archer-rain', this.sprite.x, this.sprite.y);
        break;
      case HERO_CLASSES.MAGE:
        // Time Freeze - slow all enemies 90% for 5s
        this.scene.events.emit('mage-timefreeze', this.sprite.x, this.sprite.y);
        break;
      case HERO_CLASSES.ROGUE:
        // Shadow Step - teleport behind nearest enemy
        this.scene.events.emit('rogue-shadowstep', this.sprite.x, this.sprite.y);
        break;
    }
  }

  getSpecialCooldownPct(): number {
    if (this.specialTimer <= 0) return 1;
    return 1 - (this.specialTimer / this.specialCooldown);
  }

  destroy(): void {
    this.hpBar.destroy();
    this.sprite.destroy();
  }
}
