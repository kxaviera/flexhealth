/**
 * Flex Health — Checkout & Payment flow
 */
(function () {
  if (typeof FlexHealth === 'undefined') return;

  FlexHealth.checkoutStep = 1;
  FlexHealth.checkoutDraft = null;
  FlexHealth._paymentConfig = null;

  FlexHealth.paymentMethodLabel = function (method) {
    return {
      cod: 'Cash on Delivery',
      phonepe: 'PhonePe (UPI / Card)',
      online: 'PhonePe (UPI / Card)',
      upi: 'PhonePe UPI',
      card: 'PhonePe Card'
    }[method] || method;
  };

  FlexHealth.paymentStatusLabel = function (status) {
    return {
      pending: 'Payment Pending',
      paid: 'Paid Online',
      cod: 'Pay on Delivery',
      failed: 'Payment Failed',
      refunded: 'Refunded'
    }[status] || status;
  };

  FlexHealth.checkoutStepsHtml = function (current) {
    const steps = [
      { n: 1, label: 'Bag' },
      { n: 2, label: 'Details' },
      { n: 3, label: 'Payment' }
    ];
    return `
      <div class="checkout-steps">
        ${steps.map(s => `
          <div class="checkout-step${current === s.n ? ' checkout-step--active' : ''}${current > s.n ? ' checkout-step--done' : ''}">
            <span class="checkout-step__num">${current > s.n ? '✓' : s.n}</span>
            <span class="checkout-step__label">${s.label}</span>
          </div>`).join('<span class="checkout-step__line"></span>')}
      </div>`;
  };

  FlexHealth.goCheckoutStep = function (step) {
    if (step > 1) {
      const check = this.validateCartStock?.();
      if (check && !check.ok) {
        this.toast(check.msg);
        this.checkoutStep = 1;
        this.renderCartPage();
        return;
      }
    }
    this.checkoutStep = step;
    this.renderCartPage();
  };

  FlexHealth.saveCheckoutDraft = function (form) {
    this.checkoutDraft = Object.fromEntries(new FormData(form));
  };

  FlexHealth.getPaymentConfig = async function () {
    if (this._paymentConfig) return this._paymentConfig;
    if (this.apiEnabled) {
      try {
        const res = await fetch('/api/payments/config', { credentials: 'include' });
        this._paymentConfig = await res.json();
      } catch {
        this._paymentConfig = { testMode: false, methods: ['cod'], phonepe: { enabled: false } };
      }
    } else {
      this._paymentConfig = { testMode: false, methods: ['cod'], phonepe: { enabled: false } };
    }
    return this._paymentConfig;
  };

  FlexHealth.onlinePaymentsAvailable = function () {
    const cfg = this._paymentConfig;
    return !!(cfg?.phonepe?.enabled || cfg?.testMode);
  };

  FlexHealth.paymentMethodOptionsHtml = function () {
    if (!this.onlinePaymentsAvailable()) return '';
    return `
            <label class="payment-option-card">
              <input type="radio" name="pay_method" value="phonepe">
              <span class="payment-option-card__icon">📱</span>
              <strong>PhonePe — UPI / Cards</strong>
              <small>Secure checkout via PhonePe</small>
            </label>`;
  };

  FlexHealth.showOrderSuccess = function (order, customer) {
    const contentEl = document.getElementById('cart-page-content');
    const successEl = document.getElementById('cart-order-success');
    if (contentEl) contentEl.style.display = 'none';
    if (successEl) {
      successEl.style.display = 'block';
      const o = this.normalizeOrder(order);
      const paid = o.paymentStatus === 'paid';
      const cod = o.payment === 'cod' || o.paymentStatus === 'cod';
      successEl.innerHTML = `
        <div class="cart-success__icon">${paid || cod ? '✓' : '⏳'}</div>
        <h2>${paid ? 'Payment Successful!' : cod ? 'Order Placed!' : 'Order Received'}</h2>
        <p>Thank you, ${this.escapeHtml(customer.name)}.</p>
        <p class="cart-success__id">Order ID: <strong>${o.id}</strong></p>
        <div class="payment-success-badge payment-success-badge--${o.paymentStatus || 'cod'}">
          ${this.paymentMethodLabel(o.payment)} · ${this.paymentStatusLabel(o.paymentStatus || (cod ? 'cod' : 'pending'))}
        </div>
        ${o.paymentRecord?.transactionId ? `<p class="cart-success__txn">Transaction: <strong>${this.escapeHtml(o.paymentRecord.transactionId)}</strong></p>` : ''}
        <p>${cod ? 'Pay cash when your order arrives. We\'ll call to confirm.' : paid ? 'Your payment is confirmed. We\'ll ship soon!' : 'Complete payment to confirm your order.'}</p>
        <div class="order-tracker order-tracker--success">${this.orderTimelineHtml(o)}</div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px">
          <a href="order.html?id=${encodeURIComponent(o.id)}" class="btn btn--primary">Track Order</a>
          <a href="shop.html" class="btn btn--outline">Continue Shopping</a>
          ${this.isLoggedIn() ? `<a href="account.html#orders" class="btn btn--outline">My Orders</a>` : ''}
        </div>`;
    }
    this.checkoutStep = 1;
    this.checkoutDraft = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  FlexHealth.openPaymentModal = async function ({ paymentId, method, amount, orderId, customerName }) {
    const cfg = await this.getPaymentConfig();
    const testHint = cfg.testMode ? `
      <div class="payment-test-hint">
        🧪 <strong>Test mode</strong> — UPI OTP: <code>${cfg.testPaymentOtp || '123456'}</code>
        ${method === 'card' ? ` · Card: <code>${cfg.testCard || '4111 1111 1111 1111'}</code>` : ''}
      </div>` : '';

    let fields = '';
    if (method === 'upi') {
      fields = `
        <div class="form-group">
          <label>UPI ID</label>
          <input type="text" name="upiId" required placeholder="yourname@upi" value="${cfg.testUpiId || ''}">
        </div>
        <div class="form-group">
          <label>Payment OTP</label>
          <input type="text" name="otp" required placeholder="6-digit OTP" maxlength="6" pattern="[0-9]{6}" inputmode="numeric">
          <small class="form-hint">Sent to your UPI app (test OTP shown above)</small>
        </div>`;
    } else {
      fields = `
        <div class="form-group">
          <label>Name on Card</label>
          <input type="text" name="nameOnCard" required value="${this.escapeHtml(customerName || '')}">
        </div>
        <div class="form-group">
          <label>Card Number</label>
          <input type="text" name="cardNumber" required placeholder="4111 1111 1111 1111" maxlength="19">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Expiry</label>
            <input type="text" name="expiry" required placeholder="MM/YY" maxlength="5">
          </div>
          <div class="form-group">
            <label>CVV</label>
            <input type="password" name="cvv" required placeholder="123" maxlength="4">
          </div>
        </div>`;
    }

    document.getElementById('payment-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', `
      <div class="payment-modal" id="payment-modal">
        <div class="payment-modal__backdrop" data-pay-close></div>
        <div class="payment-modal__dialog">
          <div class="payment-modal__head">
            <h2>${method === 'upi' ? '📱 Pay with UPI' : '💳 Pay with Card'}</h2>
            <button type="button" class="admin-modal__close" data-pay-close>×</button>
          </div>
          <div class="payment-modal__amount">
            <span>Amount to pay</span>
            <strong>${this.formatPrice(amount)}</strong>
          </div>
          ${testHint}
          <form id="payment-complete-form">
            ${fields}
            <input type="hidden" name="paymentId" value="${this.escapeHtml(paymentId)}">
            <input type="hidden" name="orderId" value="${this.escapeHtml(orderId)}">
            <button type="submit" class="btn btn--primary btn--lg" style="width:100%;margin-top:16px">
              Pay ${this.formatPrice(amount)}
            </button>
          </form>
          <p class="payment-modal__secure">🔒 Secured checkout · Order ${this.escapeHtml(orderId)}</p>
        </div>
      </div>`);

    const modal = document.getElementById('payment-modal');
    modal.querySelectorAll('[data-pay-close]').forEach(el => {
      el.addEventListener('click', () => modal.remove());
    });

    document.getElementById('payment-complete-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      const btn = e.target.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Processing…';

      try {
        let order;
        if (this.apiEnabled) {
          const res = await fetch('/api/payments/' + encodeURIComponent(paymentId) + '/complete', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (!res.ok || !data.ok) throw new Error(data.msg || 'Payment failed');
          order = data.order;
        } else {
          await new Promise(r => setTimeout(r, 1200));
          if (method === 'upi' && body.otp !== (cfg.testPaymentOtp || '123456')) {
            throw new Error('Invalid OTP — use ' + (cfg.testPaymentOtp || '123456'));
          }
          const orders = JSON.parse(localStorage.getItem('flexhealth_orders') || '[]');
          const idx = orders.findIndex(o => o.id === orderId);
          if (idx >= 0) {
            orders[idx].paymentStatus = 'paid';
            orders[idx].paymentRecord = {
              id: paymentId,
              transactionId: 'TXN' + Date.now().toString().slice(-8),
              status: 'paid'
            };
            localStorage.setItem('flexhealth_orders', JSON.stringify(orders));
            order = orders[idx];
          }
        }
        modal.remove();
        this.cart = [];
        this.saveCart();
        this.showOrderSuccess(order, { name: customerName });
      } catch (err) {
        this.toast(err.message || 'Payment failed');
        btn.disabled = false;
        btn.textContent = 'Pay ' + this.formatPrice(amount);
      }
    });
  };

  FlexHealth.placeCheckoutOrder = async function (paymentMethod) {
    const draft = this.checkoutDraft;
    if (!draft?.name) {
      this.toast('Please complete delivery details');
      this.goCheckoutStep(2);
      return;
    }

    const stockCheck = this.validateCartStock?.();
    if (stockCheck && !stockCheck.ok) {
      this.toast(stockCheck.msg);
      this.goCheckoutStep(1);
      return;
    }

    const lines = this.getCartLines();
    const customer = { ...draft, payment: paymentMethod };
    const items = lines.map(l => ({ id: l.id, name: l.product.name, qty: l.qty, price: l.product.price }));
    const { subtotal, discount, total } = this.getCartTotals();
    const promoCode = this.appliedPromo?.code || null;

    if (paymentMethod === 'cod') {
      return this.finalizeOrder(customer, items, total, 'cod', { subtotal, discount, promoCode });
    }

    try {
      let order, payment, requiresPayment, paymentAccessToken = null;
      if (this.apiEnabled) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer,
            items,
            payment: paymentMethod,
            total,
            promoCode,
            shippingCost: this.checkoutShipping?.charge || 0
          })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.msg || 'Order failed');
        order = data.order;
        payment = data.payment;
        requiresPayment = data.requiresPayment;
        paymentAccessToken = data.paymentAccessToken || null;
      } else {
        const orderId = 'FH' + Date.now().toString().slice(-8);
        const paymentId = 'PAY' + Date.now().toString().slice(-10);
        order = {
          id: orderId,
          date: new Date().toISOString(),
          userId: this.session?.userId || null,
          status: 'placed',
          statusHistory: [{ status: 'placed', at: new Date().toISOString() }],
          customer,
          items,
          subtotal,
          discountAmount: discount,
          promoCode,
          total,
          payment: paymentMethod,
          paymentStatus: 'pending',
          paymentRecord: { id: paymentId, status: 'pending', amount: total }
        };
        payment = { id: paymentId, method: paymentMethod, amount: total, status: 'pending' };
        requiresPayment = true;
        const orders = JSON.parse(localStorage.getItem('flexhealth_orders') || '[]');
        orders.unshift(order);
        localStorage.setItem('flexhealth_orders', JSON.stringify(orders.slice(0, 50)));
      }

      if (requiresPayment && payment?.id) {
        const cfg = await this.getPaymentConfig();
        if (cfg.phonepe?.enabled) {
          await this.openPhonePeCheckout({
            paymentId: payment.id,
            orderId: order.id,
            customerName: customer.name,
            phone: customer.phone,
            paymentAccessToken
          });
        } else if (cfg.testMode) {
          await this.openPaymentModal({
            paymentId: payment.id,
            method: paymentMethod === 'card' ? 'card' : 'upi',
            amount: total,
            orderId: order.id,
            customerName: customer.name
          });
        } else {
          this.toast('Online payment is not available. Please use Cash on Delivery or contact support.');
        }
      }
      this.appliedPromo = null;
    } catch (e) {
      this.toast(e.message || 'Could not place order');
    }
  };

  FlexHealth.openPhonePeCheckout = async function ({ paymentId, orderId, customerName, phone, paymentAccessToken }) {
    const body = {};
    if (phone) body.phone = phone;
    if (paymentAccessToken) body.paymentAccessToken = paymentAccessToken;
    const createRes = await fetch('/api/payments/' + encodeURIComponent(paymentId) + '/phonepe/create', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(paymentAccessToken ? { 'X-Payment-Token': paymentAccessToken } : {})
      },
      body: JSON.stringify(body)
    });
    const createData = await createRes.json();
    if (!createRes.ok || !createData.ok || !createData.redirectUrl) {
      throw new Error(createData.msg || 'Could not start PhonePe payment');
    }
    try {
      sessionStorage.setItem('flexhealth_pending_pay', JSON.stringify({ paymentId, orderId, phone: phone || null }));
    } catch { /* ignore */ }
    // Order already created — clear bag before leaving for PhonePe (same-page redirect)
    this.cart = [];
    this.saveCart?.();
    this._pendingPhonePeOrder = { paymentId, orderId, customerName };
    window.location.href = createData.redirectUrl;
  };

  FlexHealth.formatShippingResult = function (data) {
    if (!data?.available) {
      return { ok: false, text: data?.msg || 'Delivery may not be available to this pincode' };
    }
    const charge = Number(data.shippingCharge) || 0;
    const title = data.rateTitle || data.courier || 'Shipping';
    const etd = data.etd || (data.estimatedDays ? `${data.estimatedDays} days` : null);
    const parts = [];
    parts.push(charge > 0 ? `${title}: ${this.formatPrice(charge)}` : `${title}: ₹0`);
    if (etd) parts.push(`EDD ${etd}`);
    if (data.courier && data.source === 'shiprocket') parts.push(data.courier);
    return {
      ok: true,
      text: `✓ ${parts.join(' · ')}`,
      charge,
      title,
      etd,
      courier: data.courier || null,
      source: data.source || null
    };
  };

  FlexHealth.applyShippingQuote = function (data) {
    const formatted = this.formatShippingResult(data);
    if (!formatted.ok) {
      this.checkoutShipping = null;
      return formatted;
    }
    this.checkoutShipping = {
      charge: formatted.charge,
      title: formatted.title,
      etd: formatted.etd,
      courier: formatted.courier,
      source: formatted.source
    };
    return formatted;
  };

  FlexHealth.bindProductPincodeCheck = function (product) {
    const input = document.getElementById('product-pincode-input');
    const btn = document.getElementById('product-pincode-btn');
    const msg = document.getElementById('product-pincode-msg');
    if (!input || !msg) return;

    const run = async () => {
      const pin = input.value.replace(/\D/g, '');
      if (pin.length !== 6) {
        msg.textContent = 'Enter a valid 6-digit pincode';
        msg.style.color = '#b45309';
        return;
      }
      msg.textContent = 'Checking Shiprocket rates…';
      msg.style.color = 'var(--color-gray-500)';
      try {
        const value = product?.price || 0;
        const res = await fetch(`/api/shipping/serviceability?pincode=${pin}&cod=1&weight=0.5&value=${encodeURIComponent(value)}`);
        const data = await res.json();
        const formatted = this.formatShippingResult(data);
        msg.textContent = formatted.text;
        msg.style.color = formatted.ok ? 'var(--color-accent)' : '#b45309';
      } catch {
        msg.textContent = 'Could not check delivery right now';
        msg.style.color = '#b45309';
      }
    };

    btn?.addEventListener('click', run);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        run();
      }
    });
  };

  FlexHealth.bindPincodeCheck = function () {
    const input = document.getElementById('checkout-pincode');
    const msg = document.getElementById('pincode-delivery-msg');
    if (!input || !msg) return;
    const check = async () => {
      const pin = input.value.replace(/\D/g, '');
      if (pin.length !== 6) {
        msg.textContent = '';
        this.checkoutShipping = null;
        return;
      }
      msg.textContent = 'Checking delivery…';
      msg.style.color = 'var(--color-gray-500)';
      try {
        const { subtotal } = this.getCartTotals?.() || { subtotal: 0 };
        const res = await fetch(`/api/shipping/serviceability?pincode=${pin}&cod=1&weight=0.5&value=${encodeURIComponent(subtotal || 0)}`);
        const data = await res.json();
        const formatted = this.applyShippingQuote(data);
        msg.textContent = formatted.text;
        msg.style.color = formatted.ok ? 'var(--color-accent)' : '#b45309';
        if (this.checkoutStep === 2 || this.checkoutStep === 3) {
          this.renderCartPage?.();
        }
      } catch {
        msg.textContent = 'Enter pincode — delivery checked at checkout';
        msg.style.color = 'var(--color-gray-500)';
      }
    };
    input.addEventListener('blur', check);
    input.addEventListener('input', () => {
      if (input.value.replace(/\D/g, '').length === 6) check();
    });
    if (input.value.replace(/\D/g, '').length === 6) check();
  };

  FlexHealth.finalizeOrder = async function (customer, items, total, paymentMethod, promoMeta = {}) {
    const { subtotal, discount, promoCode } = promoMeta;
    try {
      let order;
      if (this.apiEnabled) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer,
            items,
            payment: paymentMethod,
            total,
            promoCode: promoCode || this.appliedPromo?.code || null,
            shippingCost: this.checkoutShipping?.charge || 0
          })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.msg || 'Order failed');
        order = data.order;
      } else {
        const orderId = 'FH' + Date.now().toString().slice(-8);
        order = {
          id: orderId,
          date: new Date().toISOString(),
          userId: this.session?.userId || null,
          status: 'placed',
          statusHistory: [{ status: 'placed', at: new Date().toISOString() }],
          customer,
          items,
          subtotal: subtotal ?? total,
          discountAmount: discount || 0,
          promoCode: promoCode || this.appliedPromo?.code || null,
          total,
          payment: 'cod',
          paymentStatus: 'cod'
        };
        const orders = JSON.parse(localStorage.getItem('flexhealth_orders') || '[]');
        orders.unshift(order);
        localStorage.setItem('flexhealth_orders', JSON.stringify(orders.slice(0, 50)));
      }
      this.cart = [];
      this.saveCart();
      this.appliedPromo = null;
      this.showOrderSuccess(order, customer);
    } catch (e) {
      this.toast(e.message || 'Order failed');
    }
  };
})();
