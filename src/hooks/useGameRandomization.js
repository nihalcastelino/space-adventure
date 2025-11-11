import { useMemo } from 'react';

/**
 * Game Randomization Hook
 * 
 * Uses a seed to create deterministic but varied game experiences.
 * Each game uses a unique seed, so no two games are the same.
 * 
 * Randomizes:
 * - Alien spawn positions
 * - Checkpoint positions
 * - Power-up spawn locations
 * - Special events timing
 * - Board layout variations
 */
export function useGameRandomization(seed = null) {
  // Use seed or generate new one
  const gameSeed = useMemo(() => {
    return seed || Date.now() + Math.random();
  }, [seed]);

  // Seeded random number generator (LFSR-based)
  let seedValue = gameSeed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  // Reset seed for consistent results
  const resetSeed = () => {
    seedValue = gameSeed;
  };

  // Randomize alien spawn positions
  const randomizeAlienPositions = useMemo(() => {
    resetSeed();
    const positions = [];
    const count = Math.floor(seededRandom() * 15) + 10; // 10-25 aliens
    
    for (let i = 0; i < count; i++) {
      positions.push(Math.floor(seededRandom() * 100) + 1);
    }
    
    return positions.sort((a, b) => a - b);
  }, [gameSeed]);

  // Randomize checkpoint positions
  const randomizeCheckpointPositions = useMemo(() => {
    resetSeed();
    const positions = [];
    const count = 10; // Standard 10 checkpoints
    
    for (let i = 0; i < count; i++) {
      let pos;
      do {
        pos = Math.floor(seededRandom() * 100) + 1;
      } while (positions.includes(pos));
      positions.push(pos);
    }
    
    return positions.sort((a, b) => a - b);
  }, [gameSeed]);

  // Randomize power-up spawn locations
  const randomizePowerUpPositions = useMemo(() => {
    resetSeed();
    const positions = [];
    const count = Math.floor(seededRandom() * 8) + 5; // 5-13 power-ups
    
    for (let i = 0; i < count; i++) {
      let pos;
      do {
        pos = Math.floor(seededRandom() * 100) + 1;
      } while (positions.includes(pos));
      positions.push(pos);
    }
    
    return positions.sort((a, b) => a - b);
  }, [gameSeed]);

  // Randomize special event timing
  const randomizeEventTiming = useMemo(() => {
    resetSeed();
    return {
      meteorShower: Math.floor(seededRandom() * 20) + 5, // Turn 5-25
      solarStorm: Math.floor(seededRandom() * 30) + 10, // Turn 10-40
      bonusRound: Math.floor(seededRandom() * 15) + 10, // Turn 10-25
      doublePoints: Math.floor(seededRandom() * 20) + 15, // Turn 15-35
      powerUpRush: Math.floor(seededRandom() * 25) + 20 // Turn 20-45
    };
  }, [gameSeed]);

  // Randomize board theme variation
  const randomizeBoardTheme = useMemo(() => {
    resetSeed();
    const themes = ['default', 'nebula', 'asteroid', 'comet', 'galaxy'];
    return themes[Math.floor(seededRandom() * themes.length)];
  }, [gameSeed]);

  // Randomize starting bonuses (slight variations)
  const randomizeStartingBonuses = useMemo(() => {
    resetSeed();
    return {
      coinBonus: Math.floor(seededRandom() * 20) - 10, // -10 to +10 coins
      powerUpBonus: seededRandom() > 0.7 ? 1 : 0 // 30% chance of extra power-up
    };
  }, [gameSeed]);

  // Get random number between min and max
  const randomBetween = (min, max) => {
    return Math.floor(seededRandom() * (max - min + 1)) + min;
  };

  // Get random float between min and max
  const randomFloatBetween = (min, max) => {
    return seededRandom() * (max - min) + min;
  };

  return {
    gameSeed,
    randomizeAlienPositions,
    randomizeCheckpointPositions,
    randomizePowerUpPositions,
    randomizeEventTiming,
    randomizeBoardTheme,
    randomizeStartingBonuses,
    randomBetween,
    randomFloatBetween,
    seededRandom,
    resetSeed
  };
}

