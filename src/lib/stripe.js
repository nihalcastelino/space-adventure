import Stripe from 'stripe';
import { supabase } from './supabase';

// Initialize Stripe with secret key
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
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

export { stripe };

