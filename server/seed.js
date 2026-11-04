const { getDb } = require('./database');

function seedDatabase(force = false) {
  const db = getDb();

  const categoriesCount = db.get('SELECT COUNT(*) as cnt FROM categories').cnt;
  const productsCount = db.get('SELECT COUNT(*) as cnt FROM products').cnt;
  const couriersCount = db.get('SELECT COUNT(*) as cnt FROM couriers').cnt;

  if (!force && categoriesCount >= 4 && productsCount >= 12 && couriersCount >= 3) {
    console.log('[SEED] Ma\'lumotlar bazasi allaqachon to\'ldirilgan.');
    return;
  }

  console.log('[SEED] Boshlang\'ich ma\'lumotlar kiritilmoqda...');

  if (force) {
    db.run('DELETE FROM order_items');
    db.run('DELETE FROM orders');
    db.run('DELETE FROM products');
    db.run('DELETE FROM categories');
    db.run('DELETE FROM couriers');
    db.run('DELETE FROM users');
  }

  // 1. Kategoriyalar
  const categories = [
    { name: 'Fast Food', icon: '🍔', sort_order: 1 },
    { name: 'Milliy taomlar', icon: '🍲', sort_order: 2 },
    { name: 'Ichimliklar', icon: '🥤', sort_order: 3 },
    { name: 'Shirinliklar', icon: '🍰', sort_order: 4 },
    { name: 'Salatlar & Gazaklar', icon: '🥗', sort_order: 5 }
  ];

  for (const cat of categories) {
    const existing = db.get('SELECT id FROM categories WHERE name = ?', [cat.name]);
    if (!existing) {
      db.run('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)', [cat.name, cat.icon, cat.sort_order]);
    }
  }

  const catFastFood = db.get('SELECT id FROM categories WHERE name = ?', ['Fast Food']).id;
  const catNational = db.get('SELECT id FROM categories WHERE name = ?', ['Milliy taomlar']).id;
  const catDrinks = db.get('SELECT id FROM categories WHERE name = ?', ['Ichimliklar']).id;
  const catDesserts = db.get('SELECT id FROM categories WHERE name = ?', ['Shirinliklar']).id;
  const catSalads = db.get('SELECT id FROM categories WHERE name = ?', ['Salatlar & Gazaklar'])?.id || catFastFood;

  // 2. Mahsulotlar (kamida 12 ta sifatli taom)
  const products = [
    // Fast Food
    {
      category_id: catFastFood,
      name: 'Smart Burger Max',
      description: 'Shirali mol go\'shti kotleti, erigan cheddr pishlog\'i, yangi pomidor, karam bargi va mualliflik sousi bilan maxsus qora nonda.',
      price: 48000,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 15,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Crispy Chicken Burger',
      description: 'Qarsildoq tovuq filesi, aysberg salat bargi, tuzlangan bodring va sarimsoqli mayonez sousi bilan.',
      price: 42000,
      image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 12,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Pizza Pepperoni XL (33sm)',
      description: 'Haqiqiy italiya xamiri, motsarella pishlog\'i, achchiq pepperoni kalbasasi va oregano ziravori.',
      price: 78000,
      image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 20,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Oltin Kartoshka Fri & Sous',
      description: 'Tilla rangda qovurilgan qarsildoq fri, dengiz tuzi va ketchup hamda pishloqli sous bilan birga.',
      price: 22000,
      image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 10,
      is_available: 1
    },

    // Milliy taomlar
    {
      category_id: catNational,
      name: 'Samarqandcha To\'y Oshi',
      description: 'Dasturxon ko\'rki bo\'lgan to\'y oshi: lazer guruch, sara qo\'y go\'shti, sariq sabzi, noxat va mayiz bilan.',
      price: 55000,
      image_url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 25,
      is_available: 1
    },
    {
      category_id: catNational,
      name: 'Tandir Somsa (3 dona)',
      description: 'Qatlama xamirdan tandirda pishirilgan mayin mol go\'shti va dumba yog\'li milliy somsa.',
      price: 36000,
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 15,
      is_available: 1
    },
    {
      category_id: catNational,
      name: 'Maxsus Qozon Kabob',
      description: 'Qozonda tillarang qilib pishirilgan qo\'y go\'shti va qovurilgan kartoshkalar, yangi piyoz va ko\'katlar bilan.',
      price: 69000,
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 30,
      is_available: 1
    },
    {
      category_id: catNational,
      name: 'Uyg\'urcha Cho\'zma Lag\'mon',
      description: 'Qo\'lda cho\'zilgan mayin xamir, shirali mol go\'shti va yangi sabzavotlar (bolgar qalampiri, selderey, sarimsoq) bilan mazali say.',
      price: 46000,
      image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 20,
      is_available: 1
    },

    // Ichimliklar
    {
      category_id: catDrinks,
      name: 'Yangi Siqilgan Apelsin Sharbati (Fresh)',
      description: '100% tabiiy, shakar qo\'shilmagan sovutilgan apelsin sharbati, 0.4L.',
      price: 28000,
      image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 5,
      is_available: 1
    },
    {
      category_id: catDrinks,
      name: 'Klassik Yalpizli Moxito (Mojito)',
      description: 'Yalpiz barglari, laym bo\'lagi, qamish shakari va gazlangan salqin ichimlik muz bilan.',
      price: 24000,
      image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 5,
      is_available: 1
    },
    {
      category_id: catDrinks,
      name: 'Coca-Cola Classic 0.5L (Muzdek)',
      description: 'Klassik sovuq gazlangan ichimlik.',
      price: 12000,
      image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 2,
      is_available: 1
    },

    // Shirinliklar
    {
      category_id: catDesserts,
      name: 'San Sebastian Cheesecake',
      description: 'Kremdek mayin, yengil qizargan qobiqli mashhur ispan pishloqli deserti, issiq shokoladli ganash bilan.',
      price: 38000,
      image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 10,
      is_available: 1
    },
    {
      category_id: catDesserts,
      name: 'Issiq Shokoladli Fondant',
      description: 'Ichidan oqib chiquvchi issiq belgiyalik shokolad va yonida sovuq vanilli plombir muzqaymoq.',
      price: 35000,
      image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 15,
      is_available: 1
    },

    // Salatlar
    {
      category_id: catSalads,
      name: 'Tovuqli Sezar Salati',
      description: 'Grilda pishirilgan tovuq filesi, aysberg, cherri pomidorlari, parmezan pishlog\'i va suxariklar.',
      price: 39000,
      image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 12,
      is_available: 1
    }
  ];

  for (const p of products) {
    const existing = db.get('SELECT id FROM products WHERE name = ?', [p.name]);
    if (!existing) {
      db.run(`
        INSERT INTO products (category_id, name, description, price, image_url, prep_time_min, is_available)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [p.category_id, p.name, p.description, p.price, p.image_url, p.prep_time_min, p.is_available]);
    }
  }

  // 3. Kuryerlar (kamida 3 ta)
  const couriers = [
    {
      name: 'Jasur Aliyev',
      phone: '+998901234567',
      telegram_id: '501234567',
      vehicle_type: 'Skuter',
      status: 'free',
      active_orders_count: 0,
      total_delivered: 124
    },
    {
      name: 'Bobur Karimov',
      phone: '+998939876543',
      telegram_id: '509876543',
      vehicle_type: 'Avtomobil',
      status: 'free',
      active_orders_count: 0,
      total_delivered: 89
    },
    {
      name: 'Sardor Rustamov',
      phone: '+998971112233',
      telegram_id: '501112233',
      vehicle_type: 'Velosiped',
      status: 'free',
      active_orders_count: 0,
      total_delivered: 45
    }
  ];

  for (const c of couriers) {
    const existing = db.get('SELECT id FROM couriers WHERE phone = ?', [c.phone]);
    if (!existing) {
      db.run(`
        INSERT INTO couriers (name, phone, telegram_id, vehicle_type, status, active_orders_count, total_delivered)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [c.name, c.phone, c.telegram_id, c.vehicle_type, c.status, c.active_orders_count, c.total_delivered]);
    }
  }

  // 4. Test Buyurtma
  const ordersCount = db.get('SELECT COUNT(*) as cnt FROM orders').cnt;
  if (ordersCount === 0) {
    const courier = db.get('SELECT id FROM couriers LIMIT 1');
    const orderNum = '#SD-1001';
    const orderRes = db.run(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, delivery_address,
        latitude, longitude, courier_id, total_amount, delivery_fee,
        payment_method, status, source, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNum,
      'Alisher Usmonov',
      '+998901112233',
      'Toshkent sh., Chilonzor 9-mavze, 14-uy, 28-xonadon',
      41.2858,
      69.2035,
      courier ? courier.id : null,
      94000,
      15000,
      'Click',
      'preparing',
      'web',
      'Domofon kodi: 28'
    ]);

    const burger = db.get('SELECT id, name, price FROM products WHERE name LIKE ? LIMIT 1', ['%Burger%']);
    const fri = db.get('SELECT id, name, price FROM products WHERE name LIKE ? LIMIT 1', ['%Fri%']);

    if (burger) {
      db.run(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [orderRes.lastInsertRowid, burger.id, burger.name, 1, burger.price, burger.price]);
    }
    if (fri) {
      db.run(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [orderRes.lastInsertRowid, fri.id, fri.name, 1, fri.price, fri.price]);
    }

    // Ikkinchi test buyurtma (Telegram bot orqali tushgan)
    const orderNum2 = '#SD-1002';
    const orderRes2 = db.run(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, delivery_address,
        latitude, longitude, courier_id, total_amount, delivery_fee,
        payment_method, status, source, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNum2,
      'Madina Rahimova',
      '+998998887766',
      'Toshkent sh., Yunusobod 4-mavze, 12-uy',
      41.3644,
      69.2880,
      null,
      55000,
      15000,
      'Naqd',
      'new',
      'telegram_bot',
      'Iltimos, salfetkalar ko\'proq bo\'lsin'
    ]);

    const osh = db.get('SELECT id, name, price FROM products WHERE name LIKE ? LIMIT 1', ['%Osh%']);
    if (osh) {
      db.run(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [orderRes2.lastInsertRowid, osh.id, osh.name, 1, osh.price, osh.price]);
    }
  }

  console.log('[SEED] Muvaffaqiyatli yakunlandi! Jami kategoriyalar:', db.get('SELECT COUNT(*) as cnt FROM categories').cnt);
  console.log('[SEED] Jami mahsulotlar:', db.get('SELECT COUNT(*) as cnt FROM products').cnt);
  console.log('[SEED] Jami kuryerlar:', db.get('SELECT COUNT(*) as cnt FROM couriers').cnt);
  console.log('[SEED] Jami buyurtmalar:', db.get('SELECT COUNT(*) as cnt FROM orders').cnt);
}

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase };
