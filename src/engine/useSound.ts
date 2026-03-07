import { useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

// Sound effect types
export type SFXType =
  | 'menu_select' | 'menu_back'
  | 'battle_start' | 'attack_hit' | 'attack_miss' | 'defend'
  | 'enemy_hit' | 'victory' | 'defeat' | 'run_away'
  | 'item_use' | 'item_get' | 'equip'
  | 'step' | 'bump' | 'door_open'
  | 'level_up' | 'npc_talk';

// Procedural tone generation for retro SFX (no external files needed)
// Uses expo-av with generated tones
function createToneParams(type: SFXType): { frequency: number; duration: number; wave: 'sine' | 'square' } {
  switch (type) {
    case 'menu_select':    return { frequency: 800, duration: 80, wave: 'square' };
    case 'menu_back':      return { frequency: 400, duration: 100, wave: 'square' };
    case 'battle_start':   return { frequency: 600, duration: 200, wave: 'square' };
    case 'attack_hit':     return { frequency: 200, duration: 120, wave: 'square' };
    case 'attack_miss':    return { frequency: 300, duration: 60, wave: 'sine' };
    case 'defend':         return { frequency: 500, duration: 80, wave: 'sine' };
    case 'enemy_hit':      return { frequency: 150, duration: 150, wave: 'square' };
    case 'victory':        return { frequency: 880, duration: 300, wave: 'sine' };
    case 'defeat':         return { frequency: 200, duration: 400, wave: 'sine' };
    case 'run_away':       return { frequency: 600, duration: 150, wave: 'square' };
    case 'item_use':       return { frequency: 700, duration: 100, wave: 'sine' };
    case 'item_get':       return { frequency: 900, duration: 120, wave: 'sine' };
    case 'equip':          return { frequency: 500, duration: 100, wave: 'square' };
    case 'step':           return { frequency: 200, duration: 40, wave: 'sine' };
    case 'bump':           return { frequency: 100, duration: 80, wave: 'square' };
    case 'door_open':      return { frequency: 400, duration: 150, wave: 'sine' };
    case 'level_up':       return { frequency: 1000, duration: 400, wave: 'sine' };
    case 'npc_talk':       return { frequency: 600, duration: 60, wave: 'square' };
    default:               return { frequency: 440, duration: 100, wave: 'sine' };
  }
}

// Generate a WAV buffer for a simple tone
function generateToneWAV(frequency: number, durationMs: number, wave: 'sine' | 'square'): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const numChannels = 1;
  const bitsPerSample = 8;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const buffer = new Uint8Array(fileSize);
  const view = new DataView(buffer.buffer);

  // RIFF header
  buffer[0] = 82; buffer[1] = 73; buffer[2] = 70; buffer[3] = 70; // "RIFF"
  view.setUint32(4, fileSize - 8, true);
  buffer[8] = 87; buffer[9] = 65; buffer[10] = 86; buffer[11] = 69; // "WAVE"

  // fmt chunk
  buffer[12] = 102; buffer[13] = 109; buffer[14] = 116; buffer[15] = 32; // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  buffer[36] = 100; buffer[37] = 97; buffer[38] = 116; buffer[39] = 97; // "data"
  view.setUint32(40, dataSize, true);

  // Generate samples with envelope
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;
    // Attack-decay envelope
    const envelope = progress < 0.1 ? progress / 0.1 : 1 - (progress - 0.1) / 0.9;

    let sample: number;
    if (wave === 'square') {
      sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
    } else {
      sample = Math.sin(2 * Math.PI * frequency * t);
    }

    // 8-bit unsigned PCM: 0-255, center at 128
    buffer[headerSize + i] = Math.floor(128 + sample * envelope * 40);
  }

  // Convert to base64 data URI
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

export function useSound() {
  const soundCache = useRef<Map<SFXType, Audio.Sound>>(new Map());
  const enabled = useRef(true);

  const playSFX = useCallback(async (type: SFXType) => {
    if (!enabled.current) return;

    try {
      // Check cache
      let sound = soundCache.current.get(type);

      if (!sound) {
        const params = createToneParams(type);
        const uri = generateToneWAV(params.frequency, params.duration, params.wave);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false, volume: 0.3 }
        );
        sound = newSound;
        soundCache.current.set(type, sound);
      }

      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {
      // Silent fail - sound is optional
    }
  }, []);

  const toggleSound = useCallback(() => {
    enabled.current = !enabled.current;
    return enabled.current;
  }, []);

  const cleanup = useCallback(async () => {
    for (const sound of soundCache.current.values()) {
      await sound.unloadAsync();
    }
    soundCache.current.clear();
  }, []);

  return { playSFX, toggleSound, cleanup };
}
