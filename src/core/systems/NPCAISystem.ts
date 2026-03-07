import { System, Entity } from '../ecs/types';
import { Direction, SOLID_TILES } from '../../types';
import { SCALED_TILE } from '../../engine/constants';

const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

function canNPCMoveTo(px: number, py: number, map: { width: number; height: number; ground: number[][] }): boolean {
  const tx = Math.floor(px / SCALED_TILE);
  const ty = Math.floor(py / SCALED_TILE);
  if (tx < 0 || tx >= map.width || ty < 0 || ty >= map.height) return false;
  return !SOLID_TILES.has(map.ground[ty][tx]);
}

let frameCounter = 0;

export const NPCAISystem: System = (entities, ctx) => {
  frameCounter++;
  const player = entities.get('player');
  const playerPx = player?.position.x ?? 0;
  const playerPy = player?.position.y ?? 0;

  for (const [id, entity] of entities) {
    if (id === 'player' || !entity.npc) continue;
    const npc = entity.npc;

    if (npc.behavior === 'stationary') continue;

    if (npc.behavior === 'guard') {
      const dx = playerPx - entity.position.x;
      const dy = playerPy - entity.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < SCALED_TILE * 5) {
        entity.sprite.direction = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? 'right' : 'left')
          : (dy > 0 ? 'down' : 'up');
      }
      continue;
    }

    // Wandering behavior
    if (entity.sprite.moving) {
      npc.walkTimer--;
      entity.sprite.animFrame = Math.floor(frameCounter / 8) % 4;

      if (npc.walkTimer <= 0) {
        entity.sprite.moving = false;
        npc.idleTimer = Math.floor(Math.random() * 90) + 40;
        entity.sprite.animFrame = 0;
        continue;
      }

      const speed = 1;
      let nx = entity.position.x;
      let ny = entity.position.y;

      switch (entity.sprite.direction) {
        case 'up':    ny -= speed; break;
        case 'down':  ny += speed; break;
        case 'left':  nx -= speed; break;
        case 'right': nx += speed; break;
      }

      const radius = npc.wanderRadius * SCALED_TILE;
      const distFromOrigin = Math.sqrt(
        Math.pow(nx - npc.originX, 2) + Math.pow(ny - npc.originY, 2)
      );

      if (distFromOrigin < radius && canNPCMoveTo(nx, ny, ctx.map)) {
        entity.position.x = nx;
        entity.position.y = ny;
      } else {
        entity.sprite.moving = false;
        npc.idleTimer = 20;
      }
    } else {
      npc.idleTimer--;
      if (npc.idleTimer <= 0) {
        entity.sprite.direction = DIRECTIONS[Math.floor(Math.random() * 4)];
        entity.sprite.moving = true;
        npc.walkTimer = Math.floor(Math.random() * 40) + 15;
      }
    }
  }
};
