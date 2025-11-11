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

-- Add RLS policy for admins to update any user's premium status
CREATE POLICY "Admins can update any user premium status"
  ON space_adventure_profiles FOR UPDATE
  USING (
    -- User is admin
    EXISTS (
      SELECT 1 FROM space_adventure_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  )
  WITH CHECK (
    -- User is admin
    EXISTS (
      SELECT 1 FROM space_adventure_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Add RLS policy for admins to view all users
CREATE POLICY "Admins can view all users"
  ON space_adventure_profiles FOR SELECT
  USING (
    -- User is admin OR viewing own profile
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM space_adventure_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

