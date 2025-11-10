# 🚨 Jeopardy Mechanics - Dynamic Game Hazards

## Overview

Transform Space Adventure into an **exciting, unpredictable race** with dynamic hazards that evolve during gameplay. The board itself becomes a living, dangerous environment!

---

## 🎯 Core Design Principles

1. **Progressive Danger** - Game gets harder as you get closer to finish
2. **Time Pressure** - Players must act quickly or face consequences
3. **Risk vs Reward** - Risky shortcuts vs safe paths
4. **Visual Excitement** - Dramatic visual effects for all hazards
5. **Fair Challenge** - Hazards announced before they hit
6. **Multiplayer Chaos** - Hazards affect all players differently

---

## 🕳️ 1. BLACK HOLES (Square Destruction)

### Concept
Squares randomly collapse into black holes and become **unlandable voids**. If you're on a square when it collapses, you get sucked in!

### Mechanics

**Formation:**
- Every 5-10 turns, a random square (10-90) becomes a black hole
- **Warning phase** (2 turns): Square flashes red/purple with warning icon ⚠️
- **Collapse phase** (turn 3): Square turns into swirling black void 🕳️
- Players on warned square see countdown timer

**Effects:**
- **If you're ON the warned square when it collapses:**
  - Sucked into black hole
  - Teleported to random earlier checkpoint (-20 to -40 spaces)
  - Lose 1 turn (stunned from warp)

- **If you LAND on black hole:**
  - Cannot land, bounce back to last checkpoint
  - Lose your turn

- **Passing through:**
  - If your roll would move through black hole, you skip over it safely

**Visual:**
- Warning phase: Pulsing red glow, countdown "2... 1..."
- Collapsed: Swirling black/purple vortex with particle effects
- Suck-in animation: Player spirals into void

**Strategic Impact:**
- Creates urgency to keep moving forward
- Adds danger to camping on safe squares
- Forces players to take risks

---

## ⚡ 2. SOLAR STORMS (Row/Column Destruction)

### Concept
Massive solar storms sweep across the board, making entire **rows or columns dangerous** for several turns.

### Mechanics

**Trigger:**
- Every 8-12 turns, solar storm warning appears
- Random row (10-90) or column selected
- **Warning phase** (1 turn): "⚠️ SOLAR STORM approaching Row 5!"

**Storm Phase (3 turns):**
- Entire row/column glows with crackling orange energy
- Anyone landing in storm zone:
  - Takes damage: -15 spaces
  - Loses power-ups (50% chance each is destroyed)
  - Cannot use shield (too powerful)

**Safe Zones:**
- Checkpoints immune to storms
- Can use Teleport to skip storm zone

**Visual:**
- Warning: Yellow/orange flashing border on affected row/column
- Active: Crackling lightning effects, orange overlay
- Audio: Thunder/electricity sounds

**Strategic Impact:**
- Must plan route around storm
- Timing becomes crucial
- Creates bottlenecks and risky paths

---

## 🚔 3. SPACE JAIL (Miss Turns)

### Concept
Land on patrol zones and get sent to **Space Jail** - must escape or miss turns!

### Mechanics

**Patrol Zones:**
- 8-12 random squares marked with 🚨 (changes each game)
- Landing on patrol = sent to Space Jail
- Warning: "You entered restricted space!"

**Jail Rules:**
- **Sent to Jail:** Teleported to dedicated jail space (off-board)
- **Escape methods:**
  1. **Roll doubles** (both dice same number) - instant escape
  2. **Pay bail:** 50 coins - escape immediately
  3. **Wait 2 turns** - auto-release
  4. **Use "Get Out Free" card** - instant escape (rare power-up)

**While in Jail:**
- Cannot move on board
- Can still roll dice (attempting to get doubles)
- Can watch other players but stuck in jail cell visual
- Other players see your rocket in jail cell overlay

**Strategic Impact:**
- High risk near finish line (imagine being sent to jail at space 95!)
- Coins become valuable for bail
- Creates comeback opportunities (send leader to jail)

