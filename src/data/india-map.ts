import { TileType, TileMapData, BiomeType, StateDef, SettlementDef, NPC } from '../types';

// Low-res template: 40 cols x 50 rows → upscale 4x → 160x200 tile map
// Each character = one state or ocean (.)  ^=mountain peaks
const TEMPLATE: string[] = [
  '........................................', // 0
  '........................................', // 1
  '...........^^^^.........................', // 2
  '..........^^hhhuuu......................',  // 3
  '..........^hhhhuuuu.....................',  // 4
  '.........^phhhhduuuu....................',  // 5
  '.........pphhydddluuu...................',  // 6
  '.........ppyyydDllluu...................',  // 7  D=Delhi
  '.........ppyyyddllllu...................',  // 8
  '........rppyyymdllllll..................', // 9
  '........rrryymmmlllllbb.................',  // 10
  '.......rrrryymmmllllbbb......s..........',  // 11
  '.......rrrrrmmmmllllbbbw...szze.........',  // 12
  '......rrrrrrmmmlllllbbwww.zzzzea........', // 13
  '......rrrrrrmmmllllbbwww.zzzzzeean......', // 14
  '......rrrrrrmmmmllbbjjww.zzzzeeeann.....',  // 15
  '.....rrrrrrrmmmcccbjjwww.zzzteeennni....',  // 16
  '.....grrrrrrmmmcccjjwww..zztteennniiq...',  // 17
  '....ggrrrrrmmmmccjjjooo..zztteeenniiqq..',  // 18
  '...ggggrrrrmmmcccjjoooo...tttteeeiqqq...',  // 19
  '..gggggrrrrmmmccccooooo....tttteqqq.....',  // 20
  '.gggggggrrrmmmcccooooo......ttqqq.......',  // 21
  '..ggggggrmmmmcccooooo...................',  // 22
  '...gggggxmmmmcc$$oooo...................',  // 23
  '....ggxxxxxmm$$$$ooo....................',  // 24
  '.....gxxxxmmm$$$$$@o....................',  // 25
  '......xxxxxm$$$$$@@@....................',  // 26
  '......vxxxxm$$$$$@@@....................',  // 27
  '.......vxxx$$$$@@@@@....................',  // 28
  '........xkkk$$@@@@@@....................',  // 29
  '........kkkk$@@@@@@@....................',  // 30
  '.........kkk$$@@@@@@....................',  // 31
  '.........kkk@@@@###.....................',  // 32
  '.........kk@@@@####.....................',  // 33
  '..........kk@@#####.....................',  // 34
  '..........kkf@@####.....................',  // 35
  '..........kff@#####.....................',  // 36
  '...........ff@####......................',  // 37
  '...........ff####.......................',  // 38
  '...........ff###........................',  // 39
  '...........ff##.........................',  // 40
  '............f##.........................',  // 41
  '............f#..........................',  // 42
  '............f...........................',  // 43
  '........................................',  // 44
  '........................................',  // 45
  '........................................',  // 46
  '........................................',  // 47
  '........................................',  // 48
  '........................................',  // 49
];

