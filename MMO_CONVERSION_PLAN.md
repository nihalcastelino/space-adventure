# 🎮 MMO Conversion Plan for Space Adventure

## Overview

Converting Space Adventure from a room-based multiplayer game into a full MMO-style experience with persistent worlds, matchmaking, social features, and competitive systems.

## 🎯 Core MMO Features

### 1. **Persistent Game Server**
- Centralized game state management
- Multiple concurrent game instances
- Server-side game logic validation
- Anti-cheat measures

### 2. **Matchmaking System**
- Skill-based matchmaking (ELO/MMR)
- Queue system for finding games
- Auto-balance teams
- Quick match vs ranked match

### 3. **Social Features**
- **Guilds/Clans**: Form teams, compete together
- **Friends System**: Add friends, see online status
- **Global Chat**: Server-wide communication
- **Private Messaging**: Direct player-to-player chat
- **Player Profiles**: View stats, achievements, history

### 4. **Competitive Systems**
- **Ranked Mode**: Competitive ladder with seasons
- **Tournaments**: Scheduled competitions with prizes
- **Leaderboards**: Global, regional, friends
- **Achievements**: Unlockable rewards
- **Seasonal Rewards**: Time-limited rewards

### 5. **Persistent Player Data**
- Player levels and progression
- Unlockable cosmetics (ships, trails, effects)
- Inventory system
- Currency and economy
- Battle pass/season pass

### 6. **Game Modes**
- **Quick Play**: Casual matchmaking
- **Ranked**: Competitive ladder
- **Custom Rooms**: Create private games
- **Tournament**: Join scheduled events
- **Spectator Mode**: Watch ongoing games

## 🏗️ Architecture Changes

### Current Architecture
```
Client → Firebase Realtime DB → Client
(Peer-to-peer style, room-based)
```

### MMO Architecture
```
Client → Game Server → Database
         ↓
    Matchmaking Service
         ↓
    Social Service
         ↓
    Economy Service
```

## 📊 Database Schema (Supabase)

### New Tables Needed

```sql
-- Player Profiles (Extended)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS:
  - mmr INTEGER DEFAULT 1000, -- Matchmaking Rating
  - rank TEXT DEFAULT 'bronze',
  - level INTEGER DEFAULT 1,
  - experience INTEGER DEFAULT 0,
  - coins INTEGER DEFAULT 0,
  - premium_currency INTEGER DEFAULT 0,
  - total_games INTEGER DEFAULT 0,
  - wins INTEGER DEFAULT 0,
  - losses INTEGER DEFAULT 0,
  - current_streak INTEGER DEFAULT 0,
  - best_streak INTEGER DEFAULT 0,
  - last_season_rank TEXT,
  - current_season_points INTEGER DEFAULT 0;

-- Guilds/Clans
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  tag TEXT UNIQUE NOT NULL, -- 3-4 char tag like [SPACE]
  description TEXT,
  leader_id UUID REFERENCES profiles(id),
  member_count INTEGER DEFAULT 1,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Guild Members
CREATE TABLE guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'leader', 'officer', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  contribution_points INTEGER DEFAULT 0,
  UNIQUE(guild_id, user_id)
);

-- Matchmaking Queue
CREATE TABLE matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL, -- 'quick', 'ranked', 'tournament'
  variant TEXT DEFAULT 'classic',
  difficulty TEXT DEFAULT 'normal',
  mmr INTEGER,
  queued_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '5 minutes'
);

-- Active Games (Extended)
ALTER TABLE games ADD COLUMN IF NOT EXISTS:
  - game_mode TEXT DEFAULT 'custom', -- 'quick', 'ranked', 'tournament', 'custom'
  - season_id UUID REFERENCES seasons(id),
  - is_ranked BOOLEAN DEFAULT false,
  - mmr_change INTEGER, -- MMR change for ranked games
  - tournament_id UUID REFERENCES tournaments(id);

-- Seasons
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  rewards JSONB, -- Season rewards structure
  active BOOLEAN DEFAULT true
);

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  format TEXT NOT NULL, -- 'single_elimination', 'double_elimination', 'round_robin'
  max_participants INTEGER,
  entry_fee INTEGER DEFAULT 0, -- Coins or premium currency
  prize_pool JSONB, -- Prize structure
  start_date TIMESTAMP NOT NULL,
  registration_deadline TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'registration', 'in_progress', 'finished'
  created_by UUID REFERENCES profiles(id)
);

-- Tournament Participants
CREATE TABLE tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'registered', -- 'registered', 'eliminated', 'winner'
  UNIQUE(tournament_id, user_id)
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT, -- 'gameplay', 'social', 'competitive', 'collection'
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  requirement JSONB, -- Achievement requirements
  reward JSONB -- Rewards (coins, xp, cosmetics)
);

-- Player Achievements
CREATE TABLE player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Player Inventory (Cosmetics)
CREATE TABLE player_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'ship', 'trail', 'effect', 'emote'
  item_id TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, item_type, item_id)
);

-- Global Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel TEXT DEFAULT 'global', -- 'global', 'guild', 'tournament_{id}'
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Friends
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK(user_id != friend_id)
);
```

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up game server architecture
- [ ] Implement matchmaking queue system
- [ ] Create player profile extensions
- [ ] Build matchmaking UI
- [ ] Add skill-based matchmaking (MMR)

