require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./database');
const { seedDatabase } = require('./seed');
const { botService } = require('./bot');
const { smsService } = require('./smsService');

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
app.get('/api/health', async (req, res) => {
  try {
    if (!botService.botInfo && botService.token) {
      try {
        const meRes = await botService.callApi('getMe');
        if (meRes.ok) botService.botInfo = meRes.result;
      } catch (_) {}
    }

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
    const rawQuery = (req.params.query || '').trim();
    if (!rawQuery) {
      return res.status(400).json({ error: "Qidirish uchun buyurtma raqami yoki telefon raqamingizni kiriting" });
    }
    const query = decodeURIComponent(rawQuery).trim();
    const db = getDb();

    let cleanNum = query;
    if (!cleanNum.startsWith('#SD-') && /^\d+$/.test(cleanNum)) {
      cleanNum = `#SD-${cleanNum}`;
    }

    const digitsOnly = query.replace(/[^0-9]/g, '');
    const phoneParam = digitsOnly.length >= 4 ? `%${digitsOnly.slice(-9)}%` : '___NONE___';

    const order = db.get(`
      SELECT o.*, c.name as courier_name, c.phone as courier_phone, c.vehicle_type as courier_vehicle
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      WHERE o.order_number = ? OR o.order_number = ? OR o.customer_phone LIKE ?
      ORDER BY o.id DESC
      LIMIT 1
    `, [query, cleanNum, phoneParam]);

    if (!order) {
      return res.status(404).json({ error: `"${query}" bo'yicha hech qanday buyurtma topilmadi. Raqamni tekshirib qayta urinib ko'ring.` });
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
      telegram_username,
      telegram_id,
      delivery_address,
      latitude,
      longitude,
      items,
      payment_method,
      notes,
      promo_code,
      discount_amount,
      cashback_used
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Savatchangiz bo'sh. Iltimos, buyurtma berish uchun taom qo'shing." });
    }

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ error: "Ismingizni kiritishingiz shart." });
    }

    const phoneDigits = String(customer_phone || '').replace(/[^0-9]/g, '');
    if (!phoneDigits || (phoneDigits.length !== 9 && !(phoneDigits.length === 12 && phoneDigits.startsWith('998')))) {
      return res.status(400).json({ error: "Telefon raqamingiz noto'g'ri formatda. Iltimos, +998 (XX) XXX-XX-XX formatida to'liq kiriting." });
    }

    if (!delivery_address || !delivery_address.trim()) {
      return res.status(400).json({ error: "Yetkazib berish manzilini kiritishingiz shart." });
    }

    const db = getDb();
    const orderNumber = `#SD-${Math.floor(1000 + Math.random() * 9000)}`;

    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const deliveryFee = subtotal >= 150000 ? 0 : 15000;
    const appliedDiscount = Number(discount_amount) || 0;
    const appliedCashback = Number(cashback_used) || 0;
    const totalAmount = Math.max(0, subtotal + deliveryFee - appliedDiscount - appliedCashback);

    const result = db.run(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, telegram_username, telegram_id,
        delivery_address, latitude, longitude, total_amount, delivery_fee, payment_method,
        status, source, notes, promo_code, discount_amount, cashback_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber,
      customer_name,
      customer_phone,
      telegram_username || null,
      telegram_id || null,
      delivery_address,
      latitude || null,
      longitude || null,
      totalAmount,
      deliveryFee,
      payment_method || 'Naqd',
      'new',
      'web',
      notes || '',
      promo_code || null,
      appliedDiscount,
      appliedCashback
    ]);

    const orderId = result.lastInsertRowid;

    if (promo_code) {
      try {
        db.run('UPDATE promocodes SET usage_count = usage_count + 1 WHERE UPPER(code) = UPPER(?)', [promo_code]);
      } catch (_) {}
    }

    if (appliedCashback > 0 && telegram_id) {
      try {
        db.run('UPDATE users SET cashback_balance = MAX(0, cashback_balance - ?) WHERE telegram_id = ?', [appliedCashback, String(telegram_id)]);
      } catch (_) {}
    }

    for (const item of items) {
      let validProdId = null;
      if (item.id) {
        try {
          const pExists = db.get('SELECT id FROM products WHERE id = ?', [item.id]);
          if (pExists) validProdId = pExists.id;
        } catch (_) {}
      }

      db.run(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price, modifiers)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        validProdId,
        item.name,
        Number(item.quantity) || 1,
        Number(item.price),
        Number(item.price) * (Number(item.quantity) || 1),
        item.modifiers ? (typeof item.modifiers === 'string' ? item.modifiers : JSON.stringify(item.modifiers)) : null
      ]);
    }

    // Trigger Telegram notification to Admins
    botService.notifyAdminsNewOrder({
      id: orderId,
      order_number: orderNumber,
      customer_name,
      customer_phone,
      telegram_username: telegram_username || null,
      telegram_id: telegram_id || null,
      delivery_address,
      payment_method: payment_method || 'Naqd',
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

    // If marked delivered, free the courier and credit cashback
    if (status === 'delivered') {
      if (order.courier_id) {
        db.run("UPDATE couriers SET status = 'free', total_delivered = total_delivered + 1 WHERE id = ?", [order.courier_id]);
      }
      const cashbackEarned = Math.round(Number(order.total_amount) * 0.05);
      if (order.telegram_id && cashbackEarned > 0) {
        try {
          db.run('UPDATE users SET cashback_balance = cashback_balance + ? WHERE telegram_id = ?', [cashbackEarned, String(order.telegram_id)]);
          botService.sendMessage(Number(order.telegram_id), `🎉 *Buyurtmangiz yetkazildi!* (${order.order_number})\n\n` +
            `🎁 Sizga *+${cashbackEarned.toLocaleString()} so'm* keshbek hisobingizga kiritildi!\n\n` +
            `⭐️ Iltimos, xizmatimiz va taom sifatini baholang:`, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '⭐️ 1', callback_data: `rate_${order.id}_1` },
                  { text: '⭐️ 2', callback_data: `rate_${order.id}_2` },
                  { text: '⭐️ 3', callback_data: `rate_${order.id}_3` },
                  { text: '⭐️ 4', callback_data: `rate_${order.id}_4` },
                  { text: '⭐️ 5', callback_data: `rate_${order.id}_5` }
                ]
              ]
            }
          }).catch(() => {});
        } catch (_) {}
      }
    }

    // Notify customer about progress via Telegram with live progress bar
    if (order.telegram_id && status !== 'delivered') {
      botService.notifyCustomerStatusProgress(order, status).catch(e => console.error('[Progress notify err]:', e.message));
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
    db.run("UPDATE couriers SET status = 'busy' WHERE id = ?", [courier_id]);

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

// 5.1 Promocodes API
app.get('/api/promocodes', (req, res) => {
  try {
    const db = getDb();
    const promos = db.query('SELECT * FROM promocodes ORDER BY id DESC');
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promocodes/validate', (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ valid: false, message: 'Iltimos, promo-kodni kiriting' });
    }
    const cleanCode = code.trim().toUpperCase();
    const db = getDb();
    const promo = db.get('SELECT * FROM promocodes WHERE UPPER(code) = ? AND is_active = 1', [cleanCode]);
    if (!promo) {
      return res.status(404).json({ valid: false, message: `"${code.trim()}" nomli promo-kod mavjud emas yoki muddati o'tgan` });
    }

    const subtotal = Number(amount) || 0;
    if (subtotal < (promo.min_order_amount || 0)) {
      return res.status(400).json({
        valid: false,
        message: `Ushbu promo-kod eng kamida ${Number(promo.min_order_amount).toLocaleString()} so'mlik buyurtmalar uchun amal qiladi`
      });
    }

    let discount = 0;
    if (promo.discount_percent > 0) {
      discount = Math.round(subtotal * (promo.discount_percent / 100));
    } else if (promo.discount_amount > 0) {
      discount = promo.discount_amount;
    }

    res.json({
      valid: true,
      code: promo.code,
      discount_percent: promo.discount_percent,
      discount_amount: discount,
      message: `Promo-kod qo'llanildi! Chegirma: ${discount.toLocaleString()} so'm`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promocodes', (req, res) => {
  try {
    const { code, discount_percent, discount_amount, min_order_amount } = req.body;
    if (!code) return res.status(400).json({ error: 'Kod majburiy' });
    const db = getDb();
    db.run(`
      INSERT INTO promocodes (code, discount_percent, discount_amount, min_order_amount, is_active, usage_count)
      VALUES (?, ?, ?, ?, 1, 0)
    `, [
      code.trim().toUpperCase(),
      Number(discount_percent) || 0,
      Number(discount_amount) || 0,
      Number(min_order_amount) || 0
    ]);
    res.status(201).json({ success: true, message: 'Promo-kod yaratildi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/promocodes/:id', (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM promocodes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Promo-kod o\'chirildi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5.2 Cashback API
app.get('/api/users/cashback', (req, res) => {
  try {
    const { phone, telegram_id } = req.query;
    const db = getDb();
    let user = null;
    if (telegram_id) {
      user = db.get('SELECT * FROM users WHERE telegram_id = ?', [String(telegram_id)]);
    } else if (phone) {
      const cleanDigits = phone.replace(/[^0-9]/g, '').slice(-9);
      user = db.get('SELECT * FROM users WHERE phone LIKE ?', [`%${cleanDigits}%`]);
    }
    res.json({ cashback_balance: user ? (user.cashback_balance || 0) : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5.3 Reviews & Rating API
app.get('/api/reviews', (req, res) => {
  try {
    const db = getDb();
    const reviews = db.query(`
      SELECT r.*, c.name as courier_name, o.order_number
      FROM reviews r
      LEFT JOIN couriers c ON r.courier_id = c.id
      LEFT JOIN orders o ON r.order_id = o.id
      ORDER BY r.id DESC
      LIMIT 50
    `);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const { order_id, rating, comment, customer_name } = req.body;
    if (!order_id || !rating) return res.status(400).json({ error: 'Buyurtma va baho majburiy' });
    const db = getDb();
    const order = db.get('SELECT * FROM orders WHERE id = ?', [order_id]);
    const courierId = order ? order.courier_id : null;
    
    db.run(`
      INSERT INTO reviews (order_id, courier_id, customer_name, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `, [
      order_id,
      courierId,
      customer_name || (order ? order.customer_name : 'Mijoz'),
      Number(rating),
      comment || ''
    ]);

    db.run('UPDATE orders SET rating = ?, review_comment = ? WHERE id = ?', [Number(rating), comment || '', order_id]);

    if (courierId) {
      const stats = db.get('SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE courier_id = ?', [courierId]);
      if (stats && stats.cnt > 0) {
        db.run('UPDATE couriers SET rating = ?, rating_count = ? WHERE id = ?', [
          Math.round(stats.avg_rating * 10) / 10,
          stats.cnt,
          courierId
        ]);
      }
    }

    res.status(201).json({ success: true, message: 'Fikr-mulohazangiz qabul qilindi, katta rahmat!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In-memory verified OTP cache (resilient across serverless instances)
const verifiedOtps = new Set();
const verifiedPhones = new Set();

// 5.4 SMS & Telegram 6-Digit OTP Verification API
const sendOtpHandler = async (req, res) => {
  try {
    const { phone, telegram_username, telegram_id } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Telefon raqam kiritilishi shart' });
    }

    const cleanDigits = String(phone).replace(/[^0-9]/g, '');
    if (!cleanDigits || (cleanDigits.length !== 9 && !(cleanDigits.length === 12 && cleanDigits.startsWith('998')))) {
      return res.status(400).json({ error: "Telefon raqamingiz noto'g'ri formatda. Iltimos, +998 (XX) XXX-XX-XX formatida to'liq kiriting." });
    }

    const normPhone = smsService.normalizePhone(phone);
    const phoneSuffix = smsService.getPhoneSuffix(phone);
    const db = getDb();

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Try finding target telegram_id
    let targetChatId = telegram_id || null;

    if (!targetChatId) {
      const user = db.get('SELECT telegram_id FROM users WHERE phone LIKE ? AND telegram_id IS NOT NULL', [`%${phoneSuffix}%`]);
      if (user && user.telegram_id) {
        targetChatId = user.telegram_id;
      }
    }

    if (!targetChatId && telegram_username) {
      const cleanUsername = telegram_username.replace('@', '').toLowerCase();
      const user = db.get('SELECT telegram_id FROM users WHERE LOWER(full_name) LIKE ? OR telegram_id = ?', [`%${cleanUsername}%`, cleanUsername]);
      if (user && user.telegram_id) targetChatId = user.telegram_id;
    }

    // Direct fallback: If no telegram_id mapped yet, send directly to ADMIN_TELEGRAM_ID (1340769865)
    // so testing in @Smart_delivery_fast_bot receives the OTP immediately with zero setup!
    const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_ID || '1340769865';
    if (!targetChatId && ADMIN_CHAT_ID) {
      targetChatId = ADMIN_CHAT_ID;
    }

    // Save in otp_codes table
    try {
      db.run(`
        INSERT INTO otp_codes (phone, code, telegram_id, expires_at, is_verified)
        VALUES (?, ?, ?, ?, 0)
      `, [normPhone, code, targetChatId ? String(targetChatId) : null, expiresAt]);
    } catch (_) {}

    const botUsername = botService.botInfo?.username || 'Smart_delivery_fast_bot';
    // Clean, direct bot link passing both the code and phoneSuffix
    const botLink = `https://t.me/${botUsername}?start=v_${code}_${phoneSuffix}`;

    // Sync OTP to Render backend in background so bot knows it immediately
    try {
      fetch('https://smart-delivery-system-sy6e.onrender.com/api/auth/sync-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normPhone,
          code,
          expires_at: expiresAt,
          telegram_id: targetChatId
        })
      }).catch(() => {});
    } catch (_) {}

    // Dispatch via Eskiz real SMS and/or Telegram Bot
    const dispatchResult = await smsService.dispatchOtp({
      phone: normPhone,
      code,
      telegramId: targetChatId,
      botService
    });

    const sentVia = dispatchResult.sentVia;
    let message = `6 xonali tasdiqlash kodi Telegram botingizga (@${botUsername}) yuborildi! 📲`;
    if (sentVia.includes('sms')) {
      message = '6 xonali tasdiqlash kodi telefoningizga SMS orqali yuborildi!';
    }

    return res.json({
      ok: true,
      sent: true,
      channels: sentVia,
      bot_username: botUsername,
      bot_link: botLink,
      message
    });
  } catch (err) {
    console.error('[send-otp Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/auth/send-telegram-otp', sendOtpHandler);
app.post('/api/auth/send-otp', sendOtpHandler);

// Endpoint called by Telegram webhook when user clicks bot Start link
app.post('/api/auth/bot-verified', (req, res) => {
  try {
    const { code, phone, telegram_id } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const cleanCode = String(code).trim();
    const phoneSuffix = phone ? smsService.getPhoneSuffix(phone) : null;
    const db = getDb();

    verifiedOtps.add(cleanCode);
    if (phoneSuffix) verifiedPhones.add(phoneSuffix);

    try {
      db.run('UPDATE otp_codes SET is_verified = 1 WHERE code = ?', [cleanCode]);
      if (phoneSuffix) {
        db.run('UPDATE otp_codes SET is_verified = 1 WHERE phone LIKE ?', [`%${phoneSuffix}%`]);
      }
      if (telegram_id && phone) {
        const normPhone = smsService.normalizePhone(phone);
        db.run('UPDATE users SET phone = ? WHERE telegram_id = ?', [normPhone, String(telegram_id)]);
      }
    } catch (_) {}

    return res.json({ ok: true, verified: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Sync OTP between server instances (e.g. Vercel <-> Render)
app.post('/api/auth/sync-otp', (req, res) => {
  try {
    const { phone, code, expires_at, telegram_id } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const cleanCode = String(code).trim();
    const phoneSuffix = phone ? smsService.getPhoneSuffix(phone) : null;
    const db = getDb();

    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS otp_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone TEXT NOT NULL,
          code TEXT NOT NULL,
          telegram_id TEXT,
          expires_at INTEGER NOT NULL,
          is_verified INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      db.run(`
        INSERT INTO otp_codes (phone, code, telegram_id, expires_at, is_verified)
        VALUES (?, ?, ?, ?, 0)
      `, [phone || '+998', cleanCode, telegram_id ? String(telegram_id) : null, expires_at || (Date.now() + 300000)]);
    } catch (_) {}

    return res.json({ ok: true, synced: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const verifyOtpHandler = (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: 'Telefon raqam va 6 xonali tasdiqlash kodi kiritilishi shart' });
    }

    const cleanCode = String(code).trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({ ok: false, error: "Tasdiqlash kodi aynan 6 ta raqamdan iborat bo'lishi kerak" });
    }

    const normPhone = smsService.normalizePhone(phone);
    const db = getDb();

    // Check fast cache first
    if (cleanCode && verifiedOtps.has(cleanCode)) {
      if (phoneSuffix) verifiedPhones.add(phoneSuffix);
      return res.json({
        ok: true,
        verified: true,
        message: 'Telefon raqamingiz muvaffaqiyatli tasdiqlandi! ✅'
      });
    }

    const record = db.get(`
      SELECT * FROM otp_codes
      WHERE (phone LIKE ? OR phone LIKE ?) AND code = ?
      ORDER BY id DESC LIMIT 1
    `, [`%${phoneSuffix}%`, `%${normPhone}%`, cleanCode]);

    if (!record) {
      return res.status(400).json({ ok: false, error: "Kiritilgan 6 xonali kod noto'g'ri yoki muddati o'tgan" });
    }

    if (Date.now() > record.expires_at) {
      return res.status(400).json({ ok: false, error: 'Ushbu kodning 5 daqiqalik amal qilish muddati o\'tgan. Yangi kod so\'rang.' });
    }

    // Mark as verified in DB and cache
    try {
      db.run('UPDATE otp_codes SET is_verified = 1 WHERE id = ?', [record.id]);
      if (record.telegram_id) {
        db.run('UPDATE users SET phone = ? WHERE telegram_id = ?', [normPhone, record.telegram_id]);
      }
    } catch (_) {}

    verifiedOtps.add(cleanCode);
    if (phoneSuffix) verifiedPhones.add(phoneSuffix);

    res.json({
      ok: true,
      verified: true,
      message: 'Telefon raqamingiz muvaffaqiyatli tasdiqlandi! ✅'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/auth/verify-telegram-otp', verifyOtpHandler);
app.post('/api/auth/verify-otp', verifyOtpHandler);

// Polling endpoint to check if phone became verified (e.g. user clicked Telegram Start link)
app.get('/api/auth/check-otp-status', (req, res) => {
  try {
    const { phone, code } = req.query;
    if (!phone && !code) return res.json({ verified: false });

    const phoneSuffix = phone ? smsService.getPhoneSuffix(phone) : null;
    const cleanCode = code ? String(code).trim() : null;

    if (cleanCode && verifiedOtps.has(cleanCode)) {
      return res.json({ ok: true, verified: true });
    }
    if (phoneSuffix && verifiedPhones.has(phoneSuffix)) {
      return res.json({ ok: true, verified: true });
    }

    const db = getDb();
    let sql = 'SELECT * FROM otp_codes WHERE ';
    let params = [];
    if (cleanCode) {
      sql += 'code = ? AND is_verified = 1';
      params.push(cleanCode);
    } else if (phoneSuffix) {
      sql += 'phone LIKE ? AND is_verified = 1';
      params.push(`%${phoneSuffix}%`);
    } else {
      return res.json({ ok: true, verified: false });
    }

    sql += ' ORDER BY id DESC LIMIT 1';

    const record = db.get(sql, params);
    if (record && record.is_verified === 1) {
      if (cleanCode) verifiedOtps.add(cleanCode);
      if (phoneSuffix) verifiedPhones.add(phoneSuffix);
      return res.json({ ok: true, verified: true });
    }
    return res.json({ ok: true, verified: false });
  } catch (err) {
    res.json({ ok: false, verified: false });
  }
});

// 6. Admin Stats & Analytics
app.get('/api/stats', (req, res) => {
  try {
    const db = getDb();

    const totalOrders = db.get('SELECT COUNT(*) as cnt FROM orders').cnt;
    const activeOrders = db.get("SELECT COUNT(*) as cnt FROM orders WHERE status NOT IN ('delivered', 'cancelled')").cnt;
    const deliveredOrders = db.get("SELECT COUNT(*) as cnt FROM orders WHERE status = 'delivered'").cnt;
    const cancelledOrders = db.get("SELECT COUNT(*) as cnt FROM orders WHERE status = 'cancelled'").cnt;

    const totalRevenue = db.get("SELECT SUM(total_amount) as total FROM orders WHERE status = 'delivered'").total || 0;
    const avgOrderValue = deliveredOrders > 0 ? Math.round(totalRevenue / deliveredOrders) : 0;

    const webOrders = db.get("SELECT COUNT(*) as cnt FROM orders WHERE source = 'web'").cnt;
    const botOrders = db.get("SELECT COUNT(*) as cnt FROM orders WHERE source = 'telegram_bot'").cnt;

    const freeCouriers = db.get("SELECT COUNT(*) as cnt FROM couriers WHERE status = 'free'").cnt;
    const busyCouriers = db.get("SELECT COUNT(*) as cnt FROM couriers WHERE status = 'busy'").cnt;
    const totalCouriers = db.get('SELECT COUNT(*) as cnt FROM couriers').cnt;
    const totalPromos = db.get('SELECT COUNT(*) as cnt FROM promocodes').cnt;
    const avgRatingStat = db.get('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews');
    const avgRating = avgRatingStat && avgRatingStat.cnt > 0 ? Math.round(avgRatingStat.avg * 10) / 10 : 5.0;

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
        avgOrderValue,
        totalPromos,
        avgRating
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

// Keep-Alive Self-Ping: Prevents Render free tier from sleeping after 15 minutes
const keepAliveTargetUrl = EXTERNAL_URL || 'https://smart-delivery-system-sy6e.onrender.com';
const KEEP_ALIVE_INTERVAL_MS = 9 * 60 * 1000; // Ping every 9 minutes

function startKeepAlivePing() {
  console.log(`[KeepAlive] Scheduled self-ping to ${keepAliveTargetUrl}/api/health every 9 minutes`);
  setInterval(async () => {
    try {
      const pingUrl = `${keepAliveTargetUrl}/api/health`;
      const pingRes = await fetch(pingUrl, {
        headers: { 'User-Agent': 'SmartDeliveryKeepAlive/1.0' }
      });
      if (pingRes.ok) {
        console.log(`[KeepAlive] ✅ Ping successful at ${new Date().toISOString()} (HTTP ${pingRes.status})`);
      } else {
        console.warn(`[KeepAlive] ⚠️ Ping returned status ${pingRes.status}`);
      }
    } catch (err) {
      console.warn(`[KeepAlive] Ping error: ${err.message}`);
    }
  }, KEEP_ALIVE_INTERVAL_MS);
}

// Start Server and Telegram Bot
app.listen(PORT, async () => {
  console.log(`[SERVER] Smart Delivery backend running on port ${PORT}`);
  await botService.init(EXTERNAL_URL);
  startKeepAlivePing();
});

module.exports = app;
