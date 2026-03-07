import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Position, Direction } from '../types';
import { SCALED_TILE, GAME_AREA_HEIGHT, SCREEN_WIDTH, PALETTE } from '../engine/constants';
import { CHARSHEET } from '../engine/SpriteSheet';
import { PLAYER_SPRITE, NPC_SPRITES, getCharSprite } from '../engine/charSprites';

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

// Sprite-based character: renders a frame from the character sprite sheet
const CharSprite: React.FC<{
  col: number;
  row: number;
  size: number;
}> = memo(({ col, row, size }) => {
  const srcX = col * (CHARSHEET.frameWidth + CHARSHEET.margin);
  const srcY = row * (CHARSHEET.frameHeight + CHARSHEET.margin);
  const scale = size / CHARSHEET.frameWidth;

  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={CHARSHEET.source}
        style={{
          position: 'absolute',
          width: CHARSHEET.sheetWidth * scale,
          height: CHARSHEET.sheetHeight * scale,
          left: -srcX * scale,
          top: -srcY * scale,
        }}
        resizeMode="stretch"
      />
    </View>
  );
});

// Fallback View-based character (used when sprites not available)
const CharacterView: React.FC<{
  bodyColor: string;
  headColor: string;
  detailColor: string;
  size: number;
  flipX: boolean;
  walkFrame: number;
}> = memo(({ bodyColor, headColor, detailColor, size, flipX, walkFrame }) => {
  const half = size / 2;
  const quarter = size / 4;
  const leftLeg = walkFrame === 1 ? 3 : walkFrame === 3 ? -2 : 0;
  const rightLeg = walkFrame === 1 ? -2 : walkFrame === 3 ? 3 : 0;
  const bodyBob = (walkFrame === 1 || walkFrame === 3) ? -1 : 0;

  return (
    <View style={{ width: size, height: size }}>
      <View style={{
        position: 'absolute', left: quarter, top: 2 + bodyBob,
        width: half, height: half - 2,
        backgroundColor: PALETTE.skin, borderRadius: 4,
      }} />
      <View style={{
        position: 'absolute', left: quarter, top: bodyBob,
        width: half, height: quarter,
        backgroundColor: detailColor,
        borderTopLeftRadius: 4, borderTopRightRadius: 4,
      }} />
      <View style={{
        position: 'absolute', left: quarter + 4, top: quarter - 2 + bodyBob,
        width: 4, height: 4, backgroundColor: PALETTE.black, borderRadius: 2,
      }} />
      <View style={{
        position: 'absolute', left: half + 4, top: quarter - 2 + bodyBob,
        width: 4, height: 4, backgroundColor: PALETTE.black, borderRadius: 2,
      }} />
      <View style={{
        position: 'absolute', left: quarter - 2, top: half + bodyBob,
        width: half + 4, height: half - 6,
        backgroundColor: bodyColor, borderRadius: 2,
      }} />
      <View style={{
        position: 'absolute', left: quarter, top: half + quarter - 4 + bodyBob,
        width: half, height: 4, backgroundColor: headColor,
      }} />
      <View style={{
        position: 'absolute', left: quarter + 2, bottom: 0 + leftLeg,
        width: 8, height: 10, backgroundColor: PALETTE.woodDark, borderRadius: 2,
      }} />
      <View style={{
        position: 'absolute', right: quarter + 2, bottom: 0 + rightLeg,
        width: 8, height: 10, backgroundColor: PALETTE.woodDark, borderRadius: 2,
      }} />
      <View style={{
        position: 'absolute', left: quarter - 5, top: half + 2 + bodyBob,
        width: 5, height: half - 10,
        backgroundColor: bodyColor, borderRadius: 2,
      }} />
      <View style={{
        position: 'absolute', right: quarter - 5, top: half + 2 + bodyBob,
        width: 5, height: half - 10,
        backgroundColor: bodyColor, borderRadius: 2,
      }} />
    </View>
  );
});

const DEFAULT_COLORS = { body: '#803030', head: '#e0c020', detail: '#a0a0a0' };

