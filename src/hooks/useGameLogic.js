import { useState, useEffect } from 'react';
import { useGameSounds } from './useGameSounds';

const BOARD_SIZE = 100;
const SPACEPORTS = {
  4: 18, 9: 31, 15: 42, 21: 56, 28: 64,
  36: 70, 51: 77, 62: 85, 71: 91, 80: 96
};
const ALIENS = [14, 23, 29, 38, 45, 50, 54, 61, 68, 75, 82, 88, 94, 98];
const CHECKPOINTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

export function useGameLogic() {
  const { playSound } = useGameSounds();
  
  const playerColors = [
    'text-yellow-300',
    'text-blue-300',
    'text-green-300',
    'text-pink-300'
  ];

  const playerCorners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([
    { id: 1, position: 0, lastCheckpoint: 0, color: playerColors[0], name: 'Player 1', corner: playerCorners[0] },
    { id: 2, position: 0, lastCheckpoint: 0, color: playerColors[1], name: 'Player 2', corner: playerCorners[1] }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState("Player 1's turn! Press SPIN to start!");
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState(null);
  const [animatingPlayer, setAnimatingPlayer] = useState(null);
  const [animationType, setAnimationType] = useState(null);
  const [alienBlink, setAlienBlink] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newBlink = {};
      ALIENS.forEach(pos => {
        newBlink[pos] = Math.random() > 0.5;
      });
      setAlienBlink(newBlink);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getLastCheckpoint = (position) => {
    for (let i = CHECKPOINTS.length - 1; i >= 0; i--) {
      if (CHECKPOINTS[i] <= position) {
        return CHECKPOINTS[i];
      }
    }
    return 0;
  };

  const addPlayer = () => {
    if (numPlayers < 4) {
      const newPlayerNum = numPlayers + 1;
      setNumPlayers(newPlayerNum);
      setPlayers([...players, {
        id: newPlayerNum,
        position: 0,
        lastCheckpoint: 0,
        color: playerColors[newPlayerNum - 1],
        name: `Player ${newPlayerNum}`,
        corner: playerCorners[newPlayerNum - 1]
      }]);
    }
  };

  const removePlayer = () => {
    if (numPlayers > 2) {
      setNumPlayers(numPlayers - 1);
      setPlayers(players.slice(0, -1));
      if (currentPlayerIndex >= numPlayers - 1) {
        setCurrentPlayerIndex(0);
      }
    }
  };

  const rollDice = () => {
    if (isRolling || gameWon) return;
    
    playSound('click');
    setIsRolling(true);
    setMessage("Rolling...");
    playSound('dice');
    
    let rolls = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls > 10) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        movePlayer(finalRoll);
      }
    }, 100);
  };

  const movePlayer = async (steps) => {
    const currentPlayer = players[currentPlayerIndex];
    const isFirstMove = currentPlayer.position === 0;
    let newPosition = currentPlayer.position + steps;

    // If player is at position 0 (starting), they enter the board at position 1
    if (isFirstMove) {
      newPosition = steps; // Move directly to the rolled position
      setMessage(`🚀 ${currentPlayer.name} blasts off into space!`);
    }

    if (newPosition > BOARD_SIZE) {
      setMessage(`${currentPlayer.name} rolled ${steps} but needs exactly ${BOARD_SIZE - currentPlayer.position} to win! Turn passes.`);
      setTimeout(() => {
        nextPlayer();
      }, 2000);
      return;
    }

    setAnimatingPlayer(currentPlayer.id);

    // Special blast-off animation for first move
    if (isFirstMove) {
      setAnimationType('blastoff');
      playSound('spaceport'); // Use spaceport sound for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 1200));
    } else {
      setAnimationType('liftoff');
      playSound('rocket');
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].position = newPosition;
    setPlayers(updatedPlayers);
    
    setAnimationType('landing');
    await new Promise(resolve => setTimeout(resolve, 600));
    setAnimationType(null);
    
    if (newPosition === BOARD_SIZE) {
      setMessage(`🎉 ${currentPlayer.name} WINS! Reached the edge of the galaxy!`);
      setGameWon(true);
      setWinner(currentPlayer);
      setIsRolling(false);
      setAnimatingPlayer(null);
      playSound('victory');
      return;
    }
    
    if (SPACEPORTS[newPosition]) {
      const destination = SPACEPORTS[newPosition];
      setMessage(`${currentPlayer.name} entered spaceport at ${newPosition}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      playSound('spaceport');
      setAnimationType('liftoff');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updatedPlayers[currentPlayerIndex].position = destination;
      updatedPlayers[currentPlayerIndex].lastCheckpoint = getLastCheckpoint(destination);
      setPlayers(updatedPlayers);
      
      setAnimationType('landing');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessage(`🚀 ${currentPlayer.name} warped to position ${destination}!`);
      setAnimationType(null);
      setAnimatingPlayer(null);
      
      setTimeout(() => {
        nextPlayer();
      }, 1500);
      return;
    }
    
    if (ALIENS.includes(newPosition)) {
      setMessage(`👾 ${currentPlayer.name} encountered an alien at ${newPosition}!`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      playSound('alien');
      setAnimationType('eaten');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const checkpoint = updatedPlayers[currentPlayerIndex].lastCheckpoint;
      updatedPlayers[currentPlayerIndex].position = checkpoint;
      setPlayers(updatedPlayers);
      
      setAnimationType('landing');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessage(`${currentPlayer.name} was eaten! Returned to checkpoint ${checkpoint}!`);
      setAnimationType(null);
      setAnimatingPlayer(null);
      
      setTimeout(() => {
        nextPlayer();
      }, 1500);
      return;
    }
    
    const newCheckpoint = getLastCheckpoint(newPosition);
    if (newCheckpoint > currentPlayer.lastCheckpoint) {
      updatedPlayers[currentPlayerIndex].lastCheckpoint = newCheckpoint;
      setPlayers(updatedPlayers);
      setMessage(`✓ ${currentPlayer.name} reached checkpoint ${newCheckpoint}! Now at position ${newPosition}`);
      playSound('checkpoint');
    } else {
      setMessage(`${currentPlayer.name} rolled ${steps}, moved to position ${newPosition}`);
    }
    
    setAnimatingPlayer(null);
    
    setTimeout(() => {
      nextPlayer();
    }, 1500);
  };

  const nextPlayer = () => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    setMessage(`${players[nextIndex].name}'s turn! Press SPIN to roll!`);
    setIsRolling(false);
    playSound('turn');
  };

  const resetGame = () => {
    playSound('click');
    setPlayers(players.map(p => ({ ...p, position: 0, lastCheckpoint: 0 })));
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setMessage("Player 1's turn! Press SPIN to start!");
    setGameWon(false);
    setWinner(null);
    setAnimatingPlayer(null);
    setAnimationType(null);
  };

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
    animationType,
    alienBlink,
    addPlayer,
    removePlayer,
    rollDice,
    resetGame
  };
}

