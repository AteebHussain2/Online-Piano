'use client';

import { memo } from 'react';

// ─── Toggle Component ────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

function ToggleComponent({ checked, onChange, label, id }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      className={`toggle ${checked ? 'toggle--active' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <div className="toggle-knob" />
    </button>
  );
}

export const Toggle = memo(ToggleComponent);
