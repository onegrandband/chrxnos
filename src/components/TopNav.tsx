import React from 'react';
import { Timer, StopCircle, Bell, BellRing, History, Volume2, VolumeX, Settings } from 'lucide-react';

export type ActiveTab = 'timers' | 'stopwatch' | 'reminders' | 'recurring' | 'log';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  unreadAlertCount: number;
  activeTimerCount: number;
  activeReminderCount: number;
  isStopwatchRunning: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  isMuted,
  onToggleMute,
  onOpenSettings,
  unreadAlertCount,
  activeTimerCount,
  activeReminderCount,
  isStopwatchRunning,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-8 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-950">
          <Timer className="w-4 h-4 stroke-[2.2]" />
        </div>
        <span className="text-base font-semibold tracking-wider text-zinc-100 whitespace-nowrap">
          CHRONOS
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onTabChange('timers')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'timers'
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Timers</span>
          {activeTimerCount > 0 && (
            <span className="ml-1 text-[10px] font-mono font-medium px-1.5 py-0.2 bg-zinc-700 text-zinc-200 rounded">
              {activeTimerCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('stopwatch')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'stopwatch'
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <StopCircle className="w-3.5 h-3.5" />
          <span>Stopwatch</span>
          {isStopwatchRunning && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          onClick={() => onTabChange('reminders')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'reminders'
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Reminders</span>
          {activeReminderCount > 0 && (
            <span className="ml-1 text-[10px] font-mono font-medium px-1.5 py-0.2 bg-zinc-700 text-zinc-200 rounded">
              {activeReminderCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('recurring')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'recurring'
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Recurring Alerts</span>
          <span className="md:hidden">Recurring</span>
        </button>

        <button
          onClick={() => onTabChange('log')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'log'
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
          {unreadAlertCount > 0 && (
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
              {unreadAlertCount}
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: Primary Action / Audio Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute alerts' : 'Mute all alerts'}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-md transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-zinc-500" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          title="Notification and sound preferences"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors whitespace-nowrap"
        >
          <Settings className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden md:inline">Preferences</span>
        </button>
      </div>
    </header>
  );
};
