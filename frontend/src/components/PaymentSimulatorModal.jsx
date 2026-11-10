import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, ShieldCheck, ArrowRight, Loader2, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PaymentSimulatorModal({ isOpen, paymentMethod, amount, onConfirm, onCancel }) {
  const { t, sounds } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const getProviderInfo = () => {
    switch (paymentMethod) {
      case 'Click':
        return {
          name: 'Click Up',
          color: 'from-sky-600 to-blue-700',
          badgeColor: 'bg-blue-500',
          textColor: 'text-blue-500',
          desc: 'Click tizimi orqali xavfsiz onlayn to\'lov'
        };
      case 'Payme':
        return {
          name: 'Payme',
          color: 'from-teal-500 to-cyan-600',
          badgeColor: 'bg-teal-500',
          textColor: 'text-teal-500',
          desc: 'Payme to\'lov tizimi orqali to\'lov'
        };
      case 'Uzum':
        return {
          name: 'Uzum Bank',
          color: 'from-purple-600 to-indigo-700',
          badgeColor: 'bg-purple-500',
          textColor: 'text-purple-500',
          desc: 'Uzum orqali 0% komissiyali to\'lov'
        };
      default:
        return {
          name: 'Online Karta',
          color: 'from-brand-600 to-amber-600',
          badgeColor: 'bg-brand-500',
          textColor: 'text-brand-500',
          desc: 'Uzcard / Humo onlayn to\'lov'
        };
    }
  };

  const provider = getProviderInfo();

  const handlePay = () => {
    if (sounds?.playClick) sounds.playClick();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      if (sounds?.playSuccess) sounds.playSuccess();
      setTimeout(() => {
        onConfirm();
      }, 1000);
    }, 1500);
  };

  const handleClose = () => {
    if (sounds?.playClick) sounds.playClick();
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={!isProcessing ? handleClose : undefined}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="relative w-full sm:max-w-sm bg-[#0b0f19] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-slide-up z-10">
        
        {/* Mobile Drag Indicator Bar */}
        <div 
          onClick={!isProcessing ? handleClose : undefined}
          className="pt-2 pb-0.5 sm:hidden flex justify-center cursor-pointer shrink-0"
        >
          <div className="w-12 h-1 rounded-full bg-slate-700/80" />
        </div>

        {/* Header */}
        <div className={`p-4 sm:p-6 bg-gradient-to-r ${provider.color} text-white relative`}>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-white/20 backdrop-blur-md">
              <CreditCard className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider">{provider.name} Gateway</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black">
            {Number(amount).toLocaleString()} so'm
          </h3>
          <p className="text-[11px] text-white/80 mt-0.5">
            Qabul qiluvchi: Smart Delivery LLC
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 pb-6 sm:pb-5 space-y-3.5 bg-[#0b0f19]">
          {isDone ? (
            <div className="text-center py-6 space-y-2 animate-scale-up">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-white">
                {t('paymentSuccess')}
              </h4>
              <p className="text-xs text-slate-400">
                Tranzaksiya tasdiqlandi. Buyurtma qabul qilinmoqda...
              </p>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>3D Secure himoyasi</span>
                </div>
                <span className="font-bold text-slate-300">Komissiya 0%</span>
              </div>

              <div className="flex items-center justify-center py-1">
                <div className="p-3 rounded-2xl border border-slate-800 bg-slate-900 shadow-sm text-center">
                  <QrCode className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-slate-200" />
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">
                    Ilova orqali skanerlang
                  </span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${provider.color} hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>To'lov o'tkazilmoqda...</span>
                  </>
                ) : (
                  <>
                    <span>To'lovni tasdiqlash</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}