import { useState, useEffect, useRef } from 'react';
import { Rocket, Wifi, WifiOff, ArrowLeft, Copy, Check, Trophy, History, Pause, Play, Bell, BellOff, Settings } from 'lucide-react';
import { useFirebaseGame } from '../hooks/useFirebaseGame';
import GameBoard from './GameBoard';
import PlayerPanel from './PlayerPanel';
import CompactPlayerPanel from './CompactPlayerPanel';
import GameControls from './GameControls';
import ParticleEffects from './ParticleEffects';
import GameSettings from './GameSettings';
import Leaderboard from './Leaderboard';
import GameHistory from './GameHistory';
import EndGameAnimation from './EndGameAnimation';
import { useGameSounds } from '../hooks/useGameSounds';
import { useNotifications } from '../hooks/useNotifications';
import { getBackgroundImage, getScreenBackground } from '../utils/backgrounds';

const STORAGE_KEY = 'space-adventure-game';

export default function OnlineGame({ onBack }) {
  const { playSound } = useGameSounds();
  const { permission, isSupported, requestPermission, sendNotification } = useNotifications();
  const previousTurnRef = useRef(null);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const {
    gameState,
    gameId,
    playerId,
    connected,
    animatingPlayer,
    animationType,
    alienBlink,
    diceRolling,
    animatedPositions,
    encounterType,
    createGame,
    joinGame,
    handleRollDice,
    handleResetGame,
    handlePauseGame,
    handleResumeGame
  } = useFirebaseGame();

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [hasAttemptedReconnect, setHasAttemptedReconnect] = useState(false);

  // Auto-reconnect on mount if game data exists in localStorage
  useEffect(() => {
    // Only try once
    if (hasAttemptedReconnect) return;

    const tryReconnect = async () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
          setHasAttemptedReconnect(true);
          return;
        }

        const { gameId: savedGameId, playerName: savedPlayerName } = JSON.parse(savedData);
        if (!savedGameId || !savedPlayerName) {
          setHasAttemptedReconnect(true);
          return;
        }

        setIsReconnecting(true);
        setPlayerName(savedPlayerName);

        // Try to rejoin the game
        await joinGame(savedGameId, savedPlayerName);
        setShowNameInput(false);
        setShowRoomInput(false);
        setIsReconnecting(false);
        setHasAttemptedReconnect(true);
      } catch (err) {
        // Reconnection failed - game might be deleted or invalid
        console.log('Reconnection failed:', err.message);
        localStorage.removeItem(STORAGE_KEY);
        setIsReconnecting(false);
        setShowNameInput(true);
        setHasAttemptedReconnect(true);
      }
    };

    tryReconnect();
  }, [hasAttemptedReconnect, joinGame]);

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    playSound('click');
    try {
      setError(null);
      await createGame(playerName.trim());
      setShowNameInput(false);
      setShowRoomInput(false);
    } catch (err) {
      setError(err.message || 'Failed to create game');
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    playSound('click');
    try {
      setError(null);
      await joinGame(roomCode.trim(), playerName.trim());
      setShowNameInput(false);
      setShowRoomInput(false);
    } catch (err) {
      setError(err.message || 'Failed to join game');
    }
  };

  // Save game data to localStorage when connected
  useEffect(() => {
    if (gameId && playerId && playerName) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gameId,
        playerName
      }));
    }
  }, [gameId, playerId, playerName]);

  // Clear localStorage when game ends
  useEffect(() => {
    if (gameState?.gameWon) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [gameState?.gameWon]);

  // Send notification when it's player's turn
  useEffect(() => {
    if (!gameState || !playerId || gameState.gameWon || gameState.isPaused) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isMyTurn = currentPlayer?.id === playerId;
    const currentTurnId = currentPlayer?.id;

    // Check if turn changed to this player
    if (isMyTurn && previousTurnRef.current !== currentTurnId) {
      sendNotification("It's Your Turn!", {
        body: "Time to roll the dice in Space Race!",
        icon: '/icon-192.png',
        requireInteraction: false
      });
    }

    previousTurnRef.current = currentTurnId;
  }, [gameState, playerId, sendNotification]);

  const handleBack = () => {
    playSound('click');
    localStorage.removeItem(STORAGE_KEY);
    onBack();
  };

  const copyGameId = () => {
    if (gameId) {
      playSound('click');
      navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reconnecting screen
  if (isReconnecting) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          backgroundImage: `url(/${getScreenBackground('reconnecting')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#000'
        }}
      >
        <div className="text-center space-y-4">
          <Wifi className="w-16 h-16 text-blue-400 mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Reconnecting...</h2>
          <p className="text-gray-400">Restoring your previous game</p>
        </div>
      </div>
    );
  }

  if (!connected && !showNameInput && !showRoomInput) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          backgroundImage: `url(/${getScreenBackground('waiting')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#000'
        }}
      >
        <div className="text-center space-y-4">
          <WifiOff className="w-16 h-16 text-red-400 mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Connecting...</h2>
          <button
            onClick={handleBack}
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(/${getScreenBackground('waiting')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#000'
        }}
      >
        <div className="bg-gray-900 bg-opacity-95 rounded-lg p-8 shadow-2xl border-2 border-gray-700 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Enter Your Name</h2>
          {error && (
            <div className="bg-red-900 bg-opacity-50 text-red-200 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border-2 border-gray-700 focus:border-blue-400 focus:outline-none mb-4"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                if (playerName.trim()) {
                  setShowNameInput(false);
                  setShowRoomInput(true);
                  setError(null);
                } else {
                  setError('Please enter your name');
                }
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                playSound('click');
                if (playerName.trim()) {
                  setShowNameInput(false);
                  setShowRoomInput(true);
                  setError(null);
                } else {
                  setError('Please enter your name');
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              Continue
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showRoomInput) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(/${getScreenBackground('waiting')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#000'
        }}
      >
        <div className="bg-gray-900 bg-opacity-95 rounded-lg p-8 shadow-2xl border-2 border-gray-700 max-w-md w-full space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Join or Create Game</h2>

          {error && (
            <div className="bg-red-900 bg-opacity-50 text-red-200 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              onClick={handleCreateGame}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all mb-4"
            >
              Create New Game
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">OR</span>
            </div>
          </div>

          <div>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter room code"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border-2 border-gray-700 focus:border-blue-400 focus:outline-none mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && roomCode.trim()) {
                  handleJoinGame();
                }
              }}
            />
            <button
              onClick={handleJoinGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading game...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const myPlayer = gameState.players.find(p => p.id === playerId);
  const isMyTurn = myPlayer && currentPlayer?.id === playerId;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        backgroundImage: `url(/${getBackgroundImage('online', gameState?.difficulty || 'normal')})`,
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

      <ParticleEffects active={connected} type="stars" />
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
        .animate-rocket-liftoff {
          animation: rocket-liftoff 0.8s ease-in-out;
        }
        .animate-rocket-landing {
          animation: rocket-landing 0.6s ease-in-out;
        }
        .animate-rocket-blastoff {
          animation: rocket-blastoff 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>

      {/* Connection status and game controls */}
      <div className="fixed top-2 right-2 z-50 flex items-center gap-1 md:gap-2">
        {/* Game controls menu */}
        {connected && gameState && (
          <div className="flex gap-1 md:gap-2">
            <button
              onClick={() => {
                playSound('click');
                setShowLeaderboard(true);
              }}
              className="glass rounded-lg p-1.5 md:p-2 shadow-lg border-2 border-gray-700 hover:border-yellow-400 transition-all transform hover:scale-110 active:scale-95"
              title="Leaderboard"
            >
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            </button>
            <button
              onClick={() => {
                playSound('click');
                setShowHistory(true);
              }}
              className="glass rounded-lg p-1.5 md:p-2 shadow-lg border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-110 active:scale-95"
              title="Game History"
            >
              <History className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </button>
            {gameState.isPaused ? (
              <button
                onClick={() => {
                  playSound('click');
                  handleResumeGame();
                }}
                className="glass rounded-lg p-1.5 md:p-2 shadow-lg border-2 border-gray-700 hover:border-green-400 transition-all transform hover:scale-110 active:scale-95"
                title="Resume Game"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              </button>
            ) : (
              <button
                onClick={() => {
                  playSound('click');
                  handlePauseGame();
                }}
                className="glass rounded-lg p-1.5 md:p-2 shadow-lg border-2 border-gray-700 hover:border-orange-400 transition-all transform hover:scale-110 active:scale-95"
                title="Pause Game"
              >
                <Pause className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
              </button>
            )}
            {isSupported && permission !== 'granted' && (
              <button
                onClick={() => {
                  playSound('click');
                  requestPermission();
                }}
                className="glass rounded-lg p-1.5 md:p-2 shadow-lg border-2 border-gray-700 hover:border-purple-400 transition-all transform hover:scale-110 active:scale-95"
                title="Enable turn notifications"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </button>
            )}
            {permission === 'granted' && (
              <button
                className="glass rounded-lg p-1.5 md:p-2 shadow-lg border-2 border-purple-400 border-opacity-50 cursor-default"
                title="Notifications enabled"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              </button>
            )}
          </div>
        )}

        {/* Connection status */}
        <div className={`hidden sm:flex items-center gap-2 glass rounded-lg px-3 py-2 border-2 ${connected ? 'border-green-400 border-opacity-50' : 'border-red-400 border-opacity-50'
          }`}>
          {connected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-xs text-white">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-xs text-white">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Back button, settings button, and room code */}
      <div className="fixed top-2 left-2 z-50 flex items-center gap-1 md:gap-2">
        <button
          onClick={handleBack}
          className="glass rounded-lg p-1.5 md:p-2 shadow-lg border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-110 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>
        <button
          onClick={() => {
            playSound('click');
            setShowSettings(true);
          }}
          className="glass rounded-lg p-1.5 md:p-2 shadow-lg border-2 border-gray-700 hover:border-yellow-400 transition-all transform hover:scale-110 active:scale-95"
          title="Game Settings"
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
        </button>

        {/* Room code display */}
        {gameId && (
          <div className="glass rounded-lg px-2 py-1.5 md:px-3 md:py-2 flex items-center gap-1 md:gap-2 border-2 border-yellow-400 border-opacity-30">
            <span className="hidden md:inline text-xs text-gray-400">Room:</span>
            <code className="text-xs md:text-sm text-yellow-300 font-mono font-bold truncate max-w-[120px] md:max-w-none">{gameId}</code>
            <button
              onClick={copyGameId}
              className="text-white hover:text-blue-400 transition-colors transform hover:scale-110 active:scale-95"
            >
              {copied ? <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Pause overlay */}
      {gameState?.isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
          <div className="glass rounded-lg p-8 text-center border-2 border-orange-400">
            <Pause className="w-16 h-16 text-orange-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold text-white mb-2">Game Paused</h2>
            <p className="text-gray-300 mb-4">
              Paused by {gameState.pausedBy}
            </p>
            {gameState.players.find(p => p.id === playerId)?.name === gameState.pausedBy && (
              <button
                onClick={handleResumeGame}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105"
              >
                Resume Game
              </button>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Game History Modal */}
      {showHistory && (
        <GameHistory
          onClose={() => setShowHistory(false)}
          playerName={gameState?.players.find(p => p.id === playerId)?.name}
        />
      )}

      {/* Game Settings Modal */}
      <GameSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        difficulty={gameState?.difficulty || 'normal'}
        onChangeDifficulty={(newDifficulty) => {
          // TODO: Implement difficulty change for online game
          console.log('Difficulty change requested:', newDifficulty);
          setShowSettings(false);
        }}
      />

      {/* Title - Hidden on small screens to save space */}
      <div className="hidden md:fixed md:top-2 md:left-1/2 md:transform md:-translate-x-1/2 z-10">
        <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-2 glass px-6 py-2 rounded-lg shadow-2xl border-2 border-yellow-400 border-opacity-30">
          <Rocket className="w-8 h-8 text-yellow-300 animate-float" />
          <span className="text-yellow-300">
            Space Race to 100!
          </span>
        </h1>
      </div>

      {/* Waiting for Players Message */}
      {gameState.players.length < 2 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
          <div className="glass rounded-lg px-4 py-2 border-2 border-gray-700 border-opacity-30">
            <p className="text-white text-sm font-medium">Waiting for players...</p>
          </div>
        </div>
      )}

      {/* Game Controls - responsive with safe bottom spacing */}
      <div
        className="fixed left-1/2 transform -translate-x-1/2 z-10 w-[min(240px,calc(100%-1rem))] md:w-80"
        style={{
          bottom: windowWidth < 640 ? '8px' : '16px', // Safe area for mobile
          paddingBottom: 'env(safe-area-inset-bottom, 0px)' // iOS safe area
        }}
      >
        <GameControls
          diceValue={gameState.diceValue}
          message={gameState.message}
          onReset={handleResetGame}
          numPlayers={gameState.players.length}
          isOnline={true}
        />
      </div>

      {/* Player Panels - Fixed in screen corners with safe spacing */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 25 }}>
        {/* Top panels - Adjusted spacing for mobile to avoid overlap */}
        <div className="absolute top-12 sm:top-14 md:top-16 left-0 right-0 px-1 sm:px-2 md:px-3 flex justify-between gap-1 sm:gap-2">
          {/* Player 2: Top-Left */}
          {gameState.players[1] && (
            <div className="pointer-events-auto">
              {windowWidth >= 1024 ? (
                <PlayerPanel
                  player={gameState.players[1]}
                  isCurrentPlayer={gameState.currentPlayerIndex === 1}
                  onRollDice={gameState.currentPlayerIndex === 1 && gameState.players[1].id === playerId ? handleRollDice : null}
                  isRolling={gameState.isRolling}
                  gameWon={gameState.gameWon}
                  isOnline={true}
                  isMyPlayer={gameState.players[1].id === playerId}
                  animatingPlayer={animatingPlayer}
                  animationType={animationType}
                />
              ) : (
                <CompactPlayerPanel
                  player={gameState.players[1]}
                  isCurrentPlayer={gameState.currentPlayerIndex === 1}
                  isMyPlayer={gameState.players[1].id === playerId}
                />
              )}
            </div>
          )}

          {/* Player 1: Top-Right */}
          {gameState.players[0] && (
            <div className="pointer-events-auto ml-auto">
              {windowWidth >= 1024 ? (
                <PlayerPanel
                  player={gameState.players[0]}
                  isCurrentPlayer={gameState.currentPlayerIndex === 0}
                  onRollDice={gameState.currentPlayerIndex === 0 && gameState.players[0].id === playerId ? handleRollDice : null}
                  isRolling={gameState.isRolling}
                  gameWon={gameState.gameWon}
                  isOnline={true}
                  isMyPlayer={gameState.players[0].id === playerId}
                  animatingPlayer={animatingPlayer}
                  animationType={animationType}
                />
              ) : (
                <CompactPlayerPanel
                  player={gameState.players[0]}
                  isCurrentPlayer={gameState.currentPlayerIndex === 0}
                  isMyPlayer={gameState.players[0].id === playerId}
                />
              )}
            </div>
          )}
        </div>

        {/* Bottom panels - Increased spacing to avoid dice controls */}
        <div className="absolute left-0 right-0 px-2 flex justify-between gap-2" style={{
          bottom: windowWidth < 640 ? '100px' : windowWidth < 768 ? '120px' : '160px'
        }}>
          {/* Player 3: Bottom-Left */}
          {gameState.players[2] && (
            <div className="pointer-events-auto">
              {windowWidth >= 1024 ? (
                <PlayerPanel
                  player={gameState.players[2]}
                  isCurrentPlayer={gameState.currentPlayerIndex === 2}
                  onRollDice={gameState.currentPlayerIndex === 2 && gameState.players[2].id === playerId ? handleRollDice : null}
                  isRolling={gameState.isRolling}
                  gameWon={gameState.gameWon}
                  isOnline={true}
                  isMyPlayer={gameState.players[2].id === playerId}
                  animatingPlayer={animatingPlayer}
                  animationType={animationType}
                />
              ) : (
                <CompactPlayerPanel
                  player={gameState.players[2]}
                  isCurrentPlayer={gameState.currentPlayerIndex === 2}
                  isMyPlayer={gameState.players[2].id === playerId}
                />
              )}
            </div>
          )}

          {/* Player 4: Bottom-Right */}
          {gameState.players[3] && (
            <div className="pointer-events-auto ml-auto">
              {windowWidth >= 1024 ? (
                <PlayerPanel
                  player={gameState.players[3]}
                  isCurrentPlayer={gameState.currentPlayerIndex === 3}
                  onRollDice={gameState.currentPlayerIndex === 3 && gameState.players[3].id === playerId ? handleRollDice : null}
                  isRolling={gameState.isRolling}
                  gameWon={gameState.gameWon}
                  isOnline={true}
                  isMyPlayer={gameState.players[3].id === playerId}
                  animatingPlayer={animatingPlayer}
                  animationType={animationType}
                />
              ) : (
                <CompactPlayerPanel
                  player={gameState.players[3]}
                  isCurrentPlayer={gameState.currentPlayerIndex === 3}
                  isMyPlayer={gameState.players[3].id === playerId}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Game Board Container - responsive with safe spacing for controls */}
      <div
        className="fixed left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          top: '50%',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          maxWidth: '800px',
          width: windowWidth < 640 ? 'min(85vw, 600px)' : 'min(90vw, 600px)',
          // Account for dice controls at bottom (approx 140px) + top panels (approx 100px) + padding
          // Increased safety margins to prevent overlap on Fold/Tablet devices
          // Using dvh (dynamic viewport height) to account for mobile browser bars
          maxHeight: windowWidth < 640
            ? 'calc(100dvh - 340px)' // Mobile: controls + panels + padding (increased safety)
            : 'calc(100dvh - 380px)' // Desktop/Tablet: controls + larger panels + padding
        }}
      >
        {/* Board Content */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
          {/* Starting Area - Outside the square board */}
          {gameState.players.filter(p => p.position === 0).length > 0 && (
            <div
              className="w-[min(70vw,400px)] md:w-[min(50vw,450px)] lg:w-[min(55vw,500px)] xl:w-[min(60vw,550px)] starting-spaceport"
              style={{
                minHeight: '45px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.2), inset 0 0 15px rgba(0, 0, 0, 0.4)',
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '3px',
                left: '8px',
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 'bold'
              }}>
                🚀 Starting Spaceport
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: '12px' }}>
                {gameState.players.filter(p => p.position === 0).map(player => {
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
                      <Rocket
                        className={`${player.color} ${animationClass} target-player-rocket`}
                        data-player-id={player.id}
                        style={{
                          width: '20px',
                          height: '20px',
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 8px currentColor)',
                          animation: animationClass ? undefined : 'float 2s ease-in-out infinite'
                        }}
                      />
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>
                        {player.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Game Board - always square, respects container constraints */}
          <div
            className="w-[min(75vw,600px)] h-[min(75vw,600px)] md:w-[min(60vw,600px)] md:h-[min(60vw,600px)] lg:w-[min(70vw,600px)] lg:h-[min(70vw,600px)] xl:w-[min(90vw,600px)] xl:h-[min(90vw,600px)] 2xl:w-[min(70vw,600px)] 2xl:h-[min(70vw,600px)]"
            style={{
              maxWidth: '600px',
              maxHeight: '600px',
              // Ensure board doesn't exceed container height
              height: 'min(100%, 600px)',
              width: 'min(100%, 600px)'
            }}
          >
            <GameBoard
              players={gameState.players}
              animatingPlayer={animatingPlayer}
              animationType={animationType}
              alienBlink={alienBlink}
              animatedPositions={animatedPositions}
              encounterType={encounterType}
            />
          </div>
        </div>
      </div>

      {/* End Game Animation */}
      {gameState.gameWon && gameState.winner && (
        <EndGameAnimation
          type={'victory'} // Online game assumes human victory usually, or we can detect winner ID
          winner={gameState.winner}
          players={gameState.players}
          onComplete={handleResetGame}
        />
      )}
    </div>
  );
}
