import React, { memo, useMemo } from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';
import { TileType, TileMapData } from '../types';
import { SCALED_TILE, VIEWPORT_TILES_X, VIEWPORT_TILES_Y, GAME_AREA_HEIGHT, SCREEN_WIDTH } from '../engine/constants';

// ─── Decoration Sprite Assets ────────────────────────────────
type Sprite = { source: ImageSourcePropType; w: number; h: number };

// Trees — various sizes, rendered overflowing above their tile
const TREE_SPRITES: Sprite[] = [
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_1.png'), w: 64, h: 63 },
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_2.png'), w: 46, h: 63 },
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_3.png'), w: 52, h: 92 },
  { source: require('../../assets/sprites/decorations/trees/Tree_Emerald_4.png'), w: 48, h: 93 },
];
const PALM_TREE: Sprite = { source: require('../../assets/sprites/decorations/trees/Oak_Tree.png'), w: 64, h: 80 };

// Bushes — small decorations that fit within a tile
const BUSH_SPRITES: Sprite[] = [
  { source: require('../../assets/sprites/decorations/bushes/Bush_Emerald_1.png'), w: 40, h: 29 },
  { source: require('../../assets/sprites/decorations/bushes/Bush_Emerald_2.png'), w: 48, h: 16 },
  { source: require('../../assets/sprites/decorations/bushes/Bush_Emerald_3.png'), w: 28, h: 28 },
];

// Buildings — various styles for different biomes/structures
const HOUSE_HAY_SMALL: Sprite = { source: require('../../assets/sprites/decorations/buildings/House_Hay_1.png'), w: 89, h: 91 };
const HOUSE_HAY_LARGE: Sprite = { source: require('../../assets/sprites/decorations/buildings/House_Hay_2.png'), w: 157, h: 112 };
const HOUSE_HAY_3: Sprite = { source: require('../../assets/sprites/decorations/buildings/House_Hay_3.png'), w: 175, h: 128 };
const HOUSE_PURPLE: Sprite = { source: require('../../assets/sprites/decorations/buildings/House_Hay_4_Purple.png'), w: 128, h: 128 };
const HOUSE_BLUE: Sprite = { source: require('../../assets/sprites/decorations/buildings/House_1_Wood_Base_Blue.png'), w: 96, h: 128 };
const WELL_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/buildings/Well_Hay_1.png'), w: 56, h: 74 };
const GATE_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/buildings/CityWall_Gate_1.png'), w: 80, h: 96 };

// Rocks — for mountain, cliff, boulder decorations
const ROCK_SPRITES: Sprite[] = [
  { source: require('../../assets/sprites/decorations/rocks/Rock_Brown_1.png'), w: 22, h: 18 },
  { source: require('../../assets/sprites/decorations/rocks/Rock_Brown_2.png'), w: 16, h: 14 },
  { source: require('../../assets/sprites/decorations/rocks/Rock_Brown_4.png'), w: 32, h: 21 },
  { source: require('../../assets/sprites/decorations/rocks/Rock_Brown_6.png'), w: 16, h: 11 },
  { source: require('../../assets/sprites/decorations/rocks/Rock_Brown_9.png'), w: 46, h: 33 },
];

// Props
const SIGN_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Sign_1.png'), w: 24, h: 22 };
const CHOPPED_TREE: Sprite = { source: require('../../assets/sprites/decorations/props/Chopped_Tree_1.png'), w: 32, h: 22 };
const BARREL_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Barrel_Small_Empty.png'), w: 16, h: 20 };
const CRATE_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Crate_Medium_Closed.png'), w: 16, h: 21 };
const HAYSTACK_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/HayStack_2.png'), w: 29, h: 32 };
const LAMP_POST: Sprite = { source: require('../../assets/sprites/decorations/props/LampPost_3.png'), w: 46, h: 62 };
const BANNER_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Banner_Stick_1_Purple.png'), w: 24, h: 59 };
const BENCH_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Bench_1.png'), w: 14, h: 30 };
const FENCE_SPRITE: Sprite = { source: require('../../assets/sprites/decorations/props/Fences.png'), w: 64, h: 64 };

