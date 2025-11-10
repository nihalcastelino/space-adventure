# 👽 Rogue Player System - Analysis & Improvements

## Current Status

### ✅ What's Done
- `useRoguePlayer` hook created with full functionality
- Spawn logic (positions 15-70, avoids players/checkpoints)
- Movement patterns (random, forward, backward, chase)
- Encounter detection (direct hit & pass-through)
- Despawn logic (15 turns or manual)

### ❌ What's Missing
1. **Integration into `useGameLogic.js`**
   - Hook not imported or initialized
   - No turn counter for spawn timing (10-15 turns)
   - Rogue doesn't move each turn
   - Encounter checking not called during player movement
   - Despawn checks not performed

2. **Visual Integration in `GameBoard.jsx`**
   - Rogue position not passed as prop
   - Rogue icon (👽) not rendered on board
   - No visual effects (glow, animation)

3. **Integration in `LocalGame.jsx`**
   - Hook not imported
   - Rogue state not passed to GameBoard

4. **Bug Fixes Needed**
   - `checkRogueEncounter` uses stale `rogueState` (closure issue)
   - Spawn timing needs turn counter
   - Movement should happen in `nextPlayer()`

## Implementation Plan

### Phase 1: Fix Hook Issues
- [ ] Fix `checkRogueEncounter` closure issue (use ref or state properly)
- [ ] Add turn counter tracking for spawn timing
- [ ] Improve spawn position validation

### Phase 2: Integrate into Game Logic
- [ ] Import `useRoguePlayer` in `useGameLogic.js`
- [ ] Add turn counter state
- [ ] Call `spawnRogue` every 10-15 turns
- [ ] Call `moveRogue` in `nextPlayer()`
- [ ] Check `checkRogueEncounter` during `movePlayer()`
- [ ] Handle knockback from rogue encounters
- [ ] Check `shouldDespawn()` and despawn when needed
- [ ] Reset rogue on `resetGame()`

### Phase 3: Visual Integration
- [ ] Pass `rogueState` from `useGameLogic` to components
- [ ] Add `rogueState` prop to `GameBoard.jsx`
- [ ] Render 👽 icon at rogue position
- [ ] Add glow effect (purple/green aura)
- [ ] Add movement animation
- [ ] Show direction indicator

### Phase 4: Polish & Testing
- [ ] Test spawn timing
- [ ] Test all movement patterns
- [ ] Test encounter detection
- [ ] Test knockback mechanics
- [ ] Test despawn logic
- [ ] Visual polish

## Code Improvements Needed

### 1. Fix `useRoguePlayer.js` Closure Issue

**Problem**: `checkRogueEncounter` uses `rogueState` in closure, which may be stale.

**Solution**: Use functional state updates or ref.

### 2. Add Turn Counter to `useGameLogic.js`

Track total turns to trigger rogue spawns every 10-15 turns.

### 3. Integrate Rogue Movement

Call `moveRogue()` in `nextPlayer()` after jeopardy mechanics.

### 4. Integrate Encounter Checking

Check for rogue encounters during player movement, similar to alien checks.

### 5. Visual Rendering

Add rogue to GameBoard rendering logic, similar to aliens but with different styling.

## Expected Behavior

1. **Turn 10-15**: Rogue spawns at random position (15-70)
2. **Each Turn**: Rogue moves 1-3 spaces based on pattern
3. **Player Movement**: If player lands on or passes through rogue, knockback occurs
4. **Turn 25-30**: Rogue despawns (15 turns after spawn)
5. **Visual**: 👽 icon visible on board with glow effect

## Testing Checklist

- [ ] Rogue spawns between positions 15-70
- [ ] Rogue doesn't spawn on players or checkpoints
- [ ] Rogue moves each turn
- [ ] Movement patterns work correctly
- [ ] Direct hit knockback (-15 spaces)
- [ ] Pass-through knockback (-10 spaces)
- [ ] Rogue despawns after 15 turns
- [ ] Rogue resets on game reset
- [ ] Visual rendering works
- [ ] No console errors

