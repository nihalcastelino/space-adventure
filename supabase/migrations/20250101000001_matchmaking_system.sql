-- Matchmaking System for MMO-style gameplay
-- Run this migration in Supabase SQL Editor

-- Create profiles table if it doesn't exist (for compatibility)
-- Note: This project uses space_adventure_profiles, but we'll create a profiles view/table for matchmaking
-- First, ensure space_adventure_profiles exists
DO $$
BEGIN
  -- Create space_adventure_profiles if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'space_adventure_profiles') THEN
    CREATE TABLE space_adventure_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      display_name TEXT,
      username TEXT,
      avatar_url TEXT,
      coins INTEGER DEFAULT 100,
      level INTEGER DEFAULT 1,
      xp INTEGER DEFAULT 0,
      premium_tier TEXT DEFAULT 'free',
      subscription_status TEXT DEFAULT 'inactive',
      subscription_expires_at TIMESTAMPTZ,
      total_games INTEGER DEFAULT 0,
      total_wins INTEGER DEFAULT 0,
      total_losses INTEGER DEFAULT 0,
      best_time_ms INTEGER,
      spaceports_used INTEGER DEFAULT 0,
      aliens_hit INTEGER DEFAULT 0,
      fastest_win_turns INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE space_adventure_profiles ENABLE ROW LEVEL SECURITY;
    
    -- Basic RLS policies
    CREATE POLICY "Users can view own game profile"
      ON space_adventure_profiles FOR SELECT
      USING (auth.uid() = id);
    
    CREATE POLICY "Users can update own game profile"
      ON space_adventure_profiles FOR UPDATE
      USING (auth.uid() = id);
    
    CREATE POLICY "Users can insert own game profile"
      ON space_adventure_profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Note: We use space_adventure_profiles directly for foreign keys
-- Views cannot be used in foreign key constraints, so all references use space_adventure_profiles

-- Extend space_adventure_profiles table with MMO stats
ALTER TABLE space_adventure_profiles 
ADD COLUMN IF NOT EXISTS mmr INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_season_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_season_rank TEXT;

-- Note: level already exists in space_adventure_profiles, so we don't add it again

-- Matchmaking Queue
CREATE TABLE IF NOT EXISTS matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES space_adventure_profiles(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL DEFAULT 'quick', -- 'quick', 'ranked'
  variant TEXT DEFAULT 'classic',
  difficulty TEXT DEFAULT 'normal',
  mmr INTEGER DEFAULT 1000,
  queued_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '5 minutes',
  matched BOOLEAN DEFAULT false,
  match_id UUID, -- Reference to matched game
  CONSTRAINT valid_game_mode CHECK (game_mode IN ('quick', 'ranked'))
);

-- Index for efficient queue matching
-- Note: Cannot use NOW() in index predicate, so we index on matched and game_mode
-- The expires_at filter will be applied in queries
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_active 
ON matchmaking_queue(matched, game_mode, mmr) 
WHERE matched = false;

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_user 
ON matchmaking_queue(user_id) 
WHERE matched = false;

-- Match History (for ranked games)
CREATE TABLE IF NOT EXISTS match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL, -- Firebase game ID
  game_mode TEXT NOT NULL DEFAULT 'quick',
  variant TEXT DEFAULT 'classic',
  difficulty TEXT DEFAULT 'normal',
  season_id UUID, -- Reference to current season
  finished_at TIMESTAMP DEFAULT NOW(),
  duration_seconds INTEGER,
  player_count INTEGER DEFAULT 2
);

-- Match Participants (who played in each match)
CREATE TABLE IF NOT EXISTS match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES match_history(id) ON DELETE CASCADE,
  user_id UUID REFERENCES space_adventure_profiles(id) ON DELETE CASCADE,
  position INTEGER, -- Final position (1 = winner)
  mmr_before INTEGER,
  mmr_after INTEGER,
  mmr_change INTEGER DEFAULT 0,
  UNIQUE(match_id, user_id)
);

