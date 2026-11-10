import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  MapPin, 
  Maximize2, 
  Minimize2, 
  ShoppingBag, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileBottomNav({ currentView, setCurrentView }) {
  const { 
    cartItemCount, 
    cartTotal, 
    setIsCartOpen, 
    setIsTrackerOpen, 
    t, 
    sounds 
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInTelegram, setIsInTelegram] = useState(false);

  useEffect(() => {
    // Check if running inside Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
      setIsInTelegram(true);
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    sounds.playClick();

    // If inside Telegram WebApp and browser fullscreen isn't supported, try Telegram 8.0+ requestFullscreen
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        if (window.Telegram.WebApp.requestFullscreen) {
          window.Telegram.WebApp.requestFullscreen();
        }
      } catch (_) {}
    }

    // Standard HTML5 Fullscreen API
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          // If fullscreen blocked in Telegram iframe, offer to open in external browser
          if (isInTelegram && window.Telegram?.WebApp?.openLink) {
            window.Telegram.WebApp.openLink('https://smart-delivery-system-2026.vercel.app');
          }
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleOpenInBrowser = () => {
    sounds.playPop();
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink('https://smart-delivery-system-2026.vercel.app');
    } else {
      window.open('https://smart-delivery-system-2026.vercel.app', '_blank');
    }
  };

  const handleMenuClick = () => {
    sounds.playClick();
    if (currentView !== 'client') {
      setCurrentView('client');
    }
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating Telegram WebApp Helper Notification (if inside Telegram) */}
      {isInTelegram && (
        <div className="fixed top-20 left-3 right-3 z-30 md:hidden animate-slide-up">
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs text-slate-200">
            <span className="truncate">
              📱 100% cheksiz to'liq ekran uchun:
            </span>
            <button
              onClick={handleOpenInBrowser}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-[11px] shadow-sm transition-transform active:scale-95"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Brauzerda ochish</span>
            </button>
          </div>
        </div>
      )}

      {/* Modern Floating Bottom Nav Dock (Phones & Tablets < md) */}
      <nav 
        className="fixed bottom-3 left-3 right-3 z-40 md:hidden rounded-3xl bg-[#0f172a]/92 border border-slate-700/60 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8)] backdrop-blur-xl px-2 py-2"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-around gap-1">
          
          {/* Menyu */}
          <button
            onClick={handleMenuClick}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all ${
              currentView === 'client' 
                ? 'text-brand-400 bg-brand-500/10 font-bold' 
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <Utensils className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">{t('menu')}</span>
          </button>

          {/* Xarita / Buyurtma Kuzatuv */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsTrackerOpen(true);
            }}
            className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl text-slate-400 hover:text-slate-200 font-medium transition-all"
          >
            <MapPin className="w-5 h-5 mb-0.5 text-sky-400" />
            <span className="text-[11px]">{t('trackOrder')}</span>
          </button>

          {/* To'liq Ekran (Fullscreen) Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl text-slate-400 hover:text-slate-200 font-medium transition-all"
            title="To'liq ekranga o'tish"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 mb-0.5 text-amber-400" />
            ) : (
              <Maximize2 className="w-5 h-5 mb-0.5 text-amber-400" />
            )}
            <span className="text-[11px]">{isFullscreen ? 'Kichraytirish' : 'To\'liq ekran'}</span>
          </button>

          {/* Savat (Cart) */}
          <button
            id="mobile-cart-btn"
            onClick={() => {
              sounds.playClick();
              setIsCartOpen(true);
            }}
            className="relative flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 text-white font-bold shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-[11px]">
              {cartTotal > 0 ? `${(cartTotal / 1000).toFixed(0)}k` : t('cart')}
            </span>
          </button>

        </div>
      </nav>
    </>
  );
}
