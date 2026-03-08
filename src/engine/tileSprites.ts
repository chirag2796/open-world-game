import { TileType, TileMapData } from '../types';

// Auto-tiling sprite selection for the Kenney roguelike tileset
// Sheet: 57 cols x 31 rows, 16x16 tiles, 1px margin
//
// Key insight: DON'T randomly pick between variants — that creates visual noise.
// Instead: use ONE consistent sprite per tile type, and pick variants only
// based on spatial context (edges, corners, neighbors).

type SpriteCoord = [number, number]; // [col, row]

// Terrain groups — tiles that visually blend together
const WATER_GROUP = new Set([
  TileType.OCEAN, TileType.DEEP_OCEAN, TileType.SHALLOW_WATER,
  TileType.RIVER, TileType.LAKE, TileType.CANAL, TileType.BAORI_WATER,
]);
const GROUND_GROUP = new Set([
  TileType.PLAINS, TileType.TALL_GRASS, TileType.FARM,
  TileType.FLOWERS, TileType.GARDEN, TileType.SWAMP,
  TileType.CHARBAGH, TileType.COURTYARD, TileType.PIETRA_DURA,
  TileType.DRY_GRASS, TileType.MANGROVE,
]);
const SAND_GROUP = new Set([
  TileType.DESERT, TileType.SAND_DUNES, TileType.BEACH,
  TileType.CRACKED_EARTH, TileType.CACTUS,
]);
const STONE_GROUP = new Set([
  TileType.MOUNTAIN, TileType.CLIFF, TileType.ROCKS,
  TileType.PLATEAU, TileType.SNOW, TileType.ICE,
  TileType.ROCKY_PATH, TileType.BOULDER, TileType.STAIRS,
  TileType.LEDGE_N, TileType.LEDGE_S, TileType.LEDGE_E, TileType.LEDGE_W,
]);
const TREE_GROUP = new Set([
  TileType.FOREST, TileType.DENSE_JUNGLE, TileType.TREE_PINE,
  TileType.TREE_PALM, TileType.TREE_BANYAN, TileType.BAMBOO,
]);
const BUILDING_GROUP = new Set([
  TileType.WALL_MUD, TileType.WALL_STONE, TileType.ROOF,
  TileType.DOOR, TileType.FORT_WALL, TileType.PALACE,
  TileType.TEMPLE, TileType.MARKET, TileType.HUT,
  TileType.SANDSTONE, TileType.MARBLE, TileType.DOME,
  TileType.ARCH, TileType.JALI, TileType.MINARET,
  TileType.CHHATRI, TileType.BAORI_WALL, TileType.HAVELI_WALL,
  TileType.MUGHAL_GATE, TileType.MOSQUE, TileType.BORDER_POST,
  TileType.LOCKED_GATE, TileType.FALLEN_LOG,
]);

function sameGroup(a: TileType, b: TileType): boolean {
  for (const group of [WATER_GROUP, GROUND_GROUP, SAND_GROUP, STONE_GROUP, TREE_GROUP, BUILDING_GROUP]) {
    if (group.has(a) && group.has(b)) return true;
  }
  return a === b;
}

