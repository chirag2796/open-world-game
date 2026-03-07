import { useState, useCallback } from 'react';
import { InventorySlot, EquipState, ItemCategory } from '../types';
import { ITEMS, STARTING_ITEMS } from '../data/items';

export interface InventoryState {
  slots: InventorySlot[];
  equipped: EquipState;
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryState>(() => ({
    slots: STARTING_ITEMS.map(s => ({ ...s })),
    equipped: { weapon: null, head: null, body: null, legs: null, accessory: null },
  }));

  const addItem = useCallback((itemId: string, quantity: number = 1) => {
    const def = ITEMS[itemId];
    if (!def) return;

    setInventory(prev => {
      const existing = prev.slots.find(s => s.itemId === itemId);
      if (existing && def.stackable) {
        return {
          ...prev,
          slots: prev.slots.map(s =>
            s.itemId === itemId ? { ...s, quantity: s.quantity + quantity } : s
          ),
        };
      }
      if (existing && !def.stackable) {
        // Can't stack non-stackable, add separate slot
        return { ...prev, slots: [...prev.slots, { itemId, quantity: 1 }] };
      }
      return { ...prev, slots: [...prev.slots, { itemId, quantity }] };
    });
  }, []);

  const removeItem = useCallback((itemId: string, quantity: number = 1) => {
    setInventory(prev => {
      const idx = prev.slots.findIndex(s => s.itemId === itemId);
      if (idx === -1) return prev;

      const slot = prev.slots[idx];
      if (slot.quantity <= quantity) {
        return { ...prev, slots: prev.slots.filter((_, i) => i !== idx) };
      }
      return {
        ...prev,
        slots: prev.slots.map((s, i) =>
          i === idx ? { ...s, quantity: s.quantity - quantity } : s
        ),
      };
    });
  }, []);

  const equipItem = useCallback((itemId: string) => {
    const def = ITEMS[itemId];
    if (!def || !def.equipSlot) return;

    setInventory(prev => {
      const hasItem = prev.slots.some(s => s.itemId === itemId);
      if (!hasItem) return prev;

      const slot = def.equipSlot!;
      const currentlyEquipped = prev.equipped[slot];

      // Unequip current item back to bag, equip new one
      let newSlots = prev.slots.filter(s => s.itemId !== itemId);
      if (currentlyEquipped) {
        newSlots = [...newSlots, { itemId: currentlyEquipped, quantity: 1 }];
      }

      return {
        slots: newSlots,
        equipped: { ...prev.equipped, [slot]: itemId },
      };
    });
  }, []);

  const unequipItem = useCallback((slot: keyof EquipState) => {
    setInventory(prev => {
      const itemId = prev.equipped[slot];
      if (!itemId) return prev;

      return {
        slots: [...prev.slots, { itemId, quantity: 1 }],
        equipped: { ...prev.equipped, [slot]: null },
      };
    });
  }, []);

  const getItemsByCategory = useCallback((category: ItemCategory): (InventorySlot & { def: typeof ITEMS[string] })[] => {
    return inventory.slots
      .filter(s => ITEMS[s.itemId]?.category === category)
      .map(s => ({ ...s, def: ITEMS[s.itemId] }));
  }, [inventory.slots]);

  const getEquippedStats = useCallback(() => {
    let totalAttack = 0;
    let totalDefense = 0;
    for (const itemId of Object.values(inventory.equipped)) {
      if (itemId) {
        const def = ITEMS[itemId];
        if (def) {
          totalAttack += def.attack || 0;
          totalDefense += def.defense || 0;
        }
      }
    }
    return { attack: totalAttack, defense: totalDefense };
  }, [inventory.equipped]);

  return {
    inventory,
    addItem,
    removeItem,
    equipItem,
    unequipItem,
    getItemsByCategory,
    getEquippedStats,
  };
}
