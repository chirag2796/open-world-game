import { useState, useEffect, useRef } from 'react';
import { BiomeType } from '../types';
import { WeatherType } from '../components/WeatherEffect';

// Weather changes every 2-5 minutes based on biome
const WEATHER_CHANGE_MIN = 120000; // 2 min
const WEATHER_CHANGE_MAX = 300000; // 5 min

const BIOME_WEATHER: Record<BiomeType, { type: WeatherType; chance: number }[]> = {
  ocean:        [{ type: 'rain', chance: 0.3 }, { type: 'fog', chance: 0.15 }],
  snow:         [{ type: 'snow', chance: 0.5 }, { type: 'fog', chance: 0.1 }],
  mountain:     [{ type: 'snow', chance: 0.2 }, { type: 'fog', chance: 0.2 }],
  desert:       [{ type: 'dust', chance: 0.35 }],
  plains:       [{ type: 'rain', chance: 0.15 }],
  forest:       [{ type: 'rain', chance: 0.2 }, { type: 'fog', chance: 0.1 }],
  dense_forest: [{ type: 'rain', chance: 0.25 }, { type: 'fog', chance: 0.15 }],
  plateau:      [{ type: 'dust', chance: 0.15 }, { type: 'fog', chance: 0.1 }],
  wetland:      [{ type: 'rain', chance: 0.35 }, { type: 'fog', chance: 0.2 }],
  coastal:      [{ type: 'rain', chance: 0.2 }, { type: 'fog', chance: 0.1 }],
};

function rollWeather(biome: BiomeType): WeatherType {
  const options = BIOME_WEATHER[biome] || [];
  for (const opt of options) {
    if (Math.random() < opt.chance) return opt.type;
  }
  return 'clear';
}

export function useWeather(biome: BiomeType) {
  const [weather, setWeather] = useState<WeatherType>('clear');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scheduleChange = () => {
      const delay = WEATHER_CHANGE_MIN + Math.random() * (WEATHER_CHANGE_MAX - WEATHER_CHANGE_MIN);
      timerRef.current = setTimeout(() => {
        setWeather(rollWeather(biome));
        scheduleChange();
      }, delay);
    };

    // Initial weather roll
    setWeather(rollWeather(biome));
    scheduleChange();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [biome]);

  return weather;
}
