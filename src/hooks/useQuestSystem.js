import { useState, useEffect, useCallback } from 'react';
import { DAILY_QUESTS, WEEKLY_CHALLENGES } from './useLevelRewards';

// Quest progress storage key
const QUEST_STORAGE_KEY = 'questProgress';
const WEEKLY_RESET_DAY = 1; // Monday (0 = Sunday, 1 = Monday)

export function useQuestSystem() {
  const [dailyQuests, setDailyQuests] = useState([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState([]);
  const [lastDailyReset, setLastDailyReset] = useState(null);
  const [lastWeeklyReset, setLastWeeklyReset] = useState(null);

  // Load quest progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(QUEST_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDailyQuests(data.dailyQuests || []);
        setWeeklyChallenges(data.weeklyChallenges || []);
        setLastDailyReset(data.lastDailyReset || null);
        setLastWeeklyReset(data.lastWeeklyReset || null);
      } catch (e) {
        console.error('Failed to load quest progress:', e);
        initializeQuests();
      }
    } else {
      initializeQuests();
    }
  }, []);

  // Save quest progress to localStorage
  useEffect(() => {
    const data = {
      dailyQuests,
      weeklyChallenges,
      lastDailyReset,
      lastWeeklyReset
    };
    localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(data));
  }, [dailyQuests, weeklyChallenges, lastDailyReset, lastWeeklyReset]);

  // Check if daily reset is needed
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastDailyReset !== today) {
      resetDailyQuests();
    }
  }, [lastDailyReset]);

  // Check if weekly reset is needed
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const lastResetDate = lastWeeklyReset ? new Date(lastWeeklyReset) : null;
    
    // Reset on Monday if last reset was before this Monday
    if (dayOfWeek === WEEKLY_RESET_DAY) {
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      thisMonday.setHours(0, 0, 0, 0);
      
      if (!lastResetDate || lastResetDate < thisMonday) {
        resetWeeklyChallenges();
      }
    }
  }, [lastWeeklyReset]);

  // Initialize quests
  const initializeQuests = useCallback(() => {
    const today = new Date().toDateString();
    const initialDailyQuests = DAILY_QUESTS.map(quest => ({
      ...quest,
      progress: 0,
      completed: false,
      claimed: false
    }));
    
    setDailyQuests(initialDailyQuests);
    setLastDailyReset(today);

    const initialWeeklyChallenges = WEEKLY_CHALLENGES.map(challenge => ({
      ...challenge,
      progress: 0,
      completed: false,
      claimed: false
    }));
    
    setWeeklyChallenges(initialWeeklyChallenges);
    setLastWeeklyReset(today);
  }, []);

  // Reset daily quests
  const resetDailyQuests = useCallback(() => {
    const today = new Date().toDateString();
    const newDailyQuests = DAILY_QUESTS.map(quest => ({
      ...quest,
      progress: 0,
      completed: false,
      claimed: false
    }));
    
    setDailyQuests(newDailyQuests);
    setLastDailyReset(today);
  }, []);

  // Reset weekly challenges
  const resetWeeklyChallenges = useCallback(() => {
    const today = new Date().toDateString();
    const newWeeklyChallenges = WEEKLY_CHALLENGES.map(challenge => ({
      ...challenge,
      progress: 0,
      completed: false,
      claimed: false
    }));
    
    setWeeklyChallenges(newWeeklyChallenges);
    setLastWeeklyReset(today);
  }, []);

  // Update quest progress
  const updateQuestProgress = useCallback((questId, amount = 1, questType = 'daily') => {
    if (questType === 'daily') {
      setDailyQuests(prev => prev.map(quest => {
        if (quest.id === questId && !quest.completed) {
          const newProgress = Math.min(quest.progress + amount, quest.target);
          const completed = newProgress >= quest.target;
          return {
            ...quest,
            progress: newProgress,
            completed
          };
        }
        return quest;
      }));
    } else if (questType === 'weekly') {
      setWeeklyChallenges(prev => prev.map(challenge => {
        if (challenge.id === questId && !challenge.completed) {
          const newProgress = Math.min(challenge.progress + amount, challenge.target);
          const completed = newProgress >= challenge.target;
          return {
            ...challenge,
            progress: newProgress,
            completed
          };
        }
        return challenge;
      }));
    }
  }, []);

  // Track game events for quest progress
  const trackGameEvent = useCallback((eventType, data = {}) => {
    // Daily quests
    switch (eventType) {
      case 'game_played':
        updateQuestProgress('play_3_games', 1, 'daily');
        updateQuestProgress('play_15_games', 1, 'weekly');
        break;
      
      case 'game_won':
        updateQuestProgress('win_1_game', 1, 'daily');
        updateQuestProgress('win_5_games', 1, 'weekly');
        if (data.difficulty === 'hard') {
          updateQuestProgress('hard_mode_wins', 1, 'weekly');
        }
        break;
      
      case 'powerup_used':
        updateQuestProgress('use_5_powerups', 1, 'daily');
        break;
      
      case 'checkpoint_reached':
        if (data.checkpoint >= 50) {
          updateQuestProgress('reach_checkpoint_5', 1, 'daily');
        }
        break;
      
      case 'dice_rolled':
        if (data.value === 6) {
          // Track sixes in current game (would need game context)
          // This is handled separately in game logic
        }
        break;
    }
  }, [updateQuestProgress]);

  // Track three 6s in one game (called from game logic)
  const trackThreeSixes = useCallback(() => {
    updateQuestProgress('roll_three_6s', 1, 'daily');
  }, [updateQuestProgress]);

  // Claim quest reward
  const claimQuestReward = useCallback((questId, questType = 'daily') => {
    if (questType === 'daily') {
      setDailyQuests(prev => prev.map(quest => {
        if (quest.id === questId && quest.completed && !quest.claimed) {
          return { ...quest, claimed: true };
        }
        return quest;
      }));
    } else if (questType === 'weekly') {
      setWeeklyChallenges(prev => prev.map(challenge => {
        if (challenge.id === questId && challenge.completed && !challenge.claimed) {
          return { ...challenge, claimed: true };
        }
        return challenge;
      }));
    }
  }, []);

  // Get available rewards for completed quests
  const getAvailableRewards = useCallback(() => {
    const dailyRewards = dailyQuests
      .filter(q => q.completed && !q.claimed)
      .map(q => ({ ...q.reward, questId: q.id, questType: 'daily', questName: q.name }));
    
    const weeklyRewards = weeklyChallenges
      .filter(c => c.completed && !c.claimed)
      .map(c => ({ ...c.reward, questId: c.id, questType: 'weekly', questName: c.name }));
    
    return [...dailyRewards, ...weeklyRewards];
  }, [dailyQuests, weeklyChallenges]);

  // Get quest completion stats
  const getQuestStats = useCallback(() => {
    const dailyCompleted = dailyQuests.filter(q => q.completed).length;
    const dailyTotal = dailyQuests.length;
    const weeklyCompleted = weeklyChallenges.filter(c => c.completed).length;
    const weeklyTotal = weeklyChallenges.length;
    
    return {
      daily: { completed: dailyCompleted, total: dailyTotal, progress: dailyCompleted / dailyTotal },
      weekly: { completed: weeklyCompleted, total: weeklyTotal, progress: weeklyCompleted / weeklyTotal }
    };
  }, [dailyQuests, weeklyChallenges]);

  // Get time until next reset
  const getTimeUntilReset = useCallback((type = 'daily') => {
    const now = new Date();
    
    if (type === 'daily') {
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      return Math.ceil((midnight - now) / (1000 * 60 * 60)); // hours
    } else if (type === 'weekly') {
      const dayOfWeek = now.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      return Math.ceil((nextMonday - now) / (1000 * 60 * 60 * 24)); // days
    }
    
    return 0;
  }, []);

  return {
    // Quest data
    dailyQuests,
    weeklyChallenges,
    
    // Quest management
    updateQuestProgress,
    trackGameEvent,
    trackThreeSixes,
    claimQuestReward,
    
    // Quest info
    getAvailableRewards,
    getQuestStats,
    getTimeUntilReset,
    
    // Reset info
    lastDailyReset,
    lastWeeklyReset
  };
}

