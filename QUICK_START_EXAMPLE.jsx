/**
 * QUICK START EXAMPLE
 *
 * This file shows a minimal integration example of the new systems
 * Copy and adapt this code to your existing game components
 */

import React, { useState, useEffect } from 'react';
import { useProgression } from './src/hooks/useProgression';
import { usePowerUps } from './src/hooks/usePowerUps';
import { useCurrency } from './src/hooks/useCurrency';
import { usePremium } from './src/hooks/usePremium';
import { useAds } from './src/hooks/useAds';
import { useDailyRewards } from './src/hooks/useDailyRewards';
import { useAnalytics } from './src/hooks/useAnalytics';

// UI Components
import { ProgressBar, AchievementsModal, StatsDisplay } from './src/components/ProgressionUI';
import { PowerUpInventory, PowerUpShop, CoinDisplay } from './src/components/PowerUpUI';
import { PremiumModal } from './src/components/PremiumUI';
import { DailyRewardsModal } from './src/components/DailyRewardsUI';
import { SimulatedAdOverlay, RewardedAdModal } from './src/components/AdUI';
import { NotificationManager } from './src/components/NotificationManager';

export function EnhancedGame() {
  // ========================================
  // STEP 1: Initialize all hooks
  // ========================================
  const progression = useProgression();
  const powerUps = usePowerUps();
  const currency = useCurrency();
  const premium = usePremium();
  const ads = useAds(premium.isPremium);
  const dailyRewards = useDailyRewards();
  const analytics = useAnalytics();

  // ========================================
  // STEP 2: UI state for modals
  // ========================================
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPowerUpShop, setShowPowerUpShop] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adType, setAdType] = useState(null);

  // Game state (your existing state)
  const [gameState, setGameState] = useState({
    playing: false,
    currentPlayer: 0,
    diceValue: null,
    winner: null
  });

  // ========================================
  // STEP 3: Track game start
  // ========================================
  useEffect(() => {
    if (gameState.playing) {
      progression.trackEvent('gameStart');
      analytics.trackGameplay('game_started', {
        mode: 'local',
        difficulty: 'normal'
      });
    }
  }, [gameState.playing]);

  // ========================================
  // STEP 4: Check daily rewards on mount
  // ========================================
  useEffect(() => {
    const status = dailyRewards.getRewardStatus();
    if (status.available) {
      setShowDailyRewards(true);
    }
  }, []);

  // ========================================
  // STEP 5: Handle game actions
  // ========================================

  const handleStartGame = () => {
    setGameState({ ...gameState, playing: true });
  };

  const handleRollDice = () => {
    const value = Math.floor(Math.random() * 6) + 1;

    // Track dice roll
    progression.trackEvent('diceRoll', { value });

    setGameState({ ...gameState, diceValue: value });
  };

  const handleGameWin = (winner) => {
    setGameState({ ...gameState, winner, playing: false });

    // Track progression
    progression.trackEvent('gameWon', {
      difficulty: 'normal',
      isOnline: false
    });

    // Earn currency
    const earnedCoins = currency.earnGameReward(true, 'normal', false);

    // Track analytics
    analytics.trackGameplay('game_completed', {
      won: true,
      difficulty: 'normal'
    });

    // Show ad if applicable
    ads.trackGamePlayed();
    if (ads.shouldShowInterstitial()) {
      setAdType('interstitial');
      setShowAdOverlay(true);
      ads.showInterstitialAd(() => {
        setShowAdOverlay(false);
      });
    }

    // Show achievement notifications (if any)
    // Happens automatically via progression.pendingNotifications
  };

  const handleUsePowerUp = async (powerUpId) => {
    const result = powerUps.usePowerUp(powerUpId);

    if (result.success) {
      // Apply power-up effect to game
      switch (result.effect) {
        case 'add_movement':
          // Add extra movement to player
          console.log('Speed boost activated!');
          break;
        case 'double_roll':
          // Allow rolling twice
          console.log('Lucky dice activated!');
          break;
        case 'force_six':
          // Next roll will be 6
          console.log('Lucky star activated!');
          break;
        // ... handle other effects
      }

      analytics.trackGameplay('powerup_used', {
        powerUpId,
        effect: result.effect
      });
    }
  };

  const handlePurchasePowerUp = (powerUpId) => {
    const result = powerUps.purchasePowerUp(powerUpId);

    if (result.success) {
      currency.removeCoins(result.cost);
      analytics.trackMonetization('currency_spent', {
        item: powerUpId,
        amount: result.cost,
        type: 'powerup'
      });
    }
  };

  const handleWatchRewardedAd = async () => {
    await ads.showRewardedAd(() => {
      // Give reward
      currency.earnAdReward();
      analytics.trackAdImpression('rewarded', 'shop', 0.02);
    });
  };

  const handlePurchasePremium = async (tierId) => {
    const result = await premium.purchasePremium(tierId);

    if (result.success) {
      currency.setPremiumStatus(true);
      analytics.trackPurchase('premium', tierId, premium.getCurrentTier().price);
    }
  };

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

      analytics.trackEngagement('daily_reward_claimed', {
        day: result.reward.day,
        streak: result.reward.streak
      });
    }
  };

  // ========================================
  // STEP 6: Render UI
  // ========================================

  return (
    <div className="game-container">
      {/* ==================== HEADER ==================== */}
      <div className="header flex items-center justify-between p-4 bg-gray-900">
        {/* Left: Progress & Coins */}
        <div className="flex items-center gap-4">
          <ProgressBar
            level={progression.level}
            xp={progression.xp}
            getProgressToNextLevel={progression.getProgressToNextLevel}
            className="w-64"
          />
          <CoinDisplay coins={currency.coins} />
          {premium.isPremium && (
            <div className="bg-yellow-600 px-3 py-1 rounded-full">
              <span className="text-white font-bold text-sm">PREMIUM</span>
            </div>
          )}
        </div>

        {/* Right: Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAchievements(true)}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white font-bold"
          >
            🏆 Achievements
          </button>
          <button
            onClick={() => setShowPowerUpShop(true)}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white font-bold"
          >
            🛍️ Shop
          </button>
          <button
            onClick={() => setShowDailyRewards(true)}
            className={`bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white font-bold ${
              dailyRewards.getRewardStatus().available ? 'animate-pulse' : ''
            }`}
          >
            🎁 Daily
          </button>
          <button
            onClick={() => setShowPremium(true)}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 px-4 py-2 rounded-lg text-black font-bold"
          >
            👑 Premium
          </button>
        </div>
      </div>

      {/* ==================== GAME AREA ==================== */}
      <div className="game-area p-4">
        {!gameState.playing ? (
          <button
            onClick={handleStartGame}
            className="bg-green-600 hover:bg-green-500 px-8 py-4 rounded-lg text-white font-bold text-xl"
          >
            Start Game
          </button>
        ) : (
          <>
            {/* Your existing game board here */}
            <div className="game-board">
              {/* ... game board rendering ... */}
            </div>

            {/* Dice roll button */}
            <button
              onClick={handleRollDice}
              className="bg-yellow-600 hover:bg-yellow-500 px-8 py-4 rounded-lg text-white font-bold"
            >
              🎲 Roll Dice
            </button>
          </>
        )}

        {/* Power-ups inventory */}
        <PowerUpInventory
          inventory={powerUps.inventory}
          activeEffects={powerUps.activeEffects}
          onUsePowerUp={handleUsePowerUp}
          gameActive={gameState.playing}
          className="mt-4"
        />
      </div>

      {/* ==================== SIDEBAR ==================== */}
      <div className="sidebar p-4 bg-gray-800">
        <StatsDisplay stats={progression.stats} className="mb-4" />

        {/* Show rewarded ad option */}
        {!premium.isPremium && ads.isRewardedAdAvailable() && (
          <button
            onClick={handleWatchRewardedAd}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 px-4 py-3 rounded-lg text-white font-bold"
          >
            📺 Watch Ad for 25 Coins
          </button>
        )}
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Achievements modal */}
      {showAchievements && (
        <AchievementsModal
          unlockedAchievements={progression.unlockedAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {/* Power-up shop */}
      {showPowerUpShop && (
        <PowerUpShop
          coins={currency.coins}
          inventory={powerUps.inventory}
          onPurchase={handlePurchasePowerUp}
          onClose={() => setShowPowerUpShop(false)}
        />
      )}

      {/* Premium modal */}
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

      {/* Daily rewards */}
      {showDailyRewards && (
        <DailyRewardsModal
          status={dailyRewards.getRewardStatus()}
          onClaim={handleClaimDailyReward}
          onClose={() => setShowDailyRewards(false)}
        />
      )}

      {/* Ad overlay (simulated) */}
      {showAdOverlay && (
        <SimulatedAdOverlay
          adType={adType}
          onClose={() => setShowAdOverlay(false)}
        />
      )}

      {/* Notifications (achievements, level-ups) */}
      <NotificationManager
        notifications={progression.pendingNotifications}
        onClearNotifications={progression.clearNotifications}
      />
    </div>
  );
}

// ========================================
// EXPORT FOR USE
// ========================================
export default EnhancedGame;

/*
 * INTEGRATION STEPS:
 *
 * 1. Copy the hook imports to your existing game component
 * 2. Initialize the hooks at the top of your component
 * 3. Add the UI components where appropriate
 * 4. Track events at key game moments:
 *    - Game start/end
 *    - Dice rolls
 *    - Special events (spaceports, aliens)
 *    - Wins/losses
 * 5. Add modal triggers (buttons in your UI)
 * 6. Test locally - everything works with localStorage!
 *
 * That's it! The systems are self-contained and won't break existing code.
 */
