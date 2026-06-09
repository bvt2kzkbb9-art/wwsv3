export async function initChallenges(user) {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `<h1>⚔️ Challenges</h1><p>Coming soon</p><button onclick="window.location.href='index.html'" class="btn">Back</button>`;
}
