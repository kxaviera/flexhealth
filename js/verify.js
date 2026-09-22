/**
 * Flex Health — Product authenticity verification (code + QR scan)
 */
(function () {
  if (typeof FlexHealth === 'undefined') return;

  let qrScanner = null;
  let qrActive = false;

  FlexHealth.parseVerificationInput = function (raw) {
    let code = String(raw || '').trim();
    if (!code) return '';
    if (/^https?:\/\//i.test(code) || code.includes('verify.html')) {
      try {
        const url = new URL(code.startsWith('http') ? code : `https://flexhealth.in/${code.replace(/^\//, '')}`);
        code = url.searchParams.get('code') || url.searchParams.get('c') || code;
      } catch {
        const match = code.match(/[?&](?:code|c)=([^&]+)/i);
        if (match) code = decodeURIComponent(match[1]);
      }
    }
    return code.trim();
  };

  FlexHealth.verifyProductCode = async function (rawCode) {
    const code = this.parseVerificationInput(rawCode);
    if (!code) throw new Error('Please enter a verification code');

    const normalized = code.toUpperCase();
    const apiBases = [location.origin];
    if (location.port && location.port !== '3000') {
      apiBases.push('http://localhost:3000', 'http://127.0.0.1:3000');
    }

    for (const base of apiBases) {
      try {
        const res = await fetch(`${base}/api/verify`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        const data = await res.json().catch(() => null);
        if (data && typeof data.ok === 'boolean') {
          if (!data.ok) {
            return {
              ok: false,
              status: data.status || 'not_found',
              code: data.code || normalized,
              msg: data.msg || 'Code not recognized'
            };
          }
          return data;
        }
      } catch {
        /* try next base or JSON fallback */
      }
    }

    for (const base of apiBases) {
      try {
        const res = await fetch(`${base}/data/verification-codes.json?v=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) continue;
        const file = await res.json();
        const codes = (file.codes || []).map(c => String(c).trim().toUpperCase());
        if (codes.includes(normalized)) {
          return {
            ok: true,
            status: 'genuine',
            code: normalized,
            msg: 'This verification code is valid. Your product is 100% genuine Flex Health stock.'
          };
        }
      } catch {
        /* try next base */
      }
    }

    if (location.protocol === 'file:') {
      throw new Error('Open http://localhost:3000/verify.html with the server running (cd server && npm start).');
    }

    throw new Error('Code not recognized. Add it in Admin → Verify Codes, then open http://localhost:3000/verify.html');
  };

  FlexHealth.verifyResultHtml = function (result) {
    const status = result.status;
    const product = result.product;
    const statusClass = {
      genuine: 'verify-result--success',
      registered: 'verify-result--info',
      already_verified: 'verify-result--warn',
      not_found: 'verify-result--error'
    }[status] || 'verify-result--info';

    const statusTitle = {
      genuine: 'Genuine Product',
      registered: 'Registered Product',
      already_verified: 'Previously Verified',
      not_found: 'Not Recognized'
    }[status] || 'Verification Result';

    const icon = {
      genuine: '✓',
      registered: '✓',
      already_verified: '!',
      not_found: '✕'
    }[status] || '?';

    return `
      <div class="verify-result ${statusClass}">
        <div class="verify-result__icon" aria-hidden="true">${icon}</div>
        <h2>${statusTitle}</h2>
        <p class="verify-result__msg">${this.escapeHtml(result.msg || '')}</p>
        ${result.code ? `<p class="verify-result__code">Code: <strong>${this.escapeHtml(result.code)}</strong></p>` : ''}
        ${product ? `
          <div class="verify-result__product">
            <a href="product.html?id=${encodeURIComponent(product.id)}" class="verify-result__img">
              <img src="${this.escapeHtml(this.getProductImage(product))}" alt="">
            </a>
            <div>
              <div class="verify-result__brand">${this.escapeHtml(product.brand || 'Flex Health')}</div>
              <a href="product.html?id=${encodeURIComponent(product.id)}" class="verify-result__name">${this.escapeHtml(product.name)}</a>
              <div class="verify-result__sku">SKU: ${this.escapeHtml(product.sku || product.id)}</div>
              <a href="product.html?id=${encodeURIComponent(product.id)}" class="btn btn--outline btn--sm" style="margin-top:12px">View Product</a>
            </div>
          </div>` : ''}
      </div>`;
  };

  FlexHealth.renderVerifyPage = function () {
    const resultEl = document.getElementById('verify-result');
    const codeInput = document.getElementById('verify-code-input');
    const prefill = new URLSearchParams(location.search).get('code') || new URLSearchParams(location.search).get('c');
    if (prefill && codeInput) codeInput.value = prefill;

    const runVerify = async code => {
      if (!resultEl) return;
      resultEl.innerHTML = '<div class="verify-result verify-result--loading">Verifying…</div>';
      try {
        const result = await this.verifyProductCode(code);
        resultEl.innerHTML = this.verifyResultHtml(result);
        if (qrActive) this.stopQrScanner();
      } catch (err) {
        resultEl.innerHTML = this.verifyResultHtml({
          ok: false,
          status: 'not_found',
          code: this.parseVerificationInput(code),
          msg: err.message || 'Verification failed'
        });
      }
    };

    document.getElementById('verify-code-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const code = new FormData(e.target).get('code');
      runVerify(code);
    });

    document.querySelectorAll('[data-verify-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.verifyTab;
        document.querySelectorAll('[data-verify-tab]').forEach(b => {
          b.classList.toggle('active', b.dataset.verifyTab === tab);
          b.setAttribute('aria-selected', b.dataset.verifyTab === tab ? 'true' : 'false');
        });
        document.getElementById('verify-tab-code').hidden = tab !== 'code';
        document.getElementById('verify-tab-scan').hidden = tab !== 'scan';
        if (tab === 'scan') this.startQrScanner(runVerify);
        else this.stopQrScanner();
      });
    });

    document.getElementById('qr-stop-btn')?.addEventListener('click', () => this.stopQrScanner());

    if (prefill) runVerify(prefill);
  };

  FlexHealth.startQrScanner = async function (onScan) {
    if (typeof Html5Qrcode === 'undefined') {
      this.toast('QR scanner unavailable — use Enter Code instead');
      return;
    }
    const readerId = 'qr-reader';
    const stopBtn = document.getElementById('qr-stop-btn');
    if (qrActive) return;

    try {
      qrScanner = new Html5Qrcode(readerId);
      qrActive = true;
      if (stopBtn) stopBtn.hidden = false;

      await qrScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        decodedText => {
          if (decodedText) onScan(decodedText);
        },
        () => {}
      );
    } catch (err) {
      qrActive = false;
      if (stopBtn) stopBtn.hidden = true;
      this.toast(err?.message?.includes('Permission') ? 'Camera permission required' : 'Could not start camera');
    }
  };

  FlexHealth.stopQrScanner = async function () {
    const stopBtn = document.getElementById('qr-stop-btn');
    if (!qrScanner || !qrActive) return;
    try {
      await qrScanner.stop();
      qrScanner.clear();
    } catch {
      /* ignore */
    }
    qrScanner = null;
    qrActive = false;
    if (stopBtn) stopBtn.hidden = true;
  };
})();