**Visual:**
- Jail cell overlay in corner of screen
- Bars, flashing red/blue lights
- Countdown showing turns remaining

---

## 🌪️ 4. GRAVITY WELLS (Pull Back)

### Concept
Powerful gravity fields that **pull you backward** each turn you're inside them.

### Mechanics

**Locations:**
- 3-5 zones spanning 10 squares each
- Example: Spaces 30-40, 55-65, 80-90
- Marked with swirling purple vortex 🌀

**Effects:**
- **Enter zone:** Normal movement
- **Start turn in zone:** Pulled back 3 spaces BEFORE you roll
- **Multiple turns trapped:** Cumulative pull (3 spaces per turn)

**Escape Methods:**
- **Roll high:** Get 6+ to escape zone
- **Speed Boost power-up:** Override gravity
- **Teleport:** Skip zone entirely

**Strategic Impact:**
- Late-game zones near finish create panic
- Must build momentum to escape
- Encourages power-up use

**Visual:**
- Swirling purple/blue gradient
- Particles spiraling inward
- Player rocket tilts toward center when trapped

---

## ⏱️ 5. OXYGEN DEPLETION (Turn Timer)

### Concept
**Time pressure!** Take too long on your turn, and you lose oxygen.

### Mechanics

**Turn Timer:**
- Each turn: 15 seconds to roll dice (configurable)
- Timer displayed prominently with oxygen bar
- Warning at 5 seconds: Red flashing, alarm sound

**Penalties for Timeout:**
- **First timeout:** Warning message, no penalty
- **Second timeout:** -5 spaces (emergency evac)
- **Third+ timeout:** -10 spaces + lose 1 power-up

**Exceptions:**
- Timer paused during animations
- First-time players get 30 seconds
- AI players never timeout

**Visual:**
- Oxygen bar at top of screen
- Color: Green → Yellow → Red
- Sound: Beeping faster as time runs out

**Strategic Impact:**
- Keeps game moving fast
- Prevents analysis paralysis
- Adds tension to every turn

---

## 🌑 6. VOID EXPANSION (Progressive Destruction)

### Concept
As the game progresses, the universe **collapses from the edges**, making early spaces unlandable.

### Mechanics

**Collapse Schedule:**
- After turn 20: Spaces 1-10 become void
- After turn 40: Spaces 11-20 become void
- After turn 60: Spaces 21-30 become void
- Message: "⚠️ The universe is collapsing! Spaces 1-10 are now void!"

**Effects:**
- **Can't land on void spaces** - bounce forward to next safe space
- **No checkpoints in void** - if checkpoint 10 is void, use checkpoint 20
- **Creates urgency** - must reach finish before too much collapses

