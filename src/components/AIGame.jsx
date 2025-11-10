import { useState, useEffect } from 'react';
import { Rocket, ArrowLeft, Settings, Bot } from 'lucide-react';
import GameBoard from './GameBoard';
import PlayerPanel from './PlayerPanel';
import CompactPlayerPanel from './CompactPlayerPanel';
import GameControls from './GameControls';
import ParticleEffects from './ParticleEffects';
import GameSettings from './GameSettings';
import SpaceJail from './SpaceJail';
import { useGameLogic } from '../hooks/useGameLogic';
import { useGameSounds } from '../hooks/useGameSounds';
import { useAIOpponent, createAIPlayer } from '../hooks/useAIOpponent';
import { useProgression } from '../hooks/useProgression';
import { useCurrency } from '../hooks/useCurrency';
import { ProgressBar } from './ProgressionUI';
import { CoinDisplay } from './PowerUpUI';

export default function AIGame({ onBack, initialDifficulty = 'normal', aiDifficulty = 'medium' }) {
  const { playSound } = useGameSounds();
  const [showSettings, setShowSettings] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize progression and currency systems
  const progression = useProgression();
  const currency = useCurrency();

  const gameLogic = useGameLogic(initialDifficulty);
  const {
    players,
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
    rollDice,
    resetGame,
    changePlayerIcon,
    hazards,
    jailStates,
    payBail
  } = gameLogic;

  // In AI mode, player at index 1 is always the AI
  const isAITurn = currentPlayerIndex === 1;

  const { aiPersonality, isAIThinking, takeAITurn, getAIMessage } = useAIOpponent(
    aiDifficulty,
    { players, currentPlayerIndex },
    null
  );

  // Track if AI has already taken action this turn
  const [aiTurnTaken, setAiTurnTaken] = useState(false);

  // Reset AI turn flag when turn changes
  useEffect(() => {
    setAiTurnTaken(false);
  }, [currentPlayerIndex]);

  // Auto-play AI turns
  useEffect(() => {
    if (isAITurn && !isRolling && !gameWon && !aiTurnTaken) {
      setAiTurnTaken(true);
      // AI's turn - auto roll after delay
      takeAITurn(rollDice);
    }
  }, [isAITurn, isRolling, gameWon, aiTurnTaken, takeAITurn, rollDice]);

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
      <div
        className="absolute inset-0 bg-black/20"
        style={{ backdropFilter: 'blur(1px)' }}
      />

      <ParticleEffects active={true} type="stars" />

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

      {/* Title */}
      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-xl md:text-3xl font-bold text-center flex items-center justify-center gap-2 glass px-4 md:px-6 py-2 rounded-lg shadow-2xl border-2 border-purple-400 border-opacity-30">
          <Rocket className="w-5 h-5 md:w-8 md:h-8 text-yellow-300 animate-float" />
          <span className="hidden sm:inline text-yellow-300">
            vs {aiPersonality.name}
          </span>
          <span className="sm:hidden text-yellow-300">
            vs AI
          </span>
          <Bot className="w-5 h-5 md:w-8 md:h-8 text-purple-300" />
        </h1>
      </div>

      {/* HUD Overlay - Progress & Coins */}
      <div className="fixed top-16 left-2 right-2 z-20 flex items-start justify-between pointer-events-none">
        {/* Left: Progress Bar */}
        <div className="pointer-events-auto w-64 hidden md:block">
          <ProgressBar
            level={progression.level}
            xp={progression.xp}
            getProgressToNextLevel={progression.getProgressToNextLevel}
          />
        </div>

        {/* Right: Coins */}
        <div className="pointer-events-auto ml-auto">
          <CoinDisplay coins={currency.coins} />
        </div>
      </div>

      {/* Game Controls */}
      <div
        className="fixed left-1/2 transform -translate-x-1/2 z-10 w-[min(280px,calc(100%-1rem))] md:w-96"
        style={{
          bottom: windowWidth < 640 ? '8px' : '16px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <GameControls
          diceValue={diceValue}
          message={isAIThinking ? `${aiPersonality.icon} AI is thinking...` : message}
          onReset={resetGame}
          numPlayers={2}
        />
      </div>

      {/* Player Panels */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 25 }}>
        {/* Top panels */}
        <div className="absolute top-14 left-0 right-0 px-2 flex justify-between gap-2">
          {/* AI Player: Top-Left */}
          {players[1] && (
            <div className="pointer-events-auto">
              {windowWidth >= 1024 ? (
                <PlayerPanel
                  player={players[1]}
                  isCurrentPlayer={currentPlayerIndex === 1}
                  onRollDice={null}
                  isRolling={isRolling || isAIThinking}
                  gameWon={gameWon}
                  isMyPlayer={false}
                  onChangeIcon={changePlayerIcon}
                />
              ) : (
                <CompactPlayerPanel
                  player={players[1]}
                  isCurrentPlayer={currentPlayerIndex === 1}
                  onRollDice={null}
                  isRolling={isRolling || isAIThinking}
                  gameWon={gameWon}
                  isMyPlayer={false}
                  onChangeIcon={changePlayerIcon}
                />
              )}
            </div>
          )}

          {/* Human Player: Top-Right */}
          {players[0] && (
            <div className="pointer-events-auto ml-auto">
              {windowWidth >= 1024 ? (
                <PlayerPanel
                  player={players[0]}
                  isCurrentPlayer={currentPlayerIndex === 0}
                  onRollDice={currentPlayerIndex === 0 ? rollDice : null}
                  isRolling={isRolling}
                  gameWon={gameWon}
                  isMyPlayer={true}
                  onChangeIcon={changePlayerIcon}
                />
              ) : (
                <CompactPlayerPanel
                  player={players[0]}
                  isCurrentPlayer={currentPlayerIndex === 0}
                  onRollDice={currentPlayerIndex === 0 ? rollDice : null}
                  isRolling={isRolling}
                  gameWon={gameWon}
                  isMyPlayer={true}
                  onChangeIcon={changePlayerIcon}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Game Board */}
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
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
          {/* Starting Area */}
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
                        border: `2px solid ${player.isAI ? 'rgba(239, 68, 68, 0.6)' : 'rgba(253, 224, 71, 0.6)'}`
                      }}
                    >
                      {player.isAI ? (
                        <Bot className={`text-red-300 ${animationClass}`} style={{ width: '24px', height: '24px' }} />
                      ) : (
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
                      )}
                      <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>
                        {player.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Game Board */}
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
