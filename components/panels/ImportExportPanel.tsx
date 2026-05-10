'use client';

import { useState, useCallback, useRef } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { usePianoStore } from '@/lib/store/pianoStore';
import type { KeyBindingExport, KeyBindingSet } from '@/types/piano';
import { BANNED_KEYS } from '@/types/piano';

// ─── Import / Export Panel ───────────────────────────────────────────

interface ImportExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple validation (Zod-like but inline for client)
function validateImport(data: unknown): { valid: boolean; error?: string; parsed?: KeyBindingExport } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON format' };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== 'string' || obj.name.length === 0) {
    return { valid: false, error: 'Missing or invalid "name" field' };
  }

  if (!obj.keyboard1 || typeof obj.keyboard1 !== 'object') {
    return { valid: false, error: 'Missing or invalid "keyboard1" field' };
  }

  if (!obj.keyboard2 || typeof obj.keyboard2 !== 'object') {
    return { valid: false, error: 'Missing or invalid "keyboard2" field' };
  }

  // Validate each key code
  const notePattern = /^[A-G]#?[0-8]$/;
  for (const [code, note] of Object.entries(obj.keyboard1 as Record<string, string>)) {
    if (BANNED_KEYS.includes(code)) {
      return { valid: false, error: `Banned key "${code}" found in keyboard1` };
    }
    if (!notePattern.test(note)) {
      return { valid: false, error: `Invalid note "${note}" for key "${code}" in keyboard1` };
    }
  }

  for (const [code, note] of Object.entries(obj.keyboard2 as Record<string, string>)) {
    if (BANNED_KEYS.includes(code)) {
      return { valid: false, error: `Banned key "${code}" found in keyboard2` };
    }
    if (!notePattern.test(note)) {
      return { valid: false, error: `Invalid note "${note}" for key "${code}" in keyboard2` };
    }
  }

  return {
    valid: true,
    parsed: {
      version: String(obj.version || '1.0'),
      app: String(obj.app || 'KeyFlow'),
      exportedAt: String(obj.exportedAt || new Date().toISOString()),
      name: String(obj.name),
      keyboard1: obj.keyboard1 as Record<string, string>,
      keyboard2: obj.keyboard2 as Record<string, string>,
    },
  };
}

export function ImportExportPanel({ isOpen, onClose }: ImportExportPanelProps) {
  const bindings = usePianoStore((s) => s.bindings);
  const updateBindings = usePianoStore((s) => s.updateBindings);

  const [dragOver, setDragOver] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<KeyBindingExport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Export ──
  const handleExport = useCallback(() => {
    const exportData: KeyBindingExport = {
      version: '1.0',
      app: 'KeyFlow',
      exportedAt: new Date().toISOString(),
      name: bindings.name,
      keyboard1: bindings.keyboard1,
      keyboard2: bindings.keyboard2,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyflow-bindings-${bindings.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bindings]);

  // ── Import (process file) ──
  const processFile = useCallback((file: File) => {
    setImportError(null);
    setImportPreview(null);

    if (!file.name.endsWith('.json')) {
      setImportError('Only .json files are supported');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const result = validateImport(data);

        if (!result.valid) {
          setImportError(result.error || 'Invalid file');
          return;
        }

        setImportPreview(result.parsed!);
      } catch {
        setImportError('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleApplyImport = useCallback(() => {
    if (!importPreview) return;

    const newBindings: KeyBindingSet = {
      ...bindings,
      name: importPreview.name,
      keyboard1: importPreview.keyboard1,
      keyboard2: importPreview.keyboard2,
      updatedAt: new Date().toISOString(),
    };

    updateBindings(newBindings);
    setImportPreview(null);

    try {
      localStorage.setItem('keyflow-bindings', JSON.stringify(newBindings));
    } catch {
      // noop
    }
  }, [importPreview, bindings, updateBindings]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Import / Export">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* ── Export ── */}
        <div className="settings-section">
          <div className="settings-section-title">Export</div>
          <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginBottom: '12px' }}>
            Download your current keybindings as a JSON file.
          </p>
          <button type="button" className="btn btn--primary" onClick={handleExport} id="btn-export">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Bindings
          </button>
        </div>

        {/* ── Import ── */}
        <div className="settings-section">
          <div className="settings-section-title">Import</div>

          {/* Drop Zone */}
          <div
            className={`drop-zone ${dragOver ? 'drop-zone--drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-icon">📁</div>
            <div className="drop-zone-text">Drop a JSON file here</div>
            <div className="drop-zone-sub">or click to browse</div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="import-file-input"
          />

          {/* Error */}
          {importError && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: 'var(--accent-red)',
                fontSize: '13px',
              }}
            >
              {importError}
            </div>
          )}

          {/* Preview */}
          {importPreview && (
            <div
              style={{
                marginTop: '12px',
                padding: '16px',
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--foreground)', marginBottom: '8px' }}>
                Preview: {importPreview.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginBottom: '4px' }}>
                Keyboard 1: {Object.keys(importPreview.keyboard1).length} bindings
              </div>
              <div style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginBottom: '12px' }}>
                Keyboard 2: {Object.keys(importPreview.keyboard2).length} bindings
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn--primary btn--small"
                  onClick={handleApplyImport}
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => setImportPreview(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
