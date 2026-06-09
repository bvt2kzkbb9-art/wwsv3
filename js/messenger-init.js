/**
 * MESSENGER PAGE INITIALIZATION
 */

import { getCurrentUser } from './auth.js';
import { getUserProfile } from './users.js';
import { getOrCreateConversation, listenConversations, listenMessages, sendMessage } from './messenger.js';
import { escapeHtml, formatTime, showToast } from './ui.js';

let currentConvId = null;
let unsubMessages = null;

export async function initMessenger(user) {
  const app = document.getElementById('app');
  const userProfile = await getUserProfile(user.uid);
  
  app.innerHTML = `
    <div style="display: grid; grid-template-columns: 250px 1fr; gap: 1.5rem; height: calc(100vh - 200px); margin-top: 2rem;">
      <!-- CONVERSATIONS LIST -->
      <div id="conversations-list" style="background: var(--bg-card); border-radius: 8px; overflow-y: auto; padding: 1rem;">
        <h3 style="margin-bottom: 1rem;">Konwersacje</h3>
        <p style="color: var(--text-muted);">Ładowanie...</p>
      </div>
      
      <!-- MESSAGE VIEW -->
      <div style="display: flex; flex-direction: column; background: var(--bg-card); border-radius: 8px;">
        <div id="messages-header" style="padding: 1rem; border-bottom: 1px solid var(--border-light); min-height: 60px;">
          <p style="color: var(--text-muted);">Wybierz konwersację</p>
        </div>
        <div id="messages-container" style="flex: 1; overflow-y: auto; padding: 1rem;">
          <p style="text-align: center; color: var(--text-muted);">Otwórz konwersację aby pisać wiadomości</p>
        </div>
        <div id="message-input-area" style="padding: 1rem; border-top: 1px solid var(--border-light); display: none;">
          <div style="display: flex; gap: 0.5rem;">
            <input id="message-input" type="text" placeholder="Wiadomość..." style="flex: 1;">
            <button onclick="sendMsg()" class="btn">Wyślij</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Listen to conversations
  listenConversations(user.uid, (convs) => {
    const list = document.getElementById('conversations-list');
    if (convs.length === 0) {
      list.innerHTML = '<p style="color: var(--text-muted);">Brak konwersacji</p>';
      return;
    }
    
    list.innerHTML = '<h3 style="margin-bottom: 1rem;">Konwersacje</h3>' + convs.map(conv => {
      const otherId = conv.participants.find(p => p !== user.uid);
      return `
        <div onclick="openConversation('${conv.id}', '${otherId}')" style="padding: 0.75rem; margin-bottom: 0.5rem; background: var(--bg-secondary); border-radius: 8px; cursor: pointer;">
          <div style="font-weight: bold; font-size: 0.9rem;">${escapeHtml(conv.lastMessage.slice(0, 30))}</div>
          <div style="color: var(--text-muted); font-size: 0.8rem;">${formatTime(conv.lastMessageAt)}</div>
        </div>
      `;
    }).join('');
  });
  
  window.openConversation = async (convId, otherId) => {
    currentConvId = convId;
    const otherProfile = await getUserProfile(otherId);
    
    document.getElementById('messages-header').innerHTML = `<h3>${escapeHtml(otherProfile.displayName)}</h3>`;
    document.getElementById('message-input-area').style.display = 'block';
    
    if (unsubMessages) unsubMessages();
    
    unsubMessages = listenMessages(convId, (msgs) => {
      const container = document.getElementById('messages-container');
      container.innerHTML = msgs.map(msg => {
        const isMine = msg.senderId === user.uid;
        return `
          <div style="margin-bottom: 1rem; display: flex; ${isMine ? 'justify-content: flex-end' : ''};">
            <div style="max-width: 70%; padding: 0.75rem 1rem; background: ${isMine ? 'var(--gold)' : 'var(--bg-secondary)'}; color: ${isMine ? 'black' : 'var(--text-primary)'}; border-radius: 8px;">
              <p style="margin-bottom: 0.25rem;">${escapeHtml(msg.text)}</p>
              <div style="font-size: 0.75rem; opacity: 0.7;">${formatTime(msg.createdAt)}</div>
            </div>
          </div>
        `;
      }).join('');
      
      container.scrollTop = container.scrollHeight;
    });
  };
  
  window.sendMsg = async () => {
    if (!currentConvId) {
      showToast('Otwórz konwersację', 'error');
      return;
    }
    
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text) return;
    
    try {
      const profile = await getUserProfile(user.uid);
      await sendMessage(currentConvId, user.uid, profile.displayName, profile.photoURL, text);
      input.value = '';
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
}
