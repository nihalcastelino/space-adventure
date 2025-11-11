import { useState, useCallback } from 'react';

/**
 * Cascading Mechanics Hook
 * 
 * Implements Bejeweled-style cascading effects:
 * - Combo chains (hitting multiple aliens in a row)
 * - Cascading checkpoints (hitting one unlocks nearby)
 * - Power-up combos (using power-ups creates chain reactions)
 * - Multipliers that build up
 */
export function useCascadingMechanics(variant = 'classic') {
  const [comboCount, setComboCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1.0);
  const [lastAction, setLastAction] = useState(null);
  const [cascadeChain, setCascadeChain] = useState([]);

  // Check for cascading alien kills (like Bejeweled's 4-in-a-row)
  const checkAlienCombo = useCallback((playerId, aliensHit, currentPosition) => {
    if (variant !== 'alienHunter') return { combo: false, bonus: 0 };

    // If player hit alien this turn and last turn = combo
    if (lastAction?.type === 'alienHit' && lastAction?.playerId === playerId) {
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      
      // Cascading effect: 2+ hits in a row = bonus
      if (newCombo >= 2) {
        const bonus = Math.pow(2, newCombo - 1); // 2x, 4x, 8x...
        setComboMultiplier(prev => prev * bonus);
        
        return {
          combo: true,
          bonus: bonus,
          multiplier: comboMultiplier * bonus,
          message: `🔥 ${newCombo}x COMBO! Cascading kill bonus!`
        };
      }
    } else {
      // Reset combo if broken
      setComboCount(0);
      setComboMultiplier(1.0);
    }

    setLastAction({ type: 'alienHit', playerId, position: currentPosition });
    return { combo: false, bonus: 0 };
  }, [variant, comboCount, comboMultiplier, lastAction]);

  // Cascading checkpoint unlock (like Bejeweled's cascades)
  const checkCheckpointCascade = useCallback((playerId, checkpointHit, allCheckpoints) => {
    if (variant !== 'checkpointChallenge') return { cascades: [] };

    // When you hit a checkpoint, nearby checkpoints get "unlocked" (easier to hit)
    const cascades = [];
    const checkpointIndex = allCheckpoints.indexOf(checkpointHit);
    
    // Unlock adjacent checkpoints (within 2 positions)
    for (let i = checkpointIndex - 2; i <= checkpointIndex + 2; i++) {
      if (i >= 0 && i < allCheckpoints.length && i !== checkpointIndex) {
        const nearbyCheckpoint = allCheckpoints[i];
        cascades.push({
          checkpoint: nearbyCheckpoint,
          bonus: 'unlocked', // Makes it easier to hit
          message: `✨ Checkpoint ${nearbyCheckpoint} unlocked by cascade!`
        });
      }
    }

    return { cascades };
  }, [variant]);

  // Power-up combo chain (like Bejeweled's cascading matches)
  const checkPowerUpCombo = useCallback((playerId, powerUpUsed, powerUpType) => {
    if (variant !== 'powerUpRush') return { combo: false, bonus: null };

    // Using same power-up type in a row = combo
    if (lastAction?.type === 'powerUp' && lastAction?.powerUpType === powerUpType) {
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      
      // Cascading effect: spawns additional power-ups
      if (newCombo >= 2) {
        const bonusPowerUps = Math.floor(newCombo / 2); // Every 2 combos = 1 bonus power-up
        
        return {
          combo: true,
          bonusPowerUps,
          message: `⚡ ${newCombo}x POWER-UP COMBO! Spawned ${bonusPowerUps} bonus power-ups!`
        };
      }
    } else {
      setComboCount(0);
    }

    setLastAction({ type: 'powerUp', playerId, powerUpType });
    return { combo: false, bonus: null };
  }, [variant, comboCount, lastAction]);

  // Spaceport cascade (hitting spaceport triggers nearby effects)
  const checkSpaceportCascade = useCallback((playerId, spaceportUsed, destination) => {
    // Hitting a spaceport can trigger cascading effects
    const cascades = [];
    
    // If you hit multiple spaceports in a row = combo
    if (lastAction?.type === 'spaceport' && lastAction?.playerId === playerId) {
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      
      if (newCombo >= 2) {
        cascades.push({
          type: 'bonusMove',
          distance: newCombo, // Extra spaces for combo
          message: `🚀 ${newCombo}x SPACEPORT COMBO! Bonus move!`
        });
      }
    } else {
      setComboCount(0);
    }

    setLastAction({ type: 'spaceport', playerId, destination });
    return { cascades };
  }, [comboCount, lastAction]);

  // Reset combo (when turn changes or combo breaks)
  const resetCombo = useCallback(() => {
    setComboCount(0);
    setComboMultiplier(1.0);
    setLastAction(null);
    setCascadeChain([]);
  }, []);

  // Get current combo multiplier
  const getComboMultiplier = useCallback(() => {
    return comboMultiplier;
  }, [comboMultiplier]);

  return {
    comboCount,
    comboMultiplier: getComboMultiplier(),
    checkAlienCombo,
    checkCheckpointCascade,
    checkPowerUpCombo,
    checkSpaceportCascade,
    resetCombo
  };
}

