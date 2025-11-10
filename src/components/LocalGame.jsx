import { useState, useEffect } from 'react';
import { Rocket, Zap, Plus, Minus, ArrowLeft, Settings } from 'lucide-react';
import GameBoard from './GameBoard';
import PlayerPanel from './PlayerPanel';
import CompactPlayerPanel from './CompactPlayerPanel';
import GameControls from './GameControls';
import ParticleEffects from './ParticleEffects';
import GameSettings from './GameSettings';
import SpaceJail from './SpaceJail';
import { useGameLogic } from '../hooks/useGameLogic';
import { useGameSounds } from '../hooks/useGameSounds';
// Optional imports - comment out if files don't exist in build
// import { useProgression } from '../hooks/useProgression';
// import { useCurrency } from '../hooks/useCurrency';
// import { ProgressBar } from './ProgressionUI';
// import { CoinDisplay } from './PowerUpUI';

export default function LocalGame({ onBack, initialDifficulty = 'normal' }) {
  const { playSound } = useGameSounds();
  const [showSettings, setShowSettings] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize progression and currency systems (optional - commented out for build)
  // const progression = useProgression();
  // const currency = useCurrency();
  
  // Stub objects to prevent errors (used by SpaceJail component)
  const progression = { level: 1, xp: 0, getProgressToNextLevel: () => 0 };
  const currency = { 
    coins: 0, 
    removeCoins: () => {}, 
    earnCoins: () => {},
    earnGameReward: () => 0
  };

  const {
    players,
    numPlayers,
    currentPlayerIndex,
    diceValue,
    isRolling,
    message,
    gameWon,
    winner,
    animatingPlayer,
    animationType,
    alienBlink,
    aliens,
    checkpoints,
    difficulty,
    changeDifficulty,
    addPlayer,
    removePlayer,
    rollDice,
    resetGame,
    changePlayerIcon,
    hazards,
    jailStates,
    payBail,
    rogueState
  } = useGameLogic(initialDifficulty);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        backgroundImage: 'url(/space-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000'
      }}
    >
      {/* Overlay to darken background if needed */}
      <div
        className="absolute inset-0 bg-black/20"
        style={{ backdropFilter: 'blur(1px)' }}
      />

      <ParticleEffects active={true} type="stars" />
      <style>{`
        @keyframes rocket-liftoff {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.2); }
          100% { transform: translateY(-60px) scale(0.5) rotate(45deg); opacity: 0; }
        }
        @keyframes rocket-landing {
          0% { transform: translateY(-60px) scale(0.5) rotate(-45deg); opacity: 0; }
          50% { transform: translateY(-30px) scale(1.2); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes rocket-blastoff {
          0% { transform: translateY(0) scale(1) rotate(0deg); filter: brightness(1); }
          10% { transform: translateY(-5px) scale(1.05) rotate(-2deg); filter: brightness(1.5); }
          20% { transform: translateY(-8px) scale(1.1) rotate(2deg); filter: brightness(2); }
          30% { transform: translateY(-15px) scale(1.2) rotate(-3deg); filter: brightness(2.5) drop-shadow(0 0 20px currentColor); }
          50% { transform: translateY(-40px) scale(1.5) rotate(5deg); filter: brightness(3) drop-shadow(0 0 30px currentColor); }
          70% { transform: translateY(-80px) scale(1.8) rotate(10deg); opacity: 1; filter: brightness(3.5) drop-shadow(0 0 40px currentColor); }
          100% { transform: translateY(-150px) scale(0.3) rotate(45deg); opacity: 0; filter: brightness(4) drop-shadow(0 0 50px currentColor); }
        }
        @keyframes victory-celebration {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(-5deg); }
          50% { transform: scale(1.3) rotate(5deg); }
          75% { transform: scale(1.2) rotate(-5deg); }
        }
        .animate-rocket-liftoff {
          animation: rocket-liftoff 0.8s ease-in-out;
        }
        .animate-rocket-landing {
          animation: rocket-landing 0.6s ease-in-out;
        }
        .animate-rocket-blastoff {
          animation: rocket-blastoff 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-victory-celebration {
          animation: victory-celebration 0.5s ease-in-out infinite;
        }
      `}</style>

      {/* Game Settings Modal */}
      <GameSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        difficulty={difficulty}
        onChangeDifficulty={changeDifficulty}
      />

      {/* Back button and Settings button */}
      <div className="fixed top-2 left-2 z-50 flex items-center gap-2">
        <button
          onClick={() => {
            playSound('click');
            onBack();
          }}
          className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-110 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => {
            playSound('click');
            setShowSettings(true);
          }}
          className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-yellow-400 transition-all transform hover:scale-110 active:scale-95"
          title="Game Settings"
        >
          <Settings className="w-5 h-5 text-yellow-300" />
        </button>
      </div>

      {/* Title - responsive */}
      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-xl md:text-3xl font-bold text-center flex items-center justify-center gap-2 glass px-4 md:px-6 py-2 rounded-lg shadow-2xl border-2 border-yellow-400 border-opacity-30">
          <Rocket className="w-5 h-5 md:w-8 md:h-8 text-yellow-300 animate-float" />
          <span className="hidden sm:inline text-yellow-300">
            Space Race to 100!
          </span>
          <span className="sm:hidden text-yellow-300">
            Space Race!
          </span>
        </h1>
      </div>

      {/* HUD Overlay - Progress & Coins (commented out for build - uncomment when hooks are committed) */}
      {/* <div className="fixed top-16 left-2 right-2 z-20 flex items-start justify-between pointer-events-none">
        <div className="pointer-events-auto w-64 hidden md:block">
          <ProgressBar
            level={progression.level}
            xp={progression.xp}
            getProgressToNextLevel={progression.getProgressToNextLevel}
          />
        </div>
        <div className="pointer-events-auto ml-auto">
          <CoinDisplay coins={currency.coins} />
        </div>
      </div> */}

      {/* Game Controls - responsive with safe bottom spacing */}
      <div
        className="fixed left-1/2 transform -translate-x-1/2 z-10 w-[min(280px,calc(100%-1rem))] md:w-96"
        style={{
          bottom: windowWidth < 640 ? '8px' : '16px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)' // iOS safe area
        }}
      >
        <GameControls
          diceValue={diceValue}
          message={message}
          onReset={resetGame}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          numPlayers={numPlayers}
        />
      </div>

      {/* Player Panels - Fixed in screen corners with safe spacing */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 25 }}>
        {/* Top panels */}
        <div className="absolute top-14 left-0 right-0 px-2 flex justify-between gap-2">
          {/* Player 2: Top-Left */}
          {players[1] && (
            <div className="pointer-events-auto">
              {windowWidth >= 1024 ? (
                <PlayerPanel
                  player={players[1]}
                  isCurrentPlayer={currentPlayerIndex === 1}
                  onRollDice={currentPlayerIndex === 1 ? rollDice : null}
                  isRolling={isRolling}
                  gameWon={gameWon}
                  isMyPlayer={false}
                  onChangeIcon={changePlayerIcon}
                />
              ) : (
                <CompactPlayerPanel
                  player={players[1]}
                  isCurrentPlayer={currentPlayerIndex === 1}
                  onRollDice={currentPlayerIndex === 1 ? rollDice : null}
                  isRolling={isRolling}
                  gameWon={gameWon}
                  isMyPlayer={false}
                  onChangeIcon={changePlayerIcon}
                />
              )}
            </div>
          )}

          {/* Player 1: Top-Right */}
          {players[0] && (
            <div className="pointer-events-auto ml-auto">
              {windowWidth >= 1024 ? (
                <PlayerPanel
                  player={players[0]}
                  isCurrentPlayer={currentPlayerIndex === 0}
                  onRollDice={currentPlayerIndex === 0 ? rollDice : null}
                  isRolling={isRolling}
                  gameWon={gameWon}
                  isMyPlayer={false}
                  onChangeIcon={changePlayerIcon}
                />
              ) : (
                <CompactPlayerPanel
                  player={players[0]}
                  isCurrentPlayer={currentPlayerIndex === 0}
                  onRollDice={currentPlayerIndex === 0 ? rollDice : null}
                  isRolling={isRolling}
                  gameWon={gameWon}
                  isMyPlayer={false}
                  onChangeIcon={changePlayerIcon}
                />
              )}
            </div>
          )}
        </div>

        {/* Bottom panels */}
        <div className="absolute bottom-40 left-0 right-0 px-2 flex justify-between gap-2">
          {/* Player 3: Bottom-Left */}
          {players[2] && (
            <div className="pointer-events-auto">
              {windowWidth >= 1024 ? (
                <PlayerPanel
                  player={players[2]}
                  isCurrentPlayer={currentPlayerIndex === 2}
                  onRollDice={currentPlayerIndex === 2 ? rollDice : null}
                  isRolling={isRolling}
                  gameWon={gameWon}
                  isMyPlayer={false}
                  onChangeIcon={changePlayerIcon}
                />
              ) : (
                <CompactPlayerPanel
                  player={players[2]}
                  isCurrentPlayer={currentPlayerIndex === 2}
                  onRollDice={currentPlayerIndex === 2 ? rollDice : null}
                  isRolling={isRolling}
                  gameWon={gameWon}
                  isMyPlayer={false}
                  onChangeIcon={changePlayerIcon}
                />
              )}
            </div>
          )}

          {/* Player 4: Bottom-Right */}
          {players[3] && (
            <div className="pointer-events-auto ml-auto">
              {windowWidth >= 1024 ? (
                <PlayerPanel
                  player={players[3]}
                  isCurrentPlayer={currentPlayerIndex === 3}
                  onRollDice={currentPlayerIndex === 3 ? rollDice : null}
                  isRolling={isRolling}
                  gameWon={gameWon}
                  isMyPlayer={false}
                  onChangeIcon={changePlayerIcon}
                />
              ) : (
                <CompactPlayerPanel
                  player={players[3]}
                  isCurrentPlayer={currentPlayerIndex === 3}
                  onRollDice={currentPlayerIndex === 3 ? rollDice : null}
                  isRolling={isRolling}
                  gameWon={gameWon}
                  isMyPlayer={false}
                  onChangeIcon={changePlayerIcon}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Game Board Container - responsive */}
      <div
        className="fixed"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '800px',
          width: '100vw',
          maxHeight: '90vh'
        }}
      >
        {/* Board Content */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
        {/* Starting Area - Outside the square board */}
        {players.filter(p => p.position === 0).length > 0 && (
          <div
            className="w-[min(90vw,600px)] md:w-[min(60vw,600px)] lg:w-[min(70vw,600px)] xl:w-[min(90vw,600px)]"
            style={{
              minHeight: '60px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '3px solid rgba(16, 185, 129, 0.6)',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '8px',
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 'bold'
            }}>
              🚀 Starting Spaceport
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
              {players.filter(p => p.position === 0).map(player => {
                const isAnimating = animatingPlayer === player.id;
                const animationClass = isAnimating && animationType ? `animate-rocket-${animationType}` : '';
                return (
                  <div
                    key={player.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '6px',
                      border: `2px solid ${player.color.includes('yellow') ? 'rgba(253, 224, 71, 0.6)' :
                                player.color.includes('blue') ? 'rgba(147, 197, 253, 0.6)' :
                                player.color.includes('green') ? 'rgba(134, 239, 172, 0.6)' :
                                'rgba(249, 168, 212, 0.6)'}`
                    }}
                  >
                    <div
                      className={animationClass}
                      style={{
                        fontSize: '24px',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 8px currentColor)',
                        animation: animationClass ? undefined : 'float 2s ease-in-out infinite',
                        lineHeight: 1
                      }}
                    >
                      {player.icon || '🚀'}
                    </div>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>
                      {player.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Board - always square */}
        <div
          className="w-[min(90vw,600px)] h-[min(90vw,600px)] md:w-[min(60vw,600px)] md:h-[min(60vw,600px)] lg:w-[min(70vw,600px)] lg:h-[min(70vw,600px)] xl:w-[min(90vw,600px)] xl:h-[min(90vw,600px)]"
          style={{
            maxWidth: '600px',
            maxHeight: '600px'
          }}
        >
          <GameBoard
            players={players}
            animatingPlayer={animatingPlayer}
            animationType={animationType}
            alienBlink={alienBlink}
            aliens={aliens}
            rogueState={rogueState}
            checkpoints={checkpoints}
            hazards={hazards}
          />
        </div>
        </div>
      </div>

      {/* Space Jail Overlay */}
      {players.map(player => {
        const jailState = jailStates(player.id);
        if (jailState.inJail && currentPlayerIndex === players.indexOf(player)) {
          return (
            <SpaceJail
              key={player.id}
              playerId={player.id}
              playerName={player.name}
              turnsRemaining={jailState.turnsRemaining}
              bailCost={50}
              playerCoins={currency.coins}
              onPayBail={() => {
                const result = payBail(player.id);
                if (result.success) {
                  currency.removeCoins(result.cost);
                  playSound('click');
                }
              }}
              onRollForDoubles={rollDice}
              isCurrentPlayer={true}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

