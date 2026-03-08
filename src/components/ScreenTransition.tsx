// Screen Transition — fade overlay for smooth transitions between screens
// Wrap around content that appears/disappears (battle, inventory, etc.)

import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../engine/constants';

interface ScreenTransitionProps {
  visible: boolean;
  duration?: number;
  children: React.ReactNode;
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({ visible, duration = 200, children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.97)).current;
  const mounted = useRef(false);
  const [show, setShow] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted.current) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration * 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.97,
          duration: duration * 0.7,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setShow(false);
      });
    }
    mounted.current = true;
  }, [visible]);

  if (!show) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 1000,
  },
});

export default memo(ScreenTransition);
