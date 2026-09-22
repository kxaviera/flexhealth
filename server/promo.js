import { loadCatalog, saveCatalog } from './db.js';

export function normalizePromoCode(code) {
  return String(code || '').trim().toUpperCase();
}

export function findPromo(catalog, code) {
  const normalized = normalizePromoCode(code);
  return (catalog.promoCodes || []).find(
    p => normalizePromoCode(p.code) === normalized && p.enabled !== false
  );
}

export function calculateDiscount(promo, subtotal) {
  if (!promo || subtotal <= 0) return 0;
  if (promo.minOrder && subtotal < promo.minOrder) return 0;

  let discount = 0;
  if (promo.type === 'percent') {
    discount = subtotal * (Number(promo.value) / 100);
    if (promo.maxDiscount != null && promo.maxDiscount !== '') {
      discount = Math.min(discount, Number(promo.maxDiscount));
    }
  } else {
    discount = Number(promo.value) || 0;
  }
  return Math.min(Math.round(discount * 100) / 100, subtotal);
}

export function validatePromo(catalog, code, subtotal) {
  const promo = findPromo(catalog, code);
  if (!promo) return { ok: false, msg: 'Invalid promo code' };

  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return { ok: false, msg: 'This promo code has expired' };
  }
  if (promo.maxUses != null && promo.maxUses !== '' && (promo.usedCount || 0) >= Number(promo.maxUses)) {
    return { ok: false, msg: 'This promo code has reached its usage limit' };
  }
  if (promo.minOrder && subtotal < Number(promo.minOrder)) {
    return { ok: false, msg: `Minimum order of ₹${Number(promo.minOrder).toLocaleString('en-IN')} required` };
  }

  const discountAmount = calculateDiscount(promo, subtotal);
  if (discountAmount <= 0) {
    return { ok: false, msg: 'Promo code cannot be applied to this order' };
  }

  return {
    ok: true,
    code: normalizePromoCode(promo.code),
    type: promo.type,
    value: promo.value,
    discountAmount,
    subtotal,
    total: Math.round((subtotal - discountAmount) * 100) / 100,
    description: promo.description || ''
  };
}

export function incrementPromoUsage(code) {
  const catalog = loadCatalog();
  const normalized = normalizePromoCode(code);
  const idx = (catalog.promoCodes || []).findIndex(
    p => normalizePromoCode(p.code) === normalized
  );
  if (idx < 0) return;
  catalog.promoCodes[idx].usedCount = (catalog.promoCodes[idx].usedCount || 0) + 1;
  saveCatalog(catalog);
}

export function normalizePromoInput(body) {
  const code = normalizePromoCode(body.code);
  if (!code) return null;
  return {
    code,
    type: body.type === 'fixed' ? 'fixed' : 'percent',
    value: Number(body.value) || 0,
    minOrder: body.minOrder != null && body.minOrder !== '' ? Number(body.minOrder) : 0,
    maxDiscount: body.maxDiscount != null && body.maxDiscount !== '' ? Number(body.maxDiscount) : null,
    maxUses: body.maxUses != null && body.maxUses !== '' ? Number(body.maxUses) : null,
    usedCount: Number(body.usedCount) || 0,
    expiresAt: body.expiresAt || null,
    enabled: body.enabled !== false,
    description: body.description || ''
  };
}
