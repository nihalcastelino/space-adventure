# 📱 PWA Setup Guide

## Overview

Space Adventure is now configured as a Progressive Web App (PWA) that can be installed on mobile and desktop devices for a native app-like experience.

## ✅ What's Already Configured

### 1. Service Worker (`public/sw.js`)
- ✅ Offline caching strategy (Network-first, fallback to cache)
- ✅ Auto-updates on new versions
- ✅ Registered in `src/main.jsx`
- ✅ Skips Vite HMR and extension URLs
- ✅ Handles notifications

### 2. Web Manifest (`public/manifest.json`)
- ✅ App name and description
- ✅ Theme colors (yellow #fbbf24)
- ✅ Display mode: standalone
- ✅ Icon references (need to create actual files)
- ✅ Screenshots (need to create actual files)
- ✅ App shortcuts (Local/Online game modes)
- ✅ Categories (games, entertainment)

### 3. HTML Meta Tags (`index.html`)
- ✅ PWA manifest link
- ✅ Theme color
- ✅ Apple touch icons
- ✅ Mobile web app capable
- ✅ Microsoft tiles
- ✅ Standard favicon

### 4. Install Prompt (`src/components/InstallPrompt.jsx`)
- ✅ Detects if app is already installed
- ✅ Shows install prompt on Android/Chrome (with native UI)
- ✅ Shows custom instructions on iOS
- ✅ Dismissible with 7-day cooldown
- ✅ Beautiful gradient UI matching game theme
- ✅ Slide-up animation

## ❌ What You Need to Create

### PWA Icons

You need to create icon files in the `public/` directory with these exact names:

**Required sizes:**
- `icon-72x72.png` (72×72px)
- `icon-96x96.png` (96×96px)
- `icon-128x128.png` (128×128px)
- `icon-144x144.png` (144×144px)
- `icon-152x152.png` (152×152px)
- `icon-192x192.png` (192×192px) - **Most important** (Android home screen)
- `icon-384x384.png` (384×384px)
- `icon-512x512.png` (512×512px) - **Most important** (Splash screen)

**Optional (but recommended):**
- `screenshot-mobile.png` (540×720px) - Mobile screenshot
- `screenshot-desktop.png` (1280×720px) - Desktop screenshot

### Option 1: Use PWA Asset Generator (Recommended)

**Using Online Tool:**
1. Create a **512×512px** icon with your Space Adventure logo
2. Go to https://www.pwabuilder.com/imageGenerator
3. Upload your 512×512 image
4. Download the generated icons
5. Copy all PNG files to `/public/` directory

**Using CLI (Automated):**
```bash
npm install -g pwa-asset-generator

# Generate from a source image
pwa-asset-generator space-icon.png ./public \
  --padding "10%" \
  --background "#000000" \
  --index index.html \
  --manifest manifest.json
```

### Option 2: Use RealFaviconGenerator

1. Go to https://realfavicongenerator.net/
2. Upload a **512×512px** image
3. Customize appearance:
   - **iOS**: Set background color to black (#000000)
   - **Android**: Set theme color to yellow (#fbbf24)
   - **Windows**: Set tile color to yellow (#fbbf24)
4. Generate and download the package
5. Extract and copy icon files to `/public/`

### Option 3: Manual Creation (Design Tools)

**Using Figma/Photoshop/Sketch:**
1. Create a **1024×1024px** canvas
2. Design your icon (space theme: rocket, stars, planet)
3. Export at these sizes:
   - 72×72, 96×96, 128×128, 144×144, 152×152
   - 192×192, 384×384, 512×512
4. Name files exactly as listed above
5. Save to `/public/` directory

**Design Guidelines:**
- Use simple, bold shapes (looks good when small)
- High contrast colors
- Center the main element
- **Safe zone**: Keep important content within center 80%
- **Background**: Black or dark space theme
- **Primary color**: Yellow (#fbbf24) for rockets/elements

### Creating Screenshots

**Mobile Screenshot (540×720px):**
```bash
# 1. Start the dev server
npm run dev

# 2. Open browser DevTools (F12)
# 3. Toggle device toolbar (Ctrl+Shift+M)
# 4. Set size to 540×720
# 5. Take screenshot of game board
# 6. Save as screenshot-mobile.png in /public/
```

**Desktop Screenshot (1280×720px):**
```bash
# 1. Resize browser to 1280×720
# 2. Take screenshot of full game interface
# 3. Save as screenshot-desktop.png in /public/
```

## 🧪 Testing Your PWA

### Test Installation

**On Desktop (Chrome/Edge):**
1. Run `npm run dev`
2. Open http://localhost:3000
3. Look for install icon in address bar (⊕ or download icon)
4. Click to install
5. App should open in standalone window

**On Android (Chrome):**
1. Deploy to production or use ngrok for HTTPS
2. Open site on Android Chrome
3. You should see "Add to Home Screen" banner
4. Or tap Menu → "Add to Home Screen"

**On iOS (Safari):**
1. Deploy to production (needs HTTPS)
2. Open site on iOS Safari
3. Tap Share button (📤)
4. Tap "Add to Home Screen"
5. Follow custom instructions from InstallPrompt

### Test Offline Mode

1. Install the app
2. Open DevTools → Application → Service Workers
3. Check "Offline" checkbox
4. Reload the page
5. App should still work with cached resources

### Test Service Worker Updates

1. Make a change to `public/sw.js` (update CACHE_NAME version)
2. Deploy changes
3. Reload the app
4. Old version should update to new version automatically

## 📊 PWA Audit (Lighthouse)

Check your PWA score:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Check "Progressive Web App"
4. Click "Generate report"
5. Aim for 100% score

**Common Issues:**
- ❌ **No icons** → Add icon files to `/public/`
- ❌ **Not served over HTTPS** → Deploy to production (Netlify, Vercel, etc.)
- ❌ **No offline support** → Service worker is already configured
- ❌ **Not installable** → Check manifest.json and icons

## 🚀 Deployment Checklist

Before deploying your PWA:
- [ ] Create all icon files (72×72 to 512×512)
- [ ] Create screenshots (mobile + desktop)
- [ ] Test install on desktop browser
- [ ] Test install on Android device
- [ ] Test install on iOS device
- [ ] Run Lighthouse audit
- [ ] Verify offline mode works
- [ ] Test service worker updates
- [ ] Check manifest.json loads correctly
- [ ] Verify theme colors display correctly

## 🔧 Customization

### Change Theme Color
Edit `public/manifest.json`:
```json
{
  "theme_color": "#YOUR_COLOR",
  "background_color": "#YOUR_BACKGROUND"
}
```

Also update `index.html`:
```html
<meta name="theme-color" content="#YOUR_COLOR" />
```

### Change App Name
Edit `public/manifest.json`:
```json
{
  "name": "Your Full App Name",
  "short_name": "Short Name"
}
```

### Add More Shortcuts
Edit `public/manifest.json` → `shortcuts` array:
```json
{
  "name": "Play AI Game",
  "url": "/?mode=ai",
  "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
}
```

### Modify Install Prompt Timing
Edit `src/components/InstallPrompt.jsx`:
```javascript
setTimeout(() => {
  setShowPrompt(true);
}, 3000); // Change delay (milliseconds)
```

### Disable Install Prompt
Remove `<InstallPrompt />` from `src/App.jsx`

## 📚 Resources

- **PWA Builder**: https://www.pwabuilder.com/
- **Icon Generator**: https://www.pwabuilder.com/imageGenerator
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **PWA Asset Generator**: https://github.com/onderceylan/pwa-asset-generator
- **Lighthouse**: https://developer.chrome.com/docs/lighthouse/
- **MDN PWA Guide**: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

## 🐛 Troubleshooting

### Install button doesn't show
- **Chrome**: Check DevTools → Application → Manifest (must have icons)
- **iOS**: Must be on HTTPS (production only)
- **Already installed**: Check if app is already on home screen

### Service worker not updating
```javascript
// Force update by incrementing version in public/sw.js
const CACHE_NAME = 'space-race-v3'; // Change v2 → v3
```

### Icons not showing
- Check file paths are exact (`/icon-192x192.png`)
- Verify files exist in `/public/` directory
- Hard refresh browser (Ctrl+Shift+R)
- Check browser DevTools → Console for errors

### App doesn't work offline
- Check service worker is registered (DevTools → Application → Service Workers)
- Verify cache includes necessary files
- Check Network tab while offline

---

**Current Status:**
- ✅ Service worker configured
- ✅ Manifest configured
- ✅ Install prompt added
- ✅ Meta tags added
- ❌ **Icons need to be created** (use guide above)
- ❌ **Screenshots optional** (improves install UI)

**Next Step:** Create icon files using one of the methods above, then test installation!
