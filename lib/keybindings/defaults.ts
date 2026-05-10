import type { KeyBindingSet } from '@/types/piano';

// ─── Default QWERTY Keybindings ──────────────────────────────────────
// Keyboard 1: Upper rows → higher octaves (right hand)
// Keyboard 2: Lower row → lower octaves (left hand)
// Number row: sharps/flats

export const DEFAULT_KEYBOARD1: Record<string, string> = {
  // QWERTY row → C4 to A5 (white keys)
  'KeyQ': 'C4',
  'KeyW': 'D4',
  'KeyE': 'E4',
  'KeyR': 'F4',
  'KeyT': 'G4',
  'KeyY': 'A4',
  'KeyU': 'B4',
  'KeyI': 'C5',
  'KeyO': 'D5',
  'KeyP': 'E5',
  'BracketLeft': 'F5',
  'BracketRight': 'G5',
  'Backslash': 'A5',

  // Number row → sharps (keyboard 1 zone)
  'Digit2': 'C#4',
  'Digit3': 'D#4',
  'Digit5': 'F#4',
  'Digit6': 'G#4',
  'Digit7': 'A#4',
  'Digit9': 'C#5',
  'Digit0': 'D#5',
  'Equal': 'F#5',
};

export const DEFAULT_KEYBOARD2: Record<string, string> = {
  // ZXCV row → C3 to E4 (white keys)
  'KeyZ': 'C3',
  'KeyX': 'D3',
  'KeyC': 'E3',
  'KeyV': 'F3',
  'KeyB': 'G3',
  'KeyN': 'A3',
  'KeyM': 'B3',
  'Comma': 'C4',    // Shared middle C
  'Period': 'D4',
  'Slash': 'E4',

  // ASD row → sharps (keyboard 2 zone)
  'KeyS': 'C#3',
  'KeyD': 'D#3',
  'KeyG': 'F#3',
  'KeyH': 'G#3',
  'KeyJ': 'A#3',
  'KeyL': 'C#4',
  'Semicolon': 'D#4',
};

export const DEFAULT_BINDINGS: KeyBindingSet = {
  id: 'default',
  name: 'Default QWERTY',
  keyboard1: DEFAULT_KEYBOARD1,
  keyboard2: DEFAULT_KEYBOARD2,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Build reverse lookup: note → key code(s)
export function buildNoteLookup(
  kb1: Record<string, string>,
  kb2: Record<string, string>
): Record<string, { keyboard1?: string; keyboard2?: string }> {
  const lookup: Record<string, { keyboard1?: string; keyboard2?: string }> = {};

  for (const [code, note] of Object.entries(kb1)) {
    if (!lookup[note]) lookup[note] = {};
    lookup[note].keyboard1 = code;
  }

  for (const [code, note] of Object.entries(kb2)) {
    if (!lookup[note]) lookup[note] = {};
    lookup[note].keyboard2 = code;
  }

  return lookup;
}
