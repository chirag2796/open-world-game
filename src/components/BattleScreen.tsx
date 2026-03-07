import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BattleState, BattleAction } from '../types';
import { ITEMS } from '../data/items';
import { InventoryState } from '../engine/useInventory';
import { PALETTE, SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/constants';
import ParticleEffect, { ParticleType } from './ParticleEffect';

interface BattleScreenProps {
  battle: BattleState;
  inventory: InventoryState;
  onAction: (action: BattleAction, itemId?: string) => void;
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

const EnemySprite: React.FC<{ bodyColor: string; headColor: string; shake: boolean }> = memo(({ bodyColor, headColor, shake }) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shake) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [shake]);

  return (
    <Animated.View style={[styles.enemySprite, { transform: [{ translateX: shakeAnim }] }]}>
      {/* Body */}
      <View style={[styles.enemyBody, { backgroundColor: bodyColor }]} />
      {/* Head */}
      <View style={[styles.enemyHead, { backgroundColor: headColor }]} />
      {/* Eyes */}
      <View style={styles.enemyEyeL} />
      <View style={styles.enemyEyeR} />
      {/* Arms */}
      <View style={[styles.enemyArmL, { backgroundColor: bodyColor }]} />
      <View style={[styles.enemyArmR, { backgroundColor: bodyColor }]} />
    </Animated.View>
  );
});

const PlayerSprite: React.FC<{ flash: boolean }> = memo(({ flash }) => {
  const flashAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (flash) {
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 0.2, duration: 80, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0.2, duration: 80, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [flash]);

  return (
    <Animated.View style={[styles.playerSprite, { opacity: flashAnim }]}>
      {/* Body */}
      <View style={styles.pBody} />
      {/* Head */}
      <View style={styles.pHead} />
      {/* Shield arm */}
      <View style={styles.pShield} />
      {/* Sword arm */}
      <View style={styles.pSword} />
    </Animated.View>
  );
});

