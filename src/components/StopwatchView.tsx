import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Bell,
  Plus,
  Trash2,
  Copy,
  Check,
  Volume2,
} from 'lucide-react';
import { StopwatchState, StopwatchMilestoneReminder, SoundTone } from '../types';
import { formatStopwatchParts, formatStopwatchTime } from '../utils/format';
import { playTone } from '../utils/sound';
import { CustomToggle } from './ui/CustomToggle';
import { CustomSelect, SelectOption } from './ui/CustomSelect';
import { CustomNumberInput } from './ui/CustomNumberInput';

interface StopwatchViewProps {
  state: StopwatchState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onLap: () => void;
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<StopwatchMilestoneReminder, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
}

const TONE_OPTIONS: SelectOption<SoundTone>[] = [
  { value: 'marimba', label: 'Acoustic Marimba' },
  { value: 'zen-chime', label: 'Zen Harmonic Bell' },
  { value: 'digital-beep', label: 'Digital Beep' },
  { value: 'singing-bowl', label: 'Tibetan Singing Bowl' },
  { value: 'pulse', label: 'Subtle Pulse' },
];

export const StopwatchView: React.FC<StopwatchViewProps> = ({
  state,
  onStart,
  onPause,
  onReset,
  onLap,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newMinutes, setNewMinutes] = useState(5);
  const [newSeconds, setNewSeconds] = useState(0);
  const [newType, setNewType] = useState<'single' | 'interval'>('single');
  const [newTone, setNewTone] = useState<SoundTone>('marimba');

  const { hoursStr, minutesStr, secondsStr, centiStr } = formatStopwatchParts(state.elapsedMs);

  // Determine fastest and slowest lap for visual highlight
  let fastestLapIdx = -1;
  let slowestLapIdx = -1;
  if (state.laps.length > 1) {
    let minTime = Infinity;
    let maxTime = -Infinity;
    state.laps.forEach((lap, idx) => {
      if (lap.lapTimeMs < minTime) {
        minTime = lap.lapTimeMs;
        fastestLapIdx = idx;
      }
      if (lap.lapTimeMs > maxTime) {
        maxTime = lap.lapTimeMs;
        slowestLapIdx = idx;
      }
    });
  }

  const handleCopyLaps = () => {
    if (state.laps.length === 0) return;
    const text = state.laps
      .slice()
      .reverse()
      .map(
        (lap) =>
          `Lap ${lap.lapNumber}: ${formatStopwatchTime(lap.lapTimeMs)} (Total: ${formatStopwatchTime(lap.totalTimeMs)})`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMs = (newMinutes * 60 + newSeconds) * 1000;
    if (targetMs <= 0) return;

    onAddReminder({
      label: newLabel.trim() || (newType === 'interval' ? `Every ${newMinutes}m Cadence` : `${newMinutes}m Milestone`),
      type: newType,
      targetMs,
      intervalMs: newType === 'interval' ? targetMs : undefined,
      soundTone: newTone,
      enabled: true,
    });

    setNewLabel('');
    setIsAddReminderOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Stopwatch Hero Section */}
      <div className="flex flex-col items-center justify-center py-6 sm:py-10 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
          PRECISION STOPWATCH & MILESTONE REMINDERS
        </span>

        {/* Digital Readout */}
        <div className="flex items-baseline font-mono text-5xl sm:text-7xl md:text-8xl font-light tracking-tight text-zinc-100 tabular-nums my-4 select-none">
          {hoursStr && (
            <>
              <span>{hoursStr}</span>
              <span className="text-zinc-600 mx-1">:</span>
            </>
          )}
          <span>{minutesStr}</span>
          <span className="text-zinc-600 mx-1">:</span>
          <span>{secondsStr}</span>
          <span className="text-zinc-600 mx-0.5">.</span>
          <span className="text-3xl sm:text-5xl text-zinc-400 font-normal">{centiStr}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4 mt-6">
          <button
            onClick={onReset}
            disabled={state.elapsedMs === 0 && !state.isRunning}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          {state.isRunning ? (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg transition-all shadow-md active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg transition-all shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{state.elapsedMs > 0 ? 'Resume' : 'Start'}</span>
            </button>
          )}

          <button
            onClick={onLap}
            disabled={!state.isRunning}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Flag className="w-4 h-4" />
            <span>Lap</span>
          </button>
        </div>
      </div>

      {/* Two Column Section: Stopwatch Reminders (Left) + Lap Times Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stopwatch Milestone Reminders */}
        <div className="flex flex-col gap-4 p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/30">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-zinc-300" />
                Stopwatch Reminders
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Chimes & alerts while stopwatch runs
              </p>
            </div>

            <button
              onClick={() => setIsAddReminderOpen(!isAddReminderOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reminder</span>
            </button>
          </div>

          {/* Add Reminder Inline Form */}
          {isAddReminderOpen && (
            <form
              onSubmit={handleCreateReminder}
              className="p-4 rounded-lg border border-zinc-750 bg-zinc-900/90 flex flex-col gap-3.5 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">
                  New Stopwatch Alert
                </span>
                <div className="flex items-center gap-1 p-0.5 bg-zinc-800 rounded">
                  <button
                    type="button"
                    onClick={() => setNewType('single')}
                    className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                      newType === 'single'
                        ? 'bg-zinc-700 text-zinc-100 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Target Milestone
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('interval')}
                    className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                      newType === 'interval'
                        ? 'bg-zinc-700 text-zinc-100 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Every X Mins
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder={newType === 'interval' ? 'e.g. 5-minute pacing reminder' : 'e.g. 10m target reached'}
                className="px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded text-zinc-100 placeholder:text-zinc-600 outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <CustomNumberInput
                  label="Minutes"
                  value={newMinutes}
                  min={0}
                  max={120}
                  suffix="m"
                  onChange={setNewMinutes}
                />
                <CustomNumberInput
                  label="Seconds"
                  value={newSeconds}
                  min={0}
                  max={59}
                  suffix="s"
                  onChange={setNewSeconds}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">Tone</span>
                  <button
                    type="button"
                    onClick={() => playTone(newTone, 0.8, false)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test</span>
                  </button>
                </div>
                <CustomSelect
                  value={newTone}
                  options={TONE_OPTIONS}
                  onChange={setNewTone}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddReminderOpen(false)}
                  className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-950 rounded hover:bg-white"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          )}

          {/* Reminders List */}
          <div className="flex flex-col gap-2">
            {state.reminders.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
                <span>No reminders configured.</span>
                <span className="text-zinc-600 text-[11px]">
                  Click &quot;Add Reminder&quot; to set checkpoints during stopwatch runs.
                </span>
              </div>
            ) : (
              state.reminders.map((reminder) => {
                const targetFormatted = formatStopwatchTime(reminder.targetMs);
                const isPassed = state.elapsedMs >= reminder.targetMs;

                return (
                  <div
                    key={reminder.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      reminder.enabled
                        ? isPassed
                          ? 'bg-zinc-900/80 border-zinc-700/80'
                          : 'bg-zinc-900/40 border-zinc-800'
                        : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CustomToggle
                        size="sm"
                        checked={reminder.enabled}
                        onChange={() => onToggleReminder(reminder.id)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-zinc-200">
                            {reminder.label}
                          </span>
                          <span className="text-zinc-600">·</span>
                          <span className="font-mono text-xs text-zinc-400 tabular-nums">
                            {reminder.type === 'interval'
                              ? `Every ${Math.round((reminder.intervalMs || 60000) / 60000)}m`
                              : targetFormatted}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            {reminder.soundTone}
                          </span>
                          {reminder.enabled && isPassed && reminder.type === 'single' && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-400">Passed</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteReminder(reminder.id)}
                      title="Delete reminder"
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lap Times Table */}
        <div className="flex flex-col gap-4 p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/30">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Flag className="w-4 h-4 text-zinc-300" />
                Lap Splits ({state.laps.length})
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Split timing, delta variations, and lap history
              </p>
            </div>

            {state.laps.length > 0 && (
              <button
                onClick={handleCopyLaps}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                title="Copy all laps to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Laps</span>
                  </>
                )}
              </button>
            )}
          </div>

          {state.laps.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No laps recorded yet. Click &quot;Lap&quot; while timing to record splits.
            </div>
          ) : (
            <div className="flex flex-col max-h-80 overflow-y-auto divide-y divide-zinc-800/80">
              <div className="grid grid-cols-3 text-xs font-mono text-zinc-500 uppercase pb-2 px-2">
                <span>Lap</span>
                <span className="text-center">Split Time</span>
                <span className="text-right">Total Time</span>
              </div>
              {state.laps
                .slice()
                .reverse()
                .map((lap, reverseIdx) => {
                  const actualIdx = state.laps.length - 1 - reverseIdx;
                  const isFastest = actualIdx === fastestLapIdx;
                  const isSlowest = actualIdx === slowestLapIdx;

                  return (
                    <div
                      key={lap.lapNumber}
                      className="grid grid-cols-3 items-center py-2.5 px-2 text-xs font-mono hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400 font-medium">#{lap.lapNumber}</span>
                        {isFastest && (
                          <span className="text-[10px] text-emerald-400 font-sans font-medium">
                            Fastest
                          </span>
                        )}
                        {isSlowest && (
                          <span className="text-[10px] text-amber-400 font-sans font-medium">
                            Slowest
                          </span>
                        )}
                      </div>

                      <div
                        className={`text-center tabular-nums ${
                          isFastest
                            ? 'text-emerald-300 font-medium'
                            : isSlowest
                            ? 'text-amber-300'
                            : 'text-zinc-200'
                        }`}
                      >
                        {formatStopwatchTime(lap.lapTimeMs)}
                      </div>

                      <div className="text-right text-zinc-400 tabular-nums">
                        {formatStopwatchTime(lap.totalTimeMs)}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