// State definitions: code → metadata
const STATES: Record<string, StateDef> = {
  h: { code: 'h', name: 'Himachal Pradesh', biome: 'mountain', settlements: [
    { name: 'Shimla', type: 'city', tileX: 46, tileY: 16 },
    { name: 'Kullu', type: 'village', tileX: 44, tileY: 12 },
  ]},
  u: { code: 'u', name: 'Uttarakhand', biome: 'mountain', settlements: [
    { name: 'Haridwar', type: 'city', tileX: 62, tileY: 20 },
    { name: 'Rishikesh', type: 'village', tileX: 60, tileY: 16 },
  ]},
  p: { code: 'p', name: 'Punjab', biome: 'plains', settlements: [
    { name: 'Amritsar', type: 'city', tileX: 38, tileY: 24 },
    { name: 'Lahore Gate', type: 'village', tileX: 40, tileY: 28 },
  ]},
  y: { code: 'y', name: 'Haryana', biome: 'plains', settlements: [
    { name: 'Kurukshetra', type: 'city', tileX: 44, tileY: 30 },
    { name: 'Panipat', type: 'village', tileX: 44, tileY: 34 },
  ]},
  D: { code: 'D', name: 'Delhi', biome: 'plains', settlements: [
    { name: 'Shahjahanabad', type: 'capital', tileX: 52, tileY: 28 },
  ]},
  r: { code: 'r', name: 'Rajasthan', biome: 'desert', settlements: [
    { name: 'Amber', type: 'city', tileX: 36, tileY: 44 },
    { name: 'Jodhpur', type: 'city', tileX: 26, tileY: 50 },
    { name: 'Jaisalmer', type: 'village', tileX: 22, tileY: 42 },
    { name: 'Udaipur', type: 'village', tileX: 30, tileY: 60 },
    { name: 'Pushkar', type: 'village', tileX: 34, tileY: 48 },
  ]},
  l: { code: 'l', name: 'Uttar Pradesh', biome: 'plains', settlements: [
    { name: 'Agra', type: 'city', tileX: 58, tileY: 38 },
    { name: 'Varanasi', type: 'city', tileX: 72, tileY: 44 },
    { name: 'Lucknow', type: 'village', tileX: 64, tileY: 40 },
    { name: 'Ayodhya', type: 'village', tileX: 68, tileY: 42 },
  ]},
  b: { code: 'b', name: 'Bihar', biome: 'plains', settlements: [
    { name: 'Pataliputra', type: 'city', tileX: 78, tileY: 48 },
    { name: 'Bodh Gaya', type: 'village', tileX: 78, tileY: 52 },
    { name: 'Rajgir', type: 'village', tileX: 80, tileY: 50 },
  ]},
  j: { code: 'j', name: 'Jharkhand', biome: 'forest', settlements: [
    { name: 'Ranchi', type: 'city', tileX: 78, tileY: 64 },
    { name: 'Hazaribagh', type: 'village', tileX: 76, tileY: 60 },
  ]},
  w: { code: 'w', name: 'West Bengal', biome: 'wetland', settlements: [
    { name: 'Gaur', type: 'city', tileX: 86, tileY: 56 },
    { name: 'Murshidabad', type: 'village', tileX: 86, tileY: 62 },
  ]},
  o: { code: 'o', name: 'Odisha', biome: 'coastal', settlements: [
    { name: 'Puri', type: 'city', tileX: 88, tileY: 80 },
    { name: 'Bhubaneswar', type: 'village', tileX: 86, tileY: 76 },
  ]},
  s: { code: 's', name: 'Sikkim', biome: 'mountain', settlements: [
    { name: 'Gangtok', type: 'village', tileX: 108, tileY: 46 },
  ]},
  a: { code: 'a', name: 'Arunachal Pradesh', biome: 'dense_forest', settlements: [
    { name: 'Tawang', type: 'village', tileX: 126, tileY: 54 },
  ]},
  z: { code: 'z', name: 'Assam', biome: 'wetland', settlements: [
    { name: 'Guwahati', type: 'city', tileX: 106, tileY: 56 },
    { name: 'Tezpur', type: 'village', tileX: 110, tileY: 52 },
  ]},
  n: { code: 'n', name: 'Nagaland', biome: 'mountain', settlements: [
    { name: 'Kohima', type: 'village', tileX: 132, tileY: 64 },
  ]},
  i: { code: 'i', name: 'Manipur', biome: 'mountain', settlements: [
    { name: 'Imphal', type: 'village', tileX: 134, tileY: 70 },
  ]},
  q: { code: 'q', name: 'Mizoram', biome: 'dense_forest', settlements: [
    { name: 'Aizawl', type: 'village', tileX: 132, tileY: 76 },
  ]},
  t: { code: 't', name: 'Tripura', biome: 'forest', settlements: [
    { name: 'Agartala', type: 'village', tileX: 118, tileY: 76 },
  ]},
  e: { code: 'e', name: 'Meghalaya', biome: 'forest', settlements: [
    { name: 'Shillong', type: 'village', tileX: 114, tileY: 56 },
  ]},
  g: { code: 'g', name: 'Gujarat', biome: 'desert', settlements: [
    { name: 'Ahmedabad', type: 'city', tileX: 18, tileY: 74 },
    { name: 'Dwarka', type: 'village', tileX: 10, tileY: 82 },
    { name: 'Somnath', type: 'village', tileX: 14, tileY: 86 },
  ]},
  m: { code: 'm', name: 'Madhya Pradesh', biome: 'forest', settlements: [
    { name: 'Bhopal', type: 'city', tileX: 50, tileY: 58 },
    { name: 'Indore', type: 'city', tileX: 42, tileY: 62 },
    { name: 'Ujjain', type: 'village', tileX: 44, tileY: 58 },
    { name: 'Gwalior', type: 'village', tileX: 52, tileY: 46 },
    { name: 'Khajuraho', type: 'village', tileX: 56, tileY: 54 },
  ]},
  c: { code: 'c', name: 'Chhattisgarh', biome: 'dense_forest', settlements: [
    { name: 'Raipur', type: 'city', tileX: 66, tileY: 70 },
    { name: 'Bastar', type: 'village', tileX: 66, tileY: 78 },
  ]},
  x: { code: 'x', name: 'Maharashtra', biome: 'plateau', settlements: [
    { name: 'Mumbai', type: 'city', tileX: 28, tileY: 98 },
    { name: 'Pune', type: 'city', tileX: 34, tileY: 102 },
    { name: 'Aurangabad', type: 'village', tileX: 38, tileY: 94 },
    { name: 'Nashik', type: 'village', tileX: 32, tileY: 92 },
  ]},
  v: { code: 'v', name: 'Goa', biome: 'coastal', settlements: [
    { name: 'Velha Goa', type: 'village', tileX: 24, tileY: 110 },
  ]},
  k: { code: 'k', name: 'Karnataka', biome: 'plateau', settlements: [
    { name: 'Hampi', type: 'city', tileX: 40, tileY: 120 },
    { name: 'Mysore', type: 'city', tileX: 42, tileY: 134 },
    { name: 'Bijapur', type: 'village', tileX: 38, tileY: 116 },
    { name: 'Badami', type: 'village', tileX: 40, tileY: 118 },
  ]},
  f: { code: 'f', name: 'Kerala', biome: 'coastal', settlements: [
    { name: 'Kozhikode', type: 'city', tileX: 44, tileY: 146 },
    { name: 'Kochi', type: 'village', tileX: 44, tileY: 154 },
  ]},
  $: { code: '$', name: 'Telangana', biome: 'plateau', settlements: [
    { name: 'Golconda', type: 'city', tileX: 54, tileY: 104 },
    { name: 'Warangal', type: 'village', tileX: 58, tileY: 100 },
  ]},
  '@': { code: '@', name: 'Andhra Pradesh', biome: 'coastal', settlements: [
    { name: 'Amaravati', type: 'city', tileX: 64, tileY: 122 },
    { name: 'Tirupati', type: 'village', tileX: 58, tileY: 134 },
  ]},
  '#': { code: '#', name: 'Tamil Nadu', biome: 'plains', settlements: [
    { name: 'Madurai', type: 'city', tileX: 56, tileY: 150 },
    { name: 'Thanjavur', type: 'village', tileX: 56, tileY: 142 },
    { name: 'Mahabalipuram', type: 'village', tileX: 60, tileY: 138 },
  ]},
};

