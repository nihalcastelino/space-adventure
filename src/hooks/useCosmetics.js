import { useState, useEffect, useCallback } from 'react';

// Player rocket skins
export const ROCKET_SKINS = {
  DEFAULT: {
    id: 'default',
    name: 'Classic Rocket',
    icon: '🚀',
    rarity: 'common',
    unlockLevel: 0,
    cost: 0,
    isPremium: false
  },
  GOLDEN: {
    id: 'golden',
    name: 'Golden Rocket',
    icon: '✨',
    rarity: 'rare',
    unlockLevel: 10,
    cost: 500,
    isPremium: false
  },
  UFO: {
    id: 'ufo',
    name: 'Flying Saucer',
    icon: '🛸',
    rarity: 'uncommon',
    unlockLevel: 5,
    cost: 200,
    isPremium: false
  },
  SATELLITE: {
    id: 'satellite',
    name: 'Satellite',
    icon: '🛰️',
    rarity: 'uncommon',
    unlockLevel: 8,
    cost: 300,
    isPremium: false
  },
  COMET: {
    id: 'comet',
    name: 'Comet',
    icon: '☄️',
    rarity: 'rare',
    unlockLevel: 15,
    cost: 600,
    isPremium: false
  },
  STAR: {
    id: 'star',
    name: 'Rising Star',
    icon: '⭐',
    rarity: 'epic',
    unlockLevel: 20,
    cost: 1000,
    isPremium: true
  },
  RAINBOW: {
    id: 'rainbow',
    name: 'Rainbow Rocket',
    icon: '🌈',
    rarity: 'epic',
    unlockLevel: 25,
    cost: 1200,
    isPremium: true
  },
  MOON: {
    id: 'moon',
    name: 'Moon Walker',
    icon: '🌙',
    rarity: 'rare',
    unlockLevel: 12,
    cost: 700,
    isPremium: false
  }
};

// Board themes
export const BOARD_THEMES = {
  DEFAULT: {
    id: 'default',
    name: 'Deep Space',
    background: '/space-bg.jpg',
    cellColor: 'from-gray-800 to-gray-900',
    specialColor: 'from-blue-800 to-blue-900',
    rarity: 'common',
    unlockLevel: 0,
    cost: 0,
    isPremium: false
  },
  NEBULA: {
    id: 'nebula',
    name: 'Cosmic Nebula',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cellColor: 'from-purple-800 to-pink-900',
    specialColor: 'from-purple-600 to-pink-700',
    rarity: 'uncommon',
    unlockLevel: 5,
    cost: 300,
    isPremium: false
  },
  GALAXY: {
    id: 'galaxy',
    name: 'Spiral Galaxy',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    cellColor: 'from-blue-900 to-indigo-900',
    specialColor: 'from-blue-700 to-indigo-700',
    rarity: 'rare',
    unlockLevel: 15,
    cost: 800,
    isPremium: false
  },
  SUNSET: {
    id: 'sunset',
    name: 'Cosmic Sunset',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    cellColor: 'from-orange-800 to-red-900',
    specialColor: 'from-orange-600 to-red-700',
    rarity: 'rare',
    unlockLevel: 18,
    cost: 900,
    isPremium: false
  },
  MATRIX: {
    id: 'matrix',
    name: 'Digital Space',
    background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    cellColor: 'from-green-900 to-teal-900',
    specialColor: 'from-green-700 to-teal-700',
    rarity: 'epic',
    unlockLevel: 30,
    cost: 1500,
    isPremium: true
  },
  AURORA: {
    id: 'aurora',
    name: 'Aurora Borealis',
    background: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
    cellColor: 'from-cyan-800 to-teal-900',
    specialColor: 'from-cyan-600 to-teal-700',
    rarity: 'epic',
    unlockLevel: 25,
    cost: 1200,
    isPremium: true
  }
};

// Trail effects (visual trails behind player pieces)
export const TRAIL_EFFECTS = {
  NONE: {
    id: 'none',
    name: 'No Trail',
    effect: null,
    rarity: 'common',
    unlockLevel: 0,
    cost: 0,
    isPremium: false
  },
  SPARKLES: {
    id: 'sparkles',
    name: 'Sparkle Trail',
    effect: 'sparkles',
    rarity: 'uncommon',
    unlockLevel: 8,
    cost: 250,
    isPremium: false
  },
  FIRE: {
    id: 'fire',
    name: 'Fire Trail',
    effect: 'fire',
    rarity: 'rare',
    unlockLevel: 15,
    cost: 500,
    isPremium: false
  },
  STARS: {
    id: 'stars',
    name: 'Star Trail',
    effect: 'stars',
    rarity: 'rare',
    unlockLevel: 20,
    cost: 600,
    isPremium: true
  },
  RAINBOW: {
    id: 'rainbow',
    name: 'Rainbow Trail',
    effect: 'rainbow',
    rarity: 'epic',
    unlockLevel: 25,
    cost: 1000,
    isPremium: true
  }
};

