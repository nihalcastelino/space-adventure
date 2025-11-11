# 💳 Stripe Integration Plan: Checkout vs Payment Links

## Recommendation: **Stripe Checkout (Prebuilt Forms)**

### Why Checkout Over Payment Links?

**Stripe Checkout (Prebuilt Forms):**
- ✅ **Better for subscriptions** - Built-in subscription management
- ✅ **Customer Portal** - Users can manage subscriptions themselves
- ✅ **More control** - Customize success/cancel URLs, metadata
- ✅ **Webhook support** - Better integration with backend
- ✅ **Mobile optimized** - Works great on all devices
- ✅ **PCI compliant** - Stripe handles all payment data
- ✅ **Already implemented** - We have reference code from bible-service

**Payment Links:**
- ❌ **Limited customization** - Less control over flow
- ❌ **No customer portal** - Harder subscription management
- ❌ **Better for one-time payments** - Not ideal for subscriptions
- ❌ **Less integration** - Harder to sync with Supabase

---

## 🎯 Implementation Plan

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER FLOW                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User clicks "Upgrade" in PremiumModal             │
│     ↓                                                   │
│  2. Frontend calls API: /api/subscriptions/checkout    │
│     ↓                                                   │
│  3. Backend creates Stripe Checkout Session            │
│     ↓                                                   │
│  4. User redirected to Stripe Checkout (hosted)        │
│     ↓                                                   │
│  5. User completes payment                             │
│     ↓                                                   │
│  6. Stripe webhook fires → /api/subscriptions/webhook   │
│     ↓                                                   │
│  7. Backend updates Supabase                           │
│     ↓                                                   │
│  8. User redirected back → Premium activated!          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
space-adventure/
├── src/
│   ├── lib/
│   │   └── stripe.js              # Stripe client & helpers
│   ├── hooks/
│   │   └── usePremium.js          # Update to use Stripe
│   └── components/
│       └── PremiumModal.jsx       # Update checkout flow
│
├── netlify/functions/              # Netlify Functions (if using Netlify)
│   ├── create-checkout.js         # Create checkout session
│   └── webhook.js                 # Handle webhooks
│
└── .env.local
    ├── STRIPE_SECRET_KEY=sk_test_...
    ├── STRIPE_PUBLISHABLE_KEY=pk_test_...
    └── STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🔧 Implementation Steps

### Step 1: Install Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

---

### Step 2: Create Stripe Client (`src/lib/stripe.js`)

```javascript
import Stripe from 'stripe';
import { supabase } from './supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Create Stripe checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  email,
  priceId,
  tier,
  successUrl,
  cancelUrl,
}) {
  try {
    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('space_adventure_profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: userId },
      });
      customerId = customer.id;

      await supabase
        .from('space_adventure_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: tier === 'lifetime' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { user_id: userId, tier },
      subscription_data: tier !== 'lifetime' ? {
        metadata: { user_id: userId, tier },
      } : undefined,
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create customer portal session for subscription management
 */
export async function createPortalSession(customerId, returnUrl) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return { url: session.url };
}
```

---

### Step 3: Create Checkout API Endpoint

**For Netlify Functions** (`netlify/functions/create-checkout.js`):

```javascript
const { createCheckoutSession } = require('../../src/lib/stripe');
const { supabase } = require('../../src/lib/supabase');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { priceId, tier } = JSON.parse(event.body);
    const authHeader = event.headers.authorization;
    
    if (!authHeader) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    // Get user from Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'User not found' }) };
    }

    const baseUrl = event.headers.origin || 'http://localhost:3000';
    const { sessionId, url } = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      priceId,
      tier,
      successUrl: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/?checkout=cancelled`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId, url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

**For Vite/Express** (`src/api/subscriptions/checkout.js`):

