import { useState, useEffect, useCallback } from 'react';

// Daily reward calendar (7-day cycle)
export const DAILY_REWARDS = [
  { day: 1, coins: 20, powerUp: null, xp: 10, icon: '🪙' },
  { day: 2, coins: 30, powerUp: 'reroll', xp: 15, icon: '🔄' },
  { day: 3, coins: 40, powerUp: null, xp: 20, icon: '💰' },
  { day: 4, coins: 50, powerUp: 'speed_boost', xp: 25, icon: '⚡' },
  { day: 5, coins: 75, powerUp: null, xp: 30, icon: '💎' },
  { day: 6, coins: 100, powerUp: 'shield', xp: 40, icon: '🛡️' },
  { day: 7, coins: 150, powerUp: 'lucky_star', xp: 50, icon: '⭐', special: true }
];

export function useDailyRewards() {
  const [lastClaimDate, setLastClaimDate] = useState(null);
  const [streak, setStreak] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [claimedToday, setClaimedToday] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dailyRewards');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setLastClaimDate(data.lastClaimDate || null);
        setStreak(data.streak || 0);
        setCurrentDay(data.currentDay || 1);

        // Check if already claimed today
        const today = new Date().toDateString();
        setClaimedToday(data.lastClaimDate === today);
      } catch (e) {
        console.error('Failed to load daily rewards:', e);
      }
    }
  }, []);

  // Save to localStorage
  const saveData = useCallback((data) => {
    localStorage.setItem('dailyRewards', JSON.stringify(data));
  }, []);

  // Check reward status
  const getRewardStatus = useCallback(() => {
    const today = new Date().toDateString();

    if (lastClaimDate === today) {
      return {
        available: false,
        claimed: true,
        streak,
        currentDay,
        nextReward: DAILY_REWARDS[(currentDay % 7)],
        hoursUntilNext: getHoursUntilMidnight()
      };
    }

    // Check if streak is maintained
    let newStreak = streak;
    let newDay = currentDay;

    if (lastClaimDate) {
      const lastDate = new Date(lastClaimDate);
      const todayDate = new Date(today);
      const dayDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        // Streak continues
        newStreak = streak + 1;
        newDay = (currentDay % 7) + 1;
      } else if (dayDiff > 1) {
        // Streak broken
        newStreak = 0;
        newDay = 1;
      }
    }

    return {
      available: true,
      claimed: false,
      streak: newStreak,
      currentDay: newDay,
      nextReward: DAILY_REWARDS[(newDay - 1)],
      hoursUntilNext: 0
    };
  }, [lastClaimDate, streak, currentDay]);

  // Get hours until midnight
  const getHoursUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.ceil((midnight - now) / (1000 * 60 * 60));
  };

  // Claim daily reward
  const claimReward = useCallback(() => {
    const status = getRewardStatus();

    if (!status.available) {
      return {
        success: false,
        error: 'Reward already claimed today'
      };
    }

    const reward = status.nextReward;
    const today = new Date().toDateString();

    // Update state
    setLastClaimDate(today);
    setStreak(status.streak);
    setCurrentDay(status.currentDay);
    setClaimedToday(true);

    // Save
    saveData({
      lastClaimDate: today,
      streak: status.streak,
      currentDay: status.currentDay
    });

    return {
      success: true,
      reward: {
        ...reward,
        streak: status.streak
      }
    };
  }, [getRewardStatus, saveData]);

  // Get full calendar view
  const getCalendarView = useCallback(() => {
    return DAILY_REWARDS.map((reward, index) => ({
      ...reward,
      claimed: index < currentDay - 1,
      current: index === currentDay - 1,
      locked: index > currentDay - 1
    }));
  }, [currentDay]);

  return {
    getRewardStatus,
    claimReward,
    getCalendarView,
    claimedToday,
    streak
  };
}
