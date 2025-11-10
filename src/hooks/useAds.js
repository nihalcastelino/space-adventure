import { useState, useEffect, useCallback, useRef } from 'react';

// Ad configuration
const AD_CONFIG = {
  // Interstitial ads (between games)
  INTERSTITIAL_MIN_INTERVAL: 3, // Show after every 3 games minimum
  INTERSTITIAL_COOLDOWN: 5 * 60 * 1000, // 5 minutes cooldown

  // Rewarded ads
  REWARDED_AVAILABLE: true,
  REWARDED_COOLDOWN: 3 * 60 * 1000, // 3 minutes between rewarded ads

  // Simulation settings (for testing)
  SIMULATE_ADS: true, // Set to false when integrating real ads
  SIMULATION_DURATION: 3000 // 3 seconds for simulated ads
};

/*
 * This hook provides a framework for ad integration.
 *
 * For production, replace simulation logic with actual ad network SDK:
 * - Google AdMob (https://admob.google.com)
 * - Unity Ads
 * - AppLovin MAX
 * - IronSource
 *
 * Integration steps:
 * 1. npm install ad-network-sdk (e.g., @react-native-community/google-mobile-ads)
 * 2. Replace simulation functions with SDK calls
 * 3. Add ad unit IDs from ad network console
 * 4. Handle ad loading, showing, and callbacks
 */

