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

const UPSCALE = 12;
const MAP_W = 40 * UPSCALE; // 480
const MAP_H = 50 * UPSCALE; // 600

// === STATE/BIOME DEFINITIONS ===

const STATES: Record<string, StateDef> = {
  h: { code: 'h', name: 'Himachal Pradesh', biome: 'mountain', settlements: [
    { name: 'Shimla', type: 'city', tileX: 138, tileY: 48 },
    { name: 'Kullu', type: 'village', tileX: 132, tileY: 36 },
    { name: 'Manali', type: 'village', tileX: 129, tileY: 30 },
  ]},
  u: { code: 'u', name: 'Uttarakhand', biome: 'mountain', settlements: [
    { name: 'Haridwar', type: 'city', tileX: 186, tileY: 60 },
    { name: 'Rishikesh', type: 'village', tileX: 180, tileY: 48 },
    { name: 'Nainital', type: 'village', tileX: 192, tileY: 54 },
  ]},
  p: { code: 'p', name: 'Punjab', biome: 'plains', settlements: [
    { name: 'Amritsar', type: 'city', tileX: 114, tileY: 72 },
    { name: 'Lahore Gate', type: 'village', tileX: 120, tileY: 84 },
  ]},
  y: { code: 'y', name: 'Haryana', biome: 'plains', settlements: [
    { name: 'Kurukshetra', type: 'city', tileX: 132, tileY: 90 },
    { name: 'Panipat', type: 'village', tileX: 132, tileY: 102 },
  ]},
  D: { code: 'D', name: 'Delhi', biome: 'plains', settlements: [
    { name: 'Shahjahanabad', type: 'capital', tileX: 156, tileY: 84 },
  ]},
  r: { code: 'r', name: 'Rajasthan', biome: 'desert', settlements: [
    { name: 'Amber', type: 'city', tileX: 108, tileY: 132 },
    { name: 'Jodhpur', type: 'city', tileX: 78, tileY: 150 },
    { name: 'Jaisalmer', type: 'village', tileX: 66, tileY: 126 },
    { name: 'Udaipur', type: 'village', tileX: 90, tileY: 180 },
    { name: 'Pushkar', type: 'village', tileX: 102, tileY: 144 },
    { name: 'Bikaner', type: 'village', tileX: 84, tileY: 120 },
  ]},
  l: { code: 'l', name: 'Uttar Pradesh', biome: 'plains', settlements: [
    { name: 'Agra', type: 'city', tileX: 174, tileY: 114 },
    { name: 'Varanasi', type: 'city', tileX: 216, tileY: 132 },
    { name: 'Lucknow', type: 'city', tileX: 192, tileY: 120 },
    { name: 'Ayodhya', type: 'village', tileX: 204, tileY: 126 },
    { name: 'Mathura', type: 'village', tileX: 150, tileY: 108 },
    { name: 'Allahabad', type: 'village', tileX: 210, tileY: 123 },
  ]},
  b: { code: 'b', name: 'Bihar', biome: 'plains', settlements: [
    { name: 'Pataliputra', type: 'city', tileX: 234, tileY: 144 },
    { name: 'Bodh Gaya', type: 'village', tileX: 234, tileY: 156 },
    { name: 'Rajgir', type: 'village', tileX: 240, tileY: 150 },
  ]},
  j: { code: 'j', name: 'Jharkhand', biome: 'forest', settlements: [
    { name: 'Ranchi', type: 'city', tileX: 234, tileY: 192 },
    { name: 'Hazaribagh', type: 'village', tileX: 228, tileY: 180 },
  ]},
  w: { code: 'w', name: 'West Bengal', biome: 'wetland', settlements: [
    { name: 'Gaur', type: 'city', tileX: 258, tileY: 168 },
    { name: 'Murshidabad', type: 'village', tileX: 258, tileY: 186 },
    { name: 'Sundarbans', type: 'village', tileX: 264, tileY: 195 },
  ]},
  o: { code: 'o', name: 'Odisha', biome: 'coastal', settlements: [
    { name: 'Puri', type: 'city', tileX: 264, tileY: 240 },
    { name: 'Bhubaneswar', type: 'city', tileX: 258, tileY: 228 },
    { name: 'Konark', type: 'village', tileX: 267, tileY: 234 },
  ]},
  s: { code: 's', name: 'Sikkim', biome: 'mountain', settlements: [
    { name: 'Gangtok', type: 'village', tileX: 324, tileY: 138 },
  ]},
  a: { code: 'a', name: 'Arunachal Pradesh', biome: 'dense_forest', settlements: [
    { name: 'Tawang', type: 'village', tileX: 378, tileY: 162 },
    { name: 'Itanagar', type: 'village', tileX: 366, tileY: 168 },
  ]},
  z: { code: 'z', name: 'Assam', biome: 'wetland', settlements: [
    { name: 'Guwahati', type: 'city', tileX: 318, tileY: 168 },
    { name: 'Tezpur', type: 'village', tileX: 330, tileY: 156 },
    { name: 'Jorhat', type: 'village', tileX: 342, tileY: 162 },
  ]},
  n: { code: 'n', name: 'Nagaland', biome: 'mountain', settlements: [
    { name: 'Kohima', type: 'village', tileX: 396, tileY: 192 },
  ]},
  i: { code: 'i', name: 'Manipur', biome: 'mountain', settlements: [
    { name: 'Imphal', type: 'village', tileX: 402, tileY: 210 },
  ]},
  q: { code: 'q', name: 'Mizoram', biome: 'dense_forest', settlements: [
    { name: 'Aizawl', type: 'village', tileX: 396, tileY: 228 },
  ]},
  t: { code: 't', name: 'Tripura', biome: 'forest', settlements: [
    { name: 'Agartala', type: 'village', tileX: 354, tileY: 228 },
  ]},
  e: { code: 'e', name: 'Meghalaya', biome: 'forest', settlements: [
    { name: 'Shillong', type: 'city', tileX: 342, tileY: 168 },
    { name: 'Cherrapunji', type: 'village', tileX: 348, tileY: 174 },
  ]},
  g: { code: 'g', name: 'Gujarat', biome: 'desert', settlements: [
    { name: 'Ahmedabad', type: 'city', tileX: 54, tileY: 222 },
    { name: 'Dwarka', type: 'village', tileX: 30, tileY: 246 },
    { name: 'Somnath', type: 'village', tileX: 42, tileY: 258 },
    { name: 'Surat', type: 'village', tileX: 60, tileY: 234 },
  ]},
  m: { code: 'm', name: 'Madhya Pradesh', biome: 'forest', settlements: [
    { name: 'Bhopal', type: 'city', tileX: 150, tileY: 174 },
    { name: 'Indore', type: 'city', tileX: 126, tileY: 186 },
    { name: 'Ujjain', type: 'village', tileX: 132, tileY: 174 },
    { name: 'Gwalior', type: 'village', tileX: 156, tileY: 138 },
    { name: 'Khajuraho', type: 'village', tileX: 168, tileY: 162 },
    { name: 'Sanchi', type: 'village', tileX: 144, tileY: 168 },
  ]},
  c: { code: 'c', name: 'Chhattisgarh', biome: 'dense_forest', settlements: [
    { name: 'Raipur', type: 'city', tileX: 198, tileY: 210 },
    { name: 'Bastar', type: 'village', tileX: 198, tileY: 234 },
    { name: 'Bilaspur', type: 'village', tileX: 204, tileY: 198 },
  ]},
  x: { code: 'x', name: 'Maharashtra', biome: 'plateau', settlements: [
    { name: 'Mumbai', type: 'city', tileX: 84, tileY: 294 },
    { name: 'Pune', type: 'city', tileX: 102, tileY: 306 },
    { name: 'Aurangabad', type: 'village', tileX: 114, tileY: 282 },
    { name: 'Nashik', type: 'village', tileX: 96, tileY: 276 },
    { name: 'Ajanta', type: 'village', tileX: 120, tileY: 288 },
  ]},
  v: { code: 'v', name: 'Goa', biome: 'coastal', settlements: [
    { name: 'Velha Goa', type: 'village', tileX: 72, tileY: 330 },
  ]},
  k: { code: 'k', name: 'Karnataka', biome: 'plateau', settlements: [
    { name: 'Hampi', type: 'city', tileX: 120, tileY: 360 },
    { name: 'Mysore', type: 'city', tileX: 126, tileY: 402 },
    { name: 'Bijapur', type: 'village', tileX: 114, tileY: 348 },
    { name: 'Badami', type: 'village', tileX: 120, tileY: 354 },
    { name: 'Mangalore', type: 'village', tileX: 96, tileY: 390 },
  ]},
  f: { code: 'f', name: 'Kerala', biome: 'coastal', settlements: [
    { name: 'Kozhikode', type: 'city', tileX: 132, tileY: 438 },
    { name: 'Kochi', type: 'city', tileX: 132, tileY: 462 },
    { name: 'Trivandrum', type: 'village', tileX: 132, tileY: 480 },
    { name: 'Alleppey', type: 'village', tileX: 129, tileY: 468 },
  ]},
  $: { code: '$', name: 'Telangana', biome: 'plateau', settlements: [
    { name: 'Golconda', type: 'city', tileX: 162, tileY: 312 },
    { name: 'Warangal', type: 'village', tileX: 174, tileY: 300 },
  ]},
  '@': { code: '@', name: 'Andhra Pradesh', biome: 'coastal', settlements: [
    { name: 'Amaravati', type: 'city', tileX: 192, tileY: 366 },
    { name: 'Tirupati', type: 'city', tileX: 174, tileY: 402 },
    { name: 'Visakhapatnam', type: 'village', tileX: 216, tileY: 342 },
  ]},
  '#': { code: '#', name: 'Tamil Nadu', biome: 'plains', settlements: [
    { name: 'Madurai', type: 'city', tileX: 168, tileY: 450 },
    { name: 'Thanjavur', type: 'city', tileX: 168, tileY: 426 },
    { name: 'Mahabalipuram', type: 'village', tileX: 180, tileY: 414 },
    { name: 'Kanchipuram', type: 'village', tileX: 174, tileY: 408 },
    { name: 'Rameswaram', type: 'village', tileX: 174, tileY: 462 },
  ]},
};