// Also treat 'd' (lowercase delhi area in template) as Delhi
STATES['d'] = STATES['D'];

// Biome → tile type mapping with weights
const BIOME_TILES: Record<BiomeType, TileType[]> = {
  ocean:        [TileType.OCEAN],
  snow:         [TileType.SNOW],
  mountain:     [TileType.MOUNTAIN, TileType.MOUNTAIN, TileType.PLATEAU],
  desert:       [TileType.DESERT, TileType.DESERT, TileType.DESERT, TileType.PLAINS],
  plains:       [TileType.PLAINS, TileType.PLAINS, TileType.PLAINS, TileType.FARM],
  forest:       [TileType.FOREST, TileType.FOREST, TileType.PLAINS],
  dense_forest: [TileType.DENSE_JUNGLE, TileType.DENSE_JUNGLE, TileType.FOREST],
  plateau:      [TileType.PLATEAU, TileType.PLATEAU, TileType.PLATEAU, TileType.FOREST],
  wetland:      [TileType.SWAMP, TileType.SWAMP, TileType.PLAINS, TileType.FOREST],
  coastal:      [TileType.PLAINS, TileType.PLAINS, TileType.FOREST, TileType.BEACH],
};

// Deterministic pseudo-random based on position
function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

// Major rivers as waypoint lists (tile coords)
const RIVERS: number[][][] = [
  // Ganges: Uttarakhand → UP → Bihar → WB
  [[62,18],[60,24],[56,32],[58,38],[64,42],[70,44],[76,48],[82,52],[86,58]],
  // Yamuna: Uttarakhand → Delhi → meets Ganges
  [[58,16],[54,22],[52,28],[52,34],[56,38],[62,42]],
  // Narmada: MP → Gujarat
  [[56,62],[48,64],[40,68],[32,72],[22,76]],
  // Godavari: Maharashtra → Telangana → AP
  [[34,96],[42,98],[52,102],[62,108],[72,114]],
  // Krishna: Maharashtra → Karnataka → AP
  [[38,106],[48,110],[58,116],[68,122]],
  // Brahmaputra: Arunachal → Assam → WB
  [[128,50],[120,52],[112,54],[106,56],[100,60],[90,64]],
];

