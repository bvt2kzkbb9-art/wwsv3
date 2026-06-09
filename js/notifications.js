export async function createNotification(userId, data) {
  console.log('[Notifications] Created:', data);
}

export function listenNotifications(userId, callback) {
  callback([]);
  return () => {};
}

export async function markAsRead(userId, notifId) {
  console.log('[Notifications] Marked as read:', notifId);
}
