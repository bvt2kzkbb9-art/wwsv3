// ════════════════════════════════════════════════════════════════════════════════
// PROFILE SERVICE — Avatar, Banner, Bio, Nick Management
// ════════════════════════════════════════════════════════════════════════════════

class ProfileService {
  // Cloudinary config
  static CLOUDINARY_CLOUD = 'dxanfwb3l';
  static CLOUDINARY_AVATAR_PRESET = 'wws_avatar';
  static CLOUDINARY_BANNER_PRESET = 'wws_banner';

  // ════════════════════════════════════════════════════════════════════════════════
  // AVATAR UPLOAD
  // ════════════════════════════════════════════════════════════════════════════════

  static async uploadAvatar(file) {
    try {
      if (!file) {
        return { success: false, error: 'Nie wybrano pliku' };
      }

      // File validation
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return { success: false, error: 'Obsługiwane formaty: JPG, PNG, WebP' };
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return { success: false, error: 'Plik zbyt duży (max 5MB)' };
      }

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.CLOUDINARY_AVATAR_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Błąd uploadu na Cloudinary');
      }

      const data = await response.json();

      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id
      };
    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // BANNER UPLOAD
  // ════════════════════════════════════════════════════════════════════════════════

  static async uploadBanner(file) {
    try {
      if (!file) {
        return { success: false, error: 'Nie wybrano pliku' };
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return { success: false, error: 'Obsługiwane formaty: JPG, PNG, WebP' };
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return { success: false, error: 'Plik zbyt duży (max 10MB)' };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.CLOUDINARY_BANNER_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Błąd uploadu na Cloudinary');
      }

      const data = await response.json();

      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id
      };
    } catch (error) {
      console.error('❌ Banner upload failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // UPDATE AVATAR IN FIRESTORE
  // ════════════════════════════════════════════════════════════════════════════════

  static async updateAvatar(uid, avatarUrl) {
    try {
      if (!uid) {
        return { success: false, error: 'UID nie znaleziony' };
      }

      const userRef = db.collection('users').doc(uid);
      
      await userRef.update({
        photoURL: avatarUrl,
        updatedAt: new Date()
      });

      return { success: true, data: { photoURL: avatarUrl } };
    } catch (error) {
      console.error('❌ Failed to update avatar:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // UPDATE BANNER IN FIRESTORE
  // ════════════════════════════════════════════════════════════════════════════════

  static async updateBanner(uid, bannerUrl) {
    try {
      if (!uid) {
        return { success: false, error: 'UID nie znaleziony' };
      }

      const userRef = db.collection('users').doc(uid);
      
      await userRef.update({
        bannerURL: bannerUrl,
        updatedAt: new Date()
      });

      return { success: true, data: { bannerURL: bannerUrl } };
    } catch (error) {
      console.error('❌ Failed to update banner:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // UPDATE NICK
  // ════════════════════════════════════════════════════════════════════════════════

  static async updateNick(uid, newNick) {
    try {
      if (!uid) {
        return { success: false, error: 'UID nie znaleziony' };
      }

      if (!newNick || newNick.trim().length === 0) {
        return { success: false, error: 'Nick nie może być pusty' };
      }

      const nick = newNick.trim();

      if (nick.length < 3 || nick.length > 20) {
        return { success: false, error: 'Nick musi mieć 3-20 znaków' };
      }

      // Check if nick is unique
      const existingUser = await db.collection('users')
        .where('displayName', '==', nick)
        .where('uid', '!=', uid)
        .limit(1)
        .get();

      if (!existingUser.empty) {
        return { success: false, error: 'Ten nick jest już zajęty' };
      }

      const userRef = db.collection('users').doc(uid);
      
      await userRef.update({
        displayName: nick,
        updatedAt: new Date()
      });

      // Update auth profile
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.updateProfile({
          displayName: nick
        });
      }

      return { success: true, data: { displayName: nick } };
    } catch (error) {
      console.error('❌ Failed to update nick:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // UPDATE BIO
  // ════════════════════════════════════════════════════════════════════════════════

  static async updateBio(uid, newBio) {
    try {
      if (!uid) {
        return { success: false, error: 'UID nie znaleziony' };
      }

      const bio = (newBio || '').trim();

      if (bio.length > 500) {
        return { success: false, error: 'Bio może mieć max 500 znaków' };
      }

      const userRef = db.collection('users').doc(uid);
      
      await userRef.update({
        bio: bio,
        updatedAt: new Date()
      });

      return { success: true, data: { bio: bio } };
    } catch (error) {
      console.error('❌ Failed to update bio:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // GET FULL PROFILE
  // ════════════════════════════════════════════════════════════════════════════════

  static async getFullProfile(uid) {
    try {
      if (!uid) {
        return { success: false, error: 'UID nie znaleziony' };
      }

      const userSnap = await db.collection('users').doc(uid).get();
      
      if (!userSnap.exists) {
        return { success: false, error: 'Profil nie znaleziony' };
      }

      const userData = userSnap.data();
      // Support both old and new field names
      const displayName = userData.displayName || userData.nickname || 'Wojownik';
      const photoURL = userData.photoURL || userData.avatar || null;
      const bannerURL = userData.bannerURL || userData.banner || null;

      return {
        success: true,
        data: {
          uid: userData.uid,
          displayName,
          email: userData.email || '',
          photoURL,
          bannerURL,
          bio: userData.bio || '',
          specialization: userData.specialization || 'warrior',
          level: userData.level || 1,
          rank: userData.rank || 'Nowicjusz',
          xp: userData.xp || 0,
          totalXp: userData.totalXp || 0,
          elo: userData.elo || 1200,
          loginStreak: userData.loginStreak || 0,
          longestLoginStreak: userData.longestLoginStreak || 0,
          totalPostsCount: userData.totalPostsCount || 0,
          totalCommentsCount: userData.totalCommentsCount || 0,
          totalChallengesCompleted: userData.totalChallengesCompleted || 0,
          totalChallengesSent: userData.totalChallengesSent || 0,
          totalWarsWon: userData.totalWarsWon || 0,
          totalWarLosses: userData.totalWarLosses || 0,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          lastLoginAt: userData.lastLoginAt
        }
      };
    } catch (error) {
      console.error('❌ Failed to get profile:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // LISTEN TO PROFILE CHANGES (REAL-TIME)
  // ════════════════════════════════════════════════════════════════════════════════

  static listenToProfile(uid, callback) {
    try {
      console.log('📋 ProfileService.listenToProfile START:', { uid, dbExists: !!db });

      if (!uid) {
        console.error('❌ ProfileService.listenToProfile: UID is missing');
        callback({ success: false, error: 'UID nie znaleziony' });
        return null;
      }

      if (!db) {
        console.error('❌ ProfileService.listenToProfile: db is undefined');
        callback({ success: false, error: 'Firebase Firestore nie zainicjalizowany' });
        return null;
      }

      console.log('📋 ProfileService.listenToProfile: Setting up onSnapshot listener for users/' + uid);
      console.log('📋 ProfileService.listenToProfile: About to call db.collection().doc().onSnapshot()...');

      const unsubscribe = db.collection('users').doc(uid).onSnapshot(
        (doc) => {
          console.log('📋 ProfileService.listenToProfile: onSnapshot CALLBACK FIRED!', {
            exists: doc.exists,
            uid,
            docId: doc.id,
            docExists: !!doc
          });
          if (doc.exists) {
            const userData = doc.data();
            // Support both old (nickname, avatar, banner) and new (displayName, photoURL, bannerURL) field names
            const displayName = userData.displayName || userData.nickname || 'Wojownik';
            const photoURL = userData.photoURL || userData.avatar || null;
            const bannerURL = userData.bannerURL || userData.banner || null;

            console.log('📋 ProfileService.listenToProfile: Document data:', {
              displayName,
              email: userData.email,
              level: userData.level,
              rank: userData.rank,
              xp: userData.xp
            });
            callback({
              success: true,
              data: {
                uid: userData.uid,
                displayName,
                email: userData.email || '',
                photoURL,
                bannerURL,
                bio: userData.bio || '',
                specialization: userData.specialization || 'warrior',
                level: userData.level || 1,
                rank: userData.rank || 'Nowicjusz',
                xp: userData.xp || 0,
                totalXp: userData.totalXp || 0,
                elo: userData.elo || 1200,
                loginStreak: userData.loginStreak || 0,
                longestLoginStreak: userData.longestLoginStreak || 0
              }
            });
          } else {
            console.error('❌ ProfileService.listenToProfile: Document does not exist for uid:', uid);
            callback({ success: false, error: 'Profil nie znaleziony' });
          }
        },
        (error) => {
          console.error('❌ ProfileService.listenToProfile: onSnapshot ERROR CALLBACK FIRED!', {
            code: error.code,
            message: error.message,
            fullError: error.toString(),
            stack: error.stack,
            uid
          });
          callback({ success: false, error: 'Firestore error: ' + error.message });
        }
      );

      console.log('✅ ProfileService.listenToProfile: Listener setup complete');
      return unsubscribe;
    } catch (error) {
      console.error('❌ ProfileService.listenToProfile: Exception', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      callback({ success: false, error: error.message });
      return null;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // DELETE AVATAR
  // ════════════════════════════════════════════════════════════════════════════════

  static async deleteAvatar(uid) {
    try {
      if (!uid) {
        return { success: false, error: 'UID nie znaleziony' };
      }

      const userRef = db.collection('users').doc(uid);
      
      await userRef.update({
        photoURL: null,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete avatar:', error);
      return { success: false, error: error.message };
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // DELETE BANNER
  // ════════════════════════════════════════════════════════════════════════════════

  static async deleteBanner(uid) {
    try {
      if (!uid) {
        return { success: false, error: 'UID nie znaleziony' };
      }

      const userRef = db.collection('users').doc(uid);
      
      await userRef.update({
        bannerURL: null,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete banner:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProfileService };
}
