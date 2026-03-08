import { TileType } from '../types';

// Structure templates: compact tile patterns placed on the map.
// Legend: each char maps to a TileType. '.' = don't modify (transparent)

const CHAR_MAP: Record<string, TileType | -1> = {
  '.': -1,              // transparent
  'G': TileType.PLAINS,
  'T': TileType.FOREST,
  'J': TileType.DENSE_JUNGLE,
  'P': TileType.TREE_PINE,
  'L': TileType.TREE_PALM,
  'B': TileType.TREE_BANYAN,
  't': TileType.TALL_GRASS,
  'f': TileType.FLOWERS,
  'g': TileType.GARDEN,
  'W': TileType.SHALLOW_WATER,
  'O': TileType.LAKE,
  'R': TileType.RIVER,
  'D': TileType.PATH_DIRT,
  'S': TileType.PATH_STONE,
  'w': TileType.WALL_MUD,
  'x': TileType.WALL_STONE,
  'r': TileType.ROOF,
  'd': TileType.DOOR,
  'M': TileType.MARKET,
  'E': TileType.TEMPLE,
  'F': TileType.FORT_WALL,
  'A': TileType.PALACE,
  'H': TileType.HUT,
  '+': TileType.WELL,
  'K': TileType.ROCKS,
  'C': TileType.CLIFF,
  'N': TileType.SNOW,
  'I': TileType.ICE,
  's': TileType.SAND_DUNES,
  'p': TileType.PLATEAU,
  'Q': TileType.SWAMP,
  'b': TileType.BRIDGE,
  'c': TileType.CAMPSITE,
  'u': TileType.RUINS,
  'h': TileType.BEACH,
  'X': TileType.DESERT,
  'o': TileType.OCEAN,
  // Indo-Saracenic
  '1': TileType.SANDSTONE,
  '2': TileType.MARBLE,
  '3': TileType.DOME,
  '4': TileType.ARCH,
  '5': TileType.JALI,
  '6': TileType.MINARET,
  '7': TileType.CHHATRI,
  '8': TileType.BAORI_WALL,
  '9': TileType.BAORI_WATER,
  'Z': TileType.PIETRA_DURA,
  'Y': TileType.COURTYARD,
  'V': TileType.HAVELI_WALL,
  'U': TileType.MUGHAL_GATE,
  'n': TileType.MOSQUE,
  '_': TileType.CANAL,
  '%': TileType.CHARBAGH,
  '!': TileType.BORDER_POST,
};

export interface StructureTemplate {
  name: string;
  width: number;
  height: number;
  tiles: (TileType | -1)[][]; // -1 = transparent
}

function parse(name: string, rows: string[]): StructureTemplate {
  const height = rows.length;
  const width = Math.max(...rows.map(r => r.length));
  const tiles: (TileType | -1)[][] = [];
  for (const row of rows) {
    const tileRow: (TileType | -1)[] = [];
    for (let i = 0; i < width; i++) {
      const ch = row[i] || '.';
      tileRow.push(CHAR_MAP[ch] ?? -1);
    }
    tiles.push(tileRow);
  }
  return { name, width, height, tiles };
}

// === NATURE: FORESTS ===

export const FOREST_SMALL = parse('forest_small', [
  '..tTt..',
  '.tTTTt.',
  'tTTTTTt',
  '.tTTTt.',
  '..tTt..',
]);

export const FOREST_MEDIUM = parse('forest_medium', [
  '...tTTt...',
  '..tTTTTt..',
  '.tTTTTTTt.',
  'tTTTTTTTTt',
  'tTTTTTTTTt',
  '.tTTTTTTt.',
  '..tTTTTt..',
  '...tTTt...',
]);

export const FOREST_LARGE = parse('forest_large', [
  '....tTTTt....',
  '...tTTTTTt...',
  '..tTTTTTTTt..',
  '.tTTTTTTTTTt.',
  'tTTTTTTTTTTTt',
  'tTTTTTTTTTTTt',
  'tTTTTTTTTTTTt',
  '.tTTTTTTTTTt.',
  '..tTTTTTTTt..',
  '...tTTTTTt...',
  '....tTTt.....',
]);

export const PINE_GROVE = parse('pine_grove', [
  '..PtP..',
  '.PtPtP.',
  'PtPPtPP',
  '.PtPtP.',
  '..PtP..',
]);

export const PALM_GROVE = parse('palm_grove', [
  '..LtL..',
  '.LtGtL.',
  'LtGGtLL',
  '.LtGtL.',
  '..LtL..',
]);

export const JUNGLE_PATCH = parse('jungle_patch', [
  '..tJt...',
  '.tJJJt..',
  'tJJJJJt.',
  'tJJJJJJt',
  '.tJJJJt.',
  '..tJt...',
]);

