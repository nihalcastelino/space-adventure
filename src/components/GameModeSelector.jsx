import { Rocket, Users, Wifi, Zap, Shield, Skull, Bot } from 'lucide-react';
import { useState } from 'react';
import { useGameSounds } from '../hooks/useGameSounds';

export default function GameModeSelector({ onSelectMode }) {
  const { playSound } = useGameSounds();
  const [difficulty, setDifficulty] = useState('normal');

  const handleSelectMode = (mode) => {
    playSound('click');
    onSelectMode(mode, difficulty);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-y-auto py-4"
      style={{
        backgroundImage: 'url(/space-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000'
      }}
    >
      <div className="text-center space-y-4 md:space-y-8 px-4 max-w-2xl w-full">
        <div className="space-y-2 md:space-y-4">
          <Rocket className="w-12 h-12 md:w-20 md:h-20 text-yellow-300 mx-auto animate-bounce" style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8))'
          }} />
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-yellow-300 mb-2" style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(251, 191, 36, 0.5), 0 4px 8px rgba(0, 0, 0, 0.9)'
          }}>
            Space Adventure
          </h1>
          <p className="text-base md:text-xl text-white font-semibold" style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 1)'
          }}>
            Race to the edge of the galaxy!
          </p>
        </div>

        {/* Difficulty Selector */}
        <div className="glass rounded-lg p-3 md:p-6 shadow-2xl border-2 border-yellow-400 border-opacity-30">
          <h3 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
            Choose Difficulty
          </h3>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <button
              onClick={() => {
                playSound('click');
                setDifficulty('easy');
              }}
              className={`p-2 md:p-4 rounded-lg transition-all transform hover:scale-105 ${
                difficulty === 'easy'
                  ? 'bg-green-600 border-2 border-green-400 shadow-lg shadow-green-500/50'
                  : 'bg-gray-800 border-2 border-gray-700 hover:border-green-400'
              }`}
            >
              <Shield className="w-5 h-5 md:w-8 md:h-8 text-green-300 mx-auto mb-1 md:mb-2" />
              <div className="text-white font-bold text-xs md:text-sm">Easy</div>
              <div className="text-gray-400 text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block">No extras</div>
            </button>

            <button
              onClick={() => {
                playSound('click');
                setDifficulty('normal');
              }}
              className={`p-2 md:p-4 rounded-lg transition-all transform hover:scale-105 ${
                difficulty === 'normal'
                  ? 'bg-yellow-600 border-2 border-yellow-400 shadow-lg shadow-yellow-500/50'
                  : 'bg-gray-800 border-2 border-gray-700 hover:border-yellow-400'
              }`}
            >
              <Zap className="w-5 h-5 md:w-8 md:h-8 text-yellow-300 mx-auto mb-1 md:mb-2" />
              <div className="text-white font-bold text-xs md:text-sm">Normal</div>
              <div className="text-gray-400 text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block">Balanced</div>
            </button>

            <button
              onClick={() => {
                playSound('click');
                setDifficulty('hard');
              }}
              className={`p-2 md:p-4 rounded-lg transition-all transform hover:scale-105 ${
                difficulty === 'hard'
                  ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/50'
                  : 'bg-gray-800 border-2 border-gray-700 hover:border-red-400'
              }`}
            >
              <Skull className="w-5 h-5 md:w-8 md:h-8 text-red-300 mx-auto mb-1 md:mb-2" />
              <div className="text-white font-bold text-xs md:text-sm">Hard</div>
              <div className="text-gray-400 text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block">Extreme!</div>
            </button>
          </div>
          <div className="mt-2 md:mt-4 text-center text-xs md:text-sm text-gray-400">
            {difficulty === 'easy' && '✓ Standard game, no surprises'}
            {difficulty === 'normal' && '⚡ Random aliens spawn, checkpoints may disappear'}
            {difficulty === 'hard' && '💀 Frequent alien spawns, high checkpoint loss!'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-8">
          <button
            onClick={() => handleSelectMode('ai')}
            className="bg-gray-900 bg-opacity-95 rounded-lg p-4 md:p-8 shadow-2xl border-2 border-gray-700 hover:border-purple-400 transition-all transform hover:scale-105 group"
          >
            <Bot className="w-10 h-10 md:w-16 md:h-16 text-purple-300 mx-auto mb-2 md:mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">vs AI</h2>
            <p className="text-sm md:text-base text-gray-400">
              Challenge an AI opponent
            </p>
          </button>

          <button
            onClick={() => handleSelectMode('local')}
            className="bg-gray-900 bg-opacity-95 rounded-lg p-4 md:p-8 shadow-2xl border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-105 group"
          >
            <Users className="w-10 h-10 md:w-16 md:h-16 text-blue-300 mx-auto mb-2 md:mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">Local Multiplayer</h2>
            <p className="text-sm md:text-base text-gray-400">
              Play with friends on the same device
            </p>
          </button>

          <button
            onClick={() => handleSelectMode('online')}
            className="bg-gray-900 bg-opacity-95 rounded-lg p-4 md:p-8 shadow-2xl border-2 border-gray-700 hover:border-green-400 transition-all transform hover:scale-105 group"
          >
            <Wifi className="w-10 h-10 md:w-16 md:h-16 text-green-300 mx-auto mb-2 md:mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">Online Multiplayer</h2>
            <p className="text-sm md:text-base text-gray-400">
              Play with friends across different devices
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

