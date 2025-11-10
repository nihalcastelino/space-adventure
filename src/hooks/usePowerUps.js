import { useState, useEffect, useCallback } from 'react';

// Power-up definitions
export const POWERUPS = {
  SPEED_BOOST: {
    id: 'speed_boost',
    name: 'Speed Boost',
    description: 'Move +2 extra spaces this turn',
    icon: '⚡',
    rarity: 'common',
    cost: 50, // in game coins
    effect: 'add_movement',
    value: 2,
    duration: 'single_use'
  },
  SHIELD: {
    id: 'shield',
    name: 'Alien Shield',
    description: 'Ignore the next alien encounter',
    icon: '🛡️',
    rarity: 'uncommon',
    cost: 100,
    effect: 'block_alien',
    value: 1,
    duration: 'until_triggered'
  },
  DOUBLE_DICE: {
    id: 'double_dice',
    name: 'Lucky Dice',
    description: 'Roll twice and pick the better result',
    icon: '🎲',
    rarity: 'uncommon',
    cost: 75,
    effect: 'double_roll',
    value: 1,
    duration: 'single_use'
  },
  TELEPORT: {
    id: 'teleport',
    name: 'Warp Drive',
    description: 'Jump to any checkpoint ahead',
    icon: '🌀',
    rarity: 'rare',
    cost: 200,
    effect: 'teleport_checkpoint',
    value: 1,
    duration: 'single_use'
  },
  REROLL: {
    id: 'reroll',
    name: 'Second Chance',
    description: 'Reroll the dice if you don\'t like the result',
    icon: '🔄',
    rarity: 'common',
    cost: 40,
    effect: 'allow_reroll',
    value: 1,
    duration: 'single_use'
  },
  CHECKPOINT_LOCK: {
    id: 'checkpoint_lock',
    name: 'Checkpoint Lock',
    description: 'Prevent checkpoint removal for 5 turns',
    icon: '🔒',
    rarity: 'rare',
    cost: 150,
    effect: 'lock_checkpoints',
    value: 5,
    duration: 'turns'
  },
  ALIEN_REPELLENT: {
    id: 'alien_repellent',
    name: 'Alien Repellent',
    description: 'No new aliens spawn for 3 turns',
    icon: '🧪',
    rarity: 'uncommon',
    cost: 120,
    effect: 'block_alien_spawn',
    value: 3,
    duration: 'turns'
  },
  EXTRA_TURN: {
    id: 'extra_turn',
    name: 'Time Warp',
    description: 'Take an extra turn immediately',
    icon: '⏰',
    rarity: 'epic',
    cost: 300,
    effect: 'extra_turn',
    value: 1,
    duration: 'single_use'
  },
  LUCKY_STAR: {
    id: 'lucky_star',
    name: 'Lucky Star',
    description: 'Guaranteed 6 on next roll',
    icon: '⭐',
    rarity: 'epic',
    cost: 250,
    effect: 'force_six',
    value: 1,
    duration: 'single_use'
  }
};

// Rarity colors
export const RARITY_COLORS = {
  common: 'from-gray-600 to-gray-800 border-gray-400',
  uncommon: 'from-green-600 to-green-800 border-green-400',
  rare: 'from-blue-600 to-blue-800 border-blue-400',
  epic: 'from-purple-600 to-purple-800 border-purple-400',
  legendary: 'from-yellow-600 to-yellow-800 border-yellow-400'
};

