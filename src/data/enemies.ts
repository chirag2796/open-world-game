import { EnemyDef, BiomeType } from '../types';

export const ENEMIES: EnemyDef[] = [
  // Desert enemies
  {
    id: 'desert_bandit',
    name: 'Desert Bandit',
    hp: 25, attack: 8, defense: 3, speed: 6,
    xpReward: 15, goldReward: 12,
    biomes: ['desert'],
    bodyColor: '#c09060', headColor: '#805030', description: 'A ruthless bandit of the Thar.',
    creatureType: 'soldier',
    moves: ['sword_slash', 'quick_strike', 'war_cry'],
    lootTableId: 'soldier_common',
  },
  {
    id: 'sand_scorpion',
    name: 'Sand Scorpion',
    hp: 15, attack: 10, defense: 6, speed: 8,
    xpReward: 12, goldReward: 5,
    biomes: ['desert'],
    bodyColor: '#a08040', headColor: '#806020', description: 'Venomous creature hiding in the dunes.',
    creatureType: 'beast',
    moves: ['claw_rake', 'venom_sting', 'fang_bite'],
    lootTableId: 'beast_common',
  },
  {
    id: 'dust_djinn',
    name: 'Dust Djinn',
    hp: 40, attack: 14, defense: 5, speed: 10,
    xpReward: 30, goldReward: 25,
    biomes: ['desert'],
    bodyColor: '#d0a060', headColor: '#e0c080', description: 'A spirit of the sandstorm.',
    creatureType: 'mythic',
    moves: ['divine_light', 'mantra_blast', 'astral_strike', 'spirit_heal'],
    lootTableId: 'mythic_rare',
  },

  // Plains enemies
  {
    id: 'wild_boar',
    name: 'Wild Boar',
    hp: 20, attack: 7, defense: 4, speed: 5,
    xpReward: 10, goldReward: 3,
    biomes: ['plains'],
    bodyColor: '#704030', headColor: '#503020', description: 'An aggressive boar charging through the fields.',
    creatureType: 'beast',
    moves: ['claw_rake', 'wild_charge', 'howl'],
    lootTableId: 'beast_common',
  },
  {
    id: 'dacoit',
    name: 'Dacoit',
    hp: 30, attack: 10, defense: 5, speed: 6,
    xpReward: 18, goldReward: 20,
    biomes: ['plains', 'plateau'],
    bodyColor: '#604040', headColor: '#302020', description: 'A highway robber lurking on trade routes.',
    creatureType: 'soldier',
    moves: ['sword_slash', 'shield_bash', 'arrow_volley', 'war_cry'],
    lootTableId: 'soldier_common',
  },
  {
    id: 'cobra',
    name: 'King Cobra',
    hp: 18, attack: 12, defense: 2, speed: 9,
    xpReward: 14, goldReward: 4,
    biomes: ['plains', 'wetland', 'forest'],
    bodyColor: '#406020', headColor: '#304010', description: 'A deadly serpent with lightning strikes.',
    creatureType: 'naga',
    moves: ['serpent_strike', 'venom_spray', 'constrict'],
    lootTableId: 'naga_serpent',
  },

  // Forest enemies
  {
    id: 'forest_wolf',
    name: 'Forest Wolf',
    hp: 22, attack: 9, defense: 3, speed: 8,
    xpReward: 13, goldReward: 6,
    biomes: ['forest', 'dense_forest'],
    bodyColor: '#606060', headColor: '#404040', description: 'A cunning predator of the woods.',
    creatureType: 'beast',
    moves: ['fang_bite', 'claw_rake', 'howl', 'wild_charge'],
    lootTableId: 'beast_common',
  },
  {
    id: 'jungle_cat',
    name: 'Jungle Cat',
    hp: 28, attack: 11, defense: 4, speed: 10,
    xpReward: 16, goldReward: 8,
    biomes: ['dense_forest'],
    bodyColor: '#c09040', headColor: '#a07030', description: 'Sleek and deadly, it strikes from the shadows.',
    creatureType: 'beast',
    moves: ['claw_rake', 'fang_bite', 'wild_charge'],
    lootTableId: 'beast_common',
  },
  {
    id: 'tribal_warrior',
    name: 'Tribal Warrior',
    hp: 35, attack: 12, defense: 7, speed: 7,
    xpReward: 22, goldReward: 15,
    biomes: ['dense_forest', 'forest'],
    bodyColor: '#805030', headColor: '#603820', description: 'A fierce warrior defending tribal lands.',
    creatureType: 'soldier',
    moves: ['sword_slash', 'shield_bash', 'war_cry', 'arrow_volley'],
    lootTableId: 'soldier_common',
  },

  // Mountain enemies
  {
    id: 'snow_leopard',
    name: 'Snow Leopard',
    hp: 35, attack: 14, defense: 6, speed: 9,
    xpReward: 25, goldReward: 10,
    biomes: ['mountain', 'snow'],
    bodyColor: '#c0c0c0', headColor: '#909090', description: 'Ghost of the Himalayas.',
    creatureType: 'beast',
    moves: ['claw_rake', 'fang_bite', 'wild_charge', 'howl'],
    lootTableId: 'beast_common',
  },
  {
    id: 'mountain_yak',
    name: 'Wild Yak',
    hp: 45, attack: 10, defense: 10, speed: 3,
    xpReward: 20, goldReward: 5,
    biomes: ['mountain'],
    bodyColor: '#503020', headColor: '#402010', description: 'A massive beast that charges when threatened.',
    creatureType: 'beast',
    moves: ['wild_charge', 'howl', 'claw_rake'],
    lootTableId: 'beast_common',
  },
  {
    id: 'yeti',
    name: 'Yeti',
    hp: 60, attack: 18, defense: 8, speed: 5,
    xpReward: 50, goldReward: 40,
    biomes: ['snow'],
    bodyColor: '#d0d0e0', headColor: '#b0b0c0', description: 'A legendary creature of the ice peaks.',
    creatureType: 'mythic',
    moves: ['iron_fist', 'boulder_throw', 'stone_wall', 'grind'],
    lootTableId: 'mythic_rare',
  },

  // Coastal/wetland enemies
  {
    id: 'mugger_croc',
    name: 'Mugger Croc',
    hp: 38, attack: 13, defense: 8, speed: 4,
    xpReward: 20, goldReward: 7,
    biomes: ['wetland', 'coastal'],
    bodyColor: '#506040', headColor: '#384028', description: 'A fearsome crocodile lurking in swamps.',
    creatureType: 'beast',
    moves: ['fang_bite', 'constrict', 'wild_charge'],
    lootTableId: 'beast_common',
  },
  {
    id: 'pirate',
    name: 'Sea Pirate',
    hp: 32, attack: 11, defense: 5, speed: 7,
    xpReward: 22, goldReward: 30,
    biomes: ['coastal'],
    bodyColor: '#404060', headColor: '#802020', description: 'A pirate from the Arabian Sea.',
    creatureType: 'soldier',
    moves: ['sword_slash', 'quick_strike', 'shield_bash', 'arrow_volley'],
    lootTableId: 'soldier_common',
  },

  // Plateau enemies
  {
    id: 'rock_golem',
    name: 'Rock Golem',
    hp: 50, attack: 12, defense: 15, speed: 2,
    xpReward: 28, goldReward: 18,
    biomes: ['plateau', 'mountain'],
    bodyColor: '#808080', headColor: '#606060', description: 'An ancient stone guardian of the Deccan.',
    creatureType: 'automaton',
    moves: ['iron_fist', 'stone_wall', 'boulder_throw', 'grind'],
    lootTableId: 'automaton_metal',
  },
  {
    id: 'naga_spirit',
    name: 'Naga Spirit',
    hp: 42, attack: 16, defense: 6, speed: 8,
    xpReward: 35, goldReward: 25,
    biomes: ['plateau', 'forest'],
    bodyColor: '#4080a0', headColor: '#206080', description: 'A mystical serpent spirit from temple ruins.',
    creatureType: 'naga',
    moves: ['serpent_strike', 'mystic_coil', 'venom_spray', 'constrict'],
    lootTableId: 'naga_serpent',
  },
  // === BOSS / STORY ENEMIES ===
  {
    id: 'bandit_leader',
    name: 'Bandit Leader',
    hp: 35, attack: 9, defense: 4, speed: 6,
    xpReward: 25, goldReward: 20,
    biomes: ['plains'],
    bodyColor: '#704040', headColor: '#502020', description: 'The ruthless leader of the dig site bandits.',
    creatureType: 'soldier',
    moves: ['sword_slash', 'shield_bash', 'war_cry'],
    lootTableId: 'elite_warrior',
  },
  {
    id: 'corrupted_asura',
    name: 'Corrupted Asura',
    hp: 120, attack: 22, defense: 10, speed: 8,
    xpReward: 200, goldReward: 300,
    biomes: ['plateau'],
    bodyColor: '#600040', headColor: '#400020', description: 'An ancient Asura bound by dark mantras within Agra Fort.',
    creatureType: 'mythic',
    moves: ['divine_light', 'mantra_blast', 'astral_strike', 'spirit_heal'],
    lootTableId: 'boss_legendary',
  },
  {
    id: 'cosmic_asura',
    name: 'Source of Imbalance',
    hp: 180, attack: 28, defense: 14, speed: 10,
    xpReward: 500, goldReward: 500,
    biomes: ['plains'],
    bodyColor: '#200040', headColor: '#100020', description: 'The manifestation of the Cosmic Imbalance itself.',
    creatureType: 'mythic',
    moves: ['astral_strike', 'divine_light', 'mantra_blast', 'spirit_heal'],
    lootTableId: 'boss_legendary',
  },
];

// Get random enemy for a biome, scaled by player level
export function getRandomEnemy(biome: BiomeType, playerLevel: number): EnemyDef {
  const eligible = ENEMIES.filter(e => e.biomes.includes(biome));
  if (eligible.length === 0) {
    // Fallback to generic enemy
    return ENEMIES[0];
  }

  // Weight towards appropriate difficulty
  const idx = Math.floor(Math.random() * eligible.length);
  const base = eligible[idx];

  // Scale enemy stats with player level (mild scaling)
  const levelScale = 1 + (playerLevel - 1) * 0.1;
  return {
    ...base,
    hp: Math.floor(base.hp * levelScale),
    attack: Math.floor(base.attack * levelScale),
    defense: Math.floor(base.defense * levelScale),
    xpReward: Math.floor(base.xpReward * levelScale),
    goldReward: Math.floor(base.goldReward * levelScale),
  };
}

// XP needed to reach next level
export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.5));
}
