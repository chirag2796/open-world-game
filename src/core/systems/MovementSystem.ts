import { System } from '../ecs/types';
import { SOLID_TILES } from '../../types';
import { SCALED_TILE, DEV_MODE } from '../../engine/constants';

// Checks if a bounding box at (px, py) with given inset can occupy the tile
function canMoveTo(
  px: number, py: number, inset: number,
  map: { width: number; height: number; ground: number[][] },
): boolean {
  const offset = SCALED_TILE * inset;
  const corners = [
    { x: px + offset, y: py + offset },
    { x: px + SCALED_TILE - offset, y: py + offset },
    { x: px + offset, y: py + SCALED_TILE - offset },
    { x: px + SCALED_TILE - offset, y: py + SCALED_TILE - offset },
  ];
  for (const c of corners) {
    const tx = Math.floor(c.x / SCALED_TILE);
    const ty = Math.floor(c.y / SCALED_TILE);
    if (tx < 0 || tx >= map.width || ty < 0 || ty >= map.height) return false;
    if (SOLID_TILES.has(map.ground[ty][tx])) return false;
  }
  return true;
}

export const MovementSystem: System = (entities, ctx) => {
  const player = entities.get('player');
  if (!player || !player.velocity || !player.collision) return;

  const dir = ctx.inputDir;
  if (!dir) {
    if (player.sprite.moving) {
      player.sprite.moving = false;
    }
    return;
  }

  player.sprite.frameCounter++;
  const speed = player.velocity.speed;
  let { x, y } = player.position;
  let nx = x, ny = y;

  switch (dir) {
    case 'up':    ny -= speed; break;
    case 'down':  ny += speed; break;
    case 'left':  nx -= speed; break;
    case 'right': nx += speed; break;
  }

  const inset = player.collision.inset;
  let moved = false;

  if (DEV_MODE) {
    // God mode: skip collision, just clamp to map bounds
    x = Math.max(0, Math.min(nx, (ctx.map.width - 1) * SCALED_TILE));
    y = Math.max(0, Math.min(ny, (ctx.map.height - 1) * SCALED_TILE));
    moved = true;
  } else if (canMoveTo(nx, ny, inset, ctx.map)) {
    x = nx; y = ny; moved = true;
  } else if (nx !== x && canMoveTo(nx, y, inset, ctx.map)) {
    x = nx; moved = true;
  } else if (ny !== y && canMoveTo(x, ny, inset, ctx.map)) {
    y = ny; moved = true;
  }

  player.position.x = x;
  player.position.y = y;
  player.sprite.direction = dir;
  player.sprite.moving = moved;
  player.sprite.animFrame = moved ? Math.floor(player.sprite.frameCounter / 6) % 4 : 0;
};
