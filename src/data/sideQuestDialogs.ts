// Dialog trees for side quests
// Each tree features karma-affecting choices that set butterfly flags
// These flags create long-term narrative consequences (Butterfly Effect)

import { DialogTree } from '../types';

export const SIDE_QUEST_DIALOG_TREES: DialogTree[] = [

  // ═══════════════════════════════════════════════════════════
  // DELHI CORRUPTION CHAIN
  // ═══════════════════════════════════════════════════════════

  {
    id: 'sq_delhi_merchant_theft',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Merchant Fatima',
        text: 'Please, you must help me! My imperial trade sanad was stolen right here in the bazaar! Without it, I cannot do business — my family will starve.',
        choices: [
          { text: 'I will help you find it.', karmaEffect: 2, nextNodeId: 'accept' },
          { text: 'What is in it for me?', karmaEffect: -1, nextNodeId: 'negotiate' },
          { text: 'Not my problem.', karmaEffect: -3, nextNodeId: 'refuse' },
        ],
      },
      accept: {
        id: 'accept',
        speaker: 'Merchant Fatima',
        text: 'Bless you! The thief ran toward the southern gate. A beggar there might have seen something. Hurry, before the trail goes cold!',
        setFlag: 'sq_delhi_theft_started',
      },
      negotiate: {
        id: 'negotiate',
        speaker: 'Merchant Fatima',
        text: 'I... I can pay you 50 gold coins. Please, it is all I have. The thief went toward the southern gate.',
        setFlag: 'sq_delhi_theft_started',
      },
      refuse: {
        id: 'refuse',
        speaker: 'Merchant Fatima',
        text: 'Then go. The world is cruel enough without people who turn away from suffering.',
      },
    },
  },

  {
    id: 'sq_delhi_witness',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Beggar',
        text: 'You looking for that rat who ran through here? I saw him... but my memory needs... refreshing.',
        choices: [
          { text: 'Here, take 5 gold for your trouble.', karmaEffect: 1, nextNodeId: 'pay' },
          { text: 'Tell me or face consequences.', karmaEffect: -2, nextNodeId: 'threaten' },
          { text: 'I can see you are hungry. Take this food.', karmaEffect: 3, nextNodeId: 'kind', requiredItem: 'healing_herb' },
        ],
      },
      pay: {
        id: 'pay',
        speaker: 'Beggar',
        text: 'Generous! The thief hid something in a clay pot near the well, northeast of here. He was wearing the clothes of a palace servant.',
        setFlag: 'sq_delhi_witness_found',
      },
      threaten: {
        id: 'threaten',
        speaker: 'Beggar',
        text: 'Alright, alright! He stuffed something in a pot by the well! He wore palace servant clothes. Now leave me be!',
        setFlag: 'sq_delhi_witness_found',
      },
      kind: {
        id: 'kind',
        speaker: 'Beggar',
        text: 'You are a good soul. The thief — he hid the paper in a clay pot near the well. And listen... he wore the uniform of a palace revenue clerk. This goes higher than a common theft.',
        setFlag: 'sq_delhi_witness_found',
        giveItem: 'thiefs_lockpick',
      },
    },
  },

  {
    id: 'sq_delhi_sanad_choice',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'narrator',
        text: 'You hold the stolen sanad. You could return it to the merchant — or keep it for leverage. The sanad grants valuable trade privileges.',
        choices: [
          { text: 'Return it to the merchant. It is the right thing.', karmaEffect: 5, nextNodeId: 'return' },
          { text: 'Keep it. These trade privileges could be useful.', karmaEffect: -5, nextNodeId: 'keep' },
          { text: 'Return it, but investigate who sent the thief.', karmaEffect: 3, nextNodeId: 'investigate' },
        ],
      },
      return: {
        id: 'return',
        speaker: 'Merchant Fatima',
        text: 'You have saved my livelihood! May the Almighty bless your path. Take this gold as thanks — and know you have a friend in Delhi.',
        setFlag: 'sq_returned_sanad',
        giveGold: 50,
      },
      keep: {
        id: 'keep',
        speaker: 'narrator',
        text: 'You pocket the sanad. Its trade privileges may open doors... but you have made an enemy of a desperate merchant.',
        setFlag: 'sq_kept_sanad',
      },
      investigate: {
        id: 'investigate',
        speaker: 'Merchant Fatima',
        text: 'You return the sanad AND want to find the true culprit? The thief wore palace clothes... this theft was ordered by someone powerful. Be careful, friend.',
        setFlag: 'sq_returned_sanad',
        giveGold: 50,
      },
    },
  },

  {
    id: 'sq_delhi_official_confront',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Revenue Official',
        text: 'What do you want? I am a busy man. The revenue of the empire does not collect itself.',
        choices: [
          { text: 'I know you ordered the sanad theft. Confess.', karmaEffect: 2, nextNodeId: 'confront', requiredFlag: 'sq_returned_sanad' },
          { text: 'I have a sanad that could cause you trouble...', karmaEffect: -3, nextNodeId: 'blackmail', requiredFlag: 'sq_kept_sanad' },
          { text: 'I have evidence of your corruption. Resign quietly.', karmaEffect: 4, nextNodeId: 'expose' },
        ],
      },
      confront: {
        id: 'confront',
        speaker: 'Revenue Official',
        text: 'You... you have no proof! Guards! ... Wait. Fine. I will stop. But cross me again and you will regret it.',
        setFlag: 'sq_exposed_official',
      },
      blackmail: {
        id: 'blackmail',
        speaker: 'Revenue Official',
        text: 'I see you are a pragmatist. Take this gold and forget what you know. We could be useful to each other.',
        setFlag: 'sq_blackmailed_official',
        giveGold: 200,
      },
      expose: {
        id: 'expose',
        speaker: 'Revenue Official',
        text: 'No! Please... I have a family. I only did it because the treasury demands impossible quotas. I will resign. Just... do not tell the Vizier.',
        setFlag: 'sq_exposed_official',
      },
    },
  },

  {
    id: 'sq_delhi_treasury_entry',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'narrator',
        text: 'The treasury wing of the Red Fort is heavily guarded. You need a way past.',
        choices: [
          { text: 'Use the lockpick to sneak through a side entrance.', karmaEffect: 0, nextNodeId: 'stealth', requiredItem: 'thiefs_lockpick' },
          { text: 'Challenge the guards directly.', karmaEffect: 0, nextNodeId: 'fight' },
          { text: 'Show the Vizier\'s letter for official access.', karmaEffect: 1, nextNodeId: 'official', requiredFlag: 'elder_spoken' },
        ],
      },
      stealth: {
        id: 'stealth',
        speaker: 'narrator',
        text: 'The lockpick clicks. A hidden passage opens into the treasury archives. No one notices your entry.',
        setFlag: 'sq_delhi_treasury_entered',
      },
      fight: {
        id: 'fight',
        speaker: 'narrator',
        text: 'The guards draw their swords. You will have to fight your way through.',
        setFlag: 'sq_delhi_treasury_entered',
      },
      official: {
        id: 'official',
        speaker: 'Guard Captain',
        text: 'The Vizier sent you? Very well, but I will be watching. Proceed to the archives.',
        setFlag: 'sq_delhi_treasury_entered',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // RAJASTHAN CARAVAN CHAIN
  // ═══════════════════════════════════════════════════════════

  {
    id: 'sq_raj_caravan_start',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Merchant Govind',
        text: 'Namaste, traveler! I need a brave soul to escort my spice caravan to Amber. The road is crawling with bandits. Will you help?',
        choices: [
          { text: 'I will protect your caravan. Lead the way.', karmaEffect: 2, nextNodeId: 'accept' },
          { text: 'How much will you pay?', karmaEffect: 0, nextNodeId: 'negotiate' },
        ],
      },
      accept: {
        id: 'accept',
        speaker: 'Merchant Govind',
        text: 'Excellent! Here is the manifest. Stay close to the wagons and keep your eyes on the dunes. Bandits strike fast in this desert.',
        setFlag: 'sq_raj_caravan_accepted',
      },
      negotiate: {
        id: 'negotiate',
        speaker: 'Merchant Govind',
        text: '80 gold and two pouches of rare spices — worth more than gold in the northern markets. Fair?',
        nextNodeId: 'accept_after',
      },
      accept_after: {
        id: 'accept_after',
        speaker: 'narrator',
        text: 'You agree to the terms and take the caravan manifest.',
        setFlag: 'sq_raj_caravan_accepted',
      },
    },
  },

  {
    id: 'sq_raj_caravan_reward',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Merchant Govind',
        text: 'We made it! The spices are safe thanks to you. You have the gratitude of every merchant on the Pushkar-Amber road.',
        setFlag: 'sq_raj_caravan_delivered',
        giveGold: 80,
      },
    },
  },

  {
    id: 'sq_raj_fortress_approach',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'narrator',
        text: 'The bandit fortress rises from the desert ruins. You can see guards patrolling the walls. How do you approach?',
        choices: [
          { text: 'Sneak around and find a back entrance.', karmaEffect: 0, nextNodeId: 'stealth' },
          { text: 'March up and challenge them openly.', karmaEffect: 1, nextNodeId: 'assault' },
          { text: 'Wait for nightfall and climb the walls.', karmaEffect: 0, nextNodeId: 'night' },
        ],
      },
      stealth: {
        id: 'stealth',
        speaker: 'narrator',
        text: 'You find a crumbling section of wall and slip inside undetected. The chief is in the main hall.',
        setFlag: 'sq_raj_stealth_entry',
      },
      assault: {
        id: 'assault',
        speaker: 'Bandit Lookout',
        text: 'Intruder! Sound the alarm! The chief will deal with this fool personally!',
      },
      night: {
        id: 'night',
        speaker: 'narrator',
        text: 'Under cover of darkness, you scale the walls. Most guards are asleep. The chief\'s quarters lie ahead.',
        setFlag: 'sq_raj_stealth_entry',
      },
    },
  },

  {
    id: 'sq_raj_chief_mercy',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Bandit Chief',
        text: 'Ugh... you fight well. I yield. My men raid because the Rajput lords tax us into starvation. Kill me if you must.',
        choices: [
          { text: 'You will hang for your crimes.', karmaEffect: -2, nextNodeId: 'kill' },
          { text: 'Disband your gang and I will spare you.', karmaEffect: 5, nextNodeId: 'spare' },
          { text: 'Join me. Your skills could serve a better cause.', karmaEffect: 2, nextNodeId: 'recruit' },
        ],
      },
      kill: {
        id: 'kill',
        speaker: 'narrator',
        text: 'The bandit chief falls. The remaining bandits scatter into the desert. Justice is served — but was there a better way?',
        setFlag: 'sq_raj_chief_killed',
      },
      spare: {
        id: 'spare',
        speaker: 'Bandit Chief',
        text: 'You are a fool... but a merciful one. We will disband. Perhaps some of my men can find honest work. You have my word.',
        setFlag: 'sq_raj_chief_spared',
      },
      recruit: {
        id: 'recruit',
        speaker: 'Bandit Chief',
        text: 'Ha! You have nerve. Fine — I will remember this debt. When you need allies in the desert, send word.',
        setFlag: 'sq_raj_chief_spared',
        // sq_raj_chief_ally set via quest step onComplete
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // VARANASI SPIRITS CHAIN
  // ═══════════════════════════════════════════════════════════

  {
    id: 'sq_var_ghats_rumor',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Fisherman Ramu',
        text: 'Sahib, please do not go to the burning ghat after dark! Three men have vanished this week. We hear screams from across the water... inhuman screams.',
        choices: [
          { text: 'I will investigate. Show me where they disappeared.', karmaEffect: 2, nextNodeId: 'accept' },
          { text: 'Sounds like superstition to me.', karmaEffect: -1, nextNodeId: 'skeptic' },
        ],
      },
      accept: {
        id: 'accept',
        speaker: 'Fisherman Ramu',
        text: 'The Almighty protect you. The ghat is south along the river. The creature comes when the funeral pyres die low.',
        setFlag: 'sq_var_ghats_investigated',
      },
      skeptic: {
        id: 'skeptic',
        speaker: 'Fisherman Ramu',
        text: 'Superstition? Tell that to the widows of the missing men. Go see for yourself if you dare — south ghat, after dark.',
        setFlag: 'sq_var_ghats_investigated',
      },
    },
  },

  {
    id: 'sq_var_scholar_necro',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Pandit Sharma',
        text: 'You slew the Pishacha? But it was merely a servant. The ancient texts speak of necromancers who bind these creatures. There are ruins south of Varanasi where dark rituals were once performed.',
        choices: [
          { text: 'I will find this necromancer and end the threat.', karmaEffect: 2, nextNodeId: 'accept' },
          { text: 'What do the texts say about weaknesses?', karmaEffect: 1, nextNodeId: 'research' },
        ],
      },
      accept: {
        id: 'accept',
        speaker: 'Pandit Sharma',
        text: 'Be cautious. The necromancer draws power from stolen funeral ashes. Destroy the ash vessels and his power will weaken.',
        setFlag: 'sq_var_necro_trail',
      },
      research: {
        id: 'research',
        speaker: 'Pandit Sharma',
        text: 'The necromancer uses clay vessels filled with funeral ash as power conduits. Smash them first, then face the sorcerer directly. The ruins lie due south.',
        setFlag: 'sq_var_necro_trail',
      },
    },
  },

  {
    id: 'sq_var_necro_aftermath',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'narrator',
        text: 'The necromancer lies defeated. His dark artifacts are scattered around the ritual chamber. What do you do?',
        choices: [
          { text: 'Destroy all the dark artifacts. No one should have this power.', karmaEffect: 5, nextNodeId: 'destroy' },
          { text: 'Keep one artifact for study. Knowledge is power.', karmaEffect: -2, nextNodeId: 'keep' },
          { text: 'Seal the chamber and report to the Pandit.', karmaEffect: 3, nextNodeId: 'seal' },
        ],
      },
      destroy: {
        id: 'destroy',
        speaker: 'narrator',
        text: 'You smash every vessel and burn every scroll. The dark energy dissipates. The dead of Varanasi can rest in peace at last.',
        setFlag: 'sq_var_necro_artifacts_destroyed',
      },
      keep: {
        id: 'keep',
        speaker: 'narrator',
        text: 'You pocket a small vessel of binding ash. It pulses with cold energy. This could be useful... or dangerous.',
        setFlag: 'sq_var_necro_artifacts_kept',
      },
      seal: {
        id: 'seal',
        speaker: 'narrator',
        text: 'You collapse the entrance and mark the location. The Pandit can send scholars to properly dispose of the artifacts.',
        setFlag: 'sq_var_necro_artifacts_destroyed',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // KERALA LOTUS CHAIN
  // ═══════════════════════════════════════════════════════════

  {
    id: 'sq_kerala_healer_start',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Vaidya Kamala',
        text: 'I can brew the legendary Soma Elixir — but I need the rare lotus that blooms in the garden south of here. The garden belongs to a wealthy Nair lord. He refuses to sell.',
        choices: [
          { text: 'I will find a way to get the lotus.', karmaEffect: 1, nextNodeId: 'accept' },
          { text: 'What exactly does this Soma Elixir do?', karmaEffect: 0, nextNodeId: 'ask' },
        ],
      },
      accept: {
        id: 'accept',
        speaker: 'Vaidya Kamala',
        text: 'The garden is guarded, but the walls are old. Be careful — the lord\'s men are not gentle with trespassers.',
        setFlag: 'sq_kerala_lotus_quest',
      },
      ask: {
        id: 'ask',
        speaker: 'Vaidya Kamala',
        text: 'The Soma Elixir permanently strengthens the body. Ancient Vedic warriors used it before great battles. Will you help?',
        nextNodeId: 'accept',
      },
    },
  },

  {
    id: 'sq_kerala_garden_access',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'narrator',
        text: 'The garden is surrounded by stone walls. A guard patrols the gate. How do you proceed?',
        choices: [
          { text: 'Bribe the guard with gold.', karmaEffect: -1, nextNodeId: 'bribe' },
          { text: 'Climb the wall when the guard looks away.', karmaEffect: 0, nextNodeId: 'sneak' },
          { text: 'Politely request entry, explaining the healer\'s need.', karmaEffect: 2, nextNodeId: 'diplomacy' },
        ],
      },
      bribe: {
        id: 'bribe',
        speaker: 'Garden Guard',
        text: 'Hmm... 20 gold, you say? Fine. Be quick and do not touch anything else.',
        setFlag: 'sq_kerala_bribed_guard',
      },
      sneak: {
        id: 'sneak',
        speaker: 'narrator',
        text: 'You scale the mossy wall and drop silently into the garden. The lotus pond glimmers ahead.',
        setFlag: 'sq_kerala_snuck_in',
      },
      diplomacy: {
        id: 'diplomacy',
        speaker: 'Garden Guard',
        text: 'A healer needs it? ... The master\'s daughter was sick last monsoon and a healer saved her. Go in. But take only what you need.',
        setFlag: 'sq_kerala_garden_entered',
      },
    },
  },

  {
    id: 'sq_kerala_healer_return',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Vaidya Kamala',
        text: 'The lotus! Perfect specimen. Give me a moment to prepare the elixir...',
        nextNodeId: 'brew',
      },
      brew: {
        id: 'brew',
        speaker: 'Vaidya Kamala',
        text: 'It is done. Drink the Soma Elixir and feel the strength of the ancient Vedic warriors flow through you!',
        setFlag: 'sq_kerala_lotus_delivered',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // MADHYA PRADESH CIPHER CHAIN
  // ═══════════════════════════════════════════════════════════

  {
    id: 'sq_mp_hakim_cipher',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Alchemist Hakim',
        text: 'Ah, you! I have discovered a fragment of an ancient cipher — astronomical calculations that could reveal the location of a lost Mughal treasure vault. But the key to decode it is a Persian scroll locked in Gwalior Fort.',
        choices: [
          { text: 'I will retrieve the scroll from Gwalior.', karmaEffect: 1, nextNodeId: 'accept' },
          { text: 'A treasure vault? Tell me more first.', karmaEffect: 0, nextNodeId: 'details' },
        ],
      },
      accept: {
        id: 'accept',
        speaker: 'Alchemist Hakim',
        text: 'The scroll is in the sealed library on the upper level of the fort. The Mughal governor sealed it decades ago. You will need to be resourceful to get in.',
        setFlag: 'sq_mp_cipher_quest',
      },
      details: {
        id: 'details',
        speaker: 'Alchemist Hakim',
        text: 'Emperor Akbar hid astronomical instruments and rare texts across India. This cipher points to one such cache. The scroll in Gwalior holds the decryption key.',
        nextNodeId: 'accept',
      },
    },
  },

  {
    id: 'sq_mp_gwalior_entry',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'narrator',
        text: 'Gwalior Fort\'s library wing is sealed with an iron door. A guard stands watch. How do you enter?',
        choices: [
          { text: 'Pick the lock when the guard patrols away.', karmaEffect: 0, nextNodeId: 'stealth' },
          { text: 'Convince the guard you are a scholar with permission.', karmaEffect: 1, nextNodeId: 'bluff' },
          { text: 'Overpower the guard.', karmaEffect: -2, nextNodeId: 'force' },
        ],
      },
      stealth: {
        id: 'stealth',
        speaker: 'narrator',
        text: 'The lock yields with a click. You slip into the dusty library unnoticed.',
        setFlag: 'sq_mp_used_stealth',
      },
      bluff: {
        id: 'bluff',
        speaker: 'Guard',
        text: 'A scholar? Hmm... the Hakim of Bhopal did send word about a research request. Fine, go in. But touch nothing without permission.',
        setFlag: 'sq_mp_library_entered',
      },
      force: {
        id: 'force',
        speaker: 'narrator',
        text: 'You knock the guard unconscious and break the lock. Brutal, but effective.',
        setFlag: 'sq_mp_used_combat',
      },
    },
  },

  {
    id: 'sq_mp_hakim_decode',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Alchemist Hakim',
        text: 'The scroll! Let me see... yes, these astronomical tables match the cipher perfectly. The calculations point to a vault beneath the great mosque of Bhopal. Incredible!',
        nextNodeId: 'reward',
      },
      reward: {
        id: 'reward',
        speaker: 'Alchemist Hakim',
        text: 'Take this Soma Elixir as payment — I brewed it from rare herbs. And the treasure vault... that is a quest for another day. But remember: Hakim always repays his debts.',
        setFlag: 'sq_mp_cipher_decoded',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════
  // STANDALONE QUEST DIALOGS
  // ═══════════════════════════════════════════════════════════

  {
    id: 'sq_hampi_priest_artifact',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Priest Vidyaranya',
        text: 'The Vijayanagara kings hid sacred artifacts in the northern ruins when the empire fell. One — a jade amulet of protection — lies buried there. But the ruins are guarded by stone automatons.',
        choices: [
          { text: 'I will brave the ruins and recover the amulet.', karmaEffect: 2, nextNodeId: 'accept' },
          { text: 'Stone automatons? How dangerous are they?', karmaEffect: 0, nextNodeId: 'ask' },
        ],
      },
      accept: {
        id: 'accept',
        speaker: 'Priest Vidyaranya',
        text: 'May the gods protect you. The ruins are north of the main temple complex. Look for a fallen pillar marking the entrance.',
        setFlag: 'sq_hampi_artifact_quest',
      },
      ask: {
        id: 'ask',
        speaker: 'Priest Vidyaranya',
        text: 'They were built by the kings to guard their treasures for eternity. Strong, but slow. Use speed and cunning.',
        nextNodeId: 'accept',
      },
    },
  },

  {
    id: 'sq_assam_refugees_start',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Refugee Woman',
        text: 'Please, sahib! We fled from raiders across the river. My children are cold and hungry. The crossing is blocked by river bandits. We cannot go forward or back.',
        choices: [
          { text: 'I will clear the crossing for you. Stay here.', karmaEffect: 3, nextNodeId: 'accept' },
          { text: 'I can escort you all the way to Guwahati.', karmaEffect: 5, nextNodeId: 'full_escort' },
        ],
      },
      accept: {
        id: 'accept',
        speaker: 'Refugee Woman',
        text: 'Thank you! The bandits camp at the narrow crossing east of here. Please be careful.',
        setFlag: 'sq_assam_escort_started',
      },
      full_escort: {
        id: 'full_escort',
        speaker: 'Refugee Woman',
        text: 'All the way? You are truly sent by the gods. The children will feel safe with a warrior beside us.',
        setFlag: 'sq_assam_escort_started',
      },
    },
  },

  {
    id: 'sq_assam_refugees_thanks',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Refugee Woman',
        text: 'We are safe! Guwahati! The children are laughing again. We have nothing to give you but our prayers and gratitude.',
        nextNodeId: 'end',
      },
      end: {
        id: 'end',
        speaker: 'narrator',
        text: 'The family finds shelter in Guwahati. Word of your deed spreads through the region. Your reputation in Assam grows.',
        setFlag: 'sq_assam_refugees_safe',
      },
    },
  },

  {
    id: 'sq_goa_trader_start',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Trader Fernandes',
        text: 'The Portuguese captain demands 40% of all spice exports. This is robbery! I need someone to negotiate — or find leverage against them.',
        choices: [
          { text: 'I will negotiate fair terms for both sides.', karmaEffect: 2, nextNodeId: 'accept_fair' },
          { text: 'I can find dirt on the Portuguese to use as leverage.', karmaEffect: -1, nextNodeId: 'accept_leverage' },
        ],
      },
      accept_fair: {
        id: 'accept_fair',
        speaker: 'Trader Fernandes',
        text: 'Fair terms... that would be a miracle. The Portuguese captain is at the port. Speak with him.',
        setFlag: 'sq_goa_trade_quest',
      },
      accept_leverage: {
        id: 'accept_leverage',
        speaker: 'Trader Fernandes',
        text: 'I hear the captain has been smuggling gems on the side, cheating his own crown. If you can find proof...',
        setFlag: 'sq_goa_trade_quest',
      },
    },
  },

  {
    id: 'sq_goa_negotiate',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Portuguese Captain',
        text: 'So the locals send a negotiator. Very well. What do you propose?',
        choices: [
          { text: '20% tariff, fair to both sides. Your king gets his cut, locals keep their livelihoods.', karmaEffect: 3, nextNodeId: 'fair' },
          { text: 'I know about the gem smuggling. Accept 15% or the Viceroy hears of it.', karmaEffect: -2, nextNodeId: 'blackmail' },
          { text: 'Form a joint trading company. 50-50 partnership, everyone profits.', karmaEffect: 4, nextNodeId: 'alliance' },
        ],
      },
      fair: {
        id: 'fair',
        speaker: 'Portuguese Captain',
        text: 'Hmm... 20% is lower than I wanted, but you speak sense. The crown will accept this. Deal.',
        setFlag: 'sq_goa_fair_trade',
      },
      blackmail: {
        id: 'blackmail',
        speaker: 'Portuguese Captain',
        text: 'You... how did you... Fine! 15%, and you will destroy that evidence. We have an understanding.',
        setFlag: 'sq_goa_sabotaged_portuguese',
      },
      alliance: {
        id: 'alliance',
        speaker: 'Portuguese Captain',
        text: 'A joint company? That is... actually brilliant. Portugal brings ships, India brings spices. We all profit. I accept.',
        setFlag: 'sq_goa_allied_portuguese',
      },
    },
  },
];
