import React, { useState, useEffect } from 'react';
import { X, MapPin, Locate, Phone, User, CreditCard, Banknote, ShieldCheck, Loader2, Tag, Gift, Check, Sparkles, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import PaymentSimulatorModal from './PaymentSimulatorModal';
import { sounds } from '../utils/soundEffects';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotal,
    deliveryFee,
    clearCart,
    setTrackedOrderNumber,
    setIsTrackerOpen,
    showToast,
    t,
    language
  } = useApp();

  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;

  const [formData, setFormData] = useState({
    customer_name: tgUser ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') : '',
    customer_phone: '+998 ',
    telegram_username: tgUser?.username ? `@${tgUser.username}` : '',
    telegram_id: tgUser ? String(tgUser.id) : null,
    delivery_address: '',
    latitude: null,
    longitude: null,
    payment_method: 'Naqd',
    notes: ''
  });

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 6-Digit Telegram OTP Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => !!tgUser);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpNeedStart, setOtpNeedStart] = useState(false);
  const [otpBotLink, setOtpBotLink] = useState('');

  const handleRequestOtp = async () => {
    const rawDigits = formData.customer_phone.replace(/[^0-9]/g, '');
    if (rawDigits.length < 9) {
      showToast('Iltimos, to\'liq telefon raqamingizni kiriting (+998 90 123 45 67)', 'error');
      return;
    }

    setIsSendingOtp(true);
    sounds.playClick();
    try {
      const res = await api.sendTelegramOtp({
        phone: formData.customer_phone,
        telegram_id: formData.telegram_id,
        telegram_username: formData.telegram_username
      });

      setOtpSent(true);
      if (res.need_start) {
        setOtpNeedStart(true);
        setOtpBotLink(res.bot_link || 'https://t.me/Smart_delivery_fast_bot');
        showToast(res.message, 'success');
      } else {
        setOtpNeedStart(false);
        showToast('6 xonali tasdiqlash kodi Telegram botingizga yuborildi! 📩', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      showToast('Iltimos, 6 xonali kodni to\'liq kiriting', 'error');
      return;
    }

    setIsVerifyingOtp(true);
    sounds.playClick();
    try {
      const res = await api.verifyTelegramOtp({
        phone: formData.customer_phone,
        code: otpCode
      });

      if (res.ok) {
        setIsPhoneVerified(true);
        setOtpSent(false);
        sounds.playSuccess();
        showToast('Telefon raqamingiz muvaffaqiyatli tasdiqlandi! ✅', 'success');
      }
    } catch (err) {
      sounds.playPop();
      showToast(err.message || 'Kod noto\'g\'ri', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Promo code & Cashback states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [useCashback, setUseCashback] = useState(false);

  // Online Payment simulator state
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  // Fetch user cashback if phone or telegram_id exists
  useEffect(() => {
    if (!isCheckoutOpen) return;
    const loadCashback = async () => {
      try {
        const res = await api.getUserCashback({
          telegram_id: formData.telegram_id,
          phone: formData.customer_phone
        });
        if (res && res.cashback_balance) {
          setCashbackBalance(res.cashback_balance);
        }
      } catch (_) {}
    };
    loadCashback();
  }, [isCheckoutOpen, formData.telegram_id]);

  if (!isCheckoutOpen) return null;

  // Calculate discounts & final grand total
  const promoDiscount = appliedPromo ? Number(appliedPromo.discount_amount) : 0;
  const maxUsableCashback = Math.min(cashbackBalance, Math.max(0, cartTotal + deliveryFee - promoDiscount));
  const cashbackDeduction = useCashback ? maxUsableCashback : 0;
  const currentGrandTotal = Math.max(0, cartTotal + deliveryFee - promoDiscount - cashbackDeduction);

  // Promo validation handler
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setIsApplyingPromo(true);
    try {
      const res = await api.validatePromo(promoCodeInput.trim(), cartTotal);
      if (res && res.valid) {
        setAppliedPromo(res);
        sounds.playCoin();
        showToast(res.message);
      }
    } catch (err) {
      showToast(err.message, 'error');
      setAppliedPromo(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Quick District select helper
  const handleQuickDistrict = (name, lat, lng) => {
    setFormData(prev => ({
      ...prev,
      delivery_address: `Toshkent sh., ${name}, `,
      latitude: lat,
      longitude: lng
    }));
  };

  // Geolocation API handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('Brauzeringiz geolokatsiyani qo\'llab-quvvatlamaydi', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
          delivery_address: prev.delivery_address || `Toshkent (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        }));
        setIsLocating(false);
        showToast('Joylashuvingiz aniqlandi!');
      },
      (err) => {
        setIsLocating(false);
        showToast('Joylashuvni aniqlashda xatolik: ' + err.message, 'error');
      },
      { timeout: 10000 }
    );
  };

  // Pre-submit validation
  const handleFormSubmit = (e) => {
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
    if (!isPhoneVerified) {
      showToast('Iltimos, avval telefon raqamingizni Telegram orqali 6 xonali kod bilan tasdiqlang', 'error');
      return;
    }

    // If online payment (Click, Payme, Uzum), trigger gateway simulator first!
    if (['Click', 'Payme', 'Uzum'].includes(formData.payment_method)) {
      setShowPaymentGateway(true);
    } else {
      executeOrderCreation();
    }
  };

  // Final order creation
  const executeOrderCreation = async () => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        telegram_username: formData.telegram_username ? formData.telegram_username.trim() : null,
        telegram_id: formData.telegram_id || null,
        delivery_address: formData.delivery_address.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        payment_method: formData.payment_method,
        notes: formData.notes.trim(),
        promo_code: appliedPromo ? appliedPromo.code : null,
        discount_amount: promoDiscount,
        cashback_used: cashbackDeduction,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          modifiers: item.modifiers || null
        }))
      };

      const res = await api.createOrder(orderPayload);

      // Save for Dynamic Island live tracker
      localStorage.setItem('sd_last_order', res.order_number);
      sounds.playSuccess();

      clearCart();
      setShowPaymentGateway(false);
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
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
        {/* Backdrop */}
        <div 
          onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        />

        <div className="relative w-full sm:max-w-xl bg-[#0b0f19] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-800 flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden z-10 animate-slide-up">
          
          {/* Mobile Drag Indicator Bar */}
          <div 
            onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
            className="pt-2 pb-0.5 sm:hidden flex justify-center cursor-pointer shrink-0"
          >
            <div className="w-12 h-1 rounded-full bg-slate-700/80" />
          </div>

          {/* Header */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#0b0f19]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">{t('checkoutTitle')}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {language === 'ru' ? 'Быстрая и безопасная доставка вашего заказа' : (language === 'en' ? 'Fast and secure delivery to your address' : 'Tezkor va sifatli yetkazib berish')}
                </p>
              </div>
            </div>

            <button
              onClick={() => !isSubmitting && setIsCheckoutOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body with Scrollable Area & Fixed Sticky Footer */}
          <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5">
            
            {/* Ism & Telefon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {t('customerName')}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder={t('namePlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {t('customerPhone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={e => {
                      setFormData({ ...formData, customer_phone: e.target.value });
                      if (isPhoneVerified && !tgUser) setIsPhoneVerified(false);
                    }}
                    placeholder="+998 90 123 45 67"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  />
                </div>

                {/* 6-Digit Telegram Verification Badge / Inline Form */}
                {isPhoneVerified ? (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Telegram orqali tasdiqlangan raqam ✅</span>
                  </div>
                ) : (
                  <div>
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={isSendingOtp}
                        className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isSendingOtp ? 'Yuborilmoqda...' : '📲 Telegram orqali 6 xonali kod olish'}</span>
                      </button>
                    ) : (
                      <div className="mt-2 p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-300">Telegramga 6 xonali kod yuborildi:</span>
                          {otpNeedStart && (
                            <a
                              href={otpBotLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-amber-400 underline hover:text-amber-300"
                            >
                              Botda Start bosish 👉
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="123456"
                            className="flex-1 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-center text-sm tracking-widest font-black text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isVerifyingOtp || otpCode.length !== 6}
                            className="btn-spring px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-500/25 border-t border-white/20"
                          >
                            {isVerifyingOtp ? '...' : 'Tasdiqlash'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Manzil + GPS helper */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {t('deliveryAddress')}
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Locate className="w-3.5 h-3.5" />}
                  <span>{isLocating ? t('locating') : t('detectLocation')}</span>
                </button>
              </div>

              {/* Quick district selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
                <span className="text-slate-400 shrink-0 font-medium">Shahar:</span>
                {[
                  { name: 'Chilonzor', lat: 41.2858, lng: 69.2035 },
                  { name: 'Yunusobod', lat: 41.3645, lng: 69.2891 },
                  { name: 'Mirzo Ulug\'bek', lat: 41.3275, lng: 69.3242 },
                  { name: 'Mirobod', lat: 41.2912, lng: 69.2781 },
                  { name: 'Yakkasaroy', lat: 41.2783, lng: 69.2514 }
                ].map(dist => (
                  <button
                    key={dist.name}
                    type="button"
                    onClick={() => handleQuickDistrict(dist.name, dist.lat, dist.lng)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-brand-400 border border-slate-800 shrink-0 transition-colors"
                  >
                    {dist.name}
                  </button>
                ))}
              </div>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <textarea
                  required
                  rows={2}
                  value={formData.delivery_address}
                  onChange={e => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder={t('addressPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
                />
              </div>
            </div>

            {/* Promo-kod Section */}
            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <label className="text-xs font-black text-white flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('promoCode')}</span>
              </label>

              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Kod: <b>{appliedPromo.code}</b> (-{promoDiscount.toLocaleString()} so'm)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedPromo(null)}
                    className="text-slate-400 hover:text-rose-400 text-xs font-normal"
                  >
                    O'chirish
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="SMART2026, BEPUL..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo}
                    className="btn-spring px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/25 border-t border-white/20"
                  >
                    {isApplyingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('apply')}
                  </button>
                </div>
              )}
            </div>

            {/* Cashback loyalty balance */}
            {cashbackBalance > 0 && (
              <div
                onClick={() => setUseCashback(!useCashback)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                  useCashback
                    ? 'border-purple-500 bg-purple-500/15'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${useCashback ? 'bg-purple-600 text-white' : 'border-2 border-slate-600'}`}>
                    {useCashback && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t('useCashback')}</span>
                  </span>
                </div>
                <span className="text-xs font-black text-purple-400">
                  {cashbackBalance.toLocaleString()} so'm
                </span>
              </div>
            )}

            {/* To'lov turi */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {t('paymentMethod')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'Naqd', icon: Banknote, label: t('cash'), color: 'hover:border-emerald-500' },
                  { id: 'Click', icon: CreditCard, label: 'Click', color: 'hover:border-blue-500' },
                  { id: 'Payme', icon: CreditCard, label: 'Payme', color: 'hover:border-teal-500' },
                  { id: 'Uzum', icon: CreditCard, label: 'Uzum', color: 'hover:border-purple-500' }
                ].map(pay => (
                  <button
                    key={pay.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_method: pay.id })}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      formData.payment_method === pay.id
                        ? 'border-brand-500 bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/40 shadow-xs'
                        : `border-slate-800 bg-slate-900 text-slate-400 ${pay.color}`
                    }`}
                  >
                    <pay.icon className="w-4 h-4 mb-1" />
                    <span>{pay.label}</span>
                  </button>
                ))}
              </div>
            </div>

            </div>

            {/* Hisob va Tasdiqlash Sticky Footer */}
            <div className="p-4 sm:p-5 pb-6 sm:pb-5 border-t border-slate-800 shrink-0 bg-[#0b0f19]/95 backdrop-blur-md space-y-2">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{t('subtotal')}:</span>
                  <span className="font-semibold text-slate-200">{cartTotal.toLocaleString()} {t('currency')}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>{t('discount')}:</span>
                    <span>-{promoDiscount.toLocaleString()} {t('currency')}</span>
                  </div>
                )}

                {cashbackDeduction > 0 && (
                  <div className="flex justify-between text-purple-400 font-semibold">
                    <span>{t('cashback')}:</span>
                    <span>-{cashbackDeduction.toLocaleString()} {t('currency')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>{t('deliveryFeeLabel')}:</span>
                  <span className="font-semibold text-slate-200">{deliveryFee === 0 ? t('freeDelivery') : `${deliveryFee.toLocaleString()} ${t('currency')}`}</span>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 text-sm">
                  <span className="font-bold text-white">{t('total')}:</span>
                  <span className="text-xl font-black text-brand-400">
                    {currentGrandTotal.toLocaleString()} {t('currency')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary btn-shimmer w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('orderSubmitting')}</span>
                  </>
                ) : (
                  <span>
                    {['Click', 'Payme', 'Uzum'].includes(formData.payment_method)
                      ? `${formData.payment_method} orqali to'lash`
                      : t('submitOrderBtn')}
                  </span>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Online Payment Simulator Popup */}
      <PaymentSimulatorModal
        isOpen={showPaymentGateway}
        paymentMethod={formData.payment_method}
        amount={currentGrandTotal}
        onConfirm={executeOrderCreation}
        onCancel={() => setShowPaymentGateway(false)}
      />
    </>
  );
}
