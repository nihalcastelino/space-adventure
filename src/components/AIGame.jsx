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

export default function AIGame({ onBack, initialDifficulty = 'normal', aiDifficulty = 'medium', gameVariant = 'classic', randomizationSeed = null, campaignLevelId = null }) {
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

  const gameLogic = useGameLogic(initialDifficulty, gameVariant, false, null, campaignLevelId);

  // Debug: Log if gameLogic is missing or incomplete (only once)
  const hasLoggedWarning = useRef(false);
  useEffect(() => {
    if (hasLoggedWarning.current) return;
    if (!gameLogic) {
      console.warn('AIGame: useGameLogic returned undefined. Using fallback functions.');
      hasLoggedWarning.current = true;
    } else if (!gameLogic.rollDice || !gameLogic.resetGame) {
      console.warn('AIGame: useGameLogic is incomplete. Missing rollDice or resetGame. Using fallback functions.');
      hasLoggedWarning.current = true;
    }
  }, [gameLogic]);

  const {
    players: gameLogicPlayers = [],
    currentPlayerIndex: gameLogicCurrentPlayerIndex = 0,
    diceValue: gameLogicDiceValue,
    isRolling: gameLogicIsRolling = false,
    message: gameLogicMessage = "Player 1's turn! Press SPIN to start!",
    gameWon: gameLogicGameWon = false,
    winner: gameLogicWinner,
    animatingPlayer: gameLogicAnimatingPlayer,
    animationType: gameLogicAnimationType,
    alienBlink: gameLogicAlienBlink = {},
    aliens: gameLogicAliens,
    checkpoints: gameLogicCheckpoints,
    difficulty: gameLogicDifficulty = initialDifficulty,
    changeDifficulty: gameLogicChangeDifficulty,
    rollDice: gameLogicRollDice,
    resetGame: gameLogicResetGame,
    changePlayerIcon: gameLogicChangePlayerIcon,
    hazards: gameLogicHazards,
    jailStates: gameLogicJailStates,
    payBail: gameLogicPayBail,
    boardSize: gameLogicBoardSize = 100
  } = gameLogic || {};

  // Ensure players array is always initialized with at least 2 players
  const [localPlayers, setLocalPlayers] = useState([
    { id: 1, name: 'Player 1', position: 0, lastCheckpoint: 0, icon: '🚀', color: 'text-yellow-300', isAI: false, corner: 'top-left' },
    { id: 2, name: 'AI', position: 0, lastCheckpoint: 0, icon: '🤖', color: 'text-blue-300', isAI: true, corner: 'top-right' }
  ]);
  const [localCurrentPlayerIndex, setLocalCurrentPlayerIndex] = useState(0);
  const [localDiceValue, setLocalDiceValue] = useState(null);
  const [localIsRolling, setLocalIsRolling] = useState(false);
  const [localMessage, setLocalMessage] = useState("Player 1's turn! Press SPIN to start!");

  const players = gameLogicPlayers && gameLogicPlayers.length > 0 ? gameLogicPlayers : localPlayers;
  const currentPlayerIndex = gameLogic ? gameLogicCurrentPlayerIndex : localCurrentPlayerIndex;
  const diceValue = gameLogic ? gameLogicDiceValue : localDiceValue;
  const isRolling = gameLogic ? gameLogicIsRolling : localIsRolling;
  const message = gameLogic ? gameLogicMessage : localMessage;
  const gameWon = gameLogic ? gameLogicGameWon : false;
  const winner = gameLogic ? gameLogicWinner : null;
  const animatingPlayer = gameLogic ? gameLogicAnimatingPlayer : null;
  const animationType = gameLogic ? gameLogicAnimationType : null;
  const alienBlink = gameLogic ? gameLogicAlienBlink : {};
  const aliens = gameLogic ? gameLogicAliens : undefined;
  const checkpoints = gameLogic ? gameLogicCheckpoints : undefined;
  const difficulty = gameLogic ? gameLogicDifficulty : initialDifficulty;
  const changeDifficulty = gameLogic ? gameLogicChangeDifficulty : undefined;
  const hazards = gameLogic ? gameLogicHazards : null;
  const jailStates = gameLogic ? gameLogicJailStates : undefined;
  const payBail = gameLogic ? gameLogicPayBail : undefined;
  const boardSize = gameLogic ? gameLogicBoardSize : 100;

  // Fallback rollDice function if gameLogic doesn't provide it
  const rollDice = gameLogicRollDice || (() => {
    if (localIsRolling) return;
    setLocalIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;
    setTimeout(() => {
      setLocalDiceValue(roll);
      setLocalIsRolling(false);
      const currentPlayer = localPlayers[localCurrentPlayerIndex];
      const newPosition = Math.min(currentPlayer.position + roll, 100);
      setLocalPlayers(prev => prev.map((p, i) =>
        i === localCurrentPlayerIndex ? { ...p, position: newPosition } : p
      ));
      if (newPosition >= 100) {
        setLocalMessage(`${currentPlayer.name} wins!`);
      } else {
        setLocalCurrentPlayerIndex((localCurrentPlayerIndex + 1) % localPlayers.length);
        setLocalMessage(`${localPlayers[(localCurrentPlayerIndex + 1) % localPlayers.length].name}'s turn!`);
      }
    }, 1000);
  });

  // Fallback resetGame function if gameLogic doesn't provide it
  const resetGame = gameLogicResetGame || (() => {
    setLocalPlayers([
      { id: 1, name: 'Player 1', position: 0, lastCheckpoint: 0, icon: '🚀', color: 'text-yellow-300', isAI: false, corner: 'top-left' },
      { id: 2, name: 'AI', position: 0, lastCheckpoint: 0, icon: '🤖', color: 'text-blue-300', isAI: true, corner: 'top-right' }
    ]);
    setLocalCurrentPlayerIndex(0);
    setLocalDiceValue(null);
    setLocalIsRolling(false);
    setLocalMessage("Player 1's turn! Press SPIN to start!");
  });

  // Fallback changePlayerIcon function if gameLogic doesn't provide it
  const changePlayerIcon = gameLogicChangePlayerIcon || ((playerId, iconData) => {
    setLocalPlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, icon: iconData.icon || iconData } : p
    ));
  });

  const isAITurn = currentPlayerIndex === 1;

  const displayPlayers = (players && players.length > 0)
    ? (gameWon && winner?.isAI
      ? players.map(p => p.id === winner.id ? p : { ...p, position: 0 })
      : players)
    : [];

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
        <main className="flex-grow flex-1 min-h-0 overflow-y-auto p-2 space-y-2 md:space-y-4">

          {/* Player Panels - Horizontal Scroll on Mobile, Grid on Desktop */}
          {players && players.length >= 2 && (
            <div className="flex overflow-x-auto pb-2 gap-2 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 scrollbar-hide">
              {players[0] && (
                <div className="flex-shrink-0">
                  <CompactPlayerPanel
                    player={players[0]}
                    isCurrentPlayer={currentPlayerIndex === 0}
                    isMyPlayer={true}
                    onRollDice={currentPlayerIndex === 0 && rollDice ? rollDice : null}
                    isRolling={isRolling}
                    gameWon={gameWon}
                  />
                </div>
              )}
              {players[1] && (
                <div className="flex-shrink-0">
                  <CompactPlayerPanel
                    player={players[1]}
                    isCurrentPlayer={currentPlayerIndex === 1}
                    isMyPlayer={false}
                    onRollDice={null}
                    isRolling={isRolling || isAIThinking}
                    gameWon={gameWon}
                  />
                </div>
              )}
            </div>
          )}

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
      {players && players.length > 0 && jailStates && payBail && players.map((player, index) => {
        if (!player) return null;
        const jailState = jailStates(player.id);
        if (jailState && jailState.inJail && currentPlayerIndex === index) {
          return <SpaceJail key={player.id} playerId={player.id} playerName={player.name} turnsRemaining={jailState.turnsRemaining} bailCost={50} playerCoins={currency.coins} onPayBail={() => { const result = payBail(player.id); if (result && result.success) { currency.removeCoins(result.cost); playSound('click'); } }} onRollForDoubles={rollDice} isCurrentPlayer={true} />;
        }
        return null;
      })}
    </div>
  );
}