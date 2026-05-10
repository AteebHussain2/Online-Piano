'use client';

import { memo, useCallback } from 'react';
import { KeyLabel } from './KeyLabel';
import type { KeyPressSource } from '@/types/piano';

// ─── PianoKey Component ──────────────────────────────────────────────

interface PianoKeyProps {
  note: string;
  isBlack: boolean;
  isActive: boolean;
  activeSource?: KeyPressSource;
  keyboard1Key?: string;
  keyboard2Key?: string;
  showKeyLabels: boolean;
  showNoteNames: boolean;
  highlightRoot: boolean;
  keyboard1Color: string;
  keyboard2Color: string;
  mouseClickColor: string;
  keySize: 'compact' | 'normal' | 'wide';
  onNoteStart: (note: string) => void;
  onNoteEnd: (note: string) => void;
}

function PianoKeyComponent({
  note,
  isBlack,
  isActive,
  activeSource,
  keyboard1Key,
  keyboard2Key,
  showKeyLabels,
  showNoteNames,
  highlightRoot,
  keyboard1Color,
  keyboard2Color,
  mouseClickColor,
  keySize,
  onNoteStart,
  onNoteEnd,
}: PianoKeyProps) {
  // Determine highlight color based on source
  const getHighlightColor = (): string | undefined => {
    if (!isActive || !activeSource) return undefined;
    switch (activeSource) {
      case 'keyboard1': return keyboard1Color;
      case 'keyboard2': return keyboard2Color;
      case 'mouse': return mouseClickColor;
    }
  };

  const highlightColor = getHighlightColor();
  const isRoot = note.startsWith('C') && !note.includes('#');

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onNoteStart(note);
  }, [note, onNoteStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onNoteEnd(note);
  }, [note, onNoteEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isActive && activeSource === 'mouse') {
      onNoteEnd(note);
    }
  }, [note, isActive, activeSource, onNoteEnd]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onNoteStart(note);
  }, [note, onNoteStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onNoteEnd(note);
  }, [note, onNoteEnd]);

  // Build class names
  const classes = [
    'piano-key',
    isBlack ? 'piano-key--black' : 'piano-key--white',
    isActive ? 'piano-key--active' : '',
    highlightRoot && isRoot && !isBlack ? 'piano-key--root' : '',
    `piano-key--${keySize}`,
  ].filter(Boolean).join(' ');

  // Dynamic styles for active highlight
  const dynamicStyle: React.CSSProperties = {};
  if (highlightColor && isActive) {
    dynamicStyle.backgroundColor = highlightColor;
    if (isBlack) {
      dynamicStyle.boxShadow = `0 0 12px ${highlightColor}60, inset 0 -2px 4px rgba(0,0,0,0.3)`;
    } else {
      dynamicStyle.boxShadow = `0 0 16px ${highlightColor}40, inset 0 -3px 6px rgba(0,0,0,0.1)`;
    }
  }

  return (
    <button
      type="button"
      className={classes}
      style={dynamicStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={`Piano key ${note}`}
      data-note={note}
      id={`piano-key-${note.replace('#', 's')}`}
    >
      <KeyLabel
        keyboard1Key={keyboard1Key}
        keyboard2Key={keyboard2Key}
        noteName={note}
        showKeyLabel={showKeyLabels}
        showNoteName={showNoteNames}
        isBlack={isBlack}
        keyboard1Color={keyboard1Color}
        keyboard2Color={keyboard2Color}
      />
    </button>
  );
}

export const PianoKey = memo(PianoKeyComponent);
