import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { UpgradeOption } from '../types';

export class LevelUpScene extends Phaser.Scene {
  private options: UpgradeOption[] = [];
  private onChoose!: (option: UpgradeOption) => void;

  constructor() {
    super({ key: SCENE_KEYS.LEVEL_UP });
  }

  init(data: { options: UpgradeOption[]; onChoose: (option: UpgradeOption) => void }): void {
    this.options = data.options;
    this.onChoose = data.onChoose;
  }

  create(): void {
    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add.text(GAME_WIDTH / 2, 120, '⬆ LEVEL UP!', {
      fontSize: '30px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 160, 'Choose an upgrade:', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#CCCCCC',
    }).setOrigin(0.5);

    this.createCards();
  }

  private createCards(): void {
    const cardW = GAME_WIDTH - 40;
    const cardH = 120;
    const startY = 190;
    const gap = 12;

    this.options.forEach((option, i) => {
      const cy = startY + i * (cardH + gap) + cardH / 2;
      const cx = GAME_WIDTH / 2;
      this.createCard(option, cx, cy, cardW, cardH);
    });
  }

  private createCard(option: UpgradeOption, cx: number, cy: number, w: number, h: number): void {
    const bg = this.add.graphics();
    const drawCard = (hovered: boolean) => {
      bg.clear();
      bg.fillStyle(hovered ? 0x2A2000 : 0x0D0A00, 0.95);
      bg.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
      bg.lineStyle(2, hovered ? COLORS.GOLD : COLORS.DARK_GOLD);
      bg.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
    };
    drawCard(false);

    // Icon/emoji
    const emoji = option.type === 'weapon' ? '⚔' : '📈';
    const typeColor = option.type === 'weapon' ? '#FF8844' : '#44AAFF';

    this.add.text(cx - w / 2 + 20, cy - 16, emoji, {
      fontSize: '28px',
    }).setOrigin(0, 0.5);

    this.add.text(cx - w / 2 + 60, cy - 20, option.name, {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#000000', strokeThickness: 2,
    });

    this.add.text(cx - w / 2 + 60, cy - 2, option.description, {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: '#AAAAAA',
      wordWrap: { width: w - 80 },
    });

    this.add.text(cx + w / 2 - 12, cy, option.type === 'weapon' ? 'WEAPON' : 'PASSIVE', {
      fontSize: '10px', fontFamily: 'monospace', color: typeColor,
    }).setOrigin(1, 0.5);

    const zone = this.add.zone(cx, cy, w, h).setInteractive();
    zone.on('pointerover', () => { drawCard(true); });
    zone.on('pointerout', () => { drawCard(false); });
    zone.on('pointerdown', () => {
      this.onChoose(option);
      this.scene.resume(SCENE_KEYS.GAME);
      this.scene.stop();
    });
  }
}
