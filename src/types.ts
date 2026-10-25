export type SoundTone =
  | 'zen-chime'
  | 'marimba'
  | 'digital-beep'
  | 'singing-bowl'
  | 'pulse';

export interface CustomTimer {
  id: string;
  name: string;
  totalDurationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  category: 'focus' | 'break' | 'workout' | 'kitchen' | 'meditation' | 'custom';
  soundTone: SoundTone;
  createdAt: number;
  lastTickTimestamp?: number;
}

export interface LapTime {
  lapNumber: number;
  lapTimeMs: number;
  totalTimeMs: number;
  timestamp: number;
}

export interface StopwatchMilestoneReminder {
  id: string;
  label: string;
  type: 'single' | 'interval'; // single = alert once at targetMs, interval = alert every intervalMs (e.g. every 5 min)
  targetMs: number; // for single: e.g. 300,000 ms (5 min)
  intervalMs?: number; // for interval: e.g. 60,000 ms (every 1 min)
  soundTone: SoundTone;
  enabled: boolean;
  lastTriggeredLapIndex?: number;
  lastTriggeredMs?: number;
}

export interface StopwatchState {
  elapsedMs: number;
  isRunning: boolean;
  startTime: number | null;
  accumulatedMs: number;
  laps: LapTime[];
  reminders: StopwatchMilestoneReminder[];
}

export interface RecurringAlert {
  id: string;
  title: string;
  description: string;
  intervalMinutes: number;
  category: 'hydration' | 'eyes' | 'posture' | 'movement' | 'focus' | 'custom';
  soundTone: SoundTone;
  isEnabled: boolean;
  createdAt: number;
  nextTriggerTimestamp: number;
  lastTriggeredTimestamp?: number;
  triggerCount: number;
}

export interface TriggeredAlert {
  id: string;
  sourceType: 'timer' | 'stopwatch' | 'recurring';
  sourceId: string;
  title: string;
  message: string;
  timestamp: number;
  soundTone: SoundTone;
  acknowledged: boolean;
}

export interface AudioSettings {
  volume: number; // 0 to 1
  isMuted: boolean;
  defaultSoundTone: SoundTone;
  browserNotificationsEnabled: boolean;
}
