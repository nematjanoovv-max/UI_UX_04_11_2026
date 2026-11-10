import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import CustomerView from './pages/CustomerView';
import AdminView from './pages/AdminView';
import CourierView from './pages/CourierView';

export default function App() {
  // Sync view with window path or hash
  const getViewFromPath = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/admin') || hash === '#admin') return 'admin';
    if (path.includes('/courier') || hash === '#courier') return 'courier';
    return 'client';
  };

  const [currentView, setCurrentView] = useState(getViewFromPath);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle URL change
  const handleSetView = (view) => {
    setCurrentView(view);
    const targetPath = view === 'admin' ? '/admin' : view === 'courier' ? '/courier' : '/';
    window.history.pushState(null, '', targetPath);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleSetView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main View Body */}
      <main className="flex-1">
        {currentView === 'client' && (
          <CustomerView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {currentView === 'admin' && <AdminView />}
        {currentView === 'courier' && <CourierView />}
      </main>

      {/* Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackerModal />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 glass py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-bold text-slate-700 dark:text-slate-300">
            Smart Delivery © 2026 — Zamonaviy Yetkazib Berish Tizimi
          </p>
          <p>
            Yagona Backend API • SQLite DB • Telegram Bot (@Smart_delivery_fast_bot) • Vite React Frontend
          </p>
        </div>
      </footer>
    </div>
  );
}
