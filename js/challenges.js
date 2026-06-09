/**
 * CHALLENGES MODULE
 * Challenge invites, tracking, completion
 */

import { db, COL, collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, Timestamp } from './firebase.js';
import { showToast } from './ui.js';
import { awardXP } from './users.js';

const CHALLENGES = [
  { id: 'lowca_wezy', title: '🏹 Łowca Węży', badge: '🏹', xp: 30, difficulty: 'easy' },
  { id: 'odkrycie_siebie', title: '🔍 Odkrycie Siebie', badge: '🔍', xp: 50, difficulty: 'medium' },
  { id: 'mocny_start', title: '⚡ Mocny Start', badge: '⚡', xp: 40, difficulty: 'medium' },
  { id: 'triumf', title: '🏆 Triumf', badge: '🏆', xp: 100, difficulty: 'hard' }
];

export function getChallenges() {
  return CHALLENGES;
}

export async function sendChallenge(challengerId, challengerName, challengerPhotoURL, targetId, targetName, targetPhotoURL, challengeId) {
  try {
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) throw new Error('Challenge not found');
    
    await addDoc(collection(db, COL.CHALLENGES), {
      challengerId,
      challengerName,
      challengerPhotoURL,
      targetId,
      targetName,
      targetPhotoURL,
      challengeId,
      challengeTitle: challenge.title,
      challengeBadge: challenge.badge,
      challengeXP: challenge.xp,
      status: 'pending',
      quizPassed: false,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 72 * 3600 * 1000)),
      createdAt: serverTimestamp()
    });
    
    showToast(`Wyzwanie rzucone! ⚔️`, 'success');
  } catch (err) {
    console.error('[Challenges] Send error:', err);
    showToast(err.message, 'error');
    throw err;
  }
}

export function listenReceivedChallenges(userId, callback) {
  try {
    const q = query(
      collection(db, COL.CHALLENGES),
      where('targetId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snap) => {
      const challenges = [];
      snap.forEach(d => challenges.push({ id: d.id, ...d.data() }));
      callback(challenges);
    }, (err) => {
      console.error('[Challenges] Listen error:', err);
      callback([]);
    });
  } catch (err) {
    console.error('[Challenges] Listen setup error:', err);
    return () => {};
  }
}

export async function completeChallenge(inviteId, userId) {
  try {
    const inviteRef = doc(db, COL.CHALLENGES, inviteId);
    const inviteSnap = await getDoc(inviteRef);
    const inviteData = inviteSnap.data();
    
    await updateDoc(inviteRef, {
      status: 'completed',
      completedAt: serverTimestamp()
    });
    
    await awardXP(userId, inviteData.challengeXP, `Challenge completed: ${inviteData.challengeTitle}`);
    
    showToast(`🏆 Wyzwanie ukończone! +${inviteData.challengeXP} XP`, 'success');
  } catch (err) {
    console.error('[Challenges] Complete error:', err);
    throw err;
  }
}
