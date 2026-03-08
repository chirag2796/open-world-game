import { CombatMove } from '../types';

// Combat move catalogue — each enemy and player has up to 4 moves
export const MOVES: Record<string, CombatMove> = {
  // === SOLDIER type moves ===
  sword_slash: {
    id: 'sword_slash', name: 'Sword Slash', type: 'soldier',
    power: 45, accuracy: 95, priority: 0,
    description: 'A swift slash with a blade.',
  },
  shield_bash: {
    id: 'shield_bash', name: 'Shield Bash', type: 'soldier',
    power: 35, accuracy: 100, priority: 0,
    effect: 'lower_def', effectChance: 30,
    description: 'Bash with a shield. May lower defense.',
  },
  quick_strike: {
    id: 'quick_strike', name: 'Quick Strike', type: 'soldier',
    power: 30, accuracy: 100, priority: 1,
    description: 'A fast strike that always goes first.',
  },
  war_cry: {
    id: 'war_cry', name: 'War Cry', type: 'soldier',
    power: 0, accuracy: 100, priority: 0,
    effect: 'boost_atk',
    description: 'A battle cry that raises attack.',
  },
  arrow_volley: {
    id: 'arrow_volley', name: 'Arrow Volley', type: 'soldier',
    power: 55, accuracy: 85, priority: 0,
    description: 'A rain of arrows from above.',
  },

  // === BEAST type moves ===
  claw_rake: {
    id: 'claw_rake', name: 'Claw Rake', type: 'beast',
    power: 50, accuracy: 90, priority: 0,
    description: 'Vicious claws tear at the foe.',
  },
  fang_bite: {
    id: 'fang_bite', name: 'Fang Bite', type: 'beast',
    power: 60, accuracy: 85, priority: 0,
    description: 'Powerful jaws clamp down.',
  },
  wild_charge: {
    id: 'wild_charge', name: 'Wild Charge', type: 'beast',
    power: 70, accuracy: 80, priority: 0,
    description: 'A reckless charge with full force.',
  },
  howl: {
    id: 'howl', name: 'Howl', type: 'beast',
    power: 0, accuracy: 100, priority: 0,
    effect: 'boost_atk',
    description: 'A terrifying howl that boosts attack.',
  },
  venom_sting: {
    id: 'venom_sting', name: 'Venom Sting', type: 'beast',
    power: 35, accuracy: 95, priority: 0,
    effect: 'poison', effectChance: 40,
    description: 'A toxic sting that may poison.',
  },

  // === MYTHIC type moves ===
  divine_light: {
    id: 'divine_light', name: 'Divine Light', type: 'mythic',
    power: 55, accuracy: 90, priority: 0,
    description: 'A burst of celestial energy.',
  },
  mantra_blast: {
    id: 'mantra_blast', name: 'Mantra Blast', type: 'mythic',
    power: 70, accuracy: 80, priority: 0,
    description: 'Ancient mantras unleash destructive force.',
  },
  spirit_heal: {
    id: 'spirit_heal', name: 'Spirit Heal', type: 'mythic',
    power: 0, accuracy: 100, priority: 0,
    effect: 'heal_self',
    description: 'Restorative spiritual energy.',
  },
  astral_strike: {
    id: 'astral_strike', name: 'Astral Strike', type: 'mythic',
    power: 45, accuracy: 100, priority: 1,
    description: 'A swift strike from the astral plane.',
  },

  // === AUTOMATON type moves ===
  iron_fist: {
    id: 'iron_fist', name: 'Iron Fist', type: 'automaton',
    power: 55, accuracy: 90, priority: 0,
    description: 'A devastating mechanical punch.',
  },
  stone_wall: {
    id: 'stone_wall', name: 'Stone Wall', type: 'automaton',
    power: 0, accuracy: 100, priority: 0,
    effect: 'boost_def',
    description: 'Harden defenses like stone.',
  },
  boulder_throw: {
    id: 'boulder_throw', name: 'Boulder Throw', type: 'automaton',
    power: 75, accuracy: 75, priority: 0,
    description: 'Hurl a massive boulder.',
  },
  grind: {
    id: 'grind', name: 'Grind', type: 'automaton',
    power: 40, accuracy: 100, priority: 0,
    effect: 'lower_def', effectChance: 50,
    description: 'Grinding attack that weakens armor.',
  },

  // === NAGA type moves ===
  serpent_strike: {
    id: 'serpent_strike', name: 'Serpent Strike', type: 'naga',
    power: 50, accuracy: 90, priority: 0,
    description: 'A swift serpentine lunge.',
  },
  venom_spray: {
    id: 'venom_spray', name: 'Venom Spray', type: 'naga',
    power: 40, accuracy: 95, priority: 0,
    effect: 'poison', effectChance: 60,
    description: 'Spray of toxic venom.',
  },
  constrict: {
    id: 'constrict', name: 'Constrict', type: 'naga',
    power: 60, accuracy: 85, priority: 0,
    description: 'Squeeze the life from the foe.',
  },
  mystic_coil: {
    id: 'mystic_coil', name: 'Mystic Coil', type: 'naga',
    power: 65, accuracy: 85, priority: 0,
    description: 'An enchanted spiral attack.',
  },
};

// Default player moves (soldier type — player is a warrior)
export const DEFAULT_PLAYER_MOVES = ['sword_slash', 'shield_bash', 'quick_strike', 'war_cry'];
