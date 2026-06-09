import { showToast } from './ui.js';

export function getChallenges() {
  return [
    { id: 'lowca_wezy', title: '🏹 Łowca Węży', badge: '🏹', xp: 30 },
    { id: 'odkrycie_siebie', title: '🔍 Odkrycie Siebie', badge: '🔍', xp: 50 },
    { id: 'mocny_start', title: '⚡ Mocny Start', badge: '⚡', xp: 40 },
    { id: 'triumf', title: '🏆 Triumf', badge: '🏆', xp: 100 }
  ];
}

export async function sendChallenge(challengerId, challengerName, challengerPhotoURL, targetId, targetName, targetPhotoURL, challengeId) {
  showToast('Challenge sent!', 'success');
}

export function listenReceivedChallenges(userId, callback) {
  callback([]);
  return () => {};
}

export async function completeChallenge(inviteId, userId) {
  showToast('Challenge completed!', 'success');
}
