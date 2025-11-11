# 📢 Ad Placement Policy

## ✅ Safe Ad Placement Rules

Ads are **ONLY** placed in areas that **DO NOT** interfere with gameplay:

### ✅ Allowed Ad Locations:

1. **Main Menu (GameModeSelector)**
   - ✅ Bottom of screen, below game mode buttons
   - ✅ User is selecting game mode, not playing
   - ✅ Safe to show ads

2. **Settings Menu (GameSettings)**
   - ✅ Inside modal overlay
   - ✅ User opened settings, game is paused
   - ✅ Safe to show ads

3. **User Profile (UserProfile)**
   - ✅ Inside modal overlay
   - ✅ User viewing profile, not playing
   - ✅ Safe to show ads

4. **Leaderboard View** (if added)
   - ✅ Inside modal/overlay
   - ✅ User viewing stats, not playing
   - ✅ Safe to show ads

5. **Game History View** (if added)
   - ✅ Inside modal/overlay
   - ✅ User viewing past games, not playing
   - ✅ Safe to show ads

### ❌ Forbidden Ad Locations:

1. **During Active Gameplay**
   - ❌ NO ads on game board
   - ❌ NO ads overlaying player panels
   - ❌ NO ads near game controls
   - ❌ NO ads during dice rolls
   - ❌ NO ads during animations

2. **Game Overlay Screens**
   - ❌ NO ads in Space Jail overlay
   - ❌ NO ads in Alien Encounter overlay
   - ❌ NO ads in Level Up animation
   - ❌ NO ads in victory screen (during celebration)

3. **Critical UI Elements**
   - ❌ NO ads near dice button
   - ❌ NO ads near player positions
   - ❌ NO ads blocking game board view
   - ❌ NO ads in game controls area

## Implementation Details

### Z-Index Hierarchy:
```
Game Board: z-index 1-10 (base layer)
Player Panels: z-index 25
Game Controls: z-index 10
Overlays (Jail, Alien): z-index 50-60
Modals (Settings, Profile): z-index 100
Ads: z-index 1 (only in menus, never over gameplay)
```

### Ad Component Features:
- ✅ Automatically hides for premium users
- ✅ Only renders in safe locations (menus, modals)
- ✅ Never rendered during active gameplay
- ✅ Responsive sizing (doesn't overflow)

## Current Ad Placements

1. **Main Menu** (`GameModeSelector.jsx`)
   - Location: Bottom of screen, below game mode buttons
   - Format: Horizontal banner
   - Safe: ✅ Yes (user selecting mode, not playing)

2. **Settings** (`GameSettings.jsx`)
   - Location: Inside settings modal, before close button
   - Format: Rectangle (300x250)
   - Safe: ✅ Yes (modal overlay, game paused)

3. **User Profile** (`UserProfile.jsx`)
   - Location: Bottom of profile modal
   - Format: Rectangle (300x250)
   - Safe: ✅ Yes (modal overlay, not during gameplay)

## Future Safe Ad Placements

### After Game Ends (Recommended)
- Show ad AFTER victory celebration completes
- User can dismiss before next game
- Safe: ✅ Yes (game is over)

### Between Games (Recommended)
- Show ad when returning to main menu
- User is selecting next game
- Safe: ✅ Yes (not during gameplay)

## Testing Checklist

- [ ] No ads appear during active gameplay
- [ ] No ads overlay game board
- [ ] No ads block player panels
- [ ] No ads interfere with dice button
- [ ] Ads only show in menus/modals
- [ ] Premium users see no ads
- [ ] Ads are responsive (don't overflow)
- [ ] Ads don't cause layout shifts during gameplay

## Code Enforcement

The `AdSenseAd` component:
- ✅ Checks premium status (hides for premium)
- ✅ Only used in safe locations (menus/modals)
- ✅ Never imported in game components (LocalGame, OnlineGame, AIGame)
- ✅ Proper z-index (never above gameplay elements)

---

**Policy:** Ads should enhance monetization without compromising gameplay experience.