export const BANYAN_GROVE = parse('banyan_grove', [
  '.tBt.',
  'tBBBt',
  'tBBBt',
  '.tBt.',
]);

// === NATURE: WATER ===

export const LAKE_SMALL = parse('lake_small', [
  '..WW..',
  '.WWWW.',
  'WWOOWW',
  'WWOOWW',
  '.WWWW.',
  '..WW..',
]);

export const LAKE_MEDIUM = parse('lake_medium', [
  '...WWW...',
  '..WWWWW..',
  '.WWOOOWW.',
  'WWOOOOOOW',
  'WWOOOOOOW',
  '.WWOOOWW.',
  '..WWWWW..',
  '...WWW...',
]);

export const SWAMP_PATCH = parse('swamp_patch', [
  '.QtQ.',
  'QQtQQ',
  'tQQQt',
  'QQtQQ',
  '.QtQ.',
]);

// === NATURE: TERRAIN ===

export const ROCK_CLUSTER = parse('rock_cluster', [
  '.KK.',
  'KKKK',
  'KKKK',
  '.KK.',
]);

export const CLIFF_FACE = parse('cliff_face', [
  'CCCCCCCC',
  'CKKKKKCC',
  '.CCCCCC.',
]);

export const SAND_DUNE = parse('sand_dune', [
  '..ss..',
  '.sssX.',
  'ssssss',
  '.Xsss.',
  '..ss..',
]);

export const FLOWER_MEADOW = parse('flower_meadow', [
  '.fGf.',
  'fGfGf',
  'GfGfG',
  'fGfGf',
  '.fGf.',
]);

// === SETTLEMENTS: VILLAGE ===

export const VILLAGE_SMALL = parse('village_small', [
  '.....D.....',
  '.rr.DDD.rr.',
  '.wd.DDD.wd.',
  '.ww.D+D.ww.',
  '.....DDD....',
  '.rr.DDD.rr.',
  '.wd.DDD.wd.',
  '.ww..D..ww.',
  '.....D.....',
]);

// === SETTLEMENTS: TOWN ===

export const TOWN = parse('town', [
  '......SSSSS......',
  '....SSSSSSSSS....',
  '..rrSSS.SSSrr....',
  '..wdS.MMM.Swd....',
  '..wwS.MMM.Sww....',
  '..SSSSMMMSSSS....',
  '.rr.SSMSS.Srr...',
  '.wd.SSSSSSSwdS..',
  '.ww..S+S..SwwS..',
  '....SSSSSSSSS....',
  '......SSSSS......',
]);

// === SETTLEMENTS: CITY ===

export const CITY = parse('city', [
  '.......SSSSSSS.......',
  '.....SSSSSSSSSSS.....',
  '...xxSSSSSSSSSSxx....',
  '...xdSrrSrrSrrSdx....',
  '...xxSwdSwdSwdSxx....',
  '..SSSSwwSwwSwwSSS....',
  '.SSSSSSSSMMSSSSSSS...',
  '.SrrSSSSMMMSSSrrSS...',
  '.SwdSSS.+.SSSwdSS...',
  '.SwwSSSSSSSSSwwSS...',
  '..SSSSSSSSSSSSSSS...',
  '...xxSSSSSSSSSSxx....',
  '...xdSSSSSSSSSSdx....',
  '...xxSSSSSSSSSSxx....',
  '.....SSSSSSSSSSS.....',
  '.......SSSSSSS.......',
]);

// === LANDMARKS: UNIQUE ===

export const FORT_LARGE = parse('fort_large', [
  '..FFFFFFFF..',
  '.FSSSSSSSSF.',
  'FSxxSSSSxxSF',
  'FSxAAAAAAxSF',
  'FSxAAAAAAxSF',
  'FSxAAgAAxSF.',
  'FSxAAAAAxSF..',
  'FSxxddxxSF...',
  '.FSSSSSSF....',
  '..FFFFSSS....',
  '....SSSS.....',
]);

export const PALACE = parse('palace', [
  '...FFFFF...',
  '..FgggggF..',
  '.FgAAAAAFg.',
  '.FgAAAAAFg.',
  '.FgAAgAFg..',
  '.FgAAAAFg..',
  '..FgddFg...',
  '...FFFF....',
  '....SS.....',
]);

export const TEMPLE_LARGE = parse('temple_large', [
  '...EEE...',
  '..EEEEE..',
  '.EEgggEE.',
  '.EgEEEgE.',
  '.EgEdEgE.',
  '.EgEEEgE.',
  '.EEgggEE.',
  '..ESSEE..',
  '...SSS...',
]);

export const RUINS_SITE = parse('ruins_site', [
  '.uKu.',
  'uuuuu',
  'KuuuK',
  'uuuuu',
  '.uKu.',
]);

