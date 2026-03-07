// Core types for India Open World RPG

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export enum TileType {
  // Natural terrain
  OCEAN = 0,
  BEACH = 1,
  PLAINS = 2,
  FOREST = 3,
  DENSE_JUNGLE = 4,
  DESERT = 5,
  MOUNTAIN = 6,
  SNOW = 7,
  PLATEAU = 8,
  SWAMP = 9,
  RIVER = 10,
  FARM = 11,
  // Settlement
  PATH_DIRT = 12,
  PATH_STONE = 13,
  WALL_MUD = 14,
  WALL_STONE = 15,
  ROOF = 16,
  DOOR = 17,
  MARKET = 18,
  TEMPLE = 19,
  FORT_WALL = 20,
  PALACE = 21,
  WELL = 22,
  GARDEN = 23,
  // New terrain variety
  DEEP_OCEAN = 24,
  SHALLOW_WATER = 25,
  ICE = 26,
  TALL_GRASS = 27,
  SAND_DUNES = 28,
  TREE_PINE = 29,
  TREE_PALM = 30,
  TREE_BANYAN = 31,
  CLIFF = 32,
  ROCKS = 33,
  FLOWERS = 34,
  RUINS = 35,
  BRIDGE = 36,
  CAMPSITE = 37,
  HUT = 38,
  LAKE = 39,
}

export const SOLID_TILES = new Set([
  TileType.OCEAN,
  TileType.DEEP_OCEAN,
  TileType.MOUNTAIN,
  TileType.SNOW,
  TileType.ICE,
  TileType.WALL_MUD,
  TileType.WALL_STONE,
  TileType.ROOF,
  TileType.FORT_WALL,
  TileType.PALACE,
  TileType.WELL,
  TileType.CLIFF,
  TileType.ROCKS,
  TileType.RUINS,
  TileType.HUT,
  TileType.LAKE,
]);

// Tiles that can trigger random encounters
export const ENCOUNTER_TILES = new Set([
  TileType.TALL_GRASS,
  TileType.DENSE_JUNGLE,
  TileType.SWAMP,
  TileType.SAND_DUNES,
]);

export type BiomeType =
  | 'ocean' | 'snow' | 'mountain' | 'desert' | 'plains'
  | 'forest' | 'dense_forest' | 'plateau' | 'wetland' | 'coastal';

export interface SettlementDef {
  name: string;
  type: 'village' | 'city' | 'capital';
  tileX: number;
  tileY: number;
}

export interface StateDef {
  code: string;
  name: string;
  biome: BiomeType;
  settlements: SettlementDef[];
}

export interface TileMapData {
  width: number;
  height: number;
  ground: TileType[][];
}

export type NPCBehavior = 'stationary' | 'wander' | 'patrol' | 'guard';

export interface NPC {
  id: string;
  name: string;
  position: Position;
  direction: Direction;
  dialog: string[];
  settlement: string;
  behavior: NPCBehavior;
  wanderRadius?: number;
  patrolPath?: Position[];
}

export interface DialogState {
  active: boolean;
  npcName: string;
  lines: string[];
  currentLine: number;
}

// Inventory system
export type ItemCategory = 'weapons' | 'armor' | 'items' | 'key_items';

export type EquipSlot = 'weapon' | 'head' | 'body' | 'legs' | 'accessory';

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  icon: string;
  stackable: boolean;
  usable: boolean;
  equipSlot?: EquipSlot;
  attack?: number;
  defense?: number;
  effect?: string;
  value: number;
}

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

export interface EquipState {
  weapon: string | null;
  head: string | null;
  body: string | null;
  legs: string | null;
  accessory: string | null;
}

// Battle system
export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  xpReward: number;
  goldReward: number;
  biomes: BiomeType[];
  bodyColor: string;
  headColor: string;
  description: string;
}

export type BattleAction = 'attack' | 'defend' | 'item' | 'run';

export interface BattleState {
  active: boolean;
  enemy: EnemyDef | null;
  enemyHP: number;
  playerHP: number;
  playerMaxHP: number;
  playerATK: number;
  playerDEF: number;
  turn: 'player' | 'enemy' | 'result';
  phase: 'intro' | 'select' | 'animate' | 'enemy_turn' | 'result';
  message: string;
  result: 'none' | 'win' | 'lose' | 'run';
  isDefending: boolean;
  playerXP: number;
  playerLevel: number;
  playerGold: number;
}
