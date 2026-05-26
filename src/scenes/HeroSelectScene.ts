import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT, HERO_CLASSES } from '../constants';
import { HERO_DATA } from '../entities/Player';
import { HeroClass } from '../constants';

export class HeroSelectScene extends Phaser.Scene {
  private selectedHero: HeroClass = HERO_CLASSES.KNIGHT;
  private cards: Map<HeroClass, Phaser.GameObjects.Container> = new Map();
  private selectionGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: SCENE_KEYS.HERO_SELECT });
  }

  create(): void {
    this.createBackground();
    this.createTitle();
    this.createHeroCards();
    this.createPlayButton();
    this.selectHero(HERO_CLASSES.KNIGHT);
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0A0015, 0x0A0015, 0x1A0A30, 0x1A0A30, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const border = this.add.graphics();
    border.lineStyle(2, COLORS.DARK_GOLD, 0.6);
    border.strokeRect(8, 8, GAME_WIDTH - 16, GAME_HEIGHT - 16);
    border.lineStyle(1, COLORS.GOLD, 0.3);
    border.strokeRect(12, 12, GAME_WIDTH - 24, GAME_HEIGHT - 24);

    this.selectionGraphics = this.add.graphics();
  }

  private createTitle(): void {
    this.add.text(GAME_WIDTH / 2 + 2, 32, 'CHOOSE YOUR HERO', {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#000000',
    }).setOrigin(0.5).setAlpha(0.4);

    this.add.text(GAME_WIDTH / 2, 30, 'CHOOSE YOUR HERO', {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#FFD700',
      stroke: '#4A3000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 56, 'Each hero has unique abilities', {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: '#AAAAAA',
    }).setOrigin(0.5);
  }

  private createHeroCards(): void {
    const heroes = [HERO_CLASSES.KNIGHT, HERO_CLASSES.ARCHER, HERO_CLASSES.MAGE, HERO_CLASSES.ROGUE];
    const cardW = 200;
    const cardH = 260;
    const cols = 2;
    const rows = 2;
    const padX = (GAME_WIDTH - cols * cardW) / (cols + 1);
    const padY = 14;
    const startY = 78;

    heroes.forEach((heroClass, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padX + col * (cardW + padX) + cardW / 2;
      const y = startY + row * (cardH + padY) + cardH / 2;
      this.createHeroCard(heroClass, x, y, cardW, cardH);
    });
  }

  private createHeroCard(heroClass: HeroClass, cx: number, cy: number, w: number, h: number): void {
    const data = HERO_DATA[heroClass];
    const container = this.add.container(cx, cy);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x0D0D1A, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(2, COLORS.DARK_GOLD);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    container.add(bg);

    // Inner frame
    const frame = this.add.graphics();
    frame.lineStyle(1, data.color, 0.4);
    frame.strokeRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 5);
    container.add(frame);

    // Hero sprite (larger display)
    const sprite = this.add.image(0, -h / 2 + 56, heroClass).setScale(2.5);
    container.add(sprite);

    // Hero name
    const nameText = this.add.text(0, -h / 2 + 105, data.name.toUpperCase(), {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#' + data.color.toString(16).padStart(6, '0'),
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);
    container.add(nameText);

    // Stats
    const statsY = -h / 2 + 126;
    const hpBar = this.makeStatBar(-w / 2 + 14, statsY, w - 28, data.hp / 200, 0xFF4444, '❤ HP');
    const spdBar = this.makeStatBar(-w / 2 + 14, statsY + 20, w - 28, data.speed / 200, 0x44FF44, '👟 SPD');
    container.add([hpBar.bg, hpBar.fill, hpBar.label, spdBar.bg, spdBar.fill, spdBar.label]);

    // Special
    const specialText = this.add.text(0, statsY + 42, `★ ${data.specialName}`, {
      fontSize: '12px', fontFamily: 'Georgia, serif', color: '#FFDD44',
    }).setOrigin(0.5);
    container.add(specialText);

    // Description
    const descText = this.add.text(0, statsY + 62, data.description, {
      fontSize: '11px', fontFamily: 'Georgia, serif', color: '#AAAAAA',
      wordWrap: { width: w - 24 }, align: 'center',
    }).setOrigin(0.5);
    container.add(descText);

    // Hover / interaction
    const hitArea = this.add.zone(0, 0, w, h).setInteractive();
    container.add(hitArea);
    hitArea.on('pointerdown', () => this.selectHero(heroClass));
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x1A1A2A, 0.95);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      bg.lineStyle(2, data.color);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    });
    hitArea.on('pointerout', () => {
      if (this.selectedHero !== heroClass) {
        bg.clear();
        bg.fillStyle(0x0D0D1A, 0.95);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
        bg.lineStyle(2, COLORS.DARK_GOLD);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      }
    });

    this.cards.set(heroClass, container);
  }

  private makeStatBar(x: number, y: number, w: number, pct: number, color: number, label: string) {
    const bg = this.add.graphics();
    bg.fillStyle(0x333333);
    bg.fillRect(x, y, w, 8);

    const fill = this.add.graphics();
    fill.fillStyle(color);
    fill.fillRect(x, y, Math.floor(w * Math.min(1, pct)), 8);

    const lbl = this.add.text(x, y - 13, label, {
      fontSize: '10px', fontFamily: 'Georgia, serif', color: '#888888',
    });

    return { bg, fill, label: lbl };
  }

  private selectHero(heroClass: HeroClass): void {
    this.selectedHero = heroClass;

    // Update all card borders
    const cardW = 200, cardH = 260;
    this.cards.forEach((container, cls) => {
      const bg = container.list[0] as Phaser.GameObjects.Graphics;
      bg.clear();
      if (cls === heroClass) {
        bg.fillStyle(0x1A1630, 0.95);
        bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);
        bg.lineStyle(3, COLORS.GOLD);
        bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);
      } else {
        bg.fillStyle(0x0D0D1A, 0.95);
        bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);
        bg.lineStyle(2, COLORS.DARK_GOLD);
        bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 8);
      }
    });
  }

  private createPlayButton(): void {
    const cy = GAME_HEIGHT - 36;
    const cx = GAME_WIDTH / 2;

    const bg = this.add.graphics();
    const drawBtn = (hovered: boolean) => {
      bg.clear();
      bg.fillStyle(hovered ? 0x3A2A00 : 0x1A1000);
      bg.fillRect(cx - 100, cy - 22, 200, 44);
      bg.lineStyle(2, hovered ? COLORS.GOLD : COLORS.DARK_GOLD);
      bg.strokeRect(cx - 100, cy - 22, 200, 44);
    };
    drawBtn(false);

    const text = this.add.text(cx, cy, '⚔  ENTER BATTLE  ⚔', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#FFD700',
    }).setOrigin(0.5);

    const zone = this.add.zone(cx, cy, 200, 44).setInteractive();
    zone.on('pointerover', () => { drawBtn(true); text.setColor('#FFFFFF'); });
    zone.on('pointerout', () => { drawBtn(false); text.setColor('#FFD700'); });
    zone.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.GAME, { heroClass: this.selectedHero });
    });

    this.add.text(cx, cy - 32, `Selected: ${HERO_DATA[this.selectedHero].name}`, {
      fontSize: '11px', fontFamily: 'monospace', color: '#888888',
    }).setOrigin(0.5).setName('selectedLabel');
  }
}
