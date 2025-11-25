import { useState, useEffect, useCallback } from 'react';
import { useGameSounds } from './useGameSounds';
import { useDifficulty } from './useDifficulty';
import { useJeopardyMechanics } from './useJeopardyMechanics';
import { usePlayerAssistance } from './usePlayerAssistance';
import { useRoguePlayer } from './useRoguePlayer';
import { useGameVariants, GAME_VARIANTS } from './useGameVariants';
import { SHIP_ABILITIES } from '../lib/abilities';
import { useAchievements } from './useAchievements';

const DEFAULT_BOARD_SIZE = 100;
const SPACEPORTS = {
  4: 18, 9: 31, 15: 42, 21: 56, 28: 64,
  36: 70, 51: 77, 62: 85, 71: 91, 80: 96
};

export function useGameLogic(initialDifficulty = 'normal', gameVariant = 'classic', rpgMode = false, rpgSystem = null) {
  const { unlockAchievement } = useAchievements();
  const variant = GAME_VARIANTS[gameVariant] || GAME_VARIANTS.classic;
  const BOARD_SIZE = variant.boardSize || DEFAULT_BOARD_SIZE;
  const isReverseRace = variant.specialRules?.reverseMovement || false;
  const initialPosition = isReverseRace ? BOARD_SIZE : 0;
  const initialCheckpoint = isReverseRace ? BOARD_SIZE : 0;
  const { playSound } = useGameSounds();
  const {
    difficulty,
    aliens: ALIENS,
    checkpoints: CHECKPOINTS,
    processTurnEvents,
    resetDifficulty,
  } = useDifficulty(initialDifficulty);
  const jeopardy = useJeopardyMechanics(difficulty, true);
  const assistance = usePlayerAssistance();
  const rogue = useRoguePlayer(true);
  const gameVariants = useGameVariants(gameVariant);

  const getInitialAbilityState = (icon) => {
    const abilityDef = SHIP_ABILITIES[icon] || {};
    return {
      used: false,
      rerolls: abilityDef.id === 'reroll' ? 1 : 0,
      shields: abilityDef.id === 'shield' ? 1 : 0,
    };
  };

  const getInitialPlayerState = (id, color, name, corner, icon) => ({
    id,
    position: initialPosition,
    lastCheckpoint: initialCheckpoint,
    color,
    name,
    corner,
    icon,
    ability: getInitialAbilityState(icon),
    spaceportUses: 0,
    alienEncounters: 0,
    jailVisits: 0,
  });

  const playerColors = ['text-yellow-300', 'text-blue-300', 'text-green-300', 'text-pink-300'];
  const playerCorners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  const [players, setPlayers] = useState([
    getInitialPlayerState(1, playerColors[0], 'Player 1', playerCorners[0], '🚀'),
    getInitialPlayerState(2, playerColors[1], 'Player 2', playerCorners[1], '🚀')
  ]);
  
  const [numPlayers, setNumPlayers] = useState(2);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState("Player 1's turn! Press SPIN to start!");
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isPerfectLanding, setIsPerfectLanding] = useState(false);

  // ... other state ...
  
  useEffect(() => {
    if (gameWon && winner) {
      unlockAchievement('FIRST_FLIGHT');
      if (isPerfectLanding) unlockAchievement('PERFECT_LANDING');
      if (winner.alienEncounters >= 3) unlockAchievement('ALIEN_SURVIVOR');
      
      switch(difficulty) {
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
    const currentPlayer = players[currentPlayerIndex];
    let newPosition = currentPlayer.position + steps;
    
    // Handle spaceport teleportation
    if (SPACEPORTS[newPosition]) {
      const destination = SPACEPORTS[newPosition];
      newPosition = destination;
      setMessage(`🚀 ${currentPlayer.name} uses spaceport! Teleports to ${destination}!`);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Handle alien encounters
    if (ALIENS.includes(newPosition)) {
      const lastCheckpoint = getLastCheckpoint(currentPlayer.position);
      newPosition = lastCheckpoint;
      setMessage(`👾 ${currentPlayer.name} encountered an alien! Sent back to checkpoint ${lastCheckpoint}!`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Update checkpoint
    const newCheckpoint = getLastCheckpoint(newPosition);
    const updatedPlayers = players.map((p, i) => {
      if (i === currentPlayerIndex) {
        return {
          ...p,
          position: Math.min(newPosition, BOARD_SIZE),
          lastCheckpoint: Math.max(p.lastCheckpoint, newCheckpoint),
          alienEncounters: ALIENS.includes(newPosition) ? p.alienEncounters + 1 : p.alienEncounters,
          spaceportUses: SPACEPORTS[newPosition] ? p.spaceportUses + 1 : p.spaceportUses
        };
      }
      return p;
    });
    
    setPlayers(updatedPlayers);
    
    // Check win condition
    const finalPosition = Math.min(newPosition, BOARD_SIZE);
    if (finalPosition >= BOARD_SIZE) {
      setGameWon(true);
      setWinner(updatedPlayers[currentPlayerIndex]);
      setIsPerfectLanding(finalPosition === BOARD_SIZE);
      setMessage(`🎉 ${currentPlayer.name} wins!`);
    } else {
      // Switch to next player
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextIndex);
      setMessage(`${updatedPlayers[nextIndex].name}'s turn!`);
    }
    
    setIsRolling(false);
  }, [players, currentPlayerIndex, gameWon, isRolling, BOARD_SIZE, ALIENS, CHECKPOINTS, getLastCheckpoint]);

  const rollDice = useCallback(() => {
    if (isRolling || gameWon) return;
    
    setIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    playSound('dice');
    
    setTimeout(() => {
      movePlayer(roll);
    }, 500);
  }, [isRolling, gameWon, movePlayer, playSound]);

  const resetGame = useCallback(() => {
    setPlayers([
      getInitialPlayerState(1, playerColors[0], 'Player 1', playerCorners[0], '🚀'),
      getInitialPlayerState(2, playerColors[1], 'Player 2', playerCorners[1], '🚀')
    ]);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setIsRolling(false);
    setMessage("Player 1's turn! Press SPIN to start!");
    setGameWon(false);
    setWinner(null);
    setIsPerfectLanding(false);
    playSound('click');
  }, [playSound]);

  const changePlayerIcon = useCallback((playerId, iconData) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, icon: iconData.icon || iconData } : p
    ));
  }, []);

  const addPlayer = useCallback(() => {
    if (numPlayers >= 4) return;
    const newId = players.length + 1;
    const newPlayer = getInitialPlayerState(
      newId,
      playerColors[newId - 1],
      `Player ${newId}`,
      playerCorners[newId - 1],
      '🚀'
    );
    setPlayers(prev => [...prev, newPlayer]);
    setNumPlayers(prev => prev + 1);
  }, [players.length, numPlayers]);

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
    // Basic jail state - can be enhanced later
    return { inJail: false, turnsRemaining: 0 };
  }, []);

  const payBail = useCallback((playerId) => {
    // Basic bail function - can be enhanced later
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
    animatingPlayer: null,
    animationType: null,
    alienBlink: {},
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
    turnCount: 0,
    boardSize: BOARD_SIZE
  };
}