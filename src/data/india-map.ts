import { TileType, TileMapData, BiomeType, StateDef, SettlementDef, NPC } from '../types';
import {
  placeStructureCentered, isAreaClear,
  FOREST_SMALL, FOREST_MEDIUM, FOREST_LARGE,
  PINE_GROVE, PALM_GROVE, JUNGLE_PATCH, BANYAN_GROVE,
  LAKE_SMALL, LAKE_MEDIUM, SWAMP_PATCH,
  ROCK_CLUSTER, CLIFF_FACE, SAND_DUNE, FLOWER_MEADOW,
  VILLAGE_SMALL, TOWN, CITY,
  FORT_LARGE, PALACE, TEMPLE_LARGE, RUINS_SITE,
  CAMPSITE_AREA,
  StructureTemplate,
} from './structures';

// === MAP TEMPLATE ===
// Low-res template: 40 cols x 50 rows → upscale 8x → 320x400 tile map
// Each character maps to a state/biome region
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

// === STATE/BIOME DEFINITIONS ===

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

// === BIOME → BASE TILE ===
// Each biome gets ONE primary tile — no random variant noise
const BIOME_BASE_TILE: Record<BiomeType, TileType> = {
  ocean: TileType.OCEAN,
  snow: TileType.SNOW,
  mountain: TileType.MOUNTAIN,
  desert: TileType.DESERT,
  plains: TileType.PLAINS,
  forest: TileType.FOREST,
  dense_forest: TileType.DENSE_JUNGLE,
  plateau: TileType.PLATEAU,
  wetland: TileType.SWAMP,
  coastal: TileType.PLAINS,
};

// === RIVERS ===
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

// === STRUCTURE PLACEMENTS ===
// Each placement: [structure, centerX, centerY]
// These are hand-placed for geographic accuracy

interface StructurePlacement {
  structure: StructureTemplate;
  x: number;
  y: number;
}

// Forest placements — based on actual Indian geography
const NATURE_PLACEMENTS: StructurePlacement[] = [
  // Northern Himalayan pine forests
  { structure: PINE_GROVE, x: 78, y: 22 },
  { structure: PINE_GROVE, x: 90, y: 18 },
  { structure: PINE_GROVE, x: 96, y: 26 },
  { structure: PINE_GROVE, x: 118, y: 30 },
  { structure: PINE_GROVE, x: 130, y: 28 },
  { structure: FOREST_SMALL, x: 84, y: 28 },
  { structure: FOREST_SMALL, x: 126, y: 34 },

  // Madhya Pradesh / Central India forests
  { structure: FOREST_LARGE, x: 92, y: 108 },
  { structure: FOREST_MEDIUM, x: 108, y: 100 },
  { structure: BANYAN_GROVE, x: 96, y: 120 },
  { structure: FOREST_SMALL, x: 86, y: 130 },

  // Chhattisgarh dense jungles
  { structure: JUNGLE_PATCH, x: 128, y: 136 },
  { structure: JUNGLE_PATCH, x: 140, y: 144 },
  { structure: JUNGLE_PATCH, x: 134, y: 150 },

  // Jharkhand forests
  { structure: FOREST_MEDIUM, x: 150, y: 124 },
  { structure: FOREST_SMALL, x: 158, y: 118 },

  // Western Ghats forests
  { structure: FOREST_MEDIUM, x: 60, y: 216 },
  { structure: FOREST_SMALL, x: 56, y: 228 },
  { structure: FOREST_MEDIUM, x: 68, y: 248 },
  { structure: BANYAN_GROVE, x: 72, y: 256 },

  // Kerala palm forests
  { structure: PALM_GROVE, x: 84, y: 296 },
  { structure: PALM_GROVE, x: 82, y: 304 },
  { structure: PALM_GROVE, x: 86, y: 316 },
  { structure: PALM_GROVE, x: 80, y: 288 },

  // South Indian tropical forests
  { structure: PALM_GROVE, x: 108, y: 288 },
  { structure: FOREST_SMALL, x: 116, y: 280 },
  { structure: BANYAN_GROVE, x: 120, y: 268 },

  // Northeast India forests
  { structure: JUNGLE_PATCH, x: 220, y: 100 },
  { structure: FOREST_MEDIUM, x: 236, y: 108 },
  { structure: JUNGLE_PATCH, x: 248, y: 112 },
  { structure: FOREST_SMALL, x: 260, y: 132 },
  { structure: JUNGLE_PATCH, x: 256, y: 148 },

  // Assam/Bengal wetlands
  { structure: SWAMP_PATCH, x: 170, y: 118 },
  { structure: SWAMP_PATCH, x: 176, y: 126 },
  { structure: SWAMP_PATCH, x: 208, y: 116 },

  // Odisha coastal forests
  { structure: PALM_GROVE, x: 174, y: 148 },
  { structure: FOREST_SMALL, x: 170, y: 158 },

  // Rajasthan sand dunes
  { structure: SAND_DUNE, x: 40, y: 80 },
  { structure: SAND_DUNE, x: 50, y: 92 },
  { structure: SAND_DUNE, x: 44, y: 104 },
  { structure: SAND_DUNE, x: 56, y: 110 },
  { structure: SAND_DUNE, x: 38, y: 96 },

  // Gujarat desert
  { structure: SAND_DUNE, x: 24, y: 152 },
  { structure: SAND_DUNE, x: 32, y: 160 },

  // Lakes
  { structure: LAKE_MEDIUM, x: 170, y: 120 },
  { structure: LAKE_SMALL, x: 200, y: 118 },
  { structure: LAKE_SMALL, x: 88, y: 264 },
  { structure: LAKE_SMALL, x: 140, y: 84 },

  // Rock formations
  { structure: ROCK_CLUSTER, x: 62, y: 192 },
  { structure: ROCK_CLUSTER, x: 78, y: 236 },
  { structure: CLIFF_FACE, x: 82, y: 20 },
  { structure: CLIFF_FACE, x: 130, y: 26 },
  { structure: ROCK_CLUSTER, x: 74, y: 232 },

  // Flower meadows
  { structure: FLOWER_MEADOW, x: 80, y: 58 },
  { structure: FLOWER_MEADOW, x: 92, y: 52 },
  { structure: FLOWER_MEADOW, x: 110, y: 72 },
  { structure: FLOWER_MEADOW, x: 100, y: 276 },
];

