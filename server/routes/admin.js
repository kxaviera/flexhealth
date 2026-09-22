import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, getOrderById, rowToOrder, normalizePhone, withTransaction } from '../db.js';
import {
  listVerificationCodes,
  createVerificationCode,
  deleteVerificationCode
} from '../verify.js';
import { authAdmin, setAdminCookie, clearAdminCookie, signAdminToken, verifyToken } from '../middleware/auth.js';
import { adminLoginLimiter, contactLimiter } from '../middleware/security.js';
import { VALID_STATUSES } from './orders.js';
import { createShipmentForOrder, getDelhiveryConfig } from '../delhivery.js';
import { createShiprocketShipment, getShiprocketConfig, isShiprocketRealtime } from '../shiprocket.js';
import { getPhonePePublicConfig } from '../phonepe.js';
import { isTestMode } from '../config.js';

const router = Router();
const ORDER_PIPELINE = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];

function getStatusIndex(status) {
  if (status === 'cancelled') return -1;
  const idx = ORDER_PIPELINE.indexOf(status);
  return idx >= 0 ? idx : 0;
}

router.get('/session', (req, res) => {
  const token = req.cookies?.fh_admin;
  if (!token) return res.json({ ok: true, loggedIn: false });
  const payload = verifyToken(token);
  res.json({ ok: true, loggedIn: !!(payload && payload.role === 'admin'), username: payload?.username });
});

router.post('/login', adminLoginLimiter, (req, res) => {
  const { username, password, pin } = req.body;

  if (pin && isTestMode()) {
    const testPin = process.env.ADMIN_PIN || process.env.TEST_OTP || '1234';
    if (pin === testPin) {
      const admin = getDb().prepare('SELECT * FROM admin_users LIMIT 1').get();
      if (admin) {
        const token = signAdminToken(admin);
        setAdminCookie(res, token);
        return res.json({ ok: true, username: admin.username });
      }
    }
    return res.status(401).json({ ok: false, msg: 'Invalid PIN' });
  }

  if (!username || !password) {
    return res.status(400).json({ ok: false, msg: 'Username and password required' });
  }

  const admin = getDb().prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ ok: false, msg: 'Invalid credentials' });
  }

  const token = signAdminToken(admin);
  setAdminCookie(res, token);
  res.json({ ok: true, username: admin.username });
});

router.post('/logout', (_req, res) => {
  clearAdminCookie(res);
  res.json({ ok: true });
});

router.get('/stats', authAdmin, (_req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const active = db.prepare(`
    SELECT COUNT(*) as c FROM orders WHERE status NOT IN ('delivered', 'cancelled')
  `).get().c;
  const users = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const revenue = db.prepare(`
    SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status != 'cancelled'
  `).get().s;
  res.json({ ok: true, stats: { totalOrders: total, activeOrders: active, users, revenue } });
});

router.get('/orders', authAdmin, (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100').all();
  const orders = rows.map(row => {
    const items = getDb().prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id);
    const history = getDb().prepare(
      'SELECT status, at FROM order_status_history WHERE order_id = ? ORDER BY id'
    ).all(row.id);
    return rowToOrder(row, items, history);
  });
  res.json({ ok: true, orders });
});

router.get('/orders/:id', authAdmin, (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ ok: false, msg: 'Order not found' });
  res.json({ ok: true, order });
});

router.patch('/orders/:id/status', authAdmin, (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, msg: 'Invalid status' });
  }

  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ ok: false, msg: 'Order not found' });

  const db = getDb();
  const now = new Date().toISOString();
  const curIdx = getStatusIndex(order.status);
  const newIdx = getStatusIndex(status);

  withTransaction(db, () => {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, order.id);

    if (status === 'cancelled') {
      db.prepare(`
        INSERT INTO order_status_history (order_id, status, at) VALUES (?, 'cancelled', ?)
      `).run(order.id, now);
    } else if (newIdx > curIdx) {
      for (let i = curIdx + 1; i <= newIdx; i++) {
        const step = ORDER_PIPELINE[i];
        const exists = db.prepare(`
          SELECT id FROM order_status_history WHERE order_id = ? AND status = ?
        `).get(order.id, step);
        if (!exists) {
          db.prepare(`
            INSERT INTO order_status_history (order_id, status, at) VALUES (?, ?, ?)
          `).run(order.id, step, now);
        }
      }
    } else if (newIdx >= 0) {
      db.prepare(`
        INSERT INTO order_status_history (order_id, status, at) VALUES (?, ?, ?)
      `).run(order.id, status, now);
    }
  });

  res.json({ ok: true, order: getOrderById(order.id) });
});

