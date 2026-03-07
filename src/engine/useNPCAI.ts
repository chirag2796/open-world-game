import { useRef, useCallback } from 'react';
import { NPC, Direction, TileMapData, SOLID_TILES } from '../types';
import { SCALED_TILE } from './constants';

interface NPCState {
  position: { x: number; y: number };
  direction: Direction;
  originX: number;
  originY: number;
  walkTimer: number;
  idleTimer: number;
  isWalking: boolean;
  animFrame: number;
}

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

function canNPCMoveTo(px: number, py: number, map: TileMapData): boolean {
  const tileX = Math.floor(px / SCALED_TILE);
  const tileY = Math.floor(py / SCALED_TILE);
  if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) return false;
  return !SOLID_TILES.has(map.ground[tileY][tileX]);
}

export function useNPCAI(npcs: NPC[], map: TileMapData) {
  const statesRef = useRef<Map<string, NPCState>>(new Map());
  const frameRef = useRef(0);

  // Initialize NPC states on first call
  if (statesRef.current.size === 0) {
    for (const npc of npcs) {
      statesRef.current.set(npc.id, {
        position: { x: npc.position.x * SCALED_TILE, y: npc.position.y * SCALED_TILE },
        direction: npc.direction,
        originX: npc.position.x * SCALED_TILE,
        originY: npc.position.y * SCALED_TILE,
        walkTimer: 0,
        idleTimer: Math.floor(Math.random() * 60) + 30,
        isWalking: false,
        animFrame: 0,
      });
    }
  }

  const tickNPCs = useCallback((playerPx: number, playerPy: number, dialogActive: boolean) => {
    if (dialogActive) return;
    frameRef.current++;

    for (const npc of npcs) {
      const state = statesRef.current.get(npc.id);
      if (!state) continue;

      if (npc.behavior === 'stationary') continue;

      if (npc.behavior === 'guard') {
        // Guards face the player when close
        const dx = playerPx - state.position.x;
        const dy = playerPy - state.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < SCALED_TILE * 5) {
          if (Math.abs(dx) > Math.abs(dy)) {
            state.direction = dx > 0 ? 'right' : 'left';
          } else {
            state.direction = dy > 0 ? 'down' : 'up';
          }
        }
        continue;
      }

      if (npc.behavior === 'patrol' && npc.patrolPath && npc.patrolPath.length > 0) {
        // TODO: patrol path following (future enhancement)
        continue;
      }

      // Wandering behavior
      if (state.isWalking) {
        state.walkTimer--;
        state.animFrame = Math.floor(frameRef.current / 8) % 4;

        if (state.walkTimer <= 0) {
          state.isWalking = false;
          state.idleTimer = Math.floor(Math.random() * 90) + 40;
          state.animFrame = 0;
          continue;
        }

        const speed = 1;
        let nx = state.position.x;
        let ny = state.position.y;

        switch (state.direction) {
          case 'up': ny -= speed; break;
          case 'down': ny += speed; break;
          case 'left': nx -= speed; break;
          case 'right': nx += speed; break;
        }

        // Check bounds (stay within wander radius)
        const radius = (npc.wanderRadius || 3) * SCALED_TILE;
        const distFromOrigin = Math.sqrt(
          Math.pow(nx - state.originX, 2) + Math.pow(ny - state.originY, 2)
        );

        if (distFromOrigin < radius && canNPCMoveTo(nx, ny, map)) {
          state.position.x = nx;
          state.position.y = ny;
        } else {
          // Turn around
          state.isWalking = false;
          state.idleTimer = 20;
        }
      } else {
        state.idleTimer--;
        if (state.idleTimer <= 0) {
          // Start walking in random direction
          state.direction = DIRECTIONS[Math.floor(Math.random() * 4)];
          state.isWalking = true;
          state.walkTimer = Math.floor(Math.random() * 40) + 15;
        }
      }
    }
  }, [npcs, map]);

  const getNPCPositions = useCallback((): { id: string; px: number; py: number; dir: Direction; animFrame: number }[] => {
    const result: { id: string; px: number; py: number; dir: Direction; animFrame: number }[] = [];
    for (const npc of npcs) {
      const state = statesRef.current.get(npc.id);
      if (state) {
        result.push({
          id: npc.id,
          px: state.position.x,
          py: state.position.y,
          dir: state.direction,
          animFrame: state.isWalking ? state.animFrame : 0,
        });
      }
    }
    return result;
  }, [npcs]);

  // Face player when talking
  const facePlayer = useCallback((npcId: string, playerPx: number, playerPy: number) => {
    const state = statesRef.current.get(npcId);
    if (!state) return;
    const dx = playerPx - state.position.x;
    const dy = playerPy - state.position.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      state.direction = dx > 0 ? 'right' : 'left';
    } else {
      state.direction = dy > 0 ? 'down' : 'up';
    }
    state.isWalking = false;
  }, []);

  return { tickNPCs, getNPCPositions, facePlayer };
}
