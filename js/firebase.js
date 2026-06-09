/**
 * FIREBASE CONFIGURATION & HELPERS
 * Weekend Warrior Social V3
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnR0Q3MmOXkEUfMLdgbVGNFyD1o0hEIaY",
  authDomain: "weekend-warrior-social-v3.firebaseapp.com",
  projectId: "weekend-warrior-social-v3",
  storageBucket: "weekend-warrior-social-v3.firebasestorage.app",
  messagingSenderId: "257482203896",
  appId: "1:257482203896:web:79da67d500850870ba510d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const COL = {
  USERS: 'users',
  POSTS: 'posts',
  CONVERSATIONS: 'conversations',
  NOTIFICATIONS: 'notifications',
  CHALLENGES: 'challenge_invites',
  ACTIVE_CHALLENGES: 'active_challenges'
};

export {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
  query, where, orderBy, limit, startAfter, increment,
  onSnapshot, serverTimestamp, Timestamp,
  arrayUnion, arrayRemove
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

console.log('[Firebase] Initialized');
