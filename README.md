# Weekend Warrior Social V3

Polish fitness social app - Arena Wojowników

## Setup

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Configure: `firebase init`
3. Deploy rules: `firebase deploy --only firestore:rules`
4. Deploy indexes: `firebase deploy --only firestore:indexes`
5. Deploy hosting: `firebase deploy --only hosting`

## Development

- Edit files in `js/` and `css/`
- Test locally: `firebase emulators:start`
- Push to GitHub
- Deploy to production

## Architecture V3

- Core modules: firebase.js, auth.js, users.js, feed.js, etc.
- Clean Firestore schema: 8 collections only
- No code duplication
- All logic in JS, HTML markup only
