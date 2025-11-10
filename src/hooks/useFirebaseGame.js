import { useState, useEffect, useRef } from 'react';
import { database } from '../lib/firebase';
import { ref, set, onValue, update } from 'firebase/database';
import { useGameSounds } from './useGameSounds';

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
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [animatingPlayer, setAnimatingPlayer] = useState(null);
  const [animationType, setAnimationType] = useState(null);
  const [alienBlink, setAlienBlink] = useState({});
  const [diceRolling, setDiceRolling] = useState(false);
  const gameRef = useRef(null);

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
        name: playerName,
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
      message: `${playerName}'s turn! Press SPIN to start!`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const gameRef = ref(database, `games/${newGameId}`);
    await set(gameRef, game);
    
    setGameId(newGameId);
    setPlayerId(newPlayerId);
    setGameState(game);
    setConnected(true);
    
    // Listen for changes
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
        setAnimatingPlayer(null);
        setAnimationType(null);
        setDiceRolling(false);
      }
    });

    return newGameId;
  };

  const joinGame = async (gameIdToJoin, playerName) => {
    return new Promise((resolve, reject) => {
      const newPlayerId = uuidv4();
      const gameRef = ref(database, `games/${gameIdToJoin}`);
      
      // First check if game exists
      onValue(gameRef, async (snapshot) => {
        const game = snapshot.val();
        if (!game) {
          reject(new Error('Game not found'));
          return;
        }

        if (game.players.length >= 4) {
          reject(new Error('Game is full'));
          return;
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
          name: playerName,
          position: 0,
          lastCheckpoint: 0,
          color: playerColors[game.players.length],
          corner: playerCorners[game.players.length],
          createdAt: Date.now()
        };

        const updatedPlayers = [...game.players, newPlayer];
        const updates = {
          players: updatedPlayers,
          message: `${playerName} joined! ${game.players[0].name}'s turn!`,
          updatedAt: Date.now()
        };

        try {
          await update(gameRef, updates);
          setGameId(gameIdToJoin);
          setPlayerId(newPlayerId);
          setConnected(true);
          resolve();
        } catch (err) {
          reject(err);
        }
      }, { onlyOnce: true });

      // Listen for changes
      let previousState = null;
      onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Detect state changes and play sounds
          if (previousState) {
            // Check for game won
            if (data.gameWon && !previousState.gameWon) {
              playSound('victory');
            }
            // Check for dice roll completion
            if (data.diceValue && !previousState.diceValue && previousState.isRolling) {
              playSound('rocket');
            }
            // Check for spaceport/alien/checkpoint in message
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
          setAnimatingPlayer(null);
          setAnimationType(null);
          setDiceRolling(false);
        }
      });
    });
  };

  const handleRollDice = async () => {
    if (!gameState || gameState.isRolling || gameState.gameWon) return;
    
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

    // Simulate dice roll
    setTimeout(async () => {
      const diceValue = rollDice();
      const updatedGame = { ...gameState };
      const currentPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
      
      const result = processMove(updatedGame, currentPlayer, diceValue);

      if (result.won) {
        playSound('victory');
        await update(gameRef, {
          players: updatedGame.players,
          diceValue,
          isRolling: false,
          gameWon: true,
          winner: currentPlayer,
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
        message: updatedGame.message,
        updatedAt: Date.now()
      });
    }, 1500);
  };

  const handleResetGame = async () => {
    if (!gameState) return;
    
    playSound('click');
    
    const gameRef = ref(database, `games/${gameId}`);
    const updatedPlayers = gameState.players.map(p => ({
      ...p,
      position: 0,
      lastCheckpoint: 0
    }));

    await update(gameRef, {
      players: updatedPlayers,
      currentPlayerIndex: 0,
      diceValue: null,
      message: `${updatedPlayers[0].name}'s turn! Press SPIN to start!`,
      gameWon: false,
      winner: null,
      isRolling: false,
      updatedAt: Date.now()
    });
  };

  return {
    gameState,
    gameId,
    playerId,
    connected,
    animatingPlayer,
    animationType,
    alienBlink,
    diceRolling,
    createGame,
    joinGame,
    handleRollDice,
    handleResetGame
  };
}

