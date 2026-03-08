import { ImageSourcePropType } from 'react-native';
import { TileType, TileMapData } from '../types';

// ─── Tileset Configurations ─────────────────────────────────
// Fan-tasy Tileset (Free) — 16x16 pixel tiles with Wang auto-tiling
// Tile positions verified from Tiled .tsx Wang tile definitions

export interface TilesetConfig {
  source: ImageSourcePropType;
  sheetWidth: number;
  sheetHeight: number;
  frameWidth: number;
  frameHeight: number;
}

export const TERRAIN_GROUND: TilesetConfig = {
  source: require('../../assets/sprites/terrain/Tileset_Ground.png'),
  sheetWidth: 192,
  sheetHeight: 224,
  frameWidth: 16,
  frameHeight: 16,
};

export const TERRAIN_ROAD: TilesetConfig = {
  source: require('../../assets/sprites/terrain/Tileset_Road.png'),
  sheetWidth: 96,
  sheetHeight: 224,
  frameWidth: 16,
  frameHeight: 16,
};

export const TERRAIN_WATER: TilesetConfig = {
  source: require('../../assets/sprites/terrain/Tileset_Water.png'),
  sheetWidth: 384,
  sheetHeight: 208,
  frameWidth: 16,
  frameHeight: 16,
};

export interface SpriteRef {
  tileset: TilesetConfig;
  col: number;
  row: number;
}

// ─── Terrain Type Groups ────────────────────────────────────

const GRASS_TILES = new Set<TileType>([
  TileType.PLAINS, TileType.TALL_GRASS, TileType.FARM, TileType.FLOWERS,
  TileType.GARDEN, TileType.FOREST, TileType.DENSE_JUNGLE,
  TileType.TREE_PINE, TileType.TREE_PALM, TileType.TREE_BANYAN,
  TileType.SWAMP, TileType.CHARBAGH, TileType.HUT,
  TileType.PIETRA_DURA,
]);

const WATER_TILES = new Set<TileType>([
  TileType.OCEAN, TileType.DEEP_OCEAN, TileType.SHALLOW_WATER,
  TileType.RIVER, TileType.LAKE, TileType.CANAL, TileType.BAORI_WATER,
]);

const ROAD_TILES = new Set<TileType>([
  TileType.PATH_DIRT, TileType.PATH_STONE, TileType.BEACH,
  TileType.DESERT, TileType.SAND_DUNES, TileType.CAMPSITE,
  TileType.BRIDGE, TileType.COURTYARD, TileType.SANDSTONE,
  TileType.MARBLE,
]);

// ─── Auto-tile Sets (from Tiled Wang tile definitions) ──────
// Wang ID order: top, top-right, right, bottom-right, bottom, bottom-left, left, top-left
// Color 1=empty, 2=terrain (grass/water/road)
//
// Layout in each tileset (cols 1-3, rows 0-2):
//   (1,0)=NW_outer  (2,0)=N_edge   (3,0)=NE_outer
//   (1,1)=W_edge    (2,1)=CENTER   (3,1)=E_edge
//   (1,2)=SW_outer  (2,2)=S_edge   (3,2)=SE_outer
//
// Inner corners (all cardinals same, one diagonal different):
//   (0,4)=inner_SE  (1,4)=inner_SW
//   (0,5)=inner_NE  (1,5)=inner_NW
//
// Solid fill variants (rows 8-9 for ground/road):
//   12 variants for ground, 6+ for road, 3 for water

interface AutoTileSet {
  fills: SpriteRef[];  // Multiple center variants for natural variety
  edgeN: SpriteRef;
  edgeS: SpriteRef;
  edgeE: SpriteRef;
  edgeW: SpriteRef;
  cornerNW: SpriteRef;
  cornerNE: SpriteRef;
  cornerSW: SpriteRef;
  cornerSE: SpriteRef;
  innerNE: SpriteRef;
  innerNW: SpriteRef;
  innerSE: SpriteRef;
  innerSW: SpriteRef;
}

const G = TERRAIN_GROUND;
const W = TERRAIN_WATER;
const R = TERRAIN_ROAD;

