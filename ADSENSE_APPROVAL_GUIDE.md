# Google AdSense Approval Guide

## Why AdSense Says "Site Down or Unavailable"

Google AdSense needs to **crawl your website** to verify it's operational before approval. If you're getting this error, it means:

1. **Site not publicly accessible** - AdSense can't reach your site
2. **Site not deployed** - Still running on localhost
3. **Wrong URL submitted** - Typo in the domain
4. **Site blocking crawlers** - robots.txt or security blocking Google

---

## Step-by-Step Approval Process

### 1. Deploy Your Site First ✅

**Before submitting to AdSense, your site MUST be live and publicly accessible.**

#### Option A: Deploy to Netlify (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add AdSense integration"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Click "Deploy site"

3. **Get your live URL:**
   - Netlify will give you a URL like: `https://your-site-name.netlify.app`
   - Or set up a custom domain: `https://spacerace.games`

#### Option B: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Get your live URL

#### Option C: Deploy to Other Hosting

- **GitHub Pages:** Free hosting for static sites
- **Cloudflare Pages:** Fast CDN hosting
- **AWS S3 + CloudFront:** Enterprise hosting

---

### 2. Verify Site is Accessible

**Before submitting to AdSense, verify:**

✅ Site loads at your domain (e.g., `https://spacerace.games`)
✅ No password protection
✅ No IP whitelisting blocking Google
✅ robots.txt allows Google crawlers (or doesn't exist)
✅ HTTPS is enabled (required for AdSense)

**Test your site:**
```bash
# Check if site is accessible
curl -I https://your-site.com

# Should return 200 OK
```

---

### 3. Add AdSense Script to HTML

**Important:** AdSense needs to see the script tag in your HTML for verification.

#### Update `index.html`:

```html
<!-- Google AdSense - Add BEFORE closing </head> tag -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9836174027317671"
     crossorigin="anonymous"></script>
```

**Current Status:** The script is commented out. **Uncomment it for AdSense approval**, then you can comment it again after approval if you prefer dynamic loading.

---

### 4. Create robots.txt (Optional but Recommended)

Create `public/robots.txt`:

```
User-agent: *
Allow: /

# Allow Google AdSense crawlers
User-agent: Mediapartners-Google
Allow: /

Sitemap: https://your-site.com/sitemap.xml
```

---

### 5. Submit to AdSense

1. **Go to [Google AdSense](https://www.google.com/adsense/)**
2. **Sign in** with your Google account
3. **Click "Get Started"**
4. **Enter your website URL:**
   - Use your **live, deployed URL** (e.g., `https://spacerace.games`)
   - **NOT** `localhost` or `127.0.0.1`
   - **NOT** a development URL
5. **Select your country**
6. **Choose payment method**

---

### 6. Add AdSense Code to Site

**After submitting, AdSense will ask you to add code to your site:**

1. **Copy the AdSense code** from AdSense dashboard
2. **Add to `index.html`** (already done if you uncommented the script)
3. **Verify the code is present** on your live site:
   - Visit your live site
   - View page source
   - Search for "adsbygoogle"
   - Should find the script tag

---

### 7. Wait for Review

- **Review time:** Usually 1-2 weeks
- **Status:** Check AdSense dashboard regularly
- **During review:** You may see placeholder/test ads

---

## Common Issues & Solutions

### Issue: "Site Down or Unavailable"

**Causes:**
- Site not deployed yet
- Wrong URL submitted (typo)
- Site behind password protection
- Site blocking Google crawlers

**Solutions:**
1. ✅ Deploy site to Netlify/Vercel/etc
2. ✅ Verify site is accessible: `curl https://your-site.com`
3. ✅ Check robots.txt allows Google
4. ✅ Remove any password protection
5. ✅ Ensure HTTPS is enabled

### Issue: "Site Not Ready"

**Causes:**
- Not enough content
- Site under construction
- Missing privacy policy
- No clear navigation

**Solutions:**
1. ✅ Add more content (game modes, features, etc.)
2. ✅ Add Privacy Policy page (already created!)
3. ✅ Add clear navigation
4. ✅ Remove "under construction" messages

### Issue: "Invalid Site"

**Causes:**
- Domain not verified
- Site not owned by you
- Wrong AdSense account

**Solutions:**
1. ✅ Verify domain ownership
2. ✅ Use correct Google account
3. ✅ Ensure you own the domain

---

## Quick Checklist

Before submitting to AdSense:

- [ ] Site is deployed and publicly accessible
- [ ] Site loads at your domain (not localhost)
- [ ] HTTPS is enabled
- [ ] AdSense script is in `index.html` (uncommented)
- [ ] Privacy Policy page exists and is accessible
- [ ] Site has sufficient content
- [ ] No password protection
- [ ] robots.txt allows Google (or doesn't exist)
- [ ] Site is not under construction

---

## After Approval

Once approved:

1. ✅ Ads will start showing automatically
2. ✅ You can keep dynamic loading (current implementation)
3. ✅ Monitor revenue in AdSense dashboard
4. ✅ Optimize ad placement for better revenue

---

## Current Status

**Your AdSense Setup:**
- ✅ Client ID: `ca-pub-9836174027317671`
- ✅ Script loading: Dynamic (via component)
- ✅ Consent management: GDPR compliant
- ✅ Premium integration: Ads hidden for premium users

**What's Needed:**
- ⏳ Deploy site to production
- ⏳ Uncomment AdSense script in `index.html` (for verification)
- ⏳ Submit live URL to AdSense
- ⏳ Wait for approval

---

## Next Steps

1. **Deploy your site** to Netlify/Vercel/etc
2. **Uncomment the AdSense script** in `index.html`
3. **Verify site is accessible** at your domain
4. **Submit to AdSense** with your live URL
5. **Wait for approval** (1-2 weeks)

Once approved, you can comment the script again and use dynamic loading if preferred.

---

**Need Help?**
- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)

