import React, { useState } from 'react';
import {
  BellRing,
  Plus,
  Trash2,
  Play,
  Volume2,
  Clock,
  Sparkles,
  Zap,
  History,
  CheckCircle2,
} from 'lucide-react';
import { RecurringAlert, SoundTone, TriggeredAlert } from '../types';
import { formatMinutesLabel, formatRemainingCountdown } from '../utils/format';
import { playTone } from '../utils/sound';
import { CustomToggle } from './ui/CustomToggle';
import { CustomSelect, SelectOption } from './ui/CustomSelect';
import { CustomNumberInput } from './ui/CustomNumberInput';

interface RecurringAlertsViewProps {
  alerts: RecurringAlert[];
  recurringLogs: TriggeredAlert[];
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  onAddAlert: (newAlert: Omit<RecurringAlert, 'id' | 'createdAt' | 'nextTriggerTimestamp' | 'triggerCount'>) => void;
  onTestTrigger: (alert: RecurringAlert) => void;
  onAcknowledgeLog: (id: string) => void;
  onClearRecurringLogs: () => void;
}

const CATEGORY_MAP: Record<RecurringAlert['category'], string> = {
  hydration: 'Hydration',
  eyes: 'Eye Care & 20-20-20',
  posture: 'Posture & Ergonomics',
  movement: 'Physical Movement',
  focus: 'Mental Focus',
  custom: 'Custom Cadence',
};

const CATEGORY_OPTIONS: SelectOption<RecurringAlert['category']>[] = [
  { value: 'hydration', label: 'Hydration' },
  { value: 'eyes', label: 'Eye Care & 20-20-20' },
  { value: 'posture', label: 'Posture & Ergonomics' },
  { value: 'movement', label: 'Physical Movement' },
  { value: 'focus', label: 'Mental Focus' },
  { value: 'custom', label: 'Custom Cadence' },
];

const TONE_OPTIONS: SelectOption<SoundTone>[] = [
  { value: 'marimba', label: 'Acoustic Marimba' },
  { value: 'zen-chime', label: 'Zen Harmonic Bell' },
  { value: 'digital-beep', label: 'Digital Beep' },
  { value: 'singing-bowl', label: 'Tibetan Singing Bowl' },
  { value: 'pulse', label: 'Subtle Pulse' },
];

