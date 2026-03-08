// Economy Engine — Mughal trimetallic currency, bazaar pricing, bargaining
// Exchange rates based on historical Akbar-era standards

import { Wallet, MarketState, WantedTier, Hundi } from '../types';
import { TRADE_GOODS, ALL_TRADE_GOODS } from '../data/tradeGoods';

// ─── Currency Constants ──────────────────────────────────────

// Historical exchange: 1 Muhar (gold) = 15 Rupia (silver) = 375 Dam (copper)
export const DAM_PER_RUPIA = 25;
export const RUPIA_PER_MUHAR = 15;
export const DAM_PER_MUHAR = DAM_PER_RUPIA * RUPIA_PER_MUHAR; // 375

// ─── Currency Conversion ─────────────────────────────────────

/** Convert wallet to total dam value */
export function walletToDam(w: Wallet): number {
  return w.dam + w.rupia * DAM_PER_RUPIA + w.muhar * DAM_PER_MUHAR;
}

/** Convert dam amount to optimal wallet (largest denominations first) */
export function damToWallet(totalDam: number): Wallet {
  const muhar = Math.floor(totalDam / DAM_PER_MUHAR);
  totalDam -= muhar * DAM_PER_MUHAR;
  const rupia = Math.floor(totalDam / DAM_PER_RUPIA);
  totalDam -= rupia * DAM_PER_RUPIA;
  return { muhar, rupia, dam: totalDam };
}

/** Format wallet for display */
export function formatWallet(w: Wallet): string {
  const parts: string[] = [];
  if (w.muhar > 0) parts.push(`${w.muhar}M`);
  if (w.rupia > 0) parts.push(`${w.rupia}R`);
  if (w.dam > 0 || parts.length === 0) parts.push(`${w.dam}D`);
  return parts.join(' ');
}

/** Format dam amount as mixed currency */
export function formatDam(dam: number): string {
  return formatWallet(damToWallet(dam));
}

/** Check if wallet has enough to pay amount (in dam) */
export function canAfford(wallet: Wallet, costDam: number): boolean {
  return walletToDam(wallet) >= costDam;
}

/** Subtract cost from wallet, return new wallet (assumes canAfford was checked) */
export function subtractFromWallet(wallet: Wallet, costDam: number): Wallet {
  const total = walletToDam(wallet) - costDam;
  return damToWallet(Math.max(0, total));
}

/** Add dam to wallet */
export function addToWallet(wallet: Wallet, dam: number): Wallet {
  return damToWallet(walletToDam(wallet) + dam);
}

// ─── Legacy Gold Conversion ──────────────────────────────────

/** Convert old "gold" to dam (1 gold = 1 rupia for migration) */
export function goldToDam(gold: number): number {
  return gold * DAM_PER_RUPIA;
}

// ─── Hundi System ────────────────────────────────────────────

const HUNDI_FEE_PERCENT = 5; // 5% sarraf fee

