'use client';

import { useEffect, useCallback } from 'react';

// ─── Drawer Component ────────────────────────────────────────────────

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`drawer-overlay ${isOpen ? 'drawer-overlay--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`drawer ${isOpen ? 'drawer--open' : ''}`}
        role="dialog"
        aria-modal={isOpen}
        aria-label={title}
      >
        <div className="drawer-header">
          <h2 className="drawer-title">{title}</h2>
          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Close panel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </>
  );
}
