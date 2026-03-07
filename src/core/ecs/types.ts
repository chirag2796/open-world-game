import { Direction, TileMapData, NPC } from '../../types';

// Entity-Component-System types for the game loop.
// Components are plain data. Systems are pure functions that process them.

// === COMPONENTS ===

export interface PositionComponent {
  x: number;
  y: number;
}

export interface VelocityComponent {
  dx: number;
  dy: number;
  speed: number;
}

export interface SpriteComponent {
  direction: Direction;
  moving: boolean;
  animFrame: number;
  frameCounter: number;
}

export interface CollisionComponent {
  solid: boolean;
  inset: number; // collision box inset fraction (0-1)
}

export interface NPCComponent {
  npcId: string;
  behavior: 'stationary' | 'wander' | 'guard' | 'patrol';
  wanderRadius: number;
  originX: number;
  originY: number;
  walkTimer: number;
  idleTimer: number;
}

// === ENTITY ===

export interface Entity {
  id: string;
  position: PositionComponent;
  velocity?: VelocityComponent;
  sprite: SpriteComponent;
  collision?: CollisionComponent;
  npc?: NPCComponent;
}

// === SYSTEM CONTEXT ===
// Passed to every system on each tick

export interface SystemContext {
  dt: number;           // delta time in ms
  map: TileMapData;     // the world map
  npcs: NPC[];          // NPC definitions
  inputDir: Direction | null; // current D-pad input
}

// === SYSTEM ===
// A pure function that processes entities each tick

export type System = (entities: Map<string, Entity>, ctx: SystemContext) => void;
