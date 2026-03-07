import { TileType, TileMapData, BiomeType, StateDef, SettlementDef, NPC } from '../types';

// Low-res template: 40 cols x 50 rows → upscale 8x → 320x400 tile map
const TEMPLATE: string[] = [
  '........................................', // 0
  '........................................', // 1
  '...........^^^^.........................', // 2
  '..........^^hhhuuu......................', // 3
  '..........^hhhhuuuu.....................', // 4
  '.........^phhhhduuuu....................', // 5
  '.........pphhydddluuu...................', // 6
  '.........ppyyydDllluu...................', // 7
  '.........ppyyyddllllu...................', // 8
  '........rppyyymdllllll..................', // 9
  '........rrryymmmlllllbb.................', // 10
  '.......rrrryymmmllllbbb......s..........', // 11
  '.......rrrrrmmmmllllbbbw...szze.........', // 12
  '......rrrrrrmmmlllllbbwww.zzzzea........', // 13
  '......rrrrrrmmmllllbbwww.zzzzzeean......', // 14
  '......rrrrrrmmmmllbbjjww.zzzzeeeann.....', // 15
  '.....rrrrrrrmmmcccbjjwww.zzzteeennni....', // 16
  '.....grrrrrrmmmcccjjwww..zztteennniiq...', // 17
  '....ggrrrrrmmmmccjjjooo..zztteeenniiqq..', // 18
  '...ggggrrrrmmmcccjjoooo...tttteeeiqqq...', // 19
  '..gggggrrrrmmmccccooooo....tttteqqq.....', // 20
  '.gggggggrrrmmmcccooooo......ttqqq.......', // 21
  '..ggggggrmmmmcccooooo...................', // 22
  '...gggggxmmmmcc$$oooo...................', // 23
  '....ggxxxxxmm$$$$ooo....................', // 24
  '.....gxxxxmmm$$$$$@o....................', // 25
  '......xxxxxm$$$$$@@@....................', // 26
  '......vxxxxm$$$$$@@@....................', // 27
  '.......vxxx$$$$@@@@@....................', // 28
  '........xkkk$$@@@@@@....................', // 29
  '........kkkk$@@@@@@@....................', // 30
  '.........kkk$$@@@@@@....................', // 31
  '.........kkk@@@@###.....................', // 32
  '.........kk@@@@####.....................', // 33
  '..........kk@@#####.....................', // 34
  '..........kkf@@####.....................', // 35
  '..........kff@#####.....................', // 36
  '...........ff@####......................', // 37
  '...........ff####.......................', // 38
  '...........ff###........................', // 39
  '...........ff##.........................', // 40
  '............f##.........................', // 41
  '............f#..........................', // 42
  '............f...........................', // 43
  '........................................', // 44
  '........................................', // 45
  '........................................', // 46
  '........................................', // 47
  '........................................', // 48
  '........................................', // 49
];

const UPSCALE = 8;
const MAP_W = 40 * UPSCALE; // 320
const MAP_H = 50 * UPSCALE; // 400

