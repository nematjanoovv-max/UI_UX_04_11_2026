import React from 'react';
import { 
  Utensils, 
  MapPin, 
  Search, 
  ShoppingBag,
  Compass
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

  const handleSearchFocus = () => {
    sounds.playClick();
    if (currentView !== 'client') {
      setCurrentView('client');
    }
    const searchInputs = document.querySelectorAll('input[type="text"]');
    if (searchInputs.length > 0) {
      searchInputs[0].focus();
      searchInputs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <nav 
      className="fixed bottom-3 left-3 right-3 z-40 md:hidden rounded-3xl bg-[#0f172a]/95 border border-slate-700/70 shadow-[0_12px_35px_-5px_rgba(0,0,0,0.85)] backdrop-blur-2xl px-2 py-2"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-around gap-1">
        
        {/* 1. Menyu */}
        <button
          onClick={handleMenuClick}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all ${
            currentView === 'client' 
              ? 'text-brand-400 bg-brand-500/10 font-bold scale-102' 
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Utensils className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">{t('menu')}</span>
        </button>

        {/* 2. Qidiruv (Search) */}
        <button
          onClick={handleSearchFocus}
          className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl text-slate-400 hover:text-slate-200 font-medium transition-all"
        >
          <Search className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="text-[11px]">{t('searchBtn') || 'Qidiruv'}</span>
        </button>

        {/* 3. Xarita / Buyurtma Kuzatuv */}
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

        {/* 4. Savat (Cart) */}
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
  );
}
