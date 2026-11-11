import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check, Sparkles, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductCustomizerModal({ product, isOpen, onClose, onAddToCart }) {
  const { t, sounds } = useApp();
  const [selectedModifiers, setSelectedModifiers] = useState([]);

  // Reset selected modifiers when opened or product changes
  useEffect(() => {
    if (isOpen) {
      setSelectedModifiers([]);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, product?.id, onClose]);

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

  const modalNode = (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden pointer-events-auto">
      {/* Dark backdrop */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Bottom Sheet / Modal Dialog */}
      <div className="relative w-full sm:max-w-md bg-[#0f172a] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 animate-slide-up flex flex-col max-h-[88dvh] sm:max-h-[85vh] z-10">
        
        {/* Mobile Drag Indicator Bar */}
        <div 
          onClick={handleClose}
          className="pt-2.5 pb-1 sm:hidden flex justify-center cursor-pointer shrink-0 select-none"
        >
          <div className="w-12 h-1 rounded-full bg-slate-600/80" />
        </div>

        {/* Header with image */}
        <div className="relative h-32 sm:h-44 w-full bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent" />
          
          {/* Close X Button */}
          <button
            onClick={handleClose}
            className="absolute top-2.5 right-2.5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 active:scale-90 transition-transform cursor-pointer select-none z-10 shadow-md"
            title="Yopish"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Product Title & Badges inside header */}
          <div className="absolute bottom-2.5 left-4 right-4 text-white">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-brand-500/90 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                {product.category_name || 'Smart Chef'}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                <Clock className="w-3 h-3 text-amber-400" />
                {product.prep_time_min || 15}m
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black leading-tight text-white line-clamp-1">{product.name}</h3>
          </div>
        </div>

        {/* Content & Modifiers list */}
        <div className="p-3.5 sm:p-4 overflow-y-auto overscroll-contain flex-1 space-y-3">
          {product.description && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>{t('selectModifiers') || "Qo'shimcha masalliqlar"}</span>
              </h4>
              <span className="text-[11px] font-bold text-brand-400">
                {selectedModifiers.length} {t('selectedCategory') || "tanlandi"}
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
                      className={`min-h-[46px] px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none active:scale-98 touch-manipulation ${
                        isChecked
                          ? 'border-brand-500 bg-brand-500/15 ring-1 ring-brand-500/40 text-brand-300 shadow-xs'
                          : 'border-slate-800/80 bg-slate-900/80 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                            isChecked
                              ? 'bg-brand-500 text-white'
                              : 'border border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-bold truncate">
                          {mod.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-white shrink-0 whitespace-nowrap">
                        {mod.price > 0 ? `+${Number(mod.price).toLocaleString()} so'm` : (t('freeDelivery') || 'bepul')}
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
          className="p-3.5 sm:p-4 border-t border-slate-800 bg-[#0b0f19]/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              {t('total') || 'Jami'}:
            </span>
            <span className="text-base sm:text-lg font-black text-white whitespace-nowrap">
              {currentTotal.toLocaleString()} <span className="text-xs font-bold text-brand-400">{t('currency') || "so'm"}</span>
            </span>
          </div>

          <button
            onClick={handleConfirm}
            className="btn-primary min-h-[44px] flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 active:scale-95 transition-all cursor-pointer select-none touch-manipulation whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('addModifiers') || "Savatga qo'shish"}</span>
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
}
