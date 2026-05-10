'use client';

import { memo } from 'react';

// ─── Tooltip Component ───────────────────────────────────────────────

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

function TooltipComponent({ text, children }: TooltipProps) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className="tooltip">{text}</div>
    </div>
  );
}

export const Tooltip = memo(TooltipComponent);
