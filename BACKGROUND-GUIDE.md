# Space Background Setup Guide

## Quick Setup (5 minutes)

### Step 1: Download a Space Background

**Option A - Recommended Free Sources:**

1. **Unsplash (Best Quality)**
   - Go to: https://unsplash.com/s/photos/space-nebula
   - Search terms: "purple nebula dark", "deep space", "dark space stars"
   - Download high-res version (free)

2. **NASA Images (Public Domain)**
   - Go to: https://images.nasa.gov
   - Search: "nebula" or "deep field"
   - 100% free, incredible quality

3. **Pexels**
   - Go to: https://pexels.com/search/space/
   - All images are free to use

**Recommended specific searches on Unsplash:**
- "purple space nebula dark" - matches game theme
- "deep space black stars" - minimal, not distracting
- "cosmic background dark" - good for games

### Step 2: Optimize the Image

**Use TinyPNG or Squoosh:**
1. Go to: https://tinypng.com or https://squoosh.app
2. Upload your downloaded space image
3. Compress it (target: 200-500KB)
4. Download the optimized version

**Target specs:**
- Format: JPG
- Dimensions: 1920x1080 or 2560x1440
- File size: 200-500KB (compressed)

### Step 3: Add to Project

Save the optimized image as:
```
public/space-bg.jpg
```

Full path: `/Users/nihalcastelino/Documents/space-adventure/public/space-bg.jpg`

### Step 4: Test

1. Refresh your browser at http://localhost:3002/
2. You should see your space background!
3. If image doesn't show, check browser console (F12) for errors

---

## Midjourney Prompts (If You Have Access)

### Best Prompt for Game Background:
```
/imagine prompt: deep space background with dark purple and blue nebula clouds, scattered stars, predominantly black space, subtle cosmic atmosphere, realistic astrophotography, game background optimized, cinematic space photography, 4k quality --ar 16:9 --v 6
```

### Alternative Prompts:

**Minimal/Clean:**
```
/imagine prompt: minimalist deep space background, sparse stars on black void, subtle dark purple nebula wisps, clean atmospheric space, game background, professional space photography --ar 16:9 --v 6
```

**Colorful/Vibrant:**
```
/imagine prompt: vibrant space nebula background, purple blue gold cosmic clouds, scattered stars, deep atmosphere, space game background, cinematic astrophotography --ar 16:9 --v 6
```

**Dark/Subtle (Recommended):**
```
/imagine prompt: dark deep space background, subtle nebula clouds, scattered small stars, cosmic dust, predominantly black with hints of purple blue, atmospheric depth, realistic space photography --ar 16:9 --v 6
```

---

## Troubleshooting

### Image Not Showing?
1. Check file is named exactly: `space-bg.jpg` (lowercase)
2. Check file is in `public/` folder (not `src/`)
3. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Check browser console for errors

### Image Too Bright/Distracting?
The code includes a 20% dark overlay. To adjust:
- Edit: `src/components/LocalGame.jsx` (line ~41)
- Change: `bg-black/20` to `bg-black/40` (darker) or `bg-black/10` (lighter)

### Want Different Image for Different Screens?
You can use different images:
- Home screen: Edit `GameModeSelector.jsx`
- Local game: Edit `LocalGame.jsx`
- Online game: Edit `OnlineGame.jsx`

Just change `url(/space-bg.jpg)` to `url(/space-bg-2.jpg)` etc.

---

## Recommended Image Characteristics

For best results, choose images with:
- ✅ Dark background (70%+ black/dark blue)
- ✅ Purple/blue tones (matches your golden theme)
- ✅ Not too busy/complex (game board should be focus)
- ✅ Subtle nebula clouds (not overwhelming)
- ✅ Realistic photography style (not artistic/abstract)
- ✅ Good contrast (so game elements pop)

**Avoid:**
- ❌ Very bright/colorful images
- ❌ Too much detail (distracting)
- ❌ Red/orange tones (clashes with blue/purple theme)
- ❌ Images with text or watermarks

---

## Current Setup

The code is configured to:
- Load: `/public/space-bg.jpg`
- Cover entire screen
- Add 20% dark overlay for readability
- Add subtle 1px blur for depth
- Fallback to black if image fails to load

All components use the same background image for consistency.
