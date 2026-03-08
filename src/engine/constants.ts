import { Dimensions } from 'react-native';
import { TileType } from '../types';

// Dev mode: bypasses solid tile collisions, region locks, encounters
export let DEV_MODE = false;
export function setDevMode(on: boolean) { DEV_MODE = on; }

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
  [TileType.OCEAN]: '#1a4478',
  [TileType.BEACH]: '#e8d8a0',
  [TileType.PLAINS]: '#5daa38',
  [TileType.FOREST]: '#2a7030',
  [TileType.DENSE_JUNGLE]: '#1a5020',
  [TileType.DESERT]: '#d8b868',
  [TileType.MOUNTAIN]: '#6a6a70',
  [TileType.SNOW]: '#e8e8f8',
  [TileType.PLATEAU]: '#907a50',
  [TileType.SWAMP]: '#3a6848',
  [TileType.RIVER]: '#4898d8',
  [TileType.FARM]: '#78b838',
  [TileType.PATH_DIRT]: '#c8a870',
  [TileType.PATH_STONE]: '#989898',
  [TileType.WALL_MUD]: '#8b6340',
  [TileType.WALL_STONE]: '#585858',
  [TileType.ROOF]: '#a83828',
  [TileType.DOOR]: '#b8894a',
  [TileType.MARKET]: '#e0c020',
  [TileType.TEMPLE]: '#c03030',
  [TileType.FORT_WALL]: '#484848',
  [TileType.PALACE]: '#c8a848',
  [TileType.WELL]: '#5898d8',
  [TileType.GARDEN]: '#48b048',
  // New terrain
  [TileType.DEEP_OCEAN]: '#0c2858',
  [TileType.SHALLOW_WATER]: '#68c0e8',
  [TileType.ICE]: '#d0e0f8',
  [TileType.TALL_GRASS]: '#488830',
  [TileType.SAND_DUNES]: '#d8c060',
  [TileType.TREE_PINE]: '#1a5828',
  [TileType.TREE_PALM]: '#309030',
  [TileType.TREE_BANYAN]: '#286020',
  [TileType.CLIFF]: '#585050',
  [TileType.ROCKS]: '#807870',
  [TileType.FLOWERS]: '#58a838',
  [TileType.RUINS]: '#807060',
  [TileType.BRIDGE]: '#a07848',
  [TileType.CAMPSITE]: '#c8a870',
  [TileType.HUT]: '#9b7348',
  [TileType.LAKE]: '#3888c8',
  // Indo-Saracenic architecture
  [TileType.SANDSTONE]: '#c2613a',
  [TileType.MARBLE]: '#f0ece0',
  [TileType.DOME]: '#e8d8a0',
  [TileType.ARCH]: '#b85030',
  [TileType.JALI]: '#d8c8a8',
  [TileType.MINARET]: '#c8b888',
  [TileType.CHHATRI]: '#d0b870',
  [TileType.BAORI_WALL]: '#a06030',
  [TileType.BAORI_WATER]: '#2868a0',
  [TileType.PIETRA_DURA]: '#d0c0a0',
  [TileType.COURTYARD]: '#d8c8a0',
  [TileType.HAVELI_WALL]: '#b06838',
  [TileType.MUGHAL_GATE]: '#a04828',
  [TileType.MOSQUE]: '#d8d0b8',
  [TileType.BORDER_POST]: '#8a6840',
  [TileType.CANAL]: '#5098c0',
  [TileType.CHARBAGH]: '#308838',
  // Height/obstacle tiles
  [TileType.LEDGE_S]: '#585050',
  [TileType.LEDGE_N]: '#585050',
  [TileType.LEDGE_E]: '#585050',
  [TileType.LEDGE_W]: '#585050',
  [TileType.STAIRS]: '#c8a870',
  [TileType.ROCKY_PATH]: '#a09070',
  [TileType.CRACKED_EARTH]: '#c8a060',
  [TileType.MANGROVE]: '#2d5030',
  [TileType.BAMBOO]: '#3a7030',
  [TileType.CACTUS]: '#a07830',
  [TileType.FALLEN_LOG]: '#6a4a28',
  [TileType.BOULDER]: '#807870',
  [TileType.LOCKED_GATE]: '#8a6840',
  [TileType.DRY_GRASS]: '#b8a050',
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
  // Indo-Saracenic
  [TileType.SANDSTONE]: { color: '#a84828', type: 'stripe' },
  [TileType.MARBLE]: { color: '#e0d8c8', type: 'border' },
  [TileType.DOME]: { color: '#c8b870', type: 'center' },
  [TileType.ARCH]: { color: '#902818', type: 'border' },
  [TileType.JALI]: { color: '#c0b090', type: 'cross' },
  [TileType.MINARET]: { color: '#b0a070', type: 'stripe' },
  [TileType.CHHATRI]: { color: '#c0a850', type: 'center' },
  [TileType.BAORI_WALL]: { color: '#884820', type: 'stripe' },
  [TileType.BAORI_WATER]: { color: '#1858a0', type: 'dots' },
  [TileType.PIETRA_DURA]: { color: '#40a060', type: 'dots' },
  [TileType.COURTYARD]: { color: '#c0b080', type: 'dots' },
  [TileType.HAVELI_WALL]: { color: '#985830', type: 'stripe' },
  [TileType.MUGHAL_GATE]: { color: '#802010', type: 'border' },
  [TileType.MOSQUE]: { color: '#c8c0a8', type: 'center' },
  [TileType.BORDER_POST]: { color: '#705028', type: 'border' },
  [TileType.CANAL]: { color: '#3878a0', type: 'stripe' },
  [TileType.CHARBAGH]: { color: '#207028', type: 'cross' },
  // Height/obstacle tiles
  [TileType.LEDGE_S]: { color: '#484040', type: 'stripe' },
  [TileType.LEDGE_N]: { color: '#484040', type: 'stripe' },
  [TileType.LEDGE_E]: { color: '#484040', type: 'stripe' },
  [TileType.LEDGE_W]: { color: '#484040', type: 'stripe' },
  [TileType.STAIRS]: { color: '#a08050', type: 'stripe' },
  [TileType.ROCKY_PATH]: { color: '#887060', type: 'dots' },
  [TileType.CRACKED_EARTH]: { color: '#b08840', type: 'cross' },
  [TileType.MANGROVE]: { color: '#1a3820', type: 'center' },
  [TileType.BAMBOO]: { color: '#2a5820', type: 'stripe' },
  [TileType.CACTUS]: { color: '#886020', type: 'center' },
  [TileType.FALLEN_LOG]: { color: '#5a3a18', type: 'stripe' },
  [TileType.BOULDER]: { color: '#706060', type: 'center' },
  [TileType.LOCKED_GATE]: { color: '#705028', type: 'border' },
  [TileType.DRY_GRASS]: { color: '#a09030', type: 'dots' },
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
  // Indo-Saracenic palette
  sandstone: '#c2613a',
  sandstoneLight: '#d88050',
  sandstoneDark: '#8a3820',
  marble: '#f0ece0',
  marbleCream: '#e8e0c8',
  mughalGold: '#d0a840',
  mughalRed: '#a04020',
  pietraDura: '#40a060',
  archRed: '#b85030',
};
