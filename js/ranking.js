// ════════════════════════════════════════════════════════════════════════════════
// RANKING SERVICE — TOP 100, TOP 3 PODIUM, FRIENDS RANKING, WEEKLY
// ════════════════════════════════════════════════════════════════════════════════

class RankingService {
  // Default avatar (base64 or URL)
  static DEFAULT_AVATAR = '⚔';
  static DEFAULT_RANK = 'Rookie';

  // ════════════════════════════════════════════════════════════════════════════════
  // GET TOP 100 RANKING
  // ════════════════════════════════════════════════════════════════════════════════

  static async getTop100() {
    try {
      // Fetch all users
      const usersSnap = await db.collection('users').get();

      if (usersSnap.empty) {
        return { success: true, data: [] };
      }

      // Map and validate users
      const users = [];
      usersSnap.forEach((doc) => {
        const user = doc.data();
        
        // Validate required fields
        if (!user.uid || !user.displayName) {
          console.warn('⚠️ Invalid user doc:', doc.id);
          return; // Skip invalid users
        }

        // Support both old (nickname, avatar) and new (displayName, photoURL) field names
        const displayName = user.displayName || user.nickname || 'Unknown';
        const photoURL = user.photoURL || user.avatar || null;

        users.push({
          uid: user.uid,
          displayName,
          photoURL,
          level: parseInt(user.level) || 1,
          xp: parseInt(user.xp) || 0,
          totalXp: parseInt(user.totalXp) || 0,
          rank: user.rank || this.DEFAULT_RANK,
          elo: parseInt(user.elo) || 1200,
          specialization: user.specialization || 'warrior',
          totalWarsWon: parseInt(user.totalWarsWon) || 0,
          totalWarLosses: parseInt(user.totalWarLosses) || 0,
          createdAt: user.createdAt || new Date()
        });
      });

      // Sort: XP descending, then Level descending
      users.sort((a, b) => {
        if (b.totalXp !== a.totalXp) {
          return b.totalXp - a.totalXp;
        }
        return b.level - a.level;
      });

      // Add position
      const ranking = users.slice(0, 100).map((user, index) => ({
        position: index + 1,
        ...user
      }));

      return { success: true, data: ranking };
    } catch (error) {
      console.error('❌ Failed to get top 100:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // GET TOP 3 PODIUM
  // ════════════════════════════════════════════════════════════════════════════════

  static async getTop3() {
    try {
      const result = await this.getTop100();

      if (!result.success) {
        return result;
      }

      const top3 = result.data.slice(0, 3);

      return { success: true, data: top3 };
    } catch (error) {
      console.error('❌ Failed to get top 3:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // GET USER POSITION IN RANKING
  // ════════════════════════════════════════════════════════════════════════════════

  static async getUserPosition(uid) {
    try {
      if (!uid) {
        return { success: false, error: 'UID required' };
      }

      const result = await this.getTop100();

      if (!result.success) {
        return result;
      }

      const ranking = result.data;
      const userPosition = ranking.findIndex((u) => u.uid === uid);

      if (userPosition === -1) {
        return { success: true, position: null };
      }

      return {
        success: true,
        position: userPosition + 1,
        data: ranking[userPosition]
      };
    } catch (error) {
      console.error('❌ Failed to get user position:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // GET FRIENDS RANKING
  // ════════════════════════════════════════════════════════════════════════════════

  static async getFriendsRanking(uid) {
    try {
      if (!uid) {
        return { success: false, error: 'UID required' };
      }

      // Get friends
      const friendsSnap = await db.collection('friends')
        .where('userId', '==', uid)
        .where('status', '==', 'accepted')
        .get();

      if (friendsSnap.empty) {
        return { success: true, data: [] };
      }

      // Get friend UIDs
      const friendUids = [];
      friendsSnap.forEach((doc) => {
        friendUids.push(doc.data().friendId);
      });

      // Get all ranking
      const allRanking = await this.getTop100();

      if (!allRanking.success) {
        return allRanking;
      }

      // Filter to friends
      const friendsRanking = allRanking.data
        .filter((u) => friendUids.includes(u.uid))
        .map((user, index) => ({
          ...user,
          friendPosition: index + 1
        }));

      return { success: true, data: friendsRanking };
    } catch (error) {
      console.error('❌ Failed to get friends ranking:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // GET WEEKLY RANKING (last 7 days)
  // ════════════════════════════════════════════════════════════════════════════════

  static async getWeeklyRanking() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get all users
      const usersSnap = await db.collection('users').get();

      if (usersSnap.empty) {
        return { success: true, data: [] };
      }

      // Calculate weekly XP gained
      const users = [];
      usersSnap.forEach((doc) => {
        const user = doc.data();
        const displayName = user.displayName || user.nickname || 'Unknown';

        if (!user.uid || !displayName) {
          return;
        }

        // Get activity from last 7 days
        const lastLoginAt = user.lastLoginAt ? new Date(user.lastLoginAt.toDate?.() || user.lastLoginAt) : null;
        const isActive = lastLoginAt && lastLoginAt > sevenDaysAgo;
        const photoURL = user.photoURL || user.avatar || null;

        users.push({
          uid: user.uid,
          displayName,
          photoURL,
          level: parseInt(user.level) || 1,
          xp: parseInt(user.xp) || 0,
          totalXp: parseInt(user.totalXp) || 0,
          rank: user.rank || this.DEFAULT_RANK,
          elo: parseInt(user.elo) || 1200,
          specialization: user.specialization || 'warrior',
          isActive: isActive,
          lastLoginAt: lastLoginAt
        });
      });

      // Filter active users only
      const activeUsers = users.filter((u) => u.isActive);

      // Sort by XP
      activeUsers.sort((a, b) => {
        if (b.xp !== a.xp) {
          return b.xp - a.xp;
        }
        return b.level - a.level;
      });

      // Add position
      const ranking = activeUsers.slice(0, 100).map((user, index) => ({
        position: index + 1,
        ...user
      }));

      return { success: true, data: ranking };
    } catch (error) {
      console.error('❌ Failed to get weekly ranking:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // LISTEN TO TOP 100 CHANGES (REAL-TIME)
  // ════════════════════════════════════════════════════════════════════════════════

  static listenToTop100(callback) {
    try {
      let unsubscribes = [];

      // Listen to all users changes
      const unsubscribe = db.collection('users').onSnapshot(
        async (snapshot) => {
          const result = await this.getTop100();
          if (result.success) {
            callback({ success: true, data: result.data });
          } else {
            callback(result);
          }
        },
        (error) => {
          console.error('❌ Listener error:', error);
          callback({ success: false, error: error.message });
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to setup listener:', error);
      callback({ success: false, error: error.message });
      return null;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // LISTEN TO TOP 3 CHANGES
  // ════════════════════════════════════════════════════════════════════════════════

  static listenToTop3(callback) {
    try {
      const unsubscribe = db.collection('users').onSnapshot(
        async (snapshot) => {
          const result = await this.getTop3();
          if (result.success) {
            callback({ success: true, data: result.data });
          } else {
            callback(result);
          }
        },
        (error) => {
          console.error('❌ Listener error:', error);
          callback({ success: false, error: error.message });
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to setup listener:', error);
      callback({ success: false, error: error.message });
      return null;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // VALIDATE USER DATA
  // ════════════════════════════════════════════════════════════════════════════════

  static validateUser(user) {
    return {
      uid: user.uid || null,
      displayName: user.displayName || user.nickname || 'Unknown',
      photoURL: user.photoURL || user.avatar || null,
      level: Math.max(1, parseInt(user.level) || 1),
      xp: Math.max(0, parseInt(user.xp) || 0),
      totalXp: Math.max(0, parseInt(user.totalXp) || 0),
      rank: user.rank || this.DEFAULT_RANK,
      elo: Math.max(0, parseInt(user.elo) || 1200),
      specialization: user.specialization || 'warrior'
    };
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // GET RANKING STATS
  // ════════════════════════════════════════════════════════════════════════════════

  static async getRankingStats() {
    try {
      const top100Result = await this.getTop100();

      if (!top100Result.success) {
        return top100Result;
      }

      const ranking = top100Result.data;

      const stats = {
        totalUsers: ranking.length,
        totalActiveUsers: ranking.filter((u) => u.totalXp > 0).length,
        averageLevel: ranking.length > 0 
          ? (ranking.reduce((sum, u) => sum + u.level, 0) / ranking.length).toFixed(1)
          : 0,
        highestLevel: ranking.length > 0 ? ranking[0].level : 0,
        highestXp: ranking.length > 0 ? ranking[0].totalXp : 0,
        topUser: ranking.length > 0 ? ranking[0] : null
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('❌ Failed to get ranking stats:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RankingService };
}
