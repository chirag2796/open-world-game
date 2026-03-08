import { StateCreator } from 'zustand';
import { MAIN_QUESTS, QuestDef, QuestStep, QuestTrigger } from '../../data/quests';
import { SCALED_TILE } from '../../engine/constants';

export interface QuestSlice {
  // Current quest state
  activeQuestId: string;
  activeStepIndex: number;
  completedQuests: Set<string>;
  questLog: string[]; // last 10 quest messages

  // Combat tracking for quest triggers
  battleWinCount: number; // total battle wins
  regionBattleWins: Record<string, number>; // wins per region code

  // Actions
  getActiveQuest: () => QuestDef | null;
  getActiveStep: () => QuestStep | null;
  getObjectiveText: () => string;
  advanceQuestStep: () => void;
  completeCurrentQuest: () => void;
  setActiveQuest: (questId: string) => void;
  addQuestLog: (msg: string) => void;
  incrementBattleWins: (regionCode: string) => void;

  // Trigger checking (called from game tick)
  checkQuestTriggers: (ctx: {
    playerTileX: number;
    playerTileY: number;
    storyFlags: Set<string>;
    items: Set<string>;
  }) => {
    triggered: boolean;
    onComplete?: QuestStep['onComplete'];
  };
}

export const createQuestSlice: StateCreator<QuestSlice, [], [], QuestSlice> = (set, get) => ({
  activeQuestId: 'MAIN_01_ORDINARY',
  activeStepIndex: 0,
  completedQuests: new Set<string>(),
  questLog: [],
  battleWinCount: 0,
  regionBattleWins: {},

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
    // Quest complete — move to next quest
    const completed = new Set(state.completedQuests);
    completed.add(state.activeQuestId);

    if (quest.nextQuestId && MAIN_QUESTS[quest.nextQuestId]) {
      return {
        completedQuests: completed,
        activeQuestId: quest.nextQuestId,
        activeStepIndex: 0,
      };
    }
    // No next quest — game complete
    return {
      completedQuests: completed,
      activeStepIndex: nextIndex, // past end
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
        // Dialog triggers are handled when dialog completes — checked via flag
        // We set a flag like `dialog_completed_<treeId>` when a dialog tree finishes
        if (trigger.dialogTreeId && ctx.storyFlags.has(`dialog_completed_${trigger.dialogTreeId}`)) {
          matched = true;
        }
        break;
      }
      case 'combat_win': {
        // Checked via battleWinCount changes — handled in battle close
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
});
