// Economy Slice — trimetallic wallet, trade cargo, wanted levels, stealth, markets

import { StateCreator } from 'zustand';
import { Wallet, Hundi, MarketState, StealthState, CargoSlot, WantedTier } from '../../types';
import {
  walletToDam, damToWallet, addToWallet, subtractFromWallet, canAfford,
  initMarketState, tickMarket, onPlayerBuy, onPlayerSell,
  isContraband, contrabandHeat,
} from '../../engine/economyEngine';
import { heatToTier, decayWantedHeat } from '../../engine/stealthEngine';

export interface EconomySlice {
  // Trimetallic wallet
  wallet: Wallet;

  // Trade cargo
  cargo: CargoSlot[];

  // Hundis (letters of credit)
  hundis: Hundi[];

  // Per-region wanted heat (0-100, maps to WantedTier)
  wantedHeat: Record<string, number>;
  wantedLastDecay: number; // game minutes of last decay tick

  // Per-region market states
  markets: Record<string, MarketState>;

  // Stealth
  stealth: StealthState;

  // Actions — Wallet
  addDam: (amount: number) => void;
  spendDam: (amount: number) => boolean; // returns false if can't afford
  getWalletDam: () => number;

  // Actions — Cargo
  addCargo: (tradeGoodId: string, quantity: number, pricePerUnit: number) => void;
  removeCargo: (tradeGoodId: string, quantity: number) => void;
  getCargoWeight: () => number;

  // Actions — Hundis
  addHundi: (hundi: Hundi) => void;
  redeemHundi: (hundiId: string, currentSettlement: string) => number; // returns dam redeemed (0 if wrong city)

  // Actions — Wanted
  addWantedHeat: (regionCode: string, amount: number) => void;
  decayAllWanted: (gameMinutes: number) => void;
  getWantedTier: (regionCode: string) => WantedTier;
  payFine: (regionCode: string) => boolean; // pay to reduce wanted

  // Actions — Markets
  getOrInitMarket: (regionCode: string, gameMinutes: number) => MarketState;
  tickMarkets: (gameMinutes: number) => void;
  buyTradeGood: (regionCode: string, goodId: string, quantity: number, gameMinutes: number) => boolean;
  sellTradeGood: (regionCode: string, goodId: string, quantity: number, gameMinutes: number) => number; // returns dam earned

  // Actions — Stealth
  toggleStealth: () => void;
  updateStealthState: (partial: Partial<StealthState>) => void;
  resetDetection: () => void;

  // Migration — convert old gold to wallet
  migrateGoldToWallet: (gold: number) => void;
}

const INITIAL_WALLET: Wallet = { muhar: 0, rupia: 0, dam: 500 }; // start with 500 dam (20 rupia equiv)

const INITIAL_STEALTH: StealthState = {
  active: false,
  noiseLevel: 0,
  visibility: 50,
  detectionMeter: 0,
};

