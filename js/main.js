const SITE_DATA_VERSION = '20260728q';

/** Set true only for local development (disable for production) */
const AUTH_TEST_MODE = false;
const AUTH_TEST_OTP = '123456';
const AUTH_OTP_EXPIRY_MS = 5 * 60 * 1000;
const ADMIN_PIN = '1234';

/** Order lifecycle steps (index = progress) */
const ORDER_PIPELINE = [
  { id: 'placed', label: 'Order Placed', desc: 'We received your order', icon: '📝' },
  { id: 'confirmed', label: 'Order Confirmed', desc: 'Verified & accepted by our team', icon: '✓' },
  { id: 'packed', label: 'Packed', desc: 'Items packed and ready to ship', icon: '📦' },
  { id: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier is on the way', icon: '🚚' },
  { id: 'delivered', label: 'Delivered', desc: 'Order delivered successfully', icon: '🎉' }
];

const FALLBACK_BANNERS = [
  {
    title: 'Fuel Your Fitness Journey',
    subtitle: '100% genuine supplements with free shipping across India and cash on delivery.',
    cta: 'Shop Now',
    link: 'shop.html',
    tag: 'Flex Health',
    image: 'images/banners/hero-1.jpg'
  },
  {
    title: 'Mass Gainer Mega Sale',
    subtitle: 'Up to 35% off on MuscleTech, Rebel Nutrition and more top brands.',
    cta: 'Shop Mass Gainers',
    link: 'shop.html?category=mass-gainer',
    tag: 'Best Deals',
    image: 'images/banners/hero-2.jpg'
  },
  {
    title: 'Whey + Creatine Combos',
    subtitle: 'Premium protein and creatine bundles starting at ₹4,999 — save more when you stack.',
    cta: 'View Combos',
    link: 'shop.html?category=combo',
    tag: 'Super Saver',
    image: 'images/banners/hero-3.jpg'
  },
  {
    title: 'Flash Sale — Up to 40% Off',
    subtitle: 'BCAA, pre-workout and creatine deals available for a limited time only.',
    cta: 'Grab Deals',
    link: 'shop.html?sale=true',
    tag: 'Limited Time',
    image: 'images/banners/hero-4.jpg'
  }
];

const FALLBACK_OFFER_BANNERS = [
  {
    productId: 'fpuppre30wm',
    theme: 'flex',
    tag: 'Limited Offer',
    headline: 'Ultra Pro Pre-Workout',
    subline: '30 servings · Watermelon · Explosive energy',
    bgImage: 'images/offers/flex-preworkout.png',
    product: {
      id: 'fpuppre30wm',
      name: 'ULTRA PRO PRE WORKOUT 30SER WATER MELON',
      brand: 'Flex Power Nutrition',
      price: 2099,
      originalPrice: 2649,
      image: 'images/products/nobg/fpuppre30wm.png'
    }
  },
  {
    productId: 'rblextms3kgcho',
    theme: 'rebel',
    tag: 'Flash Sale',
    headline: 'Extreme Mass Gainer 3kg',
    subline: 'Chocolate · 24g protein · 440 cal per serving',
    bgImage: 'images/offers/rebel-mass.png',
    product: {
      id: 'rblextms3kgcho',
      name: 'REBEL EXTREME MASS GAINER 3KG CHOCOLATE',
      brand: 'Rebel Nutrition',
      price: 3399,
      originalPrice: 4499,
      image: 'images/products/nobg/rblextms3kgcho.png'
    }
  },
  {
    productId: 'mtnitw1kgvan',
    theme: 'muscletech',
    tag: 'Hot Deal',
    headline: 'Nitro-Tech Whey 1kg',
    subline: 'Vanilla Cream · 30g protein · 3g creatine',
    bgImage: 'images/offers/muscletech-whey.png',
    product: {
      id: 'mtnitw1kgvan',
      name: 'Muscle Tech Nitrotech Whey 1kg Vanilla Cream',
      brand: 'MuscleTech',
      price: 4499,
      originalPrice: 4799,
      image: 'images/products/nobg/mtnitw1kgvan.png'
    }
  }
];

const FALLBACK_PROMO_SLIDES = [
  {
    productId: 'fpuppre30wm',
    type: 'daily',
    label: 'Daily Deal',
    headline: 'Ultra Pro Pre-Workout',
    subline: 'Flex Power · Watermelon · 30 servings',
    product: {
      id: 'fpuppre30wm',
      name: 'ULTRA PRO PRE WORKOUT 30SER WATER MELON',
      price: 2099,
      originalPrice: 2649,
      image: 'images/products/nobg/fpuppre30wm.png'
    }
  },
  {
    productId: 'mtnitw1kgvan',
    type: 'weekly',
    label: 'Weekly Offer',
    headline: 'Nitro-Tech Whey 1kg',
    subline: 'MuscleTech · Vanilla Cream · 30g protein',
    product: {
      id: 'mtnitw1kgvan',
      name: 'Muscle Tech Nitrotech Whey 1kg Vanilla Cream',
      price: 4499,
      originalPrice: 4799,
      image: 'images/products/nobg/mtnitw1kgvan.png'
    }
  },
  {
    productId: 'combo-sales-offer-super-100-whey-pro-2kg-on-creatine-micronised-250gm-unflavoure',
    type: 'combo',
    label: 'Combo Pack',
    headline: 'Whey Pro 2kg + ON Creatine',
    subline: 'Stack & save — protein + creatine bundle',
    product: {
      id: 'combo-sales-offer-super-100-whey-pro-2kg-on-creatine-micronised-250gm-unflavoure',
      name: 'Combo Sales Offer Super 100% Whey Pro 2kg + On Creatine',
      price: 6199,
      originalPrice: 8399,
      image: 'images/products/nobg/combo-sales-offer-super-100-whey-pro-2kg-on-creatine-micronised-250gm-unflavoure.png'
    }
  },
  {
    productId: 'combosales5in1',
    type: 'mega',
    label: 'Mega Combo',
    headline: '5-in-1 Ultimate Stack',
    subline: 'Whey + Pre-Workout + Creatine + Multivit + Fish Oil',
    product: {
      id: 'combosales5in1',
      name: 'Combo Sales Offer Super 100% Whey Pro 2kg 5-in-1',
      price: 9499,
      originalPrice: 13446,
      image: 'images/products/nobg/combosales5in1.png'
    }
  },
  {
    productId: 'rblextms3kgcho',
    type: 'weekend',
    label: 'Weekend Special',
    headline: 'Extreme Mass Gainer 3kg',
    subline: 'Rebel Nutrition · Chocolate · 24g protein',
    product: {
      id: 'rblextms3kgcho',
      name: 'REBEL EXTREME MASS GAINER 3KG CHOCOLATE',
      price: 3399,
      originalPrice: 4499,
      image: 'images/products/nobg/rblextms3kgcho.png'
    }
  },
  {
    productId: 'combo-sales-offer-super-100-whey-gold-2kg-on-creatine-micronised-250gm-unflavour',
    type: 'combo',
    label: 'Super Saver',
    headline: 'Whey Gold 2kg + Creatine',
    subline: 'ON Gold Standard whey + micronised creatine',
    product: {
      id: 'combo-sales-offer-super-100-whey-gold-2kg-on-creatine-micronised-250gm-unflavour',
      name: 'Combo Sales Offer Super 100% Whey Gold 2kg + On Creatine',
      price: 7999,
      originalPrice: 10174,
      image: 'images/products/nobg/combo-sales-offer-super-100-whey-gold-2kg-on-creatine-micronised-250gm-unflavour.png'
    }
  }
];

const FlexHealth = {
  data: null,
  cart: JSON.parse(localStorage.getItem('flexhealth_cart') || '[]'),
  session: JSON.parse(localStorage.getItem('flexhealth_session') || 'null'),

  async init() {
    const page = this.getPage();
    const isVerifyPage = page === 'verify.html';

    if (isVerifyPage) {
      this.data = {
        products: [], categories: [], brands: [], reviews: [],
        banners: FALLBACK_BANNERS,
        offerBanners: FALLBACK_OFFER_BANNERS,
        promoSlides: FALLBACK_PROMO_SLIDES
      };
      this.renderHeader();
      this.renderFooter();
      this.updateCartBadge();
      this.ensureCartUI();
      this.initMobileNav();
      this.initGlobalHandlers();
      if (typeof this.renderVerifyPage === 'function') this.renderVerifyPage();
      this.renderTestModePanel();
      return;
    }

    try {
      const res = await fetch(`data/products.json?v=${SITE_DATA_VERSION}`);
      if (!res.ok) throw new Error('Failed to load catalog');
      this.data = await res.json();
    } catch {
      this.data = { products: [], categories: [], brands: [], reviews: [], banners: [], offerBanners: [], promoSlides: [] };
    }
    if (!this.data.banners?.length) this.data.banners = FALLBACK_BANNERS;
    if (!this.data.offerBanners?.length) this.data.offerBanners = FALLBACK_OFFER_BANNERS;
    if (!this.data.promoSlides?.length) this.data.promoSlides = FALLBACK_PROMO_SLIDES;
    this.renderHeader();
    this.renderFooter();
    this.updateCartBadge();
    this.ensureCartUI();
    this.initMobileNav();
    this.initGlobalHandlers();
    this.initPage();
    this.renderTestModePanel();
    this.renderWhatsAppWidget();
  },

  getWhatsAppSettings() {
    const w = this.data?.siteSettings?.whatsapp || {};
    return {
      enabled: w.enabled !== false,
      phone: String(w.phone || '919246501017').replace(/\D/g, ''),
      message: w.message || 'Hi, I need help with Flex Health products.'
    };
  },

  renderWhatsAppWidget() {
    if (this.getPage() === 'admin.html') return;
    const { enabled, phone, message } = this.getWhatsAppSettings();
    if (!enabled || !phone) return;
    if (document.getElementById('whatsapp-float')) return;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    const link = document.createElement('a');
    link.id = 'whatsapp-float';
    link.className = 'whatsapp-float';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Chat on WhatsApp');
    link.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
      <span class="whatsapp-float__label">WhatsApp</span>`;
    document.body.appendChild(link);
  },

  isActiveFlag(val) {
    if (val === true) return true;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'string') return val.length > 0;
    return false;
  },

  isInStock(product) {
    return !!(product && product.inStock !== false);
  },

  getOutOfStockLines() {
    return this.getCartLines().filter(l => !this.isInStock(l.product));
  },

  validateCartStock() {
    const oos = this.getOutOfStockLines();
    if (!oos.length) return { ok: true };
    const names = oos.map(l => {
      const n = l.product.name;
      return n.length > 45 ? n.slice(0, 45) + '…' : n;
    }).join(', ');
    return { ok: false, msg: `Remove out-of-stock items to checkout: ${names}`, lines: oos };
  },

  inStockFilterUrl(checked) {
    const url = new URL(location.href);
    if (checked) url.searchParams.set('instock', '1');
    else url.searchParams.delete('instock');
    return url.toString();
  },

  cleanText(str, maxLen = 320) {
    if (!str) return '';
    const text = String(str).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
  },

  saveCart() {
    localStorage.setItem('flexhealth_cart', JSON.stringify(this.cart));
    this.updateCartBadge();
    this.renderCartDrawer();
  },

  getCartLines() {
    return this.cart.map(item => {
      const product = this.data?.products?.find(p => p.id === item.id);
      if (!product) return null;
      return { ...item, product };
    }).filter(Boolean);
  },

  getCartSubtotal() {
    return this.getCartLines().reduce((sum, line) => sum + line.product.price * line.qty, 0);
  },

  appliedPromo: null,

  normalizePromoCode(code) {
    return String(code || '').trim().toUpperCase();
  },

  calculatePromoDiscount(promo, subtotal) {
    if (!promo || subtotal <= 0) return 0;
    if (promo.minOrder && subtotal < Number(promo.minOrder)) return 0;
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
  },

  validatePromoLocal(code, subtotal) {
    const normalized = this.normalizePromoCode(code);
    const promo = (this.data?.promoCodes || []).find(
      p => this.normalizePromoCode(p.code) === normalized && p.enabled !== false
    );
    if (!promo) return { ok: false, msg: 'Invalid promo code' };
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return { ok: false, msg: 'This promo code has expired' };
    }
    if (promo.maxUses != null && promo.maxUses !== '' && (promo.usedCount || 0) >= Number(promo.maxUses)) {
      return { ok: false, msg: 'This promo code has reached its usage limit' };
    }
    if (promo.minOrder && subtotal < Number(promo.minOrder)) {
      return { ok: false, msg: `Minimum order of ${this.formatPrice(Number(promo.minOrder))} required` };
    }
    const discountAmount = this.calculatePromoDiscount(promo, subtotal);
    if (discountAmount <= 0) return { ok: false, msg: 'Promo code cannot be applied to this order' };
    return {
      ok: true,
      code: this.normalizePromoCode(promo.code),
      type: promo.type,
      value: promo.value,
      discountAmount,
      subtotal,
      total: Math.round((subtotal - discountAmount) * 100) / 100,
      description: promo.description || ''
    };
  },

  async validatePromoCode(code) {
    const subtotal = this.getCartSubtotal();
    if (!subtotal) return { ok: false, msg: 'Cart is empty' };
    if (this.apiEnabled) {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.msg || 'Invalid promo code');
      return data;
    }
    const result = this.validatePromoLocal(code, subtotal);
    if (!result.ok) throw new Error(result.msg);
    return result;
  },

  getCartTotals() {
    const subtotal = this.getCartSubtotal();
    const discount = this.appliedPromo?.discountAmount || 0;
    const shipping = Math.max(0, Number(this.checkoutShipping?.charge) || 0);
    return {
      subtotal,
      discount,
      shipping,
      total: Math.max(0, Math.round((subtotal - discount + shipping) * 100) / 100)
    };
  },

  promoSummaryHtml() {
    const { subtotal, discount, shipping, total } = this.getCartTotals();
    const applied = this.appliedPromo;
    const shipLabel = this.checkoutShipping?.title || 'Shipping';
    const shipValue = this.checkoutShipping
      ? (shipping > 0 ? this.formatPrice(shipping) : this.formatPrice(0))
      : 'FREE';
    return `
      <div class="promo-code-box">
        ${applied ? `
          <div class="promo-code-applied">
            <div class="promo-code-applied__info">
              <strong>${this.escapeHtml(applied.code)}</strong>
              <span>${this.escapeHtml(applied.description || 'Discount applied')}</span>
            </div>
            <button type="button" class="promo-code-applied__remove" id="promo-remove-btn">Remove</button>
          </div>` : `
          <form id="promo-code-form" class="promo-code-form">
            <input type="text" name="code" placeholder="Promo code" aria-label="Promo code" autocomplete="off">
            <button type="submit" class="btn btn--outline btn--sm">Apply</button>
          </form>`}
      </div>
      <div class="cart-checkout__summary">
        <div class="cart-checkout__row"><span>Subtotal (${this.getCartCount()} items)</span><span>${this.formatPrice(subtotal)}</span></div>
        ${discount ? `<div class="cart-checkout__row cart-checkout__row--discount"><span>Promo (${this.escapeHtml(applied.code)})</span><span>−${this.formatPrice(discount)}</span></div>` : ''}
        <div class="cart-checkout__row"><span>${this.escapeHtml(shipLabel)}</span><span style="color:var(--color-accent);font-weight:600">${shipValue}</span></div>
        ${this.checkoutShipping?.etd ? `<div class="cart-checkout__row"><span>Est. delivery</span><span>${this.escapeHtml(this.checkoutShipping.etd)}</span></div>` : ''}
        <div class="cart-checkout__row cart-checkout__row--total"><span>Total</span><span>${this.formatPrice(total)}</span></div>
      </div>`;
  },

  bindPromoCodeForm() {
    document.getElementById('promo-code-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const input = e.target.elements.code;
      const btn = e.target.querySelector('[type=submit]');
      const code = input?.value?.trim();
      if (!code) return;
      btn.disabled = true;
      btn.textContent = 'Applying…';
      try {
        const result = await this.validatePromoCode(code);
        this.appliedPromo = result;
        this.toast('Promo code applied');
        this.renderCartPage();
      } catch (err) {
        this.toast(err.message || 'Invalid promo code');
        btn.disabled = false;
        btn.textContent = 'Apply';
      }
    });
    document.getElementById('promo-remove-btn')?.addEventListener('click', () => {
      this.appliedPromo = null;
      this.renderCartPage();
    });
  },

  getCartCount() {
    return this.cart.reduce((s, c) => s + c.qty, 0);
  },

  getPage() {
    return location.pathname.split('/').pop() || 'index.html';
  },

  initPage() {
    const page = this.getPage();
    if (page === 'index.html' || page === '') this.renderHome();
    else if (page === 'shop.html') this.renderShop();
    else if (page === 'product.html') this.renderProductDetail();
    else if (page === 'cart.html') this.renderCartPage();
    else if (page === 'login.html') this.initLoginPage();
    else if (page === 'account.html') this.renderAccount();
    else if (page === 'order.html') this.renderOrderDetail();
    else if (page === 'track.html') this.renderTrackPage();
    else if (page === 'verify.html' && typeof this.renderVerifyPage === 'function') this.renderVerifyPage();
    else if (page === 'admin.html') {
      if (typeof AdminPanel !== 'undefined') AdminPanel.render();
      else this.renderAdminPage();
    }
    else if (page === 'about.html') this.initAbout();
    else if (page === 'contact.html') this.initContact();
    else if (page === 'faq.html') this.initFaq();
    else if (['terms.html', 'privacy-policy.html', 'refund-policy.html', 'return-policy.html', 'shipping-delivery.html'].includes(page)) this.initPolicyPage();
  },

  formatPrice(n) {
    return '₹' + n.toLocaleString('en-IN');
  },

  discountPercent(price, original) {
    return Math.round(((original - price) / original) * 100);
  },

  getCategoryName(id) {
    return this.data.categories?.find(c => c.id === id)?.name || id;
  },

  getBrandsForCategory(categoryId) {
    return (this.data.brands || []).filter(b => b.categories.includes(categoryId));
  },

  brandCard(brand, categoryId) {
    const count = this.data.products.filter(p =>
      p.brandId === brand.id && (!categoryId || p.category === categoryId)
    ).length;
    const href = categoryId
      ? `shop.html?category=${categoryId}&brand=${brand.id}`
      : `shop.html?brand=${brand.id}`;
    return `
      <a href="${href}" class="brand-card" title="${brand.name}">
        <img src="${brand.logo}" alt="${brand.name}" loading="lazy">
        <span class="brand-card__name">${brand.name}</span>
      </a>`;
  },

  brandPickerCard(brand, categoryId, activeBrand) {
    const count = this.data.products.filter(p =>
      p.brandId === brand.id && p.category === categoryId
    ).length;
    const active = activeBrand === brand.id ? ' active' : '';
    return `
      <a href="shop.html?category=${categoryId}&brand=${brand.id}" class="brand-picker__card${active}">
        <img src="${brand.logo}" alt="${brand.name}" loading="lazy">
        <span>${brand.name}</span>
        <div class="brand-picker__count">${count} product${count !== 1 ? 's' : ''}</div>
      </a>`;
  },

  badgeClass(badge) {
    if (!badge) return '';
    const lower = badge.toLowerCase();
    if (lower.includes('sale') || lower.includes('flash')) return 'badge--sale';
    if (lower.includes('combo') || lower.includes('saver') || lower.includes('offer')) return 'badge--combo';
    return 'badge--new';
  },

  stars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  },

  heroTitleHtml(title) {
    const words = title.split(' ');
    if (words.length <= 2) return `<span class="hero__accent">${title}</span>`;
    const accent = words.slice(-2).join(' ');
    const main = words.slice(0, -2).join(' ');
    return `${main} <span class="hero__accent">${accent}</span>`;
  },

  productCard(p, opts = {}) {
    const discount = p.originalPrice ? this.discountPercent(p.price, p.originalPrice) : 0;
    const inStock = this.isInStock(p);
    const badge = !inStock
      ? `<span class="product-card__badge badge--oos">Out of Stock</span>`
      : (p.badge ? `<span class="product-card__badge ${this.badgeClass(p.badge)}">${this.escapeHtml(p.badge)}</span>` : '');
    const compact = opts.compact ? ' product-card--compact' : '';
    const oosClass = inStock ? '' : ' product-card--oos';
    const stats = this.getProductRatingStats(p.id);
    const rating = stats.count > 0
      ? `<div class="product-card__rating"><span class="stars">${this.stars(stats.rating)}</span><span>(${stats.count})</span></div>`
      : '';
    const wishlisted = this.isInWishlist(p.id);
    const actionBtn = inStock
      ? `<button class="btn btn--primary btn--sm" data-add-cart="${this.escapeHtml(p.id)}">Add to Bag</button>`
      : `<button class="btn btn--outline btn--sm" disabled title="Out of stock">Out of Stock</button>`;
    return `
      <article class="product-card${compact}${oosClass}" data-id="${this.escapeHtml(p.id)}">
        ${badge}
        <button class="product-card__wishlist${wishlisted ? ' active' : ''}" aria-label="Add to wishlist">${wishlisted ? '♥' : '♡'}</button>
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="product-card__image">
          <img src="${this.escapeHtml(p.image)}" alt="${this.escapeHtml(p.name)}" loading="lazy">
        </a>
        <div class="product-card__body">
          <div class="product-card__brand">${this.escapeHtml(p.brand)}</div>
          <a href="product.html?id=${encodeURIComponent(p.id)}"><h3 class="product-card__name">${this.escapeHtml(p.name)}</h3></a>
          ${rating}
          <div class="product-card__price">
            <span class="price-current">${this.formatPrice(p.price)}</span>
            ${p.originalPrice ? `<span class="price-original">${this.formatPrice(p.originalPrice)}</span>` : ''}
            ${discount ? `<span class="price-discount">-${discount}%</span>` : ''}
          </div>
          <div class="product-card__actions">
            ${actionBtn}
          </div>
        </div>
      </article>`;
  },

  renderTopBarHtml() {
    const items = `
      <span class="top-bar__item">🚚 <strong>Free shipping</strong> on all orders across India</span>
      <span class="top-bar__sep">·</span>
      <span class="top-bar__item">✓ Genuine supplements since 2005</span>
      <span class="top-bar__sep">·</span>
      <span class="top-bar__item">💰 <strong>Cash on Delivery</strong> available</span>
      <span class="top-bar__sep">·</span>
      <span class="top-bar__item">📞 <a href="tel:+919246501017">+91 924 650 1017</a></span>`;
    return `
      <div class="top-bar">
        <div class="top-bar__marquee">
          <div class="top-bar__track">
            ${items}${items}
          </div>
        </div>
      </div>`;
  },

  renderHeaderAuthBlock() {
    const redirect = encodeURIComponent(location.pathname + location.search);
    if (this.isLoggedIn()) {
      const firstName = this.escapeHtml((this.session.name || 'Customer').split(' ')[0]);
      return `
        <div class="header-auth header-auth--logged">
          <a href="account.html" class="header-auth__greeting">Hi, ${firstName}</a>
          <div class="account-menu">
            <button type="button" class="icon-btn account-menu__toggle" aria-label="Account menu" id="account-toggle">
              <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="8" r="4"/><path d="M4 20c0-4 3-7 7-7s7 3 7 7"/></svg>
            </button>
            <div class="account-menu__dropdown" id="account-dropdown">
              <div class="account-menu__user">Hi, ${firstName}</div>
              <a href="account.html">My Account</a>
              <a href="account.html#orders">My Orders</a>
              <a href="account.html#wishlist">Wishlist</a>
              <button type="button" onclick="FlexHealth.logout()">Logout</button>
            </div>
          </div>
        </div>`;
    }
    return `<a href="login.html?redirect=${redirect}" class="btn btn--outline btn--sm header-login-btn">Login</a>`;
  },

  bindHeaderAuth() {
    document.getElementById('account-toggle')?.addEventListener('click', e => {
      e.stopPropagation();
      document.getElementById('account-dropdown')?.classList.toggle('open');
    });
  },

  renderHeader() {
    const page = this.getPage();
    const navItems = [
      { href: 'index.html', label: 'Home' },
      { href: 'shop.html', label: 'Shop' },
      { href: 'shop.html?sale=true', label: 'Sale' },
      { href: 'verify.html', label: 'Verify' },
      { href: 'about.html', label: 'About' },
      { href: 'contact.html', label: 'Contact' },
    ];
    const nav = navItems.map(n => {
      const active = (page === n.href || (page === '' && n.href === 'index.html')) ? ' active' : '';
      return `<a href="${n.href}" class="${active.trim()}">${n.label}</a>`;
    }).join('');

    const header = document.getElementById('site-header');
    if (!header) return;

    const accountBlock = this.renderHeaderAuthBlock();
    const loggedIn = this.isLoggedIn();
    const firstName = loggedIn ? this.escapeHtml((this.session.name || 'Customer').split(' ')[0]) : '';

    header.innerHTML = `
      ${this.renderTopBarHtml()}
      <header class="header">
        <div class="container header__inner">
          <a href="index.html" class="logo">
            <div class="logo__icon">F</div>
            Flex<span>Health</span>
          </a>
          <nav class="nav">${nav}</nav>
          <div class="header__actions">
            <div class="search-box">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M14 14l3 3"/></svg>
              <input type="search" placeholder="Search supplements..." id="global-search">
            </div>
            ${accountBlock}
            <button class="icon-btn" aria-label="Cart" onclick="FlexHealth.openCart()">
              <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 2h2l2.5 12h11l2-8H6"/></svg>
              <span class="cart-badge" id="cart-count">0</span>
            </button>
            <button class="icon-btn menu-toggle" aria-label="Menu" id="menu-toggle">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          </div>
        </div>
      </header>
      <div class="mobile-nav" id="mobile-nav">
        <div class="mobile-nav__panel">
          <button class="mobile-nav__close" id="mobile-close">&times;</button>
          <div style="margin-top:48px">${navItems.map(n => `<a href="${n.href}">${n.label}</a>`).join('')}
          <a href="cart.html" style="margin-top:16px;display:block">🛒 Cart</a>
          ${loggedIn
            ? `<p class="mobile-nav__greeting">Hi, ${firstName}</p>
               <a href="account.html" style="margin-top:8px;display:block">👤 My Account</a>
               <a href="account.html#orders" style="display:block">📦 My Orders</a>
               <button type="button" onclick="FlexHealth.logout()" style="margin-top:8px;background:none;border:none;font:inherit;color:inherit;cursor:pointer;padding:0">Logout</button>`
            : `<a href="login.html?redirect=${encodeURIComponent(location.pathname + location.search)}" class="btn btn--primary btn--sm" style="margin-top:16px;display:inline-block">Login / Sign Up</a>`}
          </div>
        </div>
      </div>`;

    document.getElementById('global-search')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        location.href = `shop.html?q=${encodeURIComponent(e.target.value)}`;
      }
    });
    this.bindHeaderAuth();
  },

  renderFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;
    const year = new Date().getFullYear();
    footer.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer__top">
            <div class="footer__newsletter">
              <h4>Stay in the loop</h4>
              <p>Get deals, new arrivals & fitness tips in your inbox.</p>
              <form class="footer__newsletter-form" onsubmit="event.preventDefault();FlexHealth.toast('Subscribed successfully!')">
                <input type="email" placeholder="Your email address" required aria-label="Email">
                <button type="submit" class="btn btn--accent btn--sm">Subscribe</button>
              </form>
            </div>
            <div class="footer__payments">
              <span>We Accept</span>
              <div class="footer__payment-badges">
                <span>Cash on Delivery</span>
                <span>UPI</span>
                <span>Cards</span>
                <span>Net Banking</span>
              </div>
            </div>
          </div>
          <div class="footer__grid">
            <div class="footer__brand">
              <a href="index.html" class="logo logo--footer">
                <div class="logo__icon">F</div>
                Flex<span>Health</span>
              </a>
              <p>We commit to serve you genuine supplements. Your trusted fitness partner since 2005 — quality products, affordable prices, and expert support.</p>
              <div class="footer__social">
                <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">f</a>
                <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">ig</a>
                <a href="https://wa.me/919246501017" target="_blank" rel="noopener" aria-label="WhatsApp">wa</a>
              </div>
            </div>
            <div>
              <h4>Shop</h4>
              <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="shop.html">Shop All</a></li>
                <li><a href="cart.html">Your Cart</a></li>
                <li><a href="shop.html?sale=true">Sale Products</a></li>
                <li><a href="shop.html?category=combo">Combo Offers</a></li>
                <li><a href="about.html">About Us</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="faq.html">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4>Categories</h4>
              <ul>
                <li><a href="shop.html?category=whey">Whey Protein</a></li>
                <li><a href="shop.html?category=mass-gainer">Mass Gainer</a></li>
                <li><a href="shop.html?category=creatine">Creatine</a></li>
                <li><a href="shop.html?category=bcaa">BCAA & Amino</a></li>
                <li><a href="shop.html?category=pre-workout">Pre Workout</a></li>
                <li><a href="shop.html?category=vitamins">Vitamins</a></li>
              </ul>
            </div>
            <div>
              <h4>Customer Service</h4>
              <ul>
                <li><a href="shipping-delivery.html">Shipping & Delivery</a></li>
                <li><a href="shipping-delivery.html#cod">Cash on Delivery</a></li>
                <li><a href="return-policy.html">Return Policy</a></li>
                <li><a href="refund-policy.html">Refund Policy</a></li>
                <li><a href="faq.html">Help & FAQ</a></li>
                <li><a href="track.html">Track Order</a></li>
                <li><a href="verify.html">Verify Product</a></li>
                <li><a href="account.html">My Account</a></li>
              </ul>
            </div>
            <div>
              <h4>Policies</h4>
              <ul>
                <li><a href="terms.html">Terms & Conditions</a></li>
                <li><a href="privacy-policy.html">Privacy Policy</a></li>
                <li><a href="refund-policy.html">Cancellation & Refunds</a></li>
                <li><a href="return-policy.html">Returns & Exchanges</a></li>
                <li><a href="shipping-delivery.html">Shipping Policy</a></li>
              </ul>
            </div>
            <div class="footer__contact">
              <h4>Contact Us</h4>
              <ul>
                <li><a href="tel:+919246501017">📞 +91 924 650 1017</a></li>
                <li><a href="mailto:sales@flexhealth.in">✉️ sales@flexhealth.in</a></li>
                <li>📍 D.No. 4-1-433, MPM Mall, Abids,<br>Hyderabad, TS-500001</li>
                <li><a href="https://wa.me/919246501017" class="footer__whatsapp" target="_blank" rel="noopener">WhatsApp Support →</a></li>
              </ul>
            </div>
          </div>
          <div class="footer__legal">
            <a href="terms.html">Terms</a>
            <a href="privacy-policy.html">Privacy</a>
            <a href="refund-policy.html">Refunds</a>
            <a href="return-policy.html">Returns</a>
            <a href="shipping-delivery.html">Shipping</a>
            <a href="shipping-delivery.html#cod">Cash on Delivery</a>
          </div>
          <div class="footer__bottom">
            <span>&copy; ${year} Flex Health. All rights reserved.</span>
            <span>Genuine Supplements · Cash on Delivery · All India Shipping</span>
          </div>
        </div>
      </footer>`;
  },

  initMobileNav() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('mobile-nav');
    const close = document.getElementById('mobile-close');
    toggle?.addEventListener('click', () => nav?.classList.add('open'));
    close?.addEventListener('click', () => nav?.classList.remove('open'));
    nav?.addEventListener('click', e => { if (e.target === nav) nav.classList.remove('open'); });
  },

  ensureCartUI() {
    if (document.getElementById('cart-drawer')) return;
    const el = document.createElement('div');
    el.id = 'cart-drawer';
    el.className = 'cart-drawer';
    el.innerHTML = `
      <div class="cart-drawer__overlay" onclick="FlexHealth.closeCart()"></div>
      <div class="cart-drawer__panel">
        <div class="cart-drawer__header">
          <h2>Your Bag (<span id="cart-drawer-count">0</span>)</h2>
          <button class="cart-drawer__close" onclick="FlexHealth.closeCart()" aria-label="Close cart">&times;</button>
        </div>
        <div class="cart-drawer__body" id="cart-drawer-items"></div>
        <div class="cart-drawer__footer" id="cart-drawer-footer"></div>
      </div>`;
    document.body.appendChild(el);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeCart();
    });
  },

  cartItemHtml(line, compact = true) {
    const { product, qty, id } = line;
    const lineTotal = product.price * qty;
    const name = product.name.length > 55 ? product.name.slice(0, 55) + '…' : product.name;
    const oos = !this.isInStock(product);
    return `
      <div class="cart-item${oos ? ' cart-item--oos' : ''}" data-cart-id="${id}">
        <a href="product.html?id=${id}" class="cart-item__img" onclick="FlexHealth.closeCart()">
          <img src="${product.image}" alt="${name}">
        </a>
        <div class="cart-item__info">
          <div class="cart-item__brand">${product.brand}</div>
          <a href="product.html?id=${id}" class="cart-item__name" onclick="FlexHealth.closeCart()">${name}</a>
          ${oos ? '<div class="cart-item__oos-tag">Out of stock — remove to checkout</div>' : ''}
          <div class="cart-item__price">${this.formatPrice(product.price)}</div>
          <button class="cart-item__remove" onclick="FlexHealth.removeFromCart('${id}')">Remove</button>
        </div>
        <div class="cart-item__qty">
          <button type="button" onclick="FlexHealth.setCartQty('${id}', -1)" aria-label="Decrease">−</button>
          <span>${qty}</span>
          <button type="button" onclick="FlexHealth.setCartQty('${id}', 1)" aria-label="Increase"${oos ? ' disabled' : ''}>+</button>
        </div>
      </div>`;
  },

  renderCartDrawer() {
    const itemsEl = document.getElementById('cart-drawer-items');
    const footerEl = document.getElementById('cart-drawer-footer');
    const countEl = document.getElementById('cart-drawer-count');
    if (!itemsEl) return;

    const lines = this.getCartLines();
    const count = this.getCartCount();
    if (countEl) countEl.textContent = count;

    if (!lines.length) {
      itemsEl.innerHTML = `
        <div class="cart-drawer__empty">
          <div class="cart-drawer__empty-icon">🛒</div>
          <p>Your bag is empty</p>
          <a href="shop.html" class="btn btn--primary" onclick="FlexHealth.closeCart()">Start Shopping</a>
        </div>`;
      if (footerEl) footerEl.innerHTML = '';
      return;
    }

    itemsEl.innerHTML = lines.map(l => this.cartItemHtml(l)).join('');
    const subtotal = this.getCartSubtotal();
    if (footerEl) {
      footerEl.innerHTML = `
        <div class="cart-drawer__row"><span>Subtotal</span><span>${this.formatPrice(subtotal)}</span></div>
        <div class="cart-drawer__row"><span>Shipping</span><span style="color:var(--color-accent);font-weight:600">FREE</span></div>
        <div class="cart-drawer__row cart-drawer__row--total"><span>Total</span><span>${this.formatPrice(subtotal)}</span></div>
        <div class="cart-drawer__actions">
          <a href="cart.html" class="btn btn--primary btn--lg" onclick="FlexHealth.closeCart()">Checkout</a>
          <button class="btn btn--outline" onclick="FlexHealth.closeCart()">Continue Shopping</button>
        </div>
        <p class="cart-drawer__note">🚚 Free delivery · 💰 Cash on Delivery available</p>`;
    }
  },

  openCart() {
    this.renderCartDrawer();
    document.getElementById('cart-drawer')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeCart() {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.body.style.overflow = '';
  },

  showCart() {
    this.openCart();
  },

  addToCart(id, qty) {
    const product = this.data.products.find(p => p.id === id);
    if (!product) return;
    if (!this.isInStock(product)) {
      this.toast('This product is out of stock');
      return;
    }
    const amount = qty ?? (document.getElementById('qty') ? +document.getElementById('qty').textContent : 1);
    const addQty = Math.max(1, amount || 1);
    const existing = this.cart.find(c => c.id === id);
    if (existing) existing.qty += addQty;
    else this.cart.push({ id, qty: addQty });
    this.saveCart();
    this.toast(`Added to bag · ${this.formatPrice(product.price)}`);
    this.openCart();
  },

  buyNow(id) {
    const product = this.data.products.find(p => p.id === id);
    if (!product || !this.isInStock(product)) {
      this.toast('This product is out of stock');
      return;
    }
    const qtyEl = document.getElementById('qty');
    const qty = qtyEl ? Math.max(1, +qtyEl.textContent) : 1;
    const existing = this.cart.find(c => c.id === id);
    if (existing) existing.qty = qty;
    else {
      this.cart = this.cart.filter(c => c.id !== id);
      this.cart.push({ id, qty });
    }
    this.saveCart();
    location.href = 'cart.html';
  },

  setCartQty(id, delta) {
    const item = this.cart.find(c => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) this.cart = this.cart.filter(c => c.id !== id);
    this.saveCart();
    if (this.getPage() === 'cart.html') this.renderCartPage();
  },

  removeFromCart(id) {
    this.cart = this.cart.filter(c => c.id !== id);
    this.saveCart();
    if (this.getPage() === 'cart.html') this.renderCartPage();
  },

  updateCartBadge() {
    const el = document.getElementById('cart-count');
    if (el) {
      const count = this.getCartCount();
      el.textContent = count;
      el.style.display = count ? 'flex' : 'none';
    }
  },

  renderCartPage() {
    const contentEl = document.getElementById('cart-page-content');
    if (!contentEl) return;

    const lines = this.getCartLines();
    const { subtotal, total } = this.getCartTotals();

    if (!lines.length) {
      this.checkoutStep = 1;
      this.appliedPromo = null;
      contentEl.innerHTML = `
        <div class="empty-state">
          <div style="font-size:3rem;margin-bottom:16px;opacity:.4">🛒</div>
          <h3>Your bag is empty</h3>
          <p>Add supplements to your bag and checkout with free shipping.</p>
          <a href="shop.html" class="btn btn--primary btn--lg" style="margin-top:20px">Browse Products</a>
        </div>`;
      return;
    }

    const step = this.checkoutStep || 1;
    if (this.appliedPromo) {
      const check = this.validatePromoLocal(this.appliedPromo.code, subtotal);
      if (!check.ok) this.appliedPromo = null;
      else this.appliedPromo = { ...this.appliedPromo, ...check };
    }
    const stockCheck = this.validateCartStock();
    const oosBanner = !stockCheck.ok
      ? `<div class="cart-oos-banner">⚠ Some items in your bag are out of stock. Remove them to continue checkout.</div>`
      : '';
    const itemsHtml = lines.map(line => {
      const name = line.product.name.length > 70 ? line.product.name.slice(0, 70) + '…' : line.product.name;
      const oos = !this.isInStock(line.product);
      return `
        <div class="cart-page-item${oos ? ' cart-page-item--oos' : ''}">
          <a href="product.html?id=${line.id}" class="cart-page-item__img">
            <img src="${line.product.image}" alt="${name}">
          </a>
          <div>
            <div class="cart-item__brand">${line.product.brand}</div>
            <a href="product.html?id=${line.id}" class="cart-item__name" style="font-size:.9375rem;-webkit-line-clamp:3">${name}</a>
            ${oos ? '<div class="cart-item__oos-tag">Out of stock</div>' : ''}
            <div class="cart-item__price">${this.formatPrice(line.product.price)} each</div>
            <button class="cart-item__remove" onclick="FlexHealth.removeFromCart('${line.id}')">Remove</button>
          </div>
          <div class="cart-item__qty cart-page-item__qty">
            <button type="button" onclick="FlexHealth.setCartQty('${line.id}', -1)">−</button>
            <span>${line.qty}</span>
            <button type="button" onclick="FlexHealth.setCartQty('${line.id}', 1)"${oos ? ' disabled' : ''}>+</button>
          </div>
          <div class="cart-page-item__line-total">${this.formatPrice(line.product.price * line.qty)}</div>
        </div>`;
    }).join('');

    const summaryHtml = `
      <div class="cart-checkout">
        <h2>Order Summary</h2>
        ${!this.isLoggedIn() ? `
          <div class="checkout-login-prompt">
            <a href="login.html?redirect=cart.html">Sign in</a> for faster checkout & order tracking
          </div>` : `
          <div class="checkout-login-prompt checkout-login-prompt--logged">
            ✓ Signed in as ${this.escapeHtml(this.session.name.split(' ')[0])}
          </div>`}
        ${this.promoSummaryHtml()}
        <div class="cart-checkout__perks">
          <span>✓ 100% Genuine Products</span>
          <span>✓ Free Shipping All India</span>
          <span>✓ Secure Payments</span>
        </div>
        ${this.renderCheckoutSidebar(step, total)}
      </div>`;

    let mainPanel = '';
    if (step === 1) {
      mainPanel = `
        ${oosBanner}
        <div class="cart-page-items">${itemsHtml}</div>
        <div class="checkout-step-actions">
          <button type="button" class="btn btn--primary btn--lg"${stockCheck.ok ? '' : ' disabled'} onclick="FlexHealth.goCheckoutStep(2)">Continue to Details →</button>
        </div>`;
    } else if (step === 2) {
      const d = this.checkoutDraft || {};
      mainPanel = `
        <form id="checkout-details-form" class="checkout-details-form">
          <h3>Delivery Details</h3>
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" name="name" required placeholder="Your full name" value="${this.escapeHtml(d.name || '')}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Phone *</label>
              <input type="tel" name="phone" required placeholder="+91 98765 43210" value="${this.escapeHtml(d.phone || '')}">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@email.com" value="${this.escapeHtml(d.email || '')}">
            </div>
          </div>
          <div class="form-group">
            <label>Delivery Address *</label>
            <textarea name="address" required placeholder="House no., Street, Area">${this.escapeHtml(d.address || '')}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>City *</label>
              <input type="text" name="city" required placeholder="Hyderabad" value="${this.escapeHtml(d.city || '')}">
            </div>
            <div class="form-group">
              <label>Pincode *</label>
              <input type="text" id="checkout-pincode" name="pincode" required pattern="[0-9]{6}" placeholder="500001" value="${this.escapeHtml(d.pincode || '')}">
              <div id="pincode-delivery-msg" class="form-hint"></div>
            </div>
          </div>
          <div class="form-group">
            <label>Order Notes (optional)</label>
            <input type="text" name="notes" placeholder="Delivery instructions" value="${this.escapeHtml(d.notes || '')}">
          </div>
          <div class="checkout-step-actions checkout-step-actions--split">
            <button type="button" class="btn btn--outline" onclick="FlexHealth.goCheckoutStep(1)">← Back</button>
            <button type="submit" class="btn btn--primary btn--lg">Continue to Payment →</button>
          </div>
        </form>`;
    } else {
      mainPanel = `
        <div class="checkout-payment-panel">
          <h3>Select Payment Method</h3>
          <div class="payment-options payment-options--cards">
            <label class="payment-option-card">
              <input type="radio" name="pay_method" value="cod" checked>
              <span class="payment-option-card__icon">💰</span>
              <strong>Cash on Delivery</strong>
              <small>Pay when you receive</small>
            </label>
            ${typeof this.paymentMethodOptionsHtml === 'function' ? this.paymentMethodOptionsHtml() : ''}
          </div>
          <div class="checkout-step-actions checkout-step-actions--split">
            <button type="button" class="btn btn--outline" onclick="FlexHealth.goCheckoutStep(2)">← Back</button>
            <button type="button" class="btn btn--primary btn--lg" id="checkout-pay-btn">Place Order · ${this.formatPrice(total)}</button>
          </div>
        </div>`;
    }

    contentEl.innerHTML = `
      ${typeof this.checkoutStepsHtml === 'function' ? this.checkoutStepsHtml(step) : ''}
      <div class="cart-page-layout">
        <div class="cart-page-main">${mainPanel}</div>
        ${summaryHtml}
      </div>`;

    document.getElementById('checkout-details-form')?.addEventListener('submit', e => {
      e.preventDefault();
      if (this.saveCheckoutDraft) this.saveCheckoutDraft(e.target);
      if (this.goCheckoutStep) this.goCheckoutStep(3);
    });

    document.getElementById('checkout-pay-btn')?.addEventListener('click', () => {
      const method = document.querySelector('input[name=pay_method]:checked')?.value || 'cod';
      if (this.placeCheckoutOrder) this.placeCheckoutOrder(method);
      else this.submitOrder({ preventDefault: () => {}, target: Object.assign(document.createElement('form'), { elements: {} }) });
    });

    if (step === 2) {
      this.prefillCheckoutForm();
      this.bindPincodeCheck?.();
    }
    this.bindPromoCodeForm();
  },

  renderCheckoutSidebar(step, subtotal) {
    if (step === 3) {
      return `<p class="checkout-sidebar-hint">Choose how to pay <strong>${this.formatPrice(subtotal)}</strong></p>`;
    }
    if (step === 2) {
      return `<p class="checkout-sidebar-hint">Enter delivery address for free shipping</p>`;
    }
    return '';
  },

  submitOrder(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (data.payment && data.payment !== 'cod' && this.placeCheckoutOrder) {
      this.checkoutDraft = data;
      return this.placeCheckoutOrder(data.payment);
    }
    const lines = this.getCartLines();
    const orderId = 'FH' + Date.now().toString().slice(-8);
    const order = {
      id: orderId,
      date: new Date().toISOString(),
      userId: this.session?.userId || null,
      status: 'placed',
      statusHistory: [{ status: 'placed', at: new Date().toISOString() }],
      customer: data,
      items: lines.map(l => ({ id: l.id, name: l.product.name, qty: l.qty, price: l.product.price })),
      total: this.getCartSubtotal(),
      payment: data.payment,
      paymentStatus: data.payment === 'cod' ? 'cod' : 'pending'
    };
    const orders = JSON.parse(localStorage.getItem('flexhealth_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('flexhealth_orders', JSON.stringify(orders.slice(0, 50)));

    if (this.isLoggedIn()) {
      const user = this.getCurrentUser();
      if (user && !user.address && data.address) {
        this.updateProfile({
          name: data.name,
          phone: data.phone,
          address: data.address,
          city: data.city,
          pincode: data.pincode
        });
      }
    }

    this.cart = [];
    this.saveCart();

    if (this.showOrderSuccess) {
      this.showOrderSuccess(order, data);
      return;
    }

    const contentEl = document.getElementById('cart-page-content');
    const successEl = document.getElementById('cart-order-success');
    if (contentEl) contentEl.style.display = 'none';
    if (successEl) {
      successEl.style.display = 'block';
      successEl.innerHTML = `
        <div class="cart-success__icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you, ${this.escapeHtml(data.name)}. We've received your order.</p>
        <p class="cart-success__id">Order ID: <strong>${orderId}</strong></p>
        <p>We'll call you at ${this.escapeHtml(data.phone)} to confirm.${data.payment === 'cod' ? ' Pay cash when your order arrives.' : ''}</p>
        <div class="order-tracker order-tracker--success">
          ${this.orderTimelineHtml(order)}
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px">
          <a href="order.html?id=${orderId}" class="btn btn--primary">Track This Order</a>
          <a href="shop.html" class="btn btn--outline">Continue Shopping</a>
          ${this.isLoggedIn()
            ? `<a href="account.html#orders" class="btn btn--outline">My Orders</a>`
            : `<a href="track.html?id=${orderId}" class="btn btn--outline">Track Order</a>`}
        </div>`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  },

  renderHome() {
    const { products, categories, brands, reviews } = this.data;
    const banners = this.data.banners?.length ? this.data.banners : FALLBACK_BANNERS;
    this.renderSiteSettings();

    // Hero slider
    const heroEl = document.getElementById('hero-slider');
    const dotsEl = document.getElementById('hero-dots');
    const counterEl = document.getElementById('hero-counter');
    if (heroEl && banners) {
      heroEl.innerHTML = banners.map((b, i) => `
        <div class="hero__slide${i === 0 ? ' active' : ''}" data-index="${i}">
          <div class="hero__bg" style="background-image:url('${b.image}')"></div>
          <div class="hero__overlay"></div>
          <div class="hero__content">
            <div class="hero__content-inner">
              <span class="hero__tag">${b.tag || 'Flex Health'}</span>
              <h1 class="hero__title">${this.heroTitleHtml(b.title)}</h1>
              <p class="hero__subtitle">${b.subtitle}</p>
              <div class="hero__perks">
                <span>🚚 Free Shipping</span>
                <span>💰 Cash on Delivery</span>
                <span>🛡️ 100% Genuine</span>
              </div>
              <div class="hero__actions">
                <a href="${b.link}" class="btn btn--primary btn--lg">${b.cta}</a>
                <a href="shop.html?sale=true" class="btn btn--hero-outline btn--lg">View Offers</a>
              </div>
            </div>
          </div>
        </div>`).join('');
      if (dotsEl) {
        dotsEl.innerHTML = banners.map((_, i) =>
          `<button class="hero__dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`
        ).join('');
      }
      if (counterEl) {
        counterEl.innerHTML = `<span>${String(1).padStart(2, '0')}</span> / ${String(banners.length).padStart(2, '0')}`;
      }
      this.initHeroSlider(banners.length);
    }

    // Categories — click goes to shop, shows brands
    const catEl = document.getElementById('categories');
    if (catEl && categories) {
      const shopCats = categories.filter(c => c.id !== 'combo');
      catEl.innerHTML = shopCats.map(c => `
        <a href="shop.html?category=${c.id}" class="category-card">
          <div class="category-card__icon">${c.icon}</div>
          <div class="category-card__name">${c.name}</div>
          ${c.desc ? `<div class="category-card__desc">${c.desc}</div>` : ''}
        </a>`).join('');
    }

    // Shop by Brand — all logos
    const brandsEl = document.getElementById('home-brands');
    if (brandsEl && brands) {
      brandsEl.innerHTML = brands.map(b => this.brandCard(b)).join('');
    }

    // Category → Brands interactive panel
    const catBrandsEl = document.getElementById('category-brands');
    if (catBrandsEl && categories && brands) {
      const mainCats = ['whey', 'mass-gainer', 'creatine', 'bcaa', 'pre-workout'];
      const tabs = mainCats.map((id, i) => {
        const cat = categories.find(c => c.id === id);
        return cat ? `<button class="shop-cat-tab${i === 0 ? ' active' : ''}" data-cat="${id}">${cat.icon} ${cat.name}</button>` : '';
      }).join('');
      catBrandsEl.innerHTML = `
        <div class="category-brands-panel">
          <div class="shop-categories" id="home-cat-tabs">${tabs}</div>
          <div class="brand-picker__grid" id="home-brand-grid"></div>
        </div>`;
      this.renderHomeCategoryBrands(mainCats[0]);
      document.getElementById('home-cat-tabs')?.addEventListener('click', e => {
        const tab = e.target.closest('[data-cat]');
        if (!tab) return;
        document.querySelectorAll('#home-cat-tabs .shop-cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderHomeCategoryBrands(tab.dataset.cat);
      });
    }

    // Offer banners
    this.renderOfferBanners();

    // Promo offer slider
    this.renderPromoSlider();

    // Popular
    const popularEl = document.getElementById('popular-products');
    const limits = this.data.siteSettings?.featuredLimits || { popular: 8, sale: 4, newArrivals: 4 };
    if (popularEl) {
      popularEl.innerHTML = products.filter(p => this.isActiveFlag(p.isPopular)).slice(0, limits.popular || 8).map(p => this.productCard(p)).join('');
    }

    // Flash sale
    const saleEl = document.getElementById('sale-products');
    if (saleEl) {
      saleEl.innerHTML = products.filter(p => this.isActiveFlag(p.isSale)).slice(0, limits.sale || 4).map(p => this.productCard(p)).join('');
    }
    this.initCountdown();

    // New arrivals
    const newEl = document.getElementById('new-products');
    if (newEl) {
      newEl.innerHTML = products.filter(p => this.isActiveFlag(p.isNew)).slice(0, limits.newArrivals || 4).map(p => this.productCard(p)).join('');
    }

    // Reviews
    const revEl = document.getElementById('reviews');
    if (revEl && reviews) {
      revEl.innerHTML = reviews.map(r => `
        <div class="review-card">
          <div class="review-card__stars">${this.stars(r.rating)}</div>
          <p class="review-card__text">"${this.escapeHtml(r.text)}"</p>
          <div class="review-card__author">${this.escapeHtml(r.name)}</div>
        </div>`).join('');
    }
  },

  renderSiteSettings() {
    const settings = this.data.siteSettings;
    const statsEl = document.querySelector('.stats-bar__grid');
    if (statsEl && settings?.stats?.length) {
      statsEl.innerHTML = settings.stats.map(s => `
        <div class="stat-item">
          <div class="stat-item__num">${this.escapeHtml(s.num)}</div>
          <div class="stat-item__label">${this.escapeHtml(s.label)}</div>
        </div>`).join('');
    }
    const trustEl = document.querySelector('.trust-bar__grid');
    if (trustEl && settings?.trustBar?.length) {
      trustEl.innerHTML = settings.trustBar.map(t => `
        <div class="trust-item trust-item--card">
          <div class="trust-item__icon">${t.icon || '✓'}</div>
          <div class="trust-item__text">${this.escapeHtml(t.title)}<small>${this.escapeHtml(t.subtitle || '')}</small></div>
        </div>`).join('');
    }
  },

  renderOfferBanners() {
    const el = document.getElementById('offer-banners');
    if (!el) return;
    const offers = this.data.offerBanners?.length ? this.data.offerBanners : FALLBACK_OFFER_BANNERS;
    const defaultBg = {
      flex: 'images/offers/flex-preworkout.png',
      rebel: 'images/offers/rebel-mass.png',
      muscletech: 'images/offers/muscletech-whey.png'
    };
    const html = offers.map(o => {
      const p = this.data.products.find(x => x.id === o.productId) || o.product;
      if (!p) return '';
      const discount = p.originalPrice ? this.discountPercent(p.price, p.originalPrice) : 0;
      const theme = o.theme || 'default';
      const bg = o.bgImage || defaultBg[theme] || 'images/banners/hero-2.jpg';
      const img = p.image || '';
      const title = o.headline || p.name;
      return `
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="offer-banner">
          <div class="offer-banner__bg" style="background-image:url('${bg}')"></div>
          <div class="offer-banner__overlay"></div>
          <div class="offer-banner__body">
            <div class="offer-banner__copy">
              <span class="offer-banner__tag">${this.escapeHtml(o.tag || 'Special Offer')}</span>
              <span class="offer-banner__brand">${this.escapeHtml(p.brand || '')}</span>
              <h3 class="offer-banner__title">${this.heroTitleHtml(title)}</h3>
              <p class="offer-banner__sub">${this.escapeHtml(o.subline || '')}</p>
              <div class="offer-banner__perks">
                <span>Free Shipping</span>
                <span>COD</span>
                <span>100% Genuine</span>
              </div>
              <div class="offer-banner__price">
                <span class="offer-banner__current">${this.formatPrice(p.price)}</span>
                ${p.originalPrice ? `<span class="offer-banner__was">${this.formatPrice(p.originalPrice)}</span>` : ''}
                ${discount ? `<span class="offer-banner__off">${discount}% OFF</span>` : ''}
              </div>
              <div class="offer-banner__actions">
                <span class="btn btn--primary">Shop Now</span>
                <span class="btn btn--hero-outline">View Details</span>
              </div>
            </div>
            <div class="offer-banner__product">
              <img src="${img}" alt="${this.escapeHtml(p.name)}" loading="lazy">
            </div>
          </div>
        </a>`;
    }).join('');
    if (html) el.innerHTML = html;
  },

  renderPromoSlider() {
    const track = document.getElementById('promo-slider');
    const dotsEl = document.getElementById('promo-slider-dots');
    if (!track) return;

    const slides = this.data.promoSlides?.length ? this.data.promoSlides : FALLBACK_PROMO_SLIDES;
    const bgByType = {
      daily: 'images/offers/flex-preworkout.png',
      weekly: 'images/offers/muscletech-whey.png',
      combo: 'images/banners/hero-3.jpg',
      mega: 'images/banners/hero-2.jpg',
      weekend: 'images/offers/rebel-mass.png'
    };
    const html = slides.map((s, i) => {
      const p = this.data.products.find(x => x.id === s.productId) || s.product;
      if (!p) return '';
      const discount = p.originalPrice ? this.discountPercent(p.price, p.originalPrice) : 0;
      const type = s.type || 'daily';
      const bg = s.bgImage || bgByType[type] || 'images/banners/hero-1.jpg';
      const cta = type === 'daily' ? 'Shop Daily Deal'
        : type === 'weekly' ? 'Shop Weekly Offer'
        : type === 'combo' ? 'View Combo'
        : type === 'mega' ? 'Get Mega Combo'
        : type === 'weekend' ? 'Weekend Special'
        : 'Shop Now';
      const title = s.headline || p.name;
      return `
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="promo-slide${i === 0 ? ' active' : ''}" data-index="${i}">
          <div class="promo-slide__bg" style="background-image:url('${bg}')"></div>
          <div class="promo-slide__overlay"></div>
          <div class="promo-slide__body">
            <div class="promo-slide__content">
              <span class="promo-slide__badge">${this.escapeHtml(s.label || 'Special Offer')}</span>
              <h3 class="promo-slide__title">${this.heroTitleHtml(title)}</h3>
              <p class="promo-slide__sub">${this.escapeHtml(s.subline || p.brand || '')}</p>
              <div class="promo-slide__perks">
                <span>Free Shipping</span>
                <span>Cash on Delivery</span>
                <span>100% Genuine</span>
              </div>
              <div class="promo-slide__price">
                <span class="promo-slide__current">${this.formatPrice(p.price)}</span>
                ${p.originalPrice ? `<span class="promo-slide__was">${this.formatPrice(p.originalPrice)}</span>` : ''}
                ${discount ? `<span class="promo-slide__off">${discount}% OFF</span>` : ''}
              </div>
              <div class="promo-slide__actions">
                <span class="btn btn--primary btn--lg">${cta}</span>
                <span class="btn btn--hero-outline btn--lg">View Offers</span>
              </div>
            </div>
            <div class="promo-slide__visual">
              <img src="${p.image}" alt="${this.escapeHtml(p.name)}" loading="lazy">
            </div>
          </div>
        </a>`;
    }).join('');

    if (html) {
      track.innerHTML = html;
      if (dotsEl) {
        dotsEl.innerHTML = slides.map((_, i) =>
          `<button class="promo-slider__dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Go to offer ${i + 1}"></button>`
        ).join('');
      }
      this.initPromoSlider();
    }
  },

  initPromoSlider() {
    const track = document.getElementById('promo-slider');
    if (!track) return;
    const slides = track.querySelectorAll('.promo-slide');
    const dots = document.querySelectorAll('.promo-slider__dot');
    const prev = document.querySelector('.promo-slider__arrow--prev');
    const next = document.querySelector('.promo-slider__arrow--next');
    if (!slides.length) return;

    let current = 0;
    let timer;

    const show = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[current]?.classList.add('active');
      dots[current]?.classList.add('active');
    };

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => show(current + 1), 5500);
    };

    dots.forEach(d => d.addEventListener('click', () => { show(+d.dataset.index); restart(); }));
    prev?.addEventListener('click', () => { show(current - 1); restart(); });
    next?.addEventListener('click', () => { show(current + 1); restart(); });
    restart();
  },

  initHeroSlider(total = 4) {
    const slides = document.querySelectorAll('.hero__slide');
    const dots = document.querySelectorAll('.hero__dot');
    const prev = document.getElementById('hero-prev');
    const next = document.getElementById('hero-next');
    const counter = document.getElementById('hero-counter');
    const progress = document.getElementById('hero-progress');
    if (!slides.length) return;

    let current = 0;
    let timer;
    let progressFrame;
    const duration = 6000;
    let startTime;

    const pad = (n) => String(n).padStart(2, '0');

    const updateProgress = () => {
      if (!progress) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      progress.style.width = pct + '%';
      if (pct < 100) progressFrame = requestAnimationFrame(updateProgress);
    };

    const show = (i) => {
      current = (i + slides.length) % slides.length;
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[current]?.classList.add('active');
      dots[current]?.classList.add('active');
      if (counter) {
        counter.innerHTML = `<span>${pad(current + 1)}</span> / ${pad(total)}`;
      }
      if (progress) progress.style.width = '0%';
      cancelAnimationFrame(progressFrame);
      startTime = Date.now();
      updateProgress();
    };

    const restart = () => {
      clearInterval(timer);
      show(current);
      timer = setInterval(() => show(current + 1), duration);
    };

    const heroSection = document.querySelector('.hero');
    heroSection?.addEventListener('mouseenter', () => clearInterval(timer));
    heroSection?.addEventListener('mouseleave', () => {
      clearInterval(timer);
      timer = setInterval(() => show(current + 1), duration);
    });

    dots.forEach(d => d.addEventListener('click', () => { show(+d.dataset.index); restart(); }));
    prev?.addEventListener('click', () => { show(current - 1); restart(); });
    next?.addEventListener('click', () => { show(current + 1); restart(); });

    restart();
  },

  initCountdown() {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) return;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      document.querySelectorAll('.countdown').forEach(el => {
        el.querySelector('[data-hours]').textContent = String(h).padStart(2, '0');
        el.querySelector('[data-mins]').textContent = String(m).padStart(2, '0');
        el.querySelector('[data-secs]').textContent = String(s).padStart(2, '0');
      });
    };
    tick();
    setInterval(tick, 1000);
  },

  renderHomeCategoryBrands(categoryId) {
    const grid = document.getElementById('home-brand-grid');
    if (!grid) return;
    const brands = this.getBrandsForCategory(categoryId);
    grid.innerHTML = brands.length
      ? brands.map(b => this.brandPickerCard(b, categoryId)).join('')
      : '<p style="color:#888;grid-column:1/-1">No brands available for this category.</p>';
  },

  renderShop() {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const brand = params.get('brand');
    const sale = params.get('sale');
    const instock = params.get('instock');
    const query = params.get('q')?.toLowerCase();

    // Category tabs
    const tabsEl = document.getElementById('shop-cat-tabs');
    if (tabsEl && this.data.categories) {
      const mainCats = this.data.categories.filter(c => !sale);
      tabsEl.innerHTML = `<a href="shop.html" class="shop-cat-tab${!category ? ' active' : ''}">All</a>` +
        mainCats.map(c => `<a href="shop.html?category=${c.id}" class="shop-cat-tab${category === c.id ? ' active' : ''}">${c.icon} ${c.name}</a>`).join('');
    }

    // Brand picker when category selected (no brand yet) — show brands first
    const brandPickerEl = document.getElementById('brand-picker');
    const shopPathEl = document.getElementById('shop-path');
    const showBrandPickerOnly = category && !brand && !sale && !query;

    if (brandPickerEl && showBrandPickerOnly) {
      const catBrands = this.getBrandsForCategory(category);
      brandPickerEl.style.display = 'block';
      brandPickerEl.innerHTML = `
        <div class="brand-picker__header">
          <h2 class="brand-picker__title">${this.getCategoryName(category)} — Choose Brand</h2>
          <a href="shop.html" class="brand-picker__back">← All Categories</a>
        </div>
        <div class="brand-picker__grid">
          <a href="shop.html?category=${category}&brand=all" class="brand-picker__card">
            <span style="font-size:1.5rem">🏷️</span>
            <span>All Brands</span>
            <div class="brand-picker__count">${this.data.products.filter(p => p.category === category).length} products</div>
          </a>
          ${catBrands.map(b => this.brandPickerCard(b, category)).join('')}
        </div>`;
      const toolbar = document.querySelector('.shop-toolbar');
      if (toolbar) toolbar.style.display = 'none';
      const grid = document.getElementById('shop-products');
      if (grid) grid.innerHTML = '';
      const count = document.getElementById('product-count');
      if (count) count.textContent = `Select a brand to view ${this.getCategoryName(category)} products`;
      if (shopPathEl) {
        shopPathEl.innerHTML = `<a href="shop.html">Shop</a> <span>/</span> ${this.getCategoryName(category)}`;
      }
      return;
    }

    const toolbar = document.querySelector('.shop-toolbar');
    if (toolbar) toolbar.style.display = '';

    // Breadcrumb path
    if (shopPathEl) {
      let path = `<a href="shop.html">Shop</a>`;
      if (category) path += ` <span>/</span> <a href="shop.html?category=${category}">${this.getCategoryName(category)}</a>`;
      if (brand && brand !== 'all') {
        const brandName = this.data.brands?.find(b => b.id === brand)?.name || brand;
        path += ` <span>/</span> ${brandName}`;
      } else if (brand === 'all') {
        path += ` <span>/</span> All Brands`;
      }
      if (sale) path = `<a href="shop.html">Shop</a> <span>/</span> Sale Products`;
      shopPathEl.innerHTML = path;
    }

    let filtered = [...this.data.products];
    if (category) filtered = filtered.filter(p => p.category === category);
    if (brand && brand !== 'all') filtered = filtered.filter(p => p.brandId === brand);
    if (!category && brand && brand !== 'all') filtered = filtered.filter(p => p.brandId === brand);
    if (sale) filtered = filtered.filter(p => this.isActiveFlag(p.isSale));
    if (instock === '1') filtered = filtered.filter(p => this.isInStock(p));
    if (query) filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query)
    );

    const instockCb = document.getElementById('filter-instock');
    if (instockCb) instockCb.checked = instock === '1';

    const grid = document.getElementById('shop-products');
    const count = document.getElementById('product-count');
    if (count) count.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`;
    if (grid) {
      grid.innerHTML = filtered.length
        ? filtered.map(p => this.productCard(p)).join('')
        : '<div class="empty-state"><h3>No products found</h3><p>Try a different category or brand</p><a href="shop.html" class="btn btn--primary" style="margin-top:16px">Browse All</a></div>';
    }

    // Compact brand picker when viewing products in a category
    if (brandPickerEl && category && brand && !sale && !query) {
      const catBrands = this.getBrandsForCategory(category);
      brandPickerEl.style.display = 'block';
      brandPickerEl.innerHTML = `
        <div class="brand-picker__header">
          <h2 class="brand-picker__title">${this.getCategoryName(category)}</h2>
          <a href="shop.html?category=${category}" class="brand-picker__back">← Change Brand</a>
        </div>
        <div class="brand-picker__grid" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">
          <a href="shop.html?category=${category}&brand=all" class="brand-picker__card${brand === 'all' ? ' active' : ''}">
            <span style="font-size:1.25rem">All</span>
            <span>All Brands</span>
          </a>
          ${catBrands.map(b => this.brandPickerCard(b, category, brand)).join('')}
        </div>`;
    } else if (brandPickerEl && !showBrandPickerOnly) {
      brandPickerEl.style.display = 'none';
    }

    // Category filters
    document.querySelectorAll('[data-filter-category]').forEach(cb => {
      if (category && cb.value === category) cb.checked = true;
      cb.addEventListener('change', () => {
        const checked = [...document.querySelectorAll('[data-filter-category]:checked')].map(c => c.value);
        const url = new URL(location);
        if (checked.length === 1) url.searchParams.set('category', checked[0]);
        else url.searchParams.delete('category');
        location.href = url.toString();
      });
    });

    document.getElementById('sort-select')?.addEventListener('change', e => {
      const sorted = [...filtered];
      switch (e.target.value) {
        case 'price-low': sorted.sort((a, b) => a.price - b.price); break;
        case 'price-high': sorted.sort((a, b) => b.price - a.price); break;
        case 'rating': sorted.sort((a, b) => b.rating - a.rating); break;
        case 'newest': sorted.sort((a, b) => (this.isActiveFlag(b.isNew) ? 1 : 0) - (this.isActiveFlag(a.isNew) ? 1 : 0)); break;
      }
      if (grid) grid.innerHTML = sorted.map(p => this.productCard(p)).join('');
    });

    this.initCountdown();

    const sidebarBrands = document.getElementById('sidebar-brands');
    if (sidebarBrands && this.data.brands) {
      sidebarBrands.innerHTML = this.data.brands.map(b =>
        `<label><input type="checkbox"${brand === b.id ? ' checked' : ''} onclick="location.href='shop.html?brand=${b.id}'"> ${b.name}</label>`
      ).join('');
    }
  },

  renderProductDetail() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const slug = params.get('slug');
    const product = this.data.products.find(p => p.id === id || p.slug === id || p.slug === slug);
    const el = document.getElementById('product-detail');
    if (!product || !el) {
      if (el) el.innerHTML = '<div class="empty-state"><h3>Product not found</h3><a href="shop.html" class="btn btn--primary">Back to Shop</a></div>';
      return;
    }

    const discount = product.originalPrice ? this.discountPercent(product.price, product.originalPrice) : 0;
    const inStock = this.isInStock(product);
    const desc = this.cleanText(product.shortDescription || product.description) ||
      `Premium quality ${product.category.replace(/-/g, ' ')} supplement from ${product.brand}. 100% genuine product with lab-tested quality assurance. Free shipping across India with Cash on Delivery available.`;
    const ratingStats = this.getProductRatingStats(product.id);
    const stockHtml = inStock
      ? '<div class="product-detail__stock product-detail__stock--in">✓ In Stock</div>'
      : '<div class="product-detail__stock product-detail__stock--out">Out of Stock — not available for order</div>';
    const actionsHtml = inStock
      ? `<div class="product-detail__actions">
            <div class="qty-selector">
              <button onclick="FlexHealth.changeQty(-1)">−</button>
              <span id="qty">1</span>
              <button onclick="FlexHealth.changeQty(1)">+</button>
            </div>
            <button class="btn btn--primary btn--lg" style="flex:1" onclick="FlexHealth.addToCart('${product.id}')">Add to Bag</button>
            <button class="btn btn--outline btn--lg" onclick="FlexHealth.buyNow('${product.id}')">Buy Now</button>
          </div>`
      : `<div class="product-detail__actions product-detail__actions--oos">
            <button class="btn btn--outline btn--lg" disabled style="flex:1">Out of Stock</button>
            <a href="shop.html?category=${encodeURIComponent(product.category)}" class="btn btn--primary btn--lg">Browse Similar</a>
          </div>`;
    el.innerHTML = `
      <div class="breadcrumb container">
        <a href="index.html">Home</a> / <a href="shop.html">Shop</a> / ${product.name.substring(0, 50)}...
      </div>
      <div class="container product-detail${inStock ? '' : ' product-detail--oos'}">
        <div class="product-detail__gallery">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-detail__info">
          ${product.badge && inStock ? `<span class="product-card__badge ${this.badgeClass(product.badge)}">${product.badge}</span>` : ''}
          ${!inStock ? '<span class="product-card__badge badge--oos">Out of Stock</span>' : ''}
          <div class="product-detail__brand">${product.brand}</div>
          <h1 class="product-detail__title">${product.name}</h1>
          <div class="product-detail__rating" id="product-detail-rating">
            <span class="stars">${this.stars(ratingStats.rating)}</span>
            <span>${ratingStats.rating ? ratingStats.rating : '—'} ${ratingStats.count ? `(${ratingStats.count} reviews)` : '(No reviews yet)'}</span>
          </div>
          ${stockHtml}
          <div class="product-detail__price">
            <span class="price-current">${this.formatPrice(product.price)}</span>
            ${product.originalPrice ? `<span class="price-original">${this.formatPrice(product.originalPrice)}</span>` : ''}
            ${discount ? `<span class="price-discount">Save ${discount}%</span>` : ''}
          </div>
          <p class="product-detail__desc">${desc}</p>
          ${product.sku ? `<p class="product-detail__sku" style="font-size:.8125rem;color:var(--color-gray-500);margin-bottom:16px">SKU: ${product.sku} · <a href="verify.html?code=${encodeURIComponent(product.sku)}">Verify authenticity</a></p>` : `<p class="product-detail__sku" style="font-size:.8125rem;margin-bottom:16px"><a href="verify.html?code=${encodeURIComponent(product.id)}">Verify authenticity</a></p>`}
          <div class="product-detail__features">
            <div class="feature-item">100% Genuine Product</div>
            <div class="feature-item">Pan-India Delivery</div>
            <div class="feature-item">Cash on Delivery</div>
            <div class="feature-item">Safe & Secure Packaging</div>
          </div>
          <div class="product-pincode-check" id="product-pincode-check">
            <label for="product-pincode-input">Check delivery &amp; shipping</label>
            <div class="product-pincode-check__row">
              <input type="text" id="product-pincode-input" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="Enter pincode" aria-label="Delivery pincode">
              <button type="button" class="btn btn--outline btn--sm" id="product-pincode-btn">Check</button>
            </div>
            <div id="product-pincode-msg" class="form-hint"></div>
          </div>
          ${actionsHtml}
          <div class="product-detail__trust">
            <div class="trust-item"><div class="trust-item__icon">🚚</div><div class="trust-item__text">Shiprocket Delivery<small>Realtime rates</small></div></div>
            <div class="trust-item"><div class="trust-item__icon">💰</div><div class="trust-item__text">Cash on Delivery<small>Available</small></div></div>
            <div class="trust-item"><div class="trust-item__icon">📦</div><div class="trust-item__text">Safe Packaging<small>Guaranteed</small></div></div>
            <div class="trust-item"><div class="trust-item__icon">🛡️</div><div class="trust-item__text">Best Support<small>Expert Help</small></div></div>
          </div>
        </div>
      </div>`;

    this.bindProductPincodeCheck?.(product);
    const related = document.getElementById('related-products');
    if (related) {
      const items = this.data.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
      related.innerHTML = items.map(p => this.productCard(p)).join('');
    }
    this.renderProductReviews(product.id);
  },

  changeQty(delta) {
    const el = document.getElementById('qty');
    if (el) el.textContent = Math.max(1, +el.textContent + delta);
  },

  initContact() {
    document.getElementById('contact-form')?.addEventListener('submit', e => {
      e.preventDefault();
      this.toast('Message sent! We will get back to you soon.');
      e.target.reset();
    });
  },

  initAbout() {
    const revEl = document.getElementById('reviews');
    if (revEl && this.data?.reviews) {
      revEl.innerHTML = this.data.reviews.map(r => `
        <div class="review-card">
          <div class="review-card__stars">${this.stars(r.rating)}</div>
          <p class="review-card__text">"${r.text}"</p>
          <div class="review-card__author">${r.name}</div>
        </div>`).join('');
    }
  },

  initFaq() {
    document.querySelectorAll('.faq-item__question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const open = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!open) item.classList.add('open');
      });
    });
  },

  initPolicyPage() {
    document.querySelectorAll('.policy-toc a').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href')?.slice(1);
        if (id && document.getElementById(id)) {
          e.preventDefault();
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  },

  escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  initGlobalHandlers() {
    document.addEventListener('click', e => {
      const addBtn = e.target.closest('[data-add-cart]');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = addBtn.getAttribute('data-add-cart');
        if (id) this.addToCart(id);
        return;
      }
      const wishBtn = e.target.closest('.product-card__wishlist');
      if (wishBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = wishBtn.closest('.product-card')?.dataset.id;
        if (id) this.toggleWishlist(id);
      }
      if (!e.target.closest('.account-menu')) {
        document.getElementById('account-dropdown')?.classList.remove('open');
      }
    });
  },

  isLoggedIn() {
    return !!this.session?.userId;
  },

  getUsers() {
    return JSON.parse(localStorage.getItem('flexhealth_users') || '[]');
  },

  saveUsers(users) {
    localStorage.setItem('flexhealth_users', JSON.stringify(users));
  },

  getCurrentUser() {
    if (!this.isLoggedIn()) return null;
    return this.getUsers().find(u => u.id === this.session.userId) || null;
  },

  normalizePhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length >= 10) return digits.slice(-10);
    return digits;
  },

  formatPhoneDisplay(phone) {
    const p = this.normalizePhone(phone);
    if (p.length !== 10) return phone;
    return `+91 ${p.slice(0, 5)} ${p.slice(5)}`;
  },

  findUserByPhone(phone) {
    const normalized = this.normalizePhone(phone);
    return this.getUsers().find(u => this.normalizePhone(u.phone) === normalized) || null;
  },

  generateOtp() {
    if (AUTH_TEST_MODE) return AUTH_TEST_OTP;
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  getPendingOtp() {
    try {
      return JSON.parse(sessionStorage.getItem('flexhealth_otp_pending') || 'null');
    } catch {
      return null;
    }
  },

  savePendingOtp(data) {
    sessionStorage.setItem('flexhealth_otp_pending', JSON.stringify(data));
  },

  clearPendingOtp() {
    sessionStorage.removeItem('flexhealth_otp_pending');
  },

  sendOtp(phone, mode, signupData = null) {
    const normalized = this.normalizePhone(phone);
    if (normalized.length !== 10) {
      return { ok: false, msg: 'Enter a valid 10-digit mobile number.' };
    }
    if (mode === 'login') {
      const user = this.findUserByPhone(normalized);
      if (!user) {
        return { ok: false, msg: 'No account found for this number. Please sign up first.' };
      }
    }
    if (mode === 'signup') {
      if (this.findUserByPhone(normalized)) {
        return { ok: false, msg: 'This number is already registered. Use Login instead.' };
      }
      if (!signupData?.name?.trim()) {
        return { ok: false, msg: 'Please enter your name.' };
      }
    }
    const otp = this.generateOtp();
    const pending = {
      phone: normalized,
      otp,
      mode,
      signupData: signupData ? {
        name: signupData.name.trim(),
        email: (signupData.email || '').trim().toLowerCase(),
        phone: normalized
      } : null,
      expires: Date.now() + AUTH_OTP_EXPIRY_MS
    };
    this.savePendingOtp(pending);
    return { ok: true, otp, phone: normalized };
  },

  verifyOtp(phone, otp) {
    const normalized = this.normalizePhone(phone);
    const code = String(otp || '').trim();
    const pending = this.getPendingOtp();

    if (AUTH_TEST_MODE && code === AUTH_TEST_OTP) {
      if (pending?.phone === normalized) {
        return this.completeOtpAuth(pending);
      }
      const user = this.findUserByPhone(normalized);
      if (user) {
        this.session = { userId: user.id, email: user.email, name: user.name, phone: user.phone };
        localStorage.setItem('flexhealth_session', JSON.stringify(this.session));
        return { ok: true };
      }
      return { ok: false, msg: 'Complete Send OTP first, or use Quick Test Login.' };
    }

    if (!pending || pending.phone !== normalized) {
      return { ok: false, msg: 'OTP expired. Please request a new one.' };
    }
    if (Date.now() > pending.expires) {
      this.clearPendingOtp();
      return { ok: false, msg: 'OTP expired. Please request a new one.' };
    }
    if (code !== pending.otp) {
      return { ok: false, msg: 'Invalid OTP. Please try again.' };
    }
    return this.completeOtpAuth(pending);
  },

  completeOtpAuth(pending) {
    this.clearPendingOtp();
    if (pending.mode === 'login') {
      const user = this.findUserByPhone(pending.phone);
      if (!user) return { ok: false, msg: 'Account not found.' };
      this.session = { userId: user.id, email: user.email, name: user.name, phone: user.phone };
      localStorage.setItem('flexhealth_session', JSON.stringify(this.session));
      return { ok: true };
    }
    const users = this.getUsers();
    const email = pending.signupData?.email || `${pending.phone}@flexhealth.local`;
    const user = {
      id: 'u' + Date.now(),
      name: pending.signupData.name,
      email,
      phone: pending.phone,
      address: '',
      city: '',
      pincode: '',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    this.saveUsers(users);
    this.session = { userId: user.id, email: user.email, name: user.name, phone: user.phone };
    localStorage.setItem('flexhealth_session', JSON.stringify(this.session));
    return { ok: true, isNew: true };
  },

  testLoginAsDemo() {
    const phone = '9876543210';
    let user = this.findUserByPhone(phone);
    if (!user) {
      const users = this.getUsers();
      user = {
        id: 'u_test_demo',
        name: 'Test User',
        email: 'test@flexhealth.local',
        phone,
        address: '123 Test Street, Banjara Hills',
        city: 'Hyderabad',
        pincode: '500034',
        createdAt: new Date().toISOString()
      };
      users.push(user);
      this.saveUsers(users);
    }
    this.session = { userId: user.id, email: user.email, name: user.name, phone: user.phone };
    localStorage.setItem('flexhealth_session', JSON.stringify(this.session));
    return user;
  },

  seedDemoOrder() {
    if (!this.isLoggedIn()) return;
    const product = this.data?.products?.[0];
    if (!product) {
      this.toast('No products loaded');
      return;
    }
    const orders = this.getAllOrders();
    const orderId = 'FH-TEST-' + Date.now().toString().slice(-6);
    orders.unshift({
      id: orderId,
      date: new Date().toISOString(),
      userId: this.session.userId,
      status: 'placed',
      statusHistory: [{ status: 'placed', at: new Date().toISOString() }],
      customer: {
        name: this.session.name,
        phone: this.session.phone || '9876543210',
        email: this.session.email
      },
      items: [{ id: product.id, name: product.name, qty: 1, price: product.price }],
      total: product.price,
      payment: 'cod'
    });
    localStorage.setItem('flexhealth_orders', JSON.stringify(orders.slice(0, 50)));
    this.toast('Demo order added — you can now review the product');
  },

  renderAuthTestBanner() {
    if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isEnabled()) {
      const el = document.getElementById('auth-test-banner');
      if (el) {
        el.innerHTML = `
          <div class="test-mode-banner test-mode-banner--firebase">
            <span>📱 <strong>Firebase OTP</strong> — Real SMS will be sent to your phone</span>
          </div>`;
      }
      return;
    }
    if (!AUTH_TEST_MODE) return;
    const el = document.getElementById('auth-test-banner');
    if (el) {
      el.innerHTML = `
        <div class="test-mode-banner">
          <span>🧪 <strong>Testing Mode</strong> — OTP is always <code>${AUTH_TEST_OTP}</code> (shown after Send OTP)</span>
        </div>`;
    }
    const actions = document.getElementById('auth-test-actions');
    if (actions) {
      actions.innerHTML = `
        <div class="test-mode-card">
          <p><strong>Quick test (skip OTP)</strong></p>
          <button type="button" class="btn btn--outline btn--sm" id="test-quick-login">Login as Test User</button>
          <button type="button" class="btn btn--outline btn--sm" id="test-go-account">Go to Account Dashboard</button>
        </div>`;
      document.getElementById('test-quick-login')?.addEventListener('click', async () => {
        await this.testLoginAsDemo();
        this.toast('Logged in as Test User');
        setTimeout(() => { location.href = this.getRedirectUrl(); }, 300);
      });
      document.getElementById('test-go-account')?.addEventListener('click', () => {
        if (!this.isLoggedIn()) this.testLoginAsDemo();
        location.href = 'account.html';
      });
    }
  },

  renderTestModePanel() {
    if (!AUTH_TEST_MODE || !this.isLoggedIn()) return;
    if (document.getElementById('test-mode-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'test-mode-panel';
    panel.className = 'test-mode-panel';
    panel.innerHTML = `
      <button type="button" class="test-mode-panel__toggle" id="test-panel-toggle" aria-label="Testing tools">🧪</button>
      <div class="test-mode-panel__body" id="test-panel-body">
        <div class="test-mode-panel__head">
          <strong>Testing Mode</strong>
          <span>OTP: ${AUTH_TEST_OTP}</span>
        </div>
        <p class="test-mode-panel__user">Logged in: ${this.escapeHtml(this.session.name)}</p>
        <nav class="test-mode-panel__links">
          <a href="account.html">Overview</a>
          <a href="account.html#orders">Orders</a>
          <a href="account.html#wishlist">Wishlist</a>
          <a href="account.html#reviews">Reviews</a>
          <a href="account.html#profile">Profile</a>
          <a href="cart.html">Cart</a>
          <a href="shop.html">Shop</a>
          <a href="admin.html">Admin</a>
        </nav>
        <div class="test-mode-panel__actions">
          <button type="button" class="btn btn--outline btn--sm" id="test-seed-order">+ Demo Order</button>
          <button type="button" class="btn btn--outline btn--sm" id="test-logout">Logout</button>
        </div>
      </div>`;
    document.body.appendChild(panel);
    document.getElementById('test-panel-toggle')?.addEventListener('click', () => {
      document.getElementById('test-panel-body')?.classList.toggle('open');
    });
    document.getElementById('test-seed-order')?.addEventListener('click', () => this.seedDemoOrder());
    document.getElementById('test-logout')?.addEventListener('click', () => this.logout());
  },

  showOtpHint(elId, otp) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isEnabled()) {
      el.innerHTML = `<div class="otp-hint__box">📱 Real SMS OTP sent via Firebase. Check your phone and enter the 6-digit code.</div>`;
      el.style.display = 'block';
      return;
    }
    if (AUTH_TEST_MODE) {
      el.innerHTML = `<div class="otp-hint__box">🧪 Test OTP: <strong>${otp || AUTH_TEST_OTP}</strong></div>`;
      el.style.display = 'block';
    } else {
      el.innerHTML = `<div class="otp-hint__box">Check your SMS for the OTP.</div>`;
      el.style.display = 'block';
    }
  },

  logout() {
    this.session = null;
    localStorage.removeItem('flexhealth_session');
    this.clearPendingOtp();
    location.href = 'index.html';
  },

  updateProfile(data) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === this.session?.userId);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...data };
    this.saveUsers(users);
    this.session.name = users[idx].name;
    localStorage.setItem('flexhealth_session', JSON.stringify(this.session));
    return true;
  },

  getAllOrders() {
    return JSON.parse(localStorage.getItem('flexhealth_orders') || '[]');
  },

  getUserOrders() {
    if (!this.isLoggedIn()) return [];
    return this.getAllOrders()
      .filter(o => o.userId === this.session.userId)
      .map(o => this.normalizeOrder(o));
  },

  getAllReviews() {
    return JSON.parse(localStorage.getItem('flexhealth_reviews') || '[]');
  },

  getUserReviews() {
    if (!this.isLoggedIn()) return [];
    return this.getAllReviews().filter(r => r.userId === this.session.userId);
  },

  getProductUserReviews(productId) {
    return this.getAllReviews().filter(r => r.productId === productId);
  },

  getProductRatingStats(productId) {
    const product = this.data?.products?.find(p => p.id === productId);
    const userReviews = this.getProductUserReviews(productId);
    const baseRating = product?.rating || 0;
    const baseCount = product?.reviews || 0;
    if (!userReviews.length) return { rating: baseRating, count: baseCount };
    const userAvg = userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length;
    const totalCount = baseCount + userReviews.length;
    const combined = baseCount > 0
      ? ((baseRating * baseCount) + (userAvg * userReviews.length)) / totalCount
      : userAvg;
    return { rating: Math.round(combined * 10) / 10, count: totalCount };
  },

  hasUserReviewed(productId) {
    if (!this.isLoggedIn()) return false;
    return this.getProductUserReviews(productId).some(r => r.userId === this.session.userId);
  },

  canReviewProduct(productId) {
    if (!this.isLoggedIn() || this.hasUserReviewed(productId)) return false;
    return this.getUserOrders().some(o =>
      o.status === 'delivered' && o.items.some(i => i.id === productId)
    );
  },

  submitReview(productId, rating, text) {
    if (!this.isLoggedIn()) return { ok: false, msg: 'Please sign in to review.' };
    if (this.hasUserReviewed(productId)) return { ok: false, msg: 'You already reviewed this product.' };
    if (!this.canReviewProduct(productId)) return { ok: false, msg: 'Reviews unlock after delivery.' };
    const user = this.getCurrentUser();
    const reviews = this.getAllReviews();
    reviews.unshift({
      id: 'r' + Date.now(),
      productId,
      userId: this.session.userId,
      userName: user.name,
      rating: +rating,
      text: text.trim(),
      date: new Date().toISOString()
    });
    localStorage.setItem('flexhealth_reviews', JSON.stringify(reviews));
    return { ok: true };
  },

  getWishlist() {
    if (!this.isLoggedIn()) return [];
    return JSON.parse(localStorage.getItem(`flexhealth_wishlist_${this.session.userId}`) || '[]');
  },

  saveWishlist(list) {
    if (!this.isLoggedIn()) return;
    localStorage.setItem(`flexhealth_wishlist_${this.session.userId}`, JSON.stringify(list));
  },

  isInWishlist(id) {
    return this.getWishlist().includes(id);
  },

  toggleWishlist(id) {
    if (!this.isLoggedIn()) {
      this.toast('Sign in to save to wishlist');
      setTimeout(() => {
        location.href = 'login.html?redirect=' + encodeURIComponent(location.pathname + location.search);
      }, 700);
      return;
    }
    let list = this.getWishlist();
    const added = !list.includes(id);
    list = added ? [...list, id] : list.filter(x => x !== id);
    this.saveWishlist(list);
    this.toast(added ? 'Added to wishlist ♡' : 'Removed from wishlist');
    document.querySelectorAll(`.product-card[data-id="${id}"] .product-card__wishlist`).forEach(btn => {
      btn.classList.toggle('active', added);
      btn.textContent = added ? '♥' : '♡';
    });
  },

  prefillCheckoutForm() {
    const user = this.getCurrentUser();
    if (!user) return;
    const form = document.getElementById('checkout-details-form');
    if (!form) return;
    const set = (name, val) => { const el = form.elements[name]; if (el && val) el.value = val; };
    set('name', user.name);
    set('phone', user.phone);
    set('email', user.email);
    set('address', user.address);
    set('city', user.city);
    set('pincode', user.pincode);
    if (this.saveCheckoutDraft && !this.checkoutDraft) {
      this.checkoutDraft = Object.fromEntries(new FormData(form));
    }
  },

  getRedirectUrl() {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    if (redirect && !redirect.includes('://')) return redirect;
    return 'account.html';
  },

  initLoginPage() {
    if (this.isLoggedIn()) {
      location.href = this.getRedirectUrl();
      return;
    }
    this.renderAuthTestBanner();

    const switchTab = tab => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('auth-' + tab)?.classList.add('active');
      this.resetAuthSteps(tab);
    };

    const resetAuthSteps = mode => {
      if (mode === 'login') {
        document.getElementById('login-step-phone')?.classList.add('active');
        document.getElementById('login-step-otp')?.classList.remove('active');
      } else {
        document.getElementById('signup-step-details')?.classList.add('active');
        document.getElementById('signup-step-otp')?.classList.remove('active');
      }
    };
    this.resetAuthSteps = resetAuthSteps;

    const goLoginOtp = phone => {
      document.getElementById('login-step-phone')?.classList.remove('active');
      document.getElementById('login-step-otp')?.classList.add('active');
      const el = document.getElementById('login-otp-phone');
      if (el) el.textContent = this.formatPhoneDisplay(phone);
      document.querySelector('#login-otp-form input[name="otp"]')?.focus();
    };

    const goSignupOtp = phone => {
      document.getElementById('signup-step-details')?.classList.remove('active');
      document.getElementById('signup-step-otp')?.classList.add('active');
      const el = document.getElementById('signup-otp-phone');
      if (el) el.textContent = this.formatPhoneDisplay(phone);
      document.querySelector('#signup-otp-form input[name="otp"]')?.focus();
    };

    document.querySelectorAll('.auth-tab, .auth-link-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.querySelectorAll('.auth-back-btn').forEach(btn => {
      btn.addEventListener('click', () => resetAuthSteps(btn.dataset.back));
    });

    let loginPhone = '';
    let signupData = null;

    document.getElementById('login-phone-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      const res = await this.sendOtp(data.phone, 'login');
      if (res.ok) {
        loginPhone = res.phone;
        this.showOtpHint('login-otp-hint', res.otp);
        this.toast('OTP sent to your mobile');
        goLoginOtp(res.phone);
      } else {
        this.toast(res.msg);
      }
    });

    document.getElementById('login-otp-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const otp = e.target.elements.otp.value;
      const res = await this.verifyOtp(loginPhone, otp);
      if (res.ok) {
        this.toast('Welcome back!');
        setTimeout(() => { location.href = this.getRedirectUrl(); }, 400);
      } else {
        this.toast(res.msg);
      }
    });

    document.getElementById('login-resend-otp')?.addEventListener('click', async () => {
      if (!loginPhone) return;
      const res = await this.sendOtp(loginPhone, 'login');
      if (res.ok) {
        this.showOtpHint('login-otp-hint', res.otp);
        this.toast('OTP resent');
      } else {
        this.toast(res.msg);
      }
    });

    document.getElementById('signup-details-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      signupData = Object.fromEntries(new FormData(e.target));
      const res = await this.sendOtp(signupData.phone, 'signup', signupData);
      if (res.ok) {
        this.showOtpHint('signup-otp-hint', res.otp);
        this.toast('OTP sent to your mobile');
        goSignupOtp(res.phone);
      } else {
        this.toast(res.msg);
      }
    });

    document.getElementById('signup-otp-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const otp = e.target.elements.otp.value;
      const phone = signupData?.phone || this.getPendingOtp()?.phone;
      const res = await this.verifyOtp(phone, otp);
      if (res.ok) {
        this.toast(res.isNew ? 'Account created!' : 'Welcome!');
        setTimeout(() => { location.href = this.getRedirectUrl(); }, 400);
      } else {
        this.toast(res.msg);
      }
    });

    document.getElementById('signup-resend-otp')?.addEventListener('click', async () => {
      if (!signupData) return;
      const res = await this.sendOtp(signupData.phone, 'signup', signupData);
      if (res.ok) {
        this.showOtpHint('signup-otp-hint', res.otp);
        this.toast('OTP resent');
      } else {
        this.toast(res.msg);
      }
    });

    document.querySelectorAll('.otp-input').forEach(input => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 6);
      });
    });

    const tab = new URLSearchParams(location.search).get('tab');
    if (tab === 'signup') switchTab('signup');
  },

  paymentMethodLabel(method) {
    const map = {
      cod: 'Cash on Delivery',
      phonepe: 'PhonePe (UPI / Card)',
      online: 'PhonePe (UPI / Card)',
      upi: 'PhonePe UPI',
      card: 'PhonePe Card'
    };
    return map[method] || method || 'Cash on Delivery';
  },

  paymentStatusLabel(status) {
    const map = { cod: 'COD', pending: 'Payment Pending', paid: 'Paid', failed: 'Failed', refunded: 'Refunded' };
    return map[status] || status || '';
  },

  getCatalogProduct(id) {
    return this.data?.products?.find(p => p.id === id) || null;
  },

  getProductImage(productOrId) {
    const p = typeof productOrId === 'string' ? this.getCatalogProduct(productOrId) : productOrId;
    if (!p) return 'images/products/placeholder.png';
    return p.image || p.imageUrl || 'images/products/placeholder.png';
  },

  orderItemProduct(item) {
    const catalog = this.getCatalogProduct(item.id);
    return {
      id: item.id,
      name: item.name,
      qty: item.qty,
      price: item.price,
      brand: catalog?.brand || '',
      image: this.getProductImage(catalog || item.id),
      shortDescription: catalog ? this.cleanText(catalog.shortDescription || catalog.description, 100) : '',
      inStock: catalog ? this.isInStock(catalog) : true
    };
  },

  orderProductRowHtml(item, opts = {}) {
    const p = this.orderItemProduct(item);
    return `
      <div class="order-product-row${opts.compact ? ' order-product-row--compact' : ''}">
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="order-product-row__img">
          <img src="${this.escapeHtml(p.image)}" alt="${this.escapeHtml(p.name)}" loading="lazy">
        </a>
        <div class="order-product-row__body">
          <div class="order-product-row__brand">${this.escapeHtml(p.brand || 'Flex Health')}</div>
          <a href="product.html?id=${encodeURIComponent(p.id)}" class="order-product-row__name">${this.escapeHtml(p.name)}</a>
          ${p.shortDescription && !opts.compact ? `<p class="order-product-row__desc">${this.escapeHtml(p.shortDescription)}</p>` : ''}
          <div class="order-product-row__meta">
            <span>Qty ${p.qty}</span>
            <span>·</span>
            <span>${this.formatPrice(p.price)} each</span>
            <strong class="order-product-row__line-total">${this.formatPrice(p.price * p.qty)}</strong>
          </div>
        </div>
        ${opts.showReorder !== false && p.inStock ? `<button type="button" class="btn btn--outline btn--sm order-product-row__reorder" onclick="FlexHealth.addToCart('${p.id}')">Buy Again</button>` : ''}
      </div>`;
  },

  orderCardThumbsHtml(order, max = 4) {
    const extra = order.items.length - max;
    return `
      <div class="order-card__thumbs">
        ${order.items.slice(0, max).map(i =>
          `<img src="${this.escapeHtml(this.getProductImage(i.id))}" alt="" class="order-card__thumb" loading="lazy">`
        ).join('')}
        ${extra > 0 ? `<span class="order-card__thumb-more">+${extra}</span>` : ''}
      </div>`;
  },

  userOrderCardHtml(order, expandFirst = false) {
    const o = this.normalizeOrder(order);
    const isOpen = expandFirst;
    return `
      <article class="user-order-card${isOpen ? ' is-open' : ''}" data-order-id="${this.escapeHtml(o.id)}">
        <button type="button" class="user-order-card__summary" aria-expanded="${isOpen}" data-order-toggle>
          <div class="user-order-card__main">
            ${this.orderCardThumbsHtml(o)}
            <div class="user-order-card__info">
              <strong class="user-order-card__id">${this.escapeHtml(o.id)}</strong>
              <span class="user-order-card__meta">${this.formatDateTime(o.date)} · ${o.items.length} item${o.items.length !== 1 ? 's' : ''} · ${this.paymentMethodLabel(o.payment)}</span>
            </div>
          </div>
          <div class="user-order-card__aside">
            <span class="order-status order-status--${o.status}">${this.orderStatusLabel(o.status)}</span>
            <strong class="user-order-card__total">${this.formatPrice(o.total)}</strong>
            <svg class="user-order-card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </button>
        <div class="user-order-card__detail"${isOpen ? '' : ' hidden'}>
          ${this.orderTimelineHtml(o, true)}
          <div class="user-order-card__section">
            <h4>Order Items</h4>
            <div class="user-order-card__products">
              ${o.items.map(i => this.orderProductRowHtml(i, { showReorder: false })).join('')}
            </div>
          </div>
          <div class="user-order-card__section user-order-card__grid">
            <div>
              <h4>Shipping Address</h4>
              <p class="user-order-card__address">${this.escapeHtml(o.customer.name)}<br>
              ${this.escapeHtml(o.customer.phone)}<br>
              ${this.escapeHtml(o.customer.address || '')}${o.customer.city ? '<br>' + this.escapeHtml(o.customer.city) : ''} ${this.escapeHtml(o.customer.pincode || '')}</p>
            </div>
            <div>
              <h4>Payment Method</h4>
              <p class="user-order-card__payment">${this.paymentMethodLabel(o.payment)}${o.paymentStatus ? `<br><span class="payment-badge payment-badge--${o.paymentStatus}">${this.paymentStatusLabel(o.paymentStatus)}</span>` : ''}</p>
              ${o.paymentRecord?.transactionId ? `<p class="user-order-card__txn">Transaction ID: ${this.escapeHtml(o.paymentRecord.transactionId)}</p>` : ''}
              ${o.promoCode ? `<p class="user-order-card__txn">Promo: ${this.escapeHtml(o.promoCode)}${o.discountAmount ? ` (−${this.formatPrice(o.discountAmount)})` : ''}</p>` : ''}
            </div>
          </div>
          <div class="user-order-card__actions">
            <a href="order.html?id=${encodeURIComponent(o.id)}" class="btn btn--primary btn--sm">View Order Details</a>
            <a href="track.html?orderId=${encodeURIComponent(o.id)}" class="btn btn--outline btn--sm">Track Shipment</a>
          </div>
        </div>
      </article>`;
  },

  bindUserOrderCards(root) {
    if (!root) return;
    root.querySelectorAll('[data-order-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.user-order-card');
        const detail = card?.querySelector('.user-order-card__detail');
        const open = !card?.classList.contains('is-open');
        card?.classList.toggle('is-open', open);
        if (detail) detail.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  },

  accountTabTitles: {
    dashboard: 'Dashboard',
    overview: 'Dashboard',
    orders: 'My Orders',
    wishlist: 'Wishlist',
    reviews: 'My Reviews',
    profile: 'Profile'
  },

  accountPanelHead(title, sub = '', count = '') {
    return `
      <div class="account-panel__head">
        <div>
          <h2>${title}${count ? `<span class="account-panel__count">${count} items</span>` : ''}</h2>
          ${sub ? `<p class="account-panel__sub">${sub}</p>` : ''}
        </div>
      </div>`;
  },

  accountEmptyHtml(title, text, btnLabel, btnHref) {
    return `
      <div class="account-empty">
        <h3>${title}</h3>
        <p>${text}</p>
        ${btnLabel && btnHref ? `<a href="${btnHref}" class="btn btn--primary">${btnLabel}</a>` : ''}
      </div>`;
  },

  renderAccountUserCard(user) {
    const el = document.getElementById('account-user-card');
    if (!el) return;
    const name = user?.name || this.session?.name || 'Customer';
    const phone = user?.phone || this.session?.phone || '';
    const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'FH';
    const orderCount = this.getUserOrders().length;
    el.innerHTML = `
      <div class="account-user">
        <div class="account-user__avatar" aria-hidden="true">${this.escapeHtml(initials)}</div>
        <div class="account-user__info">
          <div class="account-user__name">${this.escapeHtml(name)}</div>
          <div class="account-user__phone">${phone ? this.escapeHtml(this.formatPhoneDisplay(phone)) : ''}</div>
          <div class="account-user__meta">${orderCount} order${orderCount !== 1 ? 's' : ''} placed</div>
        </div>
      </div>`;
  },

  renderAccount() {
    if (!this.isLoggedIn()) {
      location.href = 'login.html?redirect=' + encodeURIComponent('account.html' + location.hash);
      return;
    }
    const user = this.getCurrentUser();
    this.renderAccountUserCard(user);
    const welcome = document.getElementById('account-welcome');
    if (welcome) welcome.textContent = `Signed in as ${user?.name || 'Customer'}.`;

    const showTab = tab => {
      const normalized = tab === 'overview' ? 'dashboard' : tab;
      document.querySelectorAll('.account-nav__item:not(.account-nav__item--logout)').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === normalized);
      });
      const titleEl = document.getElementById('account-page-title');
      if (titleEl) titleEl.textContent = this.accountTabTitles[normalized] || 'My Account';
      const el = document.getElementById('account-content');
      if (!el) return;
      if (normalized === 'dashboard') this.renderAccountDashboard(el, user);
      else if (normalized === 'orders') this.renderAccountOrders(el);
      else if (normalized === 'wishlist') this.renderAccountWishlist(el);
      else if (normalized === 'reviews') this.renderAccountReviews(el);
      else if (normalized === 'profile') this.renderAccountProfile(el, user);
    };

    document.getElementById('account-nav')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      location.hash = btn.dataset.tab;
      showTab(btn.dataset.tab);
    });

    const tab = location.hash.replace('#', '') || 'dashboard';
    showTab(['dashboard', 'overview', 'orders', 'wishlist', 'reviews', 'profile'].includes(tab) ? tab : 'dashboard');
    window.addEventListener('hashchange', () => {
      const t = location.hash.replace('#', '') || 'dashboard';
      if (['dashboard', 'overview', 'orders', 'wishlist', 'reviews', 'profile'].includes(t)) showTab(t);
    });
  },

  formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  formatDateTime(iso) {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  },

  normalizeOrderStatus(status) {
    const legacy = { pending: 'placed', shipped: 'out_for_delivery' };
    return legacy[status] || status || 'placed';
  },

  getOrderStatusIndex(status) {
    const id = this.normalizeOrderStatus(status);
    const idx = ORDER_PIPELINE.findIndex(s => s.id === id);
    return idx >= 0 ? idx : 0;
  },

  normalizeOrder(order) {
    if (!order) return null;
    const o = { ...order };
    o.status = this.normalizeOrderStatus(o.status);
    if (!o.paymentStatus) {
      o.paymentStatus = o.payment === 'cod' ? 'cod' : (['upi', 'card', 'phonepe', 'online'].includes(o.payment) ? 'pending' : 'cod');
    }
    if (!o.statusHistory?.length) {
      const idx = this.getOrderStatusIndex(o.status);
      o.statusHistory = ORDER_PIPELINE.slice(0, idx + 1).map((step, i) => ({
        status: step.id,
        at: i === 0 ? (o.date || new Date().toISOString()) : o.date
      }));
    }
    return o;
  },

  getOrderById(id) {
    const order = this.getAllOrders().find(o => o.id === id);
    return order ? this.normalizeOrder(order) : null;
  },

  saveOrders(orders) {
    localStorage.setItem('flexhealth_orders', JSON.stringify(orders.slice(0, 100)));
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getAllOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return { ok: false, msg: 'Order not found' };
    const order = this.normalizeOrder(orders[idx]);
    const newIdx = this.getOrderStatusIndex(newStatus);
    const curIdx = this.getOrderStatusIndex(order.status);
    if (newStatus === 'cancelled') {
      order.status = 'cancelled';
      order.statusHistory.push({ status: 'cancelled', at: new Date().toISOString() });
    } else if (newIdx >= curIdx) {
      order.status = newStatus;
      const now = new Date().toISOString();
      for (let i = curIdx + 1; i <= newIdx; i++) {
        const stepId = ORDER_PIPELINE[i].id;
        if (!order.statusHistory.some(h => h.status === stepId)) {
          order.statusHistory.push({ status: stepId, at: now });
        }
      }
    }
    orders[idx] = order;
    this.saveOrders(orders);
    return { ok: true, order };
  },

  advanceOrderStatus(orderId) {
    const order = this.getOrderById(orderId);
    if (!order || order.status === 'cancelled') return { ok: false, msg: 'Cannot advance' };
    if (order.status === 'delivered') return { ok: false, msg: 'Already delivered' };
    const next = ORDER_PIPELINE[this.getOrderStatusIndex(order.status) + 1];
    if (!next) return { ok: false, msg: 'No next step' };
    return this.updateOrderStatus(orderId, next.id);
  },

  orderStatusLabel(status) {
    if (status === 'cancelled') return 'Cancelled';
    const step = ORDER_PIPELINE.find(s => s.id === this.normalizeOrderStatus(status));
    return step?.label || 'Order Placed';
  },

  orderTimelineHtml(order, compact = false) {
    const o = this.normalizeOrder(order);
    if (!o) return '';
    if (o.status === 'cancelled') {
      return `<div class="order-tracker order-tracker--cancelled"><p>❌ This order was cancelled.</p></div>`;
    }
    const currentIdx = this.getOrderStatusIndex(o.status);
    const historyMap = Object.fromEntries((o.statusHistory || []).map(h => [h.status, h.at]));

    return `
      <div class="order-tracker${compact ? ' order-tracker--compact' : ''}">
        <div class="order-tracker__steps">
          ${ORDER_PIPELINE.map((step, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            const at = historyMap[step.id];
            return `
              <div class="order-tracker__step${done ? ' done' : ''}${active ? ' active' : ''}">
                <div class="order-tracker__dot">${done ? step.icon : (i + 1)}</div>
                <div class="order-tracker__info">
                  <strong>${step.label}</strong>
                  <span>${done && at ? this.formatDateTime(at) : step.desc}</span>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  },

  orderDetailHtml(order, opts = {}) {
    const o = this.normalizeOrder(order);
    if (!o) return '<div class="empty-state"><h3>Order not found</h3></div>';
    const paymentLabel = this.paymentMethodLabel(o.payment);
    const payStatus = o.paymentStatus ? this.paymentStatusLabel(o.paymentStatus) : '';
    return `
      <div class="order-detail-card">
        <div class="order-detail-card__head">
          <div>
            <h2>Order ${o.id}</h2>
            <p class="order-detail-card__meta">Placed on ${this.formatDateTime(o.date)} · ${paymentLabel}${payStatus ? ' · ' + payStatus : ''}</p>
          </div>
          <span class="order-status order-status--${o.status}">${this.orderStatusLabel(o.status)}</span>
        </div>
        ${o.paymentRecord?.transactionId ? `
          <div class="order-payment-info">
            <span>Transaction ID: <strong>${this.escapeHtml(o.paymentRecord.transactionId)}</strong></span>
            ${o.paymentStatus ? `<span class="payment-badge payment-badge--${o.paymentStatus}">${this.paymentStatusLabel(o.paymentStatus)}</span>` : ''}
          </div>` : (o.paymentStatus && o.paymentStatus !== 'cod' ? `
          <div class="order-payment-info">
            <span class="payment-badge payment-badge--${o.paymentStatus}">${this.paymentStatusLabel(o.paymentStatus)}</span>
          </div>` : '')}
        ${o.awb ? `
          <div class="order-payment-info">
            <span>Courier: <strong>${this.escapeHtml(o.courierName || 'Delhivery')}</strong></span>
            <span>AWB: <strong>${this.escapeHtml(o.awb)}</strong></span>
            ${o.trackingUrl ? `<a href="${this.escapeHtml(o.trackingUrl)}" class="btn btn--outline btn--sm" target="_blank" rel="noopener" style="margin-left:8px">Track Shipment</a>` : ''}
          </div>` : ''}
        ${this.orderTimelineHtml(o)}
        <div class="order-detail-card__section">
          <h3>Products</h3>
          <div class="order-detail-card__products">
            ${o.items.map(i => this.orderProductRowHtml(i)).join('')}
          </div>
        </div>
        <div class="order-detail-card__section order-detail-card__totals">
          <div><span>Subtotal</span><span>${this.formatPrice(o.subtotal ?? o.total)}</span></div>
          ${o.discountAmount ? `<div class="order-detail-card__discount"><span>Promo (${this.escapeHtml(o.promoCode || 'Discount')})</span><span>−${this.formatPrice(o.discountAmount)}</span></div>` : ''}
          <div><span>Shipping</span><span style="color:var(--color-accent)">FREE</span></div>
          <div class="order-detail-card__total"><span>Total</span><span>${this.formatPrice(o.total)}</span></div>
        </div>
        ${opts.showCustomer ? `
          <div class="order-detail-card__section">
            <h3>Delivery</h3>
            <p>${this.escapeHtml(o.customer.name)}<br>
            ${this.escapeHtml(o.customer.phone)}<br>
            ${this.escapeHtml(o.customer.address || '')}${o.customer.city ? ', ' + this.escapeHtml(o.customer.city) : ''} ${this.escapeHtml(o.customer.pincode || '')}</p>
          </div>` : ''}
        ${o.status === 'delivered' ? `
          <div class="order-detail-card__actions">
            ${o.items.map(i => `<a href="product.html?id=${i.id}" class="btn btn--outline btn--sm">Rate ${this.escapeHtml(i.name.substring(0, 24))}…</a>`).join('')}
          </div>` : ''}
      </div>`;
  },

  renderOrderDetail() {
    const el = document.getElementById('order-detail-content');
    if (!el) return;
    const orderId = new URLSearchParams(location.search).get('id');
    if (!orderId) {
      el.innerHTML = '<div class="empty-state"><h3>No order specified</h3><a href="track.html" class="btn btn--primary">Track an Order</a></div>';
      return;
    }
    const order = this.getOrderById(orderId);
    if (!order) {
      el.innerHTML = `<div class="empty-state"><h3>Order not found</h3><p>Check your Order ID and try again.</p><a href="track.html" class="btn btn--primary">Track Order</a></div>`;
      return;
    }
    const canView = this.isLoggedIn() && order.userId === this.session.userId;
    const phoneMatch = () => {
      const stored = sessionStorage.getItem('flexhealth_track_verified');
      return stored === orderId;
    };
    if (!canView && !phoneMatch()) {
      el.innerHTML = `
        <div class="track-verify">
          <h2>Verify to view order</h2>
          <p>Enter the phone number used for order <strong>${orderId}</strong></p>
          <form id="order-verify-form" class="auth-form">
            <div class="form-group">
              <label>Mobile Number</label>
              <div class="phone-input">
                <span class="phone-input__prefix">+91</span>
                <input type="tel" name="phone" required placeholder="98765 43210">
              </div>
            </div>
            <button type="submit" class="btn btn--primary">View Order</button>
          </form>
          <p class="auth-switch"><a href="track.html">← Back to track</a></p>
        </div>`;
      document.getElementById('order-verify-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const phone = this.normalizePhone(Object.fromEntries(new FormData(e.target)).phone);
        const orderPhone = this.normalizePhone(order.customer.phone);
        if (phone === orderPhone) {
          sessionStorage.setItem('flexhealth_track_verified', orderId);
          this.renderOrderDetail();
        } else {
          this.toast('Phone number does not match this order');
        }
      });
      return;
    }
    el.innerHTML = this.orderDetailHtml(order, { showCustomer: canView || phoneMatch() }) +
      (order.status !== 'delivered' && order.status !== 'cancelled'
        ? `<p class="order-refresh-hint">Status updates when admin confirms — refresh this page to see changes.</p>` : '');
  },

  renderTrackPage() {
    const lookupEl = document.getElementById('track-lookup');
    const resultEl = document.getElementById('track-result');
    if (!lookupEl) return;

    const prefillId = new URLSearchParams(location.search).get('id') || '';

    lookupEl.innerHTML = `
      <div class="track-lookup-card">
        <h2>Find your order</h2>
        <p class="auth-sub">Enter Order ID and mobile number from checkout</p>
        <form id="track-form" class="auth-form">
          <div class="form-group">
            <label>Order ID</label>
            <input type="text" name="orderId" required placeholder="e.g. FH12345678" value="${this.escapeHtml(prefillId)}">
          </div>
          <div class="form-group">
            <label>Mobile Number</label>
            <div class="phone-input">
              <span class="phone-input__prefix">+91</span>
              <input type="tel" name="phone" required placeholder="98765 43210">
            </div>
          </div>
          <button type="submit" class="btn btn--primary btn--lg" style="width:100%">Track Order</button>
        </form>
        ${this.isLoggedIn() ? `<p class="auth-switch"><a href="account.html#orders">View all my orders →</a></p>` : ''}
      </div>`;

    const showOrder = async (orderId, phone) => {
      if (!resultEl) return;
      let order;
      if (this.apiEnabled && phone) {
        try {
          const data = await fetch(
            `/api/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`,
            { credentials: 'include' }
          ).then(r => r.json());
          order = data.ok ? this.normalizeOrder(data.order) : null;
        } catch {
          order = null;
        }
      } else {
        order = this.normalizeOrder(this.getOrderById(orderId));
      }
      if (!order) {
        resultEl.innerHTML = `<div class="empty-state"><h3>Order not found</h3><p>Please check your Order ID.</p></div>`;
        return;
      }
      resultEl.innerHTML = `
        <a href="order.html?id=${order.id}" class="btn btn--outline btn--sm" style="margin-bottom:16px">Open full details →</a>
        ${this.orderDetailHtml(order)}`;
    };

    document.getElementById('track-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      const orderId = data.orderId.trim();
      const phone = this.normalizePhone(data.phone);

      if (this.apiEnabled) {
        try {
          const res = await fetch(
            `/api/orders/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`,
            { credentials: 'include' }
          ).then(r => r.json());
          if (!res.ok) {
            this.toast(res.msg || 'Order not found');
            return;
          }
          sessionStorage.setItem('flexhealth_track_verified', orderId);
          sessionStorage.setItem('flexhealth_track_phone', phone);
          await showOrder(orderId, phone);
          resultEl?.scrollIntoView({ behavior: 'smooth' });
          return;
        } catch {
          this.toast('Could not track order');
          return;
        }
      }

      const order = this.getOrderById(orderId);
      if (!order) {
        this.toast('Order not found');
        return;
      }
      if (phone !== this.normalizePhone(order.customer.phone)) {
        this.toast('Phone number does not match this order');
        return;
      }
      sessionStorage.setItem('flexhealth_track_verified', order.id);
      await showOrder(order.id);
      resultEl?.scrollIntoView({ behavior: 'smooth' });
    });
  },

  isAdminLoggedIn() {
    return sessionStorage.getItem('flexhealth_admin') === '1';
  },

  adminLogin(pin) {
    if (!AUTH_TEST_MODE) return false;
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('flexhealth_admin', '1');
      return true;
    }
    return false;
  },

  adminLogout() {
    sessionStorage.removeItem('flexhealth_admin');
    location.reload();
  },

  renderAdminPage() {
    const el = document.getElementById('admin-content');
    if (!el) return;

    if (!this.isAdminLoggedIn()) {
      el.innerHTML = `
        <section class="section auth-section">
          <div class="container" style="max-width:420px">
            <div class="auth-card">
              <h1>Admin Login</h1>
              <p class="auth-sub">Enter admin PIN to manage orders</p>
              ${AUTH_TEST_MODE ? `<div class="otp-hint__box" style="margin-bottom:16px">🧪 Test PIN: <strong>${ADMIN_PIN}</strong></div>` : ''}
              <form id="admin-login-form" class="auth-form">
                <div class="form-group">
                  <label>Admin PIN</label>
                  <input type="password" name="pin" required placeholder="Enter PIN" autocomplete="off">
                </div>
                <button type="submit" class="btn btn--primary btn--lg" style="width:100%">Login</button>
              </form>
            </div>
          </div>
        </section>`;
      document.getElementById('admin-login-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const pin = e.target.elements.pin.value;
        if (this.adminLogin(pin)) {
          this.renderAdminPage();
        } else {
          this.toast('Invalid PIN');
        }
      });
      return;
    }

    const orders = this.getAllOrders().map(o => this.normalizeOrder(o));
    const pending = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

    el.innerHTML = `
      <div class="page-hero page-hero--compact">
        <div class="container admin-hero">
          <div>
            <h1>Order Management</h1>
            <p>${pending.length} active · ${orders.length} total orders</p>
          </div>
          <button type="button" class="btn btn--outline btn--sm" onclick="FlexHealth.adminLogout()">Logout</button>
        </div>
      </div>
      <section class="section">
        <div class="container">
          ${orders.length ? orders.map(o => this.adminOrderCardHtml(o)).join('') : `
            <div class="empty-state"><h3>No orders yet</h3><p>Orders will appear here when customers checkout.</p></div>`}
        </div>
      </section>`;

    el.querySelectorAll('[data-admin-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const { orderId, action } = btn.dataset;
        if (action === 'advance') {
          const res = this.advanceOrderStatus(orderId);
          this.toast(res.ok ? `Order → ${this.orderStatusLabel(res.order.status)}` : res.msg);
        } else if (action === 'cancel') {
          if (confirm('Cancel this order?')) {
            this.updateOrderStatus(orderId, 'cancelled');
            this.toast('Order cancelled');
          } else return;
        } else if (action === 'set') {
          this.updateOrderStatus(orderId, btn.dataset.status);
          this.toast(`Status → ${this.orderStatusLabel(btn.dataset.status)}`);
        }
        if (btn.dataset.reload !== 'false') this.renderAdminPage();
      });
    });
  },

  adminOrderCardHtml(order) {
    const o = this.normalizeOrder(order);
    const curIdx = this.getOrderStatusIndex(o.status);
    const nextStep = ORDER_PIPELINE[curIdx + 1];
    const isDone = o.status === 'delivered' || o.status === 'cancelled';

    return `
      <div class="admin-order-card">
        <div class="admin-order-card__head">
          <div>
            <strong>${o.id}</strong>
            <span class="order-card__date">${this.formatDateTime(o.date)} · ${this.escapeHtml(o.customer.name)} · ${this.escapeHtml(o.customer.phone)}</span>
          </div>
          <span class="order-status order-status--${o.status}">${this.orderStatusLabel(o.status)}</span>
        </div>
        <ul class="order-card__items">
          ${o.items.map(i => `<li><span>${this.escapeHtml(i.name.substring(0, 50))}… × ${i.qty}</span><span>${this.formatPrice(i.price * i.qty)}</span></li>`).join('')}
        </ul>
        <div class="order-tracker order-tracker--compact admin-order-card__tracker">
          ${this.orderTimelineHtml(o, true)}
        </div>
        <div class="admin-order-card__actions">
          ${!isDone && nextStep ? `
            <button type="button" class="btn btn--primary btn--sm" data-admin-action="advance" data-order-id="${o.id}">
              → Mark as ${nextStep.label}
            </button>` : ''}
          ${!isDone ? ORDER_PIPELINE.map(s => `
            <button type="button" class="btn btn--outline btn--sm${o.status === s.id ? ' active' : ''}"
              data-admin-action="set" data-order-id="${o.id}" data-status="${s.id}">${s.label}</button>`).join('') : ''}
          ${o.status !== 'cancelled' && o.status !== 'delivered' ? `
            <button type="button" class="btn btn--outline btn--sm" style="color:var(--color-sale)"
              data-admin-action="cancel" data-order-id="${o.id}">Cancel</button>` : ''}
          <a href="order.html?id=${o.id}" class="btn btn--outline btn--sm" target="_blank">View</a>
        </div>
      </div>`;
  },

  renderAccountDashboard(el, user) {
    const orders = this.getUserOrders();
    const products = [];
    const seen = new Set();
    for (const o of orders) {
      for (const item of o.items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          const catalog = this.getCatalogProduct(item.id);
          if (catalog) products.push(catalog);
        }
      }
    }

    el.innerHTML = `
      <div class="account-panel">
        ${this.accountPanelHead('Dashboard', 'Products from your order history', products.length || '')}
        ${products.length
          ? `<div class="product-grid account-product-grid">${products.map(p => this.productCard(p)).join('')}</div>`
          : this.accountEmptyHtml('No products to display', 'Products from your orders will appear here once you complete a purchase.', 'Browse Products', 'shop.html')}
      </div>`;
  },

  renderAccountOrders(el) {
    const orders = this.getUserOrders();
    el.innerHTML = `
      <div class="account-panel">
        ${this.accountPanelHead('Orders', orders.length ? `${orders.length} order${orders.length !== 1 ? 's' : ''} on record. Expand an order for full details.` : 'Order history and tracking')}
        ${orders.length ? `
          <div class="user-order-list" id="account-order-list">
            ${orders.map(o => this.userOrderCardHtml(o, false)).join('')}
          </div>` : this.accountEmptyHtml('No orders placed', 'You have not placed any orders yet.', 'Continue Shopping', 'shop.html')}
      </div>`;
    this.bindUserOrderCards(el.querySelector('#account-order-list'));
  },

  renderAccountWishlist(el) {
    const ids = this.getWishlist();
    const products = ids.map(id => this.data.products.find(p => p.id === id)).filter(Boolean);
    el.innerHTML = `
      <div class="account-panel">
        ${this.accountPanelHead('Wishlist', products.length ? 'Saved products for future purchase.' : 'Save items while browsing the store.', products.length || '')}
        ${products.length
          ? `<div class="product-grid account-product-grid">${products.map(p => this.productCard(p)).join('')}</div>`
          : this.accountEmptyHtml('Wishlist is empty', 'Use the save option on product pages to add items here.', 'Browse Products', 'shop.html')}
      </div>`;
  },

  renderAccountReviews(el) {
    const reviews = this.getUserReviews();
    el.innerHTML = `
      <div class="account-panel">
        ${this.accountPanelHead('Reviews', reviews.length ? 'Your submitted product reviews.' : 'Reviews can be submitted after order delivery.')}
        ${reviews.length ? `
          <div class="account-reviews-list">
            ${reviews.map(r => {
              const product = this.data.products.find(p => p.id === r.productId);
              const img = this.getProductImage(product || r.productId);
              return `
                <article class="account-review">
                  <a href="product.html?id=${encodeURIComponent(r.productId)}" class="account-review__img">
                    <img src="${this.escapeHtml(img)}" alt="" loading="lazy">
                  </a>
                  <div class="account-review__body">
                    <div class="account-review__head">
                      <a href="product.html?id=${encodeURIComponent(r.productId)}">${this.escapeHtml(product?.name || r.productId)}</a>
                      <span class="stars">${this.stars(r.rating)}</span>
                    </div>
                    <p>${this.escapeHtml(r.text)}</p>
                    <time class="account-review__date">${this.formatDate(r.date)}</time>
                  </div>
                </article>`;
            }).join('')}
          </div>` : this.accountEmptyHtml('No reviews submitted', 'Product reviews are available after your order has been delivered.', 'View Orders', 'account.html#orders')}
      </div>`;
  },

  renderAccountProfile(el, user) {
    el.innerHTML = `
      <div class="account-panel">
        ${this.accountPanelHead('Account Settings', 'Manage your personal information and default delivery address.')}
        <form id="profile-form" class="account-profile-form auth-form">
          <fieldset class="account-profile-section">
            <legend>Personal Information</legend>
            <div class="form-group">
              <label for="profile-name">Full Name</label>
              <input id="profile-name" type="text" name="name" required value="${this.escapeHtml(user.name)}">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" value="${this.escapeHtml(user.email)}" disabled>
                <small class="form-hint">Contact support to change email</small>
              </div>
              <div class="form-group">
                <label>Mobile Number</label>
                <input type="tel" value="${this.escapeHtml(this.formatPhoneDisplay(user.phone))}" disabled>
                <small class="form-hint">Used for OTP sign-in</small>
              </div>
            </div>
          </fieldset>
          <fieldset class="account-profile-section">
            <legend>Default Delivery Address</legend>
            <div class="form-group">
              <label for="profile-address">Street Address</label>
              <textarea id="profile-address" name="address" rows="3" placeholder="House / flat, street, locality">${this.escapeHtml(user.address || '')}</textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="profile-city">City</label>
                <input id="profile-city" type="text" name="city" value="${this.escapeHtml(user.city || '')}">
              </div>
              <div class="form-group">
                <label for="profile-pincode">PIN Code</label>
                <input id="profile-pincode" type="text" name="pincode" pattern="[0-9]{6}" maxlength="6" value="${this.escapeHtml(user.pincode || '')}">
              </div>
            </div>
          </fieldset>
          <button type="submit" class="btn btn--primary">Save Changes</button>
        </form>
      </div>`;
    document.getElementById('profile-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      this.updateProfile(data);
      this.toast('Profile updated successfully');
      this.renderAccountUserCard({ ...user, ...data });
      const welcome = document.getElementById('account-welcome');
      if (welcome) welcome.textContent = `Signed in as ${data.name}.`;
    });
  },

  renderProductReviews(productId) {
    const summaryEl = document.getElementById('product-reviews-summary');
    const listEl = document.getElementById('product-reviews-list');
    const formEl = document.getElementById('product-review-form');
    if (!listEl) return;

    const stats = this.getProductRatingStats(productId);
    if (summaryEl) {
      summaryEl.textContent = stats.count
        ? `${stats.rating} out of 5 · ${stats.count} review${stats.count !== 1 ? 's' : ''}`
        : 'Be the first to review this product';
    }

    const reviews = this.getProductUserReviews(productId);
    listEl.innerHTML = reviews.length
      ? reviews.map(r => `
          <div class="review-card">
            <div class="review-card__stars">${this.stars(r.rating)}</div>
            <p class="review-card__text">"${this.escapeHtml(r.text)}"</p>
            <div class="review-card__author">${this.escapeHtml(r.userName)} · ${this.formatDate(r.date)}</div>
          </div>`).join('')
      : '<p class="reviews-empty">No customer reviews yet. Share your experience after ordering.</p>';

    if (!formEl) return;
    if (!this.isLoggedIn()) {
      formEl.innerHTML = `
        <div class="review-form-prompt">
          <p><a href="login.html?redirect=${encodeURIComponent('product.html?id=' + productId)}">Sign in</a> to write a review after placing an order.</p>
        </div>`;
      return;
    }
    if (this.hasUserReviewed(productId)) {
      formEl.innerHTML = `<div class="review-form-prompt"><p>✓ Thanks — you've already reviewed this product.</p></div>`;
      return;
    }
    if (!this.canReviewProduct(productId)) {
      formEl.innerHTML = `
        <div class="review-form-prompt">
          <p>Reviews unlock after your order is <strong>delivered</strong>. <a href="account.html#orders">Check order status</a></p>
        </div>`;
      return;
    }
    formEl.innerHTML = `
      <div class="review-form">
        <h3>Write a Review</h3>
        <form id="product-review-form-el">
          <div class="form-group">
            <label>Your Rating</label>
            <div class="star-picker" id="star-picker">
              ${[1, 2, 3, 4, 5].map(n => `<button type="button" class="star-picker__star" data-rating="${n}" aria-label="${n} stars">★</button>`).join('')}
            </div>
            <input type="hidden" name="rating" id="review-rating" required>
          </div>
          <div class="form-group">
            <label>Your Review</label>
            <textarea name="text" required placeholder="Share your experience with this product…" minlength="10"></textarea>
          </div>
          <button type="submit" class="btn btn--primary">Submit Review</button>
        </form>
      </div>`;

    let selectedRating = 0;
    const stars = formEl.querySelectorAll('.star-picker__star');
    const ratingInput = document.getElementById('review-rating');
    const paintStars = () => {
      stars.forEach(s => s.classList.toggle('active', +s.dataset.rating <= selectedRating));
    };
    stars.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRating = +btn.dataset.rating;
        if (ratingInput) ratingInput.value = selectedRating;
        paintStars();
      });
    });
    document.getElementById('product-review-form-el')?.addEventListener('submit', e => {
      e.preventDefault();
      if (!selectedRating) {
        this.toast('Please select a star rating');
        return;
      }
      const text = e.target.elements.text.value;
      const res = this.submitReview(productId, selectedRating, text);
      if (res.ok) {
        this.toast('Review submitted — thank you!');
        this.renderProductReviews(productId);
        const ratingEl = document.getElementById('product-detail-rating');
        const newStats = this.getProductRatingStats(productId);
        if (ratingEl) {
          ratingEl.innerHTML = `
            <span class="stars">${this.stars(newStats.rating)}</span>
            <span>${newStats.rating} (${newStats.count} reviews)</span>`;
        }
      } else {
        this.toast(res.msg);
      }
    });
  }
};

FlexHealth.CONFIG = { AUTH_TEST_MODE, AUTH_TEST_OTP, ADMIN_PIN };
Object.defineProperty(FlexHealth.CONFIG, 'FIREBASE_ENABLED', {
  get() {
    return typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isEnabled();
  }
});

document.addEventListener('DOMContentLoaded', () => FlexHealth.init());
