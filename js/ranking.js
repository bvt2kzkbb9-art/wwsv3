export async function getLeaderboard(limit_count = 100) {
  return [];
}

export function listenLeaderboard(callback, limit_count = 100) {
  callback([]);
  return () => {};
}

export function getRankInfo(rank) {
  const ranks = {
    'Rookie': { emoji: '🥉', color: '#C0C0C0' },
    'Warrior': { emoji: '🥈', color: '#C0C0C0' },
    'Champion': { emoji: '🥇', color: '#D4AF37' },
    'Legend': { emoji: '💎', color: '#00BFFF' }
  };
  return ranks[rank] || ranks['Rookie'];
}
