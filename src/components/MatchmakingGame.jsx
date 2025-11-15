import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, Zap, Shield, X, LogIn } from 'lucide-react';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { useFirebaseGame } from '../hooks/useFirebaseGame';
import { useGameSounds } from '../hooks/useGameSounds';
import { usePremium } from '../hooks/usePremium';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';
import GameBoard from './GameBoard';
import PlayerPanel from './PlayerPanel';
import CompactPlayerPanel from './CompactPlayerPanel';
import GameControls from './GameControls';
import ParticleEffects from './ParticleEffects';
import { getBackgroundImage } from '../utils/backgrounds';

export default function MatchmakingGame({ onBack, difficulty = 'normal', variant = 'classic' }) {
  const { playSound } = useGameSounds();
  const premium = usePremium();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [gameMode, setGameMode] = useState('quick'); // 'quick' or 'ranked'
  const [userProfile, setUserProfile] = useState(null);
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const {
    isQueued,
    queueStatus,
    matchFound,
    matchedGameId,
    estimatedWaitTime,
    joinQueue,
    leaveQueue,
    checkForMatch
  } = useMatchmaking();

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
    handleRollDice,
    handleResetGame,
    handlePauseGame,
    handleResumeGame,
    joinGame
  } = useFirebaseGame();

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('space_adventure_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    loadProfile();
  }, []);

  // Check for existing match on mount and join the game
  useEffect(() => {
    if (matchFound && matchedGameId && isAuthenticated && !gameState) {
      // Join the matched game using Firebase
      const joinMatchedGame = async () => {
        try {
          // Get user profile for player name
          if (!supabase || !joinGame) return;
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('space_adventure_profiles')
              .select('username, display_name')
              .eq('id', user.id)
              .single();
            
            const playerName = profile?.username || profile?.display_name || 'Player';
            // Join the matched game
            await joinGame(matchedGameId, playerName);
            setShowModeSelection(false);
          }
        } catch (error) {
          console.error('Error joining matched game:', error);
        }
      };
      joinMatchedGame();
    }
  }, [matchFound, matchedGameId, isAuthenticated, gameState, joinGame]);

  // Format wait time
  const formatWaitTime = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Handle joining queue
  const handleJoinQueue = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (gameMode === 'ranked' && !premium.isPremium) {
      alert('Ranked mode requires Premium subscription!');
      return;
    }

    const result = await joinQueue({
      gameMode,
      variant,
      difficulty
    });

    if (result.success) {
      setShowModeSelection(false);
      playSound('spaceport');
    } else {
      if (result.error === 'Not authenticated') {
        setShowAuthModal(true);
      } else {
        alert(result.error || 'Failed to join queue');
      }
    }
  };

  // Handle leaving queue
  const handleLeaveQueue = async () => {
    await leaveQueue();
    setShowModeSelection(true);
  };

  // If match found, show game
  if (matchFound && matchedGameId && gameState) {
    return (
      <div
        className="fixed inset-0 flex flex-col"
        style={{
          backgroundImage: `url(/${getBackgroundImage('online', difficulty)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#000'
        }}
      >
        {/* Game UI - same as OnlineGame */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Panel - Players */}
          <div className="w-full md:w-64 lg:w-80 bg-gray-900 bg-opacity-90 border-r border-gray-700 p-2 md:p-4 overflow-y-auto">
            {gameState.players.map((player, index) => (
              <div key={player.id} className="mb-2 md:mb-4">
                <PlayerPanel
                  player={player}
                  isCurrentPlayer={index === gameState.currentPlayerIndex}
                  isWinner={gameState.gameWon && gameState.winner?.id === player.id}
                  onRollDice={index === gameState.currentPlayerIndex && player.id === playerId ? handleRollDice : null}
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

          {/* Center - Game Board */}
          <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden">
            <GameBoard
              boardSize={gameState.boardSize || 100}
              players={gameState.players}
              currentPlayerIndex={gameState.currentPlayerIndex}
              aliens={gameState.aliens || []}
              checkpoints={gameState.checkpoints || []}
              spaceports={gameState.spaceports || {}}
              animatingPlayer={animatingPlayer}
              animationType={animationType}
              alienBlink={alienBlink}
              diceRolling={diceRolling}
              animatedPositions={animatedPositions}
              encounterType={encounterType}
              hazards={gameState.hazards}
              rogueState={gameState.rogueState}
            />
          </div>

          {/* Right Panel - Controls */}
          <div className="w-full md:w-64 lg:w-80 bg-gray-900 bg-opacity-90 border-l border-gray-700 p-2 md:p-4 overflow-y-auto">
            <GameControls
              diceValue={gameState.diceValue}
              message={gameState.message}
              onReset={handleResetGame}
              numPlayers={gameState.players.length}
              isOnline={true}
            />
          </div>
        </div>

        <ParticleEffects />
      </div>
    );
  }

  // Show mode selection or queue status
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(/${getBackgroundImage('online', difficulty)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000'
      }}
    >
      <div className="bg-gray-900 bg-opacity-95 rounded-lg p-6 md:p-8 max-w-md w-full border-2 border-yellow-500 shadow-2xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {showModeSelection && !isQueued ? (
          // Mode Selection
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-6 text-center">
              Find a Match
            </h2>

            {/* User Stats */}
            {userProfile && (
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Your Stats</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold">{userProfile.username || userProfile.display_name || 'Player'}</div>
                    <div className="text-xs text-gray-400">Level {userProfile.level || 1}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-300 font-bold">{userProfile.mmr || 1000} MMR</div>
                    <div className="text-xs text-gray-400 capitalize">{userProfile.rank || 'bronze'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Game Mode Selection */}
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setGameMode('quick')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  gameMode === 'quick'
                    ? 'border-yellow-500 bg-yellow-500 bg-opacity-20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-300" />
                    <div className="text-left">
                      <div className="text-white font-semibold">Quick Match</div>
                      <div className="text-sm text-gray-400">Casual gameplay</div>
                    </div>
                  </div>
                  {gameMode === 'quick' && (
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setGameMode('ranked')}
                disabled={!premium.isPremium}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  gameMode === 'ranked'
                    ? 'border-yellow-500 bg-yellow-500 bg-opacity-20'
                    : 'border-gray-700 hover:border-gray-600'
                } ${!premium.isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-yellow-300" />
                    <div className="text-left">
                      <div className="text-white font-semibold flex items-center gap-2">
                        Ranked Match
                        {!premium.isPremium && (
                          <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">Premium</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">Competitive ladder</div>
                    </div>
                  </div>
                  {gameMode === 'ranked' && (
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  )}
                </div>
              </button>
            </div>

            {/* Start Matchmaking Button */}
            <button
              onClick={handleJoinQueue}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95"
            >
              Find Match
            </button>
          </>
        ) : isQueued ? (
          // Queue Status
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-6 text-center">
              Searching for Match...
            </h2>

            <div className="text-center mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
              <div className="text-white text-lg mb-2">Finding opponents...</div>
              {estimatedWaitTime !== null && (
                <div className="text-gray-400 text-sm">
                  Wait time: {formatWaitTime(estimatedWaitTime)}
                </div>
              )}
            </div>

            {/* Queue Info */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Mode:</span>
                <span className="text-white font-semibold capitalize">{gameMode}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Variant:</span>
                <span className="text-white font-semibold capitalize">{variant}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Difficulty:</span>
                <span className="text-white font-semibold capitalize">{difficulty}</span>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleLeaveQueue}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel Search
            </button>
          </>
        ) : null}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      </div>
    </div>
  );
}

