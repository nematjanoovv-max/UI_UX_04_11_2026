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
  Search,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import HeroSection from '../components/HeroSection';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export default function CustomerView({ searchQuery, setSearchQuery, setCurrentView }) {
  const { setIsTrackerOpen, t, language, sounds, haptics } = useApp();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [dietFilter, setDietFilter] = useState('all');

  const categoryBarRef = useRef(null);
  const pillRefs = useRef({});
  const activeCategoryRef = useRef('all');
  const isManualScrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);

  // Sync activeCategoryRef
  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

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

  // Filter products by search query and tags
  const searchTrimmed = (searchQuery || '').trim().toLowerCase();
  const matchesSearch = (p) => {
    if (!searchTrimmed) return true;
    return (
      (p.name && p.name.toLowerCase().includes(searchTrimmed)) ||
      (p.description && p.description.toLowerCase().includes(searchTrimmed))
    );
  };

  const filteredProducts = products.filter(matchesSearch).filter(p => {
    if (dietFilter === 'hit') return p.rating >= 4.7 || p.is_popular || p.price > 40000;
    if (dietFilter === 'fast') return (p.prep_time || 20) <= 20;
    return true;
  });

  const searchedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'popular') return (b.rating || 4.5) - (a.rating || 4.5);
    return 0;
  });

  // Uncategorized products check
  const uncategorizedProducts = searchedProducts.filter(
    p => !categories.some(c => c.id === p.category_id)
  );

  // ScrollSpy: auto-detect active category section while scrolling (butter-smooth 120Hz)
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
            if (catRect.top > headerOffset + 40) {
              if (activeCategoryRef.current !== 'all') {
                activeCategoryRef.current = 'all';
                setActiveCategory('all');
              }
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
            if (activeCategoryRef.current !== lastCat.id) {
              activeCategoryRef.current = lastCat.id;
              setActiveCategory(lastCat.id);
            }
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

          if (currentId !== null && currentId !== activeCategoryRef.current) {
            activeCategoryRef.current = currentId;
            setActiveCategory(currentId);
          } else if (catalogEl && currentId === null) {
            const catRect = catalogEl.getBoundingClientRect();
            if (catRect.top <= headerOffset + 40 && activeCatsWithItems.length > 0) {
              const firstId = activeCatsWithItems[0].id;
              if (activeCategoryRef.current !== firstId) {
                activeCategoryRef.current = firstId;
                setActiveCategory(firstId);
              }
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

  // Auto-scroll horizontal category bar smoothly WITHOUT ever touching window vertical scroll
  useEffect(() => {
    const pill = pillRefs.current[activeCategory];
    const bar = categoryBarRef.current;
    if (pill && bar) {
      const pillLeft = pill.offsetLeft;
      const pillWidth = pill.offsetWidth;
      const barWidth = bar.offsetWidth;
      const targetLeft = pillLeft - (barWidth / 2) + (pillWidth / 2);

      bar.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  // Click handler for category pills
  const handleCategoryClick = (catId) => {
    if (sounds?.playClick) sounds.playClick();
    if (haptics?.selection) haptics.selection();

    activeCategoryRef.current = catId;
    setActiveCategory(catId);
    isManualScrollingRef.current = true;

    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 850);

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
      
      {/* Premier Interactive Hero Section (Stories + Promo Carousel + Luxury Tiles) */}
      <HeroSection onSelectCategory={handleCategoryClick} />

      {/* Catalog Anchor */}
      <div id="catalog-section" className="scroll-mt-20" />

      {/* Sticky Category Navigation Ribbon with ScrollSpy */}
      <nav 
        aria-label="Kategoriyalar menyusi"
        className="sticky top-14 sm:top-16 md:top-20 z-30 bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg py-2.5 transition-all smooth-gpu"
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

      {/* Interactive Quick Filter & Sort Toolbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Quick Dietary & Tag Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Barchasi', icon: Sparkles },
              { id: 'hit', label: '🔥 Xit Taomlar', icon: Flame },
              { id: 'fast', label: '⚡ 15 daqiqada', icon: Clock },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  sounds?.playClick?.();
                  setDietFilter(f.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  dietFilter === f.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="default">Saralash: Standart</option>
              <option value="popular">Reyting bo'yicha</option>
              <option value="price-asc">Narx: Avval arzon</option>
              <option value="price-desc">Narx: Avval qimmat</option>
            </select>
          </div>

        </div>
      </div>

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