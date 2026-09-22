const API_BASE = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiresAt = 0;

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function isShiprocketEnabled() {
  return !!(process.env.SHIPROCKET_EMAIL && (process.env.SHIPROCKET_PASSWORD || process.env.SHIPROCKET_INTEGRATION_ID));
}

export function isShiprocketRealtime() {
  return process.env.SHIPROCKET_REALTIME !== 'false' && !!process.env.SHIPROCKET_PASSWORD;
}

export function getShiprocketConfig() {
  const fallbackRate = num(process.env.SHIPROCKET_FALLBACK_RATE, 40);
  const flatRate = num(process.env.SHIPROCKET_FLAT_RATE, fallbackRate);
  return {
    enabled: isShiprocketEnabled(),
    realtime: isShiprocketRealtime(),
    email: process.env.SHIPROCKET_EMAIL || '',
    companyName: process.env.SHIPROCKET_COMPANY_NAME || 'Flex Health',
    integrationId: process.env.SHIPROCKET_INTEGRATION_ID || '',
    pickupPostcode: String(process.env.SHIPROCKET_PICKUP_POSTCODE || '').replace(/\D/g, '').slice(0, 6),
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    fallbackRateTitle: process.env.SHIPROCKET_FALLBACK_TITLE || 'Shipping Rate',
    fallbackRate,
    flatRateTitle: process.env.SHIPROCKET_FLAT_TITLE || 'Flat Rate',
    flatRate,
    zoneWise: process.env.SHIPROCKET_ZONE_WISE !== 'false',
    defaultWeightKg: num(process.env.SHIPROCKET_DEFAULT_WEIGHT_KG || process.env.DELHIVERY_DEFAULT_WEIGHT_KG, 0.5)
  };
}

function fallbackResult({ reason } = {}) {
  const cfg = getShiprocketConfig();
  const rate = cfg.fallbackRate > 0 ? cfg.fallbackRate : cfg.flatRate;
  return {
    ok: true,
    available: true,
    codAvailable: true,
    shippingCharge: rate,
    rateTitle: cfg.fallbackRateTitle,
    estimatedDays: '3-7',
    etd: null,
    courier: 'Shiprocket',
    couriers: [],
    source: reason || 'shiprocket_fallback'
  };
}

async function login() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new Error('Shiprocket API password not set — add SHIPROCKET_PASSWORD (API user from Shiprocket panel)');
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) {
    throw new Error(data.message || data.error || 'Shiprocket login failed');
  }
  cachedToken = data.token;
  // Tokens last ~10 days; refresh a day early
  tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
  return cachedToken;
}

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  return login();
}