router.get('/users', authAdmin, (_req, res) => {
  const users = getDb().prepare(`
    SELECT id, name, email, phone, city, created_at FROM users ORDER BY created_at DESC LIMIT 100
  `).all();
  res.json({ ok: true, users });
});

router.post('/contact', contactLimiter, (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ ok: false, msg: 'Missing fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ ok: false, msg: 'Invalid email address' });
  }
  getDb().prepare(`
    INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)
  `).run(
    name.trim().slice(0, 120),
    email.trim().slice(0, 200),
    (subject || 'General').trim().slice(0, 200),
    message.trim().slice(0, 5000),
    new Date().toISOString()
  );
  res.json({ ok: true, msg: 'Message received' });
});

router.get('/messages', authAdmin, (_req, res) => {
  const messages = getDb().prepare(`
    SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50
  `).all();
  res.json({ ok: true, messages });
});

router.get('/verification-codes', authAdmin, (_req, res) => {
  res.json({ ok: true, codes: listVerificationCodes(500) });
});

router.post('/verification-codes', authAdmin, (req, res) => {
  const { code } = req.body;
  if (!code || !String(code).trim()) {
    return res.status(400).json({ ok: false, msg: 'Code required' });
  }
  try {
    const created = createVerificationCode({ code });
    res.json({ ok: true, code: created });
  } catch (e) {
    res.status(409).json({ ok: false, msg: e.message || 'Could not create code' });
  }
});

router.delete('/verification-codes/:code', authAdmin, (req, res) => {
  const ok = deleteVerificationCode(req.params.code);
  if (!ok) return res.status(404).json({ ok: false, msg: 'Code not found' });
  res.json({ ok: true });
});

router.get('/integrations', authAdmin, (_req, res) => {
  res.json({
    ok: true,
    testMode: isTestMode(),
    phonepe: getPhonePePublicConfig(),
    shiprocket: getShiprocketConfig(),
    delhivery: getDelhiveryConfig()
  });
});

router.post('/orders/:id/ship', authAdmin, async (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ ok: false, msg: 'Order not found' });
  if (order.awb) {
    return res.json({ ok: true, order, msg: 'Shipment already created' });
  }
  try {
    let shipment;
    if (isShiprocketRealtime()) {
      shipment = await createShiprocketShipment(order);
    } else {
      shipment = await createShipmentForOrder(order);
      shipment = {
        shiprocketOrderId: shipment.delhiveryOrderId,
        awb: shipment.awb,
        courierName: shipment.courierName,
        trackingUrl: shipment.trackingUrl
      };
    }
    const db = getDb();
    db.prepare(`
      UPDATE orders SET shiprocket_order_id = ?, awb = ?, courier_name = ?, tracking_url = ?
      WHERE id = ?
    `).run(
      shipment.shiprocketOrderId ? String(shipment.shiprocketOrderId) : null,
      shipment.awb,
      shipment.courierName,
      shipment.trackingUrl,
      order.id
    );
    if (order.status === 'confirmed' || order.status === 'placed') {
      const now = new Date().toISOString();
      db.prepare(`UPDATE orders SET status = 'packed' WHERE id = ?`).run(order.id);
      const exists = db.prepare(`SELECT id FROM order_status_history WHERE order_id = ? AND status = 'packed'`).get(order.id);
      if (!exists) {
        db.prepare(`INSERT INTO order_status_history (order_id, status, at) VALUES (?, 'packed', ?)`).run(order.id, now);
      }
    }
    res.json({ ok: true, order: getOrderById(order.id), shipment });
  } catch (e) {
    res.status(502).json({ ok: false, msg: e.message || 'Shipment failed' });
  }
});

export default router;
