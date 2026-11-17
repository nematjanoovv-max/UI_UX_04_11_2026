const { getDb } = require('./database');

function seedDatabase(force = false) {
  const db = getDb();

  const categoriesCount = db.get('SELECT COUNT(*) as cnt FROM categories').cnt;
  const productsCount = db.get('SELECT COUNT(*) as cnt FROM products').cnt;
  const couriersCount = db.get('SELECT COUNT(*) as cnt FROM couriers').cnt;

  if (!force && categoriesCount >= 5 && productsCount >= 34 && couriersCount >= 3) {
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

  // 2. Mahsulotlar (kamida 34 ta sara taom)
  const products = [
    // --- FAST FOOD: 6 KFC, 6 Gamburger, 6 Lavash, 6 Hotdog (+ Pizza & Fri) ---

    // 1. KFC & Tovuq (6 dona)
    {
      category_id: catFastFood,
      name: 'KFC Qarsildoq Qanotlar (Hot Wings)',
      description: 'Sirli 11 xil ziravor bilan o\'ta qarsildoq qilib qovurilgan achchiq tovuq qanotlari (6 dona), sarimsoqli sous bilan.',
      price: 38000,
      image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 12,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'KFC Tovuq Strips (Crispy Strips)',
      description: 'Yumshoq tovuq lahm filesidan tayyorlangan oltinrang qarsildoq stripslar (5 dona), shirin-nordon sous bilan birga.',
      price: 36000,
      image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 10,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'KFC Original Basket (Family Bucket)',
      description: 'Katta oilaviy basket to\'plam: 8 dona qarsildoq tovuq bo\'laklari, katta porsiya fri va 2 xil mualliflik sousi.',
      price: 85000,
      image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 18,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'KFC Tovuqli Zinger Burger',
      description: 'Qarsildoq achchiq tovuq filesi, yangi aysberg salat bargi, marinadlangan bodring va maxsus zinger sous.',
      price: 42000,
      image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 12,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'KFC Qarsildoq Oyoqchalar (Drumsticks 4 dona)',
      description: 'Oltinrang qarsildoq maxsus qobiqda qovurilgan mayin tovuq oyoqchalari (4 dona), xushbo\'y sarimsoqli sous bilan.',
      price: 45000,
      image_url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 14,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'KFC Box Master Tovuqli Tvister',
      description: 'Qarsildoq tovuq stripslari, erigan pishloq, yangi pomidor va aysberg bargi bilan o\'ralgan maxsus KFC tvister lavashi.',
      price: 34000,
      image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 10,
      is_available: 1
    },

    // 2. Gamburger (6 dona)
    {
      category_id: catFastFood,
      name: 'Smart Burger Max (Dabl Bifshteks)',
      description: 'Shirali mol go\'shti kotleti, erigan cheddar pishlog\'i, yangi pomidor, karam bargi va mualliflik sousi bilan.',
      price: 48000,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 15,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Klassik Chizburger Cheddar',
      description: 'Ikki qavat erigan haqiqiy cheddar pishlog\'i, mayin mol go\'shti kotleti, xantal va maxsus burger sousi bilan.',
      price: 38000,
      image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 12,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Barbeque Smokey Bifshteks Burger',
      description: 'Grilda pishirilgan mol go\'shti kotleti, karamellangan piyoz, dudlangan bekon va quyuq xushbo\'y BBQ sous.',
      price: 52000,
      image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 15,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Maxsus Truffle Bifshteks Burger',
      description: 'Premium qora non, marmar mol go\'shti kotleti, truffle xushbo\'y moyi, yangi rukola va parmezan pishlog\'i bilan.',
      price: 62000,
      image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 16,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Dabl Bacon Monster Burger',
      description: 'Ikkita qalin shirali go\'sht kotleti, qovurilgan bekon, erigan ikki qavat cheddar va dudlangan sous.',
      price: 58000,
      image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 16,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Chili Halapenyo Olovli Burger',
      description: 'Gril mol go\'shti, achchiq chili qaylasi, achchiq halapenyo bo\'laklari, qizil piyoz va erigan pishloq bilan o\'tkir ta\'m.',
      price: 44000,
      image_url: 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3a99?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 12,
      is_available: 1
    },

    // 3. Lavash (6 dona)
    {
      category_id: catFastFood,
      name: 'Klassik Mol Go\'shtli Lavash',
      description: 'Yupqa xamirda marinadlangan mayin mol go\'shti bo\'laklari, yangi pomidor, bodring, fri va oq sarimsoqli sous.',
      price: 35000,
      image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 10,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Tovuqli Pishloqli Lavash',
      description: 'Grilda pishirilgan tovuq filesi, mo\'l erigan motsarella va cheddar pishlog\'i, yangi ko\'katlar va mayin sous.',
      price: 33000,
      image_url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 10,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Tandir Lavash Speshal',
      description: 'Tandir pechida qovurilgan maxsus xamir, dudlangan sara go\'sht, qizil piyoz va maxsus pomidorli achchiq sous.',
      price: 39000,
      image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 14,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Mini Shaurma Lavash (2 dona)',
      description: 'Qarsildoq ikki dona mini lavash, marinadlangan tovuq go\'shti, mayda karam salati va klassik sharqona sous.',
      price: 30000,
      image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 8,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Maxsus Dabl Pishloqli Lavash XL',
      description: 'Ikki barobar ko\'p motsarella va gouda pishlog\'i, nozik mol go\'shti, bodring va qarsildoq fri bilan to\'yimli XL lavash.',
      price: 42000,
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 12,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Achchiq Doner Lavash Halapenyo bilan',
      description: 'Olovli achchiq sous, lahm go\'sht bo\'laklari, yangi pomidor va achchiq qalampir bilan doner uslubidagi lavash.',
      price: 37000,
      image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 10,
      is_available: 1
    },

    // 4. Hotdog (6 dona)
    {
      category_id: catFastFood,
      name: 'Klassik Daniya Hot-Dog',
      description: 'Yumshoq bug\'da pishgan bulochka, gril mol sosiskasi, qarsildoq qovurilgan piyoz, ketchunez va ditskaya xantal.',
      price: 24000,
      image_url: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 8,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Frantsuzcha Pishloqli Baget Hot-Dog',
      description: 'Qarsildoq frantsuzcha baget nonda pishloqli dudlangan sosiska, erigan cheddar sousi va yangi ziravorlar.',
      price: 28000,
      image_url: 'https://images.unsplash.com/photo-1626082895617-2c6de34f6af3?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 10,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Dabl Sosiskali Grill Hot-Dog',
      description: 'Ikkita yirik dudlangan sosiska, marinadlangan tuzlangan bodring, aysberg va ikki xil sous bilan to\'yimli porsiya.',
      price: 32000,
      image_url: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 10,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Chili Halapenyo Achchiq Hot-Dog',
      description: 'Achchiq olovli chili sosiskasi, achchiq halapenyo bo\'laklari, meksikancha sous va qizil piyoz bilan o\'tkir ta\'m.',
      price: 29000,
      image_url: 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 9,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Bavarcha Ovchi Sosiskali Hot-Dog',
      description: 'Haqiqiy bavarcha dudlangan ovchi sosiskasi, donador xantal, tuzlangan bodring va qarsildoq piyoz.',
      price: 31000,
      image_url: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 9,
      is_available: 1
    },
    {
      category_id: catFastFood,
      name: 'Katta Pishloqli Hot-Dog Jumbo XL',
      description: 'Maxsus katta uzun bulochka, shirali mol sosiskasi, ustidan quyilgan qaynoq erigan cheddar pishloq sousi.',
      price: 34000,
      image_url: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=600&auto=format&fit=crop&q=80',
      prep_time_min: 10,
      is_available: 1
    },

    // Qo'shimcha Fast Food klassiklari
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
      image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
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

  // Eski almashtirilgan nomlarni tozalash
  try {
    db.run("DELETE FROM products WHERE name = 'Crispy Chicken Burger'");
  } catch (_) {}

  for (const p of products) {
    const existing = db.get('SELECT id FROM products WHERE name = ?', [p.name]);
    if (!existing) {
      db.run(`
        INSERT INTO products (category_id, name, description, price, image_url, prep_time_min, is_available)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [p.category_id, p.name, p.description, p.price, p.image_url, p.prep_time_min, p.is_available]);
    } else {
      db.run(`
        UPDATE products 
        SET category_id = ?, description = ?, price = ?, image_url = ?, prep_time_min = ?, is_available = ?
        WHERE id = ?
      `, [p.category_id, p.description, p.price, p.image_url, p.prep_time_min, p.is_available, existing.id]);
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

  // 5. Promo-kodlar
  const defaultPromos = [
    { code: 'SMART2026', discount_percent: 20, discount_amount: 0, min_order_amount: 50000 },
    { code: 'BEPUL', discount_percent: 0, discount_amount: 15000, min_order_amount: 40000 },
    { code: 'MAZALI', discount_percent: 10, discount_amount: 0, min_order_amount: 30000 }
  ];

  for (const pr of defaultPromos) {
    const existing = db.get('SELECT id FROM promocodes WHERE code = ?', [pr.code]);
    if (!existing) {
      db.run(`
        INSERT INTO promocodes (code, discount_percent, discount_amount, min_order_amount, is_active, usage_count)
        VALUES (?, ?, ?, ?, 1, 0)
      `, [pr.code, pr.discount_percent, pr.discount_amount, pr.min_order_amount]);
    }
  }

  // 6. Sharhlar va reytinglar (Reviews)
  const existingReviews = db.get('SELECT COUNT(*) as cnt FROM reviews').cnt;
  if (existingReviews === 0) {
    const courier = db.get('SELECT id FROM couriers LIMIT 1');
    const order = db.get('SELECT id FROM orders LIMIT 1');
    if (order && courier) {
      db.run(`
        INSERT INTO reviews (order_id, courier_id, customer_name, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `, [order.id, courier.id, 'Alisher Usmonov', 5, 'Juda tez yetkazildi, taomlar qaynoq va mazali ekan! Rahmat!']);
      db.run(`
        INSERT INTO reviews (order_id, courier_id, customer_name, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `, [order.id, courier.id, 'Madina Karimova', 5, 'Kuryer juda muloyim, 20 daqiqada yetib keldi. 10/10!']);
    }
  }

  // 7. Mahsulot modifikatorlarini yangilash (Modifiers)
  try {
    const burgerMods = JSON.stringify([
      { id: 'cheese', name: "Qo'shimcha pishloq (Cheddar)", price: 5000 },
      { id: 'sauce', name: 'Maxsus achchiq sous', price: 3000 },
      { id: 'double_meat', name: "Qo'shimcha go'sht kotleti", price: 14000 }
    ]);
    const kfcMods = JSON.stringify([
      { id: 'kfc_spicy', name: "Ekstra achchiq sous (Hot BBQ)", price: 3000 },
      { id: 'kfc_cheese', name: "Erigan pishloqli dip sous", price: 5000 },
      { id: 'kfc_garlic', name: "Sarimsoqli oq sous (Garlic)", price: 3000 }
    ]);
    const lavashMods = JSON.stringify([
      { id: 'lavash_extra_cheese', name: "Qo'shimcha pishloq (Motsarella)", price: 5000 },
      { id: 'lavash_jalapeno', name: "Achchiq halapenyo qalampiri", price: 3000 },
      { id: 'lavash_extra_meat', name: "Qo'shimcha go'sht (50g)", price: 10000 }
    ]);
    const hotdogMods = JSON.stringify([
      { id: 'hotdog_jalapeno', name: "Halapenyo achchiq qalampir", price: 3000 },
      { id: 'hotdog_crispy_onion', name: "Qo'shimcha qarsildoq piyoz", price: 2000 },
      { id: 'hotdog_melted_cheese', name: "Erigan cheddar pishloq", price: 4000 }
    ]);
    const pizzaMods = JSON.stringify([
      { id: 'extra_cheese', name: "Qo'shimcha Motsarella", price: 8000 },
      { id: 'jalapeno', name: 'Halapenyo achchiq qalampir', price: 4000 },
      { id: 'cheese_crust', name: 'Pishloqli qobiq', price: 12000 }
    ]);
    const oshMods = JSON.stringify([
      { id: 'kazi', name: "Qo'shimcha Qazi (3 bo'lak)", price: 12000 },
      { id: 'quail_egg', name: 'Bedana tuxumi (2 dona)', price: 4000 }
    ]);
    const drinkMods = JSON.stringify([
      { id: 'size_1l', name: 'Katta hajm (1.0 Litr)', price: 6000 },
      { id: 'ice', name: 'Qo\'shimcha muz solish', price: 0 }
    ]);
    const dessertMods = JSON.stringify([
      { id: 'choco_ganache', name: 'Issiq shokoladli ganash', price: 5000 },
      { id: 'icecream_scoop', name: 'Vanilli muzqaymoq', price: 6000 }
    ]);

    db.run("UPDATE products SET modifiers = ? WHERE name LIKE '%Burger%'", [burgerMods]);
    db.run("UPDATE products SET modifiers = ? WHERE name LIKE '%KFC%'", [kfcMods]);
    db.run("UPDATE products SET modifiers = ? WHERE name LIKE '%Lavash%' OR name LIKE '%Shaurma%'", [lavashMods]);
    db.run("UPDATE products SET modifiers = ? WHERE name LIKE '%Hot-Dog%' OR name LIKE '%Hotdog%'", [hotdogMods]);
    db.run("UPDATE products SET modifiers = ? WHERE name LIKE '%Pizza%'", [pizzaMods]);
    db.run("UPDATE products SET modifiers = ? WHERE name LIKE '%Osh%' OR name LIKE '%Kabob%'", [oshMods]);
    db.run("UPDATE products SET modifiers = ? WHERE name LIKE '%Cola%' OR name LIKE '%Moxito%' OR name LIKE '%Sharbat%'", [drinkMods]);
    db.run("UPDATE products SET modifiers = ? WHERE name LIKE '%Cheesecake%' OR name LIKE '%Fondant%'", [dessertMods]);
  } catch (_) {}

  console.log('[SEED] Muvaffaqiyatli yakunlandi! Jami kategoriyalar:', db.get('SELECT COUNT(*) as cnt FROM categories').cnt);
  console.log('[SEED] Jami mahsulotlar:', db.get('SELECT COUNT(*) as cnt FROM products').cnt);
  console.log('[SEED] Jami kuryerlar:', db.get('SELECT COUNT(*) as cnt FROM couriers').cnt);
  console.log('[SEED] Jami buyurtmalar:', db.get('SELECT COUNT(*) as cnt FROM orders').cnt);
}

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase };
