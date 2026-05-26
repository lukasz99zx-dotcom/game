import { HeroClass, WeaponType, EnemyType } from './constants';

export interface HeroStats {
  id: HeroClass;
  name: string;
  hp: number;
  speed: number;
  startWeapon: WeaponType;
  specialName: string;
  specialCooldown: number;
  description: string;
  color: number;
}

export interface WeaponStats {
  id: WeaponType;
  name: string;
  damage: number;
  cooldown: number;
  color: number;
  description: string;
}

export interface EnemyStats {
  id: EnemyType;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  xpDrop: number;
  goldDrop: number;
  color: number;
  size: number;
  isBoss: boolean;
}

export interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'stat';
  weaponType?: WeaponType;
  statKey?: string;
  statValue?: number;
}

export interface GameState {
  heroClass: HeroClass;
  wave: number;
  enemiesKilled: number;
  gold: number;
  xp: number;
  level: number;
  survivalTime: number;
}

export interface Vec2 {
  x: number;
  y: number;
}
