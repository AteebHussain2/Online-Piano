'use client';

import { useEffect } from 'react';
import { usePianoStore } from '@/lib/store/pianoStore';
import { setVolume, setReverbAmount } from '@/lib/audio/synth';
import type { PianoSettings } from '@/types/piano';
import { DEFAULT_SETTINGS } from '@/types/piano';

// ─── Piano Settings Persistence Hook ─────────────────────────────────
// Loads from localStorage on mount, saves on change

const STORAGE_KEY = 'keyflow-settings';

export function usePianoSettings() {
  const settings = usePianoStore((s) => s.settings);
  const setSettings = usePianoStore((s) => s.setSettings);
  const updateSettings = usePianoStore((s) => s.updateSettings);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PianoSettings>;
        // Merge with defaults to handle missing fields
        const merged: PianoSettings = { ...DEFAULT_SETTINGS, ...parsed };
        setSettings(merged);

        // Apply audio settings
        setVolume(merged.volume);
        setReverbAmount(merged.reverbAmount);
      }
    } catch {
      // Use defaults
    }
  }, [setSettings]);

  const saveSettings = (partial: Partial<PianoSettings>) => {
    updateSettings(partial);

    const updated = { ...settings, ...partial };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // noop
    }

    // Apply audio settings
    if ('volume' in partial && partial.volume !== undefined) {
      setVolume(partial.volume);
    }
    if ('reverbAmount' in partial && partial.reverbAmount !== undefined) {
      setReverbAmount(partial.reverbAmount);
    }
  };

  return { settings, saveSettings };
}
