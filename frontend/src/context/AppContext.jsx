import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { sounds } from '../utils/soundEffects';
import { haptics } from '../utils/haptics';
import FlyingCartOverlay from '../components/FlyingCartOverlay';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Sound Mute State
  const [soundMuted, setSoundMuted] = useState(() => sounds.isMuted());
  const toggleSoundMute = () => {
    const next = sounds.toggleMute();
    setSoundMuted(next);
    return next;
  };

  // Flying Cart Animation items state
  const [flyingItems, setFlyingItems] = useState([]);

  const triggerFlyingCart = (product, startRect) => {
    try {
      const cartBtn = document.getElementById('main-cart-btn');
      let targetX = window.innerWidth - 60;
      let targetY = 30;
      if (cartBtn) {
        const rect = cartBtn.getBoundingClientRect();
        targetX = rect.left + rect.width / 2 - 24;
        targetY = rect.top + rect.height / 2 - 24;
      }

      const startX = startRect?.left ? (startRect.left + startRect.width / 2 - 24) : (window.innerWidth / 2 - 24);
      const startY = startRect?.top ? (startRect.top + startRect.height / 2 - 24) : (window.innerHeight / 2 - 24);

      const newItem = {
        id: Date.now() + Math.random(),
        imageUrl: product.image_url,
        startX,
        startY,
        targetX,
        targetY
      };

      setFlyingItems(prev => [...prev, newItem]);

      // Remove after animation finishes & play pop sound
      setTimeout(() => {
        setFlyingItems(prev => prev.filter(i => i.id !== newItem.id));
        sounds.playPop();
        // Shake / bounce cart button
        if (cartBtn) {
          cartBtn.classList.add('scale-125');
          setTimeout(() => cartBtn.classList.remove('scale-125'), 180);
        }
      }, 620);
    } catch (_) {
      sounds.playPop();
    }
  };

  // Language state ('uz' | 'ru' | 'en')
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('sd_lang') || 'uz';
  });

  const setLanguage = (lang) => {
    if (['uz', 'ru', 'en'].includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('sd_lang', lang);
    }
  };

  const t = (key) => {
    const currentDict = translations[language] || translations.uz;
    return currentDict[key] || translations.uz[key] || key;
  };

  // Theme state - Eye-comfort Dark mode default (no glaring white background)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('sd_theme');
    if (saved === 'light') {
      localStorage.setItem('sd_theme', 'dark');
    }
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      document.documentElement.style.backgroundColor = '#0b0f19';
      document.body.style.backgroundColor = '#0b0f19';
      localStorage.setItem('sd_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      document.documentElement.style.backgroundColor = '#f8fafc';
      document.body.style.backgroundColor = '#f8fafc';
      localStorage.setItem('sd_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('sd_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sd_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, startRect = null) => {
    if (!product || !product.id) return;
    haptics.medium();
    const key = product.customKey || product.id;
    setCart(prev => {
      const existing = prev.find(item => (item.customKey || item.id) === key);
      if (existing) {
        const currentQty = Math.max(0, parseInt(existing.quantity, 10) || 0);
        return prev.map(item =>
          (item.customKey || item.id) === key ? { ...item, quantity: Math.min(99, currentQty + 1) } : item
        );
      }
      const initialPrice = Math.max(0, Number(product.price) || 0);
      return [...prev, { ...product, price: initialPrice, customKey: key, quantity: 1 }];
    });

    if (startRect) {
      triggerFlyingCart(product, startRect);
    } else {
      sounds.playPop();
    }
  };

  const updateQuantity = (keyOrId, delta) => {
    haptics.light();
    sounds.playClick();
    const cleanDelta = parseInt(delta, 10);
    if (isNaN(cleanDelta)) return;

    setCart(prev => {
      return prev.map(item => {
        if ((item.customKey || item.id) === keyOrId) {
          const currentQty = Math.max(0, parseInt(item.quantity, 10) || 0);
          const newQty = currentQty + cleanDelta;
          if (newQty <= 0) return null;
          return { ...item, quantity: Math.min(99, newQty) };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (keyOrId) => {
    haptics.light();
    sounds.playClick();
    setCart(prev => prev.filter(item => (item.customKey || item.id) !== keyOrId));
  };

  const clearCart = () => {
    haptics.light();
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => {
    const p = Math.max(0, Number(item.price) || 0);
    const q = Math.max(0, parseInt(item.quantity, 10) || 0);
    return sum + (p * q);
  }, 0);
  const deliveryFee = cartTotal >= 150000 || cartTotal === 0 ? 0 : 15000;
  const grandTotal = Math.max(0, cartTotal + deliveryFee);
  const cartItemCount = cart.reduce((sum, item) => {
    const q = Math.max(0, parseInt(item.quantity, 10) || 0);
    return sum + q;
  }, 0);

  // Cart Drawer open/close
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Order Tracker Modal & Current Tracked Order
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackedOrderNumber, setTrackedOrderNumber] = useState('');

  // Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    if (type === 'error') {
      haptics.error();
      sounds.playError?.();
    } else if (type === 'info') {
      haptics.light();
    } else {
      haptics.success();
    }
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Listen for background server retry / wake events
  useEffect(() => {
    const handleServerWake = (e) => {
      showToast(e.detail?.message || "Server bilan aloqa o'rnatilmoqda...", 'info');
    };
    window.addEventListener('sd-server-wake', handleServerWake);
    return () => window.removeEventListener('sd-server-wake', handleServerWake);
  }, []);

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      t,
      darkMode,
      toggleDarkMode,
      cart,
      addToCart,
      triggerFlyingCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      deliveryFee,
      grandTotal,
      cartItemCount,
      isCartOpen,
      setIsCartOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      isTrackerOpen,
      setIsTrackerOpen,
      trackedOrderNumber,
      setTrackedOrderNumber,
      toast,
      showToast,
      sounds,
      haptics,
      soundMuted,
      toggleSoundMute
    }}>
      {children}
      {/* 3D Flying Cart Animation Overlay */}
      <FlyingCartOverlay flyingItems={flyingItems} />
      {/* Toast popup */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl transition-all duration-300 animate-slide-up border ${
          toast.type === 'error'
            ? 'bg-rose-600/95 text-white border-rose-500 shadow-rose-900/40'
            : toast.type === 'info'
            ? 'bg-sky-600/95 text-white border-sky-500 shadow-sky-900/40'
            : 'bg-emerald-600/95 text-white border-emerald-500 shadow-emerald-900/40'
        }`}>
          {toast.type === 'info' && <span className="animate-spin text-base">⏳</span>}
          {toast.type === 'error' && <span className="text-base">⚠️</span>}
          {toast.type === 'success' && <span className="text-base">✓</span>}
          <span className="text-xs sm:text-sm font-bold">{toast.message}</span>
        </div>
      )}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
