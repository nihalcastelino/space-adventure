import { useState, useCallback, useRef, useEffect } from 'react';

const BASE_ALIENS = [14, 23, 29, 38, 45, 50, 54, 61, 68, 75, 82, 88, 94, 98];
const BASE_CHECKPOINTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
const BOARD_SIZE = 100;

// Difficulty settings
const DIFFICULTY_CONFIG = {
  easy: {
    alienSpawnInterval: null, // No spawning
    alienSpawnChance: 0,
    checkpointRemovalChance: 0,
    description: 'Standard game, no surprises',
    coinMultiplier: 1.0,
    xpMultiplier: 1.0
  },
  normal: {
    alienSpawnInterval: 5, // Every 4-5 turns
    alienSpawnChance: 0.6, // 60% chance when interval hits
    checkpointRemovalChance: 0.1, // 10% per turn
    description: 'Random aliens spawn, checkpoints may disappear',
    coinMultiplier: 1.2,
    xpMultiplier: 1.2
  },
  hard: {
    alienSpawnInterval: 3, // Every 2-3 turns
    alienSpawnChance: 0.8, // 80% chance when interval hits
    checkpointRemovalChance: 0.2, // 20% per turn
    description: 'Frequent alien spawns, high checkpoint loss!',
    coinMultiplier: 1.5,
    xpMultiplier: 1.5
  },
  extreme: {
    alienSpawnInterval: 2, // Every 1-2 turns
    alienSpawnChance: 0.9, // 90% chance when interval hits
    checkpointRemovalChance: 0.3, // 30% per turn
    description: 'Constant threats! Aliens spawn every turn!',
    coinMultiplier: 2.0,
    xpMultiplier: 2.0,
    requiresPremium: true
  },
  nightmare: {
    alienSpawnInterval: 1, // Every turn
    alienSpawnChance: 1.0, // 100% chance - guaranteed spawn
    checkpointRemovalChance: 0.4, // 40% per turn
    description: 'Nightmare mode! Aliens spawn EVERY turn!',
    coinMultiplier: 2.5,
    xpMultiplier: 2.5,
    requiresPremium: true
  },
  chaos: {
    alienSpawnInterval: 1, // Every turn
    alienSpawnChance: 1.0, // 100% chance
    checkpointRemovalChance: 0.5, // 50% per turn - half checkpoints gone!
    description: 'Pure chaos! Maximum difficulty, all mechanics active!',
    coinMultiplier: 3.0,
    xpMultiplier: 3.0,
    requiresPremium: true,
    enableAllHazards: true // Enable all jeopardy mechanics
  }
};

export function useDifficulty(initialDifficulty = 'normal') {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [aliens, setAliens] = useState([...BASE_ALIENS]);
  const [checkpoints, setCheckpoints] = useState([...BASE_CHECKPOINTS]);
  const [turnCount, setTurnCount] = useState(0);
  const [spawnedAliens, setSpawnedAliens] = useState([]); // Track dynamically spawned aliens
  const [removedCheckpoints, setRemovedCheckpoints] = useState([]); // Track removed checkpoints

  const config = DIFFICULTY_CONFIG[difficulty];

  // Get available positions for alien spawning (not occupied by aliens, spaceports, or checkpoints)
  const getAvailablePositions = useCallback((playerPositions = []) => {
    const occupied = new Set([
      ...aliens,
      ...checkpoints,
      ...playerPositions,
      BOARD_SIZE // Don't spawn on finish
    ]);

    const available = [];
    // Only spawn aliens ahead of players (more challenging)
    const maxPlayerPos = Math.max(...playerPositions, 0);
    for (let i = maxPlayerPos + 1; i < BOARD_SIZE; i++) {
      if (!occupied.has(i)) {
        available.push(i);
      }
    }
    return available;
  }, [aliens, checkpoints]);

  // Spawn a random alien
  const spawnAlien = useCallback((playerPositions = []) => {
    const available = getAvailablePositions(playerPositions);
    if (available.length === 0) return null;

    const randomPos = available[Math.floor(Math.random() * available.length)];
    setAliens(prev => [...prev, randomPos]);
    setSpawnedAliens(prev => [...prev, randomPos]);
    return randomPos;
  }, [getAvailablePositions]);

  // Remove a random checkpoint (not position 0 or most recent ones)
  const removeCheckpoint = useCallback(() => {
    // Don't remove position 0 (starting) or if only 2-3 checkpoints left
    const removable = checkpoints.filter(cp => cp !== 0 && cp < 80);
    if (removable.length <= 2) return null;

    const randomCheckpoint = removable[Math.floor(Math.random() * removable.length)];
    setCheckpoints(prev => prev.filter(cp => cp !== randomCheckpoint));
    setRemovedCheckpoints(prev => [...prev, randomCheckpoint]);
    return randomCheckpoint;
  }, [checkpoints]);

  // Process difficulty events after each turn
  const processTurnEvents = useCallback((playerPositions = []) => {
    if (difficulty === 'easy') return { spawnedAlien: null, removedCheckpoint: null };

    const events = { spawnedAlien: null, removedCheckpoint: null };
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);

    // Alien spawning
    if (config.alienSpawnInterval && newTurnCount % config.alienSpawnInterval === 0) {
      if (Math.random() < config.alienSpawnChance) {
        events.spawnedAlien = spawnAlien(playerPositions);
      }
    }

    // Checkpoint removal
    if (Math.random() < config.checkpointRemovalChance) {
      events.removedCheckpoint = removeCheckpoint();
    }

    return events;
  }, [difficulty, turnCount, config, spawnAlien, removeCheckpoint]);

  // Reset to base state
  const resetDifficulty = useCallback(() => {
    setAliens([...BASE_ALIENS]);
    setCheckpoints([...BASE_CHECKPOINTS]);
    setTurnCount(0);
    setSpawnedAliens([]);
    setRemovedCheckpoints([]);
  }, []);

  // Change difficulty mid-game
  const changeDifficulty = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
    // Don't reset the board state, just change future behavior
  }, []);

  // Reset when difficulty changes initially
  useEffect(() => {
    resetDifficulty();
  }, [initialDifficulty]);

  return {
    difficulty,
    aliens,
    checkpoints,
    spawnedAliens,
    removedCheckpoints,
    turnCount,
    processTurnEvents,
    resetDifficulty,
    changeDifficulty,
    config
  };
}
