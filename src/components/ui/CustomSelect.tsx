import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (val: T) => void;
  placeholder?: string;
  size?: 'sm' | 'md';
}

export function CustomSelect<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = 'Select option',
  size = 'md',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const paddingClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-2 text-xs sm:text-sm';

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 bg-zinc-900 border rounded-md text-zinc-100 transition-colors focus:outline-none ${paddingClass} ${
          isOpen ? 'border-zinc-500 ring-1 ring-zinc-500' : 'border-zinc-800 hover:border-zinc-700'
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-zinc-200' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#121215] border border-zinc-750 rounded-lg shadow-2xl p-1 max-h-56 overflow-y-auto animate-in fade-in duration-100">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-300 hover:bg-zinc-850 hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon}
                  <div className="flex flex-col truncate">
                    <span className="truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="text-[10px] text-zinc-500 truncate">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-zinc-100 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
