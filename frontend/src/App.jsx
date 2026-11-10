import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import DynamicIslandTracker from './components/DynamicIslandTracker';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import CustomerView from './pages/CustomerView';
import AdminView from './pages/AdminView';
import CourierView from './pages/CourierView';
import { useApp } from './context/AppContext';

export default function App() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    isTrackerOpen, 
    setIsTrackerOpen, 
    cart 
  } = useApp();

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

  // Native Telegram WebApp Lifecycle & BackButton Integration
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp;

    try {
      tg.ready();
      tg.expand();
      if (typeof tg.disableVerticalSwipes === 'function') {
        tg.disableVerticalSwipes();
      }
      if (tg.isVerticalSwipesEnabled !== undefined) {
        tg.isVerticalSwipesEnabled = false;
      }
      if (typeof tg.setHeaderColor === 'function') {
        tg.setHeaderColor('#0b0f19');
      }
      if (typeof tg.setBackgroundColor === 'function') {
        tg.setBackgroundColor('#0b0f19');
      }
    } catch (_) {}

    // Telegram Native BackButton handling
    const backBtn = tg.BackButton;
    if (backBtn) {
      const hasOpenModal = isCheckoutOpen || isCartOpen || isTrackerOpen || currentView !== 'client';
      if (hasOpenModal) {
        backBtn.show();
        const handleBack = () => {
          if (isCheckoutOpen) {
            setIsCheckoutOpen(false);
            setIsCartOpen(true);
          } else if (isCartOpen) {
            setIsCartOpen(false);
          } else if (isTrackerOpen) {
            setIsTrackerOpen(false);
          } else if (currentView !== 'client') {
            handleSetView('client');
          }
        };
        backBtn.onClick(handleBack);
        return () => {
          backBtn.offClick(handleBack);
        };
      } else {
        backBtn.hide();
      }
    }
  }, [isCheckoutOpen, isCartOpen, isTrackerOpen, currentView]);

  // Telegram Closing Confirmation when cart has active items
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp;
    try {
      if (cart.length > 0 || isCheckoutOpen) {
        if (typeof tg.enableClosingConfirmation === 'function') {
          tg.enableClosingConfirmation();
        }
      } else {
        if (typeof tg.disableClosingConfirmation === 'function') {
          tg.disableClosingConfirmation();
        }
      }
    } catch (_) {}
  }, [cart.length, isCheckoutOpen]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0b0f19] text-slate-100 transition-colors">
      {/* Apple-style Floating Dynamic Island Live Tracker */}
      <DynamicIslandTracker />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleSetView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main View Body */}
      <main className="flex-1 pb-16 md:pb-6">
        {currentView === 'client' && (
          <CustomerView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {currentView === 'admin' && <AdminView />}
        {currentView === 'courier' && <CourierView />}
      </main>

      {/* Mobile Floating Bottom Dock for thumb-friendly navigation */}
      <MobileBottomNav 
        currentView={currentView} 
        setCurrentView={handleSetView} 
      />

      {/* Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackerModal />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 glass py-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 space-y-2">
          <p className="font-bold text-slate-300">
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
