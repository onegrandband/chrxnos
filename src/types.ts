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

export interface StopwatchState {
  elapsedMs: number;
  isRunning: boolean;
  startTime: number | null;
  accumulatedMs: number;
  laps: LapTime[];
}

export interface CustomReminder {
  id: string;
  title: string;
  note?: string;
  type: 'duration' | 'target-time'; // duration (e.g. in 15 mins) or target-time (e.g. at 14:30)
  targetTimestamp: number;
  durationMinutes?: number;
  targetTimeStr?: string;
  soundTone: SoundTone;
  isEnabled: boolean;
  createdAt: number;
  triggered: boolean;
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
  sourceType: 'timer' | 'stopwatch' | 'reminder' | 'recurring';
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
