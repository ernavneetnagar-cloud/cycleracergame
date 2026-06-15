export enum GameState {
  START_MENU = 'START_MENU',
  LEVEL_SELECT = 'LEVEL_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  CRASHED = 'CRASHED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  SHOP = 'SHOP',
}

export interface LevelConfig {
  levelNumber: number;
  title: string;
  targetDistance: number; // in meters or units
  baseSpeedMultiplier: number;
  spawnRateMultiplier: number;
  oppositeSpawnChance: number; // 0 to 1
  rewardPoints: number;
  backgroundId: string;
}

export type ShopCategory = 'outfit' | 'vehicle' | 'weapon' | 'background';

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  category: ShopCategory;
  description: string;
  iconName: string;
  specs: {
    speedBoost?: number;
    armored?: boolean;
    label?: string;
  };
}

export interface PlayerData {
  points: number;
  currentLevel: number; // max unlocked level (1-20)
  completedLevelStars: Record<number, number>; // levelNumber -> stars (1-3)
  activeOutfitId: string;
  activeVehicleId: string;
  activeBackgroundId: string;
  ownedItemIds: string[];
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'cyclist' | 'car' | 'motorbike' | 'arrow' | 'coin' | 'explosion';
  lane: number; // 0, 1, 2, 3
  direction: 'forward' | 'opposite';
  color: string;
  imageIcon?: string;
  spriteIndex?: number;
  isDead?: boolean;
  opacity?: number;
}