### Phase 2: Social Features (Week 3-4)
- [ ] Friends system
- [ ] Global chat
- [ ] Player profiles
- [ ] Online status indicators
- [ ] Private messaging

### Phase 3: Competitive Systems (Week 5-6)
- [ ] Ranked mode
- [ ] Season system
- [ ] Leaderboards (global, regional, friends)
- [ ] Achievement system
- [ ] Rewards distribution

### Phase 4: Guilds & Community (Week 7-8)
- [ ] Guild creation and management
- [ ] Guild chat
- [ ] Guild vs Guild competitions
- [ ] Guild leaderboards
- [ ] Guild progression

### Phase 5: Tournaments (Week 9-10)
- [ ] Tournament creation system
- [ ] Tournament brackets
- [ ] Tournament registration
- [ ] Tournament spectating
- [ ] Prize distribution

### Phase 6: Economy & Progression (Week 11-12)
- [ ] Currency system
- [ ] Cosmetic shop
- [ ] Battle pass/Season pass
- [ ] Daily/weekly challenges
- [ ] Progression rewards

## 🛠️ Technical Implementation

### Game Server Options

**Option 1: Node.js + Socket.io**
- Real-time WebSocket connections
- Room-based game management
- Matchmaking service
- Pros: Easy to implement, good for turn-based games
- Cons: Requires server hosting, scaling complexity

**Option 2: Supabase Realtime + Edge Functions**
- Use Supabase Realtime for game state
- Edge Functions for server logic
- Database triggers for matchmaking
- Pros: Serverless, scales automatically
- Cons: Less control, potential latency

**Option 3: Firebase Cloud Functions + Realtime DB**
- Extend current Firebase setup
- Cloud Functions for matchmaking
- Realtime DB for game state
- Pros: Already integrated, familiar
- Cons: Firebase costs scale with usage

### Recommended: Hybrid Approach
- **Supabase** for persistent data (profiles, guilds, achievements)
- **Firebase Realtime DB** for active game state (low latency)
- **Supabase Edge Functions** for matchmaking logic
- **Client-side** game logic with server validation

## 📱 UI/UX Changes

### New Screens Needed

1. **Main Menu**
   - Quick Play button
   - Ranked button
   - Custom Game button
   - Tournament button
   - Guild button
   - Profile button

2. **Matchmaking Screen**
   - Queue status
   - Estimated wait time
   - Cancel queue button
   - Player count in queue

3. **Social Hub**
   - Friends list
   - Online friends
   - Guild info
   - Chat panel

4. **Profile Screen**
   - Stats overview
   - Achievements
   - Match history
   - Cosmetics/Inventory
   - Leaderboard position

5. **Tournament Hub**
   - Upcoming tournaments
   - Active tournaments
   - Tournament brackets
   - Prize information

## 🎮 Gameplay Enhancements

### Ranked Mode Features
- Placement matches (10 games to determine initial rank)
- Rank tiers: Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster
- Promotion/Demotion matches
- Season resets with rewards

### Tournament Features
- Single elimination brackets
- Double elimination brackets
- Round robin groups
- Spectator mode for ongoing matches
- Live bracket updates

### Social Features
- Invite friends to games
- Spectate friend's games
- Send gifts to friends
- Guild challenges

## 💰 Monetization (MMO Style)

### Free-to-Play Model
- **Free**: Quick play, basic cosmetics, limited tournaments
- **Premium**: Ranked mode, exclusive cosmetics, tournament entry, ad-free

### Premium Currency
- Earned through gameplay
- Purchasable with real money
- Used for: Cosmetics, tournament entry, battle pass, premium features

### Battle Pass
- Free track: Basic rewards
- Premium track: Exclusive rewards
- Seasonal progression
- Time-limited (3 months per season)

## 🔒 Security & Anti-Cheat

### Server-Side Validation
- Validate all dice rolls server-side
- Verify move legality
- Check turn order
- Prevent position manipulation

### Rate Limiting
- Limit actions per second
- Prevent spam
- Detect suspicious patterns

### Reporting System
- Report cheaters
- Report toxic behavior
- Automated review system

## 📈 Analytics & Metrics

### Track
- Matchmaking wait times
- Player retention
- Popular game modes
- Tournament participation
- Social engagement
- Economy health

## 🚀 Quick Start Implementation

Would you like me to start implementing:

1. **Matchmaking System** - Queue-based game finding
2. **Ranked Mode** - Competitive ladder with MMR
3. **Player Profiles** - Extended stats and progression
4. **Social Features** - Friends and chat
5. **Tournament System** - Organized competitions

Let me know which features you'd like to prioritize!

