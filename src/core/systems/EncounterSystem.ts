import { System } from '../ecs/types';
import { ENCOUNTER_TILES } from '../../types';
import { SCALED_TILE, ENCOUNTER_RATE } from '../../engine/constants';
import { getZoneAt, getRouteAt } from '../../data/zones';

// Tracks steps and triggers random encounters on encounter tiles.
// Zone-aware: encounter rate is modified by the current zone/route.
// Towns/sacred groves have low rates; wild zones and bandit camps have high rates.

let stepCount = 0;
let lastEncounterStep = 0;
let prevX = -1;
let prevY = -1;
let encounterTriggered = false;
let lastEncounterZoneId: string | undefined;
let lastEncounterEnemyPool: string[] | undefined;

const MIN_STEPS_BETWEEN = 15;

export function resetEncounterState() {
  stepCount = 0;
  lastEncounterStep = 0;
  prevX = -1;
  prevY = -1;
  encounterTriggered = false;
  lastEncounterZoneId = undefined;
  lastEncounterEnemyPool = undefined;
}

export function consumeEncounter(): boolean {
  if (encounterTriggered) {
    encounterTriggered = false;
    return true;
  }
  return false;
}

// Get the zone-specific enemy pool for the last encounter location
export function getEncounterEnemyPool(): string[] | undefined {
  return lastEncounterEnemyPool;
}

// Get the suggested level for the current location
export function getEncounterSuggestedLevel(tileX: number, tileY: number): number {
  const zone = getZoneAt(tileX, tileY);
  if (zone) return zone.suggestedLevel;
  const route = getRouteAt(tileX, tileY);
  if (route) return route.suggestedLevel;
  return 1; // default
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
    // Calculate zone-aware encounter rate
    let rate = ENCOUNTER_RATE;
    let enemyPool: string[] | undefined;

    // Check sub-zones first (highest priority)
    const zone = getZoneAt(tileX, tileY);
    if (zone) {
      rate *= zone.encounterRate;
      enemyPool = zone.enemyPool;
    } else {
      // Check routes
      const route = getRouteAt(tileX, tileY);
      if (route) {
        rate *= route.encounterRate;
        enemyPool = route.enemyPool;
      }
    }

    // No encounters in towns (encounter rate 0 zones)
    if (rate <= 0) return;

    if (Math.random() < rate) {
      lastEncounterStep = stepCount;
      encounterTriggered = true;
      lastEncounterEnemyPool = enemyPool;
      lastEncounterZoneId = zone?.id;
    }
  }
};
