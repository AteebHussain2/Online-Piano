'use client';

import { useCallback, useMemo } from 'react';
import { PianoKey } from './PianoKey';
import { usePianoStore } from '@/lib/store/pianoStore';
import { usePiano } from '@/hooks/usePiano';
import { ALL_NOTES, WHITE_NOTES } from '@/lib/audio/noteMap';
import { buildNoteLookup } from '@/lib/keybindings/defaults';
import type { NoteInfo } from '@/types/piano';

// ─── Full Piano Component ────────────────────────────────────────────

export function Piano() {
  const { triggerNote, releaseNote } = usePiano();
  const activeKeys = usePianoStore((s) => s.activeKeys);
  const settings = usePianoStore((s) => s.settings);
  const bindings = usePianoStore((s) => s.bindings);

  // Build note → key code reverse lookup
  const noteLookup = useMemo(
    () => buildNoteLookup(bindings.keyboard1, bindings.keyboard2),
    [bindings.keyboard1, bindings.keyboard2]
  );

  // Filter notes by octave range
  const visibleNotes = useMemo(() => {
    const { start, end } = settings.octaveRange;
    return ALL_NOTES.filter((n) => {
      if (n.octave < start) return false;
      if (n.octave > end) return false;
      return true;
    });
  }, [settings.octaveRange]);

  const visibleWhiteNotes = useMemo(
    () => visibleNotes.filter((n) => !n.isBlack),
    [visibleNotes]
  );

  const visibleBlackNotes = useMemo(
    () => visibleNotes.filter((n) => n.isBlack),
    [visibleNotes]
  );

  // Mouse/touch handlers
  const handleNoteStart = useCallback(
    (note: string) => {
      if (settings.enableMousePlay) {
        triggerNote(note, 'mouse');
      }
    },
    [settings.enableMousePlay, triggerNote]
  );

  const handleNoteEnd = useCallback(
    (note: string) => {
      releaseNote(note);
    },
    [releaseNote]
  );

  // Calculate black key position relative to white keys
  function getBlackKeyPosition(blackNote: NoteInfo): number | null {
    // Black keys sit between specific white keys
    // C# between C-D, D# between D-E, F# between F-G, G# between G-A, A# between A-B
    const name = blackNote.name; // e.g. "C#"
    const octave = blackNote.octave;

    // Find the white key to the left of this black key
    const leftWhiteNote = name.replace('#', '');
    const leftWhiteKey = `${leftWhiteNote}${octave}`;

    const leftIndex = visibleWhiteNotes.findIndex((n) => n.note === leftWhiteKey);
    if (leftIndex === -1) return null;

    // Position offsets differ per black key
    const offsets: Record<string, number> = {
      'C#': 0.6,
      'D#': 0.6,
      'F#': 0.6,
      'G#': 0.6,
      'A#': 0.6,
    };

    const offset = offsets[name] ?? 0.6;
    return leftIndex + offset;
  }

  // Key width based on size setting
  const keySizeMap = {
    compact: 32,
    normal: 44,
    wide: 56,
  };

  const whiteKeyWidth = keySizeMap[settings.keySize];
  const totalWidth = visibleWhiteNotes.length * whiteKeyWidth;

  return (
    <div className="piano-container" role="group" aria-label="Piano keyboard">
      <div
        className="piano-scroll"
      >
        <div
          className="piano-keys"
          style={{ width: `${totalWidth}px` }}
        >
          {/* White keys layer */}
          {visibleWhiteNotes.map((noteInfo, index) => {
            const active = activeKeys.get(noteInfo.note);
            const lookup = noteLookup[noteInfo.note];

            return (
              <div
                key={noteInfo.note}
                className="piano-key-wrapper piano-key-wrapper--white"
                style={{
                  left: `${index * whiteKeyWidth}px`,
                  width: `${whiteKeyWidth}px`,
                }}
              >
                <PianoKey
                  note={noteInfo.note}
                  isBlack={false}
                  isActive={!!active}
                  activeSource={active?.source}
                  keyboard1Key={lookup?.keyboard1}
                  keyboard2Key={lookup?.keyboard2}
                  showKeyLabels={settings.showKeyLabels}
                  showNoteNames={settings.showNoteNames}
                  highlightRoot={settings.highlightRootNotes}
                  keyboard1Color={settings.keyboard1Color}
                  keyboard2Color={settings.keyboard2Color}
                  mouseClickColor={settings.mouseClickColor}
                  keySize={settings.keySize}
                  onNoteStart={handleNoteStart}
                  onNoteEnd={handleNoteEnd}
                />
              </div>
            );
          })}

          {/* Black keys layer (overlapping white keys) */}
          {visibleBlackNotes.map((noteInfo) => {
            const pos = getBlackKeyPosition(noteInfo);
            if (pos === null) return null;

            const active = activeKeys.get(noteInfo.note);
            const lookup = noteLookup[noteInfo.note];
            const blackKeyWidth = whiteKeyWidth * 0.58;

            return (
              <div
                key={noteInfo.note}
                className="piano-key-wrapper piano-key-wrapper--black"
                style={{
                  left: `${pos * whiteKeyWidth - blackKeyWidth / 2}px`,
                  width: `${blackKeyWidth}px`,
                }}
              >
                <PianoKey
                  note={noteInfo.note}
                  isBlack={true}
                  isActive={!!active}
                  activeSource={active?.source}
                  keyboard1Key={lookup?.keyboard1}
                  keyboard2Key={lookup?.keyboard2}
                  showKeyLabels={settings.showKeyLabels}
                  showNoteNames={settings.showNoteNames}
                  highlightRoot={false}
                  keyboard1Color={settings.keyboard1Color}
                  keyboard2Color={settings.keyboard2Color}
                  mouseClickColor={settings.mouseClickColor}
                  keySize={settings.keySize}
                  onNoteStart={handleNoteStart}
                  onNoteEnd={handleNoteEnd}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