```javascript
import { createCheckoutSession } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const { priceId, tier } = await request.json();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
      });
    }

    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const { sessionId, url } = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      priceId,
      tier,
      successUrl: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/?checkout=cancelled`,
    });

    return new Response(JSON.stringify({ sessionId, url }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
```

---

### Step 4: Create Webhook Handler

**For Netlify Functions** (`netlify/functions/webhook.js`):

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { supabase } = require('../../src/lib/supabase');

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
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(stripeEvent.data.object);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(stripeEvent.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(stripeEvent.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(stripeEvent.data.object);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(stripeEvent.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(stripeEvent.data.object);
      break;
    case 'invoice.payment_action_required':
      await handlePaymentActionRequired(stripeEvent.data.object);
      break;
    case 'customer.subscription.trial_will_end':
      await handleTrialWillEnd(stripeEvent.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${stripeEvent.type}`);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

async function handleCheckoutComplete(session) {
  const userId = session.metadata?.user_id;
  const tier = session.metadata?.tier;

  if (!userId || !tier) return;

  // For subscriptions, wait for invoice.paid event
  // For one-time payments (lifetime), activate immediately
  const isLifetime = tier === 'lifetime';
  
  if (isLifetime) {
    await supabase
      .from('space_adventure_profiles')
      .update({
        premium_tier: tier,
        subscription_status: {
          active: true,
          expires_at: null,
          auto_renew: false,
        },
        stripe_subscription_id: null,
      })
      .eq('id', userId);
  }
  // For subscriptions, invoice.paid will handle activation
}

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  // Store subscription ID, but don't activate until invoice.paid
  await supabase
    .from('space_adventure_profiles')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: {
        active: subscription.status === 'active',
        expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        auto_renew: true,
      },
    })
    .eq('id', userId);
}

async function handleInvoicePaid(invoice) {
  // This is the key event - activate premium when invoice is paid
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return; // Not a subscription invoice

  const { data } = await supabase
    .from('space_adventure_profiles')
    .select('id, premium_tier')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (data) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const tier = subscription.metadata?.tier || 'monthly';

    await supabase
      .from('space_adventure_profiles')
      .update({
        premium_tier: tier,
        subscription_status: {
          active: true,
          expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          auto_renew: true,
        },
      })
      .eq('id', data.id);
  }
}

async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  await supabase
    .from('space_adventure_profiles')
    .update({
      subscription_status: {
        active: subscription.status === 'active',
        expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
        auto_renew: true,
      },
    })
    .eq('id', userId);
}

async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  await supabase
    .from('space_adventure_profiles')
    .update({
      premium_tier: 'free',
      subscription_status: {
        active: false,
        expires_at: null,
        auto_renew: false,
      },
      stripe_subscription_id: null,
    })
    .eq('id', userId);
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const { data } = await supabase
    .from('space_adventure_profiles')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (data) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Don't revoke access immediately - subscription might still be active
    // Only revoke if status is 'past_due', 'unpaid', or 'canceled'
    const shouldRevoke = ['past_due', 'unpaid', 'canceled'].includes(subscription.status);

    await supabase
      .from('space_adventure_profiles')
      .update({
        subscription_status: {
          active: !shouldRevoke,
          expires_at: shouldRevoke ? null : new Date(subscription.current_period_end * 1000).toISOString(),
          auto_renew: subscription.status === 'active',
          payment_failed: true,
          last_payment_failed_at: new Date().toISOString(),
        },
      })
      .eq('id', data.id);

    // TODO: Send notification email to customer
  }
}

async function handlePaymentActionRequired(invoice) {
  // Customer needs to authenticate payment (3D Secure, etc.)
  // Don't revoke access yet - they might complete it
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const { data } = await supabase
    .from('space_adventure_profiles')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (data) {
    // TODO: Notify customer that payment action is required
    // Keep subscription active for now
  }
}

async function handleTrialWillEnd(subscription) {
  // Sent 3 days before trial ends
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  // TODO: Send email notification to customer
  // Remind them that trial is ending and they'll be charged
}
```

---

### Step 5: Update `usePremium.js`

```javascript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const STRIPE_PRICE_IDS = {
  monthly: process.env.VITE_STRIPE_PRICE_MONTHLY || 'price_xxx',
  lifetime: process.env.VITE_STRIPE_PRICE_LIFETIME || 'price_xxx',
};

