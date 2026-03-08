import { TileType, TileMapData, BiomeType, StateDef, SettlementDef, NPC } from '../types';
import {
  placeStructureCentered, isAreaClear,
  FOREST_SMALL, FOREST_MEDIUM, FOREST_LARGE,
  PINE_GROVE, PALM_GROVE, JUNGLE_PATCH, BANYAN_GROVE,
  LAKE_SMALL, LAKE_MEDIUM, SWAMP_PATCH,
  ROCK_CLUSTER, CLIFF_FACE, SAND_DUNE, FLOWER_MEADOW,
  VILLAGE_SMALL, TOWN,
  FORT_LARGE, PALACE, TEMPLE_LARGE, RUINS_SITE,
  CAMPSITE_AREA,
  // Indo-Saracenic structures
  MUGHAL_DARWAZA, HAVELI, MOSQUE_SMALL, JAMA_MASJID,
  BAORI, CHARBAGH, MAUSOLEUM, CARAVANSERAI,
  CHHATRI_PAVILION, RED_FORT, DESERT_HAVELI, BORDER_CHECKPOINT,
  MUGHAL_CAPITAL,
  // New biome-specific structures
  DESERT_VILLAGE, MOUNTAIN_VILLAGE, FOREST_VILLAGE, COASTAL_VILLAGE,
  DESERT_OASIS, HOT_SPRINGS,
  StructureTemplate,
} from './structures';
import { ROUTES, SUB_ZONES, OBSTACLES, BIOME_ELEVATION, RouteDef } from './zones';

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
    { name: 'Mathura', type: 'village', tileX: 100, tileY: 72 },
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

// === BIOME → TILE VARIETY ===
// Each biome uses weighted tile variety for natural-looking terrain
// Format: [TileType, cumulativeWeight] — weights sum to 1.0
type WeightedTile = [TileType, number];

// Redesigned biome variety: more uniform base with intentional features.
// Encounter zones (TALL_GRASS, SAND_DUNES) are placed by the route system,
// not scattered randomly. This makes each biome feel distinct and purposeful.
const BIOME_VARIETY: Record<BiomeType, WeightedTile[]> = {
  ocean: [[TileType.OCEAN, 1.0]],
  snow: [
    [TileType.SNOW, 0.65],
    [TileType.ICE, 0.80],
    [TileType.MOUNTAIN, 0.95],
    [TileType.CLIFF, 1.0],
  ],
  mountain: [
    [TileType.MOUNTAIN, 0.50],
    [TileType.ROCKS, 0.70],
    [TileType.CLIFF, 0.85],
    [TileType.ROCKY_PATH, 0.92],
    [TileType.SNOW, 1.0],
  ],
  desert: [
    [TileType.DESERT, 0.65],
    [TileType.CRACKED_EARTH, 0.80],
    [TileType.DRY_GRASS, 0.90],
    [TileType.ROCKS, 0.96],
    [TileType.CACTUS, 1.0],
  ],
  plains: [
    [TileType.PLAINS, 0.70],
    [TileType.FARM, 0.82],
    [TileType.FLOWERS, 0.90],
    [TileType.GARDEN, 0.96],
    [TileType.TALL_GRASS, 1.0],
  ],
  forest: [
    [TileType.FOREST, 0.55],
    [TileType.TREE_BANYAN, 0.70],
    [TileType.PLAINS, 0.80],
    [TileType.TALL_GRASS, 0.90],
    [TileType.FLOWERS, 0.96],
    [TileType.BAMBOO, 1.0],
  ],
  dense_forest: [
    [TileType.DENSE_JUNGLE, 0.50],
    [TileType.FOREST, 0.72],
    [TileType.TREE_BANYAN, 0.84],
    [TileType.BAMBOO, 0.92],
    [TileType.SWAMP, 1.0],
  ],
  plateau: [
    [TileType.PLATEAU, 0.55],
    [TileType.ROCKS, 0.70],
    [TileType.PLAINS, 0.82],
    [TileType.DRY_GRASS, 0.92],
    [TileType.CLIFF, 1.0],
  ],
  wetland: [
    [TileType.SWAMP, 0.35],
    [TileType.MANGROVE, 0.50],
    [TileType.PLAINS, 0.65],
    [TileType.SHALLOW_WATER, 0.80],
    [TileType.TALL_GRASS, 0.92],
    [TileType.LAKE, 1.0],
  ],
  coastal: [
    [TileType.PLAINS, 0.40],
    [TileType.TREE_PALM, 0.55],
    [TileType.FARM, 0.68],
    [TileType.FLOWERS, 0.78],
    [TileType.GARDEN, 0.88],
    [TileType.TALL_GRASS, 1.0],
  ],
};

// Multi-octave smooth noise for natural-looking terrain clusters.
// Uses 3 scales: mega (16x16), coarse (8x8), fine (per-tile) for
// large biome patches with natural irregular edges.
function pickBiomeTileSmooth(biome: BiomeType, x: number, y: number): TileType {
  const megaX = Math.floor(x / 16);
  const megaY = Math.floor(y / 16);
  const megaH = hash(megaX * 13, megaY * 37);
  const coarseX = Math.floor(x / 8);
  const coarseY = Math.floor(y / 8);
  const coarseH = hash(coarseX * 17, coarseY * 31);
  const fineH = hash(x * 7, y * 11);
  // 50% mega for large patches, 35% coarse for medium clusters, 15% fine for edges
  const blended = megaH * 0.50 + coarseH * 0.35 + fineH * 0.15;
  const variants = BIOME_VARIETY[biome];
  for (const [tile, threshold] of variants) {
    if (blended < threshold) return tile;
  }
  return variants[variants.length - 1][0];
}

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

