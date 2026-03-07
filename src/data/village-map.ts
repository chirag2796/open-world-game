import { TileMapData, TileType as T, NPC } from '../types';
import { ELDER_SPRITE, MERCHANT_SPRITE, GUARD_SPRITE } from '../sprites/characters';

// 30x30 tile village map
// Legend:
// 0=Grass, 1=Path, 2=Water, 3=StoneWall, 4=WoodWall, 5=Door
// 6=Tree, 7=FlowerRed, 8=FlowerYellow, 9=Bridge, 10=Roof, 11=Fence
// 12=Sign, 13=Well, 14=Chest

const G = T.GRASS;
const P = T.PATH;
const W = T.WATER;
const S = T.WALL_STONE;
const WD = T.WALL_WOOD;
const D = T.DOOR;
const TR = T.TREE;
const FR = T.FLOWER_RED;
const FY = T.FLOWER_YELLOW;
const BR = T.BRIDGE;
const RF = T.ROOF;
const FN = T.FENCE;
const SN = T.SIGN;
const WL = T.WELL;
const CH = T.CHEST;

// Ground layer - base terrain
const ground: T[][] = [
  // Row 0 - top edge (trees/water border)
  [TR, TR, TR, TR, TR, TR, W,  W,  W,  W,  W,  W,  W,  TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR],
  // Row 1
  [TR, TR, TR, G,  G,  TR, W,  W,  W,  W,  W,  W,  W,  TR, G,  G,  G,  G,  G,  G,  G,  TR, TR, G,  G,  G,  G,  TR, TR, TR],
  // Row 2
  [TR, G,  G,  G,  FY, G,  W,  W,  W,  W,  W,  W,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR, TR],
  // Row 3
  [TR, G,  G,  G,  G,  G,  G,  W,  W,  W,  W,  W,  G,  G,  G,  RF, RF, RF, G,  G,  G,  G,  G,  G,  FR, FR, G,  G,  G,  TR],
  // Row 4
  [TR, G,  FR, G,  G,  G,  G,  G,  W,  W,  W,  G,  G,  G,  G,  RF, S,  RF, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR],
  // Row 5
  [TR, G,  G,  G,  G,  G,  G,  G,  G,  BR, G,  G,  G,  P,  P,  P,  D,  P,  P,  P,  P,  P,  P,  G,  G,  G,  G,  G,  G,  TR],
  // Row 6
  [TR, G,  G,  G,  G,  G,  G,  G,  G,  P,  G,  G,  G,  P,  G,  RF, S,  RF, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR],
  // Row 7
  [TR, G,  FY, G,  G,  G,  G,  G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  FN, FN, FN, FN, FN, G,  G,  G,  TR],
  // Row 8
  [TR, G,  G,  G,  G,  G,  G,  G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  FN, G,  G,  G,  FN, G,  G,  G,  TR],
  // Row 9  - main east-west path
  [TR, G,  G,  G,  G,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  G,  G,  G,  FN, G,  G,  G,  TR],
  // Row 10
  [TR, G,  G,  G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  FN, G,  G,  G,  FN, G,  G,  G,  TR],
  // Row 11
  [TR, G,  G,  G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  FN, FN, FN, FN, FN, G,  G,  G,  TR],
  // Row 12
  [TR, G,  FR, G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  RF, RF, RF, G,  G,  G,  G,  G,  G,  G,  G,  G,  TR],
  // Row 13
  [TR, G,  G,  G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  RF, WD, RF, G,  G,  G,  G,  G,  G,  G,  G,  TR, TR],
  // Row 14
  [TR, G,  G,  G,  G,  P,  RF, RF, RF, P,  G,  G,  G,  P,  P,  P,  P,  P,  D,  P,  P,  P,  G,  G,  G,  G,  G,  TR, TR, TR],
  // Row 15
  [TR, G,  G,  G,  G,  P,  RF, WD, RF, P,  G,  G,  G,  P,  G,  G,  G,  RF, WD, RF, G,  G,  G,  G,  G,  G,  G,  G,  TR, TR],
  // Row 16
  [TR, G,  G,  G,  G,  P,  P,  D,  P,  P,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR],
  // Row 17
  [TR, G,  G,  G,  G,  P,  RF, WD, RF, P,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  TR, G,  G,  G,  TR, G,  G,  TR],
  // Row 18
  [TR, G,  G,  G,  G,  G,  G,  G,  G,  P,  G,  G,  G,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR],
  // Row 19
  [TR, G,  FY, G,  G,  G,  G,  G,  G,  P,  P,  P,  P,  P,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR],
  // Row 20
  [TR, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR, G,  G,  G,  TR, G,  G,  TR],
  // Row 21
  [TR, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  FR, FR, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR],
  // Row 22
  [TR, G,  G,  TR, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR, TR],
  // Row 23
  [TR, G,  G,  G,  G,  G,  G,  FY, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  FY, G,  TR, TR, TR],
  // Row 24
  [TR, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR, TR],
  // Row 25
  [TR, G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  W,  W,  W,  W,  W,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR],
  // Row 26
  [TR, TR, G,  G,  G,  G,  G,  G,  G,  G,  G,  W,  W,  W,  W,  W,  W,  W,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR],
  // Row 27
  [TR, TR, TR, G,  G,  G,  G,  G,  G,  G,  G,  W,  W,  W,  W,  W,  W,  W,  W,  G,  G,  G,  G,  G,  G,  G,  G,  G,  TR, TR],
  // Row 28
  [TR, TR, TR, TR, G,  G,  G,  G,  G,  G,  G,  G,  W,  W,  W,  W,  W,  W,  G,  G,  G,  G,  G,  G,  G,  G,  TR, TR, TR, TR],
  // Row 29 - bottom edge
  [TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR],
];

