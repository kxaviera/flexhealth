import { loadCatalog } from './db.js';
import {
  normalizeCode,
  isVerificationCodeValid,
  loadVerificationCodes,
  addVerificationCode,
  deleteVerificationCode as removeVerificationCode,
  listVerificationCodes as listCodesFromStore
} from './verification-codes-store.js';

export function normalizeVerificationInput(raw) {
  return normalizeCode(raw);
}

export function findCatalogProduct(code) {
  const catalog = loadCatalog();
  const normalized = normalizeCode(code);
  if (!normalized) return null;

  return (catalog.products || []).find(p => {
    const id = String(p.id || '').toUpperCase();
    const sku = String(p.sku || '').toUpperCase();
    const slug = String(p.slug || '').toUpperCase();
    return id === normalized || sku === normalized || slug === normalized;
  }) || null;
}

export function getVerificationCode(code) {
  const normalized = normalizeCode(code);
  if (!normalized || !isVerificationCodeValid(normalized)) return null;
  return { code: normalized, product_id: '', batch: '', status: 'active' };
}

export function listVerificationCodes(limit = 200) {
  return listCodesFromStore(limit);
}

export function createVerificationCode({ code }) {
  return addVerificationCode(code);
}

export function deleteVerificationCode(code) {
  return removeVerificationCode(code);
}

function productPayload(product) {
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    sku: product.sku || product.id,
    category: product.category,
    image: product.image || product.imageUrl || '',
    inStock: product.inStock !== false
  };
}

export function verifyProductCode(rawCode) {
  const code = normalizeCode(rawCode);
  if (!code) {
    return { ok: false, status: 'invalid', msg: 'Please enter a verification code' };
  }

  if (isVerificationCodeValid(code)) {
    return {
      ok: true,
      status: 'genuine',
      code,
      msg: 'This verification code is valid. Your product is 100% genuine Flex Health stock.'
    };
  }

  const catalogProduct = findCatalogProduct(code);
  if (catalogProduct) {
    return {
      ok: true,
      status: 'registered',
      code,
      product: productPayload(catalogProduct),
      msg: 'This product SKU is registered in the Flex Health catalog.'
    };
  }

  return {
    ok: false,
    status: 'not_found',
    code,
    msg: 'Code not recognized. Check the label and try again, or contact Flex Health support.'
  };
}

export { loadVerificationCodes };
