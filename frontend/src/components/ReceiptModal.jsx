import React from 'react';
import { X, Printer, CheckCircle, QrCode, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ReceiptModal({ order, isOpen, onClose }) {
  const { t } = useApp();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = order.items || [];
  const subtotal = items.reduce((sum, it) => sum + (Number(it.total_price) || (Number(it.price) * Number(it.quantity))), 0);
  const discount = Number(order.discount_amount) || 0;
  const cashback = Number(order.cashback_used) || 0;
  const deliveryFee = Number(order.delivery_fee) || 0;
  const grandTotal = Number(order.total_amount) || (subtotal + deliveryFee - discount - cashback);

  const formattedDate = order.created_at ? new Date(order.created_at).toLocaleString('uz-UZ') : new Date().toLocaleString('uz-UZ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up flex flex-col max-h-[92vh] print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none">
        
        {/* Top toolbar (hidden in print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {t('viewReceipt')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('printReceipt')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs space-y-4 print:overflow-visible">
          
          {/* Logo & Header */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-4">
            <h2 className="text-lg font-black tracking-tight font-sans">
              SMART DELIVERY LLC
            </h2>
            <p className="text-[10px] text-slate-500 font-sans">
              Yetkazib berish va logistika tizimi (2026)
            </p>
            <p className="text-[10px] text-slate-500">
              STIR / INN: 309482910 • Toshkent sh., Chilonzor
            </p>
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ✓ ELEKTRON FISKAL CHEK
            </div>
          </div>

          {/* Order Details Header */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Buyurtma:</span>
              <span className="font-bold">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sana & Vaqt:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mijoz:</span>
              <span className="font-semibold">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Telefon:</span>
              <span>{order.customer_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">To'lov turi:</span>
              <span className="font-bold uppercase text-brand-600">{order.payment_method || 'Naqd'}</span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-4">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>Taom & Modifikator</span>
              <span>Summa</span>
            </div>

            {items.map((it, idx) => {
              let parsedMods = null;
              if (it.modifiers) {
                try {
                  parsedMods = typeof it.modifiers === 'string' ? JSON.parse(it.modifiers) : it.modifiers;
                } catch (_) {}
              }

              return (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold text-[11px]">
                    <span className="truncate pr-2">{it.quantity}x {it.product_name}</span>
                    <span>{Number(it.total_price || (it.price * it.quantity)).toLocaleString()} so'm</span>
                  </div>
                  {parsedMods && Array.isArray(parsedMods) && parsedMods.length > 0 && (
                    <div className="pl-3 text-[10px] text-slate-500">
                      ↳ {parsedMods.map(m => m.name).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Totals & Discounts */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-4">
            <div className="flex justify-between text-slate-500">
              <span>Taomlar summasi:</span>
              <span>{subtotal.toLocaleString()} so'm</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Promo-kod ({order.promo_code || 'Aksiya'}):</span>
                <span>-{discount.toLocaleString()} so'm</span>
              </div>
            )}

            {cashback > 0 && (
              <div className="flex justify-between text-purple-600 font-semibold">
                <span>Keshbek chegirmasi:</span>
                <span>-{cashback.toLocaleString()} so'm</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500">
              <span>Yetkazish xizmati:</span>
              <span>{deliveryFee === 0 ? 'BEPUL' : `${deliveryFee.toLocaleString()} so'm`}</span>
            </div>

            <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200">
              <span>JAMI TO'LOV:</span>
              <span>{grandTotal.toLocaleString()} so'm</span>
            </div>
          </div>

          {/* Fiscal QR Code Simulation */}
          <div className="pt-2 text-center space-y-2">
            <div className="w-24 h-24 mx-auto p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
              <QrCode className="w-20 h-20 text-slate-800" />
            </div>
            <p className="text-[9px] text-slate-400">
              Fiskal modul: 2026-UZ-F9382104 • Qabul qilindi
            </p>
            <p className="text-[10px] font-sans font-bold text-slate-700">
              Xaridingiz uchun rahmat! Yoqimli ishtaha! 🍔
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
