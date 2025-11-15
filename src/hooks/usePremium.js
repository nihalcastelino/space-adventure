import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Premium tiers
export const PREMIUM_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: {
      playGames: true,
      earnCoins: true,
      basicCosmetics: true,
      ads: true,
      coinMultiplier: 1.0
    }
  },
  MONTHLY: {
    id: 'monthly',
    name: 'Premium Pass',
    price: 4.99,
    interval: 'month',
    features: {
      playGames: true,
      earnCoins: true,
      basicCosmetics: true,
      premiumCosmetics: true,
      ads: false,
      coinMultiplier: 1.5,
      dailyBonus: 50,
      exclusivePowerUps: true,
      prioritySupport: true
    },
    perks: [
      '50% more coins from games',
      'No ads, ever',
      'Exclusive cosmetics',
      '50 bonus coins daily',
      'Exclusive power-ups',
      'Priority support'
    ]
  },
  LIFETIME: {
    id: 'lifetime',
    name: 'Lifetime Premium',
    price: 19.99,
    interval: 'once',
    features: {
      playGames: true,
      earnCoins: true,
      basicCosmetics: true,
      premiumCosmetics: true,
      ads: false,
      coinMultiplier: 2.0,
      dailyBonus: 100,
      exclusivePowerUps: true,
      prioritySupport: true,
      futureUpdates: true
    },
    perks: [
      '100% more coins from games',
      'No ads, forever',
      'All current & future cosmetics',
      '100 bonus coins daily',
      'All power-ups unlocked',
      'Priority support',
      'One-time payment'
    ]
  }
};

/*
 * Premium/Subscription Integration Guide
 *
 * For production, integrate with a payment processor:
 *
 * WEB (Stripe):
 * 1. npm install @stripe/stripe-js
 * 2. Create Stripe account & get API keys
 * 3. Set up subscription products in Stripe Dashboard
 * 4. Implement Stripe Checkout or Elements
 *
 * MOBILE (In-App Purchases):
 * iOS (App Store):
 * 1. npm install react-native-iap
 * 2. Set up in-app purchases in App Store Connect
 * 3. Implement StoreKit integration
 *
 * Android (Google Play):
 * 1. npm install react-native-iap
 * 2. Set up in-app products in Google Play Console
 * 3. Implement Google Play Billing integration
 */