function drawLine(
  ground: TileType[][],
  x0: number, y0: number, x1: number, y1: number,
  tile: TileType, width: number = 1,
) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0, cy = y0;

  while (true) {
    for (let w = 0; w < width; w++) {
      const wy = cy + w;
      if (cx >= 0 && cx < 160 && wy >= 0 && wy < 200) {
        ground[wy][cx] = tile;
      }
    }
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

function placeSettlement(
  ground: TileType[][],
  s: SettlementDef,
  biome: BiomeType,
) {
  const sizes = { village: 8, city: 14, capital: 22 };
  const size = sizes[s.type];
  const half = Math.floor(size / 2);
  const baseTile = biome === 'desert' ? TileType.DESERT : TileType.PLAINS;
  const pathTile = s.type === 'village' ? TileType.PATH_DIRT : TileType.PATH_STONE;
  const wallTile = s.type === 'capital' ? TileType.FORT_WALL : TileType.WALL_MUD;

  // Clear area
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const tx = s.tileX - half + dx;
      const ty = s.tileY - half + dy;
      if (tx >= 0 && tx < 160 && ty >= 0 && ty < 200) {
        ground[ty][tx] = baseTile;
      }
    }
  }

  // Paths: cross pattern + perimeter for cities
  for (let i = 1; i < size - 1; i++) {
    const mx = s.tileX - half + i;
    const my = s.tileY - half + i;
    if (mx >= 0 && mx < 160) {
      if (s.tileY >= 0 && s.tileY < 200) ground[s.tileY][mx] = pathTile;
    }
    if (my >= 0 && my < 200) {
      if (s.tileX >= 0 && s.tileX < 160) ground[my][s.tileX] = pathTile;
    }
  }

  if (s.type !== 'village') {
    // Perimeter wall with gates
    for (let i = 0; i < size; i++) {
      const positions = [
        [s.tileX - half + i, s.tileY - half],        // top
        [s.tileX - half + i, s.tileY + half - 1],    // bottom
        [s.tileX - half, s.tileY - half + i],          // left
        [s.tileX + half - 1, s.tileY - half + i],      // right
      ];
      for (const [wx, wy] of positions) {
        if (wx >= 0 && wx < 160 && wy >= 0 && wy < 200) {
          const isGate = i === Math.floor(size / 2) || i === Math.floor(size / 2) - 1;
          ground[wy][wx] = isGate ? TileType.DOOR : wallTile;
        }
      }
    }
  }

  // Buildings based on type
  const bldg = s.type === 'capital' ? TileType.WALL_STONE : TileType.WALL_MUD;
  const buildingPositions = getBuildingPositions(s.type, half);

  for (const [bx, by, w, h, type] of buildingPositions) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const tx = s.tileX + bx + dx;
        const ty = s.tileY + by + dy;
        if (tx >= 0 && tx < 160 && ty >= 0 && ty < 200) {
          if (dy === h - 1 && dx === Math.floor(w / 2)) {
            ground[ty][tx] = TileType.DOOR;
          } else if (dy === 0) {
            ground[ty][tx] = TileType.ROOF;
          } else {
            ground[ty][tx] = type === 'special' ? TileType.TEMPLE : bldg;
          }
        }
      }
    }
  }

  // Central feature
  if (s.tileX >= 0 && s.tileX < 160 && s.tileY >= 0 && s.tileY < 200) {
    if (s.type === 'village') {
      ground[s.tileY][s.tileX] = TileType.WELL;
    } else if (s.type === 'capital') {
      // Palace in center
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const tx = s.tileX + dx, ty = s.tileY + dy;
          if (tx >= 0 && tx < 160 && ty >= 0 && ty < 200) {
            if (Math.abs(dx) === 2 || Math.abs(dy) === 2) {
              ground[ty][tx] = TileType.FORT_WALL;
            } else if (dx === 0 && dy === 2) {
              ground[ty][tx] = TileType.DOOR;
            } else {
              ground[ty][tx] = TileType.PALACE;
            }
          }
        }
      }
      // Gardens
      for (let dx = -3; dx <= 3; dx++) {
        const gx = s.tileX + dx, gy = s.tileY - 4;
        if (gx >= 0 && gx < 160 && gy >= 0 && gy < 200) {
          ground[gy][gx] = TileType.GARDEN;
        }
      }
    } else {
      // Market square for cities
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const tx = s.tileX + dx, ty = s.tileY + dy;
          if (tx >= 0 && tx < 160 && ty >= 0 && ty < 200) {
            ground[ty][tx] = TileType.MARKET;
          }
        }
      }
    }
  }
}

