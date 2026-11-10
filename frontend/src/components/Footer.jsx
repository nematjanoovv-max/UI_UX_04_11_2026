import React from 'react';
import { 
  UtensilsCrossed, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Send, 
  CreditCard, 
  Sparkles,
  Bike,
  Heart,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer({ setCurrentView }) {
  const { t, language, setIsTrackerOpen } = useApp();

  return (
    <footer className="border-t border-slate-800/80 bg-[#070b13] text-slate-300 transition-colors pt-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Column 1: Brand & Identity (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <div 
              onClick={() => setCurrentView && setCurrentView('client')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-amber-500 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-white">
                  Smart<span className="text-brand-500">Delivery</span>
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/15 border border-brand-500/30 text-brand-400">
                  2026 Web Edition
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              O'zbekistondagi eng ilg'or, tezkor va aqlli oziq-ovqat yetkazib berish ekotizimi. 
              Real-vaqt rejimida buyurtma berish, kuryerni jonli xaritada kuzatish va kafolatlangan lazzat!
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Halol Taomlar</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>25-35 min Yetkazish</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-sky-400">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Kafolatlangan Sifat</span>
              </span>
            </div>

            {/* Telegram Community Bot Link */}
            <div className="pt-2">
              <a
                href="https://t.me/Smart_delivery_fast_bot"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-bold transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Rasmiy Telegram Bot: @Smart_delivery_fast_bot</span>
              </a>
            </div>
          </div>

          {/* Column 2: Fast Food & Menu Links (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Menyu Bo'limlari
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => {
                    setCurrentView && setCurrentView('client');
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-brand-500" />
                  <span>Burgerlar & Fast Food</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentView && setCurrentView('client');
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-brand-500" />
                  <span>Milliy Taomlar & Palov</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentView && setCurrentView('client');
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-brand-500" />
                  <span>Pitsa & Pishiriqlar</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentView && setCurrentView('client');
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-brand-500" />
                  <span>Ichimliklar & Sharbatlar</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentView && setCurrentView('client');
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-brand-500" />
                  <span>Shirinliklar & Desertlar</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service & Portals (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Xizmatlar
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => setIsTrackerOpen(true)}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-sky-400" />
                  <span>Buyurtmani Jonli Kuzatish</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView && setCurrentView('courier')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                  <span>Kuryerlik Portali</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView && setCurrentView('admin')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left font-bold"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Boshqaruv Markazi</span>
                </button>
              </li>
              <li>
                <span className="text-slate-500 flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Yetkazib berish shartlari</span>
                </span>
              </li>
              <li>
                <span className="text-slate-500 flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Maxfiylik va Xavfsizlik</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Operations (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">
              Bog'lanish & 24/7 Xizmat
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <a href="tel:+998712000000" className="font-bold text-white hover:text-brand-400 transition-colors">
                    +998 (71) 200-00-00
                  </a>
                  <p className="text-[11px] text-slate-500">Yagona mijozlarni qo'llab-quvvatlash</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium">Toshkent shahri, Chilonzor tumani</span>
                  <p className="text-[11px] text-slate-500">Markaziy dispetcherlik filiali</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium">24/7 Uzluksiz ish tartibi</span>
                  <p className="text-[11px] text-slate-500">Dam olish kunlarisiz, tun-u kun</p>
                </div>
              </div>
            </div>

            {/* Operating status badge */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">Oshxona ochiq: Buyurtmalar qabul qilinmoqda</span>
            </div>
          </div>

        </div>

        {/* Accepted Payment Systems */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              To'lov Turlari:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { name: 'Payme', color: 'from-sky-500 to-cyan-500' },
              { name: 'Click', color: 'from-blue-600 to-indigo-600' },
              { name: 'Uzum Bank', color: 'from-purple-600 to-fuchsia-600' },
              { name: 'Uzcard', color: 'from-blue-700 to-sky-700' },
              { name: 'Humo', color: 'from-amber-600 to-orange-600' },
              { name: 'Visa / MC', color: 'from-emerald-600 to-teal-600' },
              { name: 'Naqd pul', color: 'from-slate-700 to-slate-800' }
            ].map(pay => (
              <span 
                key={pay.name} 
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-extrabold text-slate-300 shadow-sm"
              >
                {pay.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} <span className="text-slate-300 font-bold">Smart Delivery System</span>. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Sertifikatlangan</span>
            <span>&bull;</span>
            <span>Kafolatlangan sifat</span>
            <span>&bull;</span>
            <span>Toshkent, O'zbekiston</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
