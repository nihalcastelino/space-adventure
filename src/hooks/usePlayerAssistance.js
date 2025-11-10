import { useState, useCallback } from 'react';

/**
 * Player Assistance System
 *
 * Prevents infinite loops and helps struggling players with:
 * - Safety nets (anti-knockback protection)
 * - Comeback mechanics (last place boosts)
 * - Progress protection (forward-only zones)
 * - Emergency assistance (free power-ups)
 */

export function usePlayerAssistance() {
  const [assistanceState, setAssistanceState] = useState({});

  /**
   * Initialize player assistance state
   */
  const initializePlayer = useCallback((playerId) => {
    setAssistanceState(prev => ({
      ...prev,
      [playerId]: {
        consecutiveKnockbacks: 0,
        turnsAtSamePosition: 0,
        lastPosition: 0,
        turnsWithoutProgress: 0,
        totalKnockbacks: 0,
        immunityTurns: 0,
        boostActive: false,
        highestPosition: 0,
        checkpointKnockbacks: 0
      }
    }));
  }, []);

  /**
   * Track player movement and update assistance metrics
   */
  const trackMovement = useCallback((playerId, oldPosition, newPosition, wasKnockedBack = false) => {
    setAssistanceState(prev => {
      const playerState = prev[playerId] || {};

      const updates = {
        lastPosition: newPosition,
        highestPosition: Math.max(playerState.highestPosition || 0, newPosition)
      };

      // Track knockbacks
      if (wasKnockedBack) {
        updates.consecutiveKnockbacks = (playerState.consecutiveKnockbacks || 0) + 1;
        updates.totalKnockbacks = (playerState.totalKnockbacks || 0) + 1;

        // Track checkpoint knockbacks (knocked back from 50+ to below 50)
        if (oldPosition >= 50 && newPosition < 50) {
          updates.checkpointKnockbacks = (playerState.checkpointKnockbacks || 0) + 1;
        }
      } else {
        updates.consecutiveKnockbacks = 0;
      }

      // Track stagnation
      if (newPosition === oldPosition) {
        updates.turnsAtSamePosition = (playerState.turnsAtSamePosition || 0) + 1;
      } else {
        updates.turnsAtSamePosition = 0;
      }

      // Track progress
      if (newPosition <= oldPosition && !wasKnockedBack) {
        updates.turnsWithoutProgress = (playerState.turnsWithoutProgress || 0) + 1;
      } else if (newPosition > oldPosition) {
        updates.turnsWithoutProgress = 0;
      }

      // Decrease immunity
      if (playerState.immunityTurns > 0) {
        updates.immunityTurns = playerState.immunityTurns - 1;
      }

      return {
        ...prev,
        [playerId]: {
          ...playerState,
          ...updates
        }
      };
    });
  }, []);

  /**
   * Check if player has immunity from knockbacks
   */
  const hasImmunity = useCallback((playerId) => {
    const state = assistanceState[playerId];
    return state?.immunityTurns > 0;
  }, [assistanceState]);

  /**
   * Grant immunity to player
   */
  const grantImmunity = useCallback((playerId, turns = 1) => {
    setAssistanceState(prev => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] || {}),
        immunityTurns: turns
      }
    }));
  }, []);

  /**
   * Check if player should get safety net (too many consecutive knockbacks)
   */
  const shouldActivateSafetyNet = useCallback((playerId) => {
    const state = assistanceState[playerId];
    if (!state) return false;

    // Safety net: 3+ consecutive knockbacks
    if (state.consecutiveKnockbacks >= 3) {
      return {
        activate: true,
        reason: 'consecutive_knockbacks',
        message: `🛡️ Safety Net Activated! Immunity for 2 turns (3 knockbacks in a row)`,
        immunityTurns: 2
      };
    }

    // Safety net: 5+ knockbacks from checkpoints
    if (state.checkpointKnockbacks >= 5) {
      return {
        activate: true,
        reason: 'checkpoint_knockbacks',
        message: `🛡️ Checkpoint Protection! Next checkpoint move guaranteed`,
        immunityTurns: 1
      };
    }

    return { activate: false };
  }, [assistanceState]);

  /**
   * Check if player should get comeback boost (struggling)
   */
  const shouldActivateComebackBoost = useCallback((playerId, allPlayers) => {
    const state = assistanceState[playerId];
    if (!state) return false;

    // Find if player is in last place
    const positions = allPlayers.map(p => p.position);
    const playerPosition = allPlayers.find(p => p.id === playerId)?.position || 0;
    const isLastPlace = positions.every(pos => pos <= playerPosition || pos === playerPosition);

    // Comeback boost: Last place AND stuck below 30
    if (isLastPlace && playerPosition < 30 && state.turnsWithoutProgress >= 5) {
      return {
        activate: true,
        type: 'roll_boost',
        boost: 2,
        message: `📈 Comeback Boost! +2 to all rolls for 3 turns`,
        duration: 3
      };
    }

    // Stagnation boost: Same position for 3+ turns
    if (state.turnsAtSamePosition >= 3) {
      return {
        activate: true,
        type: 'teleport',
        distance: 5,
        message: `⚡ Anti-Stagnation! Auto-advanced 5 spaces`,
        duration: 0
      };
    }

    // No progress boost: 7+ turns without forward movement
    if (state.turnsWithoutProgress >= 7) {
      return {
        activate: true,
        type: 'free_powerup',
        powerup: 'teleport',
        message: `🎁 Struggling? Free Teleport power-up!`,
        duration: 0
      };
    }

    return { activate: false };
  }, [assistanceState]);

  /**
   * Check if position is in safe zone (can't be knocked back)
   */
  const isInSafeZone = useCallback((position) => {
    // Positions 80-95 are safe (near finish)
    return position >= 80 && position < 100;
  }, []);

  /**
   * Check if player landed exactly on checkpoint (gets temp immunity)
   */
  const landedOnCheckpoint = useCallback((position) => {
    return position % 10 === 0 && position > 0 && position < 100;
  }, []);

  /**
   * Process knockback with assistance rules
   * Returns: { allowed: boolean, modifiedDistance: number, message: string }
   */
  const processKnockback = useCallback((playerId, currentPosition, knockbackDistance) => {
    // Check immunity
    if (hasImmunity(playerId)) {
      return {
        allowed: false,
        modifiedDistance: 0,
        message: `🛡️ Immunity Active! Knockback prevented!`
      };
    }

    // Check safe zone
    if (isInSafeZone(currentPosition)) {
      return {
        allowed: false,
        modifiedDistance: 0,
        message: `🏁 Safe Zone! Can't be knocked back here!`
      };
    }

    // Allow knockback but track it
    trackMovement(playerId, currentPosition, currentPosition - knockbackDistance, true);

    return {
      allowed: true,
      modifiedDistance: knockbackDistance,
      message: null
    };
  }, [hasImmunity, isInSafeZone, trackMovement]);

  /**
   * Get assistance status for player
   */
  const getAssistanceStatus = useCallback((playerId) => {
    return assistanceState[playerId] || null;
  }, [assistanceState]);

  /**
   * Reset player assistance state
   */
  const resetPlayer = useCallback((playerId) => {
    setAssistanceState(prev => {
      const updated = { ...prev };
      delete updated[playerId];
      return updated;
    });
  }, []);

  /**
   * Reset all assistance state
   */
  const resetAll = useCallback(() => {
    setAssistanceState({});
  }, []);

  return {
    initializePlayer,
    trackMovement,
    hasImmunity,
    grantImmunity,
    shouldActivateSafetyNet,
    shouldActivateComebackBoost,
    isInSafeZone,
    landedOnCheckpoint,
    processKnockback,
    getAssistanceStatus,
    resetPlayer,
    resetAll
  };
}
