import Phaser from 'phaser';
import { SCENE_KEYS } from '../constants';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: SCENE_KEYS.BOOT }); }

  preload(): void {
    // Heroes: 4 frames each
    // Actual frame sizes from generator: 45px wide × 60px tall per frame
    this.load.spritesheet('knight', 'assets/sprites/knight.png', { frameWidth: 45, frameHeight: 60 });
    this.load.spritesheet('archer', 'assets/sprites/archer.png', { frameWidth: 45, frameHeight: 60 });
    this.load.spritesheet('mage',   'assets/sprites/mage.png',   { frameWidth: 45, frameHeight: 60 });
    this.load.spritesheet('rogue',  'assets/sprites/rogue.png',  { frameWidth: 45, frameHeight: 60 });

    // Regular enemies
    this.load.spritesheet('wolf',        'assets/sprites/wolf.png',        { frameWidth: 54, frameHeight: 48 });
    this.load.spritesheet('skeleton',    'assets/sprites/skeleton.png',    { frameWidth: 45, frameHeight: 60 });
    this.load.spritesheet('zombie',      'assets/sprites/zombie.png',      { frameWidth: 45, frameHeight: 60 });
    this.load.spritesheet('goblin',      'assets/sprites/goblin.png',      { frameWidth: 48, frameHeight: 60 });
    this.load.spritesheet('necromancer', 'assets/sprites/necromancer.png', { frameWidth: 48, frameHeight: 60 });
    this.load.spritesheet('demon',       'assets/sprites/demon.png',       { frameWidth: 48, frameHeight: 60 });
    this.load.spritesheet('vampire',     'assets/sprites/vampire.png',     { frameWidth: 45, frameHeight: 60 });

    // Bosses: 2 frames
    this.load.spritesheet('ogre_warlord', 'assets/sprites/ogre_warlord.png', { frameWidth: 48, frameHeight: 63 });
    this.load.spritesheet('black_knight', 'assets/sprites/black_knight.png', { frameWidth: 45, frameHeight: 63 });
    this.load.spritesheet('arclich',      'assets/sprites/arclich.png',      { frameWidth: 45, frameHeight: 63 });
    this.load.spritesheet('chaos_dragon', 'assets/sprites/chaos_dragon.png', { frameWidth: 48, frameHeight: 63 });

    // Pickups: 2 frames
    this.load.spritesheet('xp_crystal',  'assets/sprites/xp_crystal.png',  { frameWidth: 32, frameHeight: 28 });
    this.load.spritesheet('gold_coin',   'assets/sprites/gold_coin.png',    { frameWidth: 36, frameHeight: 28 });
    this.load.spritesheet('loot_magnet', 'assets/sprites/loot_magnet.png',  { frameWidth: 40, frameHeight: 40 });

    // Projectiles: 1 frame each
    this.load.spritesheet('arrow',      'assets/sprites/arrow.png',      { frameWidth: 27, frameHeight: 15 });
    this.load.spritesheet('fireball',   'assets/sprites/fireball.png',   { frameWidth: 27, frameHeight: 21 });
    this.load.spritesheet('holy_cross', 'assets/sprites/holy_cross.png', { frameWidth: 27, frameHeight: 21 });

    // Generate textures that are still needed (particle, button, HUD elements)
    this.generateFallbackTextures();
  }

  private generateFallbackTextures(): void {
    // These are still needed but not worth generating as files
    const g = this.make.graphics({ x:0, y:0 } as any);

    // particle (white dot)
    g.clear(); g.fillStyle(0xFFFFFF); g.fillCircle(4,4,4);
    g.generateTexture('particle', 8, 8);

    // particle_blood (red)
    g.clear(); g.fillStyle(0xFF2222); g.fillCircle(4,4,4);
    g.generateTexture('particle_blood', 8, 8);

    // heart (HP icon)
    g.clear(); g.fillStyle(0xCC0000);
    g.fillCircle(5,5,5); g.fillCircle(11,5,5);
    g.fillTriangle(0,7,16,7,8,16);
    g.generateTexture('heart', 16, 16);

    // weapon_slot
    g.clear(); g.fillStyle(0x404040); g.fillRect(0,0,40,40);
    g.lineStyle(2, 0xB8860B); g.strokeRect(0,0,40,40);
    g.generateTexture('weapon_slot', 40, 40);

    // button_bg
    g.clear(); g.fillStyle(0xB8860B); g.fillRect(0,0,200,60);
    g.fillStyle(0xFFD700); g.fillRect(2,2,196,56);
    g.fillStyle(0xB8860B); g.fillRect(4,4,192,52);
    g.generateTexture('button_bg', 200, 60);

    // sword_slash (AOE indicator)
    g.clear(); g.fillStyle(0xCCCCFF, 0.3); g.fillCircle(40,40,38);
    g.lineStyle(2, 0x8888FF, 0.6); g.strokeCircle(40,40,38);
    g.generateTexture('sword_slash', 80, 80);

    // chain_lightning (line sprite)
    g.clear(); g.fillStyle(0x88FFFF);
    for (let i=0;i<4;i++) g.fillRect(i*4,i%2*2,4,2);
    g.generateTexture('chain_lightning', 16, 6);

    // frost_ring
    g.clear(); g.lineStyle(3, 0x88BBFF, 0.5); g.strokeCircle(50,50,48);
    g.generateTexture('frost_ring', 100, 100);

    // goblin_arrow
    g.clear(); g.fillStyle(0x8B6914); g.fillRect(0,2,14,2);
    g.fillTriangle(10,0,16,3,10,6); g.generateTexture('goblin_arrow',16,6);

    // necro_spell
    g.clear(); g.fillStyle(0x9400D3,0.6); g.fillCircle(8,8,8);
    g.fillStyle(0xCC44FF); g.fillCircle(8,8,4);
    g.generateTexture('necro_spell',16,16);

    // lightning_bolt
    g.clear(); g.fillStyle(0xFFFF00);
    g.fillRect(6,0,4,8); g.fillRect(2,6,8,4); g.fillRect(4,10,4,8);
    g.generateTexture('lightning_bolt',12,18);

    // dagger
    g.clear(); g.fillStyle(0xCCCCCC); g.fillRect(2,4,14,3);
    g.fillTriangle(14,2,20,5,14,8); g.fillStyle(0x8B4513); g.fillRect(0,3,4,5);
    g.generateTexture('dagger',20,11);

    g.destroy();
  }

  create(): void {
    this.registerAnimations();
    this.scene.start(SCENE_KEYS.MENU);
  }

  private registerAnimations(): void {
    // Heroes
    for (const [key, frames, attackFrame] of [
      ['knight', [0,1,2], 3],
      ['archer', [0,1,2], 3],
      ['mage',   [0,1,2], 3],
      ['rogue',  [0,1,2], 3],
    ] as [string, number[], number][]) {
      this.anims.create({ key: `${key}_walk`, frames: this.anims.generateFrameNumbers(key, { frames: [1,0,2,0] }), frameRate: 7, repeat: -1 });
      this.anims.create({ key: `${key}_idle`, frames: this.anims.generateFrameNumbers(key, { frames: [0] }), frameRate: 1, repeat: -1 });
      this.anims.create({ key: `${key}_attack`, frames: this.anims.generateFrameNumbers(key, { frames: [attackFrame] }), frameRate: 8, repeat: 0 });
    }

    // Regular enemies (3 frames: idle=0, walk1=1, walk2=2)
    for (const key of ['wolf','skeleton','goblin']) {
      this.anims.create({ key: `${key}_walk`, frames: this.anims.generateFrameNumbers(key, { frames: [1,0,2,0] }), frameRate: 5, repeat: -1 });
      this.anims.create({ key: `${key}_idle`, frames: this.anims.generateFrameNumbers(key, { frames: [0] }), frameRate: 1, repeat: -1 });
    }
    // 2-frame enemies
    for (const key of ['zombie','necromancer','demon','vampire']) {
      this.anims.create({ key: `${key}_walk`, frames: this.anims.generateFrameNumbers(key, { frames: [1,0] }), frameRate: 5, repeat: -1 });
      this.anims.create({ key: `${key}_idle`, frames: this.anims.generateFrameNumbers(key, { frames: [0] }), frameRate: 1, repeat: -1 });
    }
    // skeleton has 3 frames
    // goblin special: shoot anim uses frame 2
    this.anims.create({ key: 'goblin_shoot', frames: this.anims.generateFrameNumbers('goblin', { frames: [2] }), frameRate: 6, repeat: 0 });

    // Bosses (2 frames: idle=0, walk=1)
    for (const key of ['ogre_warlord','black_knight','arclich','chaos_dragon']) {
      this.anims.create({ key: `${key}_walk`, frames: this.anims.generateFrameNumbers(key, { frames: [0,1] }), frameRate: 3, repeat: -1 });
      this.anims.create({ key: `${key}_idle`, frames: this.anims.generateFrameNumbers(key, { frames: [0] }), frameRate: 1, repeat: -1 });
    }

    // Pickups
    this.anims.create({ key: 'xp_crystal_spin',  frames: this.anims.generateFrameNumbers('xp_crystal',  { frames:[0,1] }), frameRate:4, repeat:-1 });
    this.anims.create({ key: 'gold_coin_spin',    frames: this.anims.generateFrameNumbers('gold_coin',   { frames:[0,1] }), frameRate:4, repeat:-1 });
    this.anims.create({ key: 'loot_magnet_pulse', frames: this.anims.generateFrameNumbers('loot_magnet', { frames:[0,1] }), frameRate:3, repeat:-1 });
  }
}
