export async function initMessenger(user) {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `<h1>💬 Messenger</h1><p>Coming soon</p><button onclick="window.location.href='index.html'" class="btn">Back</button>`;
}