export const CAMPSITE_AREA = parse('campsite_area', [
  '..D..',
  '.DcD.',
  'DcccD',
  '.DcD.',
  '..D..',
]);

export const MARKET_SQUARE = parse('market_square', [
  '.SSS.',
  'SMMMS',
  'SMMMS',
  'SMMMS',
  '.SSS.',
]);

export const BRIDGE_NS = parse('bridge_ns', [
  '.b.',
  '.b.',
  '.b.',
  '.b.',
]);

export const BRIDGE_EW = parse('bridge_ew', [
  'bbbb',
]);

// === INDO-SARACENIC STRUCTURES ===

// Mughal Gate (Darwaza) — imposing entry gate with minarets
export const MUGHAL_DARWAZA = parse('mughal_darwaza', [
  '.6.UUU.6.',
  '.1U444U1.',
  '.1.YYY.1.',
  '.1.YYY.1.',
  '.114Y411.',
  '..1SSS1..',
]);

// Haveli — ornate residential mansion with courtyard
export const HAVELI = parse('haveli', [
  '..VVVVVVV..',
  '.V5YYYY5V.',
  '.VYZZZYV.',
  '.VY.g.YV.',
  '.VYZZZYV.',
  '.V5YYYY5V.',
  '..VV4VV..',
  '....S....',
]);

// Mosque with domes and minarets
export const MOSQUE_SMALL = parse('mosque_small', [
  '.6.nnn.6.',
  '.n33333n.',
  '.nY2Y2Yn.',
  '.n2ZZZ2n.',
  '.nY2Y2Yn.',
  '.n33333n.',
  '..nn4nn..',
  '....S....',
]);

// Grand Mosque (Jama Masjid style)
export const JAMA_MASJID = parse('jama_masjid', [
  '..6..nnnnn..6..',
  '.nn333333333nn.',
  '.nYY2ZZZ2YYn.',
  '.n2ZZZZZZZ2n.',
  '.nYY2ZZZ2YYn.',
  '.nn333333333nn.',
  '..nnnnn4nnnn..',
  '....SSSSSSS....',
  '.....SSSSS.....',
]);

// Baori (Step-well) — geometric descending well
export const BAORI = parse('baori', [
  '.8888888.',
  '.8YYYYY8.',
  '.8Y888Y8.',
  '.8Y8988.',
  '.8Y888Y8.',
  '.8YYYYY8.',
  '.8888888.',
]);

// Charbagh Garden — four-fold Mughal garden
export const CHARBAGH = parse('charbagh', [
  '.%%%_%%%.',
  '.%g%_%g%.',
  '.%%%_%%%.',
  '____+____',
  '.%%%_%%%.',
  '.%g%_%g%.',
  '.%%%_%%%.',
]);

// Tomb/Mausoleum — Taj Mahal style
export const MAUSOLEUM = parse('mausoleum', [
  '...7.3.7...',
  '..222222Z..',
  '.2Z22222Z2.',
  '.222333222.',
  '.2Z33332Z.',
  '.222333222.',
  '.2Z22222Z2.',
  '..2222222..',
  '...7.4.7...',
  '.....S.....',
]);

// Caravanserai — traveler rest house
export const CARAVANSERAI = parse('caravanserai', [
  '..111111..',
  '.1YYYYYYY1.',
  '.1Y..c..Y1.',
  '.1Y.DDD.Y1.',
  '.1Y..c..Y1.',
  '.1YYYYYYY1.',
  '..114411..',
  '....SS....',
]);

// Chhatri Pavilion — decorative domed kiosk
export const CHHATRI_PAVILION = parse('chhatri_pavilion', [
  '..777..',
  '.7Y7Y7.',
  '7YYYYY7',
  '.7Y7Y7.',
  '..777..',
]);

// Red Fort style complex
export const RED_FORT = parse('red_fort', [
  '..11111111111..',
  '.1YYYYYYYYYYYYY1.',
  '.1Y111111111Y1.',
  '.1Y1ZZZZZ1Y1.',
  '.1Y133333Y1.',
  '.1Y1Z3Z3Z1Y1.',
  '.1Y133333Y1.',
  '.1Y1ZZZZZ1Y1.',
  '.1Y111111111Y1.',
  '.1YYYYYYYYYYYYY1.',
  '..1111U1111..',
  '.....SSS.....',
]);

// Rajasthani Haveli — desert mansion with jalis
export const DESERT_HAVELI = parse('desert_haveli', [
  '.V555V.',
  'V5YY5V',
  'VYZZYYV',
  'VY..YV',
  'VYZZYYV',
  'V5YY5V',
  '.V44V.',
  '..SS..',
]);

