import React, { memo } from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';

interface SpriteProps {
  source: ImageSourcePropType;
  // Sprite sheet dimensions
  sheetWidth: number;
  sheetHeight: number;
  // Individual tile/frame size on the sheet
  frameWidth: number;
  frameHeight: number;
  // Margin between frames in the sheet
  margin?: number;
  // Which frame to display (column, row on the sheet)
  col: number;
  row: number;
  // Display size (rendered size)
  width: number;
  height: number;
}

// Renders a single frame from a sprite sheet using overflow:hidden + Image positioning
// This is the standard technique for sprite sheets in React Native
const Sprite: React.FC<SpriteProps> = memo(({
  source,
  sheetWidth,
  sheetHeight,
  frameWidth,
  frameHeight,
  margin = 0,
  col,
  row,
  width,
  height,
}) => {
  // Calculate the position of this frame on the sprite sheet
  const srcX = col * (frameWidth + margin);
  const srcY = row * (frameHeight + margin);

  // Scale factor from source frame to display size
  const scaleX = width / frameWidth;
  const scaleY = height / frameHeight;

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Image
        source={source}
        style={{
          position: 'absolute',
          width: sheetWidth * scaleX,
          height: sheetHeight * scaleY,
          left: -srcX * scaleX,
          top: -srcY * scaleY,
        }}
        // Disable smoothing for pixel art
        resizeMode="stretch"
      />
    </View>
  );
});

export default Sprite;

// Pre-computed sprite frame lookup for the Kenney tileset
// Sheet: 968x526, frame: 16x16, margin: 1px
export const TILESET = {
  source: require('../../assets/sprites/tileset.png'),
  sheetWidth: 968,
  sheetHeight: 526,
  frameWidth: 16,
  frameHeight: 16,
  margin: 1,
  cols: 57,
  rows: 31,
};

// Character sprite sheet
// Sheet: 918x203, frame: 16x16, margin: 1px
export const CHARSHEET = {
  source: require('../../assets/sprites/characters.png'),
  sheetWidth: 918,
  sheetHeight: 203,
  frameWidth: 16,
  frameHeight: 16,
  margin: 1,
  cols: 54,
  rows: 12,
};
