import { X, Play, Gift, Clock, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

// Simulated ad display (for testing)
export function SimulatedAdOverlay({ adType, onClose }) {
  const [countdown, setCountdown] = useState(3);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
      // Auto-close after countdown for rewarded ads
      if (adType === 'rewarded') {
        const closeTimer = setTimeout(() => {
          onClose();
        }, 500);
        return () => clearTimeout(closeTimer);
      }
    }
  }, [countdown, adType, onClose]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      <div className="text-center">
        <div className="bg-gray-900 rounded-lg p-8 border-2 border-yellow-400 max-w-md">
          {/* Ad simulation message */}
          <div className="mb-6">
            <Play className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {adType === 'rewarded' ? 'Rewarded Ad' : 'Advertisement'}
            </h2>
            <p className="text-gray-400 text-sm">
              This is a simulated ad for testing.
              <br />
              Real ads will be shown in production.
            </p>
          </div>

          {/* Countdown */}
          {!canClose && (
            <div className="mb-6">
              <div className="text-6xl font-bold text-yellow-400 mb-2">
                {countdown}
              </div>
              <p className="text-gray-400 text-sm">Seconds remaining...</p>
            </div>
          )}

          {/* Close button */}
          {canClose && (
            <button
              onClick={onClose}
              className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              {adType === 'rewarded' ? (
                <>
                  <Gift className="w-5 h-5" />
                  Claim Reward
                </>
              ) : (
                <>
                  <X className="w-5 h-5" />
                  Close Ad
                </>
              )}
            </button>
          )}

          {/* Skip notice for interstitials */}
          {adType === 'interstitial' && !canClose && (
            <p className="text-gray-500 text-xs mt-4">
              Skip available in {countdown}s
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Rewarded ad button
export function RewardedAdButton({
  reward,
  rewardType,
  onWatch,
  available = true,
  cooldown = 0,
  className = ''
}) {
  const [isWatching, setIsWatching] = useState(false);

  const handleWatch = async () => {
    setIsWatching(true);
    await onWatch();
    setIsWatching(false);
  };

  if (!available || cooldown > 0) {
    return (
      <button
        disabled
        className={`bg-gray-700 text-gray-500 font-bold py-3 px-6 rounded-lg cursor-not-allowed flex items-center gap-2 ${className}`}
      >
        <Clock className="w-5 h-5" />
        {cooldown > 0 ? `Available in ${Math.ceil(cooldown / 60)}m` : 'Not Available'}
      </button>
    );
  }

  return (
    <button
      onClick={handleWatch}
      disabled={isWatching}
      className={`bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2 shadow-lg ${className}`}
    >
      <Play className="w-5 h-5" />
      Watch Ad for {reward} {rewardType}
    </button>
  );
}

// Reward options modal
export function RewardedAdModal({ onClose, onSelectReward, available, cooldown }) {
  const rewards = [
    {
      id: '2x_xp',
      title: '2x XP Bonus',
      description: 'Double XP for your next game',
      icon: <Zap className="w-12 h-12 text-yellow-400" />,
      reward: '2x XP'
    },
    {
      id: 'coins',
      title: '25 Coins',
      description: 'Get instant coins to spend',
      icon: <Gift className="w-12 h-12 text-green-400" />,
      reward: '25 Coins'
    },
    {
      id: 'powerup',
      title: 'Random Power-Up',
      description: 'Receive a random power-up',
      icon: <div className="text-5xl">🎁</div>,
      reward: 'Power-Up'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full border-2 border-green-400">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Gift className="w-6 h-6 text-green-400" />
              Watch Ad for Rewards
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Choose a reward and watch a short ad
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Rewards grid */}
        <div className="p-6">
          {!available || cooldown > 0 ? (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-white font-bold text-lg mb-2">Ads Not Available</p>
              <p className="text-gray-400">
                {cooldown > 0
                  ? `Next ad available in ${Math.ceil(cooldown / 60)} minutes`
                  : 'Ads are temporarily unavailable'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <button
                  key={reward.id}
                  onClick={() => onSelectReward(reward.id)}
                  className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 hover:border-green-400 transition-all group"
                >
                  <div className="text-center">
                    <div className="mb-3 flex justify-center group-hover:scale-110 transition-transform">
                      {reward.icon}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">
                      {reward.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {reward.description}
                    </p>
                    <div className="bg-green-600 group-hover:bg-green-500 py-2 px-4 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      Watch Ad
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <p className="text-gray-400 text-sm text-center">
            💡 Premium members get these rewards without watching ads!
          </p>
        </div>
      </div>
    </div>
  );
}

// Ad removal purchase card
export function RemoveAdsCard({ onPurchase, className = '' }) {
  return (
    <div className={`bg-gradient-to-br from-purple-900 to-gray-900 rounded-lg p-6 border-2 border-purple-400 ${className}`}>
      <div className="text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h3 className="text-2xl font-bold text-white mb-2">Remove All Ads</h3>
        <p className="text-gray-300 mb-4">
          Enjoy uninterrupted gameplay with no ads forever
        </p>
        <div className="bg-black bg-opacity-40 rounded-lg p-4 mb-4">
          <div className="text-yellow-400 font-bold text-3xl mb-1">$4.99</div>
          <div className="text-gray-400 text-sm">One-time purchase</div>
        </div>
        <button
          onClick={onPurchase}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white transition-all"
        >
          Remove Ads Forever
        </button>
      </div>
    </div>
  );
}
