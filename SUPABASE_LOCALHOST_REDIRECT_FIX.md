# 🔧 Fix: OAuth Redirects to Production Instead of Localhost

## Problem
When signing in on `localhost:3000` or `localhost:3001`, Supabase redirects you to the production URL (`https://spacerace.games`) instead of back to localhost.

## Root Cause
Supabase uses the **Site URL** setting as the default redirect destination. Even if your code specifies `redirectTo: window.location.origin`, Supabase will only honor it if that URL is in the **Redirect URLs** allowlist.

## Solution

### Step 1: Add Localhost URLs to Supabase Redirect URLs

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **Authentication**
4. Scroll to **"Redirect URLs"** section
5. Click **"Add URL"** and add these URLs:
   - `http://localhost:3000`
   - `http://localhost:3000/**` (allows any path)
   - `http://localhost:3001`
   - `http://localhost:3001/**` (allows any path)
   - `http://localhost:5173` (Vite default)
   - `http://localhost:5173/**` (allows any path)
6. Click **"Save"**

### Step 2: Verify Site URL (Optional)

The **Site URL** can remain set to production (`https://spacerace.games`). The Redirect URLs list will allow localhost redirects even if Site URL is production.

**However**, if you want to switch between dev and production frequently:

1. **For Development:**
   - Set **Site URL** to: `http://localhost:3000`
   - Keep production URL in **Redirect URLs** list

2. **For Production:**
   - Set **Site URL** to: `https://spacerace.games`
   - Keep localhost URLs in **Redirect URLs** list

### Step 3: Test

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000` (or whatever port Vite uses)

3. Click **Sign In** → **Continue with Google**

4. After Google authentication, you should be redirected back to:
   - ✅ `http://localhost:3000` (or your dev port)
   - ❌ NOT `https://spacerace.games`

## How It Works

The code now explicitly uses:
```javascript
redirectTo: `${window.location.origin}${window.location.pathname}`
```

This means:
- On `localhost:3000` → redirects to `http://localhost:3000`
- On `localhost:3001` → redirects to `http://localhost:3001`
- On production → redirects to `https://spacerace.games`

**But** Supabase will only honor this if the URL is in the Redirect URLs allowlist!

## Troubleshooting

### Still redirecting to production?

1. **Check browser console** - Look for the log: `OAuth redirect URL: http://localhost:XXXX`
2. **Verify Redirect URLs** - Make sure localhost URLs are in Supabase Dashboard
3. **Clear browser cache** - OAuth state might be cached
4. **Check Google OAuth settings** - Make sure `http://localhost:3000` is in Authorized JavaScript origins

### "Redirect URI mismatch" error?

This means the redirect URL isn't in Supabase's allowlist. Add it to **Settings** → **Authentication** → **Redirect URLs**.

---

**Note:** The code has been updated to log the redirect URL to the console. Check the browser console when clicking "Sign in with Google" to see what URL is being used.

