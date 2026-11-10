// Telegram WebApp Native Haptic Feedback Utility
// Provides tactile vibration responses on iOS, Android, and mobile web browsers

export const haptics = {
  // Impact feedback: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
  impact: (style = 'medium') => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        const duration = style === 'heavy' ? 25 : (style === 'light' ? 8 : 15);
        navigator.vibrate(duration);
      }
    } catch (_) {}
  },
  light: () => haptics.impact('light'),
  medium: () => haptics.impact('medium'),
  heavy: () => haptics.impact('heavy'),
  rigid: () => haptics.impact('rigid'),
  soft: () => haptics.impact('soft'),

  // Notification feedback: 'error' | 'success' | 'warning'
  notification: (type = 'success') => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (type === 'success') navigator.vibrate([15, 30, 20]);
        else if (type === 'error') navigator.vibrate([30, 40, 30]);
        else navigator.vibrate(20);
      }
    } catch (_) {}
  },
  success: () => haptics.notification('success'),
  error: () => haptics.notification('error'),
  warning: () => haptics.notification('warning'),

  // Selection change feedback (e.g. checkbox, radio, tab switch)
  selection: () => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(6);
      }
    } catch (_) {}
  }
};
