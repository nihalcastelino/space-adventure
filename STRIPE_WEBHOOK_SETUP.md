# 🔗 Stripe Webhook Setup Guide

## Step-by-Step: Getting Your Webhook Secret

### Step 1: Log into Stripe Dashboard

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Log in with your Stripe account
3. Make sure you're in **Test mode** (toggle in top right) for development

**Note:** Stripe's UI may show "Event destinations" instead of "Webhooks" - they're the same thing!

---

### Step 2: Navigate to Event Destinations

1. In the left sidebar, click **"Developers"**
2. Click **"Event destinations"** (under Developers)
3. You'll see a list of webhook endpoints/event destinations (empty if you haven't created any)

---

### Step 3: Create an Event Destination

1. Click **"+ Add destination"** or **"Add endpoint"** button (top right)
2. Select **"Webhook endpoint"** as the destination type
3. Fill in the form:

   **Endpoint URL (Production):**
   ```
   https://your-site-name.netlify.app/.netlify/functions/webhook
   ```
   
   **Or if you have a custom domain:**
   ```
   https://yourdomain.com/.netlify/functions/webhook
   ```
   
   **For Local Development (Use Stripe CLI instead):**
   ```bash
   # Don't add a webhook in Stripe Dashboard for local testing
   # Use Stripe CLI to forward webhooks:
   stripe listen --forward-to localhost:8888/.netlify/functions/webhook
   ```

   **Description (optional):**
   ```
   Space Adventure - Subscription webhooks
   ```

4. Click **"Add destination"** or **"Add endpoint"**

**⚠️ Important:** 
- **Local testing:** Use Stripe CLI (don't add webhook in Dashboard)
- **Production:** Use your deployed Netlify URL + `/.netlify/functions/webhook`

---

### Step 4: Select Events to Listen For

After creating the endpoint, you'll see a list of events. Select these:

**Required Events (Core Subscription Management):**
- ✅ `checkout.session.completed` - When user completes payment/checkout
- ✅ `customer.subscription.created` - When subscription is created
- ✅ `customer.subscription.updated` - When subscription changes (renewals, plan changes, etc.)
- ✅ `customer.subscription.deleted` - When subscription is cancelled
- ✅ `invoice.paid` - When invoice is successfully paid (provision access)
- ✅ `invoice.payment_failed` - When payment fails (revoke access, notify customer)

**Recommended Events (Better User Experience):**
- ✅ `customer.subscription.trial_will_end` - 3 days before trial ends (notify customer)
- ✅ `invoice.upcoming` - Few days before renewal (can add invoice items)
- ✅ `invoice.payment_action_required` - Customer needs to authenticate payment
- ✅ `customer.created` - When customer is created

**Optional Events (Advanced Features):**
- ✅ `invoice.finalized` - Invoice ready to be paid
- ✅ `invoice.finalization_failed` - Invoice couldn't be finalized (handle errors)
- ✅ `customer.subscription.paused` - Subscription paused
- ✅ `customer.subscription.resumed` - Subscription resumed

**For Our Implementation, Select At Minimum:**
1. `checkout.session.completed`
2. `customer.subscription.created`
3. `customer.subscription.updated`
4. `customer.subscription.deleted`
5. `invoice.paid`
6. `invoice.payment_failed`

4. Click **"Add events"** or **"Save"**

---

### Step 5: Get Your Webhook Signing Secret

**After creating the event destination:**

1. You'll see your webhook endpoint in the "Event destinations" list
2. Click on the endpoint name/destination to open it
3. Look for **"Signing secret"** section (may be under "Details" or "Settings")
4. Click **"Reveal"** or **"Click to reveal"** button
5. Copy the secret - it starts with `whsec_...`

**Alternative location:**
- Sometimes the signing secret is shown immediately after creating the endpoint
- Or check the endpoint details page under "Signing secret" or "Webhook signing secret"

**Example:**
```
whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

---

### Step 6: Add to Environment Variables

Add the webhook secret to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51xxxxx...
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

**⚠️ Important:**
- **Test mode** webhook secrets start with `whsec_test_...`
- **Live mode** webhook secrets start with `whsec_live_...`
- Make sure you use the correct one for your environment!

---

## 🔄 Test Mode vs Live Mode

### Test Mode (Development)
- Use test API keys: `sk_test_...` and `pk_test_...`
- Use test webhook secret: `whsec_test_...`
- Test with Stripe test cards (4242 4242 4242 4242)

### Live Mode (Production)
- Use live API keys: `sk_live_...` and `pk_live_...`
- Use live webhook secret: `whsec_live_...`
- Real payments only!

**Toggle between modes:** Use the toggle in the top right of Stripe Dashboard

---

## 🧪 Testing Webhooks Locally

### Option 1: Stripe CLI (Recommended)

1. **Install Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows (using Scoop)
   scoop install stripe
   
   # Linux
   # Download from https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/subscriptions/webhook
   ```

4. **Copy the webhook signing secret:**
   The CLI will output something like:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxx
   ```
   
   Use this secret in your `.env.local` for local testing.

5. **Trigger test events:**
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.updated
   ```

### Option 2: ngrok (Alternative)

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   # or download from https://ngrok.com
   ```

2. **Start your local server:**
   ```bash
   npm run dev
   # Server running on localhost:3000
   ```

3. **Create tunnel:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Add webhook endpoint in Stripe:**
   - URL: `https://abc123.ngrok.io/api/subscriptions/webhook`
   - Get the webhook secret from Stripe Dashboard

---

## 📋 Quick Checklist

- [ ] Created Stripe account
- [ ] Created webhook endpoint in Stripe Dashboard
- [ ] Selected required events
- [ ] Copied webhook signing secret (`whsec_...`)
- [ ] Added to `.env.local` as `STRIPE_WEBHOOK_SECRET`
- [ ] Tested webhook locally (using Stripe CLI or ngrok)
- [ ] Verified webhook handler receives events

---

## 🔍 Verifying Webhook Secret

Your webhook handler should verify the signature:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // Process the event...
};
```

---

## 🚨 Common Issues

### "No signatures found matching the expected signature"
- **Problem:** Webhook secret is incorrect or missing
- **Solution:** Double-check `STRIPE_WEBHOOK_SECRET` in `.env.local`
- **Solution:** Make sure you're using the correct secret (test vs live)

### "Webhook endpoint not found"
- **Problem:** URL is incorrect or server isn't running
- **Solution:** Verify your webhook URL is correct
- **Solution:** Make sure your server is running and accessible

### "Event not handled"
- **Problem:** Event type not in your switch statement
- **Solution:** Add the event type to your webhook handler

---

## 📚 Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Security Best Practices](https://stripe.com/docs/webhooks/signatures)

---

## 🎯 Next Steps

After setting up webhooks:

1. ✅ Test webhook locally with Stripe CLI
2. ✅ Deploy your app to production
3. ✅ Update webhook URL in Stripe Dashboard to production URL
4. ✅ Get production webhook secret
5. ✅ Update production environment variables
6. ✅ Test with real (small) payment

---

**Status:** ✅ Guide ready
**Location:** Stripe Dashboard → Developers → Event destinations → Webhook endpoint