// State definitions (all tile coordinates for 320x400 map)
const STATES: Record<string, StateDef> = {
  h: { code: 'h', name: 'Himachal Pradesh', biome: 'mountain', settlements: [
    { name: 'Shimla', type: 'city', tileX: 92, tileY: 32 },
    { name: 'Kullu', type: 'village', tileX: 88, tileY: 24 },
    { name: 'Manali', type: 'village', tileX: 86, tileY: 20 },
  ]},
  u: { code: 'u', name: 'Uttarakhand', biome: 'mountain', settlements: [
    { name: 'Haridwar', type: 'city', tileX: 124, tileY: 40 },
    { name: 'Rishikesh', type: 'village', tileX: 120, tileY: 32 },
    { name: 'Nainital', type: 'village', tileX: 128, tileY: 36 },
  ]},
  p: { code: 'p', name: 'Punjab', biome: 'plains', settlements: [
    { name: 'Amritsar', type: 'city', tileX: 76, tileY: 48 },
    { name: 'Lahore Gate', type: 'village', tileX: 80, tileY: 56 },
  ]},
  y: { code: 'y', name: 'Haryana', biome: 'plains', settlements: [
    { name: 'Kurukshetra', type: 'city', tileX: 88, tileY: 60 },
    { name: 'Panipat', type: 'village', tileX: 88, tileY: 68 },
  ]},
  D: { code: 'D', name: 'Delhi', biome: 'plains', settlements: [
    { name: 'Shahjahanabad', type: 'capital', tileX: 104, tileY: 56 },
  ]},
  r: { code: 'r', name: 'Rajasthan', biome: 'desert', settlements: [
    { name: 'Amber', type: 'city', tileX: 72, tileY: 88 },
    { name: 'Jodhpur', type: 'city', tileX: 52, tileY: 100 },
    { name: 'Jaisalmer', type: 'village', tileX: 44, tileY: 84 },
    { name: 'Udaipur', type: 'village', tileX: 60, tileY: 120 },
    { name: 'Pushkar', type: 'village', tileX: 68, tileY: 96 },
    { name: 'Bikaner', type: 'village', tileX: 56, tileY: 80 },
  ]},
  l: { code: 'l', name: 'Uttar Pradesh', biome: 'plains', settlements: [
    { name: 'Agra', type: 'city', tileX: 116, tileY: 76 },
    { name: 'Varanasi', type: 'city', tileX: 144, tileY: 88 },
    { name: 'Lucknow', type: 'city', tileX: 128, tileY: 80 },
    { name: 'Ayodhya', type: 'village', tileX: 136, tileY: 84 },
    { name: 'Mathura', type: 'village', tileX: 112, tileY: 72 },
    { name: 'Allahabad', type: 'village', tileX: 140, tileY: 82 },
  ]},
  b: { code: 'b', name: 'Bihar', biome: 'plains', settlements: [
    { name: 'Pataliputra', type: 'city', tileX: 156, tileY: 96 },
    { name: 'Bodh Gaya', type: 'village', tileX: 156, tileY: 104 },
    { name: 'Rajgir', type: 'village', tileX: 160, tileY: 100 },
  ]},
  j: { code: 'j', name: 'Jharkhand', biome: 'forest', settlements: [
    { name: 'Ranchi', type: 'city', tileX: 156, tileY: 128 },
    { name: 'Hazaribagh', type: 'village', tileX: 152, tileY: 120 },
  ]},
  w: { code: 'w', name: 'West Bengal', biome: 'wetland', settlements: [
    { name: 'Gaur', type: 'city', tileX: 172, tileY: 112 },
    { name: 'Murshidabad', type: 'village', tileX: 172, tileY: 124 },
    { name: 'Sundarbans', type: 'village', tileX: 176, tileY: 130 },
  ]},
  o: { code: 'o', name: 'Odisha', biome: 'coastal', settlements: [
    { name: 'Puri', type: 'city', tileX: 176, tileY: 160 },
    { name: 'Bhubaneswar', type: 'city', tileX: 172, tileY: 152 },
    { name: 'Konark', type: 'village', tileX: 178, tileY: 156 },
  ]},
  s: { code: 's', name: 'Sikkim', biome: 'mountain', settlements: [
    { name: 'Gangtok', type: 'village', tileX: 216, tileY: 92 },
  ]},
  a: { code: 'a', name: 'Arunachal Pradesh', biome: 'dense_forest', settlements: [
    { name: 'Tawang', type: 'village', tileX: 252, tileY: 108 },
    { name: 'Itanagar', type: 'village', tileX: 244, tileY: 112 },
  ]},
  z: { code: 'z', name: 'Assam', biome: 'wetland', settlements: [
    { name: 'Guwahati', type: 'city', tileX: 212, tileY: 112 },
    { name: 'Tezpur', type: 'village', tileX: 220, tileY: 104 },
    { name: 'Jorhat', type: 'village', tileX: 228, tileY: 108 },
  ]},
  n: { code: 'n', name: 'Nagaland', biome: 'mountain', settlements: [
    { name: 'Kohima', type: 'village', tileX: 264, tileY: 128 },
  ]},
  i: { code: 'i', name: 'Manipur', biome: 'mountain', settlements: [
    { name: 'Imphal', type: 'village', tileX: 268, tileY: 140 },
  ]},
  q: { code: 'q', name: 'Mizoram', biome: 'dense_forest', settlements: [
    { name: 'Aizawl', type: 'village', tileX: 264, tileY: 152 },
  ]},
  t: { code: 't', name: 'Tripura', biome: 'forest', settlements: [
    { name: 'Agartala', type: 'village', tileX: 236, tileY: 152 },
  ]},
  e: { code: 'e', name: 'Meghalaya', biome: 'forest', settlements: [
    { name: 'Shillong', type: 'city', tileX: 228, tileY: 112 },
    { name: 'Cherrapunji', type: 'village', tileX: 232, tileY: 116 },
  ]},
  g: { code: 'g', name: 'Gujarat', biome: 'desert', settlements: [
    { name: 'Ahmedabad', type: 'city', tileX: 36, tileY: 148 },
    { name: 'Dwarka', type: 'village', tileX: 20, tileY: 164 },
    { name: 'Somnath', type: 'village', tileX: 28, tileY: 172 },
    { name: 'Surat', type: 'village', tileX: 40, tileY: 156 },
  ]},
  m: { code: 'm', name: 'Madhya Pradesh', biome: 'forest', settlements: [
    { name: 'Bhopal', type: 'city', tileX: 100, tileY: 116 },
    { name: 'Indore', type: 'city', tileX: 84, tileY: 124 },
    { name: 'Ujjain', type: 'village', tileX: 88, tileY: 116 },
    { name: 'Gwalior', type: 'village', tileX: 104, tileY: 92 },
    { name: 'Khajuraho', type: 'village', tileX: 112, tileY: 108 },
    { name: 'Sanchi', type: 'village', tileX: 96, tileY: 112 },
  ]},
  c: { code: 'c', name: 'Chhattisgarh', biome: 'dense_forest', settlements: [
    { name: 'Raipur', type: 'city', tileX: 132, tileY: 140 },
    { name: 'Bastar', type: 'village', tileX: 132, tileY: 156 },
    { name: 'Bilaspur', type: 'village', tileX: 136, tileY: 132 },
  ]},
  x: { code: 'x', name: 'Maharashtra', biome: 'plateau', settlements: [
    { name: 'Mumbai', type: 'city', tileX: 56, tileY: 196 },
    { name: 'Pune', type: 'city', tileX: 68, tileY: 204 },
    { name: 'Aurangabad', type: 'village', tileX: 76, tileY: 188 },
    { name: 'Nashik', type: 'village', tileX: 64, tileY: 184 },
    { name: 'Ajanta', type: 'village', tileX: 80, tileY: 192 },
  ]},
  v: { code: 'v', name: 'Goa', biome: 'coastal', settlements: [
    { name: 'Velha Goa', type: 'village', tileX: 48, tileY: 220 },
  ]},
  k: { code: 'k', name: 'Karnataka', biome: 'plateau', settlements: [
    { name: 'Hampi', type: 'city', tileX: 80, tileY: 240 },
    { name: 'Mysore', type: 'city', tileX: 84, tileY: 268 },
    { name: 'Bijapur', type: 'village', tileX: 76, tileY: 232 },
    { name: 'Badami', type: 'village', tileX: 80, tileY: 236 },
    { name: 'Mangalore', type: 'village', tileX: 64, tileY: 260 },
  ]},
  f: { code: 'f', name: 'Kerala', biome: 'coastal', settlements: [
    { name: 'Kozhikode', type: 'city', tileX: 88, tileY: 292 },
    { name: 'Kochi', type: 'city', tileX: 88, tileY: 308 },
    { name: 'Trivandrum', type: 'village', tileX: 88, tileY: 320 },
    { name: 'Alleppey', type: 'village', tileX: 86, tileY: 312 },
  ]},
  $: { code: '$', name: 'Telangana', biome: 'plateau', settlements: [
    { name: 'Golconda', type: 'city', tileX: 108, tileY: 208 },
    { name: 'Warangal', type: 'village', tileX: 116, tileY: 200 },
  ]},
  '@': { code: '@', name: 'Andhra Pradesh', biome: 'coastal', settlements: [
    { name: 'Amaravati', type: 'city', tileX: 128, tileY: 244 },
    { name: 'Tirupati', type: 'city', tileX: 116, tileY: 268 },
    { name: 'Visakhapatnam', type: 'village', tileX: 144, tileY: 228 },
  ]},
  '#': { code: '#', name: 'Tamil Nadu', biome: 'plains', settlements: [
    { name: 'Madurai', type: 'city', tileX: 112, tileY: 300 },
    { name: 'Thanjavur', type: 'city', tileX: 112, tileY: 284 },
    { name: 'Mahabalipuram', type: 'village', tileX: 120, tileY: 276 },
    { name: 'Kanchipuram', type: 'village', tileX: 116, tileY: 272 },
    { name: 'Rameswaram', type: 'village', tileX: 116, tileY: 308 },
  ]},
};