STATES['d'] = STATES['D'];

// === BIOME → TILE VARIETY ===
// Each biome uses weighted tile variety for natural-looking terrain
// Format: [TileType, cumulativeWeight] — weights sum to 1.0
type WeightedTile = [TileType, number];

// Pokemon-style biome design: each biome uses 90%+ of ONE dominant tile.
// Variety comes from structures, decorations, and routes — NOT random tile noise.
// This makes regions look clean and distinct, like designed game areas.
const BIOME_VARIETY: Record<BiomeType, WeightedTile[]> = {
  ocean: [[TileType.OCEAN, 1.0]],
  snow: [
    [TileType.SNOW, 0.92],
    [TileType.ICE, 0.97],
    [TileType.MOUNTAIN, 1.0],
  ],
  mountain: [
    [TileType.MOUNTAIN, 0.88],
    [TileType.ROCKS, 0.95],
    [TileType.CLIFF, 1.0],
  ],
  desert: [
    [TileType.DESERT, 0.92],
    [TileType.SAND_DUNES, 0.97],
    [TileType.CRACKED_EARTH, 1.0],
  ],
  plains: [
    [TileType.PLAINS, 0.92],
    [TileType.FARM, 0.97],
    [TileType.FLOWERS, 1.0],
  ],
  forest: [
    [TileType.FOREST, 0.88],
    [TileType.PLAINS, 0.95],
    [TileType.TALL_GRASS, 1.0],
  ],
  dense_forest: [
    [TileType.DENSE_JUNGLE, 0.88],
    [TileType.FOREST, 0.95],
    [TileType.SWAMP, 1.0],
  ],
  plateau: [
    [TileType.PLATEAU, 0.88],
    [TileType.DRY_GRASS, 0.95],
    [TileType.ROCKS, 1.0],
  ],
  wetland: [
    [TileType.SWAMP, 0.50],
    [TileType.PLAINS, 0.75],
    [TileType.MANGROVE, 0.90],
    [TileType.TALL_GRASS, 1.0],
  ],
  coastal: [
    [TileType.PLAINS, 0.85],
    [TileType.FARM, 0.93],
    [TileType.FLOWERS, 1.0],
  ],
};

