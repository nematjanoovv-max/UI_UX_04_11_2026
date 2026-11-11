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

  // 6-Digit SMS & Telegram OTP Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => !!tgUser);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpNeedStart, setOtpNeedStart] = useState(false);
  const [otpBotLink, setOtpBotLink] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  // 60-second Countdown timer for resend
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Polling to auto-detect verification when user taps bot Start link
  useEffect(() => {
    if (!isCheckoutOpen || !otpSent || isPhoneVerified || !formData.customer_phone) return;

    let isPolling = false;
    const abortController = new AbortController();

    const interval = setInterval(async () => {
      if (isPolling) return; // Prevent concurrent overlapping requests
      isPolling = true;

      try {
        const res = await api.checkOtpStatus(
          {
            phone: formData.customer_phone,
            code: otpCode || undefined
          },
          { signal: abortController.signal }
        );
        if (res && res.verified) {
          setIsPhoneVerified(true);
          setOtpSent(false);
          sounds.playSuccess();
          showToast('Telefon raqamingiz muvaffaqiyatli tasdiqlandi! ✅', 'success');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // ignore transient poll error
        }
      } finally {
        isPolling = false;
      }
    }, 1800);

    return () => {
      clearInterval(interval);
      abortController.abort();
    };
  }, [isCheckoutOpen, otpSent, isPhoneVerified, formData.customer_phone, otpCode]);

  const handleRequestOtp = async () => {
    if (isSendingOtp) return;
    const rawDigits = (formData.customer_phone || '').replace(/[^0-9]/g, '');
    if (!rawDigits || (rawDigits.length !== 9 && !(rawDigits.length === 12 && rawDigits.startsWith('998')))) {
      showToast('Iltimos, to\'liq telefon raqamingizni kiriting (+998 90 123 45 67)', 'error');
      return;
    }

    setIsSendingOtp(true);
    sounds.playClick();
    try {
      const res = await api.sendOtp({
        phone: formData.customer_phone,
        telegram_id: formData.telegram_id,
        telegram_username: formData.telegram_username
      });

      setOtpSent(true);
      setOtpCountdown(60);

      if (res.bot_link) {
        setOtpNeedStart(true);
        setOtpBotLink(res.bot_link);
      } else {
        setOtpNeedStart(false);
      }

      showToast(res.message || 'Tasdiqlash kodi yuborildi!', 'success');
    } catch (err) {
      showToast(err.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify) => {
    if (isVerifyingOtp) return;
    const code = String(codeToVerify || otpCode).trim();
    if (code.length !== 6) {
      showToast('Iltimos, 6 xonali kodni to\'liq kiriting', 'error');
      return;
    }

    setIsVerifyingOtp(true);
    sounds.playClick();
    try {
      const res = await api.verifyOtp({
        phone: formData.customer_phone,
        code
      });

      if (res.ok) {
        setIsPhoneVerified(true);
        setOtpSent(false);
        sounds.playSuccess();
        showToast('Telefon raqamingiz muvaffaqiyatli tasdiqlandi! ✅', 'success');
      }
    } catch (err) {
      sounds.playError?.();
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
    if (isApplyingPromo || !promoCodeInput.trim()) return;
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
    if (isLocating) return;
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
    if (isSubmitting) return;

    if (!cart || cart.length === 0) {
      showToast('Savatchangiz bo\'sh. Iltimos, avval menyudan taom tanlang.', 'error');
      setIsCheckoutOpen(false);
      return;
    }

    if (!formData.customer_name.trim()) {
      showToast('Iltimos, ismingizni kiriting', 'error');
      return;
    }

    const rawDigits = (formData.customer_phone || '').replace(/[^0-9]/g, '');
    if (!rawDigits || (rawDigits.length !== 9 && !(rawDigits.length === 12 && rawDigits.startsWith('998')))) {
      showToast('Iltimos, to\'g\'ri telefon raqam kiriting (+998 90 123 45 67)', 'error');
      return;
    }

    if (!formData.delivery_address.trim()) {
      showToast('Iltimos, yetkazib berish manzilini kiriting', 'error');
      return;
    }
    if (!isPhoneVerified) {
      showToast('Iltimos, avval telefon raqamingizni tasdiqlang (SMS yoki Telegram kodini kiriting)', 'error');
      if (!otpSent) handleRequestOtp();
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
    if (isSubmitting) return;
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

                {/* 6-Digit SMS & Telegram Verification Section */}
                {isPhoneVerified ? (
                  <div className="flex items-center gap-1.5 mt-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Telefon raqami muvaffaqiyatli tasdiqlangan ✅</span>
                  </div>
                ) : (
                  <div className="mt-2">
                    {!otpSent ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={isSendingOtp || formData.customer_phone.replace(/[^0-9]/g, '').length < 9}
                          className="btn-primary min-h-[44px] w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white shadow-md shadow-brand-500/25 disabled:opacity-60 disabled:pointer-events-none active:scale-95 cursor-pointer select-none touch-manipulation"
                        >
                          {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          <span>{isSendingOtp ? 'Yuborilmoqda...' : '📩 SMS / Telegram kodini olish'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-inner space-y-3">
                        {otpBotLink && (
                          <a
                            href={otpBotLink}
                            onClick={(e) => {
                              // On Android/mobile, try direct tg:// protocol first to launch Telegram app directly
                              try {
                                const tgDirect = otpBotLink
                                  .replace('https://t.me/', 'tg://resolve?domain=')
                                  .replace('?start=', '&start=');
                                window.location.href = tgDirect;
                              } catch (_) {}
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/40 text-xs font-extrabold transition-all shadow-sm group active:scale-95 cursor-pointer select-none touch-manipulation"
                          >
                            <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.92 9.07c-.14.65-.53.81-1.07.51l-2.95-2.17-1.42 1.37c-.16.16-.29.29-.6.29l.21-3.01 5.48-4.95c.24-.21-.05-.33-.37-.12l-6.77 4.26-2.92-.91c-.63-.2-.65-.63.13-.94l11.41-4.4c.53-.19.99.13.8.95z"/>
                            </svg>
                            <span>📲 Telegram botda kodni ko'rish / ochish</span>
                          </a>
                        )}

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">6 xonali tasdiqlash kodi:</span>
                          <span className="text-[11px] text-slate-400">Telegram bot orqali</span>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={otpCode}
                            onChange={e => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setOtpCode(val);
                              if (val.length === 6) handleVerifyOtp(val);
                            }}
                            placeholder="● ● ● ● ● ●"
                            className="min-h-[44px] flex-1 min-w-0 px-2 sm:px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-center text-base sm:text-lg font-black tracking-[0.25em] sm:tracking-[0.4em] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                          />
                          <button
                            type="button"
                            onClick={() => handleVerifyOtp(otpCode)}
                            disabled={isVerifyingOtp || otpCode.length !== 6}
                            className="btn-primary min-h-[44px] px-3 sm:px-4 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md shadow-brand-500/25 disabled:opacity-60 disabled:pointer-events-none shrink-0 active:scale-95 cursor-pointer select-none touch-manipulation flex items-center justify-center gap-1 whitespace-nowrap"
                          >
                            {isVerifyingOtp ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>...</span>
                              </>
                            ) : (
                              'Tasdiqlash'
                            )}
                          </button>
                        </div>

                        {/* Resend button with countdown & Bot auto-detect tip */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span className="text-slate-500">Botda "START" bosilsa avtomatik tasdiqlanadi ⚡</span>
                          {otpCountdown > 0 ? (
                            <span className="text-slate-500 font-mono">Qayta yuborish ({otpCountdown}s)</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleRequestOtp}
                              disabled={isSendingOtp}
                              className="text-brand-400 font-bold hover:underline"
                            >
                              Qayta kod so'rash 🔄
                            </button>
                          )}
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
                  className="flex items-center gap-1.5 min-h-[36px] px-2.5 py-1 text-xs font-semibold text-brand-400 hover:text-brand-300 active:scale-95 cursor-pointer touch-manipulation"
                >
                  {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Locate className="w-3.5 h-3.5" />}
                  <span>{isLocating ? t('locating') : t('detectLocation')}</span>
                </button>
              </div>

              {/* Quick district selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2.5 scrollbar-none text-xs">
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
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-brand-400 border border-slate-800 shrink-0 cursor-pointer select-none active:scale-95 transition-all touch-manipulation flex items-center justify-center font-bold text-xs"
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
                    className="min-h-[36px] px-2 text-slate-400 hover:text-rose-400 text-xs font-normal active:scale-95 cursor-pointer touch-manipulation"
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
                    className="min-h-[44px] flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoCodeInput.trim()}
                    className="btn-spring min-h-[44px] min-w-[80px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 border-t border-white/20 active:scale-95 cursor-pointer select-none touch-manipulation flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isApplyingPromo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>...</span>
                      </>
                    ) : (
                      t('apply')
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Cashback loyalty balance */}
            {cashbackBalance > 0 && (
              <div
                onClick={() => setUseCashback(!useCashback)}
                className={`min-h-[48px] p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none active:scale-98 touch-manipulation ${
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    className={`min-h-[52px] sm:min-h-[56px] flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-bold cursor-pointer select-none active:scale-95 transition-all touch-manipulation ${
                      formData.payment_method === pay.id
                        ? 'border-brand-500 bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/40 shadow-xs'
                        : `border-slate-800 bg-slate-900 text-slate-400 ${pay.color}`
                    }`}
                  >
                    <pay.icon className="w-4 h-4 mb-1" />
                    <span className="truncate">{pay.label}</span>
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
                className="btn-primary btn-shimmer w-full min-h-[50px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold disabled:opacity-60 disabled:pointer-events-none active:scale-95 cursor-pointer select-none touch-manipulation mt-2"
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
