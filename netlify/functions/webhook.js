// Netlify Function: Stripe Webhook Handler
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook secret not configured' }),
    };
  }

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
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  // Handle the event
  try {
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

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

async function handleCheckoutComplete(session) {
  const userId = session.metadata?.user_id;
  const tier = session.metadata?.tier;

  if (!userId || !tier) return;

  // For one-time payments (lifetime), activate immediately
  if (tier === 'lifetime') {
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
  // For subscriptions, wait for invoice.paid event
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
  }
}

async function handlePaymentActionRequired(invoice) {
  // Customer needs to authenticate payment (3D Secure, etc.)
  // Don't revoke access yet - they might complete it
  console.log('Payment action required for invoice:', invoice.id);
  // TODO: Notify customer
}

async function handleTrialWillEnd(subscription) {
  // Sent 3 days before trial ends
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  // TODO: Send email notification to customer
  console.log('Trial will end for user:', userId);
}

