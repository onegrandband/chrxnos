import React, { useState } from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';
import { requestNotificationPermission, sendBrowserNotification } from '../utils/sound';

interface NotificationPermissionBannerProps {
  onPermissionGranted: () => void;
}

export const NotificationPermissionBanner: React.FC<NotificationPermissionBannerProps> = ({
  onPermissionGranted,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  if (dismissed || status === 'granted' || status === 'unsupported') {
    return null;
  }

  const handleEnable = async () => {
    const perm = await requestNotificationPermission();
    setStatus(perm);
    if (perm === 'granted') {
      onPermissionGranted();
      sendBrowserNotification('Notifications Enabled!', {
        body: 'Your computer will now receive alerts for timers, stopwatch milestones, and recurring checks.',
      });
    }
  };

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 text-xs text-zinc-200">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <Bell className="w-3.5 h-3.5 text-zinc-100" />
          </div>
          <span>
            <strong className="text-zinc-100 font-semibold">Enable computer alerts:</strong> Receive desktop notifications for your custom timers, stopwatch milestones, and recurring alerts.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={handleEnable}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 font-medium rounded transition-colors whitespace-nowrap shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Allow Alerts</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
