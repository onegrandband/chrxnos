export function formatTimerSeconds(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatStopwatchParts(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  return {
    hoursStr: hours > 0 ? hours.toString().padStart(2, '0') : null,
    minutesStr: minutes.toString().padStart(2, '0'),
    secondsStr: seconds.toString().padStart(2, '0'),
    centiStr: centiseconds.toString().padStart(2, '0'),
  };
}

export function formatStopwatchTime(ms: number): string {
  const { hoursStr, minutesStr, secondsStr, centiStr } = formatStopwatchParts(ms);
  if (hoursStr) {
    return `${hoursStr}:${minutesStr}:${secondsStr}.${centiStr}`;
  }
  return `${minutesStr}:${secondsStr}.${centiStr}`;
}

export function formatMinutesLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'}`;
  }
  const hrs = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hrs} hr${hrs === 1 ? '' : 's'}`;
  }
  return `${hrs}h ${remainingMins}m`;
}

export function formatRemainingCountdown(targetTimestamp: number): string {
  const diffMs = targetTimestamp - Date.now();
  if (diffMs <= 0) return 'Due now';
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
