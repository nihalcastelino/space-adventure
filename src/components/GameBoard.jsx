import { Rocket, Zap, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

const BOARD_SIZE = 100;
const SPACEPORTS = {
  4: 18, 9: 31, 15: 42, 21: 56, 28: 64,
  36: 70, 51: 77, 62: 85, 71: 91, 80: 96
};
const ALIENS = [14, 23, 29, 38, 45, 50, 54, 61, 68, 75, 82, 88, 94, 98];
const CHECKPOINTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function GameBoard({ players, animatingPlayer, animationType, alienBlink }) {
  const [sparkles, setSparkles] = useState([]);

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

  const getCellColor = (cellNumber) => {
    if (cellNumber === BOARD_SIZE) return 'rgba(251, 191, 36, 0.25)'; // Gold for finish
    if (SPACEPORTS[cellNumber]) return 'rgba(16, 185, 129, 0.25)'; // Green for spaceport
    if (ALIENS.includes(cellNumber)) return 'rgba(239, 68, 68, 0.25)'; // Red for alien
    if (CHECKPOINTS.includes(cellNumber)) return 'rgba(59, 130, 246, 0.25)'; // Blue for checkpoint
    return 'rgba(31, 41, 55, 0.7)'; // More opaque dark gray for regular cells
  };

  const renderBoard = () => {
    const cells = [];
    const rows = 10;
    const cols = 10;

    for (let row = rows - 1; row >= 0; row--) {
      const isEvenRow = row % 2 === 0;

      for (let col = 0; col < cols; col++) {
        const actualCol = isEvenRow ? col : (cols - 1 - col);
        const cellNumber = row * cols + actualCol + 1;

        if (cellNumber < 1 || cellNumber > 100) continue;

        const playersHere = players.filter(p => p.position === cellNumber);
        const isSpaceport = SPACEPORTS[cellNumber];
        const isAlien = ALIENS.includes(cellNumber);
        const isCheckpoint = CHECKPOINTS.includes(cellNumber);
        const isFinish = cellNumber === BOARD_SIZE;

        const bgColor = getCellColor(cellNumber);

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
              minHeight: '30px',
              boxShadow: isSpaceport || isAlien || isCheckpoint || isFinish
                ? 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 10px ' + (
                    isFinish ? 'rgba(251, 191, 36, 0.3)' :
                    isSpaceport ? 'rgba(16, 185, 129, 0.3)' :
                    isAlien ? 'rgba(239, 68, 68, 0.3)' :
                    'rgba(59, 130, 246, 0.3)'
                  )
                : 'inset 0 0 10px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.2s ease',
              overflow: 'hidden'
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
                fontSize: '32px',
                zIndex: 5,
                filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 10px rgba(16, 185, 129, 0.8)) contrast(1.3) saturate(1.4)',
                animation: 'float 3s ease-in-out infinite'
              }}>
                🛸
              </div>
            )}

            {/* Alien */}
            {isAlien && (
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

            {/* Checkpoint */}
            {isCheckpoint && !isSpaceport && !isAlien && (
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
                alignItems: 'center'
              }}>
                {playersHere.map(player => (
                  <Rocket
                    key={player.id}
                    className={`${player.color}`}
                    style={{
                      width: '28px',
                      height: '28px',
                      filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 12px currentColor) contrast(1.4) saturate(1.6)',
                      animation: 'float 2s ease-in-out infinite'
                    }}
                  />
                ))}
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
      `}</style>
      {/* Main Game Board - Square Grid */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '4px solid #fbbf24',
          borderRadius: '12px',
          padding: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gridTemplateRows: 'repeat(10, 1fr)',
          gap: '3px',
          boxSizing: 'border-box',
          boxShadow: '0 0 30px rgba(251, 191, 36, 0.4), inset 0 0 30px rgba(0, 0, 0, 0.6)',
          position: 'relative'
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
