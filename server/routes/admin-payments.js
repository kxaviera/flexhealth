import { Router } from 'express';
import { getDb, paymentRowToJson, getOrderById, withTransaction } from '../db.js';
import { authAdmin } from '../middleware/auth.js';
import { isPhonePeEnabled, refundPhonePePayment } from '../phonepe.js';

const router = Router();

router.get('/', authAdmin, (_req, res) => {
  const rows = getDb().prepare(`
    SELECT p.*, o.customer_json, o.status as order_status
    FROM payments p
    JOIN orders o ON o.id = p.order_id
    ORDER BY p.created_at DESC
    LIMIT 100
  `).all();

  const payments = rows.map(row => {
    const customer = JSON.parse(row.customer_json);
    return {
      ...paymentRowToJson(row),
      orderStatus: row.order_status,
      customerName: customer.name,
      customerPhone: customer.phone
    };
  });

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'paid').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    revenue: payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  };

  res.json({ ok: true, payments, stats });
});

router.post('/:id/refund', authAdmin, async (req, res) => {
  const payment = getDb().prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!payment) return res.status(404).json({ ok: false, msg: 'Payment not found' });
  if (payment.status !== 'paid') {
    return res.status(400).json({ ok: false, msg: 'Only paid payments can be refunded' });
  }

  const meta = payment.meta_json ? JSON.parse(payment.meta_json) : {};
  const db = getDb();
  const now = new Date().toISOString();

  try {
    if (isPhonePeEnabled()) {
      const refund = await refundPhonePePayment({
        merchantOrderId: payment.id,
        amountInr: payment.amount,
        merchantRefundId: `REF${payment.id}`.slice(0, 63)
      });
      meta.phonepeRefundId = refund.refundId || refund.merchantRefundId;
    }
  } catch (e) {
    return res.status(502).json({ ok: false, msg: e.message || 'PhonePe refund failed' });
  }

  withTransaction(db, () => {
    db.prepare(`UPDATE payments SET status = 'refunded', meta_json = ? WHERE id = ?`).run(
      JSON.stringify({ ...meta, refundedAt: now }),
      payment.id
    );
    db.prepare(`UPDATE orders SET payment_status = 'refunded' WHERE id = ?`).run(payment.order_id);
  });

  res.json({
    ok: true,
    payment: paymentRowToJson(getDb().prepare('SELECT * FROM payments WHERE id = ?').get(payment.id))
  });
});

router.get('/order/:orderId', authAdmin, (req, res) => {
  const rows = getDb().prepare('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC').all(req.params.orderId);
  res.json({ ok: true, payments: rows.map(paymentRowToJson), order: getOrderById(req.params.orderId) });
});

export default router;
