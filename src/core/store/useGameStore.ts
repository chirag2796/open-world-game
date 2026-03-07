import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { createPlayerSlice, PlayerSlice } from './playerSlice';
import { createWorldSlice, WorldSlice } from './worldSlice';
import { createInventorySlice, InventorySlice } from './inventorySlice';
import { createCombatSlice, CombatSlice } from './combatSlice';

export type GameStore = PlayerSlice & WorldSlice & InventorySlice & CombatSlice;

export const useGameStore = create<GameStore>()((...a) => ({
  ...createPlayerSlice(...a),
  ...createWorldSlice(...a),
  ...createInventorySlice(...a),
  ...createCombatSlice(...a),
}));

// === TARGETED SELECTORS ===
// useShallow prevents re-renders when the returned object is shallowly equal

export const usePlayerPosition = () => useGameStore(useShallow(s => ({
  playerPos: s.playerPos,
  playerDir: s.playerDir,
  playerMoving: s.playerMoving,
  animFrame: s.animFrame,
})));

export const useCamera = () => useGameStore(useShallow(s => ({
  cameraX: s.cameraX,
  cameraY: s.cameraY,
})));

export const usePlayerStats = () => useGameStore(useShallow(s => ({
  playerHP: s.playerHP,
  playerMaxHP: s.playerMaxHP,
  playerATK: s.playerATK,
  playerDEF: s.playerDEF,
  playerXP: s.playerXP,
  playerLevel: s.playerLevel,
  playerGold: s.playerGold,
})));

export const useDialog = () => useGameStore(s => s.dialog);

export const useBattleState = () => useGameStore(useShallow(s => ({
  active: s.battleActive,
  enemy: s.enemy,
  enemyHP: s.enemyHP,
  phase: s.battlePhase,
  message: s.battleMessage,
  result: s.battleResult,
  isDefending: s.isDefending,
  lastAction: s.lastAction,
})));

export const useInventoryState = () => useGameStore(useShallow(s => ({
  slots: s.slots,
  equipped: s.equipped,
})));
