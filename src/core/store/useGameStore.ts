import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { createPlayerSlice, PlayerSlice } from './playerSlice';
import { createWorldSlice, WorldSlice } from './worldSlice';
import { createInventorySlice, InventorySlice } from './inventorySlice';
import { createCombatSlice, CombatSlice } from './combatSlice';
import { createQuestSlice, QuestSlice } from './questSlice';

export type GameStore = PlayerSlice & WorldSlice & InventorySlice & CombatSlice & QuestSlice;

export const useGameStore = create<GameStore>()((...a) => ({
  ...createPlayerSlice(...a),
  ...createWorldSlice(...a),
  ...createInventorySlice(...a),
  ...createCombatSlice(...a),
  ...createQuestSlice(...a),
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
  active: s.battle.active,
  enemy: s.battle.enemy,
  enemyHP: s.battle.enemyHP,
  playerHP: s.battle.playerHP,
  playerMaxHP: s.battle.playerMaxHP,
  phase: s.battle.phase,
  message: s.battle.message,
  result: s.battle.result,
  isDefending: s.battle.isDefending,
  lastAction: s.battle.lastAction,
  effectiveness: s.battle.effectiveness,
  playerMoves: s.battle.playerMoves,
  combatLog: s.battle.combatLog,
  poisoned: s.battle.poisoned,
  enemyPoisoned: s.battle.enemyPoisoned,
})));

export const useInventoryState = () => useGameStore(useShallow(s => ({
  slots: s.slots,
  equipped: s.equipped,
})));

export const useQuestState = () => useGameStore(useShallow(s => ({
  activeQuestId: s.activeQuestId,
  activeStepIndex: s.activeStepIndex,
  questLog: s.questLog,
})));
