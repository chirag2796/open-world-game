import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { TileMapData } from '../types';
import { SCALED_TILE, VIEWPORT_TILES_X, VIEWPORT_TILES_Y, GAME_AREA_HEIGHT, SCREEN_WIDTH, TILE_COLORS, TILE_DETAIL } from '../engine/constants';

interface TileRendererProps {
  map: TileMapData;
  cameraX: number;
  cameraY: number;
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
    default:
      return null;
  }
});

const TileRenderer: React.FC<TileRendererProps> = ({ map, cameraX, cameraY }) => {
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

    return result;
  }, [startTileX, startTileY, endTileX, endTileY, offsetX, offsetY, map]);

  return (
    <View style={{ position: 'absolute', width: SCREEN_WIDTH, height: GAME_AREA_HEIGHT }}>
      {tiles}
    </View>
  );
};

export default memo(TileRenderer);
