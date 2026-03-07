import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NPC, Position, Direction } from '../types';
import { SCALED_TILE, GAME_AREA_HEIGHT, SCREEN_WIDTH, PALETTE } from '../engine/constants';

interface EntityRendererProps {
  npcs: NPC[];
  playerPos: Position;
  playerDir: Direction;
  playerMoving: boolean;
  animFrame: number;
  cameraX: number;
  cameraY: number;
}

// Simple character rendering - body + head + detail, only ~6 views per character
const CharacterView: React.FC<{
  bodyColor: string;
  headColor: string;
  detailColor: string;
  size: number;
  name?: string;
  flipX: boolean;
  walkFrame: number;
}> = memo(({ bodyColor, headColor, detailColor, size, name, flipX, walkFrame }) => {
  const half = size / 2;
  const quarter = size / 4;
  const legOffset = walkFrame === 1 ? 3 : 0;

  return (
    <View style={{ width: size, height: size }}>
      {/* Head */}
      <View style={{
        position: 'absolute',
        left: quarter,
        top: 2,
        width: half,
        height: half - 2,
        backgroundColor: PALETTE.skin,
        borderRadius: 4,
      }} />
      {/* Hair/hat */}
      <View style={{
        position: 'absolute',
        left: quarter,
        top: 0,
        width: half,
        height: quarter,
        backgroundColor: detailColor,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
      }} />
      {/* Eyes */}
      <View style={{
        position: 'absolute',
        left: quarter + 4,
        top: quarter - 2,
        width: 4,
        height: 4,
        backgroundColor: PALETTE.black,
        borderRadius: 2,
      }} />
      <View style={{
        position: 'absolute',
        left: half + 4,
        top: quarter - 2,
        width: 4,
        height: 4,
        backgroundColor: PALETTE.black,
        borderRadius: 2,
      }} />
      {/* Body */}
      <View style={{
        position: 'absolute',
        left: quarter - 2,
        top: half,
        width: half + 4,
        height: half - 6,
        backgroundColor: bodyColor,
        borderRadius: 2,
      }} />
      {/* Belt/detail */}
      <View style={{
        position: 'absolute',
        left: quarter,
        top: half + quarter - 4,
        width: half,
        height: 4,
        backgroundColor: headColor,
      }} />
      {/* Left leg */}
      <View style={{
        position: 'absolute',
        left: quarter + 2,
        bottom: 0 + legOffset,
        width: 8,
        height: 10,
        backgroundColor: PALETTE.woodDark,
        borderRadius: 2,
      }} />
      {/* Right leg */}
      <View style={{
        position: 'absolute',
        right: quarter + 2,
        bottom: 0 - legOffset,
        width: 8,
        height: 10,
        backgroundColor: PALETTE.woodDark,
        borderRadius: 2,
      }} />
      {/* Name tag */}
      {name && (
        <View style={styles.nameTag}>
          <Text style={styles.nameText}>{name}</Text>
        </View>
      )}
    </View>
  );
});

// Character color configs
const NPC_COLORS: Record<string, { body: string; head: string; detail: string }> = {
  elder: { body: '#803030', head: '#e0c020', detail: '#a0a0a0' },
  merchant: { body: '#f0f0e0', head: '#208020', detail: '#e08020' },
  guard: { body: '#808080', head: '#606060', detail: '#808080' },
};

const PLAYER_COLORS = { body: '#30a030', head: '#2828a0', detail: '#3080e0' };

const EntityRenderer: React.FC<EntityRendererProps> = ({
  npcs,
  playerPos,
  playerDir,
  playerMoving,
  animFrame,
  cameraX,
  cameraY,
}) => {
  const offsetX = cameraX - SCREEN_WIDTH / 2;
  const offsetY = cameraY - GAME_AREA_HEIGHT / 2;

  const entities: { id: string; screenX: number; screenY: number; name?: string; colors: { body: string; head: string; detail: string }; flipX: boolean; zIndex: number; walkFrame: number }[] = [];

  for (const npc of npcs) {
    const sx = npc.position.x * SCALED_TILE - offsetX;
    const sy = npc.position.y * SCALED_TILE - offsetY;

    if (sx > -SCALED_TILE && sx < SCREEN_WIDTH + SCALED_TILE && sy > -SCALED_TILE && sy < GAME_AREA_HEIGHT + SCALED_TILE) {
      entities.push({
        id: npc.id,
        screenX: sx,
        screenY: sy,
        name: npc.name,
        colors: NPC_COLORS[npc.id] || NPC_COLORS.elder,
        flipX: npc.direction === 'left',
        zIndex: Math.floor(npc.position.y),
        walkFrame: 0,
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
  });

  entities.sort((a, b) => a.zIndex - b.zIndex);

  return (
    <View style={{ position: 'absolute', width: SCREEN_WIDTH, height: GAME_AREA_HEIGHT }} pointerEvents="none">
      {entities.map((entity) => (
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
          <CharacterView
            bodyColor={entity.colors.body}
            headColor={entity.colors.head}
            detailColor={entity.colors.detail}
            size={SCALED_TILE}
            name={entity.name}
            flipX={entity.flipX}
            walkFrame={entity.walkFrame}
          />
        </View>
      ))}
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
