import { Direction } from '../types';

// Character sprite mapping for Kenney Roguelike Characters sheet
// Sheet: 918x203, 16x16 frames, 1px margin, 54 cols x 12 rows
//
// The character sheet has full character sprites at specific positions.
// Each character occupies 1 cell (16x16) and different columns represent
// different character variants (knight, mage, warrior, etc.)
//
// Row layout (observed from sheet):
//   Rows 0-1: Human characters (light skin, various outfits)
//   Rows 2-3: More human variants (different hair/armor)
//   Rows 4-5: Green/elf characters
//   Rows 6-7: Brown/dark characters
//   Rows 8-9: Mixed character types
//   Rows 10-11: Additional variants

// Character definition: [col, row] for the base sprite
// We use different positions on the sheet for each character
type CharSpriteCoord = [number, number];

// Direction offsets — for the roguelike sheet, we approximate
// facing directions by using nearby cells
const DIR_OFFSETS: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

// Player character sprite position
export const PLAYER_SPRITE: CharSpriteCoord = [0, 0];

// NPC character sprite positions — each mapped to a visually distinct sprite
export const NPC_SPRITES: Record<string, CharSpriteCoord> = {
  'delhi-advisor':     [0, 2],
  'delhi-merchant':    [4, 0],
  'agra-merchant':     [4, 2],
  'jaipur-guard':      [0, 6],
  'varanasi-scholar':  [4, 4],
  'lucknow-poet':      [0, 4],
  'guwahati-sage':     [4, 6],
  'hampi-priest':      [0, 8],
  'kozhikode-trader':  [4, 8],
  'mumbai-captain':    [0, 10],
  'madurai-priestess': [4, 10],
  'jodhpur-warrior':   [0, 6],
  'bhopal-alchemist':  [4, 4],
};

// Get character sprite coordinates for a given character and direction
export function getCharSprite(
  baseCoord: CharSpriteCoord,
  direction: Direction,
  _walkFrame: number, // 0-3 walk cycle
): CharSpriteCoord {
  // Use direction offset to pick a different column variant
  const dirOffset = DIR_OFFSETS[direction];
  return [baseCoord[0] + dirOffset, baseCoord[1]];
}

// Get enemy sprite for battle screen (uses different rows)
export const ENEMY_SPRITES: Record<string, CharSpriteCoord> = {
  'desert_bandit':    [8, 6],
  'sand_scorpion':    [8, 8],
  'dust_djinn':       [8, 10],
  'wild_boar':        [12, 0],
  'dacoit':           [8, 2],
  'cobra':            [12, 2],
  'forest_wolf':      [12, 4],
  'jungle_cat':       [12, 6],
  'tribal_warrior':   [8, 4],
  'snow_leopard':     [12, 8],
  'mountain_yak':     [12, 10],
  'yeti':             [16, 0],
  'mugger_croc':      [16, 2],
  'pirate':           [16, 4],
  'rock_golem':       [16, 6],
  'naga_spirit':      [16, 8],
};
