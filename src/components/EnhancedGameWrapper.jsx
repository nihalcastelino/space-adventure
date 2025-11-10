import { useState, useEffect } from 'react';
import { Crown, Gift, Award, ShoppingBag, Menu, X } from 'lucide-react';

// Import all systems
import { useProgression } from '../hooks/useProgression';
import { usePowerUps } from '../hooks/usePowerUps';
import { useCurrency } from '../hooks/useCurrency';
import { usePremium } from '../hooks/usePremium';
import { useAds } from '../hooks/useAds';
import { useDailyRewards } from '../hooks/useDailyRewards';
import { useAnalytics } from '../hooks/useAnalytics';

// Import UI components
import { ProgressBar, AchievementsModal, StatsDisplay } from './ProgressionUI';
import { PowerUpInventory, PowerUpShop, CoinDisplay } from './PowerUpUI';
import { PremiumModal, QuickPremiumButton } from './PremiumUI';
import { DailyRewardsModal, QuickDailyRewardButton } from './DailyRewardsUI';
import { SimulatedAdOverlay, RewardedAdModal } from './AdUI';
import { NotificationManager } from './NotificationManager';

/**
 * EnhancedGameWrapper
 *
 * Wraps any game component with full monetization systems:
 * - Progression (XP, levels, achievements)
 * - Power-ups
 * - Currency
 * - Premium
 * - Ads
 * - Daily rewards
 * - Analytics
 */
