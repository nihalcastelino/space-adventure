import { useState, useCallback } from 'react';

/**
 * Game Variants Hook
 * 
 * Different gameplay modes with unique rules and objectives:
 * - Classic: Standard race to 100
 * - Sprint: Race to 50 (faster games)
 * - Marathon: Race to 200 (longer games)
 * - Checkpoint Challenge: Must hit all checkpoints
 * - Alien Hunter: Most aliens defeated wins
 * - King of the Hill: Hold position 50 for 3 turns
 * - Reverse Race: Start at 100, race to 0
 * - Sudden Death: One alien hit = elimination
 * - Time Attack: Beat the clock
 * - Power-Up Rush: Power-ups spawn frequently
 */
export const GAME_VARIANTS = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Standard race to position 100',
    icon: '🎮',
    winCondition: (players) => {
      return players.find(p => p.position >= 100);
    },
    boardSize: 100,
    requiresPremium: false,
    coinMultiplier: 1.0,
    xpMultiplier: 1.0,
    startingBonus: {
      powerUps: ['reroll'], // Free players get 1 power-up
      coins: 20
    }
  },
  sprint: {
    id: 'sprint',
    name: 'Sprint',
    description: 'Fast-paced race to position 50',
    icon: '⚡',
    winCondition: (players) => {
      return players.find(p => p.position >= 50);
    },
    boardSize: 50,
    requiresPremium: false,
    coinMultiplier: 0.8, // Shorter game = less rewards
    xpMultiplier: 0.8,
    startingBonus: {
      powerUps: ['speedBoost', 'reroll'], // 2 power-ups for faster game
      coins: 30
    }
  },
  marathon: {
    id: 'marathon',
    name: 'Marathon',
    description: 'Epic race to position 200',
    icon: '🏃',
    winCondition: (players) => {
      return players.find(p => p.position >= 200);
    },
    boardSize: 200,
    requiresPremium: true,
    coinMultiplier: 2.0, // Longer game = more rewards
    xpMultiplier: 2.0,
    startingBonus: {
      powerUps: ['teleport', 'extraTurn', 'luckyStar'], // 3 power-ups for long game
      coins: 100
    }
  },
  checkpointChallenge: {
    id: 'checkpointChallenge',
    name: 'Checkpoint Challenge',
    description: 'Visit 5 checkpoints to unlock the finish line',
    icon: '🎯',
    winCondition: (players, checkpoints) => {
      // Player must reach 100 AND have visited at least 5 checkpoints
      // More achievable, less frustrating - only need 5 out of 10
      return players.find(p => {
        if (p.position < 100) return false;
        const visitedCheckpoints = p.visitedCheckpoints || [];
        return visitedCheckpoints.length >= 5; // Only need 5 out of 10 (more forgiving)
      });
    },
    boardSize: 100,
    requiresPremium: true,
    coinMultiplier: 1.5,
    xpMultiplier: 1.5,
    startingBonus: {
      powerUps: ['preciseMove', 'extraRoll'], // Start with 2 power-ups
      coins: 50
    },
    specialRules: {
      trackCheckpoints: true,
      requiredCheckpoints: 5, // Only need 5, not all 10
      checkpointPassingCounts: true, // Passing through counts (more forgiving)
      cascadingCheckpoints: true // Hitting one checkpoint gives bonus to nearby ones
    }
  },
  alienHunter: {
    id: 'alienHunter',
    name: 'Alien Hunter',
    description: 'Most aliens defeated wins! Cascading kills = bonus points',
    icon: '👾',
    winCondition: (players, turnCount, maxTurns = 30) => {
      // Shorter game: 30 turns instead of 50
      // After maxTurns, player with most aliens hit wins
      if (turnCount < maxTurns) return null;
      const sorted = [...players].sort((a, b) => {
        // Count cascading combos (like Bejeweled)
        const scoreA = (a.aliensHit || 0) + (a.alienCombo || 0) * 2;
        const scoreB = (b.aliensHit || 0) + (b.alienCombo || 0) * 2;
        return scoreB - scoreA;
      });
      return sorted[0].aliensHit > 0 ? sorted[0] : null;
    },
    boardSize: 100,
    requiresPremium: true,
    coinMultiplier: 1.5,
    xpMultiplier: 1.5,
    startingBonus: {
      powerUps: ['alienMagnet'], // Power-up that attracts aliens
      coins: 30
    },
    specialRules: {
      trackAliensHit: true,
      maxTurns: 30, // Shorter game
      cascadingKills: true, // Hitting multiple aliens in a row = combo bonus
      alienComboMultiplier: 2.0 // 2x points for combos
    }
  },
  kingOfTheHill: {
    id: 'kingOfTheHill',
    name: 'King of the Hill',
    description: 'Hold position 50 for 2 turns (reduced from 3)',
    icon: '👑',
    winCondition: (players) => {
      return players.find(p => {
        if (p.position !== 50) return false;
        return (p.turnsOnHill || 0) >= 2; // Reduced to 2 turns
      });
    },
    boardSize: 100,
    requiresPremium: true,
    coinMultiplier: 1.5,
    xpMultiplier: 1.5,
    startingBonus: {
      powerUps: ['shield', 'skip_turn'], // Defensive power-ups (skip_turn allows staying on hill)
      coins: 40
    },
    specialRules: {
      trackHillPosition: true,
      hillPosition: 50,
      requiredTurns: 2, // Faster win condition
      cascadingDefense: true // Each turn on hill gives defense bonus
    }
  },
  reverseRace: {
    id: 'reverseRace',
    name: 'Reverse Race',
    description: 'Start at 100, race to 0',
    icon: '🔄',
    winCondition: (players) => {
      return players.find(p => p.position <= 0);
    },
    boardSize: 100,
    requiresPremium: true,
    coinMultiplier: 1.5,
    xpMultiplier: 1.5,
    startingBonus: {
      powerUps: ['backtrack', 'shield'], // Power-ups for reverse movement
      coins: 40
    },
    specialRules: {
      reverseMovement: true,
      startPosition: 100,
      endPosition: 0
    }
  },
  suddenDeath: {
    id: 'suddenDeath',
    name: 'Sudden Death',
    description: 'One alien hit = elimination!',
    icon: '💀',
    winCondition: (players) => {
      const activePlayers = players.filter(p => !p.eliminated);
      if (activePlayers.length === 1) return activePlayers[0];
      if (activePlayers.length === 0) return null;
      // Check if any active player reached 100
      return activePlayers.find(p => p.position >= 100);
    },
    boardSize: 100,
    requiresPremium: true,
    coinMultiplier: 2.0,
    xpMultiplier: 2.0,
    startingBonus: {
      powerUps: ['shield', 'shield', 'shield'], // 3 shields for survival
      coins: 50
    },
    specialRules: {
      eliminationOnAlienHit: true,
      trackEliminations: true
    }
  },
  timeAttack: {
    id: 'timeAttack',
    name: 'Time Attack',
    description: 'Beat the clock! 5 minutes to reach 100',
    icon: '⏱️',
    winCondition: (players, timeElapsed, timeLimit = 300000) => {
      if (timeElapsed >= timeLimit) {
        // Time's up - closest to 100 wins
        const sorted = [...players].sort((a, b) => b.position - a.position);
        return sorted[0];
      }
      return players.find(p => p.position >= 100);
    },
    boardSize: 100,
    requiresPremium: true,
    coinMultiplier: 1.5,
    xpMultiplier: 1.5,
    startingBonus: {
      powerUps: ['speedBoost', 'extraRoll'], // Speed-focused power-ups
      coins: 40
    },
    specialRules: {
      timeLimit: 300000, // 5 minutes in ms
      trackTime: true
    }
  },
  powerUpRush: {
    id: 'powerUpRush',
    name: 'Power-Up Rush',
    description: 'Power-ups spawn every turn! Cascading combos = more power-ups',
    icon: '🎁',
    winCondition: (players) => {
      return players.find(p => p.position >= 100);
    },
    boardSize: 100,
    requiresPremium: true,
    coinMultiplier: 1.5,
    xpMultiplier: 1.5,
    startingBonus: {
      powerUps: ['powerUpMagnet', 'comboBoost'], // Start with combo power-ups
      coins: 60
    },
    specialRules: {
      frequentPowerUps: true,
      powerUpSpawnRate: 1.0, // Every turn
      cascadingPowerUps: true, // Using power-ups creates combos that spawn more
      comboChain: true // Chain power-ups for bonus effects (like Bejeweled cascades)
    }
  },
  spaceportMaster: {
    id: 'spaceportMaster',
    name: 'Spaceport Master',
    description: 'Use most spaceports to win! Cascading spaceports = bonus',
    icon: '🚀',
    winCondition: (players, turnCount, maxTurns = 40) => {
      // Shorter game: 40 turns instead of 60
      // After maxTurns, player with most spaceports used wins
      if (turnCount < maxTurns) return null;
      const sorted = [...players].sort((a, b) => {
        // Count cascading spaceport combos
        const scoreA = (a.spaceportsUsed || 0) + (a.spaceportCombo || 0) * 1.5;
        const scoreB = (b.spaceportsUsed || 0) + (b.spaceportCombo || 0) * 1.5;
        return scoreB - scoreA;
      });
      return sorted[0].spaceportsUsed > 0 ? sorted[0] : null;
    },
    boardSize: 100,
    requiresPremium: true,
    coinMultiplier: 1.5,
    xpMultiplier: 1.5,
    startingBonus: {
      powerUps: ['spaceportBoost', 'teleport'], // Spaceport-focused power-ups
      coins: 45
    },
    specialRules: {
      trackSpaceports: true,
      maxTurns: 40, // Shorter game
      cascadingSpaceports: true, // Using spaceports in a row = combo bonus
      spaceportComboMultiplier: 1.5
    }
  }
};

