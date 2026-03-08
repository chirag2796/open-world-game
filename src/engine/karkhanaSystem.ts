// Karkhana (Royal Workshop) System
// Historical Mughal karkhanas were imperial workshops where master craftsmen
// upgraded weapons and armor. Players can improve equipment stats here.

import { ItemDef, WeaponMaterial } from '../types';
import { ITEMS } from '../data/items';

// ─── Upgrade Tiers ─────────────────────────────────────────

export interface UpgradeTier {
  level: number;        // 0 = base, 1-3 = upgrades
  suffix: string;       // appended to item name
  atkBonus: number;     // flat attack bonus
  defBonus: number;     // flat defense bonus
  weightReduction: number; // weight reduction
  goldCost: number;
  materialCost: { itemId: string; quantity: number }[];
}

// Material progression determines upgrade paths
const MATERIAL_UPGRADE_COSTS: Record<WeaponMaterial, { itemId: string; quantity: number }[][]> = {
  wood:      [[], [{ itemId: 'rope', quantity: 2 }], [{ itemId: 'rope', quantity: 3 }], [{ itemId: 'rope', quantity: 5 }]],
  iron:      [[], [{ itemId: 'sharpening_stone', quantity: 1 }], [{ itemId: 'sharpening_stone', quantity: 2 }], [{ itemId: 'sharpening_stone', quantity: 3 }]],
  steel:     [[], [{ itemId: 'sharpening_stone', quantity: 2 }], [{ itemId: 'sharpening_stone', quantity: 3 }], [{ itemId: 'sharpening_stone', quantity: 5 }]],
  wootz:     [[], [{ itemId: 'sharpening_stone', quantity: 3 }], [{ itemId: 'sharpening_stone', quantity: 5 }], [{ itemId: 'sharpening_stone', quantity: 8 }]],
  celestial: [[], [{ itemId: 'soma_elixir', quantity: 1 }], [{ itemId: 'soma_elixir', quantity: 1 }], [{ itemId: 'soma_elixir', quantity: 2 }]],
};

const UPGRADE_TIERS: UpgradeTier[] = [
  { level: 0, suffix: '',          atkBonus: 0,  defBonus: 0,  weightReduction: 0, goldCost: 0,   materialCost: [] },
  { level: 1, suffix: ' +1',       atkBonus: 3,  defBonus: 2,  weightReduction: 0, goldCost: 100, materialCost: [] },
  { level: 2, suffix: ' +2',       atkBonus: 6,  defBonus: 4,  weightReduction: 1, goldCost: 300, materialCost: [] },
  { level: 3, suffix: ' (Master)', atkBonus: 10, defBonus: 7,  weightReduction: 1, goldCost: 800, materialCost: [] },
];

// ─── Upgrade State ──────────────────────────────────────────

// Track upgrade levels per item instance
export type UpgradeRegistry = Record<string, number>; // itemId → upgrade level (0-3)

export function createInitialUpgradeRegistry(): UpgradeRegistry {
  return {};
}

export function getUpgradeLevel(registry: UpgradeRegistry, itemId: string): number {
  return registry[itemId] ?? 0;
}

// ─── Upgrade Calculations ───────────────────────────────────

export interface UpgradeInfo {
  canUpgrade: boolean;
  currentLevel: number;
  nextLevel: number;
  goldCost: number;
  materialCost: { itemId: string; quantity: number }[];
  statPreview: {
    atkChange: number;
    defChange: number;
    weightChange: number;
  };
  upgradedName: string;
}

export function getUpgradeInfo(
  itemId: string,
  registry: UpgradeRegistry,
): UpgradeInfo | null {
  const item = ITEMS[itemId];
  if (!item) return null;

  // Only equipment can be upgraded
  if (!item.equipSlot) return null;

  const currentLevel = getUpgradeLevel(registry, itemId);
  if (currentLevel >= 3) {
    return {
      canUpgrade: false,
      currentLevel,
      nextLevel: currentLevel,
      goldCost: 0,
      materialCost: [],
      statPreview: { atkChange: 0, defChange: 0, weightChange: 0 },
      upgradedName: item.name + UPGRADE_TIERS[currentLevel].suffix,
    };
  }

  const nextLevel = currentLevel + 1;
  const nextTier = UPGRADE_TIERS[nextLevel];
  const currentTier = UPGRADE_TIERS[currentLevel];

  // Get material-specific costs
  const material = item.material ?? 'iron';
  const matCosts = MATERIAL_UPGRADE_COSTS[material]?.[nextLevel] ?? [];

  return {
    canUpgrade: true,
    currentLevel,
    nextLevel,
    goldCost: nextTier.goldCost,
    materialCost: matCosts,
    statPreview: {
      atkChange: nextTier.atkBonus - currentTier.atkBonus,
      defChange: nextTier.defBonus - currentTier.defBonus,
      weightChange: -(nextTier.weightReduction - currentTier.weightReduction),
    },
    upgradedName: item.name + nextTier.suffix,
  };
}

// Get the effective stats of an item considering its upgrade level
export function getUpgradedStats(
  itemId: string,
  registry: UpgradeRegistry,
): { attack: number; defense: number; weight: number; name: string } {
  const item = ITEMS[itemId];
  if (!item) return { attack: 0, defense: 0, weight: 0, name: '' };

  const level = getUpgradeLevel(registry, itemId);
  const tier = UPGRADE_TIERS[level];

  return {
    attack: (item.attack ?? 0) + tier.atkBonus,
    defense: (item.defense ?? 0) + tier.defBonus,
    weight: Math.max(0, (item.weight ?? 0) - tier.weightReduction),
    name: item.name + tier.suffix,
  };
}

// Check if player can afford the upgrade
export function canAffordUpgrade(
  itemId: string,
  registry: UpgradeRegistry,
  playerGold: number,
  playerItems: Map<string, number>, // itemId → quantity
): boolean {
  const info = getUpgradeInfo(itemId, registry);
  if (!info || !info.canUpgrade) return false;

  if (playerGold < info.goldCost) return false;

  for (const mat of info.materialCost) {
    const has = playerItems.get(mat.itemId) ?? 0;
    if (has < mat.quantity) return false;
  }

  return true;
}

// Perform the upgrade (returns new registry, doesn't handle gold/item deduction)
export function performUpgrade(
  registry: UpgradeRegistry,
  itemId: string,
): UpgradeRegistry {
  const current = getUpgradeLevel(registry, itemId);
  if (current >= 3) return registry;

  return {
    ...registry,
    [itemId]: current + 1,
  };
}

// Get list of all upgradeable equipped items
export function getUpgradeableItems(
  equippedItemIds: (string | null)[],
  registry: UpgradeRegistry,
): { itemId: string; info: UpgradeInfo }[] {
  const results: { itemId: string; info: UpgradeInfo }[] = [];

  for (const itemId of equippedItemIds) {
    if (!itemId) continue;
    const info = getUpgradeInfo(itemId, registry);
    if (info) results.push({ itemId, info });
  }

  return results;
}