export const RecurringAlertsView: React.FC<RecurringAlertsViewProps> = ({
  alerts,
  recurringLogs,
  onToggleAlert,
  onDeleteAlert,
  onAddAlert,
  onTestTrigger,
  onAcknowledgeLog,
  onClearRecurringLogs,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [category, setCategory] = useState<RecurringAlert['category']>('hydration');
  const [soundTone, setSoundTone] = useState<SoundTone>('marimba');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || intervalMinutes <= 0) return;

    onAddAlert({
      title: title.trim(),
      description: description.trim(),
      intervalMinutes,
      category,
      soundTone,
      isEnabled: true,
    });

    setTitle('');
    setDescription('');
    setIsAddOpen(false);
  };

  const handleQuickAdd = (
    quickTitle: string,
    quickDesc: string,
    quickMins: number,
    quickCat: RecurringAlert['category'],
    quickTone: SoundTone
  ) => {
    onAddAlert({
      title: quickTitle,
      description: quickDesc,
      intervalMinutes: quickMins,
      category: quickCat,
      soundTone: quickTone,
      isEnabled: true,
    });
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-zinc-300" />
            Recurring Notification Alerts
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Autonomous repeating reminders with audio chimes and system notifications
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded-md transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Recurring Alert</span>
        </button>
      </div>

      {/* Quick Launch Presets Strip */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          One-Click Cadence Launchers
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              handleQuickAdd(
                'Hydration Check',
                'Drink a glass of cold water to stay cognitively sharp.',
                30,
                'hydration',
                'marimba'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            <Zap className="w-3 h-3 text-zinc-400" />
            <span>Water (Every 30m)</span>
          </button>

          <button
            onClick={() =>
              handleQuickAdd(
                '20-20-20 Eye Rest',
                'Shift vision to an object 20 feet away for 20 seconds.',
                20,
                'eyes',
                'zen-chime'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            <span>Eye Rest (Every 20m)</span>
          </button>

          <button
            onClick={() =>
              handleQuickAdd(
                'Spine & Posture Check',
                'Adjust seating, roll shoulders, and uncross legs.',
                45,
                'posture',
                'pulse'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            <span>Posture (Every 45m)</span>
          </button>

          <button
            onClick={() =>
              handleQuickAdd(
                'Hourly Walk & Stretch',
                'Stand up, stretch legs and walk for 2 minutes.',
                60,
                'movement',
                'singing-bowl'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            <span>Stand & Walk (Every 1h)</span>
          </button>
        </div>
      </div>

      {/* Add Custom Alert Modal / Drawer */}
      {isAddOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-xl border border-zinc-700 bg-zinc-900/95 flex flex-col gap-4 text-zinc-100 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-100">
              Configure New Recurring Cadence Alert
            </span>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-300">Alert Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hydration, Eye Break, Standup check-in"
                className="px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-md text-zinc-100 placeholder:text-zinc-600 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <CustomNumberInput
                label="Recurrence Cadence (Minutes)"
                value={intervalMinutes}
                min={1}
                max={1440}
                suffix="min"
                onChange={setIntervalMinutes}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Guidance Description / Action Prompt (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Focus eyes into the distance for 20s, drink 250ml water"
              className="px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 focus:border-zinc-500 rounded-md text-zinc-100 placeholder:text-zinc-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-300">Category</label>
              <CustomSelect
                value={category}
                options={CATEGORY_OPTIONS}
                onChange={setCategory}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Sound Tone</label>
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
              Save Recurring Alert
            </button>
          </div>
        </form>
      )}

      {/* Alerts Active Grid */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <Sparkles className="w-8 h-8 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-200">
            No recurring alerts active
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md">
            Click one of the one-click cadence launchers above or create a custom recurring alert to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const countdownStr = formatRemainingCountdown(alert.nextTriggerTimestamp);

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                  alert.isEnabled
                    ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CustomToggle
                        size="sm"
                        checked={alert.isEnabled}
                        onChange={() => onToggleAlert(alert.id)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-100">
                          {alert.title}
                        </h3>
                        <span className="text-zinc-600">·</span>
                        <span className="font-mono text-xs text-zinc-400">
                          Every {formatMinutesLabel(alert.intervalMinutes)}
                        </span>
                      </div>

                      {alert.description && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {alert.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-2">
                        <span>{CATEGORY_MAP[alert.category] || alert.category}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          {alert.soundTone}
                        </span>
                        <span>·</span>
                        <span>Fired {alert.triggerCount}×</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onTestTrigger(alert)}
                      title="Test alert tone & notification right now"
                      className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAlert(alert.id)}
                      title="Delete recurring alert"
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
                    <span>Next trigger in:</span>
                  </div>

                  <div className="font-mono font-medium tabular-nums">
                    {alert.isEnabled ? (
                      <span className="text-zinc-200 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                        {countdownStr}
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

      {/* Integrated Recurring Alert History Section */}
      <div className="flex flex-col gap-4 pt-6 border-t border-zinc-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-zinc-100">
              Recurring Alert History
            </h3>
            {recurringLogs.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                {recurringLogs.length} events
              </span>
            )}
          </div>

          {recurringLogs.length > 0 && (
            <button
              onClick={onClearRecurringLogs}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {recurringLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-850 rounded-xl bg-zinc-900/20">
            No recurring alerts have triggered yet. When recurring intervals fire, their randomized alert messages and delivery timestamps will appear here.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-800/80 border border-zinc-800 rounded-xl bg-zinc-900/40 overflow-hidden">
            {recurringLogs.map((log) => {
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
