import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, increment, Timestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = { apiKey: "AIzaSyBHwVgFJgsvOp1ZgU4nQetHM_KgzxeXzZI", authDomain: "weekend-warrior-social-v2.firebaseapp.com", projectId: "weekend-warrior-social-v2", storageBucket: "weekend-warrior-social-v2.firebasestorage.app", messagingSenderId: "147800031459", appId: "1:147800031459:web:d72e1fc2b81b8b152405d6" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
window.app = { auth, db, app };

function showToast(msg, type = 'info') { const toast = document.createElement('div'); toast.className = `toast toast-${type}`; toast.textContent = msg; document.body.appendChild(toast); setTimeout(() => toast.remove(), 3000); }

function formatTime(ts) { if (!ts) return ''; const date = ts.toDate?.() || new Date(ts); const diff = Math.floor((new Date() - date) / 1000); if (diff < 60) return 'teraz'; if (diff < 3600) return Math.floor(diff / 60) + 'm'; if (diff < 86400) return Math.floor(diff / 3600) + 'h'; return date.toLocaleDateString('pl-PL'); }

function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

async function createUserProfile(uid, email, displayName, photoURL = '') { await setDoc(doc(db, 'users', uid), { uid, email, displayName, username: displayName.toLowerCase().replace(/\s+/g, '_'), photoURL, bannerURL: '', bio: '', points: 0, level: 1, rank: 'Rookie', streak: 0, totalPostsCount: 0, totalCommentsCount: 0, totalChallengesCompleted: 0, totalChallengesSent: 0, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp(), lastActiveAt: serverTimestamp() }); }

async function register(email, password, displayName) { const cred = await createUserWithEmailAndPassword(auth, email, password); await updateProfile(cred.user, { displayName }); await createUserProfile(cred.user.uid, email, displayName); showToast('Konto utworzone! 🎉', 'success'); return cred.user; }

async function login(email, password) { const cred = await signInWithEmailAndPassword(auth, email, password); showToast('Zalogowany! ⚔️', 'success'); return cred.user; }

async function loginGoogle() { const googleProvider = new GoogleAuthProvider(); const cred = await signInWithPopup(auth, googleProvider); const docSnap = await getDoc(doc(db, 'users', cred.user.uid)); if (!docSnap.exists()) { await createUserProfile(cred.user.uid, cred.user.email, cred.user.displayName || 'Wojownik', cred.user.photoURL || ''); } showToast('Google zalogowanie! 🎉', 'success'); return cred.user; }

async function logout() { await signOut(auth); showToast('Wylogowany', 'info'); window.location.href = '/wwsv3/'; }

async function getUserProfile(uid) { const snap = await getDoc(doc(db, 'users', uid)); return snap.exists() ? { id: snap.id, ...snap.data() } : null; }

async function awardXP(uid, amount) { const userRef = doc(db, 'users', uid); const userSnap = await getDoc(userRef); if (!userSnap.exists()) return; const currentPoints = userSnap.data().points || 0; const newPoints = currentPoints + amount; const newLevel = Math.floor(newPoints / 500) + 1; let newRank = 'Rookie'; if (newPoints >= 10000) newRank = 'Legend'; else if (newPoints >= 2000) newRank = 'Champion'; else if (newPoints >= 500) newRank = 'Warrior'; await updateDoc(userRef, { points: newPoints, level: newLevel, rank: newRank, lastActiveAt: serverTimestamp() }); }

async function createPost(authorId, authorName, authorPhotoURL, content, imageURL = '') { const postRef = await addDoc(collection(db, 'posts'), { authorId, authorName, authorPhotoURL, content, imageURL, likes: [], likesCount: 0, reactions: {}, reactionsCount: 0, commentsCount: 0, createdAt: serverTimestamp() }); await awardXP(authorId, 10); await updateDoc(doc(db, 'users', authorId), { totalPostsCount: increment(1) }); return postRef.id; }

function listenFeed(callback) { const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50)); return onSnapshot(q, snap => { const posts = []; snap.forEach(d => posts.push({ id: d.id, ...d.data() })); callback(posts); }); }

async function likePost(postId, userId) { const postRef = doc(db, 'posts', postId); const postSnap = await getDoc(postRef); const likes = postSnap.data().likes || []; if (likes.includes(userId)) { await updateDoc(postRef, { likes: likes.filter(u => u !== userId), likesCount: increment(-1) }); } else { await updateDoc(postRef, { likes: [...likes, userId], likesCount: increment(1) }); if (postSnap.data().authorId !== userId) await awardXP(postSnap.data().authorId, 2); } }

function listenLeaderboard(callback) { const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(100)); return onSnapshot(q, snap => { const users = []; snap.forEach((d, idx) => users.push({ rank: idx + 1, id: d.id, ...d.data() })); callback(users); }); }

const CHALLENGES = [ { id: 'lowca_wezy', title: '🏹 Łowca Węży', badge: '🏹', xp: 30 }, { id: 'tropiciel_hydry', title: '🐉 Tropiciel Hydry', badge: '🐉', xp: 50 }, { id: 'zgniatacz_wezy', title: '⚡ Zgniatacz Węży', badge: '⚡', xp: 40 }, { id: 'duch_areny', title: '👻 Duch Areny', badge: '👻', xp: 100 } ];

