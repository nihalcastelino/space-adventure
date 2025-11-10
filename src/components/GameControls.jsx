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
    <div className="glass rounded-lg p-3 md:p-4 shadow-2xl border-2 border-gray-700 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10" style={{
        background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3))',
        backgroundSize: '200% 200%',
        animation: 'nebula-flow 10s ease infinite'
      }}></div>

      <div className="relative z-10">
        <div className="bg-gray-800 bg-opacity-80 p-2 md:p-3 rounded text-center mb-2 md:mb-3 backdrop-blur-sm border border-white border-opacity-10">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
            <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
            Dice Roll
          </div>
          <div 
            className={`text-4xl md:text-5xl font-bold text-white transition-all duration-300 ${
              diceRolling ? 'animate-dice-roll scale-110' : 'scale-100'
            }`}
            style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(59, 130, 246, 0.5)'
            }}
          >
            {diceValue || '?'}
          </div>
          {diceValue && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 border-4 border-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>
          )}
        </div>
        
        <div className="bg-blue-900 bg-opacity-60 p-2 rounded mb-2 md:mb-3 backdrop-blur-sm border border-blue-400 border-opacity-30">
          <p className="text-white font-medium text-xs md:text-sm text-center animate-shimmer">
            {message}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              playSound('click');
              onReset();
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg transition-all text-xs md:text-sm transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
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
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all transform hover:scale-110 active:scale-95 shadow-lg"
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {!isOnline && (
            <>
            <button
              onClick={() => {
                playSound('click');
                onRemovePlayer();
              }}
              disabled={numPlayers <= 2}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded transition-all transform hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                playSound('click');
                onAddPlayer();
              }}
              disabled={numPlayers >= 4}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded transition-all transform hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
