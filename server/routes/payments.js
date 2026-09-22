import { Router } from 'express';
import { getDb, getOrderById, getPaymentById, paymentRowToJson, withTransaction } from '../db.js';
import { authUserOptional, clearPaymentCookie } from '../middleware/auth.js';
import { requirePaymentAccess } from '../middleware/payment-access.js';
import { isTestMode } from '../config.js';
import {
  createPhonePePayment,
  getPhonePeOrderStatus,
  getPhonePePublicConfig,
  getPhonePeTransactionId,
  getAppBaseUrl,
  isPhonePeEnabled,
  isPhonePePaymentCompleted
} from '../phonepe.js';

const router = Router();

function loadPayment(req, res, next) {
  const payment = getPaymentById(req.params.id);
  if (!payment) return res.status(404).json({ ok: false, msg: 'Payment not found' });
  req.payment = payment;
  next();
}

function isOnlineMethod(method) {
  return ['upi', 'card', 'phonepe', 'online'].includes(method);
}

router.get('/config', (_req, res) => {
  const phonepe = getPhonePePublicConfig();
  const payload = {
    ok: true,
    testMode: isTestMode(),
    methods: ['cod'],
    phonepe
  };

  if (phonepe.enabled || isTestMode()) {
    payload.methods.push('phonepe');
  }

  if (isTestMode()) {
    payload.testPaymentOtp = process.env.TEST_PAYMENT_OTP || process.env.TEST_OTP || '123456';
    payload.testUpiId = 'test@flexhealth';
    payload.testCard = '4111 1111 1111 1111';
  }

  res.json(payload);
});

router.get('/:id', authUserOptional, loadPayment, requirePaymentAccess, (req, res) => {
  res.json({ ok: true, payment: paymentRowToJson(req.payment) });
});

router.post('/:id/phonepe/create', authUserOptional, loadPayment, requirePaymentAccess, async (req, res) => {
  const payment = req.payment;
  if (payment.status === 'paid') {
    return res.json({ ok: true, payment: paymentRowToJson(payment), order: getOrderById(payment.order_id) });
  }
  if (!isOnlineMethod(payment.method)) {
    return res.status(400).json({ ok: false, msg: 'PhonePe is only for online payments' });
  }
  if (!isPhonePeEnabled()) {
    return res.status(400).json({ ok: false, msg: 'PhonePe not configured' });
  }

  try {
    const redirectUrl = `${getAppBaseUrl()}/payment-return.html?paymentId=${encodeURIComponent(payment.id)}`;
    const session = await createPhonePePayment({
      merchantOrderId: payment.id,
      amountInr: payment.amount,
      redirectUrl,
      meta: { orderId: payment.order_id, paymentId: payment.id }
    });

    const db = getDb();
    const meta = payment.meta_json ? JSON.parse(payment.meta_json) : {};
    meta.phonepe_order_id = session.orderId;
    meta.phonepe_redirect_url = session.redirectUrl;
    db.prepare('UPDATE payments SET meta_json = ? WHERE id = ?').run(JSON.stringify(meta), payment.id);

    res.json({
      ok: true,
      redirectUrl: session.redirectUrl,
      phonepeOrderId: session.orderId,
      paymentId: payment.id,
      orderId: payment.order_id
    });
  } catch (e) {
    res.status(502).json({ ok: false, msg: e.message });
  }
});