// Border Post / Checkpoint
export const BORDER_CHECKPOINT = parse('border_checkpoint', [
  '.!.D.!.',
  '!1D1D1!',
  '.!.D.!.',
]);

// Mughal Capital Layout — wraps CITY with Mughal structures
export const MUGHAL_CAPITAL = parse('mughal_capital', [
  '.......111111111111.......',
  '......1YYYYYYYYYYYYYY1......',
  '.....1Y..SSSSSSS..Y1.....',
  '....1Y.xxSSSSSSSSxx.Y1....',
  '...1Y.xdSrrSrrSrrSdx.Y1...',
  '...1Y.xxSwdSwdSwdSxx.Y1...',
  '..1Y.SSSSwwSwwSwwSSS.Y1..',
  '.1Y.SSSSSSSSMMSSSSSSS.Y1.',
  '.1Y.SrrSSSSMMMSSSrrSS.Y1.',
  '.1Y.SwdSSS.+.SSSwdSS.Y1.',
  '.1Y.SwwSSSSSSSSSwwSS.Y1.',
  '..1Y.SSSSSSSSSSSSSSS.Y1..',
  '...1Y.xxSSSSSSSSSSxx.Y1...',
  '...1Y.xdSSSSSSSSSSdx.Y1...',
  '....1Y.xxSSSSSSSSxx.Y1....',
  '.....1YYYYYYYYYYYYYY1.....',
  '......111UUU111......',
  '.........SSS.........',
]);

// === PLACEMENT HELPERS ===

// Place a structure on the map ground array
export function placeStructure(
  ground: TileType[][],
  structure: StructureTemplate,
  x: number,
  y: number,
  mapW: number,
  mapH: number,
) {
  for (let dy = 0; dy < structure.height; dy++) {
    for (let dx = 0; dx < structure.width; dx++) {
      const tile = structure.tiles[dy][dx];
      if (tile === -1) continue; // transparent
      const tx = x + dx;
      const ty = y + dy;
      if (tx >= 0 && tx < mapW && ty >= 0 && ty < mapH) {
        ground[ty][tx] = tile;
      }
    }
  }
}

// Place structure centered on a point
export function placeStructureCentered(
  ground: TileType[][],
  structure: StructureTemplate,
  cx: number,
  cy: number,
  mapW: number,
  mapH: number,
) {
  placeStructure(ground, structure, cx - Math.floor(structure.width / 2), cy - Math.floor(structure.height / 2), mapW, mapH);
}

// Check if an area is clear (no water/settlement tiles)
export function isAreaClear(
  ground: TileType[][],
  x: number,
  y: number,
  w: number,
  h: number,
  mapW: number,
  mapH: number,
  allowedTiles?: Set<TileType>,
): boolean {
  const SETTLEMENT_TILES = new Set([
    TileType.PATH_DIRT, TileType.PATH_STONE, TileType.WALL_MUD,
    TileType.WALL_STONE, TileType.ROOF, TileType.DOOR, TileType.MARKET,
    TileType.TEMPLE, TileType.FORT_WALL, TileType.PALACE, TileType.WELL,
  ]);
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const tx = x + dx;
      const ty = y + dy;
      if (tx < 0 || tx >= mapW || ty < 0 || ty >= mapH) return false;
      const tile = ground[ty][tx];
      if (tile === TileType.OCEAN || tile === TileType.DEEP_OCEAN || tile === TileType.RIVER) return false;
      if (SETTLEMENT_TILES.has(tile)) return false;
      if (allowedTiles && !allowedTiles.has(tile)) return false;
    }
  }
  return true;
}

// All reusable nature structures (for scatter placement)
export const FOREST_STRUCTURES = [FOREST_SMALL, FOREST_MEDIUM, FOREST_LARGE];
export const TREE_STRUCTURES = [PINE_GROVE, PALM_GROVE, BANYAN_GROVE, JUNGLE_PATCH];
export const WATER_STRUCTURES = [LAKE_SMALL, LAKE_MEDIUM, SWAMP_PATCH];
export const TERRAIN_STRUCTURES = [ROCK_CLUSTER, CLIFF_FACE, SAND_DUNE, FLOWER_MEADOW];
export const SETTLEMENT_STRUCTURES = [VILLAGE_SMALL, TOWN, CITY];
export const LANDMARK_STRUCTURES = [FORT_LARGE, PALACE, TEMPLE_LARGE, RUINS_SITE];
export const MUGHAL_STRUCTURES = [
  MUGHAL_DARWAZA, HAVELI, MOSQUE_SMALL, JAMA_MASJID,
  BAORI, CHARBAGH, MAUSOLEUM, CARAVANSERAI,
  CHHATRI_PAVILION, RED_FORT, DESERT_HAVELI, BORDER_CHECKPOINT,
  MUGHAL_CAPITAL,
];
