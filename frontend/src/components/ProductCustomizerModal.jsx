import React, { useState } from 'react';
import { X, Plus, Check, Sparkles, Clock, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductCustomizerModal({ product, isOpen, onClose, onAddToCart }) {
  const { t, sounds } = useApp();
  const [selectedModifiers, setSelectedModifiers] = useState([]);

  if (!isOpen || !product) return null;

  let modifiersList = [];
  try {
    if (product.modifiers) {
      modifiersList = typeof product.modifiers === 'string' ? JSON.parse(product.modifiers) : product.modifiers;
    }
  } catch (_) {
    modifiersList = [];
  }

  const toggleModifier = (mod) => {
    if (sounds?.playClick) sounds.playClick();
    if (selectedModifiers.find(m => m.id === mod.id)) {
      setSelectedModifiers(selectedModifiers.filter(m => m.id !== mod.id));
    } else {
      setSelectedModifiers([...selectedModifiers, mod]);
    }
  };

  const modifiersTotal = selectedModifiers.reduce((acc, m) => acc + (Number(m.price) || 0), 0);
  const currentTotal = Number(product.price) + modifiersTotal;

  const handleConfirm = (e) => {
    if (sounds?.playClick) sounds.playClick();
    const rect = e?.currentTarget?.getBoundingClientRect();
    onAddToCart({
      ...product,
      modifiers: selectedModifiers,
      price: currentTotal,
      basePrice: product.price,
      customKey: `${product.id}-${selectedModifiers.map(m => m.id).sort().join('-')}`
    }, rect);
    onClose();
  };

  const handleClose = () => {
    if (sounds?.playClick) sounds.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="relative w-full sm:max-w-lg bg-[#0b0f19] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-slide-up flex flex-col max-h-[92dvh] sm:max-h-[90vh] z-10">
        
        {/* Mobile Drag Indicator Bar */}
        <div 
          onClick={handleClose}
          className="pt-2 pb-0.5 sm:hidden flex justify-center cursor-pointer shrink-0"
        >
          <div className="w-12 h-1 rounded-full bg-slate-700/80" />
        </div>

        {/* Header with image */}
        <div className="relative h-40 sm:h-48 w-full bg-slate-900 shrink-0">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-black/30 to-transparent" />
          
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full bg-slate-900/80 text-white flex items-center justify-center backdrop-blur-md hover:bg-slate-900 active:scale-90 transition-all cursor-pointer select-none"
            title="Yopish"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-brand-500 text-[10px] font-black uppercase tracking-wider text-white">
                {product.category_name || 'Chef Special'}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {product.prep_time_min} {t('prepTime')}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black leading-tight text-white">{product.name}</h3>
          </div>
        </div>

        {/* Content & Modifiers list */}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain flex-1 space-y-3.5">
          {product.description && (
            <p className="text-xs text-slate-300 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-400" />
                {t('selectModifiers')}
              </h4>
              <span className="text-[11px] text-slate-400">
                {selectedModifiers.length} {t('selectedCategory')}
              </span>
            </div>

            {modifiersList.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-2xl">
                Ushbu taom uchun standart retsept tavsiya etiladi.
              </div>
            ) : (
              <div className="space-y-2">
                {modifiersList.map(mod => {
                  const isChecked = selectedModifiers.some(m => m.id === mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModifier(mod)}
                      className={`min-h-[48px] p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none active:scale-98 touch-manipulation ${
                        isChecked
                          ? 'border-brand-500 bg-brand-500/15 ring-1 ring-brand-500/40'
                          : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-brand-500 text-white'
                              : 'border-2 border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className={`text-xs font-bold ${isChecked ? 'text-brand-400' : 'text-slate-200'}`}>
                          {mod.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-white">
                        {mod.price > 0 ? `+${Number(mod.price).toLocaleString()} so'm` : t('freeDelivery')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer with action */}
        <div 
          className="p-4 sm:p-5 border-t border-slate-800 bg-[#0b0f19]/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              {t('total')}
            </span>
            <span className="text-base sm:text-lg font-black text-white">
              {currentTotal.toLocaleString()} {t('currency')}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            className="btn-primary min-h-[48px] flex items-center gap-1.5 px-6 py-3 rounded-2xl text-xs sm:text-sm active:scale-95 transition-all cursor-pointer select-none touch-manipulation font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addModifiers')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}