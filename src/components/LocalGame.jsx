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
import UsernameInputModal from './UsernameInputModal';
import { getBackgroundImage } from '../utils/backgrounds';

export default function LocalGame({ onBack, initialDifficulty = 'normal', gameVariant = 'classic', randomizationSeed = null }) {
  const { playSound } = useGameSounds();
  const [showSettings, setShowSettings] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const leaderboard = useLeaderboard();
  const gameHistory = useGameHistory();
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

  useEffect(() => {
    if (progression.level > previousLevelRef.current) {
      setLevelUpLevel(progression.level);
      setShowLevelUp(true);
      previousLevelRef.current = progression.level;
    }
  }, [progression.level]);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('space_adventure_usernames_set');
    if (!hasSeenModal && players.length > 0) {
      setShowUsernameModal(true);
      sessionStorage.setItem('space_adventure_usernames_set', 'true');
    }
  }, [players.length]);

  useEffect(() => {
    if (gameWon && winner) {
      // Handle game won logic
    }
  }, [gameWon, winner]);

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col bg-black"
      style={{
        backgroundImage: `url(/${getBackgroundImage('local', difficulty)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* --- Modals and Overlays --- */}
      <ParticleEffects active={true} type="stars" />
      <UsernameInputModal isOpen={showUsernameModal} onClose={() => setShowUsernameModal(false)} players={players} onChangePlayerName={changePlayerName} />
      <GameSettings isOpen={showSettings} onClose={() => setShowSettings(false)} difficulty={difficulty} onChangeDifficulty={changeDifficulty} onUpgrade={() => { setShowSettings(false); window.dispatchEvent(new CustomEvent('showPremiumModal')); }} />

      {/* --- Main Layout --- */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Top Bar */}
        <header className="flex-shrink-0 p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => { playSound('click'); onBack(); }} className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-blue-400">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <LevelDisplay level={progression.level} />
            <CoinDisplay coins={currency?.coins ?? 120} />
          </div>
          <h1 className="text-xl font-bold text-yellow-300">
            Local Game
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => { playSound('click'); setShowSettings(true); }} className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-yellow-400" title="Game Settings">
              <Settings className="w-5 h-5 text-yellow-300" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-grow flex-1 min-h-0 overflow-y-auto p-2 space-y-4">
          
          {/* Player Panels */}
          <div className="grid grid-cols-2 gap-2">
            {players.map((p, index) => (
              <CompactPlayerPanel 
                key={p.id} 
                player={p} 
                isCurrentPlayer={currentPlayerIndex === index}
                onRollDice={currentPlayerIndex === index ? rollDice : null}
                isRolling={isRolling}
                gameWon={gameWon}
              />
            ))}
          </div>

          {/* Game Board */}
          <div className="w-full max-w-[600px] mx-auto aspect-square">
            <GameBoard 
              players={players} 
              animatingPlayer={animatingPlayer} 
              animationType={animationType} 
              alienBlink={alienBlink} 
              aliens={aliens} 
              rogueState={rogueState} 
              checkpoints={checkpoints} 
              hazards={hazards} 
              boardSize={boardSize} 
            />
          </div>

          {/* Game Controls */}
          <div className="flex-shrink-0">
            <GameControls 
              diceValue={diceValue} 
              message={message} 
              onReset={resetGame} 
              onAddPlayer={addPlayer} 
              onRemovePlayer={removePlayer} 
              numPlayers={numPlayers}
            />
          </div>

        </main>
      </div>

      {/* Game Event Overlays */}
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