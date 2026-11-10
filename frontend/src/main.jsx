import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

// Telegram WebApp 2.0 Native Initialization & Fullscreen Enforcement
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  try {
    tg.ready();
    tg.expand();
    // Telegram 8.0+ Fullscreen
    if (typeof tg.requestFullscreen === 'function') {
      tg.requestFullscreen();
    }
    // Disable swipe-down gesture that closes the WebApp accidentally
    if (typeof tg.disableVerticalSwipes === 'function') {
      tg.disableVerticalSwipes();
    }
    if (tg.isVerticalSwipesEnabled !== undefined) {
      tg.isVerticalSwipesEnabled = false;
    }
    // Deep dark obsidian theme for Telegram title bar and canvas
    if (typeof tg.setHeaderColor === 'function') {
      tg.setHeaderColor('#0b0f19');
    }
    if (typeof tg.setBackgroundColor === 'function') {
      tg.setBackgroundColor('#0b0f19');
    }
    if (typeof tg.enableClosingConfirmation === 'function') {
      tg.enableClosingConfirmation();
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
