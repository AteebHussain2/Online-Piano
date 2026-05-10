import { z } from 'zod/v4';
import { BANNED_KEYS } from '@/types/piano';

// ─── Zod Validation Schemas ──────────────────────────────────────────

// Key code validation: must not be in banned list
const KeyCodeSchema = z.string().check(
  z.refine((k) => !BANNED_KEYS.includes(k), {
    message: 'Modifier keys and special keys cannot be bound',
  })
);

// Note validation: must match pattern like C4, D#3, A#0
const NoteSchema = z.string().regex(/^[A-G]#?[0-8]$/, 'Invalid note format');

// Keybinding set schema
export const KeyBindingSetSchema = z.object({
  name: z.string().min(1).max(50),
  keyboard1: z.record(KeyCodeSchema, NoteSchema),
  keyboard2: z.record(KeyCodeSchema, NoteSchema),
});

// Piano settings schema
export const PianoSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'midnight', 'ivory']),
  showKeyLabels: z.boolean(),
  showNoteNames: z.boolean(),
  highlightRootNotes: z.boolean(),
  keySize: z.enum(['compact', 'normal', 'wide']),
  octaveRange: z.object({
    start: z.number().int().min(0).max(7),
    end: z.number().int().min(1).max(8),
  }),
  volume: z.number().min(0).max(100),
  sustain: z.boolean(),
  sustainDuration: z.number().min(100).max(10000),
  reverbAmount: z.number().min(0).max(100),
  instrument: z.enum(['grand', 'upright', 'electric', 'toy']),
  keyboard1Name: z.string().max(20),
  keyboard2Name: z.string().max(20),
  keyboard1Color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  keyboard2Color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  mouseClickColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  enableMousePlay: z.boolean(),
  enableTouchPlay: z.boolean(),
  repeatOnHold: z.boolean(),
});

// Export/import format schema
export const KeyBindingExportSchema = z.object({
  version: z.string(),
  app: z.string(),
  exportedAt: z.string(),
  name: z.string().min(1).max(50),
  keyboard1: z.record(KeyCodeSchema, NoteSchema),
  keyboard2: z.record(KeyCodeSchema, NoteSchema),
});