STATES['d'] = STATES['D'];

// Biome → tile type mapping with new variety types
const BIOME_TILES: Record<BiomeType, TileType[]> = {
  ocean:        [TileType.OCEAN, TileType.OCEAN, TileType.DEEP_OCEAN],
  snow:         [TileType.SNOW, TileType.SNOW, TileType.ICE],
  mountain:     [TileType.MOUNTAIN, TileType.MOUNTAIN, TileType.CLIFF, TileType.ROCKS, TileType.PLATEAU],
  desert:       [TileType.DESERT, TileType.DESERT, TileType.DESERT, TileType.SAND_DUNES, TileType.SAND_DUNES, TileType.PLAINS],
  plains:       [TileType.PLAINS, TileType.PLAINS, TileType.PLAINS, TileType.TALL_GRASS, TileType.FARM, TileType.FLOWERS],
  forest:       [TileType.FOREST, TileType.FOREST, TileType.TREE_BANYAN, TileType.TALL_GRASS, TileType.PLAINS],
  dense_forest: [TileType.DENSE_JUNGLE, TileType.DENSE_JUNGLE, TileType.FOREST, TileType.TREE_BANYAN, TileType.TALL_GRASS],
  plateau:      [TileType.PLATEAU, TileType.PLATEAU, TileType.ROCKS, TileType.FOREST, TileType.TALL_GRASS],
  wetland:      [TileType.SWAMP, TileType.SWAMP, TileType.TALL_GRASS, TileType.PLAINS, TileType.SHALLOW_WATER],
  coastal:      [TileType.PLAINS, TileType.PLAINS, TileType.TREE_PALM, TileType.FLOWERS, TileType.FOREST, TileType.BEACH],
};

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

