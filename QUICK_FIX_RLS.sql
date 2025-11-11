-- QUICK FIX: Drop problematic policies and recreate with function
-- Run this in Supabase SQL Editor to fix the infinite recursion error

-- Step 1: Drop ALL existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can update any user premium status" ON space_adventure_profiles;
DROP POLICY IF EXISTS "Admins can view all users" ON space_adventure_profiles;
DROP POLICY IF EXISTS "Users can view own game profile" ON space_adventure_profiles;
DROP POLICY IF EXISTS "Users can update own game profile" ON space_adventure_profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON space_adventure_profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins update any" ON space_adventure_profiles;

-- Step 2: Create function to check admin status (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM space_adventure_profiles
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate policies using the function (no recursion!)
CREATE POLICY "Users can view own profile or admins view all"
  ON space_adventure_profiles FOR SELECT
  USING (
    auth.uid() = id OR
    is_admin(auth.uid())
  );

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

-- Ensure insert policy exists (users can only insert their own)
DROP POLICY IF EXISTS "Users can insert own game profile" ON space_adventure_profiles;
CREATE POLICY "Users can insert own game profile"
  ON space_adventure_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

