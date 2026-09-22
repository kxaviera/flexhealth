import { Router } from 'express';
import { authAdmin } from '../middleware/auth.js';
import { loadCatalog, saveCatalog, slugId, defaultSiteSettings } from '../db.js';
import { normalizePromoCode, normalizePromoInput } from '../promo.js';

const router = Router();

router.use(authAdmin);

function readCatalog() {
  const catalog = loadCatalog();
  if (!catalog.siteSettings) catalog.siteSettings = defaultSiteSettings();
  return catalog;
}

router.get('/', (_req, res) => {
  res.json({ ok: true, catalog: readCatalog() });
});

router.put('/', (req, res) => {
  const { catalog } = req.body;
  if (!catalog || typeof catalog !== 'object') {
    return res.status(400).json({ ok: false, msg: 'Catalog object required' });
  }
  const saved = saveCatalog(catalog);
  res.json({ ok: true, catalog: saved });
});

// ── Products ──
router.post('/products', (req, res) => {
  const catalog = readCatalog();
  const p = req.body;
  if (!p.name || p.price == null) {
    return res.status(400).json({ ok: false, msg: 'Name and price required' });
  }
  const id = p.id || slugId(p.name);
  if (catalog.products.some(x => x.id === id)) {
    return res.status(409).json({ ok: false, msg: 'Product ID already exists' });
  }
  const product = normalizeProduct({ ...p, id });
  catalog.products.unshift(product);
  saveCatalog(catalog);
  res.json({ ok: true, product });
});

router.put('/products/:id', (req, res) => {
  const catalog = readCatalog();
  const idx = catalog.products.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ ok: false, msg: 'Product not found' });
  catalog.products[idx] = normalizeProduct({ ...catalog.products[idx], ...req.body, id: req.params.id });
  saveCatalog(catalog);
  res.json({ ok: true, product: catalog.products[idx] });
});

router.delete('/products/:id', (req, res) => {
  const catalog = readCatalog();
  const before = catalog.products.length;
  catalog.products = catalog.products.filter(p => p.id !== req.params.id);
  if (catalog.products.length === before) {
    return res.status(404).json({ ok: false, msg: 'Product not found' });
  }
  saveCatalog(catalog);
  res.json({ ok: true });
});

// ── Categories ──
router.post('/categories', (req, res) => {
  const catalog = readCatalog();
  const c = req.body;
  if (!c.name) return res.status(400).json({ ok: false, msg: 'Name required' });
  const id = c.id || slugId(c.name);
  if (catalog.categories.some(x => x.id === id)) {
    return res.status(409).json({ ok: false, msg: 'Category ID exists' });
  }
  const category = { id, name: c.name, icon: c.icon || '📦', desc: c.desc || '' };
  catalog.categories.push(category);
  saveCatalog(catalog);
  res.json({ ok: true, category });
});

router.put('/categories/:id', (req, res) => {
  const catalog = readCatalog();
  const idx = catalog.categories.findIndex(c => c.id === req.params.id);
  if (idx < 0) return res.status(404).json({ ok: false, msg: 'Not found' });
  catalog.categories[idx] = { ...catalog.categories[idx], ...req.body, id: req.params.id };
  saveCatalog(catalog);
  res.json({ ok: true, category: catalog.categories[idx] });
});

router.delete('/categories/:id', (req, res) => {
  const catalog = readCatalog();
  catalog.categories = catalog.categories.filter(c => c.id !== req.params.id);
  saveCatalog(catalog);
  res.json({ ok: true });
});

// ── Brands ──
router.post('/brands', (req, res) => {
  const catalog = readCatalog();
  const b = req.body;
  if (!b.name) return res.status(400).json({ ok: false, msg: 'Name required' });
  const id = b.id || slugId(b.name);
  if (catalog.brands.some(x => x.id === id)) {
    return res.status(409).json({ ok: false, msg: 'Brand ID exists' });
  }
  const brand = {
    id,
    name: b.name,
    logo: b.logo || '',
    categories: Array.isArray(b.categories) ? b.categories : []
  };
  catalog.brands.push(brand);
  saveCatalog(catalog);
  res.json({ ok: true, brand });
});

router.put('/brands/:id', (req, res) => {
  const catalog = readCatalog();
  const idx = catalog.brands.findIndex(b => b.id === req.params.id);
  if (idx < 0) return res.status(404).json({ ok: false, msg: 'Not found' });
  catalog.brands[idx] = { ...catalog.brands[idx], ...req.body, id: req.params.id };
  saveCatalog(catalog);
  res.json({ ok: true, brand: catalog.brands[idx] });
});

