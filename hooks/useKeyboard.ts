'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePianoStore } from '@/lib/store/pianoStore';
import { BANNED_KEYS } from '@/types/piano';
import { playNote, releaseNote, initAudio } from '@/lib/audio/synth';

// ─── Keyboard Hook (CRITICAL — single-key-only enforcement) ─────────
// Uses e.code (physical key), NEVER e.key
// Ignores all modifier state (shiftKey, ctrlKey, altKey, metaKey)
// Debounces repeated keydown events from held keys

export function useKeyboard(): void {
  const heldKeysRef = useRef<Set<string>>(new Set());
  const audioInitRef = useRef(false);

  const getBindings = useCallback(() => {
    return usePianoStore.getState().bindings;
  }, []);

  const getSettings = useCallback(() => {
    return usePianoStore.getState().settings;
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const code = e.code;

      // Ignore banned keys entirely
      if (BANNED_KEYS.includes(code)) return;

      const bindings = getBindings();
      const kb1Note = bindings.keyboard1[code];
      const kb2Note = bindings.keyboard2[code];
      const boundNote = kb1Note || kb2Note;

      // If this key is bound, prevent default browser behavior
      if (boundNote) {
        e.preventDefault();
      } else {
        return; // Not a bound key, let the browser handle it
      }

      // Init audio on first keypress (browser requires user gesture)
      if (!audioInitRef.current) {
        audioInitRef.current = true;
        const store = usePianoStore.getState();
        if (!store.audioReady && !store.audioLoading) {
          store.setAudioLoading(true);
          await initAudio(() => {
            usePianoStore.getState().setAudioReady(true);
            usePianoStore.getState().setAudioLoading(false);
          });
        }
      }

      // Debounce: ignore if key is already held (browser fires repeated keydown on hold)
      if (heldKeysRef.current.has(code)) {
        const settings = getSettings();
        if (!settings.repeatOnHold) return;
      }

      // Track held key
      heldKeysRef.current.add(code);

      // Determine source (keyboard1 vs keyboard2)
      const source = kb1Note ? 'keyboard1' as const : 'keyboard2' as const;
      const note = boundNote;

      // Update store and play audio
      usePianoStore.getState().pressKey(note, source);

      const settings = getSettings();
      const velocity = settings.volume / 100;
      playNote(note, Math.max(0.1, velocity));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;

      // Remove from held keys
      heldKeysRef.current.delete(code);

      const bindings = getBindings();
      const note = bindings.keyboard1[code] || bindings.keyboard2[code];

      if (note) {
        e.preventDefault();
        usePianoStore.getState().releaseKey(note);

        const settings = getSettings();
        if (settings.sustain) {
          // Let the note ring naturally
          releaseNote(note);
        } else {
          // Release immediately
          releaseNote(note);
        }
      }
    };

    // Handle window blur — release all held keys
    const handleBlur = () => {
      const bindings = getBindings();
      for (const code of heldKeysRef.current) {
        const note = bindings.keyboard1[code] || bindings.keyboard2[code];
        if (note) {
          usePianoStore.getState().releaseKey(note);
          releaseNote(note);
        }
      }
      heldKeysRef.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [getBindings, getSettings]);
}
