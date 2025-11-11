import { useState, useEffect, useCallback } from 'react';

// XP required for each level (exponential growth)
const getXPForLevel = (level) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Maximum level (expanded from 50 to 100)
const MAX_LEVEL = 100;

// Level-based unlocks
export const LEVEL_UNLOCKS = {
  5: {
    name: 'Custom Usernames',
    description: 'Unlock custom usernames for local games',
    icon: '✏️'
  },
  10: {
    name: 'Neon Theme',
    description: 'Unlock neon board theme',
    icon: '💡'
  },
  15: {
    name: 'Extra Power-Up Slot',
    description: 'Carry 2 power-ups at once',
    icon: '🎒'
  },
  20: {
    name: 'Galaxy Theme',
    description: 'Unlock galaxy board theme',
    icon: '🌌'
  },
  25: {
    name: 'Advanced Stats',
    description: 'View detailed game statistics',
    icon: '📊'
  },
  30: {
    name: 'Retro Theme',
    description: 'Unlock retro board theme',
    icon: '🎮'
  },
  35: {
    name: 'Double XP Weekend',
    description: '2x XP every weekend',
    icon: '⚡'
  },
  40: {
    name: 'Custom Dice',
    description: 'Unlock custom dice skins',
    icon: '🎲'
  },
  50: {
    name: 'Master Badge',
    description: 'Exclusive master badge',
    icon: '🏅'
  },
  60: {
    name: 'Elite Theme',
    description: 'Unlock elite board theme',
    icon: '👑'
  },
  75: {
    name: 'Legend Badge',
    description: 'Exclusive legend badge',
    icon: '💎'
  },
  100: {
    name: 'Champion Status',
    description: 'Ultimate champion status and all unlocks',
    icon: '🌟'
  }
};

// Achievement definitions
export const ACHIEVEMENTS = {
  // Gameplay achievements
  FIRST_WIN: { id: 'first_win', name: 'First Victory', description: 'Win your first game', xp: 50, icon: '🏆' },
  WIN_5: { id: 'win_5', name: 'Veteran', description: 'Win 5 games', xp: 100, icon: '⭐' },
  WIN_20: { id: 'win_20', name: 'Champion', description: 'Win 20 games', xp: 500, icon: '👑' },
  WIN_50: { id: 'win_50', name: 'Legend', description: 'Win 50 games', xp: 1000, icon: '💎' },

  // Special moves
  LUCKY_ROLL: { id: 'lucky_roll', name: 'Lucky Six', description: 'Roll a 6 five times in one game', xp: 75, icon: '🎲' },
  SPACEPORT_MASTER: { id: 'spaceport_master', name: 'Warp Speed', description: 'Use 5 spaceports in one game', xp: 100, icon: '🛸' },
  ALIEN_SURVIVOR: { id: 'alien_survivor', name: 'Survivor', description: 'Hit 10 aliens across all games', xp: 150, icon: '👾' },

  // Speed achievements
  SPEED_DEMON: { id: 'speed_demon', name: 'Speed Demon', description: 'Win in under 15 turns', xp: 200, icon: '⚡' },
  PERFECT_GAME: { id: 'perfect_game', name: 'Perfect Run', description: 'Win without hitting any aliens', xp: 300, icon: '✨' },

  // Social achievements
  PLAY_WITH_FRIENDS: { id: 'play_friends', name: 'Social Butterfly', description: 'Play 10 online games', xp: 100, icon: '🌐' },

  // Difficulty achievements
  HARD_MODE_WIN: { id: 'hard_win', name: 'Hardcore', description: 'Win on hard difficulty', xp: 250, icon: '💀' },

  // Progression achievements
  REACH_LEVEL_10: { id: 'level_10', name: 'Rising Star', description: 'Reach level 10', xp: 500, icon: '🌟' },
  REACH_LEVEL_25: { id: 'level_25', name: 'Elite Player', description: 'Reach level 25', xp: 1000, icon: '🎖️' },
  REACH_LEVEL_50: { id: 'level_50', name: 'Master', description: 'Reach level 50', xp: 2000, icon: '🔥' },
};

// Player stats tracked for achievements
const DEFAULT_STATS = {
  totalWins: 0,
  totalGames: 0,
  totalTurns: 0,
  aliensHit: 0,
  spaceportsUsed: 0,
  sixesRolled: 0,
  hardModeWins: 0,
  onlineGamesPlayed: 0,
  fastestWin: Infinity,
  currentGameStats: {
    sixesRolled: 0,
    spaceportsUsed: 0,
    aliensHit: 0,
    turns: 0
  }
};

