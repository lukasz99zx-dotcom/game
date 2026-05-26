import Phaser from 'phaser';

export class Projectile {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  damage: number;
  pierceCount: number;
  hitEnemies: Set<number> = new Set();
  lifespan: number;
  elapsed: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    textureKey: string,
    velocityX: number, velocityY: number,
    damage: number,
    lifespan: number = 2000,
    pierceCount: number = 1,
    scale: number = 1,
  ) {
    this.scene = scene;
    this.damage = damage;
    this.pierceCount = pierceCount;
    this.lifespan = lifespan;

    this.sprite = scene.physics.add.sprite(x, y, textureKey) as Phaser.Physics.Arcade.Sprite;
    this.sprite.setVelocity(velocityX, velocityY);
    this.sprite.setDepth(8);
    this.sprite.setScale(scale);

    // Rotate arrow to face direction
    if (textureKey === 'arrow' || textureKey === 'goblin_arrow') {
      this.sprite.setRotation(Math.atan2(velocityY, velocityX));
    }
    (this.sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
  }

  update(dt: number): boolean {
    this.elapsed += dt;
    return this.elapsed >= this.lifespan || !this.sprite.active;
  }

  onHit(enemyId: number): boolean {
    if (this.hitEnemies.has(enemyId)) return false;
    this.hitEnemies.add(enemyId);
    this.pierceCount--;
    if (this.pierceCount <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  destroy(): void {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
}
