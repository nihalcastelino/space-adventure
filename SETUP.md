# Setup Instructions

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Realtime Database
   - Copy your Firebase config

3. **Create `.env` file**
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Error: Cannot find module 'googleapis'
- This is typically needed for MCP servers or Firebase Admin SDK
- We've added it to dependencies - run `npm install` again
- For client-side Firebase (what we're using), it's not strictly required but won't hurt

### Firebase connection issues
- Verify all environment variables are set correctly
- Check that Realtime Database is enabled in Firebase Console
- Ensure security rules allow read/write (see `database.rules.json`)

### Build errors
- Make sure Node.js 18+ is installed
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

