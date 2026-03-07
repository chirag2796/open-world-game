import React, { useState, memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ItemCategory, EquipState } from '../types';
import { ITEMS } from '../data/items';
import { InventoryState } from '../engine/useInventory';
import { PALETTE, SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/constants';

interface InventoryScreenProps {
  inventory: InventoryState;
  onClose: () => void;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: keyof EquipState) => void;
  onUse: (itemId: string) => void;
}

const CATEGORIES: { key: ItemCategory; label: string; color: string }[] = [
  { key: 'weapons', label: 'WEAPONS', color: '#c04040' },
  { key: 'armor', label: 'ARMOR', color: '#4080c0' },
  { key: 'items', label: 'ITEMS', color: '#40a040' },
  { key: 'key_items', label: 'KEY ITEMS', color: '#c0a020' },
];

const EQUIP_SLOT_LABELS: Record<keyof EquipState, string> = {
  weapon: 'Weapon',
  head: 'Head',
  body: 'Body',
  legs: 'Legs',
  accessory: 'Accessory',
};

const InventoryScreen: React.FC<InventoryScreenProps> = ({
  inventory,
  onClose,
  onEquip,
  onUnequip,
  onUse,
}) => {
  const [activeTab, setActiveTab] = useState<ItemCategory>('weapons');
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);

  const categoryItems = inventory.slots
    .map((s, idx) => ({ ...s, def: ITEMS[s.itemId], originalIdx: idx }))
    .filter(s => s.def?.category === activeTab);

  const selected = selectedIdx >= 0 && selectedIdx < categoryItems.length
    ? categoryItems[selectedIdx]
    : null;

  const handleTabChange = useCallback((key: ItemCategory) => {
    setActiveTab(key);
    setSelectedIdx(-1);
  }, []);

  // Compute equipped stats
  let totalAtk = 0;
  let totalDef = 0;
  for (const itemId of Object.values(inventory.equipped)) {
    if (itemId) {
      const d = ITEMS[itemId];
      totalAtk += d?.attack || 0;
      totalDef += d?.defense || 0;
    }
  }

  const activeColor = CATEGORIES.find(c => c.key === activeTab)?.color || PALETTE.uiBorder;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>BAG</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>ATK:{totalAtk}</Text>
            <Text style={styles.statText}>DEF:{totalDef}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>X</Text>
          </TouchableOpacity>
        </View>

        {/* Category tabs */}
        <View style={styles.tabRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.tab,
                activeTab === cat.key && { backgroundColor: cat.color },
              ]}
              onPress={() => handleTabChange(cat.key)}
            >
              <Text style={[
                styles.tabText,
                activeTab === cat.key && styles.tabTextActive,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Equipped slots bar (shown for weapons/armor) */}
        {(activeTab === 'weapons' || activeTab === 'armor') && (
          <View style={styles.equipBar}>
            {(Object.keys(EQUIP_SLOT_LABELS) as (keyof EquipState)[]).map(slot => {
              const eqId = inventory.equipped[slot];
              const eqDef = eqId ? ITEMS[eqId] : null;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.equipSlot, eqDef && styles.equipSlotFilled]}
                  onPress={() => eqId && onUnequip(slot)}
                >
                  <Text style={styles.equipSlotLabel}>{EQUIP_SLOT_LABELS[slot]}</Text>
                  <Text style={styles.equipSlotItem} numberOfLines={1}>
                    {eqDef ? eqDef.icon : '--'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Item list */}
        <ScrollView style={styles.itemList}>
          {categoryItems.length === 0 ? (
            <Text style={styles.emptyText}>No items</Text>
          ) : (
            categoryItems.map((item, idx) => (
              <TouchableOpacity
                key={`${item.itemId}-${item.originalIdx}`}
                style={[
                  styles.itemRow,
                  selectedIdx === idx && { backgroundColor: activeColor + '40' },
                ]}
                onPress={() => setSelectedIdx(idx === selectedIdx ? -1 : idx)}
              >
                <View style={[styles.itemIcon, { backgroundColor: activeColor }]}>
                  <Text style={styles.itemIconText}>{item.def.icon}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.def.name}</Text>
                  {item.def.attack != null && (
                    <Text style={styles.itemStat}>ATK +{item.def.attack}</Text>
                  )}
                  {item.def.defense != null && (
                    <Text style={styles.itemStat}>DEF +{item.def.defense}</Text>
                  )}
                </View>
                {item.quantity > 1 && (
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Detail panel for selected item */}
        {selected && (
          <View style={[styles.detailPanel, { borderTopColor: activeColor }]}>
            <Text style={styles.detailName}>{selected.def.name}</Text>
            <Text style={styles.detailDesc}>{selected.def.description}</Text>
            <View style={styles.detailActions}>
              {selected.def.equipSlot && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: activeColor }]}
                  onPress={() => onEquip(selected.itemId)}
                >
                  <Text style={styles.actionBtnText}>EQUIP</Text>
                </TouchableOpacity>
              )}
              {selected.def.usable && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#40a040' }]}
                  onPress={() => onUse(selected.itemId)}
                >
                  <Text style={styles.actionBtnText}>USE</Text>
                </TouchableOpacity>
              )}
              {selected.def.value > 0 && (
                <Text style={styles.valueText}>{selected.def.value}G</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    marginTop: 40,
    marginBottom: 20,
    marginHorizontal: 12,
    backgroundColor: PALETTE.uiBg,
    borderWidth: 3,
    borderColor: PALETTE.uiBorder,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: PALETTE.uiDark,
    borderBottomWidth: 2,
    borderBottomColor: PALETTE.uiBorder,
  },
  title: {
    color: PALETTE.uiText,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    color: PALETTE.yellow,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#803030',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: PALETTE.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: PALETTE.uiDark,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    color: PALETTE.lightGray,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: PALETTE.white,
  },
  equipBar: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: PALETTE.uiDark + 'cc',
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.uiBorder + '40',
  },
  equipSlot: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: PALETTE.midGray,
    borderRadius: 4,
    backgroundColor: PALETTE.darkGray + '80',
  },
  equipSlotFilled: {
    borderColor: PALETTE.yellow,
    backgroundColor: PALETTE.darkGray,
  },
  equipSlotLabel: {
    color: PALETTE.lightGray,
    fontSize: 7,
    fontFamily: 'monospace',
  },
  equipSlotItem: {
    color: PALETTE.yellow,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  itemList: {
    flex: 1,
    paddingVertical: 4,
  },
  emptyText: {
    color: PALETTE.midGray,
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 30,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.uiDark,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemIconText: {
    color: PALETTE.white,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: PALETTE.uiText,
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  itemStat: {
    color: PALETTE.lightGray,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  itemQty: {
    color: PALETTE.yellow,
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailPanel: {
    borderTopWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: PALETTE.uiDark,
  },
  detailName: {
    color: PALETTE.uiText,
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailDesc: {
    color: PALETTE.lightGray,
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
    marginBottom: 8,
  },
  detailActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionBtnText: {
    color: PALETTE.white,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  valueText: {
    color: PALETTE.yellow,
    fontSize: 12,
    fontFamily: 'monospace',
    marginLeft: 'auto',
  },
});

export default memo(InventoryScreen);
