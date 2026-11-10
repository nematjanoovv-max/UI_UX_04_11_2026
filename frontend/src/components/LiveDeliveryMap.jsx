import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, Store, ExternalLink, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LiveDeliveryMap({ order }) {
  const { t } = useApp();
  const [progress, setProgress] = useState(0.2); // 0.0 to 1.0 along route
  const [speed, setSpeed] = useState(36);

  useEffect(() => {
    if (!order) return;
    if (order.status === 'delivered') {
      setProgress(1.0);
      setSpeed(0);
      return;
    }
    if (order.status === 'on_way') {
      // Simulate live scooter movement
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 0.92) return 0.92;
          return prev + 0.04;
        });
        setSpeed(Math.floor(32 + Math.random() * 12));
      }, 3000);
      return () => clearInterval(interval);
    } else if (order.status === 'preparing') {
      setProgress(0.25);
    } else {
      setProgress(0.1);
    }
  }, [order?.status]);

  if (!order) return null;

  // Destination coordinates or fallback to Tashkent coordinates
  const destLat = order.latitude || 41.2858;
  const destLng = order.longitude || 69.2035;

  const yandexNavUrl = `https://yandex.uz/maps/?rtext=41.3111,69.2797~${destLat},${destLng}&rtt=auto`;
  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=41.3111,69.2797&destination=${destLat},${destLng}`;

  // Bezier curve calculations for vector map
  const p0 = { x: 50, y: 150 };  // Restaurant
  const p1 = { x: 180, y: 40 };  // Curve control
  const p2 = { x: 350, y: 140 }; // Customer

  // Courier position along curve
  const tCoord = progress;
  const courierX = Math.pow(1 - tCoord, 2) * p0.x + 2 * (1 - tCoord) * tCoord * p1.x + Math.pow(tCoord, 2) * p2.x;
  const courierY = Math.pow(1 - tCoord, 2) * p0.y + 2 * (1 - tCoord) * tCoord * p1.y + Math.pow(tCoord, 2) * p2.y;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xl">
      {/* Top Map Status Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-black tracking-wide">
            {t('liveMap')} • GPS
          </span>
        </div>

        {order.status === 'on_way' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-brand-500/90 backdrop-blur-md text-white shadow-lg text-xs font-black">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{speed} km/soat</span>
          </div>
        )}
      </div>

      {/* Vector Interactive Map Simulation */}
      <div className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
        
        {/* Subtle Map Grid Lines */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />

        {/* SVG Route and Pins */}
        <svg viewBox="0 0 400 200" className="w-full h-full preserve-3d">
          {/* Street Road Graphic Background */}
          <path
            d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
            fill="none"
            stroke="#334155"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Glowing Animated Delivery Route */}
          <path
            d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="5"
            strokeDasharray="6,4"
            className="animate-pulse"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Restaurant Marker (Point 0) */}
          <g transform={`translate(${p0.x}, ${p0.y})`}>
            <circle r="14" fill="#f59e0b" fillOpacity="0.2" className="animate-ping" />
            <circle r="9" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Customer Destination Marker (Point 2) */}
          <g transform={`translate(${p2.x}, ${p2.y})`}>
            <circle r="14" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
            <circle r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Moving Courier Icon on Scooter */}
          <g transform={`translate(${courierX}, ${courierY})`}>
            <circle r="16" fill="#ef4444" fillOpacity="0.3" className="animate-ping" />
            <circle r="11" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          </g>
        </svg>

        {/* Labels positioned over SVG */}
        <div
          className="absolute text-center select-none"
          style={{ left: `${(p0.x / 400) * 100}%`, top: `${(p0.y / 200) * 100 + 4}%`, transform: 'translate(-50%, 0)' }}
        >
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold block shadow">
            Oshxona 🍳
          </span>
        </div>

        <div
          className="absolute text-center select-none"
          style={{ left: `${(p2.x / 400) * 100}%`, top: `${(p2.y / 200) * 100 + 4}%`, transform: 'translate(-50%, 0)' }}
        >
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold block shadow">
            Manzilingiz 📍
          </span>
        </div>

        <div
          className="absolute text-center select-none pointer-events-none transition-all duration-1000"
          style={{ left: `${(courierX / 400) * 100}%`, top: `${(courierY / 200) * 100 - 18}%`, transform: 'translate(-50%, -100%)' }}
        >
          <div className="px-2.5 py-1 rounded-xl bg-brand-500 text-white font-extrabold text-[11px] shadow-lg flex items-center gap-1">
            <span>🛵</span>
            <span>{order.courier_name || 'Kuryer'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
        <div className="truncate">
          <span className="text-[10px] text-slate-400 block">{t('deliveryAddress')}</span>
          <span className="font-semibold text-slate-200 truncate block">{order.delivery_address}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={yandexNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-colors"
            title="Yandex Navigator"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Yandex</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </a>
          <a
            href={googleNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-colors"
            title="Google Maps"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
