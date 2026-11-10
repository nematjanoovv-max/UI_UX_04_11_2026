import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  ShieldCheck, 
  Bike, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag,
  ArrowRight,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const HERO_SLIDES = [
  {
    id: 1,
    badge: '🔥 Chegirma -25%',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    title: 'Smart Double Burger Set',
    subtitle: '2 ta suvli Big Burger + Katta Kartoshka Fri + 2 ta muzdek kola',
    price: '79 000',
    oldPrice: '105 000',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=80',
    categoryTarget: 6 // Fast food
  },
  {
    id: 2,
    badge: '🍲 An\'anaviy Taom',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    title: 'To\'y Oshi & Qozon Kabob',
    subtitle: 'Klassik Toshkent to\'y oshi — dumba, bedana tuxumi va mayiz bilan boyitilgan',
    price: '45 000',
    oldPrice: '52 000',
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=900&auto=format&fit=crop&q=80',
    categoryTarget: 7 // Milliy taomlar
  },
  {
    id: 3,
    badge: '⚡ 0 so\'m Yetkazish',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    title: '150 000 so\'mdan Bepul Yetkazish',
    subtitle: 'Termo-sumkalarda issiq va yangi holatda 25-35 daqiqada yetkazib beramiz',
    price: '0 so\'m',
    oldPrice: '15 000',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80',
    categoryTarget: 'all'
  }
];

const STORIES = [
  { id: 'all', icon: '🔥', label: 'Top Xitlar', glow: 'from-amber-500 to-rose-500' },
  { id: 6, icon: '🍔', label: 'Burgerlar', glow: 'from-orange-500 to-amber-500' },
  { id: 7, icon: '🍲', label: 'Milliy Oqshom', glow: 'from-emerald-500 to-teal-500' },
  { id: 8, icon: '🥤', label: 'Muzdek Ichimlik', glow: 'from-sky-500 to-blue-500' },
  { id: 9, icon: '🍰', label: 'Shirinliklar', glow: 'from-pink-500 to-rose-500' },
  { id: 10, icon: '🥗', label: 'Salat & Parhez', glow: 'from-green-500 to-emerald-500' },
  { id: 'fast', icon: '⚡', label: '15 Minutda', glow: 'from-yellow-400 to-amber-600' }
];

export default function HeroSection({ onSelectCategory }) {
  const { t, setIsTrackerOpen, sounds } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  const handleSlideAction = (target) => {
    sounds?.playClick?.();
    if (onSelectCategory) {
      onSelectCategory(target);
    }
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-3 sm:pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* =========================================================
            1. INSTAGRAM / WOLT STORIES CAROUSEL
            ========================================================= */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-2 px-2">
            {STORIES.map((story) => (
              <button
                key={story.id}
                onClick={() => handleSlideAction(story.id)}
                className="group flex flex-col items-center shrink-0 focus:outline-none transition-transform active:scale-95"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2.5px] bg-gradient-to-tr ${story.glow} shadow-md group-hover:scale-105 transition-all`}>
                  <div className="w-full h-full rounded-full bg-[#0b0f19] flex items-center justify-center text-xl sm:text-2xl border-2 border-slate-900 group-hover:bg-slate-900 transition-colors">
                    <span>{story.icon}</span>
                  </div>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-300 mt-1.5 group-hover:text-white transition-colors whitespace-nowrap">
                  {story.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================
            2. INTERACTIVE GRAND PROMO BANNER (CAROUSEL)
            ========================================================= */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-[#131b2e] border border-slate-800 shadow-2xl min-h-[220px] sm:min-h-[340px] md:min-h-[380px] flex items-center">
          
          {/* Background Image with Gradient Mask */}
          <div className="absolute inset-0 z-0">
            <img
              src={slide.image}
              alt={slide.title}
              key={slide.image}
              className="w-full h-full object-cover object-center opacity-35 sm:opacity-45 scale-105 transition-all duration-700 animate-fade-in"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/85 to-transparent sm:via-[#0b0f19]/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-transparent" />
          </div>

          {/* Slide Content */}
          <div className="relative z-10 max-w-2xl px-5 sm:px-10 py-6 sm:py-10 space-y-2.5 sm:space-y-4">
            
            {/* Badge & Live indicator */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider border ${slide.badgeColor}`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{slide.badge}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>4.9 reyting &bull; 100% Halol</span>
              </span>
            </div>

            {/* Slide Title */}
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {slide.title}
            </h2>

            {/* Slide Subtitle */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none">
              {slide.subtitle}
            </p>

            {/* Price & CTA Action Button */}
            <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-2xl font-black text-amber-400">
                  {slide.price} so'm
                </span>
                {slide.oldPrice && (
                  <span className="text-xs sm:text-sm text-slate-400 line-through">
                    {slide.oldPrice} so'm
                  </span>
                )}
              </div>

              <button
                onClick={() => handleSlideAction(slide.categoryTarget)}
                className="btn-primary inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black text-white shadow-lg shadow-brand-500/30"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buyurtma Berish</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsTrackerOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition-colors"
              >
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Kuryerni Kuzatish</span>
              </button>
            </div>

          </div>

          {/* Carousel Arrows */}
          <button
            onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            aria-label="Oldingi slayd"
            className="absolute left-2 sm:left-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur border border-white/10 text-white flex items-center justify-center transition-all opacity-70 hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
            aria-label="Keyingi slayd"
            className="absolute right-2 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur border border-white/10 text-white flex items-center justify-center transition-all opacity-70 hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Dots */}
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slayd ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? 'w-6 bg-brand-500' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

        </div>

        {/* =========================================================
            3. LUXURY FEATURE TILES (DESKTOP & MOBILE RESPONSIVE)
            ========================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-3 sm:mt-5">
          
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 text-brand-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white">25-35 Daqiqa</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Issiq termo-yetkazish</p>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white">100% Halol</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Sertifikatlangan sifat</p>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 text-sky-400 flex items-center justify-center shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white">Jonli Xarita</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Kuryer harakati real-vaqtda</p>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white">0 so'm Yetkazish</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400">150 000 so'm xaridga</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
