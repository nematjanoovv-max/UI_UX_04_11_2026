import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  ShieldCheck, 
  Bike, 
  MapPin, 
  SlidersHorizontal 
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export default function CustomerView({ searchQuery, setSearchQuery }) {
  const { setIsTrackerOpen, t, language } = useApp();
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
    <div className="min-h-screen">
      
      {/* Top Banner: Compact on Mobile, Rich on Desktop */}
      <section className="pt-3 sm:pt-6 pb-2">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Mobile Sleek Compact Promo Banner (< md) */}
          <div className="md:hidden p-3.5 rounded-2xl bg-gradient-to-r from-brand-950/80 via-slate-900 to-amber-950/50 border border-brand-500/25 shadow-lg flex items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{t('heroBadge') || 'Smart Fast Food 2026'}</span>
              </div>
              <h2 className="text-sm font-black text-white leading-tight">
                Issiq taomlar ~25 daqiqada!
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                100% Halol • 150 000 so'mdan bepul yetkazish
              </p>
            </div>
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 shadow active:scale-95 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>{t('trackOrder')}</span>
            </button>
          </div>

          {/* Desktop Rich Hero Section (>= md) */}
          <div className="hidden md:grid grid-cols-12 gap-8 items-center py-6">
            <div className="col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {t('heroTitle1')} <br />
                <span className="bg-gradient-to-r from-brand-500 via-amber-400 to-brand-400 bg-clip-text text-transparent">
                  {t('heroTitle2')}
                </span>
              </h1>

              <p className="text-sm lg:text-base text-slate-300 max-w-lg leading-relaxed">
                {t('heroSubtitle')}
              </p>

              <div className="flex items-center gap-4 pt-1">
                <div className="text-left">
                  <span className="block font-black text-base text-white">~25 min</span>
                  <span className="text-xs text-slate-400">Tezkor yetkazish</span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="text-left">
                  <span className="block font-black text-base text-brand-400">100% Halol</span>
                  <span className="text-xs text-slate-400">Sertifikatlangan</span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="text-left">
                  <span className="block font-black text-base text-emerald-400">0 so'm</span>
                  <span className="text-xs text-slate-400">150k+ buyurtmaga</span>
                </div>
              </div>
            </div>

            <div className="col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-[4/3] group">
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80"
                  alt="Kun taomi"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Kun Taomi</span>
                    <h4 className="font-extrabold text-sm">Smart Burger Max</h4>
                  </div>
                  <span className="font-black text-base text-amber-400">48 000 so'm</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2.5 sm:mb-4">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
            <span>{language === 'ru' ? 'Меню и Категории' : (language === 'en' ? 'Menu & Categories' : 'Menyu va Kategoriyalar')}</span>
          </div>

          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
            {filteredProducts.length} {language === 'ru' ? 'товаров' : (language === 'en' ? 'items' : 'ta mahsulot')}
          </span>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-3 no-scrollbar -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-102'
                : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-brand-500/50'
            }`}
          >
            <span>✨</span>
            <span>{t('allCategories')}</span>
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-102'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-brand-500/50'
              }`}
            >
              <span>{cat.icon || '🍽'}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6 mt-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl bg-slate-900/80 border border-slate-800 aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center mb-2">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-300">
              {t('noProducts')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ru' ? 'Попробуйте другой запрос' : (language === 'en' ? 'Try searching for something else' : 'Qidiruv so\'zini o\'zgartirib ko\'ring')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5 mt-2.5 sm:mt-5">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 mb-6">
        <div className="rounded-2xl sm:rounded-3xl bg-slate-900/70 border border-slate-800 p-5 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/25">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">25-35 Daqiqada Yetkazish</h4>
                <p className="text-[11px] text-slate-400">
                  Termo-sumkalarda issiq yetkaziladi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">100% Sifat Kafolati</h4>
                <p className="text-[11px] text-slate-400">
                  Toza va sertifikatlangan taomlar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/25">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">Jonli Kuryer Xaritasi</h4>
                <p className="text-[11px] text-slate-400">
                  Buyurtmangizni real vaqtda kuzating
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
