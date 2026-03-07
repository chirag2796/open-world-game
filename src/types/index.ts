// Core game types

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface GameEntity {
  id: string;
  position: Position;
  direction: Direction;
  sprite: PixelGrid;
  spriteWalk?: PixelGrid; // alternate frame for walk animation
}

export interface NPC extends GameEntity {
  name: string;
  dialog: string[];
}

export interface Player extends GameEntity {
  name: string;
}

// A pixel grid is a 2D array of color strings (or null for transparent)
export type PixelGrid = (string | null)[][];

// Tile types for the map
export enum TileType {
  GRASS = 0,
  PATH = 1,
  WATER = 2,
  WALL_STONE = 3,
  WALL_WOOD = 4,
  DOOR = 5,
  TREE = 6,
  FLOWER_RED = 7,
  FLOWER_YELLOW = 8,
  BRIDGE = 9,
  ROOF = 10,
  FENCE = 11,
  SIGN = 12,
  WELL = 13,
  CHEST = 14,
}

// Which tiles block movement
export const SOLID_TILES = new Set([
  TileType.WATER,
  TileType.WALL_STONE,
  TileType.WALL_WOOD,
  TileType.TREE,
  TileType.ROOF,
  TileType.FENCE,
  TileType.WELL,
  TileType.CHEST,
]);

export interface TileMapData {
  width: number;
  height: number;
  layers: {
    ground: TileType[][];
    objects: (TileType | null)[][];
  };
}

export interface DialogState {
  active: boolean;
  npcName: string;
  lines: string[];
  currentLine: number;
}
