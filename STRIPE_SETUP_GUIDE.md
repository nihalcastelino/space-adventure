# Stripe Integration Setup Guide

Complete guide to set up Stripe payments for Space Adventure, including automatic product creation.

## 🎯 Overview

This guide will help you:
1. ✅ Create Stripe products and prices automatically
2. ✅ Set up API endpoints for checkout
3. ✅ Configure webhooks for payment processing
4. ✅ Integrate with the Shop and Premium modals

---

## Step 1: Get Stripe API Keys

1. **Create/Login to Stripe Account**: https://dashboard.stripe.com
2. **Get API Keys**:
   - Go to **Developers → API keys**
   - Copy your **Publishable key** (starts with `pk_`)
   - Copy your **Secret key** (starts with `sk_`) - **Keep this secret!**

3. **Add to `.env` file**:
```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxx  # Server-side only
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # Client-side
```

---

## Step 2: Create Products Automatically

We've created a script that automatically creates all products and prices in Stripe.

### Run the Script

```bash
# Install dependencies if needed
npm install stripe dotenv

# Run the product creation script
node scripts/create-stripe-products.js
```

### What It Creates

**Premium Subscriptions:**
- Premium Monthly ($4.99/month)
- Premium Lifetime ($19.99 one-time)

**Coin Packages:**
- Small: 100 coins - $0.99
- Medium: 350 coins + 50 bonus - $2.99
- Large: 650 coins + 100 bonus - $4.99
- X-Large: 1,500 coins + 300 bonus - $9.99
- Mega: 3,500 coins + 1,000 bonus - $19.99

### Copy Price IDs

After running the script, it will output Price IDs. Copy them to your `.env` file:

```bash
# Stripe Price IDs (from script output)
VITE_STRIPE_PRICE_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_LIFETIME=price_xxxxx
VITE_STRIPE_PRICE_COINS_SMALL=price_xxxxx
VITE_STRIPE_PRICE_COINS_MEDIUM=price_xxxxx
VITE_STRIPE_PRICE_COINS_LARGE=price_xxxxx
VITE_STRIPE_PRICE_COINS_XLARGE=price_xxxxx
VITE_STRIPE_PRICE_COINS_MEGA=price_xxxxx
```

---

## Step 3: Set Up Webhooks

Webhooks allow Stripe to notify your app when payments succeed.

### Option A: Production (Netlify)

1. **Deploy your site to Netlify** (if not already)
2. **Get webhook URL**: `https://your-site.netlify.app/.netlify/functions/webhook`
3. **Add webhook in Stripe Dashboard**:
   - Go to **Developers → Webhooks**
   - Click **Add endpoint**
   - URL: `https://your-site.netlify.app/.netlify/functions/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Click **Add endpoint**
4. **Copy webhook signing secret** (starts with `whsec_`)
5. **Add to Netlify environment variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

### Option B: Local Development (Stripe CLI)

1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli
2. **Login**: `stripe login`
3. **Forward webhooks to localhost**:
   ```bash
   stripe listen --forward-to localhost:8888/.netlify/functions/webhook
   ```
4. **Copy webhook secret** from output (starts with `whsec_`)
5. **Add to `.env`**: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

---

## Step 4: Update Environment Variables

### Local Development (`.env`)

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # For local dev with Stripe CLI

# Stripe Price IDs
VITE_STRIPE_PRICE_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_LIFETIME=price_xxxxx
VITE_STRIPE_PRICE_COINS_SMALL=price_xxxxx
VITE_STRIPE_PRICE_COINS_MEDIUM=price_xxxxx
VITE_STRIPE_PRICE_COINS_LARGE=price_xxxxx
VITE_STRIPE_PRICE_COINS_XLARGE=price_xxxxx
VITE_STRIPE_PRICE_COINS_MEGA=price_xxxxx
```

### Production (Netlify)

Add all the above variables to **Netlify Dashboard → Site Settings → Environment Variables**

