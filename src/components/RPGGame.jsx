import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Zap, Shield, Target, X } from 'lucide-react';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import ParticleEffects from './ParticleEffects';
import CharacterCreation from './CharacterCreation';
import CharacterStatsPanel from './CharacterStatsPanel';
import CombatOverlay from './CombatOverlay';
import SpaceJail from './SpaceJail';
import GameOverModal from './GameOverModal';
import { useRPGSystem } from '../hooks/useRPGSystem';
import { useGameSounds } from '../hooks/useGameSounds';
import { useDifficulty } from '../hooks/useDifficulty';
import { useJeopardyMechanics } from '../hooks/useJeopardyMechanics';
import { useGameVariants, GAME_VARIANTS } from '../hooks/useGameVariants';
import { useCurrency } from '../hooks/useCurrency';
import { getBackgroundImage } from '../utils/backgrounds';

const DEFAULT_BOARD_SIZE = 100;
const SPACEPORTS = {
  4: 18, 9: 31, 15: 42, 21: 56, 28: 64,
  36: 70, 51: 77, 62: 85, 71: 91, 80: 96
};

// Tactical squares - strategic positions where players can perform actions on AI
const TACTICAL_SQUARES = [7, 17, 27, 37, 47, 57, 67, 77, 87, 97];

// Tactical actions based on dice roll (1-6)
const TACTICAL_ACTIONS = {
  1: { name: 'Push Back', value: 1, description: 'Push AI back 1 space', icon: '⬅️' },
  2: { name: 'Push Back', value: 2, description: 'Push AI back 2 spaces', icon: '⬅️' },
  3: { name: 'Push Back', value: 3, description: 'Push AI back 3 spaces', icon: '⬅️' },
  4: { name: 'Skip Turn', value: 0, description: 'AI skips next turn', icon: '⏸️' },
  5: { name: 'Push Back', value: 5, description: 'Push AI back 5 spaces', icon: '⬅️' },
  6: { name: 'Critical Strike', value: 6, description: 'Push AI back 6 spaces OR deal damage', icon: '💥' }
};

/**
 * Tabletop RPG Game Component with AI Opponent
 * 
 * Single-player tabletop RPG where you:
 * - Create ONE character (class & race)
 * - Race against an AI opponent
 * - Land on tactical squares to perform actions
 * - Encounter aliens (combat encounters)
 * - Level up and progress
 * - Reach the end while surviving
 */
