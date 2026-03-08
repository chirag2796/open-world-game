import React, { memo, useMemo } from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';
import { TileType, TileMapData } from '../types';
import { SCALED_TILE, VIEWPORT_TILES_X, VIEWPORT_TILES_Y, GAME_AREA_HEIGHT, SCREEN_WIDTH } from '../engine/constants';

// ─── Types ──────────────────────────────────────────────────
type Sprite = { source: ImageSourcePropType; w: number; h: number };

// Decoration result — supports both individual sprites and sprite sheet frames
type DecorResult = {
  source: ImageSourcePropType;
  w: number;
  h: number;
  offsetY: number;
  // If set, render as a sheet frame (overflow:hidden crop)
  sheetW?: number;
  sheetH?: number;
  srcX?: number;
  srcY?: number;
};

// Sheet frame definition for sprite sheet extraction
type SheetFrame = {
  source: ImageSourcePropType;
  sheetW: number;
  sheetH: number;
  srcX: number;
  srcY: number;
  frameW: number;
  frameH: number;
};

// ─── Individual Sprite Assets ───────────────────────────────

// Trees — Fan-tasy emerald series
const TREE_SPRITES: Sprite[] = [
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_1.png'), w: 64, h: 63 },
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_2.png'), w: 46, h: 63 },
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_3.png'), w: 52, h: 92 },
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_4.png'), w: 48, h: 93 },
];
const PALM_TREE: Sprite = { source: require('../../assets/sprites/decorations/trees/Oak_Tree.png'), w: 64, h: 80 };
const OAK_SMALL: Sprite = { source: require('../../assets/sprites/decorations/trees/Oak_Tree_Small.png'), w: 48, h: 48 };

// Bushes
const BUSH_SPRITES: Sprite[] = [
  { source: require('../../assets/sprites/decorations/bushes/Bush_Emerald_1.png'), w: 40, h: 29 },
  { source: require('../../assets/sprites/decorations/bushes/Bush_Emerald_2.png'), w: 48, h: 16 },
  { source: require('../../assets/sprites/decorations/bushes/Bush_Emerald_3.png'), w: 28, h: 28 },
];

// Buildings
const HOUSE_HAY_SMALL: Sprite = { source: require('../../assets/sprites/decorations/buildings/House_Hay_1.png'), w: 89, h: 91 };
const HOUSE_HAY_LARGE: Sprite = { source: require('../../assets/sprites/decorations/buildings/House_Hay_2.png'), w: 157, h: 112 };
const HOUSE_HAY_3: Sprite = { source: require('../../assets/sprites/decorations/buildings/House_Hay_3.png'), w: 175, h: 128 };
const HOUSE_PURPLE: Sprite = { source: require('../../assets/sprites/decorations/buildings/House_Hay_4_Purple.png'), w: 128, h: 128 };
const HOUSE_BLUE: Sprite = { source: require('../../assets/sprites/decorations/buildings/House_1_Wood_Base_Blue.png'), w: 96, h: 128 };
const WELL_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/buildings/Well_Hay_1.png'), w: 56, h: 74 };
const GATE_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/buildings/CityWall_Gate_1.png'), w: 80, h: 96 };

// Rocks
const ROCK_SPRITES: Sprite[] = [
  { source: require('../../assets/sprites/decorations/rocks/Rock_Brown_1.png'), w: 22, h: 18 },
  { source: require('../../assets/sprites/decorations/rocks/Rock_Brown_2.png'), w: 16, h: 14 },
  { source: require('../../assets/sprites/decorations/rocks/Rock_Brown_4.png'), w: 32, h: 21 },
  { source: require('../../assets/sprites/decorations/rocks/Rock_Brown_6.png'), w: 16, h: 11 },
  { source: require('../../assets/sprites/decorations/rocks/Rock_Brown_9.png'), w: 46, h: 33 },
];

