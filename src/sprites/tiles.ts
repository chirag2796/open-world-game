import { PixelGrid, TileType } from '../types';
import { PALETTE } from '../engine/constants';

const _ = null; // transparent
const gd = PALETTE.grassDark;
const g = PALETTE.grass;
const gl = PALETTE.grassLight;
const p = PALETTE.path;
const pd = PALETTE.pathDark;
const wd = PALETTE.waterDark;
const w = PALETTE.water;
const wl = PALETTE.waterLight;
const st = PALETTE.stone;
const sd = PALETTE.stoneDark;
const sl = PALETTE.stoneLight;
const wo = PALETTE.wood;
const wk = PALETTE.woodDark;
const wt = PALETTE.woodLight;
const tt = PALETTE.treeTrunk;
const tl = PALETTE.treeLeaf;
const th = PALETTE.treeLeafLight;
const rr = PALETTE.roofRed;
const rl = PALETTE.roofRedLight;
const rd = PALETTE.red;
const re = PALETTE.redLight;
const yw = PALETTE.yellow;
const yl = PALETTE.yellowLight;
const fn = PALETTE.woodDark; // fence color
const bk = PALETTE.black;

// 16x16 pixel tile definitions
const GRASS_TILE: PixelGrid = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    // Pseudo-random grass variation based on position
    const v = ((x * 7 + y * 13) % 5);
    if (v === 0) return gl;
    if (v === 1) return gd;
    return g;
  })
);

const PATH_TILE: PixelGrid = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    const v = ((x * 3 + y * 7) % 4);
    return v === 0 ? pd : p;
  })
);

const WATER_TILE: PixelGrid = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    const v = ((x + y * 2) % 6);
    if (v === 0) return wl;
    if (v < 2) return wd;
    return w;
  })
);

const WALL_STONE_TILE: PixelGrid = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    // Brick pattern
    const brickY = y % 4;
    const offset = Math.floor(y / 4) % 2 === 0 ? 0 : 4;
    const brickX = (x + offset) % 8;
    if (brickY === 0 || brickX === 0) return sd;
    return ((x + y) % 7 === 0) ? sl : st;
  })
);

const WALL_WOOD_TILE: PixelGrid = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    // Vertical wood planks
    const plank = x % 4;
    if (plank === 0) return wk;
    if (y % 8 === 0) return wk;
    return ((x + y) % 5 === 0) ? wt : wo;
  })
);

const DOOR_TILE: PixelGrid = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    if (x === 0 || x === 15) return wk;
    if (y === 0) return wk;
    if (y >= 14) return pd; // threshold
    // Door panels
    if (x === 7 || x === 8) return wk; // center divide
    if (y === 7) return wk; // horizontal divide
    // Door knob
    if (y === 8 && (x === 5 || x === 10)) return yl;
    return wo;
  })
);

const TREE_TILE: PixelGrid = (() => {
  const grid: PixelGrid = Array.from({ length: 16 }, () =>
    Array.from({ length: 16 }, () => _)
  );
  // Trunk (bottom center)
  for (let y = 10; y < 16; y++) {
    for (let x = 6; x < 10; x++) {
      grid[y][x] = x === 6 ? wk : tt;
    }
  }
  // Canopy (circle-ish)
  for (let y = 1; y < 11; y++) {
    for (let x = 1; x < 15; x++) {
      const cx = 7.5, cy = 5.5;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < 5.5) {
        grid[y][x] = ((x + y) % 3 === 0) ? th : tl;
      }
    }
  }
  // Highlights
  grid[2][5] = th; grid[3][4] = th; grid[3][8] = th;
  grid[4][6] = th; grid[2][9] = th;
  return grid;
})();

const FLOWER_RED_TILE: PixelGrid = (() => {
  const grid: PixelGrid = GRASS_TILE.map(row => [...row]);
  // Scatter flowers
  const flowers = [[3,2],[7,5],[11,3],[5,10],[13,8],[2,13],[9,12],[14,1]];
  for (const [x, y] of flowers) {
    if (x < 16 && y < 16) grid[y][x] = rd;
    if (x + 1 < 16 && y < 16) grid[y][x + 1] = re;
    if (x < 16 && y > 0) grid[y - 1][x] = g; // stem bit above
  }
  return grid;
})();

const FLOWER_YELLOW_TILE: PixelGrid = (() => {
  const grid: PixelGrid = GRASS_TILE.map(row => [...row]);
  const flowers = [[4,3],[8,6],[12,2],[3,11],[10,9],[1,7],[14,13],[7,1]];
  for (const [x, y] of flowers) {
    if (x < 16 && y < 16) grid[y][x] = yw;
    if (x + 1 < 16 && y < 16) grid[y][x + 1] = yl;
  }
  return grid;
})();

