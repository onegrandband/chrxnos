import React from 'react';
import { History, Trash2, CheckCircle2, Volume2 } from 'lucide-react';
import { TriggeredAlert } from '../types';

interface AlertLogViewProps {
  logs: TriggeredAlert[];
  onClearLogs: () => void;
  onAcknowledge: (id: string) => void;
}

export const AlertLogView: React.FC<AlertLogViewProps> = ({
  logs,
  onClearLogs,
  onAcknowledge,
}) => {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-300" />
            Alert History & Notifications
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Audit log of all triggered countdowns, stopwatch milestones, and recurring alerts
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <History className="w-8 h-8 text-zinc-600 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-200">No alert history</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            When custom timers complete, stopwatch checkpoints trigger, or recurring alerts fire, they will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-800/80 border border-zinc-800 rounded-xl bg-zinc-900/40 overflow-hidden">
          {logs.map((log) => {
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
                className="flex items-center justify-between p-4 hover:bg-zinc-850/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      log.acknowledged ? 'bg-zinc-600' : 'bg-emerald-400'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-200">
                        {log.title}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-xs font-mono text-zinc-400 uppercase">
                        {log.sourceType}
                      </span>
                    </div>

                    {log.message && (
                      <p className="text-xs text-zinc-400 mt-0.5">{log.message}</p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        {log.soundTone}
                      </span>
                      <span>·</span>
                      <span>{log.acknowledged ? 'Acknowledged' : 'Active alert'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-xs font-mono text-zinc-500 tabular-nums">
                    <div>{timeFormatted}</div>
                    <div className="text-[10px]">{dateFormatted}</div>
                  </div>

                  {!log.acknowledged && (
                    <button
                      onClick={() => onAcknowledge(log.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                      title="Acknowledge alert"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
