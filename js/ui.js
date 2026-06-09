/**
 * SHARED UI HELPERS
 * Toasts, formatting, utilities
 */

export function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  const bgColor = {
    'success': '#16C784',
    'error': '#EF4444',
    'warning': '#F59E0B',
    'info': '#3B82F6'
  }[type] || '#3B82F6';
  
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui;
    font-weight: 500;
    z-index: 9999;
    animation: slideInUp 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutDown 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate?.() || new Date(timestamp);
  return date.toLocaleDateString('pl-PL');
}

export function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate?.() || new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return 'teraz';
  if (diff < 3600) return `${Math.floor(diff / 60)}m temu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h temu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d temu`;
  
  return formatDate(timestamp);
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function getInitials(name) {
  return name?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'W';
}

export function createCard(title, content, actions = []) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>${escapeHtml(title)}</h3>
    <div>${content}</div>
  `;
  
  if (actions.length > 0) {
    const footer = document.createElement('div');
    footer.style.cssText = 'margin-top: 1rem; display: flex; gap: 0.5rem;';
    actions.forEach(({ label, onClick, variant = 'primary' }) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.className = `btn btn-${variant}`;
      btn.onclick = onClick;
      footer.appendChild(btn);
    });
    card.appendChild(footer);
  }
  
  return card;
}

export function createLoader() {
  const loader = document.createElement('div');
  loader.style.cssText = `
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(212, 175, 55, 0.3);
    border-radius: 50%;
    border-top-color: #D4AF37;
    animation: spin 0.8s linear infinite;
  `;
  return loader;
}

export function addAnimationStyles() {
  if (document.getElementById('animation-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'animation-styles';
  style.textContent = `
    @keyframes slideInUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideOutDown {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(100px); opacity: 0; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

addAnimationStyles();
