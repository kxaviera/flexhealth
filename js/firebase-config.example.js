/**
 * Copy this file to firebase-config.js and fill in your Firebase project settings.
 *
 * Firebase Console → Project Settings → Your apps → Web app config
 * Enable: Authentication → Sign-in method → Phone
 * Add authorized domain: localhost (and your production domain)
 */
window.FIREBASE_CONFIG = {
  enabled: true,
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef'
};
