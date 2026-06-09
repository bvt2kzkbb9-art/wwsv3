import { showToast } from './ui.js';

export async function createPost(authorId, authorName, authorPhotoURL, content, imageURL = '') {
  showToast('Post created!', 'success');
  return 'post-id';
}

export function listenFeed(callback, limit_count = 50) {
  callback([]);
  return () => {};
}

export async function likePost(postId, userId) {
  console.log('[Feed] Like:', postId);
}

export async function addComment(postId, authorId, authorName, authorPhotoURL, content) {
  return 'comment-id';
}

export async function deletePost(postId, authorId) {
  console.log('[Feed] Delete:', postId);
}
