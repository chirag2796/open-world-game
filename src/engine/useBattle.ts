import { useState, useCallback, useRef } from 'react';
import { BattleState, BattleAction, EnemyDef, BiomeType } from '../types';
import { getRandomEnemy, xpForLevel } from '../data/enemies';
import { ITEMS } from '../data/items';
import { InventoryState } from './useInventory';

const INITIAL_PLAYER_HP = 50;
const HP_PER_LEVEL = 8;

export function useBattle(
  getEquippedStats: () => { attack: number; defense: number },
  inventory: InventoryState,
  removeItem: (id: string, qty: number) => void,
) {
  const [battle, setBattle] = useState<BattleState>({
    active: false,
    enemy: null,
    enemyHP: 0,
    playerHP: INITIAL_PLAYER_HP,
    playerMaxHP: INITIAL_PLAYER_HP,
    playerATK: 5,
    playerDEF: 2,
    turn: 'player',
    phase: 'intro',
    message: '',
    result: 'none',
    isDefending: false,
    playerXP: 0,
    playerLevel: 1,
    playerGold: 20,
  });

  const battleRef = useRef(battle);
  battleRef.current = battle;

  const startBattle = useCallback((biome: BiomeType) => {
    const state = battleRef.current;
    const enemy = getRandomEnemy(biome, state.playerLevel);
    const stats = getEquippedStats();
    const maxHP = INITIAL_PLAYER_HP + (state.playerLevel - 1) * HP_PER_LEVEL;

    setBattle(prev => ({
      ...prev,
      active: true,
      enemy,
      enemyHP: enemy.hp,
      playerMaxHP: maxHP,
      playerHP: Math.min(prev.playerHP, maxHP),
      playerATK: 5 + stats.attack + Math.floor(prev.playerLevel * 1.5),
      playerDEF: 2 + stats.defense + Math.floor(prev.playerLevel * 0.5),
      turn: 'player',
      phase: 'intro',
      message: `A wild ${enemy.name} appeared!`,
      result: 'none',
      isDefending: false,
    }));

    // Auto-advance from intro after a moment
    setTimeout(() => {
      setBattle(prev => prev.phase === 'intro' ? { ...prev, phase: 'select' } : prev);
    }, 1200);
  }, [getEquippedStats]);

  const doPlayerAction = useCallback((action: BattleAction, itemId?: string) => {
    const state = battleRef.current;
    if (state.phase !== 'select' || !state.enemy) return;

    if (action === 'run') {
      // 60% chance to run
      const escaped = Math.random() < 0.6;
      if (escaped) {
        setBattle(prev => ({
          ...prev,
          phase: 'result',
          message: 'You escaped safely!',
          result: 'run',
        }));
      } else {
        setBattle(prev => ({
          ...prev,
          phase: 'animate',
          message: "Couldn't escape!",
          isDefending: false,
        }));
        setTimeout(() => doEnemyTurn(), 800);
      }
      return;
    }

    if (action === 'defend') {
      setBattle(prev => ({
        ...prev,
        phase: 'animate',
        message: 'You brace for impact!',
        isDefending: true,
      }));
      setTimeout(() => doEnemyTurn(), 800);
      return;
    }

    if (action === 'item' && itemId) {
      const def = ITEMS[itemId];
      if (!def) return;

      removeItem(itemId, 1);

      let healAmount = 0;
      if (def.effect === 'heal_small') healAmount = 15;
      else if (def.effect === 'heal_medium') healAmount = 35;
      else if (def.effect === 'heal_full') healAmount = 999;

      setBattle(prev => {
        const newHP = Math.min(prev.playerHP + healAmount, prev.playerMaxHP);
        return {
          ...prev,
          playerHP: newHP,
          phase: 'animate',
          message: `Used ${def.name}! Restored ${newHP - prev.playerHP} HP.`,
          isDefending: false,
        };
      });
      setTimeout(() => doEnemyTurn(), 1000);
      return;
    }

    // Attack
    const enemy = state.enemy;
    const baseDmg = Math.max(1, state.playerATK - enemy.defense);
    const variance = Math.floor(baseDmg * 0.2);
    const damage = baseDmg + Math.floor(Math.random() * variance * 2) - variance;
    const actualDmg = Math.max(1, damage);

    setBattle(prev => {
      const newEnemyHP = Math.max(0, prev.enemyHP - actualDmg);
      if (newEnemyHP <= 0) {
        // Victory!
        const xpGain = enemy.xpReward;
        const goldGain = enemy.goldReward;
        const newXP = prev.playerXP + xpGain;
        const xpNeeded = xpForLevel(prev.playerLevel);
        const leveledUp = newXP >= xpNeeded;
        const newLevel = leveledUp ? prev.playerLevel + 1 : prev.playerLevel;
        const finalXP = leveledUp ? newXP - xpNeeded : newXP;

        return {
          ...prev,
          enemyHP: 0,
          phase: 'result',
          message: leveledUp
            ? `${enemy.name} defeated! +${xpGain}XP +${goldGain}G\nLevel Up! You are now level ${newLevel}!`
            : `${enemy.name} defeated! +${xpGain}XP +${goldGain}G`,
          result: 'win',
          playerXP: finalXP,
          playerLevel: newLevel,
          playerGold: prev.playerGold + goldGain,
          playerMaxHP: leveledUp ? prev.playerMaxHP + HP_PER_LEVEL : prev.playerMaxHP,
          playerHP: leveledUp ? prev.playerMaxHP + HP_PER_LEVEL : prev.playerHP,
        };
      }

      return {
        ...prev,
        enemyHP: newEnemyHP,
        phase: 'animate',
        message: `You dealt ${actualDmg} damage!`,
        isDefending: false,
      };
    });

    // If enemy not dead, trigger enemy turn
    const newEnemyHP = state.enemyHP - actualDmg;
    if (newEnemyHP > 0) {
      setTimeout(() => doEnemyTurn(), 800);
    }
  }, [getEquippedStats, removeItem]);

  const doEnemyTurn = useCallback(() => {
    setBattle(prev => {
      if (!prev.enemy || prev.result !== 'none') return prev;

      const enemy = prev.enemy;
      const defMultiplier = prev.isDefending ? 2 : 1;
      const baseDmg = Math.max(1, enemy.attack - prev.playerDEF * defMultiplier);
      const variance = Math.floor(baseDmg * 0.2);
      const damage = baseDmg + Math.floor(Math.random() * variance * 2) - variance;
      const actualDmg = Math.max(1, damage);
      const newHP = Math.max(0, prev.playerHP - actualDmg);

      if (newHP <= 0) {
        return {
          ...prev,
          playerHP: 0,
          phase: 'result',
          message: `${enemy.name} dealt ${actualDmg} damage!\nYou have been defeated...`,
          result: 'lose',
        };
      }

      return {
        ...prev,
        playerHP: newHP,
        phase: 'select',
        turn: 'player',
        message: `${enemy.name} dealt ${actualDmg} damage!`,
        isDefending: false,
      };
    });
  }, []);

  const closeBattle = useCallback(() => {
    setBattle(prev => {
      if (prev.result === 'lose') {
        // On defeat, heal to half HP
        return {
          ...prev,
          active: false,
          playerHP: Math.floor(prev.playerMaxHP / 2),
          playerGold: Math.max(0, prev.playerGold - Math.floor(prev.playerGold * 0.1)),
        };
      }
      return { ...prev, active: false };
    });
  }, []);

  return {
    battle,
    startBattle,
    doPlayerAction,
    closeBattle,
  };
}
