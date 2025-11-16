import { Trophy, Skull, RotateCcw, Home } from 'lucide-react';

/**
 * Game Over Modal Component
 * Displays when game ends (victory or defeat) with options to continue
 */
export default function GameOverModal({ 
  isOpen, 
  isVictory, 
  winnerName, 
  onPlayAgain, 
  onReturnToMenu 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* Modal */}
      <div className="relative z-10 bg-gray-900 rounded-2xl border-2 shadow-2xl w-full max-w-md mx-4 pointer-events-auto"
        style={{
          borderColor: isVictory ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        }}
      >
        {/* Header */}
        <div className={`p-6 rounded-t-lg ${
          isVictory 
            ? 'bg-gradient-to-r from-green-900 to-emerald-900' 
            : 'bg-gradient-to-r from-red-900 to-rose-900'
        }`}>
          <div className="text-center">
            {isVictory ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                <h2 className="text-3xl font-bold text-white">🎉 Victory!</h2>
              </>
            ) : (
              <>
                <Skull className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white">💀 Game Over</h2>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`text-center mb-6 ${
            isVictory ? 'text-green-300' : 'text-red-300'
          }`}>
            {isVictory ? (
              <p className="text-lg">
                <span className="font-bold text-yellow-300">{winnerName || 'You'}</span> reached the end!
              </p>
            ) : (
              <p className="text-lg">
                <span className="font-bold text-red-300">{winnerName || 'AI Opponent'}</span> reached the end first!
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onPlayAgain}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all transform hover:scale-105 ${
                isVictory
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500'
              } flex items-center justify-center gap-2`}
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
            
            <button
              onClick={onReturnToMenu}
              className="w-full py-3 px-4 rounded-lg font-bold bg-gray-700 hover:bg-gray-600 text-white transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

