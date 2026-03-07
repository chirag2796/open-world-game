import { Dimensions } from 'react-native';
import { TileType } from '../types';

export const TILE_SIZE = 16;
export const SCALE = 3;
export const SCALED_TILE = TILE_SIZE * SCALE; // 48px

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
export const VIEWPORT_TILES_X = Math.ceil(SCREEN_W / SCALED_TILE) + 2;
export const VIEWPORT_TILES_Y = Math.ceil((SCREEN_H * 0.6) / SCALED_TILE) + 2;

export const GAME_AREA_HEIGHT = Math.floor(SCREEN_H * 0.6);
export const CONTROLS_HEIGHT = SCREEN_H - GAME_AREA_HEIGHT;
export const SCREEN_WIDTH = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;

export const MOVE_SPEED = 2;
export const TICK_MS = 33;
export const INTERACT_RANGE = 1.5;

// Encounter chance per step on encounter tiles (0-1)
export const ENCOUNTER_RATE = 0.04;

// Tile colors for fast rendering (1 colored rect per tile)
export const TILE_COLORS: Record<TileType, string> = {
  [TileType.OCEAN]: '#1a3a6a',
  [TileType.BEACH]: '#e0d090',
  [TileType.PLAINS]: '#6aaa40',
  [TileType.FOREST]: '#2d6e2d',
  [TileType.DENSE_JUNGLE]: '#1a4a1a',
  [TileType.DESERT]: '#d4b060',
  [TileType.MOUNTAIN]: '#707070',
  [TileType.SNOW]: '#e0e0f0',
  [TileType.PLATEAU]: '#8a7a50',
  [TileType.SWAMP]: '#3a6a4a',
  [TileType.RIVER]: '#4090d0',
  [TileType.FARM]: '#90c040',
  [TileType.PATH_DIRT]: '#c4a46c',
  [TileType.PATH_STONE]: '#a0a0a0',
  [TileType.WALL_MUD]: '#8b6340',
  [TileType.WALL_STONE]: '#606060',
  [TileType.ROOF]: '#a03020',
  [TileType.DOOR]: '#b8894a',
  [TileType.MARKET]: '#e0c020',
  [TileType.TEMPLE]: '#c03030',
  [TileType.FORT_WALL]: '#404040',
  [TileType.PALACE]: '#c0a040',
  [TileType.WELL]: '#5090d0',
  [TileType.GARDEN]: '#40a040',
  // New terrain
  [TileType.DEEP_OCEAN]: '#0e2850',
  [TileType.SHALLOW_WATER]: '#60b8e8',
  [TileType.ICE]: '#c8d8f0',
  [TileType.TALL_GRASS]: '#4a8830',
  [TileType.SAND_DUNES]: '#dcc060',
  [TileType.TREE_PINE]: '#1a5028',
  [TileType.TREE_PALM]: '#308830',
  [TileType.TREE_BANYAN]: '#285a20',
  [TileType.CLIFF]: '#585050',
  [TileType.ROCKS]: '#888078',
  [TileType.FLOWERS]: '#6aaa40',
  [TileType.RUINS]: '#807060',
  [TileType.BRIDGE]: '#8b6340',
  [TileType.CAMPSITE]: '#c4a46c',
  [TileType.HUT]: '#9b7348',
  [TileType.LAKE]: '#3880c0',
};

// Detail overlays per tile type
export const TILE_DETAIL: Partial<Record<TileType, { color: string; type: 'dots' | 'stripe' | 'border' | 'center' | 'cross' | 'triangle' }>> = {
  [TileType.PLAINS]: { color: '#80c050', type: 'dots' },
  [TileType.FOREST]: { color: '#1a5020', type: 'center' },
  [TileType.DENSE_JUNGLE]: { color: '#0d300d', type: 'center' },
  [TileType.DESERT]: { color: '#c4a040', type: 'dots' },
  [TileType.OCEAN]: { color: '#2050a0', type: 'dots' },
  [TileType.MOUNTAIN]: { color: '#555555', type: 'triangle' },
  [TileType.SNOW]: { color: '#ffffff', type: 'dots' },
  [TileType.PLATEAU]: { color: '#706040', type: 'dots' },
  [TileType.SWAMP]: { color: '#2a5a3a', type: 'dots' },
  [TileType.RIVER]: { color: '#60b0e0', type: 'stripe' },
  [TileType.FARM]: { color: '#70a030', type: 'stripe' },
  [TileType.WALL_STONE]: { color: '#505050', type: 'stripe' },
  [TileType.WALL_MUD]: { color: '#7a5530', type: 'stripe' },
  [TileType.ROOF]: { color: '#c05040', type: 'stripe' },
  [TileType.FORT_WALL]: { color: '#303030', type: 'stripe' },
  [TileType.MARKET]: { color: '#d0a010', type: 'border' },
  [TileType.TEMPLE]: { color: '#e05050', type: 'center' },
  [TileType.PALACE]: { color: '#e0c060', type: 'border' },
  [TileType.GARDEN]: { color: '#60c060', type: 'dots' },
  [TileType.DOOR]: { color: '#5c3a20', type: 'border' },
  // New terrain details
  [TileType.DEEP_OCEAN]: { color: '#081840', type: 'dots' },
  [TileType.SHALLOW_WATER]: { color: '#80d0f0', type: 'dots' },
  [TileType.ICE]: { color: '#e0e8ff', type: 'stripe' },
  [TileType.TALL_GRASS]: { color: '#387020', type: 'stripe' },
  [TileType.SAND_DUNES]: { color: '#c8a840', type: 'stripe' },
  [TileType.TREE_PINE]: { color: '#0d3818', type: 'triangle' },
  [TileType.TREE_PALM]: { color: '#208020', type: 'center' },
  [TileType.TREE_BANYAN]: { color: '#1a4818', type: 'center' },
  [TileType.CLIFF]: { color: '#484040', type: 'stripe' },
  [TileType.ROCKS]: { color: '#706860', type: 'center' },
  [TileType.FLOWERS]: { color: '#e04080', type: 'dots' },
  [TileType.RUINS]: { color: '#605848', type: 'border' },
  [TileType.BRIDGE]: { color: '#6a4a28', type: 'stripe' },
  [TileType.CAMPSITE]: { color: '#e08030', type: 'center' },
  [TileType.HUT]: { color: '#7a5530', type: 'border' },
  [TileType.LAKE]: { color: '#2868a0', type: 'dots' },
};

export const PALETTE = {
  black: '#0f0f0f',
  darkGray: '#333333',
  midGray: '#666666',
  lightGray: '#b0b0b0',
  white: '#f0f0f0',
  skin: '#f0b888',
  skinDark: '#d09868',
  woodDark: '#5c3a20',
  yellow: '#e0c020',
  red: '#c03030',
  redLight: '#e05050',
  roofRed: '#a03020',
  roofRedLight: '#c05040',
  green: '#40a040',
  greenDark: '#207020',
  blue: '#4080c0',
  blueDark: '#204080',
  orange: '#e08030',
  uiBg: '#1a1a2e',
  uiBorder: '#e0d8b0',
  uiText: '#f0f0e0',
  uiDark: '#0f0f1e',
  hpGreen: '#40c040',
  hpYellow: '#e0c020',
  hpRed: '#c03030',
};
