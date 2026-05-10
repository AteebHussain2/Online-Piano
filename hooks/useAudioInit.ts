'use client';

import { useEffect, useRef } from 'react';
import { usePianoStore } from '@/lib/store/pianoStore';
import { initAudio } from '@/lib/audio/synth';

export function useAudioInit() {
  const initialized = useRef(false);

  useEffect(() => {
    const handleInit = async () => {
      if (initialized.current) return;
      initialized.current = true;
      
      const store = usePianoStore.getState();
      if (!store.audioReady && !store.audioLoading) {
        store.setAudioLoading(true);
        await initAudio(() => {
          usePianoStore.getState().setAudioReady(true);
          usePianoStore.getState().setAudioLoading(false);
        });
      }
    };

    // Listen to various interactions
    window.addEventListener('keydown', handleInit, { once: true });
    window.addEventListener('mousedown', handleInit, { once: true });
    window.addEventListener('touchstart', handleInit, { once: true });

    return () => {
      window.removeEventListener('keydown', handleInit);
      window.removeEventListener('mousedown', handleInit);
      window.removeEventListener('touchstart', handleInit);
    };
  }, []);
}
