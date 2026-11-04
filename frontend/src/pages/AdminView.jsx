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
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export default function AdminView() {
  const { showToast } = useApp();

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

  // New Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    image_url: '',
    prep_time_min: 15,
    is_available: 1
  });

  // New Courier Modal State
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [courierForm, setCourierForm] = useState({
    name: '',
    phone: '+998 ',
    telegram_id: '',
    vehicle_type: 'Skuter'
  });

  // Handle Login
  const handleLogin = (e) => {
    e?.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('sd_admin_auth', 'true');
      setAuthError('');
      showToast('Admin panelga xush kelibsiz!');
    } else {
      setAuthError('Login yoki parol noto\'g\'ri (Demo: admin / admin123)');
    }
  };

  const handleDemoLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    setIsAuthenticated(true);
    localStorage.setItem('sd_admin_auth', 'true');
    setAuthError('');
    showToast('Demo admin sifatida kirdingiz!');
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
      const [statsData, ordersData, prodsData, catsData, couriersData] = await Promise.all([
        api.getStats(),
        api.getOrders(),
        api.getProducts(),
        api.getCategories(),
        api.getCouriers()
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setProducts(prodsData);
      setCategories(catsData);
      setCouriers(couriersData);
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
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Buyurtma statusi "${newStatus}" ga o'zgartirildi`);
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Assign Courier to Order
  const handleAssignCourier = async (orderId, courierId) => {
    try {
      await api.assignCourier(orderId, courierId ? Number(courierId) : null);
      showToast('Kuryer biriktirildi va unga bildirishnoma yuborildi!');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
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
    try {
      await api.createProduct({
        ...productForm,
        category_id: Number(productForm.category_id) || categories[0]?.id,
        price: Number(productForm.price),
        prep_time_min: Number(productForm.prep_time_min) || 15
      });
      setShowProductModal(false);
      setProductForm({ name: '', category_id: '', price: '', description: '', image_url: '', prep_time_min: 15, is_available: 1 });
      showToast('Yangi taom muvaffaqiyatli qo\'shildi!');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Create Courier Submit
  const handleCreateCourier = async (e) => {
    e.preventDefault();
    try {
      await api.createCourier(courierForm);
      setShowCourierModal(false);
      setCourierForm({ name: '', phone: '+998 ', telegram_id: '', vehicle_type: 'Skuter' });
      showToast('Yangi kuryer qo\'shildi!');
      loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
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

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-up">
          
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-center text-slate-900 dark:text-white">
            Smart Delivery Admin
          </h2>
          <p className="text-xs text-center text-slate-400 mt-1 mb-6">
            Markaziy dispetcherlik va boshqaruv tizimi
          </p>

          {authError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admin Logini
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Parol
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-transform active:scale-95"
            >
              Tizimga kirish
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={handleDemoLogin}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              ⚡️ 1-Click Tezkor Demo Kirish (admin / admin123)
            </button>
          </div>

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
              Jonli Rejim
            </span>
            <span className="text-xs text-slate-400">Har 8 soniyada avto-yangilanadi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Smart Delivery Dispetcherlik Markazi
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 text-xs font-bold hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'dashboard', label: 'Dashboard & Analitika', icon: LayoutDashboard },
          { id: 'orders', label: `Buyurtmalar (${orders.length})`, icon: ShoppingBag },
          { id: 'menu', label: `Menyu & Taomlar (${products.length})`, icon: UtensilsCrossed },
          { id: 'couriers', label: `Kuryerlar (${couriers.length})`, icon: Bike },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 scale-102'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
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
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
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
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  orderFilter === f.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
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
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {order.delivery_address}
                        </p>
                      </td>

                      {/* Items & Amount */}
                      <td className="p-4 align-top">
                        <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                          {order.items && order.items.map(i => (
                            <div key={i.id} className="truncate">
                              • {i.product_name} x {i.quantity}
                            </div>
                          ))}
                        </div>
                        <span className="font-black text-sm text-slate-900 dark:text-white block mt-2">
                          {Number(order.total_amount).toLocaleString()} so'm
                        </span>
                        <span className="text-[10px] text-slate-400">To'lov: {order.payment_method}</span>
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
                          onChange={(e) => handleAssignCourier(order.id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40"
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
                      <td className="p-4 align-top text-right space-y-1">
                        <div className="flex flex-col items-end gap-1">
                          {order.status === 'new' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'confirmed')}
                              className="px-2.5 py-1 rounded-lg bg-blue-500 text-white font-bold text-xs hover:bg-blue-600"
                            >
                              Tasdiqlash
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'preparing')}
                              className="px-2.5 py-1 rounded-lg bg-purple-500 text-white font-bold text-xs hover:bg-purple-600"
                            >
                              Oshxonaga
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'on_way')}
                              className="px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold text-xs hover:bg-orange-600"
                            >
                              Yo'lga chiqarish
                            </button>
                          )}
                          {order.status === 'on_way' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600"
                            >
                              Yetkazildi
                            </button>
                          )}
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                              className="text-[11px] text-rose-500 hover:underline"
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
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
              Restoran Taomlari Ro'yxati
            </h3>
            <button
              onClick={() => setShowProductModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi taom qo'shish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => handleToggleProduct(p)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        p.is_available === 1
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {p.is_available === 1 ? 'Mavjud' : 'Tugagan'}
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
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
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
              Kuryerlar Jamoasi
            </h3>
            <button
              onClick={() => setShowCourierModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi kuryer qo'shish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {couriers.map(c => (
              <div key={c.id} className="p-6 rounded-3xl glass-card space-y-4">
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
                    c.status === 'free' ? 'bg-emerald-100 text-emerald-700' :
                    c.status === 'busy' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Telefon:</span>
                    <a href={`tel:${c.phone}`} className="font-semibold text-brand-500">{c.phone}</a>
                  </div>
                  <div className="flex justify-between">
                    <span>Telegram ID:</span>
                    <span className="font-mono text-slate-400">{c.telegram_id || 'Ulanmagan'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yetkazilgan jami:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{c.total_delivered} ta</span>
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button
                    onClick={() => handleCourierStatusChange(c.id, 'free')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                      c.status === 'free' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    Bo'sh
                  </button>
                  <button
                    onClick={() => handleCourierStatusChange(c.id, 'busy')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                      c.status === 'busy' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    Band
                  </button>
                  <button
                    onClick={() => handleCourierStatusChange(c.id, 'offline')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                      c.status === 'offline' ? 'bg-slate-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
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
          MODAL: ADD NEW PRODUCT
          ------------------------------------------------------------- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-up">
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
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Kategoriya</label>
                  <select
                    value={productForm.category_id}
                    onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Narxi (so'm) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="45000"
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
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
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Rasm URL</label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md hover:bg-brand-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-up">
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
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
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
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Transport turi</label>
                  <select
                    value={courierForm.vehicle_type}
                    onChange={e => setCourierForm({ ...courierForm, vehicle_type: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
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
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourierModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md hover:bg-brand-600"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
