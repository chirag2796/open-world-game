// Trade Goods — Mughal-era commodities for the bazaar system
// Prices in dam (copper coins), the base currency unit

import { TradeGoodDef } from '../types';

export const TRADE_GOODS: Record<string, TradeGoodDef> = {
  // === SPICES ===
  black_pepper: {
    id: 'black_pepper',
    name: 'Black Pepper',
    icon: '🌶',
    basePrice: 120,
    category: 'spice',
    originRegions: ['k', 'f'],   // Kerala, Southern Kingdoms
    weight: 1,
    description: 'Malabar pepper — the "black gold" that drew Europeans to India.',
  },
  cardamom: {
    id: 'cardamom',
    name: 'Cardamom',
    icon: '🌿',
    basePrice: 180,
    category: 'spice',
    originRegions: ['k', '#'],
    weight: 1,
    description: 'Queen of spices, from the Western Ghats.',
  },
  saffron: {
    id: 'saffron',
    name: 'Kashmiri Saffron',
    icon: '🌸',
    basePrice: 500,
    category: 'spice',
    originRegions: ['h', 'u'],   // Himalayas, Kashmir
    weight: 1,
    description: 'The most precious spice — worth more than gold by weight.',
  },
  turmeric: {
    id: 'turmeric',
    name: 'Turmeric',
    icon: '🟡',
    basePrice: 60,
    category: 'spice',
    originRegions: ['b', 'o', 'w'],  // Bengal & East
    weight: 2,
    description: 'Sacred golden spice used in rituals and medicine.',
  },
  cloves: {
    id: 'cloves',
    name: 'Cloves',
    icon: '🫑',
    basePrice: 200,
    category: 'spice',
    originRegions: ['f', '@'],
    weight: 1,
    description: 'Aromatic buds traded across the Indian Ocean.',
  },

  // === TEXTILES ===
  muslin: {
    id: 'muslin',
    name: 'Dhaka Muslin',
    icon: '🧵',
    basePrice: 350,
    category: 'textile',
    originRegions: ['b'],   // Bengal
    weight: 2,
    description: 'So fine it was called "woven air" — prized across the Mughal court.',
  },
  silk_patola: {
    id: 'silk_patola',
    name: 'Patola Silk',
    icon: '🎨',
    basePrice: 400,
    category: 'textile',
    originRegions: ['g'],   // Gujarat
    weight: 2,
    description: 'Double ikat silk from Patan — each piece takes months to weave.',
  },
  indigo_dye: {
    id: 'indigo_dye',
    name: 'Indigo Dye',
    icon: '💙',
    basePrice: 150,
    category: 'textile',
    originRegions: ['D', 'd', 'y'],  // Heartland
    weight: 3,
    description: 'The "blue gold" — India\'s most exported dye to Europe.',
  },
  cotton_bale: {
    id: 'cotton_bale',
    name: 'Raw Cotton',
    icon: '☁',
    basePrice: 40,
    category: 'textile',
    originRegions: ['g', 'c', 'x'],  // Gujarat, Central India
    weight: 5,
    description: 'Gujarat cotton — backbone of the textile trade.',
  },
  pashmina: {
    id: 'pashmina',
    name: 'Pashmina Shawl',
    icon: '🧣',
    basePrice: 600,
    category: 'textile',
    originRegions: ['h', 'u', '^'],  // Himalayas
    weight: 1,
    description: 'Woven from Changthangi goat wool at 14,000 feet.',
  },

  // === METALS ===
  wootz_ingot: {
    id: 'wootz_ingot',
    name: 'Wootz Steel Ingot',
    icon: '⚒',
    basePrice: 300,
    category: 'metal',
    originRegions: ['x', 'v', '$'],  // Central India, Deccan
    weight: 8,
    description: 'Damascus steel\'s secret — crucible steel from the Deccan.',
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Iron Ore',
    icon: '⛏',
    basePrice: 30,
    category: 'metal',
    originRegions: ['j', 'o', 'x'],  // Jharkhand, Odisha
    weight: 10,
    description: 'Raw iron from the mineral-rich eastern plateau.',
  },
  copper_ingot: {
    id: 'copper_ingot',
    name: 'Copper Ingot',
    icon: '🔶',
    basePrice: 80,
    category: 'metal',
    originRegions: ['r', 'g'],  // Rajputana
    weight: 8,
    description: 'Khetri copper — essential for coinage and craft.',
  },

  // === GEMS ===
  golconda_diamond: {
    id: 'golconda_diamond',
    name: 'Golconda Diamond',
    icon: '💎',
    basePrice: 2000,
    category: 'gem',
    originRegions: ['v', '$'],  // Deccan
    weight: 1,
    description: 'From the legendary Golconda mines — the world\'s finest diamonds.',
  },
  ruby: {
    id: 'ruby',
    name: 'Burmese Ruby',
    icon: '❤',
    basePrice: 800,
    category: 'gem',
    originRegions: ['s', 'z', 'a'],  // Northeast Frontier
    weight: 1,
    description: 'Blood-red rubies from beyond the eastern frontier.',
  },
  pearl: {
    id: 'pearl',
    name: 'Tuticorin Pearl',
    icon: '⚪',
    basePrice: 450,
    category: 'gem',
    originRegions: ['#', 'f'],  // Southern coast
    weight: 1,
    description: 'Lustrous pearls from the Gulf of Mannar.',
  },

  // === FOOD ===
  basmati_rice: {
    id: 'basmati_rice',
    name: 'Basmati Rice',
    icon: '🍚',
    basePrice: 25,
    category: 'food',
    originRegions: ['D', 'p', 'l'],  // Heartland
    weight: 6,
    description: 'Fragrant long-grain rice from the Gangetic plains.',
  },
  jaggery: {
    id: 'jaggery',
    name: 'Jaggery',
    icon: '🍬',
    basePrice: 35,
    category: 'food',
    originRegions: ['m', 'c', 'k'],  // Maharashtra, Central, Kerala
    weight: 5,
    description: 'Unrefined cane sugar — sweetener of the subcontinent.',
  },
  ghee: {
    id: 'ghee',
    name: 'Pure Ghee',
    icon: '🧈',
    basePrice: 50,
    category: 'food',
    originRegions: ['r', 'g', 'D'],
    weight: 4,
    description: 'Clarified butter — sacred offering and cooking essential.',
  },
  tea_leaves: {
    id: 'tea_leaves',
    name: 'Assam Tea',
    icon: '🍵',
    basePrice: 90,
    category: 'food',
    originRegions: ['s', 'z'],  // Northeast
    weight: 2,
    description: 'Wild tea from the Brahmaputra valley.',
  },

  // === CRAFTS ===
  bidri_ware: {
    id: 'bidri_ware',
    name: 'Bidriware',
    icon: '🏺',
    basePrice: 250,
    category: 'craft',
    originRegions: ['v', '$'],  // Deccan (Bidar)
    weight: 3,
    description: 'Silver-inlaid blackened alloy — Bidar\'s signature craft.',
  },
  sandalwood: {
    id: 'sandalwood',
    name: 'Sandalwood',
    icon: '🪵',
    basePrice: 200,
    category: 'craft',
    originRegions: ['k', '@', '#'],  // Mysore, Southern
    weight: 4,
    description: 'Fragrant wood from Mysore — used in temples and perfumery.',
  },
  lac_bangles: {
    id: 'lac_bangles',
    name: 'Lac Bangles',
    icon: '💍',
    basePrice: 70,
    category: 'craft',
    originRegions: ['r', 'g'],  // Rajputana
    weight: 2,
    description: 'Colorful lac bangles from Jaipur\'s bazaars.',
  },

  // === LUXURY ===
  attar_rose: {
    id: 'attar_rose',
    name: 'Rose Attar',
    icon: '🌹',
    basePrice: 350,
    category: 'luxury',
    originRegions: ['D', 'l'],   // Kannauj (Heartland)
    weight: 1,
    description: 'Essential oil of roses — perfume of the Mughal emperors.',
  },
  ivory_comb: {
    id: 'ivory_comb',
    name: 'Ivory Comb',
    icon: '🦷',
    basePrice: 280,
    category: 'luxury',
    originRegions: ['k', 'f'],
    weight: 1,
    description: 'Intricately carved by Kerala artisans.',
  },
  opium: {
    id: 'opium',
    name: 'Opium Cake',
    icon: '🌑',
    basePrice: 500,
    category: 'luxury',
    originRegions: ['m', 'r'],  // Malwa, Rajputana
    weight: 2,
    description: 'Controlled substance — highly profitable but raises wanted level.',
  },
};

// All trade good IDs for iteration
export const ALL_TRADE_GOODS = Object.keys(TRADE_GOODS);
