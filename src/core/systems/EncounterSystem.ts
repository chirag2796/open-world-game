import { System } from '../ecs/types';
import { ENCOUNTER_TILES } from '../../types';
import { SCALED_TILE, ENCOUNTER_RATE } from '../../engine/constants';

// Tracks steps and triggers random encounters on encounter tiles.
// State is stored externally (in Zustand) — this system just detects and signals.

let stepCount = 0;
let lastEncounterStep = 0;
let prevX = -1;
let prevY = -1;
let encounterTriggered = false;

const MIN_STEPS_BETWEEN = 15;

export function resetEncounterState() {
  stepCount = 0;
  lastEncounterStep = 0;
  prevX = -1;
  prevY = -1;
  encounterTriggered = false;
}

export function consumeEncounter(): boolean {
  if (encounterTriggered) {
    encounterTriggered = false;
    return true;
  }
  return false;
}

export const EncounterSystem: System = (entities, ctx) => {
  const player = entities.get('player');
  if (!player || !player.sprite.moving) return;

  const { x, y } = player.position;
  const tileX = Math.floor((x + SCALED_TILE / 2) / SCALED_TILE);
  const tileY = Math.floor((y + SCALED_TILE / 2) / SCALED_TILE);

  // Only count when moved to a new tile
  if (tileX === prevX && tileY === prevY) return;
  prevX = tileX;
  prevY = tileY;
  stepCount++;

  const tile = ctx.map.ground[tileY]?.[tileX];
  if (tile === undefined) return;

  if (ENCOUNTER_TILES.has(tile) && stepCount - lastEncounterStep > MIN_STEPS_BETWEEN) {
    if (Math.random() < ENCOUNTER_RATE) {
      lastEncounterStep = stepCount;
      encounterTriggered = true;
    }
  }
};