router.delete('/brands/:id', (req, res) => {
  const catalog = readCatalog();
  catalog.brands = catalog.brands.filter(b => b.id !== req.params.id);
  saveCatalog(catalog);
  res.json({ ok: true });
});

// ── Hero banners ──
router.post('/banners', (req, res) => {
  const catalog = readCatalog();
  const banner = normalizeBanner(req.body);
  if (!banner.title) return res.status(400).json({ ok: false, msg: 'Title required' });
  catalog.banners.push(banner);
  saveCatalog(catalog);
  res.json({ ok: true, banner, index: catalog.banners.length - 1 });
});

router.put('/banners/:index', (req, res) => {
  const catalog = readCatalog();
  const idx = +req.params.index;
  if (idx < 0 || idx >= catalog.banners.length) {
    return res.status(404).json({ ok: false, msg: 'Not found' });
  }
  catalog.banners[idx] = normalizeBanner({ ...catalog.banners[idx], ...req.body });
  saveCatalog(catalog);
  res.json({ ok: true, banner: catalog.banners[idx], index: idx });
});

router.delete('/banners/:index', (req, res) => {
  const catalog = readCatalog();
  const idx = +req.params.index;
  if (idx < 0 || idx >= catalog.banners.length) {
    return res.status(404).json({ ok: false, msg: 'Not found' });
  }
  catalog.banners.splice(idx, 1);
  saveCatalog(catalog);
  res.json({ ok: true });
});

// ── Offer banners ──
router.post('/offer-banners', (req, res) => {
  const catalog = readCatalog();
  const item = normalizeOfferBanner(req.body);
  if (!item.productId) return res.status(400).json({ ok: false, msg: 'Product required' });
  catalog.offerBanners.push(item);
  saveCatalog(catalog);
  res.json({ ok: true, offerBanner: item, index: catalog.offerBanners.length - 1 });
});

router.put('/offer-banners/:index', (req, res) => {
  const catalog = readCatalog();
  const idx = +req.params.index;
  if (idx < 0 || idx >= catalog.offerBanners.length) {
    return res.status(404).json({ ok: false, msg: 'Not found' });
  }
  catalog.offerBanners[idx] = normalizeOfferBanner({ ...catalog.offerBanners[idx], ...req.body });
  saveCatalog(catalog);
  res.json({ ok: true, offerBanner: catalog.offerBanners[idx], index: idx });
});

router.delete('/offer-banners/:index', (req, res) => {
  const catalog = readCatalog();
  const idx = +req.params.index;
  if (idx < 0 || idx >= catalog.offerBanners.length) return res.status(404).json({ ok: false, msg: 'Not found' });
  catalog.offerBanners.splice(idx, 1);
  saveCatalog(catalog);
  res.json({ ok: true });
});

// ── Promo slides ──
router.post('/promo-slides', (req, res) => {
  const catalog = readCatalog();
  const item = normalizePromoSlide(req.body);
  if (!item.productId) return res.status(400).json({ ok: false, msg: 'Product required' });
  catalog.promoSlides.push(item);
  saveCatalog(catalog);
  res.json({ ok: true, promoSlide: item, index: catalog.promoSlides.length - 1 });
});

router.put('/promo-slides/:index', (req, res) => {
  const catalog = readCatalog();
  const idx = +req.params.index;
  if (idx < 0 || idx >= catalog.promoSlides.length) {
    return res.status(404).json({ ok: false, msg: 'Not found' });
  }
  catalog.promoSlides[idx] = normalizePromoSlide({ ...catalog.promoSlides[idx], ...req.body });
  saveCatalog(catalog);
  res.json({ ok: true, promoSlide: catalog.promoSlides[idx], index: idx });
});

router.delete('/promo-slides/:index', (req, res) => {
  const catalog = readCatalog();
  const idx = +req.params.index;
  if (idx < 0 || idx >= catalog.promoSlides.length) return res.status(404).json({ ok: false, msg: 'Not found' });
  catalog.promoSlides.splice(idx, 1);
  saveCatalog(catalog);
  res.json({ ok: true });
});

// ── Homepage testimonials ──
router.post('/reviews', (req, res) => {
  const catalog = readCatalog();
  const r = req.body;
  if (!r.name || !r.text) return res.status(400).json({ ok: false, msg: 'Name and text required' });
  const review = { name: r.name, text: r.text, rating: Math.min(5, Math.max(1, +r.rating || 5)) };
  catalog.reviews.push(review);
  saveCatalog(catalog);
  res.json({ ok: true, review, index: catalog.reviews.length - 1 });
});

