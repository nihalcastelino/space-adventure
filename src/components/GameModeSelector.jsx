import { Rocket, Users, Wifi, Zap, Shield, Skull, Bot, Lock, Crown, Flame, Moon, AlertTriangle, Info, Search, Sword, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import AuthButton from './AuthButton';
import AdSenseAd from './AdSenseAd';
import PremiumModal from './PremiumModal';
import { supabase } from '../lib/supabase';
import { useGameSounds } from '../hooks/useGameSounds';
import { useFreemiumLimits } from '../hooks/useFreemiumLimits';
import { usePremium } from '../hooks/usePremium';
import { useCurrency } from '../hooks/useCurrency';
import { GAME_VARIANTS } from '../hooks/useGameVariants';
import { getScreenBackground } from '../utils/backgrounds';

export default function GameModeSelector({ onSelectMode, onUpgrade }) {
  const { playSound } = useGameSounds();
  const [difficulty, setDifficulty] = useState('normal');
  const [selectedVariant, setSelectedVariant] = useState('classic');
  const [visibleTooltip, setVisibleTooltip] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const freemium = useFreemiumLimits();
  const premium = usePremium();
  const currency = useCurrency();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectMode = (mode) => {
    playSound('click');
    const isOnline = mode === 'online';
    const canPlay = freemium.canPlayGame(isOnline);
    if (!canPlay.allowed) {
      alert(canPlay.reason);
      onUpgrade?.();
      return;
    }
    if (mode === 'online') {
      freemium.recordGamePlayed(true);
    }
    const randomizationSeed = Date.now() + Math.random();
    onSelectMode(mode, difficulty, selectedVariant, randomizationSeed);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.group')) {
      setVisibleTooltip(null);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col bg-black"
      style={{
        backgroundImage: `url(/${getScreenBackground('menu')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      {/* --- Modals --- */}
      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}
      {showShopModal && <ShopModal coins={currency.coins} onClose={() => setShowShopModal(false)} onUpgrade={() => { setShowShopModal(false); setShowPremiumModal(true); }} />}

      {/* --- Main Layout --- */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Top Bar */}
        <header className="flex-shrink-0 p-2 sm:p-4 flex items-center justify-between gap-2">
          <div className="flex-1 flex justify-start">
            {/* Can add elements here if needed */}
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-yellow-300" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Space Adventure
            </h1>
          </div>
          <div className="flex-1 flex justify-end items-center gap-2">
            <AuthButton />
            {!premium.isPremium && (
              <button onClick={() => { playSound('click'); setShowPremiumModal(true); }} className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 text-black font-bold py-2 px-3 rounded-lg shadow-lg transform hover:scale-105 flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4" /> <span className="hidden sm:inline">Premium</span>
              </button>
            )}
            <button onClick={() => { playSound('click'); setShowShopModal(true); }} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-3 rounded-lg shadow-lg transform hover:scale-105 flex items-center gap-2 text-sm">
              <ShoppingBag className="w-4 h-4" /> <span className="hidden sm:inline">Shop</span>
              <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded font-bold">{currency.coins}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-grow flex-1 min-h-0 overflow-y-auto p-4">
          <div className="text-center space-y-4 md:space-y-6 max-w-4xl w-full mx-auto">
            
            {/* Difficulty Selector */}
            <div className="glass rounded-lg p-3 md:p-4 shadow-2xl border-2 border-yellow-400/30">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                Choose Difficulty
              </h3>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {['easy', 'normal', 'hard', 'extreme', 'nightmare', 'chaos'].map(d => {
                  const isLocked = (d === 'hard' && !premium.isPremium && !freemium.canUseDifficulty('hard')) || (['extreme', 'nightmare', 'chaos'].includes(d) && !premium.isPremium);
                  const difficultyConfig = {
                    easy: { icon: Shield, color: 'green', label: 'Easy', desc: 'No extras' },
                    normal: { icon: Zap, color: 'yellow', label: 'Normal', desc: 'Balanced' },
                    hard: { icon: Skull, color: 'red', label: 'Hard', desc: 'Extreme!' },
                    extreme: { icon: Flame, color: 'orange', label: 'Extreme', desc: '2x Rewards' },
                    nightmare: { icon: Moon, color: 'purple', label: 'Nightmare', desc: '2.5x Rewards' },
                    chaos: { icon: AlertTriangle, color: 'pink', label: 'Chaos', desc: '3x Rewards' }
                  };
                  const Icon = difficultyConfig[d].icon;
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        if (isLocked) { playSound('error'); onUpgrade?.(); return; }
                        playSound('click');
                        setDifficulty(d);
                      }}
                      disabled={isLocked}
                      className={`flex-grow-0 flex-shrink-0 basis-28 p-2 md:p-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 relative ${
                        difficulty === d ? `bg-${difficultyConfig[d].color}-600 border-2 border-${difficultyConfig[d].color}-400 shadow-lg` : 
                        isLocked ? 'bg-gray-900/80 border-2 border-gray-800 opacity-60 cursor-not-allowed' : 
                        'bg-gray-800/80 border-2 border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <Icon className={`w-6 h-6 md:w-8 md:h-8 text-${difficultyConfig[d].color}-300 mx-auto mb-1`} />
                      <div className={`font-bold text-xs md:text-sm flex items-center justify-center gap-1 ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                        {difficultyConfig[d].label}
                        {isLocked && <Lock className="w-3 h-3 text-yellow-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game Variants Selector */}
            <div className="glass rounded-lg p-3 md:p-4 shadow-2xl border-2 border-yellow-400/30">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5 text-yellow-300" />
                Game Variant
              </h3>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {Object.values(GAME_VARIANTS).map((variant) => {
                  const isLocked = variant.requiresPremium && !premium.isPremium;
                  const isSelected = selectedVariant === variant.id;
                  return (
                    <div key={variant.id} className="relative group">
                      <button
                        onClick={() => {
                          if (isLocked) { playSound('error'); onUpgrade?.(); return; }
                          playSound('click');
                          setSelectedVariant(variant.id);
                        }}
                        disabled={isLocked}
                        className={`flex-grow-0 flex-shrink-0 basis-28 p-2 md:p-3 rounded-lg transition-all transform hover:scale-105 ${
                          isSelected ? 'bg-yellow-600 border-2 border-yellow-400 shadow-lg' : 
                          isLocked ? 'bg-gray-900/80 border-2 border-gray-800 opacity-60 cursor-not-allowed' : 
                          'bg-gray-700/80 border-2 border-gray-600 hover:border-gray-500'
                        }`}
                        title={variant.description}
                      >
                        <div className={`font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                          <span>{variant.icon}</span>
                          <span>{variant.name}</span>
                          {isLocked && <Lock className="w-3 h-3" />}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Game Mode Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              <button onClick={() => handleSelectMode('ai')} className="glass p-4 rounded-lg shadow-2xl border-2 border-gray-700/80 hover:border-purple-400/80 transition-colors group">
                <Bot className="w-12 h-12 text-purple-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h2 className="text-lg font-bold text-white">vs AI</h2>
                <p className="text-sm text-gray-400">Challenge an AI opponent</p>
              </button>
              <button onClick={() => handleSelectMode('local')} className="glass p-4 rounded-lg shadow-2xl border-2 border-gray-700/80 hover:border-blue-400/80 transition-colors group">
                <Users className="w-12 h-12 text-blue-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h2 className="text-lg font-bold text-white">Local Multiplayer</h2>
                <p className="text-sm text-gray-400">Play with friends on this device</p>
              </button>
              <button onClick={() => handleSelectMode('online')} className="glass p-4 rounded-lg shadow-2xl border-2 border-gray-700/80 hover:border-green-400/80 transition-colors group">
                <Wifi className="w-12 h-12 text-green-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h2 className="text-lg font-bold text-white">Online Multiplayer</h2>
                <p className="text-sm text-gray-400">Play with friends online</p>
              </button>
            </div>
            
            <div className="pt-4 flex justify-center">
               <AdSenseAd adFormat="horizontal" className="w-full max-w-4xl" style={{ minHeight: '100px' }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Shop Modal Component
function ShopModal({ coins, onClose, onUpgrade }) {
  const { playSound } = useGameSounds();
  
  const coinPriceIds = {
    coins_small: import.meta.env.VITE_STRIPE_PRICE_COINS_SMALL,
    coins_medium: import.meta.env.VITE_STRIPE_PRICE_COINS_MEDIUM,
    coins_large: import.meta.env.VITE_STRIPE_PRICE_COINS_LARGE,
    coins_xlarge: import.meta.env.VITE_STRIPE_PRICE_COINS_XLARGE,
    coins_mega: import.meta.env.VITE_STRIPE_PRICE_COINS_MEGA,
  };

  const handleCoinPurchase = async (packageId, coinAmount, price) => {
    const priceId = coinPriceIds[packageId];
    
    if (!priceId) {
      alert('Coin package not configured. Please contact support.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please sign in to purchase coins. Click "Sign In" in the top right corner.');
      return;
    }

    try {
      let countryCode = null;
      try {
        const { detectUserRegion } = await import('../lib/paymentConfig');
        const region = await detectUserRegion();
        countryCode = region.countryCode;
        console.log(`🌍 Detected region: ${region.country} (${region.countryCode})`);
      } catch (error) {
        console.warn('Region detection failed, using default:', error);
      }

      const apiUrl = import.meta.env.VITE_API_URL || '/.netlify/functions/create-checkout';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          priceId,
          tier: 'coins',
          type: 'coins',
          countryCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Purchase error:', error);
      alert(`Failed to start checkout: ${error.message}`);
    }
  };
  
  const coinPackages = [
    { id: 'coins_small', coins: 100, price: '$0.99', bonus: 0 },
    { id: 'coins_medium', coins: 350, price: '$2.99', bonus: 50, popular: true },
    { id: 'coins_large', coins: 650, price: '$4.99', bonus: 100 },
    { id: 'coins_xlarge', coins: 1500, price: '$9.99', bonus: 300 },
    { id: 'coins_mega', coins: 3500, price: '$19.99', bonus: 1000, bestValue: true }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => {
          playSound('click');
          onClose();
        }}
      />
      
      <div className="relative z-10 bg-gray-900 rounded-2xl border-2 border-blue-400 shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-400" />
            Shop
          </h2>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 rounded-lg p-4 mb-6 border-2 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Your Balance</p>
                <p className="text-3xl font-bold text-yellow-300 flex items-center gap-2">
                  <span>🪙</span>
                  {coins.toLocaleString()} Coins
                </p>
              </div>
              <button
                onClick={onUpgrade}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-all"
              >
                Get Premium
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Buy Coins</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coinPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-gray-800 rounded-lg p-4 border-2 ${
                    pkg.popular
                      ? 'border-yellow-400 ring-2 ring-yellow-400/50'
                      : pkg.bestValue
                      ? 'border-purple-400 ring-2 ring-purple-400/50'
                      : 'border-gray-700'
                  } relative`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}
                  {pkg.bestValue && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      BEST VALUE
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">
                      {pkg.coins.toLocaleString()}
                    </div>
                    {pkg.bonus > 0 && (
                      <div className="text-green-400 text-sm font-bold">
                        +{pkg.bonus} Bonus!
                      </div>
                    )}
                    <div className="text-2xl font-bold text-white mt-2">
                      {pkg.price}
                    </div>
                  </div>
                  
                  <button
                    onClick={async () => {
                      playSound('click');
                      await handleCoinPurchase(pkg.id, pkg.coins, pkg.price);
                    }}
                    className={`w-full py-2 rounded-lg font-bold transition-all ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-yellow-900/50 to-blue-900/50 rounded-lg p-6 border border-yellow-400/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              Premium Benefits
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                50% more coins from all sources
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                No ads
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Access to all difficulties and game variants
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Exclusive cosmetics and titles
              </li>
            </ul>
            <button
              onClick={onUpgrade}
              className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3 rounded-lg transition-all"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}