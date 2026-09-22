import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, 'flexhealth.db');
export const ROOT = path.join(__dirname, '..');

let db;

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function withTransaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch { /* ignore */ }
    throw err;
  }
}

export function initDb() {
  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL UNIQUE,
      address TEXT DEFAULT '',
      city TEXT DEFAULT '',
      pincode TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS otp_codes (
      phone TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      mode TEXT NOT NULL,
      signup_name TEXT,
      signup_email TEXT,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      status TEXT NOT NULL DEFAULT 'placed',
      customer_json TEXT NOT NULL,
      total REAL NOT NULL,
      payment TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      status TEXT NOT NULL,
      at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      text TEXT NOT NULL,
      user_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      method TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      transaction_id TEXT,
      meta_json TEXT,
      created_at TEXT NOT NULL,
      paid_at TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS verification_codes (
      code TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      batch TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      verified_at TEXT,
      created_at TEXT NOT NULL
    );
  `);

  migrateOrdersPaymentStatus();
  seedVerificationCodes();

  seedAdmin();
  console.log('Database ready:', DB_PATH);
}

function migrateOrdersPaymentStatus() {
  const cols = db.prepare(`PRAGMA table_info(orders)`).all();
  if (!cols.some(c => c.name === 'payment_status')) {
    db.exec(`ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'cod'`);
  }
  if (!cols.some(c => c.name === 'promo_code')) {
    db.exec(`ALTER TABLE orders ADD COLUMN promo_code TEXT`);
  }
  if (!cols.some(c => c.name === 'discount_amount')) {
    db.exec(`ALTER TABLE orders ADD COLUMN discount_amount REAL NOT NULL DEFAULT 0`);
  }
  if (!cols.some(c => c.name === 'subtotal')) {
    db.exec(`ALTER TABLE orders ADD COLUMN subtotal REAL`);
  }
  if (!cols.some(c => c.name === 'shipping_cost')) {
    db.exec(`ALTER TABLE orders ADD COLUMN shipping_cost REAL NOT NULL DEFAULT 0`);
  }
  if (!cols.some(c => c.name === 'shiprocket_order_id')) {
    db.exec(`ALTER TABLE orders ADD COLUMN shiprocket_order_id TEXT`);
  }
  if (!cols.some(c => c.name === 'awb')) {
    db.exec(`ALTER TABLE orders ADD COLUMN awb TEXT`);
  }
  if (!cols.some(c => c.name === 'courier_name')) {
    db.exec(`ALTER TABLE orders ADD COLUMN courier_name TEXT`);
  }
  if (!cols.some(c => c.name === 'tracking_url')) {
    db.exec(`ALTER TABLE orders ADD COLUMN tracking_url TEXT`);
  }
}

function seedVerificationCodes() {
  import('./verification-codes-store.js').then(({ mergeVerificationCodes }) => {
    const dbCodes = getDb()
      .prepare('SELECT code FROM verification_codes ORDER BY created_at DESC')
      .all()
      .map(row => row.code);
    mergeVerificationCodes(dbCodes);
  }).catch(err => console.warn('Verification codes sync:', err.message));
}

function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn('ADMIN_PASSWORD not set — admin user will not be auto-created');
    return;
  }
  const hash = bcrypt.hashSync(password, 10);
  const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);
  if (!existing) {
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, hash);
    console.log(`Admin user created: ${username}`);
    return;
  }
  // Keep DB hash aligned with .env (single source of truth for this stack)
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(hash, username);
}

export function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function rowToOrder(orderRow, items, history) {
  const payment = getPaymentByOrderId(orderRow.id);
  return {
    id: orderRow.id,
    date: orderRow.created_at,
    userId: orderRow.user_id,
    status: orderRow.status,
    customer: JSON.parse(orderRow.customer_json),
    items: items.map(i => ({ id: i.product_id, name: i.name, qty: i.qty, price: i.price })),
    total: orderRow.total,
    subtotal: orderRow.subtotal ?? orderRow.total,
    discountAmount: orderRow.discount_amount || 0,
    promoCode: orderRow.promo_code || null,
    payment: orderRow.payment,
    paymentStatus: orderRow.payment_status || (orderRow.payment === 'cod' ? 'cod' : 'paid'),
    paymentRecord: payment ? paymentRowToJson(payment) : null,
    shippingCost: orderRow.shipping_cost || 0,
    shiprocketOrderId: orderRow.shiprocket_order_id || null,
    awb: orderRow.awb || null,
    courierName: orderRow.courier_name || null,
    trackingUrl: orderRow.tracking_url || null,
    statusHistory: history.map(h => ({ status: h.status, at: h.at }))
  };
}

export function getPaymentByOrderId(orderId) {
  return getDb().prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1').get(orderId) || null;
}

export function getPaymentById(id) {
  return getDb().prepare('SELECT * FROM payments WHERE id = ?').get(id) || null;
}

export function paymentRowToJson(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    method: row.method,
    amount: row.amount,
    status: row.status,
    transactionId: row.transaction_id,
    meta: row.meta_json ? JSON.parse(row.meta_json) : {},
    createdAt: row.created_at,
    paidAt: row.paid_at
  };
}

export function getOrderById(id) {
  const order = getDb().prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return null;
  const items = getDb().prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);
  const history = getDb().prepare(
    'SELECT status, at FROM order_status_history WHERE order_id = ? ORDER BY id'
  ).all(id);
  return rowToOrder(order, items, history);
}

export const CATALOG_PATH = path.join(ROOT, 'data', 'products.json');

export function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    return defaultCatalog();
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

export function defaultPromoCodes() {
  return [
    {
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      minOrder: 999,
      maxDiscount: 500,
      maxUses: null,
      usedCount: 0,
      expiresAt: null,
      enabled: true,
      description: '10% off your first order (max ₹500)'
    },
    {
      code: 'FLAT200',
      type: 'fixed',
      value: 200,
      minOrder: 1999,
      maxDiscount: null,
      maxUses: 100,
      usedCount: 0,
      expiresAt: null,
      enabled: true,
      description: '₹200 off orders above ₹1,999'
    }
  ];
}

export function defaultCatalog() {
  return {
    categories: [],
    brands: [],
    products: [],
    reviews: [],
    banners: [],
    offerBanners: [],
    promoSlides: [],
    promoCodes: defaultPromoCodes(),
    siteSettings: defaultSiteSettings()
  };
}

export function defaultSiteSettings() {
  return {
    stats: [
      { num: '473+', label: 'Products' },
      { num: '14+', label: 'Top Brands' },
      { num: '20K+', label: 'Happy Customers' },
      { num: '2005', label: 'Trusted Since' }
    ],
    trustBar: [
      { icon: '🚚', title: 'Free Shipping', subtitle: 'All India Delivery' },
      { icon: '💰', title: 'Cash on Delivery', subtitle: 'Pay When You Receive' },
      { icon: '🛡️', title: '100% Genuine', subtitle: 'Authentic Products Only' },
      { icon: '↩', title: 'Easy Returns', subtitle: '7-Day Return Policy' }
    ],
    featuredLimits: { popular: 8, sale: 4, newArrivals: 4 },
    whatsapp: {
      enabled: true,
      phone: '919246501017',
      message: 'Hi, I need help with Flex Health products.'
    }
  };
}

export function saveCatalog(catalog) {
  catalog.products = catalog.products || [];
  catalog.categories = catalog.categories || [];
  catalog.brands = catalog.brands || [];
  catalog.reviews = catalog.reviews || [];
  catalog.banners = catalog.banners || [];
  catalog.offerBanners = catalog.offerBanners || [];
  catalog.promoSlides = catalog.promoSlides || [];
  if (!catalog.promoSlides) catalog.promoSlides = [];
  if (!catalog.promoCodes?.length) catalog.promoCodes = defaultPromoCodes();
  if (!catalog.siteSettings) catalog.siteSettings = defaultSiteSettings();
  catalog.productCount = catalog.products.length;
  catalog.updatedAt = new Date().toISOString();

  const tmp = CATALOG_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(catalog, null, 2), 'utf8');
  fs.renameSync(tmp, CATALOG_PATH);
  return catalog;
}

export function slugId(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'item-' + Date.now();
}
