// Firebase// Firebase Configuration & Initialization
const firebaseConfig = {
  apiKey: "AIzaSyBHwVgFJgsvOp1ZgU4nQetHM_KgzxeXzZI",
  authDomain: "weekend-warrior-social-v3.firebaseapp.com",
  projectId: "weekend-warrior-social-v3",
  storageBucket: "weekend-warrior-social-v2.firebasestorage.app",
  messagingSenderId: "147800031459",
  appId: "1:147800031459:web:d72e1fc2b81b8b152405d6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ════════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT SERVICE
// ════════════════════════════════════════════════════════════════════════════════

class UserService {
  // Create new user profile
  static async createUserProfile(uid, displayName, email, specialization) {
    try {
      console.log('📄 createUserProfile START:', { uid, displayName, email, specialization });

      const userRef = db.collection('users').doc(uid);
      console.log('Firestore reference created:', {
        collection: 'users',
        docId: uid,
        path: `users/${uid}`
      });

      const userData = {
        // User Identity
        uid,
        email,
        nickname: displayName || 'Warrior',
        specialization: specialization || 'warrior',

        // Profile
        avatar: '',
        banner: '',
        bio: '',

        // Progress & Stats
        xp: 0,
        level: 1,
        rank: 'Nowicjusz',
        elo: 1200,

        // Activity
        posts: [],
        friends: [],
        followers: [],
        loginStreak: 0,
        longestLoginStreak: 0,
        lastLoginAt: new Date(),

        // Counters
        totalPostsCount: 0,
        totalCommentsCount: 0,
        totalChallengesCompleted: 0,
        totalChallengesSent: 0,
        totalWarsWon: 0,
        totalWarLosses: 0,

        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('About to write to Firestore:', userData);
      await userRef.set(userData);
      console.log('✅ createUserProfile SUCCESS: Document written to users/' + uid);
      return { success: true, data: userData };
    } catch (error) {
      console.error('❌ FIRESTORE WRITE FAILED', {
        file: 'firebase-config.js',
        line: 22,
        function: 'UserService.createUserProfile',
        uid: uid,
        errorCode: error.code,
        errorMessage: error.message,
        fullError: error,
        stack: error.stack
      });
      return { success: false, error: error.message, code: error.code };
    }
  }

  // Get user profile
  static async getUserProfile(uid) {
    try {
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      
      if (!userSnap.exists) {
        return { success: false, error: 'User profile not found' };
      }

      return { success: true, data: userSnap.data() };
    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  static async updateUserProfile(uid, updates) {
    try {
      const userRef = db.collection('users').doc(uid);
      
      updates.updatedAt = new Date();
      
      await userRef.update(updates);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update user profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Award XP
  static async awardXP(uid, xpAmount, reason = 'Challenge completed') {
    try {
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      
      if (!userSnap.exists) {
        return { success: false, error: 'User not found' };
      }

      const user = userSnap.data();
      const newXp = (user.xp || 0) + xpAmount;
      const newTotalXp = (user.totalXp || 0) + xpAmount;
      
      // Calculate level (every 1000 XP = 1 level)
      const newLevel = Math.floor(newTotalXp / 1000) + 1;
      
      // Update rank based on level
      let newRank = 'Nowicjusz';
      if (newLevel >= 50) newRank = 'Legenda';
      else if (newLevel >= 30) newRank = 'Champion';
      else if (newLevel >= 15) newRank = 'Warrior';
      
      const updates = {
        xp: newXp,
        totalXp: newTotalXp,
        level: newLevel,
        rank: newRank,
        updatedAt: new Date()
      };

      await userRef.update(updates);
      
      // Log activity
      await this.logActivity(uid, 'xp_earned', {
        amount: xpAmount,
        reason,
        totalXp: newTotalXp
      });

      return { success: true, data: updates };
    } catch (error) {
      console.error('❌ Failed to award XP:', error);
      return { success: false, error: error.message };
    }
  }

  // Update login streak
  static async updateLoginStreak(uid) {
    try {
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      
      if (!userSnap.exists) {
        return { success: false, error: 'User not found' };
      }

      const user = userSnap.data();
      const lastLogin = user.lastLoginAt ? user.lastLoginAt.toDate() : null;
      const now = new Date();
      
      let newStreak = 1;
      if (lastLogin) {
        const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          newStreak = (user.loginStreak || 0) + 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }
      }

      const newLongestStreak = Math.max(newStreak, user.longestLoginStreak || 0);

      const updates = {
        loginStreak: newStreak,
        longestLoginStreak: newLongestStreak,
        lastLoginAt: new Date(),
        updatedAt: new Date()
      };

      await userRef.update(updates);
      
      return { success: true, data: updates };
    } catch (error) {
      console.error('❌ Failed to update login streak:', error);
      return { success: false, error: error.message };
    }
  }

  // Log activity
  static async logActivity(uid, type, data = {}) {
    try {
      const activityRef = db.collection('users').doc(uid).collection('activity').doc();
      
      await activityRef.set({
        type,
        data,
        timestamp: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to log activity:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user stats
  static async getUserStats(uid) {
    try {
      const userSnap = await db.collection('users').doc(uid).get();
      
      if (!userSnap.exists) {
        return { success: false, error: 'User not found' };
      }

      const user = userSnap.data();
      
      const stats = {
        level: user.level || 1,
        xp: user.xp || 0,
        totalXp: user.totalXp || 0,
        rank: user.rank || 'Nowicjusz',
        elo: user.elo || 1200,
        loginStreak: user.loginStreak || 0,
        longestLoginStreak: user.longestLoginStreak || 0,
        totalPostsCount: user.totalPostsCount || 0,
        totalCommentsCount: user.totalCommentsCount || 0,
        totalChallengesCompleted: user.totalChallengesCompleted || 0,
        totalChallengesSent: user.totalChallengesSent || 0,
        totalWarsWon: user.totalWarsWon || 0,
        totalWarLosses: user.totalWarLosses || 0
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to user profile changes
  static listenToUserProfile(uid, callback) {
    try {
      const unsubscribe = db.collection('users').doc(uid).onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({ success: true, data: doc.data() });
          } else {
            callback({ success: false, error: 'User not found' });
          }
        },
        (error) => {
          console.error('❌ Error listening to user profile:', error);
          callback({ success: false, error: error.message });
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to setup listener:', error);
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// AUTH SERVICE
// ════════════════════════════════════════════════════════════════════════════════

class AuthService {
  // Register new user
  static async registerUser(email, password, displayName, specialization) {
    try {
      console.log('📝 Registration START:', { email, displayName, specialization });

      // Step 1: Create user with email/password
      console.log('Step 1: Calling createUserWithEmailAndPassword...');
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      console.log('✅ Step 1 SUCCESS:', { uid: cred.user.uid, email: cred.user.email });
      console.log('Return value from createUserWithEmailAndPassword:', {
        user: {
          uid: cred.user.uid,
          email: cred.user.email,
          emailVerified: cred.user.emailVerified,
          displayName: cred.user.displayName,
          photoURL: cred.user.photoURL
        },
        credential: cred.credential ? 'EXISTS' : 'NULL'
      });

      // Step 2: Update auth profile
      console.log('Step 2: Calling updateProfile...');
      await cred.user.updateProfile({
        displayName
      });
      console.log('✅ Step 2 SUCCESS: Profile updated');

      // Step 3: Check if auth.currentUser exists
      console.log('Step 3: Checking auth.currentUser...');
      console.log('auth.currentUser:', {
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        displayName: auth.currentUser?.displayName,
        exists: !!auth.currentUser
      });

      // Step 4: Create user document in Firestore
      console.log('Step 4: Calling createUserProfile (Firestore)...');
      const result = await UserService.createUserProfile(
        cred.user.uid,
        displayName,
        email,
        specialization
      );
      console.log('✅ Step 4 SUCCESS:', result);

      if (!result.success) {
        throw new Error('Failed to create user profile: ' + result.error);
      }

      console.log('✅ REGISTRATION COMPLETE:', { uid: cred.user.uid });
      return { success: true, uid: cred.user.uid };
    } catch (error) {
      console.error('❌ REGISTRATION FAILED', {
        file: 'firebase-config.js',
        line: 271,
        function: 'AuthService.registerUser',
        errorCode: error.code,
        errorMessage: error.message,
        fullError: error,
        stack: error.stack
      });
      return { success: false, error: error.message, code: error.code };
    }
  }

  // Login user
  static async loginUser(email, password) {
    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      
      // Update login streak
      await UserService.updateLoginStreak(cred.user.uid);
      
      return { success: true, uid: cred.user.uid };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Login with Google
  static async loginWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const cred = await auth.signInWithPopup(provider);
      
      // Check if user exists
      const userSnap = await db.collection('users').doc(cred.user.uid).get();
      
      if (!userSnap.exists) {
        // Create new user profile for Google sign-in
        await UserService.createUserProfile(
          cred.user.uid,
          cred.user.displayName,
          cred.user.email,
          'warrior' // default specialization
        );
      }

      // Update login streak
      await UserService.updateLoginStreak(cred.user.uid);
      
      return { success: true, uid: cred.user.uid };
    } catch (error) {
      console.error('❌ Google login failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout user
  static async logoutUser() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('❌ Logout failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  static getCurrentUser() {
    return auth.currentUser;
  }

  // Watch auth state changes
  static onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }

  // Update password
  static async updatePassword(newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      await user.updatePassword(newPassword);
      return { success: true };
    } catch (error) {
      console.error('❌ Password update failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset password
  static async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export services
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UserService, AuthService, db, auth, storage };
}
