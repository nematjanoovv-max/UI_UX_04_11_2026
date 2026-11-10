import React, { useState } from 'react';
import { X, Plus, Check, Sparkles, Clock, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductCustomizerModal({ product, isOpen, onClose, onAddToCart }) {
  const { t } = useApp();
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
    if (selectedModifiers.find(m => m.id === mod.id)) {
      setSelectedModifiers(selectedModifiers.filter(m => m.id !== mod.id));
    } else {
      setSelectedModifiers([...selectedModifiers, mod]);
    }
  };

  const modifiersTotal = selectedModifiers.reduce((acc, m) => acc + (Number(m.price) || 0), 0);
  const currentTotal = Number(product.price) + modifiersTotal;

  const handleConfirm = (e) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header with image */}
        <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 shrink-0">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-brand-500 text-[10px] font-black uppercase tracking-wider">
                {product.category_name || 'Chef Special'}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-200">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {product.prep_time_min} {t('prepTime')}
              </span>
            </div>
            <h3 className="text-xl font-black">{product.name}</h3>
          </div>
        </div>

        {/* Content & Modifiers list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {product.description}
          </p>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-500" />
                {t('selectModifiers')}
              </h4>
              <span className="text-[11px] text-slate-400">
                {selectedModifiers.length} {t('selectedCategory')}
              </span>
            </div>

            {modifiersList.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
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
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                        isChecked
                          ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-brand-500 text-white'
                              : 'border-2 border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                        <span className={`text-xs font-bold ${isChecked ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {mod.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
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
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              {t('total')}
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {currentTotal.toLocaleString()} {t('currency')}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addModifiers')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
