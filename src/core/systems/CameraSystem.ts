import { System } from '../ecs/types';

// Smooth camera follow with lerp
const CAM_LERP = 0.12;

// Camera state (mutable for performance — synced to store by the loop)
export let cameraX = 0;
export let cameraY = 0;

export function initCamera(x: number, y: number) {
  cameraX = x;
  cameraY = y;
}

export const CameraSystem: System = (entities) => {
  const player = entities.get('player');
  if (!player) return;

  cameraX += (player.position.x - cameraX) * CAM_LERP;
  cameraY += (player.position.y - cameraY) * CAM_LERP;
};
