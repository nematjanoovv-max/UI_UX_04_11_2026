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
    t,
    language
  } = useApp();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 150000;
  const remainingForFree = Math.max(0, freeDeliveryThreshold - cartTotal);
  const progressPercent = Math.min(100, Math.round((cartTotal / freeDeliveryThreshold) * 100));

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => !false && setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('cartTitle')}</h2>
                <p className="text-xs text-slate-400">{cart.length} {language === 'ru' ? 'видов блюд' : (language === 'en' ? 'items selected' : 'xil taom tanlandi')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title={t('clearCart')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Delivery Bar */}
          {cart.length > 0 && (
            <div className="px-6 py-3 bg-brand-50/50 dark:bg-brand-950/20 border-b border-brand-100 dark:border-brand-900/30">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-brand-700 dark:text-brand-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  {remainingForFree === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('freeDeliveryHint')}</span>
                  ) : (
                    <span>{language === 'ru' ? 'Еще ' : (language === 'en' ? 'Add ' : 'Yana ')}<b className="font-bold">{remainingForFree.toLocaleString()} {t('currency')}</b> {language === 'ru' ? 'до бесплатной доставки' : (language === 'en' ? 'for free delivery' : 'qo\'shing')}</span>
                  )}
                </span>
                <span className="text-slate-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{t('emptyCartMsg')}</h3>
                <p className="mt-1 text-sm text-slate-400 max-w-xs">
                  {t('emptyCartSub')}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-6 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-transform active:scale-95"
                >
                  {t('menu')}
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-0.5">
                      {Number(item.price).toLocaleString()} {t('currency')}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs hover:bg-slate-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-xs hover:bg-brand-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900 dark:text-white block">
                      {(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-500 mt-2 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <div className="space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('subtotal')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{cartTotal.toLocaleString()} {t('currency')}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{t('deliveryFeeLabel')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-500 font-bold">{t('freeDelivery')}</span>
                    ) : (
                      `${deliveryFee.toLocaleString()} ${t('currency')}`
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-baseline">
                  <span className="font-bold text-base text-slate-900 dark:text-white">{t('total')}:</span>
                  <span className="font-black text-xl text-brand-600 dark:text-brand-400">
                    {grandTotal.toLocaleString()} <span className="text-xs">{t('currency')}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 active:scale-[0.98] transition-all"
              >
                <span>{t('proceedToCheckout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
