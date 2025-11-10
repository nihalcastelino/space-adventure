import { useState, useEffect, useRef } from 'react';
import { database } from '../lib/firebase';
import { ref, set, onValue, update, get } from 'firebase/database';
import { useGameSounds } from './useGameSounds';
import { useGameHistory } from './useGameHistory';
import { useLeaderboard } from './useLeaderboard';
import { useRocketAnimation } from './useRocketAnimation';
import { sanitizePlayerName, isValidPlayerName } from '../utils/sanitize';

// Simple UUID generator
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const BOARD_SIZE = 100;
const SPACEPORTS = {
  4: 18, 9: 31, 15: 42, 21: 56, 28: 64,
  36: 70, 51: 77, 62: 85, 71: 91, 80: 96
};
const ALIENS = [14, 23, 29, 38, 45, 50, 54, 61, 68, 75, 82, 88, 94, 98];
const CHECKPOINTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

function getLastCheckpoint(position) {
  for (let i = CHECKPOINTS.length - 1; i >= 0; i--) {
    if (CHECKPOINTS[i] <= position) {
      return CHECKPOINTS[i];
    }
  }
  return 0;
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function processMove(game, player, steps) {
  let newPosition = player.position + steps;
  
  // If player is at position 0 (starting), they enter the board at the rolled position
  if (player.position === 0) {
    newPosition = steps; // Move directly to the rolled position
  }

  if (newPosition > BOARD_SIZE) {
    return {
      success: false,
      message: `${player.name} rolled ${steps} but needs exactly ${BOARD_SIZE - player.position} to win! Turn passes.`,
      skipTurn: true
    };
  }

  player.position = newPosition;

  if (newPosition === BOARD_SIZE) {
    return {
      success: true,
      message: `🎉 ${player.name} WINS! Reached the edge of the galaxy!`,
      won: true
    };
  }

  if (SPACEPORTS[newPosition]) {
    const destination = SPACEPORTS[newPosition];
    player.position = destination;
    player.lastCheckpoint = getLastCheckpoint(destination);
    return {
      success: true,
      message: `🚀 ${player.name} warped to position ${destination}!`,
      spaceport: true,
      destination
    };
  }

  if (ALIENS.includes(newPosition)) {
    const checkpoint = player.lastCheckpoint;
    player.position = checkpoint;
    return {
      success: true,
      message: `${player.name} was eaten! Returned to checkpoint ${checkpoint}!`,
      alien: true,
      checkpoint
    };
  }

  const newCheckpoint = getLastCheckpoint(newPosition);
  if (newCheckpoint > player.lastCheckpoint) {
    player.lastCheckpoint = newCheckpoint;
    return {
      success: true,
      message: `✓ ${player.name} reached checkpoint ${newCheckpoint}! Now at position ${newPosition}`,
      checkpoint: newCheckpoint
    };
  }

  return {
    success: true,
    message: `${player.name} rolled ${steps}, moved to position ${newPosition}`
  };
}

export function useFirebaseGame() {
  const { playSound } = useGameSounds();
  const { saveGameHistory } = useGameHistory();
  const { recordWin, recordGame } = useLeaderboard();
  const { animatedPositions, animatingPlayer: rocketAnimatingPlayer, encounterType, animateMovement, setAnimatedPositions } = useRocketAnimation();
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [animatingPlayer, setAnimatingPlayer] = useState(null);
  const [animationType, setAnimationType] = useState(null);
  const [alienBlink, setAlienBlink] = useState({});
  const [diceRolling, setDiceRolling] = useState(false);
  const gameRef = useRef(null);
  const moveCountRef = useRef(0);

  // Animate aliens
  useEffect(() => {
    if (!gameState) return;
    const interval = setInterval(() => {
      const newBlink = {};
      ALIENS.forEach(pos => {
        newBlink[pos] = Math.random() > 0.5;
      });
      setAlienBlink(newBlink);
    }, 500);
    return () => clearInterval(interval);
  }, [gameState]);

  const createGame = async (playerName) => {
    if (!isValidPlayerName(playerName)) {
      throw new Error('Invalid player name');
    }

    const sanitizedName = sanitizePlayerName(playerName);
    const newGameId = uuidv4();
    const newPlayerId = uuidv4();

    const playerColors = [
      'text-yellow-300',
      'text-blue-300',
      'text-green-300',
      'text-pink-300'
    ];
    const playerCorners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

    const game = {
      id: newGameId,
      players: [{
        id: newPlayerId,
        name: sanitizedName,
        position: 0,
        lastCheckpoint: 0,
        color: playerColors[0],
        corner: playerCorners[0],
        createdAt: Date.now()
      }],
      currentPlayerIndex: 0,
      diceValue: null,
      isRolling: false,
      gameWon: false,
      winner: null,
      isPaused: false,
      pausedBy: null,
      pausedAt: null,
      startedAt: Date.now(),
      totalMoves: 0,
      message: `${sanitizedName}'s turn! Press SPIN to start!`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const gameRefPath = ref(database, `games/${newGameId}`);
    await set(gameRefPath, game);

    setGameId(newGameId);
    setPlayerId(newPlayerId);
    setGameState(game);
    moveCountRef.current = 0;

    // Clean up existing listener if any
    if (gameRef.current) {
      gameRef.current();
      gameRef.current = null;
    }

    // Listen for changes - real-time sync
    let previousState = null;
    const unsubscribe = onValue(gameRefPath, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Detect player position changes and animate
        if (previousState && previousState.players && data.players) {
          for (let i = 0; i < data.players.length; i++) {
            const prevPlayer = previousState.players[i];
            const currPlayer = data.players[i];

            if (prevPlayer && currPlayer && prevPlayer.position !== currPlayer.position) {
              // Position changed - animate it
              const fromPos = prevPlayer.position;
              const toPos = currPlayer.position;

              // Determine what happened based on the message
              const hasSpaceport = data.message?.includes('warped');
              const hasAlien = data.message?.includes('eaten');

              let alienTarget = toPos;
              if (hasAlien) {
                alienTarget = currPlayer.lastCheckpoint || 0;
              }

              // Trigger animation for this player
              await animateMovement(currPlayer.id, fromPos, toPos, hasSpaceport, hasAlien, alienTarget);
            }
          }
        }

        previousState = data;
        setGameState(data);
        // Sync move count from server
        if (data.totalMoves !== undefined) {
          moveCountRef.current = data.totalMoves;
        }
        setAnimatingPlayer(null);
        setAnimationType(null);
        setDiceRolling(false);
      }
    });

    gameRef.current = unsubscribe;
    setConnected(true);

    return newGameId;
  };

  const joinGame = async (gameIdToJoin, playerName) => {
    if (!isValidPlayerName(playerName)) {
      throw new Error('Invalid player name');
    }

    const sanitizedName = sanitizePlayerName(playerName);
    const newPlayerId = uuidv4();
    const gameRefPath = ref(database, `games/${gameIdToJoin}`);

    // Clean up existing listener if any
    if (gameRef.current) {
      gameRef.current();
      gameRef.current = null;
    }

    // Setup permanent listener first
    let previousState = null;
    const unsubscribe = onValue(gameRefPath, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Detect player position changes and animate
        if (previousState && previousState.players && data.players) {
          for (let i = 0; i < data.players.length; i++) {
            const prevPlayer = previousState.players[i];
            const currPlayer = data.players[i];

            if (prevPlayer && currPlayer && prevPlayer.position !== currPlayer.position) {
              // Position changed - animate it
              const fromPos = prevPlayer.position;
              const toPos = currPlayer.position;

              // Determine what happened based on the message
              const hasSpaceport = data.message?.includes('warped');
              const hasAlien = data.message?.includes('eaten');

              let alienTarget = toPos;
              if (hasAlien) {
                alienTarget = currPlayer.lastCheckpoint || 0;
              }

              // Trigger animation for this player
              await animateMovement(currPlayer.id, fromPos, toPos, hasSpaceport, hasAlien, alienTarget);
            }
          }
        }

        // Detect state changes and play sounds
        if (previousState) {
          if (data.gameWon && !previousState.gameWon) {
            playSound('victory');
          }
          if (data.diceValue && !previousState.diceValue && previousState.isRolling) {
            playSound('rocket');
          }
          if (data.message !== previousState.message) {
            if (data.message.includes('warped')) {
              playSound('spaceport');
            } else if (data.message.includes('eaten') || data.message.includes('encountered')) {
              playSound('alien');
            } else if (data.message.includes('checkpoint')) {
              playSound('checkpoint');
            } else if (data.message.includes("'s turn")) {
              playSound('turn');
            }
          }
        }
        previousState = data;
        setGameState(data);
        // Sync move count from server
        if (data.totalMoves !== undefined) {
          moveCountRef.current = data.totalMoves;
        }
        setAnimatingPlayer(null);
        setAnimationType(null);
        setDiceRolling(false);
      }
    });

    gameRef.current = unsubscribe;

    // Then validate and join
    try {
      const snapshot = await get(gameRefPath);
      const game = snapshot.val();

      if (!game) {
        throw new Error('Game not found');
      }

      // Check if player is already in the game (reconnection case)
      const existingPlayer = game.players.find(p => p.name === sanitizedName);

      if (existingPlayer) {
        // Reconnecting to existing player
        setGameId(gameIdToJoin);
        setPlayerId(existingPlayer.id);
        setConnected(true);
        moveCountRef.current = game.totalMoves || 0;
        return gameIdToJoin;
      }

      // New player joining
      if (game.players.length >= 4) {
        throw new Error('Game is full (maximum 4 players)');
      }

      const playerColors = [
        'text-yellow-300',
        'text-blue-300',
        'text-green-300',
        'text-pink-300'
      ];
      const playerCorners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

      const newPlayer = {
        id: newPlayerId,
        name: sanitizedName,
        position: 0,
        lastCheckpoint: 0,
        color: playerColors[game.players.length],
        corner: playerCorners[game.players.length],
        createdAt: Date.now()
      };

      const updatedPlayers = [...game.players, newPlayer];
      const updates = {
        players: updatedPlayers,
        message: `${sanitizedName} joined! ${game.players[0].name}'s turn!`,
        updatedAt: Date.now()
      };

      await update(gameRefPath, updates);

      setGameId(gameIdToJoin);
      setPlayerId(newPlayerId);
      setConnected(true);
      moveCountRef.current = game.totalMoves || 0;

      return gameIdToJoin;
    } catch (err) {
      // Cleanup listener on error
      if (gameRef.current) {
        gameRef.current();
        gameRef.current = null;
      }
      throw err;
    }
  };

  const handleRollDice = async () => {
    if (!gameState || gameState.isRolling || gameState.gameWon || gameState.isPaused) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      return; // Not your turn
    }

    playSound('click');
    playSound('dice');
    
    const gameRef = ref(database, `games/${gameId}`);
    
    // Start rolling
    await update(gameRef, {
      isRolling: true,
      diceValue: null,
      updatedAt: Date.now()
    });

    setDiceRolling(true);
    setAnimatingPlayer(currentPlayer.id);
    setAnimationType('liftoff');
    playSound('rocket');
    moveCountRef.current += 1;

    // Simulate dice roll
    setTimeout(async () => {
      const diceValue = rollDice();
      const updatedGame = { ...gameState };
      const currentPlayer = updatedGame.players[updatedGame.currentPlayerIndex];

      const result = processMove(updatedGame, currentPlayer, diceValue);

      if (result.won) {
        playSound('victory');
        const gameDuration = Date.now() - (updatedGame.startedAt || updatedGame.createdAt);

        // Save to game history
        await saveGameHistory({
          gameId,
          players: updatedGame.players,
          winner: currentPlayer,
          startedAt: updatedGame.startedAt || updatedGame.createdAt,
          completedAt: Date.now(),
          totalMoves: moveCountRef.current,
          gameMode: 'online'
        });

        // Update leaderboard
        await recordWin(currentPlayer.name, gameId, gameDuration);
        updatedGame.players.forEach(player => {
          if (player.id !== currentPlayer.id) {
            recordGame(player.name);
          }
        });

        await update(gameRef, {
          players: updatedGame.players,
          diceValue,
          isRolling: false,
          gameWon: true,
          winner: currentPlayer,
          completedAt: Date.now(),
          gameDuration,
          message: result.message,
          updatedAt: Date.now()
        });
        return;
      }

      // Play sounds based on move result
      if (result.spaceport) {
        playSound('spaceport');
      } else if (result.alien) {
        playSound('alien');
      } else if (result.checkpoint) {
        playSound('checkpoint');
      }

      if (result.skipTurn) {
        updatedGame.currentPlayerIndex = (updatedGame.currentPlayerIndex + 1) % updatedGame.players.length;
        updatedGame.message = `${updatedGame.players[updatedGame.currentPlayerIndex].name}'s turn! Press SPIN to roll!`;
        playSound('turn');
      } else {
        updatedGame.currentPlayerIndex = (updatedGame.currentPlayerIndex + 1) % updatedGame.players.length;
        updatedGame.message = result.message;
        if (!updatedGame.gameWon) {
          updatedGame.message = `${updatedGame.players[updatedGame.currentPlayerIndex].name}'s turn! Press SPIN to roll!`;
          playSound('turn');
        }
      }

      await update(gameRef, {
        players: updatedGame.players,
        currentPlayerIndex: updatedGame.currentPlayerIndex,
        diceValue,
        isRolling: false,
        totalMoves: moveCountRef.current,
        message: updatedGame.message,
        updatedAt: Date.now()
      });
    }, 1500);
  };

  const handlePauseGame = async () => {
    if (!gameState || gameState.gameWon || gameState.isPaused) return;
    
    const currentPlayer = gameState.players.find(p => p.id === playerId);
    if (!currentPlayer) return;

    const gameRef = ref(database, `games/${gameId}`);
    await update(gameRef, {
      isPaused: true,
      pausedBy: currentPlayer.name,
      pausedAt: Date.now(),
      message: `Game paused by ${currentPlayer.name}`,
      updatedAt: Date.now()
    });
  };

  const handleResumeGame = async () => {
    if (!gameState || !gameState.isPaused) return;
    
    const currentPlayer = gameState.players.find(p => p.id === playerId);
    if (!currentPlayer) return;

    // Only the player who paused can resume, or any player if paused for > 5 minutes
    const pausedDuration = Date.now() - (gameState.pausedAt || 0);
    if (gameState.pausedBy !== currentPlayer.name && pausedDuration < 5 * 60 * 1000) {
      return;
    }

    const gameRef = ref(database, `games/${gameId}`);
    await update(gameRef, {
      isPaused: false,
      pausedBy: null,
      pausedAt: null,
      message: `${gameState.players[gameState.currentPlayerIndex].name}'s turn! Press SPIN to roll!`,
      updatedAt: Date.now()
    });
  };

  const handleResetGame = async () => {
    if (!gameState) return;

    playSound('click');

    const gameRefPath = ref(database, `games/${gameId}`);
    const updatedPlayers = gameState.players.map(p => ({
      ...p,
      position: 0,
      lastCheckpoint: 0
    }));

    moveCountRef.current = 0;

    await update(gameRefPath, {
      players: updatedPlayers,
      currentPlayerIndex: 0,
      diceValue: null,
      message: `${updatedPlayers[0].name}'s turn! Press SPIN to start!`,
      gameWon: false,
      winner: null,
      isRolling: false,
      isPaused: false,
      pausedBy: null,
      pausedAt: null,
      totalMoves: 0,
      startedAt: Date.now(),
      updatedAt: Date.now()
    });
  };

  return {
    gameState,
    gameId,
    playerId,
    connected,
    animatingPlayer: rocketAnimatingPlayer || animatingPlayer,
    animationType,
    alienBlink,
    diceRolling,
    animatedPositions,
    encounterType,
    createGame,
    joinGame,
    handleRollDice,
    handleResetGame,
    handlePauseGame,
    handleResumeGame
  };
}

