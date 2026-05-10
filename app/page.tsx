'use client';

import { useState, useCallback } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Piano } from '@/components/piano/Piano';
import { SettingsPanel } from '@/components/panels/SettingsPanel';
import { KeyBindingPanel } from '@/components/panels/KeyBindingPanel';
import { ImportExportPanel } from '@/components/panels/ImportExportPanel';
import { ScoreLibraryDialog } from '@/components/practice/ScoreLibraryDialog';
import { FallingNotesCanvas } from '@/components/practice/FallingNotesCanvas';
import { SyncBanner } from '@/components/auth/SyncBanner';
import { useKeyboard } from '@/hooks/useKeyboard';
import { usePianoStore } from '@/lib/store/pianoStore';
import { initAudio } from '@/lib/audio/synth';
import { useAuthMigration } from '@/hooks/useAuthMigration';
import { usePianoSettings } from '@/hooks/usePianoSettings';
import { useKeyBindings } from '@/hooks/useKeyBindings';
import { useAudioInit } from '@/hooks/useAudioInit';
import { useScorePlayback } from '@/hooks/useScorePlayback';

// ─── SVG Icons ───────────────────────────────────────────────────────

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
    </svg>
  );
}

function ImportExportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function PlaySmallIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export default function Home() {

  const settingsPanelOpen = usePianoStore((s) => s.settingsPanelOpen);
  const keybindingPanelOpen = usePianoStore((s) => s.keybindingPanelOpen);
  const importExportPanelOpen = usePianoStore((s) => s.importExportPanelOpen);
  const scoreLibraryPanelOpen = usePianoStore((s) => s.scoreLibraryPanelOpen);
  
  const audioLoading = usePianoStore((s) => s.audioLoading);
  const audioReady = usePianoStore((s) => s.audioReady);

  const setSettingsPanelOpen = usePianoStore((s) => s.setSettingsPanelOpen);
  const setKeybindingPanelOpen = usePianoStore((s) => s.setKeybindingPanelOpen);
  const setImportExportPanelOpen = usePianoStore((s) => s.setImportExportPanelOpen);
  const setScoreLibraryPanelOpen = usePianoStore((s) => s.setScoreLibraryPanelOpen);

  const activeScore = usePianoStore((s) => s.activeScore);
  const scorePlaying = usePianoStore((s) => s.scorePlaying);
  const setScorePlaying = usePianoStore((s) => s.setScorePlaying);
  const setActiveScore = usePianoStore((s) => s.setActiveScore);

  // Initialize hooks
  usePianoSettings(); // Loads settings from localStorage
  useKeyBindings(); // Loads bindings from localStorage
  useKeyboard(); // Activates keyboard input

  // Handle Auth Migration
  const { isSignedIn, isLoaded } = useAuthMigration();

  useAudioInit(); // Silently initializes audio on first user interaction
  useScorePlayback(); // Manages the timer for practice mode

  return (
    <>
      {/* ─── Top Bar ─── */}
      <header className="topbar">
        <div className="topbar-brand">
          <h1 className="topbar-logo">
            <span>Key</span>Flow
          </h1>
        </div>

        <div className="topbar-actions">
          <div className="topbar-status">
            <div className="topbar-status-dot" />
            <span>{audioReady ? 'Ready' : audioLoading ? 'Loading...' : 'Ready to load'}</span>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }} />

          {activeScore && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '12px', background: 'var(--surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '12px', margin: '0 8px', color: 'var(--accent-blue)', fontWeight: 600 }}>
                {activeScore.title}
              </span>
              <button 
                className="btn btn--small" 
                onClick={() => setScorePlaying(!scorePlaying)}
                title={scorePlaying ? "Pause" : "Play"}
                style={{ padding: '4px', background: 'transparent', border: 'none' }}
              >
                {scorePlaying ? <PauseIcon /> : <PlaySmallIcon />}
              </button>
              <button 
                className="btn btn--small" 
                onClick={() => setActiveScore(null)}
                title="Stop Practice"
                style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--accent-red)' }}
              >
                <StopIcon />
              </button>
            </div>
          )}

          <button
            type="button"
            className={`topbar-btn ${scoreLibraryPanelOpen ? 'topbar-btn--active' : ''}`}
            onClick={() => setScoreLibraryPanelOpen(!scoreLibraryPanelOpen)}
            aria-label="Practice Mode Library"
            title="Practice Library"
          >
            <LibraryIcon />
          </button>

          <button
            type="button"
            className={`topbar-btn ${importExportPanelOpen ? 'topbar-btn--active' : ''}`}
            onClick={() => setImportExportPanelOpen(!importExportPanelOpen)}
            aria-label="Import/Export keybindings"
            id="btn-import-export"
          >
            <ImportExportIcon />
          </button>

          <button
            type="button"
            className={`topbar-btn ${keybindingPanelOpen ? 'topbar-btn--active' : ''}`}
            onClick={() => setKeybindingPanelOpen(!keybindingPanelOpen)}
            aria-label="Edit keybindings"
            id="btn-keybindings"
          >
            <KeyboardIcon />
          </button>

          <button
            type="button"
            className={`topbar-btn ${settingsPanelOpen ? 'topbar-btn--active' : ''}`}
            onClick={() => setSettingsPanelOpen(!settingsPanelOpen)}
            aria-label="Piano settings"
            id="btn-settings"
          >
            <SettingsIcon />
          </button>

          {isLoaded && isSignedIn && (
            <div style={{ marginLeft: '8px' }}>
              <UserButton appearance={{ elements: { userButtonAvatarBox: { width: 32, height: 32 } } }} />
            </div>
          )}
        </div>
      </header>

      {/* ─── Sync Banner ─── */}
      {isLoaded && !isSignedIn && <SyncBanner />}

      {/* ─── Loading Bar ─── */}
      {audioLoading && (
        <div className="loading-bar" style={{ width: '100%' }} />
      )}

      {/* ─── Main Content ─── */}
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <FallingNotesCanvas />
        <Piano />
      </main>

      {/* ─── Panels ─── */}
      <SettingsPanel
        isOpen={settingsPanelOpen}
        onClose={() => setSettingsPanelOpen(false)}
      />

      <KeyBindingPanel
        isOpen={keybindingPanelOpen}
        onClose={() => setKeybindingPanelOpen(false)}
      />

      <ImportExportPanel
        isOpen={importExportPanelOpen}
        onClose={() => setImportExportPanelOpen(false)}
      />

      <ScoreLibraryDialog
        isOpen={scoreLibraryPanelOpen}
        onClose={() => setScoreLibraryPanelOpen(false)}
      />
    </>
  );
}

