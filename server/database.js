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

  throw new Error('SQLite engine is not available');
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
