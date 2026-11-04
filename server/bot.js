const { getDb } = require('./database');

class TelegramBotService {
  constructor() {
    this.token = process.env.BOT_TOKEN || '';
    this.botInfo = null;
    this.isRunning = false;
    this.pollOffset = 0;
    this.userSessions = new Map(); // chat_id => session data (cart, order flow, etc)
    this.adminChatIds = new Set();
  }

  getApiUrl(method) {
    return `https://api.telegram.org/bot${this.token}/${method}`;
  }

  async callApi(method, body = {}) {
    if (!this.token || this.token === "BU_YERGA_BOT_TOKENNI_QO'YING") {
      return { ok: false, description: 'BOT_TOKEN sozlanmagan' };
    }

    try {
      const response = await fetch(this.getApiUrl(method), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`[Bot API Error] ${method}:`, err.message);
      return { ok: false, description: err.message };
    }
  }

  async init(externalUrl = null) {
    if (!this.token || this.token === "BU_YERGA_BOT_TOKENNI_QO'YING") {
      console.log('[BOT] BOT_TOKEN berilmagan yoki placeholder. Bot demo rejimida.');
      return { ok: false, message: 'BOT_TOKEN not provided' };
    }

    try {
      const res = await this.callApi('getMe');
      if (res.ok) {
        this.botInfo = res.result;
        console.log(`[BOT] Muvaffaqiyatli ulandi: @${this.botInfo.username} (${this.botInfo.first_name})`);

        if (externalUrl && (externalUrl.startsWith('https://') || externalUrl.startsWith('http://'))) {
          // Webhook setup
          const webhookUrl = `${externalUrl}/api/telegram-webhook`;
          console.log(`[BOT] Webhook o'rnatilmoqda: ${webhookUrl}`);
          await this.callApi('setWebhook', { url: webhookUrl });
        } else {
          // Long polling
          await this.callApi('deleteWebhook');
          this.startPolling();
        }

        return { ok: true, botInfo: this.botInfo };
      } else {
        console.warn('[BOT] getMe xatosi:', res.description);
        return { ok: false, error: res.description };
      }
    } catch (err) {
      console.error('[BOT] Initsializatsiya xatosi:', err.message);
      return { ok: false, error: err.message };
    }
  }

  startPolling() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[BOT] Long-polling boshlandi...');

    const pollLoop = async () => {
      while (this.isRunning) {
        try {
          const res = await this.callApi('getUpdates', {
            offset: this.pollOffset,
            timeout: 25,
            allowed_updates: ['message', 'callback_query']
          });

          if (res.ok && Array.isArray(res.result)) {
            for (const update of res.result) {
              this.pollOffset = update.update_id + 1;
              await this.handleUpdate(update).catch(e => console.error('[BOT Update Error]:', e));
            }
          }
        } catch (err) {
          console.error('[BOT Polling Error]:', err.message);
          await new Promise(r => setTimeout(r, 4000));
        }
      }
    };