export function usePremium() {
  const [tier, setTier] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    active: false,
    expiresAt: null,
    autoRenew: true
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('premium');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTier(data.tier || 'free');
        setSubscriptionStatus(data.subscription || {
          active: false,
          expiresAt: null,
          autoRenew: true
        });

        // Check if subscription expired
        if (data.subscription?.expiresAt) {
          const now = Date.now();
          const expiresAt = new Date(data.subscription.expiresAt).getTime();

          if (now > expiresAt && data.tier !== 'lifetime') {
            // Subscription expired
            setTier('free');
            setSubscriptionStatus({
              active: false,
              expiresAt: null,
              autoRenew: false
            });
          }
        }
      } catch (e) {
        console.error('Failed to load premium status:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = {
      tier,
      subscription: subscriptionStatus
    };
    localStorage.setItem('premium', JSON.stringify(data));
  }, [tier, subscriptionStatus]);

  // Get current tier data
  const getCurrentTier = useCallback(() => {
    return PREMIUM_TIERS[tier.toUpperCase()] || PREMIUM_TIERS.FREE;
  }, [tier]);

  // Check if feature is available
  const hasFeature = useCallback((feature) => {
    const currentTier = getCurrentTier();
    return currentTier.features[feature] || false;
  }, [getCurrentTier]);

  // Load premium status from Supabase
  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('space_adventure_profiles')
      .select('premium_tier, subscription_status')
      .eq('id', user.id)
      .single();

    if (data) {
      setTier(data.premium_tier || 'free');
      
      // Convert snake_case from database to camelCase for component state
      const status = data.subscription_status || {};
      setSubscriptionStatus({
        active: status.active || false,
        expiresAt: status.expires_at || null,
        autoRenew: status.auto_renew !== undefined ? status.auto_renew : false,
      });
    }
  }, []);

  // Purchase premium - redirects to Stripe Checkout
  const purchasePremium = useCallback(async (tierId) => {
    console.log('Purchase premium called with tierId:', tierId);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return { success: false, error: 'Please sign in to purchase premium. Click "Sign In" in the top right corner.' };
    }

    console.log('User authenticated:', user.email);

    const priceId = PAYMENT_IDS[tierId === 'monthly' ? 'STRIPE_MONTHLY' : 'STRIPE_LIFETIME'];
    console.log('Price ID:', priceId);
    
    // Validate Price ID format
    if (!priceId || priceId.startsWith('price_xxxx') || priceId === 'price_xxxxxxxxxxxxx') {
      console.error('Price ID not configured');
      return { 
        success: false, 
        error: 'Stripe Price IDs not configured. Please add VITE_STRIPE_PRICE_MONTHLY and VITE_STRIPE_PRICE_LIFETIME to your environment variables.' 
      };
    }
    
    // Check if Product ID was used instead of Price ID
    if (priceId.startsWith('prod_')) {
      console.error('Product ID used instead of Price ID:', priceId);
      return {
        success: false,
        error: `Invalid configuration: You're using a Product ID (${priceId}) instead of a Price ID. Please go to Stripe Dashboard → Products → Click on your product → Copy the Price ID (starts with 'price_') and update your environment variables.`
      };
    }
    
    // Ensure it's a valid Price ID format
    if (!priceId.startsWith('price_')) {
      console.error('Invalid Price ID format:', priceId);
      return {
        success: false,
        error: `Invalid Price ID format: '${priceId}'. Price IDs must start with 'price_'. Please check your environment variables (VITE_STRIPE_PRICE_MONTHLY and VITE_STRIPE_PRICE_LIFETIME).`
      };
    }

    try {
      // Get auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        return { success: false, error: 'Session expired. Please sign in again.' };
      }

      console.log('Creating checkout session...');
      
      // Detect user's region for regional pricing
      let countryCode = null;
      try {
        const { detectUserRegion } = await import('../lib/paymentConfig');
        const region = await detectUserRegion();
        countryCode = region.countryCode;
        console.log(`🌍 Detected region: ${region.country} (${region.countryCode})`);
      } catch (error) {
        console.warn('Region detection failed, using default:', error);
      }

      // Call Netlify Function to create checkout session
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId, tier: tierId, countryCode }),
      });

      console.log('Checkout response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Checkout error:', errorData);
        return { 
          success: false, 
          error: errorData.error || `Failed to create checkout session (${response.status}). Please try again or contact support.` 
        };
      }

      const data = await response.json();
      console.log('Checkout session created, redirecting to:', data.url);
      
      if (!data.url) {
        return { success: false, error: 'No checkout URL received. Please try again.' };
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
      return { success: true };
    } catch (error) {
      console.error('Error creating checkout:', error);
      return { success: false, error: `Network error: ${error.message}. Please check your connection and try again.` };
    }
  }, []);

  // Cancel subscription - redirects to Stripe Customer Portal
  const cancelSubscription = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data } = await supabase
      .from('space_adventure_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!data?.stripe_customer_id) {
      return { success: false, error: 'No active subscription found' };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/.netlify/functions/create-portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        return { success: false, error: 'Failed to create portal session' };
      }

      const { url } = await response.json();
      window.location.href = url;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Restore purchases - reload from Supabase
  const restorePurchases = useCallback(async () => {
    await loadPremiumStatus();
    return { success: true };
  }, [loadPremiumStatus]);

  // Get days remaining in subscription
  const getDaysRemaining = useCallback(() => {
    if (tier === 'lifetime') return Infinity;
    if (!subscriptionStatus.expiresAt) return 0;

    const now = Date.now();
    // Handle both ISO string and timestamp
    const expiresAt = typeof subscriptionStatus.expiresAt === 'string' 
      ? new Date(subscriptionStatus.expiresAt).getTime()
      : subscriptionStatus.expiresAt;
    const diff = expiresAt - now;

    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [tier, subscriptionStatus]);

  // Check if premium is active
  const isPremium = useCallback(() => {
    return tier !== 'free' && subscriptionStatus.active;
  }, [tier, subscriptionStatus]);

  // Get coin multiplier
  const getCoinMultiplier = useCallback(() => {
    const currentTier = getCurrentTier();
    return currentTier.features.coinMultiplier || 1.0;
  }, [getCurrentTier]);

  // Get daily bonus coins
  const getDailyBonus = useCallback(() => {
    const currentTier = getCurrentTier();
    return currentTier.features.dailyBonus || 0;
  }, [getCurrentTier]);

  return {
    tier,
    subscriptionStatus,
    isPremium: isPremium(),
    getCurrentTier,
    hasFeature,
    purchasePremium,
    cancelSubscription,
    restorePurchases,
    getDaysRemaining,
    getCoinMultiplier,
    getDailyBonus
  };
}

// Payment provider IDs - loaded from environment variables
export const PAYMENT_IDS = {
  // Stripe Price IDs (from .env)
  STRIPE_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_xxxxxxxxxxxxx',
  STRIPE_LIFETIME: import.meta.env.VITE_STRIPE_PRICE_LIFETIME || 'price_xxxxxxxxxxxxx',

  // iOS App Store product IDs (for future mobile app)
  IOS_MONTHLY: 'com.spaceadventure.premium.monthly',
  IOS_LIFETIME: 'com.spaceadventure.premium.lifetime',

  // Android Google Play product IDs (for future mobile app)
  ANDROID_MONTHLY: 'premium_monthly',
  ANDROID_LIFETIME: 'premium_lifetime'
};
