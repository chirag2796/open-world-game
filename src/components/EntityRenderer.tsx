import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { Position, Direction } from '../types';
import { SCALED_TILE, GAME_AREA_HEIGHT, SCREEN_WIDTH, PALETTE } from '../engine/constants';

// Characters render larger than tiles for better visibility
const CHAR_SIZE = 64;
const CHAR_OFFSET_X = (CHAR_SIZE - SCALED_TILE) / 2; // center horizontally on tile
const CHAR_OFFSET_Y = CHAR_SIZE - SCALED_TILE;        // anchor feet to tile bottom

// ─── Puny Characters Sprite Sheet Layout ─────────────────────
// Each sheet: 768x256, 32x32 frames, 24 cols × 8 rows
// Per row: cols 0-7 = down, cols 8-15 = side, cols 16-23 = up
// Row 0: idle, Row 1: walk/run
// (Rows 2-7: attack, hurt, death, etc. — not used in overworld)

const PUNY_FRAME_SIZE = 32;
const PUNY_SHEET_W = 768;
const PUNY_SHEET_H = 256;
const PUNY_IDLE_ROW = 0;
const PUNY_WALK_ROW = 1;
const PUNY_FRAMES_PER_ANIM = 8;

// Direction column offsets: each direction occupies 8 cols
const DIR_COL_OFFSET: Record<Direction, number> = {
  down: 0,
  left: 8,   // side-facing (we flip for right)
  right: 8,  // same as left, but mirrored
  up: 16,
};

// ─── Character Sheet Definitions ─────────────────────────────

const SHEETS = {
  'character-base':    require('../../assets/sprites/puny-characters/Character-Base.png'),
  'warrior-blue':      require('../../assets/sprites/puny-characters/Warrior-Blue.png'),
  'warrior-red':       require('../../assets/sprites/puny-characters/Warrior-Red.png'),
  'soldier-blue':      require('../../assets/sprites/puny-characters/Soldier-Blue.png'),
  'soldier-red':       require('../../assets/sprites/puny-characters/Soldier-Red.png'),
  'soldier-yellow':    require('../../assets/sprites/puny-characters/Soldier-Yellow.png'),
  'human-soldier-cyan': require('../../assets/sprites/puny-characters/Human-Soldier-Cyan.png'),
  'human-soldier-red': require('../../assets/sprites/puny-characters/Human-Soldier-Red.png'),
  'human-worker-cyan': require('../../assets/sprites/puny-characters/Human-Worker-Cyan.png'),
  'human-worker-red':  require('../../assets/sprites/puny-characters/Human-Worker-Red.png'),
  'mage-cyan':         require('../../assets/sprites/puny-characters/Mage-Cyan.png'),
  'mage-red':          require('../../assets/sprites/puny-characters/Mage-Red.png'),
  'archer-green':      require('../../assets/sprites/puny-characters/Archer-Green.png'),
  'archer-purple':     require('../../assets/sprites/puny-characters/Archer-Purple.png'),
} as Record<string, ImageSourcePropType>;

// Map NPC IDs to Puny Characters sprite sheets
// Use diverse sheets: Workers for merchants/farmers, Mages for scholars/priests,
// Character-Base for advisors/commoners, Soldiers for guards
const NPC_SHEET_MAP: Record<string, string> = {
  'delhi-advisor':     'character-base',       // friendly advisor, civilian look
  'delhi-merchant':    'human-worker-red',     // merchant in work clothes
  'agra-merchant':     'human-worker-cyan',    // merchant variant
  'jaipur-guard':      'soldier-yellow',       // armored guard
  'varanasi-scholar':  'mage-cyan',            // robed scholar
  'lucknow-poet':      'character-base',       // poet, civilian look
  'guwahati-sage':     'mage-red',             // wise sage in robes
  'hampi-priest':      'mage-red',             // temple priest in robes
  'kozhikode-trader':  'human-worker-cyan',    // trader in work clothes
  'mumbai-captain':    'human-soldier-cyan',   // naval captain
  'madurai-priestess': 'mage-cyan',            // priestess in robes
  'jodhpur-warrior':   'warrior-red',          // actual warrior
  'bhopal-alchemist':  'mage-cyan',            // alchemist in robes
};

// Player uses Character-Base — friendly, civilian human (not armored warrior)
const PLAYER_SHEET = 'character-base';

function getSheet(entityId: string): ImageSourcePropType {
  const key = entityId === 'player' ? PLAYER_SHEET : (NPC_SHEET_MAP[entityId] || 'soldier-blue');
  return SHEETS[key] || SHEETS['soldier-blue'];
}

// ─── Animated Puny Character ─────────────────────────────────