// Dice skins
export const DICE_SKINS = {
  DEFAULT: {
    id: 'default',
    name: 'Classic Dice',
    icon: '🎲',
    color: 'white',
    rarity: 'common',
    unlockLevel: 0,
    cost: 0,
    isPremium: false
  },
  GOLDEN: {
    id: 'golden',
    name: 'Golden Dice',
    icon: '🟡',
    color: '#FFD700',
    rarity: 'uncommon',
    unlockLevel: 10,
    cost: 400,
    isPremium: false
  },
  CRYSTAL: {
    id: 'crystal',
    name: 'Crystal Dice',
    icon: '💎',
    color: '#00FFFF',
    rarity: 'rare',
    unlockLevel: 20,
    cost: 800,
    isPremium: true
  },
  FIRE: {
    id: 'fire',
    name: 'Fire Dice',
    icon: '🔥',
    color: '#FF4500',
    rarity: 'epic',
    unlockLevel: 30,
    cost: 1500,
    isPremium: true
  }
};

export function useCosmetics() {
  const [equippedCosmetics, setEquippedCosmetics] = useState({
    rocketSkin: 'default',
    boardTheme: 'default',
    trailEffect: 'none',
    diceSkin: 'default'
  });

  const [ownedCosmetics, setOwnedCosmetics] = useState({
    rocketSkins: ['default'],
    boardThemes: ['default'],
    trailEffects: ['none'],
    diceSkins: ['default']
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cosmetics');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setEquippedCosmetics(data.equipped || equippedCosmetics);
        setOwnedCosmetics(data.owned || ownedCosmetics);
      } catch (e) {
        console.error('Failed to load cosmetics:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = {
      equipped: equippedCosmetics,
      owned: ownedCosmetics
    };
    localStorage.setItem('cosmetics', JSON.stringify(data));
  }, [equippedCosmetics, ownedCosmetics]);

  // Equip a cosmetic
  const equipCosmetic = useCallback((type, id) => {
    // Check if owned
    const ownedList = ownedCosmetics[`${type}s`] || [];
    if (!ownedList.includes(id)) {
      return { success: false, error: 'Cosmetic not owned' };
    }

    setEquippedCosmetics(prev => ({
      ...prev,
      [type]: id
    }));

    return { success: true };
  }, [ownedCosmetics]);

  // Purchase a cosmetic
  const purchaseCosmetic = useCallback((type, id, coins) => {
    // Get the cosmetic data
    let cosmetic;
    switch (type) {
      case 'rocketSkin':
        cosmetic = Object.values(ROCKET_SKINS).find(s => s.id === id);
        break;
      case 'boardTheme':
        cosmetic = Object.values(BOARD_THEMES).find(t => t.id === id);
        break;
      case 'trailEffect':
        cosmetic = Object.values(TRAIL_EFFECTS).find(e => e.id === id);
        break;
      case 'diceSkin':
        cosmetic = Object.values(DICE_SKINS).find(d => d.id === id);
        break;
      default:
        return { success: false, error: 'Invalid cosmetic type' };
    }

    if (!cosmetic) {
      return { success: false, error: 'Cosmetic not found' };
    }

    // Check if already owned
    const ownedList = ownedCosmetics[`${type}s`] || [];
    if (ownedList.includes(id)) {
      return { success: false, error: 'Already owned' };
    }

    // Check if can afford
    if (coins < cosmetic.cost) {
      return { success: false, error: 'Not enough coins' };
    }

    // Add to owned
    setOwnedCosmetics(prev => ({
      ...prev,
      [`${type}s`]: [...(prev[`${type}s`] || []), id]
    }));

    // Auto-equip
    setEquippedCosmetics(prev => ({
      ...prev,
      [type]: id
    }));

    return { success: true, cost: cosmetic.cost };
  }, [ownedCosmetics]);

  // Unlock a cosmetic (from achievements, level-up, etc.)
  const unlockCosmetic = useCallback((type, id) => {
    const ownedList = ownedCosmetics[`${type}s`] || [];
    if (ownedList.includes(id)) {
      return { success: false, error: 'Already owned' };
    }

    setOwnedCosmetics(prev => ({
      ...prev,
      [`${type}s`]: [...(prev[`${type}s`] || []), id]
    }));

    return { success: true };
  }, [ownedCosmetics]);

  // Check if cosmetic is unlockable at current level
  const isUnlockable = useCallback((cosmetic, level) => {
    return level >= cosmetic.unlockLevel;
  }, []);

  // Get equipped cosmetic data
  const getEquippedRocketSkin = useCallback(() => {
    return Object.values(ROCKET_SKINS).find(s => s.id === equippedCosmetics.rocketSkin) || ROCKET_SKINS.DEFAULT;
  }, [equippedCosmetics.rocketSkin]);

  const getEquippedBoardTheme = useCallback(() => {
    return Object.values(BOARD_THEMES).find(t => t.id === equippedCosmetics.boardTheme) || BOARD_THEMES.DEFAULT;
  }, [equippedCosmetics.boardTheme]);

  const getEquippedTrailEffect = useCallback(() => {
    return Object.values(TRAIL_EFFECTS).find(e => e.id === equippedCosmetics.trailEffect) || TRAIL_EFFECTS.NONE;
  }, [equippedCosmetics.trailEffect]);

  const getEquippedDiceSkin = useCallback(() => {
    return Object.values(DICE_SKINS).find(d => d.id === equippedCosmetics.diceSkin) || DICE_SKINS.DEFAULT;
  }, [equippedCosmetics.diceSkin]);

  return {
    equippedCosmetics,
    ownedCosmetics,
    equipCosmetic,
    purchaseCosmetic,
    unlockCosmetic,
    isUnlockable,
    getEquippedRocketSkin,
    getEquippedBoardTheme,
    getEquippedTrailEffect,
    getEquippedDiceSkin
  };
}
