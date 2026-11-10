import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  ShieldCheck, 
  Bike, 
  MapPin, 
  ArrowRight, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export default function CustomerView({ searchQuery, setSearchQuery }) {
  const { setIsCartOpen, setIsTrackerOpen, t, language } = useApp();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Load categories and products
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catsData, prodsData] = await Promise.all([
          api.getCategories(),
          api.getProducts()
        ]);
        setCategories(catsData);
        setProducts(prodsData);
      } catch (err) {
        console.error('Data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category_id === Number(selectedCategory);
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-20">
      
      {/* 2026 Trend Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-brand-500/10 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs sm:text-sm font-bold animate-slide-up">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                {t('heroTitle1')} <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-brand-600 via-amber-500 to-brand-500 bg-clip-text text-transparent">
                  {t('heroTitle2')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t('heroSubtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-brand-500/30 active:scale-95 transition-all"
                >
                  <Flame className="w-5 h-5 text-amber-200" />
                  <span>{t('orderNow')}</span>
                </button>

                <button
                  onClick={() => setIsTrackerOpen(true)}
                  className="flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-white font-extrabold text-sm sm:text-base shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
                >
                  <MapPin className="w-5 h-5 text-brand-500" />
                  <span>{t('trackOrder')}</span>
                </button>
              </div>

              {/* Micro stats banner */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200/60 dark:border-slate-800/60 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <span className="block font-black text-lg sm:text-xl text-slate-900 dark:text-white">~25 min</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{language === 'ru' ? 'Среднее время' : (language === 'en' ? 'Avg Delivery' : 'O\'rtacha yetkazish')}</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block font-black text-lg sm:text-xl text-brand-500">100% Halol</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{language === 'ru' ? 'Сертифицировано' : (language === 'en' ? 'Certified' : 'Sertifikatlangan')}</span>
                </div>
                <div className="text-center lg:text-left">
                  <span className="block font-black text-lg sm:text-xl text-emerald-500">0 {t('currency')}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t('freeDelivery')} (150k+)</span>
                </div>
              </div>

            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60 dark:border-slate-800/60 aspect-square group">
                  <img
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80"
                    alt="Delicious burger"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-card text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Kun Taomi</span>
                        <h4 className="font-extrabold text-base sm:text-lg">Smart Burger Max</h4>
                      </div>
                      <span className="font-black text-lg text-amber-400">48 000 so'm</span>
                    </div>
                  </div>
                </div>

                {/* Floating mini badge */}
                <div className="absolute -top-4 -right-4 p-4 rounded-2xl glass shadow-xl border border-white/50 dark:border-slate-700 flex items-center gap-3 animate-bounce">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Jonli Kuzatuv</span>
                    <span className="text-[11px] text-emerald-500 font-semibold">Kuryer yo'lda</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t('menu')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {language === 'ru' ? 'Все Вкусные Блюда' : (language === 'en' ? 'All Delicious Meals' : 'Barcha Sarxil Taomlar')}
            </h2>
          </div>

          <span className="text-xs sm:text-sm font-semibold text-slate-400">
            {filteredProducts.length} {language === 'ru' ? 'товаров' : (language === 'en' ? 'items' : 'ta mahsulot')}
          </span>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 scale-105'
                : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-brand-500/50'
            }`}
          >
            <span>✨ {t('allCategories')}</span>
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 scale-105'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-brand-500/50'
              }`}
            >
              <span>{cat.icon || '🍽'}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="rounded-3xl glass-card aspect-[4/3] animate-pulse bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <SlidersHorizontal className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              {t('noProducts')}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {language === 'ru' ? 'Попробуйте изменить поисковый запрос' : (language === 'en' ? 'Try searching for something else' : 'Qidiruv so\'zini o\'zgartirib ko\'ring')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base mb-1">25-35 Daqiqada Yetkazish</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Harorat saqlovchi maxsus termo-sumkalarda issiq holida eshigingizgacha olib boriladi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base mb-1">100% Sifat Kafolati</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Faqat yangi va sifatli mahsulotlar. Taom yoqmasa — pulingizni qaytarib beramiz.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base mb-1">Telegram Bot Sinxronligi</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Web-sayt, Telegram bot va Kuryer paneli yagona real-time baza orqali bog'langan.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
