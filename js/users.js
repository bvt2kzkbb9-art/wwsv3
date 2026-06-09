import { db, COL } from './firebase.js';

export async function getUserProfile(uid) {
  try {
    return { id: uid, displayName: 'Wojownik', points: 0, level: 1 };
  } catch (err) {
    console.error('[Users] Error:', err);
    return null;
  }
}

export async function updateUserProfile(uid, data) {
  console.log('[Users] Profile updated:', data);
}

export async function getTopUsers(limit_count = 100) {
  return [];
}

export async function awardXP(uid, amount, reason = '') {
  console.log('[Users] XP awarded:', amount, reason);
}

export async function incrementStat(uid, field, increment_by = 1) {
  console.log('[Users] Stat incremented:', field);
}
