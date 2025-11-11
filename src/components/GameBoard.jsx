import { Rocket, Zap, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

// Hook to get responsive font size and styling
const useResponsiveSize = () => {
  const [size, setSize] = useState({ 
    spaceport: 32, 
    rocket: 28,
    spaceportOpacity: 0.25,
    spaceportGlow: '10px',
    spaceportGlowOpacity: 0.3
  });
  
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setSize({
        spaceport: width < 640 ? 18 : width < 768 ? 24 : 32,
        rocket: width < 640 ? 16 : width < 768 ? 20 : 28,
        spaceportOpacity: width < 640 ? 0.15 : 0.25,
        spaceportGlow: width < 640 ? '5px' : '10px',
        spaceportGlowOpacity: width < 640 ? 0.15 : 0.3
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  return size;
};

const DEFAULT_BOARD_SIZE = 100;
const SPACEPORTS = {
  4: 18, 9: 31, 15: 42, 21: 56, 28: 64,
  36: 70, 51: 77, 62: 85, 71: 91, 80: 96
};

// Default values for backward compatibility
const DEFAULT_ALIENS = [14, 23, 29, 38, 45, 50, 54, 61, 68, 75, 82, 88, 94, 98];
const DEFAULT_CHECKPOINTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function GameBoard({
  players,
  animatingPlayer,
  animationType,
  alienBlink,
  animatedPositions = {},
  encounterType = null,
  aliens = DEFAULT_ALIENS,
  checkpoints = DEFAULT_CHECKPOINTS,
  hazards = null, // Jeopardy mechanics hazards
  rogueState = null, // Rogue player state
  boardSize = DEFAULT_BOARD_SIZE // Variant-specific board size
}) {
  const ALIENS = aliens;
  const CHECKPOINTS = checkpoints;
  const [sparkles, setSparkles] = useState([]);
  const responsiveSize = useResponsiveSize();

  const BOARD_SIZE = boardSize; // Use variant-specific board size
  
  // Override getCellColor to use responsive opacity for spaceports
  const getCellColorResponsive = (cellNumber) => {
    const hazard = getHazardAtCell(cellNumber);
    if (hazard) {
      if (hazard.type === 'blackHole') return 'rgba(88, 28, 135, 0.5)';
      if (hazard.type === 'blackHoleWarning') return 'rgba(251, 146, 60, 0.4)';
      if (hazard.type === 'patrol') return 'rgba(185, 28, 28, 0.4)';
      if (hazard.type === 'meteor') return 'rgba(234, 88, 12, 0.5)';
    }
    if (cellNumber === BOARD_SIZE) return 'rgba(251, 191, 36, 0.25)';
    if (SPACEPORTS[cellNumber]) return `rgba(16, 185, 129, ${responsiveSize.spaceportOpacity})`;
    if (ALIENS.includes(cellNumber)) return 'rgba(239, 68, 68, 0.25)';
    if (CHECKPOINTS.includes(cellNumber)) return 'rgba(59, 130, 246, 0.25)';
    return 'rgba(31, 41, 55, 0.7)';
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newSparkles = [];
      [...Object.keys(SPACEPORTS), ...CHECKPOINTS, BOARD_SIZE].forEach(pos => {
        if (Math.random() > 0.7) {
          newSparkles.push({
            id: `${pos}-${Date.now()}-${Math.random()}`,
            cell: parseInt(pos),
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 0.5
          });
        }
      });
      setSparkles(prev => [...prev, ...newSparkles].slice(-20));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Check if cell has hazards
  const getHazardAtCell = (cellNumber) => {
    if (!hazards) return null;

    // Check black holes
    const blackHole = hazards.blackHoles.find(bh => bh.position === cellNumber);
    if (blackHole) {
      return {
        type: blackHole.isCollapsed ? 'blackHole' : 'blackHoleWarning',
        icon: blackHole.isCollapsed ? '🕳️' : '⚠️',
        turnsUntilCollapse: blackHole.turnsUntilCollapse
      };
    }

    // Check patrol zones
    if (hazards.patrolZones.includes(cellNumber)) {
      return {
        type: 'patrol',
        icon: '🚨'
      };
    }

    // Check meteor impacts
    const meteor = hazards.meteorImpacts.find(m => m.position === cellNumber);
    if (meteor) {
      return {
        type: 'meteor',
        icon: '🔥',
        turnsRemaining: meteor.turnsRemaining
      };
    }

    return null;
  };

  const getCellColor = (cellNumber) => {
    const hazard = getHazardAtCell(cellNumber);

    // Hazards override normal colors
    if (hazard) {
      if (hazard.type === 'blackHole') return 'rgba(88, 28, 135, 0.5)'; // Purple for black hole
      if (hazard.type === 'blackHoleWarning') return 'rgba(251, 146, 60, 0.4)'; // Orange warning
      if (hazard.type === 'patrol') return 'rgba(185, 28, 28, 0.4)'; // Dark red for patrol
      if (hazard.type === 'meteor') return 'rgba(234, 88, 12, 0.5)'; // Orange-red for meteor
    }

    if (cellNumber === BOARD_SIZE) return 'rgba(251, 191, 36, 0.25)'; // Gold for finish
    if (SPACEPORTS[cellNumber]) {
      // Use responsive opacity from hook (will be set in component)
      return 'rgba(16, 185, 129, 0.25)'; // Default, will be overridden
    }
    if (ALIENS.includes(cellNumber)) return 'rgba(239, 68, 68, 0.25)'; // Red for alien
    if (CHECKPOINTS.includes(cellNumber)) return 'rgba(59, 130, 246, 0.25)'; // Blue for checkpoint
    return 'rgba(31, 41, 55, 0.7)'; // More opaque dark gray for regular cells
  };

  const renderBoard = () => {
    const cells = [];
    // Calculate grid dimensions based on board size
    // For 50 squares: 5x10, for 100: 10x10, for 200: 10x20
    const cols = 10; // Always 10 columns for consistent layout
    const rows = Math.ceil(BOARD_SIZE / cols);

    for (let row = rows - 1; row >= 0; row--) {
      const isEvenRow = row % 2 === 0;

      for (let col = 0; col < cols; col++) {
        const actualCol = isEvenRow ? col : (cols - 1 - col);
        const cellNumber = row * cols + actualCol + 1;

        if (cellNumber < 1 || cellNumber > BOARD_SIZE) continue;

        // Check for players - use animated position if available
        const playersHere = players.filter(p => {
          const pos = animatedPositions[p.id] !== undefined ? animatedPositions[p.id] : p.position;
          return pos === cellNumber;
        });
        const isSpaceport = SPACEPORTS[cellNumber];
        const isAlien = ALIENS.includes(cellNumber);
        const isCheckpoint = CHECKPOINTS.includes(cellNumber);
        const isFinish = cellNumber === BOARD_SIZE;
        const hazard = getHazardAtCell(cellNumber);
        const isRogue = rogueState && rogueState.active && rogueState.position === cellNumber;

        // Check if this cell has encounter effect
        const hasSpaceportEffect = encounterType === 'spaceport' && playersHere.some(p => p.id === animatingPlayer);
        const hasAlienEffect = encounterType === 'alien' && playersHere.some(p => p.id === animatingPlayer);

        const bgColor = getCellColorResponsive(cellNumber);

        cells.push(
          <div
            key={`cell-${cellNumber}`}
            style={{
              backgroundColor: bgColor,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '4px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontWeight: 'bold',
              aspectRatio: '1',
              minHeight: '0',
              minWidth: '0',
              boxShadow: hasSpaceportEffect
                ? '0 0 30px rgba(16, 185, 129, 0.9), inset 0 0 20px rgba(16, 185, 129, 0.5)'
                : hasAlienEffect
                ? '0 0 30px rgba(239, 68, 68, 0.9), inset 0 0 20px rgba(239, 68, 68, 0.5)'
                : isSpaceport || isAlien || isCheckpoint || isFinish
                ? 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 ' + (
                    isFinish ? '10px rgba(251, 191, 36, 0.3)' :
                    isSpaceport ? `${responsiveSize.spaceportGlow} rgba(16, 185, 129, ${responsiveSize.spaceportGlowOpacity})` :
                    isAlien ? '10px rgba(239, 68, 68, 0.3)' :
                    '10px rgba(59, 130, 246, 0.3)'
                  )
                : 'inset 0 0 10px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
              animation: hasSpaceportEffect ? 'warp-pulse 0.8s ease-in-out' : hasAlienEffect ? 'alien-shake 0.5s ease-in-out' : 'none'
            }}
          >
            {/* Cell number in corner */}
            <span style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              fontSize: '9px',
              zIndex: 1,
              opacity: 0.9,
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 'bold',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
            }}>
              {cellNumber}
            </span>

            {/* Spaceport */}
            {isSpaceport && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: `${responsiveSize.spaceport}px`,
                zIndex: 5,
                filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 10px rgba(16, 185, 129, 0.8)) contrast(1.3) saturate(1.4)',
                animation: 'float 3s ease-in-out infinite'
              }}>
                🛸
              </div>
            )}

            {/* Alien */}
            {isAlien && !isRogue && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '32px',
                zIndex: 5,
                filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 10px rgba(239, 68, 68, 0.8)) contrast(1.3) saturate(1.4)',
                animation: alienBlink[cellNumber] ? 'none' : 'pulse 2s ease-in-out infinite'
              }}>
                👾
              </div>
            )}

            {/* Rogue Alien */}
            {isRogue && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '36px',
                zIndex: 6,
                filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 15px rgba(168, 85, 247, 0.9)) drop-shadow(0 0 25px rgba(34, 197, 94, 0.6)) contrast(1.4) saturate(1.5)',
                animation: 'pulse 1.5s ease-in-out infinite',
                textShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 30px rgba(34, 197, 94, 0.6)'
              }}>
                👽
              </div>
            )}

            {/* Checkpoint */}
            {isCheckpoint && !isSpaceport && !isAlien && !isRogue && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '32px',
                zIndex: 5,
                filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 10px rgba(59, 130, 246, 0.8)) contrast(1.3) saturate(1.4)'
              }}>
                🛡️
              </div>
            )}

            {/* Finish line */}
            {isFinish && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '36px',
                zIndex: 5,
                filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px rgba(251, 191, 36, 1)) contrast(1.3) saturate(1.4)'
              }}>
                🏁
              </div>
            )}

            {/* Hazards */}
            {hazard && (
              <>
                {/* Hazard Icon */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '32px',
                  zIndex: 6,
                  filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px currentColor) contrast(1.3) saturate(1.4)',
                  animation: hazard.type === 'blackHole'
                    ? 'black-hole-swirl 2s linear infinite'
                    : hazard.type === 'blackHoleWarning'
                    ? 'warning-pulse 1s ease-in-out infinite'
                    : hazard.type === 'patrol'
                    ? 'patrol-blink 1s step-end infinite'
                    : hazard.type === 'meteor'
                    ? 'meteor-flicker 0.5s ease-in-out infinite'
                    : 'none'
                }}>
                  {hazard.icon}
                </div>

                {/* Warning Countdown */}
                {hazard.type === 'blackHoleWarning' && (
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    zIndex: 7,
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
                    animation: 'warning-pulse 1s ease-in-out infinite'
                  }}>
                    {hazard.turnsUntilCollapse}
                  </div>
                )}

                {/* Meteor Timer */}
                {hazard.type === 'meteor' && (
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: 'rgba(234, 88, 12, 0.9)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    zIndex: 7
                  }}>
                    {hazard.turnsRemaining}
                  </div>
                )}
              </>
            )}

            {/* Players */}
            {playersHere.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                display: 'flex',
                gap: '2px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.15s ease-in-out'
              }}>
                {playersHere.map(player => {
                  const playerIcon = player.icon || '🚀';
                  const isAnimating = animatingPlayer === player.id;
                  const animationClass = isAnimating && animationType ? `animate-rocket-${animationType}` : '';

                  return (
                    <div
                      key={player.id}
                      className={`player-rocket-moving ${animationClass}`}
                      style={{
                        fontSize: `${responsiveSize.rocket}px`,
                        filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px currentColor) contrast(1.4) saturate(1.6)',
                        animation: 'float 2s ease-in-out infinite',
                        transition: 'transform 0.15s ease-in-out',
                        lineHeight: 1
                      }}
                    >
                      {playerIcon}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
    }

    return cells;
  };

  const boardCells = renderBoard();

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes sparkle-fade {
          0% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
        @keyframes warp-pulse {
          0% { transform: scale(1); filter: brightness(1); }
          25% { transform: scale(1.15); filter: brightness(1.5); }
          50% { transform: scale(1.3); filter: brightness(2); }
          75% { transform: scale(1.15); filter: brightness(1.5); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes alien-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        /* Jeopardy Hazard Animations */
        @keyframes black-hole-swirl {
          0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.1); }
          100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
        }
        @keyframes warning-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes patrol-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.3; }
        }
        @keyframes meteor-flicker {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.8; filter: brightness(1.5); }
        }
      `}</style>
      {/* Main Game Board - Square Grid */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '4px solid #fbbf24',
          borderRadius: '12px',
          padding: '2px',
          display: 'grid',
          gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(10, minmax(0, 1fr))',
          gap: '1px',
          boxSizing: 'border-box',
          boxShadow: '0 0 30px rgba(251, 191, 36, 0.4), inset 0 0 30px rgba(0, 0, 0, 0.6)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
          {boardCells}

        {/* Sparkle effects on special cells */}
        {sparkles.map(sparkle => (
          <div
            key={sparkle.id}
            style={{
              position: 'absolute',
              left: `${(sparkle.cell - 1) % 10 * 10}%`,
              top: `${Math.floor((100 - sparkle.cell) / 10) * 10}%`,
              width: '10%',
              height: '10%',
              pointerEvents: 'none',
              zIndex: 3,
              overflow: 'hidden'
            }}
          >
            <Star
              size={12}
              style={{
                position: 'absolute',
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                color: '#fbbf24',
                animation: `sparkle-fade 2s ease-in-out ${sparkle.delay}s`,
                filter: 'drop-shadow(0 0 4px #fbbf24)'
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
