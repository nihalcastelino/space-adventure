import { useState, useEffect, useCallback } from 'react';
import { ACHIEVEMENTS } from '../lib/achievements';
import { useCurrency } from './useCurrency';

const STORAGE_KEY = 'space_adventure_achievements';

export function useAchievements() {
  const [unlocked, setUnlocked] = useState(new Set());
  const currency = useCurrency();

  useEffect(() => {
    try {
      const storedAchievements = localStorage.getItem(STORAGE_KEY);
      if (storedAchievements) {
        setUnlocked(new Set(JSON.parse(storedAchievements)));
      }
    } catch (error) {
      console.error("Failed to load achievements from localStorage", error);
    }
  }, []);

  const isUnlocked = useCallback((achievementId) => {
    return unlocked.has(achievementId);
  }, [unlocked]);

  const unlockAchievement = useCallback((achievementId) => {
    if (!achievementId || !ACHIEVEMENTS[achievementId] || isUnlocked(achievementId)) {
      return;
    }

    const achievement = ACHIEVEMENTS[achievementId];

    console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
    // TODO: Trigger a visual notification to the player
    // e.g., showNotification(`Achievement Unlocked: ${achievement.name}`, 'success');

    // Award currency
    if (achievement.reward) {
      currency.addCoins(achievement.reward);
      console.log(`💰 Awarded ${achievement.reward} coins for achievement.`);
       // TODO: Show coin reward notification
    }

    const newUnlocked = new Set(unlocked);
    newUnlocked.add(achievementId);
    setUnlocked(newUnlocked);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newUnlocked)));
    } catch (error)      {
      console.error("Failed to save achievements to localStorage", error);
    }
  }, [unlocked, isUnlocked, currency]);

  return { unlockedAchievements: unlocked, isUnlocked, unlockAchievement };
}
