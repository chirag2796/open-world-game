import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { BattleState, BattleAction, CreatureType, CombatMove } from '../types';
import { ITEMS } from '../data/items';
import { MOVES } from '../data/combatMoves';
import { InventoryState } from '../engine/useInventory';
import { PALETTE, SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/constants';
import ParticleEffect, { ParticleType } from './ParticleEffect';
import VFXSprite from './VFXSprite';
import { VFXAnimDef, MOVE_VFX, ACTION_VFX } from '../engine/vfxSprites';
import { BattlePlayerSprite, BattleEnemySprite } from './BattleCharSprite';

// Type color mapping for move buttons and badges
const TYPE_COLORS: Record<CreatureType, string> = {
  mythic: '#9060c0',
  soldier: '#a05030',
  beast: '#60a030',
  automaton: '#808090',
  naga: '#3080a0',
};

const TYPE_LABELS: Record<CreatureType, string> = {
  mythic: 'MYT',
  soldier: 'SOL',
  beast: 'BST',
  automaton: 'AUT',
  naga: 'NAG',
};

interface BattleScreenProps {
  battle: BattleState;
  inventory: InventoryState;
  onAction: (action: BattleAction, payload?: string) => void;
  onClose: () => void;
}

const HPBar: React.FC<{ current: number; max: number; width: number }> = memo(({ current, max, width }) => {
  const ratio = max > 0 ? current / max : 0;
  const color = ratio > 0.5 ? PALETTE.hpGreen : ratio > 0.25 ? PALETTE.hpYellow : PALETTE.hpRed;
  return (
    <View style={[styles.hpBarBg, { width }]}>
      <View style={[styles.hpBarFill, { width: width * ratio, backgroundColor: color }]} />
    </View>
  );
});

// Old View-based sprites replaced by BattleCharSprite components

// Type badge component
const TypeBadge: React.FC<{ type: CreatureType }> = memo(({ type }) => (
  <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[type] }]}>
    <Text style={styles.typeBadgeText}>{TYPE_LABELS[type]}</Text>
  </View>
));

type ActionPanel = 'main' | 'moves' | 'items';

