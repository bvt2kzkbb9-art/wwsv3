/**
 * NOTIFICATIONS MODULE
 * In-app notifications
 */

import { db, collection, doc, addDoc, updateDoc, getDocs, query, where, orderBy, limit, onSnapshot, serverTimestamp } from './firebase.js';

export async function createNotification(userId, { type, title, body, link = '' }) {
  try {
    await addDoc(collection(db, 'notifications', userId, 'items'), {
      type,
      title,
      body,
      link,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('[Notifications] Create error:', err);
  }
}

export function listenNotifications(userId, callback) {
  try {
    const q = query(
      collection(db, 'notifications', userId, 'items'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snap) => {
      const notifs = [];
      snap.forEach(d => notifs.push({ id: d.id, ...d.data() }));
      callback(notifs);
    }, (err) => {
      console.error('[Notifications] Listen error:', err);
      callback([]);
    });
  } catch (err) {
    console.error('[Notifications] Listen setup error:', err);
    return () => {};
  }
}

export async function markAsRead(userId, notifId) {
  try {
    await updateDoc(doc(db, 'notifications', userId, 'items', notifId), {
      read: true
    });
  } catch (err) {
    console.error('[Notifications] Mark read error:', err);
  }
}
