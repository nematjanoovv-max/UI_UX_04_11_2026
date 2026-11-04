const path = require('path');
const fs = require('fs');

// We use Node.js built-in node:sqlite (available in Node 22+)
// or a lightweight pure JS fallback if running on older nodes without native addons.
let dbInstance = null;

let dbFilePath = process.env.DATABASE_FILE;
if (!dbFilePath) {
  if (process.env.VERCEL) {
    dbFilePath = path.join('/tmp', 'smart_delivery.sqlite');
  } else {
    dbFilePath = path.join(__dirname, 'smart_delivery.sqlite');
  }
}

function initDatabase() {
  let sqliteModule;
  try {
    sqliteModule = require('node:sqlite');
  } catch (err) {
    console.warn('[DB] node:sqlite not available, falling back to memory/file storage', err.message);
  }

  if (sqliteModule && sqliteModule.DatabaseSync) {
    const { DatabaseSync } = sqliteModule;
    const db = new DatabaseSync(dbFilePath);
    
    // Enable WAL mode and foreign keys for high performance
    db.exec(`PRAGMA journal_mode = WAL;`);
    db.exec(`PRAGMA foreign_keys = ON;`);

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE,
        full_name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'client',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT,
        sort_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        prep_time_min INTEGER DEFAULT 15,
        is_available INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS couriers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        telegram_id TEXT UNIQUE,
        vehicle_type TEXT DEFAULT 'Skuter',
        status TEXT DEFAULT 'free',
        active_orders_count INTEGER DEFAULT 0,
        total_delivered INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        telegram_username TEXT,
        telegram_id TEXT,
        delivery_address TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        courier_id INTEGER REFERENCES couriers(id) ON DELETE SET NULL,
        total_amount REAL NOT NULL,
        delivery_fee REAL DEFAULT 15000,
        payment_method TEXT DEFAULT 'Naqd',
        status TEXT DEFAULT 'new',
        source TEXT DEFAULT 'web',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL
      );
    `);

    // Safe migrations for new columns
    try { db.exec('ALTER TABLE orders ADD COLUMN telegram_username TEXT;'); } catch (_) {}
    try { db.exec('ALTER TABLE orders ADD COLUMN telegram_id TEXT;'); } catch (_) {}
    try { db.exec("ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'uz';"); } catch (_) {}

    // Wrapper helper methods to make queries uniform
    return {
      exec: (sql) => db.exec(sql),
      query: (sql, params = []) => {
        const stmt = db.prepare(sql);
        return stmt.all(...params);
      },
      get: (sql, params = []) => {
        const stmt = db.prepare(sql);
        return stmt.get(...params);
      },
      run: (sql, params = []) => {
        const stmt = db.prepare(sql);
        const result = stmt.run(...params);
        return {
          lastInsertRowid: result.lastInsertRowid !== undefined ? Number(result.lastInsertRowid) : null,
          changes: result.changes
        };
      }
    };
  }

  // Pure JS file-based fallback database if node:sqlite is unavailable on host
  console.log('[DB] Using universal persistent file storage fallback.');
  return createFallbackDatabase(dbFilePath);
}

function createFallbackDatabase(filePath) {
  let data = {
    users: [],
    categories: [],
    products: [],
    couriers: [],
    orders: [],
    order_items: [],
    _seq: { users: 0, categories: 0, products: 0, couriers: 0, orders: 0, order_items: 0 }
  };

  const actualPath = filePath.replace(/\.sqlite.*/, '.json');

  const save = () => {
    try {
      fs.writeFileSync(actualPath, JSON.stringify(data, null, 2));
    } catch (_) {}
  };

  if (fs.existsSync(actualPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(actualPath, 'utf8'));
      data = { ...data, ...parsed };
    } catch (_) {}
  }

  return {
    exec: () => true,
    query: (sql, params = []) => {
      const lower = sql.toLowerCase();
      let table = ['order_items', 'orders', 'products', 'categories', 'couriers', 'users'].find(t => lower.includes(t)) || 'products';
      let rows = [...(data[table] || [])];

      if (lower.includes('where')) {
        if (table === 'orders' && lower.includes('courier_id = ?')) {
          rows = rows.filter(r => Number(r.courier_id) === Number(params[0]));
        } else if (table === 'products' && lower.includes('category_id = ?')) {
          rows = rows.filter(r => Number(r.category_id) === Number(params[0]));
        } else if (table === 'order_items' && lower.includes('order_id = ?')) {
          rows = rows.filter(r => Number(r.order_id) === Number(params[0]));
        } else if (lower.includes('status = ?')) {
          rows = rows.filter(r => r.status === params[0]);
        }
      }

      if (lower.includes('order by sort_order asc')) {
        rows.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      } else if (lower.includes('order by id desc') || lower.includes('order by o.id desc')) {
        rows.sort((a, b) => (b.id || 0) - (a.id || 0));
      }

      const limitMatch = lower.match(/limit\s+(\d+|\?)/);
      if (limitMatch) {
        const lim = limitMatch[1] === '?' ? Number(params[params.length - 1]) : Number(limitMatch[1]);
        if (!isNaN(lim) && lim > 0) rows = rows.slice(0, lim);
      }

      return rows;
    },
    get: (sql, params = []) => {
      const lower = sql.toLowerCase();
      if (lower.includes('count(*) as cnt') || lower.includes('count(*) as total')) {
        let table = ['order_items', 'orders', 'products', 'categories', 'couriers', 'users'].find(t => lower.includes(t)) || 'orders';
        let list = data[table] || [];
        if (lower.includes('status = ?')) list = list.filter(r => r.status === params[0]);
        if (lower.includes("status = 'free'")) list = list.filter(r => r.status === 'free');
        if (lower.includes("status = 'busy'")) list = list.filter(r => r.status === 'busy');
        if (lower.includes("status = 'delivered'")) list = list.filter(r => r.status === 'delivered');
        if (lower.includes("status = 'cancelled'")) list = list.filter(r => r.status === 'cancelled');
        if (lower.includes("status not in ('delivered', 'cancelled')")) list = list.filter(r => r.status !== 'delivered' && r.status !== 'cancelled');
        if (lower.includes("source = 'web'")) list = list.filter(r => r.source === 'web');
        if (lower.includes("source = 'telegram_bot'")) list = list.filter(r => r.source === 'telegram_bot');
        return { cnt: list.length, total: list.length };
      }

      if (lower.includes('sum(total_amount)')) {
        const delivered = (data.orders || []).filter(o => o.status === 'delivered');
        const sum = delivered.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
        return { total: sum, sum: sum, cnt: delivered.length };
      }

      let table = ['order_items', 'orders', 'products', 'categories', 'couriers', 'users'].find(t => lower.includes(t)) || 'orders';
      let rows = [...(data[table] || [])];

      if (lower.includes('where id = ?')) {
        return rows.find(r => Number(r.id) === Number(params[0])) || null;
      }
      if (lower.includes('where telegram_id = ?')) {
        return rows.find(r => String(r.telegram_id) === String(params[0])) || null;
      }
      if (lower.includes('where name = ?')) {
        return rows.find(r => r.name === params[0]) || null;
      }
      if (lower.includes('where phone = ?') || lower.includes('where phone like ?')) {
        const digits = String(params[0]).replace(/[^0-9]/g, '');
        return rows.find(r => r.phone && r.phone.replace(/[^0-9]/g, '').includes(digits)) || rows[0] || null;
      }
      if (lower.includes('order_number = ?')) {
        return rows.find(r => r.order_number === params[0] || r.order_number === params[1]) || null;
      }

      return rows[0] || null;
    },
    run: (sql, params = []) => {
      const lower = sql.toLowerCase();
      let table = ['order_items', 'orders', 'products', 'categories', 'couriers', 'users'].find(t => lower.includes(t)) || 'orders';
      if (!data[table]) data[table] = [];

      if (lower.startsWith('insert into')) {
        data._seq[table] = (data._seq[table] || 0) + 1;
        const newId = data._seq[table];
        let record = { id: newId };

        if (table === 'categories') {
          record = { id: newId, name: params[0], icon: params[1], sort_order: params[2] };
        } else if (table === 'products') {
          record = { id: newId, category_id: params[0], name: params[1], description: params[2], price: params[3], image_url: params[4], prep_time_min: params[5], is_available: params[6] };
        } else if (table === 'couriers') {
          record = { id: newId, name: params[0], phone: params[1], telegram_id: params[2], vehicle_type: params[3], status: params[4], active_orders_count: params[5] || 0, total_delivered: params[6] || 0 };
        } else if (table === 'orders') {
          record = {
            id: newId,
            order_number: params[0],
            customer_name: params[1],
            customer_phone: params[2],
            telegram_username: params[3] || null,
            telegram_id: params[4] || null,
            delivery_address: params[5],
            latitude: params[6],
            longitude: params[7],
            total_amount: params[8],
            delivery_fee: params[9],
            payment_method: params[10],
            status: params[11] || 'new',
            source: params[12] || 'web',
            notes: params[13] || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            courier_id: null
          };
        } else if (table === 'order_items') {
          record = { id: newId, order_id: params[0], product_id: params[1], product_name: params[2], quantity: params[3], unit_price: params[4], total_price: params[5] };
        } else if (table === 'users') {
          record = { id: newId, telegram_id: params[0], full_name: params[1], role: params[2] || 'client', language: 'uz', created_at: new Date().toISOString() };
        }

        data[table].push(record);
        save();
        return { lastInsertRowid: newId, changes: 1 };
      }

      if (lower.startsWith('update')) {
        let changes = 0;
        data[table] = data[table].map(r => {
          if (lower.includes('where id = ?') && Number(r.id) === Number(params[params.length - 1])) {
            changes++;
            if (lower.includes('set status = ?')) r.status = params[0];
            if (lower.includes("status = 'free'")) r.status = 'free';
            if (lower.includes("status = 'busy'")) r.status = 'busy';
            if (lower.includes("status = 'delivered'")) r.status = 'delivered';
            if (lower.includes('total_delivered = total_delivered + 1')) r.total_delivered = (r.total_delivered || 0) + 1;
            if (lower.includes('courier_id = ?')) r.courier_id = params[0];
            return r;
          }
          if (lower.includes('where telegram_id = ?') && String(r.telegram_id) === String(params[params.length - 1])) {
            changes++;
            if (lower.includes('set role = ?') || lower.includes("role = 'admin'")) r.role = 'admin';
            if (lower.includes('set language = ?')) r.language = params[0];
            if (lower.includes("status = 'free'")) r.status = 'free';
            if (lower.includes("status = 'busy'")) r.status = 'busy';
            if (lower.includes("status = 'offline'")) r.status = 'offline';
            return r;
          }
          return r;
        });
        save();
        return { lastInsertRowid: null, changes };
      }

      if (lower.startsWith('delete from')) {
        if (lower.includes('where id = ?')) {
          data[table] = data[table].filter(r => Number(r.id) !== Number(params[0]));
        } else {
          data[table] = [];
        }
        save();
        return { lastInsertRowid: null, changes: 1 };
      }

      return { lastInsertRowid: null, changes: 0 };
    }
  };
}

function getDb() {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

module.exports = {
  getDb
};
