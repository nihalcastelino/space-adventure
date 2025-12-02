import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameSounds } from './useGameSounds';
import { useDifficulty } from './useDifficulty';
import { useJeopardyMechanics } from './useJeopardyMechanics';
import { usePlayerAssistance } from './usePlayerAssistance';
import { useRoguePlayer } from './useRoguePlayer';
import { useGameVariants, GAME_VARIANTS } from './useGameVariants';
import { SHIP_ABILITIES } from '../lib/abilities';
import { useAchievements } from './useAchievements';
import { useRocketAnimation } from './useRocketAnimation';
import { DEFAULT_BOARD_SIZE, SPACEPORTS, DEFAULT_ALIENS, DEFAULT_CHECKPOINTS } from '../utils/constants';
import { CAMPAIGN_LEVELS } from '../data/campaignLevels';

export function useGameLogic(initialDifficulty = 'normal', gameVariant = 'classic', rpgMode = false, rpgSystem = null, campaignLevelId = null) {
  const { unlockAchievement } = useAchievements();
  const variant = GAME_VARIANTS[gameVariant] || GAME_VARIANTS.classic;

  // Campaign Level Config
  const currentLevel = campaignLevelId ? CAMPAIGN_LEVELS.find(l => l.id === campaignLevelId) : null;
  const levelMechanics = currentLevel?.mechanics || [];

  const BOARD_SIZE = currentLevel?.boardSize || variant.boardSize || DEFAULT_BOARD_SIZE;
  const isReverseRace = variant.specialRules?.reverseMovement || false;
  const initialPosition = isReverseRace ? BOARD_SIZE : 0;
  const initialCheckpoint = isReverseRace ? BOARD_SIZE : 0;
  const { playSound } = useGameSounds();

  // Difficulty & Hazards
  const {
    difficulty,
    aliens: ALIENS,
    checkpoints: CHECKPOINTS,
    processTurnEvents,
    resetDifficulty,
  } = useDifficulty(currentLevel?.difficulty || initialDifficulty);

  const jeopardy = useJeopardyMechanics(difficulty, true);
  const assistance = usePlayerAssistance();
  const rogue = useRoguePlayer(true);
  const gameVariants = useGameVariants(gameVariant);
  const { animatedPositions, animatingPlayer, encounterType, animateMovement } = useRocketAnimation();

  // Gems & Tactics State
  const [gems, setGems] = useState({}); // { position: 'gem_type' }
  const [activeTactics, setActiveTactics] = useState({}); // { playerId: 'tactic_effect' }

  const getInitialAbilityState = (icon) => {
    const abilityDef = SHIP_ABILITIES[icon] || {};
    return {
      used: false,
      rerolls: abilityDef.id === 'reroll' ? 1 : 0,
      shields: abilityDef.id === 'shield' ? 1 : 0,
    };
  };

  const getInitialPlayerState = (id, color, name, corner, icon, isAI = false) => ({
    id,
    position: initialPosition,
    lastCheckpoint: initialCheckpoint,
    color,
    name,
    corner,
    icon,
    isAI,
    ability: getInitialAbilityState(icon),
    spaceportUses: 0,
    alienEncounters: 0,
    jailVisits: 0,
    gemsCollected: 0,
    itemsCollected: 0, // For campaign levels
  });

  const playerColors = ['text-yellow-300', 'text-blue-300', 'text-green-300', 'text-pink-300'];
  const playerCorners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  const [players, setPlayers] = useState([
    getInitialPlayerState(1, playerColors[0], 'Player 1', playerCorners[0], '🚀'),
    getInitialPlayerState(2, 'text-red-400', 'AI Rival', playerCorners[1], '👾', true) // Default AI opponent
  ]);

  const [numPlayers, setNumPlayers] = useState(2);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState("Player 1's turn! Press SPIN to start!");
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isPerfectLanding, setIsPerfectLanding] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  // Initialize Gems for Tactical Levels
  useEffect(() => {
    if (levelMechanics.includes('tactical_gems')) {
      const newGems = {};
      for (let i = 0; i < 5; i++) {
        const pos = Math.floor(Math.random() * (BOARD_SIZE - 10)) + 5;
        if (!SPACEPORTS[pos] && !ALIENS.includes(pos)) {
          newGems[pos] = Math.random() > 0.5 ? 'swap' : 'steal_turn';
        }
      }
      setGems(newGems);
    }
  }, [levelMechanics, BOARD_SIZE, ALIENS]);

  useEffect(() => {
    if (gameWon && winner) {
      unlockAchievement('FIRST_FLIGHT');
      if (isPerfectLanding) unlockAchievement('PERFECT_LANDING');
      if (winner.alienEncounters >= 3) unlockAchievement('ALIEN_SURVIVOR');

      switch (difficulty) {
        case 'hard': case 'extreme': case 'nightmare': case 'chaos':
          unlockAchievement('WINNER_HARD');
        case 'normal':
          unlockAchievement('WINNER_NORMAL');
        default:
          unlockAchievement('WINNER_EASY');
      }
    }
  }, [gameWon, winner, difficulty, isPerfectLanding, unlockAchievement]);


  const getLastCheckpoint = useCallback((position) => {
    for (let i = CHECKPOINTS.length - 1; i >= 0; i--) {
      if (CHECKPOINTS[i] <= position) {
        return CHECKPOINTS[i];
      }
    }
    return initialCheckpoint;
  }, [CHECKPOINTS, initialCheckpoint]);

  const movePlayer = useCallback(async (steps) => {
    if (gameWon || isRolling) return;

    setIsRolling(true);

    let currentPlayerId;
    let currentPlayerName;

    setPlayers(currentPlayers => {
      const player = currentPlayers[currentPlayerIndex];
      currentPlayerId = player.id;
      currentPlayerName = player.name;
      return currentPlayers;
    });

    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) return;

    // Apply Low Gravity Mechanic
    let effectiveSteps = steps;
    if (levelMechanics.includes('low_gravity')) {
      effectiveSteps += 1;
      setMessage("🌑 Low Gravity! +1 Jump!");
    }

    const fromPosition = currentPlayer.position;
    let targetPosition = fromPosition + effectiveSteps;

    // Check for spaceport and alien encounters
    const hasSpaceport = SPACEPORTS[targetPosition] !== undefined;
    const hasAlien = ALIENS.includes(targetPosition);
    const hasGem = gems[targetPosition];

    let finalPosition = targetPosition;
    let alienTarget = fromPosition;

    // Handle spaceport teleportation
    if (hasSpaceport) {
      finalPosition = SPACEPORTS[targetPosition];
      setMessage(`🚀 ${currentPlayer.name} uses spaceport! Teleports to ${finalPosition}!`);
    }

    // Handle alien encounters
    if (hasAlien) {
      alienTarget = getLastCheckpoint(fromPosition);
      finalPosition = alienTarget;
      setMessage(`👾 ${currentPlayer.name} encountered an alien! Sent back to checkpoint ${alienTarget}!`);
    }

    // Handle Gems (Tactics)
    let tacticEffect = null;
    if (hasGem) {
      const gemType = gems[targetPosition];
      tacticEffect = gemType;
      setMessage(`💎 ${currentPlayer.name} found a ${gemType === 'swap' ? 'Swap' : 'Steal'} Gem!`);

      // Remove gem
      setGems(prev => {
        const newGems = { ...prev };
        delete newGems[targetPosition];
        return newGems;
      });
    }

    // Clamp final position to board size
    finalPosition = Math.min(finalPosition, BOARD_SIZE);

    // Animate the movement
    await animateMovement(
      currentPlayer.id,
      fromPosition,
      targetPosition,
      hasSpaceport,
      hasAlien,
      alienTarget
    );

    // Add a small delay after animation completes
    await new Promise(resolve => setTimeout(resolve, 300));

    // Update checkpoint
    const newCheckpoint = getLastCheckpoint(finalPosition);

    setPlayers(prevPlayers => {
      let newPlayers = prevPlayers.map((p, i) => {
        if (i === currentPlayerIndex) {
          return {
            ...p,
            position: finalPosition,
            lastCheckpoint: Math.max(p.lastCheckpoint, newCheckpoint),
            alienEncounters: hasAlien ? p.alienEncounters + 1 : p.alienEncounters,
            spaceportUses: hasSpaceport ? p.spaceportUses + 1 : p.spaceportUses,
            gemsCollected: hasGem ? (p.gemsCollected || 0) + 1 : (p.gemsCollected || 0)
          };
        }
        return p;
      });

      // Apply Tactic Effects
      if (tacticEffect === 'swap') {
        // Swap with leading player
        const leader = [...newPlayers].sort((a, b) => b.position - a.position)[0];
        if (leader.id !== currentPlayerId) {
          newPlayers = newPlayers.map(p => {
            if (p.id === currentPlayerId) return { ...p, position: leader.position };
            if (p.id === leader.id) return { ...p, position: finalPosition };
            return p;
          });
          setMessage(`🔄 Swapped positions with ${leader.name}!`);
        }
      }

      return newPlayers;
    });

    // Check win condition
    const winConditionMet = finalPosition >= BOARD_SIZE;

    if (winConditionMet) {
      setGameWon(true);
      const winningPlayer = {
        ...currentPlayer,
        position: finalPosition
      };
      setWinner(winningPlayer);
      setIsPerfectLanding(finalPosition === BOARD_SIZE);
      setMessage(`🎉 ${currentPlayer.name} wins!`);
      playSound('win');
    } else {
      // Switch to next player with a delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setPlayers(currentPlayers => {
        // Handle "Steal Turn" tactic
        let nextIndex;
        if (tacticEffect === 'steal_turn') {
          nextIndex = currentPlayerIndex; // Play again
          setMessage(`⚡ ${currentPlayerName} steals another turn!`);
        } else {
          nextIndex = (currentPlayerIndex + 1) % currentPlayers.length;
          setMessage(`${currentPlayers[nextIndex].name}'s turn!`);
        }

        setCurrentPlayerIndex(nextIndex);
        return currentPlayers;
      });

      setTurnCount(prev => prev + 1);
    }

    setIsRolling(false);
  }, [players, currentPlayerIndex, gameWon, isRolling, BOARD_SIZE, ALIENS, CHECKPOINTS, getLastCheckpoint, animateMovement, playSound, gems, levelMechanics]);

  const rollDice = useCallback(() => {
    if (isRolling || gameWon) return;

    setIsRolling(true);
    // Improved RNG: Use crypto.getRandomValues if available for better randomness
    let roll;
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      roll = (array[0] % 6) + 1;
    } else {
      roll = Math.floor(Math.random() * 6) + 1;
    }

    setDiceValue(roll);
    playSound('dice');

    // Show dice result for a moment before moving
    setTimeout(() => {
      movePlayer(roll);
    }, 800);
  }, [isRolling, gameWon, movePlayer, playSound]);

  const resetGame = useCallback(() => {
    setPlayers([
      getInitialPlayerState(1, playerColors[0], 'Player 1', playerCorners[0], '🚀'),
      getInitialPlayerState(2, 'text-red-400', 'AI Rival', playerCorners[1], '👾', true)
    ]);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setIsRolling(false);
    setMessage("Player 1's turn! Press SPIN to start!");
    setGameWon(false);
    setWinner(null);
    setIsPerfectLanding(false);
    setTurnCount(0);
    playSound('click');

    // Reset Gems
    if (levelMechanics.includes('tactical_gems')) {
      const newGems = {};
      for (let i = 0; i < 5; i++) {
        const pos = Math.floor(Math.random() * (BOARD_SIZE - 10)) + 5;
        if (!SPACEPORTS[pos] && !ALIENS.includes(pos)) {
          newGems[pos] = Math.random() > 0.5 ? 'swap' : 'steal_turn';
        }
      }
      setGems(newGems);
    }
  }, [playSound, levelMechanics, BOARD_SIZE, SPACEPORTS, ALIENS]);

  const changePlayerIcon = useCallback((playerId, iconData) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, icon: iconData.icon || iconData } : p
    ));
  }, []);

  const addPlayer = useCallback(() => {
    if (numPlayers >= 4) return;
    setPlayers(prev => {
      const newId = prev.length + 1;
      const newPlayer = getInitialPlayerState(
        newId,
        playerColors[newId - 1],
        `Player ${newId}`,
        playerCorners[newId - 1],
        '🚀',
        false // New players are not AI by default
      );
      return [...prev, newPlayer];
    });
    setNumPlayers(prev => prev + 1);
  }, [numPlayers]);

  const removePlayer = useCallback(() => {
    if (numPlayers <= 2) return;
    setPlayers(prev => prev.slice(0, -1));
    setNumPlayers(prev => prev - 1);
  }, [numPlayers]);

  const changePlayerName = useCallback((playerId, newName) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, name: newName } : p
    ));
  }, []);

  const jailStates = useCallback((playerId) => {
    return { inJail: false, turnsRemaining: 0 };
  }, []);

  const payBail = useCallback((playerId) => {
    return { success: false, cost: 50 };
  }, []);

  return {
    players,
    numPlayers,
    currentPlayerIndex,
    diceValue,
    isRolling,
    message,
    gameWon,
    winner,
    animatingPlayer,
    animationType: encounterType,
    alienBlink: {},
    animatedPositions,
    aliens: ALIENS,
    checkpoints: CHECKPOINTS,
    difficulty,
    changeDifficulty: resetDifficulty,
    rollDice,
    resetGame,
    changePlayerIcon,
    addPlayer,
    removePlayer,
    changePlayerName,
    hazards: jeopardy.hazards || null,
    jailStates,
    payBail,
    rogueState: rogue.state || null,
    gameStartTime: null,
    turnCount,
    boardSize: BOARD_SIZE,
    gems, // Export gems for rendering
    currentLevel
  };
}