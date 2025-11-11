# 🔗 Your Stripe Webhook Configuration

## ✅ Your Webhook Setup

**Webhook URL:** `https://spacerace.games/.netlify/functions/webhook`

**Status:** ✅ Configured and ready!

---

## 📋 Webhook Details

### Recommended: Use the First One (18 Events)

**API Version:** `2025-10-29.clover`  
**Signing Secret:** `whsec_E4YUifa4tQMvfKcQPy4uOHCwgvKeavFy`  
**Events:** 18 events (more comprehensive)

**Add to Netlify Environment Variables:**
```
STRIPE_WEBHOOK_SECRET=whsec_E4YUifa4tQMvfKcQPy4uOHCwgvKeavFy
```

---

## 🔧 What to Do Now

### 1. Add Webhook Secret to Netlify

1. Go to Netlify Dashboard → Your site → **Site settings**
2. Click **Environment variables**
3. Add new variable:
   - **Key:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_E4YUifa4tQMvfKcQPy4uOHCwgvKeavFy`
4. Click **Save**
5. **Redeploy** your site (or wait for auto-deploy)

---

### 2. Optional: Delete the Second Webhook

You have **2 webhook destinations** pointing to the same URL:
- ✅ **Keep:** The one with `2025-10-29.clover` API version (18 events)
- ❌ **Delete:** The one with "Unversioned" API version (13 events)

**To delete:**
1. Go to Stripe Dashboard → Developers → Event destinations
2. Click on the "Unversioned" webhook
3. Click **"Delete destination"** or **"Remove"**

---

### 3. Verify Events Are Selected

Make sure these **required events** are selected:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.paid`
- ✅ `invoice.payment_failed`

**To check:**
1. Go to Stripe Dashboard → Developers → Event destinations
2. Click on your webhook (the one with `2025-10-29.clover`)
3. Scroll to "Events" section
4. Verify all required events are selected

---

## ✅ Code Updated

I've updated all Stripe code to use API version `2025-10-29.clover` to match your webhook configuration.

**Files updated:**
- ✅ `netlify/functions/webhook.js`
- ✅ `netlify/functions/create-checkout.js`
- ✅ `netlify/functions/create-portal.js`
- ✅ `src/lib/stripe.js`

---

## 🧪 Test Your Webhook

### Test in Stripe Dashboard:
1. Go to Stripe Dashboard → Developers → Event destinations
2. Click on your webhook
3. Click **"Send test webhook"**
4. Select an event (e.g., `checkout.session.completed`)
5. Click **"Send test webhook"**
6. Check Netlify Function logs to see if it received the event

### Test with Real Purchase:
1. Make a test purchase on your site
2. Use test card: `4242 4242 4242 4242`
3. Check Stripe Dashboard → Event destinations → Your webhook → **"Recent events"**
4. You should see events being received

---

## 📝 Summary

**Your Webhook URL:** ✅ `https://spacerace.games/.netlify/functions/webhook`  
**Webhook Secret:** `whsec_E4YUifa4tQMvfKcQPy4uOHCwgvKeavFy`  
**API Version:** `2025-10-29.clover` ✅  
**Status:** Ready to use!

**Next Step:** Add the webhook secret to Netlify environment variables and redeploy.

