// Zone definitions — each zone is a named area within the world map
// that has specific encounter rates, enemy pools, and a suggested level.
// Routes connect settlements like Pokemon routes.
// Wild zones are encounter-heavy areas.
// Landmarks are unique visitable areas.

import { ZoneDef, ObstacleDef, TileType, Position } from '../types';

// === ROUTE DEFINITIONS ===
// Routes are paths between settlements. Each route has waypoints.
// The map generator draws a 3-tile-wide path along these waypoints,
// with encounter grass (TALL_GRASS) on either side.

export interface RouteDef {
  id: string;
  name: string;
  waypoints: Position[];       // tile coordinates for the path
  pathTile: TileType;          // PATH_DIRT or PATH_STONE
  suggestedLevel: number;
  encounterRate: number;       // multiplier (1.0 = normal, 0.5 = half)
  enemyPool?: string[];        // specific enemy IDs (else biome default)
  encounterWidth: number;      // how many tiles of encounter grass on each side
  description: string;
}

// === HEARTLAND ROUTES (always accessible, levels 1-5) ===

export const ROUTES: RouteDef[] = [
  // --- Act I: Starting Area ---
  {
    id: 'route_mathura_delhi',
    name: 'Yamuna Road',
    description: 'The ancient road following the Yamuna river from Mathura to the capital.',
    waypoints: [
      { x: 150, y: 108 }, // Mathura
      { x: 152, y: 104 },
      { x: 155, y: 100 },
      { x: 158, y: 96 },
      { x: 157, y: 92 },
      { x: 156, y: 88 },
      { x: 156, y: 84 }, // Delhi
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 1,
    encounterRate: 0.8,
    enemyPool: ['wild_boar', 'cobra', 'thug'],
    encounterWidth: 4,
  },
  {
    id: 'route_mathura_agra',
    name: 'Grand Trunk South',
    description: 'The southern stretch of the Grand Trunk Road toward Agra.',
    waypoints: [
      { x: 150, y: 108 }, // Mathura
      { x: 156, y: 111 },
      { x: 162, y: 114 },
      { x: 168, y: 114 },
      { x: 174, y: 114 }, // Agra
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 2,
    encounterRate: 1.0,
    enemyPool: ['wild_boar', 'dacoit', 'cobra'],
    encounterWidth: 4,
  },
  {
    id: 'route_delhi_kurukshetra',
    name: 'Northern Highway',
    description: 'The road north from Delhi through the plains of Haryana.',
    waypoints: [
      { x: 156, y: 84 }, // Delhi
      { x: 150, y: 78 },
      { x: 144, y: 72 },
      { x: 140, y: 78 },
      { x: 136, y: 84 },
      { x: 132, y: 90 }, // Kurukshetra
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 2,
    encounterRate: 0.8,
    enemyPool: ['wild_boar', 'dacoit', 'thug'],
    encounterWidth: 3,
  },
  {
    id: 'route_delhi_panipat',
    name: 'Panipat Trail',
    description: 'A short trail from Delhi to the historic battlefield of Panipat.',
    waypoints: [
      { x: 156, y: 84 }, // Delhi
      { x: 150, y: 90 },
      { x: 144, y: 96 },
      { x: 138, y: 100 },
      { x: 132, y: 102 }, // Panipat
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 1,
    encounterRate: 0.6,
    encounterWidth: 3,
  },
  {
    id: 'route_agra_lucknow',
    name: 'Awadh Road',
    description: 'The long road east from Agra through the plains of Uttar Pradesh.',
    waypoints: [
      { x: 174, y: 114 }, // Agra
      { x: 180, y: 117 },
      { x: 184, y: 118 },
      { x: 188, y: 119 },
      { x: 192, y: 120 }, // Lucknow
    ],
    pathTile: TileType.PATH_STONE,
    suggestedLevel: 3,
    encounterRate: 1.0,
    enemyPool: ['dacoit', 'cobra', 'churel'],
    encounterWidth: 4,
  },
  {
    id: 'route_lucknow_varanasi',
    name: 'Ganga Trail',
    description: 'Following the sacred Ganga east toward the holy city.',
    waypoints: [
      { x: 192, y: 120 }, // Lucknow
      { x: 198, y: 123 },
      { x: 204, y: 126 }, // Ayodhya
      { x: 208, y: 128 },
      { x: 212, y: 130 },
      { x: 216, y: 132 }, // Varanasi
    ],
    pathTile: TileType.PATH_STONE,
    suggestedLevel: 4,
    encounterRate: 1.0,
    enemyPool: ['dacoit', 'cobra', 'naga_spirit', 'churel'],
    encounterWidth: 4,
  },
  {
    id: 'route_kurukshetra_amritsar',
    name: 'Punjab Road',
    description: 'The road west through the fertile plains of Punjab.',
    waypoints: [
      { x: 132, y: 90 }, // Kurukshetra
      { x: 126, y: 84 },
      { x: 120, y: 78 },
      { x: 114, y: 72 }, // Amritsar
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 3,
    encounterRate: 0.8,
    enemyPool: ['dacoit', 'wild_boar'],
    encounterWidth: 3,
  },

  // --- Himalayan Routes ---
  {
    id: 'route_amritsar_shimla',
    name: 'Himalayan Ascent',
    description: 'A winding mountain path rising into the Himalayas.',
    waypoints: [
      { x: 114, y: 72 }, // Amritsar
      { x: 118, y: 66 },
      { x: 124, y: 60 },
      { x: 130, y: 54 },
      { x: 134, y: 50 },
      { x: 138, y: 48 }, // Shimla
    ],
    pathTile: TileType.ROCKY_PATH,
    suggestedLevel: 5,
    encounterRate: 1.2,
    enemyPool: ['snow_leopard', 'mountain_yak', 'garuda'],
    encounterWidth: 2,
  },
  {
    id: 'route_shimla_haridwar',
    name: 'Deodar Pass',
    description: 'A mountain trail through ancient deodar forests.',
    waypoints: [
      { x: 138, y: 48 }, // Shimla
      { x: 150, y: 48 },
      { x: 158, y: 50 },
      { x: 166, y: 54 },
      { x: 174, y: 56 },
      { x: 186, y: 60 }, // Haridwar
    ],
    pathTile: TileType.ROCKY_PATH,
    suggestedLevel: 5,
    encounterRate: 1.0,
    enemyPool: ['snow_leopard', 'mountain_yak', 'forest_wolf'],
    encounterWidth: 2,
  },

  // --- Rajasthan Routes (Act II, levels 5-8) ---
  {
    id: 'route_delhi_amber',
    name: 'Rajput Road',
    description: 'The great road southwest into the desert kingdom of Rajputana.',
    waypoints: [
      { x: 156, y: 84 }, // Delhi
      { x: 148, y: 90 },
      { x: 140, y: 96 },
      { x: 132, y: 102 }, // Panipat
      { x: 126, y: 108 },
      { x: 120, y: 114 },
      { x: 114, y: 120 },
      { x: 110, y: 126 },
      { x: 108, y: 132 }, // Amber
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 5,
    encounterRate: 1.0,
    enemyPool: ['desert_bandit', 'sand_scorpion', 'dacoit'],
    encounterWidth: 4,
  },
  {
    id: 'route_amber_jodhpur',
    name: 'Thar Trail',
    description: 'A desert trail through the heart of the Thar Desert.',
    waypoints: [
      { x: 108, y: 132 }, // Amber
      { x: 102, y: 138 },
      { x: 96, y: 144 },
      { x: 90, y: 148 },
      { x: 84, y: 150 },
      { x: 78, y: 150 }, // Jodhpur
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 6,
    encounterRate: 1.2,
    enemyPool: ['desert_bandit', 'sand_scorpion', 'dust_djinn'],
    encounterWidth: 3,
  },
  {
    id: 'route_jodhpur_jaisalmer',
    name: 'Desert Passage',
    description: 'Deep into the vast Thar Desert toward the golden city.',
    waypoints: [
      { x: 78, y: 150 }, // Jodhpur
      { x: 72, y: 144 },
      { x: 72, y: 138 },
      { x: 72, y: 132 },
      { x: 68, y: 128 },
      { x: 66, y: 126 }, // Jaisalmer
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 7,
    encounterRate: 1.5,
    enemyPool: ['desert_bandit', 'sand_scorpion', 'dust_djinn', 'vetala'],
    encounterWidth: 3,
  },
  {
    id: 'route_amber_udaipur',
    name: 'Aravalli Trail',
    description: 'A scenic route through the Aravalli hills to the lake city.',
    waypoints: [
      { x: 108, y: 132 }, // Amber
      { x: 104, y: 140 },
      { x: 102, y: 144 }, // Pushkar
      { x: 98, y: 152 },
      { x: 96, y: 162 },
      { x: 93, y: 172 },
      { x: 90, y: 180 }, // Udaipur
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 6,
    encounterRate: 1.0,
    enemyPool: ['desert_bandit', 'dacoit', 'sand_scorpion'],
    encounterWidth: 3,
  },

  // --- Central India / Madhya Pradesh (Act II, levels 6-9) ---
  {
    id: 'route_agra_gwalior',
    name: 'Chambal Valley Road',
    description: 'Through the rugged Chambal badlands, notorious for dacoits.',
    waypoints: [
      { x: 174, y: 114 }, // Agra
      { x: 168, y: 120 },
      { x: 162, y: 126 },
      { x: 158, y: 132 },
      { x: 156, y: 135 },
      { x: 156, y: 138 }, // Gwalior
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 6,
    encounterRate: 1.3,
    enemyPool: ['dacoit', 'tribal_warrior', 'cobra'],
    encounterWidth: 4,
  },
  {
    id: 'route_gwalior_bhopal',
    name: 'Vindhya Road',
    description: 'Through the Vindhya range into the forested heart of India.',
    waypoints: [
      { x: 156, y: 138 }, // Gwalior
      { x: 150, y: 150 },
      { x: 146, y: 156 },
      { x: 144, y: 162 },
      { x: 144, y: 168 }, // Sanchi
      { x: 148, y: 172 },
      { x: 150, y: 174 }, // Bhopal
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 7,
    encounterRate: 1.2,
    enemyPool: ['forest_wolf', 'tribal_warrior', 'naga_spirit', 'nishi'],
    encounterWidth: 4,
  },

  // --- Bihar & Bengal (post-Asura, levels 7-10) ---
  {
    id: 'route_varanasi_pataliputra',
    name: 'Magadha Road',
    description: 'The ancient road to Pataliputra, heart of old Magadha.',
    waypoints: [
      { x: 216, y: 132 }, // Varanasi
      { x: 222, y: 138 },
      { x: 228, y: 142 },
      { x: 232, y: 144 },
      { x: 234, y: 144 }, // Pataliputra
    ],
    pathTile: TileType.PATH_STONE,
    suggestedLevel: 7,
    encounterRate: 1.0,
    enemyPool: ['dacoit', 'cobra', 'mughal_guard', 'churel'],
    encounterWidth: 4,
  },
  {
    id: 'route_pataliputra_gaur',
    name: 'Bengal Road',
    description: 'Eastward through the Gangetic plains to the old capital of Bengal.',
    waypoints: [
      { x: 234, y: 144 }, // Pataliputra
      { x: 240, y: 150 },
      { x: 246, y: 156 },
      { x: 252, y: 162 },
      { x: 256, y: 166 },
      { x: 258, y: 168 }, // Gaur
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 8,
    encounterRate: 1.0,
    enemyPool: ['mugger_croc', 'cobra', 'dacoit', 'nishi'],
    encounterWidth: 4,
  },

  // --- Gujarat (Act II, levels 6-8) ---
  {
    id: 'route_udaipur_ahmedabad',
    name: 'Gujarat Road',
    description: 'Southwest from Udaipur through arid scrubland to Ahmedabad.',
    waypoints: [
      { x: 90, y: 180 }, // Udaipur
      { x: 78, y: 192 },
      { x: 66, y: 204 },
      { x: 60, y: 214 },
      { x: 56, y: 220 },
      { x: 54, y: 222 }, // Ahmedabad
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 6,
    encounterRate: 1.0,
    enemyPool: ['desert_bandit', 'sand_scorpion', 'dacoit'],
    encounterWidth: 3,
  },

  // --- Maharashtra / Deccan (Act II-III, levels 8-11) ---
  {
    id: 'route_bhopal_aurangabad',
    name: 'Deccan Highway',
    description: 'South through the forests of central India to the Deccan plateau.',
    waypoints: [
      { x: 150, y: 174 }, // Bhopal
      { x: 144, y: 192 },
      { x: 138, y: 204 },
      { x: 132, y: 216 },
      { x: 126, y: 234 },
      { x: 120, y: 258 },
      { x: 116, y: 276 },
      { x: 114, y: 282 }, // Aurangabad
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 8,
    encounterRate: 1.2,
    enemyPool: ['tribal_warrior', 'forest_wolf', 'rock_golem', 'nishi'],
    encounterWidth: 4,
  },
  {
    id: 'route_aurangabad_mumbai',
    name: 'Western Ghat Pass',
    description: 'Down through the Western Ghats to the port city.',
    waypoints: [
      { x: 114, y: 282 }, // Aurangabad
      { x: 102, y: 288 },
      { x: 92, y: 294 },
      { x: 84, y: 294 }, // Mumbai
    ],
    pathTile: TileType.PATH_STONE,
    suggestedLevel: 9,
    encounterRate: 1.0,
    enemyPool: ['rock_golem', 'pirate', 'dacoit'],
    encounterWidth: 3,
  },

  // --- South India (Act III, levels 9-13) ---
  {
    id: 'route_golconda_hampi',
    name: 'Deccan Plateau Road',
    description: 'South through the Deccan plateau from Golconda to the ruins of Hampi.',
    waypoints: [
      { x: 162, y: 312 }, // Golconda
      { x: 150, y: 324 },
      { x: 138, y: 336 },
      { x: 126, y: 348 },
      { x: 122, y: 354 },
      { x: 120, y: 360 }, // Hampi
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 9,
    encounterRate: 1.2,
    enemyPool: ['rock_golem', 'bhoota_sentinel', 'naga_spirit', 'vetala'],
    encounterWidth: 4,
  },
  {
    id: 'route_hampi_mysore',
    name: 'Vijayanagara Road',
    description: 'Through the remnants of the great Vijayanagara empire.',
    waypoints: [
      { x: 120, y: 360 }, // Hampi
      { x: 122, y: 370 },
      { x: 124, y: 378 },
      { x: 126, y: 390 },
      { x: 126, y: 396 },
      { x: 126, y: 402 }, // Mysore
    ],
    pathTile: TileType.PATH_STONE,
    suggestedLevel: 10,
    encounterRate: 1.0,
    enemyPool: ['yali', 'bhoota_sentinel', 'naga_spirit'],
    encounterWidth: 4,
  },
  {
    id: 'route_mysore_kozhikode',
    name: 'Malabar Pass',
    description: 'Through the Western Ghats to the spice coast of Kerala.',
    waypoints: [
      { x: 126, y: 402 }, // Mysore
      { x: 128, y: 410 },
      { x: 130, y: 420 },
      { x: 131, y: 430 },
      { x: 132, y: 438 }, // Kozhikode
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 10,
    encounterRate: 1.0,
    enemyPool: ['jungle_cat', 'forest_wolf', 'makara', 'naga_spirit'],
    encounterWidth: 3,
  },
  {
    id: 'route_kozhikode_kochi',
    name: 'Spice Coast Road',
    description: 'Along the lush Kerala coast, fragrant with spices.',
    waypoints: [
      { x: 132, y: 438 }, // Kozhikode
      { x: 132, y: 450 },
      { x: 132, y: 462 }, // Kochi
    ],
    pathTile: TileType.PATH_STONE,
    suggestedLevel: 10,
    encounterRate: 0.6,
    enemyPool: ['pirate', 'makara'],
    encounterWidth: 3,
  },
  {
    id: 'route_hampi_madurai',
    name: 'Tamil Road',
    description: 'The long road south through the Tamil plains.',
    waypoints: [
      { x: 120, y: 360 }, // Hampi
      { x: 132, y: 372 },
      { x: 142, y: 382 },
      { x: 152, y: 396 },
      { x: 158, y: 408 },
      { x: 162, y: 420 },
      { x: 166, y: 438 },
      { x: 168, y: 450 }, // Madurai
    ],
    pathTile: TileType.PATH_STONE,
    suggestedLevel: 11,
    encounterRate: 1.0,
    enemyPool: ['yali', 'naga_spirit', 'bhoota_sentinel'],
    encounterWidth: 4,
  },

  // --- Northeast (Act III, levels 10-13) ---
  {
    id: 'route_pataliputra_guwahati',
    name: 'Northeast Passage',
    description: 'Through the narrow corridor to the hills of the northeast.',
    waypoints: [
      { x: 234, y: 144 }, // Pataliputra
      { x: 252, y: 150 },
      { x: 270, y: 156 },
      { x: 288, y: 160 },
      { x: 300, y: 164 },
      { x: 318, y: 168 }, // Guwahati
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 10,
    encounterRate: 1.3,
    enemyPool: ['mugger_croc', 'jungle_cat', 'pishacha', 'nishi'],
    encounterWidth: 3,
  },

  // --- Odisha coastal route ---
  {
    id: 'route_gaur_puri',
    name: 'Eastern Coast Road',
    description: 'South along the Bay of Bengal coast.',
    waypoints: [
      { x: 258, y: 168 }, // Gaur
      { x: 258, y: 180 }, // Murshidabad
      { x: 258, y: 192 },
      { x: 260, y: 204 },
      { x: 260, y: 216 },
      { x: 258, y: 228 }, // Bhubaneswar
      { x: 264, y: 240 }, // Puri
    ],
    pathTile: TileType.PATH_DIRT,
    suggestedLevel: 8,
    encounterRate: 1.0,
    enemyPool: ['pirate', 'mugger_croc', 'makara'],
    encounterWidth: 3,
  },

  // --- Telangana / Andhra ---
  {
    id: 'route_aurangabad_golconda',
    name: 'Golconda Road',
    description: 'East through the Deccan to the diamond city.',
    waypoints: [
      { x: 114, y: 282 }, // Aurangabad
      { x: 126, y: 294 },
      { x: 138, y: 300 },
      { x: 150, y: 306 },
      { x: 158, y: 310 },
      { x: 162, y: 312 }, // Golconda
    ],
    pathTile: TileType.PATH_STONE,
    suggestedLevel: 9,
    encounterRate: 1.0,
    enemyPool: ['rock_golem', 'bhoota_sentinel', 'dacoit'],
    encounterWidth: 4,
  },
];

// === SUB-ZONE DEFINITIONS ===
// Small hand-designed areas with unique character

export interface SubZoneDef {
  id: string;
  name: string;
  center: Position;
  radius: number;
  type: 'training_ground' | 'oasis' | 'sacred_grove' | 'mountain_pass' | 'cliff_lookout' |
        'bandit_camp' | 'ancient_ruins' | 'fishing_village' | 'caravan_rest' | 'border_fort' |
        'haunted_grounds' | 'hot_springs';
  suggestedLevel: number;
  encounterRate: number;
  enemyPool?: string[];
  description: string;
}

export const SUB_ZONES: SubZoneDef[] = [
  // --- Starting Area ---
  {
    id: 'mathura_training',
    name: 'Training Grounds',
    center: { x: 153, y: 117 },
    radius: 8,
    type: 'training_ground',
    suggestedLevel: 1,
    encounterRate: 1.5,
    enemyPool: ['wild_boar', 'cobra'],
    description: 'The construction site where the Talwar was found. Good for early training.',
  },
  {
    id: 'yamuna_grove',
    name: 'Yamuna Sacred Grove',
    center: { x: 162, y: 102 },
    radius: 6,
    type: 'sacred_grove',
    suggestedLevel: 2,
    encounterRate: 0.5,
    description: 'A peaceful grove along the Yamuna. Fewer creatures disturb this sacred place.',
  },

  // --- Rajasthan ---
  {
    id: 'thar_oasis',
    name: 'Desert Oasis',
    center: { x: 72, y: 138 },
    radius: 8,
    type: 'oasis',
    suggestedLevel: 6,
    encounterRate: 0.3,
    description: 'A rare green haven in the Thar Desert. Travelers rest here before the long crossing.',
  },
  {
    id: 'chambal_bandit_camp',
    name: 'Chambal Ravines',
    center: { x: 162, y: 126 },
    radius: 9,
    type: 'bandit_camp',
    suggestedLevel: 6,
    encounterRate: 2.0,
    enemyPool: ['dacoit', 'thug', 'desert_bandit'],
    description: 'The notorious Chambal ravines, infamous hideout of dacoits.',
  },

  // --- Mountain ---
  {
    id: 'himalayan_hot_springs',
    name: 'Mountain Hot Springs',
    center: { x: 180, y: 48 },
    radius: 6,
    type: 'hot_springs',
    suggestedLevel: 5,
    encounterRate: 0.2,
    description: 'Natural hot springs high in the mountains. A place of healing.',
  },

  // --- Central India ---
  {
    id: 'sanchi_sacred',
    name: 'Sanchi Monastery Grounds',
    center: { x: 144, y: 168 },
    radius: 8,
    type: 'sacred_grove',
    suggestedLevel: 7,
    encounterRate: 0.3,
    description: 'The peaceful grounds around the ancient Sanchi stupas.',
  },
  {
    id: 'bastar_tribal',
    name: 'Bastar Tribal Lands',
    center: { x: 198, y: 234 },
    radius: 12,
    type: 'ancient_ruins',
    suggestedLevel: 8,
    encounterRate: 1.8,
    enemyPool: ['tribal_warrior', 'jungle_cat', 'nishi', 'pishacha'],
    description: 'Dense jungles of Bastar where ancient tribal warriors defend their sacred lands.',
  },

  // --- South ---
  {
    id: 'hampi_ruins_zone',
    name: 'Vijayanagara Ruins',
    center: { x: 123, y: 363 },
    radius: 12,
    type: 'ancient_ruins',
    suggestedLevel: 9,
    encounterRate: 1.5,
    enemyPool: ['bhoota_sentinel', 'bhoota_chariot', 'vetala', 'rock_golem'],
    description: 'The vast ruined city of Vijayanagara, haunted by ancient guardian automatons.',
  },
  {
    id: 'rameswaram_sacred',
    name: 'Rameswaram Shore',
    center: { x: 174, y: 462 },
    radius: 8,
    type: 'sacred_grove',
    suggestedLevel: 11,
    encounterRate: 0.4,
    enemyPool: ['naga_king'],
    description: 'The sacred shore where land meets the infinite sea. Naga spirits guard this holy place.',
  },

  // --- Northeast ---
  {
    id: 'sundarbans_haunted',
    name: 'Sundarban Mangroves',
    center: { x: 264, y: 195 },
    radius: 9,
    type: 'haunted_grounds',
    suggestedLevel: 9,
    encounterRate: 2.0,
    enemyPool: ['mugger_croc', 'nishi', 'pishacha', 'makara'],
    description: 'The treacherous Sundarban mangrove forest. Many enter; few return.',
  },
  {
    id: 'tawang_monastery',
    name: 'Tawang Monastery Grounds',
    center: { x: 378, y: 162 },
    radius: 6,
    type: 'sacred_grove',
    suggestedLevel: 11,
    encounterRate: 0.2,
    description: 'The serene grounds of the ancient Tawang monastery, high in the mountains.',
  },

  // --- Deccan ---
  {
    id: 'golconda_mines',
    name: 'Golconda Diamond Mines',
    center: { x: 168, y: 318 },
    radius: 8,
    type: 'ancient_ruins',
    suggestedLevel: 9,
    encounterRate: 1.5,
    enemyPool: ['bhoota_sentinel', 'rock_golem', 'vetala'],
    description: 'The famous diamond mines, now infested with ancient guardians.',
  },

  // --- New Wilderness Sub-Zones ---
  {
    id: 'vindhya_wilds',
    name: 'Vindhya Wilderness',
    center: { x: 150, y: 156 },
    radius: 10,
    type: 'bandit_camp',
    suggestedLevel: 6,
    encounterRate: 1.5,
    enemyPool: ['forest_wolf', 'tribal_warrior', 'cobra'],
    description: 'Dense forests of the Vindhya range, home to wolves and tribal warriors.',
  },
  {
    id: 'thar_deep_desert',
    name: 'Deep Thar Wastes',
    center: { x: 72, y: 150 },
    radius: 10,
    type: 'ancient_ruins',
    suggestedLevel: 7,
    encounterRate: 1.8,
    enemyPool: ['dust_djinn', 'sand_scorpion', 'desert_bandit'],
    description: 'The scorching heart of the Thar Desert. Few survive the crossing.',
  },
  {
    id: 'gangetic_wilds',
    name: 'Gangetic Wilderness',
    center: { x: 186, y: 114 },
    radius: 8,
    type: 'training_ground',
    suggestedLevel: 3,
    encounterRate: 1.3,
    enemyPool: ['wild_boar', 'cobra', 'dacoit'],
    description: 'Wild grasslands along the Gangetic plain, teeming with creatures.',
  },
  {
    id: 'western_ghats_pass',
    name: 'Western Ghats Passage',
    center: { x: 108, y: 312 },
    radius: 10,
    type: 'mountain_pass',
    suggestedLevel: 8,
    encounterRate: 1.5,
    enemyPool: ['rock_golem', 'forest_wolf', 'tribal_warrior'],
    description: 'Treacherous mountain passes through the Western Ghats.',
  },
];

// === OBSTACLE DEFINITIONS ===
// Obstacles that block progression until the player has the right item/flag

export const OBSTACLES: ObstacleDef[] = [
  // --- Cuttable Trees: block forest shortcuts ---
  {
    id: 'obstacle_forest_mp',
    type: 'cuttable_tree',
    tileX: 141, tileY: 162,
    width: 3, height: 1,
    requiredItem: 'clearing_axe',
    tileType: TileType.FALLEN_LOG,
    clearTile: TileType.PATH_DIRT,
    description: 'Fallen trees block the path. You need an axe to clear them.',
  },
  {
    id: 'obstacle_forest_jharkhand',
    type: 'cuttable_tree',
    tileX: 225, tileY: 180,
    width: 3, height: 1,
    requiredItem: 'clearing_axe',
    tileType: TileType.FALLEN_LOG,
    clearTile: TileType.PATH_DIRT,
    description: 'Dense fallen timber blocks the forest path.',
  },
  {
    id: 'obstacle_forest_ne',
    type: 'cuttable_tree',
    tileX: 330, tileY: 150,
    width: 3, height: 1,
    requiredItem: 'clearing_axe',
    tileType: TileType.FALLEN_LOG,
    clearTile: TileType.PATH_DIRT,
    description: 'Ancient trees have fallen across the jungle trail.',
  },

  // --- Breakable Rocks: block mountain shortcuts ---
  {
    id: 'obstacle_rocks_himalaya',
    type: 'breakable_rock',
    tileX: 144, tileY: 42,
    width: 2, height: 2,
    requiredItem: 'iron_pickaxe',
    tileType: TileType.BOULDER,
    clearTile: TileType.ROCKY_PATH,
    description: 'Large boulders block the mountain path. A pickaxe could break them.',
  },
  {
    id: 'obstacle_rocks_deccan',
    type: 'breakable_rock',
    tileX: 132, tileY: 342,
    width: 2, height: 2,
    requiredItem: 'iron_pickaxe',
    tileType: TileType.BOULDER,
    clearTile: TileType.PATH_DIRT,
    description: 'Boulders from a rockslide block the way to Hampi.',
  },

  // --- Flooded Paths: block wetland routes ---
  {
    id: 'obstacle_flood_bengal',
    type: 'flooded_path',
    tileX: 261, tileY: 189,
    width: 4, height: 2,
    requiredItem: 'boat_token',
    tileType: TileType.SHALLOW_WATER,
    clearTile: TileType.BRIDGE,
    description: 'The path is flooded by monsoon waters. A boatman\'s token would help.',
  },
  {
    id: 'obstacle_flood_sundarbans',
    type: 'flooded_path',
    tileX: 261, tileY: 195,
    width: 3, height: 2,
    requiredItem: 'boat_token',
    tileType: TileType.SHALLOW_WATER,
    clearTile: TileType.BRIDGE,
    description: 'The Sundarban waters are impassable without a boat.',
  },

  // --- Cliff Climbs: require rope ---
  {
    id: 'obstacle_cliff_amber',
    type: 'cliff_climb',
    tileX: 108, tileY: 129,
    width: 2, height: 1,
    requiredItem: 'climbing_rope',
    tileType: TileType.CLIFF,
    clearTile: TileType.STAIRS,
    description: 'A sheer cliff face. You need a rope to climb up to Amber Fort.',
  },
  {
    id: 'obstacle_cliff_ghats',
    type: 'cliff_climb',
    tileX: 96, tileY: 378,
    width: 2, height: 1,
    requiredItem: 'climbing_rope',
    tileType: TileType.CLIFF,
    clearTile: TileType.STAIRS,
    description: 'The Western Ghats rise steeply here. A rope would help.',
  },

  // --- Guard Blocks: require story flags ---
  {
    id: 'obstacle_guard_agra_fort',
    type: 'guard_block',
    tileX: 171, tileY: 114,
    width: 2, height: 1,
    requiredFlag: 'has_fort_seal',
    tileType: TileType.LOCKED_GATE,
    clearTile: TileType.PATH_STONE,
    description: 'The fort is sealed. You need the Fort Seal to enter.',
  },
  {
    id: 'obstacle_guard_golconda',
    type: 'guard_block',
    tileX: 162, tileY: 315,
    width: 2, height: 1,
    requiredFlag: 'ordeal_complete',
    tileType: TileType.LOCKED_GATE,
    clearTile: TileType.PATH_STONE,
    description: 'The Golconda gates are sealed by imperial decree.',
  },
];

// === ELEVATION RULES PER BIOME ===
// Base elevation for each biome type
export const BIOME_ELEVATION: Record<string, number> = {
  ocean: 0,
  coastal: 1,
  plains: 1,
  wetland: 1,
  desert: 1,
  forest: 1,
  dense_forest: 1,
  plateau: 2,
  mountain: 3,
  snow: 4,
};

// === ZONE LOOKUP ===

export function getZoneAt(tileX: number, tileY: number): SubZoneDef | undefined {
  for (const zone of SUB_ZONES) {
    const dx = tileX - zone.center.x;
    const dy = tileY - zone.center.y;
    if (dx * dx + dy * dy <= zone.radius * zone.radius) {
      return zone;
    }
  }
  return undefined;
}

export function getRouteAt(tileX: number, tileY: number): RouteDef | undefined {
  // Check if tile is within ~4 tiles of any route segment
  for (const route of ROUTES) {
    for (let i = 0; i < route.waypoints.length - 1; i++) {
      const p1 = route.waypoints[i];
      const p2 = route.waypoints[i + 1];
      const dist = pointToSegmentDist(tileX, tileY, p1.x, p1.y, p2.x, p2.y);
      if (dist < route.encounterWidth + 2) {
        return route;
      }
    }
  }
  return undefined;
}

function pointToSegmentDist(
  px: number, py: number,
  ax: number, ay: number, bx: number, by: number,
): number {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = ax + t * dx, projY = ay + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

export function getObstacleAt(tileX: number, tileY: number): ObstacleDef | undefined {
  for (const obs of OBSTACLES) {
    if (tileX >= obs.tileX && tileX < obs.tileX + obs.width &&
        tileY >= obs.tileY && tileY < obs.tileY + obs.height) {
      return obs;
    }
  }
  return undefined;
}