// Props — individual
const SIGN_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Sign_1.png'), w: 24, h: 22 };
const CHOPPED_TREE: Sprite = { source: require('../../assets/sprites/decorations/props/Chopped_Tree_1.png'), w: 32, h: 22 };
const BARREL_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Barrel_Small_Empty.png'), w: 16, h: 20 };
const CRATE_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Crate_Medium_Closed.png'), w: 16, h: 21 };
const CRATE_LARGE: Sprite = { source: require('../../assets/sprites/decorations/props/Crate_Large_Empty.png'), w: 24, h: 29 };
const HAYSTACK_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/HayStack_2.png'), w: 29, h: 32 };
const LAMP_POST: Sprite = { source: require('../../assets/sprites/decorations/props/LampPost_3.png'), w: 46, h: 62 };
const BANNER_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Banner_Stick_1_Purple.png'), w: 24, h: 59 };
const BENCH_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Bench_1.png'), w: 14, h: 30 };
const BENCH_3: Sprite = { source: require('../../assets/sprites/decorations/props/Bench_3.png'), w: 14, h: 14 };
const FENCE_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Fences.png'), w: 64, h: 64 };
const TABLE: Sprite = { source: require('../../assets/sprites/decorations/props/Table_Medium_1.png'), w: 42, h: 39 };
const FIREPLACE: Sprite = { source: require('../../assets/sprites/decorations/props/Fireplace_1.png'), w: 30, h: 26 };
const CHEST: Sprite = { source: require('../../assets/sprites/decorations/props/Chest.png'), w: 16, h: 16 };
const SACK: Sprite = { source: require('../../assets/sprites/decorations/props/Sack_3.png'), w: 16, h: 16 };
const BASKET: Sprite = { source: require('../../assets/sprites/decorations/props/Basket_Empty.png'), w: 16, h: 16 };
const PLANT: Sprite = { source: require('../../assets/sprites/decorations/props/Plant_2.png'), w: 16, h: 16 };

// ─── Sprite Sheet Frame Sources ─────────────────────────────

// Pixel Crawler trees — seasonal variants in sprite sheets
const PC_TREE_01_SRC = require('../../assets/sprites/decorations/trees/pc/Tree_01_M.png');
// 208x192: 4 cols × 2 rows = 52×96 per frame (green, autumn, bare, icy)
const TREE_DECIDUOUS_GREEN: SheetFrame = { source: PC_TREE_01_SRC, sheetW: 208, sheetH: 192, srcX: 0, srcY: 0, frameW: 52, frameH: 96 };
const TREE_DECIDUOUS_AUTUMN: SheetFrame = { source: PC_TREE_01_SRC, sheetW: 208, sheetH: 192, srcX: 52, srcY: 0, frameW: 52, frameH: 96 };
const TREE_DECIDUOUS_BARE: SheetFrame = { source: PC_TREE_01_SRC, sheetW: 208, sheetH: 192, srcX: 104, srcY: 0, frameW: 52, frameH: 96 };
const TREE_DECIDUOUS_ICY: SheetFrame = { source: PC_TREE_01_SRC, sheetW: 208, sheetH: 192, srcX: 156, srcY: 0, frameW: 52, frameH: 96 };

const PC_TREE_02_SRC = require('../../assets/sprites/decorations/trees/pc/Tree_02_M.png');
// 144x160: 4 cols × 2 rows = 36×80 per frame (green, dark green, darker, bare)
const TREE_CONIFER_GREEN: SheetFrame = { source: PC_TREE_02_SRC, sheetW: 144, sheetH: 160, srcX: 0, srcY: 0, frameW: 36, frameH: 80 };
const TREE_CONIFER_DARK: SheetFrame = { source: PC_TREE_02_SRC, sheetW: 144, sheetH: 160, srcX: 36, srcY: 0, frameW: 36, frameH: 80 };
const TREE_CONIFER_TEAL: SheetFrame = { source: PC_TREE_02_SRC, sheetW: 144, sheetH: 160, srcX: 72, srcY: 0, frameW: 36, frameH: 80 };

const PC_TREE_03_SRC = require('../../assets/sprites/decorations/trees/pc/Tree_03_M.png');
// 192x288: 3 cols × 2 rows = 64×144 per frame (green, autumn, red)
const TREE_TALL_GREEN: SheetFrame = { source: PC_TREE_03_SRC, sheetW: 192, sheetH: 288, srcX: 0, srcY: 0, frameW: 64, frameH: 144 };
const TREE_TALL_AUTUMN: SheetFrame = { source: PC_TREE_03_SRC, sheetW: 192, sheetH: 288, srcX: 64, srcY: 0, frameW: 64, frameH: 144 };
const TREE_TALL_RED: SheetFrame = { source: PC_TREE_03_SRC, sheetW: 192, sheetH: 288, srcX: 128, srcY: 0, frameW: 64, frameH: 144 };