export default function RPGGame({ onBack, initialDifficulty = 'normal', gameVariant = 'classic' }) {
  const { playSound } = useGameSounds();
  const [showCharacterCreation, setShowCharacterCreation] = useState(true);
  const [characterCreated, setCharacterCreated] = useState(false);

  const rpg = useRPGSystem();

  // Initialize game variants system
  const gameVariants = useGameVariants(gameVariant);
  
  // Destructure stable functions to avoid infinite loops
  // Note: variantState is NOT destructured to avoid infinite re-renders
  const {
    checkWinCondition,
    trackCheckpointVisit,
    trackAlienHit,
    trackSpaceportUse,
    trackHillPosition,
    incrementTurn
  } = gameVariants;

  // Get board configuration
  const variant = GAME_VARIANTS[gameVariant] || GAME_VARIANTS.classic;
  const BOARD_SIZE = variant.boardSize || DEFAULT_BOARD_SIZE;

  // Difficulty system
  const {
    difficulty,
    aliens: ALIENS,
    checkpoints: CHECKPOINTS
  } = useDifficulty(initialDifficulty);

  // Jeopardy mechanics (jail, hazards)
  const jeopardy = useJeopardyMechanics(difficulty, true);
  const currency = useCurrency();

  // Single player state
  const PLAYER_ID = 1;
  const [playerPosition, setPlayerPosition] = useState(0);
  const [lastCheckpoint, setLastCheckpoint] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState("Create your character to begin!");
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [animatingPlayer, setAnimatingPlayer] = useState(null);
  const [animationType, setAnimationType] = useState(null);
  const [alienBlink, setAlienBlink] = useState({});

  // AI Opponent state
  const AI_ID = 2;
  const [aiPosition, setAiPosition] = useState(0);
  const [aiLastCheckpoint, setAiLastCheckpoint] = useState(0);
  const [aiSkipTurn, setAiSkipTurn] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  
  // Tactical action state
  const [showTacticalAction, setShowTacticalAction] = useState(false);
  const [tacticalDiceRoll, setTacticalDiceRoll] = useState(null);
  const [pendingTacticalAction, setPendingTacticalAction] = useState(null);
  
  // Combat state
  const [combatMessage, setCombatMessage] = useState('');
  
  // Refs to avoid circular dependencies
  const movePlayerRef = useRef(null);
  
  // Alien blink animation
  useEffect(() => {
    const interval = setInterval(() => {
      const newBlink = {};
      ALIENS.forEach(pos => {
        newBlink[pos] = Math.random() > 0.5;
      });
      setAlienBlink(newBlink);
    }, 500);
    return () => clearInterval(interval);
  }, [ALIENS]);
  
  // Get character
  const character = rpg.getCharacter(PLAYER_ID);
  
  // Handle character creation completion
  const handleCharacterCreated = useCallback((characterData) => {
    if (characterCreated) {
      console.warn('Character already created, skipping');
      return;
    }
    
    rpg.createCharacter(
      PLAYER_ID,
      characterData.className,
      characterData.raceName,
      characterData.characterName || 'Adventurer'
    );
    
    setCharacterCreated(true);
    setShowCharacterCreation(false);
    setMessage(`${characterData.characterName || 'Adventurer'}'s turn! Roll the dice to explore!`);
    playSound('click');
  }, [characterCreated, rpg, playSound]);
  
  // AI opponent turn
  const takeAITurn = useCallback(async () => {
    // Don't take AI turn if game is already won or lost
    if (gameWon || gameLost) {
      setIsAITurn(false);
      setAiThinking(false);
      return;
    }
    
    if (aiSkipTurn) {
      setAiSkipTurn(false);
      setMessage('🤖 AI opponent skips turn!');
      setIsAITurn(false);
      return;
    }
    
    setAiThinking(true);
    setMessage('🤖 AI opponent is thinking...');
    
    // AI "thinks" for 1-2 seconds
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Check again if game ended during thinking
    if (gameWon || gameLost) {
      setIsAITurn(false);
      setAiThinking(false);
      return;
    }
    
    // AI rolls dice (slightly better average - 3-6 range)
    const aiRoll = Math.floor(Math.random() * 4) + 3; // 3-6
    
    setMessage(`🤖 AI opponent rolls ${aiRoll}!`);
    playSound('click');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Move AI
    const newAiPosition = Math.min(aiPosition + aiRoll, BOARD_SIZE);
    setAiPosition(newAiPosition);
    
    // Simple position-based win check for AI (fallback for classic mode)
    if (newAiPosition >= BOARD_SIZE) {
      setGameLost(true);
      setMessage('💀 AI opponent reached the end! You lose!');
      playSound('alien');
      setAiThinking(false);
      setIsAITurn(false);
      setAnimationType('victory');
      setTimeout(() => {
        setShowGameOverModal(true);
      }, 1500);
      return;
    }
    
    // Check AI win condition using variant-specific win condition
    const aiPlayersForCheck = [
      {
        id: PLAYER_ID,
        name: character?.name || 'Player',
        position: playerPosition,
        lastCheckpoint: lastCheckpoint,
        visitedCheckpoints: gameVariants.variantState.checkpointsVisited[PLAYER_ID] || [],
        aliensHit: gameVariants.variantState.aliensHit[PLAYER_ID] || 0,
        spaceportsUsed: gameVariants.variantState.spaceportsUsed[PLAYER_ID] || 0,
        eliminated: gameVariants.variantState.eliminations.includes(PLAYER_ID),
        turnsOnHill: gameVariants.variantState.hillPositions[PLAYER_ID] || 0
      },
      {
        id: AI_ID,
        name: 'AI Opponent',
        position: newAiPosition, // Use new position
        lastCheckpoint: aiLastCheckpoint,
        visitedCheckpoints: gameVariants.variantState.checkpointsVisited[AI_ID] || [],
        aliensHit: gameVariants.variantState.aliensHit[AI_ID] || 0,
        spaceportsUsed: gameVariants.variantState.spaceportsUsed[AI_ID] || 0,
        eliminated: gameVariants.variantState.eliminations.includes(AI_ID),
        turnsOnHill: gameVariants.variantState.hillPositions[AI_ID] || 0
      }
    ];

      const aiWinner = checkWinCondition(aiPlayersForCheck);
    if (aiWinner) {
      if (aiWinner.id === AI_ID) {
        setGameLost(true);
        setMessage('💀 AI opponent wins!');
        playSound('alien');
        setAiThinking(false);
        setIsAITurn(false);
        setAnimationType('victory');
        // Show game over modal after a short delay
        setTimeout(() => {
          setShowGameOverModal(true);
        }, 1500);
        return;
      } else {
        setGameWon(true);
        setMessage('🎉 You win!');
        playSound('victory');
        setAiThinking(false);
        setIsAITurn(false);
        setAnimationType('victory');
        // Show game over modal after a short delay
        setTimeout(() => {
          setShowGameOverModal(true);
        }, 1500);
        return;
      }
    }
    
    // Check AI checkpoint
    const aiCheckpoint = CHECKPOINTS.find(cp => cp === newAiPosition);
    if (aiCheckpoint) {
      setAiLastCheckpoint(aiCheckpoint);
      setMessage(`🤖 AI reached checkpoint ${aiCheckpoint}!`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Track AI checkpoint visit in game variants system for variants like Checkpoint Challenge
      trackCheckpointVisit(AI_ID, aiCheckpoint);
    }
    
    // Check AI spaceport
    if (SPACEPORTS[newAiPosition]) {
      const targetPosition = SPACEPORTS[newAiPosition];
      setAiPosition(targetPosition);
      setMessage(`🤖 AI uses spaceport! Teleports to ${targetPosition}!`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Track spaceport use for variants like Spaceport Master
      trackSpaceportUse(AI_ID);

      // Check win condition again after spaceport teleport using variant-specific win condition
      const aiPlayersForCheckAfterTeleport = [
        {
          id: PLAYER_ID,
          name: character?.name || 'Player',
          position: playerPosition,
          lastCheckpoint: lastCheckpoint,
          visitedCheckpoints: gameVariants.variantState.checkpointsVisited[PLAYER_ID] || [],
          aliensHit: gameVariants.variantState.aliensHit[PLAYER_ID] || 0,
          spaceportsUsed: gameVariants.variantState.spaceportsUsed[PLAYER_ID] || 0,
          eliminated: variantState.eliminations.includes(PLAYER_ID),
          turnsOnHill: gameVariants.variantState.hillPositions[PLAYER_ID] || 0
        },
        {
          id: AI_ID,
          name: 'AI Opponent',
          position: targetPosition, // Use new position after teleport
          lastCheckpoint: aiLastCheckpoint,
          visitedCheckpoints: gameVariants.variantState.checkpointsVisited[AI_ID] || [],
          aliensHit: gameVariants.variantState.aliensHit[AI_ID] || 0,
          spaceportsUsed: gameVariants.variantState.spaceportsUsed[AI_ID] || 0,
          eliminated: variantState.eliminations.includes(AI_ID),
          turnsOnHill: variantState.hillPositions[AI_ID] || 0
        }
      ];

      const aiWinnerAfterTeleport = checkWinCondition(aiPlayersForCheckAfterTeleport);
      if (aiWinnerAfterTeleport) {
        if (aiWinnerAfterTeleport.id === AI_ID) {
          setGameLost(true);
          setMessage('💀 AI opponent wins!');
          playSound('alien');
          setAiThinking(false);
          setIsAITurn(false);
          setAnimationType('victory');
          // Show game over modal after a short delay
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 1500);
          return;
        } else {
          setGameWon(true);
          setMessage('🎉 You win!');
          playSound('victory');
          setAiThinking(false);
          setIsAITurn(false);
          setAnimationType('victory');
          // Show game over modal after a short delay
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 1500);
          return;
        }
      }
    }
    
    // AI doesn't fight aliens (they're obstacles for player only)
    
    // Process jeopardy turn for hazards
    jeopardy.nextTurn();

    // Increment variant-specific turn counter for turn-based win conditions
    gameVariants.incrementTurn();

    setAiThinking(false);
    setIsAITurn(false);

    // Only continue if game hasn't ended
    if (!gameWon && !gameLost) {
      setMessage(`${character?.name || 'Your'}'s turn! Roll the dice!`);
    }
  }, [aiPosition, aiSkipTurn, BOARD_SIZE, CHECKPOINTS, character, gameWon, gameLost, jeopardy, playerPosition, lastCheckpoint, checkWinCondition, trackCheckpointVisit, trackSpaceportUse, incrementTurn]);
  
  // Roll dice and move
  const rollDice = useCallback(() => {
    if (isRolling || gameWon || gameLost || !character || rpg.combatState || isAITurn) return;
    
    // Check if player is in jail - block normal dice rolling
    const jailState = jeopardy.getJailState(PLAYER_ID);
    if (jailState.inJail) {
      // Player is in jail - they cannot roll dice normally
      // They must use the SpaceJail overlay to roll for doubles or pay bail
      setMessage(`🚔 ${character.name} is in jail! Use the jail overlay to escape.`);
      playSound('error');
      return;
    }
    
    setIsRolling(true);
    playSound('click');
    
    // Roll 1d6
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    
    setTimeout(() => {
      if (movePlayerRef.current) {
        movePlayerRef.current(roll);
      }
      setIsRolling(false);
    }, 1000);
  }, [isRolling, gameWon, gameLost, character, rpg.combatState, isAITurn, playSound, jeopardy, takeAITurn]);
  
  // Move player
  const movePlayer = useCallback(async (steps) => {
    if (!character || gameWon || gameLost) return;
    
    // Allow position to go to BOARD_SIZE (which is the end)
    const newPosition = Math.min(playerPosition + steps, BOARD_SIZE);
    setPlayerPosition(newPosition);
    setAnimatingPlayer(PLAYER_ID);
    setAnimationType('moving');
    
    setMessage(`${character.name} moves ${steps} spaces to position ${newPosition}!`);
    playSound('move');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple position-based win check (fallback for classic mode)
    if (newPosition >= BOARD_SIZE) {
      setGameWon(true);
      setMessage(`🎉 ${character.name} reached the end! Victory!`);
      playSound('victory');
      setAnimationType('victory');
      setIsAITurn(false);
      setAiThinking(false);
      setTimeout(() => {
        setShowGameOverModal(true);
      }, 1500);
      return;
    }
    
    // Check win condition using the variant-specific win condition
    const playersForCheck = [
      {
        id: PLAYER_ID,
        name: character?.name || 'Player',
        position: newPosition,
        lastCheckpoint: lastCheckpoint,
        visitedCheckpoints: gameVariants.variantState.checkpointsVisited[PLAYER_ID] || [],
        aliensHit: gameVariants.variantState.aliensHit[PLAYER_ID] || 0,
        spaceportsUsed: gameVariants.variantState.spaceportsUsed[PLAYER_ID] || 0,
        eliminated: gameVariants.variantState.eliminations.includes(PLAYER_ID),
        turnsOnHill: gameVariants.variantState.hillPositions[PLAYER_ID] || 0
      },
      {
        id: AI_ID,
        name: 'AI Opponent',
        position: aiPosition,
        lastCheckpoint: aiLastCheckpoint,
        visitedCheckpoints: [],
        aliensHit: 0,
        spaceportsUsed: 0,
        eliminated: gameVariants.variantState.eliminations.includes(AI_ID),
        turnsOnHill: 0
      }
    ];

    const winner = checkWinCondition(playersForCheck);
    if (winner) {
      if (winner.id === PLAYER_ID) {
        setGameWon(true);
        setMessage(`🎉 ${winner.name} wins!`);
        playSound('victory');
        setAnimationType('victory');
        setIsAITurn(false);
        setAiThinking(false);
        // Show game over modal after a short delay
        setTimeout(() => {
          setShowGameOverModal(true);
        }, 1500);
        return;
      } else {
        setGameLost(true);
        setMessage(`💀 ${winner.name} wins!`);
        playSound('alien');
        setAnimationType('victory');
        setIsAITurn(false);
        setAiThinking(false);
        // Show game over modal after a short delay
        setTimeout(() => {
          setShowGameOverModal(true);
        }, 1500);
        return;
      }
    }
    
    // Check for hazard collisions (jail, black holes, meteors)
    const hazardResult = jeopardy.checkHazardCollision(PLAYER_ID, newPosition);
    
    if (hazardResult.patrol) {
      // Space Jail!
      setMessage(`🚨 ${character.name} landed on a PATROL ZONE!`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage(hazardResult.message);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      playSound('error');
      setAnimationType(null);
      setAnimatingPlayer(null);
      
      // Player is now in jail, turn ends
      setIsAITurn(true);
      setTimeout(() => takeAITurn(), 2000);
      return;
    }
    
    if (hazardResult.blackHole) {
      // Black hole!
      setMessage(`⚠️ ${character.name} landed on a BLACK HOLE!`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage(hazardResult.message);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      playSound('alien');
      setAnimationType('eaten');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPlayerPosition(hazardResult.newPosition);
      setLastCheckpoint(CHECKPOINTS.find(cp => cp <= hazardResult.newPosition) || 0);
      
      setMessage(`↩️ ${character.name} warped back to position ${hazardResult.newPosition}`);
      
      setAnimationType('landing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnimationType(null);
      setAnimatingPlayer(null);

      // Check win condition after black hole effect (in case of special rules)
      const playersForCheckAfterBlackHole = [
        {
          id: PLAYER_ID,
          name: character?.name || 'Player',
          position: hazardResult.newPosition, // Use new position after black hole
          lastCheckpoint: lastCheckpoint,
          visitedCheckpoints: gameVariants.variantState.checkpointsVisited[PLAYER_ID] || [],
          aliensHit: gameVariants.variantState.aliensHit[PLAYER_ID] || 0,
          spaceportsUsed: gameVariants.variantState.spaceportsUsed[PLAYER_ID] || 0,
          eliminated: variantState.eliminations.includes(PLAYER_ID),
          turnsOnHill: gameVariants.variantState.hillPositions[PLAYER_ID] || 0
        },
        {
          id: AI_ID,
          name: 'AI Opponent',
          position: aiPosition,
          lastCheckpoint: aiLastCheckpoint,
          visitedCheckpoints: gameVariants.variantState.checkpointsVisited[AI_ID] || [],
          aliensHit: gameVariants.variantState.aliensHit[AI_ID] || 0,
          spaceportsUsed: gameVariants.variantState.spaceportsUsed[AI_ID] || 0,
          eliminated: variantState.eliminations.includes(AI_ID),
          turnsOnHill: variantState.hillPositions[AI_ID] || 0
        }
      ];

      const winnerAfterBlackHole = checkWinCondition(playersForCheckAfterBlackHole);
      if (winnerAfterBlackHole) {
        if (winnerAfterBlackHole.id === PLAYER_ID) {
          setGameWon(true);
          setMessage(`🎉 ${winnerAfterBlackHole.name} wins!`);
          playSound('victory');
          setAnimationType('victory');
          setIsAITurn(false);
          setAiThinking(false);
          // Show game over modal after a short delay
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 1500);
          return;
        } else {
          setGameLost(true);
          setMessage(`💀 ${winnerAfterBlackHole.name} wins!`);
          playSound('alien');
          setAnimationType('victory');
          setIsAITurn(false);
          setAiThinking(false);
          // Show game over modal after a short delay
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 1500);
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsAITurn(true);
      setTimeout(() => takeAITurn(), 2000);
      return;
    }

    if (hazardResult.meteor) {
      // Meteor impact!
      setMessage(`🔥 ${character.name} hit by METEOR!`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage(hazardResult.message);
      await new Promise(resolve => setTimeout(resolve, 2000));

      playSound('error');
      setAnimationType('eaten');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPlayerPosition(hazardResult.newPosition);
      setLastCheckpoint(CHECKPOINTS.find(cp => cp <= hazardResult.newPosition) || 0);

      setAnimationType('landing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnimationType(null);
      setAnimatingPlayer(null);

      // Check win condition after meteor impact (in case of special rules)
      const playersForCheckAfterMeteor = [
        {
          id: PLAYER_ID,
          name: character?.name || 'Player',
          position: hazardResult.newPosition, // Use new position after meteor
          lastCheckpoint: lastCheckpoint,
          visitedCheckpoints: gameVariants.variantState.checkpointsVisited[PLAYER_ID] || [],
          aliensHit: gameVariants.variantState.aliensHit[PLAYER_ID] || 0,
          spaceportsUsed: gameVariants.variantState.spaceportsUsed[PLAYER_ID] || 0,
          eliminated: variantState.eliminations.includes(PLAYER_ID),
          turnsOnHill: gameVariants.variantState.hillPositions[PLAYER_ID] || 0
        },
        {
          id: AI_ID,
          name: 'AI Opponent',
          position: aiPosition,
          lastCheckpoint: aiLastCheckpoint,
          visitedCheckpoints: gameVariants.variantState.checkpointsVisited[AI_ID] || [],
          aliensHit: gameVariants.variantState.aliensHit[AI_ID] || 0,
          spaceportsUsed: gameVariants.variantState.spaceportsUsed[AI_ID] || 0,
          eliminated: variantState.eliminations.includes(AI_ID),
          turnsOnHill: variantState.hillPositions[AI_ID] || 0
        }
      ];

      const winnerAfterMeteor = checkWinCondition(playersForCheckAfterMeteor);
      if (winnerAfterMeteor) {
        if (winnerAfterMeteor.id === PLAYER_ID) {
          setGameWon(true);
          setMessage(`🎉 ${winnerAfterMeteor.name} wins!`);
          playSound('victory');
          setAnimationType('victory');
          setIsAITurn(false);
          setAiThinking(false);
          // Show game over modal after a short delay
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 1500);
          return;
        } else {
          setGameLost(true);
          setMessage(`💀 ${winnerAfterMeteor.name} wins!`);
          playSound('alien');
          setAnimationType('victory');
          setIsAITurn(false);
          setAiThinking(false);
          // Show game over modal after a short delay
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 1500);
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsAITurn(true);
      setTimeout(() => takeAITurn(), 2000);
      return;
    }
    
    // Check for alien encounter FIRST (aliens override checkpoints)
    if (ALIENS.includes(newPosition)) {
      // Track alien hit for variants like Alien Hunter
      trackAlienHit(PLAYER_ID);

      // Player encounters alien - IMMEDIATELY move back to last checkpoint
      setMessage(`⚠️ ${character.name} encounters an ALIEN! Retreating to checkpoint ${lastCheckpoint}!`);
      playSound('alien');
      setAnimationType('eaten');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Move player back to last checkpoint immediately
      setPlayerPosition(lastCheckpoint);
      setMessage(`↩️ ${character.name} retreated to checkpoint ${lastCheckpoint}!`);
      setAnimationType('landing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnimationType(null);
      setAnimatingPlayer(null);

      // Now initiate combat at the checkpoint position (or just show message)
      // Combat happens but player is safe at checkpoint
      const combatInfo = rpg.initiateCombat(PLAYER_ID, lastCheckpoint);
      setMessage(`⚔️ ${character.name} encounters a Level ${combatInfo.alienLevel} Alien at checkpoint! Combat begins!`);
      playSound('alien');
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Combat will be handled by CombatOverlay
      return;
    }
    
    // Check for checkpoint (only if no alien)
    const checkpoint = CHECKPOINTS.find(cp => cp === newPosition);
    if (checkpoint) {
      setLastCheckpoint(checkpoint);
      setMessage(`✅ Checkpoint reached at position ${checkpoint}!`);
      playSound('checkpoint');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Track checkpoint visit in game variants system for variants like Checkpoint Challenge
      trackCheckpointVisit(PLAYER_ID, checkpoint);
    }
    
    // Check for spaceport
    if (SPACEPORTS[newPosition]) {
      const targetPosition = SPACEPORTS[newPosition];
      setPlayerPosition(targetPosition);
      setMessage(`🚀 Spaceport! ${character.name} teleports to position ${targetPosition}!`);
      playSound('spaceport');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Track spaceport use for variants like Spaceport Master
      trackSpaceportUse(PLAYER_ID);

      // Check win condition again after spaceport teleport using variant-specific win condition
      const playersForCheckAfterTeleport = [
        {
          id: PLAYER_ID,
          name: character?.name || 'Player',
          position: targetPosition, // Use new position after teleport
          lastCheckpoint: lastCheckpoint,
          visitedCheckpoints: gameVariants.variantState.checkpointsVisited[PLAYER_ID] || [],
          aliensHit: gameVariants.variantState.aliensHit[PLAYER_ID] || 0,
          spaceportsUsed: gameVariants.variantState.spaceportsUsed[PLAYER_ID] || 0,
          eliminated: variantState.eliminations.includes(PLAYER_ID),
          turnsOnHill: gameVariants.variantState.hillPositions[PLAYER_ID] || 0
        },
        {
          id: AI_ID,
          name: 'AI Opponent',
          position: aiPosition,
          lastCheckpoint: aiLastCheckpoint,
          visitedCheckpoints: [],
          aliensHit: 0,
          spaceportsUsed: 0,
          eliminated: gameVariants.variantState.eliminations.includes(AI_ID),
          turnsOnHill: 0
        }
      ];

      const winnerAfterTeleport = checkWinCondition(playersForCheckAfterTeleport);
      if (winnerAfterTeleport) {
        if (winnerAfterTeleport.id === PLAYER_ID) {
          setGameWon(true);
          setMessage(`🎉 ${winnerAfterTeleport.name} wins!`);
          playSound('victory');
          setAnimationType('victory');
          setIsAITurn(false);
          setAiThinking(false);
          // Show game over modal after a short delay
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 1500);
          return;
        } else {
          setGameLost(true);
          setMessage(`💀 ${winnerAfterTeleport.name} wins!`);
          playSound('alien');
          setAnimationType('victory');
          setIsAITurn(false);
          setAiThinking(false);
          // Show game over modal after a short delay
          setTimeout(() => {
            setShowGameOverModal(true);
          }, 1500);
          return;
        }
      }
    }
    
    // Check for tactical square
    if (TACTICAL_SQUARES.includes(newPosition)) {
      setPendingTacticalAction(newPosition);
      setShowTacticalAction(true);
      setMessage(`⚔️ Tactical Square! Roll dice to perform action on AI!`);
      playSound('click');
      setAnimationType(null);
      setAnimatingPlayer(null);
      return; // Don't continue movement, wait for tactical action
    }
    
    setAnimationType(null);
    setAnimatingPlayer(null);

    // Track hill position for King of the Hill variant
    trackHillPosition(PLAYER_ID, newPosition);

    // Process jeopardy turn for hazards
    jeopardy.nextTurn();

    // Increment variant-specific turn counter for turn-based win conditions
    incrementTurn();

    // After player turn, AI takes turn (only if game hasn't ended)
    if (!gameWon && !gameLost) {
      setIsAITurn(true);
      setTimeout(() => takeAITurn(), 1500);
    }
  }, [character, playerPosition, BOARD_SIZE, CHECKPOINTS, ALIENS, rpg, playSound, takeAITurn, gameWon, gameLost, jeopardy, lastCheckpoint, aiPosition, aiLastCheckpoint, checkWinCondition, trackAlienHit, trackCheckpointVisit, trackSpaceportUse, trackHillPosition, incrementTurn]);
  
  // Store movePlayer in ref to avoid circular dependency
  useEffect(() => {
    movePlayerRef.current = movePlayer;
  }, [movePlayer]);
  
  // Roll tactical dice
  const rollTacticalDice = useCallback(() => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setTacticalDiceRoll(roll);
    playSound('click');
  }, [playSound]);
  
  // Execute tactical action
  const executeTacticalAction = useCallback(() => {
    if (!tacticalDiceRoll) return;
    
    const action = TACTICAL_ACTIONS[tacticalDiceRoll];
    if (!action) return;
    
    if (action.name === 'Skip Turn') {
      setAiSkipTurn(true);
      setMessage(`⏸️ ${action.description}! AI will skip next turn!`);
    } else if (action.name === 'Critical Strike') {
      // Player chooses: push back 6 OR deal damage (push back 3)
      // For now, auto-choose push back 6
      const newAiPos = Math.max(0, aiPosition - 6);
      setAiPosition(newAiPos);
      setMessage(`💥 Critical Strike! AI pushed back 6 spaces to position ${newAiPos}!`);
    } else {
      // Push back
      const newAiPos = Math.max(0, aiPosition - action.value);
      setAiPosition(newAiPos);
      setMessage(`${action.icon} ${action.description}! AI now at position ${newAiPos}!`);
    }
    
    playSound('victory');
    setShowTacticalAction(false);
    setTacticalDiceRoll(null);
    setPendingTacticalAction(null);
    
    // After tactical action, AI takes turn
    setTimeout(() => {
      setIsAITurn(true);
      takeAITurn();
    }, 2000);
  }, [tacticalDiceRoll, aiPosition, playSound, takeAITurn]);
  
  // Monitor combat state changes to handle alien attacks and combat end
  useEffect(() => {
    if (!rpg.combatState) {
      // Combat ended - check if player was knocked out
      const currentCharacter = rpg.getCharacter(PLAYER_ID);
      if (currentCharacter && currentCharacter.hp <= 0) {
        // Player was knocked out during combat
        setMessage(`💀 ${character?.name} was defeated! Returning to checkpoint ${lastCheckpoint}...`);
        playSound('alien');
        
        setTimeout(() => {
          setPlayerPosition(lastCheckpoint);
          // Reset player HP to max
          rpg.updateCharacter(PLAYER_ID, { hp: currentCharacter.maxHp });
          setCombatMessage('');
          setAnimationType(null);
          // After defeat, AI takes turn
          setIsAITurn(true);
          setTimeout(() => takeAITurn(), 2000);
        }, 2000);
      }
      return;
    }
    
    // If it's alien's turn, show message that alien is attacking
    if (rpg.combatState.turn === 'alien') {
      setCombatMessage('Alien attacks...');
    } else if (rpg.combatState.turn === 'player') {
      // Back to player's turn - clear any alien attack message
      if (combatMessage === 'Alien attacks...') {
        setCombatMessage('');
      }
    }
  }, [rpg.combatState, character, lastCheckpoint, playSound, takeAITurn, rpg, combatMessage]);
  
  // Handle combat actions
  const handleCombatAttack = useCallback((skill = null) => {
    if (!rpg.combatState || rpg.combatState.turn !== 'player') return;
    
    const result = rpg.playerAttack(PLAYER_ID, skill);
    setCombatMessage(result.message || '');
    
    if (result.defeated) {
      // Alien defeated - combat state is already cleared by playerAttack
      const xpGained = result.xpGained || 0;
      setMessage(`🎉 ${character?.name} defeated the alien! +${xpGained} XP`);
      playSound('victory');
      
      if (character) {
        const levelUpCheck = rpg.addXP(PLAYER_ID, xpGained);
        if (levelUpCheck.leveledUp) {
          setTimeout(() => {
            setMessage(`⭐ ${character.name} leveled up to Level ${levelUpCheck.newLevel}!`);
            playSound('victory');
          }, 2000);
        }
      }
      
      // Clear combat message and animation immediately
      setCombatMessage('');
      setAnimationType(null);
      
      // Force overlay to close by ensuring combat state is cleared
      // The overlay will automatically close when rpg.combatState becomes null
      
      // After combat, AI takes turn
      setTimeout(() => {
        setIsAITurn(true);
        setTimeout(() => takeAITurn(), 500);
      }, 1500);
    } else if (result.avoided) {
      // Player avoided combat (stealth/persuasion) - combat state is already cleared
      setMessage(result.message || 'Combat avoided!');
      playSound('victory');
      
      // Clear combat message and animation immediately
      setCombatMessage('');
      setAnimationType(null);
      
      // After avoiding combat, AI takes turn
      setTimeout(() => {
        setIsAITurn(true);
        setTimeout(() => takeAITurn(), 500);
      }, 1000);
    } else if (result.hit || result.message) {
      // Attack hit or missed, alien will attack back
      // The useEffect above will handle the alien's turn
      // Combat continues, so overlay stays open
    }
  }, [rpg, character, lastCheckpoint, playSound, takeAITurn]);
  
  const handleCombatFlee = useCallback(() => {
    if (!rpg.combatState || rpg.combatState.turn !== 'player') return;
    
    // Use fleeCombat to clear combat state
    const fleeResult = rpg.fleeCombat(PLAYER_ID);
    
    setMessage(`🏃 ${character?.name} flees back to checkpoint ${lastCheckpoint}!`);
    setCombatMessage('You flee back to the checkpoint!');
    playSound('error');
    
    setTimeout(() => {
      setPlayerPosition(lastCheckpoint);
      setCombatMessage('');
      setAnimationType(null);
      // After flee, AI takes turn
      setIsAITurn(true);
      setTimeout(() => takeAITurn(), 2000);
    }, 2000);
  }, [rpg.combatState, rpg, character, lastCheckpoint, playSound, takeAITurn]);
  
  // Reset game
  const resetGame = useCallback(() => {
    setPlayerPosition(0);
    setLastCheckpoint(0);
    setAiPosition(0);
    setAiLastCheckpoint(0);
    setAiSkipTurn(false);
    setDiceValue(null);
    setMessage(character ? `${character.name}'s turn! Roll the dice to explore!` : "Create your character to begin!");
    setGameWon(false);
    setGameLost(false);
    setShowGameOverModal(false);
    setAnimationType(null);
    setAnimatingPlayer(null);
    setCombatMessage('');
    setShowTacticalAction(false);
    setTacticalDiceRoll(null);
    setPendingTacticalAction(null);
    setIsAITurn(false);
    playSound('click');
  }, [character, playSound]);
  
  // Handle play again
  const handlePlayAgain = useCallback(() => {
    resetGame();
  }, [resetGame]);
  
  // Handle return to menu
  const handleReturnToMenu = useCallback(() => {
    playSound('click');
    onBack();
  }, [onBack, playSound]);
  
  // Show character creation
  if (showCharacterCreation || !characterCreated) {
    return (
      <div
        className="fixed inset-0 flex flex-col"
        style={{
          backgroundImage: `url(/${getBackgroundImage('local', difficulty)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#000'
        }}
      >
        <CharacterCreation
          onComplete={handleCharacterCreated}
          playerName="Adventurer"
        />
      </div>
    );
  }
  
  // Convert to array format for GameBoard component
  const players = [
    {
      id: PLAYER_ID,
      position: playerPosition,
      lastCheckpoint: lastCheckpoint,
      color: 'text-yellow-300',
      name: character?.name || 'Adventurer',
      corner: 'top-left',
      icon: '🚀'
    },
    {
      id: AI_ID,
      position: aiPosition,
      lastCheckpoint: aiLastCheckpoint,
      color: 'text-red-300',
      name: 'AI Opponent',
      corner: 'top-right',
      icon: '🤖'
    }
  ];
  
  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        backgroundImage: `url(/${getBackgroundImage('local', difficulty)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 bg-opacity-90 border-b border-gray-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-yellow-300">Tabletop RPG Mode</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-white">
            <span className="text-yellow-300">You:</span> {playerPosition} | 
            <span className="text-red-300"> AI:</span> {aiPosition}
          </div>
        </div>
      </div>

      {/* Main Game Area - Responsive layout for mobile and folding phones */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Character Stats - Hidden on small screens, collapsible */}
        <div className="hidden lg:block lg:w-80 bg-gray-900 bg-opacity-90 border-r border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-white font-bold text-lg mb-4 break-words">Your Character</h2>
          {character ? (
            <CharacterStatsPanel
              character={character}
              isExpanded={true}
            />
          ) : (
            <div className="bg-gray-800 rounded p-4 text-gray-400 text-sm">
              No character data
            </div>
          )}
          
          {/* AI Opponent Info */}
          <div className="mt-4 bg-gray-800 rounded-lg p-4 border-2 border-red-500">
            <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <span>🤖</span> AI Opponent
            </h3>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Position: <span className="text-red-300 font-bold">{aiPosition}</span></div>
              <div>Checkpoint: <span className="text-red-300">{aiLastCheckpoint}</span></div>
              {aiSkipTurn && (
                <div className="text-yellow-300 font-semibold">⏸️ Skips next turn!</div>
              )}
            </div>
          </div>
        </div>

        {/* Center - Game Board - Scrollable on mobile */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto min-h-0">
          <div className="w-full max-w-full h-full flex items-center justify-center">
            <div className="w-full max-w-full h-full max-h-full flex items-center justify-center">
              <GameBoard
                boardSize={BOARD_SIZE}
                players={players}
                currentPlayerIndex={isAITurn ? 1 : 0}
                aliens={ALIENS}
                checkpoints={CHECKPOINTS}
                animatingPlayer={animatingPlayer}
                animationType={animationType}
                alienBlink={alienBlink}
                diceRolling={isRolling || aiThinking}
                animatedPositions={{}}
                encounterType={null}
                hazards={{ 
                  blackHoles: jeopardy.hazards.blackHoles || [], 
                  patrolZones: jeopardy.hazards.patrolZones || [], 
                  meteorImpacts: jeopardy.hazards.meteorImpacts || [], 
                  tacticalSquares: TACTICAL_SQUARES 
                }}
                rogueState={null}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Game Controls - Bottom on mobile, side on desktop */}
        <div className="w-full lg:w-80 bg-gray-900 bg-opacity-90 lg:border-l border-t lg:border-t-0 border-gray-700 p-3 sm:p-4 overflow-y-auto flex flex-col max-h-[40vh] lg:max-h-none">
          <GameControls
            diceValue={diceValue}
            message={combatMessage || message}
            onReset={resetGame}
            numPlayers={2}
            isOnline={false}
          />
          
          {/* SPIN Button - Disabled if in jail */}
          {!rpg.combatState && !showTacticalAction && character && !isAITurn && !gameWon && !gameLost && (() => {
            const jailState = jeopardy.getJailState(PLAYER_ID);
            const isInJail = jailState.inJail;
            
            return (
              <div className="mt-4">
                <button
                  onClick={rollDice}
                  disabled={isRolling || gameWon || gameLost || isInJail}
                  className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg text-base md:text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700 relative overflow-hidden group"
                  style={{
                    backgroundSize: '200% 100%'
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className={isRolling ? 'animate-spin' : ''}>🎲</span>
                    {isRolling ? 'Rolling...' : isInJail ? '🚔 IN JAIL - Use overlay to escape' : 'ROLL DICE'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-shimmer"></div>
                </button>
                {character && !isInJail && (
                  <div className="mt-2 text-xs text-gray-400 text-center">
                    {character.name}'s turn
                  </div>
                )}
                {isInJail && (
                  <div className="mt-2 text-xs text-red-400 text-center">
                    🚔 In jail - {jailState.turnsRemaining} turn{jailState.turnsRemaining > 1 ? 's' : ''} remaining
                  </div>
                )}
              </div>
            );
          })()}
          
          {/* Game Over Messages - Hidden when modal is shown */}
          {gameWon && !showGameOverModal && (
            <div className="mt-4 bg-green-900 bg-opacity-50 border-2 border-green-500 rounded-lg p-4">
              <div className="text-white font-bold text-center text-lg">
                🎉 Victory!
              </div>
              <div className="text-green-300 text-sm text-center mt-2">
                You reached the end!
              </div>
            </div>
          )}
          
          {gameLost && !showGameOverModal && (
            <div className="mt-4 bg-red-900 bg-opacity-50 border-2 border-red-500 rounded-lg p-4">
              <div className="text-white font-bold text-center text-lg">
                💀 Game Over
              </div>
              <div className="text-red-300 text-sm text-center mt-2">
                AI opponent reached the end!
              </div>
            </div>
          )}
          
          {/* AI Turn Indicator */}
          {isAITurn && !gameWon && !gameLost && (
            <div className="mt-4 bg-red-900 bg-opacity-50 border-2 border-red-500 rounded-lg p-4">
              <div className="text-white font-bold text-center">
                🤖 AI Opponent's Turn
              </div>
              {aiThinking && (
                <div className="text-red-300 text-sm text-center mt-2">
                  Thinking...
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>

      {/* Tactical Action Overlay */}
      {showTacticalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-purple-500 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-400">⚔️ Tactical Square!</h2>
              <button
                onClick={() => {
                  setShowTacticalAction(false);
                  setTacticalDiceRoll(null);
                  setPendingTacticalAction(null);
                  setIsAITurn(true);
                  setTimeout(() => takeAITurn(), 500);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-white mb-4">
              Roll dice to perform an action on the AI opponent!
            </p>
            
            {!tacticalDiceRoll ? (
              <button
                onClick={rollTacticalDice}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
              >
                🎲 Roll Tactical Dice
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">🎲</div>
                  <div className="text-3xl font-bold text-purple-400">{tacticalDiceRoll}</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-white font-semibold mb-2">
                    {TACTICAL_ACTIONS[tacticalDiceRoll].icon} {TACTICAL_ACTIONS[tacticalDiceRoll].name}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {TACTICAL_ACTIONS[tacticalDiceRoll].description}
                  </div>
                </div>
                
                <button
                  onClick={executeTacticalAction}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  Execute Action
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Combat Overlay */}
      {rpg.combatState && character && (
        <CombatOverlay
          character={character}
          combatState={rpg.combatState}
          onAttack={handleCombatAttack}
          onSkillUse={handleCombatAttack}
          onFlee={handleCombatFlee}
        />
      )}

      {/* Space Jail Overlay */}
      {character && (() => {
        const jailState = jeopardy.getJailState(PLAYER_ID);
        if (jailState.inJail && !isAITurn && !gameWon && !gameLost) {
          return (
            <SpaceJail
              playerId={PLAYER_ID}
              playerName={character.name}
              turnsRemaining={jailState.turnsRemaining}
              bailCost={50}
              playerCoins={currency.coins || 0}
              onPayBail={() => {
                const result = jeopardy.payBail(PLAYER_ID);
                if (result.success) {
                  currency.removeCoins(result.cost);
                  playSound('click');
                  setPlayerPosition(result.returnPosition);
                  setLastCheckpoint(CHECKPOINTS.find(cp => cp <= result.returnPosition) || 0);
                  setMessage(result.message);
                  // After paying bail, AI takes turn
                  setTimeout(() => {
                    setIsAITurn(true);
                    setTimeout(() => takeAITurn(), 1000);
                  }, 1500);
                } else {
                  setMessage('Failed to pay bail: ' + (result.error || 'Unknown error'));
                  playSound('error');
                }
              }}
              onRollForDoubles={() => {
                // Roll for doubles to escape jail
                if (isRolling) return;
                
                setIsRolling(true);
                setDiceValue(null);
                setMessage(`🎲 ${character.name} rolling for DOUBLES to escape jail...`);
                playSound('roll');
                
                setTimeout(() => {
                  const roll1 = Math.floor(Math.random() * 6) + 1;
                  const roll2 = Math.floor(Math.random() * 6) + 1;
                  const total = roll1 + roll2;
                  const rolledDoubles = roll1 === roll2;
                  
                  setDiceValue(total);
                  setMessage(`🎲 Rolled ${roll1} and ${roll2}${rolledDoubles ? ' - DOUBLES!' : ''}`);
                  playSound('dice');
                  
                  // Process jail turn
                  const jailResult = jeopardy.processJailTurn(PLAYER_ID, rolledDoubles);
                  
                  setMessage(jailResult.message);
                  
                  if (jailResult.escaped) {
                    // Player escaped jail
                    setPlayerPosition(jailResult.returnPosition);
                    setLastCheckpoint(CHECKPOINTS.find(cp => cp <= jailResult.returnPosition) || 0);
                    setIsRolling(false);
                    // After escaping jail, AI takes turn
                    setTimeout(() => {
                      setIsAITurn(true);
                      setTimeout(() => takeAITurn(), 2000);
                    }, 1500);
                  } else {
                    // Still in jail - turn ends, AI takes turn
                    setIsRolling(false);
                    setTimeout(() => {
                      setIsAITurn(true);
                      setTimeout(() => takeAITurn(), 2000);
                    }, 1500);
                  }
                }, 1000);
              }}
              isCurrentPlayer={true}
            />
          );
        }
        return null;
      })()}

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={showGameOverModal}
        isVictory={gameWon}
        winnerName={gameWon ? character?.name : 'AI Opponent'}
        onPlayAgain={handlePlayAgain}
        onReturnToMenu={handleReturnToMenu}
      />

      <ParticleEffects />
    </div>
  );
}
