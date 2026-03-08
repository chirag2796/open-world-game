// Side Quest System — triggers, progression, and butterfly effect handling
// Integrates with existing QuestSlice and PlayerSlice for state management

import { SideQuestDef, SideQuestStatus, SideQuestStep } from '../types';
import { SIDE_QUESTS, INITIAL_SIDE_QUESTS } from '../data/sideQuests';
import { SCALED_TILE } from './constants';

// ─── Side Quest Registry ─────────────────────────────────────

export interface SideQuestState {
  status: SideQuestStatus;
  currentStepIndex: number;
}

export type SideQuestRegistry = Record<string, SideQuestState>;

export function createInitialRegistry(): SideQuestRegistry {
  const registry: SideQuestRegistry = {};
  for (const id of INITIAL_SIDE_QUESTS) {
    registry[id] = { status: 'not_started', currentStepIndex: 0 };
  }
  return registry;
}

// ─── Regional Reputation ─────────────────────────────────────

export type RegionalRep = Record<string, number>; // region code → rep (-100 to +100)

export function createInitialRep(): RegionalRep {
  return {}; // starts empty, gets populated as player interacts with regions
}

export function adjustRep(rep: RegionalRep, region: string, amount: number): RegionalRep {
  const newRep = { ...rep };
  const current = newRep[region] ?? 0;
  newRep[region] = Math.max(-100, Math.min(100, current + amount));
  return newRep;
}

export function getRep(rep: RegionalRep, region: string): number {
  return rep[region] ?? 0;
}

// ─── Quest Availability ──────────────────────────────────────

export function isQuestAvailable(
  questId: string,
  registry: SideQuestRegistry,
  storyFlags: Set<string>,
  playerLevel: number,
  playerKarma: number,
): boolean {
  const quest = SIDE_QUESTS[questId];
  if (!quest) return false;

  const state = registry[questId];
  if (!state || state.status !== 'not_started') return false;

  // Check level requirement
  if (quest.minLevel && playerLevel < quest.minLevel) return false;

  // Check karma requirement
  if (quest.requiredKarma !== undefined && playerKarma < quest.requiredKarma) return false;

  // Check flag requirement (previous chain quest completion, etc.)
  if (quest.requiredFlag && !storyFlags.has(quest.requiredFlag)) return false;

  return true;
}

// Get all quests available to start in a region
export function getAvailableQuests(
  regionCode: string,
  registry: SideQuestRegistry,
  storyFlags: Set<string>,
  playerLevel: number,
  playerKarma: number,
): SideQuestDef[] {
  return Object.values(SIDE_QUESTS)
    .filter(q => q.regionCode === regionCode)
    .filter(q => isQuestAvailable(q.id, registry, storyFlags, playerLevel, playerKarma));
}

// Get all active quests
export function getActiveQuests(registry: SideQuestRegistry): { quest: SideQuestDef; state: SideQuestState }[] {
  const result: { quest: SideQuestDef; state: SideQuestState }[] = [];
  for (const [id, state] of Object.entries(registry)) {
    if (state.status === 'active') {
      const quest = SIDE_QUESTS[id];
      if (quest) result.push({ quest, state });
    }
  }
  return result;
}

// ─── Quest Trigger Checking ──────────────────────────────────

export interface SideQuestTriggerContext {
  playerTileX: number;
  playerTileY: number;
  storyFlags: Set<string>;
  items: Set<string>;
  battleWinCount: number;
}

export interface SideQuestTriggerResult {
  questId: string;
  stepId: string;
  triggered: boolean;
  onComplete?: SideQuestStep['onComplete'];
}

// Check all active side quests for trigger matches
export function checkSideQuestTriggers(
  registry: SideQuestRegistry,
  ctx: SideQuestTriggerContext,
): SideQuestTriggerResult[] {
  const results: SideQuestTriggerResult[] = [];

  for (const [questId, state] of Object.entries(registry)) {
    if (state.status !== 'active') continue;

    const quest = SIDE_QUESTS[questId];
    if (!quest) continue;

    const step = quest.steps[state.currentStepIndex];
    if (!step) continue;

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
        // Checked when a battle is won
        break;
      }
      case 'auto': {
        matched = true;
        break;
      }
    }

    if (matched) {
      results.push({
        questId,
        stepId: step.id,
        triggered: true,
        onComplete: step.onComplete,
      });
    }
  }

  return results;
}

// ─── Quest Progression ───────────────────────────────────────

// Advance a quest to the next step
export function advanceSideQuest(
  registry: SideQuestRegistry,
  questId: string,
): { registry: SideQuestRegistry; completed: boolean; nextQuestId?: string } {
  const quest = SIDE_QUESTS[questId];
  if (!quest) return { registry, completed: false };

  const state = registry[questId];
  if (!state || state.status !== 'active') return { registry, completed: false };

  const nextIndex = state.currentStepIndex + 1;
  const newRegistry = { ...registry };

  if (nextIndex < quest.steps.length) {
    // More steps remaining
    newRegistry[questId] = { ...state, currentStepIndex: nextIndex };
    return { registry: newRegistry, completed: false };
  }

  // Quest complete
  newRegistry[questId] = { status: 'completed', currentStepIndex: nextIndex };

  // Unlock next quest in chain if applicable
  if (quest.nextQuestId) {
    newRegistry[quest.nextQuestId] = { status: 'not_started', currentStepIndex: 0 };
  }

  return {
    registry: newRegistry,
    completed: true,
    nextQuestId: quest.nextQuestId,
  };
}

