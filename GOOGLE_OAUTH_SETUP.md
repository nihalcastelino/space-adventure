# 🔐 Google OAuth Setup Guide

## Overview

Google OAuth allows users to sign in with their Google account with just one click - no password needed!

## Prerequisites

- ✅ Supabase project created
- ✅ Environment variables configured (`.env` file)
- ✅ Basic auth system working (email/password)

---

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project (or select existing):
   - Click "Select a project" → "New Project"
   - Name it: `Space Adventure` (or your choice)
   - Click "Create"

### 1.2 Configure OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required fields:
   - **App name:** Space Adventure (or your choice)
   - **User support email:** Your email address
   - **Developer contact information:** Your email address
5. Click **Save and Continue**
6. **Scopes:** Leave default (no need to add any), click **Save and Continue**
7. **Test users:** Add your email address (for testing), click **Save and Continue**
8. Review and click **Back to Dashboard**

**Note:** For production, you'll need to publish the app, but for testing you can add test users.

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Create OAuth client:
   - **Application type:** Web application
   - **Name:** Space Adventure Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (for development)
     - `https://your-domain.com` (for production - add when ready)
   - **Authorized redirect URIs:**
     - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
     - Replace `YOUR_SUPABASE_PROJECT` with your actual Supabase project reference ID
   - Click **Create**

4. **Copy your credentials:**
   - **Client ID:** `xxxxx.apps.googleusercontent.com`
   - **Client Secret:** `xxxxx` (keep this secret!)

---

## Step 2: Configure Supabase

### 2.1 Enable Google Provider

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** in the list
5. Click **Enable Google**

### 2.2 Add Google Credentials

1. **Client ID (for Google OAuth):** Paste your Google Client ID
2. **Client Secret (for Google OAuth):** Paste your Google Client Secret
3. Click **Save**

### 2.3 Verify Redirect URL

Supabase automatically adds the redirect URL. It should be:
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Make sure this exact URL is in your Google OAuth **Authorized redirect URIs** list!

---

## Step 3: Test Google Sign-In

### 3.1 Start Your Dev Server

```bash
npm run dev
```

### 3.2 Test the Flow

1. Open your app: `http://localhost:5173`
2. Click **Sign In** button (top right)
3. Click **Continue with Google**
4. You should be redirected to Google sign-in
5. Sign in with your Google account
6. You'll be redirected back to your app
7. ✅ You should now be signed in!

---

## How It Works

### The Flow:

```
1. User clicks "Continue with Google"
   ↓
2. App redirects to Google sign-in page
   ↓
3. User signs in with Google account
   ↓
4. Google redirects back to Supabase callback URL
   ↓
5. Supabase creates/updates user account
   ↓
6. Supabase redirects back to your app
   ↓
7. User is signed in! 🎉
```

### What Happens Behind the Scenes:

1. **User clicks Google button** → `signInWithGoogle()` is called
2. **Supabase handles OAuth flow** → Redirects to Google
3. **Google authenticates** → User signs in
4. **Google redirects to Supabase** → With authorization code
5. **Supabase exchanges code** → For user info
6. **User profile created** → In `auth.users` table
7. **Game profile created** → Trigger creates `space_adventure_profiles` entry
8. **User redirected back** → To your app, signed in

---

## Troubleshooting

### "OAuth state parameter missing" or "bad_oauth_callback"

**Problem:** Redirects to your app with `?error=invalid_request&error_code=bad_oauth_callback`

**Solution:**
1. **Check redirect URI in Google Cloud Console:**
   - Must be exactly: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Should NOT include your app URL (only Supabase callback URL)
   
2. **Verify Supabase Site URL:**
   - Go to Supabase Dashboard → Settings → Authentication
   - **Site URL** should be: `http://localhost:3000` (for dev)
   - This is where Supabase redirects AFTER handling the OAuth callback

3. **Check Authorized JavaScript Origins:**
   - In Google Cloud Console, add: `http://localhost:3000`
   - This allows your app to initiate OAuth

4. **Clear browser cache/cookies** and try again

### "Redirect URI mismatch"

**Problem:** Google says redirect URI doesn't match

**Solution:**
1. Check your Google OAuth redirect URI in Google Cloud Console
2. It must be exactly: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
3. Get your project ref from Supabase Dashboard → Settings → API → Project URL
4. **Important:** The redirect URI goes to Supabase, NOT your app directly

### "OAuth consent screen not configured"

**Problem:** Google shows consent screen error

**Solution:**
1. Go to Google Cloud Console → APIs & Services → OAuth consent screen
2. Complete all required fields
3. Add your email as a test user (if app is in testing mode)
4. Publish the app (if ready for production)

### "Invalid client"

**Problem:** Supabase shows "Invalid client" error

**Solution:**
1. Double-check Client ID and Client Secret in Supabase
2. Make sure there are no extra spaces
3. Verify the credentials are from the correct Google Cloud project

### Google Sign-In Works But User Profile Not Created

**Problem:** User signs in but no profile in `space_adventure_profiles`

**Solution:**
1. Check if the trigger exists in Supabase:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_space_adventure';
   ```
2. If missing, run the SQL from `SUPABASE_SETUP.md` Step 3
3. Check Supabase logs for errors

---

## Production Checklist

Before going live:

- [ ] Add production domain to Google OAuth authorized origins
- [ ] Add production redirect URI to Google OAuth
- [ ] Publish OAuth consent screen (if ready)
- [ ] Test Google sign-in on production domain
- [ ] Verify user profiles are created correctly
- [ ] Test room creation with Google-authenticated users

---

## Security Notes

### Client Secret

- ✅ **Safe to use in Supabase:** The client secret is stored server-side in Supabase
- ✅ **Not exposed to browser:** Only the Client ID is used in your frontend code
- ✅ **Supabase handles security:** All OAuth exchanges happen server-side

### Redirect URIs

- ✅ **Only add trusted domains:** Don't add random URLs
- ✅ **Use HTTPS in production:** Never use HTTP for production redirects
- ✅ **Keep localhost for dev:** Only use `http://localhost` for development

---

## Code Reference

The Google sign-in is already implemented in:

- **Hook:** `src/hooks/useAuth.js` → `signInWithGoogle()`
- **Component:** `src/components/AuthModal.jsx` → Google button
- **Flow:** Automatic redirect handling

No code changes needed - just configure Google Cloud and Supabase!

---

## Quick Reference

### Google Cloud Console
- **URL:** https://console.cloud.google.com/
- **Credentials:** APIs & Services → Credentials
- **Consent Screen:** APIs & Services → OAuth consent screen

### Supabase Dashboard
- **URL:** https://app.supabase.com/
- **Google Provider:** Authentication → Providers → Google
- **Project URL:** Settings → API → Project URL (for redirect URI)

---

## Need Help?

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs: Dashboard → Logs → Auth Logs
3. Verify redirect URI matches exactly
4. Ensure OAuth consent screen is configured
5. Test with a different Google account

---

**That's it!** Once configured, users can sign in with one click using their Google account! 🚀

