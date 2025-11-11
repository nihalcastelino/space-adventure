import { useState, useCallback } from 'react';

/**
 * Game Modes Hook
 * 
 * Manages different game mode variants:
 * - Classic: Standard gameplay
 * - Speed: Faster turns, time limits
 * - Tournament: Best of 3/5 games
 * - Survival: Last player standing
 */
export const GAME_MODES = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Standard gameplay, no time limits',
    icon: '🎮',
    timeLimit: null,
    turnTimeLimit: null,
    requiresPremium: false
  },
  speed: {
    id: 'speed',
    name: 'Speed Mode',
    description: 'Fast-paced! 10 second turn limit',
    icon: '⚡',
    timeLimit: null,
    turnTimeLimit: 10, // seconds per turn
    requiresPremium: true,
    coinMultiplier: 1.5,
    xpMultiplier: 1.5
  },
  tournament: {
    id: 'tournament',
    name: 'Tournament',
    description: 'Best of 3 games, winner takes all!',
    icon: '🏆',
    timeLimit: null,
    turnTimeLimit: null,
    requiresPremium: true,
    bestOf: 3,
    coinMultiplier: 2.0,
    xpMultiplier: 2.0
  },
  survival: {
    id: 'survival',
    name: 'Survival',
    description: 'Last player standing wins!',
    icon: '💀',
    timeLimit: null,
    turnTimeLimit: null,
    requiresPremium: true,
    eliminationMode: true,
    coinMultiplier: 2.5,
    xpMultiplier: 2.5
  }
};

export function useGameModes(initialMode = 'classic') {
  const [gameMode, setGameMode] = useState(initialMode);
  const [tournamentScore, setTournamentScore] = useState({ player1: 0, player2: 0 });
  const [survivalPlayers, setSurvivalPlayers] = useState([]);

  const getCurrentMode = useCallback(() => {
    return GAME_MODES[gameMode] || GAME_MODES.classic;
  }, [gameMode]);

  const changeMode = useCallback((modeId) => {
    if (GAME_MODES[modeId]) {
      setGameMode(modeId);
      // Reset mode-specific state
      if (modeId === 'tournament') {
        setTournamentScore({ player1: 0, player2: 0 });
      } else if (modeId === 'survival') {
        setSurvivalPlayers([]);
      }
    }
  }, []);

  // Speed mode: Check if turn time exceeded
  const checkTurnTimeLimit = useCallback((turnStartTime) => {
    const mode = getCurrentMode();
    if (mode.turnTimeLimit) {
      const elapsed = (Date.now() - turnStartTime) / 1000;
      return elapsed >= mode.turnTimeLimit;
    }
    return false;
  }, [getCurrentMode]);

  // Tournament mode: Record game result
  const recordTournamentGame = useCallback((winnerId) => {
    if (gameMode !== 'tournament') return;

    const mode = getCurrentMode();
    const targetWins = Math.ceil(mode.bestOf / 2);

    setTournamentScore(prev => {
      const newScore = {
        ...prev,
        [winnerId === 1 ? 'player1' : 'player2']: prev[winnerId === 1 ? 'player1' : 'player2'] + 1
      };

      // Check if tournament is complete
      if (newScore.player1 >= targetWins || newScore.player2 >= targetWins) {
        // Tournament complete
        return { player1: 0, player2: 0 }; // Reset for next tournament
      }

      return newScore;
    });
  }, [gameMode, getCurrentMode]);

  // Survival mode: Eliminate player
  const eliminatePlayer = useCallback((playerId) => {
    if (gameMode !== 'survival') return;

    setSurvivalPlayers(prev => [...prev, playerId]);
  }, [gameMode]);

  // Get remaining players in survival mode
  const getRemainingPlayers = useCallback((allPlayers) => {
    if (gameMode !== 'survival') return allPlayers;
    return allPlayers.filter(p => !survivalPlayers.includes(p.id));
  }, [gameMode, survivalPlayers]);

  // Get coin multiplier for current mode
  const getCoinMultiplier = useCallback(() => {
    const mode = getCurrentMode();
    return mode.coinMultiplier || 1.0;
  }, [getCurrentMode]);

  // Get XP multiplier for current mode
  const getXPMultiplier = useCallback(() => {
    const mode = getCurrentMode();
    return mode.xpMultiplier || 1.0;
  }, [getCurrentMode]);

  return {
    gameMode,
    currentMode: getCurrentMode(),
    changeMode,
    checkTurnTimeLimit,
    recordTournamentGame,
    eliminatePlayer,
    getRemainingPlayers,
    tournamentScore,
    survivalPlayers,
    getCoinMultiplier,
    getXPMultiplier
  };
}

