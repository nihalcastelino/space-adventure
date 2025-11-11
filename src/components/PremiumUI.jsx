import { X, Crown, Check, Zap, Shield, Star, Sparkles, Gift } from 'lucide-react';
import { useState } from 'react';
import { PREMIUM_TIERS } from '../hooks/usePremium';

export function PremiumBadge({ className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-1 rounded-full ${className}`}>
      <Crown className="w-3 h-3 text-white" />
      <span className="text-white font-bold text-xs">PREMIUM</span>
    </div>
  );
}

export function PremiumTierCard({ tier, currentTier, onPurchase, isPopular = false }) {
  const isCurrent = currentTier === tier.id;

  return (
    <div className={`relative p-6 rounded-lg border-2 transition-all pointer-events-auto ${
      isPopular
        ? 'bg-gradient-to-br from-yellow-900 to-purple-900 border-yellow-400 shadow-lg shadow-yellow-500/30 scale-105'
        : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
    } ${isCurrent ? 'ring-4 ring-green-500' : ''}`}>
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-1 rounded-full">
          <span className="text-black font-bold text-sm flex items-center gap-1">
            <Star className="w-4 h-4" />
            BEST VALUE
          </span>
        </div>
      )}

      {/* Current badge */}
      {isCurrent && (
        <div className="absolute -top-3 right-4 bg-green-600 px-3 py-1 rounded-full">
          <span className="text-white font-bold text-xs flex items-center gap-1">
            <Check className="w-3 h-3" />
            CURRENT
          </span>
        </div>
      )}

      <div className="text-center mb-4">
        <div className="text-4xl mb-2">
          {tier.id === 'free' ? '🆓' : tier.id === 'lifetime' ? '💎' : '👑'}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
        <div className="mb-4">
          {tier.price === 0 ? (
            <div className="text-3xl font-bold text-gray-400">Free</div>
          ) : (
            <>
              <div className="text-4xl font-bold text-yellow-400">
                ${tier.price}
              </div>
              <div className="text-gray-400 text-sm">
                {tier.interval === 'month' ? 'per month' : 'one-time'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Features list */}
      <div className="space-y-2 mb-6">
        {tier.perks?.map((perk, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-white text-sm">{perk}</span>
          </div>
        ))}
      </div>

      {/* Action button */}
      {tier.id !== 'free' && !isCurrent && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Tier card button clicked:', tier.id);
            if (onPurchase) {
              onPurchase(tier.id);
            } else {
              console.error('onPurchase function not provided');
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          className={`w-full py-3 rounded-lg font-bold transition-all cursor-pointer relative z-10 pointer-events-auto ${
            isPopular
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          type="button"
          style={{ position: 'relative', zIndex: 10 }}
        >
          {tier.interval === 'once' ? 'Buy Now' : 'Subscribe'}
        </button>
      )}

      {isCurrent && tier.id !== 'free' && (
        <div className="w-full py-3 rounded-lg font-bold bg-green-600 text-white text-center">
          Active
        </div>
      )}
    </div>
  );
}

export function PremiumModal({ currentTier, subscriptionStatus, onPurchase, onCancel, onRestore, onClose, error }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (tierId) => {
    console.log('handlePurchase called with tierId:', tierId);
    if (isProcessing) {
      console.log('Already processing, ignoring click');
      return;
    }
    setIsProcessing(true);
    try {
      const result = await onPurchase(tierId);
      console.log('Purchase result:', result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col border-2 border-yellow-400 my-4 relative" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-yellow-900 to-purple-900 relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Close button clicked');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors z-50 cursor-pointer"
            type="button"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
          <div className="text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              Upgrade to Premium
            </h2>
            <p className="text-gray-300">
              Unlock exclusive features and support development
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-900 bg-opacity-40 border-b border-red-400">
            <div className="flex items-center gap-3">
              <X className="w-6 h-6 text-red-400" />
              <div>
                <div className="text-white font-bold">Error</div>
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription status */}
        {subscriptionStatus.active && currentTier !== 'free' && (
          <div className="p-4 bg-green-900 bg-opacity-40 border-b border-green-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-400" />
                <div>
                  <div className="text-white font-bold">Premium Active</div>
                  <div className="text-green-400 text-sm">
                    {currentTier === 'lifetime'
                      ? 'Lifetime access'
                      : subscriptionStatus.expiresAt
                      ? `Renews ${new Date(subscriptionStatus.expiresAt).toLocaleDateString()}`
                      : 'Active subscription'}
                  </div>
                </div>
              </div>
              {currentTier !== 'lifetime' && subscriptionStatus.autoRenew && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tiers grid */}
        <div className="flex-1 overflow-y-auto p-6 relative z-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 relative z-0">
            <PremiumTierCard
              tier={PREMIUM_TIERS.FREE}
              currentTier={currentTier}
              onPurchase={handlePurchase}
            />
            <PremiumTierCard
              tier={PREMIUM_TIERS.MONTHLY}
              currentTier={currentTier}
              onPurchase={handlePurchase}
              isPopular={true}
            />
            <PremiumTierCard
              tier={PREMIUM_TIERS.LIFETIME}
              currentTier={currentTier}
              onPurchase={handlePurchase}
            />
          </div>

          {/* Benefits showcase */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              Premium Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-600 p-2 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">Earn More Coins</div>
                  <div className="text-gray-400 text-sm">Up to 2x coins from every game</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">Ad-Free Experience</div>
                  <div className="text-gray-400 text-sm">Play without any interruptions</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">Exclusive Cosmetics</div>
                  <div className="text-gray-400 text-sm">Access premium skins and themes</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">Daily Bonuses</div>
                  <div className="text-gray-400 text-sm">Get free coins every day</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Secure payment • Cancel anytime • 30-day money-back guarantee
            </p>
            <button
              onClick={onRestore}
              className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors"
            >
              Restore Purchases
            </button>
          </div>
        </div>

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg z-40 pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-bold">Processing payment...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuickPremiumButton({ isPremium, onClick, className = '' }) {
  if (isPremium) {
    return (
      <button
        onClick={onClick}
        className={`bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 shadow-lg ${className}`}
      >
        <Crown className="w-5 h-5" />
        Premium
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 shadow-lg animate-pulse ${className}`}
    >
      <Crown className="w-5 h-5" />
      Go Premium
    </button>
  );
}

export function PremiumFeatureLock({ featureName, onUpgrade }) {
  return (
    <div className="bg-gradient-to-br from-purple-900 to-gray-900 rounded-lg p-6 border-2 border-purple-400 text-center">
      <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
      <h3 className="text-white font-bold text-lg mb-2">Premium Feature</h3>
      <p className="text-gray-300 mb-4">
        {featureName} is only available for Premium members
      </p>
      <button
        onClick={onUpgrade}
        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-2 px-6 rounded-lg transition-all"
      >
        Upgrade Now
      </button>
    </div>
  );
}