export function useGameVariants(initialVariant = 'classic') {
  const [gameVariant, setGameVariant] = useState(initialVariant);
  const [variantState, setVariantState] = useState({
    turnCount: 0,
    timeElapsed: 0,
    checkpointsVisited: {},
    aliensHit: {},
    spaceportsUsed: {},
    eliminations: [],
    hillPositions: {}
  });

  const getCurrentVariant = useCallback(() => {
    return GAME_VARIANTS[gameVariant] || GAME_VARIANTS.classic;
  }, [gameVariant]);

  const changeVariant = useCallback((variantId) => {
    if (GAME_VARIANTS[variantId]) {
      setGameVariant(variantId);
      // Reset variant-specific state
      setVariantState({
        turnCount: 0,
        timeElapsed: 0,
        checkpointsVisited: {},
        aliensHit: {},
        spaceportsUsed: {},
        eliminations: [],
        hillPositions: {}
      });
    }
  }, []);

  // Check win condition
  const checkWinCondition = useCallback((players, checkpoints = []) => {
    const variant = getCurrentVariant();
    
    // Update players with variant-specific stats
    const updatedPlayers = players.map(p => ({
      ...p,
      visitedCheckpoints: variantState.checkpointsVisited[p.id] || [],
      aliensHit: variantState.aliensHit[p.id] || 0,
      spaceportsUsed: variantState.spaceportsUsed[p.id] || 0,
      eliminated: variantState.eliminations.includes(p.id),
      turnsOnHill: variantState.hillPositions[p.id] || 0
    }));

    return variant.winCondition(
      updatedPlayers,
      variantState.turnCount,
      variant.specialRules?.maxTurns,
      checkpoints,
      variantState.timeElapsed,
      variant.specialRules?.timeLimit
    );
  }, [gameVariant, variantState, getCurrentVariant]);

  // Track checkpoint visit
  const trackCheckpointVisit = useCallback((playerId, checkpoint) => {
    setVariantState(prev => ({
      ...prev,
      checkpointsVisited: {
        ...prev.checkpointsVisited,
        [playerId]: [...(prev.checkpointsVisited[playerId] || []), checkpoint]
      }
    }));
  }, []);

  // Track alien hit
  const trackAlienHit = useCallback((playerId) => {
    setVariantState(prev => ({
      ...prev,
      aliensHit: {
        ...prev.aliensHit,
        [playerId]: (prev.aliensHit[playerId] || 0) + 1
      }
    }));

    // Check for elimination in Sudden Death mode
    const variant = getCurrentVariant();
    if (variant.specialRules?.eliminationOnAlienHit) {
      setVariantState(prev => ({
        ...prev,
        eliminations: [...prev.eliminations, playerId]
      }));
    }
  }, [getCurrentVariant]);

  // Track spaceport use
  const trackSpaceportUse = useCallback((playerId) => {
    setVariantState(prev => ({
      ...prev,
      spaceportsUsed: {
        ...prev.spaceportsUsed,
        [playerId]: (prev.spaceportsUsed[playerId] || 0) + 1
      }
    }));
  }, []);

  // Track hill position (King of the Hill)
  const trackHillPosition = useCallback((playerId, position) => {
    const variant = getCurrentVariant();
    if (variant.specialRules?.trackHillPosition && position === variant.specialRules.hillPosition) {
      setVariantState(prev => ({
        ...prev,
        hillPositions: {
          ...prev.hillPositions,
          [playerId]: (prev.hillPositions[playerId] || 0) + 1
        }
      }));
    } else {
      // Reset if not on hill
      setVariantState(prev => ({
        ...prev,
        hillPositions: {
          ...prev.hillPositions,
          [playerId]: 0
        }
      }));
    }
  }, [getCurrentVariant]);

  // Increment turn count
  const incrementTurn = useCallback(() => {
    setVariantState(prev => ({
      ...prev,
      turnCount: prev.turnCount + 1
    }));
  }, []);

  // Update time elapsed (for Time Attack)
  const updateTime = useCallback((timeElapsed) => {
    setVariantState(prev => ({
      ...prev,
      timeElapsed
    }));
  }, []);

  // Get coin multiplier
  const getCoinMultiplier = useCallback(() => {
    const variant = getCurrentVariant();
    return variant.coinMultiplier || 1.0;
  }, [getCurrentVariant]);

  // Get XP multiplier
  const getXPMultiplier = useCallback(() => {
    const variant = getCurrentVariant();
    return variant.xpMultiplier || 1.0;
  }, [getCurrentVariant]);

  // Get board size
  const getBoardSize = useCallback(() => {
    const variant = getCurrentVariant();
    return variant.boardSize || 100;
  }, [getCurrentVariant]);

  return {
    gameVariant,
    currentVariant: getCurrentVariant(),
    changeVariant,
    checkWinCondition,
    trackCheckpointVisit,
    trackAlienHit,
    trackSpaceportUse,
    trackHillPosition,
    incrementTurn,
    updateTime,
    getCoinMultiplier,
    getXPMultiplier,
    getBoardSize,
    variantState
  };
}