// Unique landmark placements
const LANDMARK_PLACEMENTS: StructurePlacement[] = [
  // Delhi - Red Fort
  { structure: FORT_LARGE, x: 104, y: 56 },
  // Agra - Mughal Palace (Taj area)
  { structure: PALACE, x: 116, y: 76 },
  // Amber Fort (Jaipur)
  { structure: FORT_LARGE, x: 72, y: 88 },
  // Varanasi temples
  { structure: TEMPLE_LARGE, x: 144, y: 88 },
  // Hampi ruins
  { structure: RUINS_SITE, x: 82, y: 242 },
  { structure: TEMPLE_LARGE, x: 80, y: 240 },
  // Konark Sun Temple
  { structure: TEMPLE_LARGE, x: 178, y: 156 },
  // Madurai Temple
  { structure: TEMPLE_LARGE, x: 112, y: 300 },
  // Golconda Fort
  { structure: FORT_LARGE, x: 108, y: 208 },
  // Bodh Gaya temple
  { structure: TEMPLE_LARGE, x: 156, y: 104 },
  // Sanchi Stupa
  { structure: TEMPLE_LARGE, x: 96, y: 112 },
  // Khajuraho temples
  { structure: TEMPLE_LARGE, x: 112, y: 108 },
  // Tawang monastery
  { structure: TEMPLE_LARGE, x: 252, y: 108 },
  // Ancient ruins scattered
  { structure: RUINS_SITE, x: 36, y: 172 },
  { structure: RUINS_SITE, x: 120, y: 276 },
  { structure: RUINS_SITE, x: 56, y: 220 },
];

// === HELPER FUNCTIONS ===

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

function setTile(ground: TileType[][], x: number, y: number, tile: TileType) {
  if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) {
    ground[y][x] = tile;
  }
}

function drawRiverSegment(
  ground: TileType[][],
  x0: number, y0: number, x1: number, y1: number,
  width: number,
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
        ground[wy][cx] = TileType.RIVER;
      }
    }
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

