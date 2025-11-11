# ✅ Ready to Test Stripe Integration!

## ✅ What You've Done

- ✅ Added Stripe webhook secret to Netlify
- ✅ Added Stripe secret key to Netlify
- ✅ Added Stripe publishable key to `.env` (or Netlify)
- ✅ Premium columns exist in Supabase database
- ✅ Webhook configured at `https://spacerace.games/.netlify/functions/webhook`

---

## 🚀 Next Step: Redeploy Your Site

**Important:** After adding environment variables, you need to redeploy:

1. Go to Netlify Dashboard → Your site
2. Click **"Deploys"** tab
3. Click **"Trigger deploy"** → **"Deploy site"**
   - OR wait for auto-deploy if you pushed to git

This ensures the new environment variables are available to your Netlify Functions.

---

## ✅ Required Environment Variables Checklist

Make sure these are set in **Netlify** (Site settings → Environment variables):

### Stripe Variables:
- ✅ `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
- ✅ `STRIPE_WEBHOOK_SECRET` - Your webhook signing secret (starts with `whsec_`)
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_`)
- ✅ `VITE_STRIPE_PRICE_MONTHLY` - Monthly subscription price ID (starts with `price_`)
- ✅ `VITE_STRIPE_PRICE_LIFETIME` - Lifetime purchase price ID (starts with `price_`)

### Supabase Variables:
- ✅ `VITE_SUPABASE_URL` - Your Supabase project URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- ✅ `SUPABASE_SERVICE_KEY` - Your Supabase service role key (for Netlify Functions)

---

## 🧪 Testing Checklist

### 1. Test Monthly Subscription

1. **Sign in** to your site (Google OAuth or email)
2. Click **"Upgrade to Premium"** or open Premium modal
3. Select **"Monthly Premium"** ($4.99/month)
4. Click **"Subscribe"**
5. You should be redirected to Stripe Checkout
6. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
7. Complete checkout
8. You should be redirected back to your site
9. **Check:** Premium status should be active in your profile

### 2. Test Lifetime Purchase

1. Sign in (if not already)
2. Open Premium modal
3. Select **"Lifetime Premium"** ($19.99)
4. Click **"Purchase"**
5. Use same test card: `4242 4242 4242 4242`
6. Complete checkout
7. **Check:** Premium tier should be "lifetime" immediately

### 3. Verify Webhook Events

1. Go to Stripe Dashboard → **Developers** → **Event destinations**
2. Click on your webhook (`spacerace`)
3. Click **"Recent events"** tab
4. You should see events like:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `invoice.paid`

### 4. Check Database

1. Go to Supabase Dashboard → **Table Editor** → `space_adventure_profiles`
2. Find your user's row
3. Verify:
   - ✅ `premium_tier` = `monthly` or `lifetime`
   - ✅ `subscription_status.active` = `true`
   - ✅ `stripe_customer_id` is populated
   - ✅ `stripe_subscription_id` is populated (for monthly)

### 5. Test Premium Features

1. **No Ads:** Premium users shouldn't see ads
2. **Difficulty Levels:** Premium users can access "Hard", "Extreme", etc.
3. **Game Variants:** Premium users can access all variants
4. **Coin Multiplier:** Premium users get 1.5x (monthly) or 2x (lifetime) coins

---

## 🐛 Troubleshooting

### Issue: "Price ID not configured"
**Fix:** Add `VITE_STRIPE_PRICE_MONTHLY` and `VITE_STRIPE_PRICE_LIFETIME` to Netlify environment variables

### Issue: Webhook not receiving events
**Fix:** 
1. Check webhook URL is correct: `https://spacerace.games/.netlify/functions/webhook`
2. Verify `STRIPE_WEBHOOK_SECRET` is set in Netlify
3. Check Netlify Function logs: Netlify Dashboard → Functions → webhook → Logs

### Issue: Premium status not updating
**Fix:**
1. Check Supabase RLS policies allow updates
2. Verify `SUPABASE_SERVICE_KEY` is set in Netlify (not just `VITE_SUPABASE_ANON_KEY`)
3. Check webhook is receiving `invoice.paid` events

### Issue: "Not authenticated" error
**Fix:** Make sure user is signed in before attempting purchase

---

## 📝 Test Cards

Use these Stripe test cards:

**Success:**
- `4242 4242 4242 4242` - Visa (always succeeds)

**Decline:**
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

**3D Secure:**
- `4000 0025 0000 3155` - Requires authentication

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Checkout redirects work (to Stripe and back)
2. ✅ Webhook events appear in Stripe Dashboard
3. ✅ Database updates with premium status
4. ✅ User profile shows premium tier
5. ✅ Premium features are unlocked
6. ✅ No ads shown for premium users

---

## 🎉 You're Ready!

Once you've redeployed and tested, your Stripe integration is complete! 

If you encounter any issues, check:
- Netlify Function logs
- Stripe Dashboard → Event destinations → Recent events
- Supabase Dashboard → Table Editor → `space_adventure_profiles`

Good luck! 🚀

