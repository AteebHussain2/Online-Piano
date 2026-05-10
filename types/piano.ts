// ─── Key Press Sources ───────────────────────────────────────────────
export type KeyPressSource = 'keyboard1' | 'keyboard2' | 'mouse';

// ─── Note Info ───────────────────────────────────────────────────────
export interface NoteInfo {
  note: string;       // e.g. "C4", "D#3"
  midi: number;       // MIDI note number (21–108 for 88 keys)
  octave: number;     // 0–8
  isBlack: boolean;   // true for sharps/flats
  name: string;       // e.g. "C", "D#"
}

// ─── Piano Settings ──────────────────────────────────────────────────
export interface PianoSettings {
  // Visual
  theme: 'light' | 'dark' | 'midnight' | 'ivory';
  showKeyLabels: boolean;
  showNoteNames: boolean;
  highlightRootNotes: boolean;
  keySize: 'compact' | 'normal' | 'wide';
  octaveRange: { start: number; end: number };

  // Audio
  volume: number;             // 0–100
  sustain: boolean;
  sustainDuration: number;    // ms
  reverbAmount: number;       // 0–100
  instrument: 'grand' | 'upright' | 'electric' | 'toy';

  // Input
  keyboard1Name: string;
  keyboard2Name: string;
  keyboard1Color: string;     // hex
  keyboard2Color: string;     // hex
  mouseClickColor: string;    // hex
  enableMousePlay: boolean;
  enableTouchPlay: boolean;
  repeatOnHold: boolean;
}

// ─── Keybinding Set ──────────────────────────────────────────────────
export interface KeyBindingSet {
  id: string;
  name: string;
  keyboard1: Record<string, string>;  // { "KeyQ": "C4", ... }
  keyboard2: Record<string, string>;  // { "KeyZ": "C3", ... }
  createdAt: string;
  updatedAt: string;
}

// ─── Export Format ───────────────────────────────────────────────────
export interface KeyBindingExport {
  version: string;
  app: string;
  exportedAt: string;
  name: string;
  keyboard1: Record<string, string>;
  keyboard2: Record<string, string>;
}

// ─── Active Key State ────────────────────────────────────────────────
export interface ActiveKey {
  note: string;
  source: KeyPressSource;
}

// ─── Banned Keys (never bindable) ────────────────────────────────────
export const BANNED_KEYS: readonly string[] = [
  'Shift', 'ShiftLeft', 'ShiftRight',
  'Control', 'ControlLeft', 'ControlRight',
  'Alt', 'AltLeft', 'AltRight',
  'Meta', 'MetaLeft', 'MetaRight',
  'Tab', 'CapsLock', 'Escape',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
  'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'ContextMenu', 'PrintScreen', 'ScrollLock', 'Pause',
  'Insert', 'Home', 'End', 'PageUp', 'PageDown',
] as const;

// ─── Default Settings ────────────────────────────────────────────────
export const DEFAULT_SETTINGS: PianoSettings = {
  theme: 'dark',
  showKeyLabels: true,
  showNoteNames: false,
  highlightRootNotes: true,
  keySize: 'normal',
  octaveRange: { start: 1, end: 7 },

  volume: 80,
  sustain: true,
  sustainDuration: 1000,
  reverbAmount: 20,
  instrument: 'grand',

  keyboard1Name: 'Keyboard 1',
  keyboard2Name: 'Keyboard 2',
  keyboard1Color: '#3B82F6',
  keyboard2Color: '#F59E0B',
  mouseClickColor: '#10B981',
  enableMousePlay: true,
  enableTouchPlay: true,
  repeatOnHold: false,
};