// Major rivers (coordinates for 320x400 map)
const RIVERS: number[][][] = [
  // Ganges
  [[124,36],[120,48],[112,64],[116,76],[128,84],[140,88],[152,96],[164,104],[172,116]],
  // Yamuna
  [[116,32],[108,44],[104,56],[104,68],[112,76],[124,84]],
  // Narmada
  [[112,124],[96,128],[80,136],[64,144],[44,152]],
  // Godavari
  [[68,192],[84,196],[104,204],[124,216],[144,228]],
  // Krishna
  [[76,212],[96,220],[116,232],[136,244]],
  // Brahmaputra
  [[256,100],[240,104],[224,108],[212,112],[200,120],[180,128]],
  // Cauvery
  [[88,260],[96,268],[104,276],[112,284]],
  // Tungabhadra
  [[76,240],[84,244],[92,248]],
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
    for (let w = -Math.floor(width / 2); w <= Math.floor(width / 2); w++) {
      const wy = cy + w;
      if (cx >= 0 && cx < MAP_W && wy >= 0 && wy < MAP_H) {
        ground[wy][cx] = tile;
      }
    }
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

function setTile(ground: TileType[][], x: number, y: number, tile: TileType) {
  if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) {
    ground[y][x] = tile;
  }
}

function placeSettlement(ground: TileType[][], s: SettlementDef, biome: BiomeType) {
  const sizes = { village: 12, city: 22, capital: 34 };
  const size = sizes[s.type];
  const half = Math.floor(size / 2);
  const baseTile = biome === 'desert' ? TileType.DESERT : TileType.PLAINS;
  const pathTile = s.type === 'village' ? TileType.PATH_DIRT : TileType.PATH_STONE;
  const wallTile = s.type === 'capital' ? TileType.FORT_WALL : TileType.WALL_MUD;

  // Clear area
  for (let dy = -half - 2; dy <= half + 2; dy++) {
    for (let dx = -half - 2; dx <= half + 2; dx++) {
      setTile(ground, s.tileX + dx, s.tileY + dy, baseTile);
    }
  }

  // Cross paths
  for (let i = -half; i <= half; i++) {
    setTile(ground, s.tileX + i, s.tileY, pathTile);
    setTile(ground, s.tileX + i, s.tileY + 1, pathTile);
    setTile(ground, s.tileX, s.tileY + i, pathTile);
    setTile(ground, s.tileX + 1, s.tileY + i, pathTile);
  }

  // Walls for cities/capital
  if (s.type !== 'village') {
    for (let i = -half; i <= half; i++) {
      const isGate = Math.abs(i) <= 1;
      const tile = isGate ? TileType.DOOR : wallTile;
      setTile(ground, s.tileX + i, s.tileY - half, tile);
      setTile(ground, s.tileX + i, s.tileY + half, tile);
      setTile(ground, s.tileX - half, s.tileY + i, tile);
      setTile(ground, s.tileX + half, s.tileY + i, tile);
    }
  }

  // Buildings
  const bldg = s.type === 'capital' ? TileType.WALL_STONE : TileType.WALL_MUD;
  for (const [bx, by, w, h, type] of getBuildingPositions(s.type, half)) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const tx = s.tileX + bx + dx;
        const ty = s.tileY + by + dy;
        if (dy === h - 1 && dx === Math.floor(w / 2)) {
          setTile(ground, tx, ty, TileType.DOOR);
        } else if (dy === 0) {
          setTile(ground, tx, ty, TileType.ROOF);
        } else {
          setTile(ground, tx, ty, type === 'special' ? TileType.TEMPLE : bldg);
        }
      }
    }
  }

  // Central feature
  if (s.type === 'village') {
    setTile(ground, s.tileX, s.tileY, TileType.WELL);
    for (let d = -1; d <= 1; d++) setTile(ground, s.tileX + d, s.tileY - 2, TileType.GARDEN);
  } else if (s.type === 'capital') {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (Math.abs(dx) === 3 || Math.abs(dy) === 3) {
          setTile(ground, s.tileX + dx, s.tileY + dy, TileType.FORT_WALL);
        } else if (dx === 0 && dy === 3) {
          setTile(ground, s.tileX + dx, s.tileY + dy, TileType.DOOR);
        } else {
          setTile(ground, s.tileX + dx, s.tileY + dy, TileType.PALACE);
        }
      }
    }
    for (let dx = -5; dx <= 5; dx++) {
      for (let dy = -6; dy <= -5; dy++) {
        setTile(ground, s.tileX + dx, s.tileY + dy, TileType.GARDEN);
      }
    }
  } else {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        setTile(ground, s.tileX + dx, s.tileY + dy, TileType.MARKET);
      }
    }
  }
}

