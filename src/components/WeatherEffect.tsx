import React, { memo, useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { SCREEN_WIDTH, GAME_AREA_HEIGHT } from '../engine/constants';

export type WeatherType = 'clear' | 'rain' | 'snow' | 'dust' | 'fog';

interface WeatherDrop {
  id: number;
  x: number;
  y: Animated.Value;
  opacity: Animated.Value;
  speed: number;
  size: number;
  drift: number;
}

interface WeatherEffectProps {
  weather: WeatherType;
}

const DROP_COUNT: Record<WeatherType, number> = {
  clear: 0,
  rain: 40,
  snow: 25,
  dust: 20,
  fog: 0,
};

let nextDropId = 0;

function createDrop(weather: WeatherType): WeatherDrop {
  const isSnow = weather === 'snow';
  const isDust = weather === 'dust';

  return {
    id: nextDropId++,
    x: Math.random() * SCREEN_WIDTH,
    y: new Animated.Value(-20),
    opacity: new Animated.Value(isDust ? 0.4 : isSnow ? 0.8 : 0.6),
    speed: isSnow ? 3000 + Math.random() * 4000 : isDust ? 2000 + Math.random() * 3000 : 800 + Math.random() * 600,
    size: isSnow ? 3 + Math.random() * 4 : isDust ? 2 + Math.random() * 3 : 1.5,
    drift: isSnow ? (Math.random() - 0.5) * 40 : isDust ? 30 + Math.random() * 20 : Math.random() * 8,
  };
}

// Animated fog with breathing opacity pulse
const FogOverlay: React.FC = memo(() => {
  const fog1 = useRef(new Animated.Value(0.2)).current;
  const fog2 = useRef(new Animated.Value(0.12)).current;

  useEffect(() => {
    const a1 = Animated.loop(Animated.sequence([
      Animated.timing(fog1, { toValue: 0.3, duration: 4000, useNativeDriver: true }),
      Animated.timing(fog1, { toValue: 0.18, duration: 3500, useNativeDriver: true }),
    ]));
    const a2 = Animated.loop(Animated.sequence([
      Animated.timing(fog2, { toValue: 0.2, duration: 5000, useNativeDriver: true }),
      Animated.timing(fog2, { toValue: 0.1, duration: 4000, useNativeDriver: true }),
    ]));
    a1.start();
    a2.start();
    return () => { a1.stop(); a2.stop(); };
  }, []);

  return (
    <View style={styles.fogOverlay} pointerEvents="none">
      <Animated.View style={[styles.fogLayer1, { opacity: fog1 }]} />
      <Animated.View style={[styles.fogLayer2, { opacity: fog2 }]} />
    </View>
  );
});

const WeatherEffect: React.FC<WeatherEffectProps> = ({ weather }) => {
  const [drops, setDrops] = useState<WeatherDrop[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Cleanup previous
    animationsRef.current.forEach(a => a.stop());
    animationsRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (weather === 'clear' || weather === 'fog') {
      setDrops([]);
      return;
    }

    const count = DROP_COUNT[weather];
    const newDrops: WeatherDrop[] = [];
    for (let i = 0; i < count; i++) {
      const drop = createDrop(weather);
      // Stagger initial positions
      drop.y.setValue(-20 - Math.random() * GAME_AREA_HEIGHT);
      newDrops.push(drop);
    }
    setDrops(newDrops);

    // Animate each drop in a loop
    const startAnimation = (drop: WeatherDrop) => {
      drop.y.setValue(-20);
      const anim = Animated.timing(drop.y, {
        toValue: GAME_AREA_HEIGHT + 20,
        duration: drop.speed,
        useNativeDriver: true,
      });
      anim.start(() => startAnimation(drop));
      animationsRef.current.push(anim);
    };

    // Start with staggered delays
    newDrops.forEach((drop, i) => {
      setTimeout(() => startAnimation(drop), (i / count) * drop.speed);
    });

    return () => {
      animationsRef.current.forEach(a => a.stop());
      animationsRef.current = [];
    };
  }, [weather]);

  if (weather === 'clear') return null;

  // Fog overlay with breathing pulse
  if (weather === 'fog') {
    return <FogOverlay />;
  }

  const isSnow = weather === 'snow';
  const isDust = weather === 'dust';

  return (
    <View style={styles.container} pointerEvents="none">
      {drops.map(drop => (
        <Animated.View
          key={drop.id}
          style={[
            isSnow ? styles.snowflake : isDust ? styles.dustParticle : styles.raindrop,
            {
              left: drop.x,
              width: drop.size,
              height: isSnow ? drop.size : isDust ? drop.size : drop.size * 8,
              borderRadius: isSnow ? drop.size / 2 : isDust ? drop.size / 2 : 1,
              opacity: drop.opacity,
              transform: [
                { translateY: drop.y as unknown as number },
                { translateX: drop.drift },
                { rotate: isDust ? '20deg' : isSnow ? '0deg' : '10deg' },
              ],
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
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: GAME_AREA_HEIGHT,
    overflow: 'hidden',
    zIndex: 500,
  },
  raindrop: {
    position: 'absolute',
    backgroundColor: 'rgba(150,180,255,0.5)',
  },
  snowflake: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  dustParticle: {
    position: 'absolute',
    backgroundColor: 'rgba(200,170,100,0.5)',
  },
  fogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: GAME_AREA_HEIGHT,
    zIndex: 500,
  },
  fogLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(200,210,220)',
  },
  fogLayer2: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(190,200,215)',
  },
});

export default memo(WeatherEffect);
