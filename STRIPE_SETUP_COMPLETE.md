# ✅ Stripe Integration - What's Done & What You Need

## ✅ What I've Implemented:

1. **Installed Stripe SDK** ✅
   - `stripe` and `@stripe/stripe-js` packages

2. **Created Stripe Client** ✅
   - `src/lib/stripe.js` - Stripe helper functions
   - Updated to use API version `2025-10-29.clover` (matches your webhook)

3. **Created Netlify Functions** ✅
   - `netlify/functions/create-checkout.js` - Creates checkout sessions
   - `netlify/functions/webhook.js` - Handles Stripe webhooks
   - `netlify/functions/create-portal.js` - Customer portal for subscription management
   - All updated to use API version `2025-10-29.clover`

4. **Updated usePremium Hook** ✅
   - Now uses Stripe Checkout instead of simulation
   - Loads premium status from Supabase
   - Handles checkout redirects
   - Fixed data conversion (snake_case ↔ camelCase)

5. **Updated App.jsx** ✅
   - Handles Stripe checkout success redirects

6. **Updated netlify.toml** ✅
   - Added functions directory configuration

---

## 📋 What You Need To Do:

### 1. **Add Stripe Price IDs to `.env`** (Required)

After creating products in Stripe Dashboard:

```env
# Stripe Keys (you already added these)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (YOU NEED TO ADD THESE)
VITE_STRIPE_PRICE_MONTHLY=price_xxxxx    # Monthly $4.99 subscription
VITE_STRIPE_PRICE_LIFETIME=price_xxxxx   # Lifetime $19.99 one-time

# Webhook Secret (for production - use Stripe CLI for local testing)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**How to get Price IDs:**
1. Go to Stripe Dashboard → Products
2. Create "Space Adventure Monthly Premium" ($4.99/month, recurring)
3. Create "Space Adventure Lifetime Premium" ($19.99, one-time)
4. Copy the Price IDs (start with `price_...`)
5. Add to `.env`

---

### 2. **Update Supabase Schema** (Required)

Run this SQL in Supabase SQL Editor:

```sql
-- See ADD_PREMIUM_COLUMNS.sql for the full script
ALTER TABLE space_adventure_profiles
ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status JSONB DEFAULT '{"active": false, "expires_at": null, "auto_renew": false}'::jsonb,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
```

**Or run:** `ADD_PREMIUM_COLUMNS.sql` file in Supabase SQL Editor

---

### 3. **Set Up Webhook Endpoint** (Required for production)

**For Local Testing (Use Stripe CLI - Recommended):**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8888/.netlify/functions/webhook

# Copy the webhook secret it gives you (whsec_...)
# Add to .env as STRIPE_WEBHOOK_SECRET
```

**⚠️ Important:** For local testing, **don't add a webhook in Stripe Dashboard**. Use Stripe CLI instead!

**For Production:**
1. **Deploy to Netlify first** (get your site URL)
2. Go to Stripe Dashboard → Developers → Event destinations
3. Add endpoint: `https://your-site-name.netlify.app/.netlify/functions/webhook`
   - Replace `your-site-name` with your actual Netlify site name
   - Or use your custom domain: `https://yourdomain.com/.netlify/functions/webhook`
4. Select events (see STRIPE_WEBHOOK_SETUP.md)
5. Copy webhook secret → Add to Netlify environment variables

**📖 Detailed guide:** See `WEBHOOK_URL_EXPLAINED.md` for complete instructions

---

### 4. **Add Environment Variables to Netlify** (Required for production)

In Netlify Dashboard → Site settings → Environment variables:

**Client-side (VITE_ prefix):**
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_PRICE_MONTHLY`
- `VITE_STRIPE_PRICE_LIFETIME`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Server-side (NO VITE_ prefix):**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_KEY` (for webhooks to update Supabase)

---

## 🧪 Testing Locally:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, start Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:8888/.netlify/functions/webhook
   ```

3. **Test checkout:**
   - Click "Upgrade" in the app
   - Select a tier
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry, any CVC

4. **Check webhook logs** in Stripe CLI terminal

---

## 🚀 Deployment Checklist:

- [ ] Created Stripe products and got Price IDs
- [ ] Added Price IDs to `.env`
- [ ] Ran SQL to add premium columns to Supabase
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Added all environment variables to Netlify
- [ ] Tested checkout flow locally
- [ ] Deployed to Netlify
- [ ] Tested checkout flow in production

---

## 📚 Reference Files:

- `STRIPE_INTEGRATION_PLAN.md` - Complete integration guide
- `STRIPE_WEBHOOK_SETUP.md` - Webhook setup instructions
- `STRIPE_SUBSCRIPTION_EVENTS.md` - Event reference
- `ADD_PREMIUM_COLUMNS.sql` - Database schema update

---

**Status:** ✅ Code ready, ⏳ Waiting for Price IDs and Supabase schema update

