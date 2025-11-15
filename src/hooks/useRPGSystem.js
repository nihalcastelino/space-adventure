import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * RPG System Hook
 * 
 * Adds tabletop RPG mechanics to the space adventure game:
 * - Character classes and races
 * - Stats (STR, DEX, INT, CON, WIS, CHA)
 * - Combat system
 * - Experience and leveling
 * - Equipment and inventory
 * - Skills and abilities
 */

// Character Classes
export const CHARACTER_CLASSES = {
  pilot: {
    id: 'pilot',
    name: 'Space Pilot',
    description: 'Expert navigator with high DEX and INT',
    icon: '🚀',
    statBonuses: { DEX: 3, INT: 2, STR: 0, CON: 1, WIS: 1, CHA: 0 },
    startingSkills: ['navigation', 'evasion'],
    startingEquipment: ['laser_pistol', 'space_suit']
  },
  warrior: {
    id: 'warrior',
    name: 'Space Marine',
    description: 'Combat specialist with high STR and CON',
    icon: '⚔️',
    statBonuses: { STR: 3, CON: 2, DEX: 1, INT: 0, WIS: 0, CHA: 1 },
    startingSkills: ['combat', 'intimidation'],
    startingEquipment: ['plasma_rifle', 'combat_armor']
  },
  engineer: {
    id: 'engineer',
    name: 'Ship Engineer',
    description: 'Technical expert with high INT and WIS',
    icon: '🔧',
    statBonuses: { INT: 3, WIS: 2, DEX: 1, STR: 0, CON: 1, CHA: 0 },
    startingSkills: ['repair', 'hacking'],
    startingEquipment: ['toolkit', 'shield_generator']
  },
  diplomat: {
    id: 'diplomat',
    name: 'Galactic Diplomat',
    description: 'Charismatic negotiator with high CHA and WIS',
    icon: '🤝',
    statBonuses: { CHA: 3, WIS: 2, INT: 1, DEX: 0, STR: 0, CON: 1 },
    startingSkills: ['persuasion', 'diplomacy'],
    startingEquipment: ['communicator', 'diplomatic_immunity']
  },
  rogue: {
    id: 'rogue',
    name: 'Space Rogue',
    description: 'Sneaky opportunist with high DEX and CHA',
    icon: '🗡️',
    statBonuses: { DEX: 3, CHA: 2, INT: 1, STR: 0, CON: 0, WIS: 1 },
    startingSkills: ['stealth', 'lockpicking'],
    startingEquipment: ['energy_blade', 'cloaking_device']
  },
  scientist: {
    id: 'scientist',
    name: 'Xenobiologist',
    description: 'Alien researcher with high INT and WIS',
    icon: '🔬',
    statBonuses: { INT: 3, WIS: 3, DEX: 0, STR: 0, CON: 0, CHA: 1 },
    startingSkills: ['research', 'analysis'],
    startingEquipment: ['scanner', 'lab_coat']
  }
};

// Character Races
export const CHARACTER_RACES = {
  human: {
    id: 'human',
    name: 'Human',
    description: 'Versatile and adaptable',
    icon: '👤',
    statBonuses: { STR: 1, DEX: 1, INT: 1, CON: 1, WIS: 1, CHA: 1 },
    racialAbility: 'adaptability' // +1 to all stats
  },
  zephyr: {
    id: 'zephyr',
    name: 'Zephyr',
    description: 'Agile and quick',
    icon: '💨',
    statBonuses: { DEX: 2, INT: 1, STR: 0, CON: 0, WIS: 0, CHA: 0 },
    racialAbility: 'wind_walker' // +2 movement on spaceports
  },
  krogan: {
    id: 'krogan',
    name: 'Krogan',
    description: 'Strong and tough',
    icon: '🛡️',
    statBonuses: { STR: 2, CON: 2, DEX: 0, INT: 0, WIS: 0, CHA: -1 },
    racialAbility: 'tough_skin' // Resistance to alien attacks
  },
  vulcan: {
    id: 'vulcan',
    name: 'Vulcan',
    description: 'Logical and intelligent',
    icon: '🧠',
    statBonuses: { INT: 2, WIS: 2, DEX: 0, STR: 0, CON: 0, CHA: 0 },
    racialAbility: 'logical_mind' // Bonus to skill checks
  },
  asari: {
    id: 'asari',
    name: 'Asari',
    description: 'Charismatic and wise',
    icon: '✨',
    statBonuses: { CHA: 2, WIS: 1, INT: 1, DEX: 0, STR: 0, CON: 0 },
    racialAbility: 'biotic_presence' // Can charm aliens
  }
};

