import { PixelGrid } from '../types';
import { PALETTE } from '../engine/constants';

const _ = null;
const sk = PALETTE.skin;
const sd = PALETTE.skinDark;
const bk = PALETTE.black;
const wh = PALETTE.white;

// Player character - 16x16 hero sprite (frame 1)
export const PLAYER_SPRITE: PixelGrid = [
  // Row 0 - top of hat
  [_, _, _, _, _, _, bk, bk, bk, bk, _, _, _, _, _, _],
  // Row 1
  [_, _, _, _, _, bk, '#2060c0', '#2060c0', '#2060c0', '#2060c0', bk, _, _, _, _, _],
  // Row 2 - hat brim
  [_, _, _, _, bk, '#2060c0', '#3080e0', '#3080e0', '#3080e0', '#2060c0', bk, _, _, _, _, _],
  // Row 3
  [_, _, _, bk, bk, bk, bk, bk, bk, bk, bk, bk, _, _, _, _],
  // Row 4 - hair / face top
  [_, _, _, bk, '#4a2800', sk, sk, sk, sk, sk, '#4a2800', bk, _, _, _, _],
  // Row 5 - eyes
  [_, _, _, bk, sk, bk, wh, sk, sk, wh, bk, bk, _, _, _, _],
  // Row 6 - face
  [_, _, _, bk, sk, sk, bk, sk, sk, bk, sk, bk, _, _, _, _],
  // Row 7 - mouth
  [_, _, _, _, bk, sk, sk, sd, sd, sk, bk, _, _, _, _, _],
  // Row 8 - neck/shirt top
  [_, _, _, _, _, bk, sk, sk, sk, bk, _, _, _, _, _, _],
  // Row 9 - shirt
  [_, _, _, _, bk, '#208020', '#30a030', '#30a030', '#30a030', '#208020', bk, _, _, _, _, _],
  // Row 10
  [_, _, _, bk, '#208020', '#30a030', '#30a030', '#e0c020', '#30a030', '#30a030', '#208020', bk, _, _, _, _],
  // Row 11 - arms/belt
  [_, _, bk, sk, bk, '#208020', '#30a030', '#30a030', '#30a030', '#208020', bk, sk, bk, _, _, _],
  // Row 12 - hands/pants
  [_, _, bk, sk, bk, '#1a1a6e', '#2828a0', '#2828a0', '#2828a0', '#1a1a6e', bk, sk, bk, _, _, _],
  // Row 13 - pants
  [_, _, _, bk, _, bk, '#2828a0', '#2828a0', '#2828a0', bk, _, bk, _, _, _, _],
  // Row 14 - boots
  [_, _, _, _, _, bk, '#5a3a1e', bk, bk, '#5a3a1e', bk, _, _, _, _, _],
  // Row 15
  [_, _, _, _, bk, bk, bk, _, _, bk, bk, bk, _, _, _, _],
];

// Player walk frame 2
export const PLAYER_SPRITE_WALK: PixelGrid = [
  [_, _, _, _, _, _, bk, bk, bk, bk, _, _, _, _, _, _],
  [_, _, _, _, _, bk, '#2060c0', '#2060c0', '#2060c0', '#2060c0', bk, _, _, _, _, _],
  [_, _, _, _, bk, '#2060c0', '#3080e0', '#3080e0', '#3080e0', '#2060c0', bk, _, _, _, _, _],
  [_, _, _, bk, bk, bk, bk, bk, bk, bk, bk, bk, _, _, _, _],
  [_, _, _, bk, '#4a2800', sk, sk, sk, sk, sk, '#4a2800', bk, _, _, _, _],
  [_, _, _, bk, sk, bk, wh, sk, sk, wh, bk, bk, _, _, _, _],
  [_, _, _, bk, sk, sk, bk, sk, sk, bk, sk, bk, _, _, _, _],
  [_, _, _, _, bk, sk, sk, sd, sd, sk, bk, _, _, _, _, _],
  [_, _, _, _, _, bk, sk, sk, sk, bk, _, _, _, _, _, _],
  [_, _, _, _, bk, '#208020', '#30a030', '#30a030', '#30a030', '#208020', bk, _, _, _, _, _],
  [_, _, _, bk, '#208020', '#30a030', '#30a030', '#e0c020', '#30a030', '#30a030', '#208020', bk, _, _, _, _],
  [_, _, bk, sk, bk, '#208020', '#30a030', '#30a030', '#30a030', '#208020', bk, sk, bk, _, _, _],
  [_, _, _, bk, _, bk, '#2828a0', '#2828a0', '#2828a0', bk, _, bk, _, _, _, _],
  // Walk - legs spread
  [_, _, _, _, bk, '#1a1a6e', bk, _, _, bk, '#1a1a6e', bk, _, _, _, _],
  [_, _, _, bk, '#5a3a1e', bk, _, _, _, _, bk, '#5a3a1e', bk, _, _, _],
  [_, _, _, bk, bk, _, _, _, _, _, _, bk, bk, _, _, _],
];