function getBuildingPositions(
  type: string,
  half: number,
): [number, number, number, number, string][] {
  // [offsetX, offsetY, width, height, type]
  if (type === 'village') {
    return [
      [-half + 1, -half + 1, 2, 2, 'normal'],
      [half - 3, -half + 1, 2, 2, 'normal'],
      [-half + 1, half - 3, 2, 2, 'normal'],
      [half - 3, half - 3, 2, 2, 'special'],
    ];
  }
  if (type === 'city') {
    return [
      [-5, -5, 3, 2, 'normal'], [-1, -5, 3, 2, 'normal'], [3, -5, 3, 2, 'special'],
      [-5, -2, 2, 2, 'normal'], [4, -2, 2, 2, 'normal'],
      [-5, 2, 3, 2, 'normal'], [-1, 2, 3, 2, 'normal'], [3, 2, 3, 2, 'normal'],
    ];
  }
  // capital
  return [
    [-8, -8, 3, 2, 'normal'], [-4, -8, 3, 2, 'normal'], [2, -8, 3, 2, 'normal'], [6, -8, 3, 2, 'special'],
    [-8, -4, 2, 2, 'normal'], [7, -4, 2, 2, 'normal'],
    [-8, 4, 3, 2, 'normal'], [-4, 4, 3, 2, 'normal'], [2, 4, 3, 2, 'normal'], [6, 4, 3, 2, 'normal'],
    [-8, 7, 2, 2, 'normal'], [7, 7, 2, 2, 'normal'],
    [5, -4, 2, 3, 'special'],
  ];
}

// Get all settlements across all states
export function getAllSettlements(): { settlement: SettlementDef; biome: BiomeType }[] {
  const result: { settlement: SettlementDef; biome: BiomeType }[] = [];
  for (const state of Object.values(STATES)) {
    for (const s of state.settlements) {
      result.push({ settlement: s, biome: state.biome });
    }
  }
  return result;
}

