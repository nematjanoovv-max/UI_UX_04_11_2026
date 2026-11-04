import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Navigation, 
  RefreshCw,
  Send,
  User,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export default function CourierView() {
  const { showToast, t, language } = useApp();

  const [couriers, setCouriers] = useState([]);
  const [selectedCourierId, setSelectedCourierId] = useState(() => {
    return localStorage.getItem('sd_courier_id') || '';
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load couriers
  const loadCouriers = async () => {
    try {
      const data = await api.getCouriers();
      setCouriers(data);
      if (!selectedCourierId && data.length > 0) {
        setSelectedCourierId(String(data[0].id));
        localStorage.setItem('sd_courier_id', String(data[0].id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load orders for selected courier
  const loadCourierOrders = async () => {
    if (!selectedCourierId) return;
    setLoading(true);
    try {
      const allOrders = await api.getOrders();
      // Filter orders assigned to this courier or active
      const courierOrders = allOrders.filter(
        o => o.courier_id === Number(selectedCourierId) && o.status !== 'cancelled'
      );
      setOrders(courierOrders);
    } catch (err) {
      showToast('Buyurtmalarni yuklashda xatolik: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCouriers();
  }, []);

  useEffect(() => {
    if (selectedCourierId) {
      localStorage.setItem('sd_courier_id', selectedCourierId);
      loadCourierOrders();
    }
  }, [selectedCourierId]);

  // Real-time polling every 5s for active courier orders
  useEffect(() => {
    if (!selectedCourierId) return;
    const interval = setInterval(() => {
      loadCourierOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedCourierId]);

  const activeCourier = couriers.find(c => String(c.id) === String(selectedCourierId));

  // Action: Accept / On Way
  const handleStartDelivery = async (orderId) => {
    try {
      await api.updateOrderStatus(orderId, 'on_way');
      if (activeCourier) {
        await api.updateCourierStatus(activeCourier.id, 'busy');
      }
      showToast('🚀 Yo\'lga chiqdingiz! Mijozga xabar berildi.');
      loadCourierOrders();
      loadCouriers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Action: Complete Delivery
  const handleCompleteDelivery = async (orderId) => {
    try {
      await api.updateOrderStatus(orderId, 'delivered');
      if (activeCourier) {
        await api.updateCourierStatus(activeCourier.id, 'free');
      }
      showToast('🎉 Buyurtma muvaffaqiyatli yetkazildi! Barakalla.');
      loadCourierOrders();
      loadCouriers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Status Switcher
  const handleStatusChange = async (newStatus) => {
    if (!activeCourier) return;
    try {
      await api.updateCourierStatus(activeCourier.id, newStatus);
      showToast(`Holatingiz "${newStatus}" ga o'zgartirildi`);
      loadCouriers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
      
      {/* Top Profile Card */}
      <div className="p-6 rounded-3xl glass-card mb-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Bike className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Kuryer Profili
                </span>
                {activeCourier && (
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    activeCourier.status === 'free' ? 'bg-emerald-500' :
                    activeCourier.status === 'busy' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                  }`} />
                )}
              </div>
              
              {/* Select courier account */}
              <select
                value={selectedCourierId}
                onChange={e => setSelectedCourierId(e.target.value)}
                className="mt-0.5 font-black text-lg sm:text-xl text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none cursor-pointer"
              >
                {couriers.map(c => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-900 text-sm">
                    {c.name} ({c.vehicle_type})
                  </option>
                ))}
              </select>

              {activeCourier && (
                <p className="text-xs text-slate-400 mt-0.5">
                  📞 {activeCourier.phone} • Yetkazilgan: <b>{activeCourier.total_delivered} ta</b>
                </p>
              )}
            </div>
          </div>

          {/* Courier Status Controls */}
          {activeCourier && (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleStatusChange('free')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCourier.status === 'free'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('statusFree')}
              </button>
              <button
                onClick={() => handleStatusChange('busy')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCourier.status === 'busy'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('statusBusy')}
              </button>
              <button
                onClick={() => handleStatusChange('offline')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCourier.status === 'offline'
                    ? 'bg-slate-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('statusOffline')}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Telegram Sync Info Banner */}
      <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs sm:text-sm flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <Send className="w-5 h-5 shrink-0 text-sky-500" />
          <span>
            {language === 'ru' 
              ? 'В нашем Telegram-боте вы можете отправить команду /courier для подключения номера.'
              : (language === 'en' 
                ? 'Send /courier command to our Telegram bot to register as an active courier.'
                : 'Telegram botimizda /courier buyrug\'ini yuborib telefoningizni ulashingiz mumkin.')}
          </span>
        </div>
        <a
          href="https://t.me/Smart_deliveryyy_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl bg-sky-500 text-white font-bold text-xs shrink-0 hover:bg-sky-600"
        >
          {language === 'ru' ? 'Открыть бота' : (language === 'en' ? 'Open Bot' : 'Botni ochish')}
        </a>
      </div>

      {/* Orders List Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {t('myActiveOrders')}
          </h2>
          <p className="text-xs text-slate-400">
            {orders.filter(o => o.status !== 'delivered').length} {language === 'ru' ? 'активных заказов' : (language === 'en' ? 'active orders' : 'ta faol yetkazish kutmoqda')}
          </p>
        </div>

        <button
          onClick={loadCourierOrders}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Orders Cards */}
      {orders.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-3xl glass-card">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
            Hozircha faol buyurtmalar yo'q
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Admin yangi buyurtma biriktirishi bilan bu yerda va Telegram botingizda bir vaqtda ko'rinadi.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isDelivered = order.status === 'delivered';
            const isOnWay = order.status === 'on_way';

            return (
              <div 
                key={order.id}
                className={`p-5 rounded-3xl glass-card transition-all ${
                  isOnWay ? 'border-2 border-brand-500 shadow-xl' : ''
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900 dark:text-white">
                        {order.order_number}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'on_way' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                        'bg-brand-100 text-brand-700'
                      }`}>
                        {order.status === 'on_way' ? '🚀 YO\'LDA' : order.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Qabul qilingan: {new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-brand-600 dark:text-brand-400 block">
                      {Number(order.total_amount).toLocaleString()} so'm
                    </span>
                    <span className="text-[11px] text-slate-400">To'lov: <b>{order.payment_method}</b></span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {order.customer_name}
                      </span>
                    </div>

                    <a
                      href={`tel:${order.customer_phone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{order.customer_phone}</span>
                    </a>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {order.delivery_address}
                      </span>
                      {order.notes && (
                        <p className="text-slate-400 mt-1 italic">
                          Izoh: "{order.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  {order.items && order.items.length > 0 && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 pt-1 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Taomlar:
                      </span>
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between">
                          <span>• {item.product_name}</span>
                          <span className="font-semibold">{item.quantity} dona</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons for Courier */}
                {!isDelivered ? (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                    {order.status !== 'on_way' ? (
                      <button
                        onClick={() => handleStartDelivery(order.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Yo'lga chiqdim</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold text-xs sm:text-sm"
                      >
                        <Navigation className="w-4 h-4 animate-spin" />
                        <span>Hozir yo'lda</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCompleteDelivery(order.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Yetkazib berdim</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ✅ Muvaffaqiyatli yetkazilgan
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