async function shiprocketRequest(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error || (Array.isArray(data.errors) ? data.errors.join(', ') : null) || 'Shiprocket request failed';
    // Force re-auth next time on unauthorized
    if (res.status === 401) {
      cachedToken = null;
      tokenExpiresAt = 0;
    }
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

function pickBestCourier(available) {
  if (!Array.isArray(available) || !available.length) return null;
  const ranked = [...available].sort((a, b) => {
    const rateA = num(a.freight_charge ?? a.rate, Infinity);
    const rateB = num(b.freight_charge ?? b.rate, Infinity);
    if (rateA !== rateB) return rateA - rateB;
    return num(a.estimated_delivery_days, 99) - num(b.estimated_delivery_days, 99);
  });
  return ranked[0];
}

/**
 * Check courier serviceability + realtime rate / EDD for a delivery pincode.
 */
export async function checkShiprocketServiceability(deliveryPostcode, {
  cod = true,
  weight,
  declaredValue = 0
} = {}) {
  const cfg = getShiprocketConfig();
  const pin = String(deliveryPostcode || '').replace(/\D/g, '').slice(0, 6);
  if (pin.length !== 6) {
    return { ok: false, available: false, msg: 'Valid 6-digit pincode required' };
  }

  if (!cfg.enabled) {
    return fallbackResult({ reason: 'default' });
  }

  if (!isShiprocketRealtime() || !cfg.pickupPostcode) {
    return fallbackResult({ reason: cfg.pickupPostcode ? 'shiprocket_fallback' : 'shiprocket_no_pickup' });
  }

  try {
    const w = Math.max(0.1, num(weight, cfg.defaultWeightKg));
    const qs = new URLSearchParams({
      pickup_postcode: cfg.pickupPostcode,
      delivery_postcode: pin,
      cod: cod ? '1' : '0',
      weight: String(w)
    });
    if (declaredValue > 0) qs.set('declared_value', String(Math.round(declaredValue)));

    const data = await shiprocketRequest(`/courier/serviceability/?${qs}`);
    const available = data.data?.available_courier_companies || data.available_courier_companies || [];
    const best = pickBestCourier(available);

    if (!best) {
      return {
        ...fallbackResult({ reason: 'shiprocket_unserviceable_fallback' }),
        available: false,
        msg: 'Delivery may not be available to this pincode'
      };
    }

    const charge = Math.round(num(best.freight_charge ?? best.rate, cfg.fallbackRate));
    const days = best.estimated_delivery_days != null
      ? String(best.estimated_delivery_days)
      : (best.etd ? null : '3-7');

    return {
      ok: true,
      available: true,
      codAvailable: true,
      shippingCharge: charge,
      rateTitle: best.courier_name || cfg.fallbackRateTitle,
      estimatedDays: days || '3-7',
      etd: best.etd || null,
      courier: best.courier_name || 'Shiprocket',
      courierCompanyId: best.courier_company_id || best.id || null,
      couriers: available.slice(0, 8).map(c => ({
        id: c.courier_company_id || c.id,
        name: c.courier_name,
        rate: Math.round(num(c.freight_charge ?? c.rate, 0)),
        etd: c.etd || null,
        days: c.estimated_delivery_days ?? null
      })),
      source: 'shiprocket'
    };
  } catch (err) {
    console.warn('Shiprocket serviceability:', err.message);
    return fallbackResult({ reason: 'shiprocket_error_fallback' });
  }
}

export async function createShiprocketShipment(order) {
  const cfg = getShiprocketConfig();
  if (!isShiprocketRealtime()) {
    throw new Error('Shiprocket API password required to create shipments — set SHIPROCKET_PASSWORD in server/.env');
  }

  const customer = order.customer || {};
  const items = order.items || [];
  const isCod = order.payment === 'cod' || order.paymentStatus === 'cod';
  const nameParts = String(customer.name || 'Customer').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || firstName;
  const phone = String(customer.phone || '').replace(/\D/g, '').slice(-10);
  const weight = Math.max(cfg.defaultWeightKg, items.reduce((s, i) => s + (i.qty || 1), 0) * cfg.defaultWeightKg);

  const payload = {
    order_id: String(order.id),
    order_date: (order.date || new Date().toISOString()).slice(0, 19).replace('T', ' '),
    pickup_location: cfg.pickupLocation,
    channel_id: cfg.integrationId || undefined,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: (customer.address || '').slice(0, 190),
    billing_city: (customer.city || '').slice(0, 80) || 'Hyderabad',
    billing_pincode: String(customer.pincode || '').replace(/\D/g, '').slice(0, 6),
    billing_state: customer.state || 'Telangana',
    billing_country: 'India',
    billing_email: customer.email || process.env.SHIPROCKET_EMAIL || 'orders@flexhealth.in',
    billing_phone: phone,
    shipping_is_billing: true,
    order_items: items.map(i => ({
      name: String(i.name || 'Product').slice(0, 200),
      sku: String(i.id || 'SKU').slice(0, 50),
      units: i.qty || 1,
      selling_price: String(Math.round(i.price || 0)),
      discount: '',
      tax: '',
      hsn: ''
    })),
    payment_method: isCod ? 'COD' : 'Prepaid',
    shipping_charges: num(order.shippingCost, 0),
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: num(order.discountAmount, 0),
    sub_total: Math.round(num(order.subtotal ?? order.total, 0)),
    length: num(process.env.SHIPROCKET_DEFAULT_LENGTH, 15),
    breadth: num(process.env.SHIPROCKET_DEFAULT_BREADTH, 10),
    height: num(process.env.SHIPROCKET_DEFAULT_HEIGHT, 10),
    weight
  };

  if (!payload.channel_id) delete payload.channel_id;

  const data = await shiprocketRequest('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const srOrderId = data.order_id || data.order_id_shiprocket || data.shipment_id;
  const shipmentId = data.shipment_id;
  let awb = data.awb_code || null;
  let courierName = data.courier_name || 'Shiprocket';
  let trackingUrl = awb ? `https://shiprocket.co/tracking/${awb}` : null;

  if (shipmentId && !awb) {
    try {
      const assign = await shiprocketRequest('/courier/assign/awb', {
        method: 'POST',
        body: JSON.stringify({ shipment_id: shipmentId })
      });
      const resp = assign.response?.data || assign.data || assign;
      awb = resp.awb_code || resp.awb || awb;
      courierName = resp.courier_name || courierName;
      trackingUrl = awb ? `https://shiprocket.co/tracking/${awb}` : trackingUrl;
    } catch (err) {
      console.warn('Shiprocket AWB assign:', err.message);
    }
  }

  return {
    shiprocketOrderId: srOrderId ? String(srOrderId) : String(order.id),
    shipmentId: shipmentId ? String(shipmentId) : null,
    awb,
    courierName,
    trackingUrl
  };
}
