import { StateCreator } from 'zustand';
import { MAIN_QUESTS, QuestDef, QuestStep } from '../../data/quests';
import { SIDE_QUESTS } from '../../data/sideQuests';
import { SideQuestDef, SideQuestStatus, SideQuestStep } from '../../types';
import {
  SideQuestRegistry, RegionalRep,
  createInitialRegistry, createInitialRep, adjustRep, getRep,
  checkSideQuestTriggers, advanceSideQuest, startSideQuest,
  getActiveQuests, getAvailableQuests, getSideQuestObjective,
  getButterflyConsequences, ButterflyConsequence,
  SideQuestTriggerContext, SideQuestTriggerResult,
} from '../../engine/sideQuestSystem';

export interface QuestSlice {
  // Main quest state
  activeQuestId: string;
  activeStepIndex: number;
  completedQuests: Set<string>;
  questLog: string[]; // last 10 quest messages

  // Combat tracking for quest triggers
  battleWinCount: number;
  regionBattleWins: Record<string, number>;

  // Side quest state (Plan 6)
  sideQuestRegistry: SideQuestRegistry;
  regionalRep: RegionalRep;

  // Main quest actions
  getActiveQuest: () => QuestDef | null;
  getActiveStep: () => QuestStep | null;
  getObjectiveText: () => string;
  advanceQuestStep: () => void;
  completeCurrentQuest: () => void;
  setActiveQuest: (questId: string) => void;
  addQuestLog: (msg: string) => void;
  incrementBattleWins: (regionCode: string) => void;

  // Main quest trigger checking
  checkQuestTriggers: (ctx: {
    playerTileX: number;
    playerTileY: number;
    storyFlags: Set<string>;
    items: Set<string>;
  }) => {
    triggered: boolean;
    onComplete?: QuestStep['onComplete'];
  };

  // Side quest actions (Plan 6)
  startSideQuestAction: (questId: string) => void;
  advanceSideQuestAction: (questId: string) => { completed: boolean; nextQuestId?: string };
  checkSideQuestTriggersAction: (ctx: SideQuestTriggerContext) => SideQuestTriggerResult[];
  getActiveSideQuests: () => { quest: SideQuestDef; stepDescription: string }[];
  getAvailableSideQuests: (regionCode: string, storyFlags: Set<string>, playerLevel: number, playerKarma: number) => SideQuestDef[];
  getSideQuestStatus: (questId: string) => SideQuestStatus;
  adjustRegionalRep: (region: string, amount: number) => void;
  getRegionalRep: (region: string) => number;
  getButterflyEffects: (storyFlags: Set<string>) => ButterflyConsequence[];
}

