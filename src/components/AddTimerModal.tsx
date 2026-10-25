import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
import { CustomTimer, SoundTone } from '../types';
import { playTone } from '../utils/sound';
import { CustomSelect, SelectOption } from './ui/CustomSelect';
import { CustomNumberInput } from './ui/CustomNumberInput';

interface AddTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTimer: (timer: Omit<CustomTimer, 'id' | 'createdAt' | 'remainingSeconds' | 'isRunning'>) => void;
  defaultTone: SoundTone;
}

const CATEGORIES: { id: CustomTimer['category']; label: string }[] = [
  { id: 'focus', label: 'Deep Focus' },
  { id: 'break', label: 'Rest & Break' },
  { id: 'workout', label: 'Workout & Fitness' },
  { id: 'kitchen', label: 'Kitchen & Brewing' },
  { id: 'meditation', label: 'Mindful Pause' },
  { id: 'custom', label: 'Custom' },
];

const PRESETS = [
  { label: '1m Quick', h: 0, m: 1, s: 0 },
  { label: '3m Brew', h: 0, m: 3, s: 0 },
  { label: '5m Reset', h: 0, m: 5, s: 0 },
  { label: '10m Focus', h: 0, m: 10, s: 0 },
  { label: '15m Break', h: 0, m: 15, s: 0 },
  { label: '25m Pomodoro', h: 0, m: 25, s: 0 },
  { label: '45m Sprint', h: 0, m: 45, s: 0 },
  { label: '60m Block', h: 1, m: 0, s: 0 },
];

const TONE_OPTIONS: SelectOption<SoundTone>[] = [
  { value: 'digital-beep', label: 'Classic Digital Beep' },
  { value: 'zen-chime', label: 'Zen Harmonic Bell (528Hz)' },
  { value: 'marimba', label: 'Acoustic Marimba Arpeggio' },
  { value: 'singing-bowl', label: 'Tibetan Singing Bowl' },
  { value: 'pulse', label: 'Subtle Pulse' },
];

export const AddTimerModal: React.FC<AddTimerModalProps> = ({
  isOpen,
  onClose,
  onAddTimer,
  defaultTone,
}) => {
  const [name, setName] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [category, setCategory] = useState<CustomTimer['category']>('focus');
  const [soundTone, setSoundTone] = useState<SoundTone>(defaultTone);

  if (!isOpen) return null;

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSeconds <= 0) return;

    const timerName = name.trim() || `${minutes}m Custom Timer`;
    onAddTimer({
      name: timerName,
      totalDurationSeconds: totalSeconds,
      category,
      soundTone,
    });
    onClose();
  };

  const setPreset = (h: number, m: number, s: number, label: string) => {
    setHours(h);
    setMinutes(m);
    setSeconds(s);
    if (!name || PRESETS.some((p) => p.label === name)) {
      setName(label);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-zinc-100">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Create Custom Timer</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Set precise duration, category, and alert tone
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Quick Presets Strip */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Quick Duration Presets</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPreset(p.h, p.m, p.s, p.label)}
                  className="px-2.5 py-1 text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded transition-colors whitespace-nowrap"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300">Timer Label</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deep Coding Session, French Press, Yoga Stretch"
              className="px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-md text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
            />
          </div>

          {/* Custom Duration Steppers: H / M / S */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300">Duration (HH : MM : SS)</label>
            <div className="grid grid-cols-3 gap-2">
              <CustomNumberInput
                label="Hours"
                value={hours}
                min={0}
                max={23}
                suffix="h"
                onChange={setHours}
              />
              <CustomNumberInput
                label="Minutes"
                value={minutes}
                min={0}
                max={59}
                suffix="m"
                onChange={setMinutes}
              />
              <CustomNumberInput
                label="Seconds"
                value={seconds}
                min={0}
                max={59}
                suffix="s"
                onChange={setSeconds}
              />
            </div>
          </div>

          {/* Category selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300">Category</label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2 py-1.5 text-xs rounded border transition-colors truncate ${
                    category === cat.id
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Tone via CustomSelect */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">Completion Chime</label>
              <button
                type="button"
                onClick={() => playTone(soundTone, 0.8, false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Test Tone</span>
              </button>
            </div>
            <CustomSelect
              value={soundTone}
              options={TONE_OPTIONS}
              onChange={setSoundTone}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={totalSeconds <= 0}
              className="px-4 py-2 text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded-md transition-colors disabled:opacity-50"
            >
              Create Timer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
