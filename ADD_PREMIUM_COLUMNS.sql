-- Add premium subscription columns to space_adventure_profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE space_adventure_profiles
ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status JSONB DEFAULT '{"active": false, "expires_at": null, "auto_renew": false}'::jsonb,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_space_adventure_profiles_stripe_customer 
ON space_adventure_profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_space_adventure_profiles_stripe_subscription 
ON space_adventure_profiles(stripe_subscription_id);

-- Add comments for documentation
COMMENT ON COLUMN space_adventure_profiles.premium_tier IS 'Premium tier: free, monthly, or lifetime';
COMMENT ON COLUMN space_adventure_profiles.subscription_status IS 'JSON object with active, expires_at, auto_renew, payment_failed, etc.';
COMMENT ON COLUMN space_adventure_profiles.stripe_customer_id IS 'Stripe customer ID for this user';
COMMENT ON COLUMN space_adventure_profiles.stripe_subscription_id IS 'Stripe subscription ID (null for lifetime purchases)';

