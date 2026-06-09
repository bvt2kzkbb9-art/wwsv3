import { showToast } from './ui.js';

export async function getOrCreateConversation(uid1, uid2) {
  return 'conv-id';
}

export async function sendMessage(convId, senderId, senderName, senderPhotoURL, text) {
  console.log('[Messenger] Message sent:', text);
}

export function listenConversations(userId, callback) {
  callback([]);
  return () => {};
}

export function listenMessages(convId, callback) {
  callback([]);
  return () => {};
}
