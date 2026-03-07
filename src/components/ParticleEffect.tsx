import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export type ParticleType = 'slash' | 'spark' | 'heal' | 'defend' | 'hit' | 'levelup';

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'star';
}

interface ParticleEffectProps {
  type: ParticleType | null;
  x: number;
  y: number;
  onComplete?: () => void;
}

const CONFIGS: Record<ParticleType, {
  count: number;
  colors: string[];
  size: [number, number];
  spread: number;
  duration: number;
  shape: 'circle' | 'square' | 'star';
  gravity: number;
}> = {
  slash: {
    count: 8,
    colors: ['#ffffff', '#ffdd44', '#ff8844'],
    size: [4, 10],
    spread: 60,
    duration: 400,
    shape: 'square',
    gravity: 0,
  },
  spark: {
    count: 12,
    colors: ['#ffff00', '#ffaa00', '#ff6600', '#ffffff'],
    size: [3, 7],
    spread: 50,
    duration: 500,
    shape: 'circle',
    gravity: 20,
  },
  heal: {
    count: 10,
    colors: ['#44ff44', '#88ff88', '#44ffaa', '#ffffff'],
    size: [5, 9],
    spread: 40,
    duration: 800,
    shape: 'circle',
    gravity: -30,
  },
  defend: {
    count: 6,
    colors: ['#4488ff', '#88aaff', '#aaccff'],
    size: [6, 12],
    spread: 35,
    duration: 500,
    shape: 'square',
    gravity: 0,
  },
  hit: {
    count: 15,
    colors: ['#ff0000', '#ff4444', '#ff8800', '#ffcc00'],
    size: [3, 8],
    spread: 70,
    duration: 450,
    shape: 'circle',
    gravity: 30,
  },
  levelup: {
    count: 20,
    colors: ['#ffdd00', '#ffff44', '#ffffff', '#44ddff'],
    size: [4, 8],
    spread: 80,
    duration: 1000,
    shape: 'star',
    gravity: -20,
  },
};

let nextId = 0;

const ParticleEffect: React.FC<ParticleEffectProps> = ({ type, x, y, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const triggerRef = useRef(type);

  useEffect(() => {
    if (!type || type === triggerRef.current) {
      if (!type) triggerRef.current = null;
      return;
    }
    triggerRef.current = type;

    const config = CONFIGS[type];
    const newParticles: Particle[] = [];

    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 * i) / config.count + (Math.random() - 0.5) * 0.5;
      const dist = config.spread * (0.3 + Math.random() * 0.7);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist + config.gravity;
      const size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);

      const px = new Animated.Value(0);
      const py = new Animated.Value(0);
      const opacity = new Animated.Value(1);
      const scale = new Animated.Value(0.5);

      newParticles.push({
        id: nextId++,
        x: px,
        y: py,
        opacity,
        scale,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size,
        shape: config.shape,
      });

      const duration = config.duration * (0.6 + Math.random() * 0.4);

      Animated.parallel([
        Animated.timing(px, { toValue: dx, duration, useNativeDriver: true }),
        Animated.timing(py, { toValue: dy, duration, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.2, duration: duration * 0.2, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0, duration: duration * 0.8, useNativeDriver: true }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration, useNativeDriver: true }),
      ]).start();
    }

    setParticles(newParticles);
    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, config.duration + 100);

    return () => clearTimeout(timer);
  }, [type]);

  if (particles.length === 0) return null;

  return (
    <View style={[styles.container, { left: x, top: y }]} pointerEvents="none">
      {particles.map(p => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? p.size / 2 : p.shape === 'star' ? p.size / 4 : 2,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
                { rotate: p.shape === 'star' ? '45deg' : '0deg' },
              ],
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 5000,
  },
  particle: {
    position: 'absolute',
  },
});

export default memo(ParticleEffect);
