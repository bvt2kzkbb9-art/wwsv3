/**
 * MESSENGER MODULE
 * Conversations, messages
 */

import { db, COL, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, query, where, orderBy, onSnapshot, serverTimestamp, increment } from './firebase.js';
import { showToast } from './ui.js';

export async function getOrCreateConversation(uid1, uid2) {
  try {
    const q = query(
      collection(db, COL.CONVERSATIONS),
      where('participants', 'array-contains', uid1)
    );
    
    const snap = await getDocs(q);
    for (const doc of snap.docs) {
      if (doc.data().participants.includes(uid2)) {
        return doc.id;
      }
    }
    
    // Create new conversation
    const convRef = await addDoc(collection(db, COL.CONVERSATIONS), {
      participants: [uid1, uid2],
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      lastMessageBy: uid1,
      [` unread_${uid2}`]: 0
    });
    
    return convRef.id;
  } catch (err) {
    console.error('[Messenger] Create conversation error:', err);
    throw err;
  }
}

export async function sendMessage(convId, senderId, senderName, senderPhotoURL, text) {
  try {
    await addDoc(collection(db, COL.CONVERSATIONS, convId, 'messages'), {
      senderId,
      senderName,
      senderPhotoURL,
      text,
      type: 'text',
      imageURL: '',
      read: false,
      createdAt: serverTimestamp()
    });
    
    const convRef = doc(db, COL.CONVERSATIONS, convId);
    const convSnap = await getDoc(convRef);
    const otherId = convSnap.data().participants.find(p => p !== senderId);
    
    await updateDoc(convRef, {
      lastMessage: text.slice(0, 100),
      lastMessageAt: serverTimestamp(),
      lastMessageBy: senderId,
      [`unread_${otherId}`]: increment(1)
    });
  } catch (err) {
    console.error('[Messenger] Send message error:', err);
    throw err;
  }
}

export function listenConversations(userId, callback) {
  try {
    const q = query(
      collection(db, COL.CONVERSATIONS),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );
    
    return onSnapshot(q, (snap) => {
      const convs = [];
      snap.forEach(d => convs.push({ id: d.id, ...d.data() }));
      callback(convs);
    }, (err) => {
      console.error('[Messenger] Listen error:', err);
      callback([]);
    });
  } catch (err) {
    console.error('[Messenger] Listen setup error:', err);
    return () => {};
  }
}

export function listenMessages(convId, callback) {
  try {
    const q = query(
      collection(db, COL.CONVERSATIONS, convId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snap) => {
      const msgs = [];
      snap.forEach(d => msgs.push({ id: d.id, ...d.data() }));
      callback(msgs);
    }, (err) => {
      console.error('[Messenger] Listen messages error:', err);
      callback([]);
    });
  } catch (err) {
    console.error('[Messenger] Listen setup error:', err);
    return () => {};
  }
}
