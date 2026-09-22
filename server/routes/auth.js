import { Router } from 'express';
import { getDb, normalizePhone } from '../db.js';
import { authUser, authUserOptional, setUserCookie, clearUserCookie, signUserToken } from '../middleware/auth.js';
import { isFirebaseEnabled, verifyFirebaseIdToken } from '../firebase.js';
import { isTestMode } from '../config.js';
import { isSmsEnabled, sendOtpSms } from '../sms.js';
import { otpLimiter, authLimiter } from '../middleware/security.js';

const router = Router();
const USE_FIREBASE = process.env.FIREBASE_AUTH !== 'false';

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function validatePhoneAuth(phone, mode, signupData) {
  if (phone.length !== 10) {
    return { ok: false, status: 400, msg: 'Enter a valid 10-digit mobile number.' };
  }
  const user = getDb().prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (mode === 'login' && !user) {
    return { ok: false, status: 404, msg: 'No account found for this number. Please sign up first.' };
  }
  if (mode === 'signup' && user) {
    return { ok: false, status: 409, msg: 'This number is already registered. Use Login instead.' };
  }
  if (mode === 'signup' && !signupData?.name?.trim()) {
    return { ok: false, status: 400, msg: 'Please enter your name.' };
  }
  return { ok: true, user };
}

function otpDeliveryAvailable() {
  return (isFirebaseEnabled() && USE_FIREBASE) || isSmsEnabled() || isTestMode();
}

router.get('/config', (_req, res) => {
  res.json({
    ok: true,
    testMode: isTestMode(),
    firebaseServer: isFirebaseEnabled() && USE_FIREBASE,
    smsOtp: isSmsEnabled(),
    otpFallback: isTestMode()
  });
});

router.post('/pre-check', (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const mode = req.body.mode || 'login';
  const signupData = req.body.signupData || null;
  const check = validatePhoneAuth(phone, mode, signupData);
  if (!check.ok) return res.status(check.status).json({ ok: false, msg: check.msg });
  res.json({ ok: true, phone });
});

