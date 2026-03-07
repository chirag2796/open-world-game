import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { PixelGrid } from '../types';
import { SCALE } from '../engine/constants';

interface PixelSpriteProps {
  sprite: PixelGrid;
  scale?: number;
  style?: any;
}

// Renders a pixel grid as native Views
// Optimized: groups consecutive same-color pixels in each row into single views
const PixelSprite: React.FC<PixelSpriteProps> = ({ sprite, scale = SCALE, style }) => {
  const pixelSize = scale;

  const rows = useMemo(() => {
    return sprite.map((row, y) => {
      // Group consecutive same-color pixels
      const segments: { color: string; startX: number; width: number }[] = [];
      let currentColor: string | null = null;
      let startX = 0;
      let width = 0;

      for (let x = 0; x <= row.length; x++) {
        const color = x < row.length ? row[x] : null;
        if (color === currentColor) {
          width++;
        } else {
          if (currentColor) {
            segments.push({ color: currentColor, startX, width });
          }
          currentColor = color;
          startX = x;
          width = 1;
        }
      }

      return { y, segments };
    });
  }, [sprite]);

  return (
    <View style={[{ width: sprite[0].length * pixelSize, height: sprite.length * pixelSize }, style]}>
      {rows.map(({ y, segments }) =>
        segments.map((seg, i) => (
          <View
            key={`${y}-${i}`}
            style={{
              position: 'absolute',
              left: seg.startX * pixelSize,
              top: y * pixelSize,
              width: seg.width * pixelSize,
              height: pixelSize,
              backgroundColor: seg.color,
            }}
          />
        ))
      )}
    </View>
  );
};

export default memo(PixelSprite);
