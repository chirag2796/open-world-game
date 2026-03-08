import { StateCreator } from 'zustand';
import { BattleAction, BattleState, CombatStackState, EnemyDef, BiomeType, CombatMove } from '../../types';
import { getRandomEnemy, ENEMIES } from '../../data/enemies';
import { MOVES, DEFAULT_PLAYER_MOVES } from '../../data/combatMoves';
import {
  calculateDamage, calculateTurnOrder, pickEnemyMove,
  shouldApplyEffect, poisonDamage, getEffectivenessLabel,
} from '../../engine/combatEngine';

export interface CombatSlice {
  // Full battle state
  battle: BattleState;

  // Actions
  startBattle: (biome: BiomeType, playerLevel: number, atk: number, def: number, hp: number, maxHP: number, xp: number, gold: number, speed: number) => void;
  startBattleWith: (enemyId: string, playerLevel: number, atk: number, def: number, hp: number, maxHP: number, xp: number, gold: number) => void;
  endBattle: () => void;
  setBattle: (partial: Partial<BattleState>) => void;

  // Stack machine
  pushCombatStack: (...states: CombatStackState[]) => void;
  popCombatStack: () => CombatStackState | undefined;
  addCombatLog: (msg: string) => void;

  // Turn execution
  executePlayerMove: (moveId: string) => void;
  executeDefend: () => void;
  executeRun: () => void;
  processCombatStack: () => void;
}

const INITIAL_BATTLE: BattleState = {
  active: false,
  enemy: null,
  enemyHP: 0,
  playerHP: 0,
  playerMaxHP: 0,
  playerATK: 0,
  playerDEF: 0,
  turn: 'player',
  phase: 'intro',
  message: '',
  result: 'none',
  isDefending: false,
  playerXP: 0,
  playerLevel: 1,
  playerGold: 0,
  lastAction: null,
  combatStack: [],
  turnOrder: [],
  combatLog: [],
  playerMoves: DEFAULT_PLAYER_MOVES,
  effectiveness: 1,
  atkBoost: 0,
  defBoost: 0,
  enemyAtkBoost: 0,
  enemyDefBoost: 0,
  poisoned: false,
  enemyPoisoned: false,
};

