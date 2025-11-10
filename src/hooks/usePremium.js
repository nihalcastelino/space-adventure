import { useState, useEffect, useCallback } from 'react';

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

  // Purchase premium (simulation for testing)
  const purchasePremium = useCallback(async (tierId) => {
    // In production, this would:
    // 1. Open payment processor (Stripe, IAP, etc.)
    // 2. Process payment
    // 3. Verify payment on backend
    // 4. Update user's premium status in database
    // 5. Return success/failure

    console.log(`Purchasing premium tier: ${tierId}`);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const tierData = PREMIUM_TIERS[tierId.toUpperCase()];
    if (!tierData) {
      return { success: false, error: 'Invalid tier' };
    }

    setTier(tierId.toLowerCase());

    if (tierData.interval === 'month') {
      // Set monthly subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      setSubscriptionStatus({
        active: true,
        expiresAt: expiresAt.toISOString(),
        autoRenew: true
      });
    } else if (tierData.interval === 'once') {
      // Lifetime purchase
      setSubscriptionStatus({
        active: true,
        expiresAt: null, // Never expires
        autoRenew: false
      });
    }

    return { success: true, tier: tierId };
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(() => {
    // In production, this would cancel the subscription with the payment processor

    setSubscriptionStatus(prev => ({
      ...prev,
      autoRenew: false
    }));

    return { success: true };
  }, []);

  // Restore purchases (for IAP)
  const restorePurchases = useCallback(async () => {
    // In production, this would:
    // 1. Query the payment processor for active subscriptions
    // 2. Restore any valid purchases
    // 3. Update local state

    console.log('Restoring purchases...');

    // Simulate restore
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, restored: [] };
  }, []);

  // Get days remaining in subscription
  const getDaysRemaining = useCallback(() => {
    if (tier === 'lifetime') return Infinity;
    if (!subscriptionStatus.expiresAt) return 0;

    const now = Date.now();
    const expiresAt = new Date(subscriptionStatus.expiresAt).getTime();
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

// Payment provider IDs (replace with your actual IDs)
export const PAYMENT_IDS = {
  // Stripe product IDs
  STRIPE_MONTHLY: 'price_xxxxxxxxxxxxx',
  STRIPE_LIFETIME: 'price_xxxxxxxxxxxxx',

  // iOS App Store product IDs
  IOS_MONTHLY: 'com.spaceadventure.premium.monthly',
  IOS_LIFETIME: 'com.spaceadventure.premium.lifetime',

  // Android Google Play product IDs
  ANDROID_MONTHLY: 'premium_monthly',
  ANDROID_LIFETIME: 'premium_lifetime'
};
