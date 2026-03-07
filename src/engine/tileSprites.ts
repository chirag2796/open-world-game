import { TileType } from '../types';

// Map each TileType to [col, row] on the Kenney roguelike tileset
// Sheet is 57 cols x 31 rows, 16x16 tiles, 1px margin
// Coordinates verified against the actual tileset.png image layout:
//  - Water: rows 0-2, cols 0-3 (light blue pool/water tiles)
//  - Trees/vegetation: row 3, cols 15-25 (green circles, pines, bushes)
//  - Brown earth: rows 4-6, cols 0-8
//  - Gray stone: rows 5-8, cols 10-25 (castle/stone floors)
//  - Sand/tan: rows 4-5, cols 8-14
//  - Green grass: rows 17-19, cols 0-8 (bright green floor tiles)
//  - Red/orange: rows 13-16
//  - Flowers/gardens: row 3, cols 0-4 (colorful small sprites)

type SpriteCoord = [number, number]; // [col, row]

export const TILE_SPRITE_MAP: Record<TileType, SpriteCoord[]> = {
  // Water tiles — light blue area top-left
  [TileType.OCEAN]:         [[0, 0], [1, 0]],
  [TileType.DEEP_OCEAN]:    [[0, 0], [0, 1]],
  [TileType.SHALLOW_WATER]: [[2, 0], [3, 0]],
  [TileType.RIVER]:         [[1, 0], [2, 0]],
  [TileType.LAKE]:          [[0, 0], [1, 0], [2, 0]],

  // Beach/sand — tan ground tiles
  [TileType.BEACH]:         [[8, 4], [9, 4], [10, 4]],
  [TileType.DESERT]:        [[9, 4], [10, 4], [11, 4]],
  [TileType.SAND_DUNES]:    [[10, 4], [11, 4]],

  // Grass/plains — green floor tiles in lower rows
  [TileType.PLAINS]:        [[0, 17], [1, 17], [2, 17]],
  [TileType.TALL_GRASS]:    [[0, 17], [3, 17]],
  [TileType.FARM]:          [[0, 3], [1, 3]],
  [TileType.FLOWERS]:       [[2, 3], [3, 3]],
  [TileType.GARDEN]:        [[0, 3], [1, 3]],

  // Forest/trees — vegetation sprites row 3
  [TileType.FOREST]:        [[17, 3], [18, 3], [19, 3]],
  [TileType.DENSE_JUNGLE]:  [[19, 3], [20, 3], [21, 3]],
  [TileType.TREE_PINE]:     [[22, 3], [23, 3]],
  [TileType.TREE_PALM]:     [[16, 3], [17, 3]],
  [TileType.TREE_BANYAN]:   [[18, 3], [19, 3]],

  // Mountain/rocks/cliff — gray stone tiles
  [TileType.MOUNTAIN]:      [[14, 6], [15, 6], [16, 6]],
  [TileType.SNOW]:          [[14, 7], [15, 7]],
  [TileType.ICE]:           [[12, 7], [13, 7]],
  [TileType.CLIFF]:         [[13, 6], [14, 6]],
  [TileType.ROCKS]:         [[15, 6], [16, 6]],
  [TileType.PLATEAU]:       [[10, 6], [11, 6], [12, 6]],
  [TileType.SWAMP]:         [[0, 17], [1, 0]],

  // Paths — brown/tan ground
  [TileType.PATH_DIRT]:     [[4, 4], [5, 4]],
  [TileType.PATH_STONE]:    [[12, 5], [13, 5]],

  // Buildings — wall and roof tiles
  [TileType.WALL_MUD]:      [[6, 1], [7, 1]],
  [TileType.WALL_STONE]:    [[14, 6], [15, 6]],
  [TileType.ROOF]:          [[8, 0], [9, 0]],
  [TileType.DOOR]:          [[10, 1], [11, 1]],
  [TileType.FORT_WALL]:     [[14, 6], [13, 6]],
  [TileType.PALACE]:        [[8, 0], [9, 0]],

  // Special structures
  [TileType.MARKET]:        [[6, 1], [7, 1]],
  [TileType.TEMPLE]:        [[8, 0], [9, 0]],
  [TileType.WELL]:          [[2, 0], [3, 0]],
  [TileType.RUINS]:         [[15, 6], [16, 6]],
  [TileType.BRIDGE]:        [[4, 4], [5, 4]],
  [TileType.CAMPSITE]:      [[4, 4], [5, 4]],
  [TileType.HUT]:           [[6, 1], [7, 1]],
};

// Get sprite coordinate for a tile at position (x,y) — uses hash for variety
export function getTileSprite(tile: TileType, x: number, y: number): SpriteCoord {
  const variants = TILE_SPRITE_MAP[tile];
  if (!variants || variants.length === 0) return [0, 0];
  if (variants.length === 1) return variants[0];
  const idx = ((x * 374761393 + y * 668265263) >>> 0) % variants.length;
  return variants[idx];
}