export function usePowerUps() {
  const [inventory, setInventory] = useState({});
  const [activeEffects, setActiveEffects] = useState({});
  const [coins, setCoins] = useState(100); // Start with 100 coins

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('powerups');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setInventory(data.inventory || {});
        setActiveEffects(data.activeEffects || {});
        setCoins(data.coins || 100);
      } catch (e) {
        console.error('Failed to load power-ups:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = { inventory, activeEffects, coins };
    localStorage.setItem('powerups', JSON.stringify(data));
  }, [inventory, activeEffects, coins]);

  // Add coins
  const addCoins = useCallback((amount) => {
    setCoins(prev => prev + amount);
  }, []);

  // Purchase power-up with coins
  const purchasePowerUp = useCallback((powerUpId) => {
    const powerUp = Object.values(POWERUPS).find(p => p.id === powerUpId);
    if (!powerUp) return { success: false, error: 'Invalid power-up' };

    if (coins < powerUp.cost) {
      return { success: false, error: 'Not enough coins' };
    }

    setCoins(prev => prev - powerUp.cost);
    setInventory(prev => ({
      ...prev,
      [powerUpId]: (prev[powerUpId] || 0) + 1
    }));

    return { success: true };
  }, [coins]);

  // Add power-up to inventory (free, from rewards)
  const addPowerUp = useCallback((powerUpId, quantity = 1) => {
    setInventory(prev => ({
      ...prev,
      [powerUpId]: (prev[powerUpId] || 0) + quantity
    }));
  }, []);

  // Use/activate a power-up
  const usePowerUp = useCallback((powerUpId) => {
    const powerUp = Object.values(POWERUPS).find(p => p.id === powerUpId);
    if (!powerUp) return { success: false, error: 'Invalid power-up' };

    if (!inventory[powerUpId] || inventory[powerUpId] <= 0) {
      return { success: false, error: 'No power-ups available' };
    }

    // Decrease inventory
    setInventory(prev => ({
      ...prev,
      [powerUpId]: prev[powerUpId] - 1
    }));

    // Activate effect
    if (powerUp.duration === 'single_use') {
      // Single use effects are handled immediately by the game logic
      return { success: true, effect: powerUp.effect, value: powerUp.value };
    } else if (powerUp.duration === 'turns') {
      // Turn-based effects
      setActiveEffects(prev => ({
        ...prev,
        [powerUpId]: powerUp.value
      }));
      return { success: true, effect: powerUp.effect, value: powerUp.value };
    } else if (powerUp.duration === 'until_triggered') {
      // Effects that last until triggered
      setActiveEffects(prev => ({
        ...prev,
        [powerUpId]: powerUp.value
      }));
      return { success: true, effect: powerUp.effect, value: powerUp.value };
    }

    return { success: false, error: 'Unknown effect type' };
  }, [inventory]);

  // Process turn (decrease turn-based effects)
  const processTurn = useCallback(() => {
    setActiveEffects(prev => {
      const updated = { ...prev };
      Object.entries(updated).forEach(([powerUpId, remaining]) => {
        const powerUp = Object.values(POWERUPS).find(p => p.id === powerUpId);
        if (powerUp && powerUp.duration === 'turns') {
          if (remaining > 1) {
            updated[powerUpId] = remaining - 1;
          } else {
            delete updated[powerUpId];
          }
        }
      });
      return updated;
    });
  }, []);

  // Trigger an effect (for until_triggered effects)
  const triggerEffect = useCallback((effectType) => {
    setActiveEffects(prev => {
      const updated = { ...prev };
      Object.entries(updated).forEach(([powerUpId, _]) => {
        const powerUp = Object.values(POWERUPS).find(p => p.id === powerUpId);
        if (powerUp && powerUp.effect === effectType && powerUp.duration === 'until_triggered') {
          delete updated[powerUpId];
        }
      });
      return updated;
    });
  }, []);

  // Check if a specific effect is active
  const hasActiveEffect = useCallback((effectType) => {
    return Object.entries(activeEffects).some(([powerUpId, _]) => {
      const powerUp = Object.values(POWERUPS).find(p => p.id === powerUpId);
      return powerUp && powerUp.effect === effectType;
    });
  }, [activeEffects]);

  // Get remaining turns for an effect
  const getEffectRemainingTurns = useCallback((powerUpId) => {
    return activeEffects[powerUpId] || 0;
  }, [activeEffects]);

  // Clear all active effects (on game end)
  const clearActiveEffects = useCallback(() => {
    setActiveEffects({});
  }, []);

  // Get total count of power-ups in inventory
  const getTotalPowerUps = useCallback(() => {
    return Object.values(inventory).reduce((sum, count) => sum + count, 0);
  }, [inventory]);

  // Generate random power-up reward (for achievements, wins, etc.)
  const generateRandomReward = useCallback(() => {
    const rarityWeights = {
      common: 0.5,     // 50%
      uncommon: 0.3,   // 30%
      rare: 0.15,      // 15%
      epic: 0.05       // 5%
    };

    const rand = Math.random();
    let cumulativeWeight = 0;
    let selectedRarity = 'common';

    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      cumulativeWeight += weight;
      if (rand <= cumulativeWeight) {
        selectedRarity = rarity;
        break;
      }
    }

    // Get all power-ups of selected rarity
    const powerUpsOfRarity = Object.values(POWERUPS).filter(p => p.rarity === selectedRarity);
    const randomPowerUp = powerUpsOfRarity[Math.floor(Math.random() * powerUpsOfRarity.length)];

    return randomPowerUp;
  }, []);

  return {
    inventory,
    activeEffects,
    coins,
    addCoins,
    purchasePowerUp,
    addPowerUp,
    usePowerUp,
    processTurn,
    triggerEffect,
    hasActiveEffect,
    getEffectRemainingTurns,
    clearActiveEffects,
    getTotalPowerUps,
    generateRandomReward
  };
}
