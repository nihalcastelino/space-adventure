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
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const freemium = useFreemiumLimits();
  const premium = usePremium();
  const currency = useCurrency();

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

  return (
    <div
      className="fixed inset-0 flex flex-col bg-black"
      style={{
        backgroundImage: `url(/${getScreenBackground('menu')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      {/* --- Modals --- */}
      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}
      {showShopModal && <ShopModal coins={currency.coins} onClose={() => setShowShopModal(false)} onUpgrade={() => { setShowShopModal(false); setShowPremiumModal(true); }} />}

      {/* --- Main Layout --- */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Simple, non-fixed top bar */}
        <header className="flex-shrink-0 p-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-300">
            Space Adventure
          </h1>
          <div className="flex items-center gap-2">
            <AuthButton />
            <button onClick={() => { playSound('click'); setShowShopModal(true); }} className="bg-blue-600 text-white font-bold py-2 px-3 rounded-lg flex items-center gap-2 text-sm">
              <ShoppingBag className="w-4 h-4" />
              <span className="bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded font-bold">{currency.coins}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-grow flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          
            {/* Difficulty Selector */}
            <div className="glass rounded-lg p-3">
              <h3 className="text-lg font-bold text-white mb-3 text-center">Difficulty</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {['easy', 'normal', 'hard', 'extreme', 'nightmare', 'chaos'].map(d => {
                  const isLocked = (d === 'hard' && !premium.isPremium && !freemium.canUseDifficulty('hard')) || (['extreme', 'nightmare', 'chaos'].includes(d) && !premium.isPremium);
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        if (isLocked) { playSound('error'); onUpgrade?.(); return; }
                        playSound('click');
                        setDifficulty(d);
                      }}
                      disabled={isLocked}
                      className={`p-2 rounded-lg ${difficulty === d ? 'bg-yellow-600' : 'bg-gray-800'} ${isLocked ? 'opacity-50' : ''}`}
                    >
                      <span className="font-bold text-sm text-white">{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                      {isLocked && <Lock className="w-3 h-3 inline-block ml-1 text-yellow-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game Variants Selector */}
            <div className="glass rounded-lg p-3">
              <h3 className="text-lg font-bold text-white mb-3 text-center">Variant</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.values(GAME_VARIANTS).map((variant) => {
                  const isLocked = variant.requiresPremium && !premium.isPremium;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        if (isLocked) { playSound('error'); onUpgrade?.(); return; }
                        playSound('click');
                        setSelectedVariant(variant.id);
                      }}
                      disabled={isLocked}
                      className={`p-2 rounded-lg ${selectedVariant === variant.id ? 'bg-yellow-600' : 'bg-gray-800'} ${isLocked ? 'opacity-50' : ''}`}
                    >
                      <span className="font-bold text-sm text-white">{variant.name}</span>
                      {isLocked && <Lock className="w-3 h-3 inline-block ml-1 text-yellow-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game Mode Buttons */}
            <div className="space-y-4 pt-4">
              <button onClick={() => handleSelectMode('ai')} className="w-full glass p-4 rounded-lg text-left">
                <h2 className="text-lg font-bold text-white">vs AI</h2>
                <p className="text-sm text-gray-400">Challenge an AI opponent</p>
              </button>
              <button onClick={() => handleSelectMode('local')} className="w-full glass p-4 rounded-lg text-left">
                <h2 className="text-lg font-bold text-white">Local Multiplayer</h2>
                <p className="text-sm text-gray-400">Play with friends on this device</p>
              </button>
              <button onClick={() => handleSelectMode('online')} className="w-full glass p-4 rounded-lg text-left">
                <h2 className="text-lg font-bold text-white">Online Multiplayer</h2>
                <p className="text-sm text-gray-400">Play with friends online</p>
              </button>
            </div>
            
            <div className="pt-4">
               <AdSenseAd adFormat="horizontal" className="w-full" style={{ minHeight: '100px' }} />
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

  const handleCoinPurchase = async (packageId) => {
    const priceId = coinPriceIds[packageId];
    if (!priceId) {
      alert('Coin package not configured.');
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please sign in to purchase coins.');
      return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/.netlify/functions/create-checkout';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ priceId, tier: 'coins', type: 'coins' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
      window.location.href = data.url;
    } catch (error) {
      alert(`Failed to start checkout: ${error.message}`);
    }
  };
  
  const coinPackages = [
    { id: 'coins_small', coins: 100, price: '$0.99' },
    { id: 'coins_medium', coins: 350, price: '$2.99' },
    { id: 'coins_large', coins: 650, price: '$4.99' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative z-10 bg-gray-900 rounded-2xl border-2 border-blue-400 w-full max-w-md m-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white text-center mb-4">Shop</h2>
          {/* ... Shop content ... */}
          <button onClick={onClose} className="mt-4 w-full bg-gray-700 text-white p-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
