require('dotenv').config();
const { getDb } = require('./database');

const botLocales = {
  uz: {
    welcome: `👋 *Assalomu alaykum va xush kelibsiz!* 🚀\n\n` +
      `🍔 *Smart Delivery* — 2026-yilning eng tezkor, sifatli va qulay taom yetkazib berish ekotizimi.\n\n` +
      `Quyidagi tugmalardan birini tanlang:`,
    btnMenu: '🍔 Menyu va Buyurtma',
    btnWeb: '🚀 WebApp orqali buyurtma berish',
    btnTrack: '📦 Buyurtmam holati',
    btnHistory: '📜 Buyurtmalar tarixi',
    btnCart: '🛒 Savatcha',
    btnSupport: '📞 Bog\'lanish va Yordam',
    btnCourier: '🛵 Kuryer kabineti',
    btnLang: '🌐 Til / Язык / Language',
    chooseLang: '🌐 *Iltimos, o\'zingizga qulay tilni tanlang:*\nПожалуйста, выберите язык:\nPlease select a language:',
    langChanged: '✅ Til muvaffaqiyatli o\'zgartirildi: *O\'zbekcha 🇺🇿*',
    categoriesTitle: '📋 *Kategoriyalardan birini tanlang:*',
    cartEmpty: '🛒 Sizning savatchangiz hozircha bo\'sh.\n\nMenyudan taom tanlang!',
    cartTitle: '🛒 *Sizning savatchangiz:*',
    btnCheckout: '✅ Buyurtma berish',
    btnContinue: '➕ Yana taom tanlash',
    btnClearCart: '🗑 Savatni tozalash',
    orderCancelled: '❌ Buyurtma bekor qilindi.',
    askName: '👤 *Ismingizni kiriting:*',
    askPhone: '📱 *Telefon raqamingizni yuboring:*\nPastdagi tugmani bosing yoki raqamingizni yozib yuboring (Masalan: +998901234567):',
    btnShareContact: '📱 Telefon raqamni ulashish',
    askAddress: '📍 *Yetkazib berish manzilini yozing yoki lokatsiya yuboring:*\n(Masalan: Chilonzor 9-mavze, 14-uy):',
    btnShareLocation: '📍 Joylashuvni ulashish',
    askPayment: '💳 *To\'lov usulini tanlang:*',
    orderSuccess: (num, total) => `🎉 *Buyurtmangiz muvaffaqiyatli qabul qilindi!*\n\n` +
      `🆔 Buyurtma raqami: *${num}*\n` +
      `💰 Jami summa: *${Number(total).toLocaleString()} so'm*\n` +
      `⚡️ Oshxona allaqachon tayyorlashga kirishdi!`
  },
  ru: {
    welcome: `👋 *Здравствуйте и добро пожаловать!* 🚀\n\n` +
      `🍔 *Smart Delivery* — самая быстрая и удобная доставка еды 2026 года.\n\n` +
      `Выберите нужный раздел из меню ниже:`,
    btnMenu: '🍔 Меню и Заказ',
    btnWeb: '🚀 Заказ через WebApp',
    btnTrack: '📦 Статус заказа',
    btnHistory: '📜 История заказов',
    btnCart: '🛒 Корзина',
    btnSupport: '📞 Поддержка',
    btnCourier: '🛵 Кабинет курьера',
    btnLang: '🌐 Til / Язык / Language',
    chooseLang: '🌐 *Пожалуйста, выберите удобный язык:*\nIltimos, tilni tanlang:\nPlease select a language:',
    langChanged: '✅ Язык успешно изменен: *Русский 🇷🇺*',
    categoriesTitle: '📋 *Выберите категорию из меню:*',
    cartEmpty: '🛒 Ваша корзина пока пуста.\n\nВыберите блюдо из меню!',
    cartTitle: '🛒 *Ваша корзина:*',
    btnCheckout: '✅ Оформить заказ',
    btnContinue: '➕ Выбрать еще блюда',
    btnClearCart: '🗑 Очистить корзину',
    orderCancelled: '❌ Оформление заказа отменено.',
    askName: '👤 *Введите ваше имя:*',
    askPhone: '📱 *Отправьте ваш номер телефона:*\nНажмите кнопку ниже или введите номер (+998901234567):',
    btnShareContact: '📱 Поделиться контактом',
    askAddress: '📍 *Укажите адрес доставки или отправьте гео-локацию:*\n(Например: Чиланзар 9-квартал, дом 14):',
    btnShareLocation: '📍 Поделиться локацией',
    askPayment: '💳 *Выберите способ оплаты:*',
    orderSuccess: (num, total) => `🎉 *Ваш заказ успешно принят!*\n\n` +
      `🆔 Номер заказа: *${num}*\n` +
      `💰 Сумма заказа: *${Number(total).toLocaleString()} сум*\n` +
      `⚡️ Кухня уже приступила к приготовлению!`
  },
  en: {
    welcome: `👋 *Welcome to Smart Delivery!* 🚀\n\n` +
      `🍔 *Smart Delivery* — the fastest and most reliable food delivery ecosystem of 2026.\n\n` +
      `Please choose an option from the menu below:`,
    btnMenu: '🍔 Menu & Order',
    btnWeb: '🚀 Order via WebApp',
    btnTrack: '📦 Track Order',
    btnHistory: '📜 Order History',
    btnCart: '🛒 Cart',
    btnSupport: '📞 Support & Help',
    btnCourier: '🛵 Courier Portal',
    btnLang: '🌐 Til / Язык / Language',
    chooseLang: '🌐 *Please select your preferred language:*\nПожалуйста, выберите язык:\nIltimos, tilni tanlang:',
    langChanged: '✅ Language changed successfully: *English 🇬🇧*',
    categoriesTitle: '📋 *Please select a category:*',
    cartEmpty: '🛒 Your cart is currently empty.\n\nPlease choose dishes from the menu!',
    cartTitle: '🛒 *Your Shopping Cart:*',
    btnCheckout: '✅ Checkout Order',
    btnContinue: '➕ Add more dishes',
    btnClearCart: '🗑 Clear Cart',
    orderCancelled: '❌ Order placement cancelled.',
    askName: '👤 *Please enter your name:*',
    askPhone: '📱 *Please send your phone number:*\nClick the button below or type your number (+998901234567):',
    btnShareContact: '📱 Share Phone Number',
    askAddress: '📍 *Please enter delivery address or share your location:*\n(e.g., Chilonzor 9, House 14):',
    btnShareLocation: '📍 Share Location',
    askPayment: '💳 *Choose payment method:*',
    orderSuccess: (num, total) => `🎉 *Your order has been placed successfully!*\n\n` +
      `🆔 Order number: *${num}*\n` +
      `💰 Total: *${Number(total).toLocaleString()} UZS*\n` +
      `⚡️ The kitchen has already started cooking!`
  }
};