// Ground tileset: 12 cols × 11 rows (16px tiles)
// Left half (cols 0-5): grass-on-transparent transitions
// Right half (cols 6-11): grass-on-dirt transitions
// Rows 8-9: solid grass fill variants
const GRASS_AUTO: AutoTileSet = {
  fills: [
    { tileset: G, col: 0, row: 8 }, { tileset: G, col: 1, row: 8 },
    { tileset: G, col: 2, row: 8 }, { tileset: G, col: 3, row: 8 },
    { tileset: G, col: 4, row: 8 }, { tileset: G, col: 5, row: 8 },
    { tileset: G, col: 0, row: 9 }, { tileset: G, col: 1, row: 9 },
    { tileset: G, col: 2, row: 9 }, { tileset: G, col: 3, row: 9 },
    { tileset: G, col: 4, row: 9 }, { tileset: G, col: 5, row: 9 },
  ],
  edgeN:    { tileset: G, col: 2, row: 0 },
  edgeS:    { tileset: G, col: 2, row: 2 },
  edgeE:    { tileset: G, col: 3, row: 1 },
  edgeW:    { tileset: G, col: 1, row: 1 },
  cornerNW: { tileset: G, col: 1, row: 0 },
  cornerNE: { tileset: G, col: 3, row: 0 },
  cornerSW: { tileset: G, col: 1, row: 2 },
  cornerSE: { tileset: G, col: 3, row: 2 },
  innerNE:  { tileset: G, col: 0, row: 5 },
  innerNW:  { tileset: G, col: 1, row: 5 },
  innerSE:  { tileset: G, col: 0, row: 4 },
  innerSW:  { tileset: G, col: 1, row: 4 },
};

// Grass-on-dirt variant (right half of ground tileset, cols 6-11)
// Used for forest/jungle edges where dirt is more visible
const GRASS_DIRT_AUTO: AutoTileSet = {
  fills: GRASS_AUTO.fills, // Same solid grass fills
  edgeN:    { tileset: G, col: 8, row: 0 },
  edgeS:    { tileset: G, col: 8, row: 2 },
  edgeE:    { tileset: G, col: 9, row: 1 },
  edgeW:    { tileset: G, col: 7, row: 1 },
  cornerNW: { tileset: G, col: 7, row: 0 },
  cornerNE: { tileset: G, col: 9, row: 0 },
  cornerSW: { tileset: G, col: 7, row: 2 },
  cornerSE: { tileset: G, col: 9, row: 2 },
  innerNE:  { tileset: G, col: 6, row: 5 },
  innerNW:  { tileset: G, col: 7, row: 5 },
  innerSE:  { tileset: G, col: 6, row: 4 },
  innerSW:  { tileset: G, col: 7, row: 4 },
};

// Water tileset: 24 cols × 13 rows (16px tiles)
// Water has animated tiles (4 frames each, 6-col offset per frame)
// We use frame 0 (cols 0-5) for static rendering
const WATER_AUTO: AutoTileSet = {
  fills: [
    { tileset: W, col: 2, row: 1 }, // Center fill
    { tileset: W, col: 0, row: 8 }, // Solid variants
    { tileset: W, col: 1, row: 8 },
    { tileset: W, col: 2, row: 8 },
  ],
  edgeN:    { tileset: W, col: 2, row: 0 },
  edgeS:    { tileset: W, col: 2, row: 2 },
  edgeE:    { tileset: W, col: 3, row: 1 },
  edgeW:    { tileset: W, col: 1, row: 1 },
  cornerNW: { tileset: W, col: 1, row: 0 },
  cornerNE: { tileset: W, col: 3, row: 0 },
  cornerSW: { tileset: W, col: 1, row: 2 },
  cornerSE: { tileset: W, col: 3, row: 2 },
  innerNE:  { tileset: W, col: 0, row: 5 },
  innerNW:  { tileset: W, col: 1, row: 5 },
  innerSE:  { tileset: W, col: 0, row: 4 },
  innerSW:  { tileset: W, col: 1, row: 4 },
};

// Road tileset: 6 cols × 14 rows (16px tiles)
// Rows 8-9: solid road fill variants
const ROAD_AUTO: AutoTileSet = {
  fills: [
    { tileset: R, col: 2, row: 1 }, // Center fill
    { tileset: R, col: 0, row: 8 }, { tileset: R, col: 1, row: 8 },
    { tileset: R, col: 2, row: 8 }, { tileset: R, col: 0, row: 9 },
    { tileset: R, col: 1, row: 9 }, { tileset: R, col: 2, row: 9 },
  ],
  edgeN:    { tileset: R, col: 2, row: 0 },
  edgeS:    { tileset: R, col: 2, row: 2 },
  edgeE:    { tileset: R, col: 3, row: 1 },
  edgeW:    { tileset: R, col: 1, row: 1 },
  cornerNW: { tileset: R, col: 1, row: 0 },
  cornerNE: { tileset: R, col: 3, row: 0 },
  cornerSW: { tileset: R, col: 1, row: 2 },
  cornerSE: { tileset: R, col: 3, row: 2 },
  innerNE:  { tileset: R, col: 0, row: 5 },
  innerNW:  { tileset: R, col: 1, row: 5 },
  innerSE:  { tileset: R, col: 0, row: 4 },
  innerSW:  { tileset: R, col: 1, row: 4 },
};

// Tiles that use dirt-edge grass variant (darker forest/jungle edges)
const DIRT_EDGE_TILES = new Set<TileType>([
  TileType.FOREST, TileType.DENSE_JUNGLE, TileType.SWAMP,
  TileType.TALL_GRASS, TileType.TREE_PINE, TileType.TREE_BANYAN,
]);

