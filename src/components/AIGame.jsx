import { useState, useEffect, useRef } from 'react';
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
import { CoinDisplay, LevelDisplay } from './PowerUpUI';
import LevelUpAnimation from './LevelUpAnimation';
import EndGameAnimation from './EndGameAnimation';
import { getBackgroundImage } from '../utils/backgrounds';

export default function AIGame({ onBack, initialDifficulty = 'normal', aiDifficulty = 'medium', gameVariant = 'classic', randomizationSeed = null }) {
  const { playSound } = useGameSounds();
  const [showSettings, setShowSettings] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [demoWinType, setDemoWinType] = useState(null); // For debugging end animations

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize progression and currency systems
  const progression = useProgression();
  const currency = useCurrency();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);
  const previousLevelRef = useRef(progression.level);

  // Detect level ups and show animation
  useEffect(() => {
    if (progression.level > previousLevelRef.current) {
      setLevelUpLevel(progression.level);
      setShowLevelUp(true);
      previousLevelRef.current = progression.level;
    }
  }, [progression.level]);

  const gameLogic = useGameLogic(initialDifficulty, gameVariant);
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
    payBail,
    boardSize
  } = gameLogic;

  // In AI mode, player at index 1 is always the AI
  const isAITurn = currentPlayerIndex === 1;

  // Force losing players to position 0 for visual display when AI wins
  const displayPlayers = gameWon && winner?.isAI 
    ? players.map(p => p.id === winner.id ? p : { ...p, position: 0 })
    : players;

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
      className="fixed inset-0 overflow-hidden flex flex-col bg-black"
      style={{
        backgroundImage: `url(/${getBackgroundImage('ai', difficulty)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* --- Modals and Overlays --- */}
      <ParticleEffects active={true} type="stars" />
      <GameSettings isOpen={showSettings} onClose={() => setShowSettings(false)} difficulty={difficulty} onChangeDifficulty={changeDifficulty} />
      <LevelUpAnimation level={levelUpLevel} isActive={showLevelUp} onComplete={() => setShowLevelUp(false)} />

      {/* --- Main Layout --- */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Top Bar */}
        <header className="flex-shrink-0 p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => { playSound('click'); onBack(); }} className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-110">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <LevelDisplay level={progression.level} />
            <CoinDisplay coins={currency?.coins ?? 0} />
          </div>
          <h1 className="hidden md:flex text-xl lg:text-3xl font-bold text-center items-center justify-center gap-2 glass px-6 py-2 rounded-lg shadow-2xl border-2 border-purple-400 border-opacity-30">
            <span className="text-yellow-300 whitespace-nowrap">vs {aiPersonality.name}</span>
            <Bot className="w-8 h-8 text-purple-300" />
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => { playSound('click'); setShowSettings(true); }} className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-yellow-400 transition-all transform hover:scale-110" title="Game Settings">
              <Settings className="w-5 h-5 text-yellow-300" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex-1 flex flex-col md:flex-row gap-2 p-2 min-h-0">
          {/* Left Player Column (Desktop) */}
          <div className="hidden lg:flex flex-col justify-around w-64">
            <PlayerPanel player={players[0]} isCurrentPlayer={currentPlayerIndex === 0} onRollDice={currentPlayerIndex === 0 ? rollDice : null} isRolling={isRolling} gameWon={gameWon} isMyPlayer={true} onChangeIcon={changePlayerIcon} />
          </div>

          {/* Center Column (Board and Mobile Controls) */}
          <div className="flex-grow flex flex-col gap-2 min-w-0 min-h-0">
            {/* Player Info (Tablet/Mobile) */}
            <div className="w-full grid grid-cols-2 lg:hidden gap-2">
              <CompactPlayerPanel player={players[0]} isCurrentPlayer={currentPlayerIndex === 0} onRollDice={currentPlayerIndex === 0 ? rollDice : null} isRolling={isRolling} gameWon={gameWon} isMyPlayer={true} onChangeIcon={changePlayerIcon} />
              <CompactPlayerPanel player={players[1]} isCurrentPlayer={currentPlayerIndex === 1} onRollDice={null} isRolling={isRolling || isAIThinking} gameWon={gameWon} isMyPlayer={false} onChangeIcon={changePlayerIcon} />
            </div>

            {/* Board */}
            <div className="flex-grow relative min-h-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full max-w-full max-h-full aspect-square">
                  <GameBoard players={displayPlayers} animatingPlayer={animatingPlayer} animationType={animationType} alienBlink={alienBlink} aliens={aliens} checkpoints={checkpoints} hazards={hazards} boardSize={boardSize} />
                </div>
              </div>
            </div>
            
            {/* Controls (Mobile) */}
            <div className="lg:hidden flex-shrink-0">
              <GameControls diceValue={diceValue} message={isAIThinking ? `${aiPersonality.icon} AI is thinking...` : message} onReset={resetGame} numPlayers={2} onRollDice={rollDice} isRolling={isRolling} gameWon={gameWon} isCurrentPlayerHuman={!isAITurn} />
            </div>
          </div>

          {/* Right Player Column (Desktop) */}
          <div className="hidden lg:flex flex-col justify-around w-64">
            <PlayerPanel player={players[1]} isCurrentPlayer={currentPlayerIndex === 1} onRollDice={null} isRolling={isRolling || isAIThinking} gameWon={gameWon} isMyPlayer={false} onChangeIcon={changePlayerIcon} />
          </div>
        </main>
        
        {/* Footer / Controls (Desktop) */}
        <footer className="hidden lg:flex flex-shrink-0 p-2 justify-center">
          <GameControls diceValue={diceValue} message={isAIThinking ? `${aiPersonality.icon} AI is thinking...` : message} onReset={resetGame} numPlayers={2} onRollDice={rollDice} isRolling={isRolling} gameWon={gameWon} isCurrentPlayerHuman={!isAITurn} />
        </footer>
      </div>

      {/* Game Overlays */}
      {players.map((player, index) => {
        const jailState = jailStates(player.id);
        if (jailState.inJail && currentPlayerIndex === index) {
          return <SpaceJail key={player.id} playerId={player.id} playerName={player.name} turnsRemaining={jailState.turnsRemaining} bailCost={50} playerCoins={currency.coins} onPayBail={() => { const result = payBail(player.id); if (result.success) { currency.removeCoins(result.cost); playSound('click'); } }} onRollForDoubles={rollDice} isCurrentPlayer={true} />;
        }
        return null;
      })}
    </div>
  );
}
