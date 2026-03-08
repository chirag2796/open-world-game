// Main Quest: The Hero's Journey — 12 Stages
// Each quest has steps with triggers (position, flag, combat, dialog)
// Choices update karma and set permanent flags for butterfly effects

export type QuestTriggerType =
  | 'position'    // player reaches a tile coord
  | 'flag'        // a story flag is set (from dialog, combat, etc.)
  | 'combat_win'  // win any combat encounter
  | 'item'        // player acquires an item
  | 'dialog'      // complete a specific dialog tree
  | 'auto';       // triggers immediately when quest starts

export interface QuestTrigger {
  type: QuestTriggerType;
  // position trigger
  tileX?: number;
  tileY?: number;
  radius?: number; // tile radius (default 3)
  // flag trigger
  flag?: string;
  // item trigger
  itemId?: string;
  // dialog trigger
  dialogTreeId?: string;
}

export interface QuestChoice {
  text: string;
  karmaEffect: number;
  setFlags: string[];
  nextQuestId?: string; // override next quest (for branching)
}

export interface QuestStep {
  id: string;
  description: string; // shown in HUD
  trigger: QuestTrigger;
  onComplete?: {
    setFlags?: string[];
    giveItems?: { itemId: string; quantity: number }[];
    giveGold?: number;
    unlockRegions?: string[]; // region codes to unlock
    dialogTreeId?: string; // auto-start this dialog
    startBattleWithEnemy?: string; // auto-start a scripted battle with this enemy ID
    message?: string; // show notification
  };
}

export interface QuestDef {
  id: string;
  stage: number; // 1-12
  act: 'departure' | 'initiation' | 'return';
  title: string;
  description: string;
  location: string;
  steps: QuestStep[];
  nextQuestId?: string; // linear progression
}

// ============================================================
// THE 12 STAGES OF THE HERO'S JOURNEY
// ============================================================

