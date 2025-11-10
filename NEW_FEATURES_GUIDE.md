# 🎮 New Features Guide

## Overview

Three major feature additions to Space Adventure:

1. **👽 Rogue Player** - Moving AI hazard that roams the board
2. **🚀 Icon Selection** - Let players pick their space vehicle
3. **🛡️ Player Assistance** - Loop prevention and comeback mechanics

---

## 1. 👽 Rogue Player System

### What It Is
A **moving AI "alien" hazard** that roams the board independently and knocks back players who encounter it.

### How It Works

**Spawning:**
- Spawns randomly between positions 15-70
- Appears every 10-15 turns
- Shows as 👽 icon on the board
- Avoids player positions and checkpoints

**Movement:**
- Moves every turn (1-3 spaces)
- 4 movement patterns:
  - **Random**: 70% forward, 30% backward (1-3 spaces)
  - **Forward**: Always moves 2 spaces forward
  - **Backward**: Always moves 2 spaces backward
  - **Chase**: Moves toward nearest player (2 spaces)
- Changes pattern every 5 turns
- Stays within positions 5-95
- Avoids checkpoints

**Encounters:**
- **Direct Hit** (land on rogue): -15 spaces knockback
- **Pass Through** (rogue in your path): -10 spaces knockback
- Message: `👽 Encountered Rogue Alien! Knocked back X spaces!`

**Despawning:**
- Auto-despawns after 15 turns active
- Can manually despawn when any player reaches 90+

**Visual:**
- Large 👽 alien icon on board
- Glowing purple/green aura
- Movement animation each turn
- Direction indicator (arrow showing last move)

**Strategic Impact:**
- Creates unpredictable danger
- Forces players to adapt route
- Rewards careful planning
- Adds excitement mid-game

---

## 2. 🚀 Icon Selection System

### What It Is
Players can **choose their own space vehicle icon** instead of the default rocket.

### Available Icons

12 space-themed vehicles:

| Icon | Name | Description |
|------|------|-------------|
| 🚀 | Classic Rocket | The original space explorer (default) |
| 🛸 | UFO | Flying saucer from beyond |
| 🛰️ | Satellite | Orbital observer |
| 🌠 | Shooting Star | Blazing through space |
| ⭐ | Star Ship | Shine bright like a star |
| 💫 | Comet | Speeding through the cosmos |
| ✨ | Sparkle Ship | Dazzling and bright |
| 🔥 | Fire Ship | Burning through space |
| ⚡ | Lightning Bolt | Fast as lightning |
| 🌙 | Moon Ship | Lunar traveler |
| 🪐 | Planet Hopper | Ring around the cosmos |
| ☀️ | Solar Flyer | Bright as the sun |

### How To Use

**In-Game:**
1. Click "Change Icon" button on player panel
2. Modal opens with 12 vehicle options
3. Hover over icon to see description
4. Click to select
5. Icon immediately updates on board

**Starting Area:**
- Icons shown in starting spaceport
- Each player has unique icon
- Default: 🚀 for all players

**On Board:**
- Icons replace rocket visuals
- Same animations (liftoff, landing, blastoff)
- Color overlays still apply (yellow, blue, green, pink)

### UI Components

**IconSelector Modal:**
- 3x4 grid of icons
- Hover descriptions
- Selected badge
- Smooth animations

**QuickIconButton:**
- Shows current icon
- "Change" button text
- Accessible from player panel

---

## 3. 🛡️ Player Assistance System

### What It Is
**Prevents infinite loops** and helps **struggling players** with automatic safety nets and comeback mechanics.

---

### A. Safety Net System

#### 1. Consecutive Knockback Protection
**Trigger:** 3+ knockbacks in a row

**Effect:**
- Grant **2 turns of immunity**
- Message: `🛡️ Safety Net Activated! Immunity for 2 turns`
- Cannot be knocked back during immunity
- Stacks don't refresh (must expire first)

**Why:** Prevents frustrating knockback loops

#### 2. Checkpoint Knockback Protection
**Trigger:** 5+ times knocked back from checkpoint 50+

**Effect:**
- **Next checkpoint move guaranteed**
- Immunity for 1 turn
- Message: `🛡️ Checkpoint Protection! Next move guaranteed`

**Why:** Prevents getting stuck at same checkpoint

---

### B. Comeback Mechanics

#### 1. Last Place Boost
**Trigger:** Player in last place + below position 30 + no progress for 5 turns

