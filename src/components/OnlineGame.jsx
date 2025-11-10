import { useState } from 'react';
import { Rocket, Wifi, WifiOff, ArrowLeft, Copy, Check, Trophy, History, Pause, Play } from 'lucide-react';
import { useFirebaseGame } from '../hooks/useFirebaseGame';
import GameBoard from './GameBoard';
import PlayerPanel from './PlayerPanel';
import GameControls from './GameControls';
import ParticleEffects from './ParticleEffects';
import Leaderboard from './Leaderboard';
import GameHistory from './GameHistory';
import { useGameSounds } from '../hooks/useGameSounds';

export default function OnlineGame({ onBack }) {
  const { playSound } = useGameSounds();
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const {
    gameState,
    gameId,
    playerId,
    connected,
    animatingPlayer,
    animationType,
    alienBlink,
    diceRolling,
    createGame,
    joinGame,
    handleRollDice,
    handleResetGame,
    handlePauseGame,
    handleResumeGame
  } = useFirebaseGame();
  
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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

  const copyGameId = () => {
    if (gameId) {
      playSound('click');
      navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!connected && !showNameInput && !showRoomInput) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          backgroundImage: 'url(/space-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#000'
        }}
      >
        <div className="text-center space-y-4">
          <WifiOff className="w-16 h-16 text-red-400 mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Connecting...</h2>
          <button
            onClick={onBack}
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
          backgroundImage: 'url(/space-bg.jpg)',
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
              if (e.key === 'Enter' && playerName.trim()) {
                setShowRoomInput(true);
                setError(null);
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (playerName.trim()) {
                  setShowRoomInput(true);
                  setError(null);
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
            >
              Continue
            </button>
            <button
              onClick={onBack}
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
          backgroundImage: 'url(/space-bg.jpg)',
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

      {/* Connection status */}
      <div className={`fixed top-2 right-2 z-50 flex items-center gap-2 glass rounded-lg px-3 py-2 border-2 ${
        connected ? 'border-green-400 border-opacity-50' : 'border-red-400 border-opacity-50'
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

      {/* Back button */}
      <button
        onClick={() => {
          playSound('click');
          onBack();
        }}
        className="fixed top-2 left-2 z-50 glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-110 active:scale-95"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Room code display */}
      {gameId && (
        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 glass rounded-lg px-4 py-2 flex items-center gap-2 border-2 border-yellow-400 border-opacity-30">
          <span className="text-xs text-gray-400">Room:</span>
          <code className="text-sm text-yellow-300 font-mono font-bold">{gameId}</code>
          <button
            onClick={copyGameId}
            className="text-white hover:text-blue-400 transition-colors transform hover:scale-110 active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Game controls menu - positioned above GameControls */}
      {connected && gameState && (
        <div className="fixed bottom-24 md:bottom-28 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
          <button
            onClick={() => {
              playSound('click');
              setShowLeaderboard(true);
            }}
            className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-yellow-400 transition-all transform hover:scale-110 active:scale-95"
            title="Leaderboard"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
          </button>
          <button
            onClick={() => {
              playSound('click');
              setShowHistory(true);
            }}
            className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-110 active:scale-95"
            title="Game History"
          >
            <History className="w-5 h-5 text-blue-400" />
          </button>
          {gameState.isPaused ? (
            <button
              onClick={() => {
                playSound('click');
                handleResumeGame();
              }}
              className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-green-400 transition-all transform hover:scale-110 active:scale-95"
              title="Resume Game"
            >
              <Play className="w-5 h-5 text-green-400" />
            </button>
          ) : (
            <button
              onClick={() => {
                playSound('click');
                handlePauseGame();
              }}
              className="glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-orange-400 transition-all transform hover:scale-110 active:scale-95"
              title="Pause Game"
            >
              <Pause className="w-5 h-5 text-orange-400" />
            </button>
          )}
        </div>
      )}

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

      {/* Title */}
      <div className="fixed top-14 md:top-2 left-1/2 transform -translate-x-1/2 z-10">
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

      {/* Player Panels */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {gameState.players.map((player, index) => (
          <div
            key={player.id}
            className={`fixed pointer-events-auto ${
              index === 0 ? 'top-20 md:top-4 left-2 md:left-4' :
              index === 1 ? 'top-20 md:top-4 right-2 md:right-4' :
              index === 2 ? 'bottom-20 md:bottom-4 left-2 md:left-4' :
              'bottom-20 md:bottom-4 right-2 md:right-4'
            }`}
          >
            <PlayerPanel
              player={player}
              isCurrentPlayer={gameState.currentPlayerIndex === index}
              onRollDice={isMyTurn ? handleRollDice : null}
              isRolling={gameState.isRolling}
              gameWon={gameState.gameWon}
              isOnline={true}
              isMyPlayer={player.id === playerId}
              animatingPlayer={animatingPlayer}
              animationType={animationType}
            />
          </div>
        ))}
      </div>

      {/* Game Controls */}
      <div className="fixed bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-[calc(100%-1rem)] md:w-96">
        <GameControls
          diceValue={gameState.diceValue}
          message={gameState.message}
          onReset={handleResetGame}
          numPlayers={gameState.players.length}
          isOnline={true}
        />
      </div>

      {/* Game Board Container */}
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
          maxWidth: '600px',
          maxHeight: '90vh'
        }}
      >
        {/* Starting Area - Outside the square board */}
        {gameState.players.filter(p => p.position === 0).length > 0 && (
          <div
            style={{
              width: 'min(90vw, 600px)',
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
                      className={`${player.color} ${animationClass}`}
                      style={{
                        width: '24px',
                        height: '24px',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 8px currentColor)',
                        animation: animationClass ? undefined : 'float 2s ease-in-out infinite'
                      }}
                    />
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
          style={{
            width: 'min(90vw, 600px)',
            height: 'min(90vw, 600px)',
            maxWidth: '600px',
            maxHeight: '600px'
          }}
        >
          <GameBoard
            players={gameState.players}
            animatingPlayer={animatingPlayer}
            animationType={animationType}
            alienBlink={alienBlink}
          />
        </div>
      </div>
    </div>
  );
}
