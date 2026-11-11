import React, { useState, useEffect } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
    cart,
    grandTotal,
    haptics,
    t
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
      if (typeof tg.enableVerticalSwipes === 'function') {
        tg.enableVerticalSwipes();
      }
      if (tg.isVerticalSwipesEnabled !== undefined) {
        tg.isVerticalSwipesEnabled = true;
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

  // Telegram Native MainButton (Bottom Action Button) Integration
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp;
    // Only engage Telegram MainButton if actually running inside Telegram WebApp
    if (!tg.initData) return;
    const mainBtn = tg.MainButton;
    if (!mainBtn) return;

    if (currentView !== 'client') {
      mainBtn.hide();
      return;
    }

    if (isCheckoutOpen) {
      mainBtn.setText(`Tasdiqlash • ${grandTotal.toLocaleString()} so'm`);
      mainBtn.setParams({
        color: '#ea580c',
        text_color: '#ffffff',
        is_active: true
      });
      mainBtn.show();

      const handleClick = () => {
        haptics?.medium();
        const submitBtn = document.querySelector('form button[type="submit"]');
        if (submitBtn) submitBtn.click();
      };
      mainBtn.onClick(handleClick);
      return () => mainBtn.offClick(handleClick);
    } else if (isCartOpen) {
      if (cart.length > 0) {
        mainBtn.setText(`Buyurtmaga o'tish • ${grandTotal.toLocaleString()} so'm`);
        mainBtn.setParams({
          color: '#ea580c',
          text_color: '#ffffff',
          is_active: true
        });
        mainBtn.show();

        const handleClick = () => {
          haptics?.medium();
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        };
        mainBtn.onClick(handleClick);
        return () => mainBtn.offClick(handleClick);
      } else {
        mainBtn.hide();
      }
    } else {
      // On main catalog view, MobileBottomNav provides the floating navigation & glowing cart button,
      // so we keep Telegram native MainButton hidden to prevent dual stacked bottom bars
      mainBtn.hide();
    }
  }, [currentView, isCheckoutOpen, isCartOpen, cart, grandTotal, haptics]);

  return (
    <div className="min-h-[100dvh] w-full max-w-full flex flex-col bg-[#0b0f19] text-slate-100 transition-colors overflow-x-hidden pb-[env(safe-area-inset-bottom,0px)]">
      {/* Top Floating Promo Announcement Bar */}
      <AnnouncementBar />

      {/* Apple-style Floating Dynamic Island Live Tracker */}
      <DynamicIslandTracker />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleSetView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main View Body with ample bottom clearance for MobileBottomNav & DynamicIsland */}
      <main className="flex-1 w-full max-w-full pb-28 sm:pb-24 md:pb-12">
        {currentView === 'client' && (
          <CustomerView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setCurrentView={handleSetView}
          />
        )}
        {currentView === 'admin' && <AdminView setCurrentView={handleSetView} />}
        {currentView === 'courier' && <CourierView setCurrentView={handleSetView} />}
      </main>

      {/* Mobile Bottom Dock (Only on small screens) */}
      <MobileBottomNav 
        currentView={currentView} 
        setCurrentView={handleSetView} 
      />

      {/* Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackerModal />

      {/* Comprehensive World-Class Multi-Column Footer */}
      <Footer setCurrentView={handleSetView} />
    </div>
  );
}
