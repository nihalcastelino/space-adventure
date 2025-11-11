# 🎯 START HERE: Enable Monetization in 3 Steps

**Hi! 👋 This guide is for complete beginners. Follow these steps exactly!**

---

## 📁 Step 1: Open the File

1. Open your project in your code editor (VS Code, Cursor, etc.)
2. Find this file: `src/components/LocalGame.jsx`
3. Open it

---

## ✏️ Step 2: Make These 3 Changes

### Change #1: Uncomment Imports (Line ~12-16)

**Find this code:**
```javascript
// Optional imports - comment out if files don't exist in build
// import { useProgression } from '../hooks/useProgression';
// import { useCurrency } from '../hooks/useCurrency';
// import { ProgressBar } from './ProgressionUI';
// import { CoinDisplay } from './PowerUpUI';
```

**Change it to this (remove the // and the comment line):**
```javascript
import { useProgression } from '../hooks/useProgression';
import { useCurrency } from '../hooks/useCurrency';
import { ProgressBar } from './ProgressionUI';
import { CoinDisplay } from './PowerUpUI';
```

---

### Change #2: Uncomment Hooks (Line ~29-31)

**Find this code:**
```javascript
// Initialize progression and currency systems (optional - commented out for build)
// const progression = useProgression();
// const currency = useCurrency();
```

**Change it to this:**
```javascript
// Initialize progression and currency systems
const progression = useProgression();
const currency = useCurrency();
```

---

### Change #3: Delete Stub Objects (Line ~33-40)

**Find this code and DELETE IT completely:**
```javascript
// Stub objects to prevent errors (used by SpaceJail component)
const progression = { level: 1, xp: 0, getProgressToNextLevel: () => 0 };
const currency = { 
  coins: 0, 
  removeCoins: () => {}, 
  earnCoins: () => {},
  earnGameReward: () => 0
};
```

**Just delete all of it!**

---

### Change #4: Uncomment UI (Line ~171-178)

**Find this code:**
```javascript
{/* HUD Overlay - Progress & Coins (commented out for build - uncomment when hooks are committed) */}
{/* <div className="fixed top-16 left-2 right-2 z-20 flex items-start justify-between pointer-events-none">
  <div className="pointer-events-auto w-64 hidden md:block">
    <ProgressBar
      level={progression.level}
      xp={progression.xp}
      getProgressToNextLevel={progression.getProgressToNextLevel}
    />
  </div>
  <div className="pointer-events-auto ml-auto">
    <CoinDisplay coins={currency.coins} />
  </div>
</div> */}
```

**Change it to this (remove the {/* and */}):**
```javascript
{/* HUD Overlay - Progress & Coins */}
<div className="fixed top-16 left-2 right-2 z-20 flex items-start justify-between pointer-events-none">
  <div className="pointer-events-auto w-64 hidden md:block">
    <ProgressBar
      level={progression.level}
      xp={progression.xp}
      getProgressToNextLevel={progression.getProgressToNextLevel}
    />
  </div>
  <div className="pointer-events-auto ml-auto">
    <CoinDisplay coins={currency.coins} />
  </div>
</div>
```

---

## ✅ Step 3: Save and Test!

1. **Save the file** (Ctrl+S or Cmd+S)
2. **Run your game** (`npm run dev`)
3. **Play a game** - You should see:
   - A progress bar at the top left
   - Coins counter at the top right
   - Coins increasing when you play!

---

## 🎉 Success!

If you see coins and progress bar, **you're done!** 

Players now automatically earn coins when they:
- ✅ Play games
- ✅ Win games  
- ✅ Level up
- ✅ Complete achievements

---

## 🚀 What's Next?

### Option A: Add Power-Ups Shop
See `MONETIZATION_QUICK_START.md` - Step 2

### Option B: Add Ads (Make Real Money!)
See `SIMPLE_MONETIZATION_GUIDE.md` - Step 3

### Option C: Add Premium Pass
See `SIMPLE_MONETIZATION_GUIDE.md` - Premium Pass section

---

## ❓ Having Problems?

### "I don't see coins"
- Make sure you saved the file
- Check browser console for errors (F12)
- Try refreshing the page

### "Build fails"
- Make sure all files exist in `src/hooks/` folder
- Check that you removed the stub objects
- See error message for details

### "Still confused?"
- Check `SIMPLE_MONETIZATION_GUIDE.md` for detailed explanations
- Check `ENABLE_MONETIZATION.js` for exact code examples

---

## 📊 How Much Money?

With just coins enabled:
- Players earn coins by playing
- You can add a shop later
- Players can buy power-ups, skins, etc.

**To make real money, add ads!** (See guides above)

---

**Good luck! You've got this! 🚀**