-- Seasons (for ranked play)
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  active BOOLEAN DEFAULT true,
  rewards JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create default season
INSERT INTO seasons (name, start_date, end_date, active)
VALUES (
  'Season 1',
  NOW(),
  NOW() + INTERVAL '3 months',
  true
)
ON CONFLICT DO NOTHING;

-- RLS Policies for matchmaking_queue
ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- Users can only see their own queue entries
CREATE POLICY "Users can view own queue entries"
ON matchmaking_queue FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own queue entries
CREATE POLICY "Users can insert own queue entries"
ON matchmaking_queue FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own queue entries
CREATE POLICY "Users can update own queue entries"
ON matchmaking_queue FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own queue entries
CREATE POLICY "Users can delete own queue entries"
ON matchmaking_queue FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for match_history
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;

-- Everyone can view match history
CREATE POLICY "Anyone can view match history"
ON match_history FOR SELECT
USING (true);

-- RLS Policies for match_participants
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

-- Users can view their own match participation
CREATE POLICY "Users can view own match participation"
ON match_participants FOR SELECT
USING (auth.uid() = user_id OR true); -- Allow viewing all for leaderboards

-- Function to calculate MMR change
CREATE OR REPLACE FUNCTION calculate_mmr_change(
  winner_mmr INTEGER,
  loser_mmr INTEGER,
  k_factor INTEGER DEFAULT 32
) RETURNS INTEGER AS $$
DECLARE
  expected_score NUMERIC;
  actual_score NUMERIC := 1.0;
  mmr_change INTEGER;
BEGIN
  -- Calculate expected score using ELO formula
  expected_score := 1.0 / (1.0 + POWER(10.0, (loser_mmr - winner_mmr) / 400.0));
  
  -- Calculate MMR change
  mmr_change := ROUND(k_factor * (actual_score - expected_score));
  
  RETURN mmr_change;
END;
$$ LANGUAGE plpgsql;

-- Function to update player stats after match
CREATE OR REPLACE FUNCTION update_player_stats_after_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Update player stats when match is completed
  IF NEW.position = 1 THEN
    -- Winner
    UPDATE space_adventure_profiles
    SET 
      wins = wins + 1,
      total_games = total_games + 1,
      current_streak = current_streak + 1,
      best_streak = GREATEST(best_streak, current_streak + 1),
      mmr = NEW.mmr_after,
      experience = experience + 100, -- Base XP for win
      total_wins = total_wins + 1
    WHERE id = NEW.user_id;
  ELSE
    -- Loser
    UPDATE space_adventure_profiles
    SET 
      losses = losses + 1,
      total_games = total_games + 1,
      current_streak = 0,
      mmr = NEW.mmr_after,
      experience = experience + 50, -- Base XP for participation
      total_losses = total_losses + 1
    WHERE id = NEW.user_id;
  END IF;
  
  -- Update rank based on MMR
  UPDATE space_adventure_profiles
  SET rank = CASE
    WHEN mmr >= 2500 THEN 'grandmaster'
    WHEN mmr >= 2200 THEN 'master'
    WHEN mmr >= 1900 THEN 'diamond'
    WHEN mmr >= 1600 THEN 'platinum'
    WHEN mmr >= 1300 THEN 'gold'
    WHEN mmr >= 1000 THEN 'silver'
    ELSE 'bronze'
  END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats when match participant is inserted
CREATE TRIGGER update_stats_on_match_complete
AFTER INSERT ON match_participants
FOR EACH ROW
EXECUTE FUNCTION update_player_stats_after_match();

-- Function to clean up expired queue entries
CREATE OR REPLACE FUNCTION cleanup_expired_queue_entries()
RETURNS void AS $$
BEGIN
  DELETE FROM matchmaking_queue
  WHERE expires_at < NOW() AND matched = false;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired entries (requires pg_cron extension)
-- This would need to be set up separately in Supabase dashboard

