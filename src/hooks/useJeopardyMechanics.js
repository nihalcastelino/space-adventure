import { useState, useEffect, useCallback } from 'react';

/**
 * Jeopardy Mechanics System
 *
 * Phase 1: Black Holes, Space Jail, Meteor Showers
 * Creates dynamic hazards that make the game exciting and unpredictable
 */

// Configuration
const JEOPARDY_CONFIG = {
  // Black Holes - Square destruction
  blackHole: {
    spawnInterval: { min: 5, max: 10 },    // Turns between spawns
    warningTurns: 2,                       // Turns before collapse
    minPosition: 10,                       // Don't spawn near start
    maxPosition: 90,                       // Don't spawn near finish
    maxActive: 5                           // Max black holes at once
  },

  // Space Jail
  spaceJail: {
    patrolZones: 8,                        // Number of patrol zones
    jailDuration: 2,                       // Turns in jail
    bailCost: 50,                          // Coins to pay bail
    minPosition: 15,
    maxPosition: 95
  },

  // Meteor Shower
  meteorShower: {
    spawnInterval: { min: 6, max: 10 },    // Turns between showers
    meteorsPerShower: { min: 5, max: 8 }, // Meteors per event
    duration: 3,                           // Turns active
    damage: 10,                            // Spaces lost
    minPosition: 10,
    maxPosition: 95
  }
};

// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS = {
  easy: 0,      // No hazards
  normal: 0.5,  // 50% frequency
  hard: 1.0,    // 100% frequency
  extreme: 1.5, // 150% frequency
  nightmare: 2.0, // 200% frequency
  chaos: 3.0    // 300% frequency - maximum chaos!
};

