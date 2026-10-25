import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface CustomNumberInputProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  suffix?: string;
  label?: string;
}

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  value,
  min = 0,
  max = 999,
  step = 1,
  onChange,
  suffix,
  label,
}) => {
  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10);
    if (isNaN(raw)) {
      onChange(min);
    } else {
      onChange(Math.max(min, Math.min(max, raw)));
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <span className="text-[11px] text-zinc-400 font-medium">{label}</span>}
      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden focus-within:border-zinc-500 transition-colors">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 flex items-center justify-center relative px-1">
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            className="w-full text-center font-mono text-sm font-medium bg-transparent text-zinc-100 outline-none tabular-nums"
          />
          {suffix && (
            <span className="text-[10px] font-mono text-zinc-500 pointer-events-none ml-0.5">
              {suffix}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
