import React, { useState, useEffect } from 'react';
import { Bike, Utensils, CheckCircle2, Clock, ChevronDown, ChevronUp, MapPin, Phone, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { sounds } from '../utils/soundEffects';

export default function DynamicIslandTracker() {
  const { isTrackerOpen, setIsTrackerOpen, setTrackedOrderNumber, t } = useApp();
  const [activeOrder, setActiveOrder] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Poll active order
  const checkActiveOrder = async () => {
    try {
      const savedNumber = localStorage.getItem('sd_last_order');
      if (!savedNumber) {
        setActiveOrder(null);
        return;
      }
      const order = await api.getOrder(savedNumber);
      if (order && order.status !== 'delivered' && order.status !== 'cancelled') {
        setActiveOrder(order);
      } else {
        setActiveOrder(null);
      }
    } catch (_) {
      setActiveOrder(null);
    }
  };

  useEffect(() => {
    checkActiveOrder();
    const interval = setInterval(checkActiveOrder, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!activeOrder || isDismissed || isTrackerOpen) return null;

  const handleOpenFullTracker = () => {
    sounds.playClick();
    setTrackedOrderNumber(activeOrder.order_number);
    setIsTrackerOpen(true);
    setIsExpanded(false);
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    sounds.playClick();
    setIsExpanded(prev => !prev);
  };

  const getStatusInfo = () => {
    switch (activeOrder.status) {
      case 'new':
        return {
          icon: Clock,
          color: 'text-amber-400',
          bg: 'bg-amber-500/20',
          title: 'Buyurtma qabul qilindi',
          desc: 'Restoran tasdiqlamoqda...',
          progress: 25,
        };
      case 'confirmed':
        return {
          icon: CheckCircle2,
          color: 'text-blue-400',
          bg: 'bg-blue-500/20',
          title: 'Tasdiqlandi',
          desc: 'Oshxonaga yuborildi',
          progress: 45,
        };
      case 'preparing':
        return {
          icon: Utensils,
          color: 'text-purple-400',
          bg: 'bg-purple-500/20',
          title: 'Oshxonada tayyorlanmoqda',
          desc: 'Issiq va mazali pishmoqda...',
          progress: 70,
        };
      case 'on_way':
        return {
          icon: Bike,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/20',
          title: 'Kuryer yo\'lda!',
          desc: `${activeOrder.courier_name || 'Kuryer'} siz tomonga shoshilmoqda`,
          progress: 90,
        };
      default:
        return {
          icon: Sparkles,
          color: 'text-brand-400',
          bg: 'bg-brand-500/20',
          title: 'Buyurtma faol',
          desc: 'Jarayonda...',
          progress: 50,
        };
    }
  };

  const info = getStatusInfo();
  const IconComponent = info.icon;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] sm:max-w-md w-full px-2 transition-all duration-300">
      <div
        onClick={toggleExpand}
        className={`w-full bg-slate-950/95 dark:bg-slate-900/95 text-white backdrop-blur-2xl border border-white/15 shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
          isExpanded ? 'rounded-3xl p-5 island-glow' : 'rounded-full px-4 py-2.5 island-glow hover:scale-[1.02]'
        }`}
      >
        {/* COMPACT PILL MODE */}
        {!isExpanded ? (
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-full ${info.bg} ${info.color} flex items-center justify-center shrink-0 animate-pulse`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="font-black text-white mr-1.5">{activeOrder.order_number}:</span>
                <span className="font-semibold text-slate-300">{info.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                Jonli
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playClick();
                  setIsDismissed(true);
                }}
                className="text-slate-400 hover:text-white p-0.5"
                title="Yashirish"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* EXPANDED ISLAND MODE */
          <div className="space-y-4 animate-fade-in text-xs" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-2xl ${info.bg} ${info.color} flex items-center justify-center shrink-0`}>
                  <IconComponent className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">
                    {activeOrder.order_number}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {info.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleExpand}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  title="Kichraytirish"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsDismissed(true);
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  title="Yopish"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-1.5">
                <span className="text-slate-400">{info.desc}</span>
                <span className="text-brand-400">{info.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${info.progress}%` }}
                />
              </div>
            </div>

            {/* Courier card if assigned */}
            {activeOrder.courier_name && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{activeOrder.courier_name}</span>
                    <span className="text-[10px] text-slate-400">Tezkor yetkazuvchi</span>
                  </div>
                </div>
                {activeOrder.courier_phone && (
                  <a
                    href={`tel:${activeOrder.courier_phone}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25 active:scale-95 transition-transform"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Qo'ng'iroq</span>
                  </a>
                )}
              </div>
            )}

            {/* Open Full Map Tracker Button */}
            <button
              onClick={handleOpenFullTracker}
              className="w-full py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-transform active:scale-98"
            >
              <MapPin className="w-4 h-4" />
              <span>Xaritada to'liq jonli kuzatish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
