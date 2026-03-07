import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { TileMapData, TileType } from '../types';
import { SCALED_TILE, VIEWPORT_TILES_X, VIEWPORT_TILES_Y, GAME_AREA_HEIGHT, SCREEN_WIDTH, PALETTE } from '../engine/constants';

interface TileRendererProps {
  map: TileMapData;
  cameraX: number;
  cameraY: number;
}

// Fast: one solid color per tile type instead of per-pixel rendering
const TILE_COLORS: Record<TileType, string> = {
  [TileType.GRASS]: PALETTE.grass,
  [TileType.PATH]: PALETTE.path,
  [TileType.WATER]: PALETTE.water,
  [TileType.WALL_STONE]: PALETTE.stone,
  [TileType.WALL_WOOD]: PALETTE.wood,
  [TileType.DOOR]: PALETTE.woodLight,
  [TileType.TREE]: PALETTE.treeLeaf,
  [TileType.FLOWER_RED]: PALETTE.grass,
  [TileType.FLOWER_YELLOW]: PALETTE.grass,
  [TileType.BRIDGE]: PALETTE.woodLight,
  [TileType.ROOF]: PALETTE.roofRed,
  [TileType.FENCE]: PALETTE.grass,
  [TileType.SIGN]: PALETTE.grass,
  [TileType.WELL]: PALETTE.grass,
  [TileType.CHEST]: PALETTE.grass,
};

// Simple detail overlay - at most 2 extra views per tile
const TILE_DETAIL: Partial<Record<TileType, { color: string; type: 'dots' | 'stripe' | 'border' | 'center' }>> = {
  [TileType.GRASS]: { color: PALETTE.grassLight, type: 'dots' },
  [TileType.PATH]: { color: PALETTE.pathDark, type: 'dots' },
  [TileType.WATER]: { color: PALETTE.waterLight, type: 'dots' },
  [TileType.WALL_STONE]: { color: PALETTE.stoneDark, type: 'stripe' },
  [TileType.WALL_WOOD]: { color: PALETTE.woodDark, type: 'stripe' },
  [TileType.TREE]: { color: PALETTE.treeTrunk, type: 'center' },
  [TileType.FLOWER_RED]: { color: PALETTE.red, type: 'dots' },
  [TileType.FLOWER_YELLOW]: { color: PALETTE.yellow, type: 'dots' },
  [TileType.ROOF]: { color: PALETTE.roofRedLight, type: 'stripe' },
  [TileType.DOOR]: { color: PALETTE.woodDark, type: 'border' },
  [TileType.FENCE]: { color: PALETTE.woodDark, type: 'stripe' },
  [TileType.BRIDGE]: { color: PALETTE.woodDark, type: 'stripe' },
  [TileType.SIGN]: { color: PALETTE.woodLight, type: 'center' },
  [TileType.WELL]: { color: PALETTE.stone, type: 'center' },
  [TileType.CHEST]: { color: PALETTE.wood, type: 'center' },
};

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
        const groundTile = map.layers.ground[y]?.[x];
        if (groundTile === undefined) continue;

        const screenX = x * SCALED_TILE - offsetX;
        const screenY = y * SCALED_TILE - offsetY;
        const detail = TILE_DETAIL[groundTile];

        result.push(
          <View
            key={`g-${x}-${y}`}
            style={{
              position: 'absolute',
              left: screenX,
              top: screenY,
              width: SCALED_TILE,
              height: SCALED_TILE,
              backgroundColor: TILE_COLORS[groundTile],
            }}
          >
            {detail && <DetailView type={detail.type} color={detail.color} size={SCALED_TILE} />}
          </View>
        );

        const objTile = map.layers.objects[y]?.[x];
        if (objTile !== null && objTile !== undefined) {
          const objDetail = TILE_DETAIL[objTile];
          result.push(
            <View
              key={`o-${x}-${y}`}
              style={{
                position: 'absolute',
                left: screenX,
                top: screenY,
                width: SCALED_TILE,
                height: SCALED_TILE,
                backgroundColor: TILE_COLORS[objTile],
                zIndex: y + 1,
              }}
            >
              {objDetail && <DetailView type={objDetail.type} color={objDetail.color} size={SCALED_TILE} />}
            </View>
          );
        }
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
