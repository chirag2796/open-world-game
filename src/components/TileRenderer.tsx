import React, { memo, useMemo } from 'react';
import { View, Image } from 'react-native';
import { TileMapData } from '../types';
import { SCALED_TILE, VIEWPORT_TILES_X, VIEWPORT_TILES_Y, GAME_AREA_HEIGHT, SCREEN_WIDTH, TILE_COLORS, TILE_DETAIL } from '../engine/constants';
import { TILESET } from '../engine/SpriteSheet';
import { getTileSprite } from '../engine/tileSprites';

interface TileRendererProps {
  map: TileMapData;
  cameraX: number;
  cameraY: number;
  useSprites?: boolean;
}

const DetailView: React.FC<{ type: string; color: string; size: number }> = memo(({ type, color, size }) => {
  const q = size / 4;
  switch (type) {
    case 'dots':
      return (
        <>
          <View style={{ position: 'absolute', left: q, top: q, width: q, height: q, backgroundColor: color, borderRadius: q / 2 }} />
          <View style={{ position: 'absolute', right: q, bottom: q, width: q, height: q, backgroundColor: color, borderRadius: q / 2 }} />
        </>
      );
    case 'stripe':
      return (
        <>
          <View style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 2, backgroundColor: color }} />
          <View style={{ position: 'absolute', left: 0, top: size / 2, right: 0, height: 2, backgroundColor: color }} />
        </>
      );
    case 'border':
      return (
        <View style={{ position: 'absolute', left: 2, top: 2, right: 2, bottom: 2, borderWidth: 2, borderColor: color, borderRadius: 2 }} />
      );
    case 'center':
      return (
        <View style={{ position: 'absolute', left: size / 4, top: size / 4, width: size / 2, height: size / 2, backgroundColor: color, borderRadius: 4 }} />
      );
    case 'triangle':
      return (
        <View style={{ position: 'absolute', left: size / 3, top: size / 6, width: 0, height: 0, borderLeftWidth: size / 6, borderRightWidth: size / 6, borderBottomWidth: size / 3, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
      );
    case 'cross':
      return (
        <>
          <View style={{ position: 'absolute', left: size / 2 - 1, top: q, width: 2, height: size / 2, backgroundColor: color }} />
          <View style={{ position: 'absolute', left: q, top: size / 2 - 1, width: size / 2, height: 2, backgroundColor: color }} />
        </>
      );
    default:
      return null;
  }
});

// Sprite tile: renders a frame from the tileset sprite sheet
const SpriteTile: React.FC<{ col: number; row: number; size: number }> = memo(({ col, row, size }) => {
  const srcX = col * (TILESET.frameWidth + TILESET.margin);
  const srcY = row * (TILESET.frameHeight + TILESET.margin);
  const scale = size / TILESET.frameWidth;

  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={TILESET.source}
        style={{
          position: 'absolute',
          width: TILESET.sheetWidth * scale,
          height: TILESET.sheetHeight * scale,
          left: -srcX * scale,
          top: -srcY * scale,
        }}
        resizeMode="stretch"
      />
    </View>
  );
});

const TileRenderer: React.FC<TileRendererProps> = ({ map, cameraX, cameraY, useSprites = true }) => {
  const offsetX = cameraX - SCREEN_WIDTH / 2;
  const offsetY = cameraY - GAME_AREA_HEIGHT / 2;

  const startTileX = Math.max(0, Math.floor(offsetX / SCALED_TILE) - 1);
  const startTileY = Math.max(0, Math.floor(offsetY / SCALED_TILE) - 1);
  const endTileX = Math.min(map.width, startTileX + VIEWPORT_TILES_X + 2);
  const endTileY = Math.min(map.height, startTileY + VIEWPORT_TILES_Y + 2);

  const tiles = useMemo(() => {
    const result: React.JSX.Element[] = [];

    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tile = map.ground[y]?.[x];
        if (tile === undefined) continue;

        const screenX = x * SCALED_TILE - offsetX;
        const screenY = y * SCALED_TILE - offsetY;

        if (useSprites) {
          const [col, row] = getTileSprite(tile, x, y, map);
          result.push(
            <View
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: screenX,
                top: screenY,
                width: SCALED_TILE,
                height: SCALED_TILE,
                // Keep color background as fallback while image loads
                backgroundColor: TILE_COLORS[tile] || '#ff00ff',
              }}
            >
              <SpriteTile col={col} row={row} size={SCALED_TILE} />
            </View>
          );
        } else {
          const detail = TILE_DETAIL[tile];
          result.push(
            <View
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: screenX,
                top: screenY,
                width: SCALED_TILE,
                height: SCALED_TILE,
                backgroundColor: TILE_COLORS[tile] || '#ff00ff',
              }}
            >
              {detail && <DetailView type={detail.type} color={detail.color} size={SCALED_TILE} />}
            </View>
          );
        }
      }
    }

    return result;
  }, [startTileX, startTileY, endTileX, endTileY, offsetX, offsetY, map, useSprites]);

  return (
    <View style={{ position: 'absolute', width: SCREEN_WIDTH, height: GAME_AREA_HEIGHT }}>
      {tiles}
    </View>
  );
};

export default memo(TileRenderer);
