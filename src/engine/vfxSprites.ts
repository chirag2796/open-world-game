// VFX sprite sheet configuration for battle animations
// All sheets: 320px wide, 64x64 frames, 5 columns per row
// From pixel_animations_gfxpack (CC0 license)

import { ImageSourcePropType } from 'react-native';

export interface VFXSheet {
  source: ImageSourcePropType;
  sheetWidth: number;
  sheetHeight: number;
  frameSize: number; // 64x64
  cols: number;      // always 5
  rows: number;      // varies per sheet
}

export interface VFXAnimDef {
  sheet: VFXSheet;
  row: number;         // which row on the sheet to play
  frameCount: number;  // frames in this animation (usually 5)
  duration: number;    // total animation duration in ms
  scale?: number;      // render scale (default 1.0)
}

// Sheet definitions
const SHEETS: Record<string, VFXSheet> = {
  weapons_1: {
    source: require('../../assets/sprites/battle/vfx/weapons_1.png'),
    sheetWidth: 320, sheetHeight: 448, frameSize: 64, cols: 5, rows: 7,
  },
  weapons_2: {
    source: require('../../assets/sprites/battle/vfx/weapons_2.png'),
    sheetWidth: 320, sheetHeight: 384, frameSize: 64, cols: 5, rows: 6,
  },
  weapons_3: {
    source: require('../../assets/sprites/battle/vfx/weapons_3.png'),
    sheetWidth: 320, sheetHeight: 192, frameSize: 64, cols: 5, rows: 3,
  },
  fire: {
    source: require('../../assets/sprites/battle/vfx/fire.png'),
    sheetWidth: 320, sheetHeight: 384, frameSize: 64, cols: 5, rows: 6,
  },
  ice: {
    source: require('../../assets/sprites/battle/vfx/ice.png'),
    sheetWidth: 320, sheetHeight: 512, frameSize: 64, cols: 5, rows: 8,
  },
  lightning: {
    source: require('../../assets/sprites/battle/vfx/lightning.png'),
    sheetWidth: 320, sheetHeight: 384, frameSize: 64, cols: 5, rows: 6,
  },
  holy: {
    source: require('../../assets/sprites/battle/vfx/holy.png'),
    sheetWidth: 320, sheetHeight: 320, frameSize: 64, cols: 5, rows: 5,
  },
  darkness: {
    source: require('../../assets/sprites/battle/vfx/darkness.png'),
    sheetWidth: 320, sheetHeight: 320, frameSize: 64, cols: 5, rows: 5,
  },
  heal: {
    source: require('../../assets/sprites/battle/vfx/heal.png'),
    sheetWidth: 320, sheetHeight: 640, frameSize: 64, cols: 5, rows: 10,
  },
  impact1: {
    source: require('../../assets/sprites/battle/vfx/impact1.png'),
    sheetWidth: 320, sheetHeight: 384, frameSize: 64, cols: 5, rows: 6,
  },
  impact2: {
    source: require('../../assets/sprites/battle/vfx/impact2.png'),
    sheetWidth: 320, sheetHeight: 192, frameSize: 64, cols: 5, rows: 3,
  },
  explosion: {
    source: require('../../assets/sprites/battle/vfx/explosion.png'),
    sheetWidth: 320, sheetHeight: 256, frameSize: 64, cols: 5, rows: 4,
  },
  wind: {
    source: require('../../assets/sprites/battle/vfx/wind.png'),
    sheetWidth: 320, sheetHeight: 320, frameSize: 64, cols: 5, rows: 5,
  },
  claw_bite: {
    source: require('../../assets/sprites/battle/vfx/claw_bite.png'),
    sheetWidth: 320, sheetHeight: 320, frameSize: 64, cols: 5, rows: 5,
  },
  earth1: {
    source: require('../../assets/sprites/battle/vfx/earth1.png'),
    sheetWidth: 320, sheetHeight: 384, frameSize: 64, cols: 5, rows: 6,
  },
};

