import { Rocket } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';
import { useState } from 'react';
import IconSelector from './IconSelector';

export default function CompactPlayerPanel({ player, isCurrentPlayer, isMyPlayer = false, onRollDice, isRolling, gameWon, onChangeIcon }) {
  const { playSound } = useGameSounds();
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

    <div
      className={`glass rounded-lg p-2 border-2 transition-all ${
        isCurrentPlayer
          ? 'border-yellow-400 border-opacity-80 shadow-lg shadow-yellow-500/30'
          : 'border-gray-700 border-opacity-30'
      } ${isMyPlayer ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}
      style={{ minWidth: '70px', maxWidth: '90px' }}
    >
      {/* Player Name with Rocket */}
      <div className={`flex items-center gap-1 mb-1 ${player.color}`}>
        <Rocket className="w-3 h-3 flex-shrink-0" />
        <span className="font-bold text-xs truncate">{player.name}</span>
      </div>

      {/* Stats */}
      <div className="space-y-0.5 text-[10px] text-white">
        <div className="flex justify-between">
          <span className="text-gray-400">Pos:</span>
          <span className="font-bold">{player.position}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">CP:</span>
          <span className="font-bold">{player.lastCheckpoint}</span>
        </div>
      </div>

      {/* Icon Change Button */}
      {onChangeIcon && (
        <button
          onClick={() => {
            playSound('click');
            setShowIconSelector(true);
          }}
          className="w-full mt-1 glass rounded px-1 py-0.5 border border-gray-700 hover:border-yellow-400 transition-all flex items-center justify-center gap-1"
          title={`Change ${player.name}'s vehicle`}
        >
          <span className="text-sm">{player.icon || '🚀'}</span>
          <span className="text-white text-[9px]">Change</span>
        </button>
      )}

      {/* Roll Dice Button */}
      {isCurrentPlayer && onRollDice && (
        <button
          onClick={() => {
            playSound('click');
            onRollDice();
          }}
          disabled={isRolling || gameWon}
          className="w-full mt-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-1 px-1 rounded text-[10px] transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isRolling ? '...' : '🎲 SPIN'}
        </button>
      )}

      {/* Current Turn Indicator (when no roll button) */}
      {isCurrentPlayer && !onRollDice && (
        <div className="mt-1 text-center">
          <span className="text-yellow-300 text-[9px] font-bold animate-pulse">▶ TURN</span>
        </div>
      )}
    </div>
    </>
  );
}
