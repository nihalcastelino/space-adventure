# 🚀 Supabase Setup Guide for Space Adventure

## Database Setup Options

### Option 1: Use Existing Supabase Project (Recommended)
**Yes, you can use the same Supabase project!** Supabase projects support multiple tables, so you can create separate tables for Space Adventure in your existing project.

**Advantages:**
- ✅ Reuse existing Supabase credentials
- ✅ Single project to manage
- ✅ Can share user accounts if needed
- ✅ Easier setup

**Steps:**
1. Use your existing Supabase project URL and anon key
2. Create new tables (see schema below)
3. Tables are namespaced, so no conflicts

### Option 2: Create New Supabase Project
If you prefer complete separation, create a new project:

1. Go to https://supabase.com
2. Create new project
3. Copy URL and anon key
4. Create tables (see schema below)

---

## Quick Setup Steps

### 1. Get Supabase Credentials

**If using existing project:**
- Go to your Supabase project dashboard
- Settings → API
- Copy:
  - Project URL
  - `anon` `public` key

**If creating new project:**
- Create project at https://supabase.com
- Copy URL and anon key from Settings → API

### 2. Add to Environment Variables (Optional)

The code includes fallback values to use the same Supabase project as bible-service. 
You can optionally override with your own project by creating `.env.local`:

```env
VITE_SUPABASE_URL=https://ixmthkimboopkdzcnpdv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** The code will use the shared Supabase project by default, so you can skip this step if you want to use the same project.

**Important:** Add `.env.local` to `.gitignore` if not already there!

### 3. Create Space Adventure Game Tables

**Note:** We're creating separate tables for space-adventure to avoid conflicts with bible-service tables.

Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor):

```sql
-- Space Adventure game profiles table
CREATE TABLE IF NOT EXISTS space_adventure_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  coins INTEGER DEFAULT 100,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  premium_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expires_at TIMESTAMPTZ,
  -- Game statistics
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

-- Enable Row Level Security
ALTER TABLE space_adventure_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own game profile"
  ON space_adventure_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own game profile"
  ON space_adventure_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own game profile"
  ON space_adventure_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create indexes for game stats queries (for leaderboards)
CREATE INDEX IF NOT EXISTS idx_space_adventure_level ON space_adventure_profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_space_adventure_coins ON space_adventure_profiles(coins DESC);
CREATE INDEX IF NOT EXISTS idx_space_adventure_xp ON space_adventure_profiles(xp DESC);

-- Function to automatically create game profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_space_adventure_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.space_adventure_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create game profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_space_adventure ON auth.users;
CREATE TRIGGER on_auth_user_created_space_adventure
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_space_adventure_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_space_adventure_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_space_adventure_profiles_updated_at ON space_adventure_profiles;
CREATE TRIGGER update_space_adventure_profiles_updated_at
  BEFORE UPDATE ON space_adventure_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_space_adventure_updated_at();
```

**Important:** This creates completely separate tables from bible-service:
- ✅ No conflicts with existing tables
- ✅ Independent game data
- ✅ Users can have accounts in both apps
- ✅ RLS policies protect user data

### 4. Enable Google OAuth (Optional)

**See `GOOGLE_OAUTH_SETUP.md` for detailed step-by-step instructions!**

Quick steps:
1. Create Google OAuth credentials in Google Cloud Console
2. Enable Google provider in Supabase Dashboard
3. Add Client ID and Client Secret
4. Add redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

**Full guide:** Check `GOOGLE_OAUTH_SETUP.md` for complete instructions with screenshots and troubleshooting.

---

## Table Schema Explanation

### `space_adventure_profiles` Table (Separate from bible-service)

**All columns:**
- **id**: UUID (matches auth.users.id, references auth.users)
- **email**: User's email
- **display_name**: User's display name (for game)
- **coins**: Current coin balance (default: 100)
- **level**: Current level (default: 1)
- **xp**: Current XP (default: 0)
- **premium_tier**: 'free', 'monthly', 'yearly', 'lifetime'
- **subscription_status**: 'active', 'inactive', 'cancelled'
- **subscription_expires_at**: When subscription expires (null for lifetime)
- **total_games**: Total games played (default: 0)
- **total_wins**: Total wins (default: 0)
- **total_losses**: Total losses (default: 0)
- **best_time_ms**: Best game completion time in milliseconds
- **spaceports_used**: Total spaceports used (default: 0)
- **aliens_hit**: Total aliens hit (default: 0)
- **fastest_win_turns**: Fastest win in turns
- **created_at**: Account creation timestamp
- **updated_at**: Last update timestamp

**Note:** This is a completely separate table from `user_profiles` (bible-service). Both apps can use the same Supabase project and auth.users, but have independent game data!

---

## Testing

After setup, test authentication:

1. Start dev server: `npm run dev`
2. Try to create a room (should prompt for login)
3. Sign up with email/password
4. Check Supabase Dashboard → Table Editor → `space_adventure_profiles` to see your game profile

---

## Troubleshooting

### "Supabase credentials not found"
- Check `.env.local` exists
- Check variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after adding env vars

### "Table does not exist"
- Run the SQL schema in Supabase SQL Editor
- Check table name is `space_adventure_profiles` (not `user_profiles`)

### "RLS policy violation"
- Check RLS policies are created
- Verify user is authenticated
- Check policy conditions match your use case

---

## Future Migration Path

**Current Setup:** Using shared Supabase project with bible-service
- ✅ Cost-effective for starting out
- ✅ Easy to set up
- ✅ Shared authentication

**When to Migrate:** Once you have enough traffic/users
- Create your own Supabase project
- Export `space_adventure_profiles` table data
- Update environment variables
- Import data to new project
- No code changes needed (just env vars)

**Migration Steps (Future):**
1. Create new Supabase project
2. Run the same SQL schema
3. Export data: `SELECT * FROM space_adventure_profiles`
4. Import to new project
5. Update `.env.local` with new credentials
6. Done! ✅

---

## Next Steps

After setup:
1. ✅ Test authentication
2. ✅ Test room creation (should require login)
3. ✅ Test coin sync
4. ✅ Test premium status sync

See `SUBSCRIPTION_PURCHASE_APPROACH.md` for Stripe integration next!