export function usePremium() {
  const [tier, setTier] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    active: false,
    expires_at: null,
    auto_renew: false,
  });

  // Load premium status from Supabase
  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('space_adventure_profiles')
      .select('premium_tier, subscription_status')
      .eq('id', user.id)
      .single();

    if (data) {
      setTier(data.premium_tier || 'free');
      setSubscriptionStatus(data.subscription_status || {
        active: false,
        expires_at: null,
        auto_renew: false,
      });
    }
  };

  const purchasePremium = async (tierId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Please sign in to purchase' };
    }

    const priceId = STRIPE_PRICE_IDS[tierId];
    if (!priceId) {
      return { success: false, error: 'Invalid tier' };
    }

    try {
      // Call your checkout API endpoint
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`,
        },
        body: JSON.stringify({ priceId, tier: tierId }),
      });

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const cancelSubscription = async () => {
    // Redirect to Stripe Customer Portal
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('space_adventure_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (data?.stripe_customer_id) {
      const response = await fetch('/api/subscriptions/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`,
        },
      });

      const { url } = await response.json();
      window.location.href = url;
    }
  };

  return {
    tier,
    subscriptionStatus,
    isPremium: tier !== 'free' && subscriptionStatus.active,
    purchasePremium,
    cancelSubscription,
    restorePurchases: loadPremiumStatus,
  };
}
```

---

### Step 6: Update Supabase Schema

```sql
-- Add premium columns to space_adventure_profiles
ALTER TABLE space_adventure_profiles
ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status JSONB DEFAULT '{"active": false, "expires_at": null, "auto_renew": false}'::jsonb,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_space_adventure_profiles_stripe_customer 
ON space_adventure_profiles(stripe_customer_id);
```

---

## 🎯 Stripe Dashboard Setup

### 1. Create Products

**Monthly Premium:**
- Name: "Space Adventure Monthly Premium"
- Price: $4.99/month
- Billing: Recurring
- Copy Price ID: `price_xxxxx`

**Lifetime Premium:**
- Name: "Space Adventure Lifetime Premium"
- Price: $19.99 one-time
- Billing: One-time
- Copy Price ID: `price_xxxxx`

### 2. Set Up Webhook (Event Destination)

1. Go to Stripe Dashboard → Developers → **Event destinations**
2. Click **"+ Add destination"** or **"Add endpoint"**
3. Select **"Webhook endpoint"** as destination type
4. Add endpoint URL: `https://yourdomain.com/api/subscriptions/webhook`
5. Select these **required events**:
   - `checkout.session.completed` - Payment completed
   - `customer.subscription.created` - Subscription created
   - `customer.subscription.updated` - Subscription changed
   - `customer.subscription.deleted` - Subscription cancelled
   - `invoice.paid` - Invoice paid (activate premium)
   - `invoice.payment_failed` - Payment failed
6. **Optional but recommended:**
   - `invoice.payment_action_required` - Customer needs to authenticate
   - `customer.subscription.trial_will_end` - Trial ending soon
   - `invoice.upcoming` - Upcoming renewal
7. Click **"Add destination"** or **"Add endpoint"**
8. Click on your endpoint/destination to open it
9. Find **"Signing secret"** section (may be under Details/Settings)
10. Click **"Reveal"** next to "Signing secret"
11. Copy the webhook signing secret: `whsec_xxxxx`

**📖 Detailed instructions:** See `STRIPE_WEBHOOK_SETUP.md` for step-by-step guide

**⚠️ Important:** According to Stripe docs, `invoice.paid` is the key event for activating subscriptions. Don't activate premium on `checkout.session.completed` for subscriptions - wait for `invoice.paid`!

---

## ✅ Advantages of This Approach

1. **Hosted Checkout** - Stripe handles PCI compliance
2. **Mobile Optimized** - Works perfectly on all devices
3. **Customer Portal** - Users manage subscriptions themselves
4. **Webhook Reliability** - Stripe retries failed webhooks
5. **Subscription Management** - Built-in handling for renewals/cancellations
6. **Security** - No payment data touches your servers

---

## 🚀 Next Steps

1. ✅ **Decision Made**: Use Stripe Checkout (Prebuilt Forms)
2. ⏳ **Install Stripe SDK**: `npm install stripe @stripe/stripe-js`
3. ⏳ **Create Stripe account** and get API keys
4. ⏳ **Set up products** in Stripe Dashboard
5. ⏳ **Implement checkout endpoint**
6. ⏳ **Implement webhook handler**
7. ⏳ **Update usePremium hook**
8. ⏳ **Test with Stripe test cards**

---

**Status:** ✅ Plan ready, ⏳ Implementation pending
**Recommendation:** Use **Stripe Checkout (Prebuilt Forms)** for subscriptions

