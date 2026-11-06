import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// Default config check from env or localStorage
function getFirebaseConfig() {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return { config: envConfig, source: 'env' };
  }

  // Check localStorage for manually configured credentials in UI
  try {
    const saved = localStorage.getItem('shopbook_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return { config: parsed, source: 'localStorage' };
      }
    }
  } catch (e) {
    console.error('Error reading saved firebase config:', e);
  }

  return { config: null, source: 'none' };
}

const { config: activeConfig, source: configSource } = getFirebaseConfig();

let app = null;
let auth = null;
let db = null;
let isFirebaseConfigured = false;

if (activeConfig && activeConfig.apiKey && activeConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log(`[Firebase] Initialized successfully from ${configSource}`);
  } catch (err) {
    console.warn('[Firebase] Initialization error, falling back to local simulation:', err);
    isFirebaseConfigured = false;
  }
}

export { 
  app, 
  auth, 
  db, 
  isFirebaseConfigured,
  configSource,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
};