// Large-scale noise for biome sub-variation.
// With 90%+ base tile per biome, this mainly controls where the rare
// secondary tiles appear in large coherent patches (not scattered noise).
function pickBiomeTileSmooth(biome: BiomeType, x: number, y: number): TileType {
  // Use large-scale noise (16x16 blocks) so variations form big patches
  const megaX = Math.floor(x / 16);
  const megaY = Math.floor(y / 16);
  const megaH = hash(megaX * 13, megaY * 37);
  // Small amount of medium-scale noise for organic edges
  const coarseX = Math.floor(x / 10);
  const coarseY = Math.floor(y / 10);
  const coarseH = hash(coarseX * 17, coarseY * 31);
  // 70% mega for large coherent patches, 30% coarse for natural edges
  const blended = megaH * 0.70 + coarseH * 0.30;
  const variants = BIOME_VARIETY[biome];
  for (const [tile, threshold] of variants) {
    if (blended < threshold) return tile;
  }
  return variants[variants.length - 1][0];
}

// === RIVERS ===
const RIVERS: number[][][] = [
  // Ganges
  [[186,54],[180,72],[168,96],[174,114],[192,126],[210,132],[228,144],[246,156],[258,174]],
  // Yamuna
  [[174,48],[162,66],[156,84],[156,102],[168,114],[186,126]],
  // Narmada
  [[168,186],[144,192],[120,204],[96,216],[66,228]],
  // Godavari
  [[102,288],[126,294],[156,306],[186,324],[216,342]],
  // Krishna
  [[114,318],[144,330],[174,348],[204,366]],
  // Brahmaputra
  [[384,150],[360,156],[336,162],[318,168],[300,180],[270,192]],
  // Cauvery
  [[132,390],[144,402],[156,414],[168,426]],
  // Tungabhadra
  [[114,360],[126,366],[138,372]],
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
  { structure: PINE_GROVE, x: 117, y: 33 },
  { structure: PINE_GROVE, x: 135, y: 27 },
  { structure: PINE_GROVE, x: 144, y: 39 },
  { structure: PINE_GROVE, x: 177, y: 45 },
  { structure: PINE_GROVE, x: 195, y: 42 },
  { structure: FOREST_SMALL, x: 126, y: 42 },
  { structure: FOREST_SMALL, x: 189, y: 51 },
  { structure: PINE_GROVE, x: 108, y: 36 },
  { structure: PINE_GROVE, x: 162, y: 36 },
  { structure: FOREST_SMALL, x: 150, y: 48 },

  // Madhya Pradesh / Central India forests
  { structure: FOREST_LARGE, x: 138, y: 162 },
  { structure: FOREST_MEDIUM, x: 162, y: 150 },
  { structure: BANYAN_GROVE, x: 144, y: 180 },
  { structure: FOREST_SMALL, x: 129, y: 195 },
  { structure: FOREST_LARGE, x: 138, y: 186 },
  { structure: FOREST_MEDIUM, x: 156, y: 168 },

  // Chhattisgarh dense jungles
  { structure: JUNGLE_PATCH, x: 192, y: 204 },
  { structure: JUNGLE_PATCH, x: 210, y: 216 },
  { structure: JUNGLE_PATCH, x: 201, y: 225 },
  { structure: JUNGLE_PATCH, x: 186, y: 216 },

  // Jharkhand forests
  { structure: FOREST_MEDIUM, x: 225, y: 186 },
  { structure: FOREST_SMALL, x: 237, y: 177 },
  { structure: FOREST_SMALL, x: 222, y: 195 },

  // Western Ghats forests
  { structure: FOREST_MEDIUM, x: 90, y: 324 },
  { structure: FOREST_SMALL, x: 84, y: 342 },
  { structure: FOREST_MEDIUM, x: 102, y: 372 },
  { structure: BANYAN_GROVE, x: 108, y: 384 },
  { structure: FOREST_LARGE, x: 90, y: 354 },

  // Kerala palm forests
  { structure: PALM_GROVE, x: 126, y: 444 },
  { structure: PALM_GROVE, x: 123, y: 456 },
  { structure: PALM_GROVE, x: 129, y: 474 },
  { structure: PALM_GROVE, x: 120, y: 432 },
  { structure: PALM_GROVE, x: 126, y: 486 },

  // South Indian tropical forests
  { structure: PALM_GROVE, x: 162, y: 432 },
  { structure: FOREST_SMALL, x: 174, y: 420 },
  { structure: BANYAN_GROVE, x: 180, y: 402 },
  { structure: FOREST_MEDIUM, x: 156, y: 420 },

  // Northeast India forests
  { structure: JUNGLE_PATCH, x: 330, y: 150 },
  { structure: FOREST_MEDIUM, x: 354, y: 162 },
  { structure: JUNGLE_PATCH, x: 372, y: 168 },
  { structure: FOREST_SMALL, x: 390, y: 198 },
  { structure: JUNGLE_PATCH, x: 384, y: 222 },
  { structure: FOREST_MEDIUM, x: 348, y: 174 },
  { structure: JUNGLE_PATCH, x: 366, y: 186 },

  // Assam/Bengal wetlands
  { structure: SWAMP_PATCH, x: 255, y: 177 },
  { structure: SWAMP_PATCH, x: 264, y: 189 },
  { structure: SWAMP_PATCH, x: 312, y: 174 },
  { structure: SWAMP_PATCH, x: 276, y: 183 },

  // Odisha coastal forests
  { structure: PALM_GROVE, x: 261, y: 222 },
  { structure: FOREST_SMALL, x: 255, y: 237 },

  // Rajasthan sand dunes
  { structure: SAND_DUNE, x: 60, y: 120 },
  { structure: SAND_DUNE, x: 75, y: 138 },
  { structure: SAND_DUNE, x: 66, y: 156 },
  { structure: SAND_DUNE, x: 84, y: 165 },
  { structure: SAND_DUNE, x: 57, y: 144 },
  { structure: SAND_DUNE, x: 72, y: 126 },
  { structure: SAND_DUNE, x: 90, y: 150 },

  // Gujarat desert
  { structure: SAND_DUNE, x: 36, y: 228 },
  { structure: SAND_DUNE, x: 48, y: 240 },
  { structure: SAND_DUNE, x: 42, y: 252 },

  // Lakes
  { structure: LAKE_MEDIUM, x: 255, y: 180 },
  { structure: LAKE_SMALL, x: 300, y: 177 },
  { structure: LAKE_SMALL, x: 132, y: 396 },
  { structure: LAKE_SMALL, x: 210, y: 126 },
  { structure: LAKE_SMALL, x: 168, y: 150 },

  // Rock formations
  { structure: ROCK_CLUSTER, x: 93, y: 288 },
  { structure: ROCK_CLUSTER, x: 117, y: 354 },
  { structure: CLIFF_FACE, x: 123, y: 30 },
  { structure: CLIFF_FACE, x: 195, y: 39 },
  { structure: ROCK_CLUSTER, x: 111, y: 348 },
  { structure: ROCK_CLUSTER, x: 78, y: 312 },

  // Flower meadows
  { structure: FLOWER_MEADOW, x: 120, y: 87 },
  { structure: FLOWER_MEADOW, x: 138, y: 78 },
  { structure: FLOWER_MEADOW, x: 165, y: 108 },
  { structure: FLOWER_MEADOW, x: 150, y: 414 },
  { structure: FLOWER_MEADOW, x: 132, y: 96 },

  // Additional wilderness features (expanded map)
  // Thar Desert interior
  { structure: SAND_DUNE, x: 54, y: 132 },
  { structure: SAND_DUNE, x: 48, y: 162 },
  // Gangetic plains forests
  { structure: FOREST_SMALL, x: 180, y: 108 },
  { structure: FOREST_SMALL, x: 198, y: 114 },
  { structure: BANYAN_GROVE, x: 168, y: 120 },
  // Deccan wilderness
  { structure: FOREST_MEDIUM, x: 138, y: 306 },
  { structure: ROCK_CLUSTER, x: 150, y: 336 },
  { structure: FOREST_SMALL, x: 108, y: 318 },
  // Vindhya range forests
  { structure: FOREST_LARGE, x: 132, y: 156 },
  { structure: FOREST_MEDIUM, x: 156, y: 156 },
];