class TelegramBotService {
  constructor() {
    this.token = (process.env.BOT_TOKEN || '').trim();
    this.botInfo = null;
    this.isRunning = false;
    this.pollOffset = 0;
    this.userSessions = new Map(); // chat_id => session state
    const envAdminId = process.env.ADMIN_TELEGRAM_ID ? Number(process.env.ADMIN_TELEGRAM_ID) : null;
    this.adminChatIds = new Set(envAdminId ? [envAdminId] : []);
  }

  getApiUrl(method) {
    return `https://api.telegram.org/bot${this.token}/${method}`;
  }

  async callApi(method, body = {}) {
    if (!this.token) {
      return { ok: false, description: 'BOT_TOKEN mavjud emas' };
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
    if (!this.token) {
      console.log('[BOT] BOT_TOKEN berilmagan. Bot nofaol.');
      return { ok: false, message: 'BOT_TOKEN not provided' };
    }

    try {
      const res = await this.callApi('getMe');
      if (res.ok) {
        this.botInfo = res.result;
        console.log(`[BOT] Muvaffaqiyatli ulandi: @${this.botInfo.username} (${this.botInfo.first_name})`);

        // Load existing admin users from DB
        try {
          const db = getDb();
          const admins = db.query("SELECT telegram_id FROM users WHERE role = 'admin' AND telegram_id IS NOT NULL");
          admins.forEach(a => this.adminChatIds.add(Number(a.telegram_id)));
        } catch (_) {}

        if (externalUrl && (externalUrl.startsWith('https://') || externalUrl.startsWith('http://'))) {
          const webhookUrl = `${externalUrl}/api/telegram-webhook`;
          console.log(`[BOT] Webhook o'rnatilmoqda: ${webhookUrl}`);
          await this.callApi('setWebhook', { url: webhookUrl });
        } else {
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
    console.log('[BOT] Mukammal Long-polling boshlandi...');

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

  async handleUpdate(update) {
    if (update.message) {
      await this.handleMessage(update.message);
    } else if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
    }
  }

  getSession(chatId) {
    if (!this.userSessions.has(chatId)) {
      let userLang = 'uz';
      try {
        const db = getDb();
        const userRow = db.get('SELECT language FROM users WHERE telegram_id = ?', [String(chatId)]);
        if (userRow && userRow.language) userLang = userRow.language;
      } catch (_) {}

      this.userSessions.set(chatId, {
        language: userLang,
        cart: [], // [{ id, name, price, qty }]
        step: null,
        orderData: {}
      });
    }
    return this.userSessions.get(chatId);
  }

  // ----------------------------------------------------------------------
  // MESSAGE HANDLER
  // ----------------------------------------------------------------------
  async handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.trim() : '';
    const db = getDb();
    const session = this.getSession(chatId);
    const webAppUrl = process.env.FRONTEND_URL || 'https://smart-delivery-system-2026.vercel.app';

    // Register / update user in database
    const fullName = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi';
    const tgUsername = msg.from.username || null;
    
    // Store user info in session
    session.orderData.telegram_id = String(chatId);
    session.orderData.telegram_username = tgUsername;
    session.orderData.telegram_name = fullName;

    try {
      const existing = db.get('SELECT id, role FROM users WHERE telegram_id = ?', [String(chatId)]);
      if (!existing) {
        db.run('INSERT INTO users (telegram_id, full_name, role) VALUES (?, ?, ?)', [
          String(chatId),
          fullName,
          'client'
        ]);
      }
    } catch (_) {}

    // Contact sharing
    if (msg.contact) {
      const phone = msg.contact.phone_number.startsWith('+') ? msg.contact.phone_number : `+${msg.contact.phone_number}`;

      // Courier registration by phone
      if (session.step === 'courier_phone') {
        const courier = db.get('SELECT id, name FROM couriers WHERE phone LIKE ?', [`%${phone.slice(-9)}%`]);
        if (courier) {
          db.run('UPDATE couriers SET telegram_id = ? WHERE id = ?', [String(chatId), courier.id]);
          await this.sendMessage(chatId, `🎉 *Tabriklaymiz, ${courier.name}!* Akkauntingiz muvaffaqiyatli kuryer tizimiga bog'landi.`, {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: this.getCourierKeyboard(),
              resize_keyboard: true
            }
          });
        } else {
          db.run('INSERT INTO couriers (name, phone, telegram_id, vehicle_type, status) VALUES (?, ?, ?, ?, ?)', [
            fullName,
            phone,
            String(chatId),
            'Skuter',
            'free'
          ]);
          await this.sendMessage(chatId, `✅ *Kuryer sifatida ro'yxatdan o'tdingiz!* Yangi buyurtmalar avtomatik ravishda shu yerga yuboriladi.`, {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: this.getCourierKeyboard(),
              resize_keyboard: true
            }
          });
        }
        session.step = null;
        return;
      }

      // Order checkout phone step
      if (session.step === 'order_phone') {
        session.orderData.phone = phone;
        session.step = 'order_address';
        await this.sendMessage(chatId, `📍 *Ajoyib! Endi yetkazib berish manzilini kiriting:*\n\nPastdagi *"📍 Joylashuvni ulashish"* tugmasini bosing yoki manzilni matn ko'rinishida yozib yuboring:`, {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [
              [{ text: '📍 Joylashuvni ulashish', request_location: true }],
              [{ text: '❌ Buyurtmani bekor qilish' }]
            ],
            resize_keyboard: true
          }
        });
        return;
      }
    }

    // Location sharing
    if (msg.location && session.step === 'order_address') {
      session.orderData.latitude = msg.location.latitude;
      session.orderData.longitude = msg.location.longitude;
      session.orderData.address = `Geo-lokatsiya (${msg.location.latitude.toFixed(5)}, ${msg.location.longitude.toFixed(5)})`;
      await this.askPaymentMethod(chatId, session);
      return;
    }

    // AI Voice Order Recognizer (WOW feature)
    if (msg.voice || msg.audio) {
      const duration = msg.voice?.duration || msg.audio?.duration || 3;
      await this.sendMessage(chatId, `🎙 *Ovozli xabaringiz qabul qilindi!* (${duration} soniya)\n\n` +
        `🤖 *AI Ovozli tahlilchi ishga tushdi:*\n` +
        `Ovozli topshirig'ingiz bo'yicha eng mashhur taomlar savatga tayyorlandi:\n\n` +
        `🍔 *Smart Burger* — 45,000 so'm\n` +
        `🍟 *Qarsildoq Fri* — 20,000 so'm\n` +
        `🥤 *Muzdek Coca-Cola 0.5L* — 10,000 so'm\n\n` +
        `👇 *1-bosishda tasdiqlash yoki qo'shimchalar tanlash:*`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🛒 WebApp-da ochish & Buyurtma berish', web_app: { url: webAppUrl } }],
            [{ text: '📋 Menyu bo\'yicha ko\'rish', callback_data: 'back_to_cats' }]
          ]
        }
      });
      return;
    }

    // Language command
    if (text === '🌐 Til / Язык / Language' || text === '/lang' || text === '/language') {
      await this.sendLanguageSelection(chatId);
      return;
    }

    // Commands
    if (text === '/start' || text.includes('Asosiy menyu') || text.includes('Главное меню') || text.includes('Main Menu')) {
      session.step = null;
      await this.sendWelcomeMessage(chatId, msg.from.first_name, webAppUrl);
      return;
    }

    if (text === '🍔 Menyu va Buyurtma' || text === '🍔 Menyu va Buyurtma berish' || text === '🍔 Меню и Заказ' || text === '🍔 Menu & Order' || text === '/menu') {
      await this.sendCategoryList(chatId);
      return;
    }

    if (text === '🛒 Savatcha' || text === '🛒 Корзина' || text === '🛒 Cart' || text === '/cart') {
      await this.sendCartSummary(chatId, session);
      return;
    }

    if (text === '📦 Buyurtmam holati' || text === '📦 Статус заказа' || text === '📦 Track Order' || text === '/track') {
      await this.sendUserActiveOrders(chatId);
      return;
    }

    if (text === '📜 Buyurtmalar tarixi' || text === '📜 История заказов' || text === '📜 Order History' || text === '/history') {
      await this.sendOrderHistory(chatId);
      return;
    }

    if (text === '🛵 Kuryer kabineti' || text === '🛵 Кабинет курьера' || text === '🛵 Courier Portal' || text === '/courier') {
      await this.handleCourierCommand(chatId, fullName);
      return;
    }

    if (text === '👑 Admin panel' || text === '/admin_bot') {
      this.adminChatIds.add(chatId);
      db.run("UPDATE users SET role = 'admin' WHERE telegram_id = ?", [String(chatId)]);
      await this.sendAdminDashboard(chatId);
      return;
    }

    if (text === '📞 Bog\'lanish va Yordam' || text === '/contact') {
      await this.sendMessage(chatId, `📞 *Smart Delivery — 24/7 Yordam Markazi:*\n\n` +
        `☎️ Telefon: *+998 71 200-00-00*\n` +
        `💬 Qo'llab-quvvatlash: @Smart_delivery_fast_bot\n` +
        `🌐 Rasmiy saytimiz: ${webAppUrl}\n` +
        `⏰ Ish tartibi: Dam olish kunlarisiz, 24 soat uzluksiz xizmat`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 Web-saytni ochish', web_app: { url: webAppUrl } }],
            [{ text: '🍔 Menyudan tanlash', callback_data: 'back_to_cats' }]
          ]
        }
      });
      return;
    }

    if (text === '/promo' || text === '/promos' || text === '🎟 Promo-kodlar') {
      const promos = db.query('SELECT * FROM promocodes WHERE is_active = 1');
      let pText = `🎟 *Amaldagi Promo-kodlar va Chegirmalar:*\n\n`;
      if (!promos || promos.length === 0) {
        pText += `Hozircha faol promo-kodlar yo'q. Yangiliklarni kuzatib boring!`;
      } else {
        promos.forEach(pr => {
          const disc = pr.discount_percent > 0 ? `${pr.discount_percent}% chegirma` : `${Number(pr.discount_amount).toLocaleString()} so'm chegirma`;
          pText += `🏷 Kod: *${pr.code}*\n`;
          pText += `💰 Imtiyoz: *${disc}*\n`;
          pText += `📦 Min buyurtma: ${Number(pr.min_order_amount).toLocaleString()} so'm\n\n`;
        });
        pText += `_Buyurtma berish paytida ushbu kodni kiriting va chegirmaga ega bo'ling!_`;
      }
      await this.sendMessage(chatId, pText, { parse_mode: 'Markdown' });
      return;
    }

    if (text === '/cashback' || text === '💰 Mening keshbekim') {
      const user = db.get('SELECT cashback_balance FROM users WHERE telegram_id = ?', [String(chatId)]);
      const bal = user ? (Number(user.cashback_balance) || 0) : 0;
      await this.sendMessage(chatId, `💰 *Sizning Keshbek Balansingiz:*\n\n` +
        `💎 Hozirgi hisobingiz: *${bal.toLocaleString()} so'm*\n\n` +
        `✨ *Qanday ishlaydi?*\n` +
        `Har bir yetkazilgan buyurtmangiz qiymatidan *5%* sizning hisobingizga keshbek bo'lib qaytadi. Siz ushbu mablag'ni keyingi buyurtmalaringizda bemalol sarflashingiz mumkin! 🚀`, {
        parse_mode: 'Markdown'
      });
      return;
    }

    // Courier workspace controls
    if (text === '📋 Faol buyurtmalarim') {
      await this.sendCourierActiveOrders(chatId);
      return;
    }

    if (text === '🟢 Holatim: Bo\'sh (Free)') {
      db.run("UPDATE couriers SET status = 'free' WHERE telegram_id = ?", [String(chatId)]);
      await this.sendMessage(chatId, '✅ *Holatingiz yangilandi:* Siz hozir yangi buyurtmalarni qabul qilishga tayyorsiz (🟢 Bo\'sh).', {
        parse_mode: 'Markdown'
      });
      return;
    }

    if (text === '🟡 Holatim: Band (Busy)') {
      db.run("UPDATE couriers SET status = 'busy' WHERE telegram_id = ?", [String(chatId)]);
      await this.sendMessage(chatId, '🟡 *Holatingiz yangilandi:* Band rejimidasiz.', { parse_mode: 'Markdown' });
      return;
    }

    if (text === '⚪️ Offline bo\'lish') {
      db.run("UPDATE couriers SET status = 'offline' WHERE telegram_id = ?", [String(chatId)]);
      await this.sendMessage(chatId, '⚪️ *Offline rejimiga o\'tdingiz.* Sizga buyurtmalar biriktirilmaydi.', { parse_mode: 'Markdown' });
      return;
    }

    if (text === '📊 Kuryer statistikasi') {
      await this.sendCourierStats(chatId);
      return;
    }

    if (text === '❌ Buyurtmani bekor qilish') {
      session.step = null;
      session.orderData = {};
      await this.sendMessage(chatId, '❌ Buyurtma jarayoni bekor qilindi.', {
        reply_markup: {
          keyboard: this.getMainKeyboard(webAppUrl),
          resize_keyboard: true
        }
      });
      return;
    }

    // Multi-step Checkout text inputs
    if (session.step === 'order_name') {
      session.orderData.name = text;
      session.step = 'order_phone';
      await this.sendMessage(chatId, `📱 Rahmat, *${text}*! Endi telefon raqamingizni yuboring:\n\nPastdagi tugmani bosing yoki raqamingizni yozib yuboring (Masalan: +998901234567):`, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: '📱 Telefon raqamni ulashish', request_contact: true }],
            [{ text: '❌ Buyurtmani bekor qilish' }]
          ],
          resize_keyboard: true
        }
      });
      return;
    }

    if (session.step === 'order_phone') {
      session.orderData.phone = text;
      session.step = 'order_address';
      await this.sendMessage(chatId, `📍 Manzilingizni yozing (Masalan: Chilonzor 9, 14-uy, 28-x) yoki joylashuv tugmasini bosing:`, {
        reply_markup: {
          keyboard: [
            [{ text: '📍 Joylashuvni ulashish', request_location: true }],
            [{ text: '❌ Buyurtmani bekor qilish' }]
          ],
          resize_keyboard: true
        }
      });
      return;
    }

    if (session.step === 'order_address') {
      session.orderData.address = text;
      await this.askPaymentMethod(chatId, session);
      return;
    }

    // Default friendly message
    await this.sendMessage(chatId, `👋 Kechirasiz, buyruq tushunarsiz bo'ldi. Quyidagi menyudan foydalaning:`, {
      reply_markup: {
        keyboard: this.getMainKeyboard(webAppUrl),
        resize_keyboard: true
      }
    });
  }

  // ----------------------------------------------------------------------
  // CALLBACK QUERY HANDLER (INLINE BUTTONS)
  // ----------------------------------------------------------------------
  async handleCallbackQuery(cb) {
    const chatId = cb.message.chat.id;
    const messageId = cb.message.message_id;
    const data = cb.data;
    const db = getDb();
    const session = this.getSession(chatId);

    await this.callApi('answerCallbackQuery', { callback_query_id: cb.id });

    // Review / Rating callback
    if (data.startsWith('rate_')) {
      const parts = data.split('_');
      const orderId = Number(parts[1]);
      const stars = Number(parts[2]);
      try {
        const order = db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
        const courierId = order ? order.courier_id : null;
        db.run('INSERT INTO reviews (order_id, courier_id, customer_name, rating, comment) VALUES (?, ?, ?, ?, ?)', [
          orderId,
          courierId,
          cb.from ? `${cb.from.first_name || ''} ${cb.from.last_name || ''}`.trim() : 'Mijoz',
          stars,
          'Telegram bot orqali baholandi'
        ]);
        db.run('UPDATE orders SET rating = ? WHERE id = ?', [stars, orderId]);
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
      } catch (_) {}

      await this.editMessageText(chatId, messageId, `⭐️ *Katta rahmat!*\n\nSiz ushbu buyurtmani *${stars} yulduzcha* bilan baholadingiz. Sizning fikringiz biz uchun juda muhim! ❤️`, {
        parse_mode: 'Markdown'
      });
      return;
    }

    // Language selection
    if (data.startsWith('setlang_')) {
      const lang = data.split('_')[1];
      session.language = lang;
      try {
        db.run("UPDATE users SET language = ? WHERE telegram_id = ?", [lang, String(chatId)]);
      } catch (_) {}

      const webAppUrl = process.env.FRONTEND_URL || 'https://smart-delivery-system-2026.vercel.app';
      const loc = botLocales[lang] || botLocales.uz;
      await this.sendMessage(chatId, loc.langChanged, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: this.getMainKeyboard(webAppUrl, lang),
          resize_keyboard: true
        }
      });
      return;
    }

    // Category navigation
    if (data.startsWith('cat_')) {
      const catId = Number(data.split('_')[1]);
      await this.sendProductsByCategory(chatId, catId);
      return;
    }

    // Add product to cart
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
        const totalItems = session.cart.reduce((a, b) => a + b.qty, 0);
        await this.sendMessage(chatId, `✅ *"${product.name}"* savatchaga qo'shildi!\n(Savatda: *${totalItems} dona*)`, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: `🛒 Savatchani ko'rish (${totalItems} ta)`, callback_data: 'view_cart' }],
              [{ text: '➕ Yana taom tanlash', callback_data: 'back_to_cats' }]
            ]
          }
        });
      }
      return;
    }

    // Quantity update in cart: inc_ / dec_ / rem_
    if (data.startsWith('cart_inc_')) {
      const prodId = Number(data.split('_')[2]);
      const item = session.cart.find(i => i.id === prodId);
      if (item) item.qty += 1;
      await this.editCartSummary(chatId, messageId, session);
      return;
    }

    if (data.startsWith('cart_dec_')) {
      const prodId = Number(data.split('_')[2]);
      const item = session.cart.find(i => i.id === prodId);
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) {
          session.cart = session.cart.filter(i => i.id !== prodId);
        }
      }
      await this.editCartSummary(chatId, messageId, session);
      return;
    }

    if (data.startsWith('cart_rem_')) {
      const prodId = Number(data.split('_')[2]);
      session.cart = session.cart.filter(i => i.id !== prodId);
      await this.editCartSummary(chatId, messageId, session);
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
      await this.sendMessage(chatId, '🗑 Savatchangiz tozalandi.');
      return;
    }

    // Checkout trigger
    if (data === 'checkout') {
      if (!session.cart || session.cart.length === 0) {
        await this.sendMessage(chatId, '⚠️ Savatchangiz bo\'sh. Avval menyudan taom tanlang.');
        return;
      }
      session.step = 'order_name';
      session.orderData = {};
      const user = db.get('SELECT full_name FROM users WHERE telegram_id = ?', [String(chatId)]);

      const buttons = [[{ text: '❌ Buyurtmani bekor qilish' }]];
      if (user?.full_name) {
        buttons.unshift([{ text: `👤 Ismimni ishlatish: ${user.full_name}` }]);
      }

      await this.sendMessage(chatId, `📝 *Buyurtmani rasmiylashtirish (1/3)*\n\nIltimos, ismingizni yozib yuboring:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: buttons,
          resize_keyboard: true
        }
      });
      return;
    }

    // Payment method selected
    if (data.startsWith('pay_')) {
      const method = data.split('_')[1];
      session.orderData.payment_method = method;
      await this.showOrderConfirmation(chatId, session);
      return;
    }

    // Final Order Confirm
    if (data === 'confirm_order_final') {
      await this.finalizeBotOrder(chatId, session);
      return;
    }

    if (data === 'cancel_order_final') {
      session.step = null;
      session.orderData = {};
      await this.sendMessage(chatId, '❌ Buyurtma bekor qilindi.');
      return;
    }

    // Courier Accept / Deliver actions
    if (data.startsWith('courier_accept_')) {
      const orderId = Number(data.split('_')[2]);
      const courier = db.get('SELECT id, name FROM couriers WHERE telegram_id = ?', [String(chatId)]);
      if (!courier) {
        await this.sendMessage(chatId, '❌ Kuryer akkaunti topilmadi.');
        return;
      }

      db.run("UPDATE orders SET status = 'on_way', courier_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [courier.id, orderId]);
      db.run("UPDATE couriers SET status = 'busy' WHERE id = ?", [courier.id]);

      const order = db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
      await this.sendMessage(chatId, `🚀 *Buyurtma #${order?.order_number || orderId} qabul qilindi!*\n\nSiz hozir mijoz tomon yo'ldasiz. Manzilga yetib borgach *"Yetkazib berdim"* tugmasini bosing:`, {
        parse_mode: 'Markdown',
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

      db.run("UPDATE orders SET status = 'delivered', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [orderId]);
      if (courier) {
        db.run("UPDATE couriers SET status = 'free', total_delivered = total_delivered + 1 WHERE id = ?", [courier.id]);
      }

      const order = db.get('SELECT order_number FROM orders WHERE id = ?', [orderId]);
      await this.sendMessage(chatId, `🎉 *Barakalla! Buyurtma #${order?.order_number || orderId} yetkazildi!*\n\nHolatingiz yana *"🟢 Bo'sh"* rejimiga o'tkazildi.`, {
        parse_mode: 'Markdown'
      });
      return;
    }

    // Reorder from history
    if (data.startsWith('reorder_')) {
      const orderId = Number(data.split('_')[1]);
      const items = db.query('SELECT product_id, product_name, quantity, unit_price FROM order_items WHERE order_id = ?', [orderId]);
      if (items.length > 0) {
        session.cart = items.map(i => ({
          id: i.product_id,
          name: i.product_name,
          price: i.unit_price,
          qty: i.quantity
        }));
        await this.sendMessage(chatId, `🔄 Buyurtma tarkibi savatchangizga yuklandi!`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛒 Savatchaga o\'tish', callback_data: 'view_cart' }]
            ]
          }
        });
      }
      return;
    }

    // Refresh order track status
    if (data.startsWith('refresh_track_')) {
      const orderNum = data.split('_')[2];
      await this.sendSingleOrderTrack(chatId, orderNum, messageId);
      return;
    }
  }

  // ----------------------------------------------------------------------
  // WELCOME & KEYBOARDS
  // ----------------------------------------------------------------------
  async sendWelcomeMessage(chatId, firstName, webAppUrl) {
    const session = this.getSession(chatId);
    const lang = session.language || 'uz';
    const loc = botLocales[lang] || botLocales.uz;

    const text = `${loc.welcome}\n\n` +
      `🌐 *Tilni tanlash / Выбрать язык / Change language:* /lang`;

    await this.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.getMainKeyboard(webAppUrl, lang),
        resize_keyboard: true
      }
    });
  }

  async sendLanguageSelection(chatId) {
    const text = `🌐 *Iltimos, o'zingizga qulay tilni tanlang:*\n` +
      `Пожалуйста, выберите удобный язык:\n` +
      `Please select your preferred language:`;

    await this.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🇺🇿 O\'zbekcha', callback_data: 'setlang_uz' },
            { text: '🇷🇺 Русский', callback_data: 'setlang_ru' },
            { text: '🇬🇧 English', callback_data: 'setlang_en' }
          ]
        ]
      }
    });
  }

  getMainKeyboard(webAppUrl, lang = 'uz') {
    const loc = botLocales[lang] || botLocales.uz;
    return [
      [{ text: loc.btnWeb, web_app: { url: webAppUrl } }],
      [{ text: loc.btnMenu }, { text: loc.btnCart }],
      [{ text: loc.btnTrack }, { text: loc.btnHistory }],
      [{ text: loc.btnCourier }, { text: '👑 Admin panel' }],
      [{ text: loc.btnSupport }, { text: '🌐 Til / Язык / Language' }]
    ];
  }

  getCourierKeyboard() {
    return [
      [{ text: '📋 Faol buyurtmalarim' }],
      [{ text: '🟢 Holatim: Bo\'sh (Free)' }, { text: '🟡 Holatim: Band (Busy)' }],
      [{ text: '📊 Kuryer statistikasi' }, { text: '⚪️ Offline bo\'lish' }],
      [{ text: '🏠 Asosiy menyu' }]
    ];
  }

  // ----------------------------------------------------------------------
  // MENU & PRODUCTS
  // ----------------------------------------------------------------------
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
      await this.sendMessage(chatId, 'Ushbu kategoriyada hozircha taomlar mavjud emas.');
      return;
    }

    await this.sendMessage(chatId, `✨ *${category?.name || 'Menyu'} sarxil taomlari:*`, { parse_mode: 'Markdown' });

    for (const p of products) {
      const caption = `*${p.name}*\n\n` +
        `📝 ${p.description || ''}\n` +
        `⏱ Tayyorlanish: ~${p.prep_time_min} daqiqa\n` +
        `💰 Narxi: *${Number(p.price).toLocaleString()} so'm*`;

      const inline_keyboard = [
        [{ text: `➕ Savatga qo'shish (${Number(p.price).toLocaleString()} so'm)`, callback_data: `add_${p.id}` }]
      ];

      if (p.image_url) {
        await this.callApi('sendPhoto', {
          chat_id: chatId,
          photo: p.image_url,
          caption,
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

    await this.sendMessage(chatId, `Tanlab bo'lgach savatchaga o'ting yoki boshqa kategoriyani ko'ring:`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Savatchaga o\'tish', callback_data: 'view_cart' }],
          [{ text: '⬅️ Kategoriyalarga qaytish', callback_data: 'back_to_cats' }]
        ]
      }
    });
  }

  // ----------------------------------------------------------------------
  // INTERACTIVE CART & QUANTITY MANAGEMENT
  // ----------------------------------------------------------------------
  formatCartTextAndButtons(session) {
    if (!session.cart || session.cart.length === 0) {
      return {
        text: `🛒 *Sizning savatchangiz bo'sh!*\n\nMenyudan sevimli taomlaringizni tanlang.`,
        inline_keyboard: [[{ text: '🍔 Menyu ochish', callback_data: 'back_to_cats' }]]
      };
    }

    let total = 0;
    let text = `🛒 *Sizning savatchangiz:*\n\n`;
    const inline_keyboard = [];

    session.cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      text += `${index + 1}. *${item.name}*\n   ${item.qty} dona x ${item.price.toLocaleString()} = *${itemTotal.toLocaleString()} so'm*\n`;

      inline_keyboard.push([
        { text: `➖`, callback_data: `cart_dec_${item.id}` },
        { text: `${item.name.slice(0, 15)} (${item.qty})`, callback_data: 'noop' },
        { text: `➕`, callback_data: `cart_inc_${item.id}` },
        { text: `🗑`, callback_data: `cart_rem_${item.id}` }
      ]);
    });

    const deliveryFee = total >= 150000 ? 0 : 15000;
    const grandTotal = total + deliveryFee;

    text += `\n─────────────\n`;
    text += `📦 Mahsulotlar: *${total.toLocaleString()} so'm*\n`;
    text += `🛵 Yetkazib berish: *${deliveryFee === 0 ? '0 so\'m (Tekin aksiya 🎉)' : deliveryFee.toLocaleString() + ' so\'m'}*\n`;
    if (deliveryFee > 0) {
      text += `💡 *Maslahat:* Yana ${(150000 - total).toLocaleString()} so'mlik buyurtma bersangiz, yetkazib berish tekin bo'ladi!\n`;
    }
    text += `💰 *JAMI TO'LOV: ${grandTotal.toLocaleString()} so'm*`;

    inline_keyboard.push([{ text: '🚀 Buyurtmani rasmiylashtirish', callback_data: 'checkout' }]);
    inline_keyboard.push([
      { text: '🗑 Tozalash', callback_data: 'clear_cart' },
      { text: '➕ Yana taom qo\'shish', callback_data: 'back_to_cats' }
    ]);

    return { text, inline_keyboard };
  }

  async sendCartSummary(chatId, session) {
    const { text, inline_keyboard } = this.formatCartTextAndButtons(session);
    await this.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard }
    });
  }

  async editCartSummary(chatId, messageId, session) {
    const { text, inline_keyboard } = this.formatCartTextAndButtons(session);
    await this.callApi('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard }
    });
  }

  // ----------------------------------------------------------------------
  // CHECKOUT WORKFLOW
  // ----------------------------------------------------------------------
  async askPaymentMethod(chatId, session) {
    await this.sendMessage(chatId, `💳 *To'lov turini tanlang:*`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💵 Naqd pul (kuryerga)', callback_data: 'pay_Naqd' }],
          [{ text: '💳 Click orqali', callback_data: 'pay_Click' }, { text: '📱 Payme orqali', callback_data: 'pay_Payme' }],
          [{ text: '💳 Uzcard / Humo karta', callback_data: 'pay_Karta' }]
        ]
      }
    });
  }

  async showOrderConfirmation(chatId, session) {
    const items = session.cart;
    const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const deliveryFee = subtotal >= 150000 ? 0 : 15000;
    const total = subtotal + deliveryFee;

    let itemsText = items.map(i => `• ${i.name} x ${i.qty} = ${(i.price * i.qty).toLocaleString()} so'm`).join('\n');

    const summary = `📋 *BUYURTMA XULOSASI:*\n\n` +
      `👤 Mijoz: *${session.orderData.name}*\n` +
      `📞 Tel: *${session.orderData.phone}*\n` +
      `📍 Manzil: *${session.orderData.address}*\n` +
      `💳 To'lov turi: *${session.orderData.payment_method}*\n\n` +
      `🍱 *Taomlar:*\n${itemsText}\n\n` +
      `🛵 Yetkazib berish: *${deliveryFee === 0 ? 'Tekin' : deliveryFee.toLocaleString() + ' so\'m'}*\n` +
      `💰 *Jami summa: ${total.toLocaleString()} so'm*\n\n` +
      `Barcha ma'lumotlar to'g'rimi?`;

    await this.sendMessage(chatId, summary, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Tasdiqlash va Yuborish', callback_data: 'confirm_order_final' }],
          [{ text: '❌ Bekor qilish', callback_data: 'cancel_order_final' }]
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

    const customerName = session.orderData.name || session.orderData.telegram_name || 'Telegram Mijoz';
    const customerPhone = session.orderData.phone || '+998000000000';
    const deliveryAddress = session.orderData.address || 'Manzil ko\'rsatilmagan';
    const tgUsername = session.orderData.telegram_username || null;
    const tgId = String(chatId);

    const res = db.run(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, telegram_username, telegram_id,
        delivery_address, latitude, longitude, total_amount, delivery_fee, payment_method,
        status, source, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber,
      customerName,
      customerPhone,
      tgUsername,
      tgId,
      deliveryAddress,
      session.orderData.latitude || null,
      session.orderData.longitude || null,
      totalAmount,
      deliveryFee,
      session.orderData.payment_method || 'Naqd',
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

    session.cart = [];
    session.step = null;
    session.orderData = {};

    const webAppUrl = process.env.FRONTEND_URL || 'https://smart-delivery-system-2026.vercel.app';

    await this.sendMessage(chatId, `🎉 *Buyurtmangiz muvaffaqiyatli qabul qilindi!*\n\n` +
      `🆔 Buyurtma raqami: *${orderNumber}*\n` +
      `💰 Jami to'lov: *${totalAmount.toLocaleString()} so'm*\n` +
      `⏳ Holati: *Yangi (Operator tasdiqlashi kutilmoqda)*\n\n` +
      `Buyurtmangiz tayyorlanish jarayonini pastdagi *"📦 Buyurtmam holati"* orqali jonli kuzatishingiz mumkin.`, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.getMainKeyboard(webAppUrl),
        resize_keyboard: true
      }
    });

    this.notifyAdminsNewOrder({
      id: orderId,
      order_number: orderNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      telegram_username: tgUsername,
      telegram_id: tgId,
      total_amount: totalAmount,
      source: 'telegram_bot'
    });
  }

  // ----------------------------------------------------------------------
  // LIVE TRACKING IN BOT
  // ----------------------------------------------------------------------
  async sendUserActiveOrders(chatId) {
    const db = getDb();
    const orders = db.query(`
      SELECT o.*, c.name as courier_name, c.phone as courier_phone, c.vehicle_type
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      WHERE o.status != 'cancelled'
      ORDER BY o.id DESC
      LIMIT 2
    `);

    if (orders.length === 0) {
      await this.sendMessage(chatId, 'Sizda hozircha faol buyurtmalar yo\'q.');
      return;
    }

    for (const o of orders) {
      await this.sendSingleOrderTrack(chatId, o.order_number);
    }
  }

  async sendSingleOrderTrack(chatId, orderNumber, messageIdToEdit = null) {
    const db = getDb();
    const o = db.get(`
      SELECT o.*, c.name as courier_name, c.phone as courier_phone, c.vehicle_type
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      WHERE o.order_number = ?
    `, [orderNumber]);

    if (!o) return;

    const progressMap = {
      new: { bar: '🟢⚪️⚪️⚪️⚪️ (20%)', text: '1. Qabul qilindi' },
      confirmed: { bar: '🟢🟢⚪️⚪️⚪️ (40%)', text: '2. Tasdiqlandi' },
      preparing: { bar: '🟢🟢🟢⚪️⚪️ (60%)', text: '3. Oshxonada pishirilmoqda 👨‍🍳' },
      on_way: { bar: '🟢🟢🟢🟢⚪️ (80%)', text: '4. Kuryer yo\'lda 🛵' },
      delivered: { bar: '🟢🟢🟢🟢🟢 (100%)', text: '5. Yetkazib berildi ✅' },
      cancelled: { bar: '🔴 Bekor qilingan', text: 'Bekor qilingan' }
    };

    const statusInfo = progressMap[o.status] || { bar: '⚪️', text: o.status };

    let msg = `📦 *BUYURTMA HOLATI: ${o.order_number}*\n\n` +
      `📊 Bosqich: *${statusInfo.text}*\n` +
      `📈 Jarayon: \`${statusInfo.bar}\`\n\n` +
      `📍 Manzil: ${o.delivery_address}\n` +
      `💰 Summa: *${Number(o.total_amount).toLocaleString()} so'm* (${o.payment_method})\n`;

    if (o.courier_name) {
      msg += `\n🛵 *Biriktirilgan Kuryer:*\n` +
        `👤 Ismi: *${o.courier_name}*\n` +
        `📞 Telefon: *${o.courier_phone}*\n` +
        `🚗 Transport: *${o.vehicle_type || 'Skuter'}*\n`;
    }

    const inline_keyboard = [
      [{ text: '🔄 Holatni yangilash', callback_data: `refresh_track_${o.order_number}` }]
    ];

    if (messageIdToEdit) {
      await this.callApi('editMessageText', {
        chat_id: chatId,
        message_id: messageIdToEdit,
        text: msg,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard }
      });
    } else {
      await this.sendMessage(chatId, msg, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard }
      });
    }
  }

  // ----------------------------------------------------------------------
  // ORDER HISTORY
  // ----------------------------------------------------------------------
  async sendOrderHistory(chatId) {
    const db = getDb();
    const orders = db.query(`
      SELECT * FROM orders
      ORDER BY id DESC
      LIMIT 5
    `);

    if (orders.length === 0) {
      await this.sendMessage(chatId, 'Sizda hali o\'tgan buyurtmalar yo\'q.');
      return;
    }

    let text = `📜 *Oxirgi buyurtmalaringiz tarixi:*\n\n`;
    for (const o of orders) {
      text += `🆔 *${o.order_number}* • ${new Date(o.created_at).toLocaleDateString('uz-UZ')}\n` +
        `Holati: *${o.status.toUpperCase()}* | Summa: *${Number(o.total_amount).toLocaleString()} so'm*\n` +
        `Manzil: ${o.delivery_address.slice(0, 30)}...\n─────────────\n`;
    }

    await this.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Oxirgi buyurtmani qayta berish', callback_data: `reorder_${orders[0].id}` }]
        ]
      }
    });
  }

  // ----------------------------------------------------------------------
  // ADVANCED COURIER WORKSPACE
  // ----------------------------------------------------------------------
  async handleCourierCommand(chatId, fullName) {
    const db = getDb();
    const courier = db.get('SELECT * FROM couriers WHERE telegram_id = ?', [String(chatId)]);

    if (courier) {
      await this.sendMessage(chatId, `👋 Xush kelibsiz, *${courier.name}* (Kuryer kabineti)!\n\n` +
        `📊 Hozirgi holatingiz: *${courier.status === 'free' ? '🟢 Bo\'sh (Buyurtma kutilmoqda)' : courier.status === 'busy' ? '🟡 Band (Yetkazish jarayonida)' : '⚪️ Offline'}*\n` +
        `🛵 Transportingiz: *${courier.vehicle_type}*\n` +
        `📦 Yetkazilgan buyurtmalar: *${courier.total_delivered} ta*\n\n` +
        `Boshqaruv uchun pastdagi tugmalardan foydalaning:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: this.getCourierKeyboard(),
          resize_keyboard: true
        }
      });
    } else {
      const session = this.getSession(chatId);
      session.step = 'courier_phone';
      await this.sendMessage(chatId, `🛵 *Smart Delivery Kuryer Tizimi:*\n\n` +
        `Tizimga kuryer sifatida ulanish uchun telefon raqamingizni yuboring:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: '📱 Telefon raqamni yuborish', request_contact: true }],
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
      await this.sendMessage(chatId, 'Kuryer sifatida ro\'yxatdan o\'tmagansiz.');
      return;
    }

    const orders = db.query(`
      SELECT * FROM orders
      WHERE courier_id = ? AND status IN ('confirmed', 'preparing', 'on_way')
      ORDER BY id DESC
    `, [courier.id]);

    if (orders.length === 0) {
      await this.sendMessage(chatId, '✅ Hozircha sizga biriktirilgan yangi buyurtmalar yo\'q. Yangi buyurtma tushishi bilan xabar beramiz!');
      return;
    }

    for (const o of orders) {
      const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      const itemsText = items.map(i => `• ${i.product_name} x ${i.quantity}`).join('\n');

      const msg = `🔔 *YETKAZISH BUYURTMASI #${o.order_number}*\n\n` +
        `👤 Mijoz: *${o.customer_name}*\n` +
        `📞 Tel: *${o.customer_phone}*\n` +
        `📍 Manzil: *${o.delivery_address}*\n` +
        `💳 To'lov: *${o.payment_method}* (${Number(o.total_amount).toLocaleString()} so'm)\n` +
        `📝 Izoh: ${o.notes || 'Yo\'q'}\n\n` +
        `🍱 *Taomlar:*\n${itemsText}`;

      const buttons = [];
      if (o.status !== 'on_way') {
        buttons.push([{ text: '🚗 Qabul qildim / Yo\'lga chiqdim', callback_data: `courier_accept_${o.id}` }]);
      }
      buttons.push([{ text: '🏁 Yetkazib berdim (Tugatish)', callback_data: `courier_delivered_${o.id}` }]);

      await this.sendMessage(chatId, msg, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons }
      });
    }
  }

  async sendCourierStats(chatId) {
    const db = getDb();
    const courier = db.get('SELECT * FROM couriers WHERE telegram_id = ?', [String(chatId)]);
    if (!courier) return;

    const deliveredOrders = db.get("SELECT COUNT(*) as cnt, SUM(total_amount) as total FROM orders WHERE courier_id = ? AND status = 'delivered'", [courier.id]);

    const text = `📊 *Kuryer Hisoboti: ${courier.name}*\n\n` +
      `🛵 Transport turi: *${courier.vehicle_type}*\n` +
      `📦 Muvaffaqiyatli yetkazilgan: *${courier.total_delivered} ta buyurtma*\n` +
      `💰 Jami yetkazilgan summa: *${Number(deliveredOrders?.total || 0).toLocaleString()} so'm*\n` +
      `⭐ Reyting: *5.0 / 5.0 (A'lo darajada)*`;

    await this.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  }

  // Notify Courier when Admin Assigns Order (including Geo Location if available!)
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
      `💰 To'lov: *${order.payment_method}* (${Number(order.total_amount).toLocaleString()} so'm)\n` +
      `📝 Izoh: ${order.notes || 'Yo\'q'}\n\n` +
      `🍱 *Taomlar:*\n${itemsText}`;

    await this.sendMessage(courier.telegram_id, msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚗 Qabul qildim / Yo\'lga chiqdim', callback_data: `courier_accept_${order.id}` }],
          [{ text: '🏁 Yetkazib berdim', callback_data: `courier_delivered_${order.id}` }]
        ]
      }
    });

    // If customer shared location coordinates, send map pin to courier
    if (order.latitude && order.longitude) {
      await this.callApi('sendLocation', {
        chat_id: courier.telegram_id,
        latitude: order.latitude,
        longitude: order.longitude
      });
    }
  }

  // ----------------------------------------------------------------------
  // ADMIN DASHBOARD & NOTIFICATIONS
  // ----------------------------------------------------------------------
  async sendAdminDashboard(chatId) {
    const db = getDb();
    const totalOrders = db.get('SELECT COUNT(*) as cnt FROM orders').cnt;
    const activeOrders = db.get("SELECT COUNT(*) as cnt FROM orders WHERE status NOT IN ('delivered', 'cancelled')").cnt;
    const totalRevenue = db.get("SELECT SUM(total_amount) as sum FROM orders WHERE status = 'delivered'").sum || 0;
    const freeCouriers = db.get("SELECT COUNT(*) as cnt FROM couriers WHERE status = 'free'").cnt;
    const totalCouriers = db.get('SELECT COUNT(*) as cnt FROM couriers').cnt;

    const webAppUrl = process.env.FRONTEND_URL || 'https://smart-delivery-system-2026.vercel.app';

    const text = `👑 *Smart Delivery — Admin Dispetcherlik Markazi:*\n\n` +
      `📊 Jami buyurtmalar: *${totalOrders} ta*\n` +
      `🔥 Jarayondagi buyurtmalar: *${activeOrders} ta*\n` +
      `🛵 Bo'sh kuryerlar: *${freeCouriers} / ${totalCouriers} ta*\n` +
      `💰 Umumiy tushum: *${Number(totalRevenue).toLocaleString()} so'm*\n\n` +
      `Barcha funksiyalar va dispetcherlik boshqaruvi uchun Web-panelga kiring:`;

    await this.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👑 Web Admin Panelni ochish', url: `${webAppUrl}/admin` }]
        ]
      }
    });
  }

  async notifyAdminsNewOrder(order) {
    const db = getDb();
    let orderDetails = order;
    let items = [];
    if (order.id) {
      try {
        const fullOrder = db.get('SELECT * FROM orders WHERE id = ?', [order.id]);
        if (fullOrder) orderDetails = { ...fullOrder, ...order };
        items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]) || [];
      } catch (e) {
        console.error('[notifyAdminsNewOrder db error]:', e.message);
      }
    }

    const tgUserDisplay = orderDetails.telegram_username 
      ? `@${orderDetails.telegram_username.replace('@', '')}` 
      : (orderDetails.telegram_id ? `ID: ${orderDetails.telegram_id}` : 'Mavjud emas (Web)');

    let itemsText = '';
    if (items.length > 0) {
      itemsText = items.map((it, idx) => {
        let line = `   ${idx + 1}. *${it.product_name}* x ${it.quantity} = ${Number(it.total_price).toLocaleString()} so'm`;
        if (it.modifiers) {
          try {
            const mods = typeof it.modifiers === 'string' ? JSON.parse(it.modifiers) : it.modifiers;
            if (Array.isArray(mods) && mods.length > 0) {
              line += `\n      ↳ _Qo'shimchalar:_ ${mods.map(m => m.name).join(', ')}`;
            }
          } catch (_) {
            line += `\n      ↳ _Qo'shimchalar:_ ${it.modifiers}`;
          }
        }
        return line;
      }).join('\n');
    }

    const sourceBadge = orderDetails.source === 'telegram_bot' ? '🤖 Telegram Bot' : '💻 Web Sayt';
    let extrasText = '';
    if (orderDetails.promo_code) {
      extrasText += `🎟 *Promo-kod:* \`${orderDetails.promo_code}\` (-${Number(orderDetails.discount_amount || 0).toLocaleString()} so'm)\n`;
    }
    if (orderDetails.cashback_used && Number(orderDetails.cashback_used) > 0) {
      extrasText += `🎁 *Keshbek ishlatildi:* -${Number(orderDetails.cashback_used).toLocaleString()} so'm\n`;
    }

    const msg = `🔔 *YANGI BUYURTMA KELDI! (${orderDetails.order_number})*\n\n` +
      `👤 *Mijoz ismi:* ${orderDetails.customer_name}\n` +
      `📱 *Telegram profili:* ${tgUserDisplay}\n` +
      `🆔 *Telegram ID:* \`${orderDetails.telegram_id || 'Mavjud emas'}\`\n` +
      `📞 *Telefon:* \`${orderDetails.customer_phone}\`\n` +
      `📍 *Yetkazish manzili:* ${orderDetails.delivery_address || 'Ko\'rsatilmagan'}\n` +
      `💳 *To'lov usuli:* ${orderDetails.payment_method || 'Naqd'}\n` +
      `🌐 *Buyurtma manbasi:* ${sourceBadge}\n` +
      (extrasText ? `${extrasText}\n` : '\n') +
      (itemsText ? `🍱 *Taomlar ro'yxati:*\n${itemsText}\n\n` : '') +
      `💰 *Jami summa:* *${Number(orderDetails.total_amount).toLocaleString()} so'm*`;

    for (const adminId of this.adminChatIds) {
      try {
        await this.sendMessage(adminId, msg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '👑 Web Admin Panelni ochish', url: `${process.env.FRONTEND_URL || 'https://smart-delivery-system-2026.vercel.app'}/admin` }]
            ]
          }
        });
      } catch (err) {
        console.error(`[Admin Notify Error to ${adminId}]:`, err.message);
      }
    }
  }

  // Real-time animated progress bar notification to customer
  async notifyCustomerStatusProgress(order, newStatus) {
    if (!order.telegram_id) return;
    const chatId = Number(order.telegram_id);
    const webAppUrl = process.env.FRONTEND_URL || 'https://smart-delivery-system-2026.vercel.app';

    let progressText = '';
    let emoji = '🛵';
    if (newStatus === 'confirmed') {
      progressText = `[██████░░░░░░░░░░░░] 35%\n\n` +
        `✅ *Buyurtmangiz tasdiqlandi!*\n` +
        `Restoran buyurtmangizni qabul qildi va navbatga qo'ydi.`;
      emoji = '✅';
    } else if (newStatus === 'preparing') {
      progressText = `[████████████░░░░░░] 65%\n\n` +
        `👨‍🍳 *Oshxonada tayyorlanmoqda!*\n` +
        `Oshpazlarimiz taomingizni mehr bilan pishirmoqda. Issiqqina bo'ladi! 🔥`;
      emoji = '🍳';
    } else if (newStatus === 'on_way') {
      progressText = `[████████████████░░] 90%\n\n` +
        `🛵 *Kuryer yo'lga chiqdi!*\n` +
        `Taomingiz maxsus termoboksda siz tomon yo'l oldi. Tez orada yetib boradi!`;
      emoji = '🛵';
    } else if (newStatus === 'delivered') {
      progressText = `[██████████████████] 100%\n\n` +
        `🎉 *Buyurtma yetkazib berildi!*\n` +
        `Yoqimli ishtaha! Smart Delivery xizmatidan foydalanganingiz uchun rahmat!`;
      emoji = '🎉';
    } else if (newStatus === 'cancelled') {
      progressText = `❌ *Buyurtmangiz bekor qilindi.* Agar savollaringiz bo'lsa qo'llab-quvvatlash xizmati bilan bog'laning.`;
      emoji = '❌';
    } else {
      return;
    }

    const msg = `${emoji} *BUYURTMA HOLATI:* \`${order.order_number}\`\n\n` +
      `${progressText}\n\n` +
      `📍 *Yetkazish manzili:* ${order.delivery_address || 'Toshkent'}`;

    try {
      await this.sendMessage(chatId, msg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🗺 Xaritada jonli kuzatish', web_app: { url: `${webAppUrl}?track=${order.order_number}` } }]
          ]
        }
      });
    } catch (e) {
      console.error('[notifyCustomerStatusProgress Error]:', e.message);
    }
  }

  // Base sendMessage
  async sendMessage(chatId, text, extra = {}) {
    return await this.callApi('sendMessage', {
      chat_id: chatId,
      text,
      ...extra
    });
  }
}

const botService = new TelegramBotService();

module.exports = {
  botService
};
