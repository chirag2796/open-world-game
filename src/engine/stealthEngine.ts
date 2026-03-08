// Stealth Engine — noise calculation, detection, and stealth checks
// Uses equipment weight from Plan 7 to determine noise level

import { StealthState, WantedTier } from '../types';

// ─── Constants ───────────────────────────────────────────────

const BASE_NOISE = 30;
const WEIGHT_NOISE_SCALE = 3;
const CROUCH_NOISE_REDUCTION = 0.4;
const DETECTION_FILL_RATE = 5;
const DETECTION_DRAIN_RATE = 3;
const DETECTION_THRESHOLD = 100;

const HOUR_VISIBILITY: Record<number, number> = {
  0: 15, 1: 10, 2: 10, 3: 10, 4: 15, 5: 25,
  6: 40, 7: 55, 8: 70, 9: 80, 10: 85, 11: 90,
  12: 90, 13: 85, 14: 80, 15: 75, 16: 65, 17: 55,
  18: 40, 19: 30, 20: 25, 21: 20, 22: 15, 23: 15,
};

const TERRAIN_VISIBILITY: Record<string, number> = {
  forest: -20, dense_forest: -35, wetland: -15, mountain: -10,
  plains: 10, desert: 15, snow: 5, coastal: 5, plateau: 0, ocean: 0,
};

// ─── Noise Calculation ───────────────────────────────────────

export function calculateNoise(
  equipWeight: number,
  isStealthMode: boolean,
  isMoving: boolean,
): number {
  if (!isMoving) return 0;
  let noise = BASE_NOISE + equipWeight * WEIGHT_NOISE_SCALE;
  if (isStealthMode) noise *= CROUCH_NOISE_REDUCTION;
  return Math.round(Math.max(0, Math.min(100, noise)));
}

export function calculateVisibility(
  gameHour: number,
  biome: string,
  isStealthMode: boolean,
): number {
  const hourVis = HOUR_VISIBILITY[gameHour] ?? 50;
  const terrainMod = TERRAIN_VISIBILITY[biome] ?? 0;
  let vis = hourVis + terrainMod;
  if (isStealthMode) vis *= 0.5;
  return Math.round(Math.max(0, Math.min(100, vis)));
}

// ─── Detection System ────────────────────────────────────────

export function updateDetection(
  current: StealthState,
  nearGuard: boolean,
  noise: number,
  visibility: number,
): StealthState {
  let meter = current.detectionMeter;
  if (nearGuard) {
    const rate = DETECTION_FILL_RATE * (noise / 50) * (visibility / 50);
    meter = Math.min(DETECTION_THRESHOLD, meter + rate);
  } else {
    meter = Math.max(0, meter - DETECTION_DRAIN_RATE);
  }
  return { ...current, noiseLevel: noise, visibility, detectionMeter: Math.round(meter) };
}

export function isDetected(state: StealthState): boolean {
  return state.detectionMeter >= DETECTION_THRESHOLD;
}

export function resetDetection(state: StealthState): StealthState {
  return { ...state, detectionMeter: 0 };
}

// ─── Stealth Checks ──────────────────────────────────────────

export interface StealthCheckResult {
  success: boolean;
  message: string;
}

export function stealthCheck(
  noise: number,
  visibility: number,
  difficulty: number,
  wantedLevel: WantedTier,
): StealthCheckResult {
  const stealthScore = 100 - (noise + visibility) / 2;
  const wantedPenalty = wantedLevel * 10;
  const chance = Math.max(5, stealthScore - difficulty - wantedPenalty);
  const roll = Math.random() * 100;

  if (roll < chance) {
    return { success: true, message: 'You slip past unnoticed.' };
  }
  const msgs = [
    'A guard spots your shadow!',
    'Your armor clinks — you\'ve been noticed!',
    'The guard turns — too late to hide!',
  ];
  return { success: false, message: msgs[Math.floor(Math.random() * msgs.length)] };
}

export function pickpocketCheck(
  noise: number,
  visibility: number,
  targetDifficulty: number,
  wantedLevel: WantedTier,
): StealthCheckResult & { loot: number } {
  const result = stealthCheck(noise, visibility, targetDifficulty, wantedLevel);
  if (result.success) {
    const loot = Math.floor((10 + targetDifficulty) * (0.5 + Math.random()));
    return { ...result, loot, message: `Nimble fingers! You lifted ${loot} dam.` };
  }
  return { ...result, loot: 0 };
}

// ─── Wanted Level ────────────────────────────────────────────

const WANTED_DECAY_MINUTES = 720; // 12 game hours per tier decay

export function decayWantedHeat(currentHeat: number, elapsedMinutes: number): number {
  const decay = Math.floor(elapsedMinutes / WANTED_DECAY_MINUTES) * 25;
  return Math.max(0, currentHeat - decay);
}

export function heatToTier(heat: number): WantedTier {
  if (heat >= 75) return 3;
  if (heat >= 50) return 2;
  if (heat >= 25) return 1;
  return 0;
}

export function getWantedLabel(tier: WantedTier): string {
  switch (tier) {
    case 0: return '';
    case 1: return 'SUSPECTED';
    case 2: return 'WANTED';
    case 3: return 'HUNTED';
  }
}
