import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Sun, 
  Moon, 
  Send, 
  ShieldAlert, 
  Bike, 
  Compass,
  UtensilsCrossed,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ currentView, setCurrentView, searchQuery, setSearchQuery }) {
  const { 
    language,
    setLanguage,
    t,
    darkMode, 
    toggleDarkMode, 
    cartItemCount, 
    setIsCartOpen, 
    setIsTrackerOpen,
    soundMuted,
    toggleSoundMute,
    sounds
  } = useApp();

  const nextLanguage = () => {
    sounds.playClick();
    if (language === 'uz') setLanguage('ru');
    else if (language === 'ru') setLanguage('en');
    else setLanguage('uz');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2 sm:gap-3">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentView('client')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-base sm:text-xl md:text-2xl tracking-tight text-white">
                  Smart<span className="text-brand-500">Delivery</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block">
                {language === 'ru' ? 'Быстрая и надежная доставка' : (language === 'en' ? 'Fast & Smart Delivery' : 'Tezkor va aqlli yetkazib berish')}
              </p>
            </div>
          </div>

          {/* Quick Search (Desktop / Tablet) */}
          {currentView === 'client' && (
            <div className="hidden md:flex flex-1 max-w-md mx-3">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          {/* Right Navigation & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* View Switcher Tabs (Desktop / Tablet only) */}
            <div className="hidden md:flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setCurrentView('client')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  currentView === 'client'
                    ? 'bg-slate-800 text-brand-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>{t('menu')}</span>
              </button>
              
              <button
                onClick={() => setCurrentView('courier')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  currentView === 'courier'
                    ? 'bg-slate-800 text-brand-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>{language === 'ru' ? 'Курьер' : (language === 'en' ? 'Courier' : 'Kuryer')}</span>
              </button>

              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  currentView === 'admin'
                    ? 'bg-slate-800 text-brand-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
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

            {/* Language Switcher (1-tap toggle on mobile, full selector on desktop) */}
            <button
              onClick={nextLanguage}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition-colors flex items-center gap-1"
              title="Tilni o'zgartirish"
            >
              <span>{language === 'uz' ? '🇺🇿' : (language === 'ru' ? '🇷🇺' : '🇬🇧')}</span>
              <span className="uppercase">{language}</span>
            </button>

            {/* Sound Mute / Unmute Toggle */}
            <button
              onClick={() => {
                const next = toggleSoundMute();
                if (!next) sounds.playPop();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              title={soundMuted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Desktop-only Track Order & Telegram Bot Link */}
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors"
              title={t('trackOrder')}
            >
              <MapPin className="w-4 h-4 text-brand-500" />
              <span>{t('trackOrder')}</span>
            </button>

            {/* Cart Trigger Button */}
            <button
              id="main-cart-btn"
              onClick={() => {
                sounds.playClick();
                setIsCartOpen(true);
              }}
              className="relative flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/30 transition-all duration-200 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-bold text-xs sm:text-sm ml-1.5">{t('cart')}</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-extrabold text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Quick Search Input (Only on client view) */}
        {currentView === 'client' && (
          <div className="pb-2.5 md:hidden">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500/50 placeholder:text-slate-500"
              />
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
