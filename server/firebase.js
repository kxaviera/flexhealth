import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let admin = null;
let initialized = false;

export function isFirebaseEnabled() {
  return initialized;
}

export async function initFirebaseAdmin() {
  if (initialized) return true;

  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    || path.join(__dirname, 'firebase-service-account.json');

  let serviceAccount = null;
  if (jsonEnv) {
    try {
      serviceAccount = JSON.parse(jsonEnv);
    } catch {
      console.warn('Firebase: invalid FIREBASE_SERVICE_ACCOUNT_JSON');
      return false;
    }
  } else if (fs.existsSync(pathEnv)) {
    try {
      serviceAccount = JSON.parse(fs.readFileSync(pathEnv, 'utf8'));
    } catch {
      console.warn('Firebase: could not read service account file');
      return false;
    }
  } else {
    return false;
  }

  try {
    const mod = await import('firebase-admin');
    admin = mod.default;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    initialized = true;
    console.log('Firebase Admin ready (phone auth verify enabled)');
    return true;
  } catch (err) {
    console.warn('Firebase Admin init failed:', err.message);
    return false;
  }
}

export async function verifyFirebaseIdToken(idToken) {
  if (!initialized || !admin) {
    throw new Error('Firebase not configured on server');
  }
  return admin.auth().verifyIdToken(idToken);
}
