import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Bike, 
  PartyPopper, 
  Phone, 
  AlertCircle,
  RefreshCw,
  MapPin,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const STEPS = [
  { key: 'new', label: 'Qabul qilindi', desc: 'Operator tasdiqlashi kutilmoqda', icon: Clock },
  { key: 'confirmed', label: 'Tasdiqlandi', desc: 'Buyurtma oshxonaga uzatildi', icon: CheckCircle2 },
  { key: 'preparing', label: 'Tayyorlanmoqda', desc: 'Oshpazlar mahorat bilan pishirmoqda', icon: ChefHat },
  { key: 'on_way', label: 'Yo\'lda', desc: 'Kuryer siz tomon shoshilmoqda', icon: Bike },
  { key: 'delivered', label: 'Yetkazildi', desc: 'Yoqimli ishtaha tilaymiz!', icon: PartyPopper }
];

export default function OrderTrackerModal() {
  const {
    isTrackerOpen,
    setIsTrackerOpen,
    trackedOrderNumber,
    setTrackedOrderNumber,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState(trackedOrderNumber || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch tracked order
  const fetchOrder = async (queryToSearch) => {
    if (!queryToSearch) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.trackOrder(queryToSearch);
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError(err.message || 'Buyurtma topilmadi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTrackerOpen && trackedOrderNumber) {
      setSearchQuery(trackedOrderNumber);
      fetchOrder(trackedOrderNumber);
    }
  }, [isTrackerOpen, trackedOrderNumber]);

  // Real-time polling every 4 seconds while modal is open and order is active
  useEffect(() => {
    if (!isTrackerOpen || !order || order.status === 'delivered' || order.status === 'cancelled') return;

    const interval = setInterval(async () => {
      try {
        const updated = await api.trackOrder(order.order_number);
        setOrder(updated);
      } catch (_) {}
    }, 4000);

    return () => clearInterval(interval);
  }, [isTrackerOpen, order]);

  if (!isTrackerOpen) return null;

  const currentStepIndex = order ? STEPS.findIndex(s => s.key === order.status) : -1;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchOrder(searchQuery.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={() => setIsTrackerOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-slide-up">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Bike className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Jonli Buyurtma Kuzatuvi</h3>
              <p className="text-xs text-slate-400">Holat har 4 soniyada real-time yangilanadi</p>
            </div>
          </div>

          <button
            onClick={() => setIsTrackerOpen(false)}
            className="p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-2">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buyurtma raqami (#SD-1001) yoki telefon raqam..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Qidirish</span>}
            </button>
          </form>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-2">
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-sm my-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <div className="space-y-6 animate-fade-in">
              {/* Order Info Badge */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      {order.order_number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                      order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                      'bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(order.created_at).toLocaleString('uz-UZ')}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Jami to'lov</span>
                  <span className="text-base font-black text-brand-600 dark:text-brand-400">
                    {Number(order.total_amount).toLocaleString()} so'm
                  </span>
                </div>
              </div>

              {/* 5-Step Timeline */}
              <div className="py-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Yetkazib berish bosqichlari
                </h4>

                <div className="relative">
                  {/* Connecting line */}
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800" />

                  <div className="space-y-5">
                    {STEPS.map((step, idx) => {
                      const isCompleted = currentStepIndex >= idx;
                      const isCurrent = currentStepIndex === idx;
                      const Icon = step.icon;

                      return (
                        <div key={step.key} className="relative flex items-start gap-4 pl-1">
                          {/* Circle Icon */}
                          <div className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/40 ring-4 ring-brand-100 dark:ring-brand-900/40 scale-110'
                              : isCompleted
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Step Info */}
                          <div className="flex-1 pt-1">
                            <div className="flex items-center justify-between">
                              <h5 className={`font-bold text-sm ${
                                isCurrent ? 'text-brand-600 dark:text-brand-400' :
                                isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                              }`}>
                                {step.label}
                              </h5>
                              {isCurrent && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-50 dark:bg-brand-950/60 text-brand-600 border border-brand-200 dark:border-brand-800 animate-pulse">
                                  Hozirgi holat
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Courier Info Card (if assigned) */}
              {order.courier_name && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-brand-500/10 border border-brand-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md">
                      <Bike className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        Biriktirilgan Kuryer
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {order.courier_name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Transport: {order.courier_vehicle || 'Skuter'}
                      </p>
                    </div>
                  </div>

                  {order.courier_phone && (
                    <a
                      href={`tel:${order.courier_phone}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-transform active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Qo'ng'iroq</span>
                    </a>
                  )}
                </div>
              )}

              {/* Order Items & Address */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <span>{order.delivery_address}</span>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tarkibi:
                    </span>
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                        <span>{item.product_name} x {item.quantity}</span>
                        <span className="font-semibold">{Number(item.total_price).toLocaleString()} so'm</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
