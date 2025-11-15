// Netlify Function: Create Stripe Checkout Session
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
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { priceId, tier, type } = JSON.parse(event.body); // type: 'subscription' or 'coins'
    
    // Validate priceId format
    if (!priceId || !priceId.startsWith('price_')) {
      console.error('Invalid priceId format:', priceId);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: `Invalid Price ID format. Expected 'price_...' but got '${priceId}'. Please check your environment variables (VITE_STRIPE_PRICE_MONTHLY and VITE_STRIPE_PRICE_LIFETIME) and ensure they contain Price IDs, not Product IDs.` 
        }),
      };
    }
    
    const authHeader = event.headers.authorization;

    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Get user from Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Get user email
    const { data: profile } = await supabase
      .from('space_adventure_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('space_adventure_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const baseUrl = event.headers.origin || event.headers.referer?.replace(/\/$/, '') || 'http://localhost:3000';
    const isOneTimePayment = tier === 'lifetime' || type === 'coins';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isOneTimePayment ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=cancelled`,
      metadata: { 
        user_id: user.id, 
        tier: tier || 'coins',
        type: type || (isOneTimePayment ? 'coins' : 'subscription'),
        price_id: priceId
      },
      subscription_data: !isOneTimePayment ? {
        metadata: { user_id: user.id, tier },
      } : undefined,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id, url: session.url }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Provide helpful error message for common issues
    let errorMessage = error.message;
    if (error.message.includes('No such price')) {
      errorMessage = `Invalid Price ID: ${error.message}. Please check that your environment variables (VITE_STRIPE_PRICE_MONTHLY and VITE_STRIPE_PRICE_LIFETIME) contain valid Price IDs (starting with 'price_'), not Product IDs (starting with 'prod_').`;
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

