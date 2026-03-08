// Enemy AI System — weighted decision-tree move selection
// Replaces random move picking with intelligent scoring based on battle state

import { CombatMove, EnemyDef, EnemyAIType, BattleState } from '../types';
import { MOVES } from '../data/combatMoves';
import { getEffectiveness } from './combatEngine';

// ─── AI Context ─────────────────────────────────────────────

interface AIContext {
  enemy: EnemyDef;
  enemyHP: number;
  enemyMaxHP: number;
  enemyAtkBoost: number;
  enemyDefBoost: number;
  enemyPoisoned: boolean;
  playerHP: number;
  playerMaxHP: number;
  playerDefBoost: number;
  playerAtkBoost: number;
  playerPoisoned: boolean;
  playerKarma?: number; // for mercy mechanic
}

export function buildAIContext(battle: BattleState, playerKarma?: number): AIContext {
  return {
    enemy: battle.enemy!,
    enemyHP: battle.enemyHP,
    enemyMaxHP: battle.enemy?.hp ?? 30,
    enemyAtkBoost: battle.enemyAtkBoost,
    enemyDefBoost: battle.enemyDefBoost,
    enemyPoisoned: battle.enemyPoisoned,
    playerHP: battle.playerHP,
    playerMaxHP: battle.playerMaxHP,
    playerDefBoost: battle.defBoost,
    playerAtkBoost: battle.atkBoost,
    playerPoisoned: battle.poisoned,
    playerKarma,
  };
}

// ─── Move Scoring ───────────────────────────────────────────

interface ScoredMove {
  move: CombatMove;
  score: number;
}

function scoreMoveBase(move: CombatMove, ctx: AIContext): number {
  let score = 50; // base score

  // Type effectiveness bonus
  // Player is treated as 'soldier' type
  const eff = getEffectiveness(move.type, 'soldier');
  if (eff >= 2.0) score += 40;
  else if (eff <= 0.5) score -= 20;

  // Power scaling — higher power = more attractive
  if (move.power > 0) {
    score += move.power * 0.3;
  }

  // Accuracy penalty for low-accuracy moves
  if (move.accuracy < 85) score -= (100 - move.accuracy) * 0.5;

  // Heal moves — more attractive at low HP
  if (move.effect === 'heal_self' || move.effect === 'drain') {
    const hpRatio = ctx.enemyHP / ctx.enemyMaxHP;
    if (hpRatio < 0.3) score += 60;
    else if (hpRatio < 0.5) score += 30;
    else score -= 20; // don't heal when healthy
  }

  // Buff moves — less useful if already buffed
  if (move.effect === 'boost_atk') {
    if (ctx.enemyAtkBoost >= 2) score -= 30;
    else score += 15;
  }
  if (move.effect === 'boost_def') {
    if (ctx.enemyDefBoost >= 2) score -= 30;
    else score += 15;
  }

  // Debuff moves — less useful if already applied
  if (move.effect === 'lower_def' && ctx.playerDefBoost <= -2) score -= 20;
  if (move.effect === 'lower_atk' && ctx.playerAtkBoost <= -2) score -= 20;

  // Poison — useless if already poisoned
  if (move.effect === 'poison' && ctx.playerPoisoned) score -= 40;

  // Priority moves — bonus when player is low HP (finish them off)
  if (move.priority > 0) {
    const playerHPRatio = ctx.playerHP / ctx.playerMaxHP;
    if (playerHPRatio < 0.2) score += 30;
  }

  return score;
}

// ─── AI Type Strategies ─────────────────────────────────────

function scoreAggressive(move: CombatMove, ctx: AIContext): number {
  let score = scoreMoveBase(move, ctx);
  // Strongly prefer damage moves
  if (move.power > 0) score += 25;
  if (move.power === 0) score -= 15;
  // Love high-power moves
  score += move.power * 0.2;
  return score;
}

function scoreDefensive(move: CombatMove, ctx: AIContext): number {
  let score = scoreMoveBase(move, ctx);
  if (move.effect === 'boost_def') score += 25;
  if (move.effect === 'heal_self') score += 20;
  if (move.effect === 'drain') score += 20;
  return score;
}

function scoreBerserkBeast(move: CombatMove, ctx: AIContext): number {
  const hpRatio = ctx.enemyHP / ctx.enemyMaxHP;
  let score = scoreMoveBase(move, ctx);

  if (hpRatio < 0.3) {
    // BERSERK MODE: massively prefer high-power attacks
    if (move.power >= 70) score += 60;
    if (move.effect === 'boost_atk') score += 50; // rage boost
    // Despise defensive moves while berserk
    if (move.effect === 'boost_def' || move.effect === 'heal_self') score -= 40;
  } else {
    // Normal beast behavior
    if (move.power > 0) score += 10;
  }
  return score;
}

