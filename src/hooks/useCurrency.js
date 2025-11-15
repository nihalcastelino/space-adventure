import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// Currency earning rates
export const CURRENCY_RATES = {
  // Game rewards
  WIN_GAME: 50,
  LOSE_GAME: 10,
  FIRST_WIN_OF_DAY: 100, // Bonus for first win
  PLAY_GAME: 5, // Just for playing

  // Difficulty multipliers
  EASY_MULTIPLIER: 1.0,
  NORMAL_MULTIPLIER: 1.5,
  HARD_MULTIPLIER: 2.0,

  // Achievement bonuses
  ACHIEVEMENT_BONUS: 25,

  // Level up reward
  LEVEL_UP: 50,

  // Daily rewards
  DAILY_LOGIN: 20,
  STREAK_BONUS: 10, // Per day in streak

  // Ad rewards
  WATCH_AD: 25,
  WATCH_AD_2X_XP: 0, // Just gives 2x XP, no coins

  // Social rewards
  FIRST_ONLINE_GAME: 75,
  INVITE_FRIEND: 30,

  // Premium pass benefits
  PREMIUM_MULTIPLIER: 1.5 // 50% more coins for premium users
};

export function useCurrency() {
  const [coins, setCoins] = useState(100); // Start with 100 coins
  const [isPremium, setIsPremium] = useState(false);
  const [lastWinDate, setLastWinDate] = useState(null);
  const [loginStreak, setLoginStreak] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Load from Supabase if authenticated, otherwise localStorage
  useEffect(() => {
    const loadCurrency = async () => {
      if (isAuthenticated && user && supabase) {
        try {
          // Load from Supabase
          const { data, error } = await supabase
            .from('space_adventure_profiles')
            .select('coins, premium_tier')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            setCoins(data.coins || 100);
            setIsPremium(data.premium_tier !== 'free');
          } else {
            // Fallback to localStorage
            const saved = localStorage.getItem('currency');
            if (saved) {
              const data = JSON.parse(saved);
              setCoins(data.coins || 100);
              setIsPremium(data.isPremium || false);
            }
          }
        } catch (e) {
          console.error('Failed to load currency from Supabase:', e);
          // Fallback to localStorage
          const saved = localStorage.getItem('currency');
          if (saved) {
            const data = JSON.parse(saved);
            setCoins(data.coins || 100);
            setIsPremium(data.isPremium || false);
          }
        }
      } else {
        // Not authenticated, use localStorage
        const saved = localStorage.getItem('currency');
        if (saved) {
          try {
            const data = JSON.parse(saved);
            setCoins(data.coins || 100);
            setIsPremium(data.isPremium || false);
            setLastWinDate(data.lastWinDate || null);
            setLoginStreak(data.loginStreak || 0);
            setLastLoginDate(data.lastLoginDate || null);
          } catch (e) {
            console.error('Failed to load currency:', e);
          }
        }
      }

    };

    loadCurrency();
  }, [isAuthenticated, user]);

  // Save to Supabase (if authenticated) and localStorage
  useEffect(() => {
    // Always save to localStorage
    const data = {
      coins,
      isPremium,
      lastWinDate,
      loginStreak,
      lastLoginDate
    };
    localStorage.setItem('currency', JSON.stringify(data));

    // Also save to Supabase if authenticated
    if (isAuthenticated && user && supabase) {
      supabase
        .from('space_adventure_profiles')
        .update({ coins })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to sync coins to Supabase:', error);
          }
        });
    }
  }, [coins, isPremium, lastWinDate, loginStreak, lastLoginDate, isAuthenticated, user]);


  // Add coins
  const addCoins = useCallback((amount, reason = '') => {
    const multiplier = isPremium ? CURRENCY_RATES.PREMIUM_MULTIPLIER : 1.0;
    const finalAmount = Math.floor(amount * multiplier);

    setCoins(prev => prev + finalAmount);

    return finalAmount;
  }, [isPremium]);

  // Remove coins (for purchases)
  const removeCoins = useCallback((amount) => {
    if (coins < amount) {
      return { success: false, error: 'Not enough coins' };
    }

    setCoins(prev => prev - amount);
    return { success: true };
  }, [coins]);

  // Earn coins from game
  const earnGameReward = useCallback((won, difficulty = 'normal', isOnline = false) => {
    let amount = won ? CURRENCY_RATES.WIN_GAME : CURRENCY_RATES.LOSE_GAME;

    // Apply difficulty multiplier
    const difficultyMultiplier = {
      easy: CURRENCY_RATES.EASY_MULTIPLIER,
      normal: CURRENCY_RATES.NORMAL_MULTIPLIER,
      hard: CURRENCY_RATES.HARD_MULTIPLIER
    }[difficulty] || CURRENCY_RATES.NORMAL_MULTIPLIER;

    amount *= difficultyMultiplier;

    // Check for first win of day bonus
    if (won) {
      const today = new Date().toDateString();
      if (lastWinDate !== today) {
        amount += CURRENCY_RATES.FIRST_WIN_OF_DAY;
        setLastWinDate(today);
      }
    }

    // Bonus for playing online
    if (isOnline) {
      amount += CURRENCY_RATES.PLAY_GAME;
    }

    const earned = addCoins(amount, won ? 'Win Game' : 'Play Game');

    return { earned, baseAmount: amount };
  }, [lastWinDate, addCoins]);

  // Earn coins from achievement
  const earnAchievementReward = useCallback(() => {
    return addCoins(CURRENCY_RATES.ACHIEVEMENT_BONUS, 'Achievement');
  }, [addCoins]);

  // Earn coins from level up
  const earnLevelUpReward = useCallback((level) => {
    const amount = CURRENCY_RATES.LEVEL_UP + (level * 5); // Bonus increases with level
    return addCoins(amount, 'Level Up');
  }, [addCoins]);

  // Earn coins from watching ad
  const earnAdReward = useCallback(() => {
    return addCoins(CURRENCY_RATES.WATCH_AD, 'Watch Ad');
  }, [addCoins]);

  // Earn coins from social action
  const earnSocialReward = useCallback((action) => {
    const amounts = {
      first_online: CURRENCY_RATES.FIRST_ONLINE_GAME,
      invite_friend: CURRENCY_RATES.INVITE_FRIEND
    };

    const amount = amounts[action] || 0;
    return addCoins(amount, 'Social Reward');
  }, [addCoins]);

  // Set premium status
  const setPremiumStatus = useCallback((status) => {
    setIsPremium(status);
  }, []);

  // Get premium benefits description
  const getPremiumBenefits = useCallback(() => {
    return {
      coinMultiplier: CURRENCY_RATES.PREMIUM_MULTIPLIER,
      noAds: true,
      exclusiveCosmetics: true,
      dailyBonus: 50 // Extra daily coins for premium
    };
  }, []);

  return {
    coins,
    isPremium,
    loginStreak,
    addCoins,
    removeCoins,
    earnGameReward,
    earnAchievementReward,
    earnLevelUpReward,
    earnAdReward,
    earnSocialReward,
    checkDailyLogin,
    setPremiumStatus,
    getPremiumBenefits
  };
}
