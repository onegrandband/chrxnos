import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Zap,
  Volume2,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CustomReminder, SoundTone, TriggeredAlert } from '../types';
import { formatMinutesLabel, formatRemainingCountdown } from '../utils/format';
import { playTone } from '../utils/sound';
import { CustomToggle } from './ui/CustomToggle';
import { CustomSelect, SelectOption } from './ui/CustomSelect';
import { CustomNumberInput } from './ui/CustomNumberInput';

interface RemindersViewProps {
  reminders: CustomReminder[];
  reminderLogs: TriggeredAlert[];
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onAddReminder: (data: Omit<CustomReminder, 'id' | 'createdAt' | 'triggered'>) => void;
  onSnoozeReminder: (id: string, minutes: number) => void;
  onAcknowledgeLog: (id: string) => void;
  onClearReminderLogs: () => void;
}

const TONE_OPTIONS: SelectOption<SoundTone>[] = [
  { value: 'digital-beep', label: 'Classic Digital Beep' },
  { value: 'zen-chime', label: 'Zen Harmonic Bell (528Hz)' },
  { value: 'marimba', label: 'Acoustic Marimba' },
  { value: 'singing-bowl', label: 'Tibetan Singing Bowl' },
  { value: 'pulse', label: 'Subtle Pulse' },
];

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  reminderLogs,
  onToggleReminder,
  onDeleteReminder,
  onAddReminder,
  onSnoozeReminder,
  onAcknowledgeLog,
  onClearReminderLogs,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [remindMode, setRemindMode] = useState<'duration' | 'target-time'>('duration');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [targetTimeStr, setTargetTimeStr] = useState('16:00');
  const [soundTone, setSoundTone] = useState<SoundTone>('digital-beep');

  const activeReminders = reminders.filter((r) => r.isEnabled && !r.triggered);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let targetTimestamp = Date.now();

    if (remindMode === 'duration') {
      targetTimestamp = Date.now() + durationMinutes * 60 * 1000;
    } else {
      // Calculate timestamp for HH:MM today (or tomorrow if earlier today)
      const [h, m] = targetTimeStr.split(':').map((v) => parseInt(v, 10));
      const targetDate = new Date();
      targetDate.setHours(h || 12, m || 0, 0, 0);
      if (targetDate.getTime() <= Date.now()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      targetTimestamp = targetDate.getTime();
    }

    onAddReminder({
      title: title.trim(),
      note: note.trim() || undefined,
      type: remindMode,
      targetTimestamp,
      durationMinutes: remindMode === 'duration' ? durationMinutes : undefined,
      targetTimeStr: remindMode === 'target-time' ? targetTimeStr : undefined,
      soundTone,
      isEnabled: true,
    });

    setTitle('');
    setNote('');
    setIsAddOpen(false);
  };

  const handleQuickAdd = (quickTitle: string, mins: number, tone: SoundTone) => {
    onAddReminder({
      title: quickTitle,
      type: 'duration',
      targetTimestamp: Date.now() + mins * 60 * 1000,
      durationMinutes: mins,
      soundTone: tone,
      isEnabled: true,
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-zinc-300" />
            Reminders
          </h2>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
            <span>{reminders.length} scheduled</span>
            <span>·</span>
            <span>{activeReminders.length} active</span>
            <span>·</span>
            <span>Computer alerts & Web Audio chimes</span>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-md transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Custom Reminder</span>
        </button>
      </div>

      {/* Quick Launchers Strip */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          One-Click Quick Reminders
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAdd('Quick 10m Check-in', 10, 'zen-chime')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            <Zap className="w-3 h-3 text-zinc-400" />
            <span>In 10 Minutes</span>
          </button>
          <button
            onClick={() => handleQuickAdd('Coffee & Tea Break', 15, 'marimba')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            <span>In 15 Minutes</span>
          </button>
          <button
            onClick={() => handleQuickAdd('Important Sync / Call', 30, 'digital-beep')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            <span>In 30 Minutes</span>
          </button>
          <button
            onClick={() => handleQuickAdd('Wrap Up Session Block', 45, 'singing-bowl')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            <span>In 45 Minutes</span>
          </button>
          <button
            onClick={() => handleQuickAdd('1-Hour Milestone', 60, 'zen-chime')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            <span>In 1 Hour</span>
          </button>
        </div>
      </div>

      {/* Add Custom Reminder Modal / Inline Drawer */}
      {isAddOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-xl border border-zinc-700 bg-zinc-900/95 flex flex-col gap-4 text-zinc-100 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-100">
              Create Custom Reminder
            </span>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-2 p-1 bg-zinc-950 rounded-lg border border-zinc-800 w-fit">
            <button
              type="button"
              onClick={() => setRemindMode('duration')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                remindMode === 'duration'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              In X Minutes
            </button>
            <button
              type="button"
              onClick={() => setRemindMode('target-time')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                remindMode === 'target-time'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              At Specific Time (HH:MM)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-300">Reminder Task</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Check oven, Send status report, Client call"
                className="px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-md text-zinc-100 placeholder:text-zinc-600 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              {remindMode === 'duration' ? (
                <CustomNumberInput
                  label="Trigger After (Minutes)"
                  value={durationMinutes}
                  min={1}
                  max={1440}
                  suffix="min"
                  onChange={setDurationMinutes}
                />
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-zinc-400">
                    Target Time (HH:MM)
                  </label>
                  <input
                    type="time"
                    value={targetTimeStr}
                    onChange={(e) => setTargetTimeStr(e.target.value)}
                    className="px-3 py-2 text-sm font-mono bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-md text-zinc-100 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Additional Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Prepare deck slide 4 before joining"
                className="px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-md text-zinc-100 placeholder:text-zinc-600 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Chime Tone</label>
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
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded-md transition-colors"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 max-w-2xl mx-auto my-2 w-full">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
            <Sparkles className="w-6 h-6 stroke-[1.7]" />
          </div>

          <h3 className="text-lg font-semibold text-zinc-100">Zero Scheduled Reminders</h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md leading-relaxed">
            Create a custom task reminder with a time or duration, or click one of the quick launchers above to start tracking.
          </p>

          <button
            onClick={() => setIsAddOpen(true)}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Custom Reminder</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((reminder) => {
            const isDue = Date.now() >= reminder.targetTimestamp;
            const countdownStr = formatRemainingCountdown(reminder.targetTimestamp);
            const targetDateStr = new Date(reminder.targetTimestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={reminder.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                  reminder.isEnabled && !reminder.triggered
                    ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CustomToggle
                        size="sm"
                        checked={reminder.isEnabled && !reminder.triggered}
                        onChange={() => onToggleReminder(reminder.id)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-100">
                          {reminder.title}
                        </h3>
                        <span className="text-zinc-600">·</span>
                        <span className="text-xs font-mono text-zinc-400">
                          {reminder.type === 'duration' && reminder.durationMinutes
                            ? `${formatMinutesLabel(reminder.durationMinutes)}`
                            : targetDateStr}
                        </span>
                      </div>

                      {reminder.note && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {reminder.note}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          {reminder.soundTone}
                        </span>
                        <span>·</span>
                        <span>Target {targetDateStr}</span>
                        {reminder.triggered && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-400 font-medium">Triggered</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onSnoozeReminder(reminder.id, 5)}
                      title="Snooze for 5 minutes"
                      className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>+5m</span>
                    </button>
                    <button
                      onClick={() => onDeleteReminder(reminder.id)}
                      title="Delete reminder"
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Countdown Strip */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Countdown:</span>
                  </div>

                  <div className="font-mono font-medium tabular-nums">
                    {reminder.triggered ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Triggered
                      </span>
                    ) : reminder.isEnabled ? (
                      <span className="text-zinc-200 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                        {isDue ? 'Due now' : countdownStr}
                      </span>
                    ) : (
                      <span className="text-zinc-600">Paused</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Integrated Reminder History Section */}
      <div className="flex flex-col gap-4 pt-6 border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-zinc-100">
              Reminder History & Fired Alerts
            </h3>
            {reminderLogs.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                {reminderLogs.length} events
              </span>
            )}
          </div>

          {reminderLogs.length > 0 && (
            <button
              onClick={onClearReminderLogs}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {reminderLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-850 rounded-xl bg-zinc-900/20">
            No reminders have triggered yet. When a scheduled reminder finishes, its delivery details and randomized message will be recorded here.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-800/80 border border-zinc-800 rounded-xl bg-zinc-900/40 overflow-hidden">
            {reminderLogs.map((log) => {
              const timeFormatted = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              const dateFormatted = new Date(log.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={log.id}
                  className="flex items-start sm:items-center justify-between p-3.5 hover:bg-zinc-850/40 transition-colors gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        log.acknowledged ? 'bg-zinc-600' : 'bg-emerald-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-200">
                          {log.title}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {timeFormatted}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                        {log.message}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-2.5 h-2.5" />
                          {log.soundTone}
                        </span>
                        <span>·</span>
                        <span>{dateFormatted}</span>
                        <span>·</span>
                        <span className={log.acknowledged ? 'text-zinc-500' : 'text-emerald-400'}>
                          {log.acknowledged ? 'Acknowledged' : 'Active alert'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!log.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeLog(log.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors shrink-0"
                      title="Acknowledge alert"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