**Strategic Impact:**
- Encourages aggressive play (don't fall too far behind)
- Going backward becomes increasingly dangerous
- Late joiners face harder game

**Visual:**
- Void spaces turn black with red border
- Static/glitch effect
- Warning message before each collapse wave

---

## 🔥 7. METEOR SHOWER (Random Bombardment)

### Concept
Random squares get **bombarded by meteors**, dealing damage to anyone landing there.

### Mechanics

**Event Trigger:**
- Every 6-10 turns
- 5-8 random squares marked with 🔥 (meteor impact sites)
- Duration: 3 turns

**Effects:**
- Landing on meteor site: -10 spaces (emergency repairs)
- Shield protects you (consumes shield)
- Checkpoint squares immune

**Warning:**
- 1 turn warning: "🔥 Meteor shower incoming!"
- Targeted squares flash orange

**Visual:**
- Flaming rocks falling animation
- Smoke/fire effects on impact sites
- Screen shake when meteors hit

**Strategic Impact:**
- Randomness keeps you on toes
- Shield becomes more valuable
- Creates temporary danger zones

---

## 🚀 8. WORMHOLES (Teleport Pairs)

### Concept
Jump between wormhole pairs - but it's **random where you exit**!

### Mechanics

**Wormhole Pairs:**
- 3-4 pairs of wormholes on board
- Enter square → instantly teleported to partner square
- Marked with 🌀 (blue swirling portal)

**Risk/Reward:**
- **Good wormholes:** +20-30 spaces forward
- **Bad wormholes:** -10-15 spaces backward
- **Random:** You don't know until you enter!

**One-Way:**
- After using, wormhole closes for 5 turns (cooldown)
- Shows lock icon 🔒

**Strategic Impact:**
- Risk-takers can catch up fast
- Leaders might avoid wormholes (too risky)
- Comebacks possible

**Visual:**
- Swirling portal animation
- Different colors for different pairs
- Teleport effect: Flash + particles

---

## ⛏️ 9. SPACE MINES (Hidden Traps)

### Concept
**Hidden mines** on random squares - step on one and BOOM!

### Mechanics

**Mine Placement:**
- 8-15 mines randomly placed (positions 15-95)
- **Invisible until triggered** 💣
- Placement changes each game

**Trigger:**
- Land on mine = EXPLOSION
- Effects:
  - Go to space jail (2 turns)
  - OR back to last checkpoint
  - Lose all power-ups (destroyed in blast)

**Detection:**
- **Mine Detector power-up** reveals nearby mines
- **Lucky players:** Roll exactly what you need to skip over mine

**Disarm:**
- Use Shield when landing on mine = disarmed + 20 coins reward

**Visual:**
- Hidden: Normal square
- Revealed: Pulsing red mine icon
- Explosion: Screen shake, fire burst, smoke

**Strategic Impact:**
- Every move is risky
- Mine Detector becomes valuable
- Shield has multiple uses

---

## 🔋 10. FUEL STATIONS (Mandatory Pit Stops)

### Concept
Your rocket **runs out of fuel** - must stop at fuel stations or slow down!

### Mechanics

**Fuel System:**
- Start with 100 fuel
- Each roll consumes fuel = dice value × 5
- Example: Roll 6 = 30 fuel consumed

**Low Fuel:**
- < 50 fuel: Warning message "⛽ Low fuel!"
- < 20 fuel: Move at half speed (roll ÷ 2)
- 0 fuel: Cannot move (stuck until refuel)

**Fuel Stations:**
- Located at spaces 25, 50, 75
- Landing on station = instant full refuel (100 fuel)
- Passing through = no refuel (must land)

**Strategic Impact:**
- Must balance speed vs fuel consumption
- Creates pit stop strategy
- High rolls become risky near empty

**Visual:**
- Fuel gauge next to player panel
- Color: Green → Orange → Red
- Fuel stations: Glowing green pump icon ⛽

---

## 🎲 11. QUANTUM INSTABILITY (Dice Chaos)

### Concept
Some squares cause **dice to go haywire** with wild effects!

### Mechanics

**Quantum Zones:**
- 5-8 squares marked with ⚛️ (atom symbol)
- Landing triggers random effect:

**Possible Effects:**
1. **Double Roll** - Roll dice twice, take sum
2. **Reverse Roll** - Move backward instead of forward
3. **Wild Roll** - Dice shows random number (1-12)
4. **Swap** - Switch positions with random player
5. **Freeze** - Cannot move next turn
6. **Boost** - Move double your roll

**Randomness:**
- 50% good effects, 50% bad effects
- You don't know until you land

**Visual:**
- Glitching/glowing quantum effect
- Reality distortion animation
- Dice spinning wildly

**Strategic Impact:**
- Pure chaos element
- Risk-takers love it
- Can completely change game

---

## 🌠 12. SECTOR LOCKDOWN (Temporary Barriers)

### Concept
Random board sections become **locked down** temporarily.

### Mechanics

**Lockdown Event:**
- Every 12-15 turns
- Random 20-square section locked (e.g., 40-60)
- Duration: 4 turns
- Warning: "⚠️ Sector 40-60 lockdown in 1 turn!"

**Effects:**
- **Cannot enter locked section** from outside
- **Trapped inside:** Can move within section but not leave
- **Checkpoints blocked:** Cannot use checkpoint inside lockdown

**Bypass:**
- Teleport power-up works
- Wormholes can skip lockdown

**Visual:**
- Red force field overlay
- Flashing warning border
- "RESTRICTED ACCESS" text

**Strategic Impact:**
- Can trap leaders or stragglers
- Creates desperate situations
- Timing becomes critical

---

## 🎰 Implementation Priority

### Phase 1 (Core Jeopardy) - 2-3 hours
1. **Black Holes** - Square destruction
2. **Space Jail** - Miss turns mechanic
3. **Oxygen Timer** - Turn timer with penalties
4. **Meteor Shower** - Random bombardment

### Phase 2 (Board Evolution) - 2-3 hours
5. **Solar Storms** - Row/column hazards
6. **Void Expansion** - Progressive destruction
7. **Gravity Wells** - Pull back zones
8. **Wormholes** - Teleport pairs

### Phase 3 (Advanced) - 2-3 hours
9. **Space Mines** - Hidden traps
10. **Fuel Stations** - Resource management
11. **Quantum Zones** - Dice chaos
12. **Sector Lockdown** - Temporary barriers

---

## 🎮 Difficulty Scaling

### Easy Mode
- No jeopardy mechanics (classic gameplay)
- OR only Space Jail (mild penalty)

### Normal Mode
- Black Holes + Space Jail + Meteor Shower
- Moderate frequency

### Hard Mode
- All mechanics except Oxygen Timer
- High frequency

### Chaos Mode (NEW!)
- **ALL mechanics active**
- Maximum frequency
- Pure insanity!

---

## 📊 Balancing System

### Frequency Control
```javascript
const JEOPARDY_CONFIG = {
  blackHoleInterval: { min: 5, max: 10 },  // Turns between events
  solarStormInterval: { min: 8, max: 12 },
  meteorShowerInterval: { min: 6, max: 10 },
  // ...etc
};
```

### Difficulty Multipliers
```javascript
const DIFFICULTY_MULTIPLIERS = {
  easy: 0,      // Disabled
  normal: 0.5,  // 50% frequency
  hard: 1.0,    // 100% frequency
  chaos: 2.0    // 200% frequency
};
```

### Safe Zones (Always Protected)
- Position 0 (start)
- Position 100 (finish)
- Active checkpoints
- Current positions of all players (can't spawn hazard on player)

---

## 🎨 Visual Feedback System

### Warning Colors
- 🟡 **Yellow**: 2 turns until hazard
- 🟠 **Orange**: 1 turn until hazard
- 🔴 **Red**: Hazard active NOW

### Sound Design
- **Warning**: Beep-beep-beep (increasing tempo)
- **Activation**: Dramatic whoosh/explosion
- **Impact**: Screen shake + sound effect
- **Escape**: Victory fanfare

### Screen Effects
- **Shake**: On explosions/impacts
- **Flash**: On hazard activation
- **Slow-mo**: When entering jail/black hole
- **Particles**: Constant ambiance on hazards

---

## 🏆 New Achievements

1. **"Survivor"** - Survive 5 black holes in one game
2. **"Jailbreak"** - Escape jail by rolling doubles
3. **"Storm Chaser"** - Pass through 3 solar storms unharmed
4. **"Daredevil"** - Win game using only wormholes
5. **"Mine Sweeper"** - Disarm 10 space mines
6. **"Speedrunner"** - Never timeout on oxygen
7. **"Gravity Defier"** - Escape gravity well 5 times
8. **"Chaos Master"** - Win game in Chaos Mode

---

## 💰 Monetization Tie-ins

### Power-ups Become Essential
- **Shield Pack** (200 coins) - 5 shields for hazards
- **Oxygen Tank** (150 coins) - 30 seconds per turn for 10 turns
- **Mine Detector** (100 coins) - Reveal all mines
- **Fuel Booster** (75 coins) - Infinite fuel for 10 turns
- **Get Out Free Card** (250 coins) - Instant jail escape

### Premium Benefits
- **Hazard Warning** - See hazards 1 extra turn early
- **Safe Start** - First 20 spaces hazard-free
- **Fuel Efficiency** - 50% less fuel consumption
- **Second Chance** - Survive 1 black hole per game free

---

## 🔧 Technical Implementation

### New State Variables
```javascript
// In useGameLogic.js
const [hazards, setHazards] = useState({
  blackHoles: [],        // Array of collapsed square numbers
  warningSquares: [],    // Squares about to collapse
  solarStorms: [],       // Active storm zones
  gravityWells: [],      // Gravity zones
  spaceMines: [],        // Mine locations (hidden)
  wormholes: [],         // Wormhole pairs
  quantumZones: [],      // Quantum squares
  fuelStations: [25, 50, 75],
  lockedSectors: []      // Locked sections
});

const [playerStates, setPlayerStates] = useState({
  inJail: false,
  jailTurnsRemaining: 0,
  fuel: 100,
  oxygenTimer: 15,
  lastMoveTime: Date.now()
});

const [turnCount, setTurnCount] = useState(0);
```

### Event System
```javascript
// Check for hazard triggers each turn
useEffect(() => {
  checkForHazardEvents(turnCount);
  checkForOxygenDepletion();
  checkForVoidExpansion();
}, [turnCount]);

function checkForHazardEvents(turn) {
  // Black hole spawning
  if (turn % 7 === 0) spawnBlackHole();

  // Solar storm
  if (turn % 10 === 0) triggerSolarStorm();

  // Meteor shower
  if (turn % 8 === 0) triggerMeteorShower();
}
```

---

## 🚦 User Experience

### Settings Toggle
```
Game Settings:
[x] Enable Jeopardy Mechanics
[ ] Black Holes
[ ] Solar Storms
[ ] Space Jail
[ ] Oxygen Timer
...etc

Players can customize which mechanics they want!
```

### Tutorial
- First time: "⚠️ NEW HAZARD UNLOCKED: Black Holes!"
- Explanation modal with GIF/video
- Practice mode to learn mechanics

---

## 🎯 Expected Impact

### Engagement Metrics
- **Session length**: +40% (more exciting = play longer)
- **Return rate**: +60% (want to try different strategies)
- **Social sharing**: +80% (crazy moments = share with friends)

### Monetization
- **Power-up sales**: +200% (essential for survival)
- **Premium subscriptions**: +50% (hazard protection valuable)
- **Ad revenue**: +30% (more sessions = more ads)

### Retention
- **Daily active users**: +45% (daily quests involve hazards)
- **Friend referrals**: +70% ("You gotta try Chaos Mode!")

---

## 🎬 Epic Moments This Creates

1. **"The Great Escape"** - Player at space 95, black hole appears at 96, uses Teleport to skip to 100 and WIN!

2. **"Jail Clutch"** - Leader sent to jail at space 98, opponent catches up and passes them!

3. **"Storm Survivor"** - Navigate through 3 solar storms with perfect timing

4. **"Wormhole Gamble"** - Player at space 40 takes wormhole, warps to space 85!

5. **"Mine Field"** - Board full of revealed mines, must calculate perfect path

6. **"Oxygen Crisis"** - Down to 3 seconds, slam SPIN button, barely make it!

7. **"Void Collapse"** - Early spaces collapsing, player sent backward into void, bounces forward 20 spaces!

8. **"Quantum Chaos"** - Land on quantum zone, swap with player at space 90, instant leader!

---

## 📈 Roadmap

### Week 1: Core Implementation
- Black Holes system
- Space Jail mechanic
- Basic hazard framework

### Week 2: Board Evolution
- Solar Storms
- Void Expansion
- Visual effects polish

### Week 3: Advanced Features
- Wormholes
- Space Mines
- Quantum Zones

### Week 4: Polish & Balance
- Difficulty tuning
- User testing
- Achievement implementation

---

## ✅ Ready to Implement?

I can start building these systems! Which phase would you like to begin with?

**Recommendation**: Start with **Phase 1** (Core Jeopardy) to get the most exciting mechanics working first:
1. Black Holes (square destruction)
2. Space Jail (miss turns)
3. Meteor Shower (bombardment)

These 3 alone will transform your game into an exciting, unpredictable adventure!

Would you like me to start implementing Phase 1? 🚀
