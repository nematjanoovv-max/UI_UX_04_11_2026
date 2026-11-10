import React, { useState } from 'react';
import { Clock, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCustomizerModal from './ProductCustomizerModal';

function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, showToast, t, language } = useApp();
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50, opacity: 0 });

  const cartItem = cart.find(item => item.id === product.id);
  const isAvailable = product.is_available === 1;

  let hasModifiers = false;
  try {
    if (product.modifiers) {
      const parsed = typeof product.modifiers === 'string' ? JSON.parse(product.modifiers) : product.modifiers;
      hasModifiers = Array.isArray(parsed) && parsed.length > 0;
    }
  } catch (_) {}

  // 3D Tilt & Glow Handler (Only on desktop)
  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });

    setGlowPos({
      x: (x / card.width) * 100,
      y: (y / card.height) * 100,
      opacity: 0.15
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-out',
    });
    setGlowPos(prev => ({ ...prev, opacity: 0 }));
  };

  const handleAdd = (e) => {
    if (!isAvailable) return;
    const rect = e?.currentTarget?.getBoundingClientRect();
    if (hasModifiers) {
      setIsCustomizerOpen(true);
      return;
    }
    addToCart(product, rect);
    showToast(`"${product.name}" ${language === 'ru' ? 'добавлен в корзину!' : (language === 'en' ? 'added to cart!' : 'savatga qo\'shildi!')}`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="group relative flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden glass-card transition-shadow duration-200 hover:shadow-xl hover:border-brand-500/40 will-change-transform bg-slate-900/80 border border-slate-800"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-800">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !isAvailable ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />
        
        {/* Prep Time Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold shadow-sm">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{product.prep_time_min || 15}m</span>
        </div>

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wider shadow">
              {t('notAvailable')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4">
        <div className="flex-1">
          <h3 className="font-bold text-xs sm:text-base text-white line-clamp-1 group-hover:text-brand-400 transition-colors">
            {product.name}
          </h3>
          <p className="hidden sm:block mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description || (language === 'ru' ? 'Свежие ингредиенты' : (language === 'en' ? 'Fresh ingredients' : 'Yangi masalliqlar'))}
          </p>
        </div>

        {/* Bottom Actions: Price and Add Button */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <span className="text-[11px] sm:text-base font-black text-white truncate block">
              {Number(product.price).toLocaleString()} <span className="text-[10px] font-semibold text-brand-400">{t('currency')}</span>
            </span>
          </div>

          {isAvailable ? (
            cartItem ? (
              <div className="flex items-center gap-1 sm:gap-1.5 bg-brand-950/80 border border-brand-500/50 rounded-xl p-0.5 sm:p-1 shrink-0 shadow-md shadow-brand-500/20">
                <button
                  onClick={() => updateQuantity(product.id, -1)}
                  className="stepper-btn w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40 border border-slate-700/60"
                  aria-label="Kamaytirish"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-black text-xs sm:text-sm text-white px-1.5 min-w-[20px] text-center">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, 1)}
                  className="stepper-btn w-7 h-7 rounded-lg bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-sm shadow-brand-500/30 border-t border-white/25"
                  aria-label="Ko'paytirish"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            ) : hasModifiers ? (
              <button
                onClick={handleAdd}
                className="btn-spring flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-600 to-brand-600 hover:from-amber-500 hover:to-brand-500 border-t border-white/25 text-white text-xs font-black shadow-md shadow-amber-500/25 shrink-0"
                title={language === 'ru' ? 'Выбрать параметры' : (language === 'en' ? 'Customize options' : 'Retseptni sozlash')}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                <span className="text-[11px] font-extrabold">{language === 'ru' ? 'Выбрать' : (language === 'en' ? 'Select' : 'Tanlash')}</span>
              </button>
            ) : (
              <button
                onClick={handleAdd}
                className="btn-spring flex items-center justify-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 border-t border-white/25 text-white text-xs font-black shadow-md shadow-brand-500/30 shrink-0"
                title={t('addToCart')}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline font-extrabold">{t('addToCart')}</span>
              </button>
            )
          ) : (
            <span className="text-[11px] text-slate-500 font-bold px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50">
              {t('notAvailable') || 'Mavjud emas'}
            </span>
          )}
        </div>
      </div>

      {hasModifiers && (
        <ProductCustomizerModal
          product={product}
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
          onAddToCart={(customizedProduct, rect) => {
            addToCart(customizedProduct, rect);
            showToast(`"${product.name}" ${language === 'ru' ? 'добавлен в корзиnu!' : (language === 'en' ? 'added to cart!' : 'savatga qo\'shildi!')}`);
          }}
        />
      )}
    </div>
  );
}

export default React.memo(ProductCard);