const BattleScreen: React.FC<BattleScreenProps> = ({
  battle,
  inventory,
  onAction,
  onClose,
}) => {
  const [showItems, setShowItems] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerFlash, setPlayerFlash] = useState(false);
  const [particleType, setParticleType] = useState<ParticleType | null>(null);
  const [particlePos, setParticlePos] = useState({ x: 0, y: 0 });
  const screenFlash = useRef(new Animated.Value(0)).current;
  const prevPhaseRef = useRef(battle.phase);
  const prevActionRef = useRef(battle.lastAction);

  // Trigger animations on phase changes
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = battle.phase;
    const lastAction = battle.lastAction;
    const prevAction = prevActionRef.current;
    prevActionRef.current = lastAction;

    if (battle.phase === 'animate' && prev === 'select') {
      // Player attacked enemy
      setEnemyShake(true);
      setTimeout(() => setEnemyShake(false), 400);

      if (lastAction === 'attack') {
        setParticlePos({ x: SCREEN_WIDTH - 70, y: 110 });
        setParticleType('slash');
        // Screen flash
        Animated.sequence([
          Animated.timing(screenFlash, { toValue: 0.3, duration: 60, useNativeDriver: true }),
          Animated.timing(screenFlash, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
      } else if (lastAction === 'defend') {
        setParticlePos({ x: 60, y: SCREEN_HEIGHT * 0.35 });
        setParticleType('defend');
      } else if (lastAction === 'item') {
        setParticlePos({ x: 60, y: SCREEN_HEIGHT * 0.35 });
        setParticleType('heal');
      }
    }
    if (battle.phase === 'select' && prev === 'animate') {
      // Enemy attacked player
      setPlayerFlash(true);
      setTimeout(() => setPlayerFlash(false), 400);
      setParticlePos({ x: 60, y: SCREEN_HEIGHT * 0.35 });
      setParticleType('hit');
      Animated.sequence([
        Animated.timing(screenFlash, { toValue: 0.2, duration: 50, useNativeDriver: true }),
        Animated.timing(screenFlash, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
    if (battle.phase === 'result' && battle.result === 'win') {
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

  return (
    <View style={styles.overlay}>
      {/* Battle scene area */}
      <View style={styles.sceneArea}>
        {/* Background gradient effect */}
        <View style={styles.sceneBg} />
        <View style={styles.groundLine} />

        {/* Enemy side */}
        <View style={styles.enemySide}>
          <Text style={styles.enemyName}>{enemy.name}</Text>
          <Text style={styles.enemyLevelText}>Lv.{battle.playerLevel}</Text>
          <HPBar current={battle.enemyHP} max={enemy.hp} width={120} />
          <Text style={styles.hpText}>{battle.enemyHP}/{enemy.hp}</Text>
          <EnemySprite bodyColor={enemy.bodyColor} headColor={enemy.headColor} shake={enemyShake} />
        </View>

        {/* Player side */}
        <View style={styles.playerSide}>
          <PlayerSprite flash={playerFlash} />
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>You</Text>
            <Text style={styles.playerLevelText}>Lv.{battle.playerLevel}</Text>
            <HPBar current={battle.playerHP} max={battle.playerMaxHP} width={120} />
            <Text style={styles.hpText}>{battle.playerHP}/{battle.playerMaxHP}</Text>
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
        {battle.phase === 'result' ? (
          <TouchableOpacity style={styles.fullBtn} onPress={onClose}>
            <Text style={styles.fullBtnText}>
              {battle.result === 'win' ? 'VICTORY!' : battle.result === 'lose' ? 'CONTINUE...' : 'OK'}
            </Text>
          </TouchableOpacity>
        ) : battle.phase === 'select' && !showItems ? (
          <View style={styles.actionGrid}>
            <TouchableOpacity style={[styles.actionBtn, styles.atkBtn]} onPress={() => onAction('attack')}>
              <Text style={styles.actionBtnText}>ATTACK</Text>
              <Text style={styles.actionSubText}>ATK:{battle.playerATK}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.defBtn]} onPress={() => onAction('defend')}>
              <Text style={styles.actionBtnText}>DEFEND</Text>
              <Text style={styles.actionSubText}>DEF:x2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.itemBtn]} onPress={() => setShowItems(true)}>
              <Text style={styles.actionBtnText}>ITEM</Text>
              <Text style={styles.actionSubText}>{healItems.length} usable</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.runBtn]} onPress={() => onAction('run')}>
              <Text style={styles.actionBtnText}>RUN</Text>
              <Text style={styles.actionSubText}>60%</Text>
            </TouchableOpacity>
          </View>
        ) : battle.phase === 'select' && showItems ? (
          <View style={styles.itemList}>
            <View style={styles.itemListHeader}>
              <Text style={styles.itemListTitle}>USE ITEM</Text>
              <TouchableOpacity onPress={() => setShowItems(false)}>
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
                  onPress={() => { setShowItems(false); onAction('item', item.itemId); }}
                >
                  <Text style={styles.itemName}>{item.def.name}</Text>
                  <Text style={styles.itemQty}>x{item.quantity}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <View style={styles.waitingBox}>
            <Text style={styles.waitingText}>...</Text>
          </View>
        )}
      </View>

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
    backgroundColor: '#1a2a4a',
  },
  groundLine: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0, top: '60%',
    backgroundColor: '#2a3a2a',
    borderTopWidth: 3,
    borderTopColor: '#4a6a4a',
  },
  enemySide: {
    position: 'absolute',
    top: 30,
    right: 20,
    alignItems: 'center',
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
  enemySprite: {
    width: 80,
    height: 80,
    marginTop: 8,
    position: 'relative',
  },
  enemyBody: {
    position: 'absolute',
    bottom: 0, left: 15, width: 50, height: 45,
    borderRadius: 6,
  },
  enemyHead: {
    position: 'absolute',
    top: 0, left: 20, width: 40, height: 35,
    borderRadius: 8,
  },
  enemyEyeL: {
    position: 'absolute',
    top: 12, left: 28,
    width: 8, height: 8,
    backgroundColor: '#ff3030',
    borderRadius: 4,
  },
  enemyEyeR: {
    position: 'absolute',
    top: 12, left: 44,
    width: 8, height: 8,
    backgroundColor: '#ff3030',
    borderRadius: 4,
  },
  enemyArmL: {
    position: 'absolute',
    bottom: 15, left: 5,
    width: 14, height: 28,
    borderRadius: 4,
  },
  enemyArmR: {
    position: 'absolute',
    bottom: 15, right: 5,
    width: 14, height: 28,
    borderRadius: 4,
  },
  playerSide: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  playerSprite: {
    width: 64,
    height: 72,
    position: 'relative',
    marginRight: 12,
  },
  pBody: {
    position: 'absolute',
    bottom: 0, left: 12, width: 40, height: 40,
    backgroundColor: '#30a030',
    borderRadius: 4,
  },
  pHead: {
    position: 'absolute',
    top: 0, left: 16, width: 32, height: 30,
    backgroundColor: PALETTE.skin,
    borderRadius: 6,
  },
  pShield: {
    position: 'absolute',
    bottom: 8, left: 2,
    width: 14, height: 24,
    backgroundColor: '#4060a0',
    borderRadius: 3,
  },
  pSword: {
    position: 'absolute',
    bottom: 12, right: 2,
    width: 6, height: 32,
    backgroundColor: '#c0c0c0',
    borderRadius: 2,
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