// Equipment
export const EQUIPMENT = {
  // Weapons
  laser_pistol: {
    id: 'laser_pistol',
    name: 'Laser Pistol',
    type: 'weapon',
    rarity: 'common',
    statBonuses: { DEX: 1 },
    damage: '1d6',
    description: 'Standard issue sidearm'
  },
  plasma_rifle: {
    id: 'plasma_rifle',
    name: 'Plasma Rifle',
    type: 'weapon',
    rarity: 'uncommon',
    statBonuses: { STR: 1 },
    damage: '2d6',
    description: 'Heavy weapon for combat'
  },
  energy_blade: {
    id: 'energy_blade',
    name: 'Energy Blade',
    type: 'weapon',
    rarity: 'rare',
    statBonuses: { DEX: 2, STR: 1 },
    damage: '1d8',
    description: 'Melee weapon with energy field'
  },
  // Armor
  space_suit: {
    id: 'space_suit',
    name: 'Space Suit',
    type: 'armor',
    rarity: 'common',
    statBonuses: { CON: 1 },
    armor: 1,
    description: 'Basic protection for space travel'
  },
  combat_armor: {
    id: 'combat_armor',
    name: 'Combat Armor',
    type: 'armor',
    rarity: 'uncommon',
    statBonuses: { CON: 2, STR: 1 },
    armor: 2,
    description: 'Heavy armor for battle'
  },
  // Utility
  toolkit: {
    id: 'toolkit',
    name: 'Engineer Toolkit',
    type: 'utility',
    rarity: 'common',
    statBonuses: { INT: 2 },
    description: 'Tools for repairs and modifications'
  },
  scanner: {
    id: 'scanner',
    name: 'Bio Scanner',
    type: 'utility',
    rarity: 'uncommon',
    statBonuses: { INT: 1, WIS: 1 },
    description: 'Scans alien lifeforms for weaknesses'
  },
  shield_generator: {
    id: 'shield_generator',
    name: 'Shield Generator',
    type: 'utility',
    rarity: 'rare',
    statBonuses: { CON: 1 },
    description: 'Generates protective energy shield'
  },
  cloaking_device: {
    id: 'cloaking_device',
    name: 'Cloaking Device',
    type: 'utility',
    rarity: 'rare',
    statBonuses: { DEX: 2 },
    description: 'Makes you invisible to aliens'
  },
  communicator: {
    id: 'communicator',
    name: 'Diplomatic Communicator',
    type: 'utility',
    rarity: 'uncommon',
    statBonuses: { CHA: 2 },
    description: 'Helps negotiate with aliens'
  }
};

// Skills
export const SKILLS = {
  navigation: {
    id: 'navigation',
    name: 'Navigation',
    stat: 'DEX',
    description: 'Improves movement and spaceport usage'
  },
  combat: {
    id: 'combat',
    name: 'Combat',
    stat: 'STR',
    description: 'Increases damage in alien encounters'
  },
  evasion: {
    id: 'evasion',
    name: 'Evasion',
    stat: 'DEX',
    description: 'Chance to avoid alien attacks'
  },
  repair: {
    id: 'repair',
    name: 'Repair',
    stat: 'INT',
    description: 'Fix equipment and gain bonuses'
  },
  hacking: {
    id: 'hacking',
    name: 'Hacking',
    stat: 'INT',
    description: 'Override systems and gain advantages'
  },
  persuasion: {
    id: 'persuasion',
    name: 'Persuasion',
    stat: 'CHA',
    description: 'Convince aliens to let you pass'
  },
  diplomacy: {
    id: 'diplomacy',
    name: 'Diplomacy',
    stat: 'CHA',
    description: 'Negotiate peaceful solutions'
  },
  stealth: {
    id: 'stealth',
    name: 'Stealth',
    stat: 'DEX',
    description: 'Sneak past aliens undetected'
  },
  lockpicking: {
    id: 'lockpicking',
    name: 'Lockpicking',
    stat: 'DEX',
    description: 'Open locked spaceports'
  },
  research: {
    id: 'research',
    name: 'Research',
    stat: 'INT',
    description: 'Learn alien weaknesses'
  },
  analysis: {
    id: 'analysis',
    name: 'Analysis',
    stat: 'WIS',
    description: 'Identify optimal strategies'
  },
  intimidation: {
    id: 'intimidation',
    name: 'Intimidation',
    stat: 'STR',
    description: 'Scare aliens away'
  }
};

