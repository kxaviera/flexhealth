import { Router } from 'express';
import { getDb, getOrderById, normalizePhone, rowToOrder, loadCatalog, withTransaction } from '../db.js';
import { authUser, authUserOptional, setPaymentCookie, signPaymentToken } from '../middleware/auth.js';
import { validatePromo, incrementPromoUsage } from '../promo.js';
import { resolveOrderLineItems } from '../order-utils.js';

const router = Router();

const VALID_STATUSES = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

function createPaymentRecord(db, orderId, method, amount) {
  const paymentId = 'PAY' + Date.now().toString().slice(-10) + Math.random().toString(36).slice(2, 6);
  const now = new Date().toISOString();

  if (method === 'cod') {
    db.prepare(`
      INSERT INTO payments (id, order_id, method, amount, status, transaction_id, created_at, paid_at)
      VALUES (?, ?, 'cod', ?, 'cod', ?, ?, ?)
    `).run(paymentId, orderId, amount, 'COD-' + orderId, now, now);
    return paymentId;
  }

  db.prepare(`
    INSERT INTO payments (id, order_id, method, amount, status, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?)
  `).run(paymentId, orderId, method, amount, now);

  return paymentId;
}

router.post('/', authUserOptional, (req, res) => {
  const { customer, items, payment, promoCode, shippingCost: clientShipping } = req.body;

  if (!customer?.name?.trim() || !customer?.phone || !customer?.address?.trim() || !items?.length) {
    return res.status(400).json({ ok: false, msg: 'Missing order details' });
  }

  const method = payment || 'cod';
  if (!['cod', 'upi', 'card', 'phonepe', 'online'].includes(method)) {
    return res.status(400).json({ ok: false, msg: 'Invalid payment method' });
  }

  const resolved = resolveOrderLineItems(items);
  if (!resolved.ok) {
    return res.status(resolved.status || 400).json({ ok: false, msg: resolved.msg });
  }

  const orderItems = resolved.items;
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  let discountAmount = 0;
  let appliedPromo = null;

  if (promoCode) {
    const promoResult = validatePromo(loadCatalog(), promoCode, subtotal);
    if (!promoResult.ok) {
      return res.status(400).json({ ok: false, msg: promoResult.msg });
    }
    discountAmount = promoResult.discountAmount;
    appliedPromo = promoResult.code;
  }

  const shippingCost = Math.max(0, Math.round(Number(clientShipping) || 0));
  const orderTotal = Math.max(0, Math.round((subtotal - discountAmount + shippingCost) * 100) / 100);

  const orderId = 'FH' + Date.now().toString().slice(-8);
  const now = new Date().toISOString();
  const userId = req.user?.sub || null;
  const paymentStatus = method === 'cod' ? 'cod' : 'pending';

  const db = getDb();
  let paymentId;

  withTransaction(db, () => {
    db.prepare(`
      INSERT INTO orders (id, user_id, status, customer_json, total, payment, payment_status, created_at, promo_code, discount_amount, subtotal, shipping_cost)
      VALUES (?, ?, 'placed', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      userId,
      JSON.stringify({
        name: customer.name.trim(),
        phone: normalizePhone(customer.phone),
        email: (customer.email || '').trim().toLowerCase(),
        address: customer.address.trim(),
        city: (customer.city || '').trim(),
        pincode: String(customer.pincode || '').replace(/\D/g, '').slice(0, 6),
        notes: (customer.notes || '').trim().slice(0, 500)
      }),
      orderTotal,
      method,
      paymentStatus,
      now,
      appliedPromo,
      discountAmount,
      subtotal,
      shippingCost
    );

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, name, qty, price) VALUES (?, ?, ?, ?, ?)
    `);
    for (const item of orderItems) {
      insertItem.run(orderId, item.id, item.name, item.qty, item.price);
    }

    db.prepare(`
      INSERT INTO order_status_history (order_id, status, at) VALUES (?, 'placed', ?)
    `).run(orderId, now);

    paymentId = createPaymentRecord(db, orderId, method, orderTotal);

    if (userId && customer.address) {
      db.prepare(`
        UPDATE users SET
          name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          address = CASE WHEN address = '' OR address IS NULL THEN ? ELSE address END,
          city = CASE WHEN city = '' OR city IS NULL THEN ? ELSE city END,
          pincode = CASE WHEN pincode = '' OR pincode IS NULL THEN ? ELSE pincode END
        WHERE id = ?
      `).run(
        customer.name.trim(),
        normalizePhone(customer.phone),
        customer.address.trim(),
        (customer.city || '').trim(),
        String(customer.pincode || '').replace(/\D/g, '').slice(0, 6),
        userId
      );
    }
  });

  if (appliedPromo) incrementPromoUsage(appliedPromo);

  const order = getOrderById(orderId);
  const payload = {
    ok: true,
    order,
    payment: order.paymentRecord,
    requiresPayment: method !== 'cod'
  };

  // Guest PhonePe: cookie + token so create/verify work after redirect without login
  if (method !== 'cod' && paymentId) {
    const payToken = signPaymentToken(paymentId, orderId);
    setPaymentCookie(res, payToken);
    payload.paymentAccessToken = payToken;
  }

  res.json(payload);
});

router.get('/my', authUser, (req, res) => {
  const rows = getDb().prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(req.user.sub);

  const orders = rows.map(row => {
    const items = getDb().prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id);
    const history = getDb().prepare(
      'SELECT status, at FROM order_status_history WHERE order_id = ? ORDER BY id'
    ).all(row.id);
    return rowToOrder(row, items, history);
  });

  res.json({ ok: true, orders });
});

router.get('/track', (req, res) => {
  const { orderId, phone } = req.query;
  if (!orderId || !phone) {
    return res.status(400).json({ ok: false, msg: 'Order ID and phone required' });
  }

  const order = getOrderById(String(orderId).trim());
  if (!order) return res.status(404).json({ ok: false, msg: 'Order not found' });
  if (normalizePhone(order.customer.phone) !== normalizePhone(phone)) {
    return res.status(403).json({ ok: false, msg: 'Phone number does not match' });
  }

  res.json({ ok: true, order });
});

router.get('/:id', authUserOptional, (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ ok: false, msg: 'Order not found' });

  const phone = req.query.phone;
  const isOwner = req.user && order.userId === req.user.sub;
  const phoneOk = phone && normalizePhone(phone) === normalizePhone(order.customer.phone);

  if (!isOwner && !phoneOk) {
    return res.status(403).json({ ok: false, msg: 'Verification required', needsPhone: true });
  }

  res.json({ ok: true, order });
});

export { VALID_STATUSES };
export default router;
