import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MENU });
  }

  create(): void {
    const bg = this.add.graphics();
    // Night sky gradient background
    bg.fillGradientStyle(0x0A0020, 0x0A0020, 0x1A0A00, 0x1A0A00, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT * 0.6);
      const size = Math.random() < 0.2 ? 2 : 1;
      bg.fillStyle(COLORS.WHITE, Math.random() * 0.8 + 0.2);
      bg.fillRect(x, y, size, size);
    }

    // Castle silhouette at bottom
    this.drawCastleSilhouette(bg);

    // Atmospheric glow behind title
    const glowGfx = this.add.graphics();
    glowGfx.fillStyle(COLORS.GOLD, 0.05);
    glowGfx.fillEllipse(GAME_WIDTH / 2, 180, 400, 200);

    // Title text with shadow
    const titleShadow = this.add.text(GAME_WIDTH / 2 + 3, 103, "REALM'S", {
      fontSize: '44px',
      fontFamily: 'serif',
      color: '#5A3A00',
    }).setOrigin(0.5);

    const title1 = this.add.text(GAME_WIDTH / 2, 100, "REALM'S", {
      fontSize: '44px',
      fontFamily: 'serif',
      color: '#FFD700',
      stroke: '#B8860B',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const titleShadow2 = this.add.text(GAME_WIDTH / 2 + 3, 153, 'LAST STAND', {
      fontSize: '44px',
      fontFamily: 'serif',
      color: '#5A3A00',
    }).setOrigin(0.5);

    const title2 = this.add.text(GAME_WIDTH / 2, 150, 'LAST STAND', {
      fontSize: '44px',
      fontFamily: 'serif',
      color: '#FFD700',
      stroke: '#B8860B',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 200, 'Medieval Fantasy Survivor', {
      fontSize: '18px',
      fontFamily: 'serif',
      color: '#F4E4BC',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Decorative divider
    const divider = this.add.graphics();
    divider.lineStyle(2, COLORS.GOLD);
    divider.lineBetween(GAME_WIDTH / 2 - 160, 220, GAME_WIDTH / 2 + 160, 220);
    divider.fillStyle(COLORS.GOLD);
    divider.fillCircle(GAME_WIDTH / 2, 220, 4);
    divider.fillCircle(GAME_WIDTH / 2 - 160, 220, 3);
    divider.fillCircle(GAME_WIDTH / 2 + 160, 220, 3);

    // Weapon icons decorative display
    this.drawDecorativeWeapons();

    // PLAY button
    const playBtn = this.add.graphics();
    playBtn.fillStyle(COLORS.DARK_GOLD);
    playBtn.fillRoundedRect(GAME_WIDTH / 2 - 110, 360, 220, 60, 8);
    playBtn.fillStyle(COLORS.GOLD);
    playBtn.fillRoundedRect(GAME_WIDTH / 2 - 108, 362, 216, 56, 6);
    playBtn.fillStyle(0xE8C000);
    playBtn.fillRoundedRect(GAME_WIDTH / 2 - 108, 362, 216, 28, 6);

    const playText = this.add.text(GAME_WIDTH / 2, 390, '⚔ PLAY ⚔', {
      fontSize: '30px',
      fontFamily: 'serif',
      color: '#1A0A00',
      stroke: '#5A3A00',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Make button interactive
    const hitArea = this.add.rectangle(GAME_WIDTH / 2, 390, 220, 60, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      playBtn.clear();
      playBtn.fillStyle(COLORS.GOLD);
      playBtn.fillRoundedRect(GAME_WIDTH / 2 - 110, 360, 220, 60, 8);
      playBtn.fillStyle(0xFFE840);
      playBtn.fillRoundedRect(GAME_WIDTH / 2 - 108, 362, 216, 56, 6);
      playBtn.fillStyle(0xFFEE66);
      playBtn.fillRoundedRect(GAME_WIDTH / 2 - 108, 362, 216, 28, 6);
      playText.setScale(1.05);
    });

    hitArea.on('pointerout', () => {
      playBtn.clear();
      playBtn.fillStyle(COLORS.DARK_GOLD);
      playBtn.fillRoundedRect(GAME_WIDTH / 2 - 110, 360, 220, 60, 8);
      playBtn.fillStyle(COLORS.GOLD);
      playBtn.fillRoundedRect(GAME_WIDTH / 2 - 108, 362, 216, 56, 6);
      playBtn.fillStyle(0xE8C000);
      playBtn.fillRoundedRect(GAME_WIDTH / 2 - 108, 362, 216, 28, 6);
      playText.setScale(1.0);
    });

    hitArea.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.HERO_SELECT);
    });

    // Hero preview icons
    this.drawHeroPreviews();

    // Version and credits
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 'v1.0 | Realm\'s Last Stand', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      color: '#888866',
    }).setOrigin(0.5);

    // Floating title animation
    this.tweens.add({
      targets: [title1, title2, titleShadow, titleShadow2],
      y: '+=6',
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private drawCastleSilhouette(g: Phaser.GameObjects.Graphics): void {
    const baseY = GAME_HEIGHT - 80;
    g.fillStyle(0x0A0508);

    // Ground
    g.fillRect(0, baseY, GAME_WIDTH, 80);

    // Castle towers
    const towers = [
      { x: 0, w: 80, h: 200, crenH: 20, crenW: 12 },
      { x: 70, w: 60, h: 160, crenH: 15, crenW: 10 },
      { x: GAME_WIDTH - 80, w: 80, h: 200, crenH: 20, crenW: 12 },
      { x: GAME_WIDTH - 130, w: 60, h: 160, crenH: 15, crenW: 10 },
    ];

    towers.forEach(tower => {
      g.fillRect(tower.x, baseY - tower.h, tower.w, tower.h);
      // Battlements
      for (let cx = tower.x; cx < tower.x + tower.w; cx += tower.crenW * 2) {
        g.fillRect(cx, baseY - tower.h - tower.crenH, tower.crenW, tower.crenH);
      }
      // Tower window
      g.fillStyle(0xFF8C00, 0.3);
      g.fillRect(tower.x + tower.w / 2 - 6, baseY - tower.h + 30, 12, 18);
      g.fillStyle(0x0A0508);
    });

    // Main castle wall
    g.fillStyle(0x0A0508);
    g.fillRect(80, baseY - 120, GAME_WIDTH - 160, 120);
    // Wall battlements
    for (let cx = 80; cx < GAME_WIDTH - 160; cx += 30) {
      g.fillRect(cx + 80, baseY - 135, 14, 20);
    }

    // Gate
    g.fillStyle(0x050205);
    g.fillRect(GAME_WIDTH / 2 - 30, baseY - 80, 60, 80);
    // Gate arch
    g.fillCircle(GAME_WIDTH / 2, baseY - 80, 30);

    // Torches
    g.fillStyle(COLORS.ORANGE, 0.9);
    g.fillRect(GAME_WIDTH / 2 - 50, baseY - 100, 6, 14);
    g.fillRect(GAME_WIDTH / 2 + 44, baseY - 100, 6, 14);
    g.fillStyle(COLORS.YELLOW, 0.8);
    g.fillCircle(GAME_WIDTH / 2 - 47, baseY - 102, 5);
    g.fillCircle(GAME_WIDTH / 2 + 47, baseY - 102, 5);

    // Moon
    g.fillStyle(0xF0E68C);
    g.fillCircle(60, 80, 30);
    g.fillStyle(0x0A0020);
    g.fillCircle(50, 72, 25);
  }

  private drawDecorativeWeapons(): void {
    const g = this.add.graphics();
    const y = 280;
    const cx = GAME_WIDTH / 2;

    // Sword left
    g.fillStyle(COLORS.SILVER);
    g.fillRect(cx - 80, y, 4, 50);
    g.fillRect(cx - 90, y + 12, 24, 5);
    g.fillTriangle(cx - 80, y, cx - 76, y, cx - 78, y - 12);
    g.fillStyle(COLORS.BROWN);
    g.fillRect(cx - 81, y + 36, 6, 16);

    // Staff right
    g.fillStyle(COLORS.BROWN);
    g.fillRect(cx + 76, y - 10, 5, 60);
    g.fillStyle(COLORS.PURPLE);
    g.fillCircle(cx + 78, y - 10, 8);
    g.fillStyle(COLORS.CYAN);
    g.fillCircle(cx + 78, y - 10, 4);

    // Cross center
    g.fillStyle(COLORS.GOLD);
    g.fillRect(cx - 3, y + 5, 6, 40);
    g.fillRect(cx - 15, y + 15, 30, 6);
    g.fillCircle(cx, y + 5, 5);
  }

  private drawHeroPreviews(): void {
    const g = this.add.graphics();
    const y = 470;
    const heroes = [
      { x: GAME_WIDTH / 2 - 150, color: COLORS.STONE_GRAY, label: 'Knight', labelColor: '#CCCCCC' },
      { x: GAME_WIDTH / 2 - 50, color: COLORS.BROWN, label: 'Archer', labelColor: '#CD853F' },
      { x: GAME_WIDTH / 2 + 50, color: COLORS.PURPLE, label: 'Mage', labelColor: '#DA70D6' },
      { x: GAME_WIDTH / 2 + 150, color: 0x222222, label: 'Rogue', labelColor: '#888888' },
    ];

    heroes.forEach(hero => {
      // Card bg
      g.fillStyle(COLORS.DARK_STONE, 0.8);
      g.fillRoundedRect(hero.x - 30, y - 5, 60, 70, 4);
      g.lineStyle(1, COLORS.GOLD, 0.6);
      g.strokeRoundedRect(hero.x - 30, y - 5, 60, 70, 4);

      // Mini hero figure
      g.fillStyle(hero.color);
      g.fillRect(hero.x - 10, y, 20, 28);
      g.fillCircle(hero.x, y, 10);

      // Label
      this.add.text(hero.x, y + 42, hero.label, {
        fontSize: '11px',
        fontFamily: 'serif',
        color: hero.labelColor,
      }).setOrigin(0.5);
    });

    this.add.text(GAME_WIDTH / 2, y - 20, 'Choose your hero:', {
      fontSize: '15px',
      fontFamily: 'serif',
      color: '#F4E4BC',
    }).setOrigin(0.5);
  }
}
