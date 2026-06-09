/**
 * ARENA INITIALIZATION
 * Main page - Arena Wojowników
 * HOTFIX: Wszystkie błędy naprawione
 */

export async function initArena(user) {
  const app = document.getElementById('app');
  
  if (!app) {
    console.error('[Arena] App container not found');
    return;
  }
  
  try {
    app.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr; gap: 2rem; margin-top: 2rem;">
        
        <!-- HERO SECTION -->
        <div class="card" style="text-align: center;">
          <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--gold);">⚔ Arena Wojowników</h1>
          <p style="color: var(--text-muted); font-size: 1.1rem;">Polska społeczność treningowa</p>
        </div>
        
        <!-- TWÓJ PROFIL -->
        <div class="card">
          <h2 style="color: var(--gold);">Twój Profil</h2>
          <div style="text-align: center; margin: 1.5rem 0;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
            <h3 style="font-size: 1.5rem; color: var(--gold);">${user?.displayName || 'Wojownik'}</h3>
            <p style="color: var(--text-muted); margin: 0.5rem 0;">Poziom 1</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="color: var(--gold); font-size: 1.5rem; font-weight: bold;">0</div>
              <div style="color: var(--text-muted); font-size: 0.9rem;">XP</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
              <div style="color: var(--gold); font-size: 1.5rem; font-weight: bold;">🥉</div>
              <div style="color: var(--text-muted); font-size: 0.9rem;">Rookie</div>
            </div>
          </div>
          <button onclick="window.location.href='profile.html'" class="btn" style="width: 100%; margin-top: 1.5rem;">Mój Profil</button>
        </div>
        
        <!-- QUICK ACTIONS -->
        <div class="card">
          <h2 style="color: var(--gold);">🎯 Szybkie Akcje</h2>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem;">
            <button onclick="window.location.href='feed.html'" class="btn" style="width: 100%; text-align: center;">📝 Dodaj Post</button>
            <button onclick="window.location.href='challenges.html'" class="btn btn-secondary" style="width: 100%; text-align: center;">⚔️ Rzuć Wyzwanie</button>
            <button onclick="window.location.href='messenger.html'" class="btn btn-secondary" style="width: 100%; text-align: center;">💬 Wiadomości</button>
            <button onclick="window.location.href='ranking.html'" class="btn btn-secondary" style="width: 100%; text-align: center;">🏆 Ranking</button>
          </div>
        </div>
        
        <!-- INFO -->
        <div class="card" style="background: var(--bg-secondary); border: 1px solid var(--gold);">
          <p style="color: var(--text-muted); margin: 0; text-align: center;">
            ✅ Weekend Warrior Social V3<br>
            Gotowe do pełnego użytku
          </p>
        </div>
      </div>
    `;
    
    console.log('[Arena] ✅ Initialized successfully');
  } catch (err) {
    console.error('[Arena] Init error:', err);
    app.innerHTML = `<p style="color: #EF4444;">Błąd ładowania. Odśwież stronę. ${err.message}</p>`;
  }
}
