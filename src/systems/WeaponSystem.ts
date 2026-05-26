import Phaser from 'phaser';
import { WeaponType, WEAPON_TYPES } from '../constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';

interface WeaponState {
  type: WeaponType;
  timer: number;
  level: number;
  orbs?: Phaser.GameObjects.Sprite[];
  orbAngle?: number;
}

const WEAPON_COOLDOWNS: Record<WeaponType, number> = {
  [WEAPON_TYPES.LIGHTNING_SWORD]:    800,
  [WEAPON_TYPES.ENCHANTED_CROSSBOW]: 600,
  [WEAPON_TYPES.FIREBALL]:           1200,
  [WEAPON_TYPES.HOLY_CROSS]:         0,    // passive rotation
  [WEAPON_TYPES.FROST_AURA]:         0,    // passive
  [WEAPON_TYPES.CHAIN_LIGHTNING]:    1000,
};

const WEAPON_DAMAGE: Record<WeaponType, number> = {
  [WEAPON_TYPES.LIGHTNING_SWORD]:    30,
  [WEAPON_TYPES.ENCHANTED_CROSSBOW]: 25,
  [WEAPON_TYPES.FIREBALL]:           40,
  [WEAPON_TYPES.HOLY_CROSS]:         20,
  [WEAPON_TYPES.FROST_AURA]:         0,
  [WEAPON_TYPES.CHAIN_LIGHTNING]:    35,
};

