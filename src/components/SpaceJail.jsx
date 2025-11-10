import { useState } from 'react';
import { Lock, Coins, Dices } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';

/**
 * Space Jail Overlay
 *
 * Shows when a player is in jail with options to escape
 */
export default function SpaceJail({
  playerId,
  playerName,
  turnsRemaining,
  bailCost,
  playerCoins,
  onPayBail,
  onRollForDoubles,
  isCurrentPlayer
}) {
  const { playSound } = useGameSounds();
  const [showDetails, setShowDetails] = useState(true);

  const canAffordBail = playerCoins >= bailCost;

  const handlePayBail = () => {
    if (canAffordBail) {
      playSound('click');
      onPayBail(playerId);
    } else {
      playSound('error');
    }
  };

  const handleRoll = () => {
    playSound('roll');
    onRollForDoubles();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto">
        {/* Jail Cell */}
        <div
          className="relative glass rounded-lg border-4 border-red-500 shadow-2xl overflow-hidden"
          style={{
            width: '320px',
            minHeight: '200px',
            background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(40, 0, 0, 0.95))',
            animation: 'pulse-red 2s infinite'
          }}
        >
          {/* Prison Bars Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 bg-gray-600 opacity-40"
                style={{
                  width: '8px',
                  left: `${(i + 1) * 40}px`,
                  boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8)'
                }}
              />
            ))}
          </div>

          {/* Warning Lights */}
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <div
              className="w-4 h-4 rounded-full bg-red-500"
              style={{ animation: 'blink-red 1s infinite' }}
            />
            <div
              className="w-4 h-4 rounded-full bg-blue-500"
              style={{ animation: 'blink-blue 1s infinite 0.5s' }}
            />
          </div>

          {/* Content */}
          <div className="relative p-6 flex flex-col items-center gap-4">
            {/* Title */}
            <div className="text-center">
              <Lock className="w-12 h-12 text-red-400 mx-auto mb-2 animate-bounce" />
              <h2 className="text-2xl font-bold text-red-300" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
                🚔 SPACE JAIL
              </h2>
              <p className="text-white text-sm mt-1">
                {playerName} is locked up!
              </p>
            </div>

            {/* Status */}
            <div className="w-full glass rounded p-3 border-2 border-red-400/30">
              <div className="text-center">
                <p className="text-yellow-300 font-bold text-lg">
                  {turnsRemaining} Turn{turnsRemaining > 1 ? 's' : ''} Remaining
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  {isCurrentPlayer ? "Your turn to try to escape!" : "Waiting for release..."}
                </p>
              </div>
            </div>

            {/* Escape Options */}
            {isCurrentPlayer && showDetails && (
              <div className="w-full space-y-3">
                <p className="text-white text-sm text-center font-semibold">
                  Choose your escape method:
                </p>

                {/* Roll for Doubles */}
                <button
                  onClick={handleRoll}
                  className="w-full px-4 py-3 rounded-lg font-bold text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                    border: '2px solid rgba(59, 130, 246, 0.5)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Dices className="w-5 h-5" />
                    <span>Roll for Doubles (FREE)</span>
                  </div>
                  <p className="text-xs text-blue-200 mt-1">
                    Roll same number on both dice to escape!
                  </p>
                </button>

                {/* Pay Bail */}
                <button
                  onClick={handlePayBail}
                  disabled={!canAffordBail}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-white transition-all transform shadow-lg ${
                    canAffordBail
                      ? 'hover:scale-105 active:scale-95'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    background: canAffordBail
                      ? 'linear-gradient(135deg, #f59e0b, #b45309)'
                      : 'linear-gradient(135deg, #6b7280, #4b5563)',
                    border: `2px solid ${canAffordBail ? 'rgba(245, 158, 11, 0.5)' : 'rgba(107, 114, 128, 0.5)'}`,
                    boxShadow: canAffordBail ? '0 0 20px rgba(245, 158, 11, 0.4)' : 'none'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Coins className="w-5 h-5" />
                    <span>Pay Bail: {bailCost} Coins</span>
                  </div>
                  {!canAffordBail && (
                    <p className="text-xs text-gray-300 mt-1">
                      Need {bailCost - playerCoins} more coins
                    </p>
                  )}
                </button>

                {/* Wait Option */}
                <div className="text-center text-gray-400 text-xs">
                  or wait {turnsRemaining} more turn{turnsRemaining > 1 ? 's' : ''} for auto-release
                </div>
              </div>
            )}

            {/* Other Player View */}
            {!isCurrentPlayer && (
              <div className="text-center text-gray-400 text-sm">
                Waiting for {playerName} to take their turn...
              </div>
            )}
          </div>

          {/* Bottom Warning Strip */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2"
            style={{
              background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, #fbbf24 10px, #fbbf24 20px)',
              animation: 'slide-warning 1s linear infinite'
            }}
          />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.8); }
        }

        @keyframes blink-red {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.2; }
        }

        @keyframes blink-blue {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.2; }
        }

        @keyframes slide-warning {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
}

/**
 * Mini Jail Indicator (for player panel)
 */
export function JailIndicator({ turnsRemaining }) {
  return (
    <div
      className="absolute -top-2 -right-2 glass rounded-full px-2 py-1 border-2 border-red-500 shadow-lg"
      style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(185, 28, 28, 0.9))',
        animation: 'pulse-red 2s infinite'
      }}
    >
      <div className="flex items-center gap-1">
        <Lock className="w-3 h-3 text-white" />
        <span className="text-white font-bold text-xs">
          {turnsRemaining}
        </span>
      </div>
    </div>
  );
}
