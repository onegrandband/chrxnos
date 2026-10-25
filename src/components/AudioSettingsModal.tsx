import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Bell,
  Play,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AudioSettings, SoundTone } from '../types';
import { playTone, requestNotificationPermission, sendBrowserNotification } from '../utils/sound';
import { CustomSlider } from './ui/CustomSlider';
import { CustomToggle } from './ui/CustomToggle';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
}

const TONES: { id: SoundTone; label: string; desc: string }[] = [
  { id: 'digital-beep', label: 'Classic Digital Beep (Default)', desc: 'Crisp high-frequency dual alert' },
  { id: 'zen-chime', label: 'Zen Harmonic Bell', desc: '528Hz healing chord with exponential decay' },
  { id: 'marimba', label: 'Acoustic Marimba', desc: 'Warm 4-note ascending wooden arpeggio' },
  { id: 'singing-bowl', label: 'Tibetan Singing Bowl', desc: 'Deep binaural resonance with slow beating' },
  { id: 'pulse', label: 'Subtle Pulse', desc: 'Low-profile gentle double tap' },
];

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [permStatus, setPermStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  if (!isOpen) return null;

  const handleTestSound = (tone: SoundTone) => {
    playTone(tone, settings.volume, false);
  };

  const handleRequestPerm = async () => {
    const res = await requestNotificationPermission();
    setPermStatus(res);
    onUpdateSettings({ browserNotificationsEnabled: res === 'granted' });
    if (res === 'granted') {
      sendBrowserNotification('Notifications Active', {
        body: 'Chronos alerts will notify you even when backgrounded.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Preferences</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Audio tone synthesis, volume, and desktop notifications
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Mute Section with CustomSlider and CustomToggle */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
            <span className="flex items-center gap-1.5">
              {settings.isMuted ? (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-zinc-300" />
              )}
              Alert Volume
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-zinc-400">
                {settings.isMuted ? 'Muted' : `${Math.round(settings.volume * 100)}%`}
              </span>
              <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
                <span className="text-[11px] text-zinc-500">Mute</span>
                <CustomToggle
                  size="sm"
                  checked={settings.isMuted}
                  onChange={(checked) => onUpdateSettings({ isMuted: checked })}
                />
              </div>
            </div>
          </div>

          <div className="pt-1">
            <CustomSlider
              value={settings.isMuted ? 0 : settings.volume}
              min={0}
              max={1}
              step={0.05}
              disabled={settings.isMuted}
              onChange={(vol) => onUpdateSettings({ volume: vol, isMuted: vol === 0 })}
            />
          </div>
        </div>

        {/* Sound Tones Preview */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-300">
              Chime Sound Tone
            </label>
            <span className="text-[11px] text-zinc-500">
              Web Audio API Synthesis
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {TONES.map((tone) => {
              const isSelected = settings.defaultSoundTone === tone.id;
              return (
                <div
                  key={tone.id}
                  onClick={() => onUpdateSettings({ defaultSoundTone: tone.id })}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-800/80 border-zinc-600 text-zinc-100'
                      : 'bg-zinc-900/50 border-zinc-850 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium flex items-center gap-1.5">
                      {tone.label}
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                      )}
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-0.5">
                      {tone.desc}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestSound(tone.id);
                    }}
                    title="Play preview"
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 rounded text-zinc-200 transition-colors shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browser Notifications Permissions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-zinc-400" />
              Desktop Push Notifications
            </span>
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
              {permStatus === 'granted' ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Enabled
                </span>
              ) : permStatus === 'denied' ? (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Blocked in browser
                </span>
              ) : (
                <span className="text-zinc-500">Not configured</span>
              )}
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Allow system notifications to receive audible countdown completions and
            cadence alerts even when the browser tab is hidden or minimized.
          </p>

          <div className="flex items-center gap-2 mt-1">
            {permStatus !== 'granted' && (
              <button
                onClick={handleRequestPerm}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded transition-colors"
              >
                Request Permission
              </button>
            )}

            {permStatus === 'granted' && (
              <button
                onClick={() => {
                  sendBrowserNotification('Chronos Test Notification', {
                    body: 'Audio and alert system is functioning normally.',
                  });
                }}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded transition-colors"
              >
                Send Test Notification
              </button>
            )}
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
