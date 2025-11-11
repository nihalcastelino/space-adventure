-- Add admin column to space_adventure_profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE space_adventure_profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_space_adventure_profiles_admin 
ON space_adventure_profiles(is_admin) WHERE is_admin = TRUE;

-- Add comment
COMMENT ON COLUMN space_adventure_profiles.is_admin IS 'Admin users can manage other users and update premium status';

-- Grant admin access (update with your email)
-- Option 1: Set admin by email
UPDATE space_adventure_profiles
SET is_admin = TRUE
WHERE email = 'nihalcastelino@gmail.com';

-- Option 2: Set admin by user ID (get your user ID from Supabase Dashboard → Authentication → Users)
-- UPDATE space_adventure_profiles
-- SET is_admin = TRUE
-- WHERE id = 'YOUR_USER_ID_HERE';

-- Create a function to check if user is admin (bypasses RLS to prevent recursion)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM space_adventure_profiles
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view own game profile" ON space_adventure_profiles;
DROP POLICY IF EXISTS "Users can update own game profile" ON space_adventure_profiles;

-- Add RLS policy for admins to view all users OR users view own
CREATE POLICY "Users can view own profile or admins view all"
  ON space_adventure_profiles FOR SELECT
  USING (
    auth.uid() = id OR
    is_admin(auth.uid())
  );

-- Add RLS policy for admins to update any user OR users update own
CREATE POLICY "Users can update own profile or admins update any"
  ON space_adventure_profiles FOR UPDATE
  USING (
    auth.uid() = id OR
    is_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = id OR
    is_admin(auth.uid())
  );

