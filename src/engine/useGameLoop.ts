import { useRef, useEffect, useCallback, useState } from 'react';
import { Direction, Position, NPC, SOLID_TILES, TileMapData, DialogState } from '../types';
import { SCALED_TILE, MOVE_SPEED, TICK_MS, INTERACT_RANGE, TILE_SIZE, SCALE } from './constants';

interface GameState {
  playerPos: Position;       // pixel position
  playerDir: Direction;
  playerMoving: boolean;
  animFrame: number;
  cameraX: number;
  cameraY: number;
  dialog: DialogState;
}

export function useGameLoop(
  map: TileMapData,
  npcs: NPC[],
  startPos: Position,
) {
  const moveDir = useRef<Direction | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCount = useRef(0);

  const [gameState, setGameState] = useState<GameState>(() => ({
    playerPos: { x: startPos.x * SCALED_TILE, y: startPos.y * SCALED_TILE },
    playerDir: 'down',
    playerMoving: false,
    animFrame: 0,
    cameraX: startPos.x * SCALED_TILE,
    cameraY: startPos.y * SCALED_TILE,
    dialog: { active: false, npcName: '', lines: [], currentLine: 0 },
  }));

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const canMoveTo = useCallback((px: number, py: number): boolean => {
    // Check all four corners of the player bounding box (slightly inset)
    const inset = SCALED_TILE * 0.2;
    const corners = [
      { x: px + inset, y: py + inset },
      { x: px + SCALED_TILE - inset, y: py + inset },
      { x: px + inset, y: py + SCALED_TILE - inset },
      { x: px + SCALED_TILE - inset, y: py + SCALED_TILE - inset },
    ];
    for (const corner of corners) {
      const tileX = Math.floor(corner.x / SCALED_TILE);
      const tileY = Math.floor(corner.y / SCALED_TILE);
      // Out of bounds
      if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
        return false;
      }
      // Check ground layer
      const groundTile = map.layers.ground[tileY][tileX];
      if (SOLID_TILES.has(groundTile)) return false;
      // Check objects layer
      const objTile = map.layers.objects[tileY]?.[tileX];
      if (objTile !== null && objTile !== undefined && SOLID_TILES.has(objTile)) return false;
    }

    // Check NPC collision
    for (const npc of npcs) {
      const npcPx = npc.position.x * SCALED_TILE;
      const npcPy = npc.position.y * SCALED_TILE;
      const overlap =
        px + SCALED_TILE * 0.8 > npcPx + SCALED_TILE * 0.2 &&
        px + SCALED_TILE * 0.2 < npcPx + SCALED_TILE * 0.8 &&
        py + SCALED_TILE * 0.8 > npcPy + SCALED_TILE * 0.2 &&
        py + SCALED_TILE * 0.2 < npcPy + SCALED_TILE * 0.8;
      if (overlap) return false;
    }

    return true;
  }, [map, npcs]);

  const tick = useCallback(() => {
    const state = stateRef.current;
    if (state.dialog.active) return; // freeze movement during dialog

    const dir = moveDir.current;
    if (!dir) {
      if (state.playerMoving) {
        setGameState(prev => ({ ...prev, playerMoving: false }));
      }
      return;
    }

    frameCount.current++;
    let { x, y } = state.playerPos;
    const speed = MOVE_SPEED * SCALE;

    let nx = x, ny = y;
    switch (dir) {
      case 'up': ny -= speed; break;
      case 'down': ny += speed; break;
      case 'left': nx -= speed; break;
      case 'right': nx += speed; break;
    }

    // Try full movement first, then axis-only fallback
    if (canMoveTo(nx, ny)) {
      x = nx; y = ny;
    } else if (nx !== x && canMoveTo(nx, y)) {
      x = nx;
    } else if (ny !== y && canMoveTo(x, ny)) {
      y = ny;
    }

    // Smooth camera follow
    const camLerp = 0.12;
    const camX = state.cameraX + (x - state.cameraX) * camLerp;
    const camY = state.cameraY + (y - state.cameraY) * camLerp;

    setGameState(prev => ({
      ...prev,
      playerPos: { x, y },
      playerDir: dir,
      playerMoving: true,
      animFrame: Math.floor(frameCount.current / 8) % 2,
      cameraX: camX,
      cameraY: camY,
    }));
  }, [canMoveTo]);

  useEffect(() => {
    tickRef.current = setInterval(tick, TICK_MS);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [tick]);

  const setDirection = useCallback((dir: Direction | null) => {
    moveDir.current = dir;
  }, []);

  const interact = useCallback(() => {
    const state = stateRef.current;

    // If dialog is active, advance it
    if (state.dialog.active) {
      if (state.dialog.currentLine < state.dialog.lines.length - 1) {
        setGameState(prev => ({
          ...prev,
          dialog: { ...prev.dialog, currentLine: prev.dialog.currentLine + 1 },
        }));
      } else {
        // Close dialog
        setGameState(prev => ({
          ...prev,
          dialog: { active: false, npcName: '', lines: [], currentLine: 0 },
        }));
      }
      return;
    }

    // Check for nearby NPCs
    const playerTileX = state.playerPos.x / SCALED_TILE;
    const playerTileY = state.playerPos.y / SCALED_TILE;

    for (const npc of npcs) {
      const dx = npc.position.x - playerTileX;
      const dy = npc.position.y - playerTileY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < INTERACT_RANGE) {
        setGameState(prev => ({
          ...prev,
          dialog: {
            active: true,
            npcName: npc.name,
            lines: npc.dialog,
            currentLine: 0,
          },
        }));
        return;
      }
    }
  }, [npcs]);

  return {
    gameState,
    setDirection,
    interact,
  };
}
