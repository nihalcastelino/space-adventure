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
import { useAIOpponent } from '../hooks/useAIOpponent';
import { useProgression } from '../hooks/useProgression';
import { useCurrency } from '../hooks/useCurrency';
import { CoinDisplay, LevelDisplay } from './PowerUpUI';
import LevelUpAnimation from './LevelUpAnimation';
import { getBackgroundImage } from '../utils/backgrounds';

export default function AIGame({ onBack, initialDifficulty = 'normal', aiDifficulty = 'medium', gameVariant = 'classic', randomizationSeed = null }) {
  const { playSound } = useGameSounds();
  const [showSettings, setShowSettings] = useState(false);

  const progression = useProgression();
  const currency = useCurrency();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);
  const previousLevelRef = useRef(progression.level);

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

  const isAITurn = currentPlayerIndex === 1;

  const displayPlayers = gameWon && winner?.isAI 
    ? players.map(p => p.id === winner.id ? p : { ...p, position: 0 })
    : players;

  const { aiPersonality, isAIThinking, takeAITurn } = useAIOpponent(
    aiDifficulty,
    { players, currentPlayerIndex },
    null
  );

  const [aiTurnTaken, setAiTurnTaken] = useState(false);

  useEffect(() => {
    setAiTurnTaken(false);
  }, [currentPlayerIndex]);

  useEffect(() => {
    if (isAITurn && !isRolling && !gameWon && !aiTurnTaken) {
      setAiTurnTaken(true);
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
      <div className="absolute inset-0 bg-black/40" />

      {/* --- Modals and Overlays --- */}
      <ParticleEffects active={true} type="stars" />
      <GameSettings isOpen={showSettings} onClose={() => setShowSettings(false)} difficulty={difficulty} onChangeDifficulty={changeDifficulty} />
      <LevelUpAnimation level={levelUpLevel} isActive={showLevelUp} onComplete={() => setShowLevelUp(false)} />

      {/* --- Main Layout --- */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Top Bar */}
        <header className="flex-shrink-0 p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => { playSound('click'); onBack(); }} className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-blue-400">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <LevelDisplay level={progression.level} />
            <CoinDisplay coins={currency?.coins ?? 0} />
          </div>
          <h1 className="text-xl font-bold text-yellow-300 flex items-center gap-2">
            vs {aiPersonality.name} <Bot className="w-6 h-6 text-purple-300" />
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
            <CompactPlayerPanel 
              player={players[0]} 
              isCurrentPlayer={currentPlayerIndex === 0} 
              isMyPlayer={true}
              onRollDice={currentPlayerIndex === 0 ? rollDice : null}
              isRolling={isRolling}
              gameWon={gameWon}
            />
            <CompactPlayerPanel 
              player={players[1]} 
              isCurrentPlayer={currentPlayerIndex === 1} 
              isMyPlayer={false}
              onRollDice={null}
              isRolling={isRolling || isAIThinking}
              gameWon={gameWon}
            />
          </div>

          {/* Game Board */}
          <div className="w-full max-w-[600px] mx-auto aspect-square">
            <GameBoard 
              players={displayPlayers} 
              animatingPlayer={animatingPlayer} 
              animationType={animationType} 
              alienBlink={alienBlink} 
              aliens={aliens} 
              checkpoints={checkpoints} 
              hazards={hazards} 
              boardSize={boardSize} 
            />
          </div>

          {/* Game Controls */}
          <div className="flex-shrink-0">
            <GameControls 
              diceValue={diceValue} 
              message={isAIThinking ? `${aiPersonality.icon} AI is thinking...` : message} 
              onReset={resetGame} 
              numPlayers={2}
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