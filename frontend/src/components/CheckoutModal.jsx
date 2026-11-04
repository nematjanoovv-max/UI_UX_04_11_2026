import React, { useState } from 'react';
import { X, MapPin, Locate, Phone, User, CreditCard, Banknote, ShieldCheck, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotal,
    deliveryFee,
    grandTotal,
    clearCart,
    setTrackedOrderNumber,
    setIsTrackerOpen,
    showToast
  } = useApp();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '+998 ',
    delivery_address: '',
    latitude: null,
    longitude: null,
    payment_method: 'Naqd',
    notes: ''
  });

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  // Geolocation API handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('Brauzeringiz geolokatsiyani qo\'llab-quvvatlamaydi', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
          delivery_address: prev.delivery_address || `Joylashuv koordinatasi: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
        }));
        setIsLocating(false);
        showToast('Joylashuvingiz muvaffaqiyatli aniqlandi!');
      },
      (err) => {
        setIsLocating(false);
        showToast('Joylashuvni aniqlashda xatolik: ' + err.message, 'error');
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_name.trim()) {
      showToast('Iltimos, ismingizni kiriting', 'error');
      return;
    }
    if (!formData.customer_phone || formData.customer_phone.length < 9) {
      showToast('Iltimos, to\'g\'ri telefon raqam kiriting', 'error');
      return;
    }
    if (!formData.delivery_address.trim()) {
      showToast('Iltimos, yetkazib berish manzilini kiriting', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        delivery_address: formData.delivery_address.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        payment_method: formData.payment_method,
        notes: formData.notes.trim(),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const res = await api.createOrder(orderPayload);

      clearCart();
      setIsCheckoutOpen(false);
      showToast(`Buyurtma qabul qilindi! Raqam: ${res.order_number}`);
      
      // Open Live Tracker
      setTrackedOrderNumber(res.order_number);
      setIsTrackerOpen(true);
    } catch (err) {
      showToast(err.message || 'Buyurtma berishda xatolik yuz berdi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-slide-up">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Buyurtmani rasmiylashtirish</h3>
              <p className="text-xs text-slate-400">Ma'lumotlaringiz xavfsiz va tezkor yetkaziladi</p>
            </div>
          </div>

          <button
            onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
            className="p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Ism */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Ismingiz *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Alisher Usmonov"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Telefon raqamingiz *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={formData.customer_phone}
                onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
          </div>

          {/* Manzil + Geolocation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Yetkazib berish manzili *
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Locate className="w-3.5 h-3.5" />
                )}
                <span>Joylashuvni aniqlash</span>
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <textarea
                required
                rows={2}
                value={formData.delivery_address}
                onChange={e => setFormData({ ...formData, delivery_address: e.target.value })}
                placeholder="Toshkent sh., Chilonzor 9, 14-uy, 28-x..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
              />
            </div>
          </div>

          {/* To'lov turi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              To'lov turi
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'Naqd', icon: Banknote, label: 'Naqd' },
                { id: 'Click', icon: CreditCard, label: 'Click' },
                { id: 'Payme', icon: CreditCard, label: 'Payme' },
                { id: 'Karta', icon: CreditCard, label: 'Karta' }
              ].map(pay => (
                <button
                  key={pay.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: pay.id })}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    formData.payment_method === pay.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <pay.icon className="w-4 h-4 mb-1" />
                  <span>{pay.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Izoh */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kuryer yoki oshxona uchun qo'shimcha izoh
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Masalan: Domofon kodi 45K, qo'ng'iroq qilmang bola uxlayapti"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          {/* Hisob va Tasdiqlash */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jami to'lov:</span>
              <span className="text-lg font-black text-brand-600 dark:text-brand-400">
                {grandTotal.toLocaleString()} so'm
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Buyurtma yuborilmoqda...</span>
                </>
              ) : (
                <span>Buyurtmani tasdiqlash</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