const BattleScreen: React.FC<BattleScreenProps> = ({
  battle,
  inventory,
  onAction,
  onClose,
}) => {
  const [panel, setPanel] = useState<ActionPanel>('main');
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerFlash, setPlayerFlash] = useState(false);
  const [particleType, setParticleType] = useState<ParticleType | null>(null);
  const [particlePos, setParticlePos] = useState({ x: 0, y: 0 });
  const [vfxAnim, setVfxAnim] = useState<VFXAnimDef | null>(null);
  const [vfxPos, setVfxPos] = useState({ x: 0, y: 0 });
  const screenFlash = useRef(new Animated.Value(0)).current;
  const prevPhaseRef = useRef(battle.phase);
  const lastMoveRef = useRef<string | null>(null);

  // Reset panel when we return to select
  useEffect(() => {
    if (battle.phase === 'select') {
      setPanel('main');
    }
  }, [battle.phase]);

  // Track last move used (for VFX lookup)
  useEffect(() => {
    if (battle.lastAction === 'move' && battle.message) {
      // Extract move from combat log — find last used move ID
      const moveIds = Object.keys(MOVES);
      for (const id of moveIds) {
        if (battle.message.includes(MOVES[id].name)) {
          lastMoveRef.current = id;
          break;
        }
      }
    }
  }, [battle.message]);

  // Trigger animations on phase changes
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = battle.phase;

    // Enemy position (center of enemy sprite area)
    const enemyVfxX = SCREEN_WIDTH - 60;
    const enemyVfxY = 130;
    // Player position
    const playerVfxX = 80;
    const playerVfxY = SCREEN_HEIGHT * 0.35;

    if (battle.phase === 'animate' && prev === 'select') {
      // Player acted — shake enemy
      if (battle.lastAction === 'move') {
        setEnemyShake(true);
        setTimeout(() => setEnemyShake(false), 400);

        // Show VFX sprite on enemy
        const moveId = lastMoveRef.current;
        const vfx = moveId ? MOVE_VFX[moveId] : null;
        if (vfx) {
          setVfxPos({ x: enemyVfxX, y: enemyVfxY });
          setVfxAnim(vfx);
        }

        // Also show particles for extra punch
        setParticlePos({ x: enemyVfxX, y: enemyVfxY });
        setParticleType('slash');
        Animated.sequence([
          Animated.timing(screenFlash, { toValue: 0.3, duration: 60, useNativeDriver: true }),
          Animated.timing(screenFlash, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
      } else if (battle.lastAction === 'defend') {
        setVfxPos({ x: playerVfxX, y: playerVfxY });
        setVfxAnim(ACTION_VFX.defend);
        setParticlePos({ x: playerVfxX, y: playerVfxY });
        setParticleType('defend');
      } else if (battle.lastAction === 'item') {
        setVfxPos({ x: playerVfxX, y: playerVfxY });
        setVfxAnim(ACTION_VFX.heal_item);
        setParticlePos({ x: playerVfxX, y: playerVfxY });
        setParticleType('heal');
      }
    }
    if (battle.phase === 'select' && prev === 'animate') {
      // Enemy attacked player
      setPlayerFlash(true);
      setTimeout(() => setPlayerFlash(false), 400);

      // Show enemy attack VFX on player
      setVfxPos({ x: playerVfxX, y: playerVfxY });
      setVfxAnim(ACTION_VFX.enemy_hit);

      setParticlePos({ x: playerVfxX, y: playerVfxY });
      setParticleType('hit');
      Animated.sequence([
        Animated.timing(screenFlash, { toValue: 0.2, duration: 50, useNativeDriver: true }),
        Animated.timing(screenFlash, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
    if (battle.phase === 'result' && battle.result === 'win') {
      setVfxPos({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT * 0.3 });
      setVfxAnim(ACTION_VFX.victory);
      setParticlePos({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT * 0.3 });
      setParticleType('levelup');
    }
  }, [battle.phase]);

  const enemy = battle.enemy;
  if (!enemy) return null;

  const healItems = inventory.slots
    .filter(s => {
      const def = ITEMS[s.itemId];
      return def && def.usable && def.category === 'items';
    })
    .map(s => ({ ...s, def: ITEMS[s.itemId] }));

  // Resolve player moves
  const playerMoves: CombatMove[] = battle.playerMoves
    .map(id => MOVES[id])
    .filter(Boolean);

  const renderActionPanel = () => {
    if (battle.phase === 'result') {
      return (
        <TouchableOpacity style={styles.fullBtn} onPress={onClose}>
          <Text style={styles.fullBtnText}>
            {battle.result === 'win' ? 'VICTORY!' : battle.result === 'lose' ? 'CONTINUE...' : 'OK'}
          </Text>
        </TouchableOpacity>
      );
    }

    if (battle.phase !== 'select') {
      return (
        <View style={styles.waitingBox}>
          <Text style={styles.waitingText}>...</Text>
        </View>
      );
    }

    // Main action menu
    if (panel === 'main') {
      return (
        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionBtn, styles.atkBtn]} onPress={() => setPanel('moves')}>
            <Text style={styles.actionBtnText}>MOVES</Text>
            <Text style={styles.actionSubText}>{playerMoves.length} available</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.defBtn]} onPress={() => onAction('defend')}>
            <Text style={styles.actionBtnText}>DEFEND</Text>
            <Text style={styles.actionSubText}>DEF x2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.itemBtn]} onPress={() => setPanel('items')}>
            <Text style={styles.actionBtnText}>ITEM</Text>
            <Text style={styles.actionSubText}>{healItems.length} usable</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.runBtn]} onPress={() => onAction('run')}>
            <Text style={styles.actionBtnText}>RUN</Text>
            <Text style={styles.actionSubText}>~50%</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Move selection panel
    if (panel === 'moves') {
      return (
        <View style={styles.movePanel}>
          <View style={styles.movePanelHeader}>
            <Text style={styles.movePanelTitle}>SELECT MOVE</Text>
            <TouchableOpacity onPress={() => setPanel('main')}>
              <Text style={styles.movePanelBack}>BACK</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.moveGrid}>
            {playerMoves.map(move => (
              <TouchableOpacity
                key={move.id}
                style={[styles.moveBtn, { borderColor: TYPE_COLORS[move.type] }]}
                onPress={() => onAction('move', move.id)}
              >
                <View style={styles.moveHeader}>
                  <Text style={styles.moveName}>{move.name}</Text>
                  <View style={[styles.moveTypeBadge, { backgroundColor: TYPE_COLORS[move.type] }]}>
                    <Text style={styles.moveTypeText}>{TYPE_LABELS[move.type]}</Text>
                  </View>
                </View>
                <View style={styles.moveStats}>
                  {move.power > 0 ? (
                    <Text style={styles.moveStat}>PWR:{move.power}</Text>
                  ) : (
                    <Text style={[styles.moveStat, { color: '#80c0ff' }]}>STATUS</Text>
                  )}
                  <Text style={styles.moveStat}>ACC:{move.accuracy}</Text>
                  {move.priority > 0 && <Text style={[styles.moveStat, { color: PALETTE.yellow }]}>FAST</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // Items panel
    return (
      <View style={styles.itemList}>
        <View style={styles.itemListHeader}>
          <Text style={styles.itemListTitle}>USE ITEM</Text>
          <TouchableOpacity onPress={() => setPanel('main')}>
            <Text style={styles.itemListBack}>BACK</Text>
          </TouchableOpacity>
        </View>
        {healItems.length === 0 ? (
          <Text style={styles.noItemsText}>No usable items!</Text>
        ) : (
          healItems.map(item => (
            <TouchableOpacity
              key={item.itemId}
              style={styles.itemRow}
              onPress={() => { setPanel('main'); onAction('item', item.itemId); }}
            >
              <Text style={styles.itemName}>{item.def.name}</Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  return (
    <View style={styles.overlay}>
      {/* Battle scene area */}
      <View style={styles.sceneArea}>
        <View style={styles.sceneBg} />
        <View style={styles.sceneGradient} />
        <View style={styles.groundLine} />

        {/* Enemy side */}
        <View style={styles.enemySide}>
          <View style={styles.enemyNameRow}>
            <Text style={styles.enemyName}>{enemy.name}</Text>
            <TypeBadge type={enemy.creatureType} />
          </View>
          <Text style={styles.enemyLevelText}>Lv.{battle.playerLevel}</Text>
          <HPBar current={battle.enemyHP} max={enemy.hp} width={120} />
          <Text style={styles.hpText}>{battle.enemyHP}/{enemy.hp}</Text>
          {battle.enemyPoisoned && <Text style={styles.statusText}>PSN</Text>}
          <BattleEnemySprite enemyId={enemy.id} size={80} shake={enemyShake} isDead={battle.phase === 'result' && battle.result === 'win'} />
        </View>

        {/* Player side */}
        <View style={styles.playerSide}>
          <BattlePlayerSprite size={72} flash={playerFlash} isDead={battle.phase === 'result' && battle.result === 'lose'} />
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>You</Text>
            <Text style={styles.playerLevelText}>Lv.{battle.playerLevel}</Text>
            <HPBar current={battle.playerHP} max={battle.playerMaxHP} width={120} />
            <Text style={styles.hpText}>{battle.playerHP}/{battle.playerMaxHP}</Text>
            {battle.poisoned && <Text style={styles.statusText}>PSN</Text>}
            <Text style={styles.xpText}>XP: {battle.playerXP}/{Math.floor(50 * Math.pow(battle.playerLevel, 1.5))}</Text>
          </View>
        </View>
      </View>

      {/* Message box */}
      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{battle.message}</Text>
      </View>

      {/* Action area */}
      <View style={styles.actionArea}>
        {renderActionPanel()}
      </View>

      {/* VFX sprite animations */}
      <VFXSprite
        anim={vfxAnim}
        x={vfxPos.x}
        y={vfxPos.y}
        onComplete={() => setVfxAnim(null)}
      />

      {/* Particle effects */}
      <ParticleEffect
        type={particleType}
        x={particlePos.x}
        y={particlePos.y}
        onComplete={() => setParticleType(null)}
      />

      {/* Screen flash overlay */}
      <Animated.View
        style={[styles.screenFlash, { opacity: screenFlash }]}
        pointerEvents="none"
      />

      {/* Gold display */}
      <View style={styles.goldBar}>
        <Text style={styles.goldText}>{battle.playerGold}G</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#0a0a1a',
    zIndex: 2000,
  },
  sceneArea: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.45,
    position: 'relative',
  },
  sceneBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: '40%',
    backgroundColor: '#0e1a30',
  },
  sceneGradient: {
    position: 'absolute',
    left: 0, right: 0, top: '30%', bottom: '40%',
    backgroundColor: '#1a2840',
  },
  groundLine: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0, top: '60%',
    backgroundColor: '#1a2a1a',
    borderTopWidth: 3,
    borderTopColor: '#3a5a3a',
  },
  enemySide: {
    position: 'absolute',
    top: 30,
    right: 20,
    alignItems: 'center',
  },
  enemyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  enemyName: {
    color: PALETTE.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  enemyLevelText: {
    color: PALETTE.lightGray,
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  enemySpriteWrap: {
    marginTop: 8,
  },
  playerSide: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  playerSpriteWrap: {
    marginRight: 12,
  },
  playerInfo: {
    marginBottom: 4,
  },
  playerName: {
    color: PALETTE.white,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  playerLevelText: {
    color: PALETTE.lightGray,
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  hpText: {
    color: PALETTE.lightGray,
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  xpText: {
    color: PALETTE.yellow,
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  statusText: {
    color: '#c040c0',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  hpBarBg: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  messageBox: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: PALETTE.uiBg,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: PALETTE.uiBorder,
    justifyContent: 'center',
  },
  messageText: {
    color: PALETTE.uiText,
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  actionArea: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.3,
    backgroundColor: PALETTE.uiDark,
    padding: 8,
  },
  actionGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 4,
  },
  actionBtn: {
    width: '47%',
    flex: 1,
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  atkBtn: { backgroundColor: '#802020', borderColor: '#a03030' },
  defBtn: { backgroundColor: '#204080', borderColor: '#3060a0' },
  itemBtn: { backgroundColor: '#206020', borderColor: '#308030' },
  runBtn: { backgroundColor: '#606020', borderColor: '#808030' },
  actionBtnText: {
    color: PALETTE.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  actionSubText: {
    color: PALETTE.lightGray,
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  // Move selection panel
  movePanel: {
    flex: 1,
    padding: 4,
  },
  movePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  movePanelTitle: {
    color: PALETTE.yellow,
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  movePanelBack: {
    color: PALETTE.lightGray,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  moveGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  moveBtn: {
    width: '47%',
    flexGrow: 1,
    minHeight: 48,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderRadius: 6,
    padding: 6,
    justifyContent: 'center',
  },
  moveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  moveName: {
    color: PALETTE.white,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
  },
  moveTypeBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 4,
  },
  moveTypeText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  moveStats: {
    flexDirection: 'row',
    gap: 6,
  },
  moveStat: {
    color: PALETTE.lightGray,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  fullBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#303060',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PALETTE.uiBorder,
  },
  fullBtnText: {
    color: PALETTE.yellow,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  itemList: {
    flex: 1,
    padding: 4,
  },
  itemListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemListTitle: {
    color: PALETTE.yellow,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  itemListBack: {
    color: PALETTE.lightGray,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  noItemsText: {
    color: PALETTE.midGray,
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  itemName: {
    color: PALETTE.uiText,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  itemQty: {
    color: PALETTE.yellow,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  waitingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: {
    color: PALETTE.midGray,
    fontSize: 18,
    fontFamily: 'monospace',
  },
  goldBar: {
    position: 'absolute',
    top: 8,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PALETTE.yellow,
  },
  goldText: {
    color: PALETTE.yellow,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  screenFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 4000,
  },
});

export default memo(BattleScreen);