const PunySprite: React.FC<{
  sheetSource: ImageSourcePropType;
  direction: Direction;
  isMoving: boolean;
  size: number;
  animFrame: number;
}> = memo(({ sheetSource, direction, isMoving, size, animFrame }) => {
  const row = isMoving ? PUNY_WALK_ROW : PUNY_IDLE_ROW;
  const colOffset = DIR_COL_OFFSET[direction];
  const frame = animFrame % PUNY_FRAMES_PER_ANIM;
  const col = colOffset + frame;
  const flipX = direction === 'right';

  const srcX = col * PUNY_FRAME_SIZE;
  const srcY = row * PUNY_FRAME_SIZE;
  const scale = size / PUNY_FRAME_SIZE;

  return (
    <View style={{ width: size, height: size }}>
      <View style={{
        width: size,
        height: size,
        overflow: 'hidden',
        transform: flipX ? [{ scaleX: -1 }] : [],
      }}>
        <Image
          source={sheetSource}
          style={{
            position: 'absolute',
            width: PUNY_SHEET_W * scale,
            height: PUNY_SHEET_H * scale,
            left: -srcX * scale,
            top: -srcY * scale,
          }}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
});

// ─── Entity Renderer ─────────────────────────────────────────

interface NPCRenderData {
  id: string;
  name: string;
  px: number;
  py: number;
  dir: Direction;
  animFrame: number;
}

interface EntityRendererProps {
  npcData: NPCRenderData[];
  playerPos: Position;
  playerDir: Direction;
  playerMoving: boolean;
  animFrame: number;
  cameraX: number;
  cameraY: number;
  useSprites?: boolean;
}

const EntityRenderer: React.FC<EntityRendererProps> = ({
  npcData,
  playerPos,
  playerDir,
  playerMoving,
  animFrame,
  cameraX,
  cameraY,
}) => {
  const offsetX = cameraX - SCREEN_WIDTH / 2;
  const offsetY = cameraY - GAME_AREA_HEIGHT / 2;

  const entities: {
    id: string;
    screenX: number;
    screenY: number;
    name?: string;
    zIndex: number;
    dir: Direction;
    isMoving: boolean;
    animFrame: number;
  }[] = [];

  for (const npc of npcData) {
    const sx = npc.px - offsetX;
    const sy = npc.py - offsetY;
    if (sx > -SCALED_TILE && sx < SCREEN_WIDTH + SCALED_TILE && sy > -SCALED_TILE && sy < GAME_AREA_HEIGHT + SCALED_TILE) {
      entities.push({
        id: npc.id,
        screenX: sx,
        screenY: sy,
        name: npc.name,
        zIndex: Math.floor(npc.py / SCALED_TILE),
        dir: npc.dir,
        isMoving: false, // NPCs use their own wander/patrol animation
        animFrame: npc.animFrame,
      });
    }
  }

  const psx = playerPos.x - offsetX;
  const psy = playerPos.y - offsetY;
  entities.push({
    id: 'player',
    screenX: psx,
    screenY: psy,
    zIndex: Math.floor(playerPos.y / SCALED_TILE),
    dir: playerDir,
    isMoving: playerMoving,
    animFrame,
  });

  entities.sort((a, b) => a.zIndex - b.zIndex);

  return (
    <View style={{ position: 'absolute', width: SCREEN_WIDTH, height: GAME_AREA_HEIGHT }} pointerEvents="none">
      {entities.map((entity) => (
        <View
          key={entity.id}
          style={{
            position: 'absolute',
            left: entity.screenX - CHAR_OFFSET_X,
            top: entity.screenY - CHAR_OFFSET_Y,
            zIndex: entity.zIndex + 100,
          }}
        >
          {/* Shadow under character */}
          <View style={styles.charShadow} />
          <PunySprite
            sheetSource={getSheet(entity.id)}
            direction={entity.dir}
            isMoving={entity.isMoving}
            size={CHAR_SIZE}
            animFrame={entity.animFrame}
          />
          {entity.name && (
            <View style={styles.nameTag}>
              <View style={styles.nameTagBg} />
              <Text style={styles.nameText}>{entity.name}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  charShadow: {
    position: 'absolute',
    bottom: -2,
    left: CHAR_SIZE * 0.15,
    width: CHAR_SIZE * 0.7,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: CHAR_SIZE * 0.35,
  },
  nameTag: {
    position: 'absolute',
    top: -18,
    left: -16,
    right: -16,
    alignItems: 'center',
  },
  nameTagBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 3,
  },
  nameText: {
    color: PALETTE.white,
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 1,
    textShadowColor: PALETTE.black,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});

export default memo(EntityRenderer);
