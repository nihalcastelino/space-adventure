-- Fix RLS policies to prevent infinite recursion
-- Run this in Supabase SQL Editor

-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can update any user premium status" ON space_adventure_profiles;
DROP POLICY IF EXISTS "Admins can view all users" ON space_adventure_profiles;

-- Create a function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM space_adventure_profiles
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Users can read their own profile OR admins can read all
CREATE POLICY "Users can view own profile or admins view all"
  ON space_adventure_profiles FOR SELECT
  USING (
    auth.uid() = id OR
    is_admin(auth.uid())
  );

-- Policy: Users can update their own profile OR admins can update any
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

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON space_adventure_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

