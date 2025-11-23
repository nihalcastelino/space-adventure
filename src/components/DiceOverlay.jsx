import { useState, useEffect } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';

/**
 * Floating overlay for dice rolls and game messages
 * Replaces the controls panel on mobile/folding devices
 */
export default function DiceOverlay({ 
  diceValue, 
  message, 
  isRolling, 
  onRollDice, 
  onReset,
  disabled,
  characterName,
  jailInfo 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [diceRolling, setDiceRolling] = useState(false);
  const { playSound, setEnabled } = useGameSounds();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Show overlay when dice value changes or message updates
  useEffect(() => {
    if (diceValue !== null || message) {
      setIsVisible(true);
      // Auto-hide after 3 seconds if not rolling
      if (!isRolling && diceValue !== null) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [diceValue, message, isRolling]);

  useEffect(() => {
    if (diceValue !== null) {
      setDiceRolling(true);
      const timer = setTimeout(() => setDiceRolling(false), 500);
      return () => clearTimeout(timer);
    }
  }, [diceValue]);

  if (!isVisible && !isRolling && !diceValue) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all animate-pulse"
        style={{
          boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)'
        }}
      >
        <span className="text-2xl">🎲</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <div className="bg-gray-900 bg-opacity-95 backdrop-blur-lg rounded-lg shadow-2xl border-2 border-yellow-400 border-opacity-50 p-4">
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <span>🎲</span> Dice & Status
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newState = !soundEnabled;
                setSoundEnabled(newState);
                setEnabled(newState);
                if (newState) playSound('click');
              }}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dice Display */}
        <div className="bg-gray-800 bg-opacity-70 p-4 rounded-lg mb-3 text-center border border-yellow-400 border-opacity-30 relative perspective-[1000px]">
          <div className="text-xs text-gray-400 mb-1">Dice Roll</div>
          <div
            className={`text-5xl font-bold text-white transition-all duration-500 relative z-10 inline-block transform-style-3d ${
              diceRolling ? 'animate-dice-spin' : 'scale-100'
            }`}
            style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(59, 130, 246, 0.5)'
            }}
          >
            {diceValue || (isRolling ? '🎲' : '?')}
          </div>
          <style>{`
            @keyframes dice-spin {
               0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
               25% { transform: rotateX(90deg) rotateY(90deg) rotateZ(45deg); }
               50% { transform: rotateX(180deg) rotateY(180deg) rotateZ(90deg); }
               75% { transform: rotateX(270deg) rotateY(270deg) rotateZ(135deg); }
               100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(180deg); }
            }
            .animate-dice-spin {
              animation: dice-spin 0.5s linear infinite;
            }
          `}</style>
          {diceValue && !diceRolling && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="w-20 h-20 border-4 border-blue-400 border-opacity-40 rounded-full animate-ping opacity-50"></div>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className="bg-blue-900 bg-opacity-50 p-3 rounded-lg mb-3 border border-blue-400 border-opacity-30">
            <p className="text-white text-sm text-center line-clamp-3">
              {message}
            </p>
          </div>
        )}

        {/* Character/Jail Info */}
        {characterName && (
          <div className="text-xs text-gray-400 text-center mb-2">
            {characterName}'s turn
          </div>
        )}
        {jailInfo && (
          <div className="text-xs text-red-400 text-center mb-2">
            🚔 In jail - {jailInfo.turnsRemaining} turn{jailInfo.turnsRemaining > 1 ? 's' : ''} remaining
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onRollDice}
            disabled={disabled || isRolling}
            className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700"
          >
            <span className="flex items-center justify-center gap-2">
              <span className={isRolling ? 'animate-spin' : ''}>🎲</span>
              {isRolling ? 'Rolling...' : jailInfo?.inJail ? '🚔 In Jail' : 'ROLL DICE'}
            </span>
          </button>
          <button
            onClick={() => {
              playSound('click');
              onReset();
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-all transform hover:scale-105 shadow-lg"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