// Indo-Saracenic landmarks — Mughal architecture across India
const MUGHAL_PLACEMENTS: StructurePlacement[] = [
  // === DELHI — Imperial Capital ===
  // Red Fort (Lal Qila) — replaces generic fort
  { structure: RED_FORT, x: 106, y: 52 },
  // Jama Masjid — great mosque near Red Fort
  { structure: JAMA_MASJID, x: 100, y: 52 },
  // Mughal gate at Delhi entrance
  { structure: MUGHAL_DARWAZA, x: 104, y: 64 },
  // Charbagh garden in Delhi
  { structure: CHARBAGH, x: 108, y: 64 },

  // === AGRA — Mughal Heartland ===
  // Taj Mahal (Mausoleum)
  { structure: MAUSOLEUM, x: 118, y: 72 },
  // Charbagh garden at Taj
  { structure: CHARBAGH, x: 118, y: 80 },
  // Agra Fort
  { structure: RED_FORT, x: 112, y: 76 },

  // === RAJASTHAN — Desert Palaces ===
  // Amber — Rajput haveli district
  { structure: DESERT_HAVELI, x: 68, y: 92 },
  { structure: DESERT_HAVELI, x: 76, y: 92 },
  // Jaisalmer — desert caravanserai
  { structure: CARAVANSERAI, x: 46, y: 80 },
  // Jodhpur — blue city havelis
  { structure: DESERT_HAVELI, x: 50, y: 96 },
  { structure: HAVELI, x: 54, y: 96 },
  // Udaipur — lake palace chhatris
  { structure: CHHATRI_PAVILION, x: 58, y: 124 },
  { structure: CHHATRI_PAVILION, x: 62, y: 120 },
  // Pushkar — mosque and baori
  { structure: MOSQUE_SMALL, x: 70, y: 100 },
  { structure: BAORI, x: 66, y: 98 },

  // === UP — Mughal Core ===
  // Lucknow — Nawab mosque
  { structure: MOSQUE_SMALL, x: 126, y: 84 },
  // Varanasi — ghats chhatris
  { structure: CHHATRI_PAVILION, x: 148, y: 92 },
  // Ayodhya — temple + mosque complex
  { structure: MOSQUE_SMALL, x: 138, y: 80 },
  // Allahabad — Mughal caravanserai
  { structure: CARAVANSERAI, x: 142, y: 78 },

  // === CENTRAL INDIA ===
  // Bhopal — mosque city
  { structure: JAMA_MASJID, x: 98, y: 120 },
  { structure: BAORI, x: 104, y: 120 },
  // Gwalior — Mughal gate
  { structure: MUGHAL_DARWAZA, x: 104, y: 88 },

  // === DECCAN ===
  // Golconda — baori inside fort
  { structure: BAORI, x: 112, y: 212 },
  // Bijapur — Gol Gumbaz dome
  { structure: MAUSOLEUM, x: 74, y: 228 },
  // Aurangabad — caves + Mughal gate
  { structure: MUGHAL_DARWAZA, x: 78, y: 192 },

  // === SOUTH ===
  // Mysore — palace with Charbagh
  { structure: CHARBAGH, x: 86, y: 264 },
  // Thanjavur — temple chhatris
  { structure: CHHATRI_PAVILION, x: 114, y: 280 },

  // === BENGAL & EAST ===
  // Gaur — ruined mosque city
  { structure: MOSQUE_SMALL, x: 174, y: 108 },
  // Murshidabad — Nawab haveli
  { structure: HAVELI, x: 174, y: 120 },

  // === BORDER CHECKPOINTS ===
  // Major regional borders
  { structure: BORDER_CHECKPOINT, x: 68, y: 76 },   // Rajasthan entry from Punjab
  { structure: BORDER_CHECKPOINT, x: 148, y: 96 },   // Bihar entry from UP
  { structure: BORDER_CHECKPOINT, x: 92, y: 140 },   // MP to Chhattisgarh
  { structure: BORDER_CHECKPOINT, x: 72, y: 180 },   // Maharashtra entry
  { structure: BORDER_CHECKPOINT, x: 204, y: 108 },   // Assam entry
  { structure: BORDER_CHECKPOINT, x: 96, y: 252 },   // Karnataka to Kerala
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

// Biome-specific village template selection
function getVillageTemplate(biome: BiomeType): StructureTemplate {
  switch (biome) {
    case 'desert': return DESERT_VILLAGE;
    case 'mountain': case 'snow': return MOUNTAIN_VILLAGE;
    case 'forest': case 'dense_forest': return FOREST_VILLAGE;
    case 'coastal': case 'wetland': return COASTAL_VILLAGE;
    default: return VILLAGE_SMALL;
  }
}

// Settlement placement using structure templates
function placeSettlement(ground: TileType[][], s: SettlementDef, biome: BiomeType) {
  const baseTile = biome === 'desert' ? TileType.DESERT
    : biome === 'mountain' || biome === 'snow' ? TileType.ROCKY_PATH
    : biome === 'coastal' ? TileType.BEACH
    : TileType.PLAINS;

  // Clear area around settlement with natural-looking edges
  const clearSize = s.type === 'capital' ? 18 : s.type === 'city' ? 14 : 8;
  for (let dy = -clearSize; dy <= clearSize; dy++) {
    for (let dx = -clearSize; dx <= clearSize; dx++) {
      // Circular clearing with slight randomness for natural edges
      const dist = Math.sqrt(dx * dx + dy * dy);
      const jitter = hash(s.tileX + dx, s.tileY + dy) * 2;
      if (dist <= clearSize + jitter - 1) {
        setTile(ground, s.tileX + dx, s.tileY + dy, baseTile);
      }
    }
  }

  // Place appropriate structure template
  if (s.type === 'capital') {
    placeStructureCentered(ground, MUGHAL_CAPITAL, s.tileX, s.tileY, MAP_W, MAP_H);
  } else if (s.type === 'city') {
    placeStructureCentered(ground, TOWN, s.tileX, s.tileY, MAP_W, MAP_H);
  } else {
    placeStructureCentered(ground, getVillageTemplate(biome), s.tileX, s.tileY, MAP_W, MAP_H);
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

// === ROUTE DRAWING ===
// Draw Pokemon-style routes: clear path with encounter grass on sides

function drawRoute(ground: TileType[][], route: RouteDef) {
  const wp = route.waypoints;
  for (let i = 0; i < wp.length - 1; i++) {
    const x0 = wp[i].x, y0 = wp[i].y;
    const x1 = wp[i + 1].x, y1 = wp[i + 1].y;
    // Draw the main path (3 tiles wide)
    drawWidePath(ground, x0, y0, x1, y1, route.pathTile, 3);
    // Draw encounter grass on both sides
    drawRouteEncounterGrass(ground, x0, y0, x1, y1, route.encounterWidth);
  }
}

function drawWidePath(
  ground: TileType[][], x0: number, y0: number, x1: number, y1: number,
  tile: TileType, width: number,
) {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, cx = x0, cy = y0;
  const halfW = Math.floor(width / 2);

  while (true) {
    // Draw width perpendicular to path direction
    for (let w = -halfW; w <= halfW; w++) {
      // Determine perpendicular direction
      if (Math.abs(x1 - x0) > Math.abs(y1 - y0)) {
        // Mostly horizontal path → spread vertically
        if (cx >= 0 && cx < MAP_W && cy + w >= 0 && cy + w < MAP_H) {
          const existing = ground[cy + w][cx];
          if (!isProtectedTile(existing)) ground[cy + w][cx] = tile;
        }
      } else {
        // Mostly vertical path → spread horizontally
        if (cx + w >= 0 && cx + w < MAP_W && cy >= 0 && cy < MAP_H) {
          const existing = ground[cy][cx + w];
          if (!isProtectedTile(existing)) ground[cy][cx + w] = tile;
        }
      }
    }
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

// Draw encounter grass (TALL_GRASS/SAND_DUNES) on both sides of a route segment
function drawRouteEncounterGrass(
  ground: TileType[][], x0: number, y0: number, x1: number, y1: number,
  encounterWidth: number,
) {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, cx = x0, cy = y0;

  while (true) {
    const isHorizontal = Math.abs(x1 - x0) > Math.abs(y1 - y0);
    for (let side = -1; side <= 1; side += 2) { // -1 = left/up, +1 = right/down
      for (let w = 2; w <= encounterWidth + 1; w++) {
        const offset = side * w;
        let tx: number, ty: number;
        if (isHorizontal) {
          tx = cx; ty = cy + offset;
        } else {
          tx = cx + offset; ty = cy;
        }
        if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) {
          const existing = ground[ty][tx];
          if (!isProtectedTile(existing) && existing !== TileType.PATH_DIRT &&
              existing !== TileType.PATH_STONE && existing !== TileType.RIVER) {
            // Use biome-appropriate encounter tile
            if (existing === TileType.DESERT || existing === TileType.CRACKED_EARTH ||
                existing === TileType.DRY_GRASS) {
              ground[ty][tx] = TileType.SAND_DUNES;
            } else if (existing === TileType.DENSE_JUNGLE || existing === TileType.FOREST ||
                       existing === TileType.BAMBOO) {
              ground[ty][tx] = TileType.DENSE_JUNGLE;
            } else if (existing === TileType.SWAMP || existing === TileType.MANGROVE) {
              ground[ty][tx] = TileType.SWAMP;
            } else {
              ground[ty][tx] = TileType.TALL_GRASS;
            }
          }
        }
      }
    }
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

function isProtectedTile(tile: TileType): boolean {
  return tile === TileType.OCEAN || tile === TileType.DEEP_OCEAN ||
    tile === TileType.RIVER || tile === TileType.LAKE ||
    tile === TileType.WALL_MUD || tile === TileType.WALL_STONE ||
    tile === TileType.FORT_WALL || tile === TileType.PALACE ||
    tile === TileType.TEMPLE || tile === TileType.ROOF ||
    tile === TileType.SANDSTONE || tile === TileType.MARBLE ||
    tile === TileType.DOME || tile === TileType.MOSQUE ||
    tile === TileType.MUGHAL_GATE || tile === TileType.BORDER_POST;
}

// === BIOME TRANSITIONS ===
// Smooth transitions at state borders instead of sharp biome edges

function addBiomeTransitions(ground: TileType[][]) {
  // Transition tiles: blend between biomes at template cell edges
  const TRANSITION_MAP: Record<string, TileType> = {
    'plains_desert': TileType.DRY_GRASS,
    'desert_plains': TileType.DRY_GRASS,
    'plains_forest': TileType.TALL_GRASS,
    'forest_plains': TileType.TALL_GRASS,
    'plains_mountain': TileType.ROCKY_PATH,
    'mountain_plains': TileType.ROCKY_PATH,
    'forest_mountain': TileType.TREE_PINE,
    'mountain_forest': TileType.TREE_PINE,
    'desert_mountain': TileType.ROCKS,
    'mountain_desert': TileType.ROCKS,
    'plains_wetland': TileType.TALL_GRASS,
    'wetland_plains': TileType.TALL_GRASS,
    'plains_coastal': TileType.FARM,
    'coastal_plains': TileType.FARM,
    'forest_dense_forest': TileType.FOREST,
    'dense_forest_forest': TileType.FOREST,
    'plateau_plains': TileType.DRY_GRASS,
    'plains_plateau': TileType.DRY_GRASS,
    'plateau_desert': TileType.CRACKED_EARTH,
    'desert_plateau': TileType.CRACKED_EARTH,
    'coastal_wetland': TileType.MANGROVE,
    'wetland_coastal': TileType.MANGROVE,
    'forest_wetland': TileType.SWAMP,
    'wetland_forest': TileType.SWAMP,
    'plateau_forest': TileType.TALL_GRASS,
    'forest_plateau': TileType.TALL_GRASS,
  };

  // Scan for biome boundaries and add 2-tile transition strips
  for (let ty = 1; ty < 49; ty++) {
    for (let tx = 1; tx < 39; tx++) {
      const code = TEMPLATE[ty]?.[tx];
      if (!code || code === '.') continue;
      const biome1 = code === '^' ? 'snow' : STATES[code]?.biome;
      if (!biome1) continue;

      // Check right and down neighbors
      for (const [ntx, nty] of [[tx + 1, ty], [tx, ty + 1]]) {
        const ncode = TEMPLATE[nty]?.[ntx];
        if (!ncode || ncode === '.') continue;
        const biome2 = ncode === '^' ? 'snow' : STATES[ncode]?.biome;
        if (!biome2 || biome1 === biome2) continue;

        const key = `${biome1}_${biome2}`;
        const transitionTile = TRANSITION_MAP[key];
        if (!transitionTile) continue;

        // Place transition strip at the border (last 2 tiles of current cell,
        // first 2 tiles of next cell)
        const isHorizontal = ntx !== tx;
        if (isHorizontal) {
          const borderX = (tx + 1) * UPSCALE;
          for (let py = ty * UPSCALE; py < (ty + 1) * UPSCALE; py++) {
            for (let off = -2; off < 2; off++) {
              const px = borderX + off;
              if (px >= 0 && px < MAP_W && py >= 0 && py < MAP_H) {
                const existing = ground[py][px];
                if (!isProtectedTile(existing) && existing !== TileType.RIVER &&
                    existing !== TileType.PATH_DIRT && existing !== TileType.PATH_STONE) {
                  // Add some randomness so transition isn't a straight line
                  if (hash(px * 3, py * 7) < 0.7) {
                    ground[py][px] = transitionTile;
                  }
                }
              }
            }
          }
        } else {
          const borderY = (ty + 1) * UPSCALE;
          for (let px = tx * UPSCALE; px < (tx + 1) * UPSCALE; px++) {
            for (let off = -2; off < 2; off++) {
              const py = borderY + off;
              if (px >= 0 && px < MAP_W && py >= 0 && py < MAP_H) {
                const existing = ground[py][px];
                if (!isProtectedTile(existing) && existing !== TileType.RIVER &&
                    existing !== TileType.PATH_DIRT && existing !== TileType.PATH_STONE) {
                  if (hash(px * 3, py * 7) < 0.7) {
                    ground[py][px] = transitionTile;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// === ELEVATION GENERATION ===

function generateElevation(ground: TileType[][]): number[][] {
  const elevation: number[][] = Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => 0)
  );

  // Base elevation from template biome
  for (let ty = 0; ty < 50; ty++) {
    const row = TEMPLATE[ty];
    if (!row) continue;
    for (let tx = 0; tx < 40; tx++) {
      const code = row[tx];
      if (code === '.') continue;
      const biome = code === '^' ? 'snow' : STATES[code]?.biome;
      const baseElev = biome ? (BIOME_ELEVATION[biome] ?? 1) : 0;
      for (let dy = 0; dy < UPSCALE; dy++) {
        for (let dx = 0; dx < UPSCALE; dx++) {
          const px = tx * UPSCALE + dx;
          const py = ty * UPSCALE + dy;
          if (px < MAP_W && py < MAP_H) {
            elevation[py][px] = baseElev;
          }
        }
      }
    }
  }

  // Rivers carve to elevation 1
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (ground[y][x] === TileType.RIVER || ground[y][x] === TileType.BRIDGE) {
        elevation[y][x] = 1;
      }
    }
  }

  // Settlements flatten to base elevation
  const settlements = getAllSettlements();
  for (const { settlement, biome } of settlements) {
    const baseElev = BIOME_ELEVATION[biome] ?? 1;
    const clearSize = settlement.type === 'capital' ? 18 : settlement.type === 'city' ? 14 : 8;
    for (let dy = -clearSize; dy <= clearSize; dy++) {
      for (let dx = -clearSize; dx <= clearSize; dx++) {
        const px = settlement.tileX + dx;
        const py = settlement.tileY + dy;
        if (px >= 0 && px < MAP_W && py >= 0 && py < MAP_H) {
          elevation[py][px] = Math.min(baseElev, 2); // Cap at 2 for walkability
        }
      }
    }
  }

  // Routes flatten to terrain elevation (ensure walkability)
  for (const route of ROUTES) {
    for (let i = 0; i < route.waypoints.length - 1; i++) {
      const p1 = route.waypoints[i], p2 = route.waypoints[i + 1];
      flattenRouteElevation(elevation, p1.x, p1.y, p2.x, p2.y);
    }
  }

  // Add ledge tiles at significant elevation changes
  for (let y = 1; y < MAP_H - 1; y++) {
    for (let x = 1; x < MAP_W - 1; x++) {
      const e = elevation[y][x];
      // Check if this is a cliff edge (drop of 2+ to neighbor)
      if (e >= 2 && elevation[y + 1]?.[x] <= e - 2 && ground[y][x] !== TileType.OCEAN) {
        if (ground[y + 1][x] !== TileType.OCEAN && ground[y + 1][x] !== TileType.RIVER &&
            !isProtectedTile(ground[y + 1][x])) {
          // Place a ledge at the cliff edge (visual indicator)
          if (hash(x * 5, y * 3) < 0.3) {
            ground[y][x] = TileType.LEDGE_S;
          }
        }
      }
    }
  }

  // Place stairs at route/elevation intersections
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (ground[y][x] === TileType.STAIRS) {
        // Stairs always at elevation of the higher side
        const maxNeighbor = Math.max(
          elevation[y - 1]?.[x] ?? 0, elevation[y + 1]?.[x] ?? 0,
          elevation[y]?.[x - 1] ?? 0, elevation[y]?.[x + 1] ?? 0,
        );
        elevation[y][x] = maxNeighbor;
      }
    }
  }

  return elevation;
}

function flattenRouteElevation(
  elevation: number[][], x0: number, y0: number, x1: number, y1: number,
) {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, cx = x0, cy = y0;
  let prevElev = elevation[cy]?.[cx] ?? 1;

  while (true) {
    if (cx >= 0 && cx < MAP_W && cy >= 0 && cy < MAP_H) {
      const currElev = elevation[cy][cx];
      // Gradually transition: max 1 level change per tile
      if (currElev > prevElev + 1) {
        elevation[cy][cx] = prevElev + 1;
      }
      prevElev = elevation[cy][cx];
      // Also flatten 1 tile on each side
      for (const off of [-1, 1]) {
        if (Math.abs(x1 - x0) > Math.abs(y1 - y0)) {
          if (cy + off >= 0 && cy + off < MAP_H) elevation[cy + off][cx] = elevation[cy][cx];
        } else {
          if (cx + off >= 0 && cx + off < MAP_W) elevation[cy][cx + off] = elevation[cy][cx];
        }
      }
    }
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

// === OBSTACLE PLACEMENT ===

function placeObstacles(ground: TileType[][]) {
  for (const obs of OBSTACLES) {
    for (let dy = 0; dy < obs.height; dy++) {
      for (let dx = 0; dx < obs.width; dx++) {
        setTile(ground, obs.tileX + dx, obs.tileY + dy, obs.tileType);
      }
    }
  }
}

// === SUB-ZONE FEATURES ===

function placeSubZoneFeatures(ground: TileType[][]) {
  for (const zone of SUB_ZONES) {
    switch (zone.type) {
      case 'oasis':
        placeStructureCentered(ground, DESERT_OASIS, zone.center.x, zone.center.y, MAP_W, MAP_H);
        break;
      case 'hot_springs':
        placeStructureCentered(ground, HOT_SPRINGS, zone.center.x, zone.center.y, MAP_W, MAP_H);
        break;
      case 'sacred_grove': {
        // Clear a small peaceful area
        const r = Math.min(zone.radius, 4);
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              const px = zone.center.x + dx, py = zone.center.y + dy;
              if (px >= 0 && px < MAP_W && py >= 0 && py < MAP_H) {
                const existing = ground[py][px];
                if (!isProtectedTile(existing)) {
                  ground[py][px] = hash(px, py) < 0.4 ? TileType.FLOWERS : TileType.GARDEN;
                }
              }
            }
          }
        }
        break;
      }
      case 'training_ground': {
        // Encounter-heavy area with tall grass patches
        const r = zone.radius;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              const px = zone.center.x + dx, py = zone.center.y + dy;
              if (px >= 0 && px < MAP_W && py >= 0 && py < MAP_H) {
                const existing = ground[py][px];
                if (!isProtectedTile(existing) && existing !== TileType.PATH_DIRT) {
                  if (hash(px * 3, py * 5) < 0.5) {
                    ground[py][px] = TileType.TALL_GRASS;
                  }
                }
              }
            }
          }
        }
        break;
      }
      case 'bandit_camp': {
        // Dense encounter area with rocks for cover
        const r = zone.radius;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              const px = zone.center.x + dx, py = zone.center.y + dy;
              if (px >= 0 && px < MAP_W && py >= 0 && py < MAP_H) {
                const existing = ground[py][px];
                if (!isProtectedTile(existing)) {
                  const h = hash(px * 7, py * 11);
                  if (h < 0.4) ground[py][px] = TileType.TALL_GRASS;
                  else if (h < 0.5) ground[py][px] = TileType.ROCKS;
                }
              }
            }
          }
        }
        break;
      }
      case 'haunted_grounds': {
        // Swampy, dark area
        const r = zone.radius;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              const px = zone.center.x + dx, py = zone.center.y + dy;
              if (px >= 0 && px < MAP_W && py >= 0 && py < MAP_H) {
                const existing = ground[py][px];
                if (!isProtectedTile(existing)) {
                  const h = hash(px * 9, py * 13);
                  if (h < 0.35) ground[py][px] = TileType.SWAMP;
                  else if (h < 0.55) ground[py][px] = TileType.MANGROVE;
                  else if (h < 0.7) ground[py][px] = TileType.DENSE_JUNGLE;
                }
              }
            }
          }
        }
        break;
      }
      case 'ancient_ruins': {
        // Scatter ruins tiles in the area
        const r = zone.radius;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              const px = zone.center.x + dx, py = zone.center.y + dy;
              if (px >= 0 && px < MAP_W && py >= 0 && py < MAP_H) {
                const existing = ground[py][px];
                if (!isProtectedTile(existing)) {
                  const h = hash(px * 11, py * 17);
                  if (h < 0.15) ground[py][px] = TileType.RUINS;
                  else if (h < 0.3) ground[py][px] = TileType.ROCKS;
                }
              }
            }
          }
        }
        break;
      }
      // Other types don't modify terrain (they just affect encounter rates)
    }
  }
}

