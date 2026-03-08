import { CombatMove, CreatureType, TYPE_STRONG, TYPE_WEAK } from '../types';
import { MOVES } from '../data/combatMoves';

// Type effectiveness multiplier
export function getEffectiveness(attackType: CreatureType, defenderType: CreatureType): number {
  if (TYPE_STRONG[attackType]?.has(defenderType)) return 2.0;
  if (TYPE_WEAK[attackType]?.has(defenderType)) return 0.5;
  return 1.0;
}

export function getEffectivenessLabel(mult: number): string {
  if (mult >= 2.0) return "It's super effective!";
  if (mult <= 0.5) return "It's not very effective...";
  return '';
}

// Level-scaled damage formula (Pokemon-inspired)
// Damage = (Power * Attack * Level * (Level + 100)) / (10500 * Defense) * Effectiveness * Variance
export function calculateDamage(
  move: CombatMove,
  attackerAtk: number,
  attackerLevel: number,
  defenderDef: number,
  defenderType: CreatureType,
  atkBoost: number,   // stage modifier -6 to +6
  defBoost: number,
): { damage: number; effectiveness: number; missed: boolean } {
  // Accuracy check
  if (Math.random() * 100 > move.accuracy) {
    return { damage: 0, effectiveness: 1, missed: true };
  }

  // Status moves do no damage
  if (move.power === 0) {
    return { damage: 0, effectiveness: 1, missed: false };
  }

  const effectiveness = getEffectiveness(move.type, defenderType);

  // Apply stat stage modifiers (each stage is +/- 25%)
  const atkMult = Math.max(0.25, 1 + atkBoost * 0.25);
  const defMult = Math.max(0.25, 1 + defBoost * 0.25);

  const effectiveAtk = attackerAtk * atkMult;
  const effectiveDef = Math.max(1, defenderDef * defMult);

  // Core formula
  const baseDamage = (move.power * effectiveAtk * attackerLevel * (attackerLevel + 100))
    / (10500 * effectiveDef);

  // Apply effectiveness
  const rawDamage = baseDamage * effectiveness;

  // Random variance (85%-100%)
  const variance = 0.85 + Math.random() * 0.15;
  const finalDamage = Math.max(1, Math.floor(rawDamage * variance));

  return { damage: finalDamage, effectiveness, missed: false };
}

// Determine turn order based on speed and move priority
export function calculateTurnOrder(
  playerSpeed: number,
  enemySpeed: number,
  playerMove: CombatMove | null,
  enemyMove: CombatMove | null,
): ('player' | 'enemy')[] {
  const playerPriority = playerMove?.priority ?? 0;
  const enemyPriority = enemyMove?.priority ?? 0;

  // Higher priority goes first
  if (playerPriority > enemyPriority) return ['player', 'enemy'];
  if (enemyPriority > playerPriority) return ['enemy', 'player'];

  // Same priority: faster goes first (ties broken randomly)
  if (playerSpeed > enemySpeed) return ['player', 'enemy'];
  if (enemySpeed > playerSpeed) return ['enemy', 'player'];
  return Math.random() < 0.5 ? ['player', 'enemy'] : ['enemy', 'player'];
}

// Pick a random move for an enemy
export function pickEnemyMove(moveIds: string[]): CombatMove {
  const available = moveIds.map(id => MOVES[id]).filter(Boolean);
  if (available.length === 0) return MOVES['claw_rake']; // fallback
  return available[Math.floor(Math.random() * available.length)];
}

// Apply status effect from a move
export function shouldApplyEffect(move: CombatMove): boolean {
  if (!move.effect) return false;
  if (!move.effectChance) return true; // guaranteed (e.g. boost moves)
  return Math.random() * 100 < move.effectChance;
}

// Poison damage = 1/8 max HP per turn
export function poisonDamage(maxHP: number): number {
  return Math.max(1, Math.floor(maxHP / 8));
}
