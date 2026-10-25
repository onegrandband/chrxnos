import React from 'react';
import { Check } from 'lucide-react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`group flex items-center gap-2.5 text-left select-none focus:outline-none cursor-pointer ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      <div
        className={`w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all duration-150 border ${
          checked
            ? 'bg-zinc-100 border-zinc-100 text-zinc-950'
            : 'bg-zinc-900 border-zinc-700 group-hover:border-zinc-500'
        }`}
      >
        {checked && <Check className="w-3 h-3 stroke-[3]" />}
      </div>
      {label && <div className="text-xs text-zinc-300">{label}</div>}
    </button>
  );
};
