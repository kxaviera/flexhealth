import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'flexhealth.db');
const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD;

if (!password || password === 'CHANGE_ME_TO_A_STRONG_PASSWORD') {
  console.error('Set ADMIN_PASSWORD in server/.env before running this script.');
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
const hash = bcrypt.hashSync(password, 10);
const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);

if (existing) {
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(hash, username);
  console.log(`Updated password for admin user: ${username}`);
} else {
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, hash);
  console.log(`Created admin user: ${username}`);
}
