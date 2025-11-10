import { Rocket } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';
import { useState } from 'react';
import IconSelector from './IconSelector';

export default function PlayerPanel({ player, isCurrentPlayer, onRollDice, isRolling, gameWon, isOnline, isMyPlayer, animatingPlayer, animationType, onChangeIcon }) {
  const { playSound } = useGameSounds();
  const isAnimating = animatingPlayer === player.id;
  const animationClass = isAnimating && animationType ? `animate-rocket-${animationType}` : '';
  const [showIconSelector, setShowIconSelector] = useState(false);

  return (
    <>
      <IconSelector
        isOpen={showIconSelector}
        onClose={() => setShowIconSelector(false)}
        onSelectIcon={(iconData) => onChangeIcon && onChangeIcon(player.id, iconData)}
        currentIcon={player.icon || '🚀'}
        playerName={player.name}
      />

    <div className={`w-32 sm:w-40 md:w-48 lg:w-64 glass rounded-lg p-2 sm:p-3 md:p-4 shadow-2xl border-2 transition-all duration-300 ${
      isCurrentPlayer
        ? 'border-blue-400 border-opacity-70 scale-105 shadow-blue-500/50'
        : 'border-gray-700'
    }`}>
      <div className={`p-1.5 sm:p-2 md:p-3 rounded ${isCurrentPlayer ? 'bg-blue-800 border-2 border-blue-400 animate-pulse' : 'bg-gray-800'}`}>
        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
          <Rocket className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${player.color} ${animationClass}`} />
          <span className={`font-bold text-xs sm:text-sm md:text-lg ${player.color} truncate`}>
            {player.name}
            {isOnline && isMyPlayer && <span className="text-[10px] sm:text-xs text-gray-400 ml-1">(You)</span>}
          </span>
        </div>
        <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 space-y-0.5 sm:space-y-1">
          <div>Pos: <span className="font-bold text-white text-sm sm:text-base md:text-lg">{player.position}</span></div>
          <div>CP: <span className="font-bold text-blue-300 text-xs sm:text-sm">{player.lastCheckpoint}</span></div>
        </div>
        {onChangeIcon && (
          <button
            onClick={() => {
              playSound('click');
              setShowIconSelector(true);
            }}
            className="mt-2 w-full glass rounded px-2 py-1 border border-gray-700 hover:border-yellow-400 transition-all flex items-center justify-center gap-1"
            title={`Change ${player.name}'s vehicle`}
          >
            <span className="text-lg">{player.icon || '🚀'}</span>
            <span className="text-white text-[10px] sm:text-xs">Change</span>
          </button>
        )}
      </div>
      {isCurrentPlayer && onRollDice && (
        <div className="mt-2 md:mt-3">
          <button
            onClick={() => {
              playSound('click');
              onRollDice();
            }}
            disabled={isRolling || gameWon}
            className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-1.5 sm:py-2 md:py-3 px-2 sm:px-3 md:px-4 rounded-lg text-xs sm:text-sm md:text-lg transition-all duration-500 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden group"
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
    </>
  );
}