// === MAIN MAP GENERATOR ===

export function generateIndiaMap(): TileMapData {
  const ground: TileType[][] = Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => TileType.OCEAN)
  );

  // 1. Fill base terrain from template with biome-specific variety
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
      for (let dy = 0; dy < UPSCALE; dy++) {
        for (let dx = 0; dx < UPSCALE; dx++) {
          const px = tx * UPSCALE + dx;
          const py = ty * UPSCALE + dy;
          if (px < MAP_W && py < MAP_H) {
            ground[py][px] = pickBiomeTileSmooth(biome, px, py);
          }
        }
      }
    }
  }

  // 2. Biome transitions at state borders (smooth blending)
  addBiomeTransitions(ground);

  // 3. Coastal transitions (beaches + shallow water)
  addCoastalTransitions(ground);

  // 4. Rivers
  for (const river of RIVERS) {
    for (let i = 0; i < river.length - 1; i++) {
      drawRiverSegment(ground, river[i][0], river[i][1], river[i + 1][0], river[i + 1][1], i < 2 ? 2 : 3);
    }
  }

  // 5. Place nature structures (forests, lakes, rocks, etc.)
  for (const placement of NATURE_PLACEMENTS) {
    placeStructureCentered(ground, placement.structure, placement.x, placement.y, MAP_W, MAP_H);
  }

  // 6. Settlements (biome-specific templates)
  const settlements = getAllSettlements();
  for (const { settlement, biome } of settlements) {
    placeSettlement(ground, settlement, biome);
  }

  // 7. Place unique landmarks
  for (const placement of LANDMARK_PLACEMENTS) {
    placeStructureCentered(ground, placement.structure, placement.x, placement.y, MAP_W, MAP_H);
  }

  // 7b. Place Indo-Saracenic Mughal structures
  for (const placement of MUGHAL_PLACEMENTS) {
    placeStructureCentered(ground, placement.structure, placement.x, placement.y, MAP_W, MAP_H);
  }

  // 8. Draw Pokemon-style routes between settlements
  for (const route of ROUTES) {
    drawRoute(ground, route);
  }

  // 9. Campsites between distant settlements
  placeCampsites(ground, settlements);

  // 10. Place sub-zone features (oases, sacred groves, haunted areas, etc.)
  placeSubZoneFeatures(ground);

  // 11. Place progression obstacles
  placeObstacles(ground);

  // 12. Generate elevation layer
  const elevation = generateElevation(ground);

  // 13. Build decoration layer (initially empty)
  const decor: (TileType | -1)[][] = Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => -1 as (TileType | -1))
  );

  return { width: MAP_W, height: MAP_H, ground, decor, elevation };
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

