import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Maximize2,
  Trash2,
  Volume2,
  Sparkles,
  Zap,
  Timer as TimerIcon,
} from 'lucide-react';
import { CustomTimer, SoundTone } from '../types';
import { formatTimerSeconds } from '../utils/format';

interface TimersViewProps {
  timers: CustomTimer[];
  onToggleTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  onDeleteTimer: (id: string) => void;
  onAddSeconds: (id: string, seconds: number) => void;
  onOpenFocusMode: (timer: CustomTimer) => void;
  onOpenAddModal: () => void;
  onQuickAddPreset: (name: string, seconds: number, category: CustomTimer['category'], tone: SoundTone) => void;
}

export const TimersView: React.FC<TimersViewProps> = ({
  timers,
  onToggleTimer,
  onResetTimer,
  onDeleteTimer,
  onAddSeconds,
  onOpenFocusMode,
  onOpenAddModal,
  onQuickAddPreset,
}) => {
  const runningTimers = timers.filter((t) => t.isRunning);

  return (
    <div className="flex flex-col gap-6">
      {/* View Header with 1-line breadcrumb/action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
            <TimerIcon className="w-5 h-5 text-zinc-300" />
            Custom Timers
          </h2>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
            <span>{timers.length} configured</span>
            <span>·</span>
            <span>{runningTimers.length} running</span>
            <span>·</span>
            <span>Background execution active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Custom Timer</span>
          </button>
        </div>
      </div>

      {/* Quick Launch Presets Strip (shown at top when timers exist) */}
      {timers.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            Quick One-Click Launchers
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onQuickAddPreset('Pomodoro 25m', 25 * 60, 'focus', 'zen-chime')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            >
              <Zap className="w-3 h-3 text-zinc-400" />
              <span>25m Pomodoro</span>
            </button>
            <button
              onClick={() => onQuickAddPreset('Short Rest 5m', 5 * 60, 'break', 'marimba')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            >
              <span>5m Rest</span>
            </button>
            <button
              onClick={() => onQuickAddPreset('Deep Sprint 45m', 45 * 60, 'focus', 'singing-bowl')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            >
              <span>45m Sprint</span>
            </button>
            <button
              onClick={() => onQuickAddPreset('10m Mindful', 10 * 60, 'meditation', 'zen-chime')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            >
              <span>10m Mindful</span>
            </button>
            <button
              onClick={() => onQuickAddPreset('3m Espresso', 3 * 60, 'kitchen', 'digital-beep')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
            >
              <span>3m Brew</span>
            </button>
          </div>
        </div>
      )}

      {/* When Empty: Dedicated Minimalist Starter Card */}
      {timers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 max-w-2xl mx-auto my-4 w-full">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
            <Sparkles className="w-6 h-6 stroke-[1.7]" />
          </div>

          <h3 className="text-lg font-semibold text-zinc-100">Zero Active Timers</h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md leading-relaxed">
            Configure a personalized custom timer with your desired duration and chime tone, or launch an instant preset below.
          </p>

          <button
            onClick={onOpenAddModal}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Custom Timer</span>
          </button>

          {/* Clean One-Click Launchers Inside Empty State */}
          <div className="w-full mt-10 pt-8 border-t border-zinc-800/80 flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-3">
              Or One-Click Launchers
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg">
              <button
                onClick={() => onQuickAddPreset('Pomodoro 25m', 25 * 60, 'focus', 'zen-chime')}
                className="flex items-center justify-center gap-1.5 p-2.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                <span>25m Pomodoro</span>
              </button>
              <button
                onClick={() => onQuickAddPreset('Short Rest 5m', 5 * 60, 'break', 'marimba')}
                className="flex items-center justify-center gap-1.5 p-2.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
              >
                <span>5m Short Rest</span>
              </button>
              <button
                onClick={() => onQuickAddPreset('Deep Sprint 45m', 45 * 60, 'focus', 'singing-bowl')}
                className="flex items-center justify-center gap-1.5 p-2.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
              >
                <span>45m Deep Sprint</span>
              </button>
              <button
                onClick={() => onQuickAddPreset('15m Coffee Rest', 15 * 60, 'break', 'marimba')}
                className="flex items-center justify-center gap-1.5 p-2.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
              >
                <span>15m Coffee Break</span>
              </button>
              <button
                onClick={() => onQuickAddPreset('10m Mindful', 10 * 60, 'meditation', 'zen-chime')}
                className="flex items-center justify-center gap-1.5 p-2.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
              >
                <span>10m Mindful</span>
              </button>
              <button
                onClick={() => onQuickAddPreset('3m Espresso', 3 * 60, 'kitchen', 'digital-beep')}
                className="flex items-center justify-center gap-1.5 p-2.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
              >
                <span>3m Espresso Brew</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timers.map((timer) => {
            const total = timer.totalDurationSeconds;
            const remaining = Math.max(0, timer.remainingSeconds);
            const progress = total > 0 ? (total - remaining) / total : 0;
            const percent = Math.min(100, Math.round(progress * 100));

            return (
              <div
                key={timer.id}
                className={`flex flex-col justify-between p-5 rounded-xl border transition-all ${
                  timer.isRunning
                    ? 'bg-zinc-900/90 border-zinc-650 shadow-md ring-1 ring-zinc-700/50'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Card Top: Title, Category, and Focus/Delete options */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
                      {timer.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                      <span className="capitalize">{timer.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-zinc-500" />
                        {timer.soundTone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenFocusMode(timer)}
                      title="Enter Focus Fullscreen"
                      className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTimer(timer.id)}
                      title="Delete timer"
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Central Time Readout */}
                <div className="my-5 flex flex-col items-center justify-center">
                  <span
                    className={`font-mono text-4xl sm:text-5xl font-light tracking-tight tabular-nums select-none ${
                      timer.isRunning ? 'text-zinc-50' : 'text-zinc-300'
                    }`}
                  >
                    {formatTimerSeconds(remaining)}
                  </span>

                  {/* Progress bar */}
                  <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full transition-all duration-300 ${
                        timer.isRunning ? 'bg-zinc-100' : 'bg-zinc-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="w-full flex items-center justify-between text-[11px] text-zinc-500 font-mono mt-1.5">
                    <span>{percent}% done</span>
                    <span>Total {formatTimerSeconds(total)}</span>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAddSeconds(timer.id, 60)}
                      title="Add 1 minute"
                      className="px-2 py-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-800/70 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors"
                    >
                      +1m
                    </button>
                    <button
                      onClick={() => onAddSeconds(timer.id, 300)}
                      title="Add 5 minutes"
                      className="px-2 py-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-100 bg-zinc-800/70 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors"
                    >
                      +5m
                    </button>
                    <button
                      onClick={() => onResetTimer(timer.id)}
                      title="Reset timer"
                      className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onToggleTimer(timer.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      timer.isRunning
                        ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                        : 'bg-zinc-100 text-zinc-950 hover:bg-white shadow-sm'
                    }`}
                  >
                    {timer.isRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
