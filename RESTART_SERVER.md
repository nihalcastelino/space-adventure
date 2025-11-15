# Restart Dev Server to Load .env

After adding or updating your `.env` file, you need to restart the Vite dev server for the environment variables to be loaded.

## How to Restart

1. **Stop the current server**: Press `Ctrl+C` in the terminal where the dev server is running

2. **Start it again**:
   ```powershell
   npm run dev
   ```

## Verify Environment Variables Loaded

After restarting, check the browser console. You should see:

✅ **If Supabase is configured:**
```
✅ Supabase configured successfully
📡 Supabase URL: https://...
```

✅ **If Firebase is configured:**
```
✅ Firebase configured successfully
📡 Firebase Database URL: https://...
```

❌ **If not configured (this is OK for local testing):**
```
❌ Supabase not configured - using localStorage fallback
❌ Firebase not configured - online multiplayer disabled
```

## Quick Restart Command

If you're in the project directory:
```powershell
# Stop (Ctrl+C) then:
npm run dev
```

The server will restart on **http://localhost:5173/**

