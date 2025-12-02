import { Rocket, Zap, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

import { DEFAULT_BOARD_SIZE, SPACEPORTS, DEFAULT_ALIENS, DEFAULT_CHECKPOINTS } from '../utils/constants';

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

export default function GameBoard({
  players = [],
  animatingPlayer,
  animationType,
  alienBlink = {},
  animatedPositions = {},
  encounterType = null,
  maxWidth,
  maxHeight,
  scaleFactor = 1,
  aliens = DEFAULT_ALIENS,
  checkpoints = DEFAULT_CHECKPOINTS,
  hazards = null, // Jeopardy mechanics hazards
  rogueState = null, // Rogue player state
  boardSize = DEFAULT_BOARD_SIZE, // Variant-specific board size
  gems = {} // Campaign gems
}) {
  const ALIENS = aliens || DEFAULT_ALIENS;
  const CHECKPOINTS = checkpoints || DEFAULT_CHECKPOINTS;
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
      if (hazard.type === 'tactical') return 'rgba(168, 85, 247, 0.4)'; // Purple for tactical squares
    }
    if (gems[cellNumber]) return 'rgba(236, 72, 153, 0.4)'; // Pink for gems
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
    if (hazards.blackHoles && Array.isArray(hazards.blackHoles)) {
      const blackHole = hazards.blackHoles.find(bh => bh.position === cellNumber);
      if (blackHole) {
        return {
          type: blackHole.isCollapsed ? 'blackHole' : 'blackHoleWarning',
          icon: blackHole.isCollapsed ? '🕳️' : '⚠️',
          turnsUntilCollapse: blackHole.turnsUntilCollapse
        };
      }
    }

    // Check patrol zones
    if (hazards.patrolZones && Array.isArray(hazards.patrolZones) && hazards.patrolZones.includes(cellNumber)) {
      return {
        type: 'patrol',
        icon: '🚨'
      };
    }

    // Check meteor impacts
    if (hazards.meteorImpacts && Array.isArray(hazards.meteorImpacts)) {
      const meteor = hazards.meteorImpacts.find(m => m.position === cellNumber);
      if (meteor) {
        return {
          type: 'meteor',
          icon: '🔥',
          turnsRemaining: meteor.turnsRemaining
        };
      }
    }

    // Check tactical squares
    if (hazards.tacticalSquares && Array.isArray(hazards.tacticalSquares) && hazards.tacticalSquares.includes(cellNumber)) {
      return {
        type: 'tactical',
        icon: '⚔️'
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
      if (hazard.type === 'tactical') return 'rgba(168, 85, 247, 0.4)'; // Purple for tactical squares
    }

    if (gems[cellNumber]) return 'rgba(236, 72, 153, 0.4)'; // Pink for gems

    if (cellNumber === BOARD_SIZE) return 'rgba(251, 191, 36, 0.25)'; // Gold for finish
    if (SPACEPORTS[cellNumber]) {
      // Use responsive opacity from hook (will be set in component)
      return 'rgba(16, 185, 129, 0.25)'; // Default, will be overridden
    }
    if (ALIENS.includes(cellNumber)) return 'rgba(239, 68, 68, 0.25)'; // Red for alien
    if (CHECKPOINTS.includes(cellNumber)) return 'rgba(59, 130, 246, 0.25)'; // Blue for checkpoint
    return 'rgba(31, 41, 55, 0.7)'; // More opaque dark gray for regular cells
  };

  // Calculate cell position helper - accounts for snake pattern
  const getCellPosition = (cellNumber) => {
    const cols = 10;
    const rows = Math.ceil(BOARD_SIZE / cols);

    // Calculate which row (0-indexed from top)
    const row = Math.ceil(cellNumber / cols) - 1;
    const isEvenRow = row % 2 === 0;

    // Calculate column within the row
    const colInRow = ((cellNumber - 1) % cols);
    // Reverse column order for odd rows (snake pattern)
    const actualCol = isEvenRow ? colInRow : (cols - 1 - colInRow);

    // Calculate percentage positions (0-100%)
    // Add half cell width to center in cell
    const colPercent = ((actualCol + 0.5) / cols) * 100;
    const rowPercent = ((rows - 1 - row + 0.5) / rows) * 100;

    return { colPercent, rowPercent, cellNumber };
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
        const isTactical = hazard && hazard.type === 'tactical';
        const hasGem = gems[cellNumber];

        // Check if this cell has encounter effect
        const hasSpaceportEffect = encounterType === 'spaceport' && playersHere.some(p => p.id === animatingPlayer);
        const hasAlienEffect = encounterType === 'alien' && playersHere.some(p => p.id === animatingPlayer);

        const bgColor = getCellColorResponsive(cellNumber);

        cells.push(
          <div
            key={`cell-${cellNumber}`}
            style={{
              backgroundColor: bgColor,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 'bold',
              aspectRatio: '1',
              minHeight: '0',
              minWidth: '0',
              boxShadow: hasSpaceportEffect
                ? '0 0 30px rgba(16, 185, 129, 0.9), inset 0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.4)'
                : hasAlienEffect
                  ? '0 0 30px rgba(239, 68, 68, 0.9), inset 0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.4)'
                  : isSpaceport || isAlien || isCheckpoint || isFinish
                    ? 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 ' + (
                      isFinish ? '12px rgba(251, 191, 36, 0.4), 0 0 24px rgba(251, 191, 36, 0.2)' :
                        isSpaceport ? `${responsiveSize.spaceportGlow} rgba(16, 185, 129, ${responsiveSize.spaceportGlowOpacity}), 0 0 ${parseInt(responsiveSize.spaceportGlow) * 2}px rgba(16, 185, 129, ${responsiveSize.spaceportGlowOpacity * 0.5})` :
                          isAlien ? '12px rgba(239, 68, 68, 0.4), 0 0 24px rgba(239, 68, 68, 0.2)' :
                            '12px rgba(59, 130, 246, 0.4), 0 0 24px rgba(59, 130, 246, 0.2)'
                    )
                    : 'inset 0 0 10px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              animation: hasSpaceportEffect ? 'warp-pulse 0.8s ease-in-out' : hasAlienEffect ? 'alien-shake 0.5s ease-in-out' : 'none',
              backdropFilter: 'blur(0.5px)',
              WebkitBackdropFilter: 'blur(0.5px)'
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

            {/* Spaceport - Enhanced with modern glow */}
            {isSpaceport && (
              <div
                className="spaceport-container"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${responsiveSize.spaceport}px`,
                  zIndex: 5,
                  filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px rgba(16, 185, 129, 0.9)) drop-shadow(0 0 20px rgba(16, 185, 129, 0.6)) contrast(1.3) saturate(1.4)',
                  animation: 'spaceport-float 3s ease-in-out infinite'
                }}
              >
                {/* Glow effect */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '140%',
                    height: '140%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'spaceport-glow-pulse 3s ease-in-out infinite',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  🛸
                </div>
              </div>
            )}

            {/* Alien - Enhanced with retro space shooter styling */}
            {isAlien && !isRogue && (
              <div
                className="alien-container"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(20, Math.min(32, responsiveSize.rocket + 4))}px`,
                  zIndex: 5,
                  filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px rgba(239, 68, 68, 0.9)) drop-shadow(0 0 20px rgba(239, 68, 68, 0.6)) contrast(1.4) saturate(1.5)',
                  animation: (alienBlink && alienBlink[cellNumber]) ? 'alien-attack 0.3s ease-in-out' : 'alien-idle 2s ease-in-out infinite',
                  imageRendering: 'pixelated',
                  WebkitImageRendering: 'pixelated'
                }}
              >
                <div
                  className="alien-scanline-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(239, 68, 68, 0.1) 2px, rgba(239, 68, 68, 0.1) 4px)',
                    pointerEvents: 'none',
                    mixBlendMode: 'overlay'
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  👾
                </div>
                {/* Retro glow effect */}
                <div
                  className="alien-glow"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120%',
                    height: '120%',
                    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'alien-glow-pulse 2s ease-in-out infinite',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />
              </div>
            )}

            {/* Rogue Alien - Enhanced with retro effects */}
            {isRogue && (
              <div
                className="rogue-alien-container"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(24, Math.min(36, responsiveSize.rocket + 8))}px`,
                  zIndex: 6,
                  filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 18px rgba(168, 85, 247, 1)) drop-shadow(0 0 30px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.6)) contrast(1.5) saturate(1.6)',
                  animation: 'rogue-alien-pulse 1.5s ease-in-out infinite',
                  imageRendering: 'pixelated',
                  WebkitImageRendering: 'pixelated'
                }}
              >
                <div
                  className="rogue-alien-scanline-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168, 85, 247, 0.15) 2px, rgba(168, 85, 247, 0.15) 4px)',
                    pointerEvents: 'none',
                    mixBlendMode: 'overlay'
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  👽
                </div>
                {/* Dual-color glow effect */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '130%',
                    height: '130%',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(34, 197, 94, 0.3) 50%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'rogue-alien-glow 1.5s ease-in-out infinite',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />
              </div>
            )}

            {/* Tactical Square */}
            {isTactical && !isSpaceport && !isAlien && !isRogue && !isCheckpoint && (
              <div
                className="tactical-container"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(20, Math.min(28, responsiveSize.rocket + 4))}px`,
                  zIndex: 5,
                  filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.9)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.6)) contrast(1.3) saturate(1.4)',
                  animation: 'tactical-pulse 2s ease-in-out infinite'
                }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  ⚔️
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120%',
                    height: '120%',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'tactical-glow 2s ease-in-out infinite',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />
              </div>
            )}

            {/* Checkpoint - Enhanced */}
            {isCheckpoint && !isSpaceport && !isAlien && !isRogue && !isTactical && (
              <div
                className="checkpoint-container"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(24, Math.min(32, responsiveSize.rocket + 4))}px`,
                  zIndex: 5,
                  filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.6)) contrast(1.3) saturate(1.4)',
                  animation: 'checkpoint-pulse 2.5s ease-in-out infinite'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120%',
                    height: '120%',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'checkpoint-glow-pulse 2.5s ease-in-out infinite',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  🛡️
                </div>
              </div>
            )}

            {/* Finish line - Enhanced */}
            {isFinish && (
              <div
                className="finish-container"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(28, Math.min(36, responsiveSize.rocket + 8))}px`,
                  zIndex: 5,
                  filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 15px rgba(251, 191, 36, 1)) drop-shadow(0 0 25px rgba(251, 191, 36, 0.8)) contrast(1.4) saturate(1.5)',
                  animation: 'finish-glow 2s ease-in-out infinite'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '130%',
                    height: '130%',
                    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(251, 191, 36, 0.2) 50%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'finish-glow-pulse 2s ease-in-out infinite',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  🏁
                </div>
              </div>
            )}

            {/* Gems */}
            {hasGem && (
              <div
                className="gem-container"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(20, Math.min(28, responsiveSize.rocket + 4))}px`,
                  zIndex: 5,
                  filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px rgba(236, 72, 153, 0.9)) contrast(1.3) saturate(1.4)',
                  animation: 'gem-float 2s ease-in-out infinite'
                }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  💎
                </div>
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

            {/* Players - rendered separately for smooth animation */}
          </div>
        );
      }
    }

    return cells;
  };

  // Parallax effect hook - Optimized to use CSS variables
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      document.documentElement.style.setProperty('--parallax-x', `${x}px`);
      document.documentElement.style.setProperty('--parallax-y', `${y}px`);
    };

    // Device orientation for mobile
    const handleOrientation = (e) => {
      if (e.beta && e.gamma) {
        // beta is front-back tilt (-180 to 180)
        // gamma is left-right tilt (-90 to 90)
        const x = (e.gamma / 45) * 20;
        const y = (e.beta / 45) * 20;
        document.documentElement.style.setProperty('--parallax-x', `${x}px`);
        document.documentElement.style.setProperty('--parallax-y', `${y}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);



  // Render board cells before return statement
  const boardCells = renderBoard();

  // Render animated players as absolutely positioned elements
  const renderAnimatedPlayers = () => {
    return players.map(player => {
      const playerIcon = player.icon || '🚀';
      const isAnimating = animatingPlayer === player.id;
      const currentPos = animatedPositions[player.id] !== undefined ? animatedPositions[player.id] : player.position;
      const cellPos = getCellPosition(currentPos);

      // Calculate transition duration based on animation state
      // Match the timing from useRocketAnimation (120ms for long, 150ms for medium, 200ms for short)
      let transitionDuration = '0.3s';
      if (isAnimating) {
        // Estimate move distance - if animating, assume we're moving
        transitionDuration = '0.2s'; // Default for short moves
      }

      return (
        <div
          key={player.id}
          className={`player-rocket-moving target-player-rocket`}
          data-player-id={player.id}
          data-is-ai={player.isAI}
          style={{
            position: 'absolute',
            left: `${cellPos.colPercent}%`,
            top: `${cellPos.rowPercent}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${responsiveSize.rocket}px`,
            filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px currentColor) contrast(1.4) saturate(1.6)',
            animation: isAnimating ? 'none' : 'float 2s ease-in-out infinite',
            transition: `left ${transitionDuration} linear, top ${transitionDuration} linear, transform 0.2s ease-out`,
            zIndex: isAnimating ? 25 : 20,
            lineHeight: 1,
            pointerEvents: 'none',
            willChange: isAnimating ? 'left, top' : 'auto'
          }}
        >
          {playerIcon}
          {/* Player Color Indicator */}
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: player.isAI ? '#ef4444' : '#3b82f6', // Red for AI, Blue for Player
            boxShadow: `0 0 5px ${player.isAI ? '#ef4444' : '#3b82f6'}`
          }} />
        </div>
      );
    });
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes screen-shake {
          0% { transform: translate(0, 0) rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-2px, 2px) rotate(-0.5deg); }
          20%, 40%, 60%, 80% { transform: translate(2px, -2px) rotate(0.5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .screen-shake {
          animation: screen-shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes sparkle-fade {
          0% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
        @keyframes warp-pulse {
          0% { transform: scale(1); filter: brightness(1); }
          }
          25% { 
            transform: translate(-50%, -50%) scale(1.05) rotate(-2deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 15px rgba(239, 68, 68, 1)) drop-shadow(0 0 25px rgba(239, 68, 68, 0.8)) contrast(1.5) saturate(1.6);
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.1) rotate(0deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 18px rgba(239, 68, 68, 1.1)) drop-shadow(0 0 30px rgba(239, 68, 68, 0.9)) contrast(1.6) saturate(1.7);
          }
          75% { 
            transform: translate(-50%, -50%) scale(1.05) rotate(2deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 15px rgba(239, 68, 68, 1)) drop-shadow(0 0 25px rgba(239, 68, 68, 0.8)) contrast(1.5) saturate(1.6);
          }
        }
        @keyframes alien-attack {
          0% { 
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 20px rgba(239, 68, 68, 1)) contrast(1.4) saturate(1.5);
          }
          25% { 
            transform: translate(-50%, -50%) scale(1.3) rotate(-10deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 30px rgba(239, 68, 68, 1.2)) drop-shadow(0 0 40px rgba(239, 68, 68, 1)) contrast(1.8) saturate(2);
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.5) rotate(10deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 35px rgba(239, 68, 68, 1.3)) drop-shadow(0 0 50px rgba(239, 68, 68, 1.1)) contrast(2) saturate(2.2);
          }
          75% { 
            transform: translate(-50%, -50%) scale(1.3) rotate(-10deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 30px rgba(239, 68, 68, 1.2)) drop-shadow(0 0 40px rgba(239, 68, 68, 1)) contrast(1.8) saturate(2);
          }
          100% { 
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px rgba(239, 68, 68, 0.9)) drop-shadow(0 0 20px rgba(239, 68, 68, 0.6)) contrast(1.4) saturate(1.5);
          }
        }
        @keyframes alien-glow-pulse {
          0%, 100% { 
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }
        @keyframes rogue-alien-pulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 18px rgba(168, 85, 247, 1)) drop-shadow(0 0 30px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.6)) contrast(1.5) saturate(1.6);
          }
          25% { 
            transform: translate(-50%, -50%) scale(1.08) rotate(-3deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 22px rgba(168, 85, 247, 1.1)) drop-shadow(0 0 35px rgba(34, 197, 94, 0.9)) drop-shadow(0 0 45px rgba(168, 85, 247, 0.7)) contrast(1.6) saturate(1.7);
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.15) rotate(0deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 25px rgba(168, 85, 247, 1.2)) drop-shadow(0 0 40px rgba(34, 197, 94, 1)) drop-shadow(0 0 50px rgba(168, 85, 247, 0.8)) contrast(1.7) saturate(1.8);
          }
          75% { 
            transform: translate(-50%, -50%) scale(1.08) rotate(3deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 22px rgba(168, 85, 247, 1.1)) drop-shadow(0 0 35px rgba(34, 197, 94, 0.9)) drop-shadow(0 0 45px rgba(168, 85, 247, 0.7)) contrast(1.6) saturate(1.7);
          }
        }
        @keyframes rogue-alien-glow {
          0%, 100% { 
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
          50% { 
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.3) rotate(180deg);
          }
        }
        @keyframes checkpoint-pulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.6)) contrast(1.3) saturate(1.4);
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.08);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 15px rgba(59, 130, 246, 1)) drop-shadow(0 0 25px rgba(59, 130, 246, 0.8)) contrast(1.4) saturate(1.5);
          }
        }
        @keyframes checkpoint-glow-pulse {
          0%, 100% { 
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }
        @keyframes finish-glow {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 15px rgba(251, 191, 36, 1)) drop-shadow(0 0 25px rgba(251, 191, 36, 0.8)) contrast(1.4) saturate(1.5);
          }
          25% { 
            transform: translate(-50%, -50%) scale(1.1) rotate(-5deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 18px rgba(251, 191, 36, 1.1)) drop-shadow(0 0 30px rgba(251, 191, 36, 0.9)) contrast(1.5) saturate(1.6);
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.15) rotate(0deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 20px rgba(251, 191, 36, 1.2)) drop-shadow(0 0 35px rgba(251, 191, 36, 1)) contrast(1.6) saturate(1.7);
          }
          75% { 
            transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 18px rgba(251, 191, 36, 1.1)) drop-shadow(0 0 30px rgba(251, 191, 36, 0.9)) contrast(1.5) saturate(1.6);
          }
        }
        @keyframes finish-glow-pulse {
          0%, 100% { 
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1.3);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes spaceport-float {
          0%, 100% { 
            transform: translate(-50%, -50%) translateY(0px) rotate(0deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px rgba(16, 185, 129, 0.9)) drop-shadow(0 0 20px rgba(16, 185, 129, 0.6)) contrast(1.3) saturate(1.4);
          }
          50% { 
            transform: translate(-50%, -50%) translateY(-8px) rotate(5deg);
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 15px rgba(16, 185, 129, 1)) drop-shadow(0 0 25px rgba(16, 185, 129, 0.8)) contrast(1.4) saturate(1.5);
          }
        }
        @keyframes spaceport-glow-pulse {
          0%, 100% { 
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.3);
          }
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
      {/* Main Game Board - Dynamic Grid - Enhanced with modern styling - Responsive for mobile */}
      <div
        style={{
          width: '100%',
          // Use clamp for responsive sizing but respect maxWidth if provided
          maxWidth: maxWidth ? `${maxWidth}px` : '100%',
          // Calculate height to maintain aspect ratio based on grid dimensions
          aspectRatio: `${10} / ${Math.ceil(BOARD_SIZE / 10)}`,
          height: 'auto', // Let aspect ratio drive height
          maxHeight: maxHeight ? `${maxHeight}px` : '90vh',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '3px solid rgba(251, 191, 36, 0.6)',
          borderRadius: '16px',
          padding: '3px',
          display: 'grid',
          gridTemplateColumns: `repeat(10, 1fr)`, // 1fr is better than minmax(0, 1fr) for aspect ratio
          gridTemplateRows: `repeat(${Math.ceil(BOARD_SIZE / 10)}, 1fr)`,
          gap: 'clamp(1px, 0.5vmin, 4px)', // Responsive gap
          boxSizing: 'border-box',
          boxShadow: '0 0 40px rgba(251, 191, 36, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.7), 0 0 60px rgba(251, 191, 36, 0.2)',
          position: 'relative',
          overflow: 'hidden', // Hide overflow for shake effects
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          transformOrigin: 'center top',
          // Combine existing scale with parallax and shake
          transform: `${scaleFactor !== 1 ? `scale(${scaleFactor})` : ''} translate(var(--parallax-x, 0px), var(--parallax-y, 0px))`,
          transition: 'transform 0.1s ease-out, max-height 0.2s ease-out',
          marginBottom: '0.5rem',
          animation: encounterType === 'alien' || (players && players.length > 0 && getHazardAtCell(players.find(p => p.id === animatingPlayer)?.position)?.type === 'blackHole')
            ? 'screen-shake 0.5s cubic-bezier(.36,.07,.19,.97) both'
            : 'none'
        }}
        className="board-container"
        id="game-board-container"
      >
        {boardCells}

        {/* Animated Players - rendered as absolutely positioned elements */}
        {renderAnimatedPlayers()}

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
