import { X, Gift, Calendar, Check, Lock, Flame } from 'lucide-react';
import { DAILY_REWARDS } from '../hooks/useDailyRewards';

export function DailyRewardsModal({ status, onClaim, onClose }) {
  const calendar = DAILY_REWARDS.map((reward, index) => ({
    ...reward,
    claimed: status.currentDay > reward.day,
    current: status.currentDay === reward.day,
    locked: status.currentDay < reward.day
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col border-2 border-green-400">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-green-900 to-blue-900">
          <button
            onClick={onClose}
            className="float-right p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
          <div className="text-center">
            <Gift className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              Daily Rewards
              {status.streak > 0 && (
                <span className="flex items-center gap-1 bg-orange-600 px-3 py-1 rounded-full text-lg">
                  <Flame className="w-5 h-5" />
                  {status.streak} Day Streak!
                </span>
              )}
            </h2>
            <p className="text-gray-300">
              Log in daily to earn amazing rewards!
            </p>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {calendar.map((reward) => (
              <div
                key={reward.day}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  reward.claimed
                    ? 'bg-gray-800 border-gray-700 opacity-60'
                    : reward.current
                    ? 'bg-gradient-to-br from-green-600 to-blue-600 border-green-400 shadow-lg shadow-green-500/50 scale-105'
                    : 'bg-gray-800 border-gray-700'
                } ${reward.special ? 'ring-4 ring-yellow-400' : ''}`}
              >
                {/* Day number */}
                <div className="text-gray-400 text-xs font-bold mb-2">
                  Day {reward.day}
                </div>

                {/* Icon */}
                <div className="text-4xl mb-2">{reward.icon}</div>

                {/* Rewards */}
                <div className="space-y-1">
                  <div className="text-yellow-400 font-bold text-sm">
                    {reward.coins} Coins
                  </div>
                  {reward.powerUp && (
                    <div className="text-purple-400 text-xs">+ Power-Up</div>
                  )}
                  <div className="text-blue-400 text-xs">
                    {reward.xp} XP
                  </div>
                </div>

                {/* Status indicator */}
                {reward.claimed && (
                  <div className="mt-2">
                    <Check className="w-5 h-5 text-green-400 mx-auto" />
                  </div>
                )}
                {reward.locked && (
                  <div className="mt-2">
                    <Lock className="w-5 h-5 text-gray-600 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Claim button */}
          {status.available && !status.claimed && (
            <div className="mt-6">
              <button
                onClick={onClaim}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 rounded-lg font-bold text-white text-xl transition-all shadow-lg"
              >
                Claim Today's Reward! 🎁
              </button>
            </div>
          )}

          {status.claimed && (
            <div className="mt-6 text-center">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <Check className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-white font-bold mb-1">Reward Claimed!</p>
                <p className="text-gray-400 text-sm">
                  Come back in {status.hoursUntilNext} hours for your next reward
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <p className="text-gray-400 text-sm text-center">
            💡 Keep your streak alive to unlock bigger rewards!
          </p>
        </div>
      </div>
    </div>
  );
}

export function DailyRewardNotification({ reward, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-gradient-to-br from-green-900 to-blue-900 border-2 border-green-400 rounded-lg p-4 shadow-2xl min-w-[300px]">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{reward.icon}</div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">Daily Reward Claimed!</h3>
            <div className="space-y-1">
              <p className="text-yellow-400 font-bold">+{reward.coins} Coins</p>
              {reward.powerUp && <p className="text-purple-400">+1 Power-Up</p>}
              <p className="text-blue-400">+{reward.xp} XP</p>
            </div>
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

export function QuickDailyRewardButton({ available, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`relative bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 ${className} ${
        available ? 'animate-pulse' : ''
      }`}
    >
      <Gift className="w-5 h-5" />
      Daily
      {available && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
      )}
    </button>
  );
}
