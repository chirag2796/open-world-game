import React, { memo, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { TileMapData } from '../types';
import { PALETTE, SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/constants';
import { MINIMAP_COLORS } from '../data/india-map';

interface MiniMapProps {
  map: TileMapData;
  playerTileX: number;
  playerTileY: number;
}

// Small minimap constants
const MINI_SCALE = 0.5;
const MINI_W = 80;
const MINI_H = 100;
const SAMPLE = 2;

// Full map constants — fit the map into available screen space
const FULL_MARGIN = 40;
const FULL_W = SCREEN_WIDTH - FULL_MARGIN * 2;
const FULL_H = SCREEN_HEIGHT - FULL_MARGIN * 2 - 40; // 40 for header
const FULL_SAMPLE = 2;

const MiniMap: React.FC<MiniMapProps> = ({ map, playerTileX, playerTileY }) => {
  const [expanded, setExpanded] = useState(false);

  // Small minimap rows
  const miniRows = useMemo(() => {
    const result: React.JSX.Element[] = [];
    for (let y = 0; y < map.height; y += SAMPLE) {
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

  // Full map rows (higher res)
  const fullRows = useMemo(() => {
    if (!expanded) return [];
    const scaleX = FULL_W / (map.width / FULL_SAMPLE);
    const scaleY = FULL_H / (map.height / FULL_SAMPLE);
    const result: React.JSX.Element[] = [];
    for (let y = 0; y < map.height; y += FULL_SAMPLE) {
      let currentColor = '';
      let startX = 0;
      for (let x = 0; x <= map.width; x += FULL_SAMPLE) {
        const tile = x < map.width ? map.ground[y]?.[x] : -1;
        const color = tile >= 0 ? (MINIMAP_COLORS[tile as keyof typeof MINIMAP_COLORS] || '#000') : '';
        if (color !== currentColor) {
          if (currentColor) {
            result.push(
              <View
                key={`f${startX}-${y}`}
                style={{
                  position: 'absolute',
                  left: (startX / FULL_SAMPLE) * scaleX,
                  top: (y / FULL_SAMPLE) * scaleY,
                  width: ((x - startX) / FULL_SAMPLE) * scaleX,
                  height: scaleY,
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
  }, [map, expanded]);

  // Player dot for small minimap
  const dotX = (playerTileX / SAMPLE) * MINI_SCALE - 2;
  const dotY = (playerTileY / SAMPLE) * MINI_SCALE - 2;

  // Player dot for full map
  const fullScaleX = FULL_W / (map.width / FULL_SAMPLE);
  const fullScaleY = FULL_H / (map.height / FULL_SAMPLE);
  const fullDotX = (playerTileX / FULL_SAMPLE) * fullScaleX - 4;
  const fullDotY = (playerTileY / FULL_SAMPLE) * fullScaleY - 4;

  if (expanded) {
    return (
      <TouchableOpacity
        style={styles.fullOverlay}
        activeOpacity={1}
        onPress={() => setExpanded(false)}
      >
        <View style={styles.fullContainer}>
          <View style={styles.fullHeader}>
            <Text style={styles.fullTitle}>MAP OF INDIA</Text>
            <Text style={styles.fullHint}>Tap to close</Text>
          </View>
          <View style={styles.fullMapArea}>
            {fullRows}
            <View style={[styles.fullPlayerDot, { left: fullDotX, top: fullDotY }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setExpanded(true)}
      activeOpacity={0.8}
    >
      <View style={styles.mapArea}>
        {miniRows}
        <View style={[styles.playerDot, { left: dotX, top: dotY }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Small minimap
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
  // Full map overlay
  fullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullContainer: {
    width: FULL_W + 6,
    borderWidth: 3,
    borderColor: PALETTE.uiBorder,
    borderRadius: 8,
    backgroundColor: PALETTE.uiBg,
    overflow: 'hidden',
  },
  fullHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: PALETTE.uiDark,
    borderBottomWidth: 2,
    borderBottomColor: PALETTE.uiBorder,
  },
  fullTitle: {
    color: PALETTE.yellow,
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  fullHint: {
    color: PALETTE.midGray,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  fullMapArea: {
    width: FULL_W,
    height: FULL_H,
    backgroundColor: '#0a1a3a',
  },
  fullPlayerDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    backgroundColor: '#ff4444',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 10,
  },
});

export default memo(MiniMap);
