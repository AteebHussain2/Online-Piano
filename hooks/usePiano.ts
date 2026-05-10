'use client';

import { useCallback, useRef } from 'react';
import { usePianoStore } from '@/lib/store/pianoStore';
import {
  initAudio,
  playNote as audioPlayNote,
  releaseNote as audioReleaseNote,
  setVolume,
  setReverbAmount,
} from '@/lib/audio/synth';
import type { KeyPressSource } from '@/types/piano';

// ─── Piano Hook ──────────────────────────────────────────────────────
// Coordinates audio initialization and note play/release

export function usePiano() {
  const audioInitRef = useRef(false);

  const ensureAudio = useCallback(async () => {
    if (audioInitRef.current) return;
    audioInitRef.current = true;

    const store = usePianoStore.getState();
    if (!store.audioReady && !store.audioLoading) {
      store.setAudioLoading(true);
      await initAudio(() => {
        const s = usePianoStore.getState();
        s.setAudioReady(true);
        s.setAudioLoading(false);

        // Apply saved settings
        setVolume(s.settings.volume);
        setReverbAmount(s.settings.reverbAmount);
      });
    }
  }, []);

  const triggerNote = useCallback(
    async (note: string, source: KeyPressSource) => {
      await ensureAudio();

      const store = usePianoStore.getState();
      store.pressKey(note, source);

      const velocity = store.settings.volume / 100;
      audioPlayNote(note, Math.max(0.1, velocity));
    },
    [ensureAudio]
  );

  const releaseNoteAction = useCallback((note: string) => {
    const store = usePianoStore.getState();
    store.releaseKey(note);
    audioReleaseNote(note);
  }, []);

  return {
    triggerNote,
    releaseNote: releaseNoteAction,
    ensureAudio,
  };
}
