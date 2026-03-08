import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { VFXAnimDef } from '../engine/vfxSprites';

interface VFXSpriteProps {
  anim: VFXAnimDef | null;
  x: number;          // center x position on screen
  y: number;          // center y position on screen
  onComplete?: () => void;
}

// Renders an animated VFX sprite from a sprite sheet
// Plays through all frames in the animation row once, then calls onComplete
const VFXSprite: React.FC<VFXSpriteProps> = ({ anim, x, y, onComplete }) => {
  const [frame, setFrame] = useState(0);
  const [currentAnim, setCurrentAnim] = useState<VFXAnimDef | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!anim) {
      setCurrentAnim(null);
      return;
    }

    // Start new animation
    setCurrentAnim(anim);
    setFrame(0);
    opacity.setValue(1);
    scaleAnim.setValue(0.8);

    // Scale-in pop effect
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();

    const frameInterval = anim.duration / anim.frameCount;
    let currentFrame = 0;

    timerRef.current = setInterval(() => {
      currentFrame++;
      if (currentFrame >= anim.frameCount) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        // Fade out at end
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          setCurrentAnim(null);
          onComplete?.();
        });
      } else {
        setFrame(currentFrame);
      }
    }, frameInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [anim]);

  if (!currentAnim) return null;

  const { sheet, row, scale = 1.0 } = currentAnim;
  const renderSize = sheet.frameSize * scale;

  // Calculate source position on sprite sheet
  const srcX = frame * sheet.frameSize;
  const srcY = row * sheet.frameSize;

  // Scale factor from source frame to display size
  const displayScale = renderSize / sheet.frameSize;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x - renderSize / 2,
          top: y - renderSize / 2,
          width: renderSize,
          height: renderSize,
          opacity,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <Image
        source={sheet.source}
        style={{
          position: 'absolute',
          width: sheet.sheetWidth * displayScale,
          height: sheet.sheetHeight * displayScale,
          left: -srcX * displayScale,
          top: -srcY * displayScale,
        }}
        resizeMode="stretch"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 5000,
  },
});

export default memo(VFXSprite);