export function getStateCode(tileX: number, tileY: number): string {
  const tx = Math.floor(tileX / UPSCALE);
  const ty = Math.floor(tileY / UPSCALE);
  if (ty < 0 || ty >= TEMPLATE.length || tx < 0 || tx >= 40) return '';
  const code = TEMPLATE[ty]?.[tx];
  if (!code || code === '.') return '';
  return code;
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

// Player starts in Mathura, UP — the starting village for the Hero's Journey
export const PLAYER_START = { x: 100, y: 72 };

// === NPCs ===

// Hand-crafted story NPCs with social identities
const STORY_NPCS: NPC[] = [
  {
    id: 'delhi-advisor', name: 'Vizier Mirza',
    position: { x: 108, y: 60 }, direction: 'down', behavior: 'guard',
    dialog: ['Welcome to Shahjahanabad, traveler!', 'You stand in the heart of the Mughal Empire.'],
    dialogTreeId: 'quest_vizier_mission',
    settlement: 'Shahjahanabad',
    social: { title: 'Vizier', socialClass: 'noble', zatRank: 5000, faction: 'Mughal Court' },
  },
  {
    id: 'delhi-merchant', name: 'Merchant Fatima',
    position: { x: 100, y: 58 }, direction: 'right', behavior: 'scheduled', wanderRadius: 3,
    dialog: ['The finest silks and spices from across Hindustan!', 'You look like you could use some supplies.', 'The road ahead is long and full of danger.'],
    dialogTreeId: 'trader_intro',
    settlement: 'Shahjahanabad',
    social: { title: 'Trader', socialClass: 'merchant' },
    schedule: [
      { startHour: 7, endHour: 18, position: { x: 100, y: 58 }, behavior: 'wander', dialog: 'Welcome! Browse my wares.' },
      { startHour: 18, endHour: 7, position: { x: 103, y: 60 }, behavior: 'stationary', dialog: 'The bazaar is closed. Come back tomorrow.' },
    ],
  },
  {
    id: 'agra-merchant', name: 'Merchant Ratan',
    position: { x: 120, y: 76 }, direction: 'left', behavior: 'wander', wanderRadius: 4,
    dialog: ['Ah, you have come to Agra!', 'The grand monument stands nearby.'],
    dialogTreeId: 'quest_agra_merchant',
    settlement: 'Agra',
    social: { title: 'Trader', socialClass: 'merchant' },
  },
  {
    id: 'jaipur-guard', name: 'Rajput Vikram',
    position: { x: 76, y: 88 }, direction: 'right', behavior: 'guard',
    dialog: ['Halt! You enter Amber, seat of the Rajput kings.', 'We Rajputs have defended this land for centuries.'],
    dialogTreeId: 'quest_rajput_alliance',
    settlement: 'Amber',
    social: { title: 'Risaldar', socialClass: 'soldier', zatRank: 200, faction: 'Rajput Alliance' },
  },
  {
    id: 'varanasi-scholar', name: 'Pandit Sharma',
    position: { x: 148, y: 88 }, direction: 'down', behavior: 'stationary',
    dialog: ['Namaste! Welcome to Kashi, the eternal city.', 'This is the holiest of places on the Ganga.', 'Scholars from across the land come here to learn.'],
    dialogTreeId: 'sage_intro',
    settlement: 'Varanasi',
    social: { title: 'Pandit', socialClass: 'priest' },
  },
  {
    id: 'lucknow-poet', name: 'Poet Wajid',
    position: { x: 130, y: 82 }, direction: 'left', behavior: 'wander', wanderRadius: 3,
    dialog: ['Ah, the city of nawabs and poetry!', 'In Lucknow, even the stones speak in verse.', 'Have you heard the tale of the phantom of the fort?'],
    settlement: 'Lucknow',
    social: { title: 'Danishmand', socialClass: 'scholar' },
  },
  {
    id: 'guwahati-sage', name: 'Sage Bhupen',
    position: { x: 216, y: 112 }, direction: 'down', behavior: 'stationary',
    dialog: ['You have traveled far to reach Assam, friend.', 'The Brahmaputra is our lifeline.', 'The hills of the northeast hide ancient kingdoms.'],
    dialogTreeId: 'sage_intro',
    settlement: 'Guwahati',
    social: { title: 'Sant', socialClass: 'priest' },
  },
  {
    id: 'hampi-priest', name: 'Priest Vidyaranya',
    position: { x: 84, y: 240 }, direction: 'down', behavior: 'stationary',
    dialog: ['Welcome to Hampi, jewel of the Vijayanagara Empire!', 'These temples were built by great kings.', 'Seek the ruins... they hold treasures of a lost age.'],
    dialogTreeId: 'sage_intro',
    settlement: 'Hampi',
    social: { title: 'Pandit', socialClass: 'priest' },
  },
  {
    id: 'kozhikode-trader', name: 'Trader Ibrahim',
    position: { x: 92, y: 292 }, direction: 'right', behavior: 'wander', wanderRadius: 4,
    dialog: ['Ahlan! Welcome to Kozhikode, the spice coast!', 'Ships come from Arabia, Persia, and even Cathay.', 'Pepper, cardamom, cinnamon... Kerala has it all.'],
    dialogTreeId: 'trader_intro',
    settlement: 'Kozhikode',
    social: { title: 'Caravan Master', socialClass: 'merchant' },
  },
  {
    id: 'mumbai-captain', name: 'Captain Raje',
    position: { x: 58, y: 198 }, direction: 'down', behavior: 'guard',
    dialog: ['This is the port of Mumbai, gateway to the west.', 'Ships from Portugal dock here daily.', 'The Marathas control these waters now.'],
    settlement: 'Mumbai',
    social: { title: 'Qiladar', socialClass: 'soldier', zatRank: 500, faction: 'Maratha Confederacy' },
  },
  {
    id: 'madurai-priestess', name: 'Priestess Meenakshi',
    position: { x: 116, y: 300 }, direction: 'down', behavior: 'stationary',
    dialog: ['Blessings upon you, traveler from the north.', 'The great Meenakshi temple watches over this city.', 'Seek the shore temples if you wish to see our heritage.'],
    dialogTreeId: 'sage_intro',
    settlement: 'Madurai',
    social: { title: 'Swami', socialClass: 'priest' },
  },
  {
    id: 'jodhpur-warrior', name: 'Warrior Rao',
    position: { x: 54, y: 102 }, direction: 'right', behavior: 'wander', wanderRadius: 3,
    dialog: ['The Blue City welcomes you, stranger.', 'In these deserts, water is more precious than gold.', 'Beware the sand scorpions!'],
    dialogTreeId: 'guard_intro',
    settlement: 'Jodhpur',
    social: { title: 'Sipahi', socialClass: 'soldier', zatRank: 100 },
  },
  {
    id: 'bhopal-alchemist', name: 'Alchemist Hakim',
    position: { x: 102, y: 118 }, direction: 'left', behavior: 'wander', wanderRadius: 2,
    dialog: ['I study the ancient sciences of healing...', 'The forests of Madhya Pradesh are full of rare herbs.', 'Bring me ingredients and I can brew powerful remedies.'],
    settlement: 'Bhopal',
    social: { title: 'Hakim', socialClass: 'scholar' },
  },
  {
    id: 'delhi-elder', name: 'Village Elder Hari',
    position: { x: 106, y: 64 }, direction: 'down', behavior: 'stationary',
    dialog: ['The villages around Delhi need your help.', 'Bandits grow bolder each day.'],
    dialogTreeId: 'elder_intro',
    settlement: 'Shahjahanabad',
    social: { title: 'Zamindar', socialClass: 'noble', zatRank: 100 },
  },
  // === QUEST NPCs ===
  {
    id: 'mathura-elder', name: 'Elder Devrath',
    position: { x: 101, y: 72 }, direction: 'down', behavior: 'stationary',
    dialog: ['Welcome, child. Speak with me when you are ready.', 'These are troubled times for our village.'],
    dialogTreeId: 'quest_elder_start',
    settlement: 'Mathura',
    social: { title: 'Zamindar', socialClass: 'noble', zatRank: 50 },
  },
  {
    id: 'mathura-mentor', name: 'Guru Arjun',
    position: { x: 103, y: 74 }, direction: 'left', behavior: 'stationary',
    dialog: ['I sit here beneath the banyan, waiting.', 'Come back when you have found what you seek.'],
    dialogTreeId: 'quest_mentor_intro',
    settlement: 'Mathura',
    social: { title: 'Mansabdar', socialClass: 'noble', zatRank: 2000, faction: 'Retired' },
  },
  {
    id: 'mathura-villager1', name: 'Farmer Gopal',
    position: { x: 99, y: 71 }, direction: 'right', behavior: 'wander', wanderRadius: 2,
    dialog: ['The construction workers found something strange south of here.', 'I do not like it... bad omens.'],
    settlement: 'Mathura',
    social: { title: 'Farmer', socialClass: 'peasant' },
  },
  {
    id: 'mathura-villager2', name: 'Kamla',
    position: { x: 98, y: 73 }, direction: 'down', behavior: 'wander', wanderRadius: 3,
    dialog: ['Be careful if you go south.', 'I heard bandits have been lurking near the dig site.'],
    settlement: 'Mathura',
    social: { title: 'Weaver', socialClass: 'artisan' },
  },

  // === EXPANDED NPCs: every settlement gets life ===

  // -- Agra --
  {
    id: 'agra-guard', name: 'Fort Guard Salim',
    position: { x: 114, y: 76 }, direction: 'right', behavior: 'guard',
    dialog: ['The fort is sealed by imperial decree.', 'Only those with the Fort Seal may enter.'],
    settlement: 'Agra',
    social: { title: 'Sipahi', socialClass: 'soldier', zatRank: 100 },
  },
  {
    id: 'agra-scholar', name: 'Astronomer Zafar',
    position: { x: 118, y: 80 }, direction: 'down', behavior: 'stationary',
    dialog: ['The stars foretell great upheaval.', 'The Charbagh gardens encode celestial mathematics.'],
    settlement: 'Agra',
    social: { title: 'Munajjim', socialClass: 'scholar' },
  },

  // -- Lucknow --
  {
    id: 'lucknow-merchant', name: 'Perfumer Nasreen',
    position: { x: 128, y: 82 }, direction: 'left', behavior: 'wander', wanderRadius: 2,
    dialog: ['Lucknow is famous for its attar!', 'Rose, jasmine, sandalwood... name your fragrance.'],
    settlement: 'Lucknow',
    social: { title: 'Attarwala', socialClass: 'merchant' },
    shopItems: ['sandalwood_balm', 'camphor_incense', 'tulsi_elixir'],
  },

  // -- Varanasi --
  {
    id: 'varanasi-boatman', name: 'Boatman Kedar',
    position: { x: 146, y: 90 }, direction: 'down', behavior: 'stationary',
    dialog: ['I ferry pilgrims across the sacred Ganga.', 'For a token, I could take you across the flooded lands to the east.'],
    settlement: 'Varanasi',
    social: { title: 'Mallah', socialClass: 'peasant' },
    shopItems: ['boat_token'],
  },

  // -- Pataliputra --
  {
    id: 'pataliputra-guard', name: 'Captain Ashoka',
    position: { x: 158, y: 96 }, direction: 'left', behavior: 'guard',
    dialog: ['Pataliputra was once the greatest city in the world.', 'Now it guards the gate to the east.'],
    settlement: 'Pataliputra',
    social: { title: 'Qiladar', socialClass: 'soldier', zatRank: 200 },
  },
  {
    id: 'pataliputra-monk', name: 'Monk Nalanda',
    position: { x: 154, y: 98 }, direction: 'down', behavior: 'stationary',
    dialog: ['The old university once drew scholars from across the world.', 'Knowledge is the greatest treasure.'],
    settlement: 'Pataliputra',
    social: { title: 'Bhikshu', socialClass: 'priest' },
  },

  // -- Amber --
  {
    id: 'amber-merchant', name: 'Jeweler Lakshmi',
    position: { x: 74, y: 90 }, direction: 'right', behavior: 'wander', wanderRadius: 2,
    dialog: ['Rajputana gems, the finest in Hindustan!', 'Diamonds from Golconda, rubies from Burma...'],
    settlement: 'Amber',
    social: { title: 'Sahukar', socialClass: 'merchant' },
    shopItems: ['jade_amulet', 'bazuband', 'sharpening_stone'],
  },
  {
    id: 'amber-blacksmith', name: 'Blacksmith Karan',
    position: { x: 70, y: 88 }, direction: 'down', behavior: 'stationary',
    dialog: ['I forge the finest Rajput steel.', 'Bring me materials and I can craft weapons of legend.'],
    settlement: 'Amber',
    social: { title: 'Lohar', socialClass: 'artisan' },
    shopItems: ['iron_talwar', 'katara', 'iron_pickaxe', 'dhal_shield'],
  },

  // -- Jodhpur --
  {
    id: 'jodhpur-child', name: 'Priya',
    position: { x: 52, y: 98 }, direction: 'right', behavior: 'wander', wanderRadius: 4,
    dialog: ['Have you seen the blue houses?', 'They say the color keeps scorpions away!'],
    settlement: 'Jodhpur',
    social: { title: 'Child', socialClass: 'peasant' },
  },

  // -- Jaisalmer --
  {
    id: 'jaisalmer-guide', name: 'Desert Guide Bhati',
    position: { x: 46, y: 84 }, direction: 'down', behavior: 'stationary',
    dialog: ['The deep desert is treacherous without a compass.', 'I can sell you one — it will save your life.'],
    settlement: 'Jaisalmer',
    social: { title: 'Rahdari', socialClass: 'merchant' },
    shopItems: ['desert_compass', 'rope', 'healing_herb'],
  },

  // -- Bhopal --
  {
    id: 'bhopal-woodcutter', name: 'Woodcutter Ramu',
    position: { x: 98, y: 116 }, direction: 'right', behavior: 'wander', wanderRadius: 3,
    dialog: ['These forests are thick as a wall.', 'A good axe would cut right through fallen timber.'],
    settlement: 'Bhopal',
    social: { title: 'Lakadhari', socialClass: 'artisan' },
    shopItems: ['clearing_axe', 'rope', 'antidote_paste'],
  },

  // -- Gwalior --
  {
    id: 'gwalior-guard', name: 'Gatekeeper Singh',
    position: { x: 104, y: 90 }, direction: 'down', behavior: 'guard',
    dialog: ['Gwalior Fort watches over the Chambal.', 'Dacoits plague the ravines to the south.'],
    settlement: 'Gwalior',
    social: { title: 'Darban', socialClass: 'soldier', zatRank: 100 },
  },

  // -- Gaur (Bengal) --
  {
    id: 'gaur-historian', name: 'Chronicler Hasan',
    position: { x: 174, y: 112 }, direction: 'left', behavior: 'stationary',
    dialog: ['Gaur was the capital of Bengal sultans.', 'The ruins tell stories of past glory.'],
    settlement: 'Gaur',
    social: { title: 'Waqianawis', socialClass: 'scholar' },
  },

  // -- Puri --
  {
    id: 'puri-priest', name: 'Pujari Jagannath',
    position: { x: 178, y: 160 }, direction: 'down', behavior: 'stationary',
    dialog: ['Welcome to Puri, abode of Lord Jagannath!', 'The Rath Yatra chariot festival draws millions.'],
    settlement: 'Puri',
    social: { title: 'Pujari', socialClass: 'priest' },
  },

  // -- Ahmedabad --
  {
    id: 'ahmedabad-textile', name: 'Weaver Meera',
    position: { x: 38, y: 148 }, direction: 'right', behavior: 'wander', wanderRadius: 3,
    dialog: ['Gujarat textiles are prized across the world!', 'Silk, cotton, bandhani... all from our looms.'],
    settlement: 'Ahmedabad',
    social: { title: 'Julaha', socialClass: 'artisan' },
  },

  // -- Golconda --
  {
    id: 'golconda-miner', name: 'Diamond Cutter Ali',
    position: { x: 110, y: 208 }, direction: 'left', behavior: 'stationary',
    dialog: ['Golconda diamonds are the world\'s finest.', 'But the mines are haunted by ancient guardians now.'],
    settlement: 'Golconda',
    social: { title: 'Heera Kaat', socialClass: 'artisan' },
  },

  // -- Mysore --
  {
    id: 'mysore-general', name: 'Commander Haidar',
    position: { x: 86, y: 268 }, direction: 'down', behavior: 'guard',
    dialog: ['Mysore stands firm against all invaders.', 'Our kingdom has never been conquered.'],
    settlement: 'Mysore',
    social: { title: 'Bakshi', socialClass: 'soldier', zatRank: 1000, faction: 'Mysore Kingdom' },
  },

  // -- Shimla --
  {
    id: 'shimla-herbalist', name: 'Herbalist Devi',
    position: { x: 94, y: 32 }, direction: 'down', behavior: 'wander', wanderRadius: 2,
    dialog: ['The Himalayan herbs have extraordinary power.', 'Mountain flowers bloom with healing essence.'],
    settlement: 'Shimla',
    social: { title: 'Vaidya', socialClass: 'scholar' },
    shopItems: ['healing_herb', 'neem_potion', 'tulsi_elixir', 'antidote_paste'],
  },

  // -- Haridwar --
  {
    id: 'haridwar-sadhu', name: 'Sadhu Bhairav',
    position: { x: 126, y: 40 }, direction: 'down', behavior: 'stationary',
    dialog: ['The Ganga descends from heaven here.', 'A holy dip cleanses all sins.', 'I can sell you a strong rope for the mountain paths.'],
    settlement: 'Haridwar',
    social: { title: 'Sadhu', socialClass: 'priest' },
    shopItems: ['climbing_rope', 'camphor_incense', 'healing_herb'],
  },

  // -- Route NPCs (travelers) --
  {
    id: 'route-traveler-1', name: 'Wandering Sadhu',
    position: { x: 104, y: 62 }, direction: 'down', behavior: 'wander', wanderRadius: 3,
    dialog: ['The road to Delhi is safe, but watch for wild boars.', 'The tall grass hides creatures.'],
    settlement: 'Shahjahanabad',
    social: { title: 'Sadhu', socialClass: 'priest' },
  },
  {
    id: 'route-traveler-2', name: 'Merchant Caravan',
    position: { x: 80, y: 80 }, direction: 'right', behavior: 'wander', wanderRadius: 2,
    dialog: ['We are heading to Amber with silk from Delhi.', 'The desert road grows dangerous after sunset.'],
    settlement: 'Amber',
    social: { title: 'Trader', socialClass: 'merchant' },
  },
  {
    id: 'route-traveler-3', name: 'Pilgrim Devaki',
    position: { x: 136, y: 84 }, direction: 'left', behavior: 'wander', wanderRadius: 2,
    dialog: ['I walk to Varanasi for the holy festival.', 'The path along the Ganga is beautiful but perilous.'],
    settlement: 'Ayodhya',
    social: { title: 'Pilgrim', socialClass: 'peasant' },
  },
];

export const WORLD_NPCS: NPC[] = STORY_NPCS;

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
  [TileType.SANDSTONE]: '#c2613a',
  [TileType.MARBLE]: '#f0ece0',
  [TileType.DOME]: '#e8d8a0',
  [TileType.ARCH]: '#b85030',
  [TileType.JALI]: '#d8c8a8',
  [TileType.MINARET]: '#c8b888',
  [TileType.CHHATRI]: '#d0b870',
  [TileType.BAORI_WALL]: '#a06030',
  [TileType.BAORI_WATER]: '#2868a0',
  [TileType.PIETRA_DURA]: '#d0c0a0',
  [TileType.COURTYARD]: '#d8c8a0',
  [TileType.HAVELI_WALL]: '#b06838',
  [TileType.MUGHAL_GATE]: '#a04828',
  [TileType.MOSQUE]: '#d8d0b8',
  [TileType.BORDER_POST]: '#8a6840',
  [TileType.CANAL]: '#5098c0',
  [TileType.CHARBAGH]: '#308838',
  [TileType.LEDGE_S]: '#686058',
  [TileType.LEDGE_N]: '#686058',
  [TileType.LEDGE_E]: '#686058',
  [TileType.LEDGE_W]: '#686058',
  [TileType.STAIRS]: '#908878',
  [TileType.ROCKY_PATH]: '#9a9080',
  [TileType.CRACKED_EARTH]: '#b09860',
  [TileType.MANGROVE]: '#2a5a2a',
  [TileType.BAMBOO]: '#4a8a30',
  [TileType.CACTUS]: '#608030',
  [TileType.FALLEN_LOG]: '#7a5a30',
  [TileType.BOULDER]: '#787070',
  [TileType.LOCKED_GATE]: '#a04828',
  [TileType.DRY_GRASS]: '#a09040',
};
