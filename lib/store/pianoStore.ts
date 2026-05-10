import { create } from 'zustand';
import type { PianoSettings, KeyBindingSet, KeyPressSource } from '@/types/piano';
import { DEFAULT_SETTINGS } from '@/types/piano';
import { DEFAULT_BINDINGS } from '@/lib/keybindings/defaults';

// ─── Piano Store (Zustand) ──────────────────────────────────────────

interface ActiveKeyInfo {
  source: KeyPressSource;
  note: string;
}

interface PianoState {
  // Active keys currently being pressed
  activeKeys: Map<string, ActiveKeyInfo>;  // note → info

  // Settings
  settings: PianoSettings;

  // Current keybinding set
  bindings: KeyBindingSet;

  // All saved binding sets
  savedBindingSets: KeyBindingSet[];

  // Audio state
  audioReady: boolean;
  audioLoading: boolean;

  // UI state
  settingsPanelOpen: boolean;
  keybindingPanelOpen: boolean;
  importExportPanelOpen: boolean;

  // Actions
  pressKey: (note: string, source: KeyPressSource) => void;
  releaseKey: (note: string) => void;
  updateSettings: (partial: Partial<PianoSettings>) => void;
  setSettings: (settings: PianoSettings) => void;
  updateBindings: (bindings: KeyBindingSet) => void;
  setSavedBindingSets: (sets: KeyBindingSet[]) => void;
  setAudioReady: (ready: boolean) => void;
  setAudioLoading: (loading: boolean) => void;
  setSettingsPanelOpen: (open: boolean) => void;
  setKeybindingPanelOpen: (open: boolean) => void;
  setImportExportPanelOpen: (open: boolean) => void;
}

export const usePianoStore = create<PianoState>((set) => ({
  activeKeys: new Map(),
  settings: DEFAULT_SETTINGS,
  bindings: DEFAULT_BINDINGS,
  savedBindingSets: [DEFAULT_BINDINGS],
  audioReady: false,
  audioLoading: false,
  settingsPanelOpen: false,
  keybindingPanelOpen: false,
  importExportPanelOpen: false,

  pressKey: (note, source) =>
    set((state) => {
      const newKeys = new Map(state.activeKeys);
      newKeys.set(note, { source, note });
      return { activeKeys: newKeys };
    }),

  releaseKey: (note) =>
    set((state) => {
      const newKeys = new Map(state.activeKeys);
      newKeys.delete(note);
      return { activeKeys: newKeys };
    }),

  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  setSettings: (settings) => set({ settings }),

  updateBindings: (bindings) => set({ bindings }),

  setSavedBindingSets: (sets) => set({ savedBindingSets: sets }),

  setAudioReady: (ready) => set({ audioReady: ready }),

  setAudioLoading: (loading) => set({ audioLoading: loading }),

  setSettingsPanelOpen: (open) =>
    set({ settingsPanelOpen: open, keybindingPanelOpen: false, importExportPanelOpen: false }),

  setKeybindingPanelOpen: (open) =>
    set({ keybindingPanelOpen: open, settingsPanelOpen: false, importExportPanelOpen: false }),

  setImportExportPanelOpen: (open) =>
    set({ importExportPanelOpen: open, settingsPanelOpen: false, keybindingPanelOpen: false }),
}));
