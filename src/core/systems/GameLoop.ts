import { System, SystemContext, Entity } from '../ecs/types';
import { TileMapData, NPC, Direction } from '../../types';

// Fixed-timestep game loop running at ~30fps (33ms ticks).
// Uses requestAnimationFrame for smooth scheduling but accumulates
// time to ensure consistent simulation regardless of frame rate.

const TICK_MS = 33; // ~30 ticks per second

export class GameLoop {
  private systems: System[] = [];
  private entities: Map<string, Entity> = new Map();
  private running = false;
  private rafId: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private inputDir: Direction | null = null;

  // External dependencies
  private map: TileMapData | null = null;
  private npcs: NPC[] = [];
  private gameHour = 8; // default 8 AM

  // Callbacks
  private onTick: (() => void) | null = null;
  private onNpcTick: (() => void) | null = null;

  constructor() {}

  setMap(map: TileMapData) {
    this.map = map;
  }

  setNPCs(npcs: NPC[]) {
    this.npcs = npcs;
  }

  setEntities(entities: Map<string, Entity>) {
    this.entities = entities;
  }

  addSystem(system: System) {
    this.systems.push(system);
  }

  clearSystems() {
    this.systems = [];
  }

  setInputDirection(dir: Direction | null) {
    this.inputDir = dir;
  }

  setGameHour(hour: number) {
    this.gameHour = hour;
  }

  setOnTick(cb: () => void) {
    this.onTick = cb;
  }

  setOnNpcTick(cb: () => void) {
    this.onNpcTick = cb;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private loop = (time: number) => {
    if (!this.running) return;

    const dt = time - this.lastTime;
    this.lastTime = time;
    this.accumulator += dt;

    // Process at fixed timestep (cap at 3 ticks to avoid spiral of death)
    let ticks = 0;
    while (this.accumulator >= TICK_MS && ticks < 3) {
      this.tick(TICK_MS);
      this.accumulator -= TICK_MS;
      ticks++;
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  private tick(dt: number) {
    if (!this.map) return;

    const ctx: SystemContext = {
      dt,
      map: this.map,
      npcs: this.npcs,
      inputDir: this.inputDir,
      gameHour: this.gameHour,
    };

    for (const system of this.systems) {
      system(this.entities, ctx);
    }

    this.onTick?.();
    this.onNpcTick?.();
  }

  isRunning() {
    return this.running;
  }
}
