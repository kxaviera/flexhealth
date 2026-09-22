import { getOrderById, normalizePhone } from '../db.js';

export function canAccessPayment(req, payment) {
  if (!payment) return false;
  if (req.admin) return true;

  // Guest / return-URL access via short-lived payment JWT (cookie or header)
  if (req.paymentAuth?.pid === payment.id) return true;

  const order = getOrderById(payment.order_id);
  if (!order) return false;

  if (req.user?.sub && order.userId === req.user.sub) return true;

  const phone = req.query.phone || req.body?.phone || req.body?.customerPhone;
  if (phone && normalizePhone(phone) === normalizePhone(order.customer.phone)) return true;

  return false;
}

export function requirePaymentAccess(req, res, next) {
  const payment = req.payment;
  if (!canAccessPayment(req, payment)) {
    return res.status(403).json({ ok: false, msg: 'Not authorized to access this payment' });
  }
  next();
}
