export async function initFeed(user) {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `<h1>📝 Feed</h1><p>Coming soon</p><button onclick="window.location.href='index.html'" class="btn">Back</button>`;
}
