import { Trophy, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';

export default function Leaderboard({ onClose }) {
  const { leaderboard, loading } = useLeaderboard();
  const [copied, setCopied] = useState(false);

  const shareLeaderboard = () => {
    const leaderboardText = leaderboard
      .slice(0, 10)
      .map((entry, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const winRate = entry.totalGames > 0
          ? ((entry.wins / entry.totalGames) * 100).toFixed(1)
          : '0.0';
        return `${medal} ${entry.name} - ${entry.wins} wins (${winRate}% win rate)`;
      })
      .join('\n');

    const shareText = `🚀 Space Adventure Leaderboard 🚀\n\n${leaderboardText}\n\nPlay at: ${window.location.origin}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Space Adventure Leaderboard',
        text: shareText
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLeaderboard = () => {
    const leaderboardText = leaderboard
      .slice(0, 10)
      .map((entry, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const winRate = entry.totalGames > 0
          ? ((entry.wins / entry.totalGames) * 100).toFixed(1)
          : '0.0';
        return `${medal} ${entry.name} - ${entry.wins} wins (${winRate}% win rate)`;
      })
      .join('\n');

    const shareText = `🚀 Space Adventure Leaderboard 🚀\n\n${leaderboardText}\n\nPlay at: ${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="glass rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-yellow-300">Leaderboard</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={shareLeaderboard}
              className="glass rounded-lg p-2 hover:bg-gray-700 transition-all transform hover:scale-110"
              title="Share leaderboard"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={copyLeaderboard}
              className="glass rounded-lg p-2 hover:bg-gray-700 transition-all transform hover:scale-110"
              title="Copy leaderboard"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="glass rounded-lg p-2 hover:bg-gray-700 transition-all transform hover:scale-110"
            >
              <span className="text-white text-xl">×</span>
            </button>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No games played yet!</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to play and claim the top spot! 🚀</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
              const winRate = entry.gamesPlayed > 0 
                ? ((entry.wins / entry.gamesPlayed) * 100).toFixed(1) 
                : '0.0';
              
              return (
                <div
                  key={entry.id}
                  className={`glass rounded-lg p-4 flex items-center justify-between transition-all ${
                    index < 3 ? 'border-2 border-yellow-400 border-opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl w-12 text-center">
                      {medal || <span className="text-gray-400 text-xl">#{index + 1}</span>}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{entry.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-400 mt-1">
                        <span>{entry.wins} {entry.wins === 1 ? 'win' : 'wins'}</span>
                        <span>{entry.totalGames} {entry.totalGames === 1 ? 'game' : 'games'}</span>
                        <span>{winRate}% win rate</span>
                      </div>
                    </div>
                  </div>
                  {entry.bestTime && (
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Best Time</div>
                      <div className="text-sm text-yellow-400 font-bold">
                        {Math.floor(entry.bestTime / 60000)}:{(Math.floor((entry.bestTime % 60000) / 1000)).toString().padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