export class WeaponSystem {
  scene: Phaser.Scene;
  player: Player;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  weaponStates: Map<WeaponType, WeaponState> = new Map();
  private slashGraphics: Phaser.GameObjects.Graphics;
  private auraGraphics: Phaser.GameObjects.Graphics;
  private lightningGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.slashGraphics = scene.add.graphics().setDepth(9);
    this.auraGraphics = scene.add.graphics().setDepth(4);
    this.lightningGraphics = scene.add.graphics().setDepth(9);
    this.syncWeapons();
  }

  syncWeapons(): void {
    const current = new Set(this.player.weapons);
    // Remove weapons no longer owned
    for (const [type] of this.weaponStates) {
      if (!current.has(type)) {
        const ws = this.weaponStates.get(type)!;
        ws.orbs?.forEach(o => o.destroy());
        this.weaponStates.delete(type);
      }
    }
    // Add new weapons
    for (const type of this.player.weapons) {
      if (!this.weaponStates.has(type)) {
        const ws: WeaponState = { type, timer: 0, level: 1 };
        if (type === WEAPON_TYPES.HOLY_CROSS) {
          ws.orbs = [];
          ws.orbAngle = 0;
          for (let i = 0; i < 3; i++) {
            const orb = this.scene.add.sprite(0, 0, 'holy_cross').setDepth(9);
            ws.orbs.push(orb);
          }
        }
        this.weaponStates.set(type, ws);
      }
    }
  }

  update(dt: number): void {
    this.syncWeapons();
    this.slashGraphics.clear();
    this.auraGraphics.clear();
    this.lightningGraphics.clear();

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const dmgMult = this.player.stats.damage;
    const speedMult = this.player.stats.attackSpeed;

    for (const [type, ws] of this.weaponStates) {
      const baseCooldown = WEAPON_COOLDOWNS[type];

      if (type === WEAPON_TYPES.HOLY_CROSS) {
        this.updateHolyCross(ws, dt, px, py, dmgMult);
        continue;
      }
      if (type === WEAPON_TYPES.FROST_AURA) {
        this.updateFrostAura(px, py, dmgMult);
        continue;
      }

      if (baseCooldown > 0) {
        ws.timer += dt * speedMult;
        if (ws.timer >= baseCooldown) {
          ws.timer = 0;
          this.fireWeapon(type, px, py, dmgMult);
        }
      }
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter(p => {
      if (!p.sprite.active) return false;
      const done = p.update(dt);
      if (done) { p.destroy(); return false; }
      return true;
    });
  }

  private fireWeapon(type: WeaponType, px: number, py: number, dmgMult: number): void {
    const nearest = this.findNearestEnemy(px, py);
    const damage = Math.floor(WEAPON_DAMAGE[type] * dmgMult);

    switch (type) {
      case WEAPON_TYPES.LIGHTNING_SWORD:
        this.fireLightningSword(px, py, damage);
        break;
      case WEAPON_TYPES.ENCHANTED_CROSSBOW:
        if (nearest) this.fireCrossbow(px, py, nearest, damage);
        break;
      case WEAPON_TYPES.FIREBALL:
        if (nearest) this.fireFireball(px, py, nearest, damage);
        break;
      case WEAPON_TYPES.CHAIN_LIGHTNING:
        if (nearest) this.fireChainLightning(px, py, nearest, damage);
        break;
    }
  }

  private fireLightningSword(px: number, py: number, damage: number): void {
    const radius = 80;
    this.slashGraphics.fillStyle(0xCCCCFF, 0.3);
    this.slashGraphics.fillCircle(px, py, radius);
    this.slashGraphics.lineStyle(2, 0x8888FF, 0.6);
    this.slashGraphics.strokeCircle(px, py, radius);

    this.scene.time.delayedCall(200, () => this.slashGraphics.clear());

    this.enemies.forEach(e => {
      if (!e.sprite.active) return;
      const dist = Phaser.Math.Distance.Between(px, py, e.sprite.x, e.sprite.y);
      if (dist <= radius) {
        const dead = e.takeDamage(damage);
        if (dead) this.scene.events.emit('enemy-died', e);
      }
    });
  }

  private fireCrossbow(px: number, py: number, target: Enemy, damage: number): void {
    const dx = target.sprite.x - px;
    const dy = target.sprite.y - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 350;
    const proj = new Projectile(this.scene, px, py, 'arrow',
      (dx / dist) * speed, (dy / dist) * speed, damage, 2500, 3);
    this.projectiles.push(proj);
    this.scene.events.emit('projectile-created', proj);
  }

  private fireFireball(px: number, py: number, target: Enemy, damage: number): void {
    const dx = target.sprite.x - px;
    const dy = target.sprite.y - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 250;
    const proj = new Projectile(this.scene, px, py, 'fireball',
      (dx / dist) * speed, (dy / dist) * speed, damage, 2000, 99, 1.2);
    proj.sprite.setData('isAoe', true);
    proj.sprite.setData('aoeRadius', 60);
    this.projectiles.push(proj);
    this.scene.events.emit('projectile-created', proj);
  }

  private fireChainLightning(px: number, py: number, first: Enemy, damage: number): void {
    const maxChain = 4;
    const chainRange = 150;
    const chainOrder: Enemy[] = [first];
    const hit = new Set<Enemy>([first]);

    for (let i = 0; i < maxChain - 1; i++) {
      const prev = chainOrder[chainOrder.length - 1];
      let nearest: Enemy | null = null;
      let nearDist = chainRange;
      for (const e of this.enemies) {
        if (hit.has(e) || !e.sprite.active) continue;
        const d = Phaser.Math.Distance.Between(prev.sprite.x, prev.sprite.y, e.sprite.x, e.sprite.y);
        if (d < nearDist) { nearDist = d; nearest = e; }
      }
      if (!nearest) break;
      chainOrder.push(nearest);
      hit.add(nearest);
    }

    // Draw lightning chain
    let fromX = px, fromY = py;
    for (const e of chainOrder) {
      this.lightningGraphics.lineStyle(3, 0x88FFFF, 0.8);
      this.lightningGraphics.beginPath();
      this.lightningGraphics.moveTo(fromX, fromY);
      // Zigzag
      const mid1x = (fromX + e.sprite.x) / 2 + (Math.random() - 0.5) * 30;
      const mid1y = (fromY + e.sprite.y) / 2 + (Math.random() - 0.5) * 30;
      this.lightningGraphics.lineTo(mid1x, mid1y);
      this.lightningGraphics.lineTo(e.sprite.x, e.sprite.y);
      this.lightningGraphics.strokePath();
      fromX = e.sprite.x; fromY = e.sprite.y;

      const dead = e.takeDamage(damage);
      if (dead) this.scene.events.emit('enemy-died', e);
    }
    this.scene.time.delayedCall(150, () => this.lightningGraphics.clear());
  }

  private updateHolyCross(ws: WeaponState, dt: number, px: number, py: number, dmgMult: number): void {
    if (!ws.orbs || ws.orbAngle === undefined) return;
    const radius = 60;
    const rotSpeed = 0.003;
    ws.orbAngle += rotSpeed * dt;
    const damage = Math.floor(WEAPON_DAMAGE[WEAPON_TYPES.HOLY_CROSS] * dmgMult);
    const numOrbs = ws.orbs.length;

    ws.orbs.forEach((orb, i) => {
      const angle = ws.orbAngle! + (i * Math.PI * 2) / numOrbs;
      const ox = px + Math.cos(angle) * radius;
      const oy = py + Math.sin(angle) * radius;
      orb.setPosition(ox, oy);

      // Check hits
      this.enemies.forEach(e => {
        if (!e.sprite.active) return;
        const dist = Phaser.Math.Distance.Between(ox, oy, e.sprite.x, e.sprite.y);
        if (dist < 20) {
          const dead = e.takeDamage(damage);
          if (dead) this.scene.events.emit('enemy-died', e);
        }
      });
    });
  }

  private updateFrostAura(px: number, py: number, _dmgMult: number): void {
    const range = 100;
    this.auraGraphics.fillStyle(0x88CCFF, 0.1);
    this.auraGraphics.fillCircle(px, py, range);
    this.auraGraphics.lineStyle(1, 0x88CCFF, 0.3);
    this.auraGraphics.strokeCircle(px, py, range);

    this.enemies.forEach(e => {
      if (!e.sprite.active) return;
      const dist = Phaser.Math.Distance.Between(px, py, e.sprite.x, e.sprite.y);
      if (dist <= range) e.slow(200);
    });
  }

  checkProjectileHits(): void {
    for (const proj of this.projectiles) {
      if (!proj.sprite.active) continue;
      const isAoe = proj.sprite.getData('isAoe');
      const aoeRadius = proj.sprite.getData('aoeRadius') || 0;

      for (const e of this.enemies) {
        if (!e.sprite.active) continue;
        const dist = Phaser.Math.Distance.Between(proj.sprite.x, proj.sprite.y, e.sprite.x, e.sprite.y);
        const hitRadius = isAoe ? aoeRadius : 16;

        if (dist < hitRadius) {
          const enemyId = e.sprite.getData('id') || 0;
          const destroyed = proj.onHit(enemyId);
          const dead = e.takeDamage(proj.damage);
          if (dead) this.scene.events.emit('enemy-died', e);

          if (isAoe) {
            // AOE: hit all in radius once then destroy
            this.enemies.forEach(other => {
              if (other === e || !other.sprite.active) return;
              const d2 = Phaser.Math.Distance.Between(proj.sprite.x, proj.sprite.y, other.sprite.x, other.sprite.y);
              if (d2 < aoeRadius) {
                const dead2 = other.takeDamage(proj.damage);
                if (dead2) this.scene.events.emit('enemy-died', other);
              }
            });
            proj.destroy();
            break;
          }
          if (destroyed) break;
        }
      }
    }
  }

  fireSalvo(px: number, py: number): void {
    const damage = Math.floor(25 * this.player.stats.damage);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 320;
      const proj = new Projectile(this.scene, px, py, 'arrow',
        Math.cos(angle) * speed, Math.sin(angle) * speed, damage, 2000, 2);
      this.projectiles.push(proj);
      this.scene.events.emit('projectile-created', proj);
    }
  }

  fireMeteor(px: number, py: number): void {
    const damage = Math.floor(120 * this.player.stats.damage);
    // Find 5 enemy clusters and hit them
    let targets: { x: number; y: number }[] = [];
    const sorted = [...this.enemies].filter(e => e.sprite.active)
      .sort((a, b) => Phaser.Math.Distance.Between(px, py, a.sprite.x, a.sprite.y) -
                       Phaser.Math.Distance.Between(px, py, b.sprite.x, b.sprite.y));
    for (let i = 0; i < Math.min(5, sorted.length); i++) {
      targets.push({ x: sorted[i].sprite.x, y: sorted[i].sprite.y });
    }
    if (targets.length === 0) targets.push({ x: px, y: py });

    targets.forEach((t, idx) => {
      this.scene.time.delayedCall(idx * 150, () => {
        const proj = new Projectile(this.scene, t.x, t.y - 300, 'fireball',
          0, 400, damage, 1500, 99, 2.0);
        proj.sprite.setData('isAoe', true);
        proj.sprite.setData('aoeRadius', 80);
        this.projectiles.push(proj);
        this.scene.events.emit('projectile-created', proj);
      });
    });
  }

  fireSmokeBomb(px: number, py: number): void {
    const radius = 120;
    this.enemies.forEach(e => {
      if (!e.sprite.active) return;
      const dist = Phaser.Math.Distance.Between(px, py, e.sprite.x, e.sprite.y);
      if (dist <= radius) e.stun(3000);
    });
    // Visual effect
    const g = this.scene.add.graphics().setDepth(15);
    g.fillStyle(0x444444, 0.6);
    g.fillCircle(px, py, radius);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 800, onComplete: () => g.destroy() });
  }

  findNearestEnemy(px: number, py: number): Enemy | null {
    let nearest: Enemy | null = null;
    let nearDist = Infinity;
    for (const e of this.enemies) {
      if (!e.sprite.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, e.sprite.x, e.sprite.y);
      if (d < nearDist) { nearDist = d; nearest = e; }
    }
    return nearest;
  }

  destroy(): void {
    this.slashGraphics.destroy();
    this.auraGraphics.destroy();
    this.lightningGraphics.destroy();
    for (const [, ws] of this.weaponStates) {
      ws.orbs?.forEach(o => o.destroy());
    }
    this.projectiles.forEach(p => p.destroy());
  }
}
