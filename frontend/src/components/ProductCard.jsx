import React, { useState } from 'react';
import { Clock, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCustomizerModal from './ProductCustomizerModal';

export default function ProductCard({ product }) {
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

  // 3D Tilt & Glow Handler
  const handleMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    const centerX = card.width / 2;
    const centerY = card.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

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
      transition: 'transform 0.5s ease-out',
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
      className="group relative flex flex-col rounded-3xl overflow-hidden glass-card transition-shadow duration-300 hover:shadow-2xl hover:border-brand-500/40 will-change-transform"
    >
      {/* Dynamic Cursor Spotlight Ambient Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(234, 88, 12, ${glowPos.opacity}), transparent 70%)`
        }}
      />
      {/* Product Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !isAvailable ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />
        
        {/* Prep Time Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold shadow-sm">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{product.prep_time_min || 15} {t('prepTime')}</span>
        </div>

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
              {t('notAvailable')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex-1">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {product.description || (language === 'ru' ? 'Приготовлено из свежих ингредиентов.' : (language === 'en' ? 'Prepared from fresh ingredients.' : 'Mazali va toza masalliqlardan tayyorlangan.'))}
          </p>
        </div>

        {/* Bottom Actions: Price and Add Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block font-medium">{language === 'ru' ? 'Цена' : (language === 'en' ? 'Price' : 'Narxi')}</span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {Number(product.price).toLocaleString()} <span className="text-xs font-semibold text-brand-500">{t('currency')}</span>
            </span>
          </div>

          {isAvailable ? (
            cartItem ? (
              <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-950/40 border border-brand-500/30 rounded-2xl p-1">
                <button
                  onClick={() => updateQuantity(product.id, -1)}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-sm hover:bg-brand-500 hover:text-white transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm text-slate-900 dark:text-white px-1">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, 1)}
                  className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-sm hover:bg-brand-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 active:scale-95 transition-all"
              >
                {hasModifiers ? <Sparkles className="w-4 h-4 text-amber-200" /> : <Plus className="w-4 h-4" />}
                <span>{hasModifiers ? (language === 'ru' ? 'Выбрать' : (language === 'en' ? 'Select' : 'Tanlash')) : t('addToCart')}</span>
              </button>
            )
          ) : (
            <button
              disabled
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 text-xs font-medium cursor-not-allowed"
            >
              {t('notAvailable')}
            </button>
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
            showToast(`"${product.name}" ${language === 'ru' ? 'с добавками добавлен в корзину!' : (language === 'en' ? 'with extras added to cart!' : 'qo\'shimchalar bilan savatga qo\'shildi!')}`);
          }}
        />
      )}
    </div>
  );
}
