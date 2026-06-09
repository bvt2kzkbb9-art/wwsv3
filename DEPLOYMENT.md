# WEEKEND WARRIOR SOCIAL V3 — DEPLOYMENT GUIDE

## SETUP

### 1. Firebase Project Setup

```bash
# Create new project at https://console.firebase.google.com
# Project name: "weekend-warrior-social-v3"
# Select: Analytics ON, Firestore, Authentication, Hosting
```

### 2. Configure Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
# Select: Hosting, Firestore
# Use default options (. as directory)
```

### 3. Update Configuration

Edit `js/firebase.js` and replace:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "1:YOUR_ID:web:YOUR_APP_ID"
};
```

Find these values in Firebase Console → Project Settings

### 4. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 5. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### 6. Configure Authentication

In Firebase Console:
- Enable Email/Password auth
- Enable Google OAuth
  - Add authorized domain
  - Add OAuth redirect URIs

### 7. Deploy to Hosting

```bash
firebase deploy
```

## GITHUB PAGES (Alternative)

```bash
# Create repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/weekend-warrior-social-v3
git push -u origin main

# Enable GitHub Pages in repo settings
# Set branch to 'main' and root directory
```

## CLOUDINARY (Optional - For Image Upload)

1. Sign up at cloudinary.com
2. Create unsigned upload preset
3. Update `js/storage.js` with cloud name and preset

## TESTING

```bash
# Local Firebase emulator
firebase emulators:start

# Test at: http://localhost:5000
```

## TROUBLESHOOTING

### "Module not found" Error
- Clear browser cache
- Check file paths are correct
- Ensure all files are in correct directories

### Authentication not working
- Check Firebase config
- Verify auth is enabled in Firebase Console
- Check authorized domains

### Firestore queries returning empty
- Deploy firestore.rules
- Deploy firestore.indexes.json
- Wait 5-10 minutes for indexes to build

## SUPPORT

- Firebase Docs: https://firebase.google.com/docs
- Project Issues: Check browser console (F12)
- Error logs: Firebase Console → Logs