export const MAIN_QUESTS: Record<string, QuestDef> = {
  // === ACT I: DEPARTURE ===

  MAIN_01_ORDINARY: {
    id: 'MAIN_01_ORDINARY',
    stage: 1,
    act: 'departure',
    title: 'A Village Life',
    description: 'You are a young villager in Mathura, Uttar Pradesh. Speak with Village Elder Devrath to begin your journey.',
    location: 'Mathura, UP',
    steps: [
      {
        id: 'talk_elder',
        description: 'Speak with Elder Devrath in Mathura',
        trigger: { type: 'dialog', dialogTreeId: 'quest_elder_start' },
        onComplete: {
          setFlags: ['elder_spoken'],
          message: 'Elder Devrath has asked you to investigate the construction site.',
        },
      },
      {
        id: 'visit_site',
        description: 'Visit the construction site south of the village',
        trigger: { type: 'position', tileX: 153, tileY: 117, radius: 5 },
        onComplete: {
          setFlags: ['found_dig_site'],
          dialogTreeId: 'quest_discover_talwar',
        },
      },
    ],
    nextQuestId: 'MAIN_02_CALL',
  },

  MAIN_02_CALL: {
    id: 'MAIN_02_CALL',
    stage: 2,
    act: 'departure',
    title: 'The Unearthing',
    description: 'You have discovered an ancestral Talwar buried at the construction site. A group of bandits approaches!',
    location: 'Construction Site, Mathura',
    steps: [
      {
        id: 'defeat_bandits',
        description: 'Defeat the Bandit Leader!',
        trigger: { type: 'auto' },
        onComplete: {
          startBattleWithEnemy: 'bandit_leader',
          message: 'Bandits ambush you at the dig site!',
        },
      },
      {
        id: 'claim_talwar',
        description: 'Defeat the Bandit Leader to claim the Talwar',
        trigger: { type: 'flag', flag: 'first_combat_won' },
        onComplete: {
          giveItems: [{ itemId: 'ancestral_talwar', quantity: 1 }],
          setFlags: ['has_talwar'],
          message: 'You claimed the Ancestral Talwar! Its blade hums with ancient power.',
        },
      },
      {
        id: 'return_to_village',
        description: 'Return to the village with the Talwar',
        trigger: { type: 'position', tileX: 150, tileY: 108, radius: 5 },
        onComplete: {
          dialogTreeId: 'quest_talwar_choice',
        },
      },
    ],
    nextQuestId: 'MAIN_03_REFUSAL',
  },

  MAIN_03_REFUSAL: {
    id: 'MAIN_03_REFUSAL',
    stage: 3,
    act: 'departure',
    title: 'The Weight of Choice',
    description: 'The Talwar carries the weight of your ancestors. What will you do with it?',
    location: 'Mathura Village',
    steps: [
      {
        id: 'make_choice',
        description: 'Decide the fate of the Ancestral Talwar',
        trigger: { type: 'flag', flag: 'talwar_choice_made' },
        onComplete: {
          message: 'Your choice echoes through the ages...',
        },
      },
    ],
    nextQuestId: 'MAIN_04_MENTOR',
  },

  MAIN_04_MENTOR: {
    id: 'MAIN_04_MENTOR',
    stage: 4,
    act: 'departure',
    title: 'The Retired Mansabdar',
    description: 'Seek out Guru Arjun, a retired Mansabdar living on the outskirts of Mathura.',
    location: 'Mathura Outskirts',
    steps: [
      {
        id: 'find_mentor',
        description: 'Find Guru Arjun on the outskirts of Mathura',
        trigger: { type: 'dialog', dialogTreeId: 'quest_mentor_intro' },
        onComplete: {
          setFlags: ['met_mentor'],
          giveItems: [{ itemId: 'mentors_ring', quantity: 1 }],
          message: 'Guru Arjun agrees to train you. He gives you his signet ring.',
        },
      },
      {
        id: 'training_complete',
        description: 'Complete Guru Arjun\'s training (win 3 battles)',
        trigger: { type: 'flag', flag: 'training_wins_3' },
        onComplete: {
          setFlags: ['training_done'],
          giveItems: [{ itemId: 'neem_potion', quantity: 3 }],
          message: 'Your training is complete. Guru Arjun tells you to seek the Vizier in Delhi.',
          dialogTreeId: 'quest_mentor_sendoff',
        },
      },
    ],
    nextQuestId: 'MAIN_05_THRESHOLD',
  },

  // === ACT I → II TRANSITION ===

  MAIN_05_THRESHOLD: {
    id: 'MAIN_05_THRESHOLD',
    stage: 5,
    act: 'departure',
    title: 'Beyond the Village',
    description: 'Travel north to Shahjahanabad (Delhi) and seek Vizier Mirza at the imperial court.',
    location: 'Road to Delhi',
    steps: [
      {
        id: 'reach_delhi',
        description: 'Reach Shahjahanabad (Delhi)',
        trigger: { type: 'position', tileX: 156, tileY: 84, radius: 8 },
        onComplete: {
          setFlags: ['reached_delhi'],
          message: 'You have arrived at the magnificent Shahjahanabad!',
        },
      },
      {
        id: 'speak_vizier',
        description: 'Speak with Vizier Mirza',
        trigger: { type: 'dialog', dialogTreeId: 'quest_vizier_mission' },
        onComplete: {
          setFlags: ['vizier_mission'],
          giveItems: [{ itemId: 'sanad_rajputana', quantity: 1 }],
          unlockRegions: ['r', 'g'],
          message: 'The Vizier grants you a Sanad for Rajputana. The western desert awaits.',
        },
      },
    ],
    nextQuestId: 'MAIN_06_TESTS',
  },

  // === ACT II: INITIATION ===

  MAIN_06_TESTS: {
    id: 'MAIN_06_TESTS',
    stage: 6,
    act: 'initiation',
    title: 'Sands of Rajputana',
    description: 'Travel to Rajasthan and build your reputation. The Vizier needs intelligence from Amber.',
    location: 'Rajasthan',
    steps: [
      {
        id: 'reach_amber',
        description: 'Reach the city of Amber in Rajasthan',
        trigger: { type: 'position', tileX: 108, tileY: 132, radius: 8 },
        onComplete: {
          setFlags: ['reached_amber'],
          message: 'The fortress city of Amber rises before you.',
        },
      },
      {
        id: 'talk_rajput',
        description: 'Meet Rajput Vikram at Amber Fort',
        trigger: { type: 'dialog', dialogTreeId: 'quest_rajput_alliance' },
        onComplete: {
          setFlags: ['rajput_contact'],
          message: 'Rajput Vikram reveals troubling news about corruption in the empire.',
        },
      },
      {
        id: 'prove_worth',
        description: 'Prove your worth — defeat desert creatures (win 5 battles in Rajasthan)',
        trigger: { type: 'flag', flag: 'rajasthan_wins_5' },
        onComplete: {
          setFlags: ['rajputana_proven'],
          giveGold: 100,
          giveItems: [{ itemId: 'steel_khanda', quantity: 1 }],
          message: 'The Rajputs honor you with a Steel Khanda. You have earned their trust.',
          dialogTreeId: 'quest_rajput_reward',
        },
      },
    ],
    nextQuestId: 'MAIN_07_APPROACH',
  },

  MAIN_07_APPROACH: {
    id: 'MAIN_07_APPROACH',
    stage: 7,
    act: 'initiation',
    title: 'The Fort Awaits',
    description: 'Gather the Logic Keys needed to infiltrate the corrupted Agra Fort.',
    location: 'Agra Region',
    steps: [
      {
        id: 'get_fort_key_1',
        description: 'Obtain the Fort Seal from the Agra merchant',
        trigger: { type: 'dialog', dialogTreeId: 'quest_agra_merchant' },
        onComplete: {
          giveItems: [{ itemId: 'fort_seal', quantity: 1 }],
          setFlags: ['has_fort_seal'],
          message: 'You obtained the Fort Seal.',
        },
      },
      {
        id: 'get_fort_key_2',
        description: 'Find the hidden passage map in Mathura ruins',
        trigger: { type: 'position', tileX: 153, tileY: 117, radius: 3 },
        onComplete: {
          giveItems: [{ itemId: 'old_map_fragment', quantity: 1 }],
          setFlags: ['has_passage_map'],
          message: 'You found the hidden passage map!',
        },
      },
      {
        id: 'approach_fort',
        description: 'Approach Agra Fort with both keys',
        trigger: { type: 'position', tileX: 156, tileY: 114, radius: 5 },
        onComplete: {
          setFlags: ['fort_approach'],
          dialogTreeId: 'quest_fort_entry',
          message: 'The ancient fort looms ahead. Your keys grant entry...',
        },
      },
    ],
    nextQuestId: 'MAIN_08_ORDEAL',
  },

  MAIN_08_ORDEAL: {
    id: 'MAIN_08_ORDEAL',
    stage: 8,
    act: 'initiation',
    title: 'The Corruption Within',
    description: 'Infiltrate Agra Fort and confront the source of the corruption — an Asura bound by dark mantras.',
    location: 'Agra Fort Interior',
    steps: [
      {
        id: 'fight_asura',
        description: 'Face the Corrupted Asura',
        trigger: { type: 'auto' },
        onComplete: {
          startBattleWithEnemy: 'corrupted_asura',
          message: 'The Corrupted Asura awakens!',
        },
      },
      {
        id: 'defeat_boss',
        description: 'Defeat the Corrupted Asura!',
        trigger: { type: 'flag', flag: 'asura_defeated' },
        onComplete: {
          setFlags: ['ordeal_complete'],
          giveItems: [
            { itemId: 'imperial_decree', quantity: 1 },
            { itemId: 'sanad_deccan', quantity: 1 },
            { itemId: 'sanad_bengal', quantity: 1 },
          ],
          unlockRegions: ['m', 'c', 'x', 'v', '$', 'b', 'j', 'w', 'o'],
          giveGold: 500,
          message: 'The Asura falls! You reclaim the Imperial Decree. Central and Eastern India are now open to you.',
        },
      },
    ],
    nextQuestId: 'MAIN_09_REWARD',
  },

  MAIN_09_REWARD: {
    id: 'MAIN_09_REWARD',
    stage: 9,
    act: 'initiation',
    title: 'Seizing the Sword',
    description: 'With the Imperial Decree, you can command low-rank Mansabdars. Return to Delhi to claim your authority.',
    location: 'Delhi',
    steps: [
      {
        id: 'return_delhi_decree',
        description: 'Present the Imperial Decree to Vizier Mirza in Delhi',
        trigger: { type: 'dialog', dialogTreeId: 'quest_decree_return' },
        onComplete: {
          setFlags: ['decree_presented', 'mansabdar_rank'],
          giveItems: [{ itemId: 'sanad_south', quantity: 1 }, { itemId: 'sanad_northeast', quantity: 1 }],
          unlockRegions: ['k', 'f', '@', '#', 's', 'z', 'a', 'e', 'n', 'i', 'q', 't'],
          message: 'You are appointed Mansabdar! All regions of India are now open to you.',
        },
      },
    ],
    nextQuestId: 'MAIN_10_ROAD_BACK',
  },

  // === ACT III: RETURN ===

  MAIN_10_ROAD_BACK: {
    id: 'MAIN_10_ROAD_BACK',
    stage: 10,
    act: 'return',
    title: 'The Emperor\'s Wrath',
    description: 'The Emperor\'s elite Zulfikar guards have been sent after you. Travel south to escape their reach.',
    location: 'Southern India',
    steps: [
      {
        id: 'reach_south',
        description: 'Flee south — reach Hampi in Karnataka',
        trigger: { type: 'position', tileX: 120, tileY: 360, radius: 8 },
        onComplete: {
          setFlags: ['reached_hampi'],
          message: 'The ruins of Vijayanagara offer shelter. But at what cost?',
          dialogTreeId: 'quest_mentor_loss',
        },
      },
      {
        id: 'mentor_farewell',
        description: 'Witness the Mentor\'s sacrifice',
        trigger: { type: 'flag', flag: 'mentor_fallen' },
        onComplete: {
          setFlags: ['mentor_lost'],
          message: 'Guru Arjun is gone... but his teachings live on in you.',
        },
      },
    ],
    nextQuestId: 'MAIN_11_RESURRECTION',
  },

  MAIN_11_RESURRECTION: {
    id: 'MAIN_11_RESURRECTION',
    stage: 11,
    act: 'return',
    title: 'The Final Stand',
    description: 'The Cosmic Imbalance must be resolved. Travel to Varanasi — the spiritual center of the world.',
    location: 'Varanasi',
    steps: [
      {
        id: 'reach_varanasi',
        description: 'Reach Varanasi for the final confrontation',
        trigger: { type: 'position', tileX: 216, tileY: 132, radius: 8 },
        onComplete: {
          setFlags: ['at_varanasi_final'],
          dialogTreeId: 'quest_final_choice',
          message: 'The sacred Ganga flows before you. The final battle awaits.',
        },
      },
      {
        id: 'fight_final_boss',
        description: 'Face the Source of the Cosmic Imbalance',
        trigger: { type: 'auto' },
        onComplete: {
          startBattleWithEnemy: 'cosmic_asura',
          message: 'The Source of Imbalance manifests!',
        },
      },
      {
        id: 'final_battle',
        description: 'Defeat the Source of the Cosmic Imbalance!',
        trigger: { type: 'flag', flag: 'final_boss_defeated' },
        onComplete: {
          setFlags: ['imbalance_resolved'],
          giveGold: 1000,
          message: 'Balance is restored! The corruption fades from the land.',
        },
      },
    ],
    nextQuestId: 'MAIN_12_RETURN',
  },

  MAIN_12_RETURN: {
    id: 'MAIN_12_RETURN',
    stage: 12,
    act: 'return',
    title: 'Home Again',
    description: 'Return to your village in Mathura. The world reflects your choices.',
    location: 'Mathura, UP',
    steps: [
      {
        id: 'return_home',
        description: 'Return to Mathura village',
        trigger: { type: 'position', tileX: 150, tileY: 108, radius: 6 },
        onComplete: {
          setFlags: ['game_complete'],
          dialogTreeId: 'quest_epilogue',
          message: 'You have returned home. Your journey is complete.',
        },
      },
    ],
  },
};

// Quest progression order
export const QUEST_ORDER = [
  'MAIN_01_ORDINARY',
  'MAIN_02_CALL',
  'MAIN_03_REFUSAL',
  'MAIN_04_MENTOR',
  'MAIN_05_THRESHOLD',
  'MAIN_06_TESTS',
  'MAIN_07_APPROACH',
  'MAIN_08_ORDEAL',
  'MAIN_09_REWARD',
  'MAIN_10_ROAD_BACK',
  'MAIN_11_RESURRECTION',
  'MAIN_12_RETURN',
];