**Effect:**
- **+2 to all dice rolls** for 3 turns
- Message: `📈 Comeback Boost! +2 to all rolls for 3 turns`
- Helps catch up to leaders

**Why:** Gives last place player a fighting chance

#### 2. Anti-Stagnation Teleport
**Trigger:** Player at same position for 3+ consecutive turns

**Effect:**
- **Auto-advance 5 spaces**
- Message: `⚡ Anti-Stagnation! Auto-advanced 5 spaces`
- Instant, no roll needed

**Why:** Prevents complete standstill

#### 3. Struggling Player Aid
**Trigger:** 7+ turns without forward movement

**Effect:**
- **Free Teleport power-up**
- Message: `🎁 Struggling? Free Teleport power-up!`
- Appears in inventory instantly

**Why:** Gives tools to break out of bad position

---

### C. Progress Protection

#### 1. Safe Zones (Positions 80-95)
**Effect:**
- **Cannot be knocked backward** in this range
- Aliens still send to checkpoint
- Hazards still work (meteors, black holes)
- Message: `🏁 Safe Zone! Can't be knocked back here!`

**Why:** Protects late-game progress

#### 2. Checkpoint Landing Immunity
**Effect:**
- Landing **exactly on checkpoint** (10, 20, 30, etc.)
- Grants **1 turn of immunity**
- Next turn can't be knocked back

**Why:** Rewards precise play

---

### D. Knockback Rules

**Processing Order:**
1. Check immunity (active? → block)
2. Check safe zone (80-95? → block)
3. Check knockout limit (too many? → reduce)
4. Apply knockback
5. Track for assistance metrics

**Modified Knockback:**
- Original knockback always shown in message
- If modified, shows: `(reduced from X)`
- Example: `Knocked back 10 spaces (reduced from 15)`

---

## 🎯 How Features Work Together

### Example Game Flow

**Turn 1-5:** Normal gameplay
- Players roll, move forward
- Standard rules apply

**Turn 6:** Rogue spawns at position 35
- `👽 Rogue Alien has appeared at position 35!`
- Shown on board with purple glow

**Turn 8:** Player lands on rogue
- Direct hit: -15 spaces
- Player now at position 20 (was 35)
- **Tracked:** 1 knockback

**Turn 9:** Player hit by alien
- -10 spaces
- **Tracked:** 2 consecutive knockbacks

**Turn 11:** Player hit by meteor
- -10 spaces
- **Tracked:** 3 consecutive knockbacks
- **SAFETY NET ACTIVATED!**
- `🛡️ Safety Net! Immunity for 2 turns`

**Turn 12-13:** Player has immunity
- Lands on rogue → blocked!
- Message: `🛡️ Immunity Active! Knockback prevented!`

**Turn 15:** Player reaches position 25, stuck
- Same position for 3 turns
- **ANTI-STAGNATION ACTIVATED!**
- `⚡ Auto-advanced 5 spaces to 30!`

**Turn 20:** Player reaches position 82
- In safe zone (80-95)
- Rogue tries to knock back → blocked!
- Message: `🏁 Safe Zone! Can't be knocked back!`

---

## 📊 Metrics Tracked Per Player

```javascript
{
  consecutiveKnockbacks: 0,        // In a row
  turnsAtSamePosition: 0,          // Stagnation
  lastPosition: 0,                 // For comparison
  turnsWithoutProgress: 0,         // No forward movement
  totalKnockbacks: 0,              // Lifetime
  immunityTurns: 0,                // Active immunity
  boostActive: false,              // Comeback boost
  highestPosition: 0,              // Peak reached
  checkpointKnockbacks: 0          // From 50+ to below 50
}
```

---

## 🎨 UI Updates

### Board Changes
1. **Rogue indicator** - 👽 with glow effect
2. **Safe zone overlay** - Green tint on positions 80-95
3. **Immunity indicator** - Shield icon on player
4. **Boost indicator** - +2 badge on player

### Player Panel Changes
1. **Icon change button** - Click to open modal
2. **Assistance status** - Shows immunity/boost
3. **Progress bar** - Shows if in safe zone

### New Messages
1. Rogue spawn: `👽 Rogue Alien has appeared!`
2. Rogue encounter: `👽 Encountered Rogue Alien!`
3. Safety net: `🛡️ Safety Net Activated!`
4. Comeback boost: `📈 Comeback Boost! +2 to rolls`
5. Anti-stagnation: `⚡ Auto-advanced 5 spaces!`
6. Safe zone: `🏁 Safe Zone! Can't be knocked back!`
7. Free power-up: `🎁 Free Teleport power-up!`