// Animated sprite first frames (campfire, flowers)
const CAMPFIRE_SRC = require('../../assets/sprites/decorations/props/Campfire.png');
// 256x32: 8 frames of 32×32
const CAMPFIRE_FRAME: SheetFrame = { source: CAMPFIRE_SRC, sheetW: 256, sheetH: 32, srcX: 0, srcY: 0, frameW: 32, frameH: 32 };

const FLOWERS_RED_SRC = require('../../assets/sprites/decorations/props/Flowers_Red.png');
// 768x32: 24 frames of 32×32
const FLOWERS_RED_FRAME: SheetFrame = { source: FLOWERS_RED_SRC, sheetW: 768, sheetH: 32, srcX: 0, srcY: 0, frameW: 32, frameH: 32 };

const FLOWERS_WHITE_SRC = require('../../assets/sprites/decorations/props/Flowers_White.png');
const FLOWERS_WHITE_FRAME: SheetFrame = { source: FLOWERS_WHITE_SRC, sheetW: 768, sheetH: 32, srcX: 0, srcY: 0, frameW: 32, frameH: 32 };

// Outdoor_Decor_Free: 112x192, roughly 16px grid (7 cols × 12 rows)
const OUTDOOR_DECOR_SRC = require('../../assets/sprites/decorations/props/Outdoor_Decor_Free.png');
const DECOR_BUSH_SM: SheetFrame = { source: OUTDOOR_DECOR_SRC, sheetW: 112, sheetH: 192, srcX: 0, srcY: 0, frameW: 16, frameH: 16 };
const DECOR_PLANTER: SheetFrame = { source: OUTDOOR_DECOR_SRC, sheetW: 112, sheetH: 192, srcX: 80, srcY: 0, frameW: 16, frameH: 16 };
const DECOR_ROCK_GRAY_1: SheetFrame = { source: OUTDOOR_DECOR_SRC, sheetW: 112, sheetH: 192, srcX: 0, srcY: 48, frameW: 16, frameH: 16 };
const DECOR_ROCK_GRAY_2: SheetFrame = { source: OUTDOOR_DECOR_SRC, sheetW: 112, sheetH: 192, srcX: 16, srcY: 48, frameW: 16, frameH: 16 };
const DECOR_FLOWER_RED: SheetFrame = { source: OUTDOOR_DECOR_SRC, sheetW: 112, sheetH: 192, srcX: 0, srcY: 112, frameW: 16, frameH: 16 };
const DECOR_FLOWER_PINK: SheetFrame = { source: OUTDOOR_DECOR_SRC, sheetW: 112, sheetH: 192, srcX: 16, srcY: 112, frameW: 16, frameH: 16 };
const DECOR_LOG: SheetFrame = { source: OUTDOOR_DECOR_SRC, sheetW: 112, sheetH: 192, srcX: 80, srcY: 144, frameW: 16, frameH: 16 };

// ─── Helpers ────────────────────────────────────────────────

function tileHash(x: number, y: number): number {
  return ((x * 7919 + y * 6271) & 0xffff) / 0xffff;
}

// Second hash for independent randomness
function tileHash2(x: number, y: number): number {
  return ((x * 3571 + y * 8467) & 0xffff) / 0xffff;
}

function bldg(sprite: Sprite): DecorResult {
  return { ...sprite, offsetY: -(sprite.h - SCALED_TILE) };
}

function prop(sprite: Sprite, lift = 0): DecorResult {
  return { ...sprite, offsetY: SCALED_TILE - sprite.h - lift };
}

// Create a building-style result from a sheet frame (renders above tile)
function sheetBldg(frame: SheetFrame): DecorResult {
  return {
    source: frame.source,
    w: frame.frameW,
    h: frame.frameH,
    offsetY: -(frame.frameH - SCALED_TILE),
    sheetW: frame.sheetW,
    sheetH: frame.sheetH,
    srcX: frame.srcX,
    srcY: frame.srcY,
  };
}

// Create a ground-level result from a sheet frame
function sheetProp(frame: SheetFrame, lift = 0): DecorResult {
  return {
    source: frame.source,
    w: frame.frameW,
    h: frame.frameH,
    offsetY: SCALED_TILE - frame.frameH - lift,
    sheetW: frame.sheetW,
    sheetH: frame.sheetH,
    srcX: frame.srcX,
    srcY: frame.srcY,
  };
}

function pickFrom<T>(arr: T[], hash: number): T {
  return arr[Math.floor(hash * arr.length) % arr.length];
}

