import React from 'react';
import { 
  Utensils, 
  MapPin, 
  Search, 
  ShoppingBag,
  Compass,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileBottomNav({ currentView, setCurrentView }) {
  const { 
    cartItemCount, 
    cartTotal, 
    setIsCartOpen, 
    setIsTrackerOpen, 
    t, 
    sounds,
    haptics 
  } = useApp();

  const handleMenuClick = () => {
    sounds?.playClick?.();
    haptics?.selection?.();
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
    sounds?.playClick?.();
    haptics?.light?.();
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
          className={`btn-spring min-h-[44px] flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl active:scale-95 cursor-pointer select-none touch-manipulation ${
            currentView === 'client' 
              ? 'text-brand-400 bg-brand-500/15 border border-brand-500/30 font-extrabold scale-102' 
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Utensils className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">{t('menu')}</span>
        </button>

        {/* 2. Qidiruv (Search) */}
        <button
          onClick={handleSearchFocus}
          className="btn-spring min-h-[44px] flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl text-slate-400 hover:text-slate-200 font-medium active:scale-95 cursor-pointer select-none touch-manipulation"
        >
          <Search className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="text-[11px] leading-tight">{t('searchBtn') || 'Qidiruv'}</span>
        </button>

        {/* 3. Xarita / Buyurtma Kuzatuv */}
        <button
          onClick={() => {
            sounds?.playClick?.();
            haptics?.light?.();
            setIsTrackerOpen(true);
          }}
          className="btn-spring min-h-[44px] flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl text-slate-400 hover:text-slate-200 font-medium active:scale-95 cursor-pointer select-none touch-manipulation"
        >
          <MapPin className="w-5 h-5 mb-0.5 text-sky-400" />
          <span className="text-[11px] leading-tight">{t('trackOrder')}</span>
        </button>

        {/* 4. Savat (Cart) */}
        <button
          id="mobile-cart-btn"
          onClick={() => {
            sounds?.playClick?.();
            haptics?.medium?.();
            setIsCartOpen(true);
          }}
          className="btn-spring min-h-[44px] relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 text-white font-black shadow-lg shadow-brand-500/30 border-t border-white/20 active:scale-95 cursor-pointer select-none touch-manipulation"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight">
            {cartTotal > 0 ? `${(cartTotal / 1000).toFixed(0)}k` : t('cart')}
          </span>
        </button>

        {/* 5. Admin Panel */}
        <button
          onClick={() => {
            sounds?.playClick?.();
            haptics?.selection?.();
            setCurrentView(currentView === 'admin' ? 'client' : 'admin');
          }}
          className={`btn-spring min-h-[44px] flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl active:scale-95 cursor-pointer select-none touch-manipulation ${
            currentView === 'admin'
              ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30 font-extrabold scale-102'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <ShieldAlert className="w-5 h-5 mb-0.5 text-amber-400" />
          <span className="text-[11px] leading-tight">Admin</span>
        </button>

      </div>
    </nav>
  );
}
