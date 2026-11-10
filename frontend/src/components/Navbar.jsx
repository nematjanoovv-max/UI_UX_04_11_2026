import React, { useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  ShieldAlert, 
  Bike, 
  Compass,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ currentView, setCurrentView, searchQuery, setSearchQuery }) {
  const { 
    language,
    setLanguage,
    t,
    cartItemCount,
    cartTotal,
    setIsCartOpen, 
    setIsTrackerOpen,
    soundMuted,
    toggleSoundMute,
    sounds
  } = useApp();

  const searchInputRef = useRef(null);

  // Global Keyboard Shortcut (⌘K or Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextLanguage = () => {
    sounds?.playClick?.();
    if (language === 'uz') setLanguage('ru');
    else if (language === 'ru') setLanguage('en');
    else setLanguage('uz');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/95 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2 sm:gap-4">
          
          {/* Brand Logo & Kitchen Status */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div 
              onClick={() => setCurrentView('client')}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-amber-500 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-2xl tracking-tight text-white">
                    Smart<span className="text-brand-500">Delivery</span>
                  </span>
                  <span className="hidden xl:inline-block text-[9px] font-black uppercase tracking-wider bg-brand-500/15 border border-brand-500/30 text-brand-400 px-2 py-0.5 rounded-full">
                    2026 Web
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden lg:block leading-none mt-0.5">
                  {language === 'ru' ? 'Быстрая доставка по Ташкенту' : (language === 'en' ? 'Fast Delivery across Tashkent' : 'Toshkent bo\'ylab tezkor yetkazish')}
                </p>
              </div>
            </div>

            {/* Delivery Location Pill (Desktop & Tablet) */}
            <div 
              onClick={() => setIsTrackerOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 cursor-pointer transition-colors"
              title="Yetkazish manzilini tanlash yoki tekshirish"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <div className="text-left leading-tight">
                <span className="block text-[10px] text-slate-500 font-bold uppercase">Yetkazish:</span>
                <span className="font-extrabold text-white text-[11px]">Toshkent, Chilonzor ▾</span>
              </div>
            </div>
          </div>

          {/* Global Search Bar with Keyboard Shortcut (Desktop / Tablet) */}
          {currentView === 'client' && (
            <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder') || "Taom yoki mahsulot qidirish..."}
                  className="w-full pl-10 pr-16 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-inner"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1">
                    <kbd className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Navigation & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* View Switcher Tabs (Desktop / Tablet only) */}
            <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-sm">
              <button
                onClick={() => setCurrentView('client')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'client'
                    ? 'bg-brand-500 text-white shadow-sm scale-102'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t('menu')}</span>
              </button>
              
              <button
                onClick={() => setCurrentView('courier')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'courier'
                    ? 'bg-brand-500 text-white shadow-sm scale-102'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>{language === 'ru' ? 'Курьер' : (language === 'en' ? 'Courier' : 'Kuryer')}</span>
              </button>

              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'admin'
                    ? 'bg-amber-500 text-white shadow-sm scale-102'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Mobile View Switcher (Admin / Store toggle) */}
            <div className="md:hidden flex items-center gap-1">
              {currentView !== 'client' ? (
                <button
                  onClick={() => setCurrentView('client')}
                  className="btn-spring flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brand-500 text-white text-xs font-black shadow-md shadow-brand-500/30"
                  title="Menyuga qaytish"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Menyu</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="btn-spring flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 hover:text-white text-xs font-bold"
                  title="Admin Panel"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}
            </div>

            {/* Desktop Track Order Link */}
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition-colors"
              title={t('trackOrder')}
            >
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>{t('trackOrder')}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={nextLanguage}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition-colors flex items-center gap-1"
              title="Tilni almashtirish"
            >
              <span>{language === 'uz' ? '🇺🇿' : (language === 'ru' ? '🇷🇺' : '🇬🇧')}</span>
              <span className="uppercase text-[11px]">{language}</span>
            </button>

            {/* Sound Mute / Unmute Toggle */}
            <button
              onClick={() => {
                const next = toggleSoundMute();
                if (!next) sounds?.playPop?.();
              }}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              title={soundMuted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Grand Cart Trigger Button with Total Sum on Desktop */}
            <button
              id="main-cart-btn"
              onClick={() => {
                sounds?.playClick?.();
                setIsCartOpen(true);
              }}
              className="btn-primary relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow animate-bounce">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {cartTotal > 0 ? `${cartTotal.toLocaleString()} so'm` : t('cart')}
              </span>
            </button>

          </div>
        </div>

        {/* Mobile Quick Search Input (Only on client view) */}
        {currentView === 'client' && (
          <div className="pb-2.5 md:hidden">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder') || "Taom yoki mahsulot qidirish..."}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500/50 placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