export const createCombatSlice: StateCreator<CombatSlice, [], [], CombatSlice> = (set, get) => ({
  battle: { ...INITIAL_BATTLE },

  startBattle: (biome, playerLevel, atk, def, hp, maxHP, xp, gold, speed) => {
    const enemy = getRandomEnemy(biome, playerLevel);
    set({
      battle: {
        ...INITIAL_BATTLE,
        active: true,
        enemy,
        enemyHP: enemy.hp,
        playerHP: hp,
        playerMaxHP: maxHP,
        playerATK: atk,
        playerDEF: def,
        playerXP: xp,
        playerLevel: playerLevel,
        playerGold: gold,
        phase: 'intro',
        message: `A wild ${enemy.name} appeared!`,
        combatLog: [`A wild ${enemy.name} appeared!`],
      },
    });
    // Transition to select after intro
    setTimeout(() => {
      const { battle } = get();
      if (battle.phase === 'intro') {
        set({ battle: { ...get().battle, phase: 'select' } });
      }
    }, 1200);
  },

  startBattleWith: (enemyId, playerLevel, atk, def, hp, maxHP, xp, gold) => {
    const enemy = ENEMIES.find(e => e.id === enemyId);
    if (!enemy) return;
    set({
      battle: {
        ...INITIAL_BATTLE,
        active: true,
        enemy,
        enemyHP: enemy.hp,
        playerHP: hp,
        playerMaxHP: maxHP,
        playerATK: atk,
        playerDEF: def,
        playerXP: xp,
        playerLevel: playerLevel,
        playerGold: gold,
        phase: 'intro',
        message: `${enemy.name} attacks!`,
        combatLog: [`${enemy.name} attacks!`],
      },
    });
    setTimeout(() => {
      const { battle } = get();
      if (battle.phase === 'intro') {
        set({ battle: { ...get().battle, phase: 'select' } });
      }
    }, 1200);
  },

  endBattle: () => set({ battle: { ...INITIAL_BATTLE } }),

  setBattle: (partial) => set(state => ({
    battle: { ...state.battle, ...partial },
  })),

  pushCombatStack: (...states) => set(state => ({
    battle: {
      ...state.battle,
      combatStack: [...state.battle.combatStack, ...states],
    },
  })),

  popCombatStack: () => {
    const { battle } = get();
    if (battle.combatStack.length === 0) return undefined;
    const [first, ...rest] = battle.combatStack;
    set({ battle: { ...get().battle, combatStack: rest } });
    return first;
  },

  addCombatLog: (msg) => set(state => ({
    battle: {
      ...state.battle,
      combatLog: [...state.battle.combatLog.slice(-4), msg],
    },
  })),

  executePlayerMove: (moveId: string) => {
    const { battle, setBattle, addCombatLog } = get();
    if (!battle.enemy || battle.phase !== 'select') return;

    const playerMove = MOVES[moveId];
    if (!playerMove) return;

    const enemyMove = pickEnemyMove(battle.enemy.moves);
    const turnOrder = calculateTurnOrder(
      10, // player base speed (could be enhanced later)
      battle.enemy.speed,
      playerMove,
      enemyMove,
    );

    // Build stack in reverse (first action goes on bottom, processed first)
    const stack: CombatStackState[] = [];

    for (const actor of turnOrder) {
      if (actor === 'player') {
        stack.push(
          { type: 'execute_move', actorId: 'player', moveId, targetId: 'enemy' },
        );
      } else {
        stack.push(
          { type: 'execute_move', actorId: 'enemy', moveId: enemyMove.id, targetId: 'player' },
        );
      }
    }

    // End of turn: poison ticks, etc.
    stack.push({ type: 'end_turn' });

    setBattle({
      phase: 'animate',
      lastAction: 'move',
      isDefending: false,
      combatStack: stack,
    });

    addCombatLog(`You used ${playerMove.name}!`);

    // Start processing
    setTimeout(() => get().processCombatStack(), 100);
  },

  executeDefend: () => {
    const { battle, setBattle, addCombatLog } = get();
    if (!battle.enemy || battle.phase !== 'select') return;

    const enemyMove = pickEnemyMove(battle.enemy.moves);

    const stack: CombatStackState[] = [
      { type: 'show_message', message: 'You brace for impact!', duration: 600 },
      { type: 'execute_move', actorId: 'enemy', moveId: enemyMove.id, targetId: 'player' },
      { type: 'end_turn' },
    ];

    setBattle({
      phase: 'animate',
      lastAction: 'defend',
      isDefending: true,
      combatStack: stack,
    });

    addCombatLog('You brace for impact!');
    setTimeout(() => get().processCombatStack(), 100);
  },

  executeRun: () => {
    const { battle, setBattle, addCombatLog } = get();
    if (!battle.enemy || battle.phase !== 'select') return;

    // 50% base chance, higher speed = better odds
    const runChance = 50 + (10 - battle.enemy.speed) * 3;
    const escaped = Math.random() * 100 < runChance;

    if (escaped) {
      setBattle({
        phase: 'result',
        result: 'run',
        message: 'Got away safely!',
        lastAction: 'run',
      });
      addCombatLog('Got away safely!');
    } else {
      // Failed to run — enemy gets a free turn
      const enemyMove = pickEnemyMove(battle.enemy.moves);
      const stack: CombatStackState[] = [
        { type: 'show_message', message: "Couldn't escape!", duration: 600 },
        { type: 'execute_move', actorId: 'enemy', moveId: enemyMove.id, targetId: 'player' },
        { type: 'end_turn' },
      ];

      setBattle({
        phase: 'animate',
        lastAction: 'run',
        combatStack: stack,
      });
      addCombatLog("Couldn't escape!");
      setTimeout(() => get().processCombatStack(), 100);
    }
  },

  processCombatStack: () => {
    const { battle, setBattle, addCombatLog } = get();
    if (battle.combatStack.length === 0) {
      // Stack empty — return to select
      if (battle.result === 'none') {
        setBattle({ phase: 'select', turn: 'player' });
      }
      return;
    }

    const [current, ...rest] = battle.combatStack;

    switch (current.type) {
      case 'show_message': {
        setBattle({
          message: current.message,
          combatStack: rest,
        });
        setTimeout(() => get().processCombatStack(), current.duration);
        break;
      }

      case 'execute_move': {
        const move = MOVES[current.moveId];
        if (!move) {
          setBattle({ combatStack: rest });
          setTimeout(() => get().processCombatStack(), 50);
          break;
        }

        const isPlayer = current.actorId === 'player';
        const b = get().battle;

        // Check if actor already fainted
        if (isPlayer && b.playerHP <= 0) {
          setBattle({ combatStack: rest });
          setTimeout(() => get().processCombatStack(), 50);
          break;
        }
        if (!isPlayer && b.enemyHP <= 0) {
          setBattle({ combatStack: rest });
          setTimeout(() => get().processCombatStack(), 50);
          break;
        }

        const attackerAtk = isPlayer ? b.playerATK : (b.enemy?.attack ?? 10);
        const attackerLevel = isPlayer ? b.playerLevel : Math.max(1, Math.floor(b.playerLevel * 0.9));
        const defenderDef = isPlayer ? (b.enemy?.defense ?? 5) : b.playerDEF;
        const defenderType = isPlayer ? (b.enemy?.creatureType ?? 'beast') : 'soldier'; // player is soldier type
        const atkBoost = isPlayer ? b.atkBoost : b.enemyAtkBoost;
        const defBoost = isPlayer ? b.enemyDefBoost : b.defBoost;
        const defendingMult = (!isPlayer && b.isDefending) ? 0.5 : 1;

        // Handle status moves
        if (move.power === 0) {
          // Status move — apply effect
          const effectApplied = shouldApplyEffect(move);
          let statusMsg = '';
          const updates: Partial<BattleState> = { combatStack: rest };

          if (effectApplied && move.effect) {
            switch (move.effect) {
              case 'boost_atk':
                if (isPlayer) {
                  updates.atkBoost = Math.min(6, b.atkBoost + 1);
                  statusMsg = 'Your attack rose!';
                } else {
                  updates.enemyAtkBoost = Math.min(6, b.enemyAtkBoost + 1);
                  statusMsg = `${b.enemy?.name}'s attack rose!`;
                }
                break;
              case 'boost_def':
                if (isPlayer) {
                  updates.defBoost = Math.min(6, b.defBoost + 1);
                  statusMsg = 'Your defense rose!';
                } else {
                  updates.enemyDefBoost = Math.min(6, b.enemyDefBoost + 1);
                  statusMsg = `${b.enemy?.name}'s defense rose!`;
                }
                break;
              case 'heal_self': {
                const healAmt = Math.floor((isPlayer ? b.playerMaxHP : (b.enemy?.hp ?? 30)) * 0.25);
                if (isPlayer) {
                  updates.playerHP = Math.min(b.playerMaxHP, b.playerHP + healAmt);
                  statusMsg = `You healed ${healAmt} HP!`;
                } else {
                  updates.enemyHP = Math.min(b.enemy?.hp ?? 30, b.enemyHP + healAmt);
                  statusMsg = `${b.enemy?.name} healed ${healAmt} HP!`;
                }
                break;
              }
              default:
                break;
            }
          }

          const actorName = isPlayer ? 'You' : b.enemy?.name ?? 'Enemy';
          const useMsg = isPlayer ? `You used ${move.name}!` : `${b.enemy?.name} used ${move.name}!`;
          updates.message = statusMsg ? `${useMsg} ${statusMsg}` : useMsg;

          if (!isPlayer) addCombatLog(`${b.enemy?.name} used ${move.name}!`);
          if (statusMsg) addCombatLog(statusMsg);

          setBattle(updates);
          setTimeout(() => get().processCombatStack(), 800);
          break;
        }

        // Damage move
        const result = calculateDamage(
          move, attackerAtk, attackerLevel, defenderDef, defenderType, atkBoost, defBoost,
        );

        if (result.missed) {
          const missMsg = isPlayer
            ? `You used ${move.name}! It missed!`
            : `${b.enemy?.name} used ${move.name}! It missed!`;
          setBattle({ message: missMsg, combatStack: rest });
          addCombatLog(missMsg);
          setTimeout(() => get().processCombatStack(), 700);
          break;
        }

        const finalDamage = Math.max(1, Math.floor(result.damage * defendingMult));
        const effectLabel = getEffectivenessLabel(result.effectiveness);

        // Apply damage
        const updates: Partial<BattleState> = {
          effectiveness: result.effectiveness,
          combatStack: rest,
        };

        let dmgMsg: string;
        if (isPlayer) {
          // Player attacks enemy
          const newEnemyHP = Math.max(0, b.enemyHP - finalDamage);
          updates.enemyHP = newEnemyHP;
          dmgMsg = `You used ${move.name}! Dealt ${finalDamage} damage!`;
          if (effectLabel) dmgMsg += ` ${effectLabel}`;

          // Check for effect application (poison, lower_def on enemy)
          if (move.effect && shouldApplyEffect(move)) {
            switch (move.effect) {
              case 'poison':
                if (!b.enemyPoisoned) {
                  updates.enemyPoisoned = true;
                  dmgMsg += ' Enemy was poisoned!';
                  addCombatLog('Enemy was poisoned!');
                }
                break;
              case 'lower_def':
                updates.enemyDefBoost = Math.max(-6, b.enemyDefBoost - 1);
                dmgMsg += " Enemy's defense fell!";
                addCombatLog("Enemy's defense fell!");
                break;
            }
          }

          if (newEnemyHP <= 0) {
            rest.length = 0; // Clear remaining stack
            updates.combatStack = [
              { type: 'show_message', message: `${b.enemy?.name} was defeated!`, duration: 800 },
              { type: 'battle_result', result: 'win' },
            ];
          }
        } else {
          // Enemy attacks player
          const newPlayerHP = Math.max(0, b.playerHP - finalDamage);
          updates.playerHP = newPlayerHP;
          dmgMsg = `${b.enemy?.name} used ${move.name}! Dealt ${finalDamage} damage!`;
          if (effectLabel) dmgMsg += ` ${effectLabel}`;
          addCombatLog(`${b.enemy?.name} used ${move.name}! ${finalDamage} dmg`);

          // Check for effect on player
          if (move.effect && shouldApplyEffect(move)) {
            switch (move.effect) {
              case 'poison':
                if (!b.poisoned) {
                  updates.poisoned = true;
                  dmgMsg += ' You were poisoned!';
                  addCombatLog('You were poisoned!');
                }
                break;
              case 'lower_def':
                updates.defBoost = Math.max(-6, b.defBoost - 1);
                dmgMsg += ' Your defense fell!';
                addCombatLog('Your defense fell!');
                break;
            }
          }

          if (newPlayerHP <= 0) {
            rest.length = 0;
            updates.combatStack = [
              { type: 'show_message', message: 'You were defeated...', duration: 800 },
              { type: 'battle_result', result: 'lose' },
            ];
          }
        }

        updates.message = dmgMsg;
        setBattle(updates);
        setTimeout(() => get().processCombatStack(), 900);
        break;
      }

      case 'end_turn': {
        // Apply poison ticks
        const b = get().battle;
        const updates: Partial<BattleState> = { combatStack: rest };
        const msgs: string[] = [];

        if (b.poisoned && b.playerHP > 0) {
          const pDmg = poisonDamage(b.playerMaxHP);
          const newHP = Math.max(0, b.playerHP - pDmg);
          updates.playerHP = newHP;
          msgs.push(`Poison dealt ${pDmg} damage to you!`);
          if (newHP <= 0) {
            updates.combatStack = [
              { type: 'show_message', message: 'You succumbed to poison...', duration: 800 },
              { type: 'battle_result', result: 'lose' },
            ];
          }
        }

        if (b.enemyPoisoned && b.enemyHP > 0) {
          const pDmg = poisonDamage(b.enemy?.hp ?? 30);
          const newHP = Math.max(0, b.enemyHP - pDmg);
          updates.enemyHP = newHP;
          msgs.push(`Poison dealt ${pDmg} to ${b.enemy?.name}!`);
          if (newHP <= 0) {
            updates.combatStack = [
              { type: 'show_message', message: `${b.enemy?.name} succumbed to poison!`, duration: 800 },
              { type: 'battle_result', result: 'win' },
            ];
          }
        }

        if (msgs.length > 0) {
          updates.message = msgs.join(' ');
          for (const m of msgs) addCombatLog(m);
          setBattle(updates);
          setTimeout(() => get().processCombatStack(), 800);
        } else {
          setBattle(updates);
          setTimeout(() => get().processCombatStack(), 50);
        }
        break;
      }

      case 'battle_result': {
        setBattle({
          phase: 'result',
          result: current.result,
          message: current.result === 'win'
            ? `Victory! Gained ${battle.enemy?.xpReward ?? 0} XP and ${battle.enemy?.goldReward ?? 0} gold!`
            : 'You were defeated...',
          combatStack: rest,
        });
        break;
      }

      case 'check_faint':
      case 'play_animation':
      case 'apply_damage':
      case 'select_action': {
        // These are handled inline or reserved for future animation system
        setBattle({ combatStack: rest });
        setTimeout(() => get().processCombatStack(), 50);
        break;
      }
    }
  },
});
