/**
 * CHALLENGES PAGE INITIALIZATION
 */

import { getChallenges, listenReceivedChallenges, sendChallenge, completeChallenge } from './challenges.js';
import { getCurrentUser, getUserProfile } from './users.js';
import { escapeHtml, showToast } from './ui.js';
import { getTopUsers } from './users.js';

export async function initChallenges(user) {
  const app = document.getElementById('app');
  const userProfile = await getUserProfile(user.uid);
  const challenges = getChallenges();
  
  app.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      <h1>⚔️ Misje i Wyzwania</h1>
      
      <!-- CHALLENGES GRID -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
        ${challenges.map(ch => `
          <div class="card" style="display: flex; flex-direction: column;">
            <div style="font-size: 3rem; text-align: center; margin-bottom: 0.5rem;">${ch.badge}</div>
            <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">${escapeHtml(ch.title)}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; flex: 1;">Trudność: ${ch.difficulty}</p>
            <div style="color: var(--gold); font-weight: bold; margin-bottom: 1rem;">+${ch.xp} XP</div>
            <button onclick="showChallengeDial('${ch.id}', '${ch.title}')" class="btn" style="width: 100%;">Rzuć Wyzwanie</button>
          </div>
        `).join('')}
      </div>
      
      <!-- RECEIVED CHALLENGES -->
      <div style="margin-top: 3rem;">
        <h2>Otrzymane Wyzwania</h2>
        <div id="received-challenges" style="margin-top: 1rem;">
          <p style="text-align: center; color: var(--text-muted);">Ładowanie...</p>
        </div>
      </div>
    </div>
    
    <div id="challenge-modal" style="display: none;">
      <!-- Modal template -->
    </div>
  `;
  
  // Listen to received challenges
  listenReceivedChallenges(user.uid, (challenges) => {
    const container = document.getElementById('received-challenges');
    if (challenges.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Brak wyzwań</p>';
      return;
    }
    
    container.innerHTML = challenges.map(ch => `
      <div class="card" style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h3>${ch.challengeBadge} ${escapeHtml(ch.challengeTitle)}</h3>
            <p style="color: var(--text-muted);">Od: ${escapeHtml(ch.challengerName)}</p>
            <p style="font-weight: bold; color: var(--gold);">+${ch.challengeXP} XP</p>
          </div>
          <div>
            <button onclick="completeChallenge('${ch.id}')" class="btn" style="white-space: nowrap;">Ukończ</button>
          </div>
        </div>
      </div>
    `).join('');
  });
}

async function showChallengeDial(challengeId, challengeTitle) {
  const topUsers = await getTopUsers(10);
  const userList = topUsers
    .filter(u => u.id !== getCurrentUser().uid)
    .map(u => `<option value="${u.id}">${escapeHtml(u.displayName)}</option>`)
    .join('');
  
  showToast('Feature coming soon!', 'info');
}

async function completeChallenge(inviteId) {
  try {
    const user = getCurrentUser();
    await completeChallenge(inviteId, user.uid);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.showChallengeDial = showChallengeDial;
window.completeChallenge = completeChallenge;