// Objects layer - things on top of ground (null = nothing)
const objects: (T | null)[][] = Array.from({ length: 30 }, (_, y) =>
  Array.from({ length: 30 }, () => null)
);

// Place objects on the map
// Well in the village center
objects[10][9] = WL;

// Sign near the bridge
objects[6][8] = SN;

// Chest in the fenced area
objects[9][23] = CH;

export const VILLAGE_MAP: TileMapData = {
  width: 30,
  height: 30,
  layers: {
    ground,
    objects,
  },
};

// NPC definitions with positions
export const VILLAGE_NPCS: NPC[] = [
  {
    id: 'elder',
    name: 'Elder Orin',
    position: { x: 11, y: 9 }, // near the village center path
    direction: 'down',
    sprite: ELDER_SPRITE,
    dialog: [
      'Welcome, young adventurer!',
      'This is Willowdale Village...',
      'We have lived here in peace for many years.',
      'But lately, strange creatures have been seen in the forest to the north...',
      'Be careful if you venture beyond the village walls!',
      'Talk to the merchant if you need supplies.',
    ],
  },
  {
    id: 'merchant',
    name: 'Merchant Bram',
    position: { x: 18, y: 16 }, // near the shop
    direction: 'down',
    sprite: MERCHANT_SPRITE,
    dialog: [
      'Ah, a customer!',
      'Welcome to my humble shop!',
      'I have potions, swords, and shields...',
      'Well, I would if this were a full game!',
      'For now, enjoy exploring the village!',
    ],
  },
  {
    id: 'guard',
    name: 'Guard Kael',
    position: { x: 5, y: 5 }, // near the bridge
    direction: 'right',
    sprite: GUARD_SPRITE,
    dialog: [
      'Halt! Who goes there?',
      '...Oh, it is just you.',
      'The bridge to the west leads outside the village.',
      'I would not recommend crossing it at night.',
      'There are wolves in those woods!',
    ],
  },
];

// Player starting position
export const PLAYER_START = { x: 9, y: 12 };
