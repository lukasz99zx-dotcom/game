import Phaser from 'phaser';
import { SCENE_KEYS, COLORS } from '../constants';
import {
  renderPixelArt,
  P_KNIGHT, KNIGHT_FRAME0, KNIGHT_FRAME1,
  P_ARCHER, ARCHER_FRAME0, ARCHER_FRAME1,
  P_MAGE, MAGE_FRAME0, MAGE_FRAME1,
  P_ROGUE, ROGUE_FRAME0, ROGUE_FRAME1,
  P_WOLF, WOLF_FRAME0, WOLF_FRAME1,
  P_SKELETON, SKELETON_FRAME0, SKELETON_FRAME1,
  P_ZOMBIE, ZOMBIE_FRAME0, ZOMBIE_FRAME1,
  P_GOBLIN, GOBLIN_FRAME0, GOBLIN_FRAME1,
  P_NECROMANCER, NECROMANCER_FRAME0, NECROMANCER_FRAME1,
  P_DEMON, DEMON_FRAME0, DEMON_FRAME1,
  P_VAMPIRE, VAMPIRE_FRAME0, VAMPIRE_FRAME1,
  P_BOSS_OGRE, OGRE_FRAME0, OGRE_FRAME1,
  P_BOSS_BLACK_KNIGHT, BLACK_KNIGHT_FRAME0, BLACK_KNIGHT_FRAME1,
  P_BOSS_ARCLICH, ARCLICH_FRAME0, ARCLICH_FRAME1,
  P_BOSS_DRAGON, DRAGON_FRAME0, DRAGON_FRAME1,
} from '../utils/PixelArt';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    // No external assets - everything is procedurally generated
  }

  create(): void {
    this.generateTextures();
    this.registerAnimations();
    this.scene.start(SCENE_KEYS.MENU);
  }

  private generateTextures(): void {
    this.generateHeroTextures();
    this.generateEnemyTextures();
    this.generateBossTextures();
    this.generateProjectileTextures();
    this.generatePickupTextures();
    this.generateUITextures();
    this.generateParticleTextures();
  }

  // ── Hero Textures ────────────────────────────────────────────────────────

  private generateHeroTextures(): void {
    this.makePixelTexture('knight_0', KNIGHT_FRAME0, P_KNIGHT, 2, 32, 32);
    this.makePixelTexture('knight_1', KNIGHT_FRAME1, P_KNIGHT, 2, 32, 32);
    // Also generate the plain 'knight' key for backward compat (HeroSelectScene)
    this.makePixelTexture('knight', KNIGHT_FRAME0, P_KNIGHT, 2, 32, 32);

    this.makePixelTexture('archer_0', ARCHER_FRAME0, P_ARCHER, 2, 32, 32);
    this.makePixelTexture('archer_1', ARCHER_FRAME1, P_ARCHER, 2, 32, 32);
    this.makePixelTexture('archer', ARCHER_FRAME0, P_ARCHER, 2, 32, 32);

    this.makePixelTexture('mage_0', MAGE_FRAME0, P_MAGE, 2, 32, 32);
    this.makePixelTexture('mage_1', MAGE_FRAME1, P_MAGE, 2, 32, 32);
    this.makePixelTexture('mage', MAGE_FRAME0, P_MAGE, 2, 32, 32);

    this.makePixelTexture('rogue_0', ROGUE_FRAME0, P_ROGUE, 2, 32, 32);
    this.makePixelTexture('rogue_1', ROGUE_FRAME1, P_ROGUE, 2, 32, 32);
    this.makePixelTexture('rogue', ROGUE_FRAME0, P_ROGUE, 2, 32, 32);
  }

  // ── Enemy Textures ────────────────────────────────────────────────────────

  private generateEnemyTextures(): void {
    this.makePixelTexture('wolf_0', WOLF_FRAME0, P_WOLF, 2, 32, 32);
    this.makePixelTexture('wolf_1', WOLF_FRAME1, P_WOLF, 2, 32, 32);
    this.makePixelTexture('wolf', WOLF_FRAME0, P_WOLF, 2, 32, 32);

    this.makePixelTexture('skeleton_0', SKELETON_FRAME0, P_SKELETON, 2, 32, 32);
    this.makePixelTexture('skeleton_1', SKELETON_FRAME1, P_SKELETON, 2, 32, 32);
    this.makePixelTexture('skeleton', SKELETON_FRAME0, P_SKELETON, 2, 32, 32);

    this.makePixelTexture('zombie_0', ZOMBIE_FRAME0, P_ZOMBIE, 2, 32, 32);
    this.makePixelTexture('zombie_1', ZOMBIE_FRAME1, P_ZOMBIE, 2, 32, 32);
    this.makePixelTexture('zombie', ZOMBIE_FRAME0, P_ZOMBIE, 2, 32, 32);

    this.makePixelTexture('goblin_0', GOBLIN_FRAME0, P_GOBLIN, 2, 32, 32);
    this.makePixelTexture('goblin_1', GOBLIN_FRAME1, P_GOBLIN, 2, 32, 32);
    this.makePixelTexture('goblin', GOBLIN_FRAME0, P_GOBLIN, 2, 32, 32);

    this.makePixelTexture('necromancer_0', NECROMANCER_FRAME0, P_NECROMANCER, 2, 32, 32);
    this.makePixelTexture('necromancer_1', NECROMANCER_FRAME1, P_NECROMANCER, 2, 32, 32);
    this.makePixelTexture('necromancer', NECROMANCER_FRAME0, P_NECROMANCER, 2, 32, 32);

    this.makePixelTexture('demon_0', DEMON_FRAME0, P_DEMON, 2, 32, 32);
    this.makePixelTexture('demon_1', DEMON_FRAME1, P_DEMON, 2, 32, 32);
    this.makePixelTexture('demon', DEMON_FRAME0, P_DEMON, 2, 32, 32);

    this.makePixelTexture('vampire_0', VAMPIRE_FRAME0, P_VAMPIRE, 2, 32, 32);
    this.makePixelTexture('vampire_1', VAMPIRE_FRAME1, P_VAMPIRE, 2, 32, 32);
    this.makePixelTexture('vampire', VAMPIRE_FRAME0, P_VAMPIRE, 2, 32, 32);
  }

  // ── Boss Textures ─────────────────────────────────────────────────────────

  private generateBossTextures(): void {
    // Boss art is 21 rows × 16 cols, rendered at scale=3 → 48×63
    // We use 64×64 canvas to keep it consistent
    this.makeBossPixelTexture('ogre_warlord_0', OGRE_FRAME0, P_BOSS_OGRE, 3);
    this.makeBossPixelTexture('ogre_warlord_1', OGRE_FRAME1, P_BOSS_OGRE, 3);
    this.makeBossPixelTexture('ogre_warlord', OGRE_FRAME0, P_BOSS_OGRE, 3);

    this.makeBossPixelTexture('black_knight_0', BLACK_KNIGHT_FRAME0, P_BOSS_BLACK_KNIGHT, 3);
    this.makeBossPixelTexture('black_knight_1', BLACK_KNIGHT_FRAME1, P_BOSS_BLACK_KNIGHT, 3);
    this.makeBossPixelTexture('black_knight', BLACK_KNIGHT_FRAME0, P_BOSS_BLACK_KNIGHT, 3);

    this.makeBossPixelTexture('arclich_0', ARCLICH_FRAME0, P_BOSS_ARCLICH, 3);
    this.makeBossPixelTexture('arclich_1', ARCLICH_FRAME1, P_BOSS_ARCLICH, 3);
    this.makeBossPixelTexture('arclich', ARCLICH_FRAME0, P_BOSS_ARCLICH, 3);

    this.makeBossPixelTexture('chaos_dragon_0', DRAGON_FRAME0, P_BOSS_DRAGON, 3);
    this.makeBossPixelTexture('chaos_dragon_1', DRAGON_FRAME1, P_BOSS_DRAGON, 3);
    this.makeBossPixelTexture('chaos_dragon', DRAGON_FRAME0, P_BOSS_DRAGON, 3);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private makePixelTexture(
    key: string,
    rows: string[],
    palette: Record<string, number | null>,
    scale: number,
    w: number,
    h: number
  ): void {
    const g = this.make.graphics({ x: 0, y: 0 } as any);
    renderPixelArt(g, rows, palette, scale);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private makeBossPixelTexture(
    key: string,
    rows: string[],
    palette: Record<string, number | null>,
    scale: number
  ): void {
    const cols = rows[0]?.length ?? 16;
    const w = cols * scale;
    const h = rows.length * scale;
    const g = this.make.graphics({ x: 0, y: 0 } as any);
    renderPixelArt(g, rows, palette, scale);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // ── Projectile Textures ────────────────────────────────────────────────────

  private generateProjectileTextures(): void {
    // Arrow
    const arrow = this.make.graphics({ x: 0, y: 0 } as any);
    arrow.fillStyle(COLORS.BROWN);
    arrow.fillRect(0, 3, 20, 2);
    arrow.fillTriangle(16, 0, 24, 4, 16, 8);
    arrow.fillStyle(0x444444);
    arrow.fillRect(0, 3, 4, 2);
    arrow.generateTexture('arrow', 24, 8);
    arrow.destroy();

    // Fireball
    const fireball = this.make.graphics({ x: 0, y: 0 } as any);
    fireball.fillStyle(0xFF4400, 0.4);
    fireball.fillCircle(12, 12, 12);
    fireball.fillStyle(COLORS.ORANGE, 0.7);
    fireball.fillCircle(12, 12, 8);
    fireball.fillStyle(COLORS.YELLOW);
    fireball.fillCircle(12, 12, 4);
    fireball.generateTexture('fireball', 24, 24);
    fireball.destroy();

    // Lightning bolt
    const lightning = this.make.graphics({ x: 0, y: 0 } as any);
    lightning.fillStyle(COLORS.YELLOW);
    lightning.fillRect(8, 0, 4, 8);
    lightning.fillRect(2, 6, 10, 4);
    lightning.fillRect(6, 10, 4, 8);
    lightning.fillStyle(0xFFFFAA);
    lightning.fillRect(9, 1, 2, 6);
    lightning.generateTexture('lightning_bolt', 16, 20);
    lightning.destroy();

    // Chain lightning effect
    const chainLightning = this.make.graphics({ x: 0, y: 0 } as any);
    chainLightning.fillStyle(0x88FFFF);
    chainLightning.fillRect(0, 3, 4, 2);
    chainLightning.fillRect(3, 1, 4, 2);
    chainLightning.fillRect(6, 3, 4, 2);
    chainLightning.fillRect(9, 1, 4, 2);
    chainLightning.fillRect(12, 3, 4, 2);
    chainLightning.generateTexture('chain_lightning', 16, 8);
    chainLightning.destroy();

    // Holy cross orb
    const holyCross = this.make.graphics({ x: 0, y: 0 } as any);
    holyCross.fillStyle(0xFFDD44, 0.8);
    holyCross.fillCircle(10, 10, 10);
    holyCross.fillStyle(0xFFFFFF);
    holyCross.fillRect(6, 4, 8, 12);
    holyCross.fillRect(2, 8, 16, 4);
    holyCross.generateTexture('holy_cross', 20, 20);
    holyCross.destroy();

    // Sword slash effect
    const swordSlash = this.make.graphics({ x: 0, y: 0 } as any);
    swordSlash.fillStyle(COLORS.SILVER, 0.8);
    swordSlash.fillCircle(40, 40, 38);
    swordSlash.fillStyle(COLORS.WHITE, 0.4);
    swordSlash.fillCircle(40, 40, 30);
    swordSlash.generateTexture('sword_slash', 80, 80);
    swordSlash.destroy();

    // Dagger
    const dagger = this.make.graphics({ x: 0, y: 0 } as any);
    dagger.fillStyle(COLORS.SILVER);
    dagger.fillRect(2, 5, 14, 2);
    dagger.fillTriangle(14, 3, 20, 6, 14, 9);
    dagger.fillStyle(COLORS.BROWN);
    dagger.fillRect(0, 4, 4, 4);
    dagger.generateTexture('dagger', 20, 12);
    dagger.destroy();

    // Goblin arrow (smaller)
    const goblinArrow = this.make.graphics({ x: 0, y: 0 } as any);
    goblinArrow.fillStyle(0x444422);
    goblinArrow.fillRect(0, 2, 14, 2);
    goblinArrow.fillTriangle(10, 0, 16, 3, 10, 6);
    goblinArrow.generateTexture('goblin_arrow', 16, 6);
    goblinArrow.destroy();

    // Necromancer spell
    const necroSpell = this.make.graphics({ x: 0, y: 0 } as any);
    necroSpell.fillStyle(0x9400D3, 0.5);
    necroSpell.fillCircle(10, 10, 10);
    necroSpell.fillStyle(0xCC44FF);
    necroSpell.fillCircle(10, 10, 6);
    necroSpell.fillStyle(COLORS.WHITE);
    necroSpell.fillCircle(10, 10, 2);
    necroSpell.generateTexture('necro_spell', 20, 20);
    necroSpell.destroy();
  }

  // ── Pickup Textures ────────────────────────────────────────────────────────

  private generatePickupTextures(): void {
    // XP crystal - cyan diamond
    const xpCrystal = this.make.graphics({ x: 0, y: 0 } as any);
    xpCrystal.fillStyle(COLORS.CYAN, 0.9);
    xpCrystal.fillTriangle(6, 0, 12, 6, 6, 12);
    xpCrystal.fillTriangle(0, 6, 6, 0, 6, 12);
    xpCrystal.fillStyle(0x88FFFF);
    xpCrystal.fillTriangle(5, 2, 9, 5, 5, 8);
    xpCrystal.generateTexture('xp_crystal', 12, 12);
    xpCrystal.destroy();

    // Gold coin - yellow circle
    const gold = this.make.graphics({ x: 0, y: 0 } as any);
    gold.fillStyle(COLORS.GOLD);
    gold.fillCircle(6, 6, 6);
    gold.fillStyle(COLORS.DARK_GOLD);
    gold.fillCircle(6, 6, 4);
    gold.fillStyle(COLORS.GOLD);
    gold.fillRect(5, 3, 2, 6);
    gold.generateTexture('gold_coin', 12, 12);
    gold.destroy();
  }

  // ── UI Textures ────────────────────────────────────────────────────────────

  private generateUITextures(): void {
    // Heart for HP
    const heart = this.make.graphics({ x: 0, y: 0 } as any);
    heart.fillStyle(COLORS.BLOOD_RED);
    heart.fillCircle(5, 5, 5);
    heart.fillCircle(11, 5, 5);
    heart.fillTriangle(0, 7, 16, 7, 8, 16);
    heart.generateTexture('heart', 16, 16);
    heart.destroy();

    // Empty heart
    const emptyHeart = this.make.graphics({ x: 0, y: 0 } as any);
    emptyHeart.lineStyle(2, COLORS.BLOOD_RED);
    emptyHeart.strokeCircle(5, 5, 5);
    emptyHeart.strokeCircle(11, 5, 5);
    emptyHeart.strokeTriangle(0, 7, 16, 7, 8, 16);
    emptyHeart.generateTexture('heart_empty', 16, 16);
    emptyHeart.destroy();

    // Weapon slot icon background
    const weaponSlot = this.make.graphics({ x: 0, y: 0 } as any);
    weaponSlot.fillStyle(COLORS.DARK_STONE);
    weaponSlot.fillRect(0, 0, 40, 40);
    weaponSlot.lineStyle(2, COLORS.GOLD);
    weaponSlot.strokeRect(0, 0, 40, 40);
    weaponSlot.generateTexture('weapon_slot', 40, 40);
    weaponSlot.destroy();

    // Button texture
    const button = this.make.graphics({ x: 0, y: 0 } as any);
    button.fillStyle(COLORS.DARK_GOLD);
    button.fillRect(0, 0, 200, 60);
    button.fillStyle(COLORS.GOLD);
    button.fillRect(2, 2, 196, 56);
    button.fillStyle(COLORS.DARK_GOLD);
    button.fillRect(4, 4, 192, 52);
    button.generateTexture('button_bg', 200, 60);
    button.destroy();

    // Particle texture
    const particle = this.make.graphics({ x: 0, y: 0 } as any);
    particle.fillStyle(COLORS.WHITE);
    particle.fillCircle(4, 4, 4);
    particle.generateTexture('particle', 8, 8);
    particle.destroy();
  }

  // ── Particle Textures ──────────────────────────────────────────────────────

  private generateParticleTextures(): void {
    // Blood particle - red circle 6px
    const blood = this.make.graphics({ x: 0, y: 0 } as any);
    blood.fillStyle(0xCC0000);
    blood.fillCircle(3, 3, 3);
    blood.generateTexture('particle_blood', 6, 6);
    blood.destroy();

    // XP particle - cyan dot 4px
    const xpDot = this.make.graphics({ x: 0, y: 0 } as any);
    xpDot.fillStyle(0x00FFFF);
    xpDot.fillCircle(2, 2, 2);
    xpDot.generateTexture('particle_xp', 4, 4);
    xpDot.destroy();
  }

  // ── Animation Registration ─────────────────────────────────────────────────

  private registerAnimations(): void {
    const heroes = ['knight', 'archer', 'mage', 'rogue'];
    for (const h of heroes) {
      this.anims.create({
        key: `${h}_walk`,
        frames: [{ key: `${h}_0` }, { key: `${h}_1` }],
        frameRate: 6,
        repeat: -1,
      });
      this.anims.create({
        key: `${h}_idle`,
        frames: [{ key: `${h}_0` }],
        frameRate: 1,
        repeat: -1,
      });
    }

    const enemies = ['wolf', 'skeleton', 'zombie', 'goblin', 'necromancer', 'demon', 'vampire'];
    for (const e of enemies) {
      this.anims.create({
        key: `${e}_walk`,
        frames: [{ key: `${e}_0` }, { key: `${e}_1` }],
        frameRate: 5,
        repeat: -1,
      });
    }

    const bosses = ['ogre_warlord', 'black_knight', 'arclich', 'chaos_dragon'];
    for (const b of bosses) {
      this.anims.create({
        key: `${b}_walk`,
        frames: [{ key: `${b}_0` }, { key: `${b}_1` }],
        frameRate: 4,
        repeat: -1,
      });
    }
  }
}
