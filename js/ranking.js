/**
 * RANKING MODULE
 * Leaderboard, stats
 */

import { db, COL, collection, getDocs, query, orderBy, limit, onSnapshot } from './firebase.js';

export async function getLeaderboard(limit_count = 100) {
  try {
    const q = query(
      collection(db, COL.USERS),
      orderBy('points', 'desc'),
      limit(limit_count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d, idx) => ({
      rank: idx + 1,
      ...d.data()
    }));
  } catch (err) {
    console.error('[Ranking] Get leaderboard error:', err);
    return [];
  }
}

export function listenLeaderboard(callback, limit_count = 100) {
  try {
    const q = query(
      collection(db, COL.USERS),
      orderBy('points', 'desc'),
      limit(limit_count)
    );
    
    return onSnapshot(q, (snap) => {
      const users = [];
      snap.forEach((d, idx) => users.push({
        rank: idx + 1,
        id: d.id,
        ...d.data()
      }));
      callback(users);
    }, (err) => {
      console.error('[Ranking] Listen error:', err);
      callback([]);
    });
  } catch (err) {
    console.error('[Ranking] Listen setup error:', err);
    return () => {};
  }
}

export function getRankInfo(rank) {
  const ranks = [
    { id: 'Rookie', emoji: '🥉', min: 0, color: '#C0C0C0' },
    { id: 'Warrior', emoji: '🥈', min: 500, color: '#C0C0C0' },
    { id: 'Champion', emoji: '🥇', min: 2000, color: '#D4AF37' },
    { id: 'Legend', emoji: '💎', min: 10000, color: '#00BFFF' }
  ];
  return ranks.find(r => r.id === rank) || ranks[0];
}
