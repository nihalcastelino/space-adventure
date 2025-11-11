# 🔗 Update Supabase for Production URL

## ✅ Your Production URL

**Production Site:** `https://spacerace.games`

---

## 🔧 Update Supabase Site URL

### Step 1: Go to Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (the one shared with bible-service)
3. Go to **Settings** → **Authentication**

### Step 2: Update Site URL

**Current (Development):**
```
http://localhost:3000
```

**Update to (Production):**
```
https://spacerace.games
```

**How to update:**
1. Find **"Site URL"** field
2. Replace `http://localhost:3000` with `https://spacerace.games`
3. Click **"Save"**

---

## 🔄 Add Redirect URLs (Optional but Recommended)

For better flexibility, you can add multiple redirect URLs:

### In Supabase Dashboard → Settings → Authentication:

1. Scroll to **"Redirect URLs"** section
2. Click **"Add URL"**
3. Add these URLs:
   - `http://localhost:3000` (for local development)
   - `http://localhost:5173` (Vite default port, if you use it)
   - `https://spacerace.games` (production)
   - `https://spacerace.games/*` (allows any path)

4. Click **"Save"**

---

## ✅ Why This Matters

**Site URL** is where Supabase redirects users **after** OAuth authentication completes.

**Current Flow:**
1. User clicks "Sign in with Google"
2. Redirected to Google
3. User authorizes
4. Google redirects to Supabase: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Supabase processes OAuth
6. Supabase redirects to **Site URL** with tokens in hash
7. Your app processes tokens and cleans up URL

**If Site URL is wrong:**
- OAuth will fail or redirect to wrong place
- Users might see errors
- Tokens might not be processed correctly

---

## 🧪 Test After Update

1. **Test Local Development:**
   - Change Site URL back to `http://localhost:3000` temporarily
   - Test Google sign-in locally
   - Should work as before

2. **Test Production:**
   - Set Site URL to `https://spacerace.games`
   - Deploy to Netlify
   - Test Google sign-in on production site
   - Should redirect correctly and clean up URL

---

## 📝 Quick Checklist

- [ ] Go to Supabase Dashboard → Settings → Authentication
- [ ] Update **Site URL** to `https://spacerace.games`
- [ ] (Optional) Add redirect URLs for both dev and production
- [ ] Click **"Save"**
- [ ] Test OAuth on production site

---

## 🔄 Switching Between Dev and Production

**Option 1: Use Redirect URLs (Recommended)**
- Add both URLs to Redirect URLs list
- Keep Site URL as production: `https://spacerace.games`
- Both will work automatically

**Option 2: Manual Switch**
- For local dev: Change Site URL to `http://localhost:3000`
- For production: Change Site URL to `https://spacerace.games`
- Remember to switch back when deploying

**Option 3: Use Environment-Specific Supabase Projects**
- Create separate Supabase projects for dev/prod
- Use different `.env` files
- More complex but better isolation

---

## ✅ Summary

**Action Required:**
1. Update Supabase **Site URL** to `https://spacerace.games`
2. (Optional) Add redirect URLs for flexibility
3. Test OAuth on production

**Current Status:**
- ✅ Webhook configured for `https://spacerace.games`
- ✅ OAuth callback cleanup code in place
- ⚠️ Need to update Supabase Site URL for production

After updating, OAuth should work seamlessly on your production site! 🚀

