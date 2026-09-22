import { Router } from 'express';
import { loadCatalog } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(loadCatalog());
});

router.get('/products/:id', (req, res) => {
  const catalog = loadCatalog();
  const product = catalog.products?.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) return res.status(404).json({ ok: false, msg: 'Product not found' });
  res.json({ ok: true, product });
});

export default router;
