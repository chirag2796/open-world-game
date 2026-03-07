import { Dimensions } from 'react-native';

// Each tile is 16 "game pixels", scaled up for display
export const TILE_SIZE = 16;
export const SCALE = 3; // render scale multiplier
export const SCALED_TILE = TILE_SIZE * SCALE; // 48px on screen

// Viewport (how many tiles visible at once)
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
export const VIEWPORT_TILES_X = Math.ceil(SCREEN_W / SCALED_TILE) + 2;
export const VIEWPORT_TILES_Y = Math.ceil((SCREEN_H * 0.65) / SCALED_TILE) + 2;

// Game area takes 65% of screen, controls take 35%
export const GAME_AREA_HEIGHT = Math.floor(SCREEN_H * 0.65);
export const CONTROLS_HEIGHT = SCREEN_H - GAME_AREA_HEIGHT;

export const SCREEN_WIDTH = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;

// Movement speed (pixels per tick)
export const MOVE_SPEED = 2;

// Game tick rate
export const TICK_MS = 33; // ~30 fps

// Animation
export const WALK_ANIM_FRAMES = 8; // switch sprite every N ticks while moving

// Interaction range (in tiles)
export const INTERACT_RANGE = 1.5;

// Colors - retro NES-inspired palette
export const PALETTE = {
  black: '#0f0f0f',
  darkGray: '#333333',
  midGray: '#666666',
  lightGray: '#b0b0b0',
  white: '#f0f0f0',

  // Greens
  grassDark: '#306230',
  grass: '#4a8c3f',
  grassLight: '#6abf4e',
  treeTrunk: '#5a3a1e',
  treeLeaf: '#2d6e2d',
  treeLeafLight: '#4a9e3a',

  // Blues
  waterDark: '#1a3a6a',
  water: '#3070b0',
  waterLight: '#5090d0',

  // Browns
  path: '#c4a46c',
  pathDark: '#9e8050',
  wood: '#8b6340',
  woodDark: '#5c3a20',
  woodLight: '#b8894a',

  // Stones
  stone: '#808080',
  stoneDark: '#606060',
  stoneLight: '#a0a0a0',

  // Reds
  red: '#c03030',
  redLight: '#e05050',
  roofRed: '#a03020',
  roofRedLight: '#c05040',

  // Yellows
  yellow: '#e0c020',
  yellowLight: '#f0e060',

  // Skin
  skin: '#f0b888',
  skinDark: '#d09868',

  // UI
  uiBg: '#1a1a2e',
  uiBorder: '#e0d8b0',
  uiText: '#f0f0e0',
  uiDark: '#0f0f1e',
};
