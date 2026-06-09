export async function initRanking(user) {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `<h1>🏆 Ranking</h1><p>Coming soon</p><button onclick="window.location.href='index.html'" class="btn">Back</button>`;
}
