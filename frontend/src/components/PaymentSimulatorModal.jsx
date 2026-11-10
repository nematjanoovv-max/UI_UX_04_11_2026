import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, ShieldCheck, ArrowRight, Loader2, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PaymentSimulatorModal({ isOpen, paymentMethod, amount, onConfirm, onCancel }) {
  const { t } = useApp();
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
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setTimeout(() => {
        onConfirm();
      }, 1200);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${provider.color} text-white relative`}>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md">
              <CreditCard className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider">{provider.name} Gateway</span>
          </div>

          <h3 className="text-2xl font-black">
            {Number(amount).toLocaleString()} so'm
          </h3>
          <p className="text-xs text-white/80 mt-1">
            Qabul qiluvchi: Smart Delivery LLC
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isDone ? (
            <div className="text-center py-6 space-y-2 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {t('paymentSuccess')}
              </h4>
              <p className="text-xs text-slate-500">
                Tranzaksiya tasdiqlandi. Buyurtma qabul qilinmoqda...
              </p>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>3D Secure himoyasi</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300">Komissiya 0%</span>
              </div>

              <div className="flex items-center justify-center py-2">
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm text-center">
                  <QrCode className="w-24 h-24 mx-auto text-slate-800 dark:text-slate-200" />
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">
                    Ilova orqali skanerlang
                  </span>
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${provider.color} hover:opacity-95 text-white font-black text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95`}
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