function getBuildingPositions(type: string, half: number): [number, number, number, number, string][] {
  if (type === 'village') {
    return [
      [-half + 2, -half + 2, 3, 3, 'normal'],
      [half - 4, -half + 2, 3, 3, 'normal'],
      [-half + 2, half - 4, 3, 3, 'normal'],
      [half - 4, half - 4, 3, 3, 'special'],
    ];
  }
  if (type === 'city') {
    return [
      [-8, -8, 4, 3, 'normal'], [-2, -8, 4, 3, 'normal'], [4, -8, 4, 3, 'special'],
      [-8, -3, 3, 3, 'normal'], [6, -3, 3, 3, 'normal'],
      [-8, 4, 4, 3, 'normal'], [-2, 4, 4, 3, 'normal'], [4, 4, 4, 3, 'normal'],
      [-8, 8, 3, 3, 'normal'], [6, 8, 3, 3, 'normal'],
    ];
  }
  return [
    [-12, -12, 4, 3, 'normal'], [-6, -12, 4, 3, 'normal'], [2, -12, 4, 3, 'normal'], [8, -12, 4, 3, 'special'],
    [-12, -6, 3, 3, 'normal'], [10, -6, 3, 3, 'normal'],
    [-12, 6, 4, 3, 'normal'], [-6, 6, 4, 3, 'normal'], [2, 6, 4, 3, 'normal'], [8, 6, 4, 3, 'normal'],
    [-12, 10, 3, 3, 'normal'], [10, 10, 3, 3, 'normal'],
    [8, -6, 3, 4, 'special'],
  ];
}

export function getAllSettlements(): { settlement: SettlementDef; biome: BiomeType }[] {
  const seen = new Set<string>();
  const result: { settlement: SettlementDef; biome: BiomeType }[] = [];
  for (const state of Object.values(STATES)) {
    if (seen.has(state.code)) continue;
    seen.add(state.code);
    for (const s of state.settlements) {
      result.push({ settlement: s, biome: state.biome });
    }
  }
  return result;
}

export function getStateName(tileX: number, tileY: number): string {
  const tx = Math.floor(tileX / UPSCALE);
  const ty = Math.floor(tileY / UPSCALE);
  if (ty < 0 || ty >= TEMPLATE.length || tx < 0 || tx >= 40) return 'Ocean';
  const code = TEMPLATE[ty]?.[tx];
  if (!code || code === '.' || code === '^') return 'Wilderness';
  return STATES[code]?.name || 'Unknown';
}

export function getNearestSettlement(tileX: number, tileY: number): string | null {
  let closest: string | null = null;
  let minDist = Infinity;
  const seen = new Set<string>();
  for (const state of Object.values(STATES)) {
    if (seen.has(state.code)) continue;
    seen.add(state.code);
    for (const s of state.settlements) {
      const dx = s.tileX - tileX, dy = s.tileY - tileY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) { minDist = dist; closest = s.name; }
    }
  }
  return minDist < 30 ? closest : null;
}

export function getBiomeAt(tileX: number, tileY: number): BiomeType {
  const tx = Math.floor(tileX / UPSCALE);
  const ty = Math.floor(tileY / UPSCALE);
  if (ty < 0 || ty >= TEMPLATE.length || tx < 0 || tx >= 40) return 'ocean';
  const code = TEMPLATE[ty]?.[tx];
  if (!code || code === '.') return 'ocean';
  if (code === '^') return 'snow';
  return STATES[code]?.biome || 'plains';
}

// Generate the full 320x400 tile map
export function generateIndiaMap(): TileMapData {
  const ground: TileType[][] = Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => TileType.OCEAN)
  );

  // 1. Fill biome tiles from template (upscale 8x)
  for (let ty = 0; ty < 50; ty++) {
    const row = TEMPLATE[ty];
    if (!row) continue;
    for (let tx = 0; tx < 40; tx++) {
      const code = row[tx];
      if (code === '.') continue;
      let biome: BiomeType;
      if (code === '^') { biome = 'snow'; }
      else {
        const state = STATES[code];
        if (!state) continue;
        biome = state.biome;
      }
      const tiles = BIOME_TILES[biome];
      for (let dy = 0; dy < UPSCALE; dy++) {
        for (let dx = 0; dx < UPSCALE; dx++) {
          const px = tx * UPSCALE + dx;
          const py = ty * UPSCALE + dy;
          if (px < MAP_W && py < MAP_H) {
            ground[py][px] = tiles[Math.floor(hash(px, py) * tiles.length)];
          }
        }
      }
    }
  }

  // 2. Beaches & shallow water near coastlines
  for (let y = 1; y < MAP_H - 1; y++) {
    for (let x = 1; x < MAP_W - 1; x++) {
      if (ground[y][x] !== TileType.OCEAN && ground[y][x] !== TileType.DEEP_OCEAN) {
        const neighbors = [ground[y-1][x], ground[y+1][x], ground[y][x-1], ground[y][x+1]];
        if (neighbors.some(n => n === TileType.OCEAN || n === TileType.DEEP_OCEAN) && hash(x, y) < 0.6) {
          ground[y][x] = TileType.BEACH;
        }
      }
      if (ground[y][x] === TileType.OCEAN) {
        const neighbors = [ground[y-1]?.[x], ground[y+1]?.[x], ground[y][x-1], ground[y][x+1]];
        if (neighbors.some(n => n !== undefined && n !== TileType.OCEAN && n !== TileType.DEEP_OCEAN) && hash(x + 1000, y) < 0.4) {
          ground[y][x] = TileType.SHALLOW_WATER;
        }
      }
    }
  }

  // 3. Natural features
  addNaturalFeatures(ground);

  // 4. Rivers (wider for bigger map)
  for (const river of RIVERS) {
    for (let i = 0; i < river.length - 1; i++) {
      drawLine(ground, river[i][0], river[i][1], river[i + 1][0], river[i + 1][1], TileType.RIVER, i < 2 ? 2 : 3);
    }
  }

  // 5. Settlements
  const settlements = getAllSettlements();
  for (const { settlement, biome } of settlements) {
    placeSettlement(ground, settlement, biome);
  }

  // 6. Connect settlements with paths
  for (let i = 0; i < settlements.length; i++) {
    let nearest = -1, minDist = 60;
    for (let j = 0; j < settlements.length; j++) {
      if (i === j) continue;
      const dx = settlements[i].settlement.tileX - settlements[j].settlement.tileX;
      const dy = settlements[i].settlement.tileY - settlements[j].settlement.tileY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) { minDist = dist; nearest = j; }
    }
    if (nearest >= 0) {
      const s1 = settlements[i].settlement, s2 = settlements[nearest].settlement;
      drawLine(ground, s1.tileX, s1.tileY, s2.tileX, s2.tileY, TileType.PATH_DIRT, 1);
    }
  }

  // 7. Campsites between distant settlements
  placeCampsites(ground, settlements);

  return { width: MAP_W, height: MAP_H, ground };
}

