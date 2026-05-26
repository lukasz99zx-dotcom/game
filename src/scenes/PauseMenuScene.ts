import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.PAUSE });
  }

  create(): void {
    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Panel background - parchment style
    const panelW = 280, panelH = 340;
    const panelX = GAME_WIDTH / 2 - panelW / 2;
    const panelY = GAME_HEIGHT / 2 - panelH / 2 - 40;

    const panel = this.add.graphics();
    panel.fillStyle(0x1A0F00);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 10);
    panel.lineStyle(3, COLORS.GOLD);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 10);
    panel.lineStyle(1, COLORS.DARK_GOLD);
    panel.strokeRoundedRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8, 8);

    // Title
    this.add.text(GAME_WIDTH / 2, panelY + 40, 'PAUSED', {
      fontSize: '32px',
      fontFamily: 'Georgia, serif',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(2, COLORS.DARK_GOLD);
    line.beginPath();
    line.moveTo(panelX + 20, panelY + 65);
    line.lineTo(panelX + panelW - 20, panelY + 65);
    line.strokePath();

    const btnY = [panelY + 110, panelY + 180, panelY + 250, panelY + 310];
    const btnLabels = ['RESUME', 'RESTART', 'MAIN MENU', 'QUIT'];
    const btnColors = [COLORS.GOLD, 0x4488FF, 0x44AA44, COLORS.BLOOD_RED];

    btnLabels.forEach((label, i) => {
      this.createButton(GAME_WIDTH / 2, btnY[i], 220, 48, label, btnColors[i], i);
    });

    // ESC key to resume
    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
  }

  private createButton(cx: number, cy: number, w: number, h: number, label: string, color: number, index: number): void {
    const bg = this.add.graphics();

    const draw = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? color : 0x0A0800, 0.9);
      bg.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 6);
      bg.lineStyle(2, color);
      bg.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 6);
    };
    draw(false);

    this.add.text(cx, cy, label, {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10);

    const zone = this.add.zone(cx, cy, w, h).setInteractive();
    zone.on('pointerover', () => draw(true));
    zone.on('pointerout', () => draw(false));
    zone.on('pointerdown', () => this.handleButton(index));
  }

  private handleButton(index: number): void {
    switch (index) {
      case 0: this.resumeGame(); break;
      case 1: this.restartGame(); break;
      case 2: this.mainMenu(); break;
      case 3: this.quitGame(); break;
    }
  }

  private resumeGame(): void {
    this.scene.resume(SCENE_KEYS.GAME);
    this.scene.stop();
  }

  private restartGame(): void {
    this.scene.stop(SCENE_KEYS.GAME);
    this.scene.stop();
    this.scene.start(SCENE_KEYS.HERO_SELECT);
  }

  private mainMenu(): void {
    this.scene.stop(SCENE_KEYS.GAME);
    this.scene.stop();
    this.scene.start(SCENE_KEYS.MENU);
  }

  private quitGame(): void {
    // On Android/web just go to menu
    this.mainMenu();
  }
}