router.post('/firebase', async (req, res) => {
  if (!isFirebaseEnabled() || !USE_FIREBASE) {
    return res.status(503).json({ ok: false, msg: 'Firebase auth not configured on server' });
  }

  const { idToken, mode = 'login', signupData } = req.body;
  if (!idToken) {
    return res.status(400).json({ ok: false, msg: 'Missing Firebase token' });
  }

  try {
    const decoded = await verifyFirebaseIdToken(idToken);
    const phone = normalizePhone(decoded.phone_number || '');
    if (phone.length !== 10) {
      return res.status(400).json({ ok: false, msg: 'Invalid phone in Firebase token' });
    }

    const check = validatePhoneAuth(phone, mode, signupData);
    if (!check.ok) return res.status(check.status).json({ ok: false, msg: check.msg });

    let user = getDb().prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    let isNew = false;

    if (!user) {
      const id = 'u' + Date.now();
      const name = signupData?.name?.trim() || 'Customer';
      const email = signupData?.email?.trim()?.toLowerCase() || `${phone}@flexhealth.local`;
      const createdAt = new Date().toISOString();
      getDb().prepare(`
        INSERT INTO users (id, name, email, phone, created_at) VALUES (?, ?, ?, ?, ?)
      `).run(id, name, email, phone, createdAt);
      user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
      isNew = true;
    }

    const token = signUserToken(user);
    setUserCookie(res, token);

    res.json({
      ok: true,
      isNew,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
      session: { userId: user.id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error('Firebase verify error:', err.message);
    res.status(401).json({ ok: false, msg: 'Invalid or expired Firebase token' });
  }
});

router.post('/send-otp', otpLimiter, async (req, res) => {
  if (isFirebaseEnabled() && USE_FIREBASE) {
    return res.status(400).json({
      ok: false,
      msg: 'Use Firebase OTP on the login page (enable firebase-config.js)'
    });
  }

  if (!otpDeliveryAvailable()) {
    return res.status(503).json({
      ok: false,
      msg: 'OTP delivery not configured. Set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID, or enable Firebase auth.'
    });
  }

  const phone = normalizePhone(req.body.phone);
  const mode = req.body.mode || 'login';
  const signupData = req.body.signupData || null;

  const check = validatePhoneAuth(phone, mode, signupData);
  if (!check.ok) return res.status(check.status).json({ ok: false, msg: check.msg });

  const otp = isTestMode() ? (process.env.TEST_OTP || '123456') : generateOtp();
  const expires = Date.now() + 5 * 60 * 1000;

  getDb().prepare(`
    INSERT INTO otp_codes (phone, code, mode, signup_name, signup_email, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(phone) DO UPDATE SET
      code = excluded.code, mode = excluded.mode,
      signup_name = excluded.signup_name, signup_email = excluded.signup_email,
      expires_at = excluded.expires_at
  `).run(
    phone, otp, mode,
    signupData?.name?.trim() || null,
    signupData?.email?.trim()?.toLowerCase() || null,
    expires
  );

  try {
    if (!isTestMode()) {
      await sendOtpSms(phone, otp);
    }
  } catch (err) {
    console.error('SMS send error:', err.message);
    return res.status(502).json({ ok: false, msg: err.message });
  }

  const payload = { ok: true, phone, msg: 'OTP sent to your mobile number' };
  if (isTestMode()) payload.otp = otp;
  res.json(payload);
});

router.post('/verify-otp', authLimiter, (req, res) => {
  if (isFirebaseEnabled() && USE_FIREBASE) {
    return res.status(400).json({ ok: false, msg: 'Use Firebase OTP verification' });
  }

  const phone = normalizePhone(req.body.phone);
  const code = String(req.body.otp || '').trim();
  const pending = getDb().prepare('SELECT * FROM otp_codes WHERE phone = ?').get(phone);

  const testOtp = process.env.TEST_OTP || '123456';
  const validTest = isTestMode() && code === testOtp;
  const validOtp = pending && Date.now() <= pending.expires_at && pending.code === code;

  if (!validTest && !validOtp) {
    return res.status(400).json({ ok: false, msg: 'Invalid or expired OTP.' });
  }

  let user = getDb().prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  let isNew = false;

  if (!user) {
    const mode = pending?.mode || 'signup';
    if (mode !== 'signup' && !validTest) {
      return res.status(404).json({ ok: false, msg: 'Account not found. Please sign up first.' });
    }
    const id = 'u' + Date.now();
    const name = pending?.signup_name || req.body.name || 'Customer';
    const email = pending?.signup_email || `${phone}@flexhealth.local`;
    const createdAt = new Date().toISOString();
    getDb().prepare(`
      INSERT INTO users (id, name, email, phone, created_at) VALUES (?, ?, ?, ?, ?)
    `).run(id, name, email, phone, createdAt);
    user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
    isNew = true;
  }

  getDb().prepare('DELETE FROM otp_codes WHERE phone = ?').run(phone);

  const token = signUserToken(user);
  setUserCookie(res, token);

  res.json({
    ok: true,
    isNew,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    session: { userId: user.id, name: user.name, email: user.email, phone: user.phone }
  });
});

router.post('/test-login', (req, res) => {
  if (!isTestMode()) {
    return res.status(403).json({ ok: false, msg: 'Test login disabled' });
  }
  const phone = '9876543210';
  let user = getDb().prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user) {
    const id = 'u_test_demo';
    getDb().prepare(`
      INSERT INTO users (id, name, email, phone, address, city, pincode, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, 'Test User', 'test@flexhealth.local', phone, '123 Test Street', 'Hyderabad', '500034', new Date().toISOString());
    user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
  }
  const token = signUserToken(user);
  setUserCookie(res, token);
  res.json({
    ok: true,
    user,
    session: { userId: user.id, name: user.name, email: user.email, phone: user.phone }
  });
});

router.get('/me', authUserOptional, (req, res) => {
  if (!req.user) return res.json({ ok: true, session: null });
  const user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub);
  if (!user) return res.json({ ok: true, session: null });
  res.json({
    ok: true,
    session: { userId: user.id, name: user.name, email: user.email, phone: user.phone },
    user
  });
});

router.patch('/profile', authUser, (req, res) => {
  const { name, address, city, pincode } = req.body;
  getDb().prepare(`
    UPDATE users SET name = COALESCE(?, name), address = COALESCE(?, address),
    city = COALESCE(?, city), pincode = COALESCE(?, pincode) WHERE id = ?
  `).run(
    name?.trim()?.slice(0, 120) || null,
    address?.trim()?.slice(0, 500) || null,
    city?.trim()?.slice(0, 80) || null,
    pincode ? String(pincode).replace(/\D/g, '').slice(0, 6) : null,
    req.user.sub
  );
  const user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub);
  res.json({ ok: true, user });
});

router.post('/logout', (_req, res) => {
  clearUserCookie(res);
  res.json({ ok: true });
});

export default router;