// Unique landmark placements
const LANDMARK_PLACEMENTS: StructurePlacement[] = [
  // Delhi - Red Fort
  { structure: FORT_LARGE, x: 156, y: 84 },
  // Agra - Mughal Palace (Taj area)
  { structure: PALACE, x: 174, y: 114 },
  // Amber Fort (Jaipur)
  { structure: FORT_LARGE, x: 108, y: 132 },
  // Varanasi temples
  { structure: TEMPLE_LARGE, x: 216, y: 132 },
  // Hampi ruins
  { structure: RUINS_SITE, x: 123, y: 363 },
  { structure: TEMPLE_LARGE, x: 120, y: 360 },
  // Konark Sun Temple
  { structure: TEMPLE_LARGE, x: 267, y: 234 },
  // Madurai Temple
  { structure: TEMPLE_LARGE, x: 168, y: 450 },
  // Golconda Fort
  { structure: FORT_LARGE, x: 162, y: 312 },
  // Bodh Gaya temple
  { structure: TEMPLE_LARGE, x: 234, y: 156 },
  // Sanchi Stupa
  { structure: TEMPLE_LARGE, x: 144, y: 168 },
  // Khajuraho temples
  { structure: TEMPLE_LARGE, x: 168, y: 162 },
  // Tawang monastery
  { structure: TEMPLE_LARGE, x: 378, y: 162 },
  // Ancient ruins scattered
  { structure: RUINS_SITE, x: 54, y: 258 },
  { structure: RUINS_SITE, x: 180, y: 414 },
  { structure: RUINS_SITE, x: 84, y: 330 },
];

