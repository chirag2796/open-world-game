import { StateCreator } from 'zustand';
import { Direction, Position } from '../../types';
import { SCALED_TILE } from '../../engine/constants';
import { PLAYER_START } from '../../data/india-map';

export interface PlayerSlice {
  // Position & movement
  playerPos: Position;
  playerDir: Direction;
  playerMoving: boolean;
  animFrame: number;

  // Camera
  cameraX: number;
  cameraY: number;

  // Stats (persistent)
  playerHP: number;
  playerMaxHP: number;
  playerATK: number;
  playerDEF: number;
  playerXP: number;
  playerLevel: number;
  playerGold: number;
  playerKarma: number; // -100 (adharma) to +100 (dharma)
  storyFlags: Set<string>; // persistent story progress flags

  // Actions
  setPlayerPos: (pos: Position) => void;
  setPlayerDir: (dir: Direction) => void;
  setPlayerMoving: (moving: boolean) => void;
  setAnimFrame: (frame: number) => void;
  setCamera: (x: number, y: number) => void;
  setPlayerStats: (stats: Partial<Pick<PlayerSlice, 'playerHP' | 'playerMaxHP' | 'playerATK' | 'playerDEF' | 'playerXP' | 'playerLevel' | 'playerGold'>>) => void;
  healPlayer: (amount: number) => void;
  damagePlayer: (amount: number) => number; // returns actual damage
  addGold: (amount: number) => void;
  addXP: (amount: number) => boolean; // returns true if leveled up
  adjustKarma: (amount: number) => void;
  setStoryFlag: (flag: string) => void;
  hasStoryFlag: (flag: string) => boolean;
}

const INITIAL_HP = 50;
const HP_PER_LEVEL = 8;

export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.5));
}

export const createPlayerSlice: StateCreator<PlayerSlice, [], [], PlayerSlice> = (set, get) => ({
  playerPos: { x: PLAYER_START.x * SCALED_TILE, y: PLAYER_START.y * SCALED_TILE },
  playerDir: 'down',
  playerMoving: false,
  animFrame: 0,
  cameraX: PLAYER_START.x * SCALED_TILE,
  cameraY: PLAYER_START.y * SCALED_TILE,
  playerHP: INITIAL_HP,
  playerMaxHP: INITIAL_HP,
  playerATK: 5,
  playerDEF: 2,
  playerXP: 0,
  playerLevel: 1,
  playerGold: 20,
  playerKarma: 0,
  storyFlags: new Set<string>(),

  setPlayerPos: (pos) => set({ playerPos: pos }),
  setPlayerDir: (dir) => set({ playerDir: dir }),
  setPlayerMoving: (moving) => set({ playerMoving: moving }),
  setAnimFrame: (frame) => set({ animFrame: frame }),
  setCamera: (x, y) => set({ cameraX: x, cameraY: y }),

  setPlayerStats: (stats) => set(stats),

  healPlayer: (amount) => set(state => ({
    playerHP: Math.min(state.playerHP + amount, state.playerMaxHP),
  })),

  damagePlayer: (amount) => {
    const state = get();
    const actual = Math.min(amount, state.playerHP);
    set({ playerHP: Math.max(0, state.playerHP - amount) });
    return actual;
  },

  addGold: (amount) => set(state => ({
    playerGold: Math.max(0, state.playerGold + amount),
  })),

  addXP: (amount) => {
    const state = get();
    const newXP = state.playerXP + amount;
    const needed = xpForLevel(state.playerLevel);
    if (newXP >= needed) {
      const newLevel = state.playerLevel + 1;
      const newMaxHP = INITIAL_HP + (newLevel - 1) * HP_PER_LEVEL;
      set({
        playerXP: newXP - needed,
        playerLevel: newLevel,
        playerMaxHP: newMaxHP,
        playerHP: newMaxHP, // Full heal on level up
      });
      return true;
    }
    set({ playerXP: newXP });
    return false;
  },

  adjustKarma: (amount) => set(state => ({
    playerKarma: Math.max(-100, Math.min(100, state.playerKarma + amount)),
  })),

  setStoryFlag: (flag) => set(state => {
    if (state.storyFlags.has(flag)) return state;
    const flags = new Set(state.storyFlags);
    flags.add(flag);
    return { storyFlags: flags };
  }),

  hasStoryFlag: (flag) => {
    return get().storyFlags.has(flag);
  },
});
