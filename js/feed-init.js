/**
 * FEED PAGE INITIALIZATION
 */

import { getCurrentUser } from './auth.js';
import { getUserProfile } from './users.js';
import { createPost, listenFeed, likePost, addComment } from './feed.js';
import { escapeHtml, formatTime, showToast } from './ui.js';

export async function initFeed(user) {
  const app = document.getElementById('app');
  
  try {
    const profile = await getUserProfile(user.uid);
    
    app.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto;">
        <!-- CREATE POST -->
        <div class="card" style="margin-bottom: 2rem;">
          <h3>Podziel się czymś nowym!</h3>
          <textarea id="post-content" placeholder="Co nowego w treningach?" style="width: 100%; min-height: 100px; padding: 1rem; margin: 1rem 0; border: 1px solid var(--border-light); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary); font-family: inherit;"></textarea>
          <button onclick="document.querySelector('#publish-post-btn').click()" class="btn" style="width: 100%;">Opublikuj</button>
          <button id="publish-post-btn" onclick="publishPost('${user.uid}', '${escapeHtml(profile.displayName)}', '${profile.photoURL || ''}')" style="display: none;"></button>
        </div>
        
        <!-- FEED -->
        <div id="feed-container">
          <p style="text-align: center; color: var(--text-muted);">Ładowanie postów...</p>
        </div>
      </div>
    `;
    
    // Listen to feed
    listenFeed((posts) => {
      const container = document.getElementById('feed-container');
      if (posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Brak postów. Bądź pierwszy!</p>';
        return;
      }
      
      container.innerHTML = posts.map(post => `
        <div class="card" style="margin-bottom: 1.5rem;">
          <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-secondary); flex-shrink: 0;">
              ${post.authorPhotoURL ? `<img src="${escapeHtml(post.authorPhotoURL)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : '👤'}
            </div>
            <div style="flex: 1;">
              <div style="font-weight: bold;">${escapeHtml(post.authorName)}</div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">${formatTime(post.createdAt)}</div>
            </div>
          </div>
          <p style="margin-bottom: 1rem;">${escapeHtml(post.content)}</p>
          ${post.imageURL ? `<img src="${post.imageURL}" style="width: 100%; border-radius: 8px; margin-bottom: 1rem; max-height: 400px; object-fit: cover;">` : ''}
          <div style="display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
            <button onclick="toggleLike('${post.id}', '${user.uid}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem;">
              ❤️ ${post.likesCount || 0}
            </button>
            <button onclick="showCommentForm('${post.id}')" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem;">
              💬 ${post.commentsCount || 0}
            </button>
          </div>
        </div>
      `).join('');
    });
  } catch (err) {
    console.error('[Feed] Init error:', err);
    app.innerHTML = `<p style="color: red;">Błąd ładowania</p>`;
  }
}

async function publishPost(uid, name, photo) {
  const content = document.getElementById('post-content').value.trim();
  if (!content) {
    showToast('Post nie może być pusty!', 'error');
    return;
  }
  
  try {
    await createPost(uid, name, photo, content);
    document.getElementById('post-content').value = '';
  } catch (err) {
    console.error('[Feed] Publish error:', err);
  }
}

async function toggleLike(postId, userId) {
  try {
    await likePost(postId, userId);
  } catch (err) {
    console.error('[Feed] Like error:', err);
  }
}

function showCommentForm(postId) {
  showToast('Komentarze - Coming soon!', 'info');
}

window.publishPost = publishPost;
window.toggleLike = toggleLike;
window.showCommentForm = showCommentForm;