export function useAds(isPremium = false) {
  const [interstitialReady, setInterstitialReady] = useState(false);
  const [rewardedReady, setRewardedReady] = useState(false);
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [adType, setAdType] = useState(null); // 'interstitial' or 'rewarded'

  const gamesPlayedRef = useRef(0);
  const lastInterstitialTime = useRef(0);
  const lastRewardedTime = useRef(Date.now());

  // Load ad state from storage
  useEffect(() => {
    const saved = localStorage.getItem('adState');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        gamesPlayedRef.current = data.gamesPlayed || 0;
        lastInterstitialTime.current = data.lastInterstitialTime || 0;
        lastRewardedTime.current = data.lastRewardedTime || Date.now();
      } catch (e) {
        console.error('Failed to load ad state:', e);
      }
    }
  }, []);

  // Save ad state
  const saveAdState = useCallback(() => {
    const data = {
      gamesPlayed: gamesPlayedRef.current,
      lastInterstitialTime: lastInterstitialTime.current,
      lastRewardedTime: lastRewardedTime.current
    };
    localStorage.setItem('adState', JSON.stringify(data));
  }, []);

  // Simulate ad loading (replace with real SDK)
  useEffect(() => {
    if (AD_CONFIG.SIMULATE_ADS && !isPremium) {
      // Simulate ads being ready
      const timer = setTimeout(() => {
        setInterstitialReady(true);
        setRewardedReady(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isPremium]);

  // Check if interstitial should be shown
  const shouldShowInterstitial = useCallback(() => {
    if (isPremium) return false; // Premium users don't see ads

    const gamesSinceLastAd = gamesPlayedRef.current;
    const timeSinceLastAd = Date.now() - lastInterstitialTime.current;

    return (
      gamesSinceLastAd >= AD_CONFIG.INTERSTITIAL_MIN_INTERVAL &&
      timeSinceLastAd >= AD_CONFIG.INTERSTITIAL_COOLDOWN &&
      interstitialReady
    );
  }, [isPremium, interstitialReady]);

  // Check if rewarded ad is available
  const isRewardedAdAvailable = useCallback(() => {
    if (isPremium) return false; // Premium users get rewards without ads

    const timeSinceLastRewarded = Date.now() - lastRewardedTime.current;
    return rewardedReady && timeSinceLastRewarded >= AD_CONFIG.REWARDED_COOLDOWN;
  }, [isPremium, rewardedReady]);

  // Show interstitial ad
  const showInterstitialAd = useCallback(async (onComplete) => {
    if (!shouldShowInterstitial()) {
      onComplete && onComplete();
      return { success: false, reason: 'Ad not ready or premium user' };
    }

    setIsShowingAd(true);
    setAdType('interstitial');

    if (AD_CONFIG.SIMULATE_ADS) {
      // Simulate ad display
      return new Promise((resolve) => {
        setTimeout(() => {
          setIsShowingAd(false);
          setAdType(null);
          gamesPlayedRef.current = 0;
          lastInterstitialTime.current = Date.now();
          saveAdState();

          onComplete && onComplete();
          resolve({ success: true, watched: true });
        }, AD_CONFIG.SIMULATION_DURATION);
      });
    } else {
      // TODO: Replace with real ad SDK
      /*
       * Example with Google AdMob:
       *
       * import { InterstitialAd } from '@react-native-google-mobile-ads';
       *
       * const ad = InterstitialAd.createForAdRequest('ca-app-pub-xxxxx/xxxxx');
       * ad.onAdEvent((type, error, data) => {
       *   if (type === 'closed') {
       *     gamesPlayedRef.current = 0;
       *     lastInterstitialTime.current = Date.now();
       *     onComplete && onComplete();
       *   }
       * });
       * await ad.load();
       * ad.show();
       */

      console.log('Real ad integration needed');
      setIsShowingAd(false);
      setAdType(null);
      onComplete && onComplete();
      return { success: false, reason: 'Real ads not integrated' };
    }
  }, [shouldShowInterstitial, saveAdState]);

  // Show rewarded ad
  const showRewardedAd = useCallback(async (onReward, onCancel) => {
    if (!isRewardedAdAvailable()) {
      return { success: false, reason: 'Ad not ready' };
    }

    setIsShowingAd(true);
    setAdType('rewarded');

    if (AD_CONFIG.SIMULATE_ADS) {
      // Simulate ad display
      return new Promise((resolve) => {
        setTimeout(() => {
          setIsShowingAd(false);
          setAdType(null);
          lastRewardedTime.current = Date.now();
          saveAdState();

          onReward && onReward();
          resolve({ success: true, rewarded: true });
        }, AD_CONFIG.SIMULATION_DURATION);
      });
    } else {
      // TODO: Replace with real ad SDK
      /*
       * Example with Google AdMob:
       *
       * import { RewardedAd } from '@react-native-google-mobile-ads';
       *
       * const ad = RewardedAd.createForAdRequest('ca-app-pub-xxxxx/xxxxx');
       * ad.onAdEvent((type, error, data) => {
       *   if (type === 'rewarded') {
       *     onReward && onReward();
       *   } else if (type === 'closed' && !data?.rewarded) {
       *     onCancel && onCancel();
       *   }
       *   lastRewardedTime.current = Date.now();
       * });
       * await ad.load();
       * ad.show();
       */

      console.log('Real ad integration needed');
      setIsShowingAd(false);
      setAdType(null);
      return { success: false, reason: 'Real ads not integrated' };
    }
  }, [isRewardedAdAvailable, saveAdState]);

  // Track game played (for interstitial frequency)
  const trackGamePlayed = useCallback(() => {
    gamesPlayedRef.current += 1;
    saveAdState();
  }, [saveAdState]);

  // Get time until next rewarded ad
  const getRewardedAdCooldown = useCallback(() => {
    const timeSinceLastRewarded = Date.now() - lastRewardedTime.current;
    const remaining = Math.max(0, AD_CONFIG.REWARDED_COOLDOWN - timeSinceLastRewarded);
    return Math.ceil(remaining / 1000); // Return seconds
  }, []);

  return {
    // State
    interstitialReady,
    rewardedReady,
    isShowingAd,
    adType,

    // Functions
    shouldShowInterstitial,
    isRewardedAdAvailable,
    showInterstitialAd,
    showRewardedAd,
    trackGamePlayed,
    getRewardedAdCooldown
  };
}

// Ad unit IDs (replace with your actual ad unit IDs from ad network)
export const AD_UNITS = {
  INTERSTITIAL_ANDROID: 'ca-app-pub-xxxxx/xxxxx',
  INTERSTITIAL_IOS: 'ca-app-pub-xxxxx/xxxxx',
  REWARDED_ANDROID: 'ca-app-pub-xxxxx/xxxxx',
  REWARDED_IOS: 'ca-app-pub-xxxxx/xxxxx'
};