async function sendChallenge(challengerId, challengerName, targetId, targetName, challengeId) { const ch = CHALLENGES.find(c => c.id === challengeId); await addDoc(collection(db, 'challenge_invites'), { challengerId, challengerName, targetId, targetName, challengeId, challengeTitle: ch.title, challengeBadge: ch.badge, challengeXP: ch.xp, status: 'pending', quizPassed: false, expiresAt: Timestamp.fromDate(new Date(Date.now() + 72 * 3600000)), createdAt: serverTimestamp() }); await awardXP(challengerId, 5); showToast('Wyzwanie rzucone! ⚔️', 'success'); }

function listenChallenges(userId, callback) { const q = query(collection(db, 'challenge_invites'), where('targetId', '==', userId), orderBy('createdAt', 'desc')); return onSnapshot(q, snap => { const challenges = []; snap.forEach(d => challenges.push({ id: d.id, ...d.data() })); callback(challenges); }); }

async function completeChallenge(inviteId, userId) { const inviteRef = doc(db, 'challenge_invites', inviteId); const inviteSnap = await getDoc(inviteRef); const inviteData = inviteSnap.data(); await updateDoc(inviteRef, { status: 'completed', completedAt: serverTimestamp() }); await awardXP(userId, inviteData.challengeXP); await addDoc(collection(db, 'challenge_completions'), { userId, challengeId: inviteData.challengeId, challengeTitle: inviteData.challengeTitle, completedAt: serverTimestamp(), xpEarned: inviteData.challengeXP }); showToast(`🏆 Wyzwanie! +${inviteData.challengeXP} XP`, 'success'); }

async function sendLaga(requesterId, requesterName, targetId, targetName) { await addDoc(collection(db, 'laga_requests'), { requesterId, requesterName, targetId, targetName, status: 'pending', createdAt: serverTimestamp() }); await awardXP(requesterId, 10); showToast('🍺 Laga wysłana!', 'success'); }

function listenLaga(userId, callback) { const q = query(collection(db, 'laga_requests'), where('targetId', '==', userId), orderBy('createdAt', 'desc')); return onSnapshot(q, snap => { const lagas = []; snap.forEach(d => lagas.push({ id: d.id, ...d.data() })); callback(lagas); }); }

async function respondLaga(lagaId, status, userId) { const lagaRef = doc(db, 'laga_requests', lagaId); const lagaSnap = await getDoc(lagaRef); if (status === 'accepted') { await updateDoc(lagaRef, { status: 'accepted' }); await awardXP(userId, 15); await awardXP(lagaSnap.data().requesterId, 15); showToast('🍺 Zaakceptowana!', 'success'); } }

async function getOrCreateConversation(uid1, uid2) { const q = query(collection(db, 'conversations'), where('participants', 'array-contains', uid1)); const snap = await getDocs(q); for (const d of snap.docs) { if (d.data().participants.includes(uid2)) return d.id; } const convRef = await addDoc(collection(db, 'conversations'), { participants: [uid1, uid2], lastMessage: '', lastMessageAt: serverTimestamp(), lastMessageBy: uid1 }); return convRef.id; }

async function sendMessage(convId, senderId, senderName, text) { await addDoc(collection(db, 'conversations', convId, 'messages'), { senderId, senderName, text, type: 'text', imageURL: '', read: false, createdAt: serverTimestamp() }); const convRef = doc(db, 'conversations', convId); const convSnap = await getDoc(convRef); const otherId = convSnap.data().participants.find(p => p !== senderId); await updateDoc(convRef, { lastMessage: text.slice(0, 100), lastMessageAt: serverTimestamp(), lastMessageBy: senderId }); }

function listenConversations(userId, callback) { const q = query(collection(db, 'conversations'), where('participants', 'array-contains', userId), orderBy('lastMessageAt', 'desc')); return onSnapshot(q, snap => { const convs = []; snap.forEach(d => convs.push({ id: d.id, ...d.data() })); callback(convs); }); }

function listenMessages(convId, callback) { const q = query(collection(db, 'conversations', convId, 'messages'), orderBy('createdAt', 'asc')); return onSnapshot(q, snap => { const msgs = []; snap.forEach(d => msgs.push({ id: d.id, ...d.data() })); callback(msgs); }); }

async function createNotification(userId, { type, title, body, link = '' }) { await addDoc(collection(db, 'notifications', userId, 'items'), { type, title, body, link, read: false, createdAt: serverTimestamp() }); }

function listenNotifications(userId, callback) { const q = query(collection(db, 'notifications', userId, 'items'), orderBy('createdAt', 'desc'), limit(50)); return onSnapshot(q, snap => { const notifs = []; snap.forEach(d => notifs.push({ id: d.id, ...d.data() })); callback(notifs); }); }

window.WWS = { register, login, loginGoogle, logout, getUserProfile, awardXP, createPost, listenFeed, likePost, listenLeaderboard, sendChallenge, listenChallenges, completeChallenge, CHALLENGES, sendLaga, listenLaga, respondLaga, getOrCreateConversation, sendMessage, listenConversations, listenMessages, createNotification, listenNotifications, showToast, formatTime, escapeHtml, auth, db, app, onAuthStateChanged };

console.log('✅ WWS V4 App Ready');
