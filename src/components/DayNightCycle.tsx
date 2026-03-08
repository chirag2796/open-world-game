import React, { memo, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { SCREEN_WIDTH, GAME_AREA_HEIGHT, PALETTE } from '../engine/constants';

// Day/night cycle: purely visual overlay
// 1 real second = 1 game minute → full 24h cycle = 24 real minutes
// Phases: dawn (5-7), day (7-18), dusk (18-20), night (20-5)

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

interface DayNightCycleProps {
  // External control: if provided, overrides internal clock
  gameMinutes?: number;
}

const CYCLE_SPEED = 1; // 1 real second = 1 game minute

function getTimeOfDay(minutes: number): TimeOfDay {
  const hours = Math.floor(minutes / 60) % 24;
  if (hours >= 5 && hours < 7) return 'dawn';
  if (hours >= 7 && hours < 18) return 'day';
  if (hours >= 18 && hours < 20) return 'dusk';
  return 'night';
}

function getOverlayColor(minutes: number): string {
  const hours = (minutes / 60) % 24;

  if (hours >= 7 && hours < 17) {
    // Full day — no overlay
    return 'rgba(0,0,0,0)';
  }
  if (hours >= 17 && hours < 18) {
    // Approaching dusk
    const t = hours - 17;
    return `rgba(255,140,30,${(t * 0.12).toFixed(2)})`;
  }
  if (hours >= 18 && hours < 19) {
    // Dusk
    const t = hours - 18;
    return `rgba(180,80,30,${(0.12 + t * 0.15).toFixed(2)})`;
  }
  if (hours >= 19 && hours < 20) {
    // Late dusk to night
    const t = hours - 19;
    return `rgba(20,20,60,${(0.15 + t * 0.25).toFixed(2)})`;
  }
  if (hours >= 20 || hours < 4) {
    // Night
    return 'rgba(10,10,40,0.40)';
  }
  if (hours >= 4 && hours < 5) {
    // Pre-dawn
    const t = hours - 4;
    return `rgba(10,10,40,${(0.40 - t * 0.15).toFixed(2)})`;
  }
  if (hours >= 5 && hours < 6) {
    // Dawn
    const t = hours - 5;
    return `rgba(255,180,80,${(0.25 - t * 0.15).toFixed(2)})`;
  }
  if (hours >= 6 && hours < 7) {
    // Late dawn
    const t = hours - 6;
    return `rgba(255,200,100,${(0.10 - t * 0.10).toFixed(2)})`;
  }
  return 'rgba(0,0,0,0)';
}

function getTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = Math.floor(minutes) % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

const DayNightCycle: React.FC<DayNightCycleProps> = ({ gameMinutes: externalMinutes }) => {
  const [internalMinutes, setInternalMinutes] = useState(8 * 60); // Start at 8 AM
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (externalMinutes !== undefined) return; // External control, skip internal timer
    intervalRef.current = setInterval(() => {
      setInternalMinutes(prev => (prev + CYCLE_SPEED) % (24 * 60));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [externalMinutes]);

  const minutes = externalMinutes ?? internalMinutes;
  const overlayColor = getOverlayColor(minutes);
  const timeStr = getTimeString(minutes);
  const timeOfDay = getTimeOfDay(minutes);

  // Stars at night
  const showStars = timeOfDay === 'night';

  return (
    <>
      {/* Overlay tint */}
      <View
        style={[styles.overlay, { backgroundColor: overlayColor }]}
        pointerEvents="none"
      />

      {/* Stars overlay during night — with twinkling */}
      {showStars && (
        <View style={styles.starsContainer} pointerEvents="none">
          {STAR_POSITIONS.map((star, i) => (
            <TwinklingStar key={i} star={star} />
          ))}
        </View>
      )}

      {/* Time display */}
      <View style={styles.timeContainer}>
        <Text style={[
          styles.timeText,
          timeOfDay === 'night' && styles.timeTextNight,
          timeOfDay === 'dawn' && styles.timeTextDawn,
          timeOfDay === 'dusk' && styles.timeTextDusk,
        ]}>
          {timeStr}
        </Text>
      </View>
    </>
  );
};

// Twinkling star component — uses Animated for gentle opacity pulse
const TwinklingStar: React.FC<{ star: { x: number; y: number; size: number; brightness: number; twinkleSpeed: number } }> = memo(({ star }) => {
  const opacity = useRef(new Animated.Value(star.brightness)).current;

  useEffect(() => {
    const twinkle = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: star.brightness * 0.3,
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: star.brightness,
          duration: star.twinkleSpeed,
          useNativeDriver: true,
        }),
      ])
    );
    // Stagger start
    const timer = setTimeout(() => twinkle.start(), star.twinkleSpeed * Math.random());
    return () => { clearTimeout(timer); twinkle.stop(); };
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          opacity,
        },
      ]}
    />
  );
});

// Pre-generated star positions — 45 stars with twinkling speeds
const STAR_POSITIONS = Array.from({ length: 45 }, (_, i) => ({
  x: ((i * 37 + 13) % SCREEN_WIDTH),
  y: ((i * 23 + 7) % (GAME_AREA_HEIGHT * 0.55)),
  size: 1 + (i % 3),
  brightness: 0.3 + (i % 5) * 0.15,
  twinkleSpeed: 1500 + (i % 7) * 500, // 1.5-5s per cycle
}));

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: GAME_AREA_HEIGHT,
    zIndex: 400,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: GAME_AREA_HEIGHT,
    zIndex: 399,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  timeContainer: {
    position: 'absolute',
    top: 6,
    right: 8,
    zIndex: 600,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 4,
  },
  timeText: {
    color: PALETTE.white,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  timeTextNight: {
    color: '#aabbdd',
  },
  timeTextDawn: {
    color: '#ffcc66',
  },
  timeTextDusk: {
    color: '#ff9944',
  },
});

export { getTimeOfDay, getTimeString };
export default memo(DayNightCycle);