const BRIDGE_TILE: PixelGrid = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    if (x === 0 || x === 15) return wk; // railings
    if (x === 1 || x === 14) return wo; // rail posts
    if (y % 4 === 0) return wk; // plank gaps
    return wt;
  })
);

const ROOF_TILE: PixelGrid = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    // Roof shingles
    const row = y % 4;
    if (row === 0) return wk;
    return ((x + Math.floor(y / 4)) % 2 === 0) ? rr : rl;
  })
);

const FENCE_TILE: PixelGrid = (() => {
  const grid: PixelGrid = Array.from({ length: 16 }, () =>
    Array.from({ length: 16 }, () => _)
  );
  // Horizontal bars
  for (let x = 0; x < 16; x++) {
    grid[4][x] = fn;
    grid[5][x] = wt;
    grid[10][x] = fn;
    grid[11][x] = wt;
  }
  // Vertical posts
  for (let y = 0; y < 16; y++) {
    grid[y][1] = fn; grid[y][2] = wt;
    grid[y][13] = fn; grid[y][14] = wt;
  }
  return grid;
})();

const SIGN_TILE: PixelGrid = (() => {
  const grid: PixelGrid = Array.from({ length: 16 }, () =>
    Array.from({ length: 16 }, () => _)
  );
  // Post
  for (let y = 8; y < 16; y++) {
    grid[y][7] = wo; grid[y][8] = wt;
  }
  // Sign board
  for (let y = 1; y < 9; y++) {
    for (let x = 3; x < 13; x++) {
      if (y === 1 || y === 8 || x === 3 || x === 12) {
        grid[y][x] = wk;
      } else {
        grid[y][x] = wt;
      }
    }
  }
  // Text lines on sign
  for (let x = 5; x < 11; x++) {
    grid[3][x] = wk; grid[5][x] = wk;
  }
  return grid;
})();

const WELL_TILE: PixelGrid = (() => {
  const grid: PixelGrid = Array.from({ length: 16 }, () =>
    Array.from({ length: 16 }, () => _)
  );
  // Base (stone circle)
  for (let y = 6; y < 16; y++) {
    for (let x = 2; x < 14; x++) {
      const cx = 7.5, cy = 11;
      const dist = Math.sqrt((x - cx) ** 2 + ((y - cy) * 1.5) ** 2);
      if (dist < 5) {
        if (y < 8) grid[y][x] = sl;
        else if (x === 2 || x === 13 || y === 15) grid[y][x] = sd;
        else grid[y][x] = st;
      }
    }
  }
  // Water inside
  for (let y = 8; y < 14; y++) {
    for (let x = 4; x < 12; x++) {
      grid[y][x] = w;
    }
  }
  // Roof posts
  for (let y = 0; y < 8; y++) {
    grid[y][3] = wo; grid[y][12] = wo;
  }
  // Roof
  for (let x = 2; x < 14; x++) {
    grid[0][x] = wk; grid[1][x] = wo;
  }
  return grid;
})();

const CHEST_TILE: PixelGrid = (() => {
  const grid: PixelGrid = Array.from({ length: 16 }, () =>
    Array.from({ length: 16 }, () => _)
  );
  // Chest body
  for (let y = 5; y < 15; y++) {
    for (let x = 2; x < 14; x++) {
      if (y === 5 || y === 14 || x === 2 || x === 13) {
        grid[y][x] = wk;
      } else if (y === 9) {
        grid[y][x] = wk; // divide line
      } else if (y < 9) {
        grid[y][x] = wo; // lid
      } else {
        grid[y][x] = wt; // body
      }
    }
  }
  // Lock
  grid[9][7] = yw; grid[9][8] = yw;
  grid[10][7] = yw; grid[10][8] = yw;
  return grid;
})();

export const TILE_SPRITES: Record<TileType, PixelGrid> = {
  [TileType.GRASS]: GRASS_TILE,
  [TileType.PATH]: PATH_TILE,
  [TileType.WATER]: WATER_TILE,
  [TileType.WALL_STONE]: WALL_STONE_TILE,
  [TileType.WALL_WOOD]: WALL_WOOD_TILE,
  [TileType.DOOR]: DOOR_TILE,
  [TileType.TREE]: TREE_TILE,
  [TileType.FLOWER_RED]: FLOWER_RED_TILE,
  [TileType.FLOWER_YELLOW]: FLOWER_YELLOW_TILE,
  [TileType.BRIDGE]: BRIDGE_TILE,
  [TileType.ROOF]: ROOF_TILE,
  [TileType.FENCE]: FENCE_TILE,
  [TileType.SIGN]: SIGN_TILE,
  [TileType.WELL]: WELL_TILE,
  [TileType.CHEST]: CHEST_TILE,
};
