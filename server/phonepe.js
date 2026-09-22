const SANDBOX_AUTH = 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';
const PROD_AUTH = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
const SANDBOX_API = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const PROD_API = 'https://api.phonepe.com/apis/pg';

let cachedToken = null;
let tokenExpiresAt = 0;

function isSandbox() {
  return process.env.PHONEPE_ENV !== 'production';
}

function getApiBase() {
  return isSandbox() ? SANDBOX_API : PROD_API;
}

function getAuthUrl() {
  return isSandbox() ? SANDBOX_AUTH : PROD_AUTH;
}

export function isPhonePeEnabled() {
  return !!(process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET);
}

export function getPhonePePublicConfig() {
  return {
    enabled: isPhonePeEnabled(),
    environment: isSandbox() ? 'sandbox' : 'production'
  };
}

export function getAppBaseUrl() {
  return (process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
}

async function getAccessToken() {
  if (!isPhonePeEnabled()) {
    throw new Error('PhonePe not configured — set PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET in server/.env');
  }
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

  const body = new URLSearchParams({
    client_id: process.env.PHONEPE_CLIENT_ID,
    client_version: process.env.PHONEPE_CLIENT_VERSION || '1',
    client_secret: process.env.PHONEPE_CLIENT_SECRET,
    grant_type: 'client_credentials'
  });

  const res = await fetch(getAuthUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data.message || data.error || 'PhonePe authentication failed');
  }

  cachedToken = data.access_token;
  tokenExpiresAt = data.expires_at ? data.expires_at * 1000 : Date.now() + 3_600_000;
  return cachedToken;
}

async function phonePeRequest(path, options = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `O-Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.code || 'PhonePe request failed');
  }
  return data;
}

export async function createPhonePePayment({ merchantOrderId, amountInr, redirectUrl, meta = {} }) {
  const amountPaise = Math.round(Number(amountInr) * 100);
  if (amountPaise < 100) throw new Error('Minimum order amount is ₹1');

  const data = await phonePeRequest('/checkout/v2/pay', {
    method: 'POST',
    body: JSON.stringify({
      merchantOrderId: String(merchantOrderId).slice(0, 63),
      amount: amountPaise,
      expireAfter: 1200,
      metaInfo: {
        udf1: meta.orderId || '',
        udf2: meta.paymentId || ''
      },
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: 'Flex Health order payment',
        merchantUrls: { redirectUrl }
      }
    })
  });

  const redirect =
    data.redirectUrl ||
    data.redirect_url ||
    data.data?.redirectUrl ||
    data.data?.instrumentResponse?.redirectInfo?.url ||
    null;
  const orderId = data.orderId || data.data?.orderId || data.merchantOrderId || merchantOrderId;

  if (!redirect) {
    throw new Error(data.message || data.code || 'PhonePe did not return a checkout URL');
  }

  return { ...data, orderId, redirectUrl: redirect };
}

export async function getPhonePeOrderStatus(merchantOrderId) {
  return phonePeRequest(
    `/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false`
  );
}

export function isPhonePePaymentCompleted(status) {
  if (!status) return false;
  if (status.state === 'COMPLETED') return true;
  return (status.paymentDetails || []).some(p => p.state === 'COMPLETED');
}

export function getPhonePeTransactionId(status) {
  const completed = (status.paymentDetails || []).find(p => p.state === 'COMPLETED');
  return completed?.transactionId || status.orderId || null;
}

export async function refundPhonePePayment({ merchantOrderId, amountInr, merchantRefundId }) {
  const amountPaise = Math.round(Number(amountInr) * 100);
  return phonePeRequest('/payments/v2/refund', {
    method: 'POST',
    body: JSON.stringify({
      merchantRefundId: String(merchantRefundId).slice(0, 63),
      originalMerchantOrderId: String(merchantOrderId).slice(0, 63),
      amount: amountPaise
    })
  });
}