export const createQuestSlice: StateCreator<QuestSlice, [], [], QuestSlice> = (set, get) => ({
  // Main quest state
  activeQuestId: 'MAIN_01_ORDINARY',
  activeStepIndex: 0,
  completedQuests: new Set<string>(),
  questLog: [],
  battleWinCount: 0,
  regionBattleWins: {},

  // Side quest state
  sideQuestRegistry: createInitialRegistry(),
  regionalRep: createInitialRep(),

  // ─── Main Quest Actions ──────────────────────────────────

  getActiveQuest: () => {
    const { activeQuestId } = get();
    return MAIN_QUESTS[activeQuestId] || null;
  },

  getActiveStep: () => {
    const { activeQuestId, activeStepIndex } = get();
    const quest = MAIN_QUESTS[activeQuestId];
    if (!quest) return null;
    return quest.steps[activeStepIndex] || null;
  },

  getObjectiveText: () => {
    const step = get().getActiveStep();
    if (!step) {
      const quest = get().getActiveQuest();
      return quest ? quest.title : 'No active quest';
    }
    return step.description;
  },

  advanceQuestStep: () => set(state => {
    const quest = MAIN_QUESTS[state.activeQuestId];
    if (!quest) return state;

    const nextIndex = state.activeStepIndex + 1;
    if (nextIndex < quest.steps.length) {
      return { activeStepIndex: nextIndex };
    }
    const completed = new Set(state.completedQuests);
    completed.add(state.activeQuestId);

    if (quest.nextQuestId && MAIN_QUESTS[quest.nextQuestId]) {
      return {
        completedQuests: completed,
        activeQuestId: quest.nextQuestId,
        activeStepIndex: 0,
      };
    }
    return {
      completedQuests: completed,
      activeStepIndex: nextIndex,
    };
  }),

  completeCurrentQuest: () => {
    const state = get();
    const quest = MAIN_QUESTS[state.activeQuestId];
    if (!quest) return;
    const completed = new Set(state.completedQuests);
    completed.add(state.activeQuestId);
    if (quest.nextQuestId) {
      set({
        completedQuests: completed,
        activeQuestId: quest.nextQuestId,
        activeStepIndex: 0,
      });
    } else {
      set({ completedQuests: completed });
    }
  },

  setActiveQuest: (questId) => set({
    activeQuestId: questId,
    activeStepIndex: 0,
  }),

  addQuestLog: (msg) => set(state => ({
    questLog: [...state.questLog.slice(-9), msg],
  })),

  incrementBattleWins: (regionCode) => set(state => {
    const newCount = state.battleWinCount + 1;
    const regionWins = { ...state.regionBattleWins };
    regionWins[regionCode] = (regionWins[regionCode] || 0) + 1;
    return { battleWinCount: newCount, regionBattleWins: regionWins };
  }),

  checkQuestTriggers: (ctx) => {
    const state = get();
    const step = state.getActiveStep();
    if (!step) return { triggered: false };

    const trigger = step.trigger;
    let matched = false;

    switch (trigger.type) {
      case 'position': {
        if (trigger.tileX === undefined || trigger.tileY === undefined) break;
        const radius = trigger.radius ?? 3;
        const dx = ctx.playerTileX - trigger.tileX;
        const dy = ctx.playerTileY - trigger.tileY;
        if (Math.abs(dx) <= radius && Math.abs(dy) <= radius) {
          matched = true;
        }
        break;
      }
      case 'flag': {
        if (trigger.flag && ctx.storyFlags.has(trigger.flag)) {
          matched = true;
        }
        break;
      }
      case 'item': {
        if (trigger.itemId && ctx.items.has(trigger.itemId)) {
          matched = true;
        }
        break;
      }
      case 'dialog': {
        if (trigger.dialogTreeId && ctx.storyFlags.has(`dialog_completed_${trigger.dialogTreeId}`)) {
          matched = true;
        }
        break;
      }
      case 'combat_win': {
        break;
      }
      case 'auto': {
        matched = true;
        break;
      }
    }

    if (matched) {
      return { triggered: true, onComplete: step.onComplete };
    }
    return { triggered: false };
  },

  // ─── Side Quest Actions (Plan 6) ────────────────────────

  startSideQuestAction: (questId) => set(state => ({
    sideQuestRegistry: startSideQuest(state.sideQuestRegistry, questId),
    questLog: [...state.questLog.slice(-9), `Side quest started: ${SIDE_QUESTS[questId]?.title ?? questId}`],
  })),

  advanceSideQuestAction: (questId) => {
    const state = get();
    const result = advanceSideQuest(state.sideQuestRegistry, questId);

    if (result.completed) {
      const quest = SIDE_QUESTS[questId];
      const logMsg = `Side quest completed: ${quest?.title ?? questId}`;
      set({
        sideQuestRegistry: result.registry,
        questLog: [...state.questLog.slice(-9), logMsg],
      });
    } else {
      set({ sideQuestRegistry: result.registry });
    }

    return { completed: result.completed, nextQuestId: result.nextQuestId };
  },

  checkSideQuestTriggersAction: (ctx) => {
    return checkSideQuestTriggers(get().sideQuestRegistry, ctx);
  },

  getActiveSideQuests: () => {
    const active = getActiveQuests(get().sideQuestRegistry);
    return active.map(({ quest, state }) => ({
      quest,
      stepDescription: getSideQuestObjective(get().sideQuestRegistry, quest.id) ?? '',
    }));
  },

  getAvailableSideQuests: (regionCode, storyFlags, playerLevel, playerKarma) => {
    return getAvailableQuests(regionCode, get().sideQuestRegistry, storyFlags, playerLevel, playerKarma);
  },

  getSideQuestStatus: (questId) => {
    return get().sideQuestRegistry[questId]?.status ?? 'not_started';
  },

  adjustRegionalRep: (region, amount) => set(state => ({
    regionalRep: adjustRep(state.regionalRep, region, amount),
  })),

  getRegionalRep: (region) => {
    return getRep(get().regionalRep, region);
  },

  getButterflyEffects: (storyFlags) => {
    return getButterflyConsequences(storyFlags);
  },
});
