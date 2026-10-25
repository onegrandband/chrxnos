/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CustomTimer,
  StopwatchState,
  StopwatchMilestoneReminder,
  RecurringAlert,
  TriggeredAlert,
  AudioSettings,
  SoundTone,
} from './types';
import {
  DEFAULT_TIMERS,
  DEFAULT_STOPWATCH_REMINDERS,
  DEFAULT_RECURRING_ALERTS,
} from './utils/defaults';
import { playTone, sendBrowserNotification } from './utils/sound';
import { formatTimerSeconds, formatStopwatchParts } from './utils/format';
import { getRandomAlertMessage } from './utils/messages';
import { TopNav, ActiveTab } from './components/TopNav';
import { TimersView } from './components/TimersView';
import { StopwatchView } from './components/StopwatchView';
import { RecurringAlertsView } from './components/RecurringAlertsView';
import { AlertLogView } from './components/AlertLogView';
import { AlarmBanner } from './components/AlarmBanner';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { FocusTimerModal } from './components/FocusTimerModal';
import { AddTimerModal } from './components/AddTimerModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';

const STORAGE_KEYS = {
  TIMERS: 'chronos_timers_v2',
  STOPWATCH: 'chronos_stopwatch_v2',
  RECURRING: 'chronos_recurring_v2',
  LOGS: 'chronos_logs_v2',
  SETTINGS: 'chronos_settings_v2',
};

