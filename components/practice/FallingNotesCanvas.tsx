'use client';

import { useEffect, useRef, useState } from 'react';
import { usePianoStore } from '@/lib/store/pianoStore';

// Settings for visual falling notes
const PIXELS_PER_SECOND = 200;
const CANVAS_HEIGHT = 400; // How high the falling note area is

export function FallingNotesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const activeScore = usePianoStore(s => s.activeScore);
  const scoreTime = usePianoStore(s => s.scoreTime);
  const activeKeys = usePianoStore(s => s.activeKeys);
  const bindings = usePianoStore(s => s.bindings);
  
  // We need to know where each key is drawn on the piano to align the falling blocks.
  // For simplicity, we can do a flex layout matching the piano, or we can use DOM queries
  // to find the center of each key. Let's use DOM queries continuously.
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!activeScore) return;

      const timeNow = usePianoStore.getState().scoreTime;

      // Get positions of physical keys dynamically
      // Since piano keys might resize, we fetch them every frame
      // This is relatively fast for 88 DOM nodes.
      const keyNodes = document.querySelectorAll('.piano-key');
      const keyMap = new Map<string, DOMRect>();
      
      const canvasRect = canvas.getBoundingClientRect();

      keyNodes.forEach(node => {
        const note = node.getAttribute('data-note');
        if (note) {
          const rect = node.getBoundingClientRect();
          // Relative to canvas
          keyMap.set(note, {
            ...rect,
            x: rect.x - canvasRect.x,
            y: rect.y - canvasRect.y,
            toJSON: () => {}
          } as DOMRect);
        }
      });

      // Draw active/upcoming notes
      activeScore.notes.forEach(note => {
        const keyRect = keyMap.get(note.note);
        if (!keyRect) return;

        // Note duration height
        const height = (note.durationMs / 1000) * PIXELS_PER_SECOND;
        
        // Distance from the *bottom* of the canvas
        // When timeNow == note.timeMs, the bottom of the note should hit the bottom of the canvas.
        const distanceToTarget = ((note.timeMs - timeNow) / 1000) * PIXELS_PER_SECOND;
        
        // Y position of the TOP of the note
        const y = canvas.height - distanceToTarget - height;

        // If it's completely off screen (below bottom or above top), don't draw
        if (y > canvas.height || y + height < 0) return;

        const isPlaying = timeNow >= note.timeMs && timeNow <= note.timeMs + note.durationMs;
        const isHit = isPlaying && activeKeys.has(note.note);

        // Draw note block
        const isBlackKey = note.note.includes('#');
        const color = isHit ? '#10B981' : (isBlackKey ? '#3B82F6' : '#F59E0B');
        
        ctx.fillStyle = color;
        // Make falling notes slightly thinner than the key itself
        const margin = 2;
        ctx.fillRect(keyRect.x + margin, y, keyRect.width - margin * 2, height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.strokeRect(keyRect.x + margin, y, keyRect.width - margin * 2, height);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeScore, activeKeys]); // re-bind if score changes

  // Auto-resize canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = CANVAS_HEIGHT;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!activeScore) return null;

  return (
    <div style={{ width: '100%', height: `${CANVAS_HEIGHT}px`, position: 'relative', background: 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {/* Hit line */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, transparent, var(--accent-blue), transparent)',
        boxShadow: '0 0 10px var(--accent-blue)',
        zIndex: 10
      }} />
    </div>
  );
}
