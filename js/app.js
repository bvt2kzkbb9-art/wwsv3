const firebaseConfig = {
  apiKey: "AIzaSyBHwVgFJgsvOp1ZgU4nQetHM_KgzxeXzZI",
  authDomain: "weekend-warrior-social-v2.firebaseapp.com",
  projectId: "weekend-warrior-social-v2",
  storageBucket: "weekend-warrior-social-v2.firebasestorage.app",
  messagingSenderId: "147800031459",
  appId: "1:147800031459:web:d72e1fc2b81b8b152405d6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===================== SYSTEM 1: USER MANAGEMENT =====================
async function createUserProfile(uid, email, displayName, photoURL = '') {
  const now = firebase.firestore.FieldValue.serverTimestamp();
  await db.collection('users').doc(uid).set({
    uid, email, displayName, username: displayName.toLowerCase().replace(/\s+/g, '_'),
    photoURL, bannerURL: '', bio: '', level: 1, rank: 'Rookie', points: 0, elo: 1200,
    streak: 0, loginStreak: 1, totalPostsCount: 0, totalCommentsCount: 0,
    totalChallengesCompleted: 0, totalChallengesSent: 0, totalWarsWon: 0, totalWarLosses: 0,
    createdAt: now, lastLoginAt: now, lastActiveAt: now
  });
}

async function getUserProfile(uid) {
  const snap = await db.collection('users').doc(uid).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function awardXP(uid, amount) {
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) return;
  const current = snap.data().points || 0;
  const newPoints = current + amount;
  const newLevel = Math.floor(newPoints / 500) + 1;
  let rank = 'Rookie';
  if (newPoints >= 10000) rank = 'Legend';
  else if (newPoints >= 2000) rank = 'Champion';
  else if (newPoints >= 500) rank = 'Warrior';
  await ref.update({ points: newPoints, level: newLevel, rank, lastActiveAt: firebase.firestore.FieldValue.serverTimestamp() });
}

// ===================== SYSTEM 2: FRIENDS SYSTEM =====================
async function sendFriendRequest(fromId, toId) {
  await db.collection('friend_requests').add({
    fromId, toId, status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await createNotification(toId, { type: 'friend_request', title: 'Nowa prośba o przyjaźń', body: 'Ktoś chce być Twoim przyjacielem' });
}

async function acceptFriendRequest(reqId, userId, friendId) {
  await db.collection('friend_requests').doc(reqId).update({ status: 'accepted' });
  await db.collection('friends').add({ userId, friendId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  await db.collection('friends').add({ userId: friendId, friendId: userId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
}

function listenFriends(userId, callback) {
  return db.collection('friends').where('userId', '==', userId).onSnapshot(snap => {
    const friends = [];
    snap.forEach(d => friends.push({ id: d.id, ...d.data() }));
    callback(friends);
  });
}

// ===================== SYSTEM 3: FOLLOWERS SYSTEM =====================
async function followUser(userId, followerId) {
  await db.collection('followers').add({ userId, followerId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  await db.collection('users').doc(userId).update({ followers: firebase.firestore.FieldValue.increment(1) });
  await createNotification(userId, { type: 'follow', title: 'Nowy obserwator!', body: 'Ktoś obserwuje Twój profil' });
}

async function unfollowUser(userId, followerId) {
  const snap = await db.collection('followers').where('userId', '==', userId).where('followerId', '==', followerId).get();
  snap.forEach(d => d.ref.delete());
}

function listenFollowers(userId, callback) {
  return db.collection('followers').where('userId', '==', userId).onSnapshot(snap => {
    callback(snap.size);
  });
}

// ===================== SYSTEM 4: ZACZEPKA (DUEL) =====================
async function sendZaczepka(challengerId, challengerName, targetId) {
  await db.collection('zaczepka').add({
    challengerId, challengerName, targetId, status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await createNotification(targetId, { type: 'zaczepka', title: '⚔️ Zaczepka!', body: challengerName + ' rzuca Ci wyzwanie!' });
}

function listenZaczepka(userId, callback) {
  return db.collection('zaczepka').where('targetId', '==', userId).onSnapshot(snap => {
    const challenges = [];
    snap.forEach(d => challenges.push({ id: d.id, ...d.data() }));
    callback(challenges);
  });
}

async function acceptZaczepka(zaczepkaId, winnerId, loserId) {
  const ref = db.collection('zaczepka').doc(zaczepkaId);
  const snap = await ref.get();
  await ref.update({ status: 'completed', winnerId });
  await awardXP(winnerId, 50);
  await db.collection('wars').add({
    warrior1Id: snap.data().challengerId, warrior2Id: loserId, winnerId,
    xpReward: 50, status: 'completed',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ===================== SYSTEM 5: ZRÓB LAGĘ =====================
async function sendLaga(requesterId, requesterName, targetId) {
  await db.collection('laga').add({
    requesterId, requesterName, targetId, status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await createNotification(targetId, { type: 'laga', title: '🍺 Zrób Lagę!', body: requesterName + ' zapraszają Cię na lagę!' });
}

function listenLaga(userId, callback) {
  return db.collection('laga').where('targetId', '==', userId).onSnapshot(snap => {
    const lagas = [];
    snap.forEach(d => lagas.push({ id: d.id, ...d.data() }));
    callback(lagas);
  });
}

async function acceptLaga(lagaId, userId) {
  const ref = db.collection('laga').doc(lagaId);
  await ref.update({ status: 'accepted' });
  await awardXP(userId, 25);
}

// ===================== SYSTEM 6: KARNA LAGA =====================
async function reportKarnaLaga(userId, reason) {
  await db.collection('karna_laga').add({
    userId, reason, status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ===================== SYSTEM 7: WARRIOR WARS =====================
async function startWar(warrior1Id, warrior2Id) {
  const war = await db.collection('wars').add({
    warrior1Id, warrior2Id, status: 'active', winnerId: null,
    xpReward: 100, createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await createNotification(warrior2Id, { type: 'war', title: '⚔️ Nowa Wojna!', body: 'Wojownik Cię wyzwał!' });
  return war.id;
}

function listenActiveWars(callback) {
  return db.collection('wars').where('status', '==', 'active').onSnapshot(snap => {
    const wars = [];
    snap.forEach(d => wars.push({ id: d.id, ...d.data() }));
    callback(wars);
  });
}

// ===================== SYSTEM 8: ELO RANKING =====================
async function updateELO(winner, loser) {
  const wRef = db.collection('users').doc(winner);
  const lRef = db.collection('users').doc(loser);
  const wSnap = await wRef.get();
  const lSnap = await lRef.get();

  const wELO = wSnap.data().elo || 1200;
  const lELO = lSnap.data().elo || 1200;

  const K = 32;
  const expectedW = 1 / (1 + Math.pow(10, (lELO - wELO) / 400));
  const expectedL = 1 / (1 + Math.pow(10, (wELO - lELO) / 400));

  const newWELO = Math.round(wELO + K * (1 - expectedW));
  const newLELO = Math.round(lELO + K * (0 - expectedL));

  await wRef.update({ elo: newWELO, totalWarsWon: firebase.firestore.FieldValue.increment(1) });
  await lRef.update({ elo: newLELO, totalWarLosses: firebase.firestore.FieldValue.increment(1) });
}

function listenELORanking(callback) {
  return db.collection('users').orderBy('elo', 'desc').limit(100).onSnapshot(snap => {
    const ranking = [];
    snap.forEach((d, i) => ranking.push({ rank: i + 1, id: d.id, ...d.data() }));
    callback(ranking);
  });
}

// ===================== SYSTEM 9: HALL OF FAME (TOP 100) =====================
function listenHallOfFame(callback) {
  return db.collection('users').orderBy('points', 'desc').limit(100).onSnapshot(snap => {
    const top = [];
    snap.forEach((d, i) => top.push({ rank: i + 1, id: d.id, ...d.data() }));
    callback(top);
  });
}

// ===================== SYSTEM 10: ACHIEVEMENTS & BADGES =====================
const ACHIEVEMENTS = [
  { id: 'first_post', name: 'Pierwszy Post', icon: '📝', xp: 10 },
  { id: 'level_10', name: 'Poziom 10', icon: '⬆️', xp: 50 },
  { id: 'friend_10', name: '10 Przyjaciół', icon: '👥', xp: 100 },
  { id: 'warrior_master', name: 'Mistrz Wojen', icon: '⚔️', xp: 200 },
  { id: 'legend', name: 'Legenda', icon: '👑', xp: 500 }
];

async function unlockAchievement(userId, achievementId) {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return;

  await db.collection('userAchievements').add({
    userId, achievementId, name: achievement.name, icon: achievement.icon,
    unlockedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await awardXP(userId, achievement.xp);
  await createNotification(userId, { type: 'achievement', title: 'Osiągnięcie!', body: 'Odblokowałeś: ' + achievement.name });
}

function listenAchievements(userId, callback) {
  return db.collection('userAchievements').where('userId', '==', userId).onSnapshot(snap => {
    const achievements = [];
    snap.forEach(d => achievements.push({ id: d.id, ...d.data() }));
    callback(achievements);
  });
}

// ===================== SYSTEM 11: ACTIVITY FEED =====================
async function createActivityPost(userId, userName, userPhoto, content, imageURL = '') {
  await db.collection('posts').add({
    authorId: userId, authorName: userName, authorPhotoURL: userPhoto,
    content, imageURL, likes: [], likesCount: 0, reactions: {}, reactionsCount: 0, commentsCount: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await awardXP(userId, 10);
  await db.collection('users').doc(userId).update({ totalPostsCount: firebase.firestore.FieldValue.increment(1) });
}

function listenFeed(callback) {
  return db.collection('posts').orderBy('createdAt', 'desc').limit(50).onSnapshot(snap => {
    const posts = [];
    snap.forEach(d => posts.push({ id: d.id, ...d.data() }));
    callback(posts);
  });
}

async function likePost(postId, userId) {
  const ref = db.collection('posts').doc(postId);
  const snap = await ref.get();
  const likes = snap.data().likes || [];

  if (likes.includes(userId)) {
    await ref.update({ likes: likes.filter(l => l !== userId), likesCount: firebase.firestore.FieldValue.increment(-1) });
  } else {
    await ref.update({ likes: [...likes, userId], likesCount: firebase.firestore.FieldValue.increment(1) });
    if (snap.data().authorId !== userId) await awardXP(snap.data().authorId, 2);
  }
}

// ===================== SYSTEM 12: MISSION COMMENTS =====================
async function addPostComment(postId, authorId, authorName, content) {
  const ref = db.collection('posts').doc(postId).collection('comments');
  await ref.add({
    authorId, authorName, content, likes: [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await db.collection('posts').doc(postId).update({ commentsCount: firebase.firestore.FieldValue.increment(1) });
  await awardXP(authorId, 5);
}

function listenPostComments(postId, callback) {
  return db.collection('posts').doc(postId).collection('comments').orderBy('createdAt', 'asc').onSnapshot(snap => {
    const comments = [];
    snap.forEach(d => comments.push({ id: d.id, ...d.data() }));
    callback(comments);
  });
}

// ===================== SYSTEM 13: EMOJI REACTIONS =====================
async function addReaction(postId, emoji, userId) {
  const ref = db.collection('posts').doc(postId);
  const snap = await ref.get();
  const reactions = snap.data().reactions || {};

  if (!reactions[emoji]) reactions[emoji] = [];
  if (!reactions[emoji].includes(userId)) {
    reactions[emoji].push(userId);
  }

  await ref.update({ reactions });
}

// ===================== SYSTEM 14: REAL-TIME NOTIFICATIONS =====================
async function createNotification(userId, { type, title, body, link = '' }) {
  await db.collection('notifications').doc(userId).collection('items').add({
    type, title, body, link, read: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function listenNotifications(userId, callback) {
  return db.collection('notifications').doc(userId).collection('items').orderBy('createdAt', 'desc').limit(50).onSnapshot(snap => {
    const notifs = [];
    snap.forEach(d => notifs.push({ id: d.id, ...d.data() }));
    callback(notifs);
  });
}

// ===================== SYSTEM 15: USER STATS DASHBOARD =====================
async function getUserStats(userId) {
  const user = await getUserProfile(userId);
  if (!user) return null;

  const posts = await db.collection('posts').where('authorId', '==', userId).get();
  const friends = await db.collection('friends').where('userId', '==', userId).get();
  const followers = await db.collection('followers').where('userId', '==', userId).get();

  return {
    ...user,
    totalPosts: posts.size,
    totalFriends: friends.size,
    totalFollowers: followers.size
  };
}

// ===================== SYSTEM 16: LOGIN STREAKS =====================
async function updateLoginStreak(userId) {
  const ref = db.collection('users').doc(userId);
  const snap = await ref.get();
  const lastLogin = snap.data().lastLoginAt?.toDate() || new Date();
  const today = new Date();

  const diffTime = Math.abs(today - lastLogin);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = snap.data().loginStreak || 1;
  if (diffDays === 1) {
    newStreak = (snap.data().loginStreak || 0) + 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  await ref.update({ loginStreak: newStreak, lastLoginAt: firebase.firestore.FieldValue.serverTimestamp() });
  return newStreak;
}

// ===================== SYSTEM 17: DAILY QUESTS =====================
const DAILY_QUESTS = [
  { id: 'daily_post', title: 'Opublikuj Post', xp: 20, icon: '📝' },
  { id: 'daily_like', title: 'Polub 5 Postów', xp: 15, icon: '❤️' },
  { id: 'daily_friend', title: 'Zaproś Przyjaciela', xp: 25, icon: '👥' }
];

async function completeQuestDaily(userId, questId) {
  const quest = DAILY_QUESTS.find(q => q.id === questId);
  if (!quest) return;

  await db.collection('userQuests').add({
    userId, questId, type: 'daily', title: quest.title,
    completed: true, completedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  await awardXP(userId, quest.xp);
}

// ===================== SYSTEM 18: WEEKLY QUESTS =====================
const WEEKLY_QUESTS = [
  { id: 'weekly_warrior', title: 'Wygraj 3 Wojny', xp: 100, icon: '⚔️' },
  { id: 'weekly_social', title: '20 Nowych Znajomych', xp: 150, icon: '👥' }
];

// ===================== SYSTEM 19: RANDOM ARENA EVENTS =====================
async function createArenaEvent() {
  const events = [
    { type: 'double_xp', description: 'Podwójne XP na 1 godzinę!', icon: '⚡' },
    { type: 'wars_bonus', description: 'Bonus XP w Wojnach!', icon: '⚔️' },
    { type: 'friend_challenge', description: 'Wyzwanie z Przyjaciółmi!', icon: '👥' }
  ];

  const event = events[Math.floor(Math.random() * events.length)];
  await db.collection('arenaEvents').add({
    ...event, active: true,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    expiresAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 3600000))
  });
}

function listenArenaEvents(callback) {
  return db.collection('arenaEvents').where('active', '==', true).onSnapshot(snap => {
    const events = [];
    snap.forEach(d => events.push({ id: d.id, ...d.data() }));
    callback(events);
  });
}

// ===================== SYSTEM 20: PREMIUM ANIMATIONS =====================
function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slideUp`;
  toast.textContent = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '1rem 1.5rem';
  toast.style.background = type === 'success' ? '#16C784' : '#EF4444';
  toast.style.color = 'white';
  toast.style.borderRadius = '8px';
  toast.style.zIndex = '9999';
  toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate?.() || new Date(timestamp);
  const diff = Math.floor((new Date() - date) / 1000);
  if (diff < 60) return 'teraz';
  if (diff < 3600) return Math.floor(diff / 60) + 'm temu';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h temu';
  return date.toLocaleDateString('pl-PL');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export all functions
window.WWS = {
  createUserProfile, getUserProfile, awardXP,
  sendFriendRequest, acceptFriendRequest, listenFriends,
  followUser, unfollowUser, listenFollowers,
  sendZaczepka, listenZaczepka, acceptZaczepka,
  sendLaga, listenLaga, acceptLaga,
  reportKarnaLaga,
  startWar, listenActiveWars,
  updateELO, listenELORanking,
  listenHallOfFame,
  unlockAchievement, listenAchievements, ACHIEVEMENTS,
  createActivityPost, listenFeed, likePost,
  addPostComment, listenPostComments,
  addReaction,
  createNotification, listenNotifications,
  getUserStats,
  updateLoginStreak,
  completeQuestDaily, DAILY_QUESTS, WEEKLY_QUESTS,
  createArenaEvent, listenArenaEvents,
  showToast, formatTime, escapeHtml,
  auth, db, firebase
};

console.log('✅ WWS V5 Premium Engine Loaded');