function addNaturalFeatures(ground: TileType[][]) {
  // Lakes
  const lakes = [[170,120],[176,126],[200,118],[88,264],[140,84]];
  for (const [cx, cy] of lakes) {
    const r = 3 + Math.floor(hash(cx, cy) * 3);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const tx = cx + dx, ty = cy + dy;
          if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H &&
              ground[ty][tx] !== TileType.OCEAN && ground[ty][tx] !== TileType.DEEP_OCEAN) {
            ground[ty][tx] = dx * dx + dy * dy < (r - 1) * (r - 1) ? TileType.LAKE : TileType.SHALLOW_WATER;
          }
        }
      }
    }
  }

  // Rock clusters
  for (let y = 0; y < MAP_H; y += 12) {
    for (let x = 0; x < MAP_W; x += 12) {
      if (hash(x * 7, y * 13) < 0.15) {
        const tile = ground[y]?.[x];
        if (tile === TileType.MOUNTAIN || tile === TileType.PLATEAU || tile === TileType.CLIFF) {
          for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) setTile(ground, x + dx, y + dy, TileType.ROCKS);
        }
      }
    }
  }

  // Ruins
  const ruins = [[80,240],[112,108],[36,172],[120,276],[156,104],[56,220],[252,108]];
  for (const [cx, cy] of ruins) {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 3) setTile(ground, cx + dx, cy + dy, TileType.RUINS);
    }
  }

  // Pine forests in the north
  for (let y = 16; y < 56; y++) for (let x = 60; x < 140; x++) {
    if ((ground[y][x] === TileType.FOREST || ground[y][x] === TileType.TREE_BANYAN) && hash(x * 3, y * 5) < 0.5) {
      ground[y][x] = TileType.TREE_PINE;
    }
  }

  // Palm trees in the south
  for (let y = 200; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    if ((ground[y][x] === TileType.FOREST || ground[y][x] === TileType.TREE_BANYAN) && hash(x * 9, y * 7) < 0.4) {
      ground[y][x] = TileType.TREE_PALM;
    }
  }

  // Flower patches
  for (let y = 0; y < MAP_H; y += 8) for (let x = 0; x < MAP_W; x += 8) {
    if (hash(x * 11, y * 17) < 0.08 && (ground[y][x] === TileType.PLAINS || ground[y][x] === TileType.TALL_GRASS)) {
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) setTile(ground, x + dx, y + dy, TileType.FLOWERS);
    }
  }
}

function placeCampsites(ground: TileType[][], settlements: { settlement: SettlementDef; biome: BiomeType }[]) {
  for (let i = 0; i < settlements.length; i++) {
    for (let j = i + 1; j < settlements.length; j++) {
      const s1 = settlements[i].settlement, s2 = settlements[j].settlement;
      const dx = s2.tileX - s1.tileX, dy = s2.tileY - s1.tileY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 30 && dist < 80) {
        const cx = Math.floor(s1.tileX + dx * 0.5), cy = Math.floor(s1.tileY + dy * 0.5);
        if (cx >= 2 && cx < MAP_W - 2 && cy >= 2 && cy < MAP_H - 2) {
          const tile = ground[cy][cx];
          if (tile !== TileType.OCEAN && tile !== TileType.DEEP_OCEAN && tile !== TileType.MOUNTAIN && tile !== TileType.RIVER) {
            setTile(ground, cx, cy, TileType.CAMPSITE);
            setTile(ground, cx + 1, cy, TileType.CAMPSITE);
            setTile(ground, cx, cy + 1, TileType.CAMPSITE);
            setTile(ground, cx + 1, cy + 1, TileType.CAMPSITE);
            setTile(ground, cx - 1, cy - 1, TileType.HUT);
          }
        }
      }
    }
  }
}

export const PLAYER_START = { x: 104, y: 64 };