// Get state name at a tile position
export function getStateName(tileX: number, tileY: number): string {
  const tx = Math.floor(tileX / 4);
  const ty = Math.floor(tileY / 4);
  if (ty < 0 || ty >= TEMPLATE.length || tx < 0 || tx >= 40) return 'Ocean';
  const code = TEMPLATE[ty]?.[tx];
  if (!code || code === '.' || code === '^') return 'Wilderness';
  const state = STATES[code];
  return state?.name || 'Unknown';
}

// Get nearest settlement name
export function getNearestSettlement(tileX: number, tileY: number): string | null {
  let closest: string | null = null;
  let minDist = Infinity;
  for (const state of Object.values(STATES)) {
    for (const s of state.settlements) {
      const dx = s.tileX - tileX;
      const dy = s.tileY - tileY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closest = s.name;
      }
    }
  }
  return minDist < 20 ? closest : null;
}

// Generate the full 160x200 tile map
export function generateIndiaMap(): TileMapData {
  const W = 160, H = 200;
  const ground: TileType[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => TileType.OCEAN)
  );

  // 1. Fill biome tiles from template (upscale 4x)
  for (let ty = 0; ty < 50; ty++) {
    const row = TEMPLATE[ty];
    if (!row) continue;
    for (let tx = 0; tx < 40; tx++) {
      const code = row[tx];
      if (code === '.') continue; // ocean

      let biome: BiomeType;
      if (code === '^') {
        biome = 'snow';
      } else {
        const state = STATES[code];
        if (!state) continue;
        biome = state.biome;
      }

      const tiles = BIOME_TILES[biome];
      // Fill 4x4 block
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          const px = tx * 4 + dx;
          const py = ty * 4 + dy;
          if (px < W && py < H) {
            const idx = Math.floor(hash(px, py) * tiles.length);
            ground[py][px] = tiles[idx];
          }
        }
      }
    }
  }

  // 2. Add beaches near ocean
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (ground[y][x] !== TileType.OCEAN) {
        const neighbors = [
          ground[y-1][x], ground[y+1][x], ground[y][x-1], ground[y][x+1]
        ];
        if (neighbors.some(n => n === TileType.OCEAN) && hash(x, y) < 0.5) {
          ground[y][x] = TileType.BEACH;
        }
      }
    }
  }

  // 3. Draw rivers
  for (const river of RIVERS) {
    for (let i = 0; i < river.length - 1; i++) {
      const [x0, y0] = river[i];
      const [x1, y1] = river[i + 1];
      drawLine(ground, x0, y0, x1, y1, TileType.RIVER, 1);
    }
  }

  // 4. Place settlements
  const settlements = getAllSettlements();
  for (const { settlement, biome } of settlements) {
    placeSettlement(ground, settlement, biome);
  }

  // 5. Connect nearby settlements with dirt paths
  for (let i = 0; i < settlements.length; i++) {
    let nearest = -1;
    let minDist = 40; // max path distance in tiles
    for (let j = 0; j < settlements.length; j++) {
      if (i === j) continue;
      const dx = settlements[i].settlement.tileX - settlements[j].settlement.tileX;
      const dy = settlements[i].settlement.tileY - settlements[j].settlement.tileY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = j;
      }
    }
    if (nearest >= 0) {
      const s1 = settlements[i].settlement;
      const s2 = settlements[nearest].settlement;
      drawLine(ground, s1.tileX, s1.tileY, s2.tileX, s2.tileY, TileType.PATH_DIRT, 1);
    }
  }

  return { width: W, height: H, ground };
}

// Player starts just south of Delhi palace
export const PLAYER_START = { x: 52, y: 32 };

