/**
 * USERS MODULE
 * User profiles, stats, XP management
 */

import { db, COL, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, limit, increment, serverTimestamp } from './firebase.js';

export async function getUserProfile(uid) {
  try {
    const snap = await getDoc(doc(db, COL.USERS, uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error('[Users] Get profile error:', err);
    return null;
  }
}

export async function updateUserProfile(uid, data) {
  try {
    await updateDoc(doc(db, COL.USERS, uid), {
      ...data,
      lastActiveAt: serverTimestamp()
    });
  } catch (err) {
    console.error('[Users] Update profile error:', err);
    throw err;
  }
}

export async function getTopUsers(limit_count = 100) {
  try {
    const q = query(
      collection(db, COL.USERS),
      orderBy('points', 'desc'),
      limit(limit_count)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[Users] Get top users error:', err);
    return [];
  }
}

export async function awardXP(uid, amount, reason = '') {
  try {
    const userRef = doc(db, COL.USERS, uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;
    
    const currentPoints = userSnap.data().points || 0;
    const newPoints = currentPoints + amount;
    
    // Calculate level (every 500 points = 1 level)
    const newLevel = Math.floor(newPoints / 500) + 1;
    
    // Calculate rank
    let newRank = 'Rookie';
    if (newPoints >= 10000) newRank = 'Legend';
    else if (newPoints >= 2000) newRank = 'Champion';
    else if (newPoints >= 500) newRank = 'Warrior';
    
    await updateDoc(userRef, {
      points: newPoints,
      level: newLevel,
      rank: newRank,
      lastActiveAt: serverTimestamp()
    });
  } catch (err) {
    console.error('[Users] Award XP error:', err);
    throw err;
  }
}

export async function incrementStat(uid, field, increment_by = 1) {
  try {
    await updateDoc(doc(db, COL.USERS, uid), {
      [field]: increment(increment_by),
      lastActiveAt: serverTimestamp()
    });
  } catch (err) {
    console.error('[Users] Increment stat error:', err);
    throw err;
  }
}