export default function EnhancedGameWrapper({ children, gameState, onPowerUpUse }) {
  // Initialize all systems
  const progression = useProgression();
  const powerUps = usePowerUps();
  const currency = useCurrency();
  const premium = usePremium();
  const ads = useAds(premium.isPremium);
  const dailyRewards = useDailyRewards();
  const analytics = useAnalytics();

  // UI State
  const [showMenu, setShowMenu] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showPowerUpShop, setShowPowerUpShop] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [showRewardedAdModal, setShowRewardedAdModal] = useState(false);
  const [adType, setAdType] = useState(null);

  // Check daily rewards on mount
  useEffect(() => {
    const status = dailyRewards.getRewardStatus();
    if (status.available && !status.claimed) {
      // Show daily rewards after a short delay
      setTimeout(() => {
        setShowDailyRewards(true);
      }, 2000);
    }
  }, []);

  // Track session start
  useEffect(() => {
    analytics.trackEvent('session_start', { mode: gameState?.mode || 'unknown' });
    currency.checkDailyLogin();
  }, []);

  // Handle game events from parent
  useEffect(() => {
    if (!gameState) return;

    // Track game start
    if (gameState.playing && !gameState.tracked) {
      progression.trackEvent('gameStart');
      analytics.trackGameplay('game_started', {
        mode: gameState.mode,
        difficulty: gameState.difficulty
      });
      gameState.tracked = true;
    }

    // Track game win
    if (gameState.winner && !gameState.rewardGiven) {
      const isWinner = gameState.winner.id === 1; // Assuming player 1 is human

      if (isWinner) {
        // Track progression
        progression.trackEvent('gameWon', {
          difficulty: gameState.difficulty,
          isOnline: gameState.mode === 'online'
        });

        // Earn currency
        const earned = currency.earnGameReward(true, gameState.difficulty, gameState.mode === 'online');

        // Track analytics
        analytics.trackGameplay('game_completed', {
          won: true,
          difficulty: gameState.difficulty,
          mode: gameState.mode
        });

        // Show interstitial ad if applicable
        ads.trackGamePlayed();
        if (ads.shouldShowInterstitial()) {
          setTimeout(() => {
            setAdType('interstitial');
            setShowAdOverlay(true);
            ads.showInterstitialAd(() => {
              setShowAdOverlay(false);
            });
          }, 2000);
        }
      }

      gameState.rewardGiven = true;
    }
  }, [gameState]);

  // Handle power-up usage
  const handleUsePowerUp = (powerUpId) => {
    const result = powerUps.usePowerUp(powerUpId);

    if (result.success) {
      analytics.trackGameplay('powerup_used', {
        powerUpId,
        effect: result.effect
      });

      // Notify parent component
      onPowerUpUse?.(powerUpId, result);
    }
  };

  // Handle power-up purchase
  const handlePurchasePowerUp = (powerUpId) => {
    const powerUp = Object.values(require('../hooks/usePowerUps').POWERUPS).find(p => p.id === powerUpId);
    if (!powerUp) return;

    const removeResult = currency.removeCoins(powerUp.cost);
    if (removeResult.success) {
      powerUps.addPowerUp(powerUpId, 1);
      analytics.trackMonetization('currency_spent', {
        item: powerUpId,
        amount: powerUp.cost,
        type: 'powerup'
      });
    } else {
      alert(removeResult.error);
    }
  };

  // Handle premium purchase
  const handlePurchasePremium = async (tierId) => {
    const result = await premium.purchasePremium(tierId);

    if (result.success) {
      currency.setPremiumStatus(true);
      const tier = premium.getCurrentTier();
      analytics.trackPurchase('premium', tierId, tier.price);
    }
  };

  // Handle daily reward claim
  const handleClaimDailyReward = () => {
    const result = dailyRewards.claimReward();

    if (result.success) {
      // Award coins
      currency.addCoins(result.reward.coins);

      // Award power-up if included
      if (result.reward.powerUp) {
        powerUps.addPowerUp(result.reward.powerUp, 1);
      }

      // Award XP
      progression.addXP(result.reward.xp);

      analytics.trackEvent('daily_reward_claimed', {
        day: result.reward.day,
        streak: result.reward.streak
      });

      setShowDailyRewards(false);
    }
  };

  // Handle rewarded ad
  const handleWatchRewardedAd = (rewardType) => {
    setShowRewardedAdModal(false);
    setAdType('rewarded');
    setShowAdOverlay(true);

    ads.showRewardedAd(() => {
      setShowAdOverlay(false);

      // Give reward based on type
      switch (rewardType) {
        case '2x_xp':
          // Set 2x XP flag for next game
          gameState.xpMultiplier = 2;
          break;
        case 'coins':
          currency.earnAdReward();
          break;
        case 'powerup':
          const randomPowerUp = powerUps.generateRandomReward();
          powerUps.addPowerUp(randomPowerUp.id, 1);
          break;
      }

      analytics.trackAdImpression('rewarded', 'reward_modal', 0.02);
    });
  };

  return (
    <>
      {/* Top HUD */}
      <div className="fixed top-16 left-2 right-2 z-40 flex items-start justify-between pointer-events-none">
        {/* Left: Progress & Coins */}
        <div className="pointer-events-auto space-y-2 max-w-xs">
          <ProgressBar
            level={progression.level}
            xp={progression.xp}
            getProgressToNextLevel={progression.getProgressToNextLevel}
          />
          <div className="flex items-center gap-2">
            <CoinDisplay coins={currency.coins} />
            {premium.isPremium && (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-2 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3 text-white" />
                <span className="text-white font-bold text-xs">PREMIUM</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-yellow-400 transition-all"
          >
            {showMenu ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>

          {showMenu && (
            <div className="glass rounded-lg p-2 shadow-lg border-2 border-yellow-400 space-y-2">
              <button
                onClick={() => {
                  setShowAchievements(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded transition-colors"
              >
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-white text-sm font-bold">Achievements</span>
              </button>

              <button
                onClick={() => {
                  setShowPowerUpShop(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-bold">Shop</span>
              </button>

              <QuickDailyRewardButton
                available={dailyRewards.getRewardStatus().available}
                onClick={() => {
                  setShowDailyRewards(true);
                  setShowMenu(false);
                }}
                className="w-full"
              />

              <QuickPremiumButton
                isPremium={premium.isPremium}
                onClick={() => {
                  setShowPremium(true);
                  setShowMenu(false);
                }}
                className="w-full"
              />

              {!premium.isPremium && ads.isRewardedAdAvailable() && (
                <button
                  onClick={() => {
                    setShowRewardedAdModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded transition-colors bg-green-900"
                >
                  <Gift className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm font-bold">Watch Ad</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Power-ups */}
      <div className="fixed bottom-20 left-2 right-2 z-30 pointer-events-none">
        <div className="pointer-events-auto max-w-2xl mx-auto">
          <PowerUpInventory
            inventory={powerUps.inventory}
            activeEffects={powerUps.activeEffects}
            onUsePowerUp={handleUsePowerUp}
            gameActive={gameState?.playing}
          />
        </div>
      </div>

      {/* Main Game Content */}
      {children}

      {/* Modals */}
      {showAchievements && (
        <AchievementsModal
          unlockedAchievements={progression.unlockedAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showPowerUpShop && (
        <PowerUpShop
          coins={currency.coins}
          inventory={powerUps.inventory}
          onPurchase={handlePurchasePowerUp}
          onClose={() => setShowPowerUpShop(false)}
        />
      )}

      {showPremium && (
        <PremiumModal
          currentTier={premium.tier}
          subscriptionStatus={premium.subscriptionStatus}
          onPurchase={handlePurchasePremium}
          onCancel={premium.cancelSubscription}
          onRestore={premium.restorePurchases}
          onClose={() => setShowPremium(false)}
        />
      )}

      {showDailyRewards && (
        <DailyRewardsModal
          status={dailyRewards.getRewardStatus()}
          onClaim={handleClaimDailyReward}
          onClose={() => setShowDailyRewards(false)}
        />
      )}

      {showRewardedAdModal && (
        <RewardedAdModal
          onClose={() => setShowRewardedAdModal(false)}
          onSelectReward={handleWatchRewardedAd}
          available={ads.isRewardedAdAvailable()}
          cooldown={ads.getRewardedAdCooldown()}
        />
      )}

      {showAdOverlay && (
        <SimulatedAdOverlay
          adType={adType}
          onClose={() => setShowAdOverlay(false)}
        />
      )}

      {/* Notifications */}
      <NotificationManager
        notifications={progression.pendingNotifications}
        onClearNotifications={progression.clearNotifications}
      />
    </>
  );
}
