import React from 'react';
import { BellRing, Check, Clock, Volume2, X } from 'lucide-react';
import { TriggeredAlert } from '../types';

interface AlarmBannerProps {
  alerts: TriggeredAlert[];
  onAcknowledge: (id: string) => void;
  onSnooze: (alert: TriggeredAlert, minutes: number) => void;
  onDismissAll: () => void;
}

export const AlarmBanner: React.FC<AlarmBannerProps> = ({
  alerts,
  onAcknowledge,
  onSnooze,
  onDismissAll,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-16 inset-x-0 z-50 px-4 sm:px-6 pointer-events-none flex flex-col items-center gap-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="pointer-events-auto w-full max-w-xl bg-zinc-900/95 border border-zinc-700/80 shadow-2xl rounded-lg p-3.5 sm:p-4 text-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
              <BellRing className="w-4 h-4 text-zinc-200 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-zinc-400">
                  {alert.sourceType === 'timer'
                    ? 'Timer Complete'
                    : alert.sourceType === 'stopwatch'
                    ? 'Stopwatch Milestone'
                    : 'Recurring Alert'}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  {alert.soundTone}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-100 mt-0.5">
                {alert.title}
              </h4>
              {alert.message && (
                <p className="text-xs text-zinc-400 mt-0.5 max-w-md line-clamp-2">
                  {alert.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {alert.sourceType === 'timer' || alert.sourceType === 'recurring' ? (
              <button
                onClick={() => onSnooze(alert, 5)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors whitespace-nowrap"
                title="Snooze for 5 minutes"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>+5m</span>
              </button>
            ) : null}

            <button
              onClick={() => onAcknowledge(alert.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-950 bg-zinc-100 hover:bg-white rounded transition-colors whitespace-nowrap shadow-sm"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      ))}

      {alerts.length > 1 && (
        <button
          onClick={onDismissAll}
          className="pointer-events-auto text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded-full backdrop-blur-sm transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          <span>Dismiss all ({alerts.length})</span>
        </button>
      )}
    </div>
  );
};