// ─── Biome-Specific Tree Sets ───────────────────────────────

const FOREST_TREES = [...TREE_SPRITES, OAK_SMALL]; // 5 variants

// Conifer frames for Himalayan/pine forests
const CONIFER_FRAMES: SheetFrame[] = [TREE_CONIFER_GREEN, TREE_CONIFER_DARK, TREE_CONIFER_TEAL];

// Deciduous frames for temperate forests
const DECIDUOUS_FRAMES: SheetFrame[] = [TREE_DECIDUOUS_GREEN, TREE_DECIDUOUS_AUTUMN];

// Winter/snow tree frames
const WINTER_TREE_FRAMES: SheetFrame[] = [TREE_DECIDUOUS_ICY, TREE_DECIDUOUS_BARE];

// Tall tree frames for dense jungle
const TALL_TREE_FRAMES: SheetFrame[] = [TREE_TALL_GREEN, TREE_TALL_AUTUMN, TREE_TALL_RED];

// ─── Market / Village Prop Sets ─────────────────────────────

const MARKET_PROPS: Sprite[] = [BARREL_SPRITE, CRATE_SPRITE, CRATE_LARGE, SACK, BASKET, HAYSTACK_SPRITE, TABLE, CHEST];
const VILLAGE_PROPS: Sprite[] = [BARREL_SPRITE, CRATE_SPRITE, BENCH_SPRITE, BENCH_3, SACK, BASKET];
const FORT_PROPS: Sprite[] = [BARREL_SPRITE, CRATE_LARGE, BANNER_SPRITE];
const PALACE_PROPS: Sprite[] = [LAMP_POST, BENCH_SPRITE, PLANT];
const HOUSE_VARIANTS: Sprite[] = [HOUSE_HAY_SMALL, HOUSE_BLUE, HOUSE_HAY_3, HOUSE_HAY_LARGE, HOUSE_PURPLE];

// ─── Decoration Selection ───────────────────────────────────

