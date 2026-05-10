'use client';

import { memo } from 'react';

// ─── Slider Component ────────────────────────────────────────────────

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  suffix?: string;
  id?: string;
}

function SliderComponent({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  showValue = true,
  suffix = '',
  id,
}: SliderProps) {
  return (
    <div className="slider-container">
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        id={id}
      />
      {showValue && (
        <span className="slider-value">
          {value}{suffix}
        </span>
      )}
    </div>
  );
}

export const Slider = memo(SliderComponent);
