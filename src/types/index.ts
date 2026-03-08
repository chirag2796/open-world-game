// Core types for India Open World RPG

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export enum TileType {
  // Natural terrain
  OCEAN = 0,
  BEACH = 1,
  PLAINS = 2,
  FOREST = 3,
  DENSE_JUNGLE = 4,
  DESERT = 5,
  MOUNTAIN = 6,
  SNOW = 7,
  PLATEAU = 8,
  SWAMP = 9,
  RIVER = 10,
  FARM = 11,
  // Settlement
  PATH_DIRT = 12,
  PATH_STONE = 13,
  WALL_MUD = 14,
  WALL_STONE = 15,
  ROOF = 16,
  DOOR = 17,
  MARKET = 18,
  TEMPLE = 19,
  FORT_WALL = 20,
  PALACE = 21,
  WELL = 22,
  GARDEN = 23,
  // New terrain variety
  DEEP_OCEAN = 24,
  SHALLOW_WATER = 25,
  ICE = 26,
  TALL_GRASS = 27,
  SAND_DUNES = 28,
  TREE_PINE = 29,
  TREE_PALM = 30,
  TREE_BANYAN = 31,
  CLIFF = 32,
  ROCKS = 33,
  FLOWERS = 34,
  RUINS = 35,
  BRIDGE = 36,
  CAMPSITE = 37,
  HUT = 38,
  LAKE = 39,
  // Indo-Saracenic architecture
  SANDSTONE = 40,
  MARBLE = 41,
  DOME = 42,
  ARCH = 43,
  JALI = 44,
  MINARET = 45,
  CHHATRI = 46,
  BAORI_WALL = 47,
  BAORI_WATER = 48,
  PIETRA_DURA = 49,
  COURTYARD = 50,
  HAVELI_WALL = 51,
  MUGHAL_GATE = 52,
  MOSQUE = 53,
  BORDER_POST = 54,
  CANAL = 55,
  CHARBAGH = 56,
}

export const SOLID_TILES = new Set([
  TileType.OCEAN,
  TileType.DEEP_OCEAN,
  TileType.MOUNTAIN,
  TileType.SNOW,
  TileType.ICE,
  TileType.WALL_MUD,
  TileType.WALL_STONE,
  TileType.ROOF,
  TileType.FORT_WALL,
  TileType.PALACE,
  TileType.WELL,
  TileType.CLIFF,
  TileType.ROCKS,
  TileType.RUINS,
  TileType.HUT,
  TileType.LAKE,
  TileType.SANDSTONE,
  TileType.DOME,
  TileType.JALI,
  TileType.MINARET,
  TileType.CHHATRI,
  TileType.BAORI_WALL,
  TileType.HAVELI_WALL,
  TileType.MUGHAL_GATE,
  TileType.MOSQUE,
  TileType.BORDER_POST,
]);

// Tiles that can trigger random encounters
export const ENCOUNTER_TILES = new Set([
  TileType.TALL_GRASS,
  TileType.DENSE_JUNGLE,
  TileType.SWAMP,
  TileType.SAND_DUNES,
]);

export type BiomeType =
  | 'ocean' | 'snow' | 'mountain' | 'desert' | 'plains'
  | 'forest' | 'dense_forest' | 'plateau' | 'wetland' | 'coastal';

export interface SettlementDef {
  name: string;
  type: 'village' | 'city' | 'capital';
  tileX: number;
  tileY: number;
}

export interface StateDef {
  code: string;
  name: string;
  biome: BiomeType;
  settlements: SettlementDef[];
}

export interface TileMapData {
  width: number;
  height: number;
  ground: TileType[][];
  decor: (TileType | -1)[][]; // decoration layer (-1 = empty)
}

export type NPCBehavior = 'stationary' | 'wander' | 'patrol' | 'guard' | 'scheduled';

// Mansabdari rank system — historical decimal-based hierarchy
export type MansabdariZat =
  | 10 | 20 | 50 | 100 | 200 | 500
  | 1000 | 2000 | 3000 | 5000 | 7000 | 10000;

export type SocialClass =
  | 'peasant'       // farmers, laborers
  | 'artisan'       // craftsmen, builders
  | 'merchant'      // traders, bankers
  | 'soldier'       // warriors, guards
  | 'noble'         // mansabdars, zamindars
  | 'priest'        // pandits, mullahs, saints
  | 'scholar'       // hakims, astronomers
  | 'royal';        // emperors, rajas