router.post('/:id/phonepe/verify', authUserOptional, loadPayment, requirePaymentAccess, async (req, res) => {
  const payment = req.payment;
  if (payment.status === 'paid') {
    clearPaymentCookie(res);
    return res.json({ ok: true, payment: paymentRowToJson(payment), order: getOrderById(payment.order_id) });
  }

  if (!isPhonePeEnabled()) {
    return res.status(400).json({ ok: false, msg: 'PhonePe not configured' });
  }

  try {
    const status = await getPhonePeOrderStatus(payment.id);
    if (!isPhonePePaymentCompleted(status)) {
      return res.status(400).json({
        ok: false,
        msg: status.state === 'FAILED' || status.state === 'EXPIRED'
          ? `Payment ${String(status.state).toLowerCase()}`
          : 'Payment not completed yet',
        state: status.state || 'PENDING'
      });
    }

    const db = getDb();
    const now = new Date().toISOString();
    const meta = payment.meta_json ? JSON.parse(payment.meta_json) : {};
    meta.phonepe_order_id = status.orderId || meta.phonepe_order_id;
    meta.phonepe_status = status.state;
    const txnId = getPhonePeTransactionId(status);

    withTransaction(db, () => {
      db.prepare(`
        UPDATE payments SET status = 'paid', transaction_id = ?, meta_json = ?, paid_at = ? WHERE id = ?
      `).run(txnId, JSON.stringify(meta), now, payment.id);
      db.prepare(`
        UPDATE orders SET payment_status = 'paid', status = CASE WHEN status = 'placed' THEN 'confirmed' ELSE status END WHERE id = ?
      `).run(payment.order_id);
    });

    clearPaymentCookie(res);
    res.json({
      ok: true,
      payment: paymentRowToJson(getPaymentById(payment.id)),
      order: getOrderById(payment.order_id)
    });
  } catch (e) {
    res.status(502).json({ ok: false, msg: e.message });
  }
});

router.post('/:id/complete', authUserOptional, loadPayment, requirePaymentAccess, (req, res) => {
  if (!isTestMode()) {
    return res.status(400).json({ ok: false, msg: 'Use PhonePe checkout for online payments', usePhonePe: true });
  }

  const payment = req.payment;
  if (payment.status === 'paid') {
    return res.json({ ok: true, payment: paymentRowToJson(payment), order: getOrderById(payment.order_id) });
  }
  if (payment.status === 'failed') {
    return res.status(400).json({ ok: false, msg: 'Payment failed — create a new order' });
  }

  const TEST_CARD = '4111111111111111';
  const { otp, upiId, cardNumber, expiry, cvv, nameOnCard } = req.body;
  const testOtp = process.env.TEST_PAYMENT_OTP || process.env.TEST_OTP || '123456';

  if (payment.method === 'upi' || payment.method === 'phonepe' || payment.method === 'online') {
    if (!upiId?.trim()) return res.status(400).json({ ok: false, msg: 'UPI ID required' });
    if (otp !== testOtp) return res.status(400).json({ ok: false, msg: 'Invalid payment OTP' });
  } else if (payment.method === 'card') {
    const digits = String(cardNumber || '').replace(/\D/g, '');
    if (digits.length < 15) return res.status(400).json({ ok: false, msg: 'Invalid card number' });
    if (!expiry || !cvv) return res.status(400).json({ ok: false, msg: 'Expiry and CVV required' });
    if (digits !== TEST_CARD) return res.status(400).json({ ok: false, msg: 'Use test card 4111 1111 1111 1111' });
  } else {
    return res.status(400).json({ ok: false, msg: 'Invalid payment method' });
  }

  const db = getDb();
  const now = new Date().toISOString();
  const txnId = 'TXN' + Date.now().toString().slice(-10);
  const meta = {
    upiId: upiId || null,
    cardLast4: payment.method === 'card' ? String(cardNumber).replace(/\D/g, '').slice(-4) : null,
    nameOnCard: nameOnCard || null
  };

  withTransaction(db, () => {
    db.prepare(`
      UPDATE payments SET status = 'paid', transaction_id = ?, meta_json = ?, paid_at = ? WHERE id = ?
    `).run(txnId, JSON.stringify(meta), now, payment.id);
    db.prepare(`UPDATE orders SET payment_status = 'paid', status = CASE WHEN status = 'placed' THEN 'confirmed' ELSE status END WHERE id = ?`).run(payment.order_id);
  });

  clearPaymentCookie(res);
  res.json({
    ok: true,
    payment: paymentRowToJson(getPaymentById(payment.id)),
    order: getOrderById(payment.order_id)
  });
});

router.post('/:id/fail', authUserOptional, loadPayment, requirePaymentAccess, (req, res) => {
  const payment = req.payment;
  if (payment.status === 'paid') {
    return res.status(400).json({ ok: false, msg: 'Cannot fail a completed payment' });
  }
  getDb().prepare(`UPDATE payments SET status = 'failed' WHERE id = ?`).run(payment.id);
  getDb().prepare(`UPDATE orders SET payment_status = 'failed' WHERE id = ?`).run(payment.order_id);
  clearPaymentCookie(res);
  res.json({ ok: true, payment: paymentRowToJson(getPaymentById(payment.id)) });
});

export default router;
