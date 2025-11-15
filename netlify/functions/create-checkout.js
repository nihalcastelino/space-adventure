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

// Regional payment configuration
const REGION_CONFIG = {
  IN: {
    currency: 'INR',
    stripePaymentMethods: ['card', 'upi', 'netbanking_', 'paytm'],
  },
  US: {
    currency: 'USD',
    stripePaymentMethods: ['card'],
  },
  GB: {
    currency: 'GBP',
    stripePaymentMethods: ['card'],
  },
  AU: {
    currency: 'AUD',
    stripePaymentMethods: ['card'],
  },
  EU: {
    currency: 'EUR',
    stripePaymentMethods: ['card'],
  },
  DEFAULT: {
    currency: 'USD',
    stripePaymentMethods: ['card'],
  },
};

async function detectUserRegion(event) {
  try {
    // Try to get country from request headers (Cloudflare provides this)
    const countryCode = event.headers['cf-ipcountry'] || 
                       event.headers['x-country-code'] ||
                       null;

    if (countryCode && REGION_CONFIG[countryCode]) {
      console.log(`🌍 Detected region from headers: ${countryCode}`);
      return REGION_CONFIG[countryCode];
    }

    // Try IP geolocation
    const ip = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
               event.headers['x-real-ip'] ||
               null;

    if (ip) {
      try {
        const ipResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          const detectedCode = ipData.country_code;
          if (detectedCode && REGION_CONFIG[detectedCode]) {
            console.log(`🌍 Detected region from IP: ${detectedCode} (${ipData.country_name})`);
            return REGION_CONFIG[detectedCode];
          }
        }
      } catch (error) {
        console.warn('IP geolocation failed:', error);
      }
    }
  } catch (error) {
    console.warn('Region detection failed:', error);
  }

  console.log('🌍 Using default region (USD)');
  return REGION_CONFIG.DEFAULT;
}

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
    const { priceId, tier, type, countryCode } = JSON.parse(event.body); // type: 'subscription' or 'coins', countryCode: optional override
    
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

    // Detect user's region for payment methods
    const region = countryCode 
      ? (REGION_CONFIG[countryCode] || REGION_CONFIG.DEFAULT)
      : await detectUserRegion(event);
    
    console.log(`🌍 Using region: ${region.currency}, Payment methods: ${region.stripePaymentMethods.join(', ')}`);

    // Create checkout session
    const baseUrl = event.headers.origin || event.headers.referer?.replace(/\/$/, '') || 'http://localhost:3000';
    const isOneTimePayment = tier === 'lifetime' || type === 'coins';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isOneTimePayment ? 'payment' : 'subscription',
      payment_method_types: region.stripePaymentMethods,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=cancelled`,
      metadata: { 
        user_id: user.id, 
        tier: tier || 'coins',
        type: type || (isOneTimePayment ? 'coins' : 'subscription'),
        price_id: priceId,
        country_code: countryCode || 'unknown'
      },
      subscription_data: !isOneTimePayment ? {
        metadata: { user_id: user.id, tier },
      } : undefined,
      automatic_tax: {
        enabled: true, // Auto-calculate VAT/GST based on customer location
      },
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

