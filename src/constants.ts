export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 854;

export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 1200;

export const COLORS = {
  GOLD: 0xFFD700,
  DARK_GOLD: 0xB8860B,
  STONE_GRAY: 0x808080,
  DARK_STONE: 0x404040,
  DEEP_GREEN: 0x2D5016,
  FOREST_GREEN: 0x3A7D1E,
  PARCHMENT: 0xF4E4BC,
  BLOOD_RED: 0xCC0000,
  ROYAL_BLUE: 0x1A1A6E,
  BACKGROUND: 0x1A0A00,
  WHITE: 0xFFFFFF,
  BLACK: 0x000000,
  CYAN: 0x00FFFF,
  YELLOW: 0xFFFF00,
  ORANGE: 0xFF8C00,
  PURPLE: 0x800080,
  DARK_PURPLE: 0x4B0082,
  BROWN: 0x8B4513,
  DARK_BROWN: 0x5C3317,
  LIGHT_GRAY: 0xCCCCCC,
  DARK_GREEN: 0x006400,
  LIME: 0x32CD32,
  RED: 0xFF0000,
  PINK: 0xFF69B4,
  SILVER: 0xC0C0C0,
};

export const HERO_CLASSES = {
  KNIGHT: 'knight',
  ARCHER: 'archer',
  MAGE: 'mage',
  ROGUE: 'rogue',
} as const;

export const WEAPON_TYPES = {
  LIGHTNING_SWORD: 'lightning_sword',
  ENCHANTED_CROSSBOW: 'enchanted_crossbow',
  FIREBALL: 'fireball',
  HOLY_CROSS: 'holy_cross',
  FROST_AURA: 'frost_aura',
  CHAIN_LIGHTNING: 'chain_lightning',
  WHIRLWIND:       'whirlwind',
  DEATH_RAY:       'death_ray',
  EXPLOSIVE_BOLTS: 'explosive_bolts',
  SHOCKWAVE:       'shockwave',
} as const;

export const ENEMY_TYPES = {
  WOLF: 'wolf',
  SKELETON: 'skeleton',
  ZOMBIE: 'zombie',
  GOBLIN: 'goblin',
  NECROMANCER: 'necromancer',
  DEMON: 'demon',
  VAMPIRE: 'vampire',
  OGRE_WARLORD: 'ogre_warlord',
  BLACK_KNIGHT: 'black_knight',
  ARCLICH: 'arclich',
  CHAOS_DRAGON: 'chaos_dragon',
} as const;

export type HeroClass = typeof HERO_CLASSES[keyof typeof HERO_CLASSES];
export type WeaponType = typeof WEAPON_TYPES[keyof typeof WEAPON_TYPES];
export type EnemyType = typeof ENEMY_TYPES[keyof typeof ENEMY_TYPES];

export const WAVE_DURATION = 60000; // 60 seconds
export const BOSS_WAVE_INTERVAL = 5;
export const MAX_WEAPONS = 6;

export const XP_PER_LEVEL = [0, 10, 25, 45, 70, 100, 135, 175, 220, 270, 325];

export const SCENE_KEYS = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  HERO_SELECT: 'HeroSelectScene',
  GAME: 'GameScene',
  LEVEL_UP: 'LevelUpScene',
  GAME_OVER: 'GameOverScene',
  PAUSE: 'PauseMenuScene',
} as const;

export const hpRegen = 'hpRegen';
export const lifesteal = 'lifesteal';
