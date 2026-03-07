import React, { memo, useCallback, useRef } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { Direction } from '../types';
import { PALETTE } from '../engine/constants';

interface DPadProps {
  onDirectionChange: (dir: Direction | null) => void;
}

const DPAD_SIZE = 150;
const BTN_SIZE = 50;

const DPad: React.FC<DPadProps> = ({ onDirectionChange }) => {
  const currentDir = useRef<Direction | null>(null);
  const layoutRef = useRef({ x: 0, y: 0 });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    e.target.measureInWindow((x, y) => {
      layoutRef.current = { x, y };
    });
  }, []);

  const getDirection = useCallback((pageX: number, pageY: number): Direction | null => {
    // Convert page coordinates to local coordinates
    const x = pageX - layoutRef.current.x;
    const y = pageY - layoutRef.current.y;
    const centerX = DPAD_SIZE / 2;
    const centerY = DPAD_SIZE / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const deadZone = 12;

    if (Math.abs(dx) < deadZone && Math.abs(dy) < deadZone) return null;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const dir = getDirection(pageX, pageY);
        currentDir.current = dir;
        onDirectionChange(dir);
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const dir = getDirection(pageX, pageY);
        if (dir !== currentDir.current) {
          currentDir.current = dir;
          onDirectionChange(dir);
        }
      },
      onPanResponderRelease: () => {
        currentDir.current = null;
        onDirectionChange(null);
      },
      onPanResponderTerminate: () => {
        currentDir.current = null;
        onDirectionChange(null);
      },
    })
  ).current;

  return (
    <View style={styles.container} onLayout={onLayout} {...panResponder.panHandlers}>
      {/* All children are non-interactive so touches go to parent */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {/* Up */}
        <View style={[styles.btn, styles.up]}>
          <View style={[styles.arrowHead, { transform: [{ rotate: '0deg' }] }]} />
        </View>
        {/* Down */}
        <View style={[styles.btn, styles.down]}>
          <View style={[styles.arrowHead, { transform: [{ rotate: '180deg' }] }]} />
        </View>
        {/* Left */}
        <View style={[styles.btn, styles.left]}>
          <View style={[styles.arrowHead, { transform: [{ rotate: '270deg' }] }]} />
        </View>
        {/* Right */}
        <View style={[styles.btn, styles.right]}>
          <View style={[styles.arrowHead, { transform: [{ rotate: '90deg' }] }]} />
        </View>
        {/* Center */}
        <View style={styles.center} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: DPAD_SIZE,
    height: DPAD_SIZE,
    position: 'relative',
  },
  btn: {
    position: 'absolute',
    width: BTN_SIZE,
    height: BTN_SIZE,
    backgroundColor: PALETTE.darkGray,
    borderWidth: 2,
    borderColor: PALETTE.midGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  up: {
    left: BTN_SIZE,
    top: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  down: {
    left: BTN_SIZE,
    bottom: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  left: {
    left: 0,
    top: BTN_SIZE,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  right: {
    right: 0,
    top: BTN_SIZE,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  center: {
    position: 'absolute',
    left: BTN_SIZE,
    top: BTN_SIZE,
    width: BTN_SIZE,
    height: BTN_SIZE,
    backgroundColor: PALETTE.darkGray,
    borderWidth: 1,
    borderColor: PALETTE.midGray,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: PALETTE.lightGray,
  },
});

export default memo(DPad);
