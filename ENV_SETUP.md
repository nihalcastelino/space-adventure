# Environment Variables Setup

This guide explains how to set up environment variables for Space Adventure.

## Quick Start (Local Development)

**For local testing, you don't need to set up any environment variables!**

The game will work perfectly in **Local Game** mode without any credentials. Only **Online Multiplayer** and **Authentication** features require these.

## Creating .env File

1. **Create a `.env` file** in the root of the `space-adventure` folder
2. **Copy the template** from `.env.example` (if it exists) or use the template below
3. **Fill in your credentials** (only if you want online features)

## Environment Variables

### Supabase (Optional - for Authentication)

Required for:
- User authentication
- User profiles
- Premium features
- Leaderboards (cloud storage)

Get credentials from: https://app.supabase.com/project/_/settings/api

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Firebase (Optional - for Online Multiplayer)

Required for:
- Online multiplayer games
- Real-time game synchronization
- Room creation and joining

Get credentials from: https://console.firebase.google.com/project/_/settings/general

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Complete .env Template

```env
# Supabase Configuration (Optional)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Firebase Configuration (Optional)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## What Works Without Credentials

✅ **Local Game Mode** - Full functionality
✅ **AI Game Mode** - Full functionality  
✅ **All game mechanics** - Aliens, spaceports, checkpoints, etc.
✅ **Local storage** - Game history, leaderboards (stored locally)
✅ **All visual features** - Backgrounds, animations, effects

## What Requires Credentials

❌ **Online Multiplayer** - Requires Firebase
❌ **User Authentication** - Requires Supabase
❌ **Cloud Leaderboards** - Requires Supabase
❌ **Premium Features** - Requires Supabase + Stripe

## Troubleshooting

### "Firebase is not configured" Error

**This is normal!** If you're not using online multiplayer, you can ignore this warning. The game will work fine in local mode.

### "Supabase credentials not found" Warning

**This is normal!** If you're not using authentication, you can ignore this warning. The game will work fine without it.

### Errors in Console

The game is designed to gracefully handle missing credentials. You'll see warnings but the game will still work. Only the features that require those services will be disabled.

## Restart Dev Server

After creating or updating your `.env` file:

1. **Stop the dev server** (Ctrl+C)
2. **Restart it**: `npm run dev`
3. Environment variables are loaded on server start

## Security Notes

- **Never commit `.env` files** to git (already in `.gitignore`)
- **Never share your credentials** publicly
- **Use different credentials** for development and production
- The `.env.example` file is safe to commit (no real credentials)

## Need Help?

- Check the setup guides:
  - `SUPABASE_SETUP.md` - For Supabase configuration
  - `FIREBASE_SETUP.md` - For Firebase configuration
- The game works great without these - try Local Game mode first!