// ─── Helpers ──────────────────────────────────────────────────

function tileHash(x: number, y: number): number {
  return ((x * 7919 + y * 6271) & 0xffff) / 0xffff;
}

// Helper to create a building result with proper offset
function bldg(sprite: Sprite): { source: ImageSourcePropType; w: number; h: number; offsetY: number } {
  return { ...sprite, offsetY: -(sprite.h - SCALED_TILE) };
}

// Helper to create a ground-level prop result
function prop(sprite: Sprite, lift = 0): { source: ImageSourcePropType; w: number; h: number; offsetY: number } {
  return { ...sprite, offsetY: SCALED_TILE - sprite.h - lift };
}

// Deterministic pick from array using tile hash
function pickFrom<T>(arr: T[], hash: number): T {
  return arr[Math.floor(hash * arr.length) % arr.length];
}

// ─── Decoration Selection ──────────────────────────────────────

function getDecorationForTile(
  tileType: TileType,
  x: number,
  y: number,
): { source: ImageSourcePropType; w: number; h: number; offsetY: number } | null {
  const hash = tileHash(x, y);

  switch (tileType) {
    // ──── TREES ────
    case TileType.FOREST:
    case TileType.TREE_BANYAN: {
      return bldg(pickFrom(TREE_SPRITES, hash));
    }
    case TileType.DENSE_JUNGLE:
    case TileType.BAMBOO: {
      return bldg(TREE_SPRITES[Math.floor(hash * 2) % TREE_SPRITES.length]);
    }
    case TileType.TREE_PINE: {
      return bldg(hash > 0.5 ? TREE_SPRITES[2] : TREE_SPRITES[3]);
    }
    case TileType.TREE_PALM:
    case TileType.MANGROVE: {
      return bldg(PALM_TREE);
    }

    // ──── GRASS / GROUND ────
    case TileType.TALL_GRASS: {
      if (hash > 0.5) return null;
      return prop(pickFrom(BUSH_SPRITES, hash * 3), 4);
    }
    case TileType.FLOWERS: {
      if (hash > 0.55) return null;
      return prop(BUSH_SPRITES[2], 4);
    }
    case TileType.SWAMP: {
      if (hash > 0.3) return null;
      return prop(BUSH_SPRITES[1], 2);
    }
    case TileType.FARM: {
      if (hash > 0.4) return null;
      return prop(HAYSTACK_SPRITE);
    }
    case TileType.GARDEN:
    case TileType.CHARBAGH:
    case TileType.PIETRA_DURA: {
      if (hash > 0.5) return null;
      return prop(BUSH_SPRITES[0], 4);
    }

    // ──── DESERT / DRY ────
    case TileType.SAND_DUNES:
    case TileType.DRY_GRASS:
    case TileType.CRACKED_EARTH: {
      if (hash > 0.08) return null;
      return prop(pickFrom(ROCK_SPRITES, hash * 50), 2);
    }
    case TileType.CACTUS: {
      return prop(BUSH_SPRITES[0], 4);
    }
    case TileType.DESERT: {
      if (hash > 0.03) return null;
      return prop(pickFrom(ROCK_SPRITES, hash * 30), 2);
    }

    // ──── ROCKS / MOUNTAIN ────
    case TileType.ROCKY_PATH:
    case TileType.ROCKS:
    case TileType.BOULDER:
    case TileType.MOUNTAIN:
    case TileType.CLIFF: {
      const threshold = (tileType === TileType.MOUNTAIN || tileType === TileType.CLIFF) ? 0.15 : 0.3;
      if (hash > threshold) return null;
      return prop(pickFrom(ROCK_SPRITES, hash * 10), 2);
    }
    case TileType.FALLEN_LOG: {
      return prop(CHOPPED_TREE, 2);
    }

    // ──── VILLAGE HOUSES ────
    case TileType.HUT: {
      // Variety: small hay, blue, or hay_3 depending on position
      if (hash < 0.4) return bldg(HOUSE_HAY_SMALL);
      if (hash < 0.7) return bldg(HOUSE_BLUE);
      return bldg(HOUSE_HAY_3);
    }

    // ──── BUILDING WALLS ────
    case TileType.WALL_MUD: {
      // Sparse props along mud walls — barrels, crates, benches
      if (hash > 0.2) return null;
      if (hash < 0.08) return prop(BARREL_SPRITE);
      if (hash < 0.14) return prop(CRATE_SPRITE);
      return prop(BENCH_SPRITE);
    }
    case TileType.WALL_STONE: {
      // Sparse rocks along stone walls
      if (hash > 0.15) return null;
      return prop(pickFrom(ROCK_SPRITES, hash * 10), 2);
    }
    case TileType.DOOR: {
      // Doors get lamp posts on the sides
      if (hash > 0.3) return null;
      return bldg(LAMP_POST);
    }

    // ──── ROOFS / PALACE ────
    case TileType.ROOF: {
      if (hash > 0.25) return null;
      // Mix of building types for rooftop areas
      if (hash < 0.12) return bldg(HOUSE_HAY_LARGE);
      return bldg(HOUSE_HAY_3);
    }
    case TileType.PALACE: {
      if (hash > 0.2) return null;
      // Palaces get the large/ornate buildings
      return bldg(hash < 0.1 ? HOUSE_HAY_3 : HOUSE_PURPLE);
    }

    // ──── TEMPLES / RELIGIOUS ────
    case TileType.TEMPLE: {
      if (hash > 0.2) return null;
      // Temples: purple-roofed buildings (distinct from houses)
      return bldg(HOUSE_PURPLE);
    }
    case TileType.MOSQUE: {
      if (hash > 0.2) return null;
      // Mosques: purple or blue buildings (domed look)
      return bldg(hash < 0.1 ? HOUSE_PURPLE : HOUSE_BLUE);
    }
    case TileType.DOME: {
      if (hash > 0.15) return null;
      // Domes: purple building (closest to dome shape)
      return bldg(HOUSE_PURPLE);
    }

    // ──── FORTIFICATIONS ────
    case TileType.FORT_WALL: {
      if (hash > 0.12) return null;
      // Fort walls: sparse gates and rock details
      if (hash < 0.06) return bldg(GATE_SPRITE);
      return prop(pickFrom(ROCK_SPRITES, hash * 10), 2);
    }
    case TileType.MUGHAL_GATE: {
      // Gates always get the gate sprite
      return bldg(GATE_SPRITE);
    }
    case TileType.BORDER_POST: {
      // Border posts: banner + occasional gate
      if (hash < 0.5) return bldg(BANNER_SPRITE);
      return bldg(GATE_SPRITE);
    }

    // ──── INDO-SARACENIC ────
    case TileType.SANDSTONE: {
      // Sandstone areas: occasional rocks and barrels
      if (hash > 0.15) return null;
      if (hash < 0.08) return prop(pickFrom(ROCK_SPRITES, hash * 20), 2);
      return prop(BARREL_SPRITE);
    }
    case TileType.MARBLE: {
      // Marble areas: clean, sparse lamp posts
      if (hash > 0.1) return null;
      return bldg(LAMP_POST);
    }
    case TileType.ARCH: {
      // Arches get the gate sprite (stone archway)
      if (hash > 0.3) return null;
      return bldg(GATE_SPRITE);
    }
    case TileType.JALI: {
      // Jali (lattice screens): fence sprite works as lattice
      if (hash > 0.2) return null;
      return prop(FENCE_SPRITE);
    }
    case TileType.MINARET: {
      // Minarets: lamp post (tall tower-like structure)
      if (hash > 0.3) return null;
      return bldg(LAMP_POST);
    }
    case TileType.CHHATRI: {
      // Chhatri pavilions: small purple building or bench
      if (hash > 0.25) return null;
      if (hash < 0.12) return bldg(HOUSE_PURPLE);
      return prop(BENCH_SPRITE);
    }

    // ──── HAVELIS / RESIDENTIAL ────
    case TileType.HAVELI_WALL: {
      // Haveli walls: larger ornate buildings
      if (hash > 0.2) return null;
      if (hash < 0.1) return bldg(HOUSE_HAY_3);
      return bldg(HOUSE_BLUE);
    }
    case TileType.BAORI_WALL: {
      // Step-well walls: rocks and stone props
      if (hash > 0.2) return null;
      return prop(pickFrom(ROCK_SPRITES, hash * 10), 2);
    }
    case TileType.BAORI_WATER: {
      // Baori water: nothing (water surface)
      return null;
    }
    case TileType.COURTYARD: {
      // Courtyards: sparse benches and lamp posts
      if (hash > 0.15) return null;
      if (hash < 0.07) return prop(BENCH_SPRITE);
      return bldg(LAMP_POST);
    }

    // ──── MARKET / TRADE ────
    case TileType.MARKET: {
      // Markets: dense props — barrels, crates, sacks, signs
      if (hash < 0.25) return prop(BARREL_SPRITE);
      if (hash < 0.5) return prop(CRATE_SPRITE);
      if (hash < 0.65) return prop(HAYSTACK_SPRITE);
      if (hash < 0.75) return prop(SIGN_SPRITE);
      return null;
    }

    // ──── INFRASTRUCTURE ────
    case TileType.WELL: {
      return bldg(WELL_SPRITE);
    }
    case TileType.CAMPSITE: {
      if (hash < 0.08) return prop(SIGN_SPRITE);
      if (hash < 0.14) return prop(BARREL_SPRITE);
      return null;
    }
    case TileType.BRIDGE: {
      // Bridges: sparse fence/railing props
      if (hash > 0.15) return null;
      return prop(FENCE_SPRITE);
    }
    case TileType.RUINS: {
      // Ruins: scattered rocks and chopped trees
      if (hash > 0.3) return null;
      if (hash < 0.15) return prop(pickFrom(ROCK_SPRITES, hash * 10), 2);
      return prop(CHOPPED_TREE, 2);
    }
    case TileType.CANAL: {
      // Canals: nothing (water channel)
      return null;
    }
    case TileType.LOCKED_GATE: {
      // Locked gates always show the gate
      return bldg(GATE_SPRITE);
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
  const startTileY = Math.max(0, Math.floor(offsetY / SCALED_TILE) - 2);
  const endTileX = Math.min(map.width, startTileX + VIEWPORT_TILES_X + 2);
  const endTileY = Math.min(map.height, startTileY + VIEWPORT_TILES_Y + 3);

  const decorations = useMemo(() => {
    const result: React.JSX.Element[] = [];

    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const decorTile = map.decor?.[y]?.[x];
        const tileType: TileType | null = (decorTile != null && decorTile !== -1)
          ? decorTile
          : (map.ground?.[y]?.[x] ?? null);

        if (tileType === null) continue;

        const decor = getDecorationForTile(tileType, x, y);
        if (!decor) continue;

        const screenX = x * SCALED_TILE - offsetX;
        const screenY = y * SCALED_TILE - offsetY;

        const scale = (SCALED_TILE / 32);
        const renderW = decor.w * scale;
        const renderH = decor.h * scale;
        const renderOffsetY = decor.offsetY * scale;

        result.push(
          <View
            key={`dec-${x}-${y}`}
            style={{
              position: 'absolute',
              left: screenX + (SCALED_TILE - renderW) / 2,
              top: screenY + renderOffsetY,
              width: renderW,
              height: renderH,
              zIndex: y + 50,
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
