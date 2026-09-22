import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { initDb, ROOT } from './db.js';
import { initFirebaseAdmin } from './firebase.js';
import { isTestMode, validateProductionConfig } from './config.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import cmsRoutes from './routes/cms.js';
import catalogRoutes from './routes/catalog.js';
import paymentRoutes from './routes/payments.js';
import adminPaymentRoutes from './routes/admin-payments.js';
import reviewRoutes from './routes/reviews.js';
import wishlistRoutes from './routes/wishlist.js';
import promoRoutes from './routes/promo.js';
import verifyRoutes from './routes/verify.js';
import shippingRoutes from './routes/shipping.js';
import { getDb, getOrderById, withTransaction } from './db.js';
import { authAdmin } from './middleware/auth.js';
import { generalLimiter } from './middleware/security.js';
import { VALID_STATUSES } from './routes/orders.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

for (const warning of validateProductionConfig()) {
  console.warn('⚠', warning);
}

initDb();
await initFirebaseAdmin();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.gstatic.com', 'https://unpkg.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.phonepe.com', 'https://api-preprod.phonepe.com', 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'http://localhost:*', 'http://127.0.0.1:*'],
      frameSrc: ["'self'", 'https://mercury.phonepe.com', 'https://mercury-uat.phonepe.com']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Allow Flutter web / local tools to call the API
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api', generalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Flex Health API',
    testMode: isTestMode(),
    phonepe: !!(process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET),
    shiprocket: !!(process.env.SHIPROCKET_EMAIL && (process.env.SHIPROCKET_PASSWORD || process.env.SHIPROCKET_INTEGRATION_ID)),
    delhivery: !!process.env.DELHIVERY_API_TOKEN,
    smsOtp: !!(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID),
    version: '1.0.0'
  });
});

app.use('/api/catalog', catalogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/cms', cmsRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/payments', paymentRoutes);

const ORDER_PIPELINE = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];

function getStatusIndex(status) {
  const idx = ORDER_PIPELINE.indexOf(status);
  return idx >= 0 ? idx : 0;
}

app.post('/api/admin/orders/:id/advance', authAdmin, (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ ok: false, msg: 'Order not found' });
  if (order.status === 'delivered' || order.status === 'cancelled') {
    return res.status(400).json({ ok: false, msg: 'Cannot advance' });
  }
  const next = ORDER_PIPELINE[getStatusIndex(order.status) + 1];
  if (!next) return res.status(400).json({ ok: false, msg: 'No next step' });

  const db = getDb();
  const now = new Date().toISOString();
  withTransaction(db, () => {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(next, order.id);
    const exists = db.prepare(`
      SELECT id FROM order_status_history WHERE order_id = ? AND status = ?
    `).get(order.id, next);
    if (!exists) {
      db.prepare(`
        INSERT INTO order_status_history (order_id, status, at) VALUES (?, ?, ?)
      `).run(order.id, next, now);
    }
  });

  res.json({ ok: true, order: getOrderById(order.id) });
});

app.use(express.static(ROOT, { index: 'index.html', maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0 }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, msg: 'API route not found' });
  }
  if (req.method !== 'GET') return next();
  const bare = req.path.replace(/^\//, '');
  if (bare && !path.extname(bare)) {
    const htmlPath = path.join(ROOT, bare + '.html');
    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }
  }
  res.status(404).sendFile(path.join(ROOT, '404.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('  Flex Health — server running');
  console.log(`  Store:  http://localhost:${PORT}`);
  console.log(`  Admin:  http://localhost:${PORT}/admin.html`);
  console.log(`  API:    http://localhost:${PORT}/api/health`);
  if (isTestMode()) console.log('  Mode:   TEST (set TEST_MODE=false for production)');
  console.log('');
});
