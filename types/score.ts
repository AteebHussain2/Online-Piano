import { PianoSettings, KeyBindingSet } from './piano';

export interface ScoreNote {
  note: string;         // e.g., "C4", "Eb4"
  timeMs: number;       // Start time in milliseconds from the beginning of the score
  durationMs: number;   // How long the note should be held
}

export interface MusicScore {
  id: string;
  title: string;
  artist: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  notes: ScoreNote[];
  
  // Optional recommended settings to provide the best experience for this score
  recommendedSettings?: Partial<PianoSettings>;
  recommendedKeybindings?: Partial<Pick<KeyBindingSet, 'keyboard1' | 'keyboard2'>>;
}
