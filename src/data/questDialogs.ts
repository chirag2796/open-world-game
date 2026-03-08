import { DialogTree } from '../types';

// Quest-specific dialog trees for the main campaign
// These are referenced by quest steps and quest NPCs

export const QUEST_DIALOG_TREES: Record<string, DialogTree> = {
  // === STAGE 1: Ordinary World ===
  quest_elder_start: {
    id: 'quest_elder_start',
    startNodeId: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        speaker: 'Elder Devrath',
        text: 'Ah, there you are, child. I have been waiting for you. These are troubling times for our village.',
        nextNodeId: 'explain',
      },
      explain: {
        id: 'explain',
        speaker: 'Elder Devrath',
        text: 'The road builders uncovered something at the construction site south of here. Strange markings... and the workers refuse to dig further.',
        nextNodeId: 'request',
      },
      request: {
        id: 'request',
        speaker: 'Elder Devrath',
        text: 'You are young and brave. Go to the site and investigate. It is just south of the village, past the old well.',
        choices: [
          { text: 'I will go at once, Elder.', karmaEffect: 2, nextNodeId: 'dharma_response' },
          { text: 'What is in it for me?', karmaEffect: -1, nextNodeId: 'selfish_response' },
          { text: 'I am afraid... but I will try.', karmaEffect: 1, nextNodeId: 'humble_response' },
        ],
      },
      dharma_response: {
        id: 'dharma_response',
        speaker: 'Elder Devrath',
        text: 'That is the spirit of dharma! Your ancestors would be proud. Go now — and be careful. Take these herbs for the road.',
        giveItem: 'healing_herb',
        setFlag: 'elder_dharma_path',
      },
      selfish_response: {
        id: 'selfish_response',
        speaker: 'Elder Devrath',
        text: 'Hmm... always the pragmatist. Very well — find something valuable and you may keep a share. But remember, the village needs you.',
        giveGold: 10,
        setFlag: 'elder_ambition_path',
      },
      humble_response: {
        id: 'humble_response',
        speaker: 'Elder Devrath',
        text: 'Courage is not the absence of fear, child. It is acting despite it. Here — take my walking staff. It may serve you well.',
        giveItem: 'bamboo_staff',
        setFlag: 'elder_humble_path',
      },
    },
  },

  // === STAGE 1-2: Discover the Talwar ===
  quest_discover_talwar: {
    id: 'quest_discover_talwar',
    startNodeId: 'scene',
    nodes: {
      scene: {
        id: 'scene',
        speaker: 'Narrator',
        text: 'The construction site is a mess of overturned earth and abandoned tools. In the center, something gleams beneath the mud...',
        nextNodeId: 'dig',
      },
      dig: {
        id: 'dig',
        speaker: 'Narrator',
        text: 'You brush away the soil and reveal a curved blade — a Talwar of ancient make. Its hilt is inlaid with faded gold script.',
        nextNodeId: 'bandits',
      },
      bandits: {
        id: 'bandits',
        speaker: 'Narrator',
        text: 'Suddenly, rough voices call out from behind you. "That blade belongs to us now, villager!" Three bandits emerge from the ravine.',
        setFlag: 'bandits_appeared',
      },
    },
  },

  // === STAGE 3: The Choice ===
  quest_talwar_choice: {
    id: 'quest_talwar_choice',
    startNodeId: 'dilemma',
    nodes: {
      dilemma: {
        id: 'dilemma',
        speaker: 'Narrator',
        text: 'You hold the Ancestral Talwar. Its blade seems to pulse with a faint warmth. Elder Devrath watches you carefully.',
        nextNodeId: 'choice',
      },
      choice: {
        id: 'choice',
        speaker: 'Elder Devrath',
        text: 'That blade is no ordinary weapon. It belonged to a great warrior who defended this land centuries ago. What will you do with it?',
        choices: [
          {
            text: 'I will use it to protect the village, as its owner once did.',
            karmaEffect: 10,
            nextNodeId: 'dharma_choice',
          },
          {
            text: 'A blade like this could make me powerful. I will keep it for myself.',
            karmaEffect: -10,
            nextNodeId: 'ambition_choice',
          },
          {
            text: 'I will report it to the local Mansabdar — it may be imperial property.',
            karmaEffect: 5,
            nextNodeId: 'duty_choice',
          },
        ],
      },
      dharma_choice: {
        id: 'dharma_choice',
        speaker: 'Elder Devrath',
        text: 'The blade has chosen well. You carry the weight of dharma now. A retired Mansabdar named Guru Arjun lives on the outskirts — he can teach you to wield it properly.',
        setFlag: 'talwar_choice_dharma',
      },
      ambition_choice: {
        id: 'ambition_choice',
        speaker: 'Elder Devrath',
        text: 'I see the fire in your eyes. Power is seductive, child. Seek Guru Arjun on the outskirts — even ambition needs discipline to survive.',
        setFlag: 'talwar_choice_ambition',
      },
      duty_choice: {
        id: 'duty_choice',
        speaker: 'Elder Devrath',
        text: 'A wise choice. But the Mansabdar is far away. For now, seek Guru Arjun — he was once a Mansabdar himself. He will know what to do.',
        setFlag: 'talwar_choice_duty',
      },
    },
  },

  // === STAGE 4: The Mentor ===
  quest_mentor_intro: {
    id: 'quest_mentor_intro',
    startNodeId: 'approach',
    nodes: {
      approach: {
        id: 'approach',
        speaker: 'Narrator',
        text: 'On the edge of the village, beneath an ancient banyan tree, sits an old man polishing a worn scabbard. His eyes are sharp despite his age.',
        nextNodeId: 'greeting',
      },
      greeting: {
        id: 'greeting',
        speaker: 'Guru Arjun',
        text: 'So... the Talwar has resurfaced at last. I have waited many years for this moment.',
        nextNodeId: 'reveal',
      },
      reveal: {
        id: 'reveal',
        speaker: 'Guru Arjun',
        text: 'I am Arjun, once a Mansabdar of the 2000-zat rank. I retired here when I saw the corruption spreading through the empire like poison through water.',
        nextNodeId: 'explain',
      },
      explain: {
        id: 'explain',
        speaker: 'Guru Arjun',
        text: 'That blade you carry — it was forged to fight the Cosmic Imbalance. A force that corrupts those in power, turning dharma into adharma.',
        nextNodeId: 'offer',
      },
      offer: {
        id: 'offer',
        speaker: 'Guru Arjun',
        text: 'I can train you in the ways of combat and the old traditions. But you must prove your resolve. Win three battles in the wilderness, and I will share what I know.',
        choices: [
          { text: 'I am ready to learn, Guruji.', karmaEffect: 2, nextNodeId: 'accept' },
          { text: 'Teach me the strongest techniques first.', karmaEffect: -2, nextNodeId: 'impatient' },
        ],
      },
      accept: {
        id: 'accept',
        speaker: 'Guru Arjun',
        text: 'Patience and humility — good. Take this ring. It belonged to my old regiment. When you have proven yourself in three battles, return to me.',
        setFlag: 'mentor_training_start',
      },
      impatient: {
        id: 'impatient',
        speaker: 'Guru Arjun',
        text: 'Ha! You remind me of myself at your age. Very well — but strength without discipline is a fire without a hearth. Prove yourself first. Three battles.',
        setFlag: 'mentor_training_start',
      },
    },
  },

  quest_mentor_sendoff: {
    id: 'quest_mentor_sendoff',
    startNodeId: 'return',
    nodes: {
      return: {
        id: 'return',
        speaker: 'Guru Arjun',
        text: 'You have done well. I see the fire of a true warrior in you now.',
        nextNodeId: 'mission',
      },
      mission: {
        id: 'mission',
        speaker: 'Guru Arjun',
        text: 'The corruption I spoke of — it centers on the imperial court. You must go to Shahjahanabad and seek Vizier Mirza. He is an old friend... or was.',
        nextNodeId: 'warning',
      },
      warning: {
        id: 'warning',
        speaker: 'Guru Arjun',
        text: 'Be careful who you trust in Delhi. The empire\'s splendor hides many daggers. I will follow when I can. May dharma guide your path.',
        setFlag: 'mentor_sendoff_done',
      },
    },
  },

  // === STAGE 5: Crossing the Threshold ===
  quest_vizier_mission: {
    id: 'quest_vizier_mission',
    startNodeId: 'audience',
    nodes: {
      audience: {
        id: 'audience',
        speaker: 'Vizier Mirza',
        text: 'You carry Arjun\'s ring... and that blade. I thought both were lost to history.',
        nextNodeId: 'concern',
      },
      concern: {
        id: 'concern',
        speaker: 'Vizier Mirza',
        text: 'The empire faces a crisis. Strange forces have corrupted the old fort at Agra. Our soldiers who enter... do not return the same.',
        nextNodeId: 'task',
      },
      task: {
        id: 'task',
        speaker: 'Vizier Mirza',
        text: 'I need someone the court does not suspect — an outsider. Travel west to Rajputana first. The Rajputs have intelligence we need.',
        nextNodeId: 'reward',
      },
      reward: {
        id: 'reward',
        speaker: 'Vizier Mirza',
        text: 'Take this Sanad — it grants you passage through Rajputana. Prove yourself there, and greater rewards will follow.',
        choices: [
          { text: 'I serve the empire and dharma, Sahib.', karmaEffect: 3, nextNodeId: 'dharma_accept' },
          { text: 'What is the pay for this mission?', karmaEffect: -2, nextNodeId: 'mercenary_accept' },
        ],
      },
      dharma_accept: {
        id: 'dharma_accept',
        speaker: 'Vizier Mirza',
        text: 'Arjun chose his student well. Go with the blessings of the court. The Rajput fortress of Amber awaits.',
        giveGold: 50,
      },
      mercenary_accept: {
        id: 'mercenary_accept',
        speaker: 'Vizier Mirza',
        text: 'Direct, I see. Very well — complete this mission and you will be richly rewarded. Gold, rank, and land. Now go.',
        giveGold: 100,
        setFlag: 'vizier_mercenary_deal',
      },
    },
  },

  // === STAGE 6: Tests & Allies ===
  quest_rajput_alliance: {
    id: 'quest_rajput_alliance',
    startNodeId: 'gate',
    nodes: {
      gate: {
        id: 'gate',
        speaker: 'Rajput Vikram',
        text: 'Halt, traveler! Few outsiders are welcome in Amber. What brings you to the fortress of the Rajputs?',
        nextNodeId: 'show_sanad',
      },
      show_sanad: {
        id: 'show_sanad',
        speaker: 'Narrator',
        text: 'You present the Vizier\'s Sanad. Vikram\'s eyes widen as he reads the imperial seal.',
        nextNodeId: 'revelation',
      },
      revelation: {
        id: 'revelation',
        speaker: 'Rajput Vikram',
        text: 'The Vizier sent you? Then the rumors are true — the corruption has reached even Delhi. We Rajputs have seen its effects in the desert creatures.',
        nextNodeId: 'task',
      },
      task: {
        id: 'task',
        speaker: 'Rajput Vikram',
        text: 'Prove your worth against the desert\'s dangers. Defeat five creatures in our lands, and the Rajput clans will support your cause.',
      },
    },
  },

  quest_rajput_reward: {
    id: 'quest_rajput_reward',
    startNodeId: 'ceremony',
    nodes: {
      ceremony: {
        id: 'ceremony',
        speaker: 'Rajput Vikram',
        text: 'You fight with honor! The desert has tested you, and you have not been found wanting.',
        nextNodeId: 'gift',
      },
      gift: {
        id: 'gift',
        speaker: 'Rajput Vikram',
        text: 'Accept this Steel Khanda — forged in the fires of Rajputana. It has served our warriors for generations. Now it serves you.',
        nextNodeId: 'intel',
      },
      intel: {
        id: 'intel',
        speaker: 'Rajput Vikram',
        text: 'The corruption emanates from within Agra Fort. You will need the Fort Seal to enter — speak with the merchant Ratan in Agra. And find the old passage map.',
        setFlag: 'rajput_intel_received',
      },
    },
  },

  // === STAGE 7: Approach ===
  quest_agra_merchant: {
    id: 'quest_agra_merchant',
    startNodeId: 'approach',
    nodes: {
      approach: {
        id: 'approach',
        speaker: 'Merchant Ratan',
        text: 'You seek the Fort Seal? Few ask for such things openly... The Rajputs sent you, yes?',
        nextNodeId: 'deal',
      },
      deal: {
        id: 'deal',
        speaker: 'Merchant Ratan',
        text: 'I have it hidden. The guards would arrest me if they knew. But for the right cause...',
        choices: [
          { text: 'The empire needs this. Please help us.', karmaEffect: 2, nextNodeId: 'give_dharma' },
          { text: 'Name your price.', karmaEffect: -1, nextNodeId: 'give_gold' },
        ],
      },
      give_dharma: {
        id: 'give_dharma',
        speaker: 'Merchant Ratan',
        text: 'You speak with conviction. Take it — and restore honor to Agra. I ask nothing in return but safety for my family.',
        setFlag: 'merchant_helped_freely',
      },
      give_gold: {
        id: 'give_gold',
        speaker: 'Merchant Ratan',
        text: 'Two hundred gold pieces. A fair price for risking my neck.',
        // In practice the gold deduction would happen in the quest system
        setFlag: 'merchant_paid',
      },
    },
  },

  quest_fort_entry: {
    id: 'quest_fort_entry',
    startNodeId: 'gates',
    nodes: {
      gates: {
        id: 'gates',
        speaker: 'Narrator',
        text: 'The massive gates of Agra Fort loom before you. The Fort Seal opens a hidden passage marked on your map.',
        nextNodeId: 'enter',
      },
      enter: {
        id: 'enter',
        speaker: 'Narrator',
        text: 'Inside, the air grows thick with an unnatural haze. The walls pulse with a faint, sickly glow. Something powerful — and corrupted — waits within.',
        setFlag: 'entered_fort',
      },
    },
  },

  // === STAGE 9: Reward ===
  quest_decree_return: {
    id: 'quest_decree_return',
    startNodeId: 'present',
    nodes: {
      present: {
        id: 'present',
        speaker: 'Vizier Mirza',
        text: 'By the heavens... you recovered the Imperial Decree! The court had given it up for lost.',
        nextNodeId: 'promotion',
      },
      promotion: {
        id: 'promotion',
        speaker: 'Vizier Mirza',
        text: 'For your service, I hereby appoint you Mansabdar of the 1000-zat rank. You may travel freely across all provinces of the empire.',
        nextNodeId: 'warning',
      },
      warning: {
        id: 'warning',
        speaker: 'Vizier Mirza',
        text: 'But be warned — the Emperor grows suspicious of those who hold too much power. His Zulfikar guards answer only to him. Tread carefully.',
        setFlag: 'vizier_warning_given',
      },
    },
  },

  // === STAGE 10: Road Back ===
  quest_mentor_loss: {
    id: 'quest_mentor_loss',
    startNodeId: 'arrival',
    nodes: {
      arrival: {
        id: 'arrival',
        speaker: 'Narrator',
        text: 'Among the ancient ruins of Hampi, you find Guru Arjun waiting. But something is wrong — he looks pale, weakened.',
        nextNodeId: 'reveal',
      },
      reveal: {
        id: 'reveal',
        speaker: 'Guru Arjun',
        text: 'The Zulfikar caught up to me on the road. I held them off... but at a cost.',
        nextNodeId: 'farewell',
      },
      farewell: {
        id: 'farewell',
        speaker: 'Guru Arjun',
        text: 'Listen carefully. The source of the Imbalance — it is in Varanasi, where the veil between worlds is thinnest. You must go there... finish what we started.',
        nextNodeId: 'final_words',
      },
      final_words: {
        id: 'final_words',
        speaker: 'Guru Arjun',
        text: 'Remember what I taught you. Dharma is not just duty — it is truth itself. Whatever choice you make at the end... make it your own.',
        setFlag: 'mentor_fallen',
      },
    },
  },

  // === STAGE 11: Final Choice ===
  quest_final_choice: {
    id: 'quest_final_choice',
    startNodeId: 'arrival',
    nodes: {
      arrival: {
        id: 'arrival',
        speaker: 'Narrator',
        text: 'The sacred ghats of Varanasi shimmer in an otherworldly light. The Cosmic Imbalance manifests as a dark rift above the river.',
        nextNodeId: 'choice',
      },
      choice: {
        id: 'choice',
        speaker: 'Narrator',
        text: 'A voice echoes from the rift: "Choose, mortal. Restore the old order... or seize the power for yourself and forge a new one."',
        choices: [
          {
            text: 'I choose Dharma. The balance must be restored, no matter the cost.',
            karmaEffect: 20,
            nextNodeId: 'dharma_path',
          },
          {
            text: 'I choose Power. I will reshape this world as I see fit.',
            karmaEffect: -20,
            nextNodeId: 'ambition_path',
          },
        ],
      },
      dharma_path: {
        id: 'dharma_path',
        speaker: 'Narrator',
        text: 'Light streams from the Ancestral Talwar as you raise it toward the rift. The corruption screams and takes form — a massive Asura of pure darkness emerges for the final battle.',
        setFlag: 'chose_dharma_final',
      },
      ambition_path: {
        id: 'ambition_path',
        speaker: 'Narrator',
        text: 'Dark energy flows into you from the rift, empowering you beyond mortal limits. But the corruption fights back — it will not be tamed so easily. The Asura emerges, enraged.',
        setFlag: 'chose_ambition_final',
      },
    },
  },

  // === STAGE 12: Epilogue ===
  quest_epilogue: {
    id: 'quest_epilogue',
    startNodeId: 'return',
    nodes: {
      return: {
        id: 'return',
        speaker: 'Narrator',
        text: 'The village of Mathura is at peace. The fields are green, the river runs clear, and the people go about their lives.',
        nextNodeId: 'reflection',
      },
      reflection: {
        id: 'reflection',
        speaker: 'Elder Devrath',
        text: 'You have returned! The whole land speaks of your deeds. Come — let me see the person you have become.',
        nextNodeId: 'ending',
      },
      ending: {
        id: 'ending',
        speaker: 'Elder Devrath',
        text: 'Whatever path you chose, you changed this world. And this world changed you. Rest now, hero. Your journey is complete... for now.',
        setFlag: 'epilogue_done',
      },
    },
  },
};
