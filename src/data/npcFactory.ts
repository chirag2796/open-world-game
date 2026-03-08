import {
  NPC, Position, Direction, SocialClass, SocialIdentity,
  MansabdariZat, ScheduleEntry,
} from '../types';

// NPC name pools by social class
const NAMES: Record<SocialClass, string[]> = {
  peasant: ['Ram', 'Sita', 'Gopal', 'Lakshmi', 'Bhola', 'Kamla', 'Dhani', 'Rukmini'],
  artisan: ['Vishwakarma', 'Nandu', 'Parvati', 'Keshav', 'Meera', 'Todar'],
  merchant: ['Seth Govindas', 'Banarsidas', 'Mulla Abdul', 'Jagat Seth', 'Hirabai', 'Virji Vohra'],
  soldier: ['Sipahi Khan', 'Pratap Singh', 'Faujdar Ali', 'Rana Karan', 'Baz Bahadur'],
  noble: ['Mansabdar Iqbal', 'Raja Todar Mal', 'Mirza Hakim', 'Rani Durgavati', 'Nawab Saif'],
  priest: ['Pandit Raghunath', 'Mullah Badauni', 'Sant Tulsidas', 'Sufi Nizamuddin', 'Swami Haridas'],
  scholar: ['Hakim Luqman', 'Abu Fazl', 'Birbal', 'Faizi', 'Mian Tansen'],
  royal: ['Prince Salim', 'Rani Hada', 'Sultan Ibrahim', 'Begum Nur'],
};

const TITLES: Record<SocialClass, string[]> = {
  peasant: ['Farmer', 'Labourer', 'Cowherd', 'Weaver'],
  artisan: ['Blacksmith', 'Potter', 'Carpenter', 'Jeweller'],
  merchant: ['Trader', 'Bania', 'Sarraf', 'Caravan Master'],
  soldier: ['Sipahi', 'Risaldar', 'Qiladar', 'Faujdar'],
  noble: ['Mansabdar', 'Zamindar', 'Jagirdar', 'Amir'],
  priest: ['Pandit', 'Mullah', 'Sant', 'Sufi', 'Swami'],
  scholar: ['Hakim', 'Munshi', 'Danishmand', 'Ustad'],
  royal: ['Raja', 'Nawab', 'Sultan', 'Begum'],
};

// Simple dialog by class
const FALLBACK_DIALOG: Record<SocialClass, string[][]> = {
  peasant: [
    ['The rains have been kind this year.', 'May your journey be safe, traveller.'],
    ['Have you seen the new well? The mansabdar ordered it built.', 'Fresh water at last!'],
  ],
  artisan: [
    ['I forge the finest blades in this district.', 'Need anything repaired?'],
    ['The sandstone here is perfect for carving.', 'The temples will stand for centuries.'],
  ],
  merchant: [
    ['Trade is the lifeblood of the empire!', 'I have wares from across Hindustan.'],
    ['The Grand Trunk Road brings all manner of goods.', 'Care to browse?'],
  ],
  soldier: [
    ['Keep moving, citizen. Nothing to see here.'],
    ['The mansabdar keeps these roads safe.', 'Report any bandits to the nearest outpost.'],
  ],
  noble: [
    ['I serve the Padshah with my zat and sawar.', 'The empire thrives under firm rule.'],
    ['My jagir extends three kos in every direction.', 'Treat the peasants fairly and they prosper.'],
  ],
  priest: [
    ['Dharma sustains all creation.', 'Seek truth, not gold, young one.'],
    ['The divine is in all things.', 'Peace be upon you, traveller.'],
  ],
  scholar: [
    ['Knowledge is the greatest treasure.', 'I study the movements of the stars.'],
    ['The Ain-i-Akbari records all things.', 'Even the Emperor values learning.'],
  ],
  royal: [
    ['We welcome all who come in peace to our court.'],
    ['The burdens of rule are heavy, but necessary.'],
  ],
};

