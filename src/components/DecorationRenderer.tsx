import React, { memo, useMemo } from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';
import { TileType, TileMapData } from '../types';
import { SCALED_TILE, VIEWPORT_TILES_X, VIEWPORT_TILES_Y, GAME_AREA_HEIGHT, SCREEN_WIDTH } from '../engine/constants';

// ─── Decoration Sprite Assets ────────────────────────────────

// Trees — various sizes, rendered overflowing above their tile
const TREE_SPRITES: { source: ImageSourcePropType; w: number; h: number }[] = [
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_1.png'), w: 64, h: 63 },
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_2.png'), w: 46, h: 63 },
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_3.png'), w: 52, h: 92 },
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_4.png'), w: 48, h: 93 },
];

const PALM_TREE = { source: require('../../assets/sprites/decorations/trees/Oak_Tree.png'), w: 64, h: 80 };

// Bushes — small decorations that fit within a tile
const BUSH_SPRITES: { source: ImageSourcePropType; w: number; h: number }[] = [
  { source: require('../../assets/sprites/decorations/bushes/Bush_Emerald_1.png'), w: 40, h: 29 },
  { source: require('../../assets/sprites/decorations/bushes/Bush_Emerald_2.png'), w: 48, h: 16 },
  { source: require('../../assets/sprites/decorations/bushes/Bush_Emerald_3.png'), w: 28, h: 28 },
];

// Buildings
const HOUSE_SPRITES: { source: ImageSourcePropType; w: number; h: number }[] = [
  { source: require('../../assets/sprites/decorations/buildings/House_Hay_1.png'), w: 89, h: 91 },
  { source: require('../../assets/sprites/decorations/buildings/House_Hay_2.png'), w: 157, h: 112 },
];
const WELL_SPRITE = { source: require('../../assets/sprites/decorations/buildings/Well_Hay_1.png'), w: 56, h: 74 };
const GATE_SPRITE = { source: require('../../assets/sprites/decorations/buildings/CityWall_Gate_1.png'), w: 80, h: 96 };

// Props
const SIGN_SPRITE = { source: require('../../assets/sprites/decorations/props/Sign_1.png'), w: 24, h: 22 };
const BARREL_SPRITE = { source: require('../../assets/sprites/decorations/props/Barrel_Small_Empty.png'), w: 16, h: 20 };
const CRATE_SPRITE = { source: require('../../assets/sprites/decorations/props/Crate_Medium_Closed.png'), w: 16, h: 21 };
const HAYSTACK_SPRITE = { source: require('../../assets/sprites/decorations/props/HayStack_2.png'), w: 29, h: 32 };

// Deterministic pseudo-random from tile position
function tileHash(x: number, y: number): number {
  return ((x * 7919 + y * 6271) & 0xffff) / 0xffff;
}

