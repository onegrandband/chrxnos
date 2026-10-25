import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CustomSliderProps {
  value: number; // e.g. 0 to 1
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  min = 0,
  max = 1,
  step = 0.05,
  onChange,
  disabled = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clampedValue = Math.min(max, Math.max(min, value));
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawVal = min + ratio * (max - min);

      // Quantize to step
      const stepsCount = Math.round((rawVal - min) / step);
      const steppedVal = Math.min(max, Math.max(min, min + stepsCount * step));
      onChange(Number(steppedVal.toFixed(4)));
    },
    [min, max, step, onChange, disabled]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(max, clampedValue + step);
      onChange(Number(next.toFixed(4)));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(min, clampedValue - step);
      onChange(Number(next.toFixed(4)));
    }
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuenow={clampedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={`group relative w-full h-6 flex items-center cursor-pointer select-none touch-none focus:outline-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      {/* Track Background */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/60 transition-colors group-hover:border-zinc-600">
        {/* Fill bar */}
        <div
          className="h-full bg-zinc-100 transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Custom Thumb */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-zinc-100 border-2 border-zinc-950 shadow-md transition-transform duration-75 flex items-center justify-center ${
          isDragging ? 'scale-125' : 'group-hover:scale-110'
        }`}
        style={{ left: `${percentage}%` }}
      >
        <div className="w-1 h-1 rounded-full bg-zinc-950" />
      </div>
    </div>
  );
};
