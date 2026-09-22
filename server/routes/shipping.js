import { Router } from 'express';
import { checkServiceability as checkDelhivery, getDelhiveryConfig } from '../delhivery.js';
import {
  checkShiprocketServiceability,
  getShiprocketConfig,
  isShiprocketEnabled
} from '../shiprocket.js';

const router = Router();

router.get('/config', (_req, res) => {
  const shiprocket = getShiprocketConfig();
  const delhivery = getDelhiveryConfig();
  res.json({
    ok: true,
    provider: shiprocket.enabled ? 'shiprocket' : (delhivery.enabled ? 'delhivery' : 'fallback'),
    shiprocket,
    delhivery
  });
});

router.get('/serviceability', async (req, res) => {
  const pincode = String(req.query.pincode || '').replace(/\D/g, '');
  if (pincode.length !== 6) {
    return res.status(400).json({ ok: false, msg: 'Valid 6-digit pincode required' });
  }
  try {
    const cod = req.query.cod !== '0';
    const weight = Number(req.query.weight || 0.5);
    const declaredValue = Number(req.query.value || req.query.declared_value || 0);

    if (isShiprocketEnabled()) {
      const result = await checkShiprocketServiceability(pincode, { cod, weight, declaredValue });
      return res.json(result);
    }

    const result = await checkDelhivery(pincode, { cod, weight });
    res.json(result);
  } catch (e) {
    res.status(502).json({ ok: false, msg: e.message || 'Could not check delivery' });
  }
});

export default router;
