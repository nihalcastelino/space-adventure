# 🎮 Gameplay Variants 4-10: Detailed Mechanics

## Overview

These variants completely change how you play and win the game. Here's exactly how each one works:

---

## 4. **Checkpoint Challenge** 🎯

### How It Works:
- **Standard gameplay** BUT with a twist
- You must reach position 100 **AND** visit **ALL** checkpoints before winning
- Checkpoints are tracked: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
- **Important**: Since it's dice-based, you can't control exact movement, but you CAN use strategy!

### Win Condition:
```
Player reaches position 100
  AND
Player has visited ALL checkpoints: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
```

### How It Actually Works (Dice-Based):
Since movement is random, here's the realistic gameplay:

**Example Gameplay:**
1. Player starts at 0 (checkpoint 0 ✓ automatically)
2. Player rolls 5 → lands on 5 (no checkpoint yet)
3. Player rolls 6 → lands on 11 (passes checkpoint 10, but doesn't land on it)
4. **Problem**: Player missed checkpoint 10!
5. Player rolls 3 → lands on 14 (still past checkpoint 10)
6. Player hits alien → goes back to checkpoint 0
7. **Now player can try again** to hit checkpoint 10
8. Player rolls 4 → lands on 4 (still missed)
9. Player rolls 6 → lands on 10 ✓ (checkpoint 10 collected!)
10. Continue until all checkpoints visited, then reach 100

### Strategy (What You CAN Control):
- **Use Power-Ups Strategically**:
  - "Precise Move" power-up: Land exactly on missed checkpoints
  - "Shield" power-up: Avoid aliens when you're close to a checkpoint
  - "Extra Roll" power-up: More chances to hit checkpoints
  
- **Use Spaceports Wisely**:
  - Spaceports can help you reach missed checkpoints
  - Example: You're at 45, missed checkpoint 40, spaceport at 36 → 70 (can backtrack)
  
- **Accept Aliens as Reset Opportunities**:
  - If you've passed a checkpoint, hitting an alien resets you
  - This gives you another chance to hit missed checkpoints
  - Don't always avoid aliens - sometimes they help!

- **Track Your Progress**:
  - Know which checkpoints you've missed
  - Focus on hitting missed ones before advancing too far

### Visual Indicator:
- Shows checklist: ✓ 0 ✓ 10 ✗ 20 ✓ 30 ✗ 40 ...
- Highlights missed checkpoints on the board
- Shows "You need to visit: 20, 40, 50..." message
- Blocks win at 100 if checkpoints missing

### Realistic Expectation:
- This variant makes games **longer** (more turns needed)
- Requires **persistence and luck**
- Strategy is about **power-up usage**, not route planning
- May need to intentionally reset via aliens to hit missed checkpoints

---

## 5. **Alien Hunter** 👾

### How It Works:
- **Fixed game length**: 50 turns total
- **Objective**: Defeat the most aliens
- After 50 turns, player with most alien kills wins

### Win Condition:
```
After 50 turns:
  Player with highest aliensHit count wins
  (If tie, player closest to 100 wins)
```

### Example Gameplay:
1. Turn 1-50: Normal gameplay
2. Each time a player hits an alien, their `aliensHit` counter increases
3. After turn 50, game ends
4. Winner is determined by alien kill count

### Tracking:
- **Player 1**: aliensHit = 5
- **Player 2**: aliensHit = 3
- **Player 3**: aliensHit = 7
- **Winner**: Player 3 (most aliens hit)

### Strategy:
- **Seek out aliens!** Don't avoid them
- Use power-ups to hit aliens intentionally
- Position yourself to land on alien squares
- Track your kill count vs opponents

### Visual Indicator:
- Shows kill count: 👾 Player 1: 5 kills
- Turn counter: Turn 35/50
- Leaderboard showing kill counts

---

## 6. **King of the Hill** 👑

### How It Works:
- **Objective**: Hold position 50 for 3 consecutive turns
- You must stay on position 50 without moving
- If you move away, counter resets

### Win Condition:
```
Player lands on position 50
  AND
Stays on position 50 for 3 consecutive turns
  (without moving away)
```

### Example Gameplay:
1. Player rolls 5, moves to position 45
2. Player rolls 5, lands exactly on 50 ✓ (Turn 1 on hill)
3. Player rolls 6, but needs exactly 0 to stay - **can't stay!** Counter resets
4. Player rolls 1, moves to 51 (off the hill)
5. Player rolls 1, moves back to 50 ✓ (Turn 1 on hill again)
6. Player rolls 0 (or uses power-up to skip turn), stays on 50 ✓ (Turn 2)
7. Player rolls 0 again, stays on 50 ✓ (Turn 3) → **WIN!**

### Strategy:
- Get to position 50 first
- Use defensive power-ups to skip turns
- Block opponents from reaching 50
- Use shields to avoid being knocked off

### Visual Indicator:
- Shows: 👑 Player 1: 2/3 turns on hill
- Hill position highlighted on board
- Counter resets if player moves away

---

## 7. **Reverse Race** 🔄

### How It Works:
- **Start**: Position 100 (finish line)
- **Goal**: Position 0 (start line)
- **Movement**: Backwards (subtract dice roll)
- First to reach 0 wins

### Win Condition:
```
Player reaches position 0 or below
```

### Example Gameplay:
1. All players start at position 100
2. Player 1 rolls 6, moves to 94 (100 - 6)
3. Player 2 rolls 4, moves to 96 (100 - 4)
4. Player 1 rolls 5, moves to 89
5. Continue backwards...
6. Player 1 rolls 3, moves to 0 → **WIN!**

### Special Rules:
- Spaceports work in reverse (take you further back)
- Aliens send you forward (closer to start, further from goal)
- Checkpoints work normally (safe spots)

### Strategy:
- Think backwards!
- Spaceports are bad (move you away from 0)
- Aliens are good (move you toward 0)
- Use power-ups to move backwards faster

### Visual Indicator:
- Board shows positions counting down: 100 → 99 → 98 ... → 1 → 0
- Movement animations go left/backwards

---

## 8. **Sudden Death** 💀

### How It Works:
- **One alien hit = immediate elimination**
- Last player standing wins
- OR first player to reach 100 wins

### Win Condition:
```
Option 1: Last player not eliminated
Option 2: First player to reach 100 (before elimination)
```

### Example Gameplay:
1. 4 players start
2. Player 1 hits alien → **ELIMINATED** (3 players left)
3. Player 2 hits alien → **ELIMINATED** (2 players left)
4. Player 3 reaches 100 → **WIN!** (before elimination)

### Elimination Rules:
- Hit alien = immediate elimination
- Eliminated players can't take turns
- Game continues until 1 player remains OR someone reaches 100

### Strategy:
- **Avoid aliens at ALL costs!**
- Use shields constantly
- Use power-ups to skip alien squares
- Very careful, defensive play
- High risk, high reward (2x coins/XP)

### Visual Indicator:
- Shows eliminated players: 💀 Player 1 (Eliminated)
- Red X over eliminated players
- "X players remaining" counter

---

## 9. **Time Attack** ⏱️

### How It Works:
- **5-minute time limit**
- Reach 100 within time = win
- If time runs out, closest to 100 wins

### Win Condition:
```
Option 1: Reach position 100 within 5 minutes
Option 2: After 5 minutes, player closest to 100 wins
```

### Example Gameplay:
1. Timer starts: 5:00
2. Players race to 100
3. Timer counts down: 4:59, 4:58...
4. Player 1 reaches 100 at 3:45 → **WIN!**

OR

1. Timer runs out: 0:00
2. Player 1 at position 87
3. Player 2 at position 92
4. Player 3 at position 78
5. **Winner**: Player 2 (closest to 100)

### Time Mechanics:
- Real-time countdown
- Pauses during animations
- Shows time remaining prominently

### Strategy:
- **Fast decisions!** No time to think
- Aggressive play
- Use spaceports for speed
- Don't waste time on power-ups

### Visual Indicator:
- Large timer: ⏱️ 4:32 remaining
- Red when < 1 minute
- Shows positions when time runs out

---

## 10. **Power-Up Rush** 🎁

### How It Works:
- **Power-ups spawn every turn**
- Normal race to 100
- But with constant power-up availability

### Win Condition:
```
Standard: Reach position 100
```

### Power-Up Mechanics:
- Every turn, a power-up spawns on the board
- Players can collect power-ups as they pass
- Power-ups are more frequent and valuable

### Example Gameplay:
1. Turn 1: Power-up spawns at position 12
2. Player 1 lands on 12, collects power-up
3. Turn 2: New power-up spawns at position 25
4. Player 2 lands on 25, collects power-up
5. Turn 3: Power-up spawns at position 8
6. Continue with constant power-ups...

### Strategy:
- **Use power-ups strategically!**
- Don't hoard them (new ones spawn constantly)
- Chain power-ups for maximum effect
- Plan routes to collect power-ups

### Visual Indicator:
- Power-up icons on board
- "Power-up available!" notifications
- Power-up inventory fills quickly

---

## Summary Table

| Variant | Win Condition | Key Mechanic | Strategy |
|---------|--------------|--------------|----------|
| **Checkpoint** | Reach 100 + all checkpoints | Must visit all checkpoints | Plan route, don't rush |
| **Alien Hunter** | Most aliens after 50 turns | Count alien hits | Seek aliens, track kills |
| **King of Hill** | Hold position 50 for 3 turns | Stay on hill | Get there first, defend |
| **Reverse** | Reach position 0 | Move backwards | Think backwards |
| **Sudden Death** | Last standing or reach 100 | One hit = elimination | Avoid aliens at all costs |
| **Time Attack** | Reach 100 in 5 min or closest | Time limit | Fast decisions, aggressive |
| **Power-Up Rush** | Reach 100 | Power-ups every turn | Use power-ups constantly |

---

## Implementation Notes

### What Needs to Be Added:

1. **Checkpoint Challenge**:
   - Track `visitedCheckpoints` array per player
   - Check on each checkpoint visit
   - Block win if not all visited

2. **Alien Hunter**:
   - Track `aliensHit` counter per player
   - Increment on alien encounter
   - End game after 50 turns
   - Compare kill counts

3. **King of the Hill**:
   - Track `turnsOnHill` counter
   - Increment when on position 50
   - Reset when player moves away
   - Check for 3 consecutive turns

4. **Reverse Race**:
   - Start players at position 100
   - Subtract dice roll instead of add
   - Reverse spaceport logic
   - Win at position 0

5. **Sudden Death**:
   - Track `eliminated` flag per player
   - Set on alien hit
   - Skip eliminated players' turns
   - End when 1 player remains

6. **Time Attack**:
   - Start timer (5 minutes)
   - Countdown in real-time
   - Check win condition on timer end
   - Show timer prominently

7. **Power-Up Rush**:
   - Spawn power-up every turn
   - Place randomly on board
   - Allow collection when landing on square
   - More frequent power-up availability

---

**Status:** ✅ Variant mechanics defined
**Next:** Integrate into game logic and add UI indicators

