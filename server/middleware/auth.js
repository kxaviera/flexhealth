import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config.js';

const JWT_SECRET = getJwtSecret();

/** Secure cookies only on HTTPS (APP_URL) — NODE_ENV=production over http://localhost must stay non-secure. */
export function cookieSecure() {
  if (process.env.COOKIE_SECURE === 'true') return true;
  if (process.env.COOKIE_SECURE === 'false') return false;
  return String(process.env.APP_URL || '').startsWith('https://');
}

function cookieOpts(maxAgeMs) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: maxAgeMs,
    secure: cookieSecure()
  };
}

export function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, role: 'user', name: user.name, email: user.email, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, role: 'admin', username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
}

/** Short-lived token so guest checkout can create/verify PhonePe after redirect. */
export function signPaymentToken(paymentId, orderId) {
  return jwt.sign(
    { role: 'payment', pid: paymentId, oid: orderId },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authUser(req, res, next) {
  const token = req.cookies?.fh_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ ok: false, msg: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'user') return res.status(401).json({ ok: false, msg: 'Invalid session' });
  req.user = payload;
  next();
}

export function authUserOptional(req, _res, next) {
  const token = req.cookies?.fh_token || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    const payload = verifyToken(token);
    if (payload?.role === 'user') req.user = payload;
  }
  const adminToken = req.cookies?.fh_admin;
  if (adminToken) {
    const adminPayload = verifyToken(adminToken);
    if (adminPayload?.role === 'admin') req.admin = adminPayload;
  }
  const payToken =
    req.cookies?.fh_pay ||
    (req.headers['x-payment-token'] ? String(req.headers['x-payment-token']) : null) ||
    (req.body?.paymentAccessToken ? String(req.body.paymentAccessToken) : null) ||
    (req.query?.payToken ? String(req.query.payToken) : null);
  if (payToken) {
    const payPayload = verifyToken(payToken);
    if (payPayload?.role === 'payment' && payPayload.pid) req.paymentAuth = payPayload;
  }
  next();
}

export function authAdmin(req, res, next) {
  const token = req.cookies?.fh_admin || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ ok: false, msg: 'Admin login required' });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return res.status(401).json({ ok: false, msg: 'Invalid admin session' });
  req.admin = payload;
  next();
}

export function setUserCookie(res, token) {
  res.cookie('fh_token', token, cookieOpts(30 * 24 * 60 * 60 * 1000));
}

export function setAdminCookie(res, token) {
  res.cookie('fh_admin', token, cookieOpts(8 * 60 * 60 * 1000));
}

export function setPaymentCookie(res, token) {
  res.cookie('fh_pay', token, cookieOpts(2 * 60 * 60 * 1000));
}

export function clearUserCookie(res) {
  res.clearCookie('fh_token');
}

export function clearAdminCookie(res) {
  res.clearCookie('fh_admin');
}

export function clearPaymentCookie(res) {
  res.clearCookie('fh_pay');
}