const NPC_COLORS: Record<string, { body: string; head: string; detail: string }> = {
  'delhi-advisor':     { body: '#803030', head: '#e0c020', detail: '#a0a0a0' },
  'delhi-merchant':    { body: '#e0c080', head: '#c07030', detail: '#f0d090' },
  'agra-merchant':     { body: '#f0f0e0', head: '#208020', detail: '#e08020' },
  'jaipur-guard':      { body: '#808080', head: '#606060', detail: '#c08040' },
  'varanasi-scholar':  { body: '#e0a020', head: '#802020', detail: '#f0e0a0' },
  'lucknow-poet':      { body: '#6040a0', head: '#e0d0b0', detail: '#8060c0' },
  'guwahati-sage':     { body: '#206020', head: '#404040', detail: '#80c080' },
  'hampi-priest':      { body: '#f0e0c0', head: '#c04040', detail: '#e08020' },
  'kozhikode-trader':  { body: '#2060a0', head: '#e0c060', detail: '#40a0e0' },
  'mumbai-captain':    { body: '#404060', head: '#c0c0c0', detail: '#606080' },
  'madurai-priestess': { body: '#c02060', head: '#e0c020', detail: '#e04080' },
  'jodhpur-warrior':   { body: '#c08040', head: '#604020', detail: '#e0a060' },
  'bhopal-alchemist':  { body: '#306030', head: '#a0a0a0', detail: '#408040' },
};

const PLAYER_COLORS = { body: '#30a030', head: '#2828a0', detail: '#3080e0' };

const EntityRenderer: React.FC<EntityRendererProps> = ({
  npcData,
  playerPos,
  playerDir,
  playerMoving,
  animFrame,
  cameraX,
  cameraY,
  useSprites = true,
}) => {
  const offsetX = cameraX - SCREEN_WIDTH / 2;
  const offsetY = cameraY - GAME_AREA_HEIGHT / 2;

  const entities: {
    id: string;
    screenX: number;
    screenY: number;
    name?: string;
    colors: typeof PLAYER_COLORS;
    flipX: boolean;
    zIndex: number;
    walkFrame: number;
    dir: Direction;
    spriteBase: [number, number] | null;
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
        colors: NPC_COLORS[npc.id] || DEFAULT_COLORS,
        flipX: npc.dir === 'left',
        zIndex: Math.floor(npc.py / SCALED_TILE),
        walkFrame: npc.animFrame,
        dir: npc.dir,
        spriteBase: NPC_SPRITES[npc.id] || null,
      });
    }
  }

  const psx = playerPos.x - offsetX;
  const psy = playerPos.y - offsetY;
  entities.push({
    id: 'player',
    screenX: psx,
    screenY: psy,
    colors: PLAYER_COLORS,
    flipX: playerDir === 'left',
    zIndex: Math.floor(playerPos.y / SCALED_TILE),
    walkFrame: playerMoving ? animFrame : 0,
    dir: playerDir,
    spriteBase: PLAYER_SPRITE,
  });

  entities.sort((a, b) => a.zIndex - b.zIndex);

  return (
    <View style={{ position: 'absolute', width: SCREEN_WIDTH, height: GAME_AREA_HEIGHT }} pointerEvents="none">
      {entities.map((entity) => {
        const spriteCoord = entity.spriteBase
          ? getCharSprite(entity.spriteBase, entity.dir, entity.walkFrame)
          : null;

        return (
          <View
            key={entity.id}
            style={{
              position: 'absolute',
              left: entity.screenX,
              top: entity.screenY,
              zIndex: entity.zIndex + 100,
              transform: entity.flipX ? [{ scaleX: -1 }] : [],
            }}
          >
            {useSprites && spriteCoord ? (
              <CharSprite col={spriteCoord[0]} row={spriteCoord[1]} size={SCALED_TILE} />
            ) : (
              <CharacterView
                bodyColor={entity.colors.body}
                headColor={entity.colors.head}
                detailColor={entity.colors.detail}
                size={SCALED_TILE}
                flipX={entity.flipX}
                walkFrame={entity.walkFrame}
              />
            )}
            {entity.name && (
              <View style={styles.nameTag}>
                <Text style={styles.nameText}>{entity.name}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  nameTag: {
    position: 'absolute',
    top: -14,
    left: -16,
    right: -16,
    alignItems: 'center',
  },
  nameText: {
    color: PALETTE.white,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: PALETTE.black,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});

export default memo(EntityRenderer);