export function useJeopardyMechanics(difficulty = 'normal', enabled = true) {
  // Hazard state
  const [hazards, setHazards] = useState({
    blackHoles: [],           // { position, state: 'warning' | 'collapsed', turnsRemaining }
    patrolZones: [],          // Array of position numbers
    meteorImpacts: [],        // { position, turnsRemaining }
    turnsSinceLastBlackHole: 0,
    turnsSinceLastMeteor: 0
  });

  // Player jail state (managed per player)
  const [jailStates, setJailStates] = useState({});

  // Turn counter
  const [turnCount, setTurnCount] = useState(0);

  // Get difficulty multiplier
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
  const isEnabled = enabled && multiplier > 0;

  /**
   * Initialize patrol zones (space jail locations)
   */
  const initializePatrolZones = useCallback(() => {
    if (!isEnabled) return;

    const zones = [];
    const { patrolZones, minPosition, maxPosition } = JEOPARDY_CONFIG.spaceJail;

    while (zones.length < patrolZones) {
      const pos = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;

      // Don't place on checkpoints
      if (pos % 10 !== 0 && !zones.includes(pos)) {
        zones.push(pos);
      }
    }

    setHazards(prev => ({ ...prev, patrolZones: zones }));
  }, [isEnabled]);

  /**
   * Initialize hazards at game start
   */
  useEffect(() => {
    if (isEnabled) {
      initializePatrolZones();
    }
  }, [isEnabled, initializePatrolZones]);

  /**
   * Spawn a new black hole warning
   */
  const spawnBlackHole = useCallback(() => {
    setHazards(prev => {
      // Don't spawn if too many active
      if (prev.blackHoles.length >= JEOPARDY_CONFIG.blackHole.maxActive) {
        return prev;
      }

      const { minPosition, maxPosition, warningTurns } = JEOPARDY_CONFIG.blackHole;
      const existingPositions = prev.blackHoles.map(bh => bh.position);

      // Find valid position
      let attempts = 0;
      let position;

      while (attempts < 20) {
        position = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;

        // Check: not checkpoint, not existing black hole, not patrol zone
        if (position % 10 !== 0 &&
            !existingPositions.includes(position) &&
            !prev.patrolZones.includes(position)) {
          break;
        }
        attempts++;
      }

      if (attempts >= 20) return prev; // Couldn't find valid position

      return {
        ...prev,
        blackHoles: [
          ...prev.blackHoles,
          {
            position,
            state: 'warning',
            turnsRemaining: warningTurns
          }
        ],
        turnsSinceLastBlackHole: 0
      };
    });
  }, []);

  /**
   * Trigger meteor shower
   */
  const triggerMeteorShower = useCallback(() => {
    setHazards(prev => {
      const { meteorsPerShower, duration, minPosition, maxPosition } = JEOPARDY_CONFIG.meteorShower;
      const count = Math.floor(Math.random() * (meteorsPerShower.max - meteorsPerShower.min + 1)) + meteorsPerShower.min;

      const newMeteors = [];
      const existingPositions = prev.meteorImpacts.map(m => m.position);

      for (let i = 0; i < count; i++) {
        let attempts = 0;
        let position;

        while (attempts < 10) {
          position = Math.floor(Math.random() * (maxPosition - minPosition + 1)) + minPosition;

          if (position % 10 !== 0 && // Not checkpoint
              !existingPositions.includes(position) &&
              !newMeteors.some(m => m.position === position)) {
            newMeteors.push({
              position,
              turnsRemaining: duration
            });
            existingPositions.push(position);
            break;
          }
          attempts++;
        }
      }

      return {
        ...prev,
        meteorImpacts: [...prev.meteorImpacts, ...newMeteors],
        turnsSinceLastMeteor: 0
      };
    });
  }, []);

  /**
   * Update hazards each turn
   */
  const updateHazards = useCallback(() => {
    setHazards(prev => {
      let updated = { ...prev };

      // Update black holes
      updated.blackHoles = prev.blackHoles.map(bh => {
        if (bh.turnsRemaining > 0) {
          return { ...bh, turnsRemaining: bh.turnsRemaining - 1 };
        } else if (bh.state === 'warning') {
          // Collapse!
          return { ...bh, state: 'collapsed', turnsRemaining: -1 };
        }
        return bh;
      });

      // Update meteors
      updated.meteorImpacts = prev.meteorImpacts
        .map(m => ({ ...m, turnsRemaining: m.turnsRemaining - 1 }))
        .filter(m => m.turnsRemaining > 0);

      // Increment timers
      updated.turnsSinceLastBlackHole = prev.turnsSinceLastBlackHole + 1;
      updated.turnsSinceLastMeteor = prev.turnsSinceLastMeteor + 1;

      // Spawn new hazards based on intervals (with multiplier)
      const { spawnInterval: bhInterval } = JEOPARDY_CONFIG.blackHole;
      const { spawnInterval: msInterval } = JEOPARDY_CONFIG.meteorShower;

      const bhSpawnTurns = Math.floor((bhInterval.min + bhInterval.max) / 2 / multiplier);
      const msSpawnTurns = Math.floor((msInterval.min + msInterval.max) / 2 / multiplier);

      if (updated.turnsSinceLastBlackHole >= bhSpawnTurns) {
        // Trigger spawn in next effect
        setTimeout(() => spawnBlackHole(), 0);
      }

      if (updated.turnsSinceLastMeteor >= msSpawnTurns) {
        // Trigger spawn in next effect
        setTimeout(() => triggerMeteorShower(), 0);
      }

      return updated;
    });
  }, [multiplier, spawnBlackHole, triggerMeteorShower]);

  /**
   * Check if player landed on hazard
   */
  const checkHazardCollision = useCallback((playerId, position) => {
    const results = {
      blackHole: false,
      patrol: false,
      meteor: false,
      newPosition: position,
      message: null
    };

    // Check black hole (collapsed only)
    const blackHole = hazards.blackHoles.find(
      bh => bh.position === position && bh.state === 'collapsed'
    );

    if (blackHole) {
      results.blackHole = true;

      // Calculate teleport position (back to earlier checkpoint)
      const lastCheckpoint = Math.floor(position / 10) * 10;
      const teleportDistance = Math.floor(Math.random() * 21) + 20; // 20-40 spaces back
      results.newPosition = Math.max(lastCheckpoint - teleportDistance, 0);
      results.message = `💫 Sucked into black hole! Warped back to space ${results.newPosition}!`;

      // Remove black hole after consuming a player
      setHazards(prev => ({
        ...prev,
        blackHoles: prev.blackHoles.filter(bh => bh.position !== position)
      }));

      return results; // Black hole overrides other hazards
    }

    // Check patrol zone
    if (hazards.patrolZones.includes(position)) {
      results.patrol = true;
      results.newPosition = -1; // Special: means "in jail"
      results.message = `🚔 Entered restricted space! Sent to SPACE JAIL!`;

      // Put player in jail
      setJailStates(prev => ({
        ...prev,
        [playerId]: {
          inJail: true,
          turnsRemaining: JEOPARDY_CONFIG.spaceJail.jailDuration,
          previousPosition: position
        }
      }));

      return results;
    }

    // Check meteor impact
    const meteor = hazards.meteorImpacts.find(m => m.position === position);
    if (meteor) {
      results.meteor = true;

      // Calculate damage
      const lastCheckpoint = Math.floor(position / 10) * 10;
      results.newPosition = Math.max(position - JEOPARDY_CONFIG.meteorShower.damage, lastCheckpoint);
      results.message = `🔥 Hit by meteor! Emergency repairs... -${JEOPARDY_CONFIG.meteorShower.damage} spaces!`;

      return results;
    }

    return results;
  }, [hazards]);

  /**
   * Check if player is standing on a warning square
   */
  const checkWarningSquare = useCallback((position) => {
    const warning = hazards.blackHoles.find(
      bh => bh.position === position && bh.state === 'warning'
    );

    if (warning) {
      return {
        hasWarning: true,
        turnsUntilCollapse: warning.turnsRemaining,
        message: `⚠️ WARNING! This square will collapse in ${warning.turnsRemaining} turn${warning.turnsRemaining > 1 ? 's' : ''}!`
      };
    }

    return { hasWarning: false };
  }, [hazards]);

  /**
   * Process jail state for player's turn
   */
  const processJailTurn = useCallback((playerId, rolledDoubles = false) => {
    const jailState = jailStates[playerId];

    if (!jailState || !jailState.inJail) {
      return { inJail: false };
    }

    // Check if rolled doubles (instant escape)
    if (rolledDoubles) {
      setJailStates(prev => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });

      return {
        inJail: false,
        escaped: true,
        method: 'doubles',
        message: '🎲 Rolled doubles! Escaped Space Jail!',
        returnPosition: jailState.previousPosition
      };
    }

    // Decrement jail time
    const newTurns = jailState.turnsRemaining - 1;

    if (newTurns <= 0) {
      // Auto-release
      setJailStates(prev => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });

      return {
        inJail: false,
        escaped: true,
        method: 'timeout',
        message: '🚪 Released from Space Jail!',
        returnPosition: jailState.previousPosition
      };
    }

    // Still in jail
    setJailStates(prev => ({
      ...prev,
      [playerId]: {
        ...jailState,
        turnsRemaining: newTurns
      }
    }));

    return {
      inJail: true,
      turnsRemaining: newTurns,
      message: `🚔 Still in jail... ${newTurns} turn${newTurns > 1 ? 's' : ''} remaining`
    };
  }, [jailStates]);

  /**
   * Pay bail to escape jail
   */
  const payBail = useCallback((playerId) => {
    const jailState = jailStates[playerId];

    if (!jailState || !jailState.inJail) {
      return { success: false, error: 'Not in jail' };
    }

    setJailStates(prev => {
      const updated = { ...prev };
      delete updated[playerId];
      return updated;
    });

    return {
      success: true,
      cost: JEOPARDY_CONFIG.spaceJail.bailCost,
      message: `💰 Paid ${JEOPARDY_CONFIG.spaceJail.bailCost} coins bail! Released from jail!`,
      returnPosition: jailState.previousPosition
    };
  }, [jailStates]);

  /**
   * Get jail state for player
   */
  const getJailState = useCallback((playerId) => {
    return jailStates[playerId] || { inJail: false };
  }, [jailStates]);

  /**
   * Advance turn counter
   */
  const nextTurn = useCallback(() => {
    setTurnCount(prev => prev + 1);
    if (isEnabled) {
      updateHazards();
    }
  }, [isEnabled, updateHazards]);

  /**
   * Reset all hazards (new game)
   */
  const resetHazards = useCallback(() => {
    setHazards({
      blackHoles: [],
      patrolZones: [],
      meteorImpacts: [],
      turnsSinceLastBlackHole: 0,
      turnsSinceLastMeteor: 0
    });
    setJailStates({});
    setTurnCount(0);

    if (isEnabled) {
      initializePatrolZones();
    }
  }, [isEnabled, initializePatrolZones]);

  /**
   * Get all active hazards for rendering
   */
  const getActiveHazards = useCallback(() => {
    return {
      // Black holes with warning state
      blackHoles: hazards.blackHoles.map(bh => ({
        position: bh.position,
        isWarning: bh.state === 'warning',
        isCollapsed: bh.state === 'collapsed',
        turnsUntilCollapse: bh.state === 'warning' ? bh.turnsRemaining : 0
      })),

      // Patrol zones
      patrolZones: hazards.patrolZones,

      // Meteor impacts
      meteorImpacts: hazards.meteorImpacts.map(m => ({
        position: m.position,
        turnsRemaining: m.turnsRemaining
      }))
    };
  }, [hazards]);

  return {
    // State
    hazards: getActiveHazards(),
    turnCount,
    isEnabled,

    // Actions
    nextTurn,
    resetHazards,
    checkHazardCollision,
    checkWarningSquare,
    processJailTurn,
    payBail,
    getJailState,

    // Manual triggers (for testing)
    spawnBlackHole,
    triggerMeteorShower
  };
}

/**
 * Get hazard info for a specific position
 */
export function getHazardAtPosition(hazards, position) {
  // Check black hole
  const blackHole = hazards.blackHoles.find(bh => bh.position === position);
  if (blackHole) {
    return {
      type: blackHole.isCollapsed ? 'blackHole' : 'blackHoleWarning',
      icon: blackHole.isCollapsed ? '🕳️' : '⚠️',
      color: blackHole.isCollapsed ? 'purple' : 'orange',
      turnsUntilCollapse: blackHole.turnsUntilCollapse
    };
  }

  // Check patrol
  if (hazards.patrolZones.includes(position)) {
    return {
      type: 'patrol',
      icon: '🚨',
      color: 'red'
    };
  }

  // Check meteor
  const meteor = hazards.meteorImpacts.find(m => m.position === position);
  if (meteor) {
    return {
      type: 'meteor',
      icon: '🔥',
      color: 'orange',
      turnsRemaining: meteor.turnsRemaining
    };
  }

  return null;
}
