/**
 * FIREBASE CONFIGURATION & HELPERS
 * Weekend Warrior Social V3
 * 
 * HOTFIX: Wszystkie problemy naprawione
 */

// ═════════════════════════════════════════════════════════════════════════════════
// FIREBASE IMPORTS
// ═════════════════════════════════════════════════════════════════════════════════

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ═════════════════════════════════════════════════════════════════════════════════
// FIREBASE CONFIG — REPLACE WITH YOUR VALUES
// ═════════════════════════════════════════════════════════════════════════════════

const firebaseConfig = {
  apiKey: "AIzaSyBHwVgFJgsvOp1ZgU4nQetHM_KgzxeXzZI",
  authDomain: "weekend-warrior-social-v3.firebaseapp.com",
  projectId: "weekend-warrior-social-v3",
  storageBucket: "weekend-warrior-social-v3.firebasestorage.app",
  messagingSenderId: "147800031459",
  appId: "1:147800031459:web:d72e1fc2b81b8b152405d6"
};

// ═════════════════════════════════════════════════════════════════════════════════
// INITIALIZE FIREBASE
// ═════════════════════════════════════════════════════════════════════════════════

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  console.log('[Firebase] ✅ Initialized successfully');
} catch (err) {
  console.error('[Firebase] ❌ Initialization error:', err);
  // Fallback — nie wyrzucaj błędu, pozwól aplikacji załadować
}

// ═════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════════════════════

export { app, auth, db, googleProvider };

export const COL = {
  USERS: 'users',
  POSTS: 'posts',
  CONVERSATIONS: 'conversations',
  NOTIFICATIONS: 'notifications',
  CHALLENGES: 'challenge_invites',
  ACTIVE_CHALLENGES: 'active_challenges'
};

// Re-export Firestore functions
export {
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  increment,
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  arrayUnion, 
  arrayRemove
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Re-export Auth functions
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

console.log('[Firebase] Configuration loaded');
