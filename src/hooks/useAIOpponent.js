import { useState, useEffect, useCallback } from 'react';

// AI difficulty levels
export const AI_PERSONALITIES = {
  EASY: {
    id: 'easy',
    name: 'Rookie Bot',
    icon: '🤖',
    description: 'Makes random moves, good for beginners',
    powerUpUsageChance: 0.1, // 10% chance to use power-ups
    strategicThinking: false,
    reactionTime: 1500 // ms delay before AI moves
  },
  MEDIUM: {
    id: 'medium',
    name: 'Skilled Pilot',
    icon: '🛸',
    description: 'Plays strategically, uses power-ups wisely',
    powerUpUsageChance: 0.4, // 40% chance to use power-ups
    strategicThinking: true,
    reactionTime: 1200
  },
  HARD: {
    id: 'hard',
    name: 'AI Commander',
    icon: '👾',
    description: 'Advanced tactics, optimal power-up usage',
    powerUpUsageChance: 0.7, // 70% chance to use power-ups
    strategicThinking: true,
    reactionTime: 800
  },
  EXPERT: {
    id: 'expert',
    name: 'Quantum AI',
    icon: '🌌',
    description: 'Near-perfect play, maximum challenge',
    powerUpUsageChance: 0.9, // 90% chance to use power-ups
    strategicThinking: true,
    reactionTime: 600
  }
};

export function useAIOpponent(difficulty = 'medium', gameState, powerUps) {
  const [aiPersonality] = useState(AI_PERSONALITIES[difficulty.toUpperCase()] || AI_PERSONALITIES.MEDIUM);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // AI decision making for power-up usage
  const shouldUsePowerUp = useCallback((powerUpId, currentPosition, opponentPosition, availablePowerUps) => {
    if (!aiPersonality.strategicThinking) {
      // Easy AI: random usage
      return Math.random() < aiPersonality.powerUpUsageChance;
    }

    // Strategic AI: analyze situation
    const distanceBehind = opponentPosition - currentPosition;
    const distanceToFinish = 100 - currentPosition;

    switch (powerUpId) {
      case 'speed_boost':
        // Use when behind or close to finish
        return (distanceBehind > 10 || distanceToFinish < 20) && Math.random() < aiPersonality.powerUpUsageChance;

      case 'shield':
        // Use when approaching known alien positions
        return currentPosition % 10 < 5 && Math.random() < aiPersonality.powerUpUsageChance;

      case 'teleport':
        // Use when far behind or to skip dangerous zones
        return distanceBehind > 20 && Math.random() < aiPersonality.powerUpUsageChance;

      case 'lucky_star':
        // Use when need exactly 6 to reach checkpoint or finish
        return (distanceToFinish <= 6 || (currentPosition + 6) % 10 === 0) && Math.random() < aiPersonality.powerUpUsageChance;

      case 'double_dice':
        // Use when need good roll to catch up
        return distanceBehind > 5 && Math.random() < aiPersonality.powerUpUsageChance;

      default:
        return Math.random() < aiPersonality.powerUpUsageChance;
    }
  }, [aiPersonality]);

  // AI takes turn
  const takeAITurn = useCallback(async (rollDiceCallback, usePowerUpCallback) => {
    setIsAIThinking(true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, aiPersonality.reactionTime));

    // Check if AI should use a power-up BEFORE rolling
    if (powerUps && Math.random() < 0.3) { // 30% chance to check power-ups
      const availablePowerUps = Object.entries(powerUps.inventory || {})
        .filter(([id, count]) => count > 0)
        .map(([id]) => id);

      if (availablePowerUps.length > 0 && gameState) {
        const aiPlayer = gameState.players[gameState.currentPlayerIndex];
        const humanPlayer = gameState.players.find((p, i) => i !== gameState.currentPlayerIndex);

        for (const powerUpId of availablePowerUps) {
          if (shouldUsePowerUp(powerUpId, aiPlayer.position, humanPlayer?.position || 0, availablePowerUps)) {
            await new Promise(resolve => setTimeout(resolve, 300));
            usePowerUpCallback?.(powerUpId);
            await new Promise(resolve => setTimeout(resolve, 500));
            break; // Use only one power-up per turn
          }
        }
      }
    }

    // Roll dice
    await new Promise(resolve => setTimeout(resolve, 300));
    rollDiceCallback();

    setIsAIThinking(false);
  }, [aiPersonality, shouldUsePowerUp, gameState, powerUps]);

  // AI personality flavor text
  const getAIMessage = useCallback((situation) => {
    const messages = {
      win: [
        "Good game! 🎮",
        "Victory achieved! ✨",
        "Thanks for playing! 🏆",
        "Better luck next time! 🌟"
      ],
      lose: [
        "Well played! 👏",
        "You win this round! 🎉",
        "Impressive skills! 💪",
        "Nice moves! ⭐"
      ],
      alienHit: [
        "Oops! 👾",
        "Not good... 😅",
        "Unlucky! 🎲",
        "That hurt! 💥"
      ],
      powerUpUsed: [
        "Strategic move! 🎯",
        "Smart play! 🧠",
        "Interesting choice! 💡",
        "Let's see... 🤔"
      ],
      checkpoint: [
        "Checkpoint secured! ✓",
        "Progress! 📍",
        "Moving forward! →",
        "Nice! 🎯"
      ]
    };

    const messageList = messages[situation] || messages.win;
    return messageList[Math.floor(Math.random() * messageList.length)];
  }, []);

  return {
    aiPersonality,
    isAIThinking,
    takeAITurn,
    shouldUsePowerUp,
    getAIMessage
  };
}

// Helper function to detect if a player is AI
export function isAIPlayer(player) {
  return player?.isAI === true;
}

// Create AI player object
export function createAIPlayer(difficulty = 'medium', playerId = 2) {
  const personality = AI_PERSONALITIES[difficulty.toUpperCase()] || AI_PERSONALITIES.MEDIUM;

  return {
    id: playerId,
    position: 0,
    lastCheckpoint: 0,
    color: 'text-red-300', // AI uses red color
    name: personality.name,
    corner: 'top-right',
    isAI: true,
    personality: personality.id,
    icon: personality.icon
  };
}