// Schedule templates by class
const SCHEDULE_TEMPLATES: Partial<Record<SocialClass, (origin: Position) => ScheduleEntry[]>> = {
  merchant: (origin) => [
    { startHour: 6, endHour: 8, position: origin, behavior: 'wander', dialog: 'Setting up shop...' },
    { startHour: 8, endHour: 18, position: origin, behavior: 'stationary', dialog: 'Welcome! Browse my wares.' },
    { startHour: 18, endHour: 22, position: { x: origin.x + 2, y: origin.y + 1 }, behavior: 'wander' },
    { startHour: 22, endHour: 6, position: { x: origin.x + 3, y: origin.y + 2 }, behavior: 'stationary', dialog: 'The shop is closed. Come back tomorrow.' },
  ],
  priest: (origin) => [
    { startHour: 4, endHour: 7, position: origin, behavior: 'stationary', dialog: 'I am in morning prayer. Speak softly.' },
    { startHour: 7, endHour: 12, position: origin, behavior: 'wander' },
    { startHour: 12, endHour: 14, position: { x: origin.x - 1, y: origin.y }, behavior: 'stationary' },
    { startHour: 14, endHour: 20, position: origin, behavior: 'wander' },
    { startHour: 20, endHour: 4, position: { x: origin.x + 1, y: origin.y + 1 }, behavior: 'stationary', dialog: 'It is late. Seek shelter, friend.' },
  ],
  soldier: (origin) => [
    { startHour: 6, endHour: 18, position: origin, behavior: 'guard' },
    { startHour: 18, endHour: 22, position: { x: origin.x + 2, y: origin.y }, behavior: 'wander' },
    { startHour: 22, endHour: 6, position: { x: origin.x + 3, y: origin.y + 1 }, behavior: 'stationary' },
  ],
};

let _npcCounter = 0;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createNPC(opts: {
  socialClass: SocialClass;
  position: Position;
  settlement: string;
  zatRank?: MansabdariZat;
  faction?: string;
  dialogTreeId?: string;
  name?: string;
  direction?: Direction;
}): NPC {
  const {
    socialClass, position, settlement, zatRank, faction,
    dialogTreeId, direction = 'down',
  } = opts;

  const id = `npc_${socialClass}_${++_npcCounter}`;
  const name = opts.name || pick(NAMES[socialClass]);
  const title = pick(TITLES[socialClass]);
  const dialog = pick(FALLBACK_DIALOG[socialClass]);

  const social: SocialIdentity = {
    title,
    socialClass,
    ...(zatRank ? { zatRank } : {}),
    ...(faction ? { faction } : {}),
  };

  const scheduleFactory = SCHEDULE_TEMPLATES[socialClass];
  const schedule = scheduleFactory ? scheduleFactory(position) : undefined;

  const behavior: NPC['behavior'] = schedule ? 'scheduled' : (
    socialClass === 'soldier' ? 'guard' :
    socialClass === 'peasant' || socialClass === 'artisan' ? 'wander' :
    'stationary'
  );

  return {
    id,
    name,
    position,
    direction,
    dialog,
    dialogTreeId,
    settlement,
    behavior,
    wanderRadius: behavior === 'wander' ? 3 : undefined,
    social,
    schedule,
  };
}

// Generate a cluster of NPCs for a settlement
export function generateSettlementNPCs(
  settlementName: string,
  center: Position,
  type: 'village' | 'city' | 'capital',
): NPC[] {
  const npcs: NPC[] = [];

  const configs: { socialClass: SocialClass; count: number; zatRank?: MansabdariZat; dialogTreeId?: string }[] =
    type === 'village' ? [
      { socialClass: 'peasant', count: 3 },
      { socialClass: 'merchant', count: 1, dialogTreeId: 'trader_intro' },
      { socialClass: 'priest', count: 1, dialogTreeId: 'sage_intro' },
    ] : type === 'city' ? [
      { socialClass: 'peasant', count: 2 },
      { socialClass: 'artisan', count: 2 },
      { socialClass: 'merchant', count: 2, dialogTreeId: 'trader_intro' },
      { socialClass: 'soldier', count: 2, dialogTreeId: 'guard_intro' },
      { socialClass: 'noble', count: 1, zatRank: 200, dialogTreeId: 'official_intro' },
      { socialClass: 'priest', count: 1, dialogTreeId: 'sage_intro' },
    ] : [ // capital
      { socialClass: 'peasant', count: 2 },
      { socialClass: 'artisan', count: 3 },
      { socialClass: 'merchant', count: 3, dialogTreeId: 'trader_intro' },
      { socialClass: 'soldier', count: 4, dialogTreeId: 'guard_intro' },
      { socialClass: 'noble', count: 2, zatRank: 1000, dialogTreeId: 'official_intro' },
      { socialClass: 'scholar', count: 1 },
      { socialClass: 'priest', count: 2, dialogTreeId: 'sage_intro' },
      { socialClass: 'royal', count: 1, zatRank: 5000 },
    ];

  for (const cfg of configs) {
    for (let i = 0; i < cfg.count; i++) {
      // Spread NPCs around the center
      const offsetX = Math.floor(Math.random() * 7) - 3;
      const offsetY = Math.floor(Math.random() * 7) - 3;
      npcs.push(createNPC({
        socialClass: cfg.socialClass,
        position: { x: center.x + offsetX, y: center.y + offsetY },
        settlement: settlementName,
        zatRank: cfg.zatRank,
        dialogTreeId: cfg.dialogTreeId,
      }));
    }
  }

  return npcs;
}