---

## ⚙️ Configuration

### Rogue Player
```javascript
const ROGUE_CONFIG = {
  spawnInterval: { min: 10, max: 15 },  // Turns between spawns
  minPosition: 15,                      // Don't spawn too early
  maxPosition: 70,                      // Don't spawn too late
  lifetime: 15,                         // Turns before despawn
  knockbackDirect: 15,                  // Land on rogue
  knockbackPassthrough: 10              // Pass through rogue
};
```

### Player Assistance
```javascript
const ASSISTANCE_CONFIG = {
  safetyNet: {
    consecutiveKnockbacks: 3,           // Trigger threshold
    immunityTurns: 2                    // Duration
  },
  comeback: {
    lastPlaceThreshold: 30,             // Position limit
    noProgressTurns: 5,                 // Turns threshold
    rollBoost: 2,                       // Added to rolls
    boostDuration: 3                    // Turns
  },
  antiStagnation: {
    samePosionTurns: 3,                 // Trigger threshold
    teleportDistance: 5                 // Auto-advance
  },
  safeZone: {
    start: 80,                          // Beginning
    end: 95                             // End
  }
};
```

---

## 🚀 Benefits

### Player Experience
- ✅ **Less frustration** - Safety nets prevent endless loops
- ✅ **Fairer gameplay** - Comeback mechanics help strugglers
- ✅ **More excitement** - Rogue adds unpredictability
- ✅ **Personalization** - Icon selection for self-expression
- ✅ **Strategic depth** - Safe zones and immunity add tactics

### Game Balance
- ✅ **Prevents softlocks** - Auto-advance from stagnation
- ✅ **Rewards progress** - Safe zones protect late-game
- ✅ **Helps underdogs** - Comeback boosts for last place
- ✅ **Maintains tension** - Rogue keeps all players alert

### Retention
- ✅ **Reduces rage quits** - Assistance prevents frustration
- ✅ **Encourages completion** - Players more likely to finish games
- ✅ **Increases replayability** - Rogue changes each game
- ✅ **Social sharing** - "Look at my cool icon!"

---

## 🧪 Testing Checklist

### Rogue Player
- [ ] Spawns at correct interval (10-15 turns)
- [ ] Moves each turn (1-3 spaces)
- [ ] Knockback on direct hit (-15)
- [ ] Knockback on pass-through (-10)
- [ ] Changes movement pattern every 5 turns
- [ ] Despawns after 15 turns
- [ ] Visual: Alien icon shows on board
- [ ] Visual: Movement animation

### Icon Selection
- [ ] Modal opens on button click
- [ ] All 12 icons display correctly
- [ ] Hover shows descriptions
- [ ] Selection updates immediately
- [ ] Icon shows on board
- [ ] Icon shows in starting area
- [ ] Multiple players can have different icons

### Player Assistance
- [ ] Safety net activates after 3 knockbacks
- [ ] Immunity blocks knockbacks
- [ ] Safe zone (80-95) blocks knockbacks
- [ ] Anti-stagnation teleports after 3 turns
- [ ] Comeback boost gives +2 to rolls
- [ ] Free power-up given when struggling
- [ ] Checkpoint landing grants immunity
- [ ] All messages display correctly

---

## 🎯 Implementation Status

✅ **Created:**
- useRoguePlayer hook (180 lines)
- usePlayerAssistance hook (250 lines)
- IconSelector component (180 lines)
- NEW_FEATURES_GUIDE.md (this file)

⏳ **Next Steps:**
1. Integrate rogue into useGameLogic
2. Integrate assistance into useGameLogic
3. Add icon selection to LocalGame/AIGame
4. Update GameBoard to render rogue
5. Add assistance indicators to UI
6. Test all features together

---

## 💡 Future Enhancements

### Rogue Upgrades
- **Multiple rogues** at once (chaos mode)
- **Boss rogue** with special abilities
- **Friendly rogue** that helps players
- **Rogue levels** (gets stronger over time)

### Icon Upgrades
- **Unlock system** (earn icons by leveling up)
- **Animated icons** (sparkling effects)
- **Custom colors** per icon
- **Icon trails** (leave path behind)

### Assistance Upgrades
- **Difficulty scaling** (easier in easy mode)
- **Player preferences** (toggle assistance on/off)
- **Assist history** (track all assists given)
- **Achievement** for winning without assistance

---

## 🎊 Ready to Integrate!

All systems are built and ready. Next step is to wire them into the game logic and UI!

Should we proceed with integration? 🚀
