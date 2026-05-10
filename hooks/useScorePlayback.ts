'use client';

import { useEffect, useRef } from 'react';
import { usePianoStore } from '@/lib/store/pianoStore';

export function useScorePlayback() {
  const lastTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = (timestamp: number) => {
      const state = usePianoStore.getState();
      
      if (!state.scorePlaying || !state.activeScore) {
        lastTimeRef.current = null;
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      let nextTime = state.scoreTime + delta;

      // Practice Mode logic: Stop if we need to wait for a keypress
      if (state.scoreMode === 'practice') {
        const upcomingNotes = state.activeScore.notes.filter(
          (n) => n.timeMs >= state.scoreTime && n.timeMs <= nextTime
        );

        // Find if there is an upcoming note that hasn't been pressed
        let shouldPauseAt: number | null = null;

        for (const note of upcomingNotes) {
          if (!state.activeKeys.has(note.note)) {
            // We must pause at this note's exact start time
            if (shouldPauseAt === null || note.timeMs < shouldPauseAt) {
              shouldPauseAt = note.timeMs;
            }
          }
        }

        if (shouldPauseAt !== null) {
          nextTime = shouldPauseAt;
        }
      }

      // Check if we reached the end of the score
      const maxTime = Math.max(...state.activeScore.notes.map(n => n.timeMs + n.durationMs)) + 2000;
      
      if (nextTime > maxTime) {
        usePianoStore.getState().setScorePlaying(false);
        usePianoStore.getState().setScoreTime(0);
      } else {
        usePianoStore.getState().setScoreTime(nextTime);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
}
