import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Image, Animated, StyleSheet, ImageSourcePropType } from 'react-native';
import { CreatureType } from '../types';

// ─── Sprite Sheet Configs ────────────────────────────────────

// Puny Characters layout: 768x256, 32x32 frames
// 24 cols × 8 rows. Rows per direction: down=0-1, side=2-3(unused), up=4-5(unused)
// Row 0 cols 0-7: idle (8 frames), Row 0 cols 8-15: walk, etc.
// For battle we only need idle animation: row 0, cols 0-7
const PUNY_PLAYER = {
  source: require('../../assets/sprites/puny-characters/Warrior-Blue.png') as ImageSourcePropType,
  sheetWidth: 768,
  sheetHeight: 256,
  frameSize: 32,
  idleRow: 0,
  idleFrames: 8,
  cols: 24,
};

// Pixel Crawler Idle sheets: 128x32, 32x32 frames, 4 frames horizontal
interface EnemySpriteSheet {
  source: ImageSourcePropType;
  sheetWidth: number;
  sheetHeight: number;
  frameSize: number;
  frames: number;
}

const ENEMY_SHEETS: Record<string, EnemySpriteSheet> = {
  'orc-warrior':      { source: require('../../assets/sprites/battle/enemies/orc-warrior-idle.png'), sheetWidth: 128, sheetHeight: 32, frameSize: 32, frames: 4 },
  'orc':              { source: require('../../assets/sprites/battle/enemies/orc-idle.png'), sheetWidth: 128, sheetHeight: 32, frameSize: 32, frames: 4 },
  'orc-shaman':       { source: require('../../assets/sprites/battle/enemies/orc-shaman-idle.png'), sheetWidth: 128, sheetHeight: 32, frameSize: 32, frames: 4 },
  'skeleton':         { source: require('../../assets/sprites/battle/enemies/skeleton-idle.png'), sheetWidth: 128, sheetHeight: 32, frameSize: 32, frames: 4 },
  'skeleton-warrior': { source: require('../../assets/sprites/battle/enemies/skeleton-warrior-idle.png'), sheetWidth: 128, sheetHeight: 32, frameSize: 32, frames: 4 },
  'skeleton-mage':    { source: require('../../assets/sprites/battle/enemies/skeleton-mage-idle.png'), sheetWidth: 128, sheetHeight: 32, frameSize: 32, frames: 4 },
  'knight':           { source: require('../../assets/sprites/battle/enemies/knight-idle.png'), sheetWidth: 128, sheetHeight: 32, frameSize: 32, frames: 4 },
  'rogue':            { source: require('../../assets/sprites/battle/enemies/rogue-idle.png'), sheetWidth: 128, sheetHeight: 32, frameSize: 32, frames: 4 },
  'wizard':           { source: require('../../assets/sprites/battle/enemies/wizard-idle.png'), sheetWidth: 128, sheetHeight: 32, frameSize: 32, frames: 4 },
};

// Map enemy IDs to sprite sheets based on their visual type
const ENEMY_SPRITE_MAP: Record<string, string> = {
  // Soldier types → knight/warrior sprites
  'desert_bandit':    'rogue',
  'dacoit':           'orc-warrior',
  'tribal_warrior':   'orc',
  'pirate':           'rogue',
  'bandit_leader':    'knight',
  // Beast types → orc (large/aggressive looking)
  'wild_boar':        'orc',
  'sand_scorpion':    'skeleton',
  'forest_wolf':      'orc',
  'jungle_cat':       'orc',
  'snow_leopard':     'orc',
  'mountain_yak':     'orc-warrior',
  'cobra':            'skeleton',
  'mugger_croc':      'orc-warrior',
  // Mythic types → wizard/mage sprites
  'dust_djinn':       'wizard',
  'yeti':             'orc-shaman',
  'corrupted_asura':  'skeleton-mage',
  'cosmic_asura':     'wizard',
  // Automaton → skeleton warrior (armored)
  'rock_golem':       'skeleton-warrior',
  // Naga → skeleton mage
  'naga_spirit':      'skeleton-mage',
};

function getEnemySheet(enemyId: string): EnemySpriteSheet {
  const key = ENEMY_SPRITE_MAP[enemyId] || 'orc';
  return ENEMY_SHEETS[key] || ENEMY_SHEETS['orc'];
}

// ─── Battle Player Sprite ────────────────────────────────────

interface BattlePlayerSpriteProps {
  size: number;       // rendered size
  flash: boolean;     // damage flash
  isDead?: boolean;
}

export const BattlePlayerSprite: React.FC<BattlePlayerSpriteProps> = memo(({ size, flash, isDead }) => {
  const [frame, setFrame] = useState(0);
  const flashAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Idle animation loop
  useEffect(() => {
    if (isDead) return;
    timerRef.current = setInterval(() => {
      setFrame(f => (f + 1) % PUNY_PLAYER.idleFrames);
    }, 150);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isDead]);

  // Damage flash
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

  const scale = size / PUNY_PLAYER.frameSize;
  const srcX = frame * PUNY_PLAYER.frameSize;
  const srcY = PUNY_PLAYER.idleRow * PUNY_PLAYER.frameSize;

  return (
    <Animated.View style={[
      styles.spriteContainer,
      { width: size, height: size, opacity: isDead ? 0.3 : flashAnim },
    ]}>
      <Image
        source={PUNY_PLAYER.source}
        style={{
          position: 'absolute',
          width: PUNY_PLAYER.sheetWidth * scale,
          height: PUNY_PLAYER.sheetHeight * scale,
          left: -srcX * scale,
          top: -srcY * scale,
        }}
        resizeMode="stretch"
      />
    </Animated.View>
  );
});

// ─── Battle Enemy Sprite ────────────────────────────────────

interface BattleEnemySpriteProps {
  enemyId: string;
  size: number;
  shake: boolean;
  isDead?: boolean;
}

export const BattleEnemySprite: React.FC<BattleEnemySpriteProps> = memo(({ enemyId, size, shake, isDead }) => {
  const [frame, setFrame] = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sheet = getEnemySheet(enemyId);

  // Idle animation loop
  useEffect(() => {
    if (isDead) return;
    timerRef.current = setInterval(() => {
      setFrame(f => (f + 1) % sheet.frames);
    }, 180);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isDead, sheet.frames]);

  // Shake on damage
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

  const scale = size / sheet.frameSize;
  const srcX = frame * sheet.frameSize;

  return (
    <Animated.View style={[
      styles.spriteContainer,
      {
        width: size,
        height: size,
        opacity: isDead ? 0.3 : 1,
        transform: [{ translateX: shakeAnim }],
      },
    ]}>
      <Image
        source={sheet.source}
        style={{
          position: 'absolute',
          width: sheet.sheetWidth * scale,
          height: sheet.sheetHeight * scale,
          left: -srcX * scale,
          top: 0,
        }}
        resizeMode="stretch"
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  spriteContainer: {
    overflow: 'hidden',
  },
});
