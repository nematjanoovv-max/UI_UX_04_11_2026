import React, { useState } from 'react';
import { Sparkles, Flame, ShieldCheck, X, Truck, Phone } from 'lucide-react';

export default function AnnouncementBar() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="relative bg-gradient-to-r from-brand-600 via-amber-600 to-brand-700 text-white text-xs font-semibold py-1.5 px-4 shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8 overflow-hidden text-center whitespace-nowrap text-[11px] sm:text-xs">
          
          <div className="inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span>Toshkent bo'ylab <b>25-35 daqiqada</b> tezkor yetkazish</span>
          </div>

          <div className="hidden md:inline-flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
            <span><b>150 000 so'mdan</b> yuqori buyurtmalarga yetkazish <b>BEPUL!</b></span>
          </div>

          <div className="hidden lg:inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <span><b>100% Halol</b> sertifikatlangan yangi taomlar</span>
          </div>

          <div className="hidden xl:inline-flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-sky-200 shrink-0" />
            <span>Dispetcher: <b>+998 (71) 200-00-00</b></span>
          </div>

        </div>

        <button
          onClick={() => setClosed(true)}
          className="text-white/80 hover:text-white p-0.5 rounded-lg hover:bg-black/15 transition-colors shrink-0"
          title="Yopish"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
