/**
 * Flex Health — Admin Panel UI
 * Works with backend (api.js) or localStorage fallback.
 */
const AdminPanel = {
  tab: 'dashboard',
  orderFilter: 'all',
  orderSearch: '',
  productSearch: '',
  productStockFilter: 'all',
  expandedOrder: null,
  sidebarOpen: false,

  async render() {
    const root = document.getElementById('admin-root');
    if (!root) return;

    if (FlexHealth.apiEnabled) await FlexHealth.refreshAdminSession();

    if (!FlexHealth.isAdminLoggedIn()) {
      root.innerHTML = this.loginHtml();
      this.bindLogin(root);
      return;
    }

    root.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div><p>Loading data…</p></div>';

    try {
      const data = await this.fetchData();
      root.innerHTML = this.layoutHtml(data);
      this.bindLayout(root, data);
    } catch (e) {
      root.innerHTML = `
        <div class="admin-login-page">
          <div class="admin-login-card">
            <h1>Could not load dashboard</h1>
            <p>${FlexHealth.escapeHtml(e.message || 'Unknown error')}</p>
            <button type="button" class="btn btn--primary" onclick="AdminPanel.render()">Retry</button>
          </div>
        </div>`;
    }
  },

  async fetchData() {
    let stats = { totalOrders: 0, activeOrders: 0, users: 0, revenue: 0 };
    let orders = [];
    let users = [];
    let messages = [];
    let products = [];
    let categories = [];
    let brands = [];
    let banners = [];
    let offerBanners = [];
    let promoSlides = [];
    let promoCodes = [];
    let homepageReviews = [];
    let siteSettings = null;
    let verificationCodes = [];
    let paymentStats = null;
    let payments = [];

    if (FlexHealth.apiEnabled) {
      const [s, o, u, m, cms, pay, vc] = await Promise.all([
        this.apiGet('/admin/stats'),
        this.apiGet('/admin/orders'),
        this.apiGet('/admin/users'),
        this.apiGet('/admin/messages'),
        this.apiGet('/admin/cms'),
        this.apiGet('/admin/payments').catch(() => ({ payments: [], stats: {} })),
        this.apiGet('/admin/verification-codes').catch(() => ({ codes: [] }))
      ]);
      stats = s.stats || stats;
      orders = (o.orders || []).map(x => FlexHealth.normalizeOrder(x));
      users = u.users || [];
      messages = m.messages || [];
      const catalog = cms.catalog || {};
      products = catalog.products || [];
      categories = catalog.categories || [];
      brands = catalog.brands || [];
      banners = catalog.banners || [];
      offerBanners = catalog.offerBanners || [];
      promoSlides = catalog.promoSlides || [];
      promoCodes = catalog.promoCodes || [];
      homepageReviews = catalog.reviews || [];
      siteSettings = catalog.siteSettings || null;
      payments = pay.payments || [];
      paymentStats = pay.stats || null;
      verificationCodes = vc.codes || [];
    } else {
      orders = FlexHealth.getAllOrders().map(o => FlexHealth.normalizeOrder(o));
      stats.totalOrders = orders.length;
      stats.activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
      stats.revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
      products = FlexHealth.data?.products || [];
      categories = FlexHealth.data?.categories || [];
      brands = FlexHealth.data?.brands || [];
      banners = FlexHealth.data?.banners || [];
      offerBanners = FlexHealth.data?.offerBanners || [];
      promoSlides = FlexHealth.data?.promoSlides || [];
      promoCodes = FlexHealth.data?.promoCodes || [];
      homepageReviews = FlexHealth.data?.reviews || [];
      siteSettings = FlexHealth.data?.siteSettings || null;
    }

    return {
      stats, orders, users, messages, products, categories, brands,
      banners, offerBanners, promoSlides, promoCodes, homepageReviews, siteSettings,
      payments, paymentStats, verificationCodes
    };
  },

  async apiGet(path) {
    const res = await fetch('/api' + path, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok || data.ok === false) throw new Error(data.msg || 'Request failed');
    return data;
  },

  loginHtml() {
    const testMode = FlexHealth.CONFIG?.AUTH_TEST_MODE === true;
    return `
      <div class="admin-login-page">
        <div class="admin-login-brand">
          <span class="admin-login-brand__logo">FH</span>
          <h1>Flex Health</h1>
          <p>Admin Control Panel</p>
        </div>
        <div class="admin-login-card">
          <h2>Sign in</h2>
          <p class="admin-login-card__sub">Manage orders, customers, products & messages</p>
          <form id="admin-login-form" class="auth-form">
            <div class="form-group">
              <label>Username</label>
              <input type="text" name="username" autocomplete="username" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" name="password" autocomplete="current-password" required>
            </div>
            <button type="submit" class="btn btn--primary btn--lg admin-login-btn">Sign in</button>
          </form>
          ${testMode ? `
          <div class="admin-login-divider"><span>or quick PIN (dev only)</span></div>
          <form id="admin-pin-form" class="auth-form">
            <div class="form-group">
              <input type="password" name="pin" placeholder="Enter admin PIN" autocomplete="off">
            </div>
            <button type="submit" class="btn btn--outline admin-login-btn">Login with PIN</button>
          </form>` : ''}
          <a href="index.html" class="admin-back-link">← Back to store</a>
        </div>
      </div>`;
  },

  bindLogin(root) {
    root.querySelector('#admin-login-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const ok = await FlexHealth.adminLogin({ username: d.username, password: d.password });
      if (ok) this.render();
      else FlexHealth.toast('Invalid credentials');
    });
    root.querySelector('#admin-pin-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const pin = e.target.elements.pin.value;
      const ok = await FlexHealth.adminLogin({ pin });
      if (ok) this.render();
      else FlexHealth.toast('Invalid PIN');
    });
  },

  getNavTabs(data) {
    const { orders, products, users, messages, categories, brands, banners, offerBanners, promoSlides, promoCodes, homepageReviews, verificationCodes } = data;
    return [
      { section: 'Overview' },
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'orders', label: 'Orders', icon: '📦', count: orders.length },
      { id: 'payments', label: 'Payments', icon: '💳' },
      { section: 'Store Catalog' },
      { id: 'products', label: 'Products', icon: '🏷', count: products.length },
      { id: 'categories', label: 'Categories', icon: '📁', count: categories.length },
      { id: 'brands', label: 'Brands', icon: '🏢', count: brands.length },
      { id: 'featured', label: 'Featured Sections', icon: '⭐' },
      { section: 'Homepage' },
      { id: 'hero-banners', label: 'Hero Banners', icon: '🖼', count: banners.length },
      { id: 'offer-banners', label: 'Offer Banners', icon: '🏷️', count: offerBanners.length },
      { id: 'promo-slides', label: 'Promo Slider', icon: '🎠', count: promoSlides.length },
      { id: 'promo-codes', label: 'Promo Codes', icon: '🎟', count: promoCodes.length },
      { id: 'testimonials', label: 'Testimonials', icon: '💬', count: homepageReviews.length },
      { id: 'site-settings', label: 'Stats & Trust Bar', icon: '📈' },
      { section: 'Customers' },
      { id: 'customers', label: 'Customers', icon: '👥', count: users.length },
      { id: 'messages', label: 'Messages', icon: '✉', count: messages.length },
      { id: 'verification-codes', label: 'Verify Codes', icon: '🔐', count: verificationCodes.length },
      { section: 'System' },
      { id: 'settings', label: 'Backend Settings', icon: '⚙' }
    ];
  },

  layoutHtml(data) {
    const { stats, orders, users, messages, products } = data;
    const live = FlexHealth.apiEnabled;
    const tabs = this.getNavTabs(data);

    return `
      <div class="admin-shell${this.sidebarOpen ? ' admin-shell--sidebar-open' : ''}">
        <aside class="admin-sidebar">
          <div class="admin-sidebar__brand">
            <span class="admin-sidebar__logo">FH</span>
            <div>
              <strong>Flex Health</strong>
              <small>Admin Panel</small>
            </div>
          </div>
          <nav class="admin-sidebar__nav">
            ${tabs.map(t => t.section ? `
              <div class="admin-sidebar__section">${t.section}</div>` : `
              <button type="button" class="admin-sidebar__link${this.tab === t.id ? ' active' : ''}" data-tab="${t.id}">
                <span class="admin-sidebar__icon">${t.icon}</span>
                <span>${t.label}</span>
                ${t.count != null ? `<span class="admin-sidebar__badge">${t.count}</span>` : ''}
              </button>`).join('')}
          </nav>
          <div class="admin-sidebar__foot">
            <a href="index.html" class="admin-sidebar__link admin-sidebar__link--ghost" target="_blank">
              <span class="admin-sidebar__icon">🛒</span><span>View Store</span>
            </a>
            <button type="button" class="admin-sidebar__link admin-sidebar__link--ghost" id="admin-logout-btn">
              <span class="admin-sidebar__icon">⎋</span><span>Logout</span>
            </button>
          </div>
        </aside>
        <div class="admin-sidebar-backdrop" data-admin-close-sidebar></div>

        <div class="admin-main">
          <header class="admin-topbar">
            <button type="button" class="admin-menu-toggle" aria-label="Menu" data-admin-toggle-sidebar>☰</button>
            <div class="admin-topbar__title">
              <h1>${this.tabTitle()}</h1>
              <p>${this.tabSubtitle(data)}</p>
            </div>
            <div class="admin-topbar__actions">
              <span class="admin-status-badge ${live ? 'admin-status-badge--live' : 'admin-status-badge--offline'}">
                ${live ? '● Live API' : '○ Offline mode'}
              </span>
              <button type="button" class="btn btn--outline btn--sm" onclick="AdminPanel.render()">Refresh</button>
            </div>
          </header>

          <main class="admin-content">
            ${this.panelHtml(data)}
          </main>
        </div>
      </div>`;
  },

  tabTitle() {
    const titles = {
      dashboard: 'Dashboard',
      orders: 'Orders',
      payments: 'Payments',
      products: 'Products',
      categories: 'Categories',
      brands: 'Brands',
      featured: 'Featured Sections',
      'hero-banners': 'Hero Banners',
      'offer-banners': 'Offer Banners',
      'promo-slides': 'Promo Slider',
      'promo-codes': 'Promo Codes',
      testimonials: 'Testimonials',
      'site-settings': 'Stats & Trust Bar',
      customers: 'Customers',
      messages: 'Messages',
      'verification-codes': 'Verification Codes',
      settings: 'Backend Settings'
    };
    return titles[this.tab] || 'Admin';
  },

  tabSubtitle(data) {
    if (this.tab === 'dashboard') return `${data.stats.activeOrders} active orders · ${data.stats.totalOrders} total`;
    if (this.tab === 'orders') return `${this.filteredOrders(data.orders).length} shown`;
    if (this.tab === 'payments') return 'Transactions & refunds';
    if (this.tab === 'products') return `${data.products.length} products — add, edit or delete`;
    if (this.tab === 'categories') return `${data.categories.length} shop categories`;
    if (this.tab === 'brands') return `${data.brands.length} brands on homepage`;
    if (this.tab === 'featured') return 'Control Popular, Sale & New Arrivals sections';
    if (this.tab === 'hero-banners') return `${data.banners.length} homepage hero slides`;
    if (this.tab === 'offer-banners') return `${data.offerBanners.length} featured offer cards`;
    if (this.tab === 'promo-slides') return `${data.promoSlides.length} promo slider items`;
    if (this.tab === 'promo-codes') return `${data.promoCodes.length} checkout discount codes`;
    if (this.tab === 'testimonials') return `${data.homepageReviews.length} customer reviews on homepage`;
    if (this.tab === 'site-settings') return 'Stats bar & trust badges on homepage';
    if (this.tab === 'customers') return `${data.users.length} registered users`;
    if (this.tab === 'messages') return `${data.messages.length} contact submissions`;
    if (this.tab === 'verification-codes') return `${data.verificationCodes.length} codes customers can verify on the store`;
    if (this.tab === 'settings') return 'Backend & server configuration';
    return '';
  },

  panelHtml(data) {
    if (typeof AdminCMS !== 'undefined' && AdminCMS.panels[this.tab]) {
      return AdminCMS.panels[this.tab](data);
    }
    switch (this.tab) {
      case 'dashboard': return this.dashboardPanel(data);
      case 'orders': return this.ordersPanel(data);
      case 'payments': return this.paymentsPanel(data);
      case 'customers': return this.customersPanel(data);
      case 'messages': return this.messagesPanel(data);
      case 'verification-codes': return this.verificationCodesPanel(data);
      case 'settings': return this.settingsPanel(data);
      default: return '';
    }
  },

  dashboardPanel({ stats, orders, products }) {
    const outOfStock = (products || []).filter(p => p.inStock === false).length;
    const recent = orders.slice(0, 6);
    return `
      <div class="admin-stats-grid">
        ${this.statCard('Total Orders', stats.totalOrders, '📦', 'All time orders')}
        ${this.statCard('Active Orders', stats.activeOrders, '🚚', 'In progress')}
        ${this.statCard('Customers', stats.users || 0, '👥', 'Registered users')}
        ${this.statCard('Revenue', FlexHealth.formatPrice(stats.revenue || 0), '💰', 'Excl. cancelled')}
        ${this.statCard('Out of Stock', outOfStock, '⛔', 'Products unavailable', outOfStock ? 'admin-stat-card--warn' : '')}
      </div>

      <div class="admin-grid-2">
        <section class="admin-panel">
          <div class="admin-panel__head">
            <h2>Recent Orders</h2>
            <button type="button" class="btn btn--outline btn--sm" data-tab="orders">View all</button>
          </div>
          ${recent.length ? `
            <div class="admin-table-wrap">
              <table class="admin-table admin-table--compact">
                <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  ${recent.map(o => `
                    <tr data-order-row="${o.id}">
                      <td><strong>${o.id}</strong><br><small>${FlexHealth.formatDateTime(o.date)}</small></td>
                      <td>${FlexHealth.escapeHtml(o.customer.name)}<br><small>${FlexHealth.escapeHtml(o.customer.phone)}</small></td>
                      <td>${FlexHealth.formatPrice(o.total)}</td>
                      <td>${this.statusBadge(o.status)}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>` : '<div class="admin-empty">No orders yet. Place a test order from the store.</div>'}
        </section>

        <section class="admin-panel">
          <div class="admin-panel__head"><h2>Quick Actions</h2></div>
          <div class="admin-quick-actions">
            <button type="button" class="admin-quick-action" data-tab="orders">
              <span>📦</span><strong>Manage Orders</strong><small>Update delivery status</small>
            </button>
            <button type="button" class="admin-quick-action" data-tab="products">
              <span>🏷</span><strong>View Catalog</strong><small>${orders.length ? '' : ''}Browse products</small>
            </button>
            <button type="button" class="admin-quick-action" data-tab="customers">
              <span>👥</span><strong>Customers</strong><small>Registered accounts</small>
            </button>
            <a href="index.html" class="admin-quick-action" target="_blank">
              <span>🛒</span><strong>Open Storefront</strong><small>Preview live site</small>
            </a>
          </div>
          <div class="admin-pipeline-hint">
            <strong>Order pipeline</strong>
            <div class="admin-pipeline-steps">
              <span>Placed</span><span>→</span><span>Confirmed</span><span>→</span>
              <span>Packed</span><span>→</span><span>Out for delivery</span><span>→</span><span>Delivered</span>
            </div>
          </div>
        </section>
      </div>`;
  },

  statCard(label, value, icon, hint, extraClass = '') {
    return `
      <div class="admin-stat-card${extraClass ? ' ' + extraClass : ''}">
        <div class="admin-stat-card__icon">${icon}</div>
        <div class="admin-stat-card__body">
          <span class="admin-stat-card__label">${label}</span>
          <strong class="admin-stat-card__value">${value}</strong>
          <small>${hint}</small>
        </div>
      </div>`;
  },

  filteredOrders(orders) {
    let list = [...orders];
    const q = this.orderSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        String(o.customer.phone).includes(q)
      );
    }
    if (this.orderFilter === 'active') {
      list = list.filter(o => !['delivered', 'cancelled'].includes(o.status));
    } else if (this.orderFilter === 'delivered') {
      list = list.filter(o => o.status === 'delivered');
    } else if (this.orderFilter === 'cancelled') {
      list = list.filter(o => o.status === 'cancelled');
    }
    return list;
  },

  ordersPanel({ orders }) {
    const filtered = this.filteredOrders(orders);
    return `
      <div class="admin-toolbar">
        <div class="admin-search">
          <input type="search" id="admin-order-search" placeholder="Search order ID, name, phone…" value="${FlexHealth.escapeHtml(this.orderSearch)}">
        </div>
        <div class="admin-filters">
          ${['all', 'active', 'delivered', 'cancelled'].map(f => `
            <button type="button" class="admin-filter${this.orderFilter === f ? ' active' : ''}" data-order-filter="${f}">
              ${f.charAt(0).toUpperCase() + f.slice(1)}
            </button>`).join('')}
        </div>
      </div>

      ${filtered.length ? filtered.map(o => this.orderCardHtml(o)).join('') : `
        <div class="admin-empty">
          <h3>No orders match</h3>
          <p>Try a different filter or place a test order from the store.</p>
        </div>`}`;
  },

  orderCardHtml(order) {
    const o = FlexHealth.normalizeOrder(order);
    const curIdx = FlexHealth.getOrderStatusIndex(o.status);
    const pipeline = [
      { id: 'placed', label: 'Placed' },
      { id: 'confirmed', label: 'Confirmed' },
      { id: 'packed', label: 'Packed' },
      { id: 'out_for_delivery', label: 'Out for delivery' },
      { id: 'delivered', label: 'Delivered' }
    ];
    const nextStep = pipeline[curIdx + 1];
    const isDone = o.status === 'delivered' || o.status === 'cancelled';
    const expanded = this.expandedOrder === o.id;

    return `
      <article class="admin-order-card${expanded ? ' admin-order-card--expanded' : ''}">
        <div class="admin-order-card__summary" data-expand-order="${o.id}">
          <div class="admin-order-card__main">
            <strong class="admin-order-card__id">${o.id}</strong>
            <span class="admin-order-card__meta">${FlexHealth.formatDateTime(o.date)} · ${FlexHealth.escapeHtml(o.customer.name)} · ${FlexHealth.formatPhoneDisplay?.(o.customer.phone) || o.customer.phone}</span>
          </div>
          <div class="admin-order-card__right">
            <span class="admin-order-card__total">${FlexHealth.formatPrice(o.total)}</span>
            ${this.statusBadge(o.status)}
            <span class="admin-order-card__chevron">${expanded ? '▲' : '▼'}</span>
          </div>
        </div>
        <div class="admin-order-card__detail"${expanded ? '' : ' hidden'}>
          <ul class="admin-order-items">
            ${o.items.map(i => `
              <li>
                <span>${FlexHealth.escapeHtml(i.name.length > 60 ? i.name.slice(0, 60) + '…' : i.name)} × ${i.qty}</span>
                <span>${FlexHealth.formatPrice(i.price * i.qty)}</span>
              </li>`).join('')}
          </ul>
          <div class="admin-order-card__address">
            <strong>Delivery</strong>
            ${FlexHealth.escapeHtml(o.customer.address || '—')}, ${FlexHealth.escapeHtml(o.customer.city || '')} ${FlexHealth.escapeHtml(o.customer.pincode || '')}
            · ${o.payment === 'cod' ? 'Cash on Delivery' : FlexHealth.paymentMethodLabel?.(o.payment) || o.payment}
            ${o.paymentStatus ? ` · ${FlexHealth.paymentStatusLabel?.(o.paymentStatus) || o.paymentStatus}` : ''}
          </div>
          ${o.awb ? `
          <div class="admin-order-card__shipping">
            <strong>Shipment</strong> ${FlexHealth.escapeHtml(o.courierName || 'Courier')}
            · AWB <code>${FlexHealth.escapeHtml(o.awb)}</code>
            ${o.trackingUrl ? ` · <a href="${FlexHealth.escapeHtml(o.trackingUrl)}" target="_blank" rel="noopener">Track →</a>` : ''}
          </div>` : ''}
          <div class="order-tracker order-tracker--compact admin-order-card__tracker">
            ${FlexHealth.orderTimelineHtml(o, true)}
          </div>
          <div class="admin-order-card__actions">
            ${!isDone && nextStep ? `
              <button type="button" class="btn btn--primary btn--sm" data-admin-action="advance" data-order-id="${o.id}">
                → ${nextStep.label}
              </button>` : ''}
            ${!isDone ? pipeline.map(s => `
              <button type="button" class="btn btn--outline btn--sm${o.status === s.id ? ' active' : ''}"
                data-admin-action="set" data-order-id="${o.id}" data-status="${s.id}">${s.label}</button>`).join('') : ''}
            ${!isDone ? `
              <button type="button" class="btn btn--outline btn--sm admin-btn-danger"
                data-admin-action="cancel" data-order-id="${o.id}">Cancel</button>` : ''}
            ${!o.awb && !isDone && FlexHealth.apiEnabled ? `
              <button type="button" class="btn btn--outline btn--sm" data-ship-order="${FlexHealth.escapeHtml(o.id)}">Create Delhivery Shipment</button>` : ''}
            <a href="order.html?id=${encodeURIComponent(o.id)}" class="btn btn--outline btn--sm" target="_blank">Customer view</a>
          </div>
        </div>
      </article>`;
  },

  paymentsPanel({ payments, paymentStats }) {
    const ps = paymentStats || { paid: 0, pending: 0, failed: 0, revenue: 0 };
    return `
      <div class="admin-stats-grid admin-stats-grid--compact">
        ${this.statCard('Paid', ps.paid || 0, '✅', 'Successful payments')}
        ${this.statCard('Pending', ps.pending || 0, '⏳', 'Awaiting payment')}
        ${this.statCard('Failed', ps.failed || 0, '✕', 'Failed attempts')}
        ${this.statCard('Online Revenue', FlexHealth.formatPrice(ps.revenue || 0), '💰', 'UPI + Card')}
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Payment ID</th><th>Order</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            ${payments.length ? payments.map(p => `
              <tr>
                <td><code>${FlexHealth.escapeHtml(p.id)}</code></td>
                <td><strong>${FlexHealth.escapeHtml(p.orderId)}</strong></td>
                <td>${FlexHealth.escapeHtml(p.customerName || '')}<br><small>${FlexHealth.escapeHtml(p.customerPhone || '')}</small></td>
                <td>${FlexHealth.paymentMethodLabel?.(p.method) || p.method}</td>
                <td><strong>${FlexHealth.formatPrice(p.amount)}</strong></td>
                <td><span class="payment-badge payment-badge--${p.status}">${FlexHealth.paymentStatusLabel?.(p.status) || p.status}</span></td>
                <td>${FlexHealth.formatDateTime(p.createdAt)}</td>
                <td>
                  ${p.status === 'paid' ? `<button type="button" class="btn btn--outline btn--sm admin-btn-danger" data-refund-payment="${FlexHealth.escapeHtml(p.id)}">Refund</button>` : ''}
                </td>
              </tr>`).join('') : `
              <tr><td colspan="8" class="admin-empty-cell">No payments yet — they appear when customers pay online</td></tr>`}
          </tbody>
        </table>
      </div>
      <div class="admin-note" style="margin-top:20px">Test payments: UPI OTP <code>123456</code> · Card <code>4111 1111 1111 1111</code></div>`;
  },

  customersPanel({ users }) {
    return `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Email</th><th>City</th><th>Joined</th></tr>
          </thead>
          <tbody>
            ${users.length ? users.map(u => `
              <tr>
                <td><strong>${FlexHealth.escapeHtml(u.name)}</strong></td>
                <td>${FlexHealth.formatPhoneDisplay?.(u.phone) || u.phone}</td>
                <td>${FlexHealth.escapeHtml(u.email || '—')}</td>
                <td>${FlexHealth.escapeHtml(u.city || '—')}</td>
                <td>${FlexHealth.formatDateTime(u.created_at)}</td>
              </tr>`).join('') : `
              <tr><td colspan="5" class="admin-empty-cell">No registered customers yet</td></tr>`}
          </tbody>
        </table>
      </div>`;
  },

  messagesPanel({ messages }) {
    return messages.length ? messages.map(m => `
      <article class="admin-message-card">
        <div class="admin-message-card__head">
          <div>
            <strong>${FlexHealth.escapeHtml(m.subject || 'General')}</strong>
            <span>${FlexHealth.escapeHtml(m.name)} &lt;${FlexHealth.escapeHtml(m.email)}&gt;</span>
          </div>
          <time>${FlexHealth.formatDateTime(m.created_at)}</time>
        </div>
        <p>${FlexHealth.escapeHtml(m.message)}</p>
      </article>`).join('') : `
      <div class="admin-empty">
        <h3>No messages yet</h3>
        <p>Contact form submissions from the store will appear here.</p>
      </div>`;
  },

  verificationCodesPanel({ verificationCodes }) {
    const live = FlexHealth.apiEnabled;
    return `
      ${!live ? '<p class="admin-note admin-note--warn">Backend required to manage verification codes.</p>' : ''}
      <section class="admin-panel" style="margin-bottom:24px">
        <div class="admin-panel__head"><h2>Add Code</h2></div>
        <form id="verify-code-add-form" class="auth-form admin-verify-add-form">
          <div class="form-group">
            <label>Verification code</label>
            <input name="code" required placeholder="e.g. 505503" autocomplete="off" ${live ? '' : 'disabled'}>
          </div>
          <button type="submit" class="btn btn--primary btn--sm" ${live ? '' : 'disabled'}>Add Code</button>
        </form>
        <p class="admin-note" style="margin-top:12px">Codes save instantly. Customers verify at <code>/verify.html</code> — must use <strong>http://localhost:3000</strong></p>
      </section>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Code</th><th></th></tr>
          </thead>
          <tbody>
            ${verificationCodes.length ? verificationCodes.map(c => `
              <tr>
                <td><strong>${FlexHealth.escapeHtml(c.code)}</strong></td>
                <td class="admin-row-actions">
                  <a href="verify.html?code=${encodeURIComponent(c.code)}" target="_blank" rel="noopener" class="btn btn--outline btn--sm">Test</a>
                  ${live ? `<button type="button" class="btn btn--outline btn--sm admin-btn-danger" data-delete-verify-code="${FlexHealth.escapeHtml(c.code)}">Delete</button>` : ''}
                </td>
              </tr>`).join('') : `
              <tr><td colspan="2" class="admin-empty-cell">No codes yet — add one above</td></tr>`}
          </tbody>
        </table>
      </div>`;
  },

  settingsPanel({ stats }) {
    const live = FlexHealth.apiEnabled;
    return `
      <div class="admin-grid-2">
        <section class="admin-panel">
          <div class="admin-panel__head"><h2>Backend Status</h2></div>
          <ul class="admin-settings-list">
            <li><span>API connection</span><strong class="${live ? 'text-success' : 'text-muted'}">${live ? 'Connected' : 'Offline (localStorage)'}</strong></li>
            <li><span>Health endpoint</span><code>/api/health</code></li>
            <li><span>Database</span><code>server/flexhealth.db</code></li>
            <li><span>Test mode</span><strong>${FlexHealth.CONFIG?.AUTH_TEST_MODE !== false ? 'On' : 'Off'}</strong></li>
            <li><span>Server port</span><strong>3000</strong></li>
          </ul>
        </section>
        <section class="admin-panel">
          <div class="admin-panel__head"><h2>Store Snapshot</h2></div>
          <ul class="admin-settings-list">
            <li><span>Total orders</span><strong>${stats.totalOrders}</strong></li>
            <li><span>Active orders</span><strong>${stats.activeOrders}</strong></li>
            <li><span>Customers</span><strong>${stats.users || 0}</strong></li>
            <li><span>Revenue</span><strong>${FlexHealth.formatPrice(stats.revenue || 0)}</strong></li>
          </ul>
        </section>
        <section class="admin-panel admin-panel--wide">
          <div class="admin-panel__head"><h2>Payments & Shipping</h2></div>
          <ul class="admin-settings-list" id="admin-integrations-list">
            <li><span>PhonePe (UPI / Cards)</span><strong class="text-muted">Checking…</strong></li>
            <li><span>Delhivery (courier & AWB)</span><strong class="text-muted">Checking…</strong></li>
          </ul>
          <p class="admin-settings-note">Configure keys in <code>server/.env</code> — see <code>server/INTEGRATIONS.md</code></p>
        </section>
        <section class="admin-panel admin-panel--wide">
          <div class="admin-panel__head"><h2>How to run backend</h2></div>
          <pre class="admin-code">cd D:\\FlexHealh.in\\server
npm start</pre>
          <p class="admin-settings-note">Admin panel: <a href="admin.html">http://localhost:3000/admin.html</a></p>
          <p class="admin-settings-note">Change admin password in <code>server/.env</code> → <code>ADMIN_PASSWORD</code></p>
        </section>
      </div>`;
  },

  statusBadge(status) {
    const label = FlexHealth.orderStatusLabel(status);
    return `<span class="order-status order-status--${status} admin-status-pill">${label}</span>`;
  },

  bindLayout(root, data) {
    root.querySelector('#admin-logout-btn')?.addEventListener('click', () => FlexHealth.adminLogout());

    root.querySelector('[data-admin-toggle-sidebar]')?.addEventListener('click', () => {
      this.sidebarOpen = !this.sidebarOpen;
      root.querySelector('.admin-shell')?.classList.toggle('admin-shell--sidebar-open', this.sidebarOpen);
    });
    root.querySelector('[data-admin-close-sidebar]')?.addEventListener('click', () => {
      this.sidebarOpen = false;
      root.querySelector('.admin-shell')?.classList.remove('admin-shell--sidebar-open');
    });

    root.querySelectorAll('[data-tab]').forEach(el => {
      el.addEventListener('click', () => {
        this.tab = el.dataset.tab;
        this.orderSearch = '';
        this.expandedOrder = null;
        this.render();
      });
    });

    root.querySelectorAll('[data-order-row]').forEach(row => {
      row.addEventListener('click', () => {
        this.tab = 'orders';
        this.expandedOrder = row.dataset.orderRow;
        this.render();
      });
    });

    root.querySelector('#admin-order-search')?.addEventListener('input', e => {
      this.orderSearch = e.target.value;
      const main = root.querySelector('.admin-content');
      if (main) main.innerHTML = this.ordersPanel(data);
      this.bindOrdersPanel(root, data);
    });

    this.bindOrdersPanel(root, data);
    if (typeof AdminCMS !== 'undefined') AdminCMS.bind(root, data);
    if (this.tab === 'settings') this.loadIntegrationsStatus(root);

    root.querySelector('#verify-code-add-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const input = e.target.elements.code;
      const code = input?.value?.trim();
      if (!code) return;
      try {
        const res = await fetch('/api/admin/verification-codes', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.msg || 'Failed');
        FlexHealth.toast('Code added');
        input.value = '';
        this.render();
      } catch (err) { FlexHealth.toast(err.message); }
    });

    root.querySelectorAll('[data-delete-verify-code]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this verification code?')) return;
        try {
          const res = await fetch('/api/admin/verification-codes/' + encodeURIComponent(btn.dataset.deleteVerifyCode), {
            method: 'DELETE',
            credentials: 'include'
          });
          const json = await res.json();
          if (!res.ok || !json.ok) throw new Error(json.msg || 'Failed');
          FlexHealth.toast('Deleted');
          this.render();
        } catch (err) { FlexHealth.toast(err.message); }
      });
    });

    root.querySelectorAll('[data-refund-payment]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Mark this payment as refunded?')) return;
        try {
          const res = await fetch('/api/admin/payments/' + encodeURIComponent(btn.dataset.refundPayment) + '/refund', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: '{}'
          });
          const data = await res.json();
          if (!res.ok || !data.ok) throw new Error(data.msg || 'Refund failed');
          FlexHealth.toast('Payment refunded');
          AdminPanel.render();
        } catch (e) {
          FlexHealth.toast(e.message || 'Refund failed');
        }
      });
    });
  },

  bindOrdersPanel(root, data) {
    root.querySelectorAll('[data-order-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.orderFilter = btn.dataset.orderFilter;
        this.render();
      });
    });
    root.querySelectorAll('[data-expand-order]').forEach(el => this.bindExpand(el));
    this.bindOrderActions(root);
  },

  bindExpand(el) {
    el.addEventListener('click', () => {
      const id = el.dataset.expandOrder;
      this.expandedOrder = this.expandedOrder === id ? null : id;
      this.render();
    });
  },

  bindOrderActions(root) {
    root.querySelectorAll('[data-admin-action]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const { orderId, action, status } = btn.dataset;
        if (action === 'advance') {
          const res = await FlexHealth.advanceOrderStatus(orderId);
          FlexHealth.toast(res.ok ? `→ ${FlexHealth.orderStatusLabel(res.order.status)}` : res.msg);
        } else if (action === 'cancel') {
          if (!confirm('Cancel this order?')) return;
          await FlexHealth.updateOrderStatus(orderId, 'cancelled');
          FlexHealth.toast('Order cancelled');
        } else if (action === 'set') {
          await FlexHealth.updateOrderStatus(orderId, status);
          FlexHealth.toast(`→ ${FlexHealth.orderStatusLabel(status)}`);
        }
        this.render();
      });
    });
    root.querySelectorAll('[data-ship-order]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        btn.disabled = true;
        try {
          const res = await fetch('/api/admin/orders/' + encodeURIComponent(btn.dataset.shipOrder) + '/ship', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: '{}'
          });
          const data = await res.json();
          if (!res.ok || !data.ok) throw new Error(data.msg || 'Shipment failed');
          FlexHealth.toast(data.order?.awb ? `AWB: ${data.order.awb}` : 'Shipment created');
          this.render();
        } catch (err) {
          FlexHealth.toast(err.message);
          btn.disabled = false;
        }
      });
    });
  },

  async loadIntegrationsStatus(root) {
    const list = root.querySelector('#admin-integrations-list');
    if (!list || !FlexHealth.apiEnabled) return;
    try {
      const res = await fetch('/api/admin/integrations', { credentials: 'include' });
      const data = await res.json();
      if (!data.ok) return;
      const pp = data.phonepe?.enabled;
      const sr = data.shiprocket?.enabled;
      const srLive = data.shiprocket?.realtime;
      const dv = data.delhivery?.enabled;
      list.innerHTML = `
        <li><span>PhonePe (UPI / Cards)</span><strong class="${pp ? 'text-success' : 'text-muted'}">${pp ? 'Connected' : 'Not configured'}</strong></li>
        <li><span>Shiprocket (rates / EDD / AWB)</span><strong class="${sr ? 'text-success' : 'text-muted'}">${sr ? (srLive ? 'Realtime rates' : 'Fallback rates (add API password)') : 'Not configured'}</strong></li>
        <li><span>Delhivery (courier & AWB)</span><strong class="${dv ? 'text-success' : 'text-muted'}">${dv ? 'Connected' : 'Not configured'}</strong></li>
        <li><span>Test mode</span><strong>${data.testMode ? 'On (simulated payments)' : 'Off (live payments)'}</strong></li>`;
    } catch { /* ignore */ }
  }
};

FlexHealth.renderAdminPage = function () {
  return AdminPanel.render();
};
