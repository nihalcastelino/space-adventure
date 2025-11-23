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
  const [visibleTooltip, setVisibleTooltip] = useState(null); // Track which tooltip is visible
  const [isMobile, setIsMobile] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const freemium = useFreemiumLimits();
  const premium = usePremium();
  const currency = useCurrency();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectMode = (mode) => {
    playSound('click');
    
    // Check if user can play (freemium limits)
    const isOnline = mode === 'online';
    const canPlay = freemium.canPlayGame(isOnline);
    
    if (!canPlay.allowed) {
      // Show upgrade modal or message
      alert(canPlay.reason);
      onUpgrade?.();
      return;
    }
    
    // Record game attempt
    if (mode === 'online') {
      freemium.recordGamePlayed(true);
    }
    
    // Pass variant, difficulty, and randomization seed
    const randomizationSeed = Date.now() + Math.random();
    onSelectMode(mode, difficulty, selectedVariant, randomizationSeed);
  };

  // Close tooltip when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.group')) {
      setVisibleTooltip(null);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-start sm:items-center justify-center overflow-y-auto py-8 sm:py-4 px-4 sm:px-8 md:px-12"
      onClick={handleClickOutside}
      style={{
        backgroundImage: `url(/${getScreenBackground('menu')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000'
      }}
    >
      {/* Top Right Buttons - Auth, Premium, Shop */}
      <div className="fixed top-1 right-1 sm:top-4 sm:right-4 z-50 flex flex-col gap-2 items-end">
        <AuthButton />
        
        {/* Premium Button */}
        {!premium.isPremium && (
          <button
            onClick={() => {
              playSound('click');
              setShowPremiumModal(true);
            }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
          >
            <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Premium</span>
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        )}
        
        {/* Shop Button */}
        <button
          onClick={() => {
            playSound('click');
            setShowShopModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
        >
          <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Shop</span>
          <span className="bg-yellow-400 text-black text-[10px] px-1.5 py-0.5 rounded font-bold">
            {currency.coins}
          </span>
        </button>
      </div>

      {/* Main content - Optimized for mobile with balanced padding to keep centered */}
      {/* Equal left/right padding on mobile to maintain centering */}
      {/* Extra top padding to prevent rocket from being cut off by browser address bar */}
      <div className="text-center space-y-1.5 sm:space-y-3 md:space-y-8 px-6 sm:px-4 max-w-2xl w-full mx-auto pb-2 sm:pb-4 overflow-x-hidden" style={{
        paddingTop: 'max(8.5rem, env(safe-area-inset-top) + 6rem)'
      }}>
        <div className="space-y-1 sm:space-y-2 md:space-y-4">
          <Rocket className="w-8 h-8 sm:w-12 sm:h-12 md:w-20 md:h-20 text-yellow-300 mx-auto animate-bounce" style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8))'
          }} />
          <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-yellow-300 mb-1 sm:mb-2" style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(251, 191, 36, 0.5), 0 4px 8px rgba(0, 0, 0, 0.9)'
          }}>
            Space Adventure
          </h1>
          <p className="text-xs sm:text-base md:text-xl text-white font-semibold" style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.7), 0 1px 2px rgba(0, 0, 0, 1)'
          }}>
            Race to the edge of the galaxy!
          </p>
        </div>

        {/* Difficulty Selector - Optimized for mobile, narrower on small screens */}
        <div className="glass rounded-lg p-2 sm:p-3 md:p-6 shadow-2xl border-2 border-yellow-400 border-opacity-30 max-w-full sm:max-w-none">
          <h3 className="text-xs sm:text-sm md:text-xl font-bold text-white mb-1.5 sm:mb-2 md:mb-4 flex items-center justify-center gap-1 sm:gap-2">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-300" />
            <span>Choose Difficulty</span>
          </h3>
          {/* Grid - 2 columns on very small screens (< 400px), 3 on small, 6 on desktop */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3 w-full max-w-full">
            <button
              onClick={() => {
                playSound('click');
                setDifficulty('easy');
              }}
              className={`flex-grow-0 flex-shrink-0 basis-28 p-1.5 sm:p-2 md:p-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
                difficulty === 'easy'
                  ? 'bg-green-600 border-2 border-green-400 shadow-lg shadow-green-500/50'
                  : 'bg-gray-800 border-2 border-gray-700 hover:border-green-400'
              }`}
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 text-green-300 mx-auto mb-0.5 sm:mb-1 md:mb-2" />
              <div className="text-white font-bold text-[10px] sm:text-xs md:text-sm">Easy</div>
              <div className="text-gray-400 text-[9px] sm:text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block">No extras</div>
            </button>

            <button
              onClick={() => {
                playSound('click');
                setDifficulty('normal');
              }}
              className={`flex-grow-0 flex-shrink-0 basis-28 p-1.5 sm:p-2 md:p-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
                difficulty === 'normal'
                  ? 'bg-yellow-600 border-2 border-yellow-400 shadow-lg shadow-yellow-500/50'
                  : 'bg-gray-800 border-2 border-gray-700 hover:border-yellow-400'
              }`}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 text-yellow-300 mx-auto mb-0.5 sm:mb-1 md:mb-2" />
              <div className="text-white font-bold text-[10px] sm:text-xs md:text-sm">Normal</div>
              <div className="text-gray-400 text-[9px] sm:text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block">Balanced</div>
            </button>

            <button
              onClick={() => {
                playSound('click');
                if (!premium.isPremium && !freemium.canUseDifficulty('hard')) {
                  playSound('error');
                  onUpgrade?.();
                  return;
                }
                setDifficulty('hard');
              }}
              disabled={!premium.isPremium && !freemium.canUseDifficulty('hard')}
              className={`flex-grow-0 flex-shrink-0 basis-28 p-1.5 sm:p-2 md:p-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 relative ${
                difficulty === 'hard'
                  ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/50'
                  : premium.isPremium || freemium.canUseDifficulty('hard')
                  ? 'bg-gray-800 border-2 border-gray-700 hover:border-red-400'
                  : 'bg-gray-900 border-2 border-gray-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <Skull className={`w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 mx-auto mb-0.5 sm:mb-1 md:mb-2 ${premium.isPremium || freemium.canUseDifficulty('hard') ? 'text-red-300' : 'text-gray-500'}`} />
              <div className={`font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center gap-0.5 sm:gap-1 ${premium.isPremium || freemium.canUseDifficulty('hard') ? 'text-white' : 'text-gray-500'}`}>
                Hard
                {!premium.isPremium && !freemium.canUseDifficulty('hard') && (
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />
                )}
              </div>
              <div className={`text-[9px] sm:text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block ${premium.isPremium || freemium.canUseDifficulty('hard') ? 'text-gray-400' : 'text-gray-600'}`}>
                {premium.isPremium || freemium.canUseDifficulty('hard') ? 'Extreme!' : 'Premium'}
              </div>
            </button>

            {/* Extreme - Premium Only */}
            <button
              onClick={() => {
                playSound('click');
                if (!premium.isPremium) {
                  playSound('error');
                  onUpgrade?.();
                  return;
                }
                setDifficulty('extreme');
              }}
              disabled={!premium.isPremium}
              className={`flex-grow-0 flex-shrink-0 basis-28 p-1.5 sm:p-2 md:p-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 relative ${
                difficulty === 'extreme'
                  ? 'bg-orange-600 border-2 border-orange-400 shadow-lg shadow-orange-500/50'
                  : premium.isPremium
                  ? 'bg-gray-800 border-2 border-gray-700 hover:border-orange-400'
                  : 'bg-gray-900 border-2 border-gray-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <Flame className={`w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 mx-auto mb-0.5 sm:mb-1 md:mb-2 ${premium.isPremium ? 'text-orange-300' : 'text-gray-500'}`} />
              <div className={`font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center gap-0.5 sm:gap-1 ${premium.isPremium ? 'text-white' : 'text-gray-500'}`}>
                Extreme
                {!premium.isPremium && <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />}
              </div>
              <div className={`text-[9px] sm:text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block ${premium.isPremium ? 'text-gray-400' : 'text-gray-600'}`}>
                {premium.isPremium ? '2x Rewards' : 'Premium'}
              </div>
            </button>

            {/* Nightmare - Premium Only */}
            <button
              onClick={() => {
                playSound('click');
                if (!premium.isPremium) {
                  playSound('error');
                  onUpgrade?.();
                  return;
                }
                setDifficulty('nightmare');
              }}
              disabled={!premium.isPremium}
              className={`flex-grow-0 flex-shrink-0 basis-28 p-1.5 sm:p-2 md:p-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 relative ${
                difficulty === 'nightmare'
                  ? 'bg-purple-600 border-2 border-purple-400 shadow-lg shadow-purple-500/50'
                  : premium.isPremium
                  ? 'bg-gray-800 border-2 border-gray-700 hover:border-purple-400'
                  : 'bg-gray-900 border-2 border-gray-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <Moon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 mx-auto mb-0.5 sm:mb-1 md:mb-2 ${premium.isPremium ? 'text-purple-300' : 'text-gray-500'}`} />
              <div className={`font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center gap-0.5 sm:gap-1 ${premium.isPremium ? 'text-white' : 'text-gray-500'}`}>
                Nightmare
                {!premium.isPremium && <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />}
              </div>
              <div className={`text-[9px] sm:text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block ${premium.isPremium ? 'text-gray-400' : 'text-gray-600'}`}>
                {premium.isPremium ? '2.5x Rewards' : 'Premium'}
              </div>
            </button>

            {/* Chaos - Premium Only */}
            <button
              onClick={() => {
                playSound('click');
                if (!premium.isPremium) {
                  playSound('error');
                  onUpgrade?.();
                  return;
                }
                setDifficulty('chaos');
              }}
              disabled={!premium.isPremium}
              className={`flex-grow-0 flex-shrink-0 basis-28 p-1.5 sm:p-2 md:p-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 relative ${
                difficulty === 'chaos'
                  ? 'bg-pink-600 border-2 border-pink-400 shadow-lg shadow-pink-500/50'
                  : premium.isPremium
                  ? 'bg-gray-800 border-2 border-gray-700 hover:border-pink-400'
                  : 'bg-gray-900 border-2 border-gray-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 mx-auto mb-0.5 sm:mb-1 md:mb-2 ${premium.isPremium ? 'text-pink-300' : 'text-gray-500'}`} />
              <div className={`font-bold text-[10px] sm:text-xs md:text-sm flex items-center justify-center gap-0.5 sm:gap-1 ${premium.isPremium ? 'text-white' : 'text-gray-500'}`}>
                Chaos
                {!premium.isPremium && <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />}
              </div>
              <div className={`text-[9px] sm:text-[10px] md:text-xs mt-0.5 md:mt-1 hidden sm:block ${premium.isPremium ? 'text-gray-400' : 'text-gray-600'}`}>
                {premium.isPremium ? '3x Rewards' : 'Premium'}
              </div>
            </button>
          </div>
          <div className="mt-1 sm:mt-2 md:mt-4 text-center text-[10px] sm:text-xs md:text-sm text-gray-400 leading-tight">
            {difficulty === 'easy' && '✓ Standard game, no surprises'}
            {difficulty === 'normal' && '⚡ Random aliens spawn, checkpoints may disappear'}
            {difficulty === 'hard' && '💀 Frequent alien spawns, high checkpoint loss!'}
            {difficulty === 'extreme' && '🔥 Constant threats! Aliens spawn every turn! 2x rewards'}
            {difficulty === 'nightmare' && '🌙 Nightmare mode! Aliens spawn EVERY turn! 2.5x rewards'}
            {difficulty === 'chaos' && '⚠️ Pure chaos! Maximum difficulty, all mechanics active! 3x rewards'}
          </div>
        </div>

        {/* Game Variants Selector - Compact on mobile */}
        <div className="glass rounded-lg p-2 sm:p-3 md:p-6 shadow-2xl border-2 border-yellow-400 border-opacity-30">
          <h3 className="text-sm sm:text-base md:text-xl font-bold text-white mb-2 sm:mb-3 md:mb-4 flex items-center justify-center gap-1 sm:gap-2">
            <Rocket className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-300" />
            Game Mode
          </h3>
          <div className="max-h-48 sm:max-h-64 md:max-h-80 overflow-y-auto mb-2 sm:mb-3 md:mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 pr-2">
              {Object.values(GAME_VARIANTS).map((variant) => {
                const isLocked = variant.requiresPremium && !premium.isPremium;
                const isSelected = selectedVariant === variant.id;
                
                return (
                  <div 
                    key={variant.id} 
                    className="relative group"
                    onMouseEnter={() => !isMobile && isLocked && setVisibleTooltip(variant.id)}
                    onMouseLeave={() => !isMobile && setVisibleTooltip(null)}
                  >
                    <button
                      onClick={(e) => {
                        playSound('click');
                        if (isLocked) {
                          // On mobile, toggle tooltip; on desktop, show upgrade modal
                          if (isMobile) {
                            e.stopPropagation();
                            setVisibleTooltip(visibleTooltip === variant.id ? null : variant.id);
                          } else {
                            playSound('error');
                            onUpgrade?.();
                          }
                          return;
                        }
                        setSelectedVariant(variant.id);
                        setVisibleTooltip(null); // Close tooltip when selecting
                      }}
                      disabled={isLocked && visibleTooltip !== variant.id}
                      className={`w-full p-2 md:p-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
                        isSelected
                          ? 'bg-yellow-600 border-2 border-yellow-400 shadow-lg shadow-yellow-500/50'
                          : isLocked
                          ? 'bg-gray-800 border-2 border-gray-700 opacity-60 cursor-not-allowed'
                          : 'bg-gray-700 border-2 border-gray-600 hover:border-yellow-400'
                      }`}
                      title={isLocked ? `${variant.name} - ${variant.description} (Premium)` : variant.description}
                    >
                      <div className={`font-bold text-xs md:text-sm flex items-center justify-center gap-1 ${
                        isLocked ? 'text-gray-500' : 'text-white'
                      }`}>
                        <span>{variant.icon}</span>
                        <span className="hidden sm:inline">{variant.name}</span>
                        {isLocked && <Lock className="w-3 h-3" />}
                      </div>
                      {isSelected && (
                        <div className="text-[10px] text-yellow-200 mt-1 text-center">
                          Selected
                        </div>
                      )}
                    </button>
                    
                    {/* Tooltip for locked items - shows on hover (desktop) or click (mobile) */}
                    {isLocked && (
                      <div 
                        className={`absolute z-[100] pointer-events-none transition-opacity duration-200 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 sm:w-56 ${
                          // Desktop: show on hover via state, Mobile: show when clicked
                          visibleTooltip === variant.id ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                      >
                        <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-2 shadow-2xl">
                          <div className="flex items-start gap-2">
                            <div className="text-lg flex-shrink-0">{variant.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white text-xs sm:text-sm mb-1 flex items-center gap-1">
                                {variant.name}
                                <Lock className="w-3 h-3 text-yellow-400" />
                              </div>
                              <p className="text-gray-300 text-[10px] sm:text-xs leading-tight mb-1">
                                {variant.description}
                              </p>
                              <div className="text-yellow-400 text-[9px] sm:text-[10px] font-semibold">
                                Premium Feature
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Arrow pointing down */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-yellow-400"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] sm:text-xs md:text-sm text-gray-400 text-center mb-1 sm:mb-2 leading-tight">
            {GAME_VARIANTS[selectedVariant]?.description || 'Choose a gameplay variant'}
          </div>
          <p className="text-[9px] sm:text-xs text-gray-500 text-center leading-tight">
            Each game is randomized for variety - no two games are the same!
          </p>
        </div>

        {/* Game Mode Buttons - Compact on mobile, full size on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-6 mt-2 sm:mt-4 md:mt-8">
          <button
            onClick={() => handleSelectMode('ai')}
            className="bg-gray-900 bg-opacity-95 rounded-lg p-3 sm:p-4 md:p-6 shadow-2xl border-2 border-gray-700 hover:border-purple-400 transition-all transform hover:scale-105 active:scale-95 group min-w-0"
          >
            <Bot className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 text-purple-300 mx-auto mb-1 sm:mb-2 md:mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
            <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 break-words">vs AI</h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 leading-tight break-words">
              Challenge an AI opponent
            </p>
          </button>

          <button
            onClick={() => handleSelectMode('local')}
            className="bg-gray-900 bg-opacity-95 rounded-lg p-3 sm:p-4 md:p-6 shadow-2xl border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-105 active:scale-95 group min-w-0"
          >
            <Users className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 text-blue-300 mx-auto mb-1 sm:mb-2 md:mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
            <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 break-words">Local Multiplayer</h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 leading-tight break-words">
              Play with friends on the same device
            </p>
          </button>

          <button
            onClick={() => handleSelectMode('online')}
            className="bg-gray-900 bg-opacity-95 rounded-lg p-3 sm:p-4 md:p-6 shadow-2xl border-2 border-gray-700 hover:border-green-400 transition-all transform hover:scale-105 active:scale-95 group min-w-0"
          >
            <Wifi className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 text-green-300 mx-auto mb-1 sm:mb-2 md:mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
            <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 break-words">Online Multiplayer</h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 leading-tight break-words">
              Play with friends across different devices
            </p>
          </button>

          <button
            onClick={() => handleSelectMode('matchmaking')}
            className="bg-gray-900 bg-opacity-95 rounded-lg p-3 sm:p-4 md:p-6 shadow-2xl border-2 border-yellow-500 hover:border-yellow-400 transition-all transform hover:scale-105 active:scale-95 group relative min-w-0"
          >
            <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-bold z-10">
              NEW
            </div>
            <Search className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 text-yellow-300 mx-auto mb-1 sm:mb-2 md:mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
            <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 break-words">Matchmaking</h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 leading-tight break-words">
              Find players automatically
            </p>
          </button>

          <button
            onClick={() => handleSelectMode('rpg')}
            className="bg-gray-900 bg-opacity-95 rounded-lg p-3 sm:p-4 md:p-6 shadow-2xl border-2 border-orange-500 hover:border-orange-400 transition-all transform hover:scale-105 active:scale-95 group relative min-w-0"
          >
            <div className="absolute top-1 right-1 bg-orange-500 text-black text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-bold z-10">
              RPG
            </div>
            <Sword className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 text-orange-300 mx-auto mb-1 sm:mb-2 md:mb-3 group-hover:scale-110 transition-transform flex-shrink-0" />
            <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 break-words">Tabletop RPG</h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 leading-tight break-words">
              Character classes, combat & leveling
            </p>
          </button>
        </div>

        {/* AdSense Ad - Bottom of screen (safe area, doesn't obstruct gameplay) */}
        <div className="mt-8 mb-4 flex justify-center px-4">
          <div className="w-full max-w-4xl">
            <AdSenseAd 
              adFormat="horizontal"
              className="w-full"
              style={{ 
                minHeight: '100px',
                maxWidth: '100%',
                // Ensure ad stays at bottom, doesn't overlap content
                marginTop: 'auto'
              }}
            />
          </div>
        </div>
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <PremiumModal onClose={() => setShowPremiumModal(false)} />
      )}

      {/* Shop Modal - Placeholder for now */}
      {showShopModal && (
        <ShopModal 
          coins={currency.coins}
          onClose={() => setShowShopModal(false)}
          onUpgrade={() => {
            setShowShopModal(false);
            setShowPremiumModal(true);
          }}
        />
      )}
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

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please sign in to purchase coins. Click "Sign In" in the top right corner.');
      return;
    }

    try {
      // Detect user's region for regional pricing
      let countryCode = null;
      try {
        const { detectUserRegion } = await import('../lib/paymentConfig');
        const region = await detectUserRegion();
        countryCode = region.countryCode;
        console.log(`🌍 Detected region: ${region.country} (${region.countryCode})`);
      } catch (error) {
        console.warn('Region detection failed, using default:', error);
      }

      // Get API URL (Netlify function or local dev)
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

      // Redirect to Stripe Checkout
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => {
          playSound('click');
          onClose();
        }}
      />
      
      {/* Modal */}
      <div className="relative z-10 bg-gray-900 rounded-2xl border-2 border-blue-400 shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto">
        {/* Header */}
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

        {/* Content */}
        <div className="p-6">
          {/* Current Balance */}
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

          {/* Coin Packages */}
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

          {/* Premium Benefits */}
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