export function useProgression() {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [pendingNotifications, setPendingNotifications] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('progression');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setLevel(data.level || 1);
        setXp(data.xp || 0);
        setUnlockedAchievements(data.achievements || []);
        setStats({ ...DEFAULT_STATS, ...data.stats });
      } catch (e) {
        console.error('Failed to load progression:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = {
      level,
      xp,
      achievements: unlockedAchievements,
      stats
    };
    localStorage.setItem('progression', JSON.stringify(data));
  }, [level, xp, unlockedAchievements, stats]);

  // Add XP and check for level up
  const addXP = useCallback((amount) => {
    setXp(currentXP => {
      let newXP = currentXP + amount;
      let newLevel = level;
      let notifications = [];

      // Check for level ups
      while (newXP >= getXPForLevel(newLevel)) {
        newXP -= getXPForLevel(newLevel);
        newLevel++;
        notifications.push({
          type: 'levelUp',
          level: newLevel,
          title: `Level ${newLevel} Reached!`,
          message: `You've reached level ${newLevel}!`
        });
      }

      if (newLevel > level) {
        setLevel(newLevel);
        setPendingNotifications(prev => [...prev, ...notifications]);

        // Check level-based achievements
        checkAchievement('REACH_LEVEL_10');
        checkAchievement('REACH_LEVEL_25');
        checkAchievement('REACH_LEVEL_50');
      }

      return newXP;
    });
  }, [level]);

  // Unlock achievement
  const unlockAchievement = useCallback((achievementId) => {
    if (unlockedAchievements.includes(achievementId)) return false;

    const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
    if (!achievement) return false;

    setUnlockedAchievements(prev => [...prev, achievementId]);
    addXP(achievement.xp);

    setPendingNotifications(prev => [...prev, {
      type: 'achievement',
      achievement,
      title: 'Achievement Unlocked!',
      message: `${achievement.icon} ${achievement.name} - ${achievement.description}`
    }]);

    return true;
  }, [unlockedAchievements, addXP]);

  // Check if achievement should be unlocked
  const checkAchievement = useCallback((achievementKey) => {
    const achievement = ACHIEVEMENTS[achievementKey];
    if (!achievement || unlockedAchievements.includes(achievement.id)) return;

    let shouldUnlock = false;

    switch (achievementKey) {
      case 'FIRST_WIN':
        shouldUnlock = stats.totalWins >= 1;
        break;
      case 'WIN_5':
        shouldUnlock = stats.totalWins >= 5;
        break;
      case 'WIN_20':
        shouldUnlock = stats.totalWins >= 20;
        break;
      case 'WIN_50':
        shouldUnlock = stats.totalWins >= 50;
        break;
      case 'LUCKY_ROLL':
        shouldUnlock = stats.currentGameStats.sixesRolled >= 5;
        break;
      case 'SPACEPORT_MASTER':
        shouldUnlock = stats.currentGameStats.spaceportsUsed >= 5;
        break;
      case 'ALIEN_SURVIVOR':
        shouldUnlock = stats.aliensHit >= 10;
        break;
      case 'SPEED_DEMON':
        shouldUnlock = stats.fastestWin <= 15;
        break;
      case 'PERFECT_GAME':
        shouldUnlock = stats.currentGameStats.aliensHit === 0 && stats.totalWins > 0;
        break;
      case 'PLAY_WITH_FRIENDS':
        shouldUnlock = stats.onlineGamesPlayed >= 10;
        break;
      case 'HARD_MODE_WIN':
        shouldUnlock = stats.hardModeWins >= 1;
        break;
      case 'REACH_LEVEL_10':
        shouldUnlock = level >= 10;
        break;
      case 'REACH_LEVEL_25':
        shouldUnlock = level >= 25;
        break;
      case 'REACH_LEVEL_50':
        shouldUnlock = level >= 50;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      unlockAchievement(achievement.id);
    }
  }, [stats, level, unlockedAchievements, unlockAchievement]);

  // Track game events
  const trackEvent = useCallback((eventType, data = {}) => {
    setStats(prev => {
      const updated = { ...prev };

      switch (eventType) {
        case 'diceRoll':
          if (data.value === 6) {
            updated.currentGameStats.sixesRolled++;
          }
          break;

        case 'spaceportUsed':
          updated.spaceportsUsed++;
          updated.currentGameStats.spaceportsUsed++;
          break;

        case 'alienHit':
          updated.aliensHit++;
          updated.currentGameStats.aliensHit++;
          break;

        case 'turn':
          updated.currentGameStats.turns++;
          break;

        case 'gameWon':
          updated.totalWins++;
          updated.totalGames++;
          const turns = updated.currentGameStats.turns;
          if (turns < updated.fastestWin) {
            updated.fastestWin = turns;
          }

          if (data.difficulty === 'hard') {
            updated.hardModeWins++;
          }

          if (data.isOnline) {
            updated.onlineGamesPlayed++;
          }

          // Check achievements after game
          setTimeout(() => {
            checkAchievement('FIRST_WIN');
            checkAchievement('WIN_5');
            checkAchievement('WIN_20');
            checkAchievement('WIN_50');
            checkAchievement('LUCKY_ROLL');
            checkAchievement('SPACEPORT_MASTER');
            checkAchievement('SPEED_DEMON');
            checkAchievement('PERFECT_GAME');
            checkAchievement('HARD_MODE_WIN');
            checkAchievement('PLAY_WITH_FRIENDS');
          }, 100);
          break;

        case 'gameLost':
          updated.totalGames++;
          if (data.isOnline) {
            updated.onlineGamesPlayed++;
          }
          break;

        case 'gameStart':
          // Reset per-game stats
          updated.currentGameStats = {
            sixesRolled: 0,
            spaceportsUsed: 0,
            aliensHit: 0,
            turns: 0
          };
          break;

        default:
          break;
      }

      return updated;
    });

    // Check achievements that don't require game end
    if (eventType === 'alienHit') {
      checkAchievement('ALIEN_SURVIVOR');
    }
  }, [checkAchievement]);

  // Clear pending notifications
  const clearNotifications = useCallback(() => {
    setPendingNotifications([]);
  }, []);

  // Get progress to next level
  const getProgressToNextLevel = useCallback(() => {
    const xpNeeded = getXPForLevel(level);
    return {
      current: xp,
      needed: xpNeeded,
      percentage: Math.min(100, (xp / xpNeeded) * 100)
    };
  }, [level, xp]);

  return {
    level,
    xp,
    stats,
    unlockedAchievements,
    pendingNotifications,
    addXP,
    trackEvent,
    unlockAchievement,
    clearNotifications,
    getProgressToNextLevel,
    getXPForLevel
  };
}
