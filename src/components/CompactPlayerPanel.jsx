import { Rocket } from 'lucide-react';

export default function CompactPlayerPanel({ player, isCurrentPlayer, isMyPlayer = false, onRollDice, isRolling, gameWon }) {
  return (
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

      {/* Current Turn Indicator */}
      {isCurrentPlayer && (
        <div className="mt-1 text-center">
          <span className="text-yellow-300 text-[9px] font-bold animate-pulse">▶ TURN</span>
        </div>
      )}
    </div>
  );
}
