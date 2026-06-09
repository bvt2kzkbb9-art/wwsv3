/**
 * FEED MODULE
 * Posts, comments, reactions
 */

import { db, COL, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion, arrayRemove, increment } from './firebase.js';
import { showToast } from './ui.js';
import { awardXP, incrementStat } from './users.js';

export async function createPost(authorId, authorName, authorPhotoURL, content, imageURL = '') {
  try {
    const postRef = await addDoc(collection(db, COL.POSTS), {
      authorId,
      authorName,
      authorPhotoURL,
      content,
      imageURL,
      likes: [],
      likesCount: 0,
      reactions: {},
      reactionsCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp()
    });
    
    await awardXP(authorId, 10, 'Post created');
    await incrementStat(authorId, 'totalPostsCount');
    
    showToast('Post opublikowany! 🎉', 'success');
    return postRef.id;
  } catch (err) {
    console.error('[Feed] Create post error:', err);
    showToast(err.message, 'error');
    throw err;
  }
}

export function listenFeed(callback, limit_count = 50) {
  try {
    const q = query(
      collection(db, COL.POSTS),
      orderBy('createdAt', 'desc'),
      limit(limit_count)
    );
    
    return onSnapshot(q, (snap) => {
      const posts = [];
      snap.forEach(d => posts.push({ id: d.id, ...d.data() }));
      callback(posts);
    }, (err) => {
      console.error('[Feed] Listen error:', err);
      callback([]);
    });
  } catch (err) {
    console.error('[Feed] Listen setup error:', err);
    return () => {};
  }
}

export async function likePost(postId, userId) {
  try {
    const postRef = doc(db, COL.POSTS, postId);
    const postSnap = await getDoc(postRef);
    const postData = postSnap.data();
    const isLiked = postData.likes?.includes(userId);
    
    if (isLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
        likesCount: increment(-1)
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
        likesCount: increment(1)
      });
      
      if (postData.authorId !== userId) {
        await awardXP(postData.authorId, 2, 'Post liked');
      }
    }
  } catch (err) {
    console.error('[Feed] Like error:', err);
    throw err;
  }
}

export async function addComment(postId, authorId, authorName, authorPhotoURL, content) {
  try {
    const commentRef = await addDoc(collection(db, COL.POSTS, postId, 'comments'), {
      authorId,
      authorName,
      authorPhotoURL,
      content,
      likes: [],
      likesCount: 0,
      createdAt: serverTimestamp()
    });
    
    const postRef = doc(db, COL.POSTS, postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });
    
    await incrementStat(authorId, 'totalCommentsCount');
    
    return commentRef.id;
  } catch (err) {
    console.error('[Feed] Add comment error:', err);
    throw err;
  }
}

export async function deletePost(postId, authorId) {
  try {
    await deleteDoc(doc(db, COL.POSTS, postId));
    await incrementStat(authorId, 'totalPostsCount', -1);
    showToast('Post usunięty', 'success');
  } catch (err) {
    console.error('[Feed] Delete post error:', err);
    throw err;
  }
}
