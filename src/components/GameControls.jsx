import { Plus, Minus, Star, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGameSounds } from '../hooks/useGameSounds';

export default function GameControls({ diceValue, message, onReset, onAddPlayer, onRemovePlayer, numPlayers, isOnline }) {
  const [diceRolling, setDiceRolling] = useState(false);
  const { playSound, setEnabled, setVolume } = useGameSounds();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (diceValue !== null) {
      setDiceRolling(true);
      const timer = setTimeout(() => setDiceRolling(false), 500);
      return () => clearTimeout(timer);
    }
  }, [diceValue]);

  return (
    <div className="glass rounded-lg p-2 md:p-4 shadow-2xl border-2 border-gray-700 border-opacity-30 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5" style={{
        background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))',
        backgroundSize: '200% 200%',
        animation: 'nebula-flow 10s ease infinite'
      }}></div>

      <div className="relative z-10">
        <div className="bg-gray-800 bg-opacity-50 p-1.5 md:p-3 rounded text-center mb-1.5 md:mb-3 backdrop-blur-sm border border-white border-opacity-5">
          <div className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1 flex items-center justify-center gap-1">
            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-yellow-300 text-yellow-300 opacity-70" />
            <span className="hidden sm:inline">Dice Roll</span>
          </div>
          <div
            className={`text-3xl md:text-5xl font-bold text-white transition-all duration-300 ${
              diceRolling ? 'animate-dice-roll scale-110' : 'scale-100'
            }`}
            style={{
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(59, 130, 246, 0.3)'
            }}
          >
            {diceValue || '?'}
          </div>
          {diceValue && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-400 border-opacity-40 rounded-full animate-ping opacity-50"></div>
            </div>
          )}
        </div>

        <div className="bg-blue-900 bg-opacity-30 p-1.5 md:p-2 rounded mb-1.5 md:mb-3 backdrop-blur-sm border border-blue-400 border-opacity-20">
          <p className="text-white font-medium text-[10px] md:text-sm text-center animate-shimmer line-clamp-2">
            {message}
          </p>
          {isOnline && message?.includes('paused') && (
            <p className="text-orange-300 text-[10px] md:text-xs text-center mt-0.5 md:mt-1 animate-pulse">
              ⏸ Game is paused
            </p>
          )}
        </div>

        <div className="flex gap-1.5 md:gap-2">
          <button
            onClick={() => {
              playSound('click');
              onReset();
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1.5 md:py-2 px-2 md:px-3 rounded-lg transition-all text-[10px] md:text-sm transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            Reset
          </button>
          <button
            onClick={() => {
              const newState = !soundEnabled;
              setSoundEnabled(newState);
              setEnabled(newState);
              if (newState) playSound('click');
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white p-1.5 md:p-2 rounded-lg transition-all transform hover:scale-110 active:scale-95 shadow-lg"
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </button>
          {!isOnline && (
            <>
            <button
              onClick={() => {
                playSound('click');
                onRemovePlayer();
              }}
              disabled={numPlayers <= 2}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-1.5 md:p-2 rounded transition-all transform hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50"
            >
              <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => {
                playSound('click');
                onAddPlayer();
              }}
              disabled={numPlayers >= 4}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-1.5 md:p-2 rounded transition-all transform hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
