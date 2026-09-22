import { isTestMode } from './config.js';

export function isSmsEnabled() {
  return !!(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID);
}

export async function sendOtpSms(phone, otp) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authKey || !templateId) {
    if (isTestMode()) return { ok: true, skipped: true };
    throw new Error('SMS OTP is not configured. Set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID in server/.env');
  }

  const mobile = phone.length === 10 ? `91${phone}` : phone.replace(/\D/g, '');

  const res = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: {
      authkey: authKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template_id: templateId,
      mobile,
      otp: String(otp),
      otp_length: 6
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.type === 'error') {
    console.error('MSG91 error:', data);
    throw new Error(data.message || 'Could not send OTP SMS. Please try again.');
  }

  return { ok: true };
}
