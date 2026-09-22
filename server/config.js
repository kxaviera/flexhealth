const WEAK_SECRETS = new Set([
  'flexhealth-dev-secret-change-me',
  'change-this-to-a-long-random-string-in-production'
]);

export function isTestMode() {
  return process.env.TEST_MODE === 'true';
}

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET || '';
  if (!secret || WEAK_SECRETS.has(secret)) {
    if (isProduction() || !isTestMode()) {
      throw new Error(
        'JWT_SECRET is missing or weak. Set a random string of at least 32 characters in server/.env'
      );
    }
    return 'flexhealth-dev-secret-change-me';
  }
  if (secret.length < 32 && !isTestMode()) {
    throw new Error('JWT_SECRET must be at least 32 characters when TEST_MODE is not true');
  }
  return secret;
}

function isWeakAdminPassword(password) {
  const p = String(password || '');
  if (!p || p.length < 12) return true;
  if (p === 'admin123') return true;
  if (/change.?me/i.test(p)) return true;
  if (/^password/i.test(p)) return true;
  return false;
}

export function validateProductionConfig() {
  const warnings = [];
  if (isTestMode()) {
    warnings.push('TEST_MODE=true — disable before public launch (set TEST_MODE=false)');
  }
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!isTestMode() && isWeakAdminPassword(adminPassword)) {
    warnings.push('ADMIN_PASSWORD is weak/placeholder — set a strong password (12+ chars) in server/.env');
  }
  const otpReady =
    process.env.TEST_MODE === 'true' ||
    !!(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) ||
    (process.env.FIREBASE_AUTH !== 'false' && process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (!isTestMode() && !otpReady) {
    warnings.push('OTP login unavailable — configure MSG91 or Firebase (guest checkout still works)');
  }
  if (!process.env.DELHIVERY_API_TOKEN && !(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD)) {
    warnings.push('Shipping: set SHIPROCKET_PASSWORD (API user) for live rates/AWB, or DELHIVERY_API_TOKEN — using fallback rates until then');
  }
  if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_REALTIME !== 'false' && !process.env.SHIPROCKET_PASSWORD) {
    warnings.push('Shiprocket realtime rates need SHIPROCKET_PASSWORD (create API user in Shiprocket panel) — using ₹ fallback rate');
  }
  if (process.env.SHIPROCKET_EMAIL && !String(process.env.SHIPROCKET_PICKUP_POSTCODE || '').replace(/\D/g, '')) {
    warnings.push('SHIPROCKET_PICKUP_POSTCODE empty — set your warehouse pincode for accurate courier rates');
  }
  const appUrl = process.env.APP_URL || '';
  if (process.env.PHONEPE_CLIENT_ID && (!appUrl || /localhost|127\.0\.0\.1/i.test(appUrl))) {
    warnings.push('APP_URL is localhost — set your public HTTPS URL so PhonePe can redirect back after payment');
  }
  return warnings;
}

export { isWeakAdminPassword };
