import { Router } from 'express';
import { loadCatalog } from '../db.js';
import { validatePromo } from '../promo.js';

const router = Router();

router.post('/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ ok: false, msg: 'Promo code required' });
  const amount = Number(subtotal) || 0;
  if (amount <= 0) return res.status(400).json({ ok: false, msg: 'Cart is empty' });

  const catalog = loadCatalog();
  const result = validatePromo(catalog, code, amount);
  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

export default router;
