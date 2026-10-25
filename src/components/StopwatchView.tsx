import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Flag,
  Copy,
  Check,
  StopCircle,
} from 'lucide-react';
import { StopwatchState } from '../types';
import { formatStopwatchParts, formatStopwatchTime } from '../utils/format';

interface StopwatchViewProps {
  state: StopwatchState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onLap: () => void;
}

export const StopwatchView: React.FC<StopwatchViewProps> = ({
  state,
  onStart,
  onPause,
  onReset,
  onLap,
}) => {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      {/* Stopwatch Hero Section */}
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 sm:p-12 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
          <StopCircle className="w-4 h-4 text-zinc-400" />
          <span>PRECISION HIGH-RESOLUTION STOPWATCH</span>
        </div>

        {/* Digital Readout */}
        <div className="flex items-baseline font-mono text-6xl sm:text-7xl md:text-8xl font-light tracking-tight text-zinc-100 tabular-nums my-6 select-none">
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
        <div className="flex items-center gap-3 sm:gap-4 mt-4">
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
              className="flex items-center gap-2 px-7 py-2.5 text-xs sm:text-sm font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg transition-all shadow-md active:scale-95"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-7 py-2.5 text-xs sm:text-sm font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg transition-all shadow-md active:scale-95"
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

      {/* Lap Times Table */}
      <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/30">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Flag className="w-4 h-4 text-zinc-300" />
              Lap Splits {state.laps.length > 0 && `(${state.laps.length})`}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Individual lap duration, split variation, and cumulative time
            </p>
          </div>

          {state.laps.length > 0 && (
            <button
              onClick={handleCopyLaps}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
              title="Copy all laps to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Laps</span>
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
          <div className="py-12 text-center text-xs text-zinc-500">
            No laps recorded yet. Click &quot;Lap&quot; while timing to log splits.
          </div>
        ) : (
          <div className="flex flex-col max-h-96 overflow-y-auto divide-y divide-zinc-800/80">
            <div className="grid grid-cols-3 text-xs font-mono text-zinc-500 uppercase pb-2 px-3">
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
                    className="grid grid-cols-3 items-center py-2.5 px-3 text-xs font-mono hover:bg-zinc-850/40 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400 font-medium">#{lap.lapNumber}</span>
                      {isFastest && (
                        <span className="text-[10px] text-emerald-400 font-sans font-medium px-1.5 py-0.2 bg-emerald-500/10 rounded border border-emerald-500/20">
                          Fastest
                        </span>
                      )}
                      {isSlowest && (
                        <span className="text-[10px] text-amber-400 font-sans font-medium px-1.5 py-0.2 bg-amber-500/10 rounded border border-amber-500/20">
                          Slowest
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-center tabular-nums font-medium ${
                        isFastest
                          ? 'text-emerald-300'
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
  );
};
