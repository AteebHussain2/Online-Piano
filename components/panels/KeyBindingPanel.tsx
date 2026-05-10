'use client';

import { useState, useCallback, useMemo } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { usePianoStore } from '@/lib/store/pianoStore';
import { BANNED_KEYS } from '@/types/piano';
import { ALL_NOTES } from '@/lib/audio/noteMap';

// ─── Keybinding Editor Panel ─────────────────────────────────────────

interface KeyBindingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Visual QWERTY keyboard layout rows (using e.code values)
const KEYBOARD_ROWS = [
  {
    keys: [
      'Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5',
      'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal',
    ],
    labels: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    offset: 0,
  },
  {
    keys: [
      'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY',
      'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash',
    ],
    labels: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    offset: 8,
  },
  {
    keys: [
      'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH',
      'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote',
    ],
    labels: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
    offset: 16,
  },
  {
    keys: [
      'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN',
      'KeyM', 'Comma', 'Period', 'Slash',
    ],
    labels: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
    offset: 24,
  },
];

// Note picker options (grouped by octave)
function getNoteOptions(): { label: string; value: string }[] {
  return ALL_NOTES.map((n) => ({
    label: n.note,
    value: n.note,
  }));
}

export function KeyBindingPanel({ isOpen, onClose }: KeyBindingPanelProps) {
  const bindings = usePianoStore((s) => s.bindings);
  const updateBindings = usePianoStore((s) => s.updateBindings);
  const settings = usePianoStore((s) => s.settings);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editingKeyboard, setEditingKeyboard] = useState<1 | 2>(1);

  const noteOptions = useMemo(() => getNoteOptions(), []);

  // Build combined lookup for display
  const keyToNote = useMemo(() => {
    const map: Record<string, { note: string; keyboard: 1 | 2 }> = {};
    for (const [code, note] of Object.entries(bindings.keyboard1)) {
      map[code] = { note, keyboard: 1 };
    }
    for (const [code, note] of Object.entries(bindings.keyboard2)) {
      map[code] = { note, keyboard: 2 };
    }
    return map;
  }, [bindings.keyboard1, bindings.keyboard2]);

  const handleKeyClick = useCallback((code: string) => {
    if (BANNED_KEYS.includes(code)) return;
    setSelectedKey(code);

    // Determine which keyboard this key belongs to
    if (bindings.keyboard1[code]) {
      setEditingKeyboard(1);
    } else if (bindings.keyboard2[code]) {
      setEditingKeyboard(2);
    }
  }, [bindings.keyboard1, bindings.keyboard2]);

  const handleNoteAssign = useCallback(
    (note: string) => {
      if (!selectedKey) return;

      const kbKey = editingKeyboard === 1 ? 'keyboard1' : 'keyboard2';
      const otherKbKey = editingKeyboard === 1 ? 'keyboard2' : 'keyboard1';

      // Remove from both keyboards first
      const newKb1 = { ...bindings.keyboard1 };
      const newKb2 = { ...bindings.keyboard2 };

      delete newKb1[selectedKey];
      delete newKb2[selectedKey];

      // Assign to selected keyboard
      if (editingKeyboard === 1) {
        newKb1[selectedKey] = note;
      } else {
        newKb2[selectedKey] = note;
      }

      const newBindings = {
        ...bindings,
        keyboard1: newKb1,
        keyboard2: newKb2,
        updatedAt: new Date().toISOString(),
      };

      updateBindings(newBindings);
      setSelectedKey(null);

      // Save to localStorage
      try {
        localStorage.setItem('keyflow-bindings', JSON.stringify(newBindings));
      } catch {
        // localStorage might be full
      }
    },
    [selectedKey, editingKeyboard, bindings, updateBindings]
  );

  const handleUnbind = useCallback(() => {
    if (!selectedKey) return;

    const newKb1 = { ...bindings.keyboard1 };
    const newKb2 = { ...bindings.keyboard2 };

    delete newKb1[selectedKey];
    delete newKb2[selectedKey];

    const newBindings = {
      ...bindings,
      keyboard1: newKb1,
      keyboard2: newKb2,
      updatedAt: new Date().toISOString(),
    };

    updateBindings(newBindings);
    setSelectedKey(null);

    try {
      localStorage.setItem('keyflow-bindings', JSON.stringify(newBindings));
    } catch {
      // noop
    }
  }, [selectedKey, bindings, updateBindings]);

  const handleReset = useCallback(() => {
    const { DEFAULT_BINDINGS } = require('@/lib/keybindings/defaults');
    updateBindings({ ...DEFAULT_BINDINGS, updatedAt: new Date().toISOString() });

    try {
      localStorage.removeItem('keyflow-bindings');
    } catch {
      // noop
    }
  }, [updateBindings]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Keybindings" width="700px">
      <div className="kb-editor">
        {/* Keyboard selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
          <button
            type="button"
            className={`btn btn--small ${editingKeyboard === 1 ? 'btn--primary' : ''}`}
            onClick={() => setEditingKeyboard(1)}
          >
            {settings.keyboard1Name}
          </button>
          <button
            type="button"
            className={`btn btn--small ${editingKeyboard === 2 ? 'btn--primary' : ''}`}
            onClick={() => setEditingKeyboard(2)}
          >
            {settings.keyboard2Name}
          </button>
        </div>

        {/* Visual QWERTY keyboard */}
        <div className="kb-keyboard">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="kb-row"
              style={{ paddingLeft: `${row.offset}px` }}
            >
              {row.keys.map((code, keyIndex) => {
                const binding = keyToNote[code];
                const isSelected = selectedKey === code;
                const isBound = !!binding;
                const isKb1 = binding?.keyboard === 1;
                const isKb2 = binding?.keyboard === 2;

                let className = 'kb-key';
                if (isSelected) className += ' kb-key--selected';
                else if (isKb1) className += ' kb-key--bound-kb1';
                else if (isKb2) className += ' kb-key--bound-kb2';

                return (
                  <button
                    key={code}
                    type="button"
                    className={className}
                    onClick={() => handleKeyClick(code)}
                    title={isBound ? `${code} → ${binding.note}` : code}
                  >
                    <span className="kb-key-label">{row.labels[keyIndex]}</span>
                    {isBound && (
                      <span className="kb-key-note">{binding.note}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Note assignment panel */}
        {selectedKey && (
          <div
            style={{
              padding: '16px',
              background: 'var(--background)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--foreground)' }}>
              Assign note to <strong>{selectedKey}</strong>:
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <select
                className="select"
                onChange={(e) => {
                  if (e.target.value) handleNoteAssign(e.target.value);
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Pick a note...
                </option>
                {noteOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn--small btn--danger"
                onClick={handleUnbind}
              >
                Unbind
              </button>

              <button
                type="button"
                className="btn btn--small"
                onClick={() => setSelectedKey(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn--danger" onClick={handleReset}>
            Reset to Defaults
          </button>
        </div>

        {/* Legend */}
        <div style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid var(--accent-blue)' }} />
            <span>{settings.keyboard1Name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid var(--accent-amber)' }} />
            <span>{settings.keyboard2Name}</span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
