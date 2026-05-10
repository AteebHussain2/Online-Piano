'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { usePianoStore } from '@/lib/store/pianoStore';
import { SCORE_LIBRARY } from '@/lib/data/scores';
import type { MusicScore } from '@/types/score';

interface ScoreLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScoreLibraryDialog({ isOpen, onClose }: ScoreLibraryDialogProps) {
  const setActiveScore = usePianoStore(s => s.setActiveScore);
  const updateSettings = usePianoStore(s => s.updateSettings);
  const updateBindings = usePianoStore(s => s.updateBindings);
  const setScorePlaying = usePianoStore(s => s.setScorePlaying);
  const setScoreMode = usePianoStore(s => s.setScoreMode);
  
  const [selectedScore, setSelectedScore] = useState<MusicScore | null>(null);
  const [showPresetPrompt, setShowPresetPrompt] = useState(false);

  const handleSelectScore = (score: MusicScore) => {
    setSelectedScore(score);
    if (score.recommendedSettings || score.recommendedKeybindings) {
      setShowPresetPrompt(true);
    } else {
      loadScore(score, false);
    }
  };

  const loadScore = (score: MusicScore, applyPresets: boolean) => {
    if (applyPresets) {
      if (score.recommendedSettings) {
        updateSettings(score.recommendedSettings);
      }
      if (score.recommendedKeybindings) {
        const currentBindings = usePianoStore.getState().bindings;
        updateBindings({
          ...currentBindings,
          ...score.recommendedKeybindings,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    setActiveScore(score);
    setScoreMode('practice');
    setScorePlaying(true);
    setShowPresetPrompt(false);
    onClose();
  };

  if (showPresetPrompt && selectedScore) {
    return (
      <Dialog isOpen={isOpen} onClose={() => setShowPresetPrompt(false)} title="Recommended Presets">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ color: 'var(--foreground-muted)' }}>
            <strong>{selectedScore.title}</strong> has recommended piano settings and keybindings for the best experience.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn--primary" onClick={() => loadScore(selectedScore, true)}>
            Apply Presets & Play
          </button>
          <button className="btn" onClick={() => loadScore(selectedScore, false)}>
            Keep My Settings
          </button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Music Library" width="600px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SCORE_LIBRARY.map((score) => (
          <div 
            key={score.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: 'var(--surface-hover)',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)' }}>
                {score.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                {score.artist} • {score.difficulty}
              </p>
            </div>
            <button 
              className="btn btn--primary btn--small"
              onClick={() => handleSelectScore(score)}
            >
              Practice
            </button>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
