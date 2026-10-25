import { SoundTone } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playTone(tone: SoundTone = 'digital-beep', volume: number = 0.8, isMuted: boolean = false) {
  if (isMuted || volume <= 0) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0.05), 1), ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (tone) {
      case 'zen-chime': {
        // Tibetan / Zen Singing Bell: 528 Hz base with harmonics (1056, 1584, 2112)
        const partials = [
          { freq: 528, gain: 0.6, decay: 2.8 },
          { freq: 1056, gain: 0.28, decay: 2.2 },
          { freq: 1584, gain: 0.15, decay: 1.6 },
          { freq: 2112, gain: 0.08, decay: 1.1 },
        ];

        partials.forEach(({ freq, gain, decay }) => {
          const osc = ctx.createOscillator();
          const pGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          pGain.gain.setValueAtTime(0, now);
          pGain.gain.linearRampToValueAtTime(gain, now + 0.015);
          pGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

          osc.connect(pGain);
          pGain.connect(masterGain);

          osc.start(now);
          osc.stop(now + decay);
        });
        break;
      }

      case 'marimba': {
        // Warm melodic arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, index) => {
          const noteTime = now + index * 0.09;
          const osc = ctx.createOscillator();
          const nGain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);

          nGain.gain.setValueAtTime(0, noteTime);
          nGain.gain.linearRampToValueAtTime(0.4, noteTime + 0.008);
          nGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

          osc.connect(nGain);
          nGain.connect(masterGain);

          osc.start(noteTime);
          osc.stop(noteTime + 0.65);
        });
        break;
      }

      case 'digital-beep': {
        // Precise double digital beep
        const beeps = [0, 0.14];
        beeps.forEach((startOffset) => {
          const beepTime = now + startOffset;
          const osc = ctx.createOscillator();
          const bGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1046.5, beepTime); // High C

          bGain.gain.setValueAtTime(0, beepTime);
          bGain.gain.linearRampToValueAtTime(0.35, beepTime + 0.005);
          bGain.gain.linearRampToValueAtTime(0.35, beepTime + 0.07);
          bGain.gain.exponentialRampToValueAtTime(0.0001, beepTime + 0.09);

          osc.connect(bGain);
          bGain.connect(masterGain);

          osc.start(beepTime);
          osc.stop(beepTime + 0.1);
        });
        break;
      }

      case 'singing-bowl': {
        // Deep meditative gong tone with slow beat frequency
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const bGain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(261.63, now); // C4

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(263.63, now); // 2Hz binaural beating

        bGain.gain.setValueAtTime(0, now);
        bGain.gain.linearRampToValueAtTime(0.5, now + 0.04);
        bGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc1.connect(bGain);
        osc2.connect(bGain);
        bGain.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 3.3);
        osc2.stop(now + 3.3);
        break;
      }

      case 'pulse': {
        // Subtle dual low pulse
        [0, 0.18].forEach((offset, idx) => {
          const pTime = now + offset;
          const osc = ctx.createOscillator();
          const pGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(idx === 0 ? 440 : 330, pTime);

          pGain.gain.setValueAtTime(0, pTime);
          pGain.gain.linearRampToValueAtTime(0.3, pTime + 0.01);
          pGain.gain.exponentialRampToValueAtTime(0.0001, pTime + 0.25);

          osc.connect(pGain);
          pGain.connect(masterGain);

          osc.start(pTime);
          osc.stop(pTime + 0.26);
        });
        break;
      }
    }
  } catch (err) {
    console.warn('Audio playback not supported or blocked:', err);
  }
}

export function playTickFeedback() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch {
    // Ignore silent failure
  }
}

// Browser Notification Utilities
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      silent: false,
      ...options,
    });
  } catch (err) {
    console.warn('Could not fire browser notification:', err);
  }
}
