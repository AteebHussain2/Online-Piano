import type { NoteInfo } from '@/types/piano';

// ─── All 88 Piano Keys (A0 → C8) ────────────────────────────────────
// Standard piano: MIDI 21 (A0) to MIDI 108 (C8)

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const BLACK_NOTES = new Set(['C#', 'D#', 'F#', 'G#', 'A#']);

function generateAllNotes(): NoteInfo[] {
  const notes: NoteInfo[] = [];

  // MIDI 21 = A0, MIDI 108 = C8
  for (let midi = 21; midi <= 108; midi++) {
    const noteIndex = (midi - 12) % 12;
    const octave = Math.floor((midi - 12) / 12);
    const name = NOTE_NAMES[noteIndex];
    const note = `${name}${octave}`;
    const isBlack = BLACK_NOTES.has(name);

    notes.push({ note, midi, octave, isBlack, name });
  }

  return notes;
}

export const ALL_NOTES: NoteInfo[] = generateAllNotes();

// Quick lookup: note string → NoteInfo
export const NOTE_MAP: Record<string, NoteInfo> = {};
for (const n of ALL_NOTES) {
  NOTE_MAP[n.note] = n;
}

// White keys only (for layout calculations)
export const WHITE_NOTES: NoteInfo[] = ALL_NOTES.filter((n) => !n.isBlack);

// Black keys only
export const BLACK_NOTES_LIST: NoteInfo[] = ALL_NOTES.filter((n) => n.isBlack);

// Get notes within an octave range
export function getNotesInRange(startOctave: number, endOctave: number): NoteInfo[] {
  return ALL_NOTES.filter((n) => {
    // A0, A#0, B0 are in octave 0 but below C1
    if (n.octave < startOctave) return false;
    if (n.octave > endOctave) return false;
    // Include C8 (the highest key)
    if (n.note === 'C8' && endOctave >= 8) return true;
    return true;
  });
}
