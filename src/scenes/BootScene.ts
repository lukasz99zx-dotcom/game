import Phaser from 'phaser';
import { SCENE_KEYS, COLORS } from '../constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  preload(): void {
    // No external assets - everything is procedurally generated
  }

  create(): void {
    // Generate all procedural textures
    this.generateTextures();
    // Go straight to menu
    this.scene.start(SCENE_KEYS.MENU);
  }

  private generateTextures(): void {
    this.generatePlayerTextures();
    this.generateEnemyTextures();
    this.generateProjectileTextures();
    this.generatePickupTextures();
    this.generateUITextures();
  }

  private generatePlayerTextures(): void {
    // Knight - gray rectangle body with cross
    const knight = this.make.graphics({ x: 0, y: 0 } as any);
    knight.fillStyle(COLORS.STONE_GRAY);
    knight.fillRect(4, 4, 24, 28);
    knight.fillStyle(COLORS.DARK_STONE);
    knight.fillRect(6, 6, 20, 4); // helmet
    knight.fillStyle(COLORS.SILVER);
    knight.fillRect(10, 14, 12, 3); // cross horizontal
    knight.fillRect(14, 10, 4, 14); // cross vertical
    knight.fillStyle(COLORS.LIGHT_GRAY);
    knight.fillRect(4, 28, 10, 4); // left leg
    knight.fillRect(18, 28, 10, 4); // right leg
    knight.generateTexture('knight', 32, 32);
    knight.destroy();

    // Archer - brown body with bow
    const archer = this.make.graphics({ x: 0, y: 0 } as any);
    archer.fillStyle(COLORS.BROWN);
    archer.fillRect(8, 6, 16, 22);
    archer.fillStyle(COLORS.DARK_BROWN);
    archer.fillRect(8, 6, 16, 4); // hood
    archer.fillStyle(COLORS.GOLD);
    // bow shape
    archer.lineStyle(2, COLORS.DARK_BROWN);
    archer.strokeCircle(4, 16, 10);
    archer.fillStyle(COLORS.BROWN);
    archer.fillRect(2, 14, 4, 4);
    archer.fillStyle(COLORS.LIGHT_GRAY);
    archer.fillRect(8, 28, 6, 4);
    archer.fillRect(18, 28, 6, 4);
    archer.generateTexture('archer', 32, 32);
    archer.destroy();

    // Mage - purple robe with star
    const mage = this.make.graphics({ x: 0, y: 0 } as any);
    mage.fillStyle(COLORS.PURPLE);
    mage.fillRect(8, 8, 16, 22);
    mage.fillStyle(COLORS.DARK_PURPLE);
    mage.fillTriangle(8, 8, 24, 8, 16, 0); // hat
    mage.fillStyle(COLORS.GOLD);
    // star on chest
    mage.fillTriangle(12, 14, 20, 14, 16, 10);
    mage.fillTriangle(12, 17, 20, 17, 16, 21);
    mage.fillStyle(0xDDA0DD);
    mage.fillRect(9, 28, 5, 4);
    mage.fillRect(18, 28, 5, 4);
    mage.generateTexture('mage', 32, 32);
    mage.destroy();

    // Rogue - dark body with hood
    const rogue = this.make.graphics({ x: 0, y: 0 } as any);
    rogue.fillStyle(0x222222);
    rogue.fillRect(8, 8, 16, 22);
    rogue.fillStyle(0x111111);
    rogue.fillTriangle(6, 8, 26, 8, 16, 0); // hood
    rogue.fillRect(6, 8, 20, 6);
    rogue.fillStyle(COLORS.BLOOD_RED);
    // eye
    rogue.fillRect(11, 10, 3, 2);
    rogue.fillRect(18, 10, 3, 2);
    rogue.fillStyle(0x333333);
    rogue.fillRect(8, 28, 6, 4);
    rogue.fillRect(18, 28, 6, 4);
    rogue.generateTexture('rogue', 32, 32);
    rogue.destroy();
  }

  private generateEnemyTextures(): void {
    // Wolf - brown quadruped
    const wolf = this.make.graphics({ x: 0, y: 0 } as any);
    wolf.fillStyle(0x8B7355);
    wolf.fillRect(4, 12, 24, 14); // body
    wolf.fillRect(20, 6, 10, 10); // head
    wolf.fillStyle(0x6B5335);
    wolf.fillRect(6, 24, 4, 6); // back legs
    wolf.fillRect(14, 24, 4, 6);
    wolf.fillRect(20, 24, 4, 6);
    wolf.fillStyle(COLORS.RED);
    wolf.fillRect(27, 10, 3, 2); // eye
    wolf.generateTexture('wolf', 32, 32);
    wolf.destroy();

    // Skeleton - white stick figure
    const skeleton = this.make.graphics({ x: 0, y: 0 } as any);
    skeleton.fillStyle(0xF5F5DC); // bone white
    skeleton.fillCircle(16, 6, 6); // skull
    skeleton.fillRect(13, 11, 6, 12); // spine
    skeleton.fillRect(6, 13, 20, 3); // ribs
    skeleton.fillRect(7, 23, 4, 8); // left leg
    skeleton.fillRect(21, 23, 4, 8); // right leg
    skeleton.fillRect(3, 13, 6, 3); // left arm
    skeleton.fillRect(23, 13, 6, 3); // right arm
    skeleton.fillStyle(COLORS.RED);
    skeleton.fillRect(13, 5, 2, 2); // eye left
    skeleton.fillRect(17, 5, 2, 2); // eye right
    skeleton.generateTexture('skeleton', 32, 32);
    skeleton.destroy();

    // Zombie - green bloated humanoid
    const zombie = this.make.graphics({ x: 0, y: 0 } as any);
    zombie.fillStyle(0x5A8A5A);
    zombie.fillCircle(16, 8, 7); // head
    zombie.fillRect(8, 14, 16, 14); // torso (bloated)
    zombie.fillStyle(0x3A6A3A);
    zombie.fillRect(4, 14, 6, 12); // left arm
    zombie.fillRect(22, 14, 6, 12); // right arm
    zombie.fillRect(9, 27, 5, 6); // left leg
    zombie.fillRect(18, 27, 5, 6); // right leg
    zombie.fillStyle(COLORS.RED);
    zombie.fillRect(13, 6, 2, 2);
    zombie.fillRect(17, 6, 2, 2);
    zombie.generateTexture('zombie', 32, 32);
    zombie.destroy();

    // Goblin - small green figure
    const goblin = this.make.graphics({ x: 0, y: 0 } as any);
    goblin.fillStyle(0x3CB371);
    goblin.fillCircle(16, 9, 8); // large head
    goblin.fillRect(10, 16, 12, 10); // small body
    goblin.fillStyle(0x2E8B57);
    goblin.fillRect(6, 16, 6, 8); // left arm
    goblin.fillRect(20, 16, 6, 8); // right arm
    goblin.fillRect(10, 26, 4, 6); // left leg
    goblin.fillRect(18, 26, 4, 6); // right leg
    goblin.fillStyle(COLORS.YELLOW);
    goblin.fillRect(12, 7, 3, 3); // eye
    goblin.fillRect(17, 7, 3, 3);
    goblin.generateTexture('goblin', 32, 32);
    goblin.destroy();

    // Necromancer - dark robed figure
    const necro = this.make.graphics({ x: 0, y: 0 } as any);
    necro.fillStyle(0x1A001A);
    necro.fillRect(8, 8, 16, 24);
    necro.fillTriangle(8, 8, 24, 8, 16, 0);
    necro.fillStyle(0x4B0082);
    necro.fillRect(10, 12, 12, 16);
    necro.fillStyle(COLORS.CYAN);
    necro.fillRect(12, 10, 3, 3); // eye
    necro.fillRect(17, 10, 3, 3);
    necro.fillStyle(0x9400D3);
    necro.fillRect(4, 14, 6, 3); // left arm
    necro.fillRect(22, 14, 6, 3); // right arm
    necro.generateTexture('necromancer', 32, 32);
    necro.destroy();

    // Demon - red menacing figure
    const demon = this.make.graphics({ x: 0, y: 0 } as any);
    demon.fillStyle(0xCC2200);
    demon.fillCircle(16, 8, 7);
    demon.fillRect(8, 14, 16, 14);
    demon.fillStyle(0xFF4400);
    demon.fillTriangle(12, 0, 16, 6, 14, 0); // left horn
    demon.fillTriangle(20, 0, 16, 6, 18, 0); // right horn
    demon.fillStyle(0x880000);
    demon.fillRect(4, 14, 6, 14); // left arm
    demon.fillRect(22, 14, 6, 14); // right arm
    demon.fillRect(9, 27, 5, 5); // legs
    demon.fillRect(18, 27, 5, 5);
    demon.fillStyle(COLORS.YELLOW);
    demon.fillRect(13, 6, 3, 3);
    demon.fillRect(17, 6, 3, 3);
    demon.generateTexture('demon', 32, 32);
    demon.destroy();

    // Vampire - elegant dark figure
    const vampire = this.make.graphics({ x: 0, y: 0 } as any);
    vampire.fillStyle(0x2A0A2A);
    vampire.fillCircle(16, 7, 6);
    vampire.fillRect(8, 12, 16, 18);
    vampire.fillStyle(0xCC0066);
    vampire.fillRect(8, 12, 16, 4); // cape collar
    vampire.fillStyle(0x4A0A4A);
    vampire.fillRect(4, 14, 6, 16); // cape left
    vampire.fillRect(22, 14, 6, 16); // cape right
    vampire.fillStyle(COLORS.RED);
    vampire.fillRect(12, 5, 2, 2);
    vampire.fillRect(18, 5, 2, 2);
    vampire.fillStyle(0xFFFFFF);
    vampire.fillRect(14, 10, 4, 2); // fangs
    vampire.generateTexture('vampire', 32, 32);
    vampire.destroy();

    // Bosses - larger sprites (64x64)
    this.generateBossTextures();
  }

  private generateBossTextures(): void {
    // Ogre Warlord - huge armored brute (64x64)
    const ogre = this.make.graphics({ x: 0, y: 0 } as any);
    ogre.fillStyle(0x8B6914);
    ogre.fillCircle(32, 16, 14); // head
    ogre.fillRect(8, 28, 48, 32); // massive body
    ogre.fillStyle(0x6B4E14);
    ogre.fillRect(2, 28, 14, 28); // left arm
    ogre.fillRect(48, 28, 14, 28); // right arm
    ogre.fillRect(10, 56, 14, 10); // left leg
    ogre.fillRect(40, 56, 14, 10); // right leg
    ogre.fillStyle(COLORS.STONE_GRAY);
    ogre.fillRect(10, 28, 44, 8); // armor
    ogre.fillRect(0, 24, 64, 6); // shoulder pads
    ogre.fillStyle(COLORS.RED);
    ogre.fillRect(24, 12, 5, 5); // eye
    ogre.fillRect(35, 12, 5, 5);
    ogre.fillStyle(COLORS.GOLD);
    ogre.fillRect(20, 28, 24, 6); // belt
    ogre.generateTexture('ogre_warlord', 64, 64);
    ogre.destroy();

    // Black Knight - armored dark knight (64x64)
    const blackKnight = this.make.graphics({ x: 0, y: 0 } as any);
    blackKnight.fillStyle(0x111111);
    blackKnight.fillRect(16, 0, 32, 10); // helmet top
    blackKnight.fillRect(12, 8, 40, 16); // helmet
    blackKnight.fillRect(14, 22, 36, 30); // torso
    blackKnight.fillStyle(0x333333);
    blackKnight.fillRect(2, 22, 14, 28); // left arm
    blackKnight.fillRect(48, 22, 14, 28); // right arm
    blackKnight.fillRect(14, 50, 14, 14); // left leg
    blackKnight.fillRect(36, 50, 14, 14); // right leg
    blackKnight.fillStyle(COLORS.BLOOD_RED);
    blackKnight.fillRect(20, 12, 6, 4); // visor slit
    blackKnight.fillRect(38, 12, 6, 4);
    blackKnight.fillStyle(COLORS.GOLD);
    blackKnight.fillRect(18, 22, 28, 4); // pauldron
    blackKnight.fillRect(0, 22, 14, 4);
    blackKnight.fillRect(50, 22, 14, 4);
    // sword
    blackKnight.fillStyle(COLORS.SILVER);
    blackKnight.fillRect(54, 10, 4, 42);
    blackKnight.fillRect(46, 26, 20, 4);
    blackKnight.generateTexture('black_knight', 64, 64);
    blackKnight.destroy();

    // Arclich - undead spellcaster (64x64)
    const arclich = this.make.graphics({ x: 0, y: 0 } as any);
    arclich.fillStyle(0xF5F5DC);
    arclich.fillCircle(32, 14, 12); // skull
    arclich.fillStyle(0x1A001A);
    arclich.fillRect(12, 24, 40, 32); // robe
    arclich.fillStyle(0x4B0082);
    arclich.fillRect(14, 26, 36, 28);
    arclich.fillStyle(0xF5F5DC);
    arclich.fillRect(2, 26, 12, 26); // arm bones
    arclich.fillRect(50, 26, 12, 26);
    arclich.fillStyle(COLORS.CYAN);
    arclich.fillRect(26, 10, 5, 5); // eye sockets glowing
    arclich.fillRect(33, 10, 5, 5);
    arclich.fillStyle(COLORS.GOLD);
    arclich.fillTriangle(20, 2, 32, 12, 28, 2); // crown
    arclich.fillTriangle(32, 12, 44, 2, 36, 2);
    arclich.fillTriangle(26, 0, 32, 8, 38, 0);
    arclich.generateTexture('arclich', 64, 64);
    arclich.destroy();

    // Chaos Dragon - massive flying beast (64x64)
    const dragon = this.make.graphics({ x: 0, y: 0 } as any);
    dragon.fillStyle(0x8B0000);
    dragon.fillCircle(44, 18, 18); // head
    dragon.fillRect(8, 22, 48, 28); // body
    dragon.fillStyle(0xCC0000);
    dragon.fillTriangle(0, 16, 20, 24, 8, 4); // wing left
    dragon.fillTriangle(44, 4, 64, 16, 56, 28); // wing right
    dragon.fillStyle(0xFF4400);
    dragon.fillTriangle(20, 4, 44, 8, 36, 0); // dorsal spikes
    dragon.fillTriangle(28, 2, 44, 6, 40, 0);
    dragon.fillStyle(0x660000);
    dragon.fillRect(2, 40, 16, 10); // legs
    dragon.fillRect(46, 40, 16, 10);
    dragon.fillRect(0, 30, 10, 18); // tail
    dragon.fillStyle(COLORS.YELLOW);
    dragon.fillRect(48, 14, 6, 6); // eye
    dragon.fillStyle(COLORS.ORANGE);
    dragon.fillRect(56, 20, 8, 4); // fire breath
    dragon.fillStyle(COLORS.YELLOW);
    dragon.fillRect(58, 21, 5, 2);
    dragon.generateTexture('chaos_dragon', 64, 64);
    dragon.destroy();
  }

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
}