router.put('/reviews/:index', (req, res) => {
  const catalog = readCatalog();
  const idx = +req.params.index;
  if (idx < 0 || idx >= catalog.reviews.length) return res.status(404).json({ ok: false, msg: 'Not found' });
  catalog.reviews[idx] = {
    ...catalog.reviews[idx],
    ...req.body,
    rating: Math.min(5, Math.max(1, +(req.body.rating ?? catalog.reviews[idx].rating) || 5))
  };
  saveCatalog(catalog);
  res.json({ ok: true, review: catalog.reviews[idx], index: idx });
});

router.delete('/reviews/:index', (req, res) => {
  const catalog = readCatalog();
  const idx = +req.params.index;
  if (idx < 0 || idx >= catalog.reviews.length) return res.status(404).json({ ok: false, msg: 'Not found' });
  catalog.reviews.splice(idx, 1);
  saveCatalog(catalog);
  res.json({ ok: true });
});

// ── Promo codes (checkout discounts) ──
router.post('/promo-codes', (req, res) => {
  const catalog = readCatalog();
  catalog.promoCodes = catalog.promoCodes || [];
  const promo = normalizePromoInput(req.body);
  if (!promo) return res.status(400).json({ ok: false, msg: 'Promo code required' });
  if (catalog.promoCodes.some(p => normalizePromoCode(p.code) === promo.code)) {
    return res.status(409).json({ ok: false, msg: 'Promo code already exists' });
  }
  catalog.promoCodes.unshift(promo);
  saveCatalog(catalog);
  res.json({ ok: true, promoCode: promo });
});

router.put('/promo-codes/:code', (req, res) => {
  const catalog = readCatalog();
  catalog.promoCodes = catalog.promoCodes || [];
  const target = normalizePromoCode(req.params.code);
  const idx = catalog.promoCodes.findIndex(p => normalizePromoCode(p.code) === target);
  if (idx < 0) return res.status(404).json({ ok: false, msg: 'Promo code not found' });
  const promo = normalizePromoInput({ ...catalog.promoCodes[idx], ...req.body, code: req.body.code || catalog.promoCodes[idx].code });
  if (!promo) return res.status(400).json({ ok: false, msg: 'Invalid promo code' });
  catalog.promoCodes[idx] = promo;
  saveCatalog(catalog);
  res.json({ ok: true, promoCode: promo });
});

router.delete('/promo-codes/:code', (req, res) => {
  const catalog = readCatalog();
  catalog.promoCodes = catalog.promoCodes || [];
  const target = normalizePromoCode(req.params.code);
  const before = catalog.promoCodes.length;
  catalog.promoCodes = catalog.promoCodes.filter(p => normalizePromoCode(p.code) !== target);
  if (catalog.promoCodes.length === before) {
    return res.status(404).json({ ok: false, msg: 'Promo code not found' });
  }
  saveCatalog(catalog);
  res.json({ ok: true });
});

// ── Site settings ──
router.put('/site-settings', (req, res) => {
  const catalog = readCatalog();
  catalog.siteSettings = { ...defaultSiteSettings(), ...catalog.siteSettings, ...req.body };
  saveCatalog(catalog);
  res.json({ ok: true, siteSettings: catalog.siteSettings });
});

function normalizeProduct(p) {
  return {
    id: p.id,
    slug: p.slug || slugId(p.name),
    name: String(p.name).trim(),
    brand: p.brand || '',
    brandId: p.brandId || slugId(p.brand || 'brand'),
    category: p.category || 'whey',
    price: +p.price || 0,
    originalPrice: p.originalPrice != null && p.originalPrice !== '' ? +p.originalPrice : null,
    badge: p.badge || '',
    rating: +p.rating || 0,
    reviews: +p.reviews || 0,
    inStock: p.inStock !== false,
    isSale: !!p.isSale,
    isNew: !!p.isNew,
    isPopular: !!p.isPopular,
    image: p.image || 'images/products/placeholder.png',
    imageUrl: p.imageUrl || '',
    sku: p.sku || String(p.id).toUpperCase(),
    shortDescription: p.shortDescription || '',
    description: p.description || ''
  };
}

function normalizeBanner(b) {
  return {
    title: b.title || '',
    subtitle: b.subtitle || '',
    cta: b.cta || 'Shop Now',
    link: b.link || 'shop.html',
    tag: b.tag || 'Flex Health',
    image: b.image || 'images/banners/hero-1.jpg'
  };
}

function normalizeOfferBanner(o) {
  return {
    productId: o.productId,
    theme: o.theme || 'default',
    tag: o.tag || 'Special Offer',
    headline: o.headline || '',
    subline: o.subline || ''
  };
}

function normalizePromoSlide(s) {
  return {
    productId: s.productId,
    type: s.type || 'daily',
    label: s.label || 'Special Offer',
    headline: s.headline || '',
    subline: s.subline || ''
  };
}

export default router;
