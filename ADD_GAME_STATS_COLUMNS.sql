-- Add game statistics columns to existing space_adventure_profiles table
-- Run this if you already created the table without stats columns

ALTER TABLE space_adventure_profiles
ADD COLUMN IF NOT EXISTS total_games INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS spaceports_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS aliens_hit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fastest_win_turns INTEGER;

-- Create indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_space_adventure_wins ON space_adventure_profiles(total_wins DESC);
CREATE INDEX IF NOT EXISTS idx_space_adventure_games ON space_adventure_profiles(total_games DESC);