// Start a side quest
export function startSideQuest(
  registry: SideQuestRegistry,
  questId: string,
): SideQuestRegistry {
  const quest = SIDE_QUESTS[questId];
  if (!quest) return registry;

  return {
    ...registry,
    [questId]: { status: 'active', currentStepIndex: 0 },
  };
}

// ─── Butterfly Effect Handler ────────────────────────────────
// Checks story flags against known butterfly flag patterns
// Returns narrative consequences that should affect future quests

export interface ButterflyConsequence {
  description: string;
  affectsQuests: string[];
  modifiesDialogs: string[];
}

// Map of butterfly flags to their consequences
const BUTTERFLY_MAP: Record<string, ButterflyConsequence> = {
  sq_spared_thief_delhi: {
    description: 'The thief you spared in Delhi may return to help you later.',
    affectsQuests: ['SIDE_DELHI_MYSTERY_3'],
    modifiesDialogs: ['sq_delhi_treasury_entry'],
  },
  sq_returned_sanad: {
    description: 'Merchant Fatima remembers your kindness. Delhi merchants trust you.',
    affectsQuests: ['SIDE_DELHI_MYSTERY_2'],
    modifiesDialogs: ['sq_delhi_official_confront'],
  },
  sq_kept_sanad: {
    description: 'You kept the stolen sanad. Merchants in Delhi distrust you, but you have leverage.',
    affectsQuests: ['SIDE_DELHI_MYSTERY_2'],
    modifiesDialogs: ['sq_delhi_official_confront'],
  },
  sq_exposed_official: {
    description: 'You exposed the corrupt official. The Vizier looks upon you favorably.',
    affectsQuests: ['SIDE_DELHI_MYSTERY_3'],
    modifiesDialogs: ['quest_vizier_mission'],
  },
  sq_blackmailed_official: {
    description: 'You blackmailed the official. He is your reluctant ally — but fears you.',
    affectsQuests: ['SIDE_DELHI_MYSTERY_3'],
    modifiesDialogs: [],
  },
  sq_raj_chief_spared: {
    description: 'The bandit chief owes you a debt. Desert outlaws no longer attack you.',
    affectsQuests: [],
    modifiesDialogs: [],
  },
  sq_raj_chief_killed: {
    description: 'The bandit chief is dead. A power vacuum creates new dangers on the trade roads.',
    affectsQuests: [],
    modifiesDialogs: [],
  },
  sq_var_necro_artifacts_destroyed: {
    description: 'You destroyed the dark artifacts. Varanasi is cleansed of evil.',
    affectsQuests: [],
    modifiesDialogs: [],
  },
  sq_var_necro_artifacts_kept: {
    description: 'You kept a dark artifact. Its power whispers to you at night...',
    affectsQuests: [],
    modifiesDialogs: [],
  },
  sq_goa_allied_portuguese: {
    description: 'You brokered a trading alliance with Portugal. European goods flow into India.',
    affectsQuests: [],
    modifiesDialogs: [],
  },
  sq_goa_sabotaged_portuguese: {
    description: 'You sabotaged the Portuguese. They will remember your treachery.',
    affectsQuests: [],
    modifiesDialogs: [],
  },
  sq_assam_refugees_safe: {
    description: 'The refugee family is safe. Your name is spoken with reverence in Assam.',
    affectsQuests: [],
    modifiesDialogs: [],
  },
};

export function getButterflyConsequences(storyFlags: Set<string>): ButterflyConsequence[] {
  const consequences: ButterflyConsequence[] = [];
  for (const [flag, consequence] of Object.entries(BUTTERFLY_MAP)) {
    if (storyFlags.has(flag)) {
      consequences.push(consequence);
    }
  }
  return consequences;
}

// Check if a specific butterfly flag affects a given quest
export function doesButterflyAffectQuest(storyFlags: Set<string>, questId: string): string[] {
  const flags: string[] = [];
  for (const [flag, consequence] of Object.entries(BUTTERFLY_MAP)) {
    if (storyFlags.has(flag) && consequence.affectsQuests.includes(questId)) {
      flags.push(flag);
    }
  }
  return flags;
}

// Get objective text for the current step of an active side quest
export function getSideQuestObjective(
  registry: SideQuestRegistry,
  questId: string,
): string | null {
  const quest = SIDE_QUESTS[questId];
  const state = registry[questId];
  if (!quest || !state || state.status !== 'active') return null;

  const step = quest.steps[state.currentStepIndex];
  return step?.description ?? null;
}