// Clean legacy v1 keys if present to ensure clean slate
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('chronos_timers_v1');
    localStorage.removeItem('chronos_stopwatch_v1');
    localStorage.removeItem('chronos_recurring_v1');
  } catch {}
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('timers');

  // Timers State
  const [timers, setTimers] = useState<CustomTimer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TIMERS;
  });

  // Stopwatch State
  const [stopwatch, setStopwatch] = useState<StopwatchState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOPWATCH);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isRunning: false,
          startTime: null,
        };
      }
    } catch {}
    return {
      elapsedMs: 0,
      isRunning: false,
      startTime: null,
      accumulatedMs: 0,
      laps: [],
      reminders: DEFAULT_STOPWATCH_REMINDERS,
    };
  });

  // Recurring Alerts State
  const [recurringAlerts, setRecurringAlerts] = useState<RecurringAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_RECURRING_ALERTS;
  });

  // Triggered Alerts (in-app banner) & Log History
  const [activeAlarms, setActiveAlarms] = useState<TriggeredAlert[]>([]);
  const [alertLogs, setAlertLogs] = useState<TriggeredAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Preferences & Sound
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      volume: 0.8,
      isMuted: false,
      defaultSoundTone: 'zen-chime',
      browserNotificationsEnabled:
        typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted',
    };
  });

  // Modals
  const [focusTimer, setFocusTimer] = useState<CustomTimer | null>(null);
  const [isAddTimerOpen, setIsAddTimerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMERS, JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.STOPWATCH,
      JSON.stringify({
        ...stopwatch,
        isRunning: false,
        startTime: null,
      })
    );
  }, [stopwatch]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringAlerts));
  }, [recurringAlerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(alertLogs.slice(0, 100)));
  }, [alertLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(audioSettings));
  }, [audioSettings]);

  // Dispatch alert helper
  const triggerAlert = useCallback(
    (alert: Omit<TriggeredAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
      const newAlert: TriggeredAlert = {
        ...alert,
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        acknowledged: false,
      };

      // Play synthesized audio tone
      playTone(newAlert.soundTone, audioSettings.volume, audioSettings.isMuted);

      // Fire desktop browser push notification
      sendBrowserNotification(newAlert.title, {
        body: newAlert.message,
        tag: newAlert.sourceId,
      });

      setActiveAlarms((prev) => [newAlert, ...prev]);
      setAlertLogs((prev) => [newAlert, ...prev]);
    },
    [audioSettings]
  );

  // Auto-request notifications when page loads so computer receives alerts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
          .then((perm) => {
            if (perm === 'granted') {
              setAudioSettings((s) => ({ ...s, browserNotificationsEnabled: true }));
              sendBrowserNotification('Chronos Alerts Activated', {
                body: 'Your computer will now receive real-time alerts for all timers, stopwatch milestones, and recurring checks.',
              });
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // 1. Timers Engine (Runs every 1000ms using drift-corrected time)
  useEffect(() => {
    const hasRunningTimer = timers.some((t) => t.isRunning);
    if (!hasRunningTimer) return;

    const interval = setInterval(() => {
      setTimers((currentTimers) => {
        let changed = false;
        const next = currentTimers.map((timer) => {
          if (!timer.isRunning) return timer;
          changed = true;
          const nextRemaining = timer.remainingSeconds - 1;

          if (nextRemaining <= 0) {
            // Trigger completion with one of 10 randomized messages
            const randomizedMsg = getRandomAlertMessage('timer');
            triggerAlert({
              sourceType: 'timer',
              sourceId: timer.id,
              title: `${timer.name} Complete!`,
              message: randomizedMsg,
              soundTone: timer.soundTone,
            });

            return {
              ...timer,
              remainingSeconds: 0,
              isRunning: false,
            };
          }

          return {
            ...timer,
            remainingSeconds: nextRemaining,
          };
        });

        // Also keep Focus mode in sync if open
        if (focusTimer) {
          const updated = next.find((t) => t.id === focusTimer.id);
          if (updated) setFocusTimer(updated);
        }

        return changed ? next : currentTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timers, triggerAlert, focusTimer]);

  // 2. Stopwatch High-Precision Engine & Milestone Monitor
  const stopwatchStartTimeRef = useRef<number | null>(null);
  const stopwatchAccumulatedRef = useRef<number>(0);
  const stopwatchRunningRef = useRef<boolean>(false);
  const stopwatchRemindersRef = useRef(stopwatch.reminders);

  useEffect(() => {
    stopwatchRemindersRef.current = stopwatch.reminders;
  }, [stopwatch.reminders]);

  useEffect(() => {
    if (!stopwatch.isRunning) {
      stopwatchRunningRef.current = false;
      return;
    }

    stopwatchRunningRef.current = true;
    stopwatchStartTimeRef.current = performance.now();
    stopwatchAccumulatedRef.current = stopwatch.elapsedMs;

    let animId: number;

    const tick = () => {
      if (!stopwatchRunningRef.current) return;
      const now = performance.now();
      const delta = now - (stopwatchStartTimeRef.current || now);
      const currentElapsed = stopwatchAccumulatedRef.current + delta;

      // Check milestone reminders
      stopwatchRemindersRef.current.forEach((reminder) => {
        if (!reminder.enabled) return;

        if (reminder.type === 'single') {
          // Check if crossed targetMs
          if (
            currentElapsed >= reminder.targetMs &&
            (!reminder.lastTriggeredMs || reminder.lastTriggeredMs < reminder.targetMs)
          ) {
            reminder.lastTriggeredMs = currentElapsed;
            const randomMsg = getRandomAlertMessage('stopwatch');
            triggerAlert({
              sourceType: 'stopwatch',
              sourceId: reminder.id,
              title: `Stopwatch Milestone: ${reminder.label}`,
              message: randomMsg,
              soundTone: reminder.soundTone,
            });
          }
        } else if (reminder.type === 'interval' && reminder.intervalMs) {
          // Recurring cadence during stopwatch run
          const interval = reminder.intervalMs;
          const currentLapCount = Math.floor(currentElapsed / interval);
          const lastLapCount = reminder.lastTriggeredMs
            ? Math.floor(reminder.lastTriggeredMs / interval)
            : 0;

          if (currentLapCount > lastLapCount && currentLapCount > 0) {
            reminder.lastTriggeredMs = currentElapsed;
            const randomMsg = getRandomAlertMessage('stopwatch');
            triggerAlert({
              sourceType: 'stopwatch',
              sourceId: reminder.id,
              title: `Stopwatch Cadence: ${reminder.label}`,
              message: randomMsg,
              soundTone: reminder.soundTone,
            });
          }
        }
      });

      setStopwatch((prev) => ({
        ...prev,
        elapsedMs: currentElapsed,
      }));

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      stopwatchRunningRef.current = false;
    };
  }, [stopwatch.isRunning, triggerAlert]);

  // 3. Recurring Alerts Engine (checks every 2 seconds)
  useEffect(() => {
    const hasEnabledAlerts = recurringAlerts.some((a) => a.isEnabled);
    if (!hasEnabledAlerts) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setRecurringAlerts((currentAlerts) => {
        let changed = false;
        const updated = currentAlerts.map((alert) => {
          if (!alert.isEnabled) return alert;

          if (now >= alert.nextTriggerTimestamp) {
            changed = true;
            const randomMsg = getRandomAlertMessage('recurring');
            const alertText = alert.description ? `${alert.description} · ${randomMsg}` : randomMsg;

            triggerAlert({
              sourceType: 'recurring',
              sourceId: alert.id,
              title: alert.title,
              message: alertText,
              soundTone: alert.soundTone,
            });

            return {
              ...alert,
              lastTriggeredTimestamp: now,
              nextTriggerTimestamp: now + alert.intervalMinutes * 60 * 1000,
              triggerCount: alert.triggerCount + 1,
            };
          }
          return alert;
        });

        return changed ? updated : currentAlerts;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [recurringAlerts, triggerAlert]);

  // Document Title Synchronization
  useEffect(() => {
    const runningTimer = timers.find((t) => t.isRunning);
    if (runningTimer) {
      document.title = `(${formatTimerSeconds(runningTimer.remainingSeconds)}) ${runningTimer.name} · Chronos`;
      return;
    }

    if (stopwatch.isRunning) {
      const { minutesStr, secondsStr } = formatStopwatchParts(stopwatch.elapsedMs);
      document.title = `(${minutesStr}:${secondsStr}) Stopwatch · Chronos`;
      return;
    }

    document.title = 'Chronos — Minimalist Timers, Stopwatch & Recurring Alerts';
  }, [timers, stopwatch.isRunning, stopwatch.elapsedMs]);

  // Timer Handlers
  const handleToggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.isRunning;
          // If starting from 0, reset first
          const rem = t.remainingSeconds <= 0 ? t.totalDurationSeconds : t.remainingSeconds;
          return { ...t, isRunning: nextState, remainingSeconds: rem };
        }
        return t;
      })
    );
  };

  const handleResetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: false, remainingSeconds: t.totalDurationSeconds } : t))
    );
  };

  const handleDeleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
    if (focusTimer?.id === id) setFocusTimer(null);
  };

  const handleAddSeconds = (id: string, secs: number) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newRemaining = t.remainingSeconds + secs;
          const newTotal = Math.max(t.totalDurationSeconds, newRemaining);
          return { ...t, remainingSeconds: newRemaining, totalDurationSeconds: newTotal };
        }
        return t;
      })
    );
  };

  const handleAddCustomTimer = (
    data: Omit<CustomTimer, 'id' | 'createdAt' | 'remainingSeconds' | 'isRunning'>
  ) => {
    const newTimer: CustomTimer = {
      ...data,
      id: `timer-${Date.now()}`,
      remainingSeconds: data.totalDurationSeconds,
      isRunning: false,
      createdAt: Date.now(),
    };
    setTimers((prev) => [newTimer, ...prev]);
  };

  const handleQuickAddPreset = (
    name: string,
    seconds: number,
    category: CustomTimer['category'],
    tone: SoundTone
  ) => {
    const newTimer: CustomTimer = {
      id: `timer-${Date.now()}`,
      name,
      totalDurationSeconds: seconds,
      remainingSeconds: seconds,
      isRunning: true,
      category,
      soundTone: tone,
      createdAt: Date.now(),
    };
    setTimers((prev) => [newTimer, ...prev]);
  };

  // Stopwatch Handlers
  const handleStartStopwatch = () => {
    setStopwatch((prev) => ({ ...prev, isRunning: true }));
  };

  const handlePauseStopwatch = () => {
    setStopwatch((prev) => ({ ...prev, isRunning: false }));
  };

  const handleResetStopwatch = () => {
    setStopwatch((prev) => ({
      ...prev,
      elapsedMs: 0,
      isRunning: false,
      startTime: null,
      accumulatedMs: 0,
      laps: [],
      reminders: prev.reminders.map((r) => ({ ...r, lastTriggeredMs: undefined })),
    }));
  };

  const handleLapStopwatch = () => {
    setStopwatch((prev) => {
      const currentLapTotal = prev.elapsedMs;
      const prevTotal = prev.laps.length > 0 ? prev.laps[prev.laps.length - 1].totalTimeMs : 0;
      const lapTime = currentLapTotal - prevTotal;

      const newLap = {
        lapNumber: prev.laps.length + 1,
        lapTimeMs: lapTime,
        totalTimeMs: currentLapTotal,
        timestamp: Date.now(),
      };

      return {
        ...prev,
        laps: [...prev.laps, newLap],
      };
    });
  };

  const handleToggleStopwatchReminder = (id: string) => {
    setStopwatch((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    }));
  };

  const handleAddStopwatchReminder = (data: Omit<StopwatchMilestoneReminder, 'id'>) => {
    const newReminder: StopwatchMilestoneReminder = {
      ...data,
      id: `sw-rem-${Date.now()}`,
    };
    setStopwatch((prev) => ({
      ...prev,
      reminders: [...prev.reminders, newReminder],
    }));
  };

  const handleDeleteStopwatchReminder = (id: string) => {
    setStopwatch((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }));
  };

  // Recurring Alerts Handlers
  const handleToggleRecurringAlert = (id: string) => {
    setRecurringAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const enabled = !a.isEnabled;
          return {
            ...a,
            isEnabled: enabled,
            nextTriggerTimestamp: enabled ? Date.now() + a.intervalMinutes * 60 * 1000 : a.nextTriggerTimestamp,
          };
        }
        return a;
      })
    );
  };

  const handleDeleteRecurringAlert = (id: string) => {
    setRecurringAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddRecurringAlert = (
    data: Omit<RecurringAlert, 'id' | 'createdAt' | 'nextTriggerTimestamp' | 'triggerCount'>
  ) => {
    const newAlert: RecurringAlert = {
      ...data,
      id: `rec-${Date.now()}`,
      createdAt: Date.now(),
      nextTriggerTimestamp: Date.now() + data.intervalMinutes * 60 * 1000,
      triggerCount: 0,
    };
    setRecurringAlerts((prev) => [newAlert, ...prev]);
  };

  const handleTestRecurringAlert = (alert: RecurringAlert) => {
    const randomMsg = getRandomAlertMessage('recurring');
    triggerAlert({
      sourceType: 'recurring',
      sourceId: alert.id,
      title: `${alert.title} (Test Alert)`,
      message: alert.description ? `${alert.description} · ${randomMsg}` : randomMsg,
      soundTone: alert.soundTone,
    });
  };

  // Banner Actions
  const handleAcknowledgeAlert = (id: string) => {
    setActiveAlarms((prev) => prev.filter((a) => a.id !== id));
    setAlertLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, acknowledged: true } : log))
    );
  };

  const handleSnoozeAlert = (alert: TriggeredAlert, minutes: number) => {
    setActiveAlarms((prev) => prev.filter((a) => a.id !== alert.id));

    if (alert.sourceType === 'timer') {
      // Add minutes to the timer and restart
      const secs = minutes * 60;
      setTimers((prev) =>
        prev.map((t) =>
          t.id === alert.sourceId
            ? { ...t, remainingSeconds: secs, totalDurationSeconds: secs, isRunning: true }
            : t
        )
      );
    } else if (alert.sourceType === 'recurring') {
      // Reschedule recurring alert
      setRecurringAlerts((prev) =>
        prev.map((a) =>
          a.id === alert.sourceId
            ? { ...a, nextTriggerTimestamp: Date.now() + minutes * 60 * 1000 }
            : a
        )
      );
    }
  };

  const handleDismissAllAlarms = () => {
    setActiveAlarms([]);
    setAlertLogs((prev) => prev.map((l) => ({ ...l, acknowledged: true })));
  };

  const unreadAlertCount = alertLogs.filter((l) => !l.acknowledged).length;
  const runningTimersCount = timers.filter((t) => t.isRunning).length;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* Top Bar Contract Navigation */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMuted={audioSettings.isMuted}
        onToggleMute={() => setAudioSettings((s) => ({ ...s, isMuted: !s.isMuted }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        unreadAlertCount={unreadAlertCount}
        activeTimerCount={runningTimersCount}
        isStopwatchRunning={stopwatch.isRunning}
      />

      {/* Notification Permission Banner on page load */}
      <NotificationPermissionBanner
        onPermissionGranted={() =>
          setAudioSettings((s) => ({ ...s, browserNotificationsEnabled: true }))
        }
      />

      {/* Floating Alert Notifications Banner */}
      <AlarmBanner
        alerts={activeAlarms}
        onAcknowledge={handleAcknowledgeAlert}
        onSnooze={handleSnoozeAlert}
        onDismissAll={handleDismissAllAlarms}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {activeTab === 'timers' && (
          <TimersView
            timers={timers}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            onDeleteTimer={handleDeleteTimer}
            onAddSeconds={handleAddSeconds}
            onOpenFocusMode={(timer) => setFocusTimer(timer)}
            onOpenAddModal={() => setIsAddTimerOpen(true)}
            onQuickAddPreset={handleQuickAddPreset}
          />
        )}

        {activeTab === 'stopwatch' && (
          <StopwatchView
            state={stopwatch}
            onStart={handleStartStopwatch}
            onPause={handlePauseStopwatch}
            onReset={handleResetStopwatch}
            onLap={handleLapStopwatch}
            onToggleReminder={handleToggleStopwatchReminder}
            onAddReminder={handleAddStopwatchReminder}
            onDeleteReminder={handleDeleteStopwatchReminder}
          />
        )}

        {activeTab === 'recurring' && (
          <RecurringAlertsView
            alerts={recurringAlerts}
            recurringLogs={alertLogs.filter((l) => l.sourceType === 'recurring')}
            onToggleAlert={handleToggleRecurringAlert}
            onDeleteAlert={handleDeleteRecurringAlert}
            onAddAlert={handleAddRecurringAlert}
            onTestTrigger={handleTestRecurringAlert}
            onAcknowledgeLog={handleAcknowledgeAlert}
            onClearRecurringLogs={() =>
              setAlertLogs((prev) => prev.filter((l) => l.sourceType !== 'recurring'))
            }
          />
        )}

        {activeTab === 'log' && (
          <AlertLogView
            logs={alertLogs}
            onClearLogs={() => setAlertLogs([])}
            onAcknowledge={handleAcknowledgeAlert}
          />
        )}
      </main>

      {/* Fullscreen Zen Focus Mode for active timer */}
      <FocusTimerModal
        timer={focusTimer}
        isOpen={!!focusTimer}
        onClose={() => setFocusTimer(null)}
        onTogglePlay={handleToggleTimer}
        onReset={handleResetTimer}
        onAddSeconds={handleAddSeconds}
      />

      {/* Add Custom Timer Dialog */}
      <AddTimerModal
        isOpen={isAddTimerOpen}
        onClose={() => setIsAddTimerOpen(false)}
        onAddTimer={handleAddCustomTimer}
        defaultTone={audioSettings.defaultSoundTone}
      />

      {/* Audio & Notification Preferences Modal */}
      <AudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={audioSettings}
        onUpdateSettings={(updated) => setAudioSettings((s) => ({ ...s, ...updated }))}
      />

      {/* Clean quiet footer */}
      <footer className="mt-auto py-6 px-4 border-t border-zinc-900 text-center text-xs text-zinc-600">
        <div className="flex items-center justify-center gap-2">
          <span>Chronos Precision Engine</span>
          <span>·</span>
          <span>Web Audio API Synthesis</span>
          <span>·</span>
          <span>Local Storage Persistence</span>
        </div>
      </footer>
    </div>
  );
}
