'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePianoStore } from '@/lib/store/pianoStore';

export function useAuthMigration() {
  const { isSignedIn, user, isLoaded } = useUser();
  const settings = usePianoStore((s) => s.settings);
  const bindings = usePianoStore((s) => s.bindings);
  const updateSettings = usePianoStore((s) => s.updateSettings);
  const updateBindings = usePianoStore((s) => s.updateBindings);
  
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (isSignedIn && user && !hasSynced.current) {
      hasSynced.current = true;
      
      const syncData = async () => {
        try {
          // 1. Try to fetch from DB
          const settingsRes = await fetch('/api/settings');
          const settingsData = await settingsRes.json();
          
          if (settingsData.source === 'database') {
            // Merge DB settings into local state
            updateSettings(settingsData.settings);
          } else {
            // Guest -> Auth: Push local settings to DB
            await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ settings }),
            });
          }

          const bindingsRes = await fetch('/api/keybindings');
          const bindingsData = await bindingsRes.json();
          
          if (bindingsData.source === 'database' && bindingsData.bindings.length > 0) {
            // Load latest binding set
            const latest = bindingsData.bindings[0];
            updateBindings({
              id: latest.id,
              name: latest.name,
              keyboard1: latest.keyboard1,
              keyboard2: latest.keyboard2,
              createdAt: latest.createdAt,
              updatedAt: latest.updatedAt
            });
          } else {
            // Guest -> Auth: Push local bindings to DB
            await fetch('/api/keybindings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: bindings.name,
                keyboard1: bindings.keyboard1,
                keyboard2: bindings.keyboard2
              }),
            });
          }
        } catch (error) {
          console.error("Migration error:", error);
        }
      };

      syncData();
    }
  }, [isLoaded, isSignedIn, user, settings, bindings, updateSettings, updateBindings]);

  return { isLoaded, isSignedIn };
}
