import { Router } from 'express';
import { verifyProductCode } from '../verify.js';

const router = Router();

router.post('/', (req, res) => {
  const { code } = req.body;
  res.json(verifyProductCode(code));
});

router.get('/', (req, res) => {
  const code = req.query.code || req.query.c;
  if (!code) return res.status(400).json({ ok: false, msg: 'Code required' });
  res.json(verifyProductCode(code));
});

export default router;