export function createHundi(
  amount: number,
  issuedAt: string,
  redeemableAt: string,
  gameMinutes: number,
): Hundi {
  const fee = Math.ceil(amount * HUNDI_FEE_PERCENT / 100);
  return {
    id: `hundi_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    amount: amount - fee,
    issuedAt,
    redeemableAt,
    issueTime: gameMinutes,
    fee: HUNDI_FEE_PERCENT,
  };
}

export function getHundiFee(amount: number): number {
  return Math.ceil(amount * HUNDI_FEE_PERCENT / 100);
}

// ─── Bazaar Price Fluctuation ────────────────────────────────

// Supply/demand algorithm:
// price = basePrice * (demand / supply) * regionModifier * wantedModifier
// Supply drops when player buys, rises over time
// Demand rises when player sells, falls over time

const SUPPLY_RECOVERY_RATE = 2;   // supply recovers 2 points per tick
const DEMAND_DECAY_RATE = 1;      // demand decays 1 point per tick
const PRICE_TICK_MINUTES = 60;    // prices update every game hour

/** Initialize market state for a region */
export function initMarketState(regionCode: string, gameMinutes: number): MarketState {
  const prices: Record<string, number> = {};
  const supply: Record<string, number> = {};
  const demand: Record<string, number> = {};

  for (const goodId of ALL_TRADE_GOODS) {
    const good = TRADE_GOODS[goodId];
    const isOrigin = good.originRegions.includes(regionCode);
    // Origin regions have higher supply, lower price
    supply[goodId] = isOrigin ? 80 : 40;
    demand[goodId] = isOrigin ? 30 : 60;
    prices[goodId] = calculatePrice(good.basePrice, supply[goodId], demand[goodId], isOrigin);
  }

  return { regionCode, prices, supply, demand, lastUpdate: gameMinutes };
}

/** Calculate price from supply/demand */
function calculatePrice(
  basePrice: number,
  supplyLevel: number,
  demandLevel: number,
  isOrigin: boolean,
): number {
  // Prevent division by zero
  const s = Math.max(10, supplyLevel);
  const d = Math.max(10, demandLevel);
  const ratio = d / s;
  // Origin regions get 20% discount
  const originMod = isOrigin ? 0.8 : 1.0;
  // Clamp ratio between 0.3 and 3.0
  const clampedRatio = Math.max(0.3, Math.min(3.0, ratio));
  const price = Math.round(basePrice * clampedRatio * originMod);
  return Math.max(1, price);
}

/** Tick market prices (call every game hour) */
export function tickMarket(market: MarketState, gameMinutes: number): MarketState {
  const elapsed = gameMinutes - market.lastUpdate;
  if (elapsed < PRICE_TICK_MINUTES) return market;

  const ticks = Math.floor(elapsed / PRICE_TICK_MINUTES);
  const newSupply = { ...market.supply };
  const newDemand = { ...market.demand };
  const newPrices = { ...market.prices };

  for (const goodId of ALL_TRADE_GOODS) {
    const good = TRADE_GOODS[goodId];
    const isOrigin = good.originRegions.includes(market.regionCode);

    // Supply recovers toward equilibrium
    const targetSupply = isOrigin ? 80 : 40;
    newSupply[goodId] = approach(newSupply[goodId] ?? 50, targetSupply, SUPPLY_RECOVERY_RATE * ticks);

    // Demand decays toward equilibrium
    const targetDemand = isOrigin ? 30 : 60;
    newDemand[goodId] = approach(newDemand[goodId] ?? 50, targetDemand, DEMAND_DECAY_RATE * ticks);

    newPrices[goodId] = calculatePrice(good.basePrice, newSupply[goodId], newDemand[goodId], isOrigin);
  }

  return {
    ...market,
    prices: newPrices,
    supply: newSupply,
    demand: newDemand,
    lastUpdate: gameMinutes,
  };
}

/** Move value toward target by step amount */
function approach(current: number, target: number, step: number): number {
  if (current < target) return Math.min(target, current + step);
  if (current > target) return Math.max(target, current - step);
  return current;
}

/** Adjust supply/demand after player buys from this market */
export function onPlayerBuy(
  market: MarketState,
  goodId: string,
  quantity: number,
): MarketState {
  const newSupply = { ...market.supply };
  const newDemand = { ...market.demand };
  const newPrices = { ...market.prices };

  newSupply[goodId] = Math.max(5, (newSupply[goodId] ?? 50) - quantity * 5);
  newDemand[goodId] = Math.min(95, (newDemand[goodId] ?? 50) + quantity * 3);

  const good = TRADE_GOODS[goodId];
  if (good) {
    const isOrigin = good.originRegions.includes(market.regionCode);
    newPrices[goodId] = calculatePrice(good.basePrice, newSupply[goodId], newDemand[goodId], isOrigin);
  }

  return { ...market, supply: newSupply, demand: newDemand, prices: newPrices };
}

/** Adjust supply/demand after player sells to this market */
export function onPlayerSell(
  market: MarketState,
  goodId: string,
  quantity: number,
): MarketState {
  const newSupply = { ...market.supply };
  const newDemand = { ...market.demand };
  const newPrices = { ...market.prices };

  newSupply[goodId] = Math.min(95, (newSupply[goodId] ?? 50) + quantity * 5);
  newDemand[goodId] = Math.max(5, (newDemand[goodId] ?? 50) - quantity * 3);

  const good = TRADE_GOODS[goodId];
  if (good) {
    const isOrigin = good.originRegions.includes(market.regionCode);
    newPrices[goodId] = calculatePrice(good.basePrice, newSupply[goodId], newDemand[goodId], isOrigin);
  }

  return { ...market, supply: newSupply, demand: newDemand, prices: newPrices };
}

// ─── Bargaining ──────────────────────────────────────────────

// Charisma-based bargaining: player can attempt to haggle
// Success chance based on "charisma" (karma acts as charisma proxy)

export interface BargainResult {
  success: boolean;
  finalPrice: number;
  discount: number;  // percentage off
  message: string;
}

/** Attempt to bargain for a better price */
export function attemptBargain(
  basePrice: number,
  playerKarma: number,
  wantedLevel: WantedTier,
  isBuying: boolean,
): BargainResult {
  // Karma gives 0-30% charisma bonus
  const charisma = Math.max(0, (playerKarma + 100) / 200); // 0 to 1
  const baseChance = 30 + charisma * 40; // 30-70%

  // Wanted penalty
  const wantedPenalty = wantedLevel * 15;
  const chance = Math.max(5, baseChance - wantedPenalty);

  const roll = Math.random() * 100;
  if (roll > chance) {
    return {
      success: false,
      finalPrice: basePrice,
      discount: 0,
      message: 'The merchant refuses to budge on the price.',
    };
  }

  // Discount: 5-25% based on charisma
  const maxDiscount = 5 + charisma * 20;
  const discount = Math.round(5 + Math.random() * (maxDiscount - 5));

  let finalPrice: number;
  if (isBuying) {
    finalPrice = Math.round(basePrice * (1 - discount / 100));
  } else {
    // Selling: get MORE for your goods
    finalPrice = Math.round(basePrice * (1 + discount / 100));
  }

  const messages = [
    'Your silver tongue works its magic!',
    'The merchant sighs and agrees to your terms.',
    'A clever negotiation — the price is adjusted.',
    'Your reputation precedes you. Deal accepted!',
  ];

  return {
    success: true,
    finalPrice: Math.max(1, finalPrice),
    discount,
    message: messages[Math.floor(Math.random() * messages.length)],
  };
}

// ─── Wanted Level Price Modifiers ────────────────────────────

/** Get merchant price modifier based on wanted level */
export function getWantedPriceModifier(wantedLevel: WantedTier): number {
  switch (wantedLevel) {
    case 0: return 1.0;   // clean
    case 1: return 1.2;   // suspected: +20%
    case 2: return 1.5;   // wanted: +50%
    case 3: return 2.0;   // hunted: +100%
  }
}

/** Apply wanted level modifier to a price */
export function applyWantedModifier(price: number, wantedLevel: WantedTier, isBuying: boolean): number {
  const mod = getWantedPriceModifier(wantedLevel);
  if (isBuying) return Math.round(price * mod);
  // Selling: merchants pay less to wanted players
  return Math.round(price / mod);
}

// ─── Opium Special Rule ──────────────────────────────────────

/** Trading opium increases wanted level chance */
export function isContraband(goodId: string): boolean {
  return goodId === 'opium';
}

/** Wanted level gain from contraband trade */
export function contrabandHeat(quantity: number): number {
  // Each opium trade adds 15 heat per unit
  return quantity * 15;
}
