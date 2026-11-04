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
  UtensilsCrossed
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ currentView, setCurrentView, searchQuery, setSearchQuery }) {
  const { 
    darkMode, 
    toggleDarkMode, 
    cartItemCount, 
    setIsCartOpen, 
    setIsTrackerOpen 
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 glass transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentView('client')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6 animate-pulse-fast" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white">
                  Smart<span className="text-brand-500">Delivery</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
                  2026
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Tezkor va aqlli yetkazib berish
              </p>
            </div>
          </div>

          {/* Quick Search (Only on Client view) */}
          {currentView === 'client' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Sevimli taom yoki mahsulotni qidiring..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Right Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setCurrentView('client')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  currentView === 'client'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">Mijoz</span>
              </button>
              
              <button
                onClick={() => setCurrentView('courier')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  currentView === 'courier'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span className="hidden sm:inline">Kuryer</span>
              </button>

              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  currentView === 'admin'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>

            {/* Track Order Button */}
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              title="Buyurtmani kuzatish"
            >
              <MapPin className="w-4 h-4 text-brand-500" />
              <span className="hidden lg:inline">Kuzatish</span>
            </button>

            {/* Telegram Bot Link */}
            <a
              href="https://t.me/Nematjanovvvv_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs sm:text-sm font-semibold transition-colors"
              title="Telegram Bot orqali buyurtma berish"
            >
              <Send className="w-4 h-4" />
              <span className="hidden lg:inline">TG Bot</span>
            </a>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Temani o'zgartirish"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30 transition-transform active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline font-bold text-sm ml-2">Savatcha</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Search Input */}
        {currentView === 'client' && (
          <div className="pb-3 md:hidden">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Taom yoki mahsulot qidirish..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
