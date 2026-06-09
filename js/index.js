/**
 * ARENA INITIALIZATION
 * Main page - Arena Wojowników
 */

import { getUserProfile, getTopUsers } from './users.js';
import { escapeHtml, formatTime } from './ui.js';
import { getRankInfo } from './ranking.js';

export async function initArena(user) {
  const app = document.getElementById('app');
  
  try {
    // Get current user profile
    const profile = await getUserProfile(user.uid);
    
    // Get top 10 warriors
    const topUsers = await getTopUsers(10);
    
    // Render arena
    app.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
        
        <!-- HERO SECTION -->
        <div class="card" style="grid-column: 1 / -1; text-align: center;">
          <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚔ Arena Wojowników</h1>
          <p style="color: var(--text-muted); font-size: 1.1rem;">Polska społeczność treningowa</p>
        </div>
        
        <!-- TWÓJ PROFIL -->
        <div class="card">
          <h2>Twój Profil</h2>
          <div style="text-align: center; margin: 1.5rem 0;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">
              ${profile?.photoURL ? `<img src="${escapeHtml(profile.photoURL)}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">` : '👤'}
            </div>
            <h3 style="font-size: 1.5rem; color: var(--gold);">${escapeHtml(profile?.displayName || 'Wojownik')}</h3>
            <p style="color: var(--text-muted); margin: 0.5rem 0;">Poziom ${profile?.level || 1}</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="color: var(--gold); font-size: 1.5rem; font-weight: bold;">${(profile?.points || 0).toLocaleString()}</div>
              <div style="color: var(--text-muted); font-size: 0.9rem;">XP</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="color: var(--gold); font-size: 1.5rem; font-weight: bold;">${getRankInfo(profile?.rank).emoji} ${profile?.rank || 'Rookie'}</div>
              <div style="color: var(--text-muted); font-size: 0.9rem;">Ranga</div>
            </div>
          </div>
          <button onclick="window.location.href='profile.html'" class="btn" style="width: 100%; margin-top: 1.5rem;">Mój Profil</button>
        </div>
        
        <!-- TOP 5 WARRIORS -->
        <div class="card">
          <h2>🏆 Top Wojownicy</h2>
          <div style="margin-top: 1rem;">
            ${topUsers.slice(0, 5).map((u, idx) => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light);">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="color: var(--gold); font-weight: bold; font-size: 1.2rem;">#${idx + 1}</span>
                  <span>${escapeHtml(u.displayName)}</span>
                </div>
                <span style="color: var(--gold); font-weight: bold;">${(u.points || 0).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
          <button onclick="window.location.href='ranking.html'" class="btn" style="width: 100%; margin-top: 1rem;">Cały Ranking</button>
        </div>
        
        <!-- QUICK ACTIONS -->
        <div class="card">
          <h2>🎯 Szybkie Akcje</h2>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem;">
            <button onclick="window.location.href='feed.html'" class="btn" style="width: 100%; text-align: left;">📝 Dodaj Post</button>
            <button onclick="window.location.href='challenges.html'" class="btn btn-secondary" style="width: 100%; text-align: left;">⚔️ Rzuć Wyzwanie</button>
            <button onclick="window.location.href='messenger.html'" class="btn btn-secondary" style="width: 100%; text-align: left;">💬 Wiadomości</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('[Arena] Init error:', err);
    app.innerHTML = `<p style="color: red;">Błąd ładowania. Odśwież stronę.</p>`;
  }
}
