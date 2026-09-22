import { Router } from 'express';
import { getDb } from '../db.js';
import { authUser } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', (req, res) => {
  const reviews = getDb().prepare(`
    SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC
  `).all(req.params.productId);

  res.json({
    ok: true,
    reviews: reviews.map(r => ({
      id: r.id,
      productId: r.product_id,
      userId: r.user_id,
      userName: r.user_name,
      rating: r.rating,
      text: r.text,
      date: r.created_at
    }))
  });
});

router.get('/my', authUser, (req, res) => {
  const reviews = getDb().prepare(`
    SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.sub);
  res.json({
    ok: true,
    reviews: reviews.map(r => ({
      id: r.id,
      productId: r.product_id,
      userId: r.user_id,
      userName: r.user_name,
      rating: r.rating,
      text: r.text,
      date: r.created_at
    }))
  });
});

router.post('/', authUser, (req, res) => {
  const { productId, rating, text } = req.body;
  if (!productId || !rating || !text?.trim()) {
    return res.status(400).json({ ok: false, msg: 'Missing review data' });
  }

  const ratingNum = Math.min(5, Math.max(1, parseInt(rating, 10) || 0));
  if (ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ ok: false, msg: 'Rating must be between 1 and 5' });
  }

  const reviewText = text.trim().slice(0, 2000);

  const hasOrder = getDb().prepare(`
    SELECT o.id FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ? AND o.status = 'delivered' AND oi.product_id = ?
    LIMIT 1
  `).get(req.user.sub, productId);

  if (!hasOrder) {
    return res.status(403).json({ ok: false, msg: 'Reviews unlock after delivery.' });
  }

  const existing = getDb().prepare(`
    SELECT id FROM reviews WHERE user_id = ? AND product_id = ?
  `).get(req.user.sub, productId);
  if (existing) {
    return res.status(409).json({ ok: false, msg: 'You already reviewed this product.' });
  }

  const user = getDb().prepare('SELECT name FROM users WHERE id = ?').get(req.user.sub);
  const id = 'r' + Date.now();
  const now = new Date().toISOString();

  getDb().prepare(`
    INSERT INTO reviews (id, user_id, product_id, rating, text, user_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.sub, productId, ratingNum, reviewText, user.name, now);

  res.json({ ok: true, review: { id, productId, rating: ratingNum, text: reviewText, date: now, userName: user.name } });
});

export default router;