// Indo-Saracenic landmarks — Mughal architecture across India
const MUGHAL_PLACEMENTS: StructurePlacement[] = [
  // === DELHI — Imperial Capital ===
  { structure: RED_FORT, x: 159, y: 78 },
  { structure: JAMA_MASJID, x: 150, y: 78 },
  { structure: MUGHAL_DARWAZA, x: 156, y: 96 },
  { structure: CHARBAGH, x: 162, y: 96 },

  // === AGRA — Mughal Heartland ===
  { structure: MAUSOLEUM, x: 177, y: 108 },
  { structure: CHARBAGH, x: 177, y: 120 },
  { structure: RED_FORT, x: 168, y: 114 },

  // === RAJASTHAN — Desert Palaces ===
  { structure: DESERT_HAVELI, x: 102, y: 138 },
  { structure: DESERT_HAVELI, x: 114, y: 138 },
  { structure: CARAVANSERAI, x: 69, y: 120 },
  { structure: DESERT_HAVELI, x: 75, y: 144 },
  { structure: HAVELI, x: 81, y: 144 },
  { structure: CHHATRI_PAVILION, x: 87, y: 186 },
  { structure: CHHATRI_PAVILION, x: 93, y: 180 },
  { structure: MOSQUE_SMALL, x: 105, y: 150 },
  { structure: BAORI, x: 99, y: 147 },

  // === UP — Mughal Core ===
  { structure: MOSQUE_SMALL, x: 189, y: 126 },
  { structure: CHHATRI_PAVILION, x: 222, y: 138 },
  { structure: MOSQUE_SMALL, x: 207, y: 120 },
  { structure: CARAVANSERAI, x: 213, y: 117 },

  // === CENTRAL INDIA ===
  { structure: JAMA_MASJID, x: 147, y: 180 },
  { structure: BAORI, x: 156, y: 180 },
  { structure: MUGHAL_DARWAZA, x: 156, y: 132 },

  // === DECCAN ===
  { structure: BAORI, x: 168, y: 318 },
  { structure: MAUSOLEUM, x: 111, y: 342 },
  { structure: MUGHAL_DARWAZA, x: 117, y: 288 },

  // === SOUTH ===
  { structure: CHARBAGH, x: 129, y: 396 },
  { structure: CHHATRI_PAVILION, x: 171, y: 420 },

  // === BENGAL & EAST ===
  { structure: MOSQUE_SMALL, x: 261, y: 162 },
  { structure: HAVELI, x: 261, y: 180 },

  // === BORDER CHECKPOINTS ===
  { structure: BORDER_CHECKPOINT, x: 102, y: 114 },   // Rajasthan entry from Punjab
  { structure: BORDER_CHECKPOINT, x: 222, y: 144 },   // Bihar entry from UP
  { structure: BORDER_CHECKPOINT, x: 138, y: 210 },   // MP to Chhattisgarh
  { structure: BORDER_CHECKPOINT, x: 108, y: 270 },   // Maharashtra entry
  { structure: BORDER_CHECKPOINT, x: 306, y: 162 },   // Assam entry
  { structure: BORDER_CHECKPOINT, x: 144, y: 378 },   // Karnataka to Kerala
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
      if (dist > 45 && dist < 120) {
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
  return minDist < 45 ? closest : null;
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
export const PLAYER_START = { x: 150, y: 108 };

// === NPCs ===

// Hand-crafted story NPCs with social identities
const STORY_NPCS: NPC[] = [
  {
    id: 'delhi-advisor', name: 'Vizier Mirza',
    position: { x: 162, y: 90 }, direction: 'down', behavior: 'guard',
    dialog: ['Welcome to Shahjahanabad, traveler!', 'You stand in the heart of the Mughal Empire.'],
    dialogTreeId: 'quest_vizier_mission',
    settlement: 'Shahjahanabad',
    social: { title: 'Vizier', socialClass: 'noble', zatRank: 5000, faction: 'Mughal Court' },
  },
  {
    id: 'delhi-merchant', name: 'Merchant Fatima',
    position: { x: 150, y: 87 }, direction: 'right', behavior: 'scheduled', wanderRadius: 3,
    dialog: ['The finest silks and spices from across Hindustan!', 'You look like you could use some supplies.', 'The road ahead is long and full of danger.'],
    dialogTreeId: 'trader_intro',
    settlement: 'Shahjahanabad',
    social: { title: 'Trader', socialClass: 'merchant' },
    schedule: [
      { startHour: 7, endHour: 18, position: { x: 150, y: 87 }, behavior: 'wander', dialog: 'Welcome! Browse my wares.' },
      { startHour: 18, endHour: 7, position: { x: 155, y: 90 }, behavior: 'stationary', dialog: 'The bazaar is closed. Come back tomorrow.' },
    ],
  },
  {
    id: 'agra-merchant', name: 'Merchant Ratan',
    position: { x: 180, y: 114 }, direction: 'left', behavior: 'wander', wanderRadius: 4,
    dialog: ['Ah, you have come to Agra!', 'The grand monument stands nearby.'],
    dialogTreeId: 'quest_agra_merchant',
    settlement: 'Agra',
    social: { title: 'Trader', socialClass: 'merchant' },
  },
  {
    id: 'jaipur-guard', name: 'Rajput Vikram',
    position: { x: 114, y: 132 }, direction: 'right', behavior: 'guard',
    dialog: ['Halt! You enter Amber, seat of the Rajput kings.', 'We Rajputs have defended this land for centuries.'],
    dialogTreeId: 'quest_rajput_alliance',
    settlement: 'Amber',
    social: { title: 'Risaldar', socialClass: 'soldier', zatRank: 200, faction: 'Rajput Alliance' },
  },
  {
    id: 'varanasi-scholar', name: 'Pandit Sharma',
    position: { x: 222, y: 132 }, direction: 'down', behavior: 'stationary',
    dialog: ['Namaste! Welcome to Kashi, the eternal city.', 'This is the holiest of places on the Ganga.', 'Scholars from across the land come here to learn.'],
    dialogTreeId: 'sage_intro',
    settlement: 'Varanasi',
    social: { title: 'Pandit', socialClass: 'priest' },
  },
  {
    id: 'lucknow-poet', name: 'Poet Wajid',
    position: { x: 195, y: 123 }, direction: 'left', behavior: 'wander', wanderRadius: 3,
    dialog: ['Ah, the city of nawabs and poetry!', 'In Lucknow, even the stones speak in verse.', 'Have you heard the tale of the phantom of the fort?'],
    settlement: 'Lucknow',
    social: { title: 'Danishmand', socialClass: 'scholar' },
  },
  {
    id: 'guwahati-sage', name: 'Sage Bhupen',
    position: { x: 324, y: 168 }, direction: 'down', behavior: 'stationary',
    dialog: ['You have traveled far to reach Assam, friend.', 'The Brahmaputra is our lifeline.', 'The hills of the northeast hide ancient kingdoms.'],
    dialogTreeId: 'sage_intro',
    settlement: 'Guwahati',
    social: { title: 'Sant', socialClass: 'priest' },
  },
  {
    id: 'hampi-priest', name: 'Priest Vidyaranya',
    position: { x: 126, y: 360 }, direction: 'down', behavior: 'stationary',
    dialog: ['Welcome to Hampi, jewel of the Vijayanagara Empire!', 'These temples were built by great kings.', 'Seek the ruins... they hold treasures of a lost age.'],
    dialogTreeId: 'sage_intro',
    settlement: 'Hampi',
    social: { title: 'Pandit', socialClass: 'priest' },
  },
  {
    id: 'kozhikode-trader', name: 'Trader Ibrahim',
    position: { x: 138, y: 438 }, direction: 'right', behavior: 'wander', wanderRadius: 4,
    dialog: ['Ahlan! Welcome to Kozhikode, the spice coast!', 'Ships come from Arabia, Persia, and even Cathay.', 'Pepper, cardamom, cinnamon... Kerala has it all.'],
    dialogTreeId: 'trader_intro',
    settlement: 'Kozhikode',
    social: { title: 'Caravan Master', socialClass: 'merchant' },
  },
  {
    id: 'mumbai-captain', name: 'Captain Raje',
    position: { x: 87, y: 297 }, direction: 'down', behavior: 'guard',
    dialog: ['This is the port of Mumbai, gateway to the west.', 'Ships from Portugal dock here daily.', 'The Marathas control these waters now.'],
    settlement: 'Mumbai',
    social: { title: 'Qiladar', socialClass: 'soldier', zatRank: 500, faction: 'Maratha Confederacy' },
  },
  {
    id: 'madurai-priestess', name: 'Priestess Meenakshi',
    position: { x: 174, y: 450 }, direction: 'down', behavior: 'stationary',
    dialog: ['Blessings upon you, traveler from the north.', 'The great Meenakshi temple watches over this city.', 'Seek the shore temples if you wish to see our heritage.'],
    dialogTreeId: 'sage_intro',
    settlement: 'Madurai',
    social: { title: 'Swami', socialClass: 'priest' },
  },
  {
    id: 'jodhpur-warrior', name: 'Warrior Rao',
    position: { x: 81, y: 153 }, direction: 'right', behavior: 'wander', wanderRadius: 3,
    dialog: ['The Blue City welcomes you, stranger.', 'In these deserts, water is more precious than gold.', 'Beware the sand scorpions!'],
    dialogTreeId: 'guard_intro',
    settlement: 'Jodhpur',
    social: { title: 'Sipahi', socialClass: 'soldier', zatRank: 100 },
  },
  {
    id: 'bhopal-alchemist', name: 'Alchemist Hakim',
    position: { x: 153, y: 177 }, direction: 'left', behavior: 'wander', wanderRadius: 2,
    dialog: ['I study the ancient sciences of healing...', 'The forests of Madhya Pradesh are full of rare herbs.', 'Bring me ingredients and I can brew powerful remedies.'],
    settlement: 'Bhopal',
    social: { title: 'Hakim', socialClass: 'scholar' },
  },
  {
    id: 'delhi-elder', name: 'Village Elder Hari',
    position: { x: 159, y: 96 }, direction: 'down', behavior: 'stationary',
    dialog: ['The villages around Delhi need your help.', 'Bandits grow bolder each day.'],
    dialogTreeId: 'elder_intro',
    settlement: 'Shahjahanabad',
    social: { title: 'Zamindar', socialClass: 'noble', zatRank: 100 },
  },
  // === QUEST NPCs ===
  {
    id: 'mathura-elder', name: 'Elder Devrath',
    position: { x: 152, y: 108 }, direction: 'down', behavior: 'stationary',
    dialog: ['Welcome, child. Speak with me when you are ready.', 'These are troubled times for our village.'],
    dialogTreeId: 'quest_elder_start',
    settlement: 'Mathura',
    social: { title: 'Zamindar', socialClass: 'noble', zatRank: 50 },
  },
  {
    id: 'mathura-mentor', name: 'Guru Arjun',
    position: { x: 155, y: 111 }, direction: 'left', behavior: 'stationary',
    dialog: ['I sit here beneath the banyan, waiting.', 'Come back when you have found what you seek.'],
    dialogTreeId: 'quest_mentor_intro',
    settlement: 'Mathura',
    social: { title: 'Mansabdar', socialClass: 'noble', zatRank: 2000, faction: 'Retired' },
  },
  {
    id: 'mathura-villager1', name: 'Farmer Gopal',
    position: { x: 149, y: 107 }, direction: 'right', behavior: 'wander', wanderRadius: 2,
    dialog: ['The construction workers found something strange south of here.', 'I do not like it... bad omens.'],
    settlement: 'Mathura',
    social: { title: 'Farmer', socialClass: 'peasant' },
  },
  {
    id: 'mathura-villager2', name: 'Kamla',
    position: { x: 147, y: 110 }, direction: 'down', behavior: 'wander', wanderRadius: 3,
    dialog: ['Be careful if you go south.', 'I heard bandits have been lurking near the dig site.'],
    settlement: 'Mathura',
    social: { title: 'Weaver', socialClass: 'artisan' },
  },

  // === EXPANDED NPCs: every settlement gets life ===

  // -- Agra --
  {
    id: 'agra-guard', name: 'Fort Guard Salim',
    position: { x: 171, y: 114 }, direction: 'right', behavior: 'guard',
    dialog: ['The fort is sealed by imperial decree.', 'Only those with the Fort Seal may enter.'],
    settlement: 'Agra',
    social: { title: 'Sipahi', socialClass: 'soldier', zatRank: 100 },
  },
  {
    id: 'agra-scholar', name: 'Astronomer Zafar',
    position: { x: 177, y: 120 }, direction: 'down', behavior: 'stationary',
    dialog: ['The stars foretell great upheaval.', 'The Charbagh gardens encode celestial mathematics.'],
    settlement: 'Agra',
    social: { title: 'Munajjim', socialClass: 'scholar' },
  },

  // -- Lucknow --
  {
    id: 'lucknow-merchant', name: 'Perfumer Nasreen',
    position: { x: 192, y: 123 }, direction: 'left', behavior: 'wander', wanderRadius: 2,
    dialog: ['Lucknow is famous for its attar!', 'Rose, jasmine, sandalwood... name your fragrance.'],
    settlement: 'Lucknow',
    social: { title: 'Attarwala', socialClass: 'merchant' },
    shopItems: ['sandalwood_balm', 'camphor_incense', 'tulsi_elixir'],
  },

  // -- Varanasi --
  {
    id: 'varanasi-boatman', name: 'Boatman Kedar',
    position: { x: 219, y: 135 }, direction: 'down', behavior: 'stationary',
    dialog: ['I ferry pilgrims across the sacred Ganga.', 'For a token, I could take you across the flooded lands to the east.'],
    settlement: 'Varanasi',
    social: { title: 'Mallah', socialClass: 'peasant' },
    shopItems: ['boat_token'],
  },

  // -- Pataliputra --
  {
    id: 'pataliputra-guard', name: 'Captain Ashoka',
    position: { x: 237, y: 144 }, direction: 'left', behavior: 'guard',
    dialog: ['Pataliputra was once the greatest city in the world.', 'Now it guards the gate to the east.'],
    settlement: 'Pataliputra',
    social: { title: 'Qiladar', socialClass: 'soldier', zatRank: 200 },
  },
  {
    id: 'pataliputra-monk', name: 'Monk Nalanda',
    position: { x: 231, y: 147 }, direction: 'down', behavior: 'stationary',
    dialog: ['The old university once drew scholars from across the world.', 'Knowledge is the greatest treasure.'],
    settlement: 'Pataliputra',
    social: { title: 'Bhikshu', socialClass: 'priest' },
  },

  // -- Amber --
  {
    id: 'amber-merchant', name: 'Jeweler Lakshmi',
    position: { x: 111, y: 135 }, direction: 'right', behavior: 'wander', wanderRadius: 2,
    dialog: ['Rajputana gems, the finest in Hindustan!', 'Diamonds from Golconda, rubies from Burma...'],
    settlement: 'Amber',
    social: { title: 'Sahukar', socialClass: 'merchant' },
    shopItems: ['jade_amulet', 'bazuband', 'sharpening_stone'],
  },
  {
    id: 'amber-blacksmith', name: 'Blacksmith Karan',
    position: { x: 105, y: 132 }, direction: 'down', behavior: 'stationary',
    dialog: ['I forge the finest Rajput steel.', 'Bring me materials and I can craft weapons of legend.'],
    settlement: 'Amber',
    social: { title: 'Lohar', socialClass: 'artisan' },
    shopItems: ['iron_talwar', 'katara', 'iron_pickaxe', 'dhal_shield'],
  },

  // -- Jodhpur --
  {
    id: 'jodhpur-child', name: 'Priya',
    position: { x: 78, y: 147 }, direction: 'right', behavior: 'wander', wanderRadius: 4,
    dialog: ['Have you seen the blue houses?', 'They say the color keeps scorpions away!'],
    settlement: 'Jodhpur',
    social: { title: 'Child', socialClass: 'peasant' },
  },

  // -- Jaisalmer --
  {
    id: 'jaisalmer-guide', name: 'Desert Guide Bhati',
    position: { x: 69, y: 126 }, direction: 'down', behavior: 'stationary',
    dialog: ['The deep desert is treacherous without a compass.', 'I can sell you one — it will save your life.'],
    settlement: 'Jaisalmer',
    social: { title: 'Rahdari', socialClass: 'merchant' },
    shopItems: ['desert_compass', 'rope', 'healing_herb'],
  },

  // -- Bhopal --
  {
    id: 'bhopal-woodcutter', name: 'Woodcutter Ramu',
    position: { x: 147, y: 174 }, direction: 'right', behavior: 'wander', wanderRadius: 3,
    dialog: ['These forests are thick as a wall.', 'A good axe would cut right through fallen timber.'],
    settlement: 'Bhopal',
    social: { title: 'Lakadhari', socialClass: 'artisan' },
    shopItems: ['clearing_axe', 'rope', 'antidote_paste'],
  },

  // -- Gwalior --
  {
    id: 'gwalior-guard', name: 'Gatekeeper Singh',
    position: { x: 156, y: 135 }, direction: 'down', behavior: 'guard',
    dialog: ['Gwalior Fort watches over the Chambal.', 'Dacoits plague the ravines to the south.'],
    settlement: 'Gwalior',
    social: { title: 'Darban', socialClass: 'soldier', zatRank: 100 },
  },

  // -- Gaur (Bengal) --
  {
    id: 'gaur-historian', name: 'Chronicler Hasan',
    position: { x: 261, y: 168 }, direction: 'left', behavior: 'stationary',
    dialog: ['Gaur was the capital of Bengal sultans.', 'The ruins tell stories of past glory.'],
    settlement: 'Gaur',
    social: { title: 'Waqianawis', socialClass: 'scholar' },
  },

  // -- Puri --
  {
    id: 'puri-priest', name: 'Pujari Jagannath',
    position: { x: 267, y: 240 }, direction: 'down', behavior: 'stationary',
    dialog: ['Welcome to Puri, abode of Lord Jagannath!', 'The Rath Yatra chariot festival draws millions.'],
    settlement: 'Puri',
    social: { title: 'Pujari', socialClass: 'priest' },
  },

  // -- Ahmedabad --
  {
    id: 'ahmedabad-textile', name: 'Weaver Meera',
    position: { x: 57, y: 222 }, direction: 'right', behavior: 'wander', wanderRadius: 3,
    dialog: ['Gujarat textiles are prized across the world!', 'Silk, cotton, bandhani... all from our looms.'],
    settlement: 'Ahmedabad',
    social: { title: 'Julaha', socialClass: 'artisan' },
  },

  // -- Golconda --
  {
    id: 'golconda-miner', name: 'Diamond Cutter Ali',
    position: { x: 165, y: 312 }, direction: 'left', behavior: 'stationary',
    dialog: ['Golconda diamonds are the world\'s finest.', 'But the mines are haunted by ancient guardians now.'],
    settlement: 'Golconda',
    social: { title: 'Heera Kaat', socialClass: 'artisan' },
  },

  // -- Mysore --
  {
    id: 'mysore-general', name: 'Commander Haidar',
    position: { x: 129, y: 402 }, direction: 'down', behavior: 'guard',
    dialog: ['Mysore stands firm against all invaders.', 'Our kingdom has never been conquered.'],
    settlement: 'Mysore',
    social: { title: 'Bakshi', socialClass: 'soldier', zatRank: 1000, faction: 'Mysore Kingdom' },
  },

  // -- Shimla --
  {
    id: 'shimla-herbalist', name: 'Herbalist Devi',
    position: { x: 141, y: 48 }, direction: 'down', behavior: 'wander', wanderRadius: 2,
    dialog: ['The Himalayan herbs have extraordinary power.', 'Mountain flowers bloom with healing essence.'],
    settlement: 'Shimla',
    social: { title: 'Vaidya', socialClass: 'scholar' },
    shopItems: ['healing_herb', 'neem_potion', 'tulsi_elixir', 'antidote_paste'],
  },

  // -- Haridwar --
  {
    id: 'haridwar-sadhu', name: 'Sadhu Bhairav',
    position: { x: 189, y: 60 }, direction: 'down', behavior: 'stationary',
    dialog: ['The Ganga descends from heaven here.', 'A holy dip cleanses all sins.', 'I can sell you a strong rope for the mountain paths.'],
    settlement: 'Haridwar',
    social: { title: 'Sadhu', socialClass: 'priest' },
    shopItems: ['climbing_rope', 'camphor_incense', 'healing_herb'],
  },

  // -- Route NPCs (travelers) --
  {
    id: 'route-traveler-1', name: 'Wandering Sadhu',
    position: { x: 156, y: 93 }, direction: 'down', behavior: 'wander', wanderRadius: 3,
    dialog: ['The road to Delhi is safe, but watch for wild boars.', 'The tall grass hides creatures.'],
    settlement: 'Shahjahanabad',
    social: { title: 'Sadhu', socialClass: 'priest' },
  },
  {
    id: 'route-traveler-2', name: 'Merchant Caravan',
    position: { x: 120, y: 120 }, direction: 'right', behavior: 'wander', wanderRadius: 2,
    dialog: ['We are heading to Amber with silk from Delhi.', 'The desert road grows dangerous after sunset.'],
    settlement: 'Amber',
    social: { title: 'Trader', socialClass: 'merchant' },
  },
  {
    id: 'route-traveler-3', name: 'Pilgrim Devaki',
    position: { x: 204, y: 126 }, direction: 'left', behavior: 'wander', wanderRadius: 2,
    dialog: ['I walk to Varanasi for the holy festival.', 'The path along the Ganga is beautiful but perilous.'],
    settlement: 'Ayodhya',
    social: { title: 'Pilgrim', socialClass: 'peasant' },
  },
];

// === ANIMALS: ambient creatures placed across the world ===
const WORLD_ANIMALS: NPC[] = [
  // -- Farms near Delhi/Mathura --
  {
    id: 'animal-horse-1', name: '', position: { x: 156, y: 99 }, direction: 'down',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Shahjahanabad',
  },
  {
    id: 'animal-goat-1', name: '', position: { x: 146, y: 105 }, direction: 'right',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Mathura',
  },
  {
    id: 'animal-goose-1', name: '', position: { x: 150, y: 102 }, direction: 'left',
    behavior: 'wander', wanderRadius: 2, dialog: [], settlement: 'Mathura',
  },

  // -- Amber/Jaipur area --
  {
    id: 'animal-horse-2', name: '', position: { x: 108, y: 138 }, direction: 'right',
    behavior: 'wander', wanderRadius: 4, dialog: [], settlement: 'Amber',
  },
  {
    id: 'animal-goat-2', name: '', position: { x: 117, y: 129 }, direction: 'down',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Amber',
  },

  // -- Shimla / Himalayan foothills --
  {
    id: 'animal-goat-3', name: '', position: { x: 138, y: 54 }, direction: 'left',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Shimla',
  },
  {
    id: 'animal-goatling-1', name: '', position: { x: 144, y: 51 }, direction: 'down',
    behavior: 'wander', wanderRadius: 2, dialog: [], settlement: 'Shimla',
  },

  // -- Lucknow/Varanasi area --
  {
    id: 'animal-rabbit-1', name: '', position: { x: 198, y: 120 }, direction: 'down',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Lucknow',
  },
  {
    id: 'animal-goose-2', name: '', position: { x: 216, y: 138 }, direction: 'right',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Varanasi',
  },

  // -- Bhopal forests --
  {
    id: 'animal-rabbit-2', name: '', position: { x: 150, y: 180 }, direction: 'left',
    behavior: 'wander', wanderRadius: 4, dialog: [], settlement: 'Bhopal',
  },
  {
    id: 'animal-rabbit-3', name: '', position: { x: 144, y: 171 }, direction: 'right',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Bhopal',
  },

  // -- Guwahati / Northeast --
  {
    id: 'animal-goose-3', name: '', position: { x: 321, y: 171 }, direction: 'down',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Guwahati',
  },
  {
    id: 'animal-rabbit-4', name: '', position: { x: 327, y: 165 }, direction: 'left',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Guwahati',
  },

  // -- Hampi / Deccan plateau --
  {
    id: 'animal-goat-4', name: '', position: { x: 123, y: 357 }, direction: 'right',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Hampi',
  },

  // -- Ahmedabad / Gujarat --
  {
    id: 'animal-horse-3', name: '', position: { x: 60, y: 225 }, direction: 'down',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Ahmedabad',
  },
  {
    id: 'animal-goose-4', name: '', position: { x: 54, y: 219 }, direction: 'right',
    behavior: 'wander', wanderRadius: 2, dialog: [], settlement: 'Ahmedabad',
  },

  // -- Pataliputra --
  {
    id: 'animal-goat-5', name: '', position: { x: 234, y: 150 }, direction: 'down',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Pataliputra',
  },

  // -- Puri coast --
  {
    id: 'animal-goose-5', name: '', position: { x: 264, y: 237 }, direction: 'left',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Puri',
  },

  // -- Haridwar / Ganga foothills --
  {
    id: 'animal-goat-6', name: '', position: { x: 192, y: 63 }, direction: 'right',
    behavior: 'wander', wanderRadius: 3, dialog: [], settlement: 'Haridwar',
  },

  // -- Kozhikode coast --
  {
    id: 'animal-gosling-1', name: '', position: { x: 135, y: 435 }, direction: 'down',
    behavior: 'wander', wanderRadius: 2, dialog: [], settlement: 'Kozhikode',
  },
];

export const WORLD_NPCS: NPC[] = [...STORY_NPCS, ...WORLD_ANIMALS];

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