function scoreVampiric(move: CombatMove, ctx: AIContext): number {
  let score = scoreMoveBase(move, ctx);
  // Strongly prefer drain moves
  if (move.effect === 'drain') score += 40;
  if (move.effect === 'heal_self') score += 25;
  // Like debuffs to weaken player
  if (move.effect === 'lower_atk' || move.effect === 'lower_def') score += 10;
  return score;
}

function scoreTactical(move: CombatMove, ctx: AIContext): number {
  let score = scoreMoveBase(move, ctx);
  // Extra emphasis on type effectiveness
  const eff = getEffectiveness(move.type, 'soldier');
  if (eff >= 2.0) score += 30; // additional on top of base
  // Smart use of debuffs early, damage later
  const hpRatio = ctx.playerHP / ctx.playerMaxHP;
  if (hpRatio > 0.7 && (move.effect === 'lower_def' || move.effect === 'lower_atk')) {
    score += 20; // debuff early
  }
  if (hpRatio < 0.3 && move.power > 0) {
    score += 20; // finish off
  }
  return score;
}

function scoreTank(move: CombatMove, ctx: AIContext): number {
  let score = scoreMoveBase(move, ctx);
  if (move.effect === 'boost_def') score += 35;
  if (move.effect === 'lower_def') score += 25; // sunder player armor
  if (move.effect === 'heal_self') score += 20;
  // Tanks don't rush — reduce score of glass-cannon moves
  if (move.accuracy < 80) score -= 15;
  return score;
}

function scoreGuardian(move: CombatMove, ctx: AIContext): number {
  let score = scoreMoveBase(move, ctx);
  const hpRatio = ctx.enemyHP / ctx.enemyMaxHP;
  // Alternate between defense and attack
  if (hpRatio > 0.5) {
    if (move.effect === 'boost_def') score += 20;
    if (move.power > 50) score += 15;
  } else {
    // Lower HP — prioritize healing and strong hits
    if (move.effect === 'heal_self') score += 30;
    if (move.power >= 60) score += 20;
  }
  return score;
}

function scoreSwarm(move: CombatMove, ctx: AIContext): number {
  let score = scoreMoveBase(move, ctx);
  // Love poison and debuffs
  if (move.effect === 'poison' && !ctx.playerPoisoned) score += 45;
  if (move.effect === 'lower_def') score += 20;
  if (move.effect === 'lower_atk') score += 20;
  return score;
}

// ─── Main AI Entry Point ────────────────────────────────────

export function pickEnemyMoveAI(
  enemy: EnemyDef,
  ctx: AIContext,
): CombatMove {
  const available = enemy.moves.map(id => MOVES[id]).filter(Boolean);
  if (available.length === 0) return MOVES['claw_rake']; // fallback

  const aiType: EnemyAIType = enemy.aiType ?? 'random';

  // Random AI — preserve original behavior
  if (aiType === 'random') {
    return available[Math.floor(Math.random() * available.length)];
  }

  // Karma mercy: high-karma players may cause spirits to hesitate
  if (ctx.playerKarma !== undefined && ctx.playerKarma > 50) {
    const enemyHPRatio = ctx.enemyHP / ctx.enemyMaxHP;
    // Spirits with low HP may "show mercy" — use weakest move
    if (enemyHPRatio < 0.15 && enemy.creatureType === 'mythic' && Math.random() < 0.3) {
      const weakest = [...available].sort((a, b) => a.power - b.power)[0];
      return weakest;
    }
  }

  // Score each move
  const scored: ScoredMove[] = available.map(move => {
    let score: number;
    switch (aiType) {
      case 'aggressive':    score = scoreAggressive(move, ctx); break;
      case 'defensive':     score = scoreDefensive(move, ctx); break;
      case 'berserk_beast': score = scoreBerserkBeast(move, ctx); break;
      case 'vampiric':      score = scoreVampiric(move, ctx); break;
      case 'tactical':      score = scoreTactical(move, ctx); break;
      case 'tank':          score = scoreTank(move, ctx); break;
      case 'guardian':      score = scoreGuardian(move, ctx); break;
      case 'swarm':         score = scoreSwarm(move, ctx); break;
      default:              score = scoreMoveBase(move, ctx); break;
    }
    return { move, score: Math.max(1, score) };
  });

  // Weighted random selection based on scores (not purely deterministic)
  const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
  let roll = Math.random() * totalScore;
  for (const { move, score } of scored) {
    roll -= score;
    if (roll <= 0) return move;
  }

  return scored[scored.length - 1].move;
}