// Experience and Leveling
const XP_PER_LEVEL = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];

export function useRPGSystem() {
  const [characters, setCharacters] = useState({}); // playerId -> character data
  const [combatState, setCombatState] = useState(null); // Current combat encounter
  const alienAttackRef = useRef(null); // Ref to store alienAttack function to avoid circular dependency
  const addXPRef = useRef(null); // Ref to store addXP function
  const updateCharacterRef = useRef(null); // Ref to store updateCharacter function

  // Initialize character for a player
  const createCharacter = useCallback((playerId, className, raceName, playerName) => {
    // Prevent duplicate character creation
    if (characters[playerId]) {
      console.warn(`Character for player ${playerId} already exists, skipping creation`);
      return characters[playerId];
    }

    const charClass = CHARACTER_CLASSES[className] || CHARACTER_CLASSES.pilot;
    const race = CHARACTER_RACES[raceName] || CHARACTER_RACES.human;

    // Base stats (3d6 each, but we'll use point buy: 27 points)
    const baseStats = {
      STR: 8,
      DEX: 8,
      INT: 8,
      CON: 8,
      WIS: 8,
      CHA: 8
    };

    // Apply class bonuses
    Object.keys(charClass.statBonuses).forEach(stat => {
      baseStats[stat] += charClass.statBonuses[stat];
    });

    // Apply race bonuses
    Object.keys(race.statBonuses).forEach(stat => {
      baseStats[stat] += race.statBonuses[stat];
    });

    const character = {
      id: playerId,
      name: playerName,
      class: charClass,
      race: race,
      stats: baseStats,
      level: 1,
      xp: 0,
      hp: 10 + baseStats.CON,
      maxHp: 10 + baseStats.CON,
      skills: [...charClass.startingSkills],
      equipment: charClass.startingEquipment.map(eqId => EQUIPMENT[eqId]),
      inventory: [],
      coins: 0,
      kills: 0,
      spaceportsUsed: 0
    };

    // Apply equipment bonuses
    character.equipment.forEach(eq => {
      Object.keys(eq.statBonuses || {}).forEach(stat => {
        character.stats[stat] += eq.statBonuses[stat];
      });
    });

    setCharacters(prev => ({ ...prev, [playerId]: character }));
    return character;
  }, [characters]);

  // Roll dice (1d6, 2d6, etc.)
  const rollDice = useCallback((dice) => {
    const [count, sides] = dice.split('d').map(Number);
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  }, []);

  // Calculate modifier from stat (D&D style: (stat - 10) / 2)
  const getStatModifier = useCallback((stat) => {
    return Math.floor((stat - 10) / 2);
  }, []);

  // Skill check
  const skillCheck = useCallback((playerId, skillId, difficulty = 10) => {
    const character = characters[playerId];
    if (!character) return { success: false, roll: 0, total: 0 };

    const skill = SKILLS[skillId];
    if (!skill) return { success: false, roll: 0, total: 0 };

    const statMod = getStatModifier(character.stats[skill.stat]);
    const skillBonus = character.skills.includes(skillId) ? character.level : 0;
    const roll = rollDice('1d20');
    const total = roll + statMod + skillBonus;

    return {
      success: total >= difficulty,
      roll,
      total,
      statMod,
      skillBonus
    };
  }, [characters, getStatModifier, rollDice]);

  // Alien names and descriptions for narrative
  const getAlienNarrative = useCallback((level, position) => {
    const narratives = [
      { name: 'Scout Drone', desc: 'A small automated probe scanning the area', threat: 'low' },
      { name: 'Xenomorph Larva', desc: 'A young alien creature, still learning to hunt', threat: 'low' },
      { name: 'Void Crawler', desc: 'A shadowy creature that moves between dimensions', threat: 'medium' },
      { name: 'Plasma Beast', desc: 'A massive creature wreathed in energy', threat: 'medium' },
      { name: 'Ancient Guardian', desc: 'An ancient alien protector of this sector', threat: 'high' },
      { name: 'Cosmic Horror', desc: 'A terrifying entity from beyond the stars', threat: 'high' }
    ];
    
    const index = Math.min(level - 1, narratives.length - 1);
    const narrative = narratives[index] || narratives[narratives.length - 1];
    
    return {
      ...narrative,
      level,
      position,
      intro: `A ${narrative.name} blocks your path! ${narrative.desc}.`
    };
  }, []);

  // Combat encounter
  const initiateCombat = useCallback((playerId, alienPosition) => {
    const character = characters[playerId];
    if (!character) return null;

    // Alien stats based on position (harder aliens later)
    const alienLevel = Math.floor(alienPosition / 20) + 1;
    const alienHp = 5 + alienLevel * 2;
    const alienDamage = '1d4';
    const alienAC = 10 + alienLevel;
    const narrative = getAlienNarrative(alienLevel, alienPosition);

    setCombatState({
      playerId,
      alienPosition,
      alienHp,
      alienMaxHp: alienHp,
      alienLevel,
      alienAC,
      alienDamage,
      playerHp: character.hp,
      playerMaxHp: character.maxHp,
      turn: 'player', // 'player' or 'alien'
      alienName: narrative.name,
      alienDesc: narrative.desc
    });

    return {
      alienLevel,
      alienHp,
      alienAC,
      alienDamage,
      narrative
    };
  }, [characters, getAlienNarrative]);

  // Player attack in combat
  const playerAttack = useCallback((playerId, useSkill = null) => {
    const character = characters[playerId];
    if (!character || !combatState || combatState.playerId !== playerId) {
      return { hit: false, damage: 0, message: '' };
    }

    let attackRoll = rollDice('1d20');
    let damage = 0;
    let message = '';

    // Check if using a skill
    if (useSkill === 'combat') {
      const check = skillCheck(playerId, 'combat', combatState.alienAC);
      attackRoll = check.roll;
      if (check.success) {
        // Weapon damage
        const weapon = character.equipment.find(eq => eq.type === 'weapon') || EQUIPMENT.laser_pistol;
        damage = rollDice(weapon.damage || '1d6');
        damage += getStatModifier(character.stats.STR);
        const crit = attackRoll === 20;
        if (crit) {
          damage = Math.floor(damage * 1.5);
          message = `💥 CRITICAL HIT! ${character.name} strikes the alien for ${damage} damage!`;
        } else {
          message = `⚔️ ${character.name} strikes the alien for ${damage} damage!`;
        }
      } else {
        message = `❌ ${character.name} misses the alien!`;
      }
    } else if (useSkill === 'persuasion' || useSkill === 'diplomacy') {
      // Try to talk your way out
      const check = skillCheck(playerId, useSkill, 15);
      if (check.success) {
        message = `💬 ${character.name} uses ${useSkill === 'persuasion' ? 'persuasion' : 'diplomacy'}! The alien seems to understand and steps aside.`;
        setCombatState(null);
        return { hit: true, damage: 0, avoided: true, message };
      } else {
        message = `💬 ${character.name} tries to communicate, but the alien doesn't understand. Combat continues!`;
      }
    } else if (useSkill === 'stealth') {
      // Try to sneak past
      const check = skillCheck(playerId, 'stealth', 12);
      if (check.success) {
        message = `👤 ${character.name} uses stealth! You slip past the alien unnoticed.`;
        setCombatState(null);
        return { hit: true, damage: 0, avoided: true, message };
      } else {
        message = `👤 ${character.name} tries to sneak past, but the alien spots you! Combat begins!`;
      }
    } else {
      // Normal attack
      const strMod = getStatModifier(character.stats.STR);
      const attackTotal = attackRoll + strMod;
      
      if (attackTotal >= combatState.alienAC) {
        const weapon = character.equipment.find(eq => eq.type === 'weapon') || EQUIPMENT.laser_pistol;
        damage = rollDice(weapon.damage || '1d6');
        damage += strMod;
        message = `${character.name} hits the alien for ${damage} damage!`;
      } else {
        message = `${character.name} misses the alien!`;
      }
    }

    if (damage > 0) {
      const newAlienHp = Math.max(0, combatState.alienHp - damage);
      setCombatState(prev => ({ ...prev, alienHp: newAlienHp }));

      if (newAlienHp <= 0) {
        // Alien defeated
        const xpGained = combatState.alienLevel * 25;
        if (addXPRef.current) {
          addXPRef.current(playerId, xpGained);
        }
        if (updateCharacterRef.current) {
          updateCharacterRef.current(playerId, { kills: (character.kills || 0) + 1 });
        }
        message += ` The alien is defeated! +${xpGained} XP`;
        setCombatState(null);
        return { hit: true, damage, defeated: true, xpGained, message };
      }
    }

    // Alien's turn - set turn to alien so UI can show it
    setCombatState(prev => ({ ...prev, turn: 'alien' }));
    
    // Alien attacks after a delay - use ref to avoid circular dependency
    setTimeout(() => {
      if (alienAttackRef.current) {
        alienAttackRef.current(playerId);
      }
    }, 1000);

    return { hit: damage > 0, damage, message };
  }, [characters, combatState, skillCheck, getStatModifier, rollDice]);

  // Alien attack
  const alienAttack = useCallback((playerId) => {
    const character = characters[playerId];
    if (!character || !combatState || combatState.playerId !== playerId) {
      return { hit: false, damage: 0 };
    }

    // Check evasion
    const evasionCheck = skillCheck(playerId, 'evasion', 12);
    if (evasionCheck.success) {
      setCombatState(prev => ({ ...prev, turn: 'player' }));
      return { hit: false, damage: 0, evaded: true, message: 'You evaded the alien attack!' };
    }

    const alienRoll = rollDice('1d20');
    const conMod = getStatModifier(character.stats.CON);
    const armor = character.equipment.find(eq => eq.type === 'armor')?.armor || 0;
    const ac = 10 + conMod + armor;

    if (alienRoll >= ac) {
      const damage = rollDice(combatState.alienDamage);
      const newHp = Math.max(0, character.hp - damage);
      if (updateCharacterRef.current) {
        updateCharacterRef.current(playerId, { hp: newHp });
      }

      if (newHp <= 0) {
        // Player knocked out - clear combat state and return to checkpoint
        setCombatState(null);
        // Make sure character HP is set to 0
        if (updateCharacterRef.current) {
          updateCharacterRef.current(playerId, { hp: 0 });
        }
        return { hit: true, damage, knockedOut: true, message: `Alien hits for ${damage} damage! You are knocked out!` };
      }

      // Update combat state with new HP and set turn back to player
      setCombatState(prev => ({ 
        ...prev, 
        playerHp: newHp, 
        turn: 'player' 
      }));
      return { hit: true, damage, message: `Alien hits you for ${damage} damage! HP: ${newHp}/${character.maxHp}` };
    } else {
      setCombatState(prev => ({ ...prev, turn: 'player' }));
      return { hit: false, damage: 0, message: 'Alien misses!' };
    }
  }, [characters, combatState, skillCheck, getStatModifier, rollDice]);

  // Add experience
  const addXP = useCallback((playerId, amount) => {
    const character = characters[playerId];
    if (!character) return;

    const newXP = character.xp + amount;
    let newLevel = character.level;
    let leveledUp = false;

    // Check for level up
    while (newLevel < XP_PER_LEVEL.length - 1 && newXP >= XP_PER_LEVEL[newLevel + 1]) {
      newLevel++;
      leveledUp = true;
    }

    if (updateCharacterRef.current) {
      updateCharacterRef.current(playerId, {
        xp: newXP,
        level: newLevel,
        maxHp: 10 + character.stats.CON + (newLevel - 1) * 2,
        hp: leveledUp ? (10 + character.stats.CON + (newLevel - 1) * 2) : character.hp
      });
    }

    return { leveledUp, newLevel, newXP };
  }, [characters]);

  // Update character
  const updateCharacter = useCallback((playerId, updates) => {
    setCharacters(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], ...updates }
    }));
  }, []);

  // Store functions in refs so they can be called without circular dependencies
  useEffect(() => {
    alienAttackRef.current = alienAttack;
    addXPRef.current = addXP;
    updateCharacterRef.current = updateCharacter;
  }, [alienAttack, addXP, updateCharacter]);

  // Flee from combat
  const fleeCombat = useCallback((playerId) => {
    if (!combatState || combatState.playerId !== playerId) {
      return { success: false };
    }
    
    // Clear combat state
    setCombatState(null);
    return { success: true, message: 'You flee from combat!' };
  }, [combatState]);

  // Get character
  const getCharacter = useCallback((playerId) => {
    return characters[playerId] || null;
  }, [characters]);

  // Level up benefits
  const getLevelUpBenefits = useCallback((level) => {
    return {
      hpIncrease: 2,
      statPoint: level % 4 === 0 ? 1 : 0, // Stat point every 4 levels
      skillPoint: 1
    };
  }, []);

  return {
    characters,
    combatState,
    createCharacter,
    getCharacter,
    updateCharacter,
    skillCheck,
    initiateCombat,
    playerAttack,
    alienAttack,
    fleeCombat,
    addXP,
    rollDice,
    getStatModifier,
    getLevelUpBenefits,
    CHARACTER_CLASSES,
    CHARACTER_RACES,
    EQUIPMENT,
    SKILLS
  };
}

