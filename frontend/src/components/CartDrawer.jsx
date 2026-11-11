import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    deliveryFee,
    grandTotal,
    setIsCheckoutOpen,
    sounds,
    t,
    language
  } = useApp();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 150000;
  const remainingForFree = Math.max(0, freeDeliveryThreshold - cartTotal);
  const progressPercent = Math.min(100, Math.round((cartTotal / freeDeliveryThreshold) * 100));

  const handleProceedToCheckout = () => {
    if (sounds?.playClick) sounds.playClick();
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleClose = () => {
    if (sounds?.playClick) sounds.playClick();
    setIsCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Drawer Container: 100% width on mobile, 420px on desktop, NO horizontal overflow */}
      <div className="relative w-full sm:w-[420px] sm:max-w-md h-full max-h-[100dvh] bg-[#0b0f19] text-white shadow-2xl flex flex-col border-l border-slate-800/90 z-10 transition-transform animate-slide-left">
        
        {/* Mobile Drag Indicator Bar */}
        <div 
          onClick={handleClose}
          className="pt-2 pb-0.5 sm:hidden flex justify-center cursor-pointer shrink-0"
        >
          <div className="w-12 h-1 rounded-full bg-slate-700/80 active:bg-slate-600 transition-colors" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-[#0b0f19]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {t('cartTitle')}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {cart.length} {language === 'ru' ? 'видов блюд' : (language === 'en' ? 'items selected' : 'xil taom tanlandi')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cart.length > 0 && (
              <button
                onClick={() => {
                  if (sounds?.playClick) sounds.playClick();
                  clearCart();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors active:scale-95"
                title={t('clearCart')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Bar */}
        {cart.length > 0 && (
          <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-brand-950/40 border-b border-brand-900/40 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-brand-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {remainingForFree === 0 ? (
                  <span className="text-emerald-400 font-bold">{t('freeDeliveryHint')}</span>
                ) : (
                  <span className="text-slate-300 text-[11px] sm:text-xs">
                    {language === 'ru' ? 'Еще ' : (language === 'en' ? 'Add ' : 'Yana ')}
                    <b className="font-extrabold text-amber-400">{remainingForFree.toLocaleString()} {t('currency')}</b>
                    {language === 'ru' ? ' до бесплатной доставки' : (language === 'en' ? ' for free delivery' : ' qo\'shing')}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-bold text-slate-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-slate-200">{t('emptyCartMsg')}</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xs">
                {t('emptyCartSub')}
              </p>
              <button
                onClick={handleClose}
                className="btn-secondary mt-5 px-6 py-2.5 rounded-2xl text-xs sm:text-sm"
              >
                {t('menu')}
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.customKey || item.id}
                className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-sm"
              >
                {/* Product Thumbnail */}
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
                  }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                />
                
                {/* Middle Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate leading-tight">
                    {item.name}
                  </h4>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      ↳ {item.modifiers.map(m => m.name).join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-brand-400 font-extrabold mt-0.5">
                    {Number(item.price).toLocaleString()} {t('currency')}
                  </p>
                </div>

                {/* Right Quantity Stepper & Subtotal */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                    <button
                      onClick={() => {
                        if (sounds?.playClick) sounds.playClick();
                        updateQuantity(item.customKey || item.id, -1);
                      }}
                      className="stepper-btn min-w-[36px] min-h-[36px] w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 active:scale-90 cursor-pointer touch-manipulation flex items-center justify-center select-none"
                      aria-label="Kamaytirish"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black min-w-[22px] text-center text-white select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        if (sounds?.playClick) sounds.playClick();
                        updateQuantity(item.customKey || item.id, 1);
                      }}
                      className="stepper-btn min-w-[36px] min-h-[36px] w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-sm shadow-brand-500/30 border-t border-white/25 active:scale-90 cursor-pointer touch-manipulation flex items-center justify-center select-none"
                      aria-label="Ko'paytirish"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-extrabold text-xs text-slate-300">
                      {(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        if (sounds?.playClick) sounds.playClick();
                        removeFromCart(item.customKey || item.id);
                      }}
                      className="btn-spring min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-rose-400 p-1.5 rounded-xl transition-colors cursor-pointer active:scale-90 touch-manipulation select-none"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {cart.length > 0 && (
          <div 
            className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#0b0f19]/95 backdrop-blur-md space-y-2.5 shrink-0"
            style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{t('subtotal')}:</span>
                <span className="font-semibold text-slate-200">{cartTotal.toLocaleString()} {t('currency')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t('deliveryFeeLabel')}:</span>
                <span className="font-semibold text-slate-200">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-bold">{t('freeDelivery')}</span>
                  ) : (
                    `${deliveryFee.toLocaleString()} ${t('currency')}`
                  )}
                </span>
              </div>
              <div className="border-t border-slate-800/80 pt-1.5 flex justify-between items-baseline">
                <span className="font-extrabold text-sm sm:text-base text-white">{t('total')}:</span>
                <span className="font-black text-lg sm:text-xl text-brand-400">
                  {grandTotal.toLocaleString()} <span className="text-xs">{t('currency')}</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn-primary btn-shimmer w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-sm"
            >
              <span>{t('proceedToCheckout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}