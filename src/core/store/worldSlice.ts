import { StateCreator } from 'zustand';
import { Direction, DialogState, TileMapData, NPC } from '../../types';
import { WeatherType } from '../../components/WeatherEffect';

export interface NPCRuntimeState {
  px: number;
  py: number;
  dir: Direction;
  animFrame: number;
  isWalking: boolean;
  walkTimer: number;
  idleTimer: number;
  originX: number;
  originY: number;
}

export interface WorldSlice {
  // Map (generated once, stored in ref for perf — here for completeness)
  mapReady: boolean;

  // Dialog
  dialog: DialogState;

  // Encounters
  encounter: boolean;
  stepCount: number;
  lastEncounterStep: number;

  // Time & weather
  gameMinutes: number;
  weather: WeatherType;

  // NPC runtime states
  npcStates: Map<string, NPCRuntimeState>;

  // Paused (during battle, menus)
  paused: boolean;

  // UI state
  showInventory: boolean;

  // Actions
  setDialog: (dialog: DialogState) => void;
  advanceDialog: () => void;
  closeDialog: () => void;
  triggerEncounter: () => void;
  clearEncounter: () => void;
  incrementSteps: () => void;
  setGameMinutes: (m: number) => void;
  setWeather: (w: WeatherType) => void;
  setPaused: (p: boolean) => void;
  setShowInventory: (show: boolean) => void;
  setMapReady: (ready: boolean) => void;
  initNPCStates: (npcs: NPC[]) => void;
  updateNPCState: (id: string, state: Partial<NPCRuntimeState>) => void;
}

export const createWorldSlice: StateCreator<WorldSlice, [], [], WorldSlice> = (set, get) => ({
  mapReady: false,
  dialog: { active: false, npcName: '', lines: [], currentLine: 0 },
  encounter: false,
  stepCount: 0,
  lastEncounterStep: 0,
  gameMinutes: 8 * 60, // 8 AM
  weather: 'clear',
  npcStates: new Map(),
  paused: false,
  showInventory: false,

  setDialog: (dialog) => set({ dialog }),

  advanceDialog: () => set(state => {
    if (!state.dialog.active) return state;
    if (state.dialog.currentLine < state.dialog.lines.length - 1) {
      return { dialog: { ...state.dialog, currentLine: state.dialog.currentLine + 1 } };
    }
    return { dialog: { active: false, npcName: '', lines: [], currentLine: 0 } };
  }),

  closeDialog: () => set({
    dialog: { active: false, npcName: '', lines: [], currentLine: 0 },
  }),

  triggerEncounter: () => set(state => ({
    encounter: true,
    lastEncounterStep: state.stepCount,
  })),

  clearEncounter: () => set({ encounter: false }),

  incrementSteps: () => set(state => ({ stepCount: state.stepCount + 1 })),

  setGameMinutes: (m) => set({ gameMinutes: m % (24 * 60) }),

  setWeather: (w) => set({ weather: w }),

  setPaused: (p) => set({ paused: p }),

  setShowInventory: (show) => set({ showInventory: show }),

  setMapReady: (ready) => set({ mapReady: ready }),

  initNPCStates: (npcs) => {
    const states = new Map<string, NPCRuntimeState>();
    for (const npc of npcs) {
      const px = npc.position.x * 48; // SCALED_TILE
      const py = npc.position.y * 48;
      states.set(npc.id, {
        px, py,
        dir: npc.direction,
        animFrame: 0,
        isWalking: false,
        walkTimer: 0,
        idleTimer: Math.floor(Math.random() * 60) + 30,
        originX: px,
        originY: py,
      });
    }
    set({ npcStates: states });
  },

  updateNPCState: (id, partial) => set(state => {
    const npcStates = new Map(state.npcStates);
    const current = npcStates.get(id);
    if (current) {
      npcStates.set(id, { ...current, ...partial });
    }
    return { npcStates };
  }),
});
