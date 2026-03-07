import { File, Directory, Paths } from 'expo-file-system';
import { useGameStore, GameStore } from '../store/useGameStore';

// Save/load game state using expo-file-system (new API).

const SAVE_DIR = new Directory(Paths.document, 'saves');
const SAVE_FILE = new File(SAVE_DIR, 'game_save.json');

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
  try {
    const state = useGameStore.getState();
    const data = extractSaveData(state);
    const json = JSON.stringify(data);

    // Ensure directory exists
    if (!SAVE_DIR.exists) {
      SAVE_DIR.create({ intermediates: true });
    }

    SAVE_FILE.write(json);
    return true;
  } catch (e) {
    console.warn('Save failed:', e);
    return false;
  }
}

export async function loadGame(): Promise<boolean> {
  try {
    if (!SAVE_FILE.exists) return false;

    const json = await SAVE_FILE.text();
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
  try {
    return SAVE_FILE.exists;
  } catch {
    return false;
  }
}

export async function deleteSave(): Promise<void> {
  try {
    if (SAVE_FILE.exists) {
      SAVE_FILE.delete();
    }
  } catch {
    // ignore
  }
}