// Map combat moves to VFX animations
// Each move gets a visually appropriate VFX
export const MOVE_VFX: Record<string, VFXAnimDef> = {
  // Soldier moves — weapon slashes
  sword_slash:   { sheet: SHEETS.weapons_1, row: 0, frameCount: 5, duration: 400, scale: 1.2 },
  shield_bash:   { sheet: SHEETS.impact1,   row: 0, frameCount: 5, duration: 350 },
  quick_strike:  { sheet: SHEETS.weapons_1, row: 2, frameCount: 5, duration: 300, scale: 1.0 },
  war_cry:       { sheet: SHEETS.wind,      row: 0, frameCount: 5, duration: 500 },
  arrow_volley:  { sheet: SHEETS.weapons_2, row: 0, frameCount: 5, duration: 450, scale: 1.1 },

  // Beast moves — claws and bites
  claw_rake:     { sheet: SHEETS.claw_bite, row: 0, frameCount: 5, duration: 400, scale: 1.2 },
  fang_bite:     { sheet: SHEETS.claw_bite, row: 2, frameCount: 5, duration: 400, scale: 1.3 },
  wild_charge:   { sheet: SHEETS.impact1,   row: 2, frameCount: 5, duration: 400, scale: 1.4 },
  howl:          { sheet: SHEETS.wind,      row: 2, frameCount: 5, duration: 500 },
  venom_sting:   { sheet: SHEETS.darkness,  row: 0, frameCount: 5, duration: 400 },

  // Mythic moves — holy/energy effects
  divine_light:  { sheet: SHEETS.holy,      row: 0, frameCount: 5, duration: 500, scale: 1.3 },
  mantra_blast:  { sheet: SHEETS.explosion, row: 0, frameCount: 5, duration: 500, scale: 1.5 },
  spirit_heal:   { sheet: SHEETS.heal,      row: 0, frameCount: 5, duration: 600, scale: 1.2 },
  astral_strike: { sheet: SHEETS.lightning, row: 0, frameCount: 5, duration: 400, scale: 1.3 },

  // Automaton moves — earth/impact
  iron_fist:     { sheet: SHEETS.impact1,   row: 4, frameCount: 5, duration: 350, scale: 1.2 },
  stone_wall:    { sheet: SHEETS.earth1,    row: 0, frameCount: 5, duration: 500 },
  boulder_throw: { sheet: SHEETS.earth1,    row: 2, frameCount: 5, duration: 450, scale: 1.4 },
  grind:         { sheet: SHEETS.impact2,   row: 0, frameCount: 5, duration: 400 },

  // Naga moves — darkness/water
  serpent_strike: { sheet: SHEETS.claw_bite, row: 4, frameCount: 5, duration: 400, scale: 1.1 },
  venom_spray:   { sheet: SHEETS.darkness,  row: 2, frameCount: 5, duration: 450 },
  constrict:     { sheet: SHEETS.darkness,  row: 4, frameCount: 5, duration: 500, scale: 1.2 },
  mystic_coil:   { sheet: SHEETS.holy,      row: 2, frameCount: 5, duration: 450, scale: 1.2 },
};

// Special VFX for non-move actions
export const ACTION_VFX: Record<string, VFXAnimDef> = {
  defend:     { sheet: SHEETS.ice,       row: 0, frameCount: 5, duration: 400 },
  heal_item:  { sheet: SHEETS.heal,      row: 2, frameCount: 5, duration: 500, scale: 1.1 },
  enemy_hit:  { sheet: SHEETS.impact1,   row: 0, frameCount: 5, duration: 350 },
  level_up:   { sheet: SHEETS.holy,      row: 4, frameCount: 5, duration: 700, scale: 1.5 },
  victory:    { sheet: SHEETS.heal,      row: 4, frameCount: 5, duration: 600, scale: 1.3 },
};
