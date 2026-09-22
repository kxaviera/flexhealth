/**
 * Flex Health — Admin CMS (products, homepage sections)
 */
const AdminCMS = {
  editingProduct: null,
  editingIndex: null,

  async cms(path, options = {}) {
    if (!FlexHealth.apiEnabled) {
      throw new Error('CMS requires backend — run npm start on port 3000');
    }
    const res = await fetch('/api/admin/cms' + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body != null ? JSON.stringify(options.body) : undefined
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) throw new Error(data.msg || 'Save failed');
    return data;
  },

  panels: {},

  bind(root, data) {
    root.querySelectorAll('[data-cms-action]').forEach(btn => {
      btn.addEventListener('click', () => this.handleAction(btn.dataset.cmsAction, btn.dataset, data));
    });
    root.querySelectorAll('[data-cms-form]').forEach(form => {
      form.addEventListener('submit', e => this.handleFormSubmit(e, data));
    });
    root.querySelectorAll('[data-product-search]').forEach(input => {
      input.addEventListener('input', () => {
        AdminPanel.productSearch = input.value;
        const main = root.querySelector('.admin-content');
        if (main) main.innerHTML = AdminCMS.panels.products(data);
        AdminCMS.bind(root, data);
      });
    });
    root.querySelectorAll('[data-stock-filter]').forEach(sel => {
      sel.addEventListener('change', () => {
        AdminPanel.productStockFilter = sel.value;
        const main = root.querySelector('.admin-content');
        if (main) main.innerHTML = AdminCMS.panels.products(data);
        AdminCMS.bind(root, data);
      });
    });
    root.querySelectorAll('[data-stock-toggle]').forEach(cb => {
      cb.addEventListener('change', async () => {
        const label = cb.closest('.admin-stock-toggle')?.querySelector('span');
        try {
          await AdminCMS.cms('/products/' + encodeURIComponent(cb.dataset.id), {
            method: 'PUT',
            body: { inStock: cb.checked }
          });
          if (label) label.textContent = cb.checked ? 'In stock' : 'Out of stock';
          FlexHealth.toast(cb.checked ? 'Marked in stock' : 'Marked out of stock');
        } catch (e) {
          FlexHealth.toast(e.message);
          cb.checked = !cb.checked;
        }
      });
    });
    root.querySelectorAll('[data-feature-toggle]').forEach(cb => {
      cb.addEventListener('change', async () => {
        try {
          await AdminCMS.cms('/products/' + encodeURIComponent(cb.dataset.id), {
            method: 'PUT',
            body: { [cb.dataset.field]: cb.checked }
          });
          FlexHealth.toast('Updated');
        } catch (e) {
          FlexHealth.toast(e.message);
          cb.checked = !cb.checked;
        }
      });
    });
  },

  async handleAction(action, dataset) {
    if (action === 'close-modal') return this.closeModal();
    if (action === 'add-product') return this.openProductForm(null, dataset);
    if (action === 'edit-product') return this.openProductForm(dataset.id);
    if (action === 'delete-product') {
      if (!confirm('Delete this product permanently?')) return;
      try {
        await this.cms('/products/' + encodeURIComponent(dataset.id), { method: 'DELETE' });
        FlexHealth.toast('Product deleted');
        AdminPanel.render();
      } catch (e) { FlexHealth.toast(e.message); }
      return;
    }
    if (action === 'add-category') return this.openSimpleForm('category');
    if (action === 'edit-category') return this.openSimpleForm('category', dataset.id);
    if (action === 'delete-category') return this.deleteItem('categories', dataset.id, 'category');
    if (action === 'add-brand') return this.openSimpleForm('brand');
    if (action === 'edit-brand') return this.openSimpleForm('brand', dataset.id);
    if (action === 'delete-brand') return this.deleteItem('brands', dataset.id, 'brand');
    if (action === 'add-banner') return this.openBannerForm();
    if (action === 'edit-banner') return this.openBannerForm(+dataset.index);
    if (action === 'delete-banner') return this.deleteIndexed('banners', +dataset.index);
    if (action === 'add-offer') return this.openOfferForm();
    if (action === 'edit-offer') return this.openOfferForm(+dataset.index);
    if (action === 'delete-offer') return this.deleteIndexed('offer-banners', +dataset.index);
    if (action === 'add-promo') return this.openPromoForm();
    if (action === 'edit-promo') return this.openPromoForm(+dataset.index);
    if (action === 'delete-promo') return this.deleteIndexed('promo-slides', +dataset.index);
    if (action === 'add-promo-code') return this.openPromoCodeForm();
    if (action === 'edit-promo-code') return this.openPromoCodeForm(dataset.code);
    if (action === 'delete-promo-code') return this.deletePromoCode(dataset.code);
    if (action === 'add-review') return this.openReviewForm();
    if (action === 'edit-review') return this.openReviewForm(+dataset.index);
    if (action === 'delete-review') return this.deleteIndexed('reviews', +dataset.index);
  },

  async deleteItem(type, id, label) {
    if (!confirm(`Delete this ${label}?`)) return;
    try {
      await this.cms(`/${type}/${encodeURIComponent(id)}`, { method: 'DELETE' });
      FlexHealth.toast('Deleted');
      AdminPanel.render();
    } catch (e) { FlexHealth.toast(e.message); }
  },

  async deletePromoCode(code) {
    if (!confirm('Delete this promo code?')) return;
    try {
      await this.cms('/promo-codes/' + encodeURIComponent(code), { method: 'DELETE' });
      FlexHealth.toast('Deleted');
      AdminPanel.render();
    } catch (e) {
      FlexHealth.toast(e.message);
    }
  },

  openPromoCodeForm(code) {
    AdminCMS.cms('/').then(({ catalog }) => {
      const promos = catalog.promoCodes || [];
      const p = code ? promos.find(x => FlexHealth.normalizePromoCode?.(x.code) === FlexHealth.normalizePromoCode?.(code) || String(x.code).toUpperCase() === String(code).toUpperCase()) : null;
      const body = `
        <div class="form-group"><label>Code *</label><input name="code" required value="${FlexHealth.escapeHtml(p?.code || '')}" placeholder="WELCOME10" ${p ? 'readonly' : ''}></div>
        <div class="admin-form-grid admin-form-grid--2">
          <div class="form-group">
            <label>Discount Type *</label>
            <select name="type">
              <option value="percent" ${p?.type !== 'fixed' ? 'selected' : ''}>Percentage (%)</option>
              <option value="fixed" ${p?.type === 'fixed' ? 'selected' : ''}>Fixed amount (₹)</option>
            </select>
          </div>
          <div class="form-group"><label>Value *</label><input name="value" type="number" min="1" required value="${p?.value ?? ''}" placeholder="10"></div>
        </div>
        <div class="admin-form-grid admin-form-grid--3">
          <div class="form-group"><label>Min Order (₹)</label><input name="minOrder" type="number" min="0" value="${p?.minOrder ?? 0}"></div>
          <div class="form-group"><label>Max Discount (₹)</label><input name="maxDiscount" type="number" min="0" value="${p?.maxDiscount ?? ''}" placeholder="Percent only"></div>
          <div class="form-group"><label>Max Uses</label><input name="maxUses" type="number" min="1" value="${p?.maxUses ?? ''}" placeholder="Unlimited"></div>
        </div>
        <div class="admin-form-grid admin-form-grid--2">
          <div class="form-group"><label>Expires</label><input name="expiresAt" type="date" value="${p?.expiresAt ? String(p.expiresAt).slice(0, 10) : ''}"></div>
          <div class="form-group"><label>Used Count</label><input name="usedCount" type="number" min="0" value="${p?.usedCount ?? 0}" ${p ? '' : 'readonly'}></div>
        </div>
        <div class="form-group"><label>Description</label><input name="description" value="${FlexHealth.escapeHtml(p?.description || '')}" placeholder="Shown to customers at checkout"></div>
        <label class="admin-stock-toggle"><input type="checkbox" name="enabled" ${p?.enabled !== false ? 'checked' : ''}><span>Active</span></label>
        <input type="hidden" name="_type" value="promo-code"><input type="hidden" name="_editCode" value="${FlexHealth.escapeHtml(p?.code || '')}">`;
      AdminCMS.openModal(AdminCMS.modalHtml(p ? 'Edit Promo Code' : 'Add Promo Code', body, 'promo-code-form'));
    }).catch(e => FlexHealth.toast(e.message));
  },

  async deleteIndexed(type, index) {
    if (!confirm('Delete this item?')) return;
    try {
      await this.cms(`/${type}/${index}`, { method: 'DELETE' });
      FlexHealth.toast('Deleted');
      AdminPanel.render();
    } catch (e) { FlexHealth.toast(e.message); }
  },

  modalHtml(title, body, formId) {
    return `
      <div class="admin-modal" id="admin-modal">
        <div class="admin-modal__backdrop" data-cms-action="close-modal"></div>
        <div class="admin-modal__dialog">
          <div class="admin-modal__head">
            <h2>${title}</h2>
            <button type="button" class="admin-modal__close" data-cms-action="close-modal">×</button>
          </div>
          <form id="${formId}" class="admin-modal__body" data-cms-form="${formId}">
            ${body}
            <div class="admin-modal__foot">
              <button type="button" class="btn btn--outline" data-cms-action="close-modal">Cancel</button>
              <button type="submit" class="btn btn--primary">Save</button>
            </div>
          </form>
        </div>
      </div>`;
  },

  openModal(html) {
    document.getElementById('admin-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById('admin-modal');
    modal.querySelectorAll('[data-cms-action]').forEach(btn => {
      btn.addEventListener('click', () => this.handleAction(btn.dataset.cmsAction, btn.dataset));
    });
    modal.querySelector('[data-cms-form]')?.addEventListener('submit', e => this.handleFormSubmit(e));
  },

  closeModal() {
    document.getElementById('admin-modal')?.remove();
  },

  productOptions(products, selected) {
    return products.slice(0, 500).map(p =>
      `<option value="${FlexHealth.escapeHtml(p.id)}"${p.id === selected ? ' selected' : ''}>${FlexHealth.escapeHtml(p.name.slice(0, 60))}</option>`
    ).join('');
  },

  categoryOptions(categories, selected) {
    return categories.map(c =>
      `<option value="${FlexHealth.escapeHtml(c.id)}"${c.id === selected ? ' selected' : ''}>${FlexHealth.escapeHtml(c.name)}</option>`
    ).join('');
  },

  brandOptions(brands, selected) {
    return brands.map(b =>
      `<option value="${FlexHealth.escapeHtml(b.id)}"${b.id === selected ? ' selected' : ''}>${FlexHealth.escapeHtml(b.name)}</option>`
    ).join('');
  },

  openProductForm(id) {
    AdminCMS.cms('/').then(({ catalog }) => {
      const p = id ? catalog.products.find(x => x.id === id) : null;
      const body = `
        <div class="admin-form-grid">
          <div class="form-group admin-form-full"><label>Product Name *</label>
            <input name="name" required value="${FlexHealth.escapeHtml(p?.name || '')}"></div>
          <div class="form-group"><label>Product ID</label>
            <input name="id" value="${FlexHealth.escapeHtml(p?.id || '')}" placeholder="auto-generated" ${p ? 'readonly' : ''}></div>
          <div class="form-group"><label>SKU</label>
            <input name="sku" value="${FlexHealth.escapeHtml(p?.sku || '')}"></div>
          <div class="form-group"><label>Brand</label>
            <input name="brand" value="${FlexHealth.escapeHtml(p?.brand || '')}"></div>
          <div class="form-group"><label>Category</label>
            <select name="category">${AdminCMS.categoryOptions(catalog.categories, p?.category)}</select></div>
          <div class="form-group"><label>Price (₹) *</label>
            <input name="price" type="number" required value="${p?.price ?? ''}"></div>
          <div class="form-group"><label>Original Price (₹)</label>
            <input name="originalPrice" type="number" value="${p?.originalPrice ?? ''}"></div>
          <div class="form-group admin-form-full"><label>Image Path</label>
            <input name="image" value="${FlexHealth.escapeHtml(p?.image || 'images/products/placeholder.png')}"></div>
          <div class="form-group admin-form-full"><label>Short Description</label>
            <textarea name="shortDescription" rows="2">${FlexHealth.escapeHtml(p?.shortDescription || '')}</textarea></div>
          <div class="form-group admin-form-full"><label>Full Description</label>
            <textarea name="description" rows="4">${FlexHealth.escapeHtml((p?.description || '').slice(0, 2000))}</textarea></div>
          <div class="form-group admin-form-full"><label>Stock status</label>
            <label class="admin-checkbox-row"><input type="checkbox" name="inStock" ${p?.inStock !== false ? 'checked' : ''}> In stock (uncheck for <strong>Out of Stock</strong>)</label></div>
          <div class="form-group"><label><input type="checkbox" name="isSale" ${p?.isSale ? 'checked' : ''}> On Sale</label></div>
          <div class="form-group"><label><input type="checkbox" name="isNew" ${FlexHealth.isActiveFlag(p?.isNew) ? 'checked' : ''}> New Arrival</label></div>
          <div class="form-group"><label><input type="checkbox" name="isPopular" ${FlexHealth.isActiveFlag(p?.isPopular) ? 'checked' : ''}> Popular</label></div>
        </div>
        <input type="hidden" name="_editId" value="${FlexHealth.escapeHtml(p?.id || '')}">`;
      AdminCMS.openModal(AdminCMS.modalHtml(p ? 'Edit Product' : 'Add Product', body, 'product-form'));
    }).catch(e => FlexHealth.toast(e.message));
  },

  openSimpleForm(type, id) {
    AdminCMS.cms('/').then(({ catalog }) => {
      let body = '';
      if (type === 'category') {
        const c = id ? catalog.categories.find(x => x.id === id) : null;
        body = `
          <div class="form-group"><label>ID</label><input name="id" value="${FlexHealth.escapeHtml(c?.id || '')}" ${c ? 'readonly' : ''}></div>
          <div class="form-group"><label>Name *</label><input name="name" required value="${FlexHealth.escapeHtml(c?.name || '')}"></div>
          <div class="form-group"><label>Icon (emoji)</label><input name="icon" value="${FlexHealth.escapeHtml(c?.icon || '📦')}"></div>
          <div class="form-group"><label>Description</label><textarea name="desc" rows="2">${FlexHealth.escapeHtml(c?.desc || '')}</textarea></div>
          <input type="hidden" name="_type" value="category"><input type="hidden" name="_editId" value="${FlexHealth.escapeHtml(c?.id || '')}">`;
        AdminCMS.openModal(AdminCMS.modalHtml(c ? 'Edit Category' : 'Add Category', body, 'simple-form'));
      } else {
        const b = id ? catalog.brands.find(x => x.id === id) : null;
        body = `
          <div class="form-group"><label>ID</label><input name="id" value="${FlexHealth.escapeHtml(b?.id || '')}" ${b ? 'readonly' : ''}></div>
          <div class="form-group"><label>Name *</label><input name="name" required value="${FlexHealth.escapeHtml(b?.name || '')}"></div>
          <div class="form-group"><label>Logo Path</label><input name="logo" value="${FlexHealth.escapeHtml(b?.logo || '')}"></div>
          <div class="form-group"><label>Categories (comma IDs)</label><input name="categories" value="${FlexHealth.escapeHtml((b?.categories || []).join(', '))}"></div>
          <input type="hidden" name="_type" value="brand"><input type="hidden" name="_editId" value="${FlexHealth.escapeHtml(b?.id || '')}">`;
        AdminCMS.openModal(AdminCMS.modalHtml(b ? 'Edit Brand' : 'Add Brand', body, 'simple-form'));
      }
    }).catch(e => FlexHealth.toast(e.message));
  },

  openBannerForm(index) {
    AdminCMS.cms('/').then(({ catalog }) => {
      const b = index != null ? catalog.banners[index] : null;
      const body = `
        <div class="form-group"><label>Tag</label><input name="tag" value="${FlexHealth.escapeHtml(b?.tag || 'Flex Health')}"></div>
        <div class="form-group"><label>Title *</label><input name="title" required value="${FlexHealth.escapeHtml(b?.title || '')}"></div>
        <div class="form-group"><label>Subtitle</label><textarea name="subtitle" rows="2">${FlexHealth.escapeHtml(b?.subtitle || '')}</textarea></div>
        <div class="form-group"><label>CTA Button</label><input name="cta" value="${FlexHealth.escapeHtml(b?.cta || 'Shop Now')}"></div>
        <div class="form-group"><label>Link URL</label><input name="link" value="${FlexHealth.escapeHtml(b?.link || 'shop.html')}"></div>
        <div class="form-group"><label>Background Image</label><input name="image" value="${FlexHealth.escapeHtml(b?.image || 'images/banners/hero-1.jpg')}"></div>
        <input type="hidden" name="_type" value="banner"><input type="hidden" name="_index" value="${index ?? ''}">`;
      AdminCMS.openModal(AdminCMS.modalHtml(b ? 'Edit Hero Banner' : 'Add Hero Banner', body, 'simple-form'));
    }).catch(e => FlexHealth.toast(e.message));
  },

  openOfferForm(index) {
    AdminCMS.cms('/').then(({ catalog }) => {
      const o = index != null ? catalog.offerBanners[index] : null;
      const body = `
        <div class="form-group"><label>Product *</label>
          <select name="productId" required>${AdminCMS.productOptions(catalog.products, o?.productId)}</select></div>
        <div class="form-group"><label>Theme</label>
          <select name="theme">
            ${['default','flex','rebel','muscletech'].map(t => `<option value="${t}"${o?.theme === t ? ' selected' : ''}>${t}</option>`).join('')}
          </select></div>
        <div class="form-group"><label>Tag</label><input name="tag" value="${FlexHealth.escapeHtml(o?.tag || 'Special Offer')}"></div>
        <div class="form-group"><label>Headline</label><input name="headline" value="${FlexHealth.escapeHtml(o?.headline || '')}"></div>
        <div class="form-group"><label>Subline</label><input name="subline" value="${FlexHealth.escapeHtml(o?.subline || '')}"></div>
        <input type="hidden" name="_type" value="offer"><input type="hidden" name="_index" value="${index ?? ''}">`;
      AdminCMS.openModal(AdminCMS.modalHtml(o ? 'Edit Offer Banner' : 'Add Offer Banner', body, 'simple-form'));
    }).catch(e => FlexHealth.toast(e.message));
  },

  openPromoForm(index) {
    AdminCMS.cms('/').then(({ catalog }) => {
      const s = index != null ? catalog.promoSlides[index] : null;
      const types = ['daily','weekly','combo','mega','weekend'];
      const body = `
        <div class="form-group"><label>Product *</label>
          <select name="productId" required>${AdminCMS.productOptions(catalog.products, s?.productId)}</select></div>
        <div class="form-group"><label>Type</label>
          <select name="type">${types.map(t => `<option value="${t}"${s?.type === t ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="form-group"><label>Label</label><input name="label" value="${FlexHealth.escapeHtml(s?.label || 'Special Offer')}"></div>
        <div class="form-group"><label>Headline</label><input name="headline" value="${FlexHealth.escapeHtml(s?.headline || '')}"></div>
        <div class="form-group"><label>Subline</label><input name="subline" value="${FlexHealth.escapeHtml(s?.subline || '')}"></div>
        <input type="hidden" name="_type" value="promo"><input type="hidden" name="_index" value="${index ?? ''}">`;
      AdminCMS.openModal(AdminCMS.modalHtml(s ? 'Edit Promo Slide' : 'Add Promo Slide', body, 'simple-form'));
    }).catch(e => FlexHealth.toast(e.message));
  },

  openReviewForm(index) {
    AdminCMS.cms('/').then(({ catalog }) => {
      const r = index != null ? catalog.reviews[index] : null;
      const body = `
        <div class="form-group"><label>Name *</label><input name="name" required value="${FlexHealth.escapeHtml(r?.name || '')}"></div>
        <div class="form-group"><label>Rating (1-5)</label><input name="rating" type="number" min="1" max="5" value="${r?.rating ?? 5}"></div>
        <div class="form-group"><label>Review Text *</label><textarea name="text" rows="4" required>${FlexHealth.escapeHtml(r?.text || '')}</textarea></div>
        <input type="hidden" name="_type" value="review"><input type="hidden" name="_index" value="${index ?? ''}">`;
      AdminCMS.openModal(AdminCMS.modalHtml(r ? 'Edit Testimonial' : 'Add Testimonial', body, 'simple-form'));
    }).catch(e => FlexHealth.toast(e.message));
  },

  async handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const d = Object.fromEntries(fd.entries());
    try {
      if (form.id === 'product-form') {
        const body = {
          name: d.name,
          id: d.id || undefined,
          sku: d.sku,
          brand: d.brand,
          category: d.category,
          price: +d.price,
          originalPrice: d.originalPrice ? +d.originalPrice : null,
          image: d.image,
          shortDescription: d.shortDescription,
          description: d.description,
          inStock: !!fd.get('inStock'),
          isSale: !!fd.get('isSale'),
          isNew: !!fd.get('isNew'),
          isPopular: !!fd.get('isPopular')
        };
        if (d._editId) {
          await AdminCMS.cms('/products/' + encodeURIComponent(d._editId), { method: 'PUT', body });
        } else {
          await AdminCMS.cms('/products', { method: 'POST', body });
        }
      } else if (d._type === 'category') {
        const body = { id: d.id || undefined, name: d.name, icon: d.icon, desc: d.desc };
        if (d._editId) await AdminCMS.cms('/categories/' + encodeURIComponent(d._editId), { method: 'PUT', body });
        else await AdminCMS.cms('/categories', { method: 'POST', body });
      } else if (d._type === 'brand') {
        const body = {
          id: d.id || undefined,
          name: d.name,
          logo: d.logo,
          categories: d.categories ? d.categories.split(',').map(s => s.trim()).filter(Boolean) : []
        };
        if (d._editId) await AdminCMS.cms('/brands/' + encodeURIComponent(d._editId), { method: 'PUT', body });
        else await AdminCMS.cms('/brands', { method: 'POST', body });
      } else if (d._type === 'banner') {
        const body = { tag: d.tag, title: d.title, subtitle: d.subtitle, cta: d.cta, link: d.link, image: d.image };
        if (d._index !== '') await AdminCMS.cms('/banners/' + d._index, { method: 'PUT', body });
        else await AdminCMS.cms('/banners', { method: 'POST', body });
      } else if (d._type === 'offer') {
        const body = { productId: d.productId, theme: d.theme, tag: d.tag, headline: d.headline, subline: d.subline };
        if (d._index !== '') await AdminCMS.cms('/offer-banners/' + d._index, { method: 'PUT', body });
        else await AdminCMS.cms('/offer-banners', { method: 'POST', body });
      } else if (d._type === 'promo') {
        const body = { productId: d.productId, type: d.type, label: d.label, headline: d.headline, subline: d.subline };
        if (d._index !== '') await AdminCMS.cms('/promo-slides/' + d._index, { method: 'PUT', body });
        else await AdminCMS.cms('/promo-slides', { method: 'POST', body });
      } else if (d._type === 'review') {
        const body = { name: d.name, text: d.text, rating: +d.rating || 5 };
        if (d._index !== '') await AdminCMS.cms('/reviews/' + d._index, { method: 'PUT', body });
        else await AdminCMS.cms('/reviews', { method: 'POST', body });
      } else if (d._type === 'promo-code') {
        const body = {
          code: d.code,
          type: d.type,
          value: +d.value,
          minOrder: d.minOrder !== '' ? +d.minOrder : 0,
          maxDiscount: d.maxDiscount !== '' ? +d.maxDiscount : null,
          maxUses: d.maxUses !== '' ? +d.maxUses : null,
          usedCount: +d.usedCount || 0,
          expiresAt: d.expiresAt || null,
          enabled: !!fd.get('enabled'),
          description: d.description || ''
        };
        if (d._editCode) {
          await AdminCMS.cms('/promo-codes/' + encodeURIComponent(d._editCode), { method: 'PUT', body });
        } else {
          await AdminCMS.cms('/promo-codes', { method: 'POST', body });
        }
      } else if (form.id === 'site-settings-form') {
        const stats = [0, 1, 2, 3].map(i => ({
          num: d['stat_num_' + i],
          label: d['stat_label_' + i]
        }));
        const trustBar = [0, 1, 2, 3].map(i => ({
          icon: d['trust_icon_' + i],
          title: d['trust_title_' + i],
          subtitle: d['trust_sub_' + i]
        }));
        await AdminCMS.cms('/site-settings', {
          method: 'PUT',
          body: {
            stats,
            trustBar,
            featuredLimits: {
              popular: +d.limit_popular || 8,
              sale: +d.limit_sale || 4,
              newArrivals: +d.limit_new || 4
            },
            whatsapp: {
              enabled: !!fd.get('whatsapp_enabled'),
              phone: d.whatsapp_phone || '919246501017',
              message: d.whatsapp_message || 'Hi, I need help with Flex Health products.'
            }
          }
        });
      }
      FlexHealth.toast('Saved successfully');
      AdminCMS.closeModal();
      AdminPanel.render();
    } catch (err) {
      FlexHealth.toast(err.message);
    }
  },

  toolbar(title, addAction, addLabel) {
    return `
      <div class="admin-toolbar admin-toolbar--between">
        <div><strong>${title}</strong></div>
        <button type="button" class="btn btn--primary btn--sm" data-cms-action="${addAction}">+ ${addLabel}</button>
      </div>`;
  },

  rowActions(editAction, editData, deleteAction, deleteData) {
    return `
      <div class="admin-row-actions">
        <button type="button" class="btn btn--outline btn--sm" data-cms-action="${editAction}" ${editData}>Edit</button>
        <button type="button" class="btn btn--outline btn--sm admin-btn-danger" data-cms-action="${deleteAction}" ${deleteData}>Delete</button>
      </div>`;
  }
};

// ── Panel definitions ──
AdminCMS.panels.products = function (data) {
  const q = AdminPanel.productSearch.trim().toLowerCase();
  const stockFilter = AdminPanel.productStockFilter || 'all';
  let list = data.products;
  if (stockFilter === 'in') list = list.filter(p => p.inStock !== false);
  if (stockFilter === 'out') list = list.filter(p => p.inStock === false);
  if (q) {
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q));
  } else {
    list = list.slice(0, 80);
  }
  const needsBackend = !FlexHealth.apiEnabled;
  return `
    ${needsBackend ? '<div class="admin-note admin-note--warn">⚠ CMS editing requires backend — start server with npm start</div>' : ''}
    ${AdminCMS.toolbar('Product Catalog', 'add-product', 'Add Product')}
    <div class="admin-toolbar admin-toolbar--between">
      <div class="admin-search"><input type="search" data-product-search placeholder="Search products…" value="${FlexHealth.escapeHtml(AdminPanel.productSearch)}"></div>
      <select data-stock-filter class="admin-select">
        <option value="all"${stockFilter === 'all' ? ' selected' : ''}>All stock</option>
        <option value="in"${stockFilter === 'in' ? ' selected' : ''}>In stock</option>
        <option value="out"${stockFilter === 'out' ? ' selected' : ''}>Out of stock</option>
      </select>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th></th><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Flags</th><th></th></tr></thead>
        <tbody>
          ${list.map(p => `
            <tr class="${p.inStock === false ? 'admin-row--oos' : ''}">
              <td class="admin-table__thumb"><img src="${FlexHealth.escapeHtml(p.image || '')}" alt="" loading="lazy"></td>
              <td><strong>${FlexHealth.escapeHtml(p.name.slice(0, 55))}${p.name.length > 55 ? '…' : ''}</strong><br><small>${FlexHealth.escapeHtml(p.id)}</small></td>
              <td>${FlexHealth.escapeHtml(p.brand || '—')}</td>
              <td>${FlexHealth.escapeHtml(p.category || '—')}</td>
              <td><strong>${FlexHealth.formatPrice(p.price)}</strong></td>
              <td>
                ${FlexHealth.apiEnabled
                  ? `<label class="admin-stock-toggle"><input type="checkbox" data-stock-toggle data-id="${FlexHealth.escapeHtml(p.id)}" ${p.inStock !== false ? 'checked' : ''}><span>${p.inStock !== false ? 'In stock' : 'Out of stock'}</span></label>`
                  : (p.inStock !== false ? '<span class="admin-flag admin-flag--stock">In stock</span>' : '<span class="admin-flag admin-flag--oos">Out of stock</span>')}
              </td>
              <td class="admin-flags">${p.isSale ? '<span class="admin-flag">Sale</span>' : ''}${FlexHealth.isActiveFlag(p.isPopular) ? '<span class="admin-flag">Popular</span>' : ''}${FlexHealth.isActiveFlag(p.isNew) ? '<span class="admin-flag admin-flag--new">New</span>' : ''}</td>
              <td>${FlexHealth.apiEnabled ? AdminCMS.rowActions('edit-product', `data-id="${FlexHealth.escapeHtml(p.id)}"`, 'delete-product', `data-id="${FlexHealth.escapeHtml(p.id)}"`) : `<a href="product.html?id=${encodeURIComponent(p.id)}" class="btn btn--outline btn--sm" target="_blank">View</a>`}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${data.products.length > 80 && !q && stockFilter === 'all' ? '<p class="admin-table-foot">Showing 80 products — search or filter to find more.</p>' : ''}`;
};

AdminCMS.panels.categories = function (data) {
  return `
    ${AdminCMS.toolbar('Shop Categories', 'add-category', 'Add Category')}
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Icon</th><th>Name</th><th>ID</th><th>Description</th><th></th></tr></thead>
        <tbody>
          ${data.categories.map(c => `
            <tr>
              <td style="font-size:1.5rem">${c.icon || '📦'}</td>
              <td><strong>${FlexHealth.escapeHtml(c.name)}</strong></td>
              <td><code>${FlexHealth.escapeHtml(c.id)}</code></td>
              <td>${FlexHealth.escapeHtml(c.desc || '—')}</td>
              <td>${FlexHealth.apiEnabled ? AdminCMS.rowActions('edit-category', `data-id="${FlexHealth.escapeHtml(c.id)}"`, 'delete-category', `data-id="${FlexHealth.escapeHtml(c.id)}"`) : ''}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
};

AdminCMS.panels.brands = function (data) {
  return `
    ${AdminCMS.toolbar('Brands', 'add-brand', 'Add Brand')}
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Logo</th><th>Name</th><th>ID</th><th>Categories</th><th></th></tr></thead>
        <tbody>
          ${data.brands.map(b => `
            <tr>
              <td class="admin-table__thumb">${b.logo ? `<img src="${FlexHealth.escapeHtml(b.logo)}" alt="">` : '—'}</td>
              <td><strong>${FlexHealth.escapeHtml(b.name)}</strong></td>
              <td><code>${FlexHealth.escapeHtml(b.id)}</code></td>
              <td><small>${FlexHealth.escapeHtml((b.categories || []).join(', '))}</small></td>
              <td>${FlexHealth.apiEnabled ? AdminCMS.rowActions('edit-brand', `data-id="${FlexHealth.escapeHtml(b.id)}"`, 'delete-brand', `data-id="${FlexHealth.escapeHtml(b.id)}"`) : ''}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
};

AdminCMS.panels.featured = function (data) {
  const flagged = data.products.filter(p =>
    FlexHealth.isActiveFlag(p.isPopular) || FlexHealth.isActiveFlag(p.isSale) || FlexHealth.isActiveFlag(p.isNew)
  ).slice(0, 100);
  return `
    <div class="admin-note">Toggle flags to control which products appear in <strong>Popular</strong>, <strong>Flash Sale</strong> and <strong>New Arrivals</strong> on the homepage.</div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Product</th><th>Popular</th><th>Sale</th><th>New</th></tr></thead>
        <tbody>
          ${flagged.length ? flagged.map(p => `
            <tr>
              <td><strong>${FlexHealth.escapeHtml(p.name.slice(0, 50))}…</strong></td>
              <td><input type="checkbox" data-feature-toggle data-field="isPopular" data-id="${FlexHealth.escapeHtml(p.id)}" ${FlexHealth.isActiveFlag(p.isPopular) ? 'checked' : ''} ${FlexHealth.apiEnabled ? '' : 'disabled'}></td>
              <td><input type="checkbox" data-feature-toggle data-field="isSale" data-id="${FlexHealth.escapeHtml(p.id)}" ${p.isSale ? 'checked' : ''} ${FlexHealth.apiEnabled ? '' : 'disabled'}></td>
              <td><input type="checkbox" data-feature-toggle data-field="isNew" data-id="${FlexHealth.escapeHtml(p.id)}" ${FlexHealth.isActiveFlag(p.isNew) ? 'checked' : ''} ${FlexHealth.apiEnabled ? '' : 'disabled'}></td>
            </tr>`).join('') : '<tr><td colspan="4" class="admin-empty-cell">No featured products — edit products to set flags</td></tr>'}
        </tbody>
      </table>
    </div>
    <p class="admin-table-foot">Edit any product to add it to featured sections, or use checkboxes above.</p>`;
};

AdminCMS.panels['hero-banners'] = function (data) {
  return `
    ${AdminCMS.toolbar('Homepage Hero Slider', 'add-banner', 'Add Slide')}
    <div class="admin-cms-cards">
      ${data.banners.map((b, i) => `
        <article class="admin-cms-card">
          <div class="admin-cms-card__img" style="background-image:url('${FlexHealth.escapeHtml(b.image)}')"></div>
          <div class="admin-cms-card__body">
            <span class="admin-cms-card__tag">${FlexHealth.escapeHtml(b.tag || '')}</span>
            <h3>${FlexHealth.escapeHtml(b.title)}</h3>
            <p>${FlexHealth.escapeHtml(b.subtitle || '')}</p>
            <small>${FlexHealth.escapeHtml(b.link)} · ${FlexHealth.escapeHtml(b.cta)}</small>
            ${FlexHealth.apiEnabled ? AdminCMS.rowActions('edit-banner', `data-index="${i}"`, 'delete-banner', `data-index="${i}"`) : ''}
          </div>
        </article>`).join('') || '<div class="admin-empty">No hero banners</div>'}
    </div>`;
};

AdminCMS.panels['offer-banners'] = function (data) {
  const productName = id => data.products.find(p => p.id === id)?.name?.slice(0, 40) || id;
  return `
    ${AdminCMS.toolbar('Featured Offer Banners', 'add-offer', 'Add Offer')}
    <div class="admin-cms-cards admin-cms-cards--compact">
      ${data.offerBanners.map((o, i) => `
        <article class="admin-cms-card admin-cms-card--row">
          <div class="admin-cms-card__body">
            <span class="admin-cms-card__tag">${FlexHealth.escapeHtml(o.tag)} · ${FlexHealth.escapeHtml(o.theme)}</span>
            <h3>${FlexHealth.escapeHtml(o.headline || productName(o.productId))}</h3>
            <p>${FlexHealth.escapeHtml(o.subline || '')}</p>
            <small>Product: ${FlexHealth.escapeHtml(productName(o.productId))}</small>
            ${FlexHealth.apiEnabled ? AdminCMS.rowActions('edit-offer', `data-index="${i}"`, 'delete-offer', `data-index="${i}"`) : ''}
          </div>
        </article>`).join('') || '<div class="admin-empty">No offer banners</div>'}
    </div>`;
};

AdminCMS.panels['promo-slides'] = function (data) {
  const productName = id => data.products.find(p => p.id === id)?.name?.slice(0, 40) || id;
  return `
    ${AdminCMS.toolbar('Promo Offer Slider', 'add-promo', 'Add Slide')}
    <div class="admin-cms-cards admin-cms-cards--compact">
      ${data.promoSlides.map((s, i) => `
        <article class="admin-cms-card admin-cms-card--row">
          <div class="admin-cms-card__body">
            <span class="admin-cms-card__tag">${FlexHealth.escapeHtml(s.label)} · ${FlexHealth.escapeHtml(s.type)}</span>
            <h3>${FlexHealth.escapeHtml(s.headline || productName(s.productId))}</h3>
            <p>${FlexHealth.escapeHtml(s.subline || '')}</p>
            <small>Product: ${FlexHealth.escapeHtml(productName(s.productId))}</small>
            ${FlexHealth.apiEnabled ? AdminCMS.rowActions('edit-promo', `data-index="${i}"`, 'delete-promo', `data-index="${i}"`) : ''}
          </div>
        </article>`).join('') || '<div class="admin-empty">No promo slides</div>'}
    </div>`;
};

AdminCMS.panels['promo-codes'] = function (data) {
  const promos = data.promoCodes || [];
  const discountLabel = p => p.type === 'fixed' ? `₹${p.value} off` : `${p.value}% off`;
  return `
    ${AdminCMS.toolbar('Checkout Promo Codes', 'add-promo-code', 'Add Code')}
    ${!FlexHealth.apiEnabled ? '<p class="admin-note admin-note--warn">Start the backend to create or edit promo codes.</p>' : ''}
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount</th>
            <th>Min Order</th>
            <th>Uses</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${promos.map(p => `
            <tr>
              <td><strong>${FlexHealth.escapeHtml(p.code)}</strong><br><small>${FlexHealth.escapeHtml(p.description || '')}</small></td>
              <td>${FlexHealth.escapeHtml(discountLabel(p))}${p.maxDiscount ? `<br><small>Max ₹${p.maxDiscount}</small>` : ''}</td>
              <td>${p.minOrder ? FlexHealth.formatPrice(p.minOrder) : '—'}</td>
              <td>${p.usedCount || 0}${p.maxUses != null && p.maxUses !== '' ? ` / ${p.maxUses}` : ''}</td>
              <td><span class="admin-status-badge admin-status-badge--${p.enabled !== false ? 'live' : 'offline'}">${p.enabled !== false ? 'Active' : 'Disabled'}</span></td>
              <td>${FlexHealth.apiEnabled ? AdminCMS.rowActions('edit-promo-code', `data-code="${FlexHealth.escapeHtml(p.code)}"`, 'delete-promo-code', `data-code="${FlexHealth.escapeHtml(p.code)}"`) : ''}</td>
            </tr>`).join('') || '<tr><td colspan="6"><div class="admin-empty">No promo codes yet</div></td></tr>'}
        </tbody>
      </table>
    </div>`;
};

AdminCMS.panels.testimonials = function (data) {
  return `
    ${AdminCMS.toolbar('Homepage Testimonials', 'add-review', 'Add Review')}
    ${data.homepageReviews.map((r, i) => `
      <article class="admin-message-card">
        <div class="admin-message-card__head">
          <div><strong>${FlexHealth.escapeHtml(r.name)}</strong> · ${'★'.repeat(r.rating || 5)}</div>
          ${FlexHealth.apiEnabled ? AdminCMS.rowActions('edit-review', `data-index="${i}"`, 'delete-review', `data-index="${i}"`) : ''}
        </div>
        <p>${FlexHealth.escapeHtml(r.text)}</p>
      </article>`).join('') || '<div class="admin-empty">No testimonials</div>'}`;
};

AdminCMS.panels['site-settings'] = function (data) {
  const s = data.siteSettings || {
    stats: [{ num: '473+', label: 'Products' }, { num: '14+', label: 'Top Brands' }, { num: '20K+', label: 'Happy Customers' }, { num: '2005', label: 'Trusted Since' }],
    trustBar: [
      { icon: '🚚', title: 'Free Shipping', subtitle: 'All India Delivery' },
      { icon: '💰', title: 'Cash on Delivery', subtitle: 'Pay When You Receive' },
      { icon: '📦', title: 'Safe Packaging', subtitle: 'Secure & Protected' },
      { icon: '🛡️', title: '100% Genuine', subtitle: 'Lab Tested Products' }
    ],
    featuredLimits: { popular: 8, sale: 4, newArrivals: 4 },
    whatsapp: { enabled: true, phone: '919246501017', message: 'Hi, I need help with Flex Health products.' }
  };
  const limits = s.featuredLimits || {};
  const wa = s.whatsapp || { enabled: true, phone: '919246501017', message: 'Hi, I need help with Flex Health products.' };
  return `
    <form id="site-settings-form" class="admin-panel" data-cms-form="site-settings-form">
      <h3>Stats Bar (below hero)</h3>
      <div class="admin-form-grid admin-form-grid--4">
        ${(s.stats || []).slice(0, 4).concat(Array(Math.max(0, 4 - (s.stats?.length || 0))).fill({ num: '', label: '' })).slice(0, 4).map((st, i) => `
          <div class="form-group"><label>Stat ${i + 1} Number</label><input name="stat_num_${i}" value="${FlexHealth.escapeHtml(st.num || '')}"></div>
          <div class="form-group"><label>Stat ${i + 1} Label</label><input name="stat_label_${i}" value="${FlexHealth.escapeHtml(st.label || '')}"></div>`).join('')}
      </div>
      <h3 style="margin-top:24px">Trust Bar</h3>
      ${(s.trustBar || []).slice(0, 4).concat(Array(Math.max(0, 4 - (s.trustBar?.length || 0))).fill({ icon: '', title: '', subtitle: '' })).slice(0, 4).map((t, i) => `
        <div class="admin-form-grid admin-form-grid--4" style="margin-bottom:12px">
          <div class="form-group"><label>Icon</label><input name="trust_icon_${i}" value="${FlexHealth.escapeHtml(t.icon || '')}"></div>
          <div class="form-group"><label>Title</label><input name="trust_title_${i}" value="${FlexHealth.escapeHtml(t.title || '')}"></div>
          <div class="form-group admin-form-span-2"><label>Subtitle</label><input name="trust_sub_${i}" value="${FlexHealth.escapeHtml(t.subtitle || '')}"></div>
        </div>`).join('')}
      <h3 style="margin-top:24px">Featured Section Limits</h3>
      <div class="admin-form-grid admin-form-grid--3">
        <div class="form-group"><label>Popular products shown</label><input name="limit_popular" type="number" value="${limits.popular || 8}"></div>
        <div class="form-group"><label>Flash sale shown</label><input name="limit_sale" type="number" value="${limits.sale || 4}"></div>
        <div class="form-group"><label>New arrivals shown</label><input name="limit_new" type="number" value="${limits.newArrivals || 4}"></div>
      </div>
      <h3 style="margin-top:24px">WhatsApp Chat Button</h3>
      <p class="admin-note" style="margin-bottom:16px">Floating support button shown on all storefront pages (bottom-left).</p>
      <label class="admin-stock-toggle" style="margin-bottom:16px">
        <input type="checkbox" name="whatsapp_enabled" ${wa.enabled !== false ? 'checked' : ''}>
        <span>Show WhatsApp button on storefront</span>
      </label>
      <div class="admin-form-grid admin-form-grid--2">
        <div class="form-group">
          <label>WhatsApp Number</label>
          <input name="whatsapp_phone" type="tel" value="${FlexHealth.escapeHtml(wa.phone || '919246501017')}" placeholder="919246501017">
          <small class="form-hint">Country code + number, no spaces (e.g. 919246501017)</small>
        </div>
        <div class="form-group">
          <label>Default Message</label>
          <input name="whatsapp_message" value="${FlexHealth.escapeHtml(wa.message || 'Hi, I need help with Flex Health products.')}">
        </div>
      </div>
      ${FlexHealth.apiEnabled ? '<button type="submit" class="btn btn--primary" style="margin-top:20px">Save Homepage Settings</button>' : '<p class="admin-note admin-note--warn">Backend required to save</p>'}
    </form>`;
};
