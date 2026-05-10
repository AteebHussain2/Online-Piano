import { MusicScore } from '@/types/score';

export const SCORE_LIBRARY: MusicScore[] = [
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    difficulty: 'Beginner',
    recommendedSettings: {
      volume: 80,
      reverbAmount: 20,
    },
    // Recommend a simple row of keys for this C major melody
    recommendedKeybindings: {
      keyboard1: {
        'KeyA': 'C4',
        'KeyS': 'D4',
        'KeyD': 'E4',
        'KeyF': 'F4',
        'KeyG': 'G4',
        'KeyH': 'A4',
        'KeyJ': 'B4',
        'KeyK': 'C5',
      }
    },
    notes: [
      { note: 'C4', timeMs: 0, durationMs: 400 },
      { note: 'C4', timeMs: 500, durationMs: 400 },
      { note: 'G4', timeMs: 1000, durationMs: 400 },
      { note: 'G4', timeMs: 1500, durationMs: 400 },
      { note: 'A4', timeMs: 2000, durationMs: 400 },
      { note: 'A4', timeMs: 2500, durationMs: 400 },
      { note: 'G4', timeMs: 3000, durationMs: 800 },
      
      { note: 'F4', timeMs: 4000, durationMs: 400 },
      { note: 'F4', timeMs: 4500, durationMs: 400 },
      { note: 'E4', timeMs: 5000, durationMs: 400 },
      { note: 'E4', timeMs: 5500, durationMs: 400 },
      { note: 'D4', timeMs: 6000, durationMs: 400 },
      { note: 'D4', timeMs: 6500, durationMs: 400 },
      { note: 'C4', timeMs: 7000, durationMs: 800 },
    ]
  },
  {
    id: 'fur-elise',
    title: 'Für Elise (Theme)',
    artist: 'Ludwig van Beethoven',
    difficulty: 'Intermediate',
    recommendedSettings: {
      volume: 100,
      reverbAmount: 50,
      sustain: true,
    },
    notes: [
      { note: 'E5', timeMs: 0, durationMs: 250 },
      { note: 'D#5', timeMs: 300, durationMs: 250 },
      { note: 'E5', timeMs: 600, durationMs: 250 },
      { note: 'D#5', timeMs: 900, durationMs: 250 },
      { note: 'E5', timeMs: 1200, durationMs: 250 },
      { note: 'B4', timeMs: 1500, durationMs: 250 },
      { note: 'D5', timeMs: 1800, durationMs: 250 },
      { note: 'C5', timeMs: 2100, durationMs: 250 },
      { note: 'A4', timeMs: 2400, durationMs: 750 },
      
      { note: 'C4', timeMs: 3300, durationMs: 250 },
      { note: 'E4', timeMs: 3600, durationMs: 250 },
      { note: 'A4', timeMs: 3900, durationMs: 250 },
      { note: 'B4', timeMs: 4200, durationMs: 750 },
      
      { note: 'E4', timeMs: 5100, durationMs: 250 },
      { note: 'G#4', timeMs: 5400, durationMs: 250 },
      { note: 'B4', timeMs: 5700, durationMs: 250 },
      { note: 'C5', timeMs: 6000, durationMs: 750 },
    ]
  }
];
