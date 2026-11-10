// =====================================================================
// SMART DELIVERY 2026 — Web Audio API Procedural Sound & Haptics Engine
// Zero external assets required; generates studio-grade micro-sounds
// =====================================================================

class SoundEffectsEngine {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('sd_sound_muted') === 'true';
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  isMuted() {
    return this.muted;
  }

  setMuted(mute) {
    this.muted = !!mute;
    localStorage.setItem('sd_sound_muted', this.muted ? 'true' : 'false');
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
          else if (type === 'heavy') navigator.vibrate(30);
          else navigator.vibrate(15);
        }
      }
    } catch (_) {}
  }

  // 1. POP (Bubbly pop when item is added to cart)
  playPop() {
    this.triggerHaptic('light');
    if (this.muted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

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
    this.triggerHaptic('medium');
    if (this.muted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

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
    this.triggerHaptic('success');
    if (this.muted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // C5, E5, G5, C6 triumphant chord
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
    this.triggerHaptic('light');
    if (this.muted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

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
}

export const sounds = new SoundEffectsEngine();
