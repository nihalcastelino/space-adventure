# AdSense Verification Checklist for spacerace.games

## ✅ Site Status: ONLINE at spacerace.games

Your site is deployed! Now let's make sure AdSense can verify it.

---

## Verification Steps

### 1. ✅ Verify Site is Accessible

**Test your site:**
```bash
# Check if site loads
curl -I https://spacerace.games

# Should return: HTTP/2 200
```

**Browser Test:**
- Visit: https://spacerace.games
- Site should load without errors
- Check browser console for any blocking errors

---

### 2. ✅ Verify AdSense Script is Present

**Check page source:**
1. Visit https://spacerace.games
2. Right-click → "View Page Source"
3. Search for: `adsbygoogle`
4. **Should find:** `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9836174027317671"`

**If script is missing:**
- The script is now uncommented in `index.html`
- Rebuild and redeploy: `npm run build` then deploy
- Clear CDN cache if using Cloudflare/Netlify

---

### 3. ✅ Verify robots.txt Allows Google

**Check robots.txt:**
- Visit: https://spacerace.games/robots.txt
- Should see: `User-agent: *` and `Allow: /`
- Should allow: `Mediapartners-Google` (AdSense crawler)

**Current robots.txt:**
```
User-agent: *
Allow: /

User-agent: Mediapartners-Google
Allow: /
```

---

### 4. ✅ Create ads.txt File

**Required for AdSense verification!**

**File location:** `public/ads.txt`
**URL:** https://spacerace.games/ads.txt

**Content:**
```
google.com, pub-9836174027317671, DIRECT, f08c47fec0942fa0
```

**Verify it's accessible:**
- Visit: https://spacerace.games/ads.txt
- Should see the ads.txt content

**Note:** The `ads.txt` file has been created. Make sure it's deployed!

---

### 5. ✅ Check for Security Blocks

**Common issues:**

#### Cloudflare/Netlify Security
- **Check:** Security settings might block bots
- **Fix:** Allow Google crawlers in security settings
- **Netlify:** Settings → Security → Allow Google bots

#### Password Protection
- **Check:** Site shouldn't have password protection
- **Fix:** Remove any password/authentication gates

#### IP Whitelisting
- **Check:** No IP restrictions blocking Google
- **Fix:** Allow all IPs or whitelist Google IPs

---

### 6. ✅ Verify Site Content

**AdSense Requirements:**
- ✅ Sufficient content (you have game modes, features)
- ✅ Privacy Policy (created!)
- ✅ Clear navigation
- ✅ No "under construction" messages
- ✅ Original content (not copied)

---

### 7. ✅ Test Google Crawler Access

**Use Google Search Console:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://spacerace.games`
3. Verify ownership (HTML tag or DNS)
4. Request indexing
5. Check for crawl errors

**Test AdSense Crawler:**
```bash
# Test if AdSense can access your site
curl -A "Mediapartners-Google" https://spacerace.games

# Should return HTML content, not 403/401
```

---

### 8. ✅ Resubmit to AdSense

**After verifying everything:**

1. **Go to AdSense Dashboard**
2. **Click "Get Started"** (or resubmit if already submitted)
3. **Enter URL:** `https://spacerace.games`
4. **Verify:**
   - ✅ Site is accessible
   - ✅ AdSense script is in HTML
   - ✅ ads.txt is accessible
   - ✅ robots.txt allows Google

---

## Common "Site Down" Errors

### Error: "Site Down or Unavailable"

**Possible Causes:**
1. **CDN/Cache Issues**
   - Clear Netlify/Cloudflare cache
   - Wait 5-10 minutes for propagation

2. **HTTPS Issues**
   - Ensure HTTPS is enabled
   - Check SSL certificate is valid

3. **Security Headers**
   - Check for `X-Frame-Options` blocking
   - Check for CSP blocking scripts

4. **Server Errors**
   - Check Netlify/Vercel logs
   - Ensure site is actually running

5. **DNS Issues**
   - Verify DNS is pointing correctly
   - Check domain is resolving

---

## Quick Fixes

### Fix 1: Clear Cache & Redeploy

```bash
# Rebuild
npm run build

# Clear Netlify cache (if using Netlify)
netlify deploy --prod --clear-cache
```

### Fix 2: Verify ads.txt is Deployed

**Check:**
- Visit: https://spacerace.games/ads.txt
- Should see: `google.com, pub-9836174027317671, DIRECT, f08c47fec0942fa0`

**If missing:**
- File is in `public/ads.txt`
- Rebuild and redeploy
- Check Netlify build logs

### Fix 3: Check Security Settings

**Netlify:**
- Site settings → Security
- Ensure "Block bots" is OFF or allows Google

**Cloudflare (if used):**
- Security → WAF
- Allow Google crawlers
- Disable "Bot Fight Mode" temporarily

---

## Verification Checklist

Before resubmitting to AdSense:

- [ ] Site loads at https://spacerace.games
- [ ] AdSense script is in HTML (view source)
- [ ] robots.txt allows Google (check /robots.txt)
- [ ] ads.txt is accessible (check /ads.txt)
- [ ] No password protection
- [ ] HTTPS is enabled
- [ ] Privacy Policy is accessible
- [ ] Site has sufficient content
- [ ] No security blocking Google bots
- [ ] Site is not behind maintenance mode

---

## After Resubmission

1. **Wait 24-48 hours** for AdSense to crawl
2. **Check AdSense dashboard** for status updates
3. **Check Google Search Console** for crawl errors
4. **Monitor** for any verification issues

---

## Still Having Issues?

**Debug Steps:**

1. **Test site accessibility:**
   ```bash
   curl -I https://spacerace.games
   curl -A "Mediapartners-Google" https://spacerace.games
   ```

2. **Check page source:**
   - View source at https://spacerace.games
   - Verify AdSense script is present

3. **Check Netlify/Vercel logs:**
   - Look for any blocking or errors
   - Check build logs

4. **Test from different locations:**
   - Use VPN to test from different countries
   - Ensure site is globally accessible

---

**Your Site:** https://spacerace.games
**AdSense Client ID:** ca-pub-9836174027317671
**Status:** Ready for verification ✅