function drawPathSegment(
  ground: TileType[][],
  x0: number, y0: number, x1: number, y1: number,
  tile: TileType,
) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0, cy = y0;

  while (true) {
    // Only overwrite non-building, non-water tiles
    if (cx >= 0 && cx < MAP_W && cy >= 0 && cy < MAP_H) {
      const existing = ground[cy][cx];
      if (existing !== TileType.OCEAN && existing !== TileType.DEEP_OCEAN &&
          existing !== TileType.RIVER && existing !== TileType.LAKE &&
          existing !== TileType.WALL_MUD && existing !== TileType.WALL_STONE &&
          existing !== TileType.FORT_WALL && existing !== TileType.PALACE &&
          existing !== TileType.TEMPLE && existing !== TileType.ROOF) {
        ground[cy][cx] = tile;
      }
    }
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

// Settlement placement using structure templates
function placeSettlement(ground: TileType[][], s: SettlementDef, biome: BiomeType) {
  const baseTile = biome === 'desert' ? TileType.DESERT : TileType.PLAINS;

  // Clear area around settlement
  const clearSize = s.type === 'capital' ? 18 : s.type === 'city' ? 14 : 8;
  for (let dy = -clearSize; dy <= clearSize; dy++) {
    for (let dx = -clearSize; dx <= clearSize; dx++) {
      setTile(ground, s.tileX + dx, s.tileY + dy, baseTile);
    }
  }

  // Place appropriate structure template
  if (s.type === 'capital') {
    // Capital gets a fort + city layout
    placeStructureCentered(ground, CITY, s.tileX, s.tileY, MAP_W, MAP_H);
  } else if (s.type === 'city') {
    placeStructureCentered(ground, TOWN, s.tileX, s.tileY, MAP_W, MAP_H);
  } else {
    placeStructureCentered(ground, VILLAGE_SMALL, s.tileX, s.tileY, MAP_W, MAP_H);
  }
}

// Add coastal transitions (beaches and shallow water)
function addCoastalTransitions(ground: TileType[][]) {
  // Two passes: first mark beaches on land tiles adjacent to water,
  // then mark shallow water on ocean tiles adjacent to land
  const beachTiles: [number, number][] = [];
  const shallowTiles: [number, number][] = [];

  for (let y = 1; y < MAP_H - 1; y++) {
    for (let x = 1; x < MAP_W - 1; x++) {
      const tile = ground[y][x];
      const neighbors = [ground[y-1][x], ground[y+1][x], ground[y][x-1], ground[y][x+1]];
      const hasOcean = neighbors.some(n => n === TileType.OCEAN || n === TileType.DEEP_OCEAN);
      const hasLand = neighbors.some(n => n !== TileType.OCEAN && n !== TileType.DEEP_OCEAN &&
                                          n !== TileType.RIVER && n !== TileType.LAKE &&
                                          n !== TileType.SHALLOW_WATER);

      if (tile !== TileType.OCEAN && tile !== TileType.DEEP_OCEAN && tile !== TileType.RIVER && hasOcean) {
        beachTiles.push([x, y]);
      }
      if (tile === TileType.OCEAN && hasLand) {
        shallowTiles.push([x, y]);
      }
    }
  }

  for (const [x, y] of beachTiles) ground[y][x] = TileType.BEACH;
  for (const [x, y] of shallowTiles) ground[y][x] = TileType.SHALLOW_WATER;
}

// Add campsites between distant settlements
function placeCampsites(ground: TileType[][], settlements: { settlement: SettlementDef }[]) {
  for (let i = 0; i < settlements.length; i++) {
    for (let j = i + 1; j < settlements.length; j++) {
      const s1 = settlements[i].settlement, s2 = settlements[j].settlement;
      const dx = s2.tileX - s1.tileX, dy = s2.tileY - s1.tileY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 30 && dist < 80) {
        const cx = Math.floor(s1.tileX + dx * 0.5);
        const cy = Math.floor(s1.tileY + dy * 0.5);
        if (isAreaClear(ground, cx - 2, cy - 2, 5, 5, MAP_W, MAP_H)) {
          placeStructureCentered(ground, CAMPSITE_AREA, cx, cy, MAP_W, MAP_H);
        }
      }
    }
  }
}

// === MAIN MAP GENERATOR ===

export function generateIndiaMap(): TileMapData {
  const ground: TileType[][] = Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => TileType.OCEAN)
  );

  // 1. Fill base terrain from template (one tile per biome — no noise)
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
      const baseTile = BIOME_BASE_TILE[biome];
      for (let dy = 0; dy < UPSCALE; dy++) {
        for (let dx = 0; dx < UPSCALE; dx++) {
          const px = tx * UPSCALE + dx;
          const py = ty * UPSCALE + dy;
          if (px < MAP_W && py < MAP_H) {
            ground[py][px] = baseTile;
          }
        }
      }
    }
  }

  // 2. Coastal transitions (beaches + shallow water)
  addCoastalTransitions(ground);

  // 3. Rivers
  for (const river of RIVERS) {
    for (let i = 0; i < river.length - 1; i++) {
      drawRiverSegment(ground, river[i][0], river[i][1], river[i + 1][0], river[i + 1][1], i < 2 ? 2 : 3);
    }
  }

  // 4. Place nature structures (forests, lakes, rocks, etc.)
  for (const placement of NATURE_PLACEMENTS) {
    placeStructureCentered(ground, placement.structure, placement.x, placement.y, MAP_W, MAP_H);
  }

  // 5. Add scattered tall grass in plains regions (light texture, not noise)
  for (let y = 0; y < MAP_H; y += 4) {
    for (let x = 0; x < MAP_W; x += 4) {
      if (ground[y][x] === TileType.PLAINS && hash(x * 3, y * 7) < 0.12) {
        // Small 2x2 tall grass patch
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            if (ground[y + dy]?.[x + dx] === TileType.PLAINS) {
              ground[y + dy][x + dx] = TileType.TALL_GRASS;
            }
          }
        }
      }
    }
  }

  // 6. Settlements
  const settlements = getAllSettlements();
  for (const { settlement, biome } of settlements) {
    placeSettlement(ground, settlement, biome);
  }

  // 7. Place unique landmarks
  for (const placement of LANDMARK_PLACEMENTS) {
    placeStructureCentered(ground, placement.structure, placement.x, placement.y, MAP_W, MAP_H);
  }

  // 8. Connect settlements with paths
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
      drawPathSegment(ground, s1.tileX, s1.tileY, s2.tileX, s2.tileY, TileType.PATH_DIRT);
    }
  }

  // 9. Campsites between distant settlements
  placeCampsites(ground, settlements);

  return { width: MAP_W, height: MAP_H, ground };
}

// === EXPORTS: LOOKUP FUNCTIONS ===

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

export const PLAYER_START = { x: 104, y: 64 };

// === NPCs ===

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

// === MINIMAP COLORS ===

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
