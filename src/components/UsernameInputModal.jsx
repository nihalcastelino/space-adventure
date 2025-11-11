import { useState, useEffect } from 'react';
import { X, User, Check } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';

/**
 * Username Input Modal
 * 
 * Allows users to set custom usernames for multiplayer games
 */
export default function UsernameInputModal({ 
  isOpen, 
  onClose, 
  players, 
  onChangePlayerName,
  onComplete 
}) {
  const { playSound } = useGameSounds();
  const [playerNames, setPlayerNames] = useState({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Initialize player names from existing players
  useEffect(() => {
    if (isOpen && players) {
      const names = {};
      players.forEach(player => {
        names[player.id] = player.name || `Player ${player.id}`;
      });
      setPlayerNames(names);
      setCurrentPlayerIndex(0);
    }
  }, [isOpen, players]);

  const handleNext = () => {
    playSound('click');
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      // All players named, save and close
      handleComplete();
    }
  };

  const handleComplete = () => {
    playSound('victory');
    // Update all player names
    Object.entries(playerNames).forEach(([playerId, name]) => {
      if (name && name.trim()) {
        onChangePlayerName(parseInt(playerId), name.trim());
      }
    });
    if (onComplete) onComplete();
    onClose();
  };

  const handleSkip = () => {
    playSound('click');
    handleComplete();
  };

  if (!isOpen || !players || players.length === 0) return null;

  const currentPlayer = players[currentPlayerIndex];
  const currentName = playerNames[currentPlayer.id] || `Player ${currentPlayer.id}`;
  const isLastPlayer = currentPlayerIndex === players.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleSkip}
      />
      
      {/* Modal */}
      <div className="relative z-10 bg-gray-900 rounded-2xl border-2 border-yellow-400 shadow-2xl w-full max-w-md mx-4 pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            Set Player Names
          </h2>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Player {currentPlayerIndex + 1} of {players.length}
              </span>
              <span className="text-sm text-gray-400">
                {currentPlayerIndex + 1}/{players.length}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentPlayerIndex + 1) / players.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Player indicator */}
          <div className="mb-6 text-center">
            <div className="text-6xl mb-2">{currentPlayer.icon || '🚀'}</div>
            <div className={`text-xl font-bold ${currentPlayer.color || 'text-white'}`}>
              {currentPlayer.name || `Player ${currentPlayer.id}`}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Enter Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={currentName}
                onChange={(e) => {
                  const newNames = { ...playerNames };
                  newNames[currentPlayer.id] = e.target.value;
                  setPlayerNames(newNames);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNext();
                  }
                }}
                placeholder={`Player ${currentPlayer.id}`}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border-2 border-gray-700 focus:border-yellow-400 focus:outline-none"
                autoFocus
                maxLength={20}
              />
            </div>
            <p className="mt-2 text-gray-400 text-xs">
              {currentName.length}/20 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {isLastPlayer ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Done</span>
                </>
              ) : (
                <span>Next</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

