import { useRef, useEffect, useCallback, useState } from 'react';
import { Direction, Position, NPC, SOLID_TILES, ENCOUNTER_TILES, TileMapData, DialogState } from '../types';
import { SCALED_TILE, MOVE_SPEED, TICK_MS, INTERACT_RANGE, SCALE, ENCOUNTER_RATE } from './constants';

interface GameState {
  playerPos: Position;
  playerDir: Direction;
  playerMoving: boolean;
  animFrame: number;
  cameraX: number;
  cameraY: number;
  dialog: DialogState;
  encounter: boolean;
}

export function useGameLoop(
  map: TileMapData,
  npcs: NPC[],
  startPos: Position,
) {
  const moveDir = useRef<Direction | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCount = useRef(0);
  const stepCount = useRef(0);
  const lastEncounterStep = useRef(0);

  const [gameState, setGameState] = useState<GameState>(() => ({
    playerPos: { x: startPos.x * SCALED_TILE, y: startPos.y * SCALED_TILE },
    playerDir: 'down',
    playerMoving: false,
    animFrame: 0,
    cameraX: startPos.x * SCALED_TILE,
    cameraY: startPos.y * SCALED_TILE,
    dialog: { active: false, npcName: '', lines: [], currentLine: 0 },
    encounter: false,
  }));

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const pausedRef = useRef(false);
  const setPaused = useCallback((p: boolean) => { pausedRef.current = p; }, []);

  const canMoveTo = useCallback((px: number, py: number): boolean => {
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
      if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) return false;
      if (SOLID_TILES.has(map.ground[tileY][tileX])) return false;
    }
    return true;
  }, [map]);

  const tick = useCallback(() => {
    const state = stateRef.current;
    if (state.dialog.active || state.encounter || pausedRef.current) return;

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

    let moved = false;
    if (canMoveTo(nx, ny)) { x = nx; y = ny; moved = true; }
    else if (nx !== x && canMoveTo(nx, y)) { x = nx; moved = true; }
    else if (ny !== y && canMoveTo(x, ny)) { y = ny; moved = true; }

    // Random encounter check
    if (moved) {
      stepCount.current++;
      const tileX = Math.floor((x + SCALED_TILE / 2) / SCALED_TILE);
      const tileY = Math.floor((y + SCALED_TILE / 2) / SCALED_TILE);
      const tile = map.ground[tileY]?.[tileX];

      if (tile !== undefined && ENCOUNTER_TILES.has(tile) &&
          stepCount.current - lastEncounterStep.current > 15) {
        if (Math.random() < ENCOUNTER_RATE) {
          lastEncounterStep.current = stepCount.current;
          setGameState(prev => ({
            ...prev,
            playerPos: { x, y },
            playerMoving: false,
            encounter: true,
          }));
          return;
        }
      }
    }

    const camLerp = 0.12;
    const camX = state.cameraX + (x - state.cameraX) * camLerp;
    const camY = state.cameraY + (y - state.cameraY) * camLerp;

    setGameState(prev => ({
      ...prev,
      playerPos: { x, y },
      playerDir: dir,
      playerMoving: true,
      animFrame: Math.floor(frameCount.current / 6) % 4,
      cameraX: camX,
      cameraY: camY,
    }));
  }, [canMoveTo, map]);

  useEffect(() => {
    tickRef.current = setInterval(tick, TICK_MS);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [tick]);

  const setDirection = useCallback((dir: Direction | null) => {
    moveDir.current = dir;
  }, []);

  const clearEncounter = useCallback(() => {
    setGameState(prev => ({ ...prev, encounter: false }));
  }, []);

  const interact = useCallback(() => {
    const state = stateRef.current;

    if (state.dialog.active) {
      if (state.dialog.currentLine < state.dialog.lines.length - 1) {
        setGameState(prev => ({
          ...prev,
          dialog: { ...prev.dialog, currentLine: prev.dialog.currentLine + 1 },
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          dialog: { active: false, npcName: '', lines: [], currentLine: 0 },
        }));
      }
      return;
    }

    const playerTileX = state.playerPos.x / SCALED_TILE;
    const playerTileY = state.playerPos.y / SCALED_TILE;

    for (const npc of npcs) {
      const dx = npc.position.x - playerTileX;
      const dy = npc.position.y - playerTileY;
      if (Math.sqrt(dx * dx + dy * dy) < INTERACT_RANGE) {
        setGameState(prev => ({
          ...prev,
          dialog: { active: true, npcName: npc.name, lines: npc.dialog, currentLine: 0 },
        }));
        return;
      }
    }
  }, [npcs]);

  return { gameState, setDirection, interact, setPaused, clearEncounter };
}