// Map tile types to decoration sprites
function getDecorationForTile(
  tileType: TileType,
  x: number,
  y: number,
): { source: ImageSourcePropType; w: number; h: number; offsetY: number } | null {
  const hash = tileHash(x, y);

  switch (tileType) {
    case TileType.FOREST:
    case TileType.DENSE_JUNGLE:
    case TileType.TREE_BANYAN: {
      const idx = Math.floor(hash * TREE_SPRITES.length);
      const tree = TREE_SPRITES[idx];
      return { ...tree, offsetY: -(tree.h - SCALED_TILE) }; // overflow upward
    }
    case TileType.TREE_PINE: {
      // Tall narrow trees
      const tree = hash > 0.5 ? TREE_SPRITES[2] : TREE_SPRITES[3];
      return { ...tree, offsetY: -(tree.h - SCALED_TILE) };
    }
    case TileType.TREE_PALM: {
      return { ...PALM_TREE, offsetY: -(PALM_TREE.h - SCALED_TILE) };
    }
    case TileType.TALL_GRASS:
    case TileType.FLOWERS: {
      if (hash > 0.6) return null; // not every tile gets a bush
      const idx = Math.floor(hash * 3 * BUSH_SPRITES.length) % BUSH_SPRITES.length;
      const bush = BUSH_SPRITES[idx];
      return { ...bush, offsetY: SCALED_TILE - bush.h - 4 }; // sit on ground
    }
    case TileType.HUT: {
      const house = HOUSE_SPRITES[0];
      return { ...house, offsetY: -(house.h - SCALED_TILE) };
    }
    case TileType.ROOF:
    case TileType.PALACE: {
      if (hash > 0.3) return null; // only some roof tiles get a house
      const house = HOUSE_SPRITES[1];
      return { ...house, offsetY: -(house.h - SCALED_TILE) };
    }
    case TileType.WELL: {
      return { ...WELL_SPRITE, offsetY: -(WELL_SPRITE.h - SCALED_TILE) };
    }
    case TileType.FORT_WALL:
    case TileType.MUGHAL_GATE: {
      if (hash > 0.15) return null; // sparse gates
      return { ...GATE_SPRITE, offsetY: -(GATE_SPRITE.h - SCALED_TILE) };
    }
    case TileType.MARKET: {
      if (hash > 0.5) {
        return { ...BARREL_SPRITE, offsetY: SCALED_TILE - BARREL_SPRITE.h };
      }
      return { ...CRATE_SPRITE, offsetY: SCALED_TILE - CRATE_SPRITE.h };
    }
    case TileType.FARM: {
      if (hash > 0.4) return null;
      return { ...HAYSTACK_SPRITE, offsetY: SCALED_TILE - HAYSTACK_SPRITE.h };
    }
    case TileType.CAMPSITE: {
      return { ...SIGN_SPRITE, offsetY: SCALED_TILE - SIGN_SPRITE.h };
    }
    default:
      return null;
  }
}

// ─── Decoration Renderer ─────────────────────────────────────

interface DecorationRendererProps {
  map: TileMapData;
  cameraX: number;
  cameraY: number;
}

const DecorationRenderer: React.FC<DecorationRendererProps> = ({ map, cameraX, cameraY }) => {
  const offsetX = cameraX - SCREEN_WIDTH / 2;
  const offsetY = cameraY - GAME_AREA_HEIGHT / 2;

  const startTileX = Math.max(0, Math.floor(offsetX / SCALED_TILE) - 1);
  const startTileY = Math.max(0, Math.floor(offsetY / SCALED_TILE) - 2); // extra row for tall decorations
  const endTileX = Math.min(map.width, startTileX + VIEWPORT_TILES_X + 2);
  const endTileY = Math.min(map.height, startTileY + VIEWPORT_TILES_Y + 3);

  const decorations = useMemo(() => {
    const result: React.JSX.Element[] = [];

    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        // Check both ground and decor layers for decoration candidates
        const decorTile = map.decor?.[y]?.[x];
        const tileType = (decorTile != null && decorTile !== -1) ? decorTile : null;

        if (tileType === null) continue;

        const decor = getDecorationForTile(tileType, x, y);
        if (!decor) continue;

        const screenX = x * SCALED_TILE - offsetX;
        const screenY = y * SCALED_TILE - offsetY;

        // Scale decoration to fit proportionally with tile size
        const scale = (SCALED_TILE / 32); // normalize to ~32px base
        const renderW = decor.w * scale;
        const renderH = decor.h * scale;
        const renderOffsetY = decor.offsetY * scale;

        result.push(
          <View
            key={`dec-${x}-${y}`}
            style={{
              position: 'absolute',
              left: screenX + (SCALED_TILE - renderW) / 2, // center horizontally
              top: screenY + renderOffsetY,
              width: renderW,
              height: renderH,
              zIndex: y + 50, // sort by Y for depth
            }}
          >
            <Image
              source={decor.source}
              style={{ width: renderW, height: renderH }}
              resizeMode="contain"
            />
          </View>
        );
      }
    }

    return result;
  }, [startTileX, startTileY, endTileX, endTileY, offsetX, offsetY, map]);

  return (
    <View
      style={{ position: 'absolute', width: SCREEN_WIDTH, height: GAME_AREA_HEIGHT }}
      pointerEvents="none"
    >
      {decorations}
    </View>
  );
};

export default memo(DecorationRenderer);
