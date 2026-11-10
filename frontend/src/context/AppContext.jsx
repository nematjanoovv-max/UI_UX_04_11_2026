import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { sounds } from '../utils/soundEffects';
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

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('sd_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sd_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
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
    const key = product.customKey || product.id;
    setCart(prev => {
      const existing = prev.find(item => (item.customKey || item.id) === key);
      if (existing) {
        return prev.map(item =>
          (item.customKey || item.id) === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, customKey: key, quantity: 1 }];
    });

    if (startRect) {
      triggerFlyingCart(product, startRect);
    } else {
      sounds.playPop();
    }
  };

  const updateQuantity = (keyOrId, delta) => {
    sounds.playClick();
    setCart(prev => {
      return prev.map(item => {
        if ((item.customKey || item.id) === keyOrId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (keyOrId) => {
    sounds.playClick();
    setCart(prev => prev.filter(item => (item.customKey || item.id) !== keyOrId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = cartTotal >= 150000 || cartTotal === 0 ? 0 : 15000;
  const grandTotal = cartTotal + deliveryFee;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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
      soundMuted,
      toggleSoundMute
    }}>
      {children}
      {/* 3D Flying Cart Animation Overlay */}
      <FlyingCartOverlay flyingItems={flyingItems} />
      {/* Toast popup */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl transition-all duration-300 animate-slide-up ${
          toast.type === 'error'
            ? 'bg-rose-600 text-white'
            : 'bg-emerald-600 text-white'
        }`}>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
