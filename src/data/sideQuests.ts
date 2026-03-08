// Side Quests: Object-Action-Location formula with Arrowhead Chaining
// Each quest follows: [Object] → [Action] → [Location]
// Chains increase in significance (Arrowhead pattern)
// Choices set butterfly flags for long-term narrative consequences

import { SideQuestDef } from '../types';

export const SIDE_QUESTS: Record<string, SideQuestDef> = {

  // ═══════════════════════════════════════════════════════════
  // CHAIN 1: "The Stolen Sanad" (Delhi/UP) — Mystery Archetype
  // A theft in the bazaar leads to uncovering corruption
  // ═══════════════════════════════════════════════════════════

  SIDE_DELHI_MYSTERY_1: {
    id: 'SIDE_DELHI_MYSTERY_1',
    title: 'The Missing Decree',
    description: 'A merchant in Shahjahanabad has had his imperial trade sanad stolen. Investigate the bazaar.',
    archetype: 'mystery',
    object: 'Stolen Imperial Sanad',
    action: 'Investigate the theft',
    location: 'Shahjahanabad Bazaar, Delhi',
    regionCode: 'D',
    steps: [
      {
        id: 'talk_merchant',
        description: 'Speak with the distressed merchant in the Delhi bazaar',
        trigger: { type: 'dialog', dialogTreeId: 'sq_delhi_merchant_theft' },
        onComplete: {
          setFlags: ['sq_delhi_theft_started'],
          message: 'The merchant says a thief fled toward the southern gate.',
        },
      },
      {
        id: 'find_witness',
        description: 'Search near the southern gate for witnesses',
        trigger: { type: 'position', tileX: 104, tileY: 64, radius: 4 },
        onComplete: {
          setFlags: ['sq_delhi_witness_found'],
          dialogTreeId: 'sq_delhi_witness',
          message: 'A beggar saw the thief hide something near the well.',
        },
      },
      {
        id: 'recover_sanad',
        description: 'Search the well area for the hidden sanad',
        trigger: { type: 'position', tileX: 106, tileY: 58, radius: 2 },
        onComplete: {
          giveItems: [{ itemId: 'stolen_sanad', quantity: 1 }],
          setFlags: ['sq_delhi_sanad_recovered'],
          message: 'Found the stolen sanad hidden in a clay pot!',
        },
      },
      {
        id: 'return_or_keep',
        description: 'Decide what to do with the stolen sanad',
        trigger: { type: 'dialog', dialogTreeId: 'sq_delhi_sanad_choice' },
        onComplete: {
          message: 'Your choice has been noted...',
        },
      },
    ],
    butterflyFlags: ['sq_returned_sanad', 'sq_kept_sanad', 'sq_spared_thief_delhi'],
    chainId: 'delhi_corruption',
    chainOrder: 1,
    nextQuestId: 'SIDE_DELHI_MYSTERY_2',
    xpReward: 40,
    goldReward: 50,
    repReward: { region: 'D', amount: 10 },
  },

  SIDE_DELHI_MYSTERY_2: {
    id: 'SIDE_DELHI_MYSTERY_2',
    title: 'The Corrupt Official',
    description: 'The stolen sanad trail leads to a corrupt revenue official. Confront or expose him.',
    archetype: 'mystery',
    object: 'Evidence of corruption',
    action: 'Expose or confront the official',
    location: 'Delhi administrative quarter',
    regionCode: 'D',
    minLevel: 3,
    requiredFlag: 'sq_delhi_sanad_recovered',
    chainId: 'delhi_corruption',
    chainOrder: 2,
    steps: [
      {
        id: 'gather_evidence',
        description: 'Investigate the administrative quarter',
        trigger: { type: 'position', tileX: 108, tileY: 52, radius: 3 },
        onComplete: {
          setFlags: ['sq_delhi_evidence_area'],
          dialogTreeId: 'sq_delhi_official_confront',
        },
      },
      {
        id: 'confront_official',
        description: 'Resolve the situation with the corrupt official',
        trigger: { type: 'dialog', dialogTreeId: 'sq_delhi_official_confront' },
        onComplete: {
          message: 'The corruption has been addressed.',
        },
      },
    ],
    butterflyFlags: ['sq_exposed_official', 'sq_bribed_official', 'sq_blackmailed_official'],
    nextQuestId: 'SIDE_DELHI_MYSTERY_3',
    xpReward: 80,
    goldReward: 100,
    repReward: { region: 'D', amount: 15 },
  },

  SIDE_DELHI_MYSTERY_3: {
    id: 'SIDE_DELHI_MYSTERY_3',
    title: 'The Imperial Treasury',
    description: 'Your investigation reveals a deeper conspiracy reaching the imperial treasury itself.',
    archetype: 'mystery',
    object: 'Treasury ledgers',
    action: 'Infiltrate and uncover the conspiracy',
    location: 'Red Fort treasury, Delhi',
    regionCode: 'D',
    minLevel: 5,
    requiredFlag: 'sq_exposed_official',
    chainId: 'delhi_corruption',
    chainOrder: 3,
    steps: [
      {
        id: 'enter_fort',
        description: 'Find a way into the restricted treasury wing',
        trigger: { type: 'position', tileX: 106, tileY: 50, radius: 3 },
        onComplete: {
          dialogTreeId: 'sq_delhi_treasury_entry',
          setFlags: ['sq_delhi_treasury_entered'],
        },
      },
      {
        id: 'fight_guards',
        description: 'Deal with the treasury guards',
        trigger: { type: 'combat_win' },
        onComplete: {
          setFlags: ['sq_delhi_guards_defeated'],
          message: 'The guards are subdued.',
        },
      },
      {
        id: 'find_ledgers',
        description: 'Locate the incriminating ledgers',
        trigger: { type: 'flag', flag: 'sq_delhi_guards_defeated' },
        onComplete: {
          setFlags: ['sq_delhi_conspiracy_exposed'],
          giveItems: [{ itemId: 'soma_elixir', quantity: 1 }],
          karmaEffect: 5,
          message: 'You have exposed a conspiracy that reaches the highest levels of the court!',
        },
      },
    ],
    butterflyFlags: ['sq_delhi_conspiracy_exposed'],
    xpReward: 150,
    goldReward: 200,
    rewardItems: [{ itemId: 'soma_elixir', quantity: 1 }],
    karmaReward: 5,
    repReward: { region: 'D', amount: 25 },
  },

  // ═══════════════════════════════════════════════════════════
  // CHAIN 2: "Spice Road Peril" (Rajasthan) — Protection Archetype
  // Protect merchant caravans on the dangerous desert trade routes
  // ═══════════════════════════════════════════════════════════

  SIDE_RAJ_PROTECT_1: {
    id: 'SIDE_RAJ_PROTECT_1',
    title: "The Merchant's Plea",
    description: 'A Baniya merchant needs an escort for his spice caravan through bandit territory.',
    archetype: 'protection',
    object: 'Spice caravan',
    action: 'Escort through bandit territory',
    location: 'Trade road near Pushkar, Rajasthan',
    regionCode: 'r',
    steps: [
      {
        id: 'meet_merchant',
        description: 'Meet the merchant at the Pushkar campsite',
        trigger: { type: 'dialog', dialogTreeId: 'sq_raj_caravan_start' },
        onComplete: {
          setFlags: ['sq_raj_caravan_accepted'],
          giveItems: [{ itemId: 'caravan_manifest', quantity: 1 }],
          message: 'You have agreed to escort the caravan.',
        },
      },
      {
        id: 'escort_phase1',
        description: 'Travel with the caravan to the halfway point',
        trigger: { type: 'position', tileX: 60, tileY: 92, radius: 4 },
        onComplete: {
          startBattleWithEnemy: 'desert_bandit',
          message: 'Bandits! Protect the caravan!',
        },
      },
      {
        id: 'survive_ambush',
        description: 'Defeat the bandits',
        trigger: { type: 'combat_win' },
        onComplete: {
          setFlags: ['sq_raj_bandits_defeated'],
          message: 'The bandits have been driven off.',
        },
      },
      {
        id: 'complete_escort',
        description: 'Deliver the caravan safely to Amber',
        trigger: { type: 'position', tileX: 72, tileY: 88, radius: 4 },
        onComplete: {
          setFlags: ['sq_raj_caravan_delivered'],
          dialogTreeId: 'sq_raj_caravan_reward',
        },
      },
    ],
    butterflyFlags: ['sq_raj_caravan_delivered', 'sq_raj_spared_bandit_leader'],
    chainId: 'spice_road',
    chainOrder: 1,
    nextQuestId: 'SIDE_RAJ_PROTECT_2',
    xpReward: 60,
    goldReward: 80,
    rewardItems: [{ itemId: 'spice_pouch', quantity: 2 }],
    repReward: { region: 'r', amount: 15 },
  },

  SIDE_RAJ_PROTECT_2: {
    id: 'SIDE_RAJ_PROTECT_2',
    title: 'The Bandit Fortress',
    description: 'The bandit raids are organized. Track them back to their desert fortress.',
    archetype: 'elimination',
    object: 'Bandit fortress',
    action: 'Assault or infiltrate the hideout',
    location: 'Desert ruins near Jaisalmer',
    regionCode: 'r',
    minLevel: 4,
    requiredFlag: 'sq_raj_caravan_delivered',
    chainId: 'spice_road',
    chainOrder: 2,
    steps: [
      {
        id: 'track_bandits',
        description: 'Follow the bandit trail into the desert',
        trigger: { type: 'position', tileX: 44, tileY: 84, radius: 4 },
        onComplete: {
          setFlags: ['sq_raj_fortress_found'],
          dialogTreeId: 'sq_raj_fortress_approach',
        },
      },
      {
        id: 'enter_fortress',
        description: 'Approach the fortress — stealth or assault?',
        trigger: { type: 'dialog', dialogTreeId: 'sq_raj_fortress_approach' },
        onComplete: {
          startBattleWithEnemy: 'bandit_chief',
          message: 'The bandit chief confronts you!',
        },
      },
      {
        id: 'defeat_chief',
        description: 'Defeat the bandit chief',
        trigger: { type: 'combat_win' },
        onComplete: {
          setFlags: ['sq_raj_chief_defeated'],
          dialogTreeId: 'sq_raj_chief_mercy',
        },
      },
    ],
    butterflyFlags: ['sq_raj_chief_killed', 'sq_raj_chief_spared', 'sq_raj_stealth_entry'],
    xpReward: 120,
    goldReward: 150,
    rewardItems: [{ itemId: 'steel_khanda', quantity: 1 }],
    karmaReward: 0, // depends on choice
    repReward: { region: 'r', amount: 20 },
  },

  // ═══════════════════════════════════════════════════════════
  // CHAIN 3: "Spirits of the Ganga" (Varanasi) — Elimination Archetype
  // Supernatural threat along the sacred river
  // ═══════════════════════════════════════════════════════════

  SIDE_VAR_ELIM_1: {
    id: 'SIDE_VAR_ELIM_1',
    title: 'Whispers at the Ghats',
    description: 'Fishermen report a Pishacha haunting the Varanasi ghats at night. Investigate.',
    archetype: 'elimination',
    object: 'Pishacha (flesh-eating demon)',
    action: 'Investigate and slay the beast',
    location: 'Ghats of Varanasi',
    regionCode: 'l',
    steps: [
      {
        id: 'talk_fisherman',
        description: 'Speak with the frightened fisherman near the ghats',
        trigger: { type: 'dialog', dialogTreeId: 'sq_var_ghats_rumor' },
        onComplete: {
          setFlags: ['sq_var_ghats_investigated'],
          message: 'The Pishacha appears at the burning ghat after dark.',
        },
      },
      {
        id: 'reach_ghat',
        description: 'Go to the burning ghat area',
        trigger: { type: 'position', tileX: 148, tileY: 92, radius: 3 },
        onComplete: {
          startBattleWithEnemy: 'pishacha',
          setFlags: ['sq_var_pishacha_encountered'],
          message: 'A terrible shriek echoes across the water!',
        },
      },
      {
        id: 'defeat_pishacha',
        description: 'Defeat the Pishacha',
        trigger: { type: 'combat_win' },
        onComplete: {
          setFlags: ['sq_var_pishacha_slain'],
          giveItems: [{ itemId: 'haunted_amulet', quantity: 1 }],
          message: 'The demon dissolves into black smoke, leaving behind a dark amulet.',
        },
      },
    ],
    butterflyFlags: ['sq_var_pishacha_slain'],
    chainId: 'ganga_spirits',
    chainOrder: 1,
    nextQuestId: 'SIDE_VAR_ELIM_2',
    xpReward: 70,
    goldReward: 40,
    rewardItems: [{ itemId: 'haunted_amulet', quantity: 1 }],
    repReward: { region: 'l', amount: 10 },
  },

  SIDE_VAR_ELIM_2: {
    id: 'SIDE_VAR_ELIM_2',
    title: 'The Source of Darkness',
    description: 'The Pishacha was not alone. A necromancer raises the dead along the Ganga.',
    archetype: 'elimination',
    object: 'Necromancer and undead',
    action: 'Track and destroy the source',
    location: 'Ruins south of Varanasi',
    regionCode: 'l',
    minLevel: 5,
    requiredFlag: 'sq_var_pishacha_slain',
    chainId: 'ganga_spirits',
    chainOrder: 2,
    steps: [
      {
        id: 'scholar_clue',
        description: 'Consult the Varanasi scholar about the undead threat',
        trigger: { type: 'dialog', dialogTreeId: 'sq_var_scholar_necro' },
        onComplete: {
          setFlags: ['sq_var_necro_trail'],
          message: 'The scholar points to ancient ruins south of the city.',
        },
      },
      {
        id: 'find_ruins',
        description: 'Locate the ruins south of Varanasi',
        trigger: { type: 'position', tileX: 144, tileY: 100, radius: 4 },
        onComplete: {
          startBattleWithEnemy: 'necromancer',
          message: 'Dark energy crackles as the necromancer reveals himself!',
        },
      },
      {
        id: 'defeat_necromancer',
        description: 'Defeat the necromancer',
        trigger: { type: 'combat_win' },
        onComplete: {
          setFlags: ['sq_var_necromancer_defeated'],
          dialogTreeId: 'sq_var_necro_aftermath',
          message: 'The dark magic fades. Peace returns to the ghats.',
        },
      },
    ],
    butterflyFlags: ['sq_var_necromancer_defeated', 'sq_var_necro_spared', 'sq_var_necro_artifacts_destroyed'],
    xpReward: 140,
    goldReward: 100,
    rewardItems: [{ itemId: 'soma_elixir', quantity: 1 }],
    karmaReward: 3,
    repReward: { region: 'l', amount: 20 },
  },

  // ═══════════════════════════════════════════════════════════
  // CHAIN 4: "The Sacred Lotus" (Kerala) — Fetch Archetype
  // Retrieve rare ingredients for a legendary elixir
  // ═══════════════════════════════════════════════════════════

  SIDE_KERALA_FETCH_1: {
    id: 'SIDE_KERALA_FETCH_1',
    title: 'The Healer\'s Request',
    description: 'A renowned Ayurvedic healer in Kozhikode needs a rare lotus from a guarded garden.',
    archetype: 'fetch',
    object: 'Rare lotus flowers',
    action: 'Obtain from a guarded corporate garden',
    location: 'Kozhikode spice gardens, Kerala',
    regionCode: 'f',
    steps: [
      {
        id: 'meet_healer',
        description: 'Speak with the healer in Kozhikode',
        trigger: { type: 'dialog', dialogTreeId: 'sq_kerala_healer_start' },
        onComplete: {
          setFlags: ['sq_kerala_lotus_quest'],
          message: 'The healer needs rare lotuses from a private garden south of the city.',
        },
      },
      {
        id: 'find_garden',
        description: 'Locate the guarded garden south of Kozhikode',
        trigger: { type: 'position', tileX: 88, tileY: 300, radius: 3 },
        onComplete: {
          dialogTreeId: 'sq_kerala_garden_access',
          message: 'The garden is surrounded by walls. You need a way in.',
        },
      },
      {
        id: 'access_garden',
        description: 'Get past the garden defenses',
        trigger: { type: 'dialog', dialogTreeId: 'sq_kerala_garden_access' },
        onComplete: {
          setFlags: ['sq_kerala_garden_entered'],
        },
      },
      {
        id: 'collect_lotus',
        description: 'Find the rare lotus in the garden',
        trigger: { type: 'position', tileX: 86, tileY: 304, radius: 2 },
        onComplete: {
          giveItems: [{ itemId: 'rare_lotus', quantity: 1 }],
          setFlags: ['sq_kerala_lotus_obtained'],
          message: 'The lotus glows faintly in your hands.',
        },
      },
      {
        id: 'return_lotus',
        description: 'Bring the lotus back to the healer',
        trigger: { type: 'dialog', dialogTreeId: 'sq_kerala_healer_return' },
        onComplete: {
          setFlags: ['sq_kerala_lotus_delivered'],
        },
      },
    ],
    butterflyFlags: ['sq_kerala_lotus_delivered', 'sq_kerala_bribed_guard', 'sq_kerala_snuck_in'],
    chainId: 'sacred_lotus',
    chainOrder: 1,
    xpReward: 50,
    goldReward: 60,
    rewardItems: [{ itemId: 'soma_elixir', quantity: 1 }],
    repReward: { region: 'f', amount: 15 },
  },

  // ═══════════════════════════════════════════════════════════
  // CHAIN 5: "The Scholar's Cipher" (Bhopal) — Mystery/Fetch Hybrid
  // A data scientist needs an ancient scroll to decode a cipher
  // ═══════════════════════════════════════════════════════════

  SIDE_MP_MYSTERY_1: {
    id: 'SIDE_MP_MYSTERY_1',
    title: 'The Encrypted Signal',
    description: 'Alchemist Hakim has found a corrupted cipher. He needs an ancient Persian scroll to decode it.',
    archetype: 'mystery',
    object: 'Ancient Persian Scroll',
    action: 'Retrieve from a Mughal fort',
    location: 'Gwalior Fort, Madhya Pradesh',
    regionCode: 'm',
    steps: [
      {
        id: 'talk_hakim',
        description: 'Speak with Alchemist Hakim in Bhopal about the cipher',
        trigger: { type: 'dialog', dialogTreeId: 'sq_mp_hakim_cipher' },
        onComplete: {
          setFlags: ['sq_mp_cipher_quest'],
          message: 'Hakim says the scroll is in Gwalior Fort\'s sealed library.',
        },
      },
      {
        id: 'travel_gwalior',
        description: 'Travel to Gwalior Fort',
        trigger: { type: 'position', tileX: 104, tileY: 92, radius: 4 },
        onComplete: {
          dialogTreeId: 'sq_mp_gwalior_entry',
          message: 'The fort looms above. The library wing is sealed.',
        },
      },
      {
        id: 'enter_library',
        description: 'Find a way into the sealed library',
        trigger: { type: 'dialog', dialogTreeId: 'sq_mp_gwalior_entry' },
        onComplete: {
          setFlags: ['sq_mp_library_entered'],
        },
      },
      {
        id: 'find_scroll',
        description: 'Search the library for the Persian scroll',
        trigger: { type: 'position', tileX: 104, tileY: 90, radius: 2 },
        onComplete: {
          giveItems: [{ itemId: 'persian_scroll', quantity: 1 }],
          setFlags: ['sq_mp_scroll_found'],
          message: 'An ancient scroll bearing astronomical diagrams and Persian text!',
        },
      },
      {
        id: 'return_scroll',
        description: 'Bring the scroll back to Hakim',
        trigger: { type: 'dialog', dialogTreeId: 'sq_mp_hakim_decode' },
        onComplete: {
          setFlags: ['sq_mp_cipher_decoded'],
          message: 'Hakim decodes the cipher — it reveals the location of a hidden treasure!',
        },
      },
    ],
    butterflyFlags: ['sq_mp_cipher_decoded', 'sq_mp_used_stealth', 'sq_mp_used_combat'],
    chainId: 'scholars_cipher',
    chainOrder: 1,
    xpReward: 90,
    goldReward: 120,
    rewardItems: [{ itemId: 'soma_elixir', quantity: 1 }],
    karmaReward: 2,
    repReward: { region: 'm', amount: 15 },
  },

  // ═══════════════════════════════════════════════════════════
  // STANDALONE QUESTS (No chain — quick 15-min flow episodes)
  // ═══════════════════════════════════════════════════════════

  SIDE_HAMPI_RUINS: {
    id: 'SIDE_HAMPI_RUINS',
    title: 'Echoes of Vijayanagara',
    description: 'Explore the ruins of Hampi and recover a lost temple artifact.',
    archetype: 'fetch',
    object: 'Temple artifact',
    action: 'Explore ruins and recover',
    location: 'Hampi ruins, Karnataka',
    regionCode: 'k',
    steps: [
      {
        id: 'talk_priest',
        description: 'Speak with the priest at Hampi temple',
        trigger: { type: 'dialog', dialogTreeId: 'sq_hampi_priest_artifact' },
        onComplete: {
          setFlags: ['sq_hampi_artifact_quest'],
          message: 'The artifact lies buried in the northern ruins.',
        },
      },
      {
        id: 'explore_ruins',
        description: 'Search the northern ruins of Hampi',
        trigger: { type: 'position', tileX: 82, tileY: 236, radius: 3 },
        onComplete: {
          startBattleWithEnemy: 'stone_guardian',
          message: 'A stone guardian awakens to protect the ruins!',
        },
      },
      {
        id: 'defeat_guardian',
        description: 'Defeat the stone guardian',
        trigger: { type: 'combat_win' },
        onComplete: {
          setFlags: ['sq_hampi_guardian_defeated'],
          giveItems: [{ itemId: 'jade_amulet', quantity: 1 }],
          message: 'The guardian crumbles, revealing the artifact within.',
        },
      },
    ],
    butterflyFlags: ['sq_hampi_guardian_defeated'],
    xpReward: 80,
    goldReward: 70,
    rewardItems: [{ itemId: 'jade_amulet', quantity: 1 }],
    repReward: { region: 'k', amount: 10 },
  },

  SIDE_ASSAM_ESCORT: {
    id: 'SIDE_ASSAM_ESCORT',
    title: 'River Crossing',
    description: 'Help a family of refugees cross the Brahmaputra safely to reach Guwahati.',
    archetype: 'escort',
    object: 'Refugee family',
    action: 'Escort across the Brahmaputra',
    location: 'Brahmaputra crossing, Assam',
    regionCode: 'z',
    steps: [
      {
        id: 'meet_refugees',
        description: 'Find the stranded refugees east of Guwahati',
        trigger: { type: 'dialog', dialogTreeId: 'sq_assam_refugees_start' },
        onComplete: {
          setFlags: ['sq_assam_escort_started'],
          message: 'The family is terrified. Bandits patrol the river crossings.',
        },
      },
      {
        id: 'clear_crossing',
        description: 'Secure the river crossing by defeating the bandits',
        trigger: { type: 'position', tileX: 220, tileY: 112, radius: 4 },
        onComplete: {
          startBattleWithEnemy: 'river_bandit',
          message: 'River bandits block your path!',
        },
      },
      {
        id: 'defeat_bandits',
        description: 'Defeat the river bandits',
        trigger: { type: 'combat_win' },
        onComplete: {
          setFlags: ['sq_assam_crossing_secured'],
          message: 'The crossing is clear. Lead the family to safety.',
        },
      },
      {
        id: 'reach_guwahati',
        description: 'Escort the refugees to Guwahati',
        trigger: { type: 'position', tileX: 212, tileY: 112, radius: 4 },
        onComplete: {
          setFlags: ['sq_assam_refugees_safe'],
          dialogTreeId: 'sq_assam_refugees_thanks',
          message: 'The family has reached Guwahati safely!',
        },
      },
    ],
    butterflyFlags: ['sq_assam_refugees_safe'],
    xpReward: 60,
    goldReward: 30,
    karmaReward: 5,
    repReward: { region: 'z', amount: 15 },
  },

  SIDE_GOA_TRADER: {
    id: 'SIDE_GOA_TRADER',
    title: 'The Portuguese Connection',
    description: 'A Goan trader needs help negotiating with Portuguese merchants at the port.',
    archetype: 'mystery',
    object: 'Trade agreement',
    action: 'Negotiate or sabotage',
    location: 'Velha Goa port',
    regionCode: 'v',
    steps: [
      {
        id: 'meet_trader',
        description: 'Meet the local trader at Velha Goa',
        trigger: { type: 'dialog', dialogTreeId: 'sq_goa_trader_start' },
        onComplete: {
          setFlags: ['sq_goa_trade_quest'],
          message: 'The Portuguese demand unfair terms. Help negotiate.',
        },
      },
      {
        id: 'negotiate',
        description: 'Choose how to handle the Portuguese merchants',
        trigger: { type: 'dialog', dialogTreeId: 'sq_goa_negotiate' },
        onComplete: {
          message: 'The trade deal has been settled.',
        },
      },
    ],
    butterflyFlags: ['sq_goa_fair_trade', 'sq_goa_sabotaged_portuguese', 'sq_goa_allied_portuguese'],
    xpReward: 50,
    goldReward: 100,
    rewardItems: [{ itemId: 'spice_pouch', quantity: 3 }],
    repReward: { region: 'v', amount: 10 },
  },
};

// Side quest ordering — which quests are available at game start
export const INITIAL_SIDE_QUESTS = [
  'SIDE_DELHI_MYSTERY_1',
  'SIDE_RAJ_PROTECT_1',
  'SIDE_VAR_ELIM_1',
  'SIDE_KERALA_FETCH_1',
  'SIDE_MP_MYSTERY_1',
  'SIDE_HAMPI_RUINS',
  'SIDE_ASSAM_ESCORT',
  'SIDE_GOA_TRADER',
];

// Get all quests in a chain
export function getQuestChain(chainId: string): SideQuestDef[] {
  return Object.values(SIDE_QUESTS)
    .filter(q => q.chainId === chainId)
    .sort((a, b) => (a.chainOrder ?? 0) - (b.chainOrder ?? 0));
}

// Get available quests for a region
export function getRegionQuests(regionCode: string): SideQuestDef[] {
  return Object.values(SIDE_QUESTS).filter(q => q.regionCode === regionCode);
}