// ─── Deterministic variety ──────────────────────────────────

function tileHash(x: number, y: number): number {
  return ((x * 7919 + y * 6271) & 0xffff);
}

function pickFill(fills: SpriteRef[], x: number, y: number): SpriteRef {
  return fills[tileHash(x, y) % fills.length];
}

// ─── Edge-Aware Selection ───────────────────────────────────

function tileInGroup(map: TileMapData, x: number, y: number, group: Set<TileType>): boolean {
  if (y < 0 || y >= map.height || x < 0 || x >= map.width) return false;
  const tile = map.ground[y]?.[x];
  return tile !== undefined && group.has(tile);
}

function selectAutoTile(
  autoTile: AutoTileSet,
  x: number, y: number,
  sameN: boolean, sameS: boolean, sameE: boolean, sameW: boolean,
  sameNE: boolean, sameNW: boolean, sameSE: boolean, sameSW: boolean,
): SpriteRef {
  // All 4 cardinal neighbors match → check diagonals for inner corners
  if (sameN && sameS && sameE && sameW) {
    // Single inner corner (diagonal not matching)
    if (!sameNE && sameSE && sameSW && sameNW) return autoTile.innerNE;
    if (!sameNW && sameSE && sameSW && sameNE) return autoTile.innerNW;
    if (!sameSE && sameNE && sameSW && sameNW) return autoTile.innerSE;
    if (!sameSW && sameNE && sameSE && sameNW) return autoTile.innerSW;
    // Multiple diagonals different or all same → use fill variant
    return pickFill(autoTile.fills, x, y);
  }

  // Outer corners: two adjacent cardinal edges exposed
  if (!sameN && !sameW) return autoTile.cornerNW;
  if (!sameN && !sameE) return autoTile.cornerNE;
  if (!sameS && !sameW) return autoTile.cornerSW;
  if (!sameS && !sameE) return autoTile.cornerSE;

  // Single edges
  if (!sameN) return autoTile.edgeN;
  if (!sameS) return autoTile.edgeS;
  if (!sameE) return autoTile.edgeE;
  if (!sameW) return autoTile.edgeW;

  return pickFill(autoTile.fills, x, y);
}

// ─── Public API ─────────────────────────────────────────────

export function getTerrainSprite(
  tile: TileType,
  x: number,
  y: number,
  map: TileMapData,
): SpriteRef | null {
  if (GRASS_TILES.has(tile)) {
    const group = GRASS_TILES;
    const auto = DIRT_EDGE_TILES.has(tile) ? GRASS_DIRT_AUTO : GRASS_AUTO;
    const sameN  = tileInGroup(map, x, y - 1, group);
    const sameS  = tileInGroup(map, x, y + 1, group);
    const sameE  = tileInGroup(map, x + 1, y, group);
    const sameW  = tileInGroup(map, x - 1, y, group);
    const sameNE = tileInGroup(map, x + 1, y - 1, group);
    const sameNW = tileInGroup(map, x - 1, y - 1, group);
    const sameSE = tileInGroup(map, x + 1, y + 1, group);
    const sameSW = tileInGroup(map, x - 1, y + 1, group);
    return selectAutoTile(auto, x, y, sameN, sameS, sameE, sameW, sameNE, sameNW, sameSE, sameSW);
  }

  if (WATER_TILES.has(tile)) {
    const group = WATER_TILES;
    const sameN  = tileInGroup(map, x, y - 1, group);
    const sameS  = tileInGroup(map, x, y + 1, group);
    const sameE  = tileInGroup(map, x + 1, y, group);
    const sameW  = tileInGroup(map, x - 1, y, group);
    const sameNE = tileInGroup(map, x + 1, y - 1, group);
    const sameNW = tileInGroup(map, x - 1, y - 1, group);
    const sameSE = tileInGroup(map, x + 1, y + 1, group);
    const sameSW = tileInGroup(map, x - 1, y + 1, group);
    return selectAutoTile(WATER_AUTO, x, y, sameN, sameS, sameE, sameW, sameNE, sameNW, sameSE, sameSW);
  }

  if (ROAD_TILES.has(tile)) {
    const group = ROAD_TILES;
    const sameN  = tileInGroup(map, x, y - 1, group);
    const sameS  = tileInGroup(map, x, y + 1, group);
    const sameE  = tileInGroup(map, x + 1, y, group);
    const sameW  = tileInGroup(map, x - 1, y, group);
    const sameNE = tileInGroup(map, x + 1, y - 1, group);
    const sameNW = tileInGroup(map, x - 1, y - 1, group);
    const sameSE = tileInGroup(map, x + 1, y + 1, group);
    const sameSW = tileInGroup(map, x - 1, y + 1, group);
    return selectAutoTile(ROAD_AUTO, x, y, sameN, sameS, sameE, sameW, sameNE, sameNW, sameSE, sameSW);
  }

  return null;
}
