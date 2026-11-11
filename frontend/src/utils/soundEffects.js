// =====================================================================
// SMART DELIVERY 2026 — Web Audio API Procedural Sound & Haptics Engine
// Ultra-optimized Singleton Web Audio Engine (Zero memory leaks)
// =====================================================================

let sharedAudioContext = null;
let isAudioUnlocked = false;

// Safe unlock on first user gesture (touch/click) without creating multiple contexts
function initAudioUnlock() {
  if (typeof window === 'undefined') return;
  const unlock = () => {
    try {
      if (!sharedAudioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          sharedAudioContext = new AudioContextClass();
        }
      }
      if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume().catch(() => {});
      }
      isAudioUnlocked = true;
    } catch (_) {}
    window.removeEventListener('touchstart', unlock, true);
    window.removeEventListener('touchend', unlock, true);
    window.removeEventListener('click', unlock, true);
  };

  window.addEventListener('touchstart', unlock, { capture: true, once: true, passive: true });
  window.addEventListener('touchend', unlock, { capture: true, once: true, passive: true });
  window.addEventListener('click', unlock, { capture: true, once: true, passive: true });
}

initAudioUnlock();

class SoundEffectsEngine {
  constructor() {
    this.muted = typeof window !== 'undefined' ? localStorage.getItem('sd_sound_muted') === 'true' : false;
  }

  // Pure Singleton getter - NEVER creates duplicate AudioContext
  getAudioContext() {
    try {
      if (typeof window === 'undefined') return null;

      if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          sharedAudioContext = new AudioContextClass();
        }
      }

      if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume().catch(() => {});
      }

      return sharedAudioContext;
    } catch (_) {
      return null;
    }
  }

  isMuted() {
    return this.muted;
  }

  setMuted(mute) {
    this.muted = !!mute;
    try {
      localStorage.setItem('sd_sound_muted', this.muted ? 'true' : 'false');
    } catch (_) {}
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // Telegram WebApp & Mobile Haptics
  triggerHaptic(type = 'light') {
    try {
      if (typeof window !== 'undefined') {
        const tg = window.Telegram?.WebApp?.HapticFeedback;
        if (tg) {
          if (type === 'success' || type === 'error' || type === 'warning') {
            tg.notificationOccurred(type);
          } else {
            tg.impactOccurred(type); // 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
          }
        }
        if ('vibrate' in navigator) {
          if (type === 'success') navigator.vibrate([20, 50, 30]);
          else if (type === 'error') navigator.vibrate([40, 60, 40]);
          else if (type === 'heavy') navigator.vibrate(30);
          else navigator.vibrate(15);
        }
      }
    } catch (_) {}
  }

  // 1. POP (Bubbly pop when item is added to cart)
  playPop() {
    try {
      this.triggerHaptic('light');
      if (this.muted) return;

      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (_) {}
  }

  // 2. COIN / CHIME (Metallic chime when promo applied or cashback used)
  playCoin() {
    try {
      this.triggerHaptic('medium');
      if (this.muted) return;

      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      [987.77, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const start = now + (idx * 0.06);
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch (_) {}
  }

  // 3. SUCCESS / FANFARE (Order confirmed or payment succeeded)
  playSuccess() {
    try {
      this.triggerHaptic('success');
      if (this.muted) return;

      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50];
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        const start = now + (idx * 0.07);
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.5);
      });
    } catch (_) {}
  }

  // 4. CLICK (Subtle tick on button/tab tap)
  playClick() {
    try {
      this.triggerHaptic('light');
      if (this.muted) return;

      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (_) {}
  }

  // 5. ERROR (Subtle low buzz when validation fails)
  playError() {
    try {
      this.triggerHaptic('error');
      if (this.muted) return;

      const ctx = this.getAudioContext();
      if (!ctx || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.17);
    } catch (_) {}
  }
}

export const sounds = new SoundEffectsEngine();
