import React from 'react';

interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
  checked,
  onChange,
  label,
  size = 'md',
  disabled = false,
}) => {
  const isSm = size === 'sm';
  const trackWidth = isSm ? 'w-8 h-4' : 'w-10 h-5';
  const thumbSize = isSm ? 'w-3 h-3' : 'w-4 h-4';
  const translatePos = isSm ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`group relative inline-flex items-center gap-2 cursor-pointer select-none focus:outline-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      <div
        className={`relative inline-flex shrink-0 ${trackWidth} rounded-full transition-colors duration-200 ease-in-out border ${
          checked
            ? 'bg-zinc-100 border-white'
            : 'bg-zinc-900 border-zinc-700/80 group-hover:border-zinc-600'
        }`}
      >
        <span
          className={`pointer-events-none inline-block ${thumbSize} rounded-full transform transition-transform duration-200 ease-in-out mt-[1px] ml-[1px] shadow-sm ${
            checked
              ? `${translatePos} bg-zinc-950`
              : 'translate-x-0 bg-zinc-400 group-hover:bg-zinc-300'
          }`}
        />
      </div>
      {label && <span className="text-xs text-zinc-300">{label}</span>}
    </button>
  );
};
