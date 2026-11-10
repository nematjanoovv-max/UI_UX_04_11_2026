import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

// Telegram WebApp 2.0 Standard Setup (Native swipe-down to close enabled)
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  try {
    tg.ready();
    tg.expand();

    // Enable native vertical swipes so pulling down closes the WebApp
    if (typeof tg.enableVerticalSwipes === 'function') {
      tg.enableVerticalSwipes();
    }
    if (tg.isVerticalSwipesEnabled !== undefined) {
      tg.isVerticalSwipesEnabled = true;
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
