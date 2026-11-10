import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

// Telegram WebApp 2.0 Native Initialization & Robust Fullscreen Manager
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  try {
    tg.ready();
    tg.expand();

    // Disable swipe-down gesture that collapses the WebApp
    if (typeof tg.disableVerticalSwipes === 'function') {
      tg.disableVerticalSwipes();
    }
    if (tg.isVerticalSwipesEnabled !== undefined) {
      tg.isVerticalSwipesEnabled = false;
    }

    // Set deep dark theme colors for Telegram header and canvas
    if (typeof tg.setHeaderColor === 'function') {
      tg.setHeaderColor('#0b0f19');
    }
    if (typeof tg.setBackgroundColor === 'function') {
      tg.setBackgroundColor('#0b0f19');
    }

    // Attempt Telegram 8.0+ requestFullscreen immediately
    if (typeof tg.requestFullscreen === 'function' && !tg.isFullscreen) {
      try {
        tg.requestFullscreen();
      } catch (_) {}
    }

    // Listen to Telegram fullscreen events
    if (typeof tg.onEvent === 'function') {
      tg.onEvent('fullscreenFailed', (err) => {
        console.warn('[Telegram WebApp] Fullscreen failed:', err);
      });
      tg.onEvent('fullscreenChanged', () => {
        console.log('[Telegram WebApp] Fullscreen changed. isFullscreen:', tg.isFullscreen);
      });
    }

    // Also trigger requestFullscreen on user's first tap (user gesture requirement)
    const handleFirstGesture = () => {
      try {
        tg.expand();
        if (typeof tg.requestFullscreen === 'function' && !tg.isFullscreen) {
          tg.requestFullscreen();
        }
      } catch (_) {}
    };

    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
  } catch (err) {
    console.error('[Telegram WebApp Init Error]:', err);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
