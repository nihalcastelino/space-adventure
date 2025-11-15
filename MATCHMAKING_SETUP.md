# 🎮 Matchmaking System Setup Guide

## Overview

The Matchmaking system allows players to automatically find opponents based on skill level (MMR). It's now available as a 4th game mode option alongside Local, Online, and AI games.

## ✅ What's Been Implemented

1. **Database Schema** - Supabase tables for matchmaking queue, match history, and player stats
2. **Matchmaking Hook** - `useMatchmaking.js` handles queue management and skill-based matching
3. **Matchmaking UI** - `MatchmakingGame.jsx` component with queue status and match finding
4. **Game Mode Integration** - Added "Matchmaking" button to main menu

## 🚀 Setup Instructions

### Step 1: Run Database Migration

1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/migrations/20250101000001_matchmaking_system.sql`
3. Run the migration
4. This will create:
   - `matchmaking_queue` table
   - `match_history` table
   - `match_participants` table
   - `seasons` table
   - Extended `profiles` table with MMR and stats
   - RLS policies and helper functions

### Step 2: Verify Tables Created

Check that these tables exist in your Supabase database:
- ✅ `matchmaking_queue`
- ✅ `match_history`
- ✅ `match_participants`
- ✅ `seasons`
- ✅ `profiles` (should have new columns: mmr, rank, level, etc.)

### Step 3: Test the System

1. **Start the dev server**: `npm run dev`
2. **Sign in** with a Supabase account (required for matchmaking)
3. **Click "Matchmaking"** button on main menu
4. **Select game mode** (Quick Match or Ranked - Ranked requires Premium)
5. **Click "Find Match"** to join queue
6. **Wait for match** - system will find opponent with similar MMR

## 🎮 How It Works

### Quick Match
- Casual gameplay
- MMR range: ±200 points
- No rank changes
- Free for all users

### Ranked Match
- Competitive gameplay
- MMR range: ±100 points (tighter matching)
- MMR changes based on win/loss
- Requires Premium subscription
- Affects your rank tier

### Matchmaking Flow

1. **Player joins queue** → Added to `matchmaking_queue` table
2. **System searches** → Finds players with similar MMR (±200 for quick, ±100 for ranked)
3. **Match found** → Creates Firebase game, marks players as matched
4. **Game starts** → Players join the matched game
5. **Game ends** → Record match history, update MMR (ranked only)

## 📊 MMR & Ranking System

### MMR (Matchmaking Rating)
- Starts at **1000** for new players
- Increases/decreases based on wins/losses (ranked only)
- Used to match players of similar skill

### Rank Tiers
- **Bronze**: 0-999 MMR
- **Silver**: 1000-1299 MMR
- **Gold**: 1300-1599 MMR
- **Platinum**: 1600-1899 MMR
- **Diamond**: 1900-2199 MMR
- **Master**: 2200-2499 MMR
- **Grandmaster**: 2500+ MMR

### MMR Calculation
- Uses ELO formula
- K-factor: 32 (standard for competitive games)
- Winner gains MMR, loser loses MMR
- Amount depends on opponent's MMR

## 🔧 Configuration

### Adjust MMR Range
Edit `useMatchmaking.js`:
```javascript
const mmrRange = options.gameMode === 'ranked' ? 100 : 200;
```

### Adjust Queue Check Interval
Edit `useMatchmaking.js`:
```javascript
queueCheckInterval.current = setInterval(async () => {
  // Check for matches
}, 2000); // Change 2000ms to adjust frequency
```

### Adjust Queue Expiration
Edit migration SQL:
```sql
expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '5 minutes'
```

## 🐛 Troubleshooting

### "Not authenticated" error
- Make sure user is signed in via Supabase Auth
- Check that `supabase` is configured in `.env`

### "Services not configured" error
- Verify Firebase and Supabase credentials in `.env`
- Check `src/lib/firebase.js` and `src/lib/supabase.js`

### No matches found
- Make sure at least 2 players are in queue
- Check MMR range isn't too narrow
- Verify `matchmaking_queue` table has entries

### Match created but can't join
- Check Firebase game was created successfully
- Verify `match_id` is set in `matchmaking_queue` table
- Check Firebase Realtime Database rules allow read/write

## 📝 Next Steps (Future Enhancements)

1. **Season System** - Implement seasonal resets and rewards
2. **Tournament System** - Organized competitions with brackets
3. **Guilds/Clans** - Social groups and team play
4. **Spectator Mode** - Watch ongoing matches
5. **Replay System** - Review past matches
6. **Leaderboards** - Global and regional rankings
7. **Achievements** - Unlockable rewards

## 🎯 Testing Checklist

- [ ] Run database migration successfully
- [ ] Can join matchmaking queue
- [ ] Queue status shows correctly
- [ ] Can cancel queue
- [ ] Match found when 2+ players in queue
- [ ] Game starts after match found
- [ ] MMR updates after ranked match (Premium users)
- [ ] Rank tier updates correctly
- [ ] Match history recorded

## 💡 Tips

- **Quick Match** is great for casual play and testing
- **Ranked Match** requires Premium - perfect for competitive players
- MMR system ensures fair matches - you'll face players of similar skill
- Queue times depend on active players - more players = faster matches

