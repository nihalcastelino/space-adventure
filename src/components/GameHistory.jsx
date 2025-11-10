import { History, Trophy, Clock, Users } from 'lucide-react';
import { useGameHistory } from '../hooks/useGameHistory';
import { useState } from 'react';

export default function GameHistory({ onClose, playerName }) {
  const { gameHistory, loading, getPlayerHistory } = useGameHistory();
  const [filter, setFilter] = useState('all'); // 'all' or 'player'

  const displayHistory = filter === 'player' && playerName 
    ? getPlayerHistory(playerName)
    : gameHistory;

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="glass rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading game history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-blue-300">Game History</h2>
          </div>
          <div className="flex gap-2">
            {playerName && (
              <div className="flex gap-2 glass rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded transition-all ${
                    filter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('player')}
                  className={`px-3 py-1 rounded transition-all ${
                    filter === 'player' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  My Games
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="glass rounded-lg p-2 hover:bg-gray-700 transition-all transform hover:scale-110"
            >
              <span className="text-white text-xl">×</span>
            </button>
          </div>
        </div>

        {displayHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No game history yet!</p>
            <p className="text-gray-500 text-sm mt-2">Complete a game to see it here! 🎮</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayHistory.map((game) => (
              <div
                key={game.id}
                className="glass rounded-lg p-4 border border-gray-700 hover:border-blue-400 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Trophy className={`w-6 h-6 ${
                      game.winner?.color?.includes('yellow') ? 'text-yellow-400' :
                      game.winner?.color?.includes('blue') ? 'text-blue-400' :
                      game.winner?.color?.includes('green') ? 'text-green-400' :
                      'text-pink-400'
                    }`} />
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {game.winner?.name} won!
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(game.gameDuration || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {game.players.length} players
                        </span>
                        {game.totalMoves && (
                          <span>{game.totalMoves} moves</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    {formatDate(game.completedAt)}
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {game.players.map((player, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1 rounded text-sm ${
                        player.name === game.winner?.name
                          ? 'bg-yellow-400 bg-opacity-20 text-yellow-300 border border-yellow-400'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {player.name} ({player.position})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