// Primary sprite for each tile type — ONE sprite, consistent look
const PRIMARY_SPRITE: Record<TileType, SpriteCoord> = {
  // Water
  [TileType.OCEAN]:         [1, 0],
  [TileType.DEEP_OCEAN]:    [0, 0],
  [TileType.SHALLOW_WATER]: [2, 0],
  [TileType.RIVER]:         [1, 0],
  [TileType.LAKE]:          [1, 1],

  // Sand/beach
  [TileType.BEACH]:         [9, 4],
  [TileType.DESERT]:        [10, 4],
  [TileType.SAND_DUNES]:    [11, 4],

  // Ground/grass
  [TileType.PLAINS]:        [1, 17],
  [TileType.TALL_GRASS]:    [2, 17],
  [TileType.FARM]:          [0, 3],
  [TileType.FLOWERS]:       [3, 3],
  [TileType.GARDEN]:        [1, 3],
  [TileType.SWAMP]:         [0, 17],

  // Trees/forest (these are decorative sprites on top of terrain)
  [TileType.FOREST]:        [18, 3],
  [TileType.DENSE_JUNGLE]:  [20, 3],
  [TileType.TREE_PINE]:     [22, 3],
  [TileType.TREE_PALM]:     [16, 3],
  [TileType.TREE_BANYAN]:   [19, 3],

  // Mountain/rocks
  [TileType.MOUNTAIN]:      [14, 6],
  [TileType.SNOW]:          [15, 7],
  [TileType.ICE]:           [13, 7],
  [TileType.CLIFF]:         [13, 6],
  [TileType.ROCKS]:         [15, 6],
  [TileType.PLATEAU]:       [11, 6],

  // Paths
  [TileType.PATH_DIRT]:     [5, 4],
  [TileType.PATH_STONE]:    [13, 5],

  // Buildings
  [TileType.WALL_MUD]:      [7, 1],
  [TileType.WALL_STONE]:    [14, 6],
  [TileType.ROOF]:          [9, 0],
  [TileType.DOOR]:          [11, 1],
  [TileType.FORT_WALL]:     [13, 6],
  [TileType.PALACE]:        [8, 0],

  // Special
  [TileType.MARKET]:        [7, 1],
  [TileType.TEMPLE]:        [9, 0],
  [TileType.WELL]:          [2, 0],
  [TileType.RUINS]:         [16, 6],
  [TileType.BRIDGE]:        [5, 4],
  [TileType.CAMPSITE]:      [5, 4],
  [TileType.HUT]:           [7, 1],

  // Indo-Saracenic (use closest existing sprites as fallback)
  [TileType.SANDSTONE]:     [14, 6],
  [TileType.MARBLE]:        [13, 5],
  [TileType.DOME]:          [8, 0],
  [TileType.ARCH]:          [11, 1],
  [TileType.JALI]:          [7, 1],
  [TileType.MINARET]:       [14, 6],
  [TileType.CHHATRI]:       [8, 0],
  [TileType.BAORI_WALL]:    [7, 1],
  [TileType.BAORI_WATER]:   [1, 1],
  [TileType.PIETRA_DURA]:   [1, 3],
  [TileType.COURTYARD]:     [5, 4],
  [TileType.HAVELI_WALL]:   [7, 1],
  [TileType.MUGHAL_GATE]:   [11, 1],
  [TileType.MOSQUE]:        [9, 0],
  [TileType.BORDER_POST]:   [7, 1],
  [TileType.CANAL]:         [1, 0],
  [TileType.CHARBAGH]:      [1, 3],

  // Height/obstacle tiles
  [TileType.LEDGE_S]:       [13, 6],  // cliff face visual
  [TileType.LEDGE_N]:       [13, 6],
  [TileType.LEDGE_E]:       [13, 6],
  [TileType.LEDGE_W]:       [13, 6],
  [TileType.STAIRS]:        [5, 4],   // path visual (stairs)
  [TileType.ROCKY_PATH]:    [12, 6],  // rocky ground
  [TileType.CRACKED_EARTH]: [10, 4],  // dry desert
  [TileType.MANGROVE]:      [16, 3],  // tree-like
  [TileType.BAMBOO]:        [22, 3],  // pine-like
  [TileType.CACTUS]:        [15, 6],  // rocks stand-in
  [TileType.FALLEN_LOG]:    [18, 3],  // tree-like obstacle
  [TileType.BOULDER]:       [15, 6],  // rocks
  [TileType.LOCKED_GATE]:   [11, 1],  // door visual
  [TileType.DRY_GRASS]:     [0, 3],   // farm-like dried grass
};

// Edge-aware sprite variants for terrain that should have smooth edges
// When a tile is on the edge of its group, we can use a different sprite
const EDGE_SPRITES: Partial<Record<TileType, {
  center: SpriteCoord;
  edgeN: SpriteCoord;
  edgeS: SpriteCoord;
  edgeE: SpriteCoord;
  edgeW: SpriteCoord;
}>> = {
  // Water tiles have edge variants in the tileset (rows 0-2, cols 0-3)
  [TileType.OCEAN]: {
    center: [1, 1],
    edgeN:  [1, 0],
    edgeS:  [1, 2],
    edgeE:  [2, 1],
    edgeW:  [0, 1],
  },
  [TileType.LAKE]: {
    center: [1, 1],
    edgeN:  [1, 0],
    edgeS:  [1, 2],
    edgeE:  [2, 1],
    edgeW:  [0, 1],
  },
};

// Get the sprite for a tile, considering its neighbors for edge detection
export function getTileSprite(
  tile: TileType,
  x: number,
  y: number,
  map?: TileMapData,
): SpriteCoord {
  // If we have map data, do edge-aware selection
  if (map && EDGE_SPRITES[tile]) {
    const edges = EDGE_SPRITES[tile]!;
    const n = y > 0 ? map.ground[y - 1]?.[x] : undefined;
    const s = y < map.height - 1 ? map.ground[y + 1]?.[x] : undefined;
    const e = x < map.width - 1 ? map.ground[y]?.[x + 1] : undefined;
    const w = x > 0 ? map.ground[y]?.[x - 1] : undefined;

    const nSame = n !== undefined && sameGroup(tile, n);
    const sSame = s !== undefined && sameGroup(tile, s);
    const eSame = e !== undefined && sameGroup(tile, e);
    const wSame = w !== undefined && sameGroup(tile, w);

    // If fully surrounded, use center
    if (nSame && sSame && eSame && wSame) return edges.center;
    // Edge tiles (prioritize first non-matching direction)
    if (!nSame) return edges.edgeN;
    if (!sSame) return edges.edgeS;
    if (!eSame) return edges.edgeE;
    if (!wSame) return edges.edgeW;
    return edges.center;
  }

  // Default: return the primary sprite (consistent, no randomness)
  return PRIMARY_SPRITE[tile] || [0, 0];
}
