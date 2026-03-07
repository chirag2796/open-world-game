import { StateCreator } from 'zustand';
import { InventorySlot, EquipState, EquipSlot } from '../../types';
import { ITEMS, STARTING_ITEMS } from '../../data/items';

export interface InventorySlice {
  slots: InventorySlot[];
  equipped: EquipState;

  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: EquipSlot) => void;
  getEquippedStats: () => { attack: number; defense: number };
}

export const createInventorySlice: StateCreator<InventorySlice, [], [], InventorySlice> = (set, get) => ({
  slots: STARTING_ITEMS.map(s => ({ ...s })),
  equipped: { weapon: null, head: null, body: null, legs: null, accessory: null },

  addItem: (itemId, quantity = 1) => {
    const def = ITEMS[itemId];
    if (!def) return;
    set(state => {
      const existing = state.slots.find(s => s.itemId === itemId);
      if (existing && def.stackable) {
        return {
          slots: state.slots.map(s =>
            s.itemId === itemId ? { ...s, quantity: s.quantity + quantity } : s
          ),
        };
      }
      return { slots: [...state.slots, { itemId, quantity: def.stackable ? quantity : 1 }] };
    });
  },

  removeItem: (itemId, quantity = 1) => set(state => {
    const idx = state.slots.findIndex(s => s.itemId === itemId);
    if (idx === -1) return state;
    const slot = state.slots[idx];
    if (slot.quantity <= quantity) {
      return { slots: state.slots.filter((_, i) => i !== idx) };
    }
    return {
      slots: state.slots.map((s, i) =>
        i === idx ? { ...s, quantity: s.quantity - quantity } : s
      ),
    };
  }),

  equipItem: (itemId) => {
    const def = ITEMS[itemId];
    if (!def || !def.equipSlot) return;
    set(state => {
      const hasItem = state.slots.some(s => s.itemId === itemId);
      if (!hasItem) return state;
      const slot = def.equipSlot!;
      const currentlyEquipped = state.equipped[slot];
      let newSlots = state.slots.filter(s => s.itemId !== itemId);
      if (currentlyEquipped) {
        newSlots = [...newSlots, { itemId: currentlyEquipped, quantity: 1 }];
      }
      return {
        slots: newSlots,
        equipped: { ...state.equipped, [slot]: itemId },
      };
    });
  },

  unequipItem: (slot) => set(state => {
    const itemId = state.equipped[slot];
    if (!itemId) return state;
    return {
      slots: [...state.slots, { itemId, quantity: 1 }],
      equipped: { ...state.equipped, [slot]: null },
    };
  }),

  getEquippedStats: () => {
    const state = get();
    let attack = 0, defense = 0;
    for (const itemId of Object.values(state.equipped)) {
      if (itemId) {
        const def = ITEMS[itemId];
        if (def) {
          attack += def.attack || 0;
          defense += def.defense || 0;
        }
      }
    }
    return { attack, defense };
  },
});
