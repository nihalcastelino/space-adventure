import React, { useState, useEffect } from 'react';
import { Rocket, Zap, AlertCircle, Users, Plus, Minus } from 'lucide-react';

const SpaceAdventure = () => {
  const boardSize = 100;
  
  // Spaceports (like ladders) - more strategic placement for 100 spaces
  const spaceports = {
    4: 18,
    9: 31,
    15: 42,
    21: 56,
    28: 64,
    36: 70,
    51: 77,
    62: 85,
    71: 91,
    80: 96
  };
  
  // Aliens (like snakes) - more frequent obstacles
  const aliens = [14, 23, 29, 38, 45, 50, 54, 61, 68, 75, 82, 88, 94, 98];
  
  // Checkpoints - safe spots you return to when eaten
  const checkpoints = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([
    { id: 1, position: 0, lastCheckpoint: 0, color: 'text-yellow-300', name: 'Player 1', corner: 'top-left' },
    { id: 2, position: 0, lastCheckpoint: 0, color: 'text-blue-300', name: 'Player 2', corner: 'top-right' }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState("Player 1's turn! Press SPIN to start!");
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState(null);
  const [animatingPlayer, setAnimatingPlayer] = useState(null);
  const [animationType, setAnimationType] = useState(null); // 'liftoff', 'landing', 'eaten'
  const [alienBlink, setAlienBlink] = useState({});

  const playerColors = [
    'text-yellow-300',
    'text-blue-300',
    'text-green-300',
    'text-pink-300'
  ];

  const playerCorners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  // Animate aliens
  useEffect(() => {
    const interval = setInterval(() => {
      const newBlink = {};
      aliens.forEach(pos => {
        newBlink[pos] = Math.random() > 0.5;
      });
      setAlienBlink(newBlink);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

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

  const getLastCheckpoint = (position) => {
    for (let i = checkpoints.length - 1; i >= 0; i--) {
      if (checkpoints[i] <= position) {
        return checkpoints[i];
      }
    }
    return 0;
  };

  const rollDice = () => {
    if (isRolling || gameWon) return;
    
    setIsRolling(true);
    setMessage("Rolling...");
    
    // Animate dice roll
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
    let newPosition = currentPlayer.position + steps;
    
    // Must land exactly on 100 to win
    if (newPosition > boardSize) {
      setMessage(`${currentPlayer.name} rolled ${steps} but needs exactly ${boardSize - currentPlayer.position} to win! Turn passes.`);
      setTimeout(() => {
        nextPlayer();
      }, 2000);
      return;
    }
    
    // Liftoff animation
    setAnimatingPlayer(currentPlayer.id);
    setAnimationType('liftoff');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update position
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].position = newPosition;
    setPlayers(updatedPlayers);
    
    // Landing animation
    setAnimationType('landing');
    await new Promise(resolve => setTimeout(resolve, 600));
    setAnimationType(null);
    
    // Check if player reaches exactly 100
    if (newPosition === boardSize) {
      setMessage(`🎉 ${currentPlayer.name} WINS! Reached the edge of the galaxy!`);
      setGameWon(true);
      setWinner(currentPlayer);
      setIsRolling(false);
      setAnimatingPlayer(null);
      return;
    }
    
    // Check for spaceport
    if (spaceports[newPosition]) {
      const destination = spaceports[newPosition];
      setMessage(`${currentPlayer.name} entered spaceport at ${newPosition}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Warp animation
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
    
    // Check for alien
    if (aliens.includes(newPosition)) {
      setMessage(`👾 ${currentPlayer.name} encountered an alien at ${newPosition}!`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Eaten animation
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
    
    // Update checkpoint if passed
    const newCheckpoint = getLastCheckpoint(newPosition);
    if (newCheckpoint > currentPlayer.lastCheckpoint) {
      updatedPlayers[currentPlayerIndex].lastCheckpoint = newCheckpoint;
      setPlayers(updatedPlayers);
      setMessage(`✓ ${currentPlayer.name} reached checkpoint ${newCheckpoint}! Now at position ${newPosition}`);
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
  };

  const resetGame = () => {
    setPlayers(players.map(p => ({ ...p, position: 0, lastCheckpoint: 0 })));
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setMessage("Player 1's turn! Press SPIN to start!");
    setGameWon(false);
    setWinner(null);
    setAnimatingPlayer(null);
    setAnimationType(null);
  };

  const getSpaceTheme = (cellNumber) => {
    // Different realistic space backgrounds using CSS patterns and images
    const themes = [
      { 
        style: { 
          backgroundImage: 'radial-gradient(circle at 30% 40%, #e0e0e0 0%, #8b8b8b 40%, #1a1a1a 100%)',
          backgroundSize: 'cover'
        }, 
        label: 'Moon' 
      },
      { 
        style: { 
          backgroundImage: 'radial-gradient(ellipse at center, #ff6b35 0%, #f7931e 25%, #c1272d 50%, #1a0a0a 100%)',
          backgroundSize: 'cover'
        }, 
        label: 'Mars' 
      },
      { 
        style: { 
          backgroundImage: 'radial-gradient(circle at 40% 50%, #4a90e2 0%, #2e5c8a 30%, #1e3a5f 60%, #0a0a0a 100%)',
          backgroundSize: 'cover'
        }, 
        label: 'Neptune' 
      },
      { 
        style: { 
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, #ffd700 0%, #ffed4e 20%, #ff6b00 60%, #000 100%)',
          backgroundSize: 'cover'
        }, 
        label: 'Sun' 
      },
      { 
        style: { 
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 2%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08) 0%, transparent 2%),
            radial-gradient(circle at 40% 60%, rgba(255,255,255,0.12) 0%, transparent 1.5%),
            radial-gradient(circle at 60% 40%, rgba(255,255,255,0.15) 0%, transparent 1%),
            radial-gradient(ellipse at 50% 50%, #1a1a2e 0%, #16213e 50%, #0f1419 100%)
          `,
          backgroundSize: 'cover'
        }, 
        label: 'Deep Space' 
      },
      { 
        style: { 
          backgroundImage: `
            radial-gradient(ellipse at 50% 50%, rgba(138, 43, 226, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 30% 70%, rgba(255, 20, 147, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 30%, rgba(0, 191, 255, 0.3) 0%, transparent 50%),
            linear-gradient(to bottom, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)
          `,
          backgroundSize: 'cover'
        }, 
        label: 'Nebula' 
      },
      { 
        style: { 
          backgroundImage: `
            radial-gradient(ellipse at 60% 40%, #d4a574 0%, #c9984a 40%, #4a3728 100%)
          `,
          backgroundSize: 'cover'
        }, 
        label: 'Europa' 
      },
      { 
        style: { 
          backgroundImage: `
            repeating-linear-gradient(0deg, #f4e4c1 0px, #e8d5b7 10px, #d4b896 20px, #c9a876 30px, #f4e4c1 40px),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)
          `,
          backgroundSize: 'cover'
        }, 
        label: 'Saturn' 
      },
      { 
        style: { 
          backgroundImage: 'radial-gradient(circle at 35% 35%, #00ff88 0%, #00cc66 20%, #004422 50%, #001100 100%)',
          backgroundSize: 'cover'
        }, 
        label: 'Earth' 
      },
      { 
        style: { 
          backgroundImage: `
            radial-gradient(circle at 40% 60%, rgba(255,255,255,0.05) 0%, transparent 3%),
            radial-gradient(circle at 70% 20%, rgba(255,255,255,0.08) 0%, transparent 2%),
            radial-gradient(circle at 10% 80%, rgba(255,255,255,0.06) 0%, transparent 2.5%),
            linear-gradient(135deg, #2c1654 0%, #1a0933 50%, #0d041b 100%)
          `,
          backgroundSize: 'cover'
        }, 
        label: 'Galaxy' 
      },
      { 
        style: { 
          backgroundImage: 'radial-gradient(circle at 50% 50%, #ff4500 0%, #ff6347 30%, #8b0000 70%, #000 100%)',
          backgroundSize: 'cover'
        }, 
        label: 'Red Giant' 
      },
      { 
        style: { 
          backgroundImage: `
            radial-gradient(circle at 15% 25%, rgba(255,255,255,0.6) 0%, transparent 8%),
            radial-gradient(circle at 45% 55%, rgba(255,255,255,0.4) 0%, transparent 6%),
            radial-gradient(circle at 75% 35%, rgba(255,255,255,0.5) 0%, transparent 7%),
            linear-gradient(to bottom, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)
          `,
          backgroundSize: 'cover'
        }, 
        label: 'Asteroid' 
      },
    ];
    
    return themes[cellNumber % themes.length];
  };

  const renderBoard = () => {
    const cells = [];
    const rows = 10;
    const cols = 10;
    
    for (let row = rows - 1; row >= 0; row--) {
      const rowCells = [];
      const isEvenRow = row % 2 === 0;
      
      for (let col = 0; col < cols; col++) {
        const actualCol = isEvenRow ? col : (cols - 1 - col);
        const cellNumber = row * cols + actualCol + 1;
        
        const playersHere = players.filter(p => p.position === cellNumber);
        const isSpaceport = spaceports[cellNumber];
        const isAlien = aliens.includes(cellNumber);
        const isCheckpoint = checkpoints.includes(cellNumber);
        const isFinish = cellNumber === boardSize;
        
        const spaceTheme = getSpaceTheme(cellNumber);
        
        let cellStyle = spaceTheme.style;
        
        // Override with special themes for special cells
        if (isFinish) {
          cellStyle = {
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(255,215,0,0.3) 0%, transparent 60%),
              repeating-linear-gradient(45deg, #FFD700 0px, #FFD700 10px, #FFA500 10px, #FFA500 20px),
              linear-gradient(to bottom, #ffed4e 0%, #ff6b00 100%)
            `,
            backgroundSize: 'cover'
          };
        } else if (isSpaceport) {
          cellStyle = {
            backgroundImage: `
              radial-gradient(ellipse at 50% 60%, rgba(0,255,0,0.3) 0%, transparent 70%),
              repeating-radial-gradient(circle at 50% 50%, #0a4d0a 0px, #0a4d0a 5px, #0d6e0d 5px, #0d6e0d 10px),
              linear-gradient(to bottom, #1a5c1a 0%, #0a3d0a 100%)
            `,
            backgroundSize: 'cover'
          };
        } else if (isAlien) {
          cellStyle = {
            backgroundImage: `
              radial-gradient(ellipse at 50% 50%, rgba(255,0,0,0.4) 0%, transparent 60%),
              linear-gradient(135deg, #4a0000 0%, #8b0000 50%, #2a0000 100%)
            `,
            backgroundSize: 'cover'
          };
        } else if (isCheckpoint) {
          cellStyle = {
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(0,100,255,0.3) 0%, transparent 70%),
              linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)
            `,
            backgroundSize: 'cover'
          };
        }
        
        rowCells.push(
          <div
            key={cellNumber}
            style={cellStyle}
            className="border border-gray-900 flex flex-col items-center justify-center relative aspect-square overflow-hidden"
          >
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 100px'
            }}></div>
            
            {/* Starfield effect for regular spaces */}
            {!isSpaceport && !isAlien && !isFinish && !isCheckpoint && (
              <div className="absolute inset-0">
                <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-1 right-3 w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
                <div className="absolute bottom-3 left-4 w-0.5 h-0.5 bg-yellow-100 rounded-full opacity-90 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-white rounded-full opacity-70"></div>
                <div className="absolute top-1/2 left-1 w-0.5 h-0.5 bg-blue-100 rounded-full opacity-80"></div>
              </div>
            )}
            
            <span className="text-[9px] text-white absolute top-0.5 left-0.5 z-10 bg-black bg-opacity-60 px-1 rounded font-bold shadow-lg">{cellNumber}</span>
            
            {isSpaceport && (
              <div className="flex flex-col items-center z-10">
                <div className="text-3xl mb-1 drop-shadow-lg filter brightness-110">🛸</div>
                <div className="flex items-center gap-1 bg-black bg-opacity-50 px-2 py-0.5 rounded">
                  <Zap className="w-3 h-3 text-green-300 animate-pulse" />
                  <span className="text-[9px] text-green-300 font-bold">→{spaceports[cellNumber]}</span>
                </div>
                <div className="absolute inset-0 bg-green-400 opacity-10 animate-pulse rounded"></div>
                <div className="absolute inset-0 border-2 border-green-400 opacity-30 rounded animate-pulse"></div>
              </div>
            )}
            
            {isAlien && (
              <div className="relative z-10">
                <div className={`text-3xl drop-shadow-2xl ${alienBlink[cellNumber] ? 'animate-bounce' : ''}`}>
                  👾
                </div>
                <div className={`absolute inset-0 bg-red-500 rounded-full blur-lg opacity-30 ${alienBlink[cellNumber] ? 'animate-ping' : ''}`}></div>
                <div className="absolute -inset-3 border-2 border-red-400 rounded-full opacity-40 animate-pulse"></div>
                <div className="absolute -inset-4 border border-red-500 rounded-full opacity-20"></div>
              </div>
            )}
            
            {isCheckpoint && !isSpaceport && !isAlien && (
              <div className="flex flex-col items-center z-10">
                <div className="text-3xl mb-1 drop-shadow-lg filter brightness-110">🛡️</div>
                <div className="text-[8px] text-blue-200 font-bold bg-blue-900 bg-opacity-80 px-2 py-0.5 rounded shadow-lg">SAFE</div>
                <div className="absolute inset-0 border-2 border-blue-300 opacity-40 animate-pulse"></div>
              </div>
            )}
            
            {isFinish && (
              <div className="flex flex-col items-center z-10">
                <div className="text-4xl animate-pulse drop-shadow-2xl filter brightness-125">🏁</div>
                <div className="text-[9px] text-yellow-100 font-bold mt-1 bg-black bg-opacity-50 px-2 py-0.5 rounded shadow-lg">FINISH</div>
                <div className="absolute inset-0 bg-yellow-300 opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 border-4 border-yellow-400 opacity-50 animate-pulse"></div>
              </div>
            )}
            
            {playersHere.length > 0 && (
              <div className="absolute flex gap-0.5 items-center justify-center flex-wrap z-20">
                {playersHere.map(player => {
                  const isAnimating = animatingPlayer === player.id;
                  let animationClass = '';
                  
                  if (isAnimating) {
                    if (animationType === 'liftoff') {
                      animationClass = 'animate-rocket-liftoff';
                    } else if (animationType === 'landing') {
                      animationClass = 'animate-rocket-landing';
                    } else if (animationType === 'eaten') {
                      animationClass = 'animate-spin';
                    }
                  }
                  
                  return (
                    <div key={player.id} className="relative">
                      <Rocket className={`w-6 h-6 ${player.color} ${animationClass} drop-shadow-lg`} />
                      {isAnimating && animationType === 'liftoff' && (
                        <>
                          {/* Main exhaust flame */}
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-0">
                            <div className="w-3 h-4 bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 rounded-full opacity-80 animate-pulse blur-[2px]"></div>
                          </div>
                          {/* Secondary exhaust glow */}
                          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-0">
                            <div className="w-4 h-5 bg-gradient-to-b from-orange-400 via-red-500 to-transparent rounded-full opacity-60 animate-pulse blur-sm"></div>
                          </div>
                          {/* Smoke trail */}
                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-0">
                            <div className="w-5 h-6 bg-gray-400 rounded-full opacity-30 animate-pulse blur-md"></div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
      
      cells.push(
        <div key={row} className="grid grid-cols-10 gap-0">
          {rowCells}
        </div>
      );
    }
    
    return cells;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black overflow-hidden">
      <style>{`
        @keyframes rocket-liftoff {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.2); }
          100% { transform: translateY(-60px) scale(0.5) rotate(45deg); opacity: 0; }
        }
        @keyframes rocket-landing {
          0% { transform: translateY(-60px) scale(0.5) rotate(-45deg); opacity: 0; }
          50% { transform: translateY(-30px) scale(1.2); }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-rocket-liftoff {
          animation: rocket-liftoff 0.8s ease-in-out;
        }
        .animate-rocket-landing {
          animation: rocket-landing 0.6s ease-in-out;
        }
      `}</style>
      
      {/* Top Left - Player 1 */}
      {players[0] && (
        <div className="fixed top-4 left-4 w-64 bg-gray-900 bg-opacity-95 rounded-lg p-4 shadow-2xl border-2 border-gray-700">
          <div className={`p-3 rounded ${currentPlayerIndex === 0 ? 'bg-blue-800 border-2 border-blue-400 animate-pulse' : 'bg-gray-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className={`w-6 h-6 ${players[0].color}`} />
              <span className={`font-bold text-lg ${players[0].color}`}>{players[0].name}</span>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Position: <span className="font-bold text-white text-lg">{players[0].position}</span></div>
              <div>Checkpoint: <span className="font-bold text-blue-300">{players[0].lastCheckpoint}</span></div>
            </div>
          </div>
          {currentPlayerIndex === 0 && (
            <div className="mt-3">
              <button
                onClick={rollDice}
                disabled={isRolling || gameWon}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isRolling ? '🎲 ...' : '🎲 SPIN'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Top Right - Player 2 */}
      {players[1] && (
        <div className="fixed top-4 right-4 w-64 bg-gray-900 bg-opacity-95 rounded-lg p-4 shadow-2xl border-2 border-gray-700">
          <div className={`p-3 rounded ${currentPlayerIndex === 1 ? 'bg-blue-800 border-2 border-blue-400 animate-pulse' : 'bg-gray-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className={`w-6 h-6 ${players[1].color}`} />
              <span className={`font-bold text-lg ${players[1].color}`}>{players[1].name}</span>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Position: <span className="font-bold text-white text-lg">{players[1].position}</span></div>
              <div>Checkpoint: <span className="font-bold text-blue-300">{players[1].lastCheckpoint}</span></div>
            </div>
          </div>
          {currentPlayerIndex === 1 && (
            <div className="mt-3">
              <button
                onClick={rollDice}
                disabled={isRolling || gameWon}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isRolling ? '🎲 ...' : '🎲 SPIN'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Left - Player 3 */}
      {players[2] && (
        <div className="fixed bottom-4 left-4 w-64 bg-gray-900 bg-opacity-95 rounded-lg p-4 shadow-2xl border-2 border-gray-700">
          <div className={`p-3 rounded ${currentPlayerIndex === 2 ? 'bg-blue-800 border-2 border-blue-400 animate-pulse' : 'bg-gray-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className={`w-6 h-6 ${players[2].color}`} />
              <span className={`font-bold text-lg ${players[2].color}`}>{players[2].name}</span>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Position: <span className="font-bold text-white text-lg">{players[2].position}</span></div>
              <div>Checkpoint: <span className="font-bold text-blue-300">{players[2].lastCheckpoint}</span></div>
            </div>
          </div>
          {currentPlayerIndex === 2 && (
            <div className="mt-3">
              <button
                onClick={rollDice}
                disabled={isRolling || gameWon}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isRolling ? '🎲 ...' : '🎲 SPIN'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Right - Player 4 */}
      {players[3] && (
        <div className="fixed bottom-4 right-4 w-64 bg-gray-900 bg-opacity-95 rounded-lg p-4 shadow-2xl border-2 border-gray-700">
          <div className={`p-3 rounded ${currentPlayerIndex === 3 ? 'bg-blue-800 border-2 border-blue-400 animate-pulse' : 'bg-gray-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className={`w-6 h-6 ${players[3].color}`} />
              <span className={`font-bold text-lg ${players[3].color}`}>{players[3].name}</span>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Position: <span className="font-bold text-white text-lg">{players[3].position}</span></div>
              <div>Checkpoint: <span className="font-bold text-blue-300">{players[3].lastCheckpoint}</span></div>
            </div>
          </div>
          {currentPlayerIndex === 3 && (
            <div className="mt-3">
              <button
                onClick={rollDice}
                disabled={isRolling || gameWon}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isRolling ? '🎲 ...' : '🎲 SPIN'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Center Top - Title and Controls */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-3xl font-bold text-center text-yellow-300 flex items-center justify-center gap-2 bg-gray-900 bg-opacity-90 px-6 py-2 rounded-lg shadow-2xl">
          <Rocket className="w-8 h-8" />
          Space Race to 100!
        </h1>
      </div>

      {/* Center Bottom - Game Status and Controls */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-96">
        <div className="bg-gray-900 bg-opacity-95 rounded-lg p-4 shadow-2xl border-2 border-gray-700">
          <div className="bg-gray-800 p-3 rounded text-center mb-3">
            <div className="text-xs text-gray-400 mb-1">Dice Roll</div>
            <div className="text-4xl font-bold text-white">
              {diceValue || '?'}
            </div>
          </div>
          
          <div className="bg-blue-900 bg-opacity-50 p-2 rounded mb-3">
            <p className="text-white font-medium text-sm text-center">{message}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetGame}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg transition-all text-sm"
            >
              Reset
            </button>
            <button
              onClick={removePlayer}
              disabled={numPlayers <= 2}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={addPlayer}
              disabled={numPlayers >= 4}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Center - Game Board - Always Visible */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-gray-900 bg-opacity-90 rounded-lg p-3 shadow-2xl border-2 border-gray-700" style={{ maxWidth: '600px', maxHeight: '600px' }}>
          {renderBoard()}
        </div>
      </div>
    </div>
  );
};

export default SpaceAdventure;