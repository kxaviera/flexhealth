import fs from 'fs';
import path from 'path';
import { ROOT } from './db.js';

const FILE = path.join(ROOT, 'data', 'verification-codes.json');

export function normalizeCode(raw) {
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

  return code.replace(/^FH[-:\s]*/i, '').trim().toUpperCase();
}

function readFile() {
  try {
    if (!fs.existsSync(FILE)) return [];
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(data.codes) ? data.codes.map(normalizeCode).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeFile(codes) {
  const unique = [...new Set(codes.map(normalizeCode).filter(Boolean))];
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify({ codes: unique }, null, 2), 'utf8');
  return unique;
}

export function loadVerificationCodes() {
  return readFile();
}

export function saveVerificationCodes(codes) {
  return writeFile(codes);
}

export function listVerificationCodes(limit = 500) {
  return loadVerificationCodes()
    .slice(0, limit)
    .map(code => ({ code }));
}

export function addVerificationCode(raw) {
  const code = normalizeCode(raw);
  if (!code) throw new Error('Code required');

  const codes = loadVerificationCodes();
  if (codes.includes(code)) throw new Error('Code already exists');

  codes.unshift(code);
  writeFile(codes);
  return { code };
}

export function deleteVerificationCode(raw) {
  const code = normalizeCode(raw);
  const before = loadVerificationCodes();
  const next = before.filter(c => c !== code);
  if (next.length === before.length) return false;
  writeFile(next);
  return true;
}

export function isVerificationCodeValid(raw) {
  const code = normalizeCode(raw);
  return !!code && loadVerificationCodes().includes(code);
}

export function mergeVerificationCodes(incoming) {
  const merged = writeFile([...incoming, ...loadVerificationCodes()]);
  if (!merged.length) writeFile(['DEMO001', 'DEMO002', 'TEST1234']);
}
