# 📢 Google AdSense Setup Guide

## Overview

Google AdSense has been integrated into Space Adventure. Ads will automatically show for free users and be hidden for premium subscribers.

## What Was Added

### 1. ✅ AdSense Script
- Added to `index.html` (loads on page load)
- Client ID: `ca-pub-9836174027317671`

### 2. ✅ AdSenseAd Component
- **File:** `src/components/AdSenseAd.jsx`
- **Features:**
  - Automatically hides ads for premium users
  - Responsive ad display
  - Configurable ad slots and formats
  - Error handling

### 3. ✅ Ad Placements
- **Main Menu:** Bottom of game mode selector
- **More placements can be added** (see below)

## Ad Placements

### Current Placements:
1. **Main Menu** - Bottom of game mode selector screen

### Recommended Additional Placements:
- Between games (after game ends, before next game)
- In settings menu (sidebar)
- In leaderboard view
- In game history view

## How It Works

### For Free Users:
- ✅ Ads display automatically
- ✅ Respects AdSense policies
- ✅ Responsive design

### For Premium Users:
- ✅ No ads shown (premium benefit)
- ✅ Clean, ad-free experience

## AdSense Account Setup

### Step 1: Verify Your Site
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign in with your Google account
3. Add your site: `spacerace.games` (or your domain)
4. Verify ownership (add HTML tag or DNS record)

### Step 2: Get Approved
- Google will review your site (usually 1-2 weeks)
- Once approved, ads will start showing
- Until then, you'll see placeholder/test ads

### Step 3: Configure Ad Units (Optional)
1. Go to AdSense Dashboard → Ads → By ad unit
2. Create custom ad units if needed
3. Update `adSlot` prop in `AdSenseAd` component

## Adding More Ad Placements

### Example: Add ad after game ends

```jsx
import AdSenseAd from './AdSenseAd';

// In LocalGame.jsx, after game ends:
{gameWon && (
  <div className="mt-4">
    <AdSenseAd adFormat="rectangle" />
  </div>
)}
```

### Example: Add ad in settings

```jsx
// In GameSettings.jsx
<div className="mt-6">
  <AdSenseAd adFormat="vertical" style={{ minHeight: '250px' }} />
</div>
```

## Ad Formats

Available formats:
- `auto` - Automatic (recommended)
- `horizontal` - Horizontal banner
- `rectangle` - Rectangle (300x250)
- `vertical` - Vertical banner

## Premium Integration

Ads automatically respect premium status:
- **Free users:** See ads
- **Premium users:** No ads (premium benefit)

This is handled automatically by the `AdSenseAd` component using `usePremium` hook.

## AdSense Policies

Make sure your game complies with:
- ✅ No click-to-win mechanics that encourage ad clicks
- ✅ No misleading content
- ✅ Age-appropriate content
- ✅ Clear privacy policy

## Troubleshooting

### Ads Not Showing

**Possible causes:**
1. **Site not approved yet** - Wait for AdSense approval
2. **Ad blockers** - Users with ad blockers won't see ads
3. **Premium user** - Ads hidden for premium (by design)
4. **Invalid ad slot** - Check ad slot ID

### Test Ads

To test ads before approval:
1. Use AdSense test mode
2. Or wait for approval (ads will show automatically)

### Console Errors

If you see AdSense errors:
- Check browser console
- Verify script loaded correctly
- Check ad slot configuration
- Ensure site is approved

## Revenue Optimization Tips

1. **Placement:** Put ads where users naturally pause (between games, in menus)
2. **Frequency:** Don't overwhelm users with too many ads
3. **Premium:** Offer premium tier to remove ads (monetization)
4. **Testing:** Test different placements to find what works best

## Code Reference

- **Component:** `src/components/AdSenseAd.jsx`
- **HTML:** `index.html` (script tag)
- **Premium Check:** Uses `usePremium` hook automatically

---

**Status:** ✅ AdSense integrated and ready!
**Next:** Wait for AdSense approval, then ads will automatically start showing for free users.

