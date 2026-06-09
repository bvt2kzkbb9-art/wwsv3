/**
 * RANKING PAGE INITIALIZATION
 */

import { listenLeaderboard, getRankInfo } from './ranking.js';
import { escapeHtml } from './ui.js';

export function initRanking(user) {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <h1>🏆 Sala Chwały</h1>
      <div id="leaderboard-container" style="margin-top: 2rem;">
        <p style="text-align: center; color: var(--text-muted);">Ładowanie rankingu...</p>
      </div>
    </div>
  `;
  
  // Listen to leaderboard
  listenLeaderboard((users) => {
    const container = document.getElementById('leaderboard-container');
    if (users.length === 0) {
      container.innerHTML = '<p style="text-align: center;">Brak użytkowników</p>';
      return;
    }
    
    container.innerHTML = users.map((u, idx) => {
      const rankInfo = getRankInfo(u.rank);
      const isCurrentUser = u.id === user.uid;
      
      return `
        <div class="card" style="margin-bottom: 1rem; ${isCurrentUser ? 'border-color: var(--gold);' : ''}">
          <div style="display: grid; grid-template-columns: 60px 1fr 120px; gap: 1rem; align-items: center;">
            <div style="text-align: center; font-size: 1.5rem; font-weight: bold; color: var(--gold);">
              ${idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : '#' + (idx + 1)}
            </div>
            <div>
              <div style="font-weight: bold; font-size: 1.1rem;">${escapeHtml(u.displayName)}</div>
              <div style="color: var(--text-muted); font-size: 0.9rem;">
                ${rankInfo.emoji} ${u.rank} · Lvl ${u.level || 1}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold; color: var(--gold); font-size: 1.2rem;">${(u.points || 0).toLocaleString()}</div>
              <div style="color: var(--text-muted); font-size: 0.85rem;">XP</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  });
}
