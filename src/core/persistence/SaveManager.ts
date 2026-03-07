import { Platform } from 'react-native';
import { useGameStore, GameStore } from '../store/useGameStore';

// Save/load game state using expo-file-system (new API).
// On web, saving is a no-op (expo-file-system has no web implementation).

let _saveDir: any;
let _saveFile: any;

function getSaveFile() {
  if (_saveFile) return _saveFile;
  // Lazy init so web doesn't crash on import
  const { File, Directory, Paths } = require('expo-file-system');
  _saveDir = new Directory(Paths.document, 'saves');
  _saveFile = new File(_saveDir, 'game_save.json');
  return _saveFile;
}

function getSaveDir() {
  if (_saveDir) return _saveDir;
  getSaveFile();
  return _saveDir;
}

const isWeb = Platform.OS === 'web';

interface SaveData {
  version: 1;
  timestamp: number;
  player: {
    posX: number;
    posY: number;
    dir: string;
    hp: number;
    maxHP: number;
    atk: number;
    def: number;
    xp: number;
    level: number;
    gold: number;
  };
  inventory: {
    slots: { itemId: string; quantity: number }[];
    equipped: Record<string, string | null>;
  };
  world: {
    gameMinutes: number;
    stepCount: number;
  };
}

function extractSaveData(state: GameStore): SaveData {
  return {
    version: 1,
    timestamp: Date.now(),
    player: {
      posX: state.playerPos.x,
      posY: state.playerPos.y,
      dir: state.playerDir,
      hp: state.playerHP,
      maxHP: state.playerMaxHP,
      atk: state.playerATK,
      def: state.playerDEF,
      xp: state.playerXP,
      level: state.playerLevel,
      gold: state.playerGold,
    },
    inventory: {
      slots: state.slots.map(s => ({ itemId: s.itemId, quantity: s.quantity })),
      equipped: { ...state.equipped },
    },
    world: {
      gameMinutes: state.gameMinutes,
      stepCount: state.stepCount,
    },
  };
}

export async function saveGame(): Promise<boolean> {
  if (isWeb) return false;
  try {
    const state = useGameStore.getState();
    const data = extractSaveData(state);
    const json = JSON.stringify(data);

    const dir = getSaveDir();
    if (!dir.exists) {
      dir.create({ intermediates: true });
    }

    getSaveFile().write(json);
    return true;
  } catch (e) {
    console.warn('Save failed:', e);
    return false;
  }
}

export async function loadGame(): Promise<boolean> {
  if (isWeb) return false;
  try {
    const file = getSaveFile();
    if (!file.exists) return false;

    const json = await file.text();
    const data: SaveData = JSON.parse(json);
    if (data.version !== 1) return false;

    const store = useGameStore.getState();

    // Restore player state
    store.setPlayerPos({ x: data.player.posX, y: data.player.posY });
    store.setPlayerDir(data.player.dir as 'up' | 'down' | 'left' | 'right');
    store.setCamera(data.player.posX, data.player.posY);
    store.setPlayerStats({
      playerHP: data.player.hp,
      playerMaxHP: data.player.maxHP,
      playerATK: data.player.atk,
      playerDEF: data.player.def,
      playerXP: data.player.xp,
      playerLevel: data.player.level,
      playerGold: data.player.gold,
    });

    // Restore world state
    store.setGameMinutes(data.world.gameMinutes);

    return true;
  } catch (e) {
    console.warn('Load failed:', e);
    return false;
  }
}

export async function hasSaveFile(): Promise<boolean> {
  if (isWeb) return false;
  try {
    return getSaveFile().exists;
  } catch {
    return false;
  }
}

export async function deleteSave(): Promise<void> {
  if (isWeb) return;
  try {
    const file = getSaveFile();
    if (file.exists) {
      file.delete();
    }
  } catch {
    // ignore
  }
}
