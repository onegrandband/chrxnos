import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Minimize2,
  Plus,
  Volume2,
} from 'lucide-react';
import { CustomTimer } from '../types';
import { formatTimerSeconds } from '../utils/format';

interface FocusTimerModalProps {
  timer: CustomTimer | null;
  isOpen: boolean;
  onClose: () => void;
  onTogglePlay: (id: string) => void;
  onReset: (id: string) => void;
  onAddSeconds: (id: string, seconds: number) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  timer,
  isOpen,
  onClose,
  onTogglePlay,
  onReset,
  onAddSeconds,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space' && timer) {
        e.preventDefault();
        onTogglePlay(timer.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, timer, onClose, onTogglePlay]);

  if (!isOpen || !timer) return null;

  const total = timer.totalDurationSeconds;
  const remaining = Math.max(0, timer.remainingSeconds);
  const progressRatio = total > 0 ? (total - remaining) / total : 0;
  const percent = Math.min(100, Math.round(progressRatio * 100));

  // Circular SVG geometry
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            FOCUS MODE
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-sm font-medium text-zinc-300">{timer.name}</span>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-md transition-colors"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Focus (Esc)</span>
        </button>
      </div>

      {/* Main Dial Viewport */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 320 320">
            {/* Background ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-zinc-800/80"
            />
            {/* Active progress ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-zinc-200 transition-all duration-300"
            />
          </svg>

          {/* Center digital readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="font-mono text-5xl sm:text-6xl font-light tracking-tight text-zinc-100 tabular-nums">
              {formatTimerSeconds(remaining)}
            </span>
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
              <span className="font-mono">{percent}% elapsed</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                {timer.soundTone}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => onReset(timer.id)}
            title="Reset timer"
            className="p-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-colors border border-zinc-800"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => onTogglePlay(timer.id)}
            className="w-16 h-16 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            title={timer.isRunning ? 'Pause' : 'Start'}
          >
            {timer.isRunning ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddSeconds(timer.id, 60)}
              title="Add 1 minute"
              className="px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-md border border-zinc-700/60 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              1m
            </button>
            <button
              onClick={() => onAddSeconds(timer.id, 300)}
              title="Add 5 minutes"
              className="px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-md border border-zinc-700/60 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              5m
            </button>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="text-center text-xs text-zinc-600 font-mono">
        Spacebar to play/pause · Esc to exit
      </div>
    </div>
  );
};
