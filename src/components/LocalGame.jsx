import { useState, useEffect, useRef } from 'react';
import { Rocket, Zap, Plus, Minus, ArrowLeft, Settings, Edit2, Trophy } from 'lucide-react';
import GameBoard from './GameBoard';
import PlayerPanel from './PlayerPanel';
import CompactPlayerPanel from './CompactPlayerPanel';
import GameControls from './GameControls';
import ParticleEffects from './ParticleEffects';
import GameSettings from './GameSettings';
import SpaceJail from './SpaceJail';
import { useGameLogic } from '../hooks/useGameLogic';
import { useGameSounds } from '../hooks/useGameSounds';
import { useProgression } from '../hooks/useProgression';
import { useCurrency } from '../hooks/useCurrency';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useGameHistory } from '../hooks/useGameHistory';
import { CoinDisplay, LevelDisplay } from './PowerUpUI';
import LevelUpAnimation from './LevelUpAnimation';
import EndGameAnimation from './EndGameAnimation';
import UsernameInputModal from './UsernameInputModal';
import { getBackgroundImage } from '../utils/backgrounds';

export default function LocalGame({ onBack, initialDifficulty = 'normal', gameVariant = 'classic', randomizationSeed = null }) {
  const { playSound } = useGameSounds();
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGameHistory, setShowGameHistory] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const leaderboard = useLeaderboard();
  const gameHistory = useGameHistory();

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
    changePlayerName,
    hazards,
    jailStates,
    payBail,
    rogueState,
    gameStartTime,
    turnCount,
    boardSize
  } = useGameLogic(initialDifficulty, gameVariant);

  // Debug: Log currency to console (can remove later)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('💰 Currency Debug:', {
        coins: currency.coins,
        hasCoins: !!currency.coins,
        currencyKeys: Object.keys(currency),
        currencyType: typeof currency.coins
      });
    }
  }, [currency]);

  // Track game events for coins and progression
  useEffect(() => {
    // Award daily login bonus on mount
    currency.checkDailyLogin();
  }, [currency]);

  // Detect level ups and show animation
  useEffect(() => {
    if (progression.level > previousLevelRef.current) {
      setLevelUpLevel(progression.level);
      setShowLevelUp(true);
      previousLevelRef.current = progression.level;
    }
  }, [progression.level]);

  // Show username modal on mount (first time)
  useEffect(() => {
    // Show username modal when game first loads
    const hasSeenModal = sessionStorage.getItem('space_adventure_usernames_set');
    if (!hasSeenModal && players.length > 0) {
      setShowUsernameModal(true);
      sessionStorage.setItem('space_adventure_usernames_set', 'true');
    }
  }, [players.length]);

  useEffect(() => {
    if (gameWon && winner) {
      // Award coins for winning
      currency.earnGameReward(true, difficulty, false);
      // Track progression
      progression.trackEvent('gameWon', { difficulty, isOnline: false });
      
      // Track game on leaderboard and history
      const gameDuration = Date.now() - (gameStartTime || Date.now());
      
      // Record winner on leaderboard (only if name is not default)
      if (winner.name && !winner.name.match(/^Player \d+$/)) {
        leaderboard.recordWin(winner.name, `local_${Date.now()}`, gameDuration);
      }
      
      // Record other players (they played but didn't win)
      players.forEach(player => {
        if (player.id !== winner.id && player.name && !player.name.match(/^Player \d+$/)) {
          leaderboard.recordGame(player.name);
        }
      });
      
      // Save to game history
      gameHistory.saveGameHistory({
        gameId: `local_${Date.now()}`,
        players: players.map(p => ({
          name: p.name,
          position: p.position,
          color: p.color
        })),
        winner: {
          name: winner.name,
          color: winner.color
        },
        startedAt: gameStartTime || Date.now(),
        completedAt: Date.now(),
        totalMoves: turnCount,
        gameMode: 'local'
      });
    }
  }, [gameWon, winner, difficulty, currency, progression, players, turnCount, leaderboard, gameHistory, gameStartTime]);

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col bg-black"
      style={{
        backgroundImage: `url(/${getBackgroundImage('local', difficulty)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* --- Modals and Overlays --- */}
      <ParticleEffects active={true} type="stars" />
      <UsernameInputModal isOpen={showUsernameModal} onClose={() => setShowUsernameModal(false)} players={players} onChangePlayerName={changePlayerName} />
      <GameSettings isOpen={showSettings} onClose={() => setShowSettings(false)} difficulty={difficulty} onChangeDifficulty={changeDifficulty} onUpgrade={() => { setShowSettings(false); window.dispatchEvent(new CustomEvent('showPremiumModal')); }} />

      {/* --- Main Layout --- */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Top Bar */}
        <header className="flex-shrink-0 p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => { playSound('click'); onBack(); }} className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-110">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <LevelDisplay level={progression.level} />
            <CoinDisplay coins={currency?.coins ?? 120} />
          </div>
          <h1 className="hidden md:flex text-xl lg:text-3xl font-bold text-center items-center justify-center gap-2 glass px-6 py-2 rounded-lg shadow-2xl border-2 border-yellow-400 border-opacity-30">
            <Rocket className="w-8 h-8 text-yellow-300 animate-float" />
            <span className="text-yellow-300 whitespace-nowrap">Space Race!</span>
          </h1>
          <div className="flex items-center gap-2">
            {!diceValue && !gameWon && (
              <button onClick={() => { playSound('click'); setShowUsernameModal(true); }} className="glass rounded-lg px-4 py-2 shadow-lg border-2 border-gray-700 hover:border-yellow-400 transition-all transform hover:scale-105 hidden sm:flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-yellow-300" />
                <span className="text-white text-sm font-semibold">Edit Names</span>
              </button>
            )}
            <button onClick={() => { playSound('click'); setShowSettings(true); }} className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-yellow-400 transition-all transform hover:scale-110" title="Game Settings">
              <Settings className="w-5 h-5 text-yellow-300" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex-1 flex flex-col md:flex-row gap-2 p-2 min-h-0">
          {/* Left Player Column (Desktop) */}
          <div className="hidden lg:flex flex-col justify-around w-64">
            <PlayerPanel player={players[0]} isCurrentPlayer={currentPlayerIndex === 0} onRollDice={currentPlayerIndex === 0 ? rollDice : null} isRolling={isRolling} gameWon={gameWon} onChangeIcon={changePlayerIcon} />
            {players[2] && <PlayerPanel player={players[2]} isCurrentPlayer={currentPlayerIndex === 2} onRollDice={currentPlayerIndex === 2 ? rollDice : null} isRolling={isRolling} gameWon={gameWon} onChangeIcon={changePlayerIcon} />}
          </div>

          {/* Center Column (Board and Mobile Controls) */}
          <div className="flex-grow flex flex-col gap-2 min-w-0 min-h-0">
            {/* Player Info (Tablet/Mobile) */}
            <div className="w-full grid grid-cols-2 lg:hidden gap-2">
              {players.map((p, index) => (
                <CompactPlayerPanel key={p.id} player={p} isCurrentPlayer={currentPlayerIndex === index} onRollDice={currentPlayerIndex === index ? rollDice : null} isRolling={isRolling} gameWon={gameWon} onChangeIcon={changePlayerIcon} />
              ))}
            </div>

            {/* Board */}
            <div className="flex-grow relative min-h-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full max-w-full max-h-full aspect-square">
                  <GameBoard players={players} animatingPlayer={animatingPlayer} animationType={animationType} alienBlink={alienBlink} aliens={aliens} rogueState={rogueState} checkpoints={checkpoints} hazards={hazards} boardSize={boardSize} />
                </div>
              </div>
            </div>
            
            {/* Controls (Mobile) */}
            <div className="lg:hidden flex-shrink-0">
               <GameControls diceValue={diceValue} message={message} onReset={() => { resetGame(); setShowUsernameModal(true); }} onAddPlayer={() => { addPlayer(); setShowUsernameModal(true); }} onRemovePlayer={removePlayer} numPlayers={numPlayers} onRollDice={rollDice} isRolling={isRolling} gameWon={gameWon} isCurrentPlayerHuman={true} />
            </div>
          </div>

          {/* Right Player Column (Desktop) */}
          <div className="hidden lg:flex flex-col justify-around w-64">
            {players[1] && <PlayerPanel player={players[1]} isCurrentPlayer={currentPlayerIndex === 1} onRollDice={currentPlayerIndex === 1 ? rollDice : null} isRolling={isRolling} gameWon={gameWon} onChangeIcon={changePlayerIcon} />}
            {players[3] && <PlayerPanel player={players[3]} isCurrentPlayer={currentPlayerIndex === 3} onRollDice={currentPlayerIndex === 3 ? rollDice : null} isRolling={isRolling} gameWon={gameWon} onChangeIcon={changePlayerIcon} />}
          </div>
        </main>
        
        {/* Footer / Controls (Desktop) */}
        <footer className="hidden lg:flex flex-shrink-0 p-2 justify-center">
           <GameControls diceValue={diceValue} message={message} onReset={() => { resetGame(); setShowUsernameModal(true); }} onAddPlayer={() => { addPlayer(); setShowUsernameModal(true); }} onRemovePlayer={removePlayer} numPlayers={numPlayers} onRollDice={rollDice} isRolling={isRolling} gameWon={gameWon} isCurrentPlayerHuman={true} />
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

