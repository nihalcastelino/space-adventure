import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.databaseURL && firebaseConfig.projectId;

if (!isFirebaseConfigured) {
  console.warn('⚠️ Firebase credentials not found in environment variables.');
  console.warn('Please add VITE_FIREBASE_DATABASE_URL and VITE_FIREBASE_PROJECT_ID to your .env file');
  console.warn('Online multiplayer features will be disabled.');
}

// Initialize Firebase only if configured
let app = null;
let database = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    
    if (import.meta.env.DEV) {
      console.log('✅ Firebase configured successfully');
      console.log('📡 Firebase Database URL:', firebaseConfig.databaseURL?.substring(0, 30) + '...');
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    app = null;
    database = null;
  }
} else {
  if (import.meta.env.DEV) {
    console.log('❌ Firebase not configured - online multiplayer disabled');
  }
}

export { database };
export default app;