// NPCs at major settlements
export const WORLD_NPCS: NPC[] = [
  {
    id: 'delhi-advisor',
    name: 'Vizier Mirza',
    position: { x: 54, y: 30 },
    direction: 'down',
    dialog: [
      'Welcome to Shahjahanabad, traveler!',
      'You stand in the heart of the Mughal Empire.',
      'The Emperor has built this magnificent city...',
      'Explore the bazaars, visit the mosques, and beware the palace guards!',
      'If you seek adventure, head south to the Deccan or west to Rajputana.',
    ],
    settlement: 'Shahjahanabad',
  },
  {
    id: 'agra-merchant',
    name: 'Merchant Ratan',
    position: { x: 60, y: 38 },
    direction: 'left',
    dialog: [
      'Ah, you have come to Agra!',
      'The Taj Mahal... err, the grand monument stands nearby.',
      'I sell the finest silks from Bengal and spices from Kerala.',
      'Trade routes connect all of Hindustan!',
    ],
    settlement: 'Agra',
  },
  {
    id: 'jaipur-guard',
    name: 'Rajput Vikram',
    position: { x: 38, y: 44 },
    direction: 'right',
    dialog: [
      'Halt! You enter Amber, seat of the Rajput kings.',
      'We Rajputs have defended this land for centuries.',
      'The desert holds many secrets... and many dangers.',
      'Bandits roam the dunes between here and Jaisalmer.',
    ],
    settlement: 'Amber',
  },
  {
    id: 'varanasi-scholar',
    name: 'Pandit Sharma',
    position: { x: 74, y: 44 },
    direction: 'down',
    dialog: [
      'Namaste! Welcome to Kashi, the eternal city.',
      'This is the holiest of places on the Ganga.',
      'Scholars from across the land come here to learn.',
      'The wisdom of the ancients flows through these ghats.',
    ],
    settlement: 'Varanasi',
  },
  {
    id: 'guwahati-sage',
    name: 'Sage Bhupen',
    position: { x: 108, y: 56 },
    direction: 'down',
    dialog: [
      'You have traveled far to reach Assam, friend.',
      'The Brahmaputra river is our lifeline.',
      'The hills of the northeast hide ancient kingdoms.',
      'Few outsiders venture this far... you are brave.',
    ],
    settlement: 'Guwahati',
  },
  {
    id: 'hampi-priest',
    name: 'Priest Vidyaranya',
    position: { x: 42, y: 120 },
    direction: 'down',
    dialog: [
      'Welcome to Hampi, jewel of the Vijayanagara Empire!',
      'These temples were built by great kings.',
      'The Deccan plateau stretches in all directions.',
      'Seek the ruins... they hold treasures of a lost age.',
    ],
    settlement: 'Hampi',
  },
  {
    id: 'kozhikode-trader',
    name: 'Trader Ibrahim',
    position: { x: 46, y: 146 },
    direction: 'right',
    dialog: [
      'Ahlan! Welcome to Kozhikode, the spice coast!',
      'Ships come from Arabia, Persia, and even Cathay.',
      'Pepper, cardamom, cinnamon... Kerala has it all.',
      'The monsoon winds bring fortune and fury alike.',
    ],
    settlement: 'Kozhikode',
  },
];

// Minimap color per tile type
export const MINIMAP_COLORS: Record<TileType, string> = {
  [TileType.OCEAN]: '#1a3a6a',
  [TileType.BEACH]: '#e0d090',
  [TileType.PLAINS]: '#6aaa40',
  [TileType.FOREST]: '#2d6e2d',
  [TileType.DENSE_JUNGLE]: '#1a4a1a',
  [TileType.DESERT]: '#d4b060',
  [TileType.MOUNTAIN]: '#808080',
  [TileType.SNOW]: '#e8e8f0',
  [TileType.PLATEAU]: '#8a7a50',
  [TileType.SWAMP]: '#3a6a4a',
  [TileType.RIVER]: '#4090d0',
  [TileType.FARM]: '#90c040',
  [TileType.PATH_DIRT]: '#c4a46c',
  [TileType.PATH_STONE]: '#a0a0a0',
  [TileType.WALL_MUD]: '#8b6340',
  [TileType.WALL_STONE]: '#707070',
  [TileType.ROOF]: '#a03020',
  [TileType.DOOR]: '#b8894a',
  [TileType.MARKET]: '#e0c020',
  [TileType.TEMPLE]: '#d04030',
  [TileType.FORT_WALL]: '#505050',
  [TileType.PALACE]: '#c0a040',
  [TileType.WELL]: '#5090d0',
  [TileType.GARDEN]: '#40a040',
};
