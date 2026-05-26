import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, XP_PER_LEVEL } from '../constants';
import { Player } from '../entities/Player';

export class HUD {
  scene: Phaser.Scene;
  player: Player;

  private topBar!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private bottomBar!: Phaser.GameObjects.Graphics;
  private waveText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private weaponIcons: Phaser.GameObjects.Text[] = [];
  private specialBtn!: Phaser.GameObjects.Graphics;
  private specialBtnText!: Phaser.GameObjects.Text;
  private specialCooldownText!: Phaser.GameObjects.Text;
  private bossHpBar!: Phaser.GameObjects.Graphics;
  private bossHpText!: Phaser.GameObjects.Text;
  private announceText!: Phaser.GameObjects.Text;

  private sf = 0; // scroll factor shorthand

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.createHUD();
  }

  private fix(obj: Phaser.GameObjects.GameObject & { setScrollFactor?: Function }) {
    obj.setScrollFactor?.(0);
    return obj;
  }

  private createHUD(): void {
    // Top bar background
    this.topBar = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
    this.topBar.fillStyle(0x000000, 0.7);
    this.topBar.fillRect(0, 0, GAME_WIDTH, 52);
    this.topBar.lineStyle(1, COLORS.DARK_GOLD);
    this.topBar.strokeRect(0, 0, GAME_WIDTH, 52);

    // XP bar background
    this.xpBar = this.scene.add.graphics().setScrollFactor(0).setDepth(100);

    // Wave text
    this.waveText = this.scene.add.text(GAME_WIDTH / 2, 12, 'Wave 1', {
      fontSize: '16px', fontFamily: 'Georgia, serif',
      color: '#FFD700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    // Timer text
    this.timerText = this.scene.add.text(GAME_WIDTH / 2, 30, '1:00', {
      fontSize: '13px', fontFamily: 'monospace', color: '#CCCCCC',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    // HP text
    this.hpText = this.scene.add.text(8, 8, '❤ 200/200', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#FF4444',
      stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(101);

    // Level text
    this.levelText = this.scene.add.text(8, 28, 'Lv.1', {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: '#AAFFAA',
      stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(101);

    // Gold text
    this.goldText = this.scene.add.text(GAME_WIDTH - 8, 8, '🪙 0', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);

    // Bottom bar
    this.bottomBar = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
    this.bottomBar.fillStyle(0x000000, 0.6);
    this.bottomBar.fillRect(0, GAME_HEIGHT - 110, GAME_WIDTH, 110);
    this.bottomBar.lineStyle(1, COLORS.DARK_GOLD);
    this.bottomBar.strokeRect(0, GAME_HEIGHT - 110, GAME_WIDTH, 1);

    // Special ability button (right side)
    this.specialBtn = this.scene.add.graphics().setScrollFactor(0).setDepth(101);
    const sbx = GAME_WIDTH - 60;
    const sby = GAME_HEIGHT - 60;
    this.drawSpecialButton(1.0);

    this.specialBtnText = this.scene.add.text(sbx, sby, '★', {
      fontSize: '24px', color: '#FFD700',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

    this.specialCooldownText = this.scene.add.text(sbx, sby + 26, 'READY', {
      fontSize: '10px', fontFamily: 'monospace', color: '#AAFFAA',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

    // Make special button interactive
    const zone = this.scene.add.zone(GAME_WIDTH - 60, GAME_HEIGHT - 60, 90, 90)
      .setInteractive().setScrollFactor(0).setDepth(103);
    zone.on('pointerdown', () => this.player.useSpecial());

    // Boss HP bar (hidden by default)
    this.bossHpBar = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
    this.bossHpText = this.scene.add.text(GAME_WIDTH / 2, 62, '', {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: '#FF4444',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    // Announce text
    this.announceText = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '', {
      fontSize: '26px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);
  }

  private drawSpecialButton(cooldownPct: number): void {
    const sbx = GAME_WIDTH - 60;
    const sby = GAME_HEIGHT - 60;
    const r = 38;
    this.specialBtn.clear();

    // Background
    this.specialBtn.fillStyle(0x1A0A00, 0.9);
    this.specialBtn.fillCircle(sbx, sby, r);
    this.specialBtn.lineStyle(2, COLORS.DARK_GOLD);
    this.specialBtn.strokeCircle(sbx, sby, r);

    // Cooldown arc
    if (cooldownPct < 1.0) {
      this.specialBtn.lineStyle(5, 0x333333);
      this.specialBtn.strokeCircle(sbx, sby, r - 4);
      this.specialBtn.lineStyle(5, COLORS.GOLD);
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + cooldownPct * Math.PI * 2;
      this.specialBtn.beginPath();
      this.specialBtn.arc(sbx, sby, r - 4, startAngle, endAngle, false);
      this.specialBtn.strokePath();
    } else {
      this.specialBtn.lineStyle(4, COLORS.GOLD);
      this.specialBtn.strokeCircle(sbx, sby, r - 3);
    }
  }

  update(wave: number, waveTimeLeft: number, bossEnemy: { hp: number; maxHp: number; name: string } | null): void {
    const p = this.player;

    // HP
    this.hpText.setText(`❤ ${p.hp}/${p.maxHp}`);

    // Level & XP
    const nextXp = XP_PER_LEVEL[Math.min(p.level, XP_PER_LEVEL.length - 1)];
    this.levelText.setText(`Lv.${p.level}  XP:${p.xp}/${nextXp}`);

    // Gold
    this.goldText.setText(`🪙 ${p.gold}`);

    // Wave & timer
    this.waveText.setText(`Wave ${wave}`);
    const secs = Math.ceil(waveTimeLeft / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    this.timerText.setText(`${m}:${s.toString().padStart(2, '0')}`);

    // XP bar
    this.xpBar.clear();
    this.xpBar.fillStyle(0x000000, 0.6);
    this.xpBar.fillRect(0, 52, GAME_WIDTH, 8);
    const xpPct = nextXp > 0 ? Math.min(1, p.xp / nextXp) : 1;
    this.xpBar.fillStyle(0x44AAFF);
    this.xpBar.fillRect(0, 52, Math.floor(GAME_WIDTH * xpPct), 8);
    this.xpBar.lineStyle(1, 0x2266AA);
    this.xpBar.strokeRect(0, 52, GAME_WIDTH, 8);

    // Special button
    const cdPct = p.getSpecialCooldownPct();
    this.drawSpecialButton(cdPct);
    if (cdPct >= 1.0) {
      this.specialCooldownText.setText('READY').setColor('#AAFFAA');
    } else {
      const remaining = Math.ceil((p.specialTimer || 0) / 1000);
      this.specialCooldownText.setText(`${remaining}s`).setColor('#FFAA44');
    }

    // Weapon icons
    this.updateWeaponIcons();

    // Boss HP bar
    if (bossEnemy) {
      this.bossHpBar.clear();
      this.bossHpBar.fillStyle(0x000000, 0.8);
      this.bossHpBar.fillRect(20, 58, GAME_WIDTH - 40, 14);
      const bpct = Math.max(0, bossEnemy.hp / bossEnemy.maxHp);
      this.bossHpBar.fillStyle(0xFF2222);
      this.bossHpBar.fillRect(20, 58, Math.floor((GAME_WIDTH - 40) * bpct), 14);
      this.bossHpBar.lineStyle(1, COLORS.DARK_GOLD);
      this.bossHpBar.strokeRect(20, 58, GAME_WIDTH - 40, 14);
      this.bossHpText.setText(`☠ ${bossEnemy.name.toUpperCase()} ☠`).setVisible(true);
    } else {
      this.bossHpBar.clear();
      this.bossHpText.setVisible(false);
    }
  }

  private updateWeaponIcons(): void {
    this.weaponIcons.forEach(t => t.destroy());
    this.weaponIcons = [];
    const iconSize = 34;
    const startX = 8;
    const startY = GAME_HEIGHT - 96;
    const weaponEmojis: Record<string, string> = {
      lightning_sword: '⚔',
      enchanted_crossbow: '🏹',
      fireball: '🔥',
      holy_cross: '✝',
      frost_aura: '❄',
      chain_lightning: '⚡',
    };
    this.player.weapons.slice(0, 6).forEach((w, i) => {
      const col = Math.floor(i / 2);
      const row = i % 2;
      const x = startX + col * (iconSize + 4);
      const y = startY + row * (iconSize / 2 + 2);
      const t = this.scene.add.text(x + iconSize / 2, y + iconSize / 4, weaponEmojis[w] || '?', {
        fontSize: '18px',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
      this.weaponIcons.push(t);
    });
  }

  announce(text: string, duration: number = 2000): void {
    this.announceText.setText(text).setAlpha(1);
    this.scene.tweens.add({
      targets: this.announceText, alpha: 0,
      delay: duration - 500, duration: 500,
    });
  }

  destroy(): void {
    this.topBar.destroy();
    this.xpBar.destroy();
    this.bottomBar.destroy();
    this.waveText.destroy();
    this.timerText.destroy();
    this.goldText.destroy();
    this.levelText.destroy();
    this.hpText.destroy();
    this.specialBtn.destroy();
    this.specialBtnText.destroy();
    this.specialCooldownText.destroy();
    this.bossHpBar.destroy();
    this.bossHpText.destroy();
    this.announceText.destroy();
    this.weaponIcons.forEach(t => t.destroy());
  }
}