function getDecorationForTile(
  tileType: TileType,
  x: number,
  y: number,
): DecorResult | null {
  const hash = tileHash(x, y);
  const hash2 = tileHash2(x, y);

  switch (tileType) {
    // ═══════════════════════════════════════════════════════
    // TREES & FORESTS
    // ═══════════════════════════════════════════════════════

    case TileType.FOREST: {
      // Mix of Fan-tasy emerald trees + PC deciduous for variety
      if (hash < 0.6) return bldg(pickFrom(FOREST_TREES, hash));
      // PC deciduous green trees
      return sheetBldg(pickFrom(DECIDUOUS_FRAMES, hash2));
    }

    case TileType.TREE_BANYAN: {
      // Large spreading trees — tall variants
      if (hash < 0.5) return bldg(pickFrom(TREE_SPRITES.slice(2), hash)); // taller emerald trees
      return sheetBldg(TREE_TALL_GREEN);
    }

    case TileType.DENSE_JUNGLE: {
      // Dense canopy — mix of tall trees and emerald
      if (hash < 0.4) return bldg(TREE_SPRITES[Math.floor(hash * 4) % 4]);
      if (hash < 0.7) return sheetBldg(pickFrom(TALL_TREE_FRAMES, hash2));
      return sheetBldg(pickFrom(DECIDUOUS_FRAMES, hash2));
    }

    case TileType.BAMBOO: {
      // Bamboo groves — use tall green trees + emerald
      if (hash < 0.5) return sheetBldg(TREE_TALL_GREEN);
      return bldg(TREE_SPRITES[Math.floor(hash2 * 2) % 2]);
    }

    case TileType.TREE_PINE: {
      // Himalayan conifers — PC pine sprites
      return sheetBldg(pickFrom(CONIFER_FRAMES, hash));
    }

    case TileType.TREE_PALM:
    case TileType.MANGROVE: {
      // Tropical trees
      if (hash < 0.7) return bldg(PALM_TREE);
      return bldg(OAK_SMALL);
    }

    // ═══════════════════════════════════════════════════════
    // SNOW & ICE — Himalayan highlands
    // ═══════════════════════════════════════════════════════

    case TileType.SNOW: {
      if (hash > 0.12) return null;
      // Sparse icy/bare trees and gray rocks
      if (hash < 0.05) return sheetBldg(pickFrom(WINTER_TREE_FRAMES, hash2));
      if (hash < 0.08) return sheetProp(DECOR_ROCK_GRAY_1, 2);
      return sheetProp(DECOR_ROCK_GRAY_2, 2);
    }

    case TileType.ICE: {
      if (hash > 0.06) return null;
      return sheetProp(DECOR_ROCK_GRAY_1, 2);
    }

    // ═══════════════════════════════════════════════════════
    // GRASS / GROUND COVER
    // ═══════════════════════════════════════════════════════

    case TileType.PLAINS: {
      if (hash > 0.08) return null;
      // Very sparse — occasional flowers, tiny bush
      if (hash < 0.03) return sheetProp(hash2 < 0.5 ? DECOR_FLOWER_RED : DECOR_FLOWER_PINK, 2);
      if (hash < 0.06) return sheetProp(DECOR_BUSH_SM, 2);
      return prop(OAK_SMALL);
    }

    case TileType.TALL_GRASS: {
      if (hash > 0.35) return null;
      if (hash < 0.15) return prop(pickFrom(BUSH_SPRITES, hash2 * 3), 4);
      return sheetProp(DECOR_BUSH_SM, 2);
    }

    case TileType.FLOWERS: {
      if (hash > 0.5) return null;
      // Mix of bush sprites and flower sheet frames
      if (hash < 0.2) return sheetProp(FLOWERS_RED_FRAME, 2);
      if (hash < 0.35) return sheetProp(FLOWERS_WHITE_FRAME, 2);
      return sheetProp(hash2 < 0.5 ? DECOR_FLOWER_RED : DECOR_FLOWER_PINK, 2);
    }

    case TileType.SWAMP: {
      if (hash > 0.25) return null;
      if (hash < 0.1) return prop(BUSH_SPRITES[1], 2);
      if (hash < 0.18) return sheetProp(DECOR_LOG, 2);
      return prop(CHOPPED_TREE, 2);
    }

    case TileType.FARM: {
      if (hash > 0.3) return null;
      if (hash < 0.12) return prop(HAYSTACK_SPRITE);
      if (hash < 0.2) return prop(CRATE_SPRITE);
      return prop(BARREL_SPRITE);
    }

    case TileType.GARDEN:
    case TileType.CHARBAGH: {
      if (hash > 0.45) return null;
      if (hash < 0.15) return sheetProp(FLOWERS_RED_FRAME, 2);
      if (hash < 0.25) return sheetProp(FLOWERS_WHITE_FRAME, 2);
      if (hash < 0.35) return prop(BUSH_SPRITES[0], 4);
      return sheetProp(DECOR_PLANTER, 2);
    }

    case TileType.PIETRA_DURA: {
      if (hash > 0.3) return null;
      // Inlay gardens — flowers and planters
      if (hash < 0.15) return sheetProp(DECOR_FLOWER_PINK, 2);
      return prop(PLANT);
    }

    case TileType.DRY_GRASS: {
      if (hash > 0.06) return null;
      return prop(pickFrom(ROCK_SPRITES.slice(3), hash2 * 5), 2); // small rocks only
    }

    // ═══════════════════════════════════════════════════════
    // DESERT — sparse and dry
    // ═══════════════════════════════════════════════════════

    case TileType.DESERT: {
      if (hash > 0.04) return null;
      // Very sparse — tiny rocks
      return prop(ROCK_SPRITES[hash2 < 0.5 ? 1 : 3], 2);
    }

    case TileType.SAND_DUNES: {
      if (hash > 0.05) return null;
      return prop(ROCK_SPRITES[3], 2);
    }

    case TileType.CRACKED_EARTH: {
      if (hash > 0.07) return null;
      if (hash < 0.04) return prop(pickFrom(ROCK_SPRITES.slice(0, 3), hash2 * 5), 2);
      return prop(CHOPPED_TREE, 2); // dead wood
    }

    case TileType.CACTUS: {
      // Use a bush sprite tinted for cactus look
      return prop(BUSH_SPRITES[2], 4);
    }

    // ═══════════════════════════════════════════════════════
    // ROCKS / MOUNTAINS / CLIFFS
    // ═══════════════════════════════════════════════════════

    case TileType.MOUNTAIN: {
      if (hash > 0.18) return null;
      // Mountains: mix of brown rocks and gray rocks
      if (hash < 0.06) return prop(pickFrom(ROCK_SPRITES.slice(2), hash2 * 5), 2); // larger rocks
      if (hash < 0.12) return sheetProp(DECOR_ROCK_GRAY_1, 2);
      return sheetProp(DECOR_ROCK_GRAY_2, 2);
    }

    case TileType.CLIFF: {
      if (hash > 0.2) return null;
      if (hash < 0.1) return prop(ROCK_SPRITES[4], 2); // large rock
      return sheetProp(DECOR_ROCK_GRAY_1, 2);
    }

    case TileType.ROCKY_PATH: {
      if (hash > 0.25) return null;
      return prop(pickFrom(ROCK_SPRITES, hash2 * 10), 2);
    }

    case TileType.ROCKS:
    case TileType.BOULDER: {
      if (hash > 0.35) return null;
      if (hash < 0.15) return prop(ROCK_SPRITES[4], 2); // large rock
      return prop(pickFrom(ROCK_SPRITES, hash2 * 10), 2);
    }

    case TileType.PLATEAU: {
      if (hash > 0.1) return null;
      if (hash < 0.05) return prop(pickFrom(ROCK_SPRITES.slice(0, 3), hash2 * 5), 2);
      return sheetProp(DECOR_ROCK_GRAY_2, 2);
    }

    case TileType.FALLEN_LOG: {
      if (hash < 0.6) return prop(CHOPPED_TREE, 2);
      return sheetProp(DECOR_LOG, 2);
    }

    // ═══════════════════════════════════════════════════════
    // VILLAGE HOUSES — varied building styles
    // ═══════════════════════════════════════════════════════

    case TileType.HUT: {
      // Rich variety: 5 building styles based on position
      const idx = Math.floor(hash * 5) % 5;
      return bldg(HOUSE_VARIANTS[idx]);
    }

    // ═══════════════════════════════════════════════════════
    // BUILDING WALLS & DOORS
    // ═══════════════════════════════════════════════════════

    case TileType.WALL_MUD: {
      if (hash > 0.18) return null;
      return prop(pickFrom(VILLAGE_PROPS, hash2 * 10));
    }

    case TileType.WALL_STONE: {
      if (hash > 0.15) return null;
      if (hash < 0.07) return prop(pickFrom(ROCK_SPRITES.slice(0, 3), hash2 * 5), 2);
      return prop(BARREL_SPRITE);
    }

    case TileType.DOOR: {
      // Doors: lamp posts, benches, plants nearby
      if (hash > 0.35) return null;
      if (hash < 0.15) return bldg(LAMP_POST);
      if (hash < 0.25) return prop(PLANT);
      return prop(BENCH_3);
    }

    // ═══════════════════════════════════════════════════════
    // ROOFS & PALACES — grand structures
    // ═══════════════════════════════════════════════════════

    case TileType.ROOF: {
      if (hash > 0.2) return null;
      if (hash < 0.1) return bldg(HOUSE_HAY_LARGE);
      return bldg(HOUSE_HAY_3);
    }

    case TileType.PALACE: {
      if (hash > 0.25) return null;
      // Palaces: ornate mix of buildings and luxury props
      if (hash < 0.08) return bldg(HOUSE_PURPLE);
      if (hash < 0.15) return bldg(LAMP_POST);
      if (hash < 0.2) return prop(PLANT);
      return prop(BENCH_SPRITE);
    }

    // ═══════════════════════════════════════════════════════
    // TEMPLES & RELIGIOUS — sacred atmosphere
    // ═══════════════════════════════════════════════════════

    case TileType.TEMPLE: {
      if (hash > 0.25) return null;
      if (hash < 0.08) return bldg(HOUSE_PURPLE);
      if (hash < 0.14) return sheetProp(CAMPFIRE_FRAME, 4); // sacred fire
      if (hash < 0.2) return sheetProp(FLOWERS_RED_FRAME, 2); // offerings
      return prop(PLANT);
    }

    case TileType.MOSQUE: {
      if (hash > 0.2) return null;
      if (hash < 0.07) return bldg(HOUSE_BLUE);
      if (hash < 0.13) return bldg(LAMP_POST);
      return prop(PLANT);
    }

    case TileType.DOME: {
      if (hash > 0.15) return null;
      if (hash < 0.08) return bldg(HOUSE_PURPLE);
      return bldg(LAMP_POST);
    }

    // ═══════════════════════════════════════════════════════
    // FORTIFICATIONS — imposing military structures
    // ═══════════════════════════════════════════════════════

    case TileType.FORT_WALL: {
      if (hash > 0.15) return null;
      // Fort walls: sparse gates, banners, barrels, rocks
      if (hash < 0.04) return bldg(GATE_SPRITE);
      if (hash < 0.07) return bldg(BANNER_SPRITE);
      if (hash < 0.1) return prop(pickFrom(FORT_PROPS, hash2 * 5));
      return prop(pickFrom(ROCK_SPRITES.slice(2), hash2 * 5), 2);
    }

    case TileType.MUGHAL_GATE: {
      // Gates always show gate + banner
      if (hash < 0.6) return bldg(GATE_SPRITE);
      return bldg(BANNER_SPRITE);
    }

    case TileType.BORDER_POST: {
      if (hash < 0.35) return bldg(BANNER_SPRITE);
      if (hash < 0.6) return bldg(GATE_SPRITE);
      return prop(BARREL_SPRITE);
    }

    case TileType.LOCKED_GATE: {
      return bldg(GATE_SPRITE);
    }

    // ═══════════════════════════════════════════════════════
    // INDO-SARACENIC ARCHITECTURE
    // ═══════════════════════════════════════════════════════

    case TileType.SANDSTONE: {
      if (hash > 0.12) return null;
      if (hash < 0.04) return prop(pickFrom(ROCK_SPRITES.slice(0, 3), hash2 * 5), 2);
      if (hash < 0.08) return prop(BARREL_SPRITE);
      return sheetProp(DECOR_PLANTER, 2);
    }

    case TileType.MARBLE: {
      if (hash > 0.15) return null;
      // Marble: clean, elegant — lamp posts and plants
      if (hash < 0.06) return bldg(LAMP_POST);
      if (hash < 0.1) return prop(PLANT);
      return sheetProp(DECOR_PLANTER, 2);
    }

    case TileType.ARCH: {
      if (hash > 0.25) return null;
      if (hash < 0.15) return bldg(GATE_SPRITE);
      return bldg(LAMP_POST);
    }

    case TileType.JALI: {
      if (hash > 0.2) return null;
      // Lattice screens: fence pattern
      return prop(FENCE_SPRITE);
    }

    case TileType.MINARET: {
      if (hash > 0.25) return null;
      // Tall tower feel — lamp posts and banners
      if (hash < 0.12) return bldg(LAMP_POST);
      return bldg(BANNER_SPRITE);
    }

    case TileType.CHHATRI: {
      if (hash > 0.25) return null;
      // Pavilions: benches, small buildings, plants
      if (hash < 0.08) return bldg(HOUSE_PURPLE);
      if (hash < 0.16) return prop(BENCH_SPRITE);
      return prop(PLANT);
    }

    // ═══════════════════════════════════════════════════════
    // HAVELIS & RESIDENTIAL
    // ═══════════════════════════════════════════════════════

    case TileType.HAVELI_WALL: {
      if (hash > 0.2) return null;
      // Ornate residential walls — varied buildings
      if (hash < 0.07) return bldg(HOUSE_HAY_3);
      if (hash < 0.13) return bldg(HOUSE_BLUE);
      return prop(pickFrom(VILLAGE_PROPS, hash2 * 10));
    }

    case TileType.BAORI_WALL: {
      if (hash > 0.2) return null;
      // Step-well walls: stone props
      if (hash < 0.1) return prop(pickFrom(ROCK_SPRITES.slice(2), hash2 * 5), 2);
      return sheetProp(DECOR_ROCK_GRAY_1, 2);
    }

    case TileType.BAORI_WATER: {
      return null; // water surface — no decorations
    }

    case TileType.COURTYARD: {
      if (hash > 0.2) return null;
      // Elegant courtyards: benches, lamps, planters, plants
      return prop(pickFrom(PALACE_PROPS, hash2 * 10));
    }

    // ═══════════════════════════════════════════════════════
    // MARKETS & TRADE — bustling activity
    // ═══════════════════════════════════════════════════════

    case TileType.MARKET: {
      // Dense props — lots of goods and stalls
      if (hash < 0.72) return prop(pickFrom(MARKET_PROPS, hash2));
      if (hash < 0.78) return bldg(LAMP_POST);
      return null;
    }

    // ═══════════════════════════════════════════════════════
    // INFRASTRUCTURE & SPECIAL
    // ═══════════════════════════════════════════════════════

    case TileType.WELL: {
      return bldg(WELL_SPRITE);
    }

    case TileType.CAMPSITE: {
      // Campsites: campfire, fireplace, bench, rare sign, barrel
      if (hash < 0.1) return sheetProp(CAMPFIRE_FRAME, 4);
      if (hash < 0.16) return prop(FIREPLACE);
      if (hash < 0.24) return prop(BENCH_3);
      if (hash < 0.28) return prop(BARREL_SPRITE);
      if (hash < 0.31) return prop(SIGN_SPRITE);
      return null;
    }

    case TileType.BRIDGE: {
      if (hash > 0.12) return null;
      return prop(FENCE_SPRITE);
    }

    case TileType.RUINS: {
      if (hash > 0.35) return null;
      // Ruins: scattered debris — rocks, broken wood, old props
      if (hash < 0.1) return prop(pickFrom(ROCK_SPRITES, hash2 * 10), 2);
      if (hash < 0.18) return prop(CHOPPED_TREE, 2);
      if (hash < 0.25) return sheetProp(DECOR_ROCK_GRAY_1, 2);
      if (hash < 0.3) return prop(CRATE_SPRITE);
      return sheetProp(DECOR_LOG, 2);
    }

    case TileType.CANAL: {
      return null; // water channel
    }

    case TileType.STAIRS: {
      if (hash > 0.08) return null;
      return prop(pickFrom(ROCK_SPRITES.slice(3), hash2 * 5), 2);
    }

    case TileType.LEDGE_S:
    case TileType.LEDGE_N:
    case TileType.LEDGE_E:
    case TileType.LEDGE_W: {
      if (hash > 0.1) return null;
      return sheetProp(DECOR_ROCK_GRAY_1, 2);
    }

    default:
      return null;
  }
}

