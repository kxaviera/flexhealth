/**
 * Firebase Phone Authentication (SMS OTP)
 */
const FirebaseAuth = {
  auth: null,
  recaptcha: null,
  confirmationResult: null,

  isEnabled() {
    const c = window.FIREBASE_CONFIG;
    return !!(c?.enabled && c?.apiKey && c?.projectId);
  },

  async init() {
    if (!this.isEnabled()) return false;
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase SDK not loaded');
    }
    if (!firebase.apps.length) {
      const c = window.FIREBASE_CONFIG;
      firebase.initializeApp({
        apiKey: c.apiKey,
        authDomain: c.authDomain,
        projectId: c.projectId,
        storageBucket: c.storageBucket,
        messagingSenderId: c.messagingSenderId,
        appId: c.appId
      });
    }
    this.auth = firebase.auth();
    return true;
  },

  clearRecaptcha() {
    if (this.recaptcha) {
      try { this.recaptcha.clear(); } catch { /* ignore */ }
      this.recaptcha = null;
    }
  },

  setupRecaptcha(containerId = 'firebase-recaptcha') {
    this.clearRecaptcha();
    const el = document.getElementById(containerId);
    if (!el) throw new Error('reCAPTCHA container missing');
    el.innerHTML = '';
    this.recaptcha = new firebase.auth.RecaptchaVerifier(containerId, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        this.clearRecaptcha();
      }
    });
    return this.recaptcha.render();
  },

  async sendOtp(phone) {
    if (!this.auth) await this.init();
    await this.setupRecaptcha();
    const normalized = FlexHealth.normalizePhone(phone);
    if (normalized.length !== 10) {
      throw new Error('Enter a valid 10-digit mobile number');
    }
    const e164 = '+91' + normalized;
    try {
      this.confirmationResult = await this.auth.signInWithPhoneNumber(e164, this.recaptcha);
    } catch (err) {
      this.clearRecaptcha();
      const msg = err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later.'
        : err.code === 'auth/invalid-phone-number'
          ? 'Invalid phone number format.'
          : err.message || 'Could not send OTP';
      throw new Error(msg);
    }
    return { ok: true, phone: normalized, firebase: true };
  },

  async verifyOtp(code) {
    if (!this.confirmationResult) {
      throw new Error('Request OTP first');
    }
    const otp = String(code || '').trim();
    if (otp.length !== 6) {
      throw new Error('Enter the 6-digit OTP');
    }
    try {
      const cred = await this.confirmationResult.confirm(otp);
      const idToken = await cred.user.getIdToken();
      return { ok: true, idToken, phone: cred.user.phoneNumber };
    } catch (err) {
      const msg = err.code === 'auth/invalid-verification-code'
        ? 'Invalid OTP. Please try again.'
        : err.code === 'auth/code-expired'
          ? 'OTP expired. Request a new one.'
          : err.message || 'Verification failed';
      throw new Error(msg);
    }
  },

  async signOut() {
    if (this.auth) {
      try { await this.auth.signOut(); } catch { /* ignore */ }
    }
    this.confirmationResult = null;
    this.clearRecaptcha();
  }
};