// NPC - Elder (old man with beard)
export const ELDER_SPRITE: PixelGrid = [
  [_, _, _, _, _, _, bk, bk, bk, bk, _, _, _, _, _, _],
  [_, _, _, _, _, bk, '#808080', '#a0a0a0', '#a0a0a0', '#808080', bk, _, _, _, _, _],
  [_, _, _, _, bk, '#808080', '#a0a0a0', '#a0a0a0', '#a0a0a0', '#808080', bk, _, _, _, _, _],
  [_, _, _, bk, bk, bk, bk, bk, bk, bk, bk, bk, _, _, _, _],
  [_, _, _, bk, '#a0a0a0', sk, sk, sk, sk, sk, '#a0a0a0', bk, _, _, _, _],
  [_, _, _, bk, sk, bk, wh, sk, sk, wh, bk, bk, _, _, _, _],
  [_, _, _, bk, sk, sk, bk, sk, sk, bk, sk, bk, _, _, _, _],
  [_, _, _, bk, sk, sk, sk, sd, sd, sk, sk, bk, _, _, _, _],
  [_, _, _, bk, wh, wh, wh, wh, wh, wh, wh, bk, _, _, _, _],
  [_, _, _, _, bk, '#602020', '#803030', '#803030', '#803030', '#602020', bk, _, _, _, _, _],
  [_, _, _, bk, '#602020', '#803030', '#803030', '#e0c020', '#803030', '#803030', '#602020', bk, _, _, _, _],
  [_, _, bk, sk, bk, '#602020', '#803030', '#803030', '#803030', '#602020', bk, sk, bk, _, _, _],
  [_, _, _, bk, _, bk, '#3a2010', '#3a2010', '#3a2010', bk, _, bk, _, _, _, _],
  [_, _, _, _, _, bk, '#3a2010', '#3a2010', '#3a2010', bk, _, _, _, _, _, _],
  [_, _, _, _, _, bk, '#5a3a1e', bk, bk, '#5a3a1e', bk, _, _, _, _, _],
  [_, _, _, _, bk, bk, bk, _, _, bk, bk, bk, _, _, _, _],
];

// NPC - Merchant (hat and apron)
export const MERCHANT_SPRITE: PixelGrid = [
  [_, _, _, _, _, bk, bk, bk, bk, bk, bk, _, _, _, _, _],
  [_, _, _, _, bk, '#c06000', '#e08020', '#e08020', '#e08020', '#c06000', bk, _, _, _, _, _],
  [_, _, _, bk, '#c06000', '#e08020', '#e08020', '#e08020', '#e08020', '#c06000', bk, _, _, _, _],
  [_, _, _, bk, bk, bk, bk, bk, bk, bk, bk, bk, _, _, _, _],
  [_, _, _, bk, '#4a2800', sk, sk, sk, sk, sk, '#4a2800', bk, _, _, _, _],
  [_, _, _, bk, sk, bk, wh, sk, sk, wh, bk, sk, bk, _, _, _],
  [_, _, _, bk, sk, sk, bk, sk, sk, bk, sk, sk, bk, _, _, _],
  [_, _, _, _, bk, sk, sk, '#c03030', sk, sk, bk, _, _, _, _, _],
  [_, _, _, _, _, bk, sk, sk, sk, bk, _, _, _, _, _, _],
  [_, _, _, _, bk, wh, wh, wh, wh, wh, wh, bk, _, _, _, _],
  [_, _, _, bk, '#208020', wh, wh, '#e0c020', wh, wh, '#208020', bk, _, _, _, _],
  [_, _, bk, sk, bk, wh, wh, wh, wh, wh, bk, sk, bk, _, _, _],
  [_, _, _, bk, _, bk, '#3a2010', '#3a2010', '#3a2010', bk, _, bk, _, _, _, _],
  [_, _, _, _, _, bk, '#3a2010', '#3a2010', '#3a2010', bk, _, _, _, _, _, _],
  [_, _, _, _, _, bk, '#5a3a1e', bk, bk, '#5a3a1e', bk, _, _, _, _, _],
  [_, _, _, _, bk, bk, bk, _, _, bk, bk, bk, _, _, _, _],
];

// NPC - Guard (armor)
export const GUARD_SPRITE: PixelGrid = [
  [_, _, _, _, _, _, bk, bk, bk, bk, _, _, _, _, _, _],
  [_, _, _, _, _, bk, '#808080', '#a0a0a0', '#a0a0a0', '#808080', bk, _, _, _, _, _],
  [_, _, _, _, bk, '#808080', '#a0a0a0', '#c0c0c0', '#a0a0a0', '#808080', bk, _, _, _, _, _],
  [_, _, _, bk, bk, bk, bk, bk, bk, bk, bk, bk, _, _, _, _],
  [_, _, _, bk, bk, sk, sk, sk, sk, sk, bk, bk, _, _, _, _],
  [_, _, _, bk, sk, bk, wh, sk, sk, wh, bk, bk, _, _, _, _],
  [_, _, _, bk, sk, sk, bk, sk, sk, bk, sk, bk, _, _, _, _],
  [_, _, _, _, bk, sk, sk, sd, sd, sk, bk, _, _, _, _, _],
  [_, _, _, _, _, bk, sk, sk, sk, bk, _, _, _, _, _, _],
  [_, _, _, bk, '#606060', '#808080', '#a0a0a0', '#a0a0a0', '#a0a0a0', '#808080', '#606060', bk, _, _, _, _],
  [_, _, bk, '#606060', '#808080', '#a0a0a0', '#a0a0a0', '#c0c0c0', '#a0a0a0', '#a0a0a0', '#808080', '#606060', bk, _, _, _],
  [_, bk, '#5a3a1e', bk, '#606060', '#808080', '#a0a0a0', '#a0a0a0', '#a0a0a0', '#808080', '#606060', bk, '#a0a0a0', bk, _, _],
  [_, _, bk, _, bk, '#3a2010', '#3a2010', '#3a2010', '#3a2010', '#3a2010', bk, _, bk, _, _, _],
  [_, _, _, _, _, bk, '#3a2010', '#3a2010', '#3a2010', bk, _, _, _, _, _, _],
  [_, _, _, _, bk, '#606060', '#808080', bk, bk, '#808080', '#606060', bk, _, _, _, _],
  [_, _, _, _, bk, bk, bk, _, _, bk, bk, bk, _, _, _, _],
];
