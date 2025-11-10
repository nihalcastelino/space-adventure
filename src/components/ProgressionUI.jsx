import { Trophy, Star, Award, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import { ACHIEVEMENTS } from '../hooks/useProgression';

export function ProgressBar({ level, xp, getProgressToNextLevel, className = '' }) {
  const progress = getProgressToNextLevel();

  return (
    <div className={`bg-gray-900 bg-opacity-90 rounded-lg p-3 border-2 border-yellow-400 border-opacity-30 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-yellow-300 shadow-lg">
            {level}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold text-sm">Level {level}</span>
            <span className="text-gray-400 text-xs">{xp}/{progress.needed} XP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 transition-all duration-500 ease-out relative"
              style={{ width: `${progress.percentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AchievementCard({ achievement, unlocked, compact = false }) {
  const isUnlocked = unlocked;

  if (compact) {
    return (
      <div className={`p-2 rounded-lg border-2 transition-all ${
        isUnlocked
          ? 'bg-gradient-to-br from-yellow-900 to-gray-900 border-yellow-400'
          : 'bg-gray-900 border-gray-700 opacity-50'
      }`}>
        <div className="text-center">
          <div className={`text-3xl mb-1 ${isUnlocked ? 'filter-none' : 'grayscale'}`}>
            {achievement.icon}
          </div>
          <div className="text-white text-xs font-bold truncate">{achievement.name}</div>
          {isUnlocked && (
            <div className="text-yellow-400 text-[10px] font-bold mt-1">+{achievement.xp} XP</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isUnlocked
        ? 'bg-gradient-to-br from-yellow-900 to-gray-900 border-yellow-400 shadow-lg shadow-yellow-500/20'
        : 'bg-gray-900 border-gray-700 opacity-60'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`text-4xl flex-shrink-0 ${isUnlocked ? 'filter-none' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold mb-1 flex items-center gap-2">
            {achievement.name}
            {isUnlocked && <Trophy className="w-4 h-4 text-yellow-400" />}
          </h4>
          <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
          <div className="flex items-center gap-2">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">+{achievement.xp} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AchievementsModal({ unlockedAchievements, onClose }) {
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  const achievements = Object.values(ACHIEVEMENTS);
  const filteredAchievements = achievements.filter(achievement => {
    const isUnlocked = unlockedAchievements.includes(achievement.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a =>
    unlockedAchievements.includes(a.id)
  ).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col border-2 border-yellow-400">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Achievements
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Unlocked: {unlockedCount}/{achievements.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Filter buttons */}
        <div className="p-4 border-b border-gray-700 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filter === 'all'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({achievements.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filter === 'unlocked'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filter === 'locked'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Locked ({achievements.length - unlockedCount})
          </button>
        </div>

        {/* Achievements list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAchievements.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={unlockedAchievements.includes(achievement.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationToast({ notification, onClose }) {
  const { type, title, message, level, achievement } = notification;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`rounded-lg p-4 shadow-2xl border-2 min-w-[300px] ${
        type === 'levelUp'
          ? 'bg-gradient-to-br from-yellow-900 to-gray-900 border-yellow-400'
          : 'bg-gradient-to-br from-green-900 to-gray-900 border-green-400'
      }`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {type === 'levelUp' ? (
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            ) : (
              <div className="text-4xl">{achievement?.icon}</div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">{title}</h3>
            <p className="text-gray-300 text-sm">{message}</p>
            {achievement && (
              <p className="text-green-400 font-bold text-sm mt-2">+{achievement.xp} XP</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatsDisplay({ stats, className = '' }) {
  return (
    <div className={`bg-gray-900 bg-opacity-90 rounded-lg p-4 border-2 border-yellow-400 border-opacity-30 ${className}`}>
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        Your Stats
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-yellow-400 font-bold text-2xl">{stats.totalWins}</div>
          <div className="text-gray-400 text-xs">Wins</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-blue-400 font-bold text-2xl">{stats.totalGames}</div>
          <div className="text-gray-400 text-xs">Games</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-green-400 font-bold text-2xl">
            {stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0}%
          </div>
          <div className="text-gray-400 text-xs">Win Rate</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-purple-400 font-bold text-2xl">
            {stats.fastestWin === Infinity ? '-' : stats.fastestWin}
          </div>
          <div className="text-gray-400 text-xs">Best Turns</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-red-400 font-bold text-2xl">{stats.aliensHit}</div>
          <div className="text-gray-400 text-xs">Aliens Hit</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-cyan-400 font-bold text-2xl">{stats.spaceportsUsed}</div>
          <div className="text-gray-400 text-xs">Warps Used</div>
        </div>
      </div>
    </div>
  );
}
