import { Rocket } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';

export default function PlayerPanel({ player, isCurrentPlayer, onRollDice, isRolling, gameWon, isOnline, isMyPlayer, animatingPlayer, animationType }) {
  const { playSound } = useGameSounds();
  const isAnimating = animatingPlayer === player.id;
  const animationClass = isAnimating && animationType ? `animate-rocket-${animationType}` : '';

  return (
    <div className={`w-48 md:w-64 glass rounded-lg p-3 md:p-4 shadow-2xl border-2 transition-all duration-300 ${
      isCurrentPlayer
        ? 'border-blue-400 border-opacity-70 scale-105 shadow-blue-500/50'
        : 'border-gray-700'
    }`}>
      <div className={`p-2 md:p-3 rounded ${isCurrentPlayer ? 'bg-blue-800 border-2 border-blue-400 animate-pulse' : 'bg-gray-800'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Rocket className={`w-5 h-5 md:w-6 md:h-6 ${player.color} ${animationClass}`} />
          <span className={`font-bold text-sm md:text-lg ${player.color}`}>
            {player.name}
            {isOnline && isMyPlayer && <span className="text-xs text-gray-400 ml-1">(You)</span>}
          </span>
        </div>
        <div className="text-xs md:text-sm text-gray-300 space-y-1">
          <div>Position: <span className="font-bold text-white text-base md:text-lg">{player.position}</span></div>
          <div>Checkpoint: <span className="font-bold text-blue-300">{player.lastCheckpoint}</span></div>
        </div>
      </div>
      {isCurrentPlayer && onRollDice && (
        <div className="mt-2 md:mt-3">
          <button
            onClick={() => {
              playSound('click');
              onRollDice();
            }}
            disabled={isRolling || gameWon}
            className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-2 md:py-3 px-3 md:px-4 rounded-lg text-sm md:text-lg transition-all duration-500 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden group"
            style={{
              backgroundSize: '200% 100%'
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className={isRolling ? 'animate-spin' : ''}>🎲</span>
              {isRolling ? 'Rolling...' : 'SPIN'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-shimmer"></div>
          </button>
        </div>
      )}
      {isCurrentPlayer && !onRollDice && (
        <div className="mt-2 md:mt-3">
          <div className="w-full bg-gray-700 text-white font-bold py-2 md:py-3 px-3 md:px-4 rounded-lg text-sm md:text-lg text-center">
            Waiting for {player.name}...
          </div>
        </div>
      )}
    </div>
  );
}

