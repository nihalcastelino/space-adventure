import { useCallback } from 'react';

// Enhanced level rewards with strong retention incentives
export const LEVEL_REWARDS = {
  // Every level gets base rewards
  base: {
    coins: (level) => 50 + (level * 5),
    xp: 0 // No extra XP for leveling up
  },

  // Milestone rewards (every 5 levels)
  milestones: {
    5: { coins: 100, powerUp: 'reroll', cosmetic: null, title: 'Novice Explorer' },
    10: { coins: 200, powerUp: 'speed_boost', cosmetic: 'golden', title: 'Space Cadet' },
    15: { coins: 300, powerUp: 'shield', cosmetic: null, title: 'Stellar Navigator' },
    20: { coins: 500, powerUp: 'lucky_star', cosmetic: 'comet', title: 'Cosmic Voyager' },
    25: { coins: 750, powerUp: 'teleport', cosmetic: 'rainbow', title: 'Galaxy Master' },
    30: { coins: 1000, powerUp: 'extra_turn', cosmetic: null, title: 'Nebula Commander' },
    40: { coins: 1500, powerUp: 'lucky_star', cosmetic: null, title: 'Quantum Pilot' },
    50: { coins: 2500, powerUp: 'extra_turn', cosmetic: 'legendary_gold', title: 'Supreme Legend' }
  },

  // Daily quest unlock levels
  questUnlocks: {
    3: 'Daily quests unlocked!',
    7: 'Weekly challenges unlocked!',
    15: 'Tournament access unlocked!',
    25: 'Clan system unlocked!'
  },

  // Power-up slot unlocks
  slotUnlocks: {
    5: { slots: 3, message: 'Power-up inventory expanded to 3 slots!' },
    10: { slots: 5, message: 'Power-up inventory expanded to 5 slots!' },
    20: { slots: 8, message: 'Power-up inventory expanded to 8 slots!' },
    30: { slots: 12, message: 'Power-up inventory expanded to 12 slots!' }
  }
};

// Daily quests (unlock at level 3)
export const DAILY_QUESTS = [
  { id: 'play_3_games', name: 'Play 3 Games', description: 'Complete 3 games', reward: { coins: 50, xp: 25 }, target: 3 },
  { id: 'win_1_game', name: 'Win a Game', description: 'Win any game', reward: { coins: 75, xp: 50 }, target: 1 },
  { id: 'use_5_powerups', name: 'Power User', description: 'Use 5 power-ups', reward: { coins: 60, xp: 30 }, target: 5 },
  { id: 'reach_checkpoint_5', name: 'Checkpoint Master', description: 'Reach checkpoint 50+', reward: { coins: 100, xp: 40 }, target: 50 },
  { id: 'roll_three_6s', name: 'Lucky Roller', description: 'Roll three 6s in one game', reward: { coins: 80, xp: 35 }, target: 3 }
];

// Weekly challenges (unlock at level 7)
export const WEEKLY_CHALLENGES = [
  { id: 'win_5_games', name: 'Weekly Winner', description: 'Win 5 games this week', reward: { coins: 300, xp: 150, powerUp: 'random' }, target: 5 },
  { id: 'play_15_games', name: 'Active Player', description: 'Play 15 games this week', reward: { coins: 250, xp: 120 }, target: 15 },
  { id: 'hard_mode_wins', name: 'Challenge Accepted', description: 'Win 3 games on hard difficulty', reward: { coins: 500, xp: 200, powerUp: 'epic' }, target: 3 }
];

// Season pass tiers (premium content)
export const SEASON_PASS = {
  free: [
    { level: 1, reward: { coins: 50 } },
    { level: 5, reward: { coins: 100 } },
    { level: 10, reward: { powerUp: 'reroll' } },
    { level: 15, reward: { coins: 200 } },
    { level: 20, reward: { cosmetic: 'seasonal_1' } },
    { level: 25, reward: { coins: 500 } },
    { level: 30, reward: { powerUp: 'teleport' } }
  ],
  premium: [
    { level: 1, reward: { coins: 100, powerUp: 'speed_boost' } },
    { level: 3, reward: { cosmetic: 'premium_skin_1' } },
    { level: 5, reward: { coins: 200, xp: 100 } },
    { level: 7, reward: { powerUp: 'lucky_star' } },
    { level: 10, reward: { cosmetic: 'premium_theme_1', coins: 300 } },
    { level: 15, reward: { coins: 500, powerUp: 'extra_turn' } },
    { level: 20, reward: { cosmetic: 'exclusive_legendary' } },
    { level: 25, reward: { coins: 1000, powerUp: 'epic_bundle' } },
    { level: 30, reward: { cosmetic: 'ultimate_rare', coins: 2000 } }
  ]
};

export function useLevelRewards() {
  // Get reward for specific level
  const getRewardForLevel = useCallback((level) => {
    const baseReward = {
      coins: LEVEL_REWARDS.base.coins(level),
      xp: LEVEL_REWARDS.base.xp
    };

    // Check for milestone rewards
    const milestone = LEVEL_REWARDS.milestones[level];
    if (milestone) {
      return {
        ...baseReward,
        ...milestone,
        isMilestone: true
      };
    }

    // Check for quest unlocks
    const questUnlock = LEVEL_REWARDS.questUnlocks[level];
    if (questUnlock) {
      baseReward.unlock = questUnlock;
    }

    // Check for slot unlocks
    const slotUnlock = LEVEL_REWARDS.slotUnlocks[level];
    if (slotUnlock) {
      baseReward.slotUnlock = slotUnlock;
    }

    return baseReward;
  }, []);

  // Check what player will get at next level
  const previewNextLevel = useCallback((currentLevel) => {
    return getRewardForLevel(currentLevel + 1);
  }, [getRewardForLevel]);

  // Get all upcoming milestone levels
  const getUpcomingMilestones = useCallback((currentLevel) => {
    return Object.keys(LEVEL_REWARDS.milestones)
      .map(Number)
      .filter(level => level > currentLevel)
      .sort((a, b) => a - b)
      .slice(0, 3) // Next 3 milestones
      .map(level => ({
        level,
        ...LEVEL_REWARDS.milestones[level]
      }));
  }, []);

  return {
    getRewardForLevel,
    previewNextLevel,
    getUpcomingMilestones,
    DAILY_QUESTS,
    WEEKLY_CHALLENGES,
    SEASON_PASS
  };
}

// Retention mechanics summary:
// 1. Daily quests (level 3+) - Come back daily for easy rewards
// 2. Weekly challenges (level 7+) - Come back throughout week
// 3. Milestone rewards every 5 levels - Clear progression goals
// 4. Cosmetic unlocks - Visual status/flex
// 5. Title system - Social recognition
// 6. Power-up slots - Gameplay advantage
// 7. Season pass - Time-limited FOMO
// 8. Tournament access (level 15) - Competitive endgame
