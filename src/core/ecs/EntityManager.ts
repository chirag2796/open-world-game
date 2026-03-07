import { Entity, PositionComponent, SpriteComponent, NPCComponent } from './types';
import { NPC } from '../../types';
import { SCALED_TILE } from '../../engine/constants';

// Creates and manages game entities

export class EntityManager {
  private entities = new Map<string, Entity>();

  createPlayer(startX: number, startY: number): Entity {
    const entity: Entity = {
      id: 'player',
      position: { x: startX * SCALED_TILE, y: startY * SCALED_TILE },
      velocity: { dx: 0, dy: 0, speed: 2 * 3 }, // MOVE_SPEED * SCALE
      sprite: { direction: 'down', moving: false, animFrame: 0, frameCounter: 0 },
      collision: { solid: true, inset: 0.2 },
    };
    this.entities.set('player', entity);
    return entity;
  }

  createNPC(npc: NPC): Entity {
    const entity: Entity = {
      id: npc.id,
      position: { x: npc.position.x * SCALED_TILE, y: npc.position.y * SCALED_TILE },
      sprite: { direction: npc.direction, moving: false, animFrame: 0, frameCounter: 0 },
      collision: { solid: true, inset: 0.2 },
      npc: {
        npcId: npc.id,
        behavior: npc.behavior,
        wanderRadius: npc.wanderRadius || 3,
        originX: npc.position.x * SCALED_TILE,
        originY: npc.position.y * SCALED_TILE,
        walkTimer: 0,
        idleTimer: Math.floor(Math.random() * 60) + 30,
      },
    };
    this.entities.set(npc.id, entity);
    return entity;
  }

  get(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getPlayer(): Entity | undefined {
    return this.entities.get('player');
  }

  getAll(): Map<string, Entity> {
    return this.entities;
  }

  getNPCs(): Entity[] {
    const result: Entity[] = [];
    for (const [id, entity] of this.entities) {
      if (id !== 'player' && entity.npc) result.push(entity);
    }
    return result;
  }

  remove(id: string): void {
    this.entities.delete(id);
  }

  clear(): void {
    this.entities.clear();
  }
}
