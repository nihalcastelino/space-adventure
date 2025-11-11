import { useState, useEffect, useCallback } from 'react';
import { usePremium } from './usePremium';
import { useAuth } from './useAuth';

/**
 * Freemium Limits Hook
 * 
 * Manages usage limits for free users:
 * - Games per day
 * - Online games per day
 * - Power-ups per game
 * - Custom themes
 * - etc.
 */
export function useFreemiumLimits() {
  const { isPremium } = usePremium();
  const { user } = useAuth();
  const [limits, setLimits] = useState({
    gamesPlayedToday: 0,
    onlineGamesPlayedToday: 0,
    lastResetDate: null
  });

  // Free tier limits
  const FREE_LIMITS = {
    GAMES_PER_DAY: 3,
    ONLINE_GAMES_PER_DAY: 1,
    POWER_UPS_PER_GAME: 1,
    CUSTOM_THEMES: false,
    DIFFICULTY_OPTIONS: ['easy', 'normal'], // Hard+ requires premium
    BOARD_THEMES: ['default'], // Other themes require premium
    STATS_HISTORY_DAYS: 7, // Only 7 days of stats for free users
    GAME_MODES: ['classic'] // Speed, tournament require premium
  };

  // Premium has no limits
  const PREMIUM_LIMITS = {
    GAMES_PER_DAY: Infinity,
    ONLINE_GAMES_PER_DAY: Infinity,
    POWER_UPS_PER_GAME: Infinity,
    CUSTOM_THEMES: true,
    DIFFICULTY_OPTIONS: ['easy', 'normal', 'hard', 'extreme', 'nightmare', 'chaos'],
    BOARD_THEMES: ['default', 'neon', 'galaxy', 'retro', 'custom'],
    STATS_HISTORY_DAYS: Infinity,
    GAME_MODES: ['classic', 'speed', 'tournament', 'survival']
  };

  // Load limits from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('freemium_limits');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();
        const lastReset = data.lastResetDate ? new Date(data.lastResetDate).toDateString() : null;

        // Reset if new day
        if (lastReset !== today) {
          setLimits({
            gamesPlayedToday: 0,
            onlineGamesPlayedToday: 0,
            lastResetDate: today
          });
        } else {
          setLimits(data);
        }
      } catch (e) {
        console.error('Failed to load freemium limits:', e);
      }
    } else {
      const today = new Date().toDateString();
      setLimits({
        gamesPlayedToday: 0,
        onlineGamesPlayedToday: 0,
        lastResetDate: today
      });
    }
  }, []);

  // Save limits to localStorage
  useEffect(() => {
    localStorage.setItem('freemium_limits', JSON.stringify(limits));
  }, [limits]);

  // Get current limits based on premium status
  const getCurrentLimits = useCallback(() => {
    return isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
  }, [isPremium]);

  // Check if user can play a game
  const canPlayGame = useCallback((isOnline = false) => {
    if (isPremium) return { allowed: true, reason: null };

    const currentLimits = getCurrentLimits();
    const limit = isOnline ? currentLimits.ONLINE_GAMES_PER_DAY : currentLimits.GAMES_PER_DAY;
    const played = isOnline ? limits.onlineGamesPlayedToday : limits.gamesPlayedToday;

    if (played >= limit) {
      return {
        allowed: false,
        reason: `You've reached your daily limit of ${limit} ${isOnline ? 'online' : ''} game${limit > 1 ? 's' : ''}. Upgrade to Premium for unlimited games!`
      };
    }

    return { allowed: true, reason: null };
  }, [isPremium, limits, getCurrentLimits]);

  // Record a game played
  const recordGamePlayed = useCallback((isOnline = false) => {
    if (isPremium) return; // No limits for premium

    setLimits(prev => ({
      ...prev,
      gamesPlayedToday: isOnline ? prev.gamesPlayedToday : prev.gamesPlayedToday + 1,
      onlineGamesPlayedToday: isOnline ? prev.onlineGamesPlayedToday + 1 : prev.onlineGamesPlayedToday
    }));
  }, [isPremium]);

  // Check if feature is available
  const hasFeature = useCallback((feature) => {
    const currentLimits = getCurrentLimits();
    return currentLimits[feature] !== false && currentLimits[feature] !== 0;
  }, [getCurrentLimits]);

  // Get remaining games today
  const getRemainingGames = useCallback((isOnline = false) => {
    if (isPremium) return Infinity;

    const currentLimits = getCurrentLimits();
    const limit = isOnline ? currentLimits.ONLINE_GAMES_PER_DAY : currentLimits.GAMES_PER_DAY;
    const played = isOnline ? limits.onlineGamesPlayedToday : limits.gamesPlayedToday;

    return Math.max(0, limit - played);
  }, [isPremium, limits, getCurrentLimits]);

  // Check if difficulty is available
  const canUseDifficulty = useCallback((difficulty) => {
    const currentLimits = getCurrentLimits();
    return currentLimits.DIFFICULTY_OPTIONS.includes(difficulty);
  }, [getCurrentLimits]);

  // Reset daily limits (for testing or admin)
  const resetDailyLimits = useCallback(() => {
    const today = new Date().toDateString();
    setLimits({
      gamesPlayedToday: 0,
      onlineGamesPlayedToday: 0,
      lastResetDate: today
    });
  }, []);

  return {
    limits: getCurrentLimits(),
    canPlayGame,
    recordGamePlayed,
    hasFeature,
    getRemainingGames,
    canUseDifficulty,
    resetDailyLimits,
    isPremium,
    gamesPlayedToday: limits.gamesPlayedToday,
    onlineGamesPlayedToday: limits.onlineGamesPlayedToday
  };
}

