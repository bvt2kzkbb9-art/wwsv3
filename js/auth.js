/**
 * AUTHENTICATION MODULE
 * Login, Register, Logout, Google OAuth
 * HOTFIX: Wszystkie importy naprawione
 */

import { 
  auth, db, COL, googleProvider,
  collection, doc, setDoc, serverTimestamp, getDoc,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut as fbSignOut, updateProfile, onAuthStateChanged, 
  signInWithPopup, sendPasswordResetEmail
} from './firebase.js';
import { showToast } from './ui.js';

let currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
}

async function createUserProfile(uid, email, displayName, photoURL = '') {
  try {
    await setDoc(doc(db, COL.USERS, uid), {
      uid,
      email,
      displayName,
      username: displayName.toLowerCase().replace(/\s+/g, '_'),
      photoURL,
      bannerURL: '',
      bio: '',
      points: 0,
      level: 1,
      rank: 'Rookie',
      streak: 0,
      totalPostsCount: 0,
      totalCommentsCount: 0,
      totalChallengesCompleted: 0,
      totalChallengesSent: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    });
  } catch (err) {
    console.error('[Auth] Profile creation error:', err);
    throw err;
  }
}

export async function register(email, password, displayName) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await createUserProfile(cred.user.uid, email, displayName);
    
    currentUser = cred.user;
    showToast('Konto utworzone! 🎉', 'success');
    return cred.user;
  } catch (err) {
    const msg = err.code === 'auth/email-already-in-use' 
      ? 'Ten email już istnieje' 
      : err.code === 'auth/weak-password'
      ? 'Hasło musi mieć co najmniej 6 znaków'
      : err.message;
    showToast(msg, 'error');
    throw err;
  }
}

export async function login(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    currentUser = cred.user;
    showToast('Zalogowany! ⚔️', 'success');
    return cred.user;
  } catch (err) {
    const msg = err.code === 'auth/invalid-credential'
      ? 'Zły email lub hasło'
      : err.message;
    showToast(msg, 'error');
    throw err;
  }
}

export async function loginWithGoogle() {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    currentUser = cred.user;
    
    const docSnap = await getDoc(doc(db, COL.USERS, cred.user.uid));
    if (!docSnap.exists()) {
      await createUserProfile(
        cred.user.uid,
        cred.user.email,
        cred.user.displayName || 'Wojownik',
        cred.user.photoURL || ''
      );
    }
    
    showToast('Google zalogowanie OK! 🎉', 'success');
    return cred.user;
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  }
}

export async function logout() {
  try {
    await fbSignOut(auth);
    currentUser = null;
    showToast('Wylogowany', 'info');
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('Link resetujący wysłany na email', 'success');
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  }
}