// NPCs with behavior system
export const WORLD_NPCS: NPC[] = [
  {
    id: 'delhi-advisor', name: 'Vizier Mirza',
    position: { x: 108, y: 60 }, direction: 'down', behavior: 'guard',
    dialog: ['Welcome to Shahjahanabad, traveler!', 'You stand in the heart of the Mughal Empire.', 'The Emperor has built this magnificent city...', 'Explore the bazaars, visit the mosques, and beware the palace guards!', 'If you seek adventure, head south to the Deccan or west to Rajputana.'],
    settlement: 'Shahjahanabad',
  },
  {
    id: 'delhi-merchant', name: 'Merchant Fatima',
    position: { x: 100, y: 58 }, direction: 'right', behavior: 'wander', wanderRadius: 3,
    dialog: ['The finest silks and spices from across Hindustan!', 'You look like you could use some supplies.', 'The road ahead is long and full of danger.'],
    settlement: 'Shahjahanabad',
  },
  {
    id: 'agra-merchant', name: 'Merchant Ratan',
    position: { x: 120, y: 76 }, direction: 'left', behavior: 'wander', wanderRadius: 4,
    dialog: ['Ah, you have come to Agra!', 'The grand monument stands nearby.', 'I sell the finest silks from Bengal and spices from Kerala.'],
    settlement: 'Agra',
  },
  {
    id: 'jaipur-guard', name: 'Rajput Vikram',
    position: { x: 76, y: 88 }, direction: 'right', behavior: 'guard',
    dialog: ['Halt! You enter Amber, seat of the Rajput kings.', 'We Rajputs have defended this land for centuries.', 'The desert holds many secrets... and many dangers.'],
    settlement: 'Amber',
  },
  {
    id: 'varanasi-scholar', name: 'Pandit Sharma',
    position: { x: 148, y: 88 }, direction: 'down', behavior: 'stationary',
    dialog: ['Namaste! Welcome to Kashi, the eternal city.', 'This is the holiest of places on the Ganga.', 'Scholars from across the land come here to learn.'],
    settlement: 'Varanasi',
  },
  {
    id: 'lucknow-poet', name: 'Poet Wajid',
    position: { x: 130, y: 82 }, direction: 'left', behavior: 'wander', wanderRadius: 3,
    dialog: ['Ah, the city of nawabs and poetry!', 'In Lucknow, even the stones speak in verse.', 'Have you heard the tale of the phantom of the fort?'],
    settlement: 'Lucknow',
  },
  {
    id: 'guwahati-sage', name: 'Sage Bhupen',
    position: { x: 216, y: 112 }, direction: 'down', behavior: 'stationary',
    dialog: ['You have traveled far to reach Assam, friend.', 'The Brahmaputra is our lifeline.', 'The hills of the northeast hide ancient kingdoms.'],
    settlement: 'Guwahati',
  },
  {
    id: 'hampi-priest', name: 'Priest Vidyaranya',
    position: { x: 84, y: 240 }, direction: 'down', behavior: 'stationary',
    dialog: ['Welcome to Hampi, jewel of the Vijayanagara Empire!', 'These temples were built by great kings.', 'Seek the ruins... they hold treasures of a lost age.'],
    settlement: 'Hampi',
  },
  {
    id: 'kozhikode-trader', name: 'Trader Ibrahim',
    position: { x: 92, y: 292 }, direction: 'right', behavior: 'wander', wanderRadius: 4,
    dialog: ['Ahlan! Welcome to Kozhikode, the spice coast!', 'Ships come from Arabia, Persia, and even Cathay.', 'Pepper, cardamom, cinnamon... Kerala has it all.'],
    settlement: 'Kozhikode',
  },
  {
    id: 'mumbai-captain', name: 'Captain Raje',
    position: { x: 58, y: 198 }, direction: 'down', behavior: 'guard',
    dialog: ['This is the port of Mumbai, gateway to the west.', 'Ships from Portugal dock here daily.', 'The Marathas control these waters now.'],
    settlement: 'Mumbai',
  },
  {
    id: 'madurai-priestess', name: 'Priestess Meenakshi',
    position: { x: 116, y: 300 }, direction: 'down', behavior: 'stationary',
    dialog: ['Blessings upon you, traveler from the north.', 'The great Meenakshi temple watches over this city.', 'Seek the shore temples if you wish to see our heritage.'],
    settlement: 'Madurai',
  },
  {
    id: 'jodhpur-warrior', name: 'Warrior Rao',
    position: { x: 54, y: 102 }, direction: 'right', behavior: 'wander', wanderRadius: 3,
    dialog: ['The Blue City welcomes you, stranger.', 'In these deserts, water is more precious than gold.', 'Beware the sand scorpions!'],
    settlement: 'Jodhpur',
  },
  {
    id: 'bhopal-alchemist', name: 'Alchemist Hakim',
    position: { x: 102, y: 118 }, direction: 'left', behavior: 'wander', wanderRadius: 2,
    dialog: ['I study the ancient sciences of healing...', 'The forests of Madhya Pradesh are full of rare herbs.', 'Bring me ingredients and I can brew powerful remedies.'],
    settlement: 'Bhopal',
  },
];

export const MINIMAP_COLORS: Record<number, string> = {
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
  [TileType.DEEP_OCEAN]: '#0e2850',
  [TileType.SHALLOW_WATER]: '#60b8e8',
  [TileType.ICE]: '#c8d8f0',
  [TileType.TALL_GRASS]: '#4a8830',
  [TileType.SAND_DUNES]: '#dcc060',
  [TileType.TREE_PINE]: '#1a5028',
  [TileType.TREE_PALM]: '#308830',
  [TileType.TREE_BANYAN]: '#285a20',
  [TileType.CLIFF]: '#585050',
  [TileType.ROCKS]: '#888078',
  [TileType.FLOWERS]: '#e04080',
  [TileType.RUINS]: '#807060',
  [TileType.BRIDGE]: '#8b6340',
  [TileType.CAMPSITE]: '#e08030',
  [TileType.HUT]: '#9b7348',
  [TileType.LAKE]: '#3880c0',
};