export const createEconomySlice: StateCreator<EconomySlice, [], [], EconomySlice> = (set, get) => ({
  wallet: { ...INITIAL_WALLET },
  cargo: [],
  hundis: [],
  wantedHeat: {},
  wantedLastDecay: 0,
  markets: {},
  stealth: { ...INITIAL_STEALTH },

  // ─── Wallet ────────────────────────────────────────────────

  addDam: (amount) => set(state => ({
    wallet: addToWallet(state.wallet, amount),
  })),

  spendDam: (amount) => {
    const state = get();
    if (!canAfford(state.wallet, amount)) return false;
    set({ wallet: subtractFromWallet(state.wallet, amount) });
    return true;
  },

  getWalletDam: () => walletToDam(get().wallet),

  // ─── Cargo ─────────────────────────────────────────────────

  addCargo: (tradeGoodId, quantity, pricePerUnit) => set(state => {
    const existing = state.cargo.find(c => c.tradeGoodId === tradeGoodId);
    if (existing) {
      // Average purchase price
      const totalOld = existing.quantity * existing.purchasePrice;
      const totalNew = quantity * pricePerUnit;
      const newQty = existing.quantity + quantity;
      const avgPrice = Math.round((totalOld + totalNew) / newQty);
      return {
        cargo: state.cargo.map(c =>
          c.tradeGoodId === tradeGoodId
            ? { ...c, quantity: newQty, purchasePrice: avgPrice }
            : c
        ),
      };
    }
    return {
      cargo: [...state.cargo, { tradeGoodId, quantity, purchasePrice: pricePerUnit }],
    };
  }),

  removeCargo: (tradeGoodId, quantity) => set(state => {
    const existing = state.cargo.find(c => c.tradeGoodId === tradeGoodId);
    if (!existing) return state;
    if (existing.quantity <= quantity) {
      return { cargo: state.cargo.filter(c => c.tradeGoodId !== tradeGoodId) };
    }
    return {
      cargo: state.cargo.map(c =>
        c.tradeGoodId === tradeGoodId
          ? { ...c, quantity: c.quantity - quantity }
          : c
      ),
    };
  }),

  getCargoWeight: () => {
    const { TRADE_GOODS } = require('../../data/tradeGoods');
    return get().cargo.reduce((sum, c) => {
      const def = TRADE_GOODS[c.tradeGoodId];
      return sum + (def?.weight ?? 1) * c.quantity;
    }, 0);
  },

  // ─── Hundis ────────────────────────────────────────────────

  addHundi: (hundi) => set(state => ({
    hundis: [...state.hundis, hundi],
  })),

  redeemHundi: (hundiId, currentSettlement) => {
    const state = get();
    const hundi = state.hundis.find(h => h.id === hundiId);
    if (!hundi) return 0;
    // Can redeem at the specified settlement (relaxed: any settlement works with 10% extra fee)
    const isCorrectCity = hundi.redeemableAt === currentSettlement;
    const amount = isCorrectCity ? hundi.amount : Math.floor(hundi.amount * 0.9);
    set({
      hundis: state.hundis.filter(h => h.id !== hundiId),
      wallet: addToWallet(state.wallet, amount),
    });
    return amount;
  },

  // ─── Wanted ────────────────────────────────────────────────

  addWantedHeat: (regionCode, amount) => set(state => ({
    wantedHeat: {
      ...state.wantedHeat,
      [regionCode]: Math.min(100, (state.wantedHeat[regionCode] ?? 0) + amount),
    },
  })),

  decayAllWanted: (gameMinutes) => set(state => {
    const elapsed = gameMinutes - state.wantedLastDecay;
    if (elapsed < 60) return state; // only decay every game hour
    const updated: Record<string, number> = {};
    for (const [code, heat] of Object.entries(state.wantedHeat)) {
      const newHeat = decayWantedHeat(heat, elapsed);
      if (newHeat > 0) updated[code] = newHeat;
    }
    return { wantedHeat: updated, wantedLastDecay: gameMinutes };
  }),

  getWantedTier: (regionCode) => {
    return heatToTier(get().wantedHeat[regionCode] ?? 0);
  },

  payFine: (regionCode) => {
    const state = get();
    const heat = state.wantedHeat[regionCode] ?? 0;
    if (heat === 0) return false;
    // Fine = 50 dam per heat point
    const fine = heat * 50;
    if (!canAfford(state.wallet, fine)) return false;
    set({
      wallet: subtractFromWallet(state.wallet, fine),
      wantedHeat: { ...state.wantedHeat, [regionCode]: 0 },
    });
    return true;
  },

  // ─── Markets ───────────────────────────────────────────────

  getOrInitMarket: (regionCode, gameMinutes) => {
    const state = get();
    let market = state.markets[regionCode];
    if (!market) {
      market = initMarketState(regionCode, gameMinutes);
      set({ markets: { ...state.markets, [regionCode]: market } });
    }
    return market;
  },

  tickMarkets: (gameMinutes) => set(state => {
    const updated: Record<string, MarketState> = {};
    let changed = false;
    for (const [code, market] of Object.entries(state.markets)) {
      const ticked = tickMarket(market, gameMinutes);
      if (ticked !== market) changed = true;
      updated[code] = ticked;
    }
    return changed ? { markets: updated } : state;
  }),

  buyTradeGood: (regionCode, goodId, quantity, gameMinutes) => {
    const state = get();
    let market = state.markets[regionCode];
    if (!market) {
      market = initMarketState(regionCode, gameMinutes);
    }
    const pricePerUnit = market.prices[goodId] ?? 100;
    const totalCost = pricePerUnit * quantity;
    if (!canAfford(state.wallet, totalCost)) return false;

    const newMarket = onPlayerBuy(market, goodId, quantity);

    // Add cargo
    const existing = state.cargo.find(c => c.tradeGoodId === goodId);
    let newCargo: CargoSlot[];
    if (existing) {
      const totalOld = existing.quantity * existing.purchasePrice;
      const newQty = existing.quantity + quantity;
      const avgPrice = Math.round((totalOld + totalCost) / newQty);
      newCargo = state.cargo.map(c =>
        c.tradeGoodId === goodId ? { ...c, quantity: newQty, purchasePrice: avgPrice } : c
      );
    } else {
      newCargo = [...state.cargo, { tradeGoodId: goodId, quantity, purchasePrice: pricePerUnit }];
    }

    // Contraband check
    const heatGain = isContraband(goodId) ? contrabandHeat(quantity) : 0;

    set({
      wallet: subtractFromWallet(state.wallet, totalCost),
      cargo: newCargo,
      markets: { ...state.markets, [regionCode]: newMarket },
      wantedHeat: heatGain > 0
        ? { ...state.wantedHeat, [regionCode]: Math.min(100, (state.wantedHeat[regionCode] ?? 0) + heatGain) }
        : state.wantedHeat,
    });
    return true;
  },

  sellTradeGood: (regionCode, goodId, quantity, gameMinutes) => {
    const state = get();
    const cargoSlot = state.cargo.find(c => c.tradeGoodId === goodId);
    if (!cargoSlot || cargoSlot.quantity < quantity) return 0;

    let market = state.markets[regionCode];
    if (!market) {
      market = initMarketState(regionCode, gameMinutes);
    }

    const pricePerUnit = market.prices[goodId] ?? 100;
    const totalEarned = pricePerUnit * quantity;
    const newMarket = onPlayerSell(market, goodId, quantity);

    // Remove cargo
    let newCargo: CargoSlot[];
    if (cargoSlot.quantity <= quantity) {
      newCargo = state.cargo.filter(c => c.tradeGoodId !== goodId);
    } else {
      newCargo = state.cargo.map(c =>
        c.tradeGoodId === goodId ? { ...c, quantity: c.quantity - quantity } : c
      );
    }

    const heatGain = isContraband(goodId) ? contrabandHeat(quantity) : 0;

    set({
      wallet: addToWallet(state.wallet, totalEarned),
      cargo: newCargo,
      markets: { ...state.markets, [regionCode]: newMarket },
      wantedHeat: heatGain > 0
        ? { ...state.wantedHeat, [regionCode]: Math.min(100, (state.wantedHeat[regionCode] ?? 0) + heatGain) }
        : state.wantedHeat,
    });
    return totalEarned;
  },

  // ─── Stealth ───────────────────────────────────────────────

  toggleStealth: () => set(state => ({
    stealth: { ...state.stealth, active: !state.stealth.active },
  })),

  updateStealthState: (partial) => set(state => ({
    stealth: { ...state.stealth, ...partial },
  })),

  resetDetection: () => set(state => ({
    stealth: { ...state.stealth, detectionMeter: 0 },
  })),

  // ─── Migration ─────────────────────────────────────────────

  migrateGoldToWallet: (gold) => set(state => ({
    wallet: addToWallet(state.wallet, gold * 25), // 1 gold = 1 rupia = 25 dam
  })),
});
