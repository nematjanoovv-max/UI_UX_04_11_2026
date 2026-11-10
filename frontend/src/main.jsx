import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

// Telegram WebApp 2.0 Standard Native Setup (Normal Viewport, No Fullscreen Forcing)
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  try {
    tg.ready();
    tg.expand();

    // Disable swipe-down to close
    if (typeof tg.disableVerticalSwipes === 'function') {
      tg.disableVerticalSwipes();
    }
    if (tg.isVerticalSwipesEnabled !== undefined) {
      tg.isVerticalSwipesEnabled = false;
    }

    // Set soothing dark theme colors
    if (typeof tg.setHeaderColor === 'function') {
      tg.setHeaderColor('#0b0f19');
    }
    if (typeof tg.setBackgroundColor === 'function') {
      tg.setBackgroundColor('#0b0f19');
    }
  } catch (_) {}
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
