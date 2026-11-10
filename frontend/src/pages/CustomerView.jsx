import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  ShieldCheck, 
  Bike, 
  MapPin, 
  SlidersHorizontal,
  X,
  Search
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export default function CustomerView({ searchQuery, setSearchQuery, setCurrentView }) {
  const { setIsTrackerOpen, t, language, sounds, haptics } = useApp();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categoryBarRef = useRef(null);
  const pillRefs = useRef({});
  const isManualScrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);

  // Load categories and products
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catsData, prodsData] = await Promise.all([
          api.getCategories(),
          api.getProducts()
        ]);
        setCategories(catsData || []);
        setProducts(prodsData || []);
      } catch (err) {
        console.error('Data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products by search query
  const searchTrimmed = (searchQuery || '').trim().toLowerCase();
  const matchesSearch = (p) => {
    if (!searchTrimmed) return true;
    return (
      (p.name && p.name.toLowerCase().includes(searchTrimmed)) ||
      (p.description && p.description.toLowerCase().includes(searchTrimmed))
    );
  };

  const searchedProducts = products.filter(matchesSearch);

  // Uncategorized products check
  const uncategorizedProducts = searchedProducts.filter(
    p => !categories.some(c => c.id === p.category_id)
  );

  // ScrollSpy: auto-detect active category section while scrolling
  useEffect(() => {
    if (loading || categories.length === 0) return;

    let ticking = false;

    const handleScroll = () => {
      if (isManualScrollingRef.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          ticking = false;

          // Header offset: sticky Navbar (56-80px) + sticky CategoryBar (~50px)
          const headerOffset = window.innerWidth >= 768 ? 145 : (window.innerWidth >= 640 ? 125 : 110);

          // If user scrolled near the top above catalog section
          const catalogEl = document.getElementById('catalog-section');
          if (catalogEl) {
            const catRect = catalogEl.getBoundingClientRect();
            if (catRect.top > headerOffset + 50) {
              setActiveCategory('all');
              return;
            }
          }

          // Check if at the bottom of the page
          const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 70;
          const activeCatsWithItems = categories.filter(cat => 
            searchedProducts.some(p => p.category_id === cat.id)
          );

          if (isAtBottom && activeCatsWithItems.length > 0) {
            const lastCat = activeCatsWithItems[activeCatsWithItems.length - 1];
            setActiveCategory(lastCat.id);
            return;
          }

          // Find current section in view
          let currentId = null;
          for (const cat of activeCatsWithItems) {
            const el = document.getElementById(`cat-section-${cat.id}`);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= headerOffset + 60 && rect.bottom > headerOffset) {
                currentId = cat.id;
                break;
              }
            }
          }

          if (currentId !== null) {
            setActiveCategory(currentId);
          } else if (catalogEl) {
            const catRect = catalogEl.getBoundingClientRect();
            if (catRect.top <= headerOffset + 50 && activeCatsWithItems.length > 0) {
              setActiveCategory(activeCatsWithItems[0].id);
            }
          }
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [loading, categories, searchedProducts]);

  // Auto-scroll horizontal category bar smoothly so active pill stays centered
  useEffect(() => {
    const pill = pillRefs.current[activeCategory];
    if (pill && categoryBarRef.current) {
      pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeCategory]);

  // Click handler for category pills
  const handleCategoryClick = (catId) => {
    if (sounds?.playClick) sounds.playClick();
    if (haptics?.selection) haptics.selection();
    setActiveCategory(catId);
    isManualScrollingRef.current = true;

    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 700);

    if (catId === 'all') {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      const sectionEl = document.getElementById(`cat-section-${catId}`);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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

      {/* Catalog Anchor */}
      <div id="catalog-section" className="scroll-mt-20" />

      {/* Sticky Category Navigation Ribbon with ScrollSpy */}
      <nav 
        aria-label="Kategoriyalar menyusi"
        className="sticky top-14 sm:top-16 md:top-20 z-30 bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg py-2.5 transition-all"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div 
            ref={categoryBarRef}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1"
          >
            {/* All Categories Button */}
            <button
              ref={el => pillRefs.current['all'] = el}
              onClick={() => handleCategoryClick('all')}
              className={`btn-spring flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-lg shadow-brand-500/35 border-t border-white/25 ring-2 ring-brand-400/40 scale-102 font-extrabold'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>✨</span>
              <span>{t('allCategories') || 'Barchasi'}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {searchedProducts.length}
              </span>
            </button>

            {/* Category Pills */}
            {categories.map(cat => {
              const count = searchedProducts.filter(p => p.category_id === cat.id).length;
              if (count === 0 && searchTrimmed) return null;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  ref={el => pillRefs.current[cat.id] = el}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`btn-spring flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-lg shadow-brand-500/35 border-t border-white/25 ring-2 ring-brand-400/40 scale-102 font-extrabold'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{cat.icon || '🍽'}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Catalog Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
        
        {/* Search Active Notification Badge */}
        {searchTrimmed && (
          <div className="flex items-center justify-between p-2.5 sm:p-3 my-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Search className="w-4 h-4 text-brand-400 shrink-0" />
              <span>
                {language === 'ru' ? 'Результаты поиска:' : (language === 'en' ? 'Search results for:' : 'Qidiruv natijalari:')}{' '}
                <strong className="text-white font-extrabold">"{searchQuery}"</strong> ({searchedProducts.length} {language === 'ru' ? 'товаров' : (language === 'en' ? 'items' : 'ta')})
              </span>
            </div>
            <button
              onClick={() => setSearchQuery && setSearchQuery('')}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700"
            >
              <X className="w-3 h-3" />
              <span>{language === 'ru' ? 'Сбросить' : (language === 'en' ? 'Clear' : 'Tozalash')}</span>
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="space-y-6 mt-4">
            {[1, 2].map(sec => (
              <div key={sec} className="space-y-3">
                <div className="h-6 w-40 bg-slate-800/80 rounded-lg animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-2xl bg-slate-900/80 border border-slate-800 aspect-[4/5] animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : searchedProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center mb-3">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-200">
              {t('noProducts') || 'Hech qanday taom topilmadi'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {language === 'ru' 
                ? 'По вашему запросу ничего не найдено. Попробуйте изменить поиск.' 
                : (language === 'en' 
                  ? 'No items match your criteria. Try adjusting your search query.' 
                  : 'Qidiruv bo\'yicha hech narsa topilmadi. Qidiruv so\'zini o\'zgartirib ko\'ring.')}
            </p>
            {searchTrimmed && (
              <button
                onClick={() => setSearchQuery && setSearchQuery('')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 active:scale-95 transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>{language === 'ru' ? 'Очистить поиск' : (language === 'en' ? 'Clear search' : 'Qidiruvni tozalash')}</span>
              </button>
            )}
          </div>
        ) : (
          /* Render Categories with ScrollSpy Targets */
          <div className="space-y-6 sm:space-y-10 pb-6">
            {categories.map(cat => {
              const catProducts = searchedProducts.filter(p => p.category_id === cat.id);
              if (catProducts.length === 0) return null;

              return (
                <section 
                  key={cat.id} 
                  id={`cat-section-${cat.id}`}
                  className="pt-3 sm:pt-4 scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36"
                >
                  {/* Category Section Header with Icon and Count */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl">{cat.icon || '🍽'}</span>
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                        {cat.name}
                      </h3>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                      {catProducts.length} {language === 'ru' ? 'шт' : (language === 'en' ? 'items' : 'ta')}
                    </span>
                  </div>

                  {/* Responsive 2-column mobile food grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
                    {catProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Uncategorized products if any */}
            {uncategorizedProducts.length > 0 && (
              <section 
                id="cat-section-other"
                className="pt-3 sm:pt-4 scroll-mt-28 sm:scroll-mt-32 md:scroll-mt-36"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🍽</span>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {language === 'ru' ? 'Другие блюда' : (language === 'en' ? 'Other items' : 'Boshqa taomlar')}
                    </h3>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                    {uncategorizedProducts.length} {language === 'ru' ? 'шт' : (language === 'en' ? 'items' : 'ta')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
                  {uncategorizedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

      </main>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 mb-6">
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