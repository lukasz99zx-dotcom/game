import Phaser from 'phaser';

export function showDamageNumber(scene: Phaser.Scene, x: number, y: number, damage: number, isCrit: boolean = false): void {
  const text = scene.add.text(x + Phaser.Math.Between(-15, 15), y - 10, String(damage), {
    fontSize: isCrit ? '20px' : '14px',
    fontFamily: '"Courier New", monospace',
    color: isCrit ? '#FF4400' : '#EEEEEE',
    stroke: '#000000',
    strokeThickness: 3,
  }).setDepth(200).setOrigin(0.5);
  scene.tweens.add({
    targets: text,
    y: y - 55,
    alpha: 0,
    duration: 950,
    ease: 'Power2Out',
    onComplete: () => text.destroy(),
  });
}
