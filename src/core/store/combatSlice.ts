import { StateCreator } from 'zustand';
import { BattleAction, EnemyDef, BiomeType } from '../../types';
import { getRandomEnemy } from '../../data/enemies';

export interface CombatSlice {
  battleActive: boolean;
  enemy: EnemyDef | null;
  enemyHP: number;
  battleTurn: 'player' | 'enemy' | 'result';
  battlePhase: 'intro' | 'select' | 'animate' | 'enemy_turn' | 'result';
  battleMessage: string;
  battleResult: 'none' | 'win' | 'lose' | 'run';
  isDefending: boolean;
  lastAction: BattleAction | null;

  startBattle: (biome: BiomeType, playerLevel: number, atk: number, def: number) => void;
  setBattleState: (partial: Partial<Pick<CombatSlice, 'enemyHP' | 'battlePhase' | 'battleMessage' | 'battleResult' | 'isDefending' | 'lastAction' | 'battleTurn'>>) => void;
  endBattle: () => void;
}

export const createCombatSlice: StateCreator<CombatSlice, [], [], CombatSlice> = (set) => ({
  battleActive: false,
  enemy: null,
  enemyHP: 0,
  battleTurn: 'player',
  battlePhase: 'intro',
  battleMessage: '',
  battleResult: 'none',
  isDefending: false,
  lastAction: null,

  startBattle: (biome, playerLevel, _atk, _def) => {
    const enemy = getRandomEnemy(biome, playerLevel);
    set({
      battleActive: true,
      enemy,
      enemyHP: enemy.hp,
      battleTurn: 'player',
      battlePhase: 'intro',
      battleMessage: `A wild ${enemy.name} appeared!`,
      battleResult: 'none',
      isDefending: false,
      lastAction: null,
    });
    setTimeout(() => {
      set(state => state.battlePhase === 'intro' ? { battlePhase: 'select' as const } : {});
    }, 1200);
  },

  setBattleState: (partial) => set(partial),

  endBattle: () => set({
    battleActive: false,
    enemy: null,
    enemyHP: 0,
    battleResult: 'none',
    lastAction: null,
  }),
});
