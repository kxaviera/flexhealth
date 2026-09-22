import { loadCatalog } from './db.js';

const MAX_QTY = 99;

export function resolveOrderLineItems(clientItems) {
  if (!Array.isArray(clientItems) || !clientItems.length) {
    return { ok: false, status: 400, msg: 'Cart is empty' };
  }

  const catalog = loadCatalog();
  const byId = new Map((catalog.products || []).map(p => [p.id, p]));
  const resolved = [];

  for (const item of clientItems) {
    if (!item?.id) {
      return { ok: false, status: 400, msg: 'Invalid cart item' };
    }

    const product = byId.get(item.id);
    if (!product) {
      return { ok: false, status: 400, msg: `Product not available: ${item.id}` };
    }
    if (product.inStock === false) {
      return { ok: false, status: 400, msg: `Out of stock: ${product.name}` };
    }

    const qty = Math.min(MAX_QTY, Math.max(1, parseInt(item.qty, 10) || 1));
    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, status: 400, msg: `Invalid price for product: ${product.name}` };
    }

    resolved.push({
      id: product.id,
      name: product.name,
      qty,
      price
    });
  }

  return { ok: true, items: resolved };
}
