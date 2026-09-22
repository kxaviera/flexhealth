const STAGING_BASE = 'https://staging-express.delhivery.com';
const PROD_BASE = 'https://track.delhivery.com';

function isEnabled() {
  return !!process.env.DELHIVERY_API_TOKEN;
}

function getApiBase() {
  return process.env.DELHIVERY_ENV === 'staging' ? STAGING_BASE : PROD_BASE;
}

export function getDelhiveryConfig() {
  return {
    enabled: isEnabled(),
    pickupLocation: process.env.DELHIVERY_PICKUP_LOCATION || 'Primary',
    clientName: process.env.DELHIVERY_CLIENT_NAME || '',
    defaultWeightKg: Number(process.env.DELHIVERY_DEFAULT_WEIGHT_KG || 0.5),
    environment: process.env.DELHIVERY_ENV === 'staging' ? 'staging' : 'production'
  };
}

async function delhiveryRequest(path, options = {}) {
  const token = process.env.DELHIVERY_API_TOKEN;
  if (!token) {
    throw new Error('Delhivery not configured — set DELHIVERY_API_TOKEN in server/.env');
  }

  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers: {
      Authorization: `Token ${token}`,
      ...(options.headers || {})
    }
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(data?.rmk || data?.error || data?.message || 'Delhivery request failed');
  }
  return data;
}

export async function checkServiceability(pincode, { cod = true } = {}) {
  if (!isEnabled()) {
    return {
      ok: true,
      available: true,
      codAvailable: true,
      shippingCharge: 0,
      estimatedDays: '3-7',
      source: 'default'
    };
  }

  const data = await delhiveryRequest(`/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(pincode)}`);
  const entry = (data.delivery_codes || []).find(
    row => String(row.pin) === String(pincode)
  ) || data.delivery_codes?.[0];

  const prepaid = entry?.pre_paid === 'Y' || entry?.prepaid === 'Y' || entry?.pre_paid === true;
  const codOk = entry?.cod === 'Y' || entry?.cod === true;
  const available = !!(entry && (prepaid || codOk));

  return {
    ok: true,
    available,
    codAvailable: codOk,
    shippingCharge: 0,
    estimatedDays: '3-7',
    courier: 'Delhivery',
    source: 'delhivery'
  };
}

export async function createShipmentForOrder(order) {
  const cfg = getDelhiveryConfig();
  const customer = order.customer || {};
  const items = order.items || [];
  const totalQty = items.reduce((s, i) => s + (i.qty || 1), 0) || 1;
  const weight = Math.max(cfg.defaultWeightKg, totalQty * cfg.defaultWeightKg);
  const isCod = order.payment === 'cod' || order.paymentStatus === 'cod';

  const shipment = {
    name: (customer.name || 'Customer').slice(0, 100),
    add: (customer.address || '').slice(0, 250),
    pin: String(customer.pincode || '').replace(/\D/g, '').slice(0, 6),
    city: (customer.city || '').slice(0, 80),
    state: customer.state || 'Telangana',
    country: 'India',
    phone: String(customer.phone || '').replace(/\D/g, '').slice(-10),
    order: order.id,
    payment_mode: isCod ? 'COD' : 'Prepaid',
    cod_amount: isCod ? String(Math.round(order.total)) : '0',
    total_amount: String(Math.round(order.total)),
    quantity: String(totalQty),
    products_desc: items.map(i => i.name).join(', ').slice(0, 200) || 'Supplements',
    weight: String(weight)
  };

  const payload = {
    shipments: [shipment],
    pickup_location: { name: cfg.pickupLocation }
  };

  const body = `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`;
  const data = await delhiveryRequest('/api/cmv/create.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const pkg = data.packages?.[0] || data.package?.[0] || {};
  const waybill = pkg.waybill || data.waybill || null;

  return {
    delhiveryOrderId: waybill || order.id,
    awb: waybill,
    courierName: 'Delhivery',
    trackingUrl: waybill ? `https://www.delhivery.com/track/package/${waybill}` : null
  };
}

export async function trackShipment(awb) {
  if (!awb || !isEnabled()) return null;
  return delhiveryRequest(`/api/v1/packages/json/?waybill=${encodeURIComponent(awb)}`);
}
