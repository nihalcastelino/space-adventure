import { X, Zap, Shield, Skull, Settings } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';

export default function GameSettings({ isOpen, onClose, difficulty, onChangeDifficulty }) {
  const { playSound } = useGameSounds();

  if (!isOpen) return null;

  const handleDifficultyChange = (newDifficulty) => {
    playSound('click');
    onChangeDifficulty(newDifficulty);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="glass rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-yellow-400 border-opacity-30">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-yellow-300" />
            Game Settings
          </h2>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-300" />
            Difficulty Level
          </h3>
          <div className="space-y-3">
            {/* Easy */}
            <button
              onClick={() => handleDifficultyChange('easy')}
              className={`w-full p-4 rounded-lg transition-all transform hover:scale-102 flex items-center gap-3 ${
                difficulty === 'easy'
                  ? 'bg-green-600 border-2 border-green-400 shadow-lg shadow-green-500/50'
                  : 'bg-gray-800 border-2 border-gray-700 hover:border-green-400'
              }`}
            >
              <Shield className="w-8 h-8 text-green-300 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="text-white font-bold">Easy</div>
                <div className="text-gray-400 text-xs">Standard game, no surprises</div>
              </div>
              {difficulty === 'easy' && (
                <div className="text-green-300 font-bold">✓</div>
              )}
            </button>

            {/* Normal */}
            <button
              onClick={() => handleDifficultyChange('normal')}
              className={`w-full p-4 rounded-lg transition-all transform hover:scale-102 flex items-center gap-3 ${
                difficulty === 'normal'
                  ? 'bg-yellow-600 border-2 border-yellow-400 shadow-lg shadow-yellow-500/50'
                  : 'bg-gray-800 border-2 border-gray-700 hover:border-yellow-400'
              }`}
            >
              <Zap className="w-8 h-8 text-yellow-300 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="text-white font-bold">Normal</div>
                <div className="text-gray-400 text-xs">Aliens spawn every 4-5 turns, 10% checkpoint loss</div>
              </div>
              {difficulty === 'normal' && (
                <div className="text-yellow-300 font-bold">✓</div>
              )}
            </button>

            {/* Hard */}
            <button
              onClick={() => handleDifficultyChange('hard')}
              className={`w-full p-4 rounded-lg transition-all transform hover:scale-102 flex items-center gap-3 ${
                difficulty === 'hard'
                  ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/50'
                  : 'bg-gray-800 border-2 border-gray-700 hover:border-red-400'
              }`}
            >
              <Skull className="w-8 h-8 text-red-300 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="text-white font-bold">Hard</div>
                <div className="text-gray-400 text-xs">Aliens spawn every 2-3 turns, 20% checkpoint loss!</div>
              </div>
              {difficulty === 'hard' && (
                <div className="text-red-300 font-bold">✓</div>
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg border border-blue-400 border-opacity-20">
          <p className="text-xs text-gray-300 text-center">
            ⚠️ Changing difficulty will affect future turns. Existing aliens and checkpoints remain unchanged.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
}