export interface SocialIdentity {
  title: string;           // e.g. "Mansabdar", "Hakim", "Zamindar"
  socialClass: SocialClass;
  zatRank?: MansabdariZat; // only for mansabdars/nobles
  faction?: string;        // e.g. "Mughal Court", "Rajput Alliance"
}

// Time-based NPC schedule
export interface ScheduleEntry {
  startHour: number; // 0-23
  endHour: number;
  position: Position;
  behavior: NPCBehavior;
  dialog?: string;   // context-specific greeting override
}

// Branching dialogue with karma effects
export interface DialogChoice {
  text: string;
  karmaEffect: number;       // -10 to +10 per choice
  nextNodeId: string;
  requiredKarma?: number;     // min karma to show this option
  requiredItem?: string;      // item ID needed to show option
}

export interface DialogNode {
  id: string;
  speaker: string;            // NPC name or 'narrator'
  text: string;
  choices?: DialogChoice[];   // if absent, auto-advance
  nextNodeId?: string;        // for linear nodes (no choices)
  giveItem?: string;          // item ID to give player
  giveGold?: number;
  setFlag?: string;           // set a story flag
  requireFlag?: string;       // only show if flag is set
}

export interface DialogTree {
  id: string;
  startNodeId: string;
  nodes: Record<string, DialogNode>;
}

export interface NPC {
  id: string;
  name: string;
  position: Position;
  direction: Direction;
  dialog: string[];           // simple dialog (fallback)
  dialogTreeId?: string;      // branching dialog reference
  settlement: string;
  behavior: NPCBehavior;
  wanderRadius?: number;
  patrolPath?: Position[];
  social?: SocialIdentity;
  schedule?: ScheduleEntry[];
  shopItems?: string[];       // item IDs for merchants
}

export interface DialogState {
  active: boolean;
  npcName: string;
  lines: string[];
  currentLine: number;
  // Branching dialog state
  treeId?: string;
  currentNodeId?: string;
  choices?: DialogChoice[];
}

// Inventory system
export type ItemCategory = 'weapons' | 'armor' | 'items' | 'key_items';

export type EquipSlot = 'weapon' | 'head' | 'body' | 'legs' | 'accessory';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type WeaponMaterial = 'wood' | 'iron' | 'steel' | 'wootz' | 'celestial';

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  icon: string;
  stackable: boolean;
  usable: boolean;
  equipSlot?: EquipSlot;
  attack?: number;
  defense?: number;
  speed?: number;        // speed bonus (negative = slower)
  weight?: number;       // equipment weight (reduces effective speed)
  crit?: number;         // critical hit chance bonus (0-100)
  effect?: string;
  value: number;
  rarity?: ItemRarity;
  material?: WeaponMaterial;
  history?: string;      // historical flavor text
}

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

export interface EquipState {
  weapon: string | null;
  head: string | null;
  body: string | null;
  legs: string | null;
  accessory: string | null;
}

// Battle system — creature types and type effectiveness

export type CreatureType = 'mythic' | 'soldier' | 'beast' | 'automaton' | 'naga';

// Type chart: attacker type → set of types it's strong against (2x) / weak against (0.5x)
export const TYPE_STRONG: Record<CreatureType, Set<CreatureType>> = {
  mythic:    new Set(['beast', 'naga']),       // divine power overcomes nature
  soldier:   new Set(['automaton', 'naga']),    // discipline defeats constructs
  beast:     new Set(['soldier', 'mythic']),    // primal ferocity
  automaton: new Set(['beast', 'naga']),        // mechanical precision
  naga:      new Set(['soldier', 'mythic']),    // serpent cunning
};
export const TYPE_WEAK: Record<CreatureType, Set<CreatureType>> = {
  mythic:    new Set(['soldier', 'naga']),
  soldier:   new Set(['mythic', 'beast']),
  beast:     new Set(['automaton', 'naga']),
  automaton: new Set(['soldier', 'mythic']),
  naga:      new Set(['beast', 'automaton']),
};

// Combat moves
export interface CombatMove {
  id: string;
  name: string;
  type: CreatureType;
  power: number;        // base power (0 = status move)
  accuracy: number;     // 0-100
  priority: number;     // higher goes first (default 0, quick strikes = 1)
  effect?: 'heal_self' | 'boost_atk' | 'boost_def' | 'lower_def' | 'lower_atk' | 'poison' | 'drain';
  effectChance?: number;
  description: string;
}

