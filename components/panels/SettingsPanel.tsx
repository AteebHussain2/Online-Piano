'use client';

import { useCallback } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Toggle } from '@/components/ui/Toggle';
import { Slider } from '@/components/ui/Slider';
import { usePianoStore } from '@/lib/store/pianoStore';
import { setVolume, setReverbAmount } from '@/lib/audio/synth';
import type { PianoSettings } from '@/types/piano';

// ─── Settings Panel ──────────────────────────────────────────────────

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const settings = usePianoStore((s) => s.settings);
  const updateSettings = usePianoStore((s) => s.updateSettings);

  const handleUpdate = useCallback(
    (partial: Partial<PianoSettings>) => {
      updateSettings(partial);

      // Apply audio settings immediately
      if ('volume' in partial && partial.volume !== undefined) {
        setVolume(partial.volume);
      }
      if ('reverbAmount' in partial && partial.reverbAmount !== undefined) {
        setReverbAmount(partial.reverbAmount);
      }

      // Save to localStorage
      const updated = { ...settings, ...partial };
      try {
        localStorage.setItem('keyflow-settings', JSON.stringify(updated));
      } catch {
        // localStorage might be full or unavailable
      }
    },
    [settings, updateSettings]
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Settings" width="500px">
      {/* ── Visual ── */}
      <div className="settings-section">
        <div className="settings-section-title">Visual</div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Theme</div>
          </div>
          <select
            className="select"
            value={settings.theme}
            onChange={(e) => handleUpdate({ theme: e.target.value as PianoSettings['theme'] })}
            id="setting-theme"
          >
            <option value="dark">Dark</option>
            <option value="midnight">Midnight</option>
            <option value="light">Light</option>
            <option value="ivory">Ivory</option>
          </select>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Show Key Labels</div>
            <div className="settings-label-sub">Display keyboard shortcuts on keys</div>
          </div>
          <Toggle
            checked={settings.showKeyLabels}
            onChange={(v) => handleUpdate({ showKeyLabels: v })}
            id="setting-key-labels"
          />
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Show Note Names</div>
            <div className="settings-label-sub">Display C4, D#3, etc.</div>
          </div>
          <Toggle
            checked={settings.showNoteNames}
            onChange={(v) => handleUpdate({ showNoteNames: v })}
            id="setting-note-names"
          />
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Highlight Root Notes</div>
            <div className="settings-label-sub">Subtly mark all C notes</div>
          </div>
          <Toggle
            checked={settings.highlightRootNotes}
            onChange={(v) => handleUpdate({ highlightRootNotes: v })}
            id="setting-root-notes"
          />
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Key Size</div>
          </div>
          <select
            className="select"
            value={settings.keySize}
            onChange={(e) => handleUpdate({ keySize: e.target.value as PianoSettings['keySize'] })}
            id="setting-key-size"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Octave Range</div>
            <div className="settings-label-sub">Start octave</div>
          </div>
          <Slider
            value={settings.octaveRange.start}
            min={0}
            max={settings.octaveRange.end - 1}
            onChange={(v) => handleUpdate({ octaveRange: { ...settings.octaveRange, start: v } })}
            id="setting-octave-start"
          />
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label-sub">End octave</div>
          </div>
          <Slider
            value={settings.octaveRange.end}
            min={settings.octaveRange.start + 1}
            max={8}
            onChange={(v) => handleUpdate({ octaveRange: { ...settings.octaveRange, end: v } })}
            id="setting-octave-end"
          />
        </div>
      </div>

      {/* ── Audio ── */}
      <div className="settings-section">
        <div className="settings-section-title">Audio</div>

        <div className="settings-row">
          <div className="settings-label">Volume</div>
          <Slider
            value={settings.volume}
            min={0}
            max={100}
            onChange={(v) => handleUpdate({ volume: v })}
            suffix="%"
            id="setting-volume"
          />
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Sustain</div>
            <div className="settings-label-sub">Hold note until key released</div>
          </div>
          <Toggle
            checked={settings.sustain}
            onChange={(v) => handleUpdate({ sustain: v })}
            id="setting-sustain"
          />
        </div>

        <div className="settings-row">
          <div className="settings-label">Reverb</div>
          <Slider
            value={settings.reverbAmount}
            min={0}
            max={100}
            onChange={(v) => handleUpdate({ reverbAmount: v })}
            suffix="%"
            id="setting-reverb"
          />
        </div>
      </div>

      {/* ── Input ── */}
      <div className="settings-section">
        <div className="settings-section-title">Input</div>

        <div className="settings-row">
          <div className="settings-label">Keyboard 1 Name</div>
          <input
            className="input"
            type="text"
            value={settings.keyboard1Name}
            onChange={(e) => handleUpdate({ keyboard1Name: e.target.value })}
            maxLength={20}
            id="setting-kb1-name"
          />
        </div>

        <div className="settings-row">
          <div className="settings-label">Keyboard 2 Name</div>
          <input
            className="input"
            type="text"
            value={settings.keyboard2Name}
            onChange={(e) => handleUpdate({ keyboard2Name: e.target.value })}
            maxLength={20}
            id="setting-kb2-name"
          />
        </div>

        <div className="settings-row">
          <div className="settings-label">{settings.keyboard1Name} Color</div>
          <div className="color-picker">
            <div className="color-swatch" style={{ backgroundColor: settings.keyboard1Color }}>
              <input
                type="color"
                value={settings.keyboard1Color}
                onChange={(e) => handleUpdate({ keyboard1Color: e.target.value })}
                id="setting-kb1-color"
              />
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-label">{settings.keyboard2Name} Color</div>
          <div className="color-picker">
            <div className="color-swatch" style={{ backgroundColor: settings.keyboard2Color }}>
              <input
                type="color"
                value={settings.keyboard2Color}
                onChange={(e) => handleUpdate({ keyboard2Color: e.target.value })}
                id="setting-kb2-color"
              />
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-label">Mouse Click Color</div>
          <div className="color-picker">
            <div className="color-swatch" style={{ backgroundColor: settings.mouseClickColor }}>
              <input
                type="color"
                value={settings.mouseClickColor}
                onChange={(e) => handleUpdate({ mouseClickColor: e.target.value })}
                id="setting-mouse-color"
              />
            </div>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Enable Mouse Play</div>
          </div>
          <Toggle
            checked={settings.enableMousePlay}
            onChange={(v) => handleUpdate({ enableMousePlay: v })}
            id="setting-mouse-play"
          />
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Enable Touch Play</div>
          </div>
          <Toggle
            checked={settings.enableTouchPlay}
            onChange={(v) => handleUpdate({ enableTouchPlay: v })}
            id="setting-touch-play"
          />
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Repeat on Hold</div>
            <div className="settings-label-sub">Re-trigger note when key is held</div>
          </div>
          <Toggle
            checked={settings.repeatOnHold}
            onChange={(v) => handleUpdate({ repeatOnHold: v })}
            id="setting-repeat-hold"
          />
        </div>
      </div>
    </Dialog>
  );
}
