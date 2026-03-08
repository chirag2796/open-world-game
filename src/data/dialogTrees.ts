import { DialogTree } from '../types';
import { QUEST_DIALOG_TREES } from './questDialogs';
import { SIDE_QUEST_DIALOG_TREES } from './sideQuestDialogs';

// Branching dialogue trees with karma effects
// Convention: node IDs are tree_id + '_' + short label

// Convert side quest dialog array to Record
const sideQuestDialogRecord: Record<string, DialogTree> = {};
for (const tree of SIDE_QUEST_DIALOG_TREES) {
  sideQuestDialogRecord[tree.id] = tree;
}

export const DIALOG_TREES: Record<string, DialogTree> = {
  // Include all quest dialog trees
  ...QUEST_DIALOG_TREES,
  // Include all side quest dialog trees
  ...sideQuestDialogRecord,
  // === SPIRITUAL SAGE ===
  sage_intro: {
    id: 'sage_intro',
    startNodeId: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Sage',
        text: 'Namaste, traveller. The dust of many roads clings to you. What brings you to this humble ashram?',
        choices: [
          { text: 'I seek wisdom, Guruji.', karmaEffect: 2, nextNodeId: 'wisdom' },
          { text: 'I need directions to the next town.', karmaEffect: 0, nextNodeId: 'directions' },
          { text: 'Got anything valuable in there?', karmaEffect: -3, nextNodeId: 'rude' },
        ],
      },
      wisdom: {
        id: 'wisdom',
        speaker: 'Sage',
        text: 'Dharma is the path that sustains all things. Act with righteousness, and the world opens its doors to you. Here — take this for your journey.',
        giveItem: 'healing_herb',
        nextNodeId: 'farewell_good',
      },
      directions: {
        id: 'directions',
        speaker: 'Sage',
        text: 'Follow the river east. You will find a settlement before the sun sets. May your path be clear.',
        nextNodeId: 'farewell_neutral',
      },
      rude: {
        id: 'rude',
        speaker: 'Sage',
        text: 'Greed clouds the mind like monsoon clouds the sky. I have nothing for those who seek only gain.',
        nextNodeId: 'farewell_bad',
      },
      farewell_good: {
        id: 'farewell_good',
        speaker: 'Sage',
        text: 'Walk in dharma, child. We shall meet again.',
        setFlag: 'met_sage',
      },
      farewell_neutral: {
        id: 'farewell_neutral',
        speaker: 'Sage',
        text: 'Safe travels.',
      },
      farewell_bad: {
        id: 'farewell_bad',
        speaker: 'Sage',
        text: 'Reflect on your ways before the road reflects them back at you.',
      },
    },
  },

  // === MUGHAL TRADER ===
  trader_intro: {
    id: 'trader_intro',
    startNodeId: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Trader',
        text: 'Ah, a fellow traveller! I have spices from Kerala, silk from Bengal, and steel from Rajputana. What interests you?',
        choices: [
          { text: 'Show me your wares.', karmaEffect: 0, nextNodeId: 'shop' },
          { text: 'Tell me about the trade routes.', karmaEffect: 1, nextNodeId: 'routes' },
          { text: 'The roads are dangerous. Pay me for protection.', karmaEffect: -5, nextNodeId: 'extort' },
        ],
      },
      shop: {
        id: 'shop',
        speaker: 'Trader',
        text: 'Browse freely! Fair prices, I assure you. The Emperor himself would approve.',
      },
      routes: {
        id: 'routes',
        speaker: 'Trader',
        text: 'The Grand Trunk Road connects Kabul to Bengal — safest path through the empire. But bandits lurk near the Chambal ravines. Be wary south of Agra.',
        nextNodeId: 'routes_tip',
      },
      routes_tip: {
        id: 'routes_tip',
        speaker: 'Trader',
        text: 'Here, take this for your kindness in listening to an old merchant ramble.',
        giveGold: 15,
      },
      extort: {
        id: 'extort',
        speaker: 'Trader',
        text: 'Protection? Hah! The Mughal road patrols protect honest traders. Guards! Guards!',
        setFlag: 'angered_traders',
      },
    },
  },

  // === COURT OFFICIAL ===
  official_intro: {
    id: 'official_intro',
    startNodeId: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Official',
        text: 'You stand before a servant of the Padshah. State your business, and be brief.',
        choices: [
          { text: '(Kornish) I offer my respects, Sahib.', karmaEffect: 1, nextNodeId: 'respectful' },
          { text: 'I carry a letter from the Emperor.', karmaEffect: 0, nextNodeId: 'letter', requiredItem: 'emperors_letter' },
          { text: 'Who made you so important?', karmaEffect: -3, nextNodeId: 'disrespect' },
        ],
      },
      respectful: {
        id: 'respectful',
        speaker: 'Official',
        text: 'Good manners are rare these days. The court is in session at the Diwan-i-Am. You may observe, but do not speak unless spoken to.',
        setFlag: 'court_access',
      },
      letter: {
        id: 'letter',
        speaker: 'Official',
        text: 'The imperial seal! Forgive my tone. You are expected. Follow me to the Diwan-i-Khas — the Hall of Private Audience.',
        setFlag: 'imperial_audience',
        giveGold: 50,
      },
      disrespect: {
        id: 'disrespect',
        speaker: 'Official',
        text: 'Insolence! You are fortunate I am in a merciful mood. Leave before I summon the guards.',
      },
    },
  },

  // === VILLAGE ELDER ===
  elder_intro: {
    id: 'elder_intro',
    startNodeId: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Elder',
        text: 'Welcome to our village, stranger. Times are hard — the monsoon was weak and bandits grow bold. Can you help us?',
        choices: [
          { text: 'What can I do?', karmaEffect: 1, nextNodeId: 'quest' },
          { text: 'I have my own troubles.', karmaEffect: -1, nextNodeId: 'refuse' },
          { text: 'I can help, but it will cost you.', karmaEffect: -2, nextNodeId: 'mercenary' },
        ],
      },
      quest: {
        id: 'quest',
        speaker: 'Elder',
        text: 'Bandits have been raiding our stores. If you can drive them away, the village will reward you. They camp in the ravines to the south.',
        setFlag: 'bandit_quest',
      },
      refuse: {
        id: 'refuse',
        speaker: 'Elder',
        text: 'I understand. The road is hard for everyone. May Bhagwan protect you.',
      },
      mercenary: {
        id: 'mercenary',
        speaker: 'Elder',
        text: 'We are poor folk, but we can offer what little we have. Clear the bandits and you will be paid fairly.',
        setFlag: 'bandit_quest_mercenary',
      },
    },
  },

  // === GUARD ===
  guard_intro: {
    id: 'guard_intro',
    startNodeId: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Guard',
        text: 'Halt! This area is under the protection of the local mansabdar. State your purpose.',
        choices: [
          { text: 'Just passing through peacefully.', karmaEffect: 0, nextNodeId: 'pass' },
          { text: '(Show trade permit)', karmaEffect: 0, nextNodeId: 'permit', requiredItem: 'trade_permit' },
          { text: 'Step aside or face my blade.', karmaEffect: -5, nextNodeId: 'threaten' },
        ],
      },
      pass: {
        id: 'pass',
        speaker: 'Guard',
        text: 'Very well. Keep to the main roads and cause no trouble. The mansabdar has eyes everywhere.',
      },
      permit: {
        id: 'permit',
        speaker: 'Guard',
        text: 'A trade permit! You may pass freely. The market is through the main gate. Good trading to you.',
      },
      threaten: {
        id: 'threaten',
        speaker: 'Guard',
        text: 'Fool! You dare threaten a soldier of the empire? You will regret this!',
        setFlag: 'hostile_guards',
      },
    },
  },
};
