import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

interface GameOverData {
  victory?: boolean;
  wave: number;
  enemiesKilled: number;
  gold: number;
  level: number;
  survivalTime: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.GAME_OVER });
  }

  init(data: GameOverData): void {
    const victory = data.victory ?? false;
    this.createUI(data, victory);
  }

  create(): void {}

  private createUI(data: GameOverData, victory: boolean): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.95);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Decorative border
    bg.lineStyle(3, victory ? COLORS.GOLD : COLORS.BLOOD_RED);
    bg.strokeRect(10, 10, GAME_WIDTH - 20, GAME_HEIGHT - 20);
    bg.lineStyle(1, victory ? COLORS.DARK_GOLD : 0x660000);
    bg.strokeRect(16, 16, GAME_WIDTH - 32, GAME_HEIGHT - 32);

    // Main title
    const titleText = victory ? '⚔ VICTORY! ⚔' : '💀 GAME OVER 💀';
    const titleColor = victory ? '#FFD700' : '#FF2222';

    this.add.text(GAME_WIDTH / 2, 90, titleText, {
      fontSize: '32px', fontFamily: 'Georgia, serif', color: titleColor,
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 135, victory ? 'The realm is saved!' : 'The realm has fallen...', {
      fontSize: '14px', fontFamily: 'Georgia, serif',
      color: victory ? '#AAFFAA' : '#FF8888',
    }).setOrigin(0.5);

    // Stats panel
    const panelY = 170;
    const panelH = 260;
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0D0A00, 0.9);
    panelBg.fillRect(30, panelY, GAME_WIDTH - 60, panelH);
    panelBg.lineStyle(1, COLORS.DARK_GOLD);
    panelBg.strokeRect(30, panelY, GAME_WIDTH - 60, panelH);

    this.add.text(GAME_WIDTH / 2, panelY + 14, '— BATTLE REPORT —', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#B8860B',
    }).setOrigin(0.5);

    const minutes = Math.floor(data.survivalTime / 60000);
    const seconds = Math.floor((data.survivalTime % 60000) / 1000);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const stats = [
      { label: '⏱ Survival Time', value: timeStr },
      { label: '🌊 Waves Survived', value: `${data.wave}` },
      { label: '⚔ Enemies Killed', value: `${data.enemiesKilled}` },
      { label: '🪙 Gold Collected', value: `${data.gold}` },
      { label: '⬆ Level Reached', value: `${data.level}` },
    ];

    stats.forEach((s, i) => {
      const y = panelY + 40 + i * 42;
      this.add.text(50, y, s.label, {
        fontSize: '14px', fontFamily: 'Georgia, serif', color: '#AAAAAA',
      });
      this.add.text(GAME_WIDTH - 50, y, s.value, {
        fontSize: '16px', fontFamily: 'Georgia, serif', color: '#FFD700',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(1, 0);

      // Divider line
      if (i < stats.length - 1) {
        const line = this.add.graphics();
        line.lineStyle(1, 0x333300, 0.5);
        line.beginPath();
        line.moveTo(50, y + 26);
        line.lineTo(GAME_WIDTH - 50, y + 26);
        line.strokePath();
      }
    });

    // Buttons
    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'PLAY AGAIN', COLORS.DARK_GOLD, () => {
      this.scene.start(SCENE_KEYS.HERO_SELECT);
    });

    this.createButton(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'MAIN MENU', 0x222200, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }

  private createButton(cx: number, cy: number, label: string, bgColor: number, callback: () => void): void {
    const w = 220, h = 44;
    const bg = this.add.graphics();
    const draw = (hov: boolean) => {
      bg.clear();
      bg.fillStyle(hov ? bgColor + 0x111100 : bgColor, 0.9);
      bg.fillRect(cx - w / 2, cy - h / 2, w, h);
      bg.lineStyle(2, COLORS.GOLD);
      bg.strokeRect(cx - w / 2, cy - h / 2, w, h);
    };
    draw(false);

    this.add.text(cx, cy, label, {
      fontSize: '18px', fontFamily: 'Georgia, serif', color: '#FFD700',
    }).setOrigin(0.5);

    const zone = this.add.zone(cx, cy, w, h).setInteractive();
    zone.on('pointerover', () => draw(true));
    zone.on('pointerout', () => draw(false));
    zone.on('pointerdown', callback);
  }
}