export type EnemyAIType =
  | 'random'           // pick moves randomly (default, existing behavior)
  | 'aggressive'       // prioritize high-damage moves
  | 'defensive'        // use buffs and heals more often
  | 'berserk_beast'    // go berserk (boost ATK, lower DEF) when HP < 30%
  | 'vampiric'         // prioritize drain moves to sustain
  | 'tactical'         // score moves based on type effectiveness
  | 'tank'             // prioritize defense boosts, sunder player
  | 'guardian'         // mix of defensive + retaliatory strikes
  | 'swarm';           // prioritize debuffs and poison

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  xpReward: number;
  goldReward: number;
  biomes: BiomeType[];
  bodyColor: string;
  headColor: string;
  description: string;
  creatureType: CreatureType;
  moves: string[];        // move IDs (up to 4)
  lootTableId?: string;   // references LOOT_TABLES for item drops
  aiType?: EnemyAIType;   // combat AI behavior pattern
  bossPhases?: number;    // multi-phase bosses (e.g. 2 = two phases)
}

export type BattleAction = 'attack' | 'defend' | 'item' | 'run' | 'move';

// Stack machine states for combat sequencing
export type CombatStackState =
  | { type: 'select_action' }
  | { type: 'execute_move'; actorId: string; moveId: string; targetId: string }
  | { type: 'play_animation'; animation: 'attack' | 'defend' | 'hit' | 'heal' | 'faint'; targetId: string }
  | { type: 'apply_damage'; targetId: string; damage: number; effectiveness: number }
  | { type: 'check_faint'; targetId: string }
  | { type: 'show_message'; message: string; duration: number }
  | { type: 'end_turn' }
  | { type: 'battle_result'; result: 'win' | 'lose' | 'run' };

export interface BattleState {
  active: boolean;
  enemy: EnemyDef | null;
  enemyHP: number;
  playerHP: number;
  playerMaxHP: number;
  playerATK: number;
  playerDEF: number;
  playerSpeed: number;
  playerCrit: number;
  turn: 'player' | 'enemy' | 'result';
  phase: 'intro' | 'select' | 'animate' | 'enemy_turn' | 'result';
  message: string;
  result: 'none' | 'win' | 'lose' | 'run';
  isDefending: boolean;
  playerXP: number;
  playerLevel: number;
  playerGold: number;
  lastAction: BattleAction | null;
  // New Phase 4 fields
  combatStack: CombatStackState[];
  turnOrder: string[];     // entity IDs sorted by speed
  combatLog: string[];     // last 5 messages
  playerMoves: string[];   // move IDs available to player
  effectiveness: number;   // last move effectiveness (0.5, 1, 2)
  atkBoost: number;        // player attack stage modifier
  defBoost: number;        // player defense stage modifier
  enemyAtkBoost: number;
  enemyDefBoost: number;
  poisoned: boolean;       // player poisoned
  enemyPoisoned: boolean;
}

// === Side Quest System (Plan 6) ===

export type SideQuestStatus = 'not_started' | 'active' | 'completed' | 'failed';

export type SideQuestArchetype = 'mystery' | 'protection' | 'elimination' | 'fetch' | 'escort';

export interface SideQuestStep {
  id: string;
  description: string;
  trigger: {
    type: 'position' | 'flag' | 'combat_win' | 'item' | 'dialog' | 'auto';
    tileX?: number;
    tileY?: number;
    radius?: number;
    flag?: string;
    itemId?: string;
    dialogTreeId?: string;
  };
  onComplete?: {
    setFlags?: string[];
    giveItems?: { itemId: string; quantity: number }[];
    giveGold?: number;
    karmaEffect?: number;
    repEffect?: { region: string; amount: number };
    dialogTreeId?: string;
    startBattleWithEnemy?: string;
    message?: string;
  };
}

export interface SideQuestDef {
  id: string;
  title: string;
  description: string;
  archetype: SideQuestArchetype;
  // Object-Action-Location formula
  object: string;        // what the quest is about
  action: string;        // what to do
  location: string;      // where it takes place
  // Requirements
  regionCode: string;    // which region this quest is in
  minLevel?: number;
  requiredFlag?: string; // must have this flag to unlock
  requiredKarma?: number; // min karma to unlock
  // Arrowhead chain
  chainId?: string;      // links quests into arrowhead chains
  chainOrder?: number;   // position in chain (1, 2, 3...)
  // Steps
  steps: SideQuestStep[];
  // Butterfly effect: flags that matter in future quests/main story
  butterflyFlags?: string[];
  // Rewards
  xpReward: number;
  goldReward: number;
  rewardItems?: { itemId: string; quantity: number }[];
  karmaReward?: number;
  repReward?: { region: string; amount: number };
  // Unlock next quest in chain
  nextQuestId?: string;
}
