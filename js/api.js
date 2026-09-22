/**
 * Flex Health — backend API integration
 * Load after main.js. When server runs on :3000, replaces localStorage for auth/orders/admin.
 */
(function () {
  if (typeof FlexHealth === 'undefined') return;

  const L = {
    sendOtp: FlexHealth.sendOtp.bind(FlexHealth),
    verifyOtp: FlexHealth.verifyOtp.bind(FlexHealth),
    testLoginAsDemo: FlexHealth.testLoginAsDemo.bind(FlexHealth),
    updateProfile: FlexHealth.updateProfile.bind(FlexHealth),
    getUserOrders: FlexHealth.getUserOrders.bind(FlexHealth),
    getOrderById: FlexHealth.getOrderById.bind(FlexHealth),
    submitOrder: FlexHealth.submitOrder.bind(FlexHealth),
    updateOrderStatus: FlexHealth.updateOrderStatus.bind(FlexHealth),
    advanceOrderStatus: FlexHealth.advanceOrderStatus.bind(FlexHealth),
    getProductUserReviews: FlexHealth.getProductUserReviews.bind(FlexHealth),
    getUserReviews: FlexHealth.getUserReviews.bind(FlexHealth),
    submitReview: FlexHealth.submitReview.bind(FlexHealth),
    getWishlist: FlexHealth.getWishlist.bind(FlexHealth),
    toggleWishlist: FlexHealth.toggleWishlist.bind(FlexHealth),
    getCurrentUser: FlexHealth.getCurrentUser.bind(FlexHealth),
    initContact: FlexHealth.initContact.bind(FlexHealth),
    renderAdminPage: FlexHealth.renderAdminPage.bind(FlexHealth)
  };

  const Api = {
    enabled: false,

    async check() {
      try {
        const res = await fetch('/api/health', { credentials: 'include' });
        this.enabled = res.ok;
      } catch {
        this.enabled = false;
      }
      return this.enabled;
    },

    async request(path, options = {}) {
      const res = await fetch('/api' + path, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || data.error || 'Request failed');
      return data;
    }
  };

  const origInit = FlexHealth.init.bind(FlexHealth);

  FlexHealth.init = async function () {
    await Api.check();
    this.apiEnabled = Api.enabled;

    if (this.apiEnabled) {
      try {
        const me = await Api.request('/auth/me');
        if (me.session) {
          this.session = me.session;
          localStorage.setItem('flexhealth_session', JSON.stringify(me.session));
        } else {
          this.session = null;
          localStorage.removeItem('flexhealth_session');
        }
      } catch {
        /* keep existing localStorage session */
      }
    }

    await origInit();

    if (this.apiEnabled) {
      await this.getPaymentConfig?.();
      this.renderHeader();
      if (FlexHealth.CONFIG?.AUTH_TEST_MODE) {
        this.showApiBadge();
        this.renderTestModePanel();
      }
    }
  };

  FlexHealth.showApiBadge = function () {
    if (document.getElementById('api-mode-badge')) return;
    const b = document.createElement('div');
    b.id = 'api-mode-badge';
    b.className = 'api-mode-badge';
    b.textContent = '● Live API';
    document.body.appendChild(b);
  };

  FlexHealth.sendOtp = async function (phone, mode, signupData = null) {
    const useFirebase = typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isEnabled();

    if (useFirebase) {
      if (!this.apiEnabled) {
        return { ok: false, msg: 'Firebase OTP requires the backend — run npm start on port 3000' };
      }
      try {
        const check = await Api.request('/auth/pre-check', {
          method: 'POST',
          body: JSON.stringify({ phone, mode, signupData })
        });
        await FirebaseAuth.init();
        await FirebaseAuth.sendOtp(phone);
        this._firebaseMode = mode;
        this._firebaseSignupData = signupData;
        return { ok: true, phone: check.phone, firebase: true };
      } catch (e) {
        return { ok: false, msg: e.message };
      }
    }

    if (!this.apiEnabled) return L.sendOtp(phone, mode, signupData);
    try {
      const data = await Api.request('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, mode, signupData })
      });
      return { ok: true, phone: data.phone, msg: data.msg || 'OTP sent' };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  };

  FlexHealth.verifyOtp = async function (phone, otp) {
    const useFirebase = typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isEnabled() && this._firebaseMode;

    if (useFirebase && this.apiEnabled) {
      try {
        const verified = await FirebaseAuth.verifyOtp(otp);
        const data = await Api.request('/auth/firebase', {
          method: 'POST',
          body: JSON.stringify({
            idToken: verified.idToken,
            mode: this._firebaseMode,
            signupData: this._firebaseSignupData
          })
        });
        this.session = data.session;
        localStorage.setItem('flexhealth_session', JSON.stringify(data.session));
        this._firebaseMode = null;
        this._firebaseSignupData = null;
        return { ok: true, isNew: data.isNew };
      } catch (e) {
        return { ok: false, msg: e.message };
      }
    }

    if (!this.apiEnabled) return L.verifyOtp(phone, otp);
    try {
      const data = await Api.request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp })
      });
      this.session = data.session;
      localStorage.setItem('flexhealth_session', JSON.stringify(data.session));
      return { ok: true, isNew: data.isNew };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  };

  FlexHealth.testLoginAsDemo = async function () {
    if (!FlexHealth.CONFIG?.AUTH_TEST_MODE) {
      this.toast('Test login is disabled');
      return null;
    }
    if (!this.apiEnabled) return L.testLoginAsDemo();
    try {
      const data = await Api.request('/auth/test-login', { method: 'POST', body: '{}' });
      this.session = data.session;
      localStorage.setItem('flexhealth_session', JSON.stringify(data.session));
      return data.user;
    } catch {
      return null;
    }
  };

  FlexHealth.logout = async function () {
    if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isEnabled()) {
      try { await FirebaseAuth.signOut(); } catch { /* ignore */ }
    }
    if (this.apiEnabled) {
      try { await Api.request('/auth/logout', { method: 'POST', body: '{}' }); } catch { /* ignore */ }
    }
    this.session = null;
    localStorage.removeItem('flexhealth_session');
    this.clearPendingOtp?.();
    location.href = 'index.html';
  };

  FlexHealth.getCurrentUser = function () {
    if (this._cachedUser && this.session?.userId === this._cachedUser.id) return this._cachedUser;
    return L.getCurrentUser();
  };

  FlexHealth.loadCurrentUser = async function () {
    if (!this.apiEnabled || !this.isLoggedIn()) return L.getCurrentUser();
    try {
      const data = await Api.request('/auth/me');
      if (data.user) {
        this._cachedUser = data.user;
        return data.user;
      }
    } catch { /* ignore */ }
    return null;
  };

  FlexHealth.updateProfile = async function (data) {
    if (!this.apiEnabled) return L.updateProfile(data);
    try {
      const res = await Api.request('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      this._cachedUser = res.user;
      this.session.name = res.user.name;
      localStorage.setItem('flexhealth_session', JSON.stringify(this.session));
      return true;
    } catch {
      return false;
    }
  };

  FlexHealth.fetchUserOrders = async function () {
    if (!this.apiEnabled || !this.isLoggedIn()) {
      this._userOrdersCache = L.getUserOrders();
      return this._userOrdersCache;
    }
    try {
      const data = await Api.request('/orders/my');
      this._userOrdersCache = data.orders.map(o => this.normalizeOrder(o));
      return this._userOrdersCache;
    } catch {
      this._userOrdersCache = [];
      return [];
    }
  };

  FlexHealth.getUserOrders = function () {
    return this._userOrdersCache || L.getUserOrders();
  };

  FlexHealth.getOrderById = async function (id) {
    if (!this.apiEnabled) return L.getOrderById(id);
    try {
      const phone = sessionStorage.getItem('flexhealth_track_phone');
      const q = phone ? `?phone=${encodeURIComponent(phone)}` : '';
      const data = await Api.request('/orders/' + encodeURIComponent(id) + q);
      return this.normalizeOrder(data.order);
    } catch {
      return L.getOrderById(id);
    }
  };

  FlexHealth.submitOrder = async function (e) {
    if (!this.apiEnabled) return L.submitOrder(e);
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    this.checkoutDraft = data;
    return this.placeCheckoutOrder(data.payment || 'cod');
  };

  FlexHealth.updateOrderStatus = async function (orderId, newStatus) {
    if (!this.apiEnabled) return L.updateOrderStatus(orderId, newStatus);
    try {
      const data = await Api.request('/admin/orders/' + encodeURIComponent(orderId) + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      return { ok: true, order: this.normalizeOrder(data.order) };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  };

  FlexHealth.advanceOrderStatus = async function (orderId) {
    if (!this.apiEnabled) return L.advanceOrderStatus(orderId);
    try {
      const data = await Api.request('/admin/orders/' + encodeURIComponent(orderId) + '/advance', {
        method: 'POST',
        body: '{}'
      });
      return { ok: true, order: this.normalizeOrder(data.order) };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  };

  FlexHealth.getProductUserReviews = function (productId) {
    return this._productReviewsCache?.[productId] || L.getProductUserReviews(productId);
  };

  FlexHealth.fetchProductReviews = async function (productId) {
    if (!this.apiEnabled) return L.getProductUserReviews(productId);
    try {
      const data = await Api.request('/reviews/product/' + encodeURIComponent(productId));
      if (!this._productReviewsCache) this._productReviewsCache = {};
      this._productReviewsCache[productId] = data.reviews;
      return data.reviews;
    } catch {
      return [];
    }
  };

  FlexHealth.getUserReviews = function () {
    return this._userReviewsCache || L.getUserReviews();
  };

  FlexHealth.fetchUserReviews = async function () {
    if (!this.apiEnabled || !this.isLoggedIn()) {
      this._userReviewsCache = L.getUserReviews();
      return this._userReviewsCache;
    }
    try {
      const data = await Api.request('/reviews/my');
      this._userReviewsCache = data.reviews;
      return data.reviews;
    } catch {
      return [];
    }
  };

  FlexHealth.submitReview = async function (productId, rating, text) {
    if (!this.apiEnabled) return L.submitReview(productId, rating, text);
    try {
      await Api.request('/reviews', {
        method: 'POST',
        body: JSON.stringify({ productId, rating, text })
      });
      await this.fetchProductReviews(productId);
      return { ok: true };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  };

  FlexHealth.getWishlist = function () {
    return this._wishlistCache || L.getWishlist();
  };

  FlexHealth.fetchWishlist = async function () {
    if (!this.apiEnabled || !this.isLoggedIn()) {
      this._wishlistCache = L.getWishlist();
      return this._wishlistCache;
    }
    try {
      const data = await Api.request('/wishlist');
      this._wishlistCache = data.items;
      return data.items;
    } catch {
      return [];
    }
  };

  FlexHealth.toggleWishlist = async function (id) {
    if (!this.isLoggedIn()) {
      this.toast('Sign in to save to wishlist');
      setTimeout(() => {
        location.href = 'login.html?redirect=' + encodeURIComponent(location.pathname + location.search);
      }, 700);
      return;
    }
    if (!this.apiEnabled) return L.toggleWishlist(id);
    try {
      const data = await Api.request('/wishlist/' + encodeURIComponent(id) + '/toggle', {
        method: 'POST',
        body: '{}'
      });
      await this.fetchWishlist();
      this.toast(data.added ? 'Added to wishlist ♡' : 'Removed from wishlist');
      document.querySelectorAll(`.product-card[data-id="${id}"] .product-card__wishlist`).forEach(btn => {
        btn.classList.toggle('active', data.added);
        btn.textContent = data.added ? '♥' : '♡';
      });
    } catch (e) {
      this.toast(e.message);
    }
  };

  FlexHealth.isAdminLoggedIn = function () {
    if (!this.apiEnabled) return sessionStorage.getItem('flexhealth_admin') === '1';
    return !!this._adminLoggedIn;
  };

  FlexHealth.refreshAdminSession = async function () {
    if (!this.apiEnabled) return this.isAdminLoggedIn();
    try {
      const data = await Api.request('/admin/session');
      this._adminLoggedIn = !!data.loggedIn;
    } catch {
      this._adminLoggedIn = false;
    }
    return this._adminLoggedIn;
  };

  FlexHealth.adminLogin = async function (credentials) {
    if (!this.apiEnabled) {
      if (!FlexHealth.CONFIG?.AUTH_TEST_MODE) return false;
      if (credentials.pin === (FlexHealth.CONFIG?.ADMIN_PIN || '1234')) {
        sessionStorage.setItem('flexhealth_admin', '1');
        return true;
      }
      return false;
    }
    try {
      await Api.request('/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      this._adminLoggedIn = true;
      return true;
    } catch {
      return false;
    }
  };

  FlexHealth.adminLogout = async function () {
    if (this.apiEnabled) {
      try { await Api.request('/admin/logout', { method: 'POST', body: '{}' }); } catch { /* ignore */ }
    }
    sessionStorage.removeItem('flexhealth_admin');
    location.reload();
  };

  const origRenderAccount = FlexHealth.renderAccount.bind(FlexHealth);
  FlexHealth.renderAccount = async function () {
    if (!this.isLoggedIn()) {
      location.href = 'login.html?redirect=' + encodeURIComponent('account.html' + location.hash);
      return;
    }
    if (this.apiEnabled) {
      await Promise.all([
        this.fetchUserOrders(),
        this.fetchWishlist(),
        this.fetchUserReviews(),
        this.loadCurrentUser()
      ]);
    }
    origRenderAccount();
  };

  const origRenderProductReviews = FlexHealth.renderProductReviews.bind(FlexHealth);
  FlexHealth.renderProductReviews = async function (productId) {
    if (this.apiEnabled) await this.fetchProductReviews(productId);
    origRenderProductReviews(productId);
  };

  const origRenderOrderDetail = FlexHealth.renderOrderDetail.bind(FlexHealth);
  FlexHealth.renderOrderDetail = async function () {
    const el = document.getElementById('order-detail-content');
    if (!el) return;
    const orderId = new URLSearchParams(location.search).get('id');
    if (!orderId) {
      el.innerHTML = '<div class="empty-state"><h3>No order specified</h3><a href="track.html" class="btn btn--primary">Track an Order</a></div>';
      return;
    }

    if (this.apiEnabled) {
      const canView = this.isLoggedIn();
      const phoneMatch = sessionStorage.getItem('flexhealth_track_verified') === orderId;
      if (!canView && !phoneMatch) {
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
          </div>`;
        document.getElementById('order-verify-form')?.addEventListener('submit', async e => {
          e.preventDefault();
          const phone = this.normalizePhone(Object.fromEntries(new FormData(e.target)).phone);
          sessionStorage.setItem('flexhealth_track_phone', phone);
          sessionStorage.setItem('flexhealth_track_verified', orderId);
          this.renderOrderDetail();
        });
        return;
      }
      const order = await this.getOrderById(orderId);
      if (!order) {
        el.innerHTML = '<div class="empty-state"><h3>Order not found</h3></div>';
        return;
      }
      el.innerHTML = this.orderDetailHtml(order, { showCustomer: true }) +
        (order.status !== 'delivered' && order.status !== 'cancelled'
          ? '<p class="order-refresh-hint">Refresh to see latest status updates.</p>' : '');
      return;
    }
    return origRenderOrderDetail();
  };

  FlexHealth.renderAdminPage = async function () {
    if (typeof AdminPanel !== 'undefined') return AdminPanel.render();
    return L.renderAdminPage();
  };

  FlexHealth.initContact = function () {
    if (!FlexHealth.apiEnabled) return L.initContact();
    document.getElementById('contact-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      try {
        await Api.request('/admin/contact', { method: 'POST', body: JSON.stringify(data) });
        FlexHealth.toast('Message sent! We will get back to you soon.');
        e.target.reset();
      } catch (err) {
        FlexHealth.toast(err.message);
      }
    });
  };
})();
