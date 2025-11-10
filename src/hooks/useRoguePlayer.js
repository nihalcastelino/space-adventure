import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Rogue Player System
 *
 * A moving AI "alien" that roams the board and knocks back players
 * who land on or pass through its position
 */

export function useRoguePlayer(enabled = true) {
  const [rogueState, setRogueState] = useState({
    active: false,
    position: 0,
    name: 'Rogue Alien',
    icon: '👽',
    movePattern: 'random', // 'random', 'forward', 'backward', 'chase'
    lastMoveDirection: 'forward',
    turnsActive: 0
  });

  // Use ref to always have current state in callbacks
  const rogueStateRef = useRef(rogueState);
  
  useEffect(() => {
    rogueStateRef.current = rogueState;
  }, [rogueState]);

  /**
   * Spawn the rogue player at a random position
   */
  const spawnRogue = useCallback((playerPositions = []) => {
    if (!enabled) return;

    // Spawn between positions 15-70 (not too early, not too late)
    let spawnPosition;
    let attempts = 0;

    while (attempts < 20) {
      spawnPosition = Math.floor(Math.random() * 56) + 15; // 15-70

      // Don't spawn on players or checkpoints
      if (!playerPositions.includes(spawnPosition) && spawnPosition % 10 !== 0) {
        break;
      }
      attempts++;
    }

    if (attempts >= 20) return; // Couldn't find valid position

    setRogueState({
      active: true,
      position: spawnPosition,
      name: 'Rogue Alien',
      icon: '👽',
      movePattern: 'random',
      lastMoveDirection: 'forward',
      turnsActive: 0
    });
  }, [enabled]);

  /**
   * Move the rogue player
   */
  const moveRogue = useCallback((playerPositions = []) => {
    setRogueState(prev => {
      if (!prev.active) return prev;

      let newPosition = prev.position;
      let direction = 'forward';

      // Determine movement based on pattern
      switch (prev.movePattern) {
        case 'random':
          // Move 1-3 spaces randomly forward or backward
          const randomMove = Math.floor(Math.random() * 3) + 1; // 1-3
          const randomDirection = Math.random() > 0.3 ? 1 : -1; // 70% forward, 30% backward
          newPosition = prev.position + (randomMove * randomDirection);
          direction = randomDirection > 0 ? 'forward' : 'backward';
          break;

        case 'forward':
          // Always move forward 2 spaces
          newPosition = prev.position + 2;
          direction = 'forward';
          break;

        case 'backward':
          // Always move backward 2 spaces
          newPosition = prev.position - 2;
          direction = 'backward';
          break;

        case 'chase':
          // Move toward nearest player
          const distances = playerPositions.map(pos => ({
            pos,
            distance: Math.abs(pos - prev.position)
          }));
          distances.sort((a, b) => a.distance - b.distance);

          if (distances.length > 0 && distances[0].distance > 0) {
            const targetPos = distances[0].pos;
            if (targetPos > prev.position) {
              newPosition = prev.position + 2;
              direction = 'forward';
            } else {
              newPosition = prev.position - 2;
              direction = 'backward';
            }
          } else {
            newPosition = prev.position + 2;
            direction = 'forward';
          }
          break;
      }

      // Keep within bounds
      newPosition = Math.max(5, Math.min(95, newPosition));

      // Don't land on checkpoints
      if (newPosition % 10 === 0) {
        newPosition += (direction === 'forward' ? 1 : -1);
      }

      // Change pattern randomly every 5 turns
      let newPattern = prev.movePattern;
      if (prev.turnsActive > 0 && prev.turnsActive % 5 === 0) {
        const patterns = ['random', 'forward', 'backward', 'chase'];
        newPattern = patterns[Math.floor(Math.random() * patterns.length)];
      }

      return {
        ...prev,
        position: newPosition,
        movePattern: newPattern,
        lastMoveDirection: direction,
        turnsActive: prev.turnsActive + 1
      };
    });
  }, []);

  /**
   * Check if player encounters rogue
   * Returns: null or { knocked: true, knockbackDistance: number, message: string }
   */
  const checkRogueEncounter = useCallback((playerOldPosition, playerNewPosition, playerId) => {
    const currentState = rogueStateRef.current;
    if (!currentState.active) return null;

    const roguePos = currentState.position;

    // Check if player landed on rogue
    if (playerNewPosition === roguePos) {
      return {
        knocked: true,
        knockbackDistance: 15,
        message: `👽 Encountered Rogue Alien! Knocked back 15 spaces!`,
        encounterType: 'direct'
      };
    }

    // Check if player passed through rogue position
    const min = Math.min(playerOldPosition, playerNewPosition);
    const max = Math.max(playerOldPosition, playerNewPosition);

    if (roguePos > min && roguePos < max) {
      return {
        knocked: true,
        knockbackDistance: 10,
        message: `👽 Passed by Rogue Alien! Knocked back 10 spaces!`,
        encounterType: 'passthrough'
      };
    }

    return null;
  }, []);

  /**
   * Despawn the rogue (after X turns or when someone reaches position 90+)
   */
  const despawnRogue = useCallback(() => {
    setRogueState(prev => ({
      ...prev,
      active: false,
      turnsActive: 0
    }));
  }, []);

  /**
   * Check if rogue should despawn (auto-despawn after 15 turns)
   */
  const shouldDespawn = useCallback(() => {
    return rogueStateRef.current.turnsActive >= 15;
  }, []);

  /**
   * Reset rogue state
   */
  const resetRogue = useCallback(() => {
    setRogueState({
      active: false,
      position: 0,
      name: 'Rogue Alien',
      icon: '👽',
      movePattern: 'random',
      lastMoveDirection: 'forward',
      turnsActive: 0
    });
  }, []);

  return {
    rogueState,
    spawnRogue,
    moveRogue,
    checkRogueEncounter,
    despawnRogue,
    shouldDespawn,
    resetRogue
  };
}