    pollLoop();
  }

  stop() {
    this.isRunning = false;
  }

  // Update Router (for Webhook or Long-Polling)
  async handleUpdate(update) {
    if (update.message) {
      await this.handleMessage(update.message);
    } else if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
    }
  }

  // Session Helper
  getSession(chatId) {
    if (!this.userSessions.has(chatId)) {
      this.userSessions.set(chatId, {
        cart: [], // [{ id, name, price, qty }]
        step: null,
        orderData: {}
      });
    }
    return this.userSessions.get(chatId);
  }

  // Message Handler
  async handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.trim() : '';
    const db = getDb();
    const session = this.getSession(chatId);
    const webAppUrl = process.env.FRONTEND_URL || 'https://smart-delivery-system.vercel.app';

    // Save or update user in DB
    const userRole = (text === '/admin_bot' || this.adminChatIds.has(chatId)) ? 'admin' : 'client';
    try {
      const existingUser = db.get('SELECT id, role FROM users WHERE telegram_id = ?', [String(chatId)]);
      if (!existingUser) {
        db.run('INSERT INTO users (telegram_id, full_name, role) VALUES (?, ?, ?)', [
          String(chatId),
          [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi',
          userRole
        ]);
      }
    } catch (e) {
      // ignore unique constraint
    }

    // Contact sharing for Courier or Client Order
    if (msg.contact) {
      const phone = msg.contact.phone_number.startsWith('+') ? msg.contact.phone_number : `+${msg.contact.phone_number}`;
      if (session.step === 'courier_phone') {
        // Link courier by phone or add new
        const courier = db.get('SELECT id, name FROM couriers WHERE phone LIKE ?', [`%${phone.slice(-9)}%`]);
        if (courier) {
          db.run('UPDATE couriers SET telegram_id = ? WHERE id = ?', [String(chatId), courier.id]);
          await this.sendMessage(chatId, `🎉 *Tabriklaymiz, ${courier.name}!* Siz tizimga kuryer sifatida muvaffaqiyatli bog'landingiz.\n\nEndi sizga yangi buyurtmalar avtomatik ravishda yuboriladi!`, {
            reply_markup: {
              keyboard: [
                [{ text: '📋 Biriktirilgan buyurtmalarim' }, { text: '🟢 Holatim: Bo\'sh (Free)' }],
                [{ text: '🏠 Asosiy menyu' }]
              ],
              resize_keyboard: true
            }
          });
        } else {
          // Create new courier
          db.run('INSERT INTO couriers (name, phone, telegram_id, vehicle_type, status) VALUES (?, ?, ?, ?, ?)', [
            [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || 'Yangi Kuryer',
            phone,
            String(chatId),
            'Skuter',
            'free'
          ]);
          await this.sendMessage(chatId, `✅ *Siz yangi kuryer sifatida ro'yxatdan o'tdingiz!* Sizga yangi buyurtmalar kelganda shu yerda bildirishnoma olasiz.`);
        }
        session.step = null;
        return;
      }

      if (session.step === 'order_phone') {
        session.orderData.phone = phone;
        session.step = 'order_address';
        await this.sendMessage(chatId, `📍 Endi yetkazib berish manzilini yozib yuboring (yoki lokatsiya tugmasi orqali joylashuvingizni ulashing):`, {
          reply_markup: {
            keyboard: [
              [{ text: '📍 Joylashuvni yuborish', request_location: true }],
              [{ text: '❌ Bekor qilish' }]
            ],
            resize_keyboard: true
          }
        });
        return;
      }
    }

    // Location sharing for Order
    if (msg.location && session.step === 'order_address') {
      session.orderData.latitude = msg.location.latitude;
      session.orderData.longitude = msg.location.longitude;
      session.orderData.address = `Geo-lokatsiya: ${msg.location.latitude.toFixed(5)}, ${msg.location.longitude.toFixed(5)}`;
      await this.finalizeBotOrder(chatId, session);
      return;
    }

    // Commands & Text Handlers
    if (text === '/start' || text === '🏠 Asosiy menyu') {
      session.step = null;
      await this.sendWelcomeMessage(chatId, msg.from.first_name, webAppUrl);
      return;
    }

    if (text === '🍔 Menyu va Buyurtma berish' || text === '/menu') {
      await this.sendCategoryList(chatId);
      return;
    }

    if (text === '🛒 Savatcha' || text === '/cart') {
      await this.sendCartSummary(chatId, session);
      return;
    }

    if (text === '📦 Buyurtmam holati' || text === '/track') {
      await this.sendUserActiveOrders(chatId);
      return;
    }

    if (text === '📞 Bog\'lanish' || text === '/contact') {
      await this.sendMessage(chatId, `📞 *Smart Delivery — Yordam markazi:*\n\n☎️ Telefon: +998 71 200-00-00\n⏰ Ish vaqti: 24/7 uzluksiz\n💬 Telegram Support: @SmartDeliverySupportBot\n🌐 Web: ${webAppUrl}`, {
        parse_mode: 'Markdown'
      });
      return;
    }

    if (text === '/courier' || text === '🛵 Kuryer rejimi') {
      await this.handleCourierCommand(chatId);
      return;
    }

    if (text === '📋 Biriktirilgan buyurtmalarim') {
      await this.sendCourierActiveOrders(chatId);
      return;
    }

    if (text.startsWith('🟢 Holatim:')) {
      db.run('UPDATE couriers SET status = "free" WHERE telegram_id = ?', [String(chatId)]);
      await this.sendMessage(chatId, '✅ Holatingiz: *Bo\'sh (Buyurtma qabul qilishga tayyor)* deb yangilandi.');
      return;
    }

    if (text === '/admin_bot' || text === '👑 Admin panel') {
      this.adminChatIds.add(chatId);
      await this.sendAdminOverview(chatId);
      return;
    }

    if (text === '❌ Bekor qilish') {
      session.step = null;
      session.orderData = {};
      await this.sendMessage(chatId, '❌ Buyurtma bekor qilindi.', {
        reply_markup: {
          keyboard: this.getMainKeyboard(webAppUrl),
          resize_keyboard: true
        }
      });
      return;
    }

    // Step-by-step checkout text input
    if (session.step === 'order_name') {
      session.orderData.name = text;
      session.step = 'order_phone';
      await this.sendMessage(chatId, `📱 Rahmat, endi telefon raqamingizni yuboring:`, {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Telefon raqamni yuborish', request_contact: true }],
            [{ text: '❌ Bekor qilish' }]
          ],
          resize_keyboard: true
        }
      });
      return;
    }

    if (session.step === 'order_phone') {
      session.orderData.phone = text;
      session.step = 'order_address';
      await this.sendMessage(chatId, `📍 Manzilingizni to'liq yozing (Masalan: Chilonzor 9, 14-uy, 28-x):`, {
        reply_markup: {
          keyboard: [
            [{ text: '📍 Joylashuvni yuborish', request_location: true }],
            [{ text: '❌ Bekor qilish' }]
          ],
          resize_keyboard: true
        }
      });
      return;
    }

    if (session.step === 'order_address') {
      session.orderData.address = text;
      await this.finalizeBotOrder(chatId, session);
      return;
    }

    // Default response
    await this.sendMessage(chatId, `Kechirasiz, buyruq tushunarsiz bo'ldi. Quyidagi menyudan foydalaning:`, {
      reply_markup: {
        keyboard: this.getMainKeyboard(webAppUrl),
        resize_keyboard: true
      }
    });
  }

  // Callback Query Handler (Inline buttons)
  async handleCallbackQuery(cb) {
    const chatId = cb.message.chat.id;
    const messageId = cb.message.message_id;
    const data = cb.data;
    const db = getDb();
    const session = this.getSession(chatId);

    // Answer callback
    await this.callApi('answerCallbackQuery', { callback_query_id: cb.id });

    if (data.startsWith('cat_')) {
      const catId = Number(data.split('_')[1]);
      await this.sendProductsByCategory(chatId, catId);
      return;
    }

    if (data.startsWith('add_')) {
      const prodId = Number(data.split('_')[1]);
      const product = db.get('SELECT id, name, price FROM products WHERE id = ?', [prodId]);
      if (product) {
        const item = session.cart.find(i => i.id === product.id);
        if (item) {
          item.qty += 1;
        } else {
          session.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
        }
        await this.sendMessage(chatId, `✅ *${product.name}* savatchaga qo'shildi! (Jami savatda: ${session.cart.reduce((a, b) => a + b.qty, 0)} dona)`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛒 Savatchaga o\'tish', callback_data: 'view_cart' }],
              [{ text: '➕ Yana taom tanlash', callback_data: 'back_to_cats' }]
            ]
          }
        });
      }
      return;
    }

    if (data === 'view_cart') {
      await this.sendCartSummary(chatId, session);
      return;
    }

    if (data === 'back_to_cats') {
      await this.sendCategoryList(chatId);
      return;
    }

    if (data === 'clear_cart') {
      session.cart = [];
      await this.sendMessage(chatId, '🗑 Savatcha tozalandi.');
      return;
    }

    if (data === 'checkout') {
      if (!session.cart || session.cart.length === 0) {
        await this.sendMessage(chatId, 'Savatchangiz bo\'sh!');
        return;
      }
      session.step = 'order_name';
      session.orderData = {};
      await this.sendMessage(chatId, `📝 Buyurtmani rasmiylashtirish:\n\nIltimos, ismingizni yozib yuboring:`, {
        reply_markup: {
          keyboard: [[{ text: '❌ Bekor qilish' }]],
          resize_keyboard: true
        }
      });
      return;
    }

    // Courier action: Accept / Deliver
    if (data.startsWith('courier_accept_')) {
      const orderId = Number(data.split('_')[2]);
      const courier = db.get('SELECT id, name FROM couriers WHERE telegram_id = ?', [String(chatId)]);
      if (!courier) {
        await this.sendMessage(chatId, '❌ Siz kuryer sifatida ro\'yxatdan o\'tmagansiz.');
        return;
      }
      db.run('UPDATE orders SET status = "on_way", courier_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [courier.id, orderId]);
      db.run('UPDATE couriers SET status = "busy" WHERE id = ?', [courier.id]);

      const order = db.get('SELECT order_number, customer_phone FROM orders WHERE id = ?', [orderId]);
      await this.sendMessage(chatId, `🚀 *Buyurtma #${order?.order_number || orderId} qabul qilindi!*\nSiz yo'lga chiqdingiz. Manzilga yetib borgach "Yetkazib berdim" tugmasini bosing.`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏁 Yetkazib berdim (Tugatish)', callback_data: `courier_delivered_${orderId}` }]
          ]
        }
      });
      return;
    }

    if (data.startsWith('courier_delivered_')) {
      const orderId = Number(data.split('_')[2]);
      const courier = db.get('SELECT id, name FROM couriers WHERE telegram_id = ?', [String(chatId)]);
      
      db.run('UPDATE orders SET status = "delivered", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [orderId]);
      if (courier) {
        db.run('UPDATE couriers SET status = "free", total_delivered = total_delivered + 1 WHERE id = ?', [courier.id]);
      }

      const order = db.get('SELECT order_number FROM orders WHERE id = ?', [orderId]);
      await this.sendMessage(chatId, `🎉 *Barakalla!* #${order?.order_number || orderId} buyurtma muvaffaqiyatli yetkazildi! Holatingiz yana "Bo'sh" (Free) ga o'tkazildi.`);
      return;
    }

    // Admin action: Quick confirm
    if (data.startsWith('admin_confirm_')) {
      const orderId = Number(data.split('_')[2]);
      db.run('UPDATE orders SET status = "confirmed", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [orderId]);
      await this.sendMessage(chatId, `✅ Buyurtma ID ${orderId} tasdiqlandi!`);
      return;
    }
  }

  // Welcome message with Reply Keyboard
  async sendWelcomeMessage(chatId, firstName, webAppUrl) {
    const welcomeText = `Salom, *${firstName || 'Qadrli Mijoz'}*! 👋\n\n` +
      `*Smart Delivery* — tezkor va aqlli taom yetkazib berish xizmatiga xush kelibsiz! 🚀\n\n` +
      `⚡️ *Nimalar qila olasiz?*\n` +
      `• Menyudan sarxil va issiq taomlarni tanlash\n` +
      `• Zamonaviy Web-sayt yoki WebApp orqali bir zumda buyurtma berish\n` +
      `• Real-time rejimida kuryer va buyurtmangizni xarita orqali jonli kuzatish!\n\n` +
      `Kerakli bo'limni tanlang:`;

    await this.sendMessage(chatId, welcomeText, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.getMainKeyboard(webAppUrl),
        resize_keyboard: true
      }
    });
  }

  getMainKeyboard(webAppUrl) {
    return [
      [{ text: '🍔 Menyu va Buyurtma berish' }],
      [{ text: '🌐 Web-sayt orqali buyurtma (WebApp)', web_app: { url: webAppUrl } }],
      [{ text: '📦 Buyurtmam holati' }, { text: '🛒 Savatcha' }],
      [{ text: '🛵 Kuryer rejimi' }, { text: '📞 Bog\'lanish' }]
    ];
  }

  async sendCategoryList(chatId) {
    const db = getDb();
    const categories = db.query('SELECT * FROM categories ORDER BY sort_order ASC');
    const inline_keyboard = [];

    for (let i = 0; i < categories.length; i += 2) {
      const row = [];
      row.push({ text: `${categories[i].icon || '🍽'} ${categories[i].name}`, callback_data: `cat_${categories[i].id}` });
      if (categories[i + 1]) {
        row.push({ text: `${categories[i + 1].icon || '🍽'} ${categories[i + 1].name}`, callback_data: `cat_${categories[i + 1].id}` });
      }
      inline_keyboard.push(row);
    }
    inline_keyboard.push([{ text: '🛒 Savatchani ko\'rish', callback_data: 'view_cart' }]);

    await this.sendMessage(chatId, `📋 *Kategoriyani tanlang:*`, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard }
    });
  }

  async sendProductsByCategory(chatId, categoryId) {
    const db = getDb();
    const category = db.get('SELECT * FROM categories WHERE id = ?', [categoryId]);
    const products = db.query('SELECT * FROM products WHERE category_id = ? AND is_available = 1', [categoryId]);

    if (products.length === 0) {
      await this.sendMessage(chatId, 'Hozircha ushbu kategoriyada taomlar mavjud emas.');
      return;
    }

    await this.sendMessage(chatId, `✨ *${category ? category.name : 'Menyu'} taomlari:*`, { parse_mode: 'Markdown' });

    for (const p of products) {
      const caption = `*${p.name}*\n` +
        `📝 ${p.description || ''}\n` +
        `⏱ Tayyorlanish: ~${p.prep_time_min} daqiqa\n` +
        `💰 Narxi: *${Number(p.price).toLocaleString()} so'm*`;

      const inline_keyboard = [
        [{ text: `➕ Savatchaga qo'shish (${Number(p.price).toLocaleString()} so'm)`, callback_data: `add_${p.id}` }]
      ];

      if (p.image_url) {
        await this.callApi('sendPhoto', {
          chat_id: chatId,
          photo: p.image_url,
          caption: caption,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard }
        });
      } else {
        await this.sendMessage(chatId, caption, {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard }
        });
      }
    }

    await this.sendMessage(chatId, `Tanlab bo'lgach savatchaga o'ting:`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Savatchani ko\'rish', callback_data: 'view_cart' }],
          [{ text: '⬅️ Kategoriyalarga qaytish', callback_data: 'back_to_cats' }]
        ]
      }
    });
  }

  async sendCartSummary(chatId, session) {
    if (!session.cart || session.cart.length === 0) {
      await this.sendMessage(chatId, `🛒 *Savatchangiz bo'sh!*\n\nMenyudan sevimli taomlaringizni tanlang.`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: '🍔 Menyu ochish', callback_data: 'back_to_cats' }]]
        }
      });
      return;
    }

    let total = 0;
    let text = `🛒 *Sizning savatchangiz:*\n\n`;

    session.cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      text += `${index + 1}. *${item.name}* x ${item.qty} = ${itemTotal.toLocaleString()} so'm\n`;
    });

    const deliveryFee = total >= 150000 ? 0 : 15000;
    const grandTotal = total + deliveryFee;

    text += `\n📦 Mahsulotlar: *${total.toLocaleString()} so'm*`;
    text += `\n🛵 Yetkazib berish: *${deliveryFee === 0 ? 'Tekin (Aksiya)' : deliveryFee.toLocaleString() + ' so\'m'}*`;
    text += `\n💰 *Jami to'lov: ${grandTotal.toLocaleString()} so'm*`;

    await this.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Buyurtma berish', callback_data: 'checkout' }],
          [{ text: '🗑 Savatchani tozalash', callback_data: 'clear_cart' }, { text: '➕ Yana taom qo\'shish', callback_data: 'back_to_cats' }]
        ]
      }
    });
  }

  async finalizeBotOrder(chatId, session) {
    const db = getDb();
    const orderNumber = `#SD-${Math.floor(1000 + Math.random() * 9000)}`;
    const items = session.cart;
    const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const deliveryFee = subtotal >= 150000 ? 0 : 15000;
    const totalAmount = subtotal + deliveryFee;

    const res = db.run(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, delivery_address,
        latitude, longitude, total_amount, delivery_fee, payment_method,
        status, source, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber,
      session.orderData.name || 'Telegram Mijoz',
      session.orderData.phone || '+998000000000',
      session.orderData.address || 'Manzil ko\'rsatilmagan',
      session.orderData.latitude || null,
      session.orderData.longitude || null,
      totalAmount,
      deliveryFee,
      'Naqd',
      'new',
      'telegram_bot',
      'Telegram bot orqali rasmiylashtirildi'
    ]);

    const orderId = res.lastInsertRowid;
    for (const item of items) {
      db.run(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [orderId, item.id, item.name, item.qty, item.price, item.price * item.qty]);
    }

    // Reset session cart
    session.cart = [];
    session.step = null;
    session.orderData = {};

    const webAppUrl = process.env.FRONTEND_URL || 'https://smart-delivery-system.vercel.app';

    await this.sendMessage(chatId, `🎉 *Buyurtmangiz muvaffaqiyatli qabul qilindi!*\n\n` +
      `🆔 Buyurtma raqami: *${orderNumber}*\n` +
      `💰 Jami summa: *${totalAmount.toLocaleString()} so'm*\n` +
      `⏳ Holati: *Yangi (Operator tasdiqlashi kutilmoqda)*\n\n` +
      `Buyurtmangiz holatini istalgan payt *'📦 Buyurtmam holati'* bo'limidan yoki Web-saytimizda *${orderNumber}* raqamini kiritib kuzatib borishingiz mumkin!`, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.getMainKeyboard(webAppUrl),
        resize_keyboard: true
      }
    });

    // Notify admins
    this.notifyAdminsNewOrder({
      id: orderId,
      order_number: orderNumber,
      customer_name: session.orderData.name,
      customer_phone: session.orderData.phone,
      total_amount: totalAmount,
      source: 'telegram_bot'
    });
  }

  async sendUserActiveOrders(chatId) {
    const db = getDb();
    // Search by telegram_id or recent
    const orders = db.query(`
      SELECT o.*, c.name as courier_name, c.phone as courier_phone, c.vehicle_type
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      WHERE o.status != 'cancelled'
      ORDER BY o.id DESC
      LIMIT 3
    `);

    if (orders.length === 0) {
      await this.sendMessage(chatId, 'Sizda hozircha faol buyurtmalar yo\'q.');
      return;
    }

    let text = `📦 *Oxirgi buyurtmalaringiz holati:*\n\n`;
    const statusMap = {
      new: '🟡 Yangi (Qabul qilindi)',
      confirmed: '🔵 Tasdiqlandi',
      preparing: '👨‍🍳 Oshxonada tayyorlanmoqda',
      on_way: '🛵 Yo\'lda (Kuryer eltmoqda)',
      delivered: '✅ Yetkazib berildi',
      cancelled: '❌ Bekor qilingan'
    };

    for (const o of orders) {
      text += `🆔 *${o.order_number}*\n` +
        `📊 Holat: *${statusMap[o.status] || o.status}*\n` +
        `💰 Summa: *${Number(o.total_amount).toLocaleString()} so'm*\n` +
        `📍 Manzil: ${o.delivery_address}\n`;

      if (o.courier_name) {
        text += `🛵 Kuryer: *${o.courier_name}* (${o.vehicle_type || 'Skuter'}, 📞 ${o.courier_phone})\n`;
      }
      text += `─────────────\n`;
    }

    await this.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  }

  async handleCourierCommand(chatId) {
    const db = getDb();
    const courier = db.get('SELECT * FROM couriers WHERE telegram_id = ?', [String(chatId)]);

    if (courier) {
      await this.sendMessage(chatId, `👋 Xush kelibsiz, *${courier.name}* (Kuryer)!\n\n` +
        `📊 Holat: *${courier.status === 'free' ? '🟢 Bo\'sh (Free)' : '🟡 Band (Busy)'}*\n` +
        `🛵 Transport: *${courier.vehicle_type}*\n` +
        `📦 Yetkazilgan jami: *${courier.total_delivered} ta buyurtma*`, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: '📋 Biriktirilgan buyurtmalarim' }, { text: '🟢 Holatim: Bo\'sh (Free)' }],
            [{ text: '🏠 Asosiy menyu' }]
          ],
          resize_keyboard: true
        }
      });
    } else {
      const session = this.getSession(chatId);
      session.step = 'courier_phone';
      await this.sendMessage(chatId, `🛵 *Smart Delivery Kuryer tizimiga ulanish:*\n\nIltimos, kuryer akkauntingizni tizim bilan bog'lash uchun quyidagi tugma orqali telefon raqamingizni yuboring:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: '📱 Kuryer telefon raqamini yuborish', request_contact: true }],
            [{ text: '🏠 Asosiy menyu' }]
          ],
          resize_keyboard: true
        }
      });
    }
  }

  async sendCourierActiveOrders(chatId) {
    const db = getDb();
    const courier = db.get('SELECT id, name FROM couriers WHERE telegram_id = ?', [String(chatId)]);
    if (!courier) {
      await this.sendMessage(chatId, 'Siz kuryer sifatida ro\'yxatdan o\'tmagansiz. /courier bosing.');
      return;
    }

    const orders = db.query(`
      SELECT * FROM orders
      WHERE courier_id = ? AND status IN ('confirmed', 'preparing', 'on_way')
      ORDER BY id DESC
    `, [courier.id]);

    if (orders.length === 0) {
      await this.sendMessage(chatId, 'Hozircha sizga biriktirilgan faol buyurtmalar yo\'q.');
      return;
    }

    for (const o of orders) {
      const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      const itemsText = items.map(i => `• ${i.product_name} x ${i.quantity}`).join('\n');

      const msg = `🔔 *Buyurtma ${o.order_number}*\n\n` +
        `👤 Mijoz: *${o.customer_name}*\n` +
        `📞 Telefon: *${o.customer_phone}*\n` +
        `📍 Manzil: *${o.delivery_address}*\n` +
        `💳 To'lov: *${o.payment_method}* (${Number(o.total_amount).toLocaleString()} so'm)\n` +
        `📝 Izoh: ${o.notes || 'Yo\'q'}\n\n` +
        `🍱 *Tarkibi:*\n${itemsText}`;

      const buttons = [];
      if (o.status !== 'on_way') {
        buttons.push([{ text: '🚗 Qabul qildim / Yo\'lga chiqdim', callback_data: `courier_accept_${o.id}` }]);
      }
      buttons.push([{ text: '🏁 Yetkazib berdim', callback_data: `courier_delivered_${o.id}` }]);

      await this.sendMessage(chatId, msg, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons }
      });
    }
  }

  async sendAdminOverview(chatId) {
    const db = getDb();
    const totalOrders = db.get('SELECT COUNT(*) as cnt FROM orders').cnt;
    const activeOrders = db.get('SELECT COUNT(*) as cnt FROM orders WHERE status NOT IN ("delivered", "cancelled")').cnt;
    const totalRevenue = db.get('SELECT SUM(total_amount) as sum FROM orders WHERE status = "delivered"').sum || 0;
    const freeCouriers = db.get('SELECT COUNT(*) as cnt FROM couriers WHERE status = "free"').cnt;

    const text = `👑 *Smart Delivery — Admin boshqaruv paneli:*\n\n` +
      `📊 Jami buyurtmalar: *${totalOrders} ta*\n` +
      `🔥 Faol buyurtmalar: *${activeOrders} ta*\n` +
      `🛵 Bo'sh kuryerlar: *${freeCouriers} ta*\n` +
      `💰 Tushum: *${Number(totalRevenue).toLocaleString()} so'm*\n\n` +
      `Web-admin panel manzili: ${process.env.FRONTEND_URL || 'https://smart-delivery-system.vercel.app'}/admin`;

    await this.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  }

  // Real-Time Notification to Courier when Order is Assigned
  async notifyCourierAssigned(courierId, order) {
    const db = getDb();
    const courier = db.get('SELECT * FROM couriers WHERE id = ?', [courierId]);
    if (!courier || !courier.telegram_id) return;

    const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const itemsText = items.map(i => `• ${i.product_name} x ${i.quantity}`).join('\n');

    const msg = `🚀 *SIZGA YANGI BUYURTMA BIRIKTIRILDI!*\n\n` +
      `🆔 Buyurtma: *${order.order_number}*\n` +
      `👤 Mijoz: *${order.customer_name}*\n` +
      `📞 Tel: *${order.customer_phone}*\n` +
      `📍 Manzil: *${order.delivery_address}*\n` +
      `💰 To'lov turi: *${order.payment_method}* (${Number(order.total_amount).toLocaleString()} so'm)\n` +
      `📝 Izoh: ${order.notes || 'Yo\'q'}\n\n` +
      `🍱 *Taomlar ro'yxati:*\n${itemsText}`;

    await this.sendMessage(courier.telegram_id, msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚗 Qabul qildim / Yo\'lga chiqdim', callback_data: `courier_accept_${order.id}` }],
          [{ text: '🏁 Yetkazib berdim', callback_data: `courier_delivered_${order.id}` }]
        ]
      }
    });
  }

  // Real-Time Notification to Admins on New Order
  async notifyAdminsNewOrder(order) {
    const msg = `🔔 *YANGI BUYURTMA KELDI! (${order.order_number})*\n\n` +
      `👤 Mijoz: *${order.customer_name}*\n` +
      `📞 Tel: *${order.customer_phone}*\n` +
      `💰 Summa: *${Number(order.total_amount).toLocaleString()} so'm*\n` +
      `🌐 Manba: *${order.source === 'telegram_bot' ? 'Telegram Bot 🤖' : 'Web Sayt 💻'}*\n\n` +
      `Tezkor tasdiqlash uchun tugmani bosing:`;

    for (const adminId of this.adminChatIds) {
      await this.sendMessage(adminId, msg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Tasdiqlash', callback_data: `admin_confirm_${order.id}` }]
          ]
        }
      });
    }
  }

  // Base sendMessage
  async sendMessage(chatId, text, extra = {}) {
    return await this.callApi('sendMessage', {
      chat_id: chatId,
      text: text,
      ...extra
    });
  }
}

const botService = new TelegramBotService();

module.exports = {
  botService
};
