'use client';

import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { useState } from 'react';

// ─── Sync Banner ─────────────────────────────────────────────────────

export function SyncBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)' }}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>
          You're playing as a guest. 
          {' '}
          <SignInButton mode="modal">
            <button className="btn btn--small" style={{ margin: '0 6px', padding: '2px 8px', height: 'auto', background: 'transparent', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)' }}>Sign In</button>
          </SignInButton>
          {' '}
          or 
          {' '}
          <SignUpButton mode="modal">
            <button className="btn btn--small" style={{ margin: '0 6px', padding: '2px 8px', height: 'auto', background: 'var(--accent-blue)', color: 'white', border: 'none' }}>Sign Up</button>
          </SignUpButton>
          {' '}
          to save and sync your settings across devices.
        </span>
      </div>
      <button 
        type="button" 
        className="banner-dismiss" 
        onClick={() => setVisible(false)}
        aria-label="Dismiss banner"
      >
        ×
      </button>
    </div>
  );
}
