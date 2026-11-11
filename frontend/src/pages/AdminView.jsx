import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Bike, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Send, 
  RefreshCw,
  LogOut,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
  Tag,
  Star,
  FileText,
  Gift,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import ReceiptModal from '../components/ReceiptModal';

const DEFAULT_CATEGORIES = [
  { id: 6, name: 'Fast Food', icon: '🍔' },
  { id: 7, name: 'Milliy taomlar', icon: '🍲' },
  { id: 8, name: 'Ichimliklar', icon: '🥤' },
  { id: 9, name: 'Shirinliklar', icon: '🍰' },
  { id: 10, name: 'Salatlar & Gazaklar', icon: '🥗' }
];

export default function AdminView({ setCurrentView }) {
  const { showToast, t, language } = useApp();

  // Simple auth state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('sd_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab: 'dashboard' | 'orders' | 'menu' | 'couriers'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data states
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isCreatingCourier, setIsCreatingCourier] = useState(false);
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);

  const activeCategories = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;

  // New Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: 6,
    price: '',
    description: '',
    image_url: '',
    prep_time_min: 15,
    is_available: 1
  });

  const openProductModal = () => {
    const defaultCatId = activeCategories[0]?.id || 6;
    setProductForm(prev => ({
      ...prev,
      category_id: prev.category_id || defaultCatId
    }));
    setShowProductModal(true);
  };

  // New Courier Modal State
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [courierForm, setCourierForm] = useState({
    name: '',
    phone: '+998 ',
    telegram_id: '',
    vehicle_type: 'Skuter'
  });

  // Promo & Reviews States
  const [promos, setPromos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount_percent: 15,
    discount_amount: 0,
    min_order_amount: 40000
  });
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  // Handle Login
  const handleLogin = (e) => {
    e?.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('sd_admin_auth', 'true');
      setAuthError('');
      showToast('Admin panelga xush kelibsiz!');
    } else {
      setAuthError('Login yoki parol noto\'g\'ri');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sd_admin_auth');
    showToast('Tizimdan chiqildi');
  };

  // Load Data
  const loadAllData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [statsData, ordersData, prodsData, catsData, couriersData, promosData, reviewsData] = await Promise.all([
        api.getStats(),
        api.getOrders(),
        api.getProducts(),
        api.getCategories(),
        api.getCouriers(),
        api.getPromos().catch(() => []),
        api.getReviews().catch(() => [])
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setProducts(prodsData);
      setCategories(catsData);
      setCouriers(couriersData);
      setPromos(promosData || []);
      setReviews(reviewsData || []);
    } catch (err) {
      showToast('Ma\'lumotlarni yuklashda xatolik: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [isAuthenticated]);

  // Auto-refresh orders every 8 seconds in Admin
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      api.getOrders().then(data => setOrders(data)).catch(() => {});
      api.getStats().then(data => setStats(data)).catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Order Status Change
  const handleStatusChange = async (orderId, newStatus) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Buyurtma statusi "${newStatus}" ga o'zgartirildi`);
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Assign Courier to Order
  const handleAssignCourier = async (orderId, courierId) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(orderId);
    try {
      await api.assignCourier(orderId, courierId ? Number(courierId) : null);
      showToast('Kuryer biriktirildi va unga bildirishnoma yuborildi!');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Toggle Product Availability
  const handleToggleProduct = async (product) => {
    try {
      const newAvail = product.is_available === 1 ? 0 : 1;
      await api.updateProduct(product.id, { is_available: newAvail });
      showToast(`"${product.name}" holati o'zgartirildi`);
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Haqiqatan ham ushbu taomni o\'chirmoqchimisiz?')) return;
    try {
      await api.deleteProduct(id);
      showToast('Mahsulot o\'chirildi');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Create Product Submit
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (isCreatingProduct) return;
    setIsCreatingProduct(true);
    try {
      const selectedCatId = Number(productForm.category_id) || activeCategories[0]?.id || 6;
      await api.createProduct({
        ...productForm,
        category_id: selectedCatId,
        price: Number(productForm.price),
        prep_time_min: Number(productForm.prep_time_min) || 15
      });
      setShowProductModal(false);
      setProductForm({ name: '', category_id: selectedCatId, price: '', description: '', image_url: '', prep_time_min: 15, is_available: 1 });
      showToast('Yangi taom muvaffaqiyatli qo\'shildi!');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  // Create Courier Submit
  const handleCreateCourier = async (e) => {
    e.preventDefault();
    if (isCreatingCourier) return;
    setIsCreatingCourier(true);
    try {
      await api.createCourier(courierForm);
      setShowCourierModal(false);
      setCourierForm({ name: '', phone: '+998 ', telegram_id: '', vehicle_type: 'Skuter' });
      showToast('Yangi kuryer qo\'shildi!');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsCreatingCourier(false);
    }
  };

  // Toggle Courier Status
  const handleCourierStatusChange = async (courierId, newStatus) => {
    try {
      await api.updateCourierStatus(courierId, newStatus);
      showToast('Kuryer holati yangilandi');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Create Promo Code Submit
  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (isCreatingPromo || !promoForm.code.trim()) return;
    setIsCreatingPromo(true);
    try {
      await api.createPromo({
        code: promoForm.code.trim().toUpperCase(),
        discount_percent: Number(promoForm.discount_percent) || 0,
        discount_amount: Number(promoForm.discount_amount) || 0,
        min_order_amount: Number(promoForm.min_order_amount) || 0
      });
      setShowPromoModal(false);
      setPromoForm({ code: '', discount_percent: 15, discount_amount: 0, min_order_amount: 40000 });
      showToast('Yangi promo-kod yaratildi!');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsCreatingPromo(false);
    }
  };

  // Delete Promo Code
  const handleDeletePromo = async (id) => {
    if (!window.confirm('Haqiqatan ham ushbu promo-kodni o\'chirmoqchimisiz?')) return;
    try {
      await api.deletePromo(id);
      showToast('Promo-kod o\'chirildi');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl animate-slide-up">
          
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-center text-white">
            Smart Delivery Admin
          </h2>
          <p className="text-xs text-center text-slate-400 mt-1 mb-6">
            Markaziy dispetcherlik va boshqaruv tizimi
          </p>

          {authError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Logini
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Login"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Parol
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Parol"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full min-h-[48px] py-3 rounded-2xl text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-transform active:scale-95 cursor-pointer select-none touch-manipulation"
            >
              Tizimga kirish
            </button>
          </form>

          {/* Back to Client Store Button */}
          <button
            type="button"
            onClick={() => setCurrentView ? setCurrentView('client') : (window.location.href = '/')}
            className="w-full min-h-[44px] mt-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95 cursor-pointer select-none touch-manipulation"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-brand-400" />
            <span>Do'konga (Menyuga) qaytish</span>
          </button>

        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  return (
    <div className="min-h-[100dvh] w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 sm:pb-24 overflow-x-hidden">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
              Jonli Rejim
            </span>
            <span className="text-xs text-slate-400">Har 8 soniyada avto-yangilanadi</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Smart Delivery Dispetcherlik Markazi
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setCurrentView ? setCurrentView('client') : (window.location.href = '/')}
            className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 transition-transform active:scale-95 cursor-pointer select-none touch-manipulation"
            title="Mijoz menyusiga qaytish"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Do'konga qaytish</span>
          </button>

          <button
            onClick={loadAllData}
            disabled={loading}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all active:scale-95 cursor-pointer select-none touch-manipulation"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yangilash</span>
          </button>

          <button
            onClick={handleLogout}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 text-xs font-bold hover:bg-rose-100 transition-all active:scale-95 cursor-pointer select-none touch-manipulation"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-200 dark:border-slate-800 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
        {[
          { id: 'dashboard', label: t('dashboardTab'), icon: LayoutDashboard },
          { id: 'orders', label: `${t('ordersTab')} (${orders.length})`, icon: ShoppingBag },
          { id: 'menu', label: `${t('menuTab')} (${products.length})`, icon: UtensilsCrossed },
          { id: 'couriers', label: `${t('couriersTab')} (${couriers.length})`, icon: Bike },
          { id: 'promos', label: `${t('promosTab')} (${promos.length})`, icon: Tag },
          { id: 'reviews', label: `${t('reviewsTab')} (${reviews.length})`, icon: Star },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[44px] flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer select-none active:scale-95 touch-manipulation ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 scale-102'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* -------------------------------------------------------------
          TAB 1: DASHBOARD & STATS
          ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="p-6 rounded-3xl glass-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Tushum</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                {Number(stats.overview.totalRevenue).toLocaleString()} <span className="text-xs font-bold text-brand-500">so'm</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">O'rtacha chek: {Number(stats.overview.avgOrderValue).toLocaleString()} so'm</p>
            </div>

            <div className="p-6 rounded-3xl glass-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Buyurtmalar</span>
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                {stats.overview.totalOrders} <span className="text-xs font-bold text-slate-400">ta</span>
              </h3>
              <p className="text-xs text-emerald-500 mt-1">{stats.overview.deliveredOrders} ta yetkazildi</p>
            </div>

            <div className="p-6 rounded-3xl glass-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faol Buyurtmalar</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-amber-500 mt-3">
                {stats.overview.activeOrders} <span className="text-xs font-bold text-slate-400">ta</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Hozir jarayonda</p>
            </div>

            <div className="p-6 rounded-3xl glass-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kuryerlar Holati</span>
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                {stats.couriers.free} / {stats.couriers.total}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{stats.couriers.busy} ta kuryer band</p>
            </div>

          </div>

          {/* Sources Analysis Chart / Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl glass-card">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Buyurtma Manbalari (Web vs Telegram Bot)
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">💻 Web Sayt</span>
                    <span className="text-slate-900 dark:text-white">{stats.sources.web} ta</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 rounded-full" 
                      style={{ width: `${(stats.sources.web / (stats.overview.totalOrders || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600 dark:text-slate-400">🤖 Telegram Bot</span>
                    <span className="text-slate-900 dark:text-white">{stats.sources.bot} ta</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-500 rounded-full" 
                      style={{ width: `${(stats.sources.bot / (stats.overview.totalOrders || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Courier List */}
            <div className="p-6 rounded-3xl glass-card">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Bo'sh Kuryerlar (Tezkor biriktirish uchun)
              </h4>
              <div className="space-y-2.5">
                {couriers.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        c.status === 'free' ? 'bg-emerald-500' :
                        c.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                          {c.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {c.vehicle_type} • 📞 {c.phone}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {c.total_delivered} yetkazgan
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: ORDERS MANAGEMENT (DISPATCHER)
          ------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Order Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'new', label: 'Yangi' },
              { id: 'confirmed', label: 'Tasdiqlangan' },
              { id: 'preparing', label: 'Oshxonada' },
              { id: 'on_way', label: 'Yo\'lda' },
              { id: 'delivered', label: 'Yetkazilgan' },
              { id: 'cancelled', label: 'Bekor qilingan' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setOrderFilter(f.id)}
                className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer select-none active:scale-95 touch-manipulation ${
                  orderFilter === f.id
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* MOBILE CARD VIEW (< md screens) */}
          <div className="md:hidden space-y-3.5">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-3xl text-slate-400 text-sm">
                Ushbu filtr bo'yicha buyurtmalar topilmadi.
              </div>
            ) : (
              filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  className="p-4 sm:p-5 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-3"
                >
                  {/* Card Header: Order Number, Source, Time, Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base text-slate-900 dark:text-white">
                          {order.order_number}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          order.source === 'telegram_bot'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                        }`}>
                          {order.source === 'telegram_bot' ? '🤖 TG Bot' : '💻 Web Sayt'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>

                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                      order.status === 'new' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
                      order.status === 'preparing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' :
                      order.status === 'on_way' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' :
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Customer Info & Address */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        👤 {order.customer_name}
                      </span>
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer touch-manipulation shrink-0"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{order.customer_phone}</span>
                      </a>
                    </div>

                    {order.telegram_username ? (
                      <a
                        href={`https://t.me/${order.telegram_username.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800"
                      >
                        <span>✈️ @{order.telegram_username.replace('@', '')}</span>
                      </a>
                    ) : order.telegram_id ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        🆔 TG: {order.telegram_id}
                      </span>
                    ) : null}

                    <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{order.delivery_address}</span>
                    </div>
                  </div>

                  {/* Items, Total, Payment */}
                  <div className="space-y-1.5 text-xs">
                    <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
                      {order.items && order.items.map(i => {
                        let parsedMods = [];
                        try {
                          parsedMods = typeof i.modifiers === 'string' ? JSON.parse(i.modifiers) : (i.modifiers || []);
                        } catch (_) {}
                        return (
                          <div key={i.id} className="text-xs flex justify-between">
                            <span>• {i.product_name} x {i.quantity}</span>
                            {parsedMods.length > 0 && (
                              <span className="text-[10px] text-amber-500 truncate max-w-[140px]">
                                ({parsedMods.map(m => m.name).join(', ')})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400">To'lov: <b>{order.payment_method}</b></span>
                      <span className="font-black text-sm text-brand-600 dark:text-brand-400">
                        {Number(order.total_amount).toLocaleString()} so'm
                      </span>
                    </div>

                    {(order.promo_code || order.cashback_used > 0) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {order.promo_code && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            🎟 {order.promo_code} (-{Number(order.discount_amount || 0).toLocaleString()} so'm)
                          </span>
                        )}
                        {order.cashback_used > 0 && (
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                            💰 -{Number(order.cashback_used).toLocaleString()} keshbek
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Courier Assign Selector */}
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[11px] font-bold text-slate-500 block">Kuryer biriktirish:</label>
                    <select
                      value={order.courier_id || ''}
                      disabled={updatingOrderId === order.id}
                      onChange={(e) => handleAssignCourier(order.id, e.target.value)}
                      className="min-h-[44px] w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                    >
                      <option value="">-- Kuryer tanlang --</option>
                      {couriers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.status === 'free' ? '🟢 Bo\'sh' : '🟡 Band'})
                        </option>
                      ))}
                    </select>
                    {order.courier_name && (
                      <span className="text-[11px] text-brand-600 dark:text-brand-400 font-bold block">
                        Biriktirilgan: {order.courier_name}
                      </span>
                    )}
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer touch-manipulation shrink-0"
                    >
                      <FileText className="w-4 h-4 text-brand-500" />
                      <span>Chek</span>
                    </button>

                    {order.status === 'new' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                        disabled={updatingOrderId === order.id}
                        className="min-h-[44px] flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs active:scale-95 cursor-pointer touch-manipulation shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:pointer-events-none"
                      >
                        {updatingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Tasdiqlash</span>}
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'preparing')}
                        disabled={updatingOrderId === order.id}
                        className="min-h-[44px] flex-1 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs active:scale-95 cursor-pointer touch-manipulation shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:pointer-events-none"
                      >
                        {updatingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Oshxonaga</span>}
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'on_way')}
                        disabled={updatingOrderId === order.id}
                        className="min-h-[44px] flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs active:scale-95 cursor-pointer touch-manipulation shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:pointer-events-none"
                      >
                        {updatingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Yo'lga chiqarish</span>}
                      </button>
                    )}
                    {order.status === 'on_way' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                        disabled={updatingOrderId === order.id}
                        className="min-h-[44px] flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs active:scale-95 cursor-pointer touch-manipulation shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:pointer-events-none"
                      >
                        {updatingOrderId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Yetkazildi</span>}
                      </button>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        disabled={updatingOrderId === order.id}
                        className="min-h-[44px] px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl active:scale-95 cursor-pointer touch-manipulation shrink-0 disabled:opacity-60 disabled:pointer-events-none"
                      >
                        Bekor
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE VIEW (>= md screens) */}
          <div className="hidden md:block overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Raqam / Manba</th>
                  <th className="p-4">Mijoz / Manzil</th>
                  <th className="p-4">Tarkib / Summa</th>
                  <th className="p-4">Holat</th>
                  <th className="p-4">Kuryer biriktirish</th>
                  <th className="p-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Ushbu filtr bo'yicha buyurtmalar topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Order number & source */}
                      <td className="p-4 align-top">
                        <span className="font-black text-slate-900 dark:text-white block">
                          {order.order_number}
                        </span>
                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          order.source === 'telegram_bot'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                        }`}>
                          {order.source === 'telegram_bot' ? '🤖 TG Bot' : '💻 Web Sayt'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer details */}
                      <td className="p-4 align-top max-w-xs">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {order.customer_name}
                        </span>
                        <a href={`tel:${order.customer_phone}`} className="text-xs text-brand-500 font-semibold block hover:underline">
                          {order.customer_phone}
                        </a>
                        {order.telegram_username ? (
                          <a
                            href={`https://t.me/${order.telegram_username.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline mt-1 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800"
                          >
                            <span>✈️ @{order.telegram_username.replace('@', '')}</span>
                          </a>
                        ) : order.telegram_id ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            🆔 TG: {order.telegram_id}
                          </span>
                        ) : null}
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {order.delivery_address}
                        </p>
                      </td>

                      {/* Items & Amount */}
                      <td className="p-4 align-top">
                        <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                          {order.items && order.items.map(i => {
                            let parsedMods = [];
                            try {
                              parsedMods = typeof i.modifiers === 'string' ? JSON.parse(i.modifiers) : (i.modifiers || []);
                            } catch (_) {}
                            return (
                              <div key={i.id} className="text-xs">
                                <span className="font-medium">• {i.product_name} x {i.quantity}</span>
                                {parsedMods.length > 0 && (
                                  <span className="block text-[10px] text-amber-600 dark:text-amber-400 pl-3">
                                   + {parsedMods.map(m => m.name).join(', ')}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <span className="font-black text-sm text-slate-900 dark:text-white block mt-2">
                          {Number(order.total_amount).toLocaleString()} so'm
                        </span>
                        <span className="text-[10px] text-slate-400 block">To'lov: {order.payment_method}</span>
                        {order.promo_code && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            🎟 {order.promo_code} (-{Number(order.discount_amount || 0).toLocaleString()} so'm)
                          </span>
                        )}
                        {order.cashback_used > 0 && (
                          <span className="inline-block mt-1 ml-1 text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                            💰 -{Number(order.cashback_used).toLocaleString()} keshbek
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 align-top">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          order.status === 'new' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' :
                          order.status === 'preparing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' :
                          order.status === 'on_way' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' :
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Assign Courier Dropdown */}
                      <td className="p-4 align-top">
                        <select
                          value={order.courier_id || ''}
                          disabled={updatingOrderId === order.id}
                          onChange={(e) => handleAssignCourier(order.id, e.target.value)}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                        >
                          <option value="">-- Kuryer tanlang --</option>
                          {couriers.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.status === 'free' ? '🟢 Bo\'sh' : '🟡 Band'})
                            </option>
                          ))}
                        </select>
                        {order.courier_name && (
                          <span className="text-[11px] text-brand-600 dark:text-brand-400 font-bold block mt-1">
                            Biriktirilgan: {order.courier_name}
                          </span>
                        )}
                      </td>

                      {/* Action Status Buttons */}
                      <td className="p-4 align-top text-right space-y-2">
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="min-h-[36px] flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all active:scale-95 cursor-pointer touch-manipulation"
                            title="Fiskal chekni ko'rish / chiqarish"
                          >
                            <FileText className="w-3.5 h-3.5 text-brand-500" />
                            <span>Chek</span>
                          </button>

                          {order.status === 'new' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'confirmed')}
                              disabled={updatingOrderId === order.id}
                              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center gap-1 disabled:opacity-60 disabled:pointer-events-none"
                            >
                              {updatingOrderId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Tasdiqlash</span>}
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'preparing')}
                              disabled={updatingOrderId === order.id}
                              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center gap-1 disabled:opacity-60 disabled:pointer-events-none"
                            >
                              {updatingOrderId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Oshxonaga</span>}
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'on_way')}
                              disabled={updatingOrderId === order.id}
                              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center gap-1 disabled:opacity-60 disabled:pointer-events-none"
                            >
                              {updatingOrderId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Yo'lga chiqarish</span>}
                            </button>
                          )}
                          {order.status === 'on_way' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                              disabled={updatingOrderId === order.id}
                              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center gap-1 disabled:opacity-60 disabled:pointer-events-none"
                            >
                              {updatingOrderId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Yetkazildi</span>}
                            </button>
                          )}
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                              disabled={updatingOrderId === order.id}
                              className="min-h-[36px] px-2 py-1 text-xs text-rose-500 hover:underline active:scale-95 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                            >
                              Bekor qilish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: MENU & PRODUCTS CRUD
          ------------------------------------------------------------- */}
      {activeTab === 'menu' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
              Restoran Taomlari Ro'yxati
            </h3>
            <button
              onClick={openProductModal}
              className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer select-none touch-manipulation w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi taom qo'shish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map(p => (
              <div key={p.id} className="p-4 rounded-3xl glass-card flex gap-4 items-center">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">
                    {p.category_name || 'Taom'}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {p.name}
                  </h4>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                    {Number(p.price).toLocaleString()} so'm
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleToggleProduct(p)}
                      className={`min-h-[38px] text-[11px] font-bold px-3 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer select-none touch-manipulation ${
                        p.is_available === 1
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {p.is_available === 1 ? 'Mavjud' : 'Tugagan'}
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-90 transition-all cursor-pointer touch-manipulation"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 4: COURIERS CRUD
          ------------------------------------------------------------- */}
      {activeTab === 'couriers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
              Kuryerlar Jamoasi
            </h3>
            <button
              onClick={() => setShowCourierModal(true)}
              className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer select-none touch-manipulation w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi kuryer qo'shish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {couriers.map(c => (
              <div key={c.id} className="p-5 sm:p-6 rounded-3xl glass-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                      <Bike className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {c.name}
                      </h4>
                      <p className="text-xs text-slate-400">{c.vehicle_type}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    c.status === 'free' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                    c.status === 'busy' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                    'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>Telefon:</span>
                    <a href={`tel:${c.phone}`} className="font-semibold text-brand-500 hover:underline">{c.phone}</a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Telegram ID:</span>
                    <span className="font-mono text-slate-400">{c.telegram_id || 'Ulanmagan'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Yetkazilgan jami:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{c.total_delivered} ta</span>
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button
                    onClick={() => handleCourierStatusChange(c.id, 'free')}
                    className={`min-h-[44px] flex-1 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer select-none touch-manipulation ${
                      c.status === 'free' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Bo'sh
                  </button>
                  <button
                    onClick={() => handleCourierStatusChange(c.id, 'busy')}
                    className={`min-h-[44px] flex-1 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer select-none touch-manipulation ${
                      c.status === 'busy' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Band
                  </button>
                  <button
                    onClick={() => handleCourierStatusChange(c.id, 'offline')}
                    className={`min-h-[44px] flex-1 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer select-none touch-manipulation ${
                      c.status === 'offline' ? 'bg-slate-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Offline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 5: PROMO CODES & CASHBACK MANAGEMENT
          ------------------------------------------------------------- */}
      {activeTab === 'promos' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-500" />
                <span>Promo-kodlar & Chegirmalar</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mijozlar buyurtma berishda kiritishi mumkin bo'lgan chegirma kodlari
              </p>
            </div>
            <button
              onClick={() => setShowPromoModal(true)}
              className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer select-none touch-manipulation w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi promo-kod yaratish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {promos.length === 0 ? (
              <div className="col-span-full text-center py-12 glass-card rounded-3xl">
                <Gift className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-semibold">Hozircha promo-kodlar mavjud emas</p>
              </div>
            ) : (
              promos.map(p => (
                <div
                  key={p.id}
                  className="p-5 rounded-3xl glass-card border-2 border-dashed border-brand-500/30 relative overflow-hidden space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-lg px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 tracking-wider">
                      {p.code}
                    </span>
                    <button
                      onClick={() => handleDeletePromo(p.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-rose-500 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-90 transition-all cursor-pointer touch-manipulation"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {p.discount_percent > 0 ? (
                      <span>{p.discount_percent}% <span className="text-sm font-bold text-brand-500">chegirma</span></span>
                    ) : (
                      <span>{Number(p.discount_amount).toLocaleString()} <span className="text-sm font-bold text-brand-500">so'm chegirma</span></span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span>Min. buyurtma:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {p.min_order_amount > 0 ? `${Number(p.min_order_amount).toLocaleString()} so'm` : 'Cheklovsiz'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ishlatildi:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{p.times_used || 0} marta</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Holati:</span>
                      <span className="font-bold text-emerald-600">● Faol</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 6: REVIEWS & 5-STAR RATINGS
          ------------------------------------------------------------- */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <span>Mijozlar Baholari va Sharhlari</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Yetkazib berilgan buyurtmalar bo'yicha mijozlarning 5 yulduzli baholari
              </p>
            </div>
          </div>

          {/* Average Rating Stats Banner */}
          <div className="p-6 rounded-3xl glass-card flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-amber-500/10 via-brand-500/5 to-transparent border border-amber-500/20">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                <span>{stats?.overview?.avgRating || '4.9'}</span>
                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Jami {reviews.length} ta mijoz sharhi
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 max-w-sm text-center sm:text-right">
              ⭐️ 5 yulduzli tizim mijozlar buyurtmani qabul qilib olgach veb-sayt va Telegram bot orqali avtomatik taklif qilinadi.
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.length === 0 ? (
              <div className="col-span-full text-center py-12 glass-card rounded-3xl">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-semibold">Hozircha baholar kelib tushmadi</p>
              </div>
            ) : (
              reviews.map(rev => (
                <div key={rev.id} className="p-5 rounded-3xl glass-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {rev.customer_name || 'Mijoz'}
                      </h4>
                      {rev.order_number && (
                        <span className="text-[10px] text-slate-400">
                          #{rev.order_number}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star
                          key={st}
                          className={`w-4 h-4 ${
                            st <= (rev.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                      "{rev.comment}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {rev.courier_name ? (
                      <span className="font-semibold text-brand-500">
                        🛵 {rev.courier_name}
                      </span>
                    ) : (
                      <span>Umumiy xizmat</span>
                    )}
                    <span>
                      {rev.created_at
                        ? new Date(rev.created_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : 'Yaqinda'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ADD NEW PRODUCT
          ------------------------------------------------------------- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-up max-h-[90dvh] overflow-y-auto pb-[env(safe-area-inset-bottom,16px)]">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
              Yangi Taom / Mahsulot Qo'shish
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Nomi *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Smart Burger..."
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              {/* Product Category (Tovar turi) visual selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Tovar / Mahsulot turi (Kategoriya) *
                  </label>
                  <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-850">
                    Tanlangan: {activeCategories.find(c => Number(c.id) === Number(productForm.category_id))?.icon} {activeCategories.find(c => Number(c.id) === Number(productForm.category_id))?.name || 'Kategoriya'}
                  </span>
                </div>

                {/* All category types visible as interactive buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {activeCategories.map(c => {
                    const isSelected = Number(productForm.category_id) === Number(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, category_id: c.id })}
                        className={`min-h-[44px] flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all active:scale-95 cursor-pointer touch-manipulation select-none ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/40 font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-brand-300'
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{c.icon || '🍽️'}</span>
                        <span className="truncate flex-1">{c.name}</span>
                        {isSelected && <span className="text-brand-500 font-bold text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Select dropdown */}
                <select
                  value={productForm.category_id}
                  onChange={e => setProductForm({ ...productForm, category_id: Number(e.target.value) })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {activeCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Narxi (so'm) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="45000"
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Tayyorlanish vaqti (daq.)</label>
                  <input
                    type="number"
                    value={productForm.prep_time_min}
                    onChange={e => setProductForm({ ...productForm, prep_time_min: e.target.value })}
                    placeholder="15"
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Tavsifi</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Tarkibi va masalliqlar..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Rasm URL</label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 active:scale-95 transition-all cursor-pointer touch-manipulation"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ADD NEW COURIER
          ------------------------------------------------------------- */}
      {showCourierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-up max-h-[90dvh] overflow-y-auto pb-[env(safe-area-inset-bottom,16px)]">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
              Yangi Kuryer Qo'shish
            </h3>
            <form onSubmit={handleCreateCourier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Ism va Familiya *</label>
                <input
                  type="text"
                  required
                  value={courierForm.name}
                  onChange={e => setCourierForm({ ...courierForm, name: e.target.value })}
                  placeholder="Ali Valiyev"
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Telefon raqam *</label>
                <input
                  type="tel"
                  required
                  value={courierForm.phone}
                  onChange={e => setCourierForm({ ...courierForm, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Transport turi</label>
                  <select
                    value={courierForm.vehicle_type}
                    onChange={e => setCourierForm({ ...courierForm, vehicle_type: e.target.value })}
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm cursor-pointer"
                  >
                    <option value="Skuter">Skuter</option>
                    <option value="Velosiped">Velosiped</option>
                    <option value="Avtomobil">Avtomobil</option>
                    <option value="Piyoda">Piyoda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Telegram ID (ixtiyoriy)</label>
                  <input
                    type="text"
                    value={courierForm.telegram_id}
                    onChange={e => setCourierForm({ ...courierForm, telegram_id: e.target.value })}
                    placeholder="123456789"
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourierModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 active:scale-95 transition-all cursor-pointer touch-manipulation"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ADD NEW PROMO CODE
          ------------------------------------------------------------- */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-up max-h-[90dvh] overflow-y-auto pb-[env(safe-area-inset-bottom,16px)]">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-brand-500" />
              <span>Yangi Promo-kod Yaratish</span>
            </h3>
            <form onSubmit={handleCreatePromo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Promo-kod nomi *</label>
                <input
                  type="text"
                  required
                  value={promoForm.code}
                  onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  placeholder="YANGIYIL2026"
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono uppercase tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Chegirma foizi (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={promoForm.discount_percent}
                    onChange={e => setPromoForm({ ...promoForm, discount_percent: e.target.value, discount_amount: 0 })}
                    placeholder="20"
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Yoki summa (so'm)</label>
                  <input
                    type="number"
                    min="0"
                    value={promoForm.discount_amount}
                    onChange={e => setPromoForm({ ...promoForm, discount_amount: e.target.value, discount_percent: 0 })}
                    placeholder="15000"
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Minimal buyurtma summasi (so'm)</label>
                <input
                  type="number"
                  min="0"
                  value={promoForm.min_order_amount}
                  onChange={e => setPromoForm({ ...promoForm, min_order_amount: e.target.value })}
                  placeholder="50000"
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 active:scale-95 transition-all cursor-pointer touch-manipulation"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thermal Receipt Preview Modal */}
      <ReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />

    </div>
  );
}
