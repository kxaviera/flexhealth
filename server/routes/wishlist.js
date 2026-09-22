import { Router } from 'express';
import { getDb } from '../db.js';
import { authUser } from '../middleware/auth.js';

const router = Router();

router.get('/', authUser, (req, res) => {
  const rows = getDb().prepare(`
    SELECT product_id FROM wishlist WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.sub);
  res.json({ ok: true, items: rows.map(r => r.product_id) });
});

router.post('/:productId', authUser, (req, res) => {
  const now = new Date().toISOString();
  getDb().prepare(`
    INSERT OR IGNORE INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, ?)
  `).run(req.user.sub, req.params.productId, now);
  res.json({ ok: true });
});

router.delete('/:productId', authUser, (req, res) => {
  getDb().prepare(`
    DELETE FROM wishlist WHERE user_id = ? AND product_id = ?
  `).run(req.user.sub, req.params.productId);
  res.json({ ok: true });
});

router.post('/:productId/toggle', authUser, (req, res) => {
  const existing = getDb().prepare(`
    SELECT 1 FROM wishlist WHERE user_id = ? AND product_id = ?
  `).get(req.user.sub, req.params.productId);
  if (existing) {
    getDb().prepare(`DELETE FROM wishlist WHERE user_id = ? AND product_id = ?`).run(
      req.user.sub, req.params.productId
    );
    return res.json({ ok: true, added: false });
  }
  getDb().prepare(`
    INSERT INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, ?)
  `).run(req.user.sub, req.params.productId, new Date().toISOString());
  res.json({ ok: true, added: true });
});

export default router;
