'use client';

import { useEffect, useCallback } from 'react';
import { usePianoStore } from '@/lib/store/pianoStore';
import type { KeyBindingSet, KeyBindingExport } from '@/types/piano';
import { DEFAULT_BINDINGS } from '@/lib/keybindings/defaults';

// ─── Keybindings Persistence Hook ────────────────────────────────────

const STORAGE_KEY = 'keyflow-bindings';

export function useKeyBindings() {
  const bindings = usePianoStore((s) => s.bindings);
  const updateBindings = usePianoStore((s) => s.updateBindings);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as KeyBindingSet;
        if (parsed.keyboard1 && parsed.keyboard2) {
          updateBindings({
            ...DEFAULT_BINDINGS,
            ...parsed,
          });
        }
      }
    } catch {
      // Use defaults
    }
  }, [updateBindings]);

  const saveBindings = useCallback(
    (newBindings: KeyBindingSet) => {
      updateBindings(newBindings);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBindings));
      } catch {
        // noop
      }
    },
    [updateBindings]
  );

  const exportBindings = useCallback((): KeyBindingExport => {
    return {
      version: '1.0',
      app: 'KeyFlow',
      exportedAt: new Date().toISOString(),
      name: bindings.name,
      keyboard1: bindings.keyboard1,
      keyboard2: bindings.keyboard2,
    };
  }, [bindings]);

  const importBindings = useCallback(
    (data: KeyBindingExport) => {
      const newBindings: KeyBindingSet = {
        ...bindings,
        name: data.name,
        keyboard1: data.keyboard1,
        keyboard2: data.keyboard2,
        updatedAt: new Date().toISOString(),
      };
      saveBindings(newBindings);
    },
    [bindings, saveBindings]
  );

  const resetBindings = useCallback(() => {
    saveBindings({ ...DEFAULT_BINDINGS, updatedAt: new Date().toISOString() });
  }, [saveBindings]);

  return {
    bindings,
    saveBindings,
    exportBindings,
    importBindings,
    resetBindings,
  };
}
