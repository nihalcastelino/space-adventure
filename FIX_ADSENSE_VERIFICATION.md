# Fix AdSense "Site Down" Error for spacerace.games

## ✅ Your Site is Online!

**URL:** https://spacerace.games

The "Site down or unavailable" error usually means AdSense can't properly crawl or verify your site. Here's how to fix it:

---

## Immediate Actions Required

### 1. ✅ Verify AdSense Script is in HTML

**Check your live site:**
1. Visit: https://spacerace.games
2. Right-click → "View Page Source"
3. Search for: `adsbygoogle`
4. **Should find:** The AdSense script tag

**If missing:**
- The script is now uncommented in `index.html`
- **Rebuild and redeploy:**
  ```bash
  npm run build
  # Then deploy to Netlify
  ```

---

### 2. ✅ Create ads.txt File (CRITICAL!)

**File created:** `public/ads.txt`

**Content:**
```
google.com, pub-9836174027317671, DIRECT, f08c47fec0942fa0
```

**Verify it's accessible:**
- Visit: https://spacerace.games/ads.txt
- Should see the ads.txt content
- If 404, rebuild and redeploy

**Why it's needed:**
- AdSense REQUIRES ads.txt for verification
- Proves you own the domain
- Must be at root: `/ads.txt`

---

### 3. ✅ Check robots.txt

**File:** `public/robots.txt` (already created)

**Verify:**
- Visit: https://spacerace.games/robots.txt
- Should allow: `User-agent: *` and `Allow: /`
- Should allow: `Mediapartners-Google` (AdSense crawler)

---

### 4. ✅ Check Netlify Security Settings

**In Netlify Dashboard:**

1. **Go to:** Site settings → Security
2. **Check:**
   - ✅ "Block bots" is OFF (or allows Google)
   - ✅ No IP restrictions blocking Google
   - ✅ No password protection enabled

3. **If using Cloudflare:**
   - Security → WAF
   - Allow Google crawlers
   - Disable "Bot Fight Mode" temporarily

---

### 5. ✅ Verify Site Accessibility

**Test from command line:**
```bash
# Test basic access
curl -I https://spacerace.games

# Test as Google crawler
curl -A "Mediapartners-Google" -I https://spacerace.games

# Both should return: HTTP/2 200
```

**If you get 403/401:**
- Site is blocking crawlers
- Check Netlify security settings
- Check for IP whitelisting

---

### 6. ✅ Check for Maintenance Mode

**Make sure:**
- Site is not in maintenance mode
- No "Coming Soon" pages
- Site is fully functional

---

### 7. ✅ Verify Privacy Policy

**Required for AdSense!**

- Visit: https://spacerace.games
- Privacy Policy should be accessible
- Can be accessed via consent banner link

---

## Deployment Checklist

**Before resubmitting to AdSense:**

1. ✅ **Rebuild site:**
   ```bash
   npm run build
   ```

2. ✅ **Deploy to Netlify:**
   - Push to GitHub (if using Git)
   - Or drag & drop `dist` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod`

3. ✅ **Verify files are deployed:**
   - https://spacerace.games (main site)
   - https://spacerace.games/robots.txt
   - https://spacerace.games/ads.txt
   - https://spacerace.games/index.html (should have AdSense script)

4. ✅ **Clear Netlify cache:**
   - Netlify Dashboard → Deploys → Clear cache
   - Or: `netlify deploy --prod --clear-cache`

---

## Common Issues & Fixes

### Issue: ads.txt Returns 404

**Fix:**
- File is in `public/ads.txt`
- Rebuild: `npm run build`
- Redeploy to Netlify
- Check Netlify build logs

### Issue: AdSense Script Not in HTML

**Fix:**
- Script is uncommented in `index.html`
- Rebuild and redeploy
- Check build output includes `index.html`
- Verify in browser: View Source → Search "adsbygoogle"

### Issue: Site Blocks Google Crawlers

**Fix:**
- Netlify: Settings → Security → Allow Google bots
- Remove any IP restrictions
- Check `netlify.toml` headers (updated to allow crawlers)

### Issue: HTTPS/SSL Issues

**Fix:**
- Ensure HTTPS is enabled in Netlify
- Check SSL certificate is valid
- AdSense requires HTTPS

---

## Resubmit to AdSense

**After fixing everything:**

1. **Wait 5-10 minutes** after deploying (for CDN propagation)

2. **Verify everything:**
   - ✅ Site loads: https://spacerace.games
   - ✅ ads.txt accessible: https://spacerace.games/ads.txt
   - ✅ robots.txt allows Google
   - ✅ AdSense script in HTML
   - ✅ Privacy Policy accessible

3. **Resubmit to AdSense:**
   - Go to [AdSense Dashboard](https://www.google.com/adsense/)
   - Click "Get Started" or resubmit
   - Enter: `https://spacerace.games`
   - Submit

4. **Wait for review:**
   - Usually 1-2 weeks
   - Check dashboard regularly

---

## Quick Test Commands

```bash
# Test site accessibility
curl -I https://spacerace.games

# Test ads.txt
curl https://spacerace.games/ads.txt

# Test robots.txt
curl https://spacerace.games/robots.txt

# Test as Google crawler
curl -A "Mediapartners-Google" https://spacerace.games
```

---

## Files Updated

✅ `index.html` - AdSense script uncommented
✅ `public/ads.txt` - Created for AdSense verification
✅ `public/robots.txt` - Allows Google crawlers
✅ `netlify.toml` - Updated headers to allow crawlers

**Next Step:** Rebuild and redeploy!

```bash
npm run build
# Then deploy to Netlify
```

---

**Your Site:** https://spacerace.games
**Status:** Ready for AdSense verification ✅