// ─── Decoration Renderer Component ──────────────────────────

interface DecorationRendererProps {
  map: TileMapData;
  cameraX: number;
  cameraY: number;
}

const DecorationRenderer: React.FC<DecorationRendererProps> = ({ map, cameraX, cameraY }) => {
  const offsetX = cameraX - SCREEN_WIDTH / 2;
  const offsetY = cameraY - GAME_AREA_HEIGHT / 2;

  const startTileX = Math.max(0, Math.floor(offsetX / SCALED_TILE) - 1);
  const startTileY = Math.max(0, Math.floor(offsetY / SCALED_TILE) - 2);
  const endTileX = Math.min(map.width, startTileX + VIEWPORT_TILES_X + 2);
  const endTileY = Math.min(map.height, startTileY + VIEWPORT_TILES_Y + 3);

  const decorations = useMemo(() => {
    const result: React.JSX.Element[] = [];

    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const decorTile = map.decor?.[y]?.[x];
        const tileType: TileType | null = (decorTile != null && decorTile !== -1)
          ? decorTile
          : (map.ground?.[y]?.[x] ?? null);

        if (tileType === null) continue;

        const decor = getDecorationForTile(tileType, x, y);
        if (!decor) continue;

        const screenX = x * SCALED_TILE - offsetX;
        const screenY = y * SCALED_TILE - offsetY;

        const scale = SCALED_TILE / 32;
        const renderW = decor.w * scale;
        const renderH = decor.h * scale;
        const renderOffsetY = decor.offsetY * scale;

        const isSheetFrame = decor.sheetW != null;

        result.push(
          <View
            key={`dec-${x}-${y}`}
            style={{
              position: 'absolute',
              left: screenX + (SCALED_TILE - renderW) / 2,
              top: screenY + renderOffsetY,
              width: renderW,
              height: renderH,
              overflow: isSheetFrame ? 'hidden' : undefined,
              zIndex: y + 50,
            }}
          >
            {isSheetFrame ? (
              <Image
                source={decor.source}
                style={{
                  position: 'absolute',
                  width: decor.sheetW! * scale,
                  height: decor.sheetH! * scale,
                  left: -(decor.srcX ?? 0) * scale,
                  top: -(decor.srcY ?? 0) * scale,
                }}
                resizeMode="stretch"
              />
            ) : (
              <Image
                source={decor.source}
                style={{ width: renderW, height: renderH }}
                resizeMode="contain"
              />
            )}
          </View>
        );
      }
    }

    return result;
  }, [startTileX, startTileY, endTileX, endTileY, offsetX, offsetY, map]);

  return (
    <View
      style={{ position: 'absolute', width: SCREEN_WIDTH, height: GAME_AREA_HEIGHT }}
      pointerEvents="none"
    >
      {decorations}
    </View>
  );
};

export default memo(DecorationRenderer);
