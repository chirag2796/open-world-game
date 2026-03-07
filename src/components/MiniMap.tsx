import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { TileMapData } from '../types';
import { PALETTE } from '../engine/constants';
import { MINIMAP_COLORS } from '../data/india-map';

interface MiniMapProps {
  map: TileMapData;
  playerTileX: number;
  playerTileY: number;
}

// Render a tiny overview map. Each pixel = 2x2 tiles.
// Map is 160x200 tiles → minimap is 80x100. We scale that to fit ~80x100 pts.
const MINI_SCALE = 0.5; // each tile = 0.5 pts
const MINI_W = 80;
const MINI_H = 100;
const SAMPLE = 2; // sample every N tiles

const MiniMap: React.FC<MiniMapProps> = ({ map, playerTileX, playerTileY }) => {
  // Pre-render minimap as colored rows (one View per row segment)
  const rows = useMemo(() => {
    const result: React.JSX.Element[] = [];
    for (let y = 0; y < map.height; y += SAMPLE) {
      // Group consecutive same-color tiles
      let currentColor = '';
      let startX = 0;

      for (let x = 0; x <= map.width; x += SAMPLE) {
        const tile = x < map.width ? map.ground[y]?.[x] : -1;
        const color = tile >= 0 ? (MINIMAP_COLORS[tile as keyof typeof MINIMAP_COLORS] || '#000') : '';

        if (color !== currentColor) {
          if (currentColor) {
            result.push(
              <View
                key={`${startX}-${y}`}
                style={{
                  position: 'absolute',
                  left: (startX / SAMPLE) * MINI_SCALE,
                  top: (y / SAMPLE) * MINI_SCALE,
                  width: ((x - startX) / SAMPLE) * MINI_SCALE,
                  height: MINI_SCALE,
                  backgroundColor: currentColor,
                }}
              />
            );
          }
          currentColor = color;
          startX = x;
        }
      }
    }
    return result;
  }, [map]);

  // Player dot position on minimap
  const dotX = (playerTileX / SAMPLE) * MINI_SCALE - 2;
  const dotY = (playerTileY / SAMPLE) * MINI_SCALE - 2;

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        {rows}
        {/* Player dot */}
        <View style={[styles.playerDot, { left: dotX, top: dotY }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 2,
    borderColor: PALETTE.uiBorder,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 2,
  },
  mapArea: {
    width: MINI_W * MINI_SCALE,
    height: MINI_H * MINI_SCALE,
  },
  playerDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    backgroundColor: '#ff4444',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
});

export default memo(MiniMap);
