/**
 * PROFILE PAGE INITIALIZATION
 */

import { getCurrentUser } from './auth.js';
import { getUserProfile, updateUserProfile } from './users.js';
import { escapeHtml } from './ui.js';
import { getRankInfo } from './ranking.js';

export async function initProfile(user) {
  const app = document.getElementById('app');
  
  try {
    const profile = await getUserProfile(user.uid);
    const rankInfo = getRankInfo(profile.rank);
    
    app.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto;">
        <!-- PROFILE HEADER -->
        <div class="card" style="text-align: center; margin-bottom: 2rem;">
          <div style="font-size: 100px; margin-bottom: 1rem;">
            ${profile.photoURL ? `<img src="${escapeHtml(profile.photoURL)}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--gold);">` : '👤'}
          </div>
          <h1 style="margin-bottom: 0.5rem;">${escapeHtml(profile.displayName)}</h1>
          <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1.5rem;">@${escapeHtml(profile.username)}</p>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="font-size: 1.5rem; color: var(--gold); font-weight: bold;">${profile.level || 1}</div>
              <div style="color: var(--text-muted); font-size: 0.85rem;">Poziom</div>
            </div>
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="font-size: 1.5rem; color: var(--gold); font-weight: bold;">${rankInfo.emoji}</div>
              <div style="color: var(--text-muted); font-size: 0.85rem;">Ranga</div>
            </div>
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="font-size: 1.5rem; color: var(--gold); font-weight: bold;">${(profile.points || 0).toLocaleString()}</div>
              <div style="color: var(--text-muted); font-size: 0.85rem;">XP</div>
            </div>
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="font-size: 1.5rem; color: var(--gold); font-weight: bold;">${profile.streak || 0}</div>
              <div style="color: var(--text-muted); font-size: 0.85rem;">Seria</div>
            </div>
          </div>
        </div>
        
        <!-- STATS -->
        <div class="card" style="margin-bottom: 2rem;">
          <h2>Statystyki</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="color: var(--text-muted); font-size: 0.9rem;">Posty</div>
              <div style="font-size: 1.5rem; color: var(--gold); font-weight: bold;">${profile.totalPostsCount || 0}</div>
            </div>
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="color: var(--text-muted); font-size: 0.9rem;">Komentarze</div>
              <div style="font-size: 1.5rem; color: var(--gold); font-weight: bold;">${profile.totalCommentsCount || 0}</div>
            </div>
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="color: var(--text-muted); font-size: 0.9rem;">Ukończone</div>
              <div style="font-size: 1.5rem; color: var(--gold); font-weight: bold;">${profile.totalChallengesCompleted || 0}</div>
            </div>
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="color: var(--text-muted); font-size: 0.9rem;">Wysłane</div>
              <div style="font-size: 1.5rem; color: var(--gold); font-weight: bold;">${profile.totalChallengesSent || 0}</div>
            </div>
          </div>
        </div>
        
        <!-- BIO -->
        <div class="card">
          <h2>Bio</h2>
          <textarea id="bio-input" style="width: 100%; min-height: 80px; padding: 1rem; margin: 1rem 0; border: 1px solid var(--border-light); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary);">${escapeHtml(profile.bio || '')}</textarea>
          <button onclick="saveBio('${user.uid}')" class="btn">Zapisz</button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('[Profile] Init error:', err);
    app.innerHTML = `<p style="color: red;">Błąd ładowania profilu</p>`;
  }
}

async function saveBio(uid) {
  const bioInput = document.getElementById('bio-input');
  const bio = bioInput.value;
  
  try {
    await updateUserProfile(uid, { bio });
    // Re-init to show changes
    const user = getCurrentUser();
    initProfile(user);
  } catch (err) {
    console.error('[Profile] Save error:', err);
  }
}

window.saveBio = saveBio;
