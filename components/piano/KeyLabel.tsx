'use client';

import { memo } from 'react';
import type { KeyPressSource } from '@/types/piano';

// ─── Key Label Component ─────────────────────────────────────────────
// Shows the bound keyboard key label(s) on a piano key

interface KeyLabelProps {
  keyboard1Key?: string;   // e.g. "Q"
  keyboard2Key?: string;   // e.g. "Z"
  noteName?: string;       // e.g. "C4"
  showKeyLabel: boolean;
  showNoteName: boolean;
  isBlack: boolean;
  keyboard1Color: string;
  keyboard2Color: string;
}

// Convert e.code to displayable key name
function codeToDisplay(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  const map: Record<string, string> = {
    'BracketLeft': '[',
    'BracketRight': ']',
    'Backslash': '\\',
    'Semicolon': ';',
    'Quote': "'",
    'Comma': ',',
    'Period': '.',
    'Slash': '/',
    'Minus': '-',
    'Equal': '=',
    'Backquote': '`',
    'Space': '⎵',
    'Enter': '↵',
    'Backspace': '⌫',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
  };
  return map[code] || code;
}

function KeyLabelComponent({
  keyboard1Key,
  keyboard2Key,
  noteName,
  showKeyLabel,
  showNoteName,
  isBlack,
  keyboard1Color,
  keyboard2Color,
}: KeyLabelProps) {
  const hasAnyLabel = (showKeyLabel && (keyboard1Key || keyboard2Key)) || (showNoteName && noteName);

  if (!hasAnyLabel) return null;

  return (
    <div className="piano-key-labels">
      {showKeyLabel && keyboard1Key && (
        <span
          className="piano-key-label"
          style={{ color: keyboard1Color }}
        >
          {codeToDisplay(keyboard1Key)}
        </span>
      )}
      {showKeyLabel && keyboard2Key && (
        <span
          className="piano-key-label"
          style={{ color: keyboard2Color }}
        >
          {codeToDisplay(keyboard2Key)}
        </span>
      )}
      {showNoteName && noteName && (
        <span className={`piano-note-name ${isBlack ? 'piano-note-name--black' : ''}`}>
          {noteName}
        </span>
      )}
    </div>
  );
}

export const KeyLabel = memo(KeyLabelComponent);
