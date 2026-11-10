import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

// Telegram WebApp 2.0 Native Initialization
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  try {
    tg.ready();
    tg.expand();
    if (tg.requestFullscreen) {
      tg.requestFullscreen();
    }
    if (tg.enableClosingConfirmation) {
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
