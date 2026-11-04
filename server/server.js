require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./database');
const { seedDatabase } = require('./seed');
const { botService } = require('./bot');

const app = express();
const PORT = process.env.PORT || 4000;
const EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || null;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Auto seed database if empty
try {
  seedDatabase(false);
} catch (e) {
  console.error('[DB Seed Warning]:', e.message);
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Health Check
app.get('/api/health', (req, res) => {
  try {
    const db = getDb();
    const tablesCount = db.get("SELECT COUNT(*) as cnt FROM sqlite_master WHERE type='table'").cnt;
    const productsCount = db.get("SELECT COUNT(*) as cnt FROM products").cnt;
    const ordersCount = db.get("SELECT COUNT(*) as cnt FROM orders").cnt;

    res.json({
      status: 'ok',
      service: 'Smart Delivery API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        engine: 'SQLite (node:sqlite)',
        tables: tablesCount,
        products: productsCount,
        orders: ordersCount
      },
      bot: {
        active: !!botService.botInfo,
        username: botService.botInfo ? botService.botInfo.username : null,
        mode: EXTERNAL_URL ? 'webhook' : 'polling'
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Telegram Webhook Endpoint
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    await botService.handleUpdate(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('[Webhook Error]:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 2. Categories
app.get('/api/categories', (req, res) => {
  try {
    const db = getDb();
    const categories = db.query('SELECT * FROM categories ORDER BY sort_order ASC, id ASC');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const { name, icon, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Kategoriya nomi kiritilishi shart' });

    const db = getDb();
    const result = db.run(
      'INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)',
      [name, icon || '🍽', sort_order || 0]
    );
    res.status(201).json({ id: result.lastInsertRowid, name, icon, sort_order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Products CRUD
app.get('/api/products', (req, res) => {
  try {
    const db = getDb();
    const { category_id, search, available_only } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name, c.icon as category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id && category_id !== 'all') {
      sql += ' AND p.category_id = ?';
      params.push(Number(category_id));
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (available_only === 'true') {
      sql += ' AND p.is_available = 1';
    }

    sql += ' ORDER BY p.id DESC';

    const products = db.query(sql, params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { category_id, name, description, price, image_url, prep_time_min, is_available } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Nomi va narxi kiritilishi shart' });

    const db = getDb();
    const result = db.run(`
      INSERT INTO products (category_id, name, description, price, image_url, prep_time_min, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      category_id || null,
      name,
      description || '',
      Number(price),
      image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      Number(prep_time_min) || 15,
      is_available !== undefined ? (is_available ? 1 : 0) : 1
    ]);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Mahsulot qo\'shildi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, image_url, prep_time_min, is_available } = req.body;

    const db = getDb();
    db.run(`
      UPDATE products SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        image_url = COALESCE(?, image_url),
        prep_time_min = COALESCE(?, prep_time_min),
        is_available = COALESCE(?, is_available)
      WHERE id = ?
    `, [
      category_id !== undefined ? category_id : null,
      name,
      description,
      price !== undefined ? Number(price) : null,
      image_url,
      prep_time_min !== undefined ? Number(prep_time_min) : null,
      is_available !== undefined ? (is_available ? 1 : 0) : null,
      id
    ]);

    res.json({ message: 'Mahsulot yangilandi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Mahsulot o\'chirildi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Orders
app.get('/api/orders', (req, res) => {
  try {
    const db = getDb();
    const { status, limit } = req.query;

    let sql = `
      SELECT o.*, c.name as courier_name, c.phone as courier_phone, c.vehicle_type as courier_vehicle
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.id DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }

    const orders = db.query(sql, params);

    // Attach order items
    const fullOrders = orders.map(order => {
      const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      return { ...order, items };
    });

    res.json(fullOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live Track Order by order_number (e.g. #SD-1001 or SD-1001 or 1001) or phone number
app.get('/api/orders/track/:query', (req, res) => {
  try {
    const query = decodeURIComponent(req.params.query).trim();
    const db = getDb();

    let cleanNum = query;
    if (!cleanNum.startsWith('#SD-') && /^\d+$/.test(cleanNum)) {
      cleanNum = `#SD-${cleanNum}`;
    }

    const order = db.get(`
      SELECT o.*, c.name as courier_name, c.phone as courier_phone, c.vehicle_type as courier_vehicle
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      WHERE o.order_number = ? OR o.order_number = ? OR o.customer_phone LIKE ?
      ORDER BY o.id DESC
      LIMIT 1
    `, [query, cleanNum, `%${query.replace(/[^0-9]/g, '')}%`]);

    if (!order) {
      return res.status(404).json({ error: 'Buyurtma topilmadi' });
    }

    const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Order (from Web client)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      delivery_address,
      latitude,
      longitude,
      items,
      payment_method,
      notes
    } = req.body;

    if (!customer_name || !customer_phone || !delivery_address || !items || items.length === 0) {
      return res.status(400).json({ error: 'Iltimos, barcha majburiy maydonlarni to\'ldiring va savatga taom qo\'shing' });
    }

    const db = getDb();
    const orderNumber = `#SD-${Math.floor(1000 + Math.random() * 9000)}`;

    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const deliveryFee = subtotal >= 150000 ? 0 : 15000;
    const totalAmount = subtotal + deliveryFee;

    const result = db.run(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, delivery_address,
        latitude, longitude, total_amount, delivery_fee, payment_method,
        status, source, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber,
      customer_name,
      customer_phone,
      delivery_address,
      latitude || null,
      longitude || null,
      totalAmount,
      deliveryFee,
      payment_method || 'Naqd',
      'new',
      'web',
      notes || ''
    ]);

    const orderId = result.lastInsertRowid;

    for (const item of items) {
      db.run(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.id || null,
        item.name,
        Number(item.quantity) || 1,
        Number(item.price),
        Number(item.price) * (Number(item.quantity) || 1)
      ]);
    }

    // Trigger Telegram notification to Admins
    botService.notifyAdminsNewOrder({
      id: orderId,
      order_number: orderNumber,
      customer_name,
      customer_phone,
      total_amount: totalAmount,
      source: 'web'
    }).catch(e => console.error('[Order Bot Notify Error]:', e.message));

    res.status(201).json({
      success: true,
      order_id: orderId,
      order_number: orderNumber,
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      status: 'new',
      message: 'Buyurtmangiz muvaffaqiyatli qabul qilindi!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['new', 'confirmed', 'preparing', 'on_way', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Yaroqsiz status' });
    }

    const db = getDb();
    const order = db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });

    db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

    // If marked delivered, free the courier if assigned
    if (status === 'delivered' && order.courier_id) {
      db.run('UPDATE couriers SET status = "free", total_delivered = total_delivered + 1 WHERE id = ?', [order.courier_id]);
    }

    res.json({ success: true, message: `Buyurtma statusi "${status}" ga o'zgartirildi` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign Courier to Order
app.patch('/api/orders/:id/assign-courier', async (req, res) => {
  try {
    const { id } = req.params;
    const { courier_id } = req.body;

    const db = getDb();
    const order = db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });

    if (!courier_id) {
      // Unassign courier
      db.run('UPDATE orders SET courier_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Kuryer ajratildi' });
    }

    const courier = db.get('SELECT * FROM couriers WHERE id = ?', [courier_id]);
    if (!courier) return res.status(404).json({ error: 'Kuryer topilmadi' });

    // Update order with courier and change status to 'on_way' if currently 'new' or 'confirmed'
    const newStatus = (order.status === 'new' || order.status === 'confirmed') ? 'preparing' : order.status;
    db.run(`
      UPDATE orders SET
        courier_id = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [courier_id, newStatus, id]);

    // Set courier status to busy
    db.run('UPDATE couriers SET status = "busy" WHERE id = ?', [courier_id]);

    // Notify Courier via Telegram Bot
    botService.notifyCourierAssigned(courier_id, { ...order, courier_name: courier.name }).catch(e => {
      console.error('[Courier Notify Error]:', e.message);
    });

    res.json({
      success: true,
      message: `Kuryer "${courier.name}" buyurtmaga biriktirildi`,
      courier: courier
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Couriers
app.get('/api/couriers', (req, res) => {
  try {
    const db = getDb();
    const { status } = req.query;

    let sql = 'SELECT * FROM couriers WHERE 1=1';
    const params = [];
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY id ASC';

    const couriers = db.query(sql, params);
    res.json(couriers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/couriers', (req, res) => {
  try {
    const { name, phone, telegram_id, vehicle_type, status } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Ism va telefon kiritilishi shart' });

    const db = getDb();
    const result = db.run(`
      INSERT INTO couriers (name, phone, telegram_id, vehicle_type, status)
      VALUES (?, ?, ?, ?, ?)
    `, [
      name,
      phone,
      telegram_id || null,
      vehicle_type || 'Skuter',
      status || 'free'
    ]);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Kuryer qo\'shildi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/couriers/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = getDb();

    db.run('UPDATE couriers SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Kuryer holati yangilandi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Admin Stats & Analytics
app.get('/api/stats', (req, res) => {
  try {
    const db = getDb();

    const totalOrders = db.get('SELECT COUNT(*) as cnt FROM orders').cnt;
    const activeOrders = db.get('SELECT COUNT(*) as cnt FROM orders WHERE status NOT IN ("delivered", "cancelled")').cnt;
    const deliveredOrders = db.get('SELECT COUNT(*) as cnt FROM orders WHERE status = "delivered"').cnt;
    const cancelledOrders = db.get('SELECT COUNT(*) as cnt FROM orders WHERE status = "cancelled"').cnt;

    const totalRevenue = db.get('SELECT SUM(total_amount) as total FROM orders WHERE status = "delivered"').total || 0;
    const avgOrderValue = deliveredOrders > 0 ? Math.round(totalRevenue / deliveredOrders) : 0;

    const webOrders = db.get('SELECT COUNT(*) as cnt FROM orders WHERE source = "web"').cnt;
    const botOrders = db.get('SELECT COUNT(*) as cnt FROM orders WHERE source = "telegram_bot"').cnt;

    const freeCouriers = db.get('SELECT COUNT(*) as cnt FROM couriers WHERE status = "free"').cnt;
    const busyCouriers = db.get('SELECT COUNT(*) as cnt FROM couriers WHERE status = "busy"').cnt;
    const totalCouriers = db.get('SELECT COUNT(*) as cnt FROM couriers').cnt;

    // Recent orders
    const recentOrders = db.query(`
      SELECT o.*, c.name as courier_name
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      ORDER BY o.id DESC
      LIMIT 5
    `);

    res.json({
      overview: {
        totalOrders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        avgOrderValue
      },
      sources: {
        web: webOrders,
        bot: botOrders
      },
      couriers: {
        total: totalCouriers,
        free: freeCouriers,
        busy: busyCouriers
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build if exists (for unified server)
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      res.json({ message: 'Smart Delivery API Server ishlamoqda. Frontend hali build qilinmagan.' });
    }
  });
});

// Start Server and Telegram Bot
app.listen(PORT, async () => {
  console.log(`[SERVER] Smart Delivery backend running on port ${PORT}`);
  await botService.init(EXTERNAL_URL);
});

module.exports = app;