**Important**: 
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` should **NOT** have `VITE_` prefix (server-side only)
- All `VITE_` prefixed variables are exposed to the client

---

## Step 5: Test the Integration

### Test Cards (Stripe Test Mode)

Use these test card numbers in Stripe Checkout:

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Decline:**
- Card: `4000 0000 0000 0002`

### Test Flow

1. **Start dev server**: `npm run dev`
2. **Sign in** to your account
3. **Click "Shop" button** in main menu
4. **Click "Buy Now"** on any coin package
5. **Complete checkout** with test card
6. **Verify**:
   - Redirected back to app
   - Coins added to account
   - Success message displayed

---

## Step 6: Verify Webhook Processing

### Check Webhook Logs

**Stripe Dashboard:**
- Go to **Developers → Webhooks**
- Click on your webhook endpoint
- View **Recent events** to see webhook deliveries

**Netlify Functions Logs:**
- Go to **Netlify Dashboard → Functions**
- Click on `webhook` function
- View logs for webhook processing

### Expected Webhook Events

When a purchase completes, you should see:
1. `checkout.session.completed` - Session completed
2. `invoice.paid` (for subscriptions) - Payment succeeded
3. Database updated with coins/premium status

---

## Troubleshooting

### "Invalid Price ID" Error

**Problem**: Price ID not found or incorrect format

**Solution**:
1. Verify Price IDs in `.env` start with `price_` (not `prod_`)
2. Run `node scripts/create-stripe-products.js` again to get correct IDs
3. Check Stripe Dashboard → Products → Click product → Copy Price ID

### "Webhook secret not configured"

**Problem**: `STRIPE_WEBHOOK_SECRET` missing

**Solution**:
1. Add webhook endpoint in Stripe Dashboard
2. Copy webhook signing secret
3. Add to `.env` or Netlify environment variables

### "User not found" Error

**Problem**: User not authenticated

**Solution**:
1. Ensure user is signed in before purchasing
2. Check Supabase auth is working
3. Verify `Authorization` header is sent with request

### Coins Not Added After Purchase

**Problem**: Webhook not processing correctly

**Solution**:
1. Check webhook logs in Stripe Dashboard
2. Verify webhook URL is correct
3. Check Netlify function logs for errors
4. Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

### Checkout Redirects to Wrong URL

**Problem**: Base URL incorrect

**Solution**:
- Update `baseUrl` in `netlify/functions/create-checkout.js`
- Or set `VITE_APP_URL` in environment variables

---

## Production Checklist

Before going live:

- [ ] Switch to **Live mode** in Stripe Dashboard
- [ ] Update API keys to **Live keys** (starts with `pk_live_` and `sk_live_`)
- [ ] Update Price IDs to **Live Price IDs** (create products in Live mode)
- [ ] Set up **Production webhook** endpoint
- [ ] Test with real card (small amount)
- [ ] Verify webhook processing works
- [ ] Set up **email notifications** for failed payments
- [ ] Configure **tax collection** (Stripe Tax)
- [ ] Set up **refund policy** page
- [ ] Test **subscription cancellation** flow

---

## API Endpoints

### Create Checkout Session

**Endpoint**: `/.netlify/functions/create-checkout`

**Method**: `POST`

**Headers**:
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

**Body**:
```json
{
  "priceId": "price_xxxxx",
  "tier": "monthly" | "lifetime" | "coins",
  "type": "subscription" | "coins"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/..."
}
```

### Webhook Endpoint

**Endpoint**: `/.netlify/functions/webhook`

**Method**: `POST`

**Headers**: Automatically set by Stripe

**Body**: Stripe webhook event (automatically verified)

---

## Support

For issues:
1. Check Stripe Dashboard → Logs for errors
2. Check Netlify Functions logs
3. Verify all environment variables are set
4. Test with Stripe test cards first

For Stripe support: https://support.stripe.com

