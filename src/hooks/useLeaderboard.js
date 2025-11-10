import { useState, useEffect } from 'react';
import { database } from '../lib/firebase';
import { ref, set, onValue, query, orderByChild, limitToLast, get, push } from 'firebase/database';
import { sanitizePlayerName } from '../utils/sanitize';

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load leaderboard
  useEffect(() => {
    const leaderboardRef = ref(database, 'leaderboard');
    
    onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data)
          .map(([id, entry]) => ({ id, ...entry }))
          .sort((a, b) => {
            // Sort by wins (desc), then by win rate, then by total games
            if (b.wins !== a.wins) return b.wins - a.wins;
            const aRate = a.totalGames > 0 ? a.wins / a.totalGames : 0;
            const bRate = b.totalGames > 0 ? b.wins / b.totalGames : 0;
            if (bRate !== aRate) return bRate - aRate;
            return b.totalGames - a.totalGames;
          });
        setLeaderboard(entries);
      } else {
        setLeaderboard([]);
      }
      setLoading(false);
    });

    return () => {
      // Cleanup handled by Firebase
    };
  }, []);

  // Record a win
  const recordWin = async (playerName, gameId, gameDuration) => {
    const sanitizedName = sanitizePlayerName(playerName);
    const playerKey = sanitizedName.toLowerCase().replace(/\s+/g, '_');
    const playerRef = ref(database, `leaderboard/${playerKey}`);

    try {
      const snapshot = await get(playerRef);
      const currentData = snapshot.val() || {
        name: sanitizedName,
        wins: 0,
        totalGames: 0,
        lastWin: null,
        bestTime: null
      };

      const updatedData = {
        ...currentData,
        name: sanitizedName,
        wins: currentData.wins + 1,
        totalGames: currentData.totalGames + 1,
        lastWin: Date.now(),
        bestTime: currentData.bestTime
          ? Math.min(currentData.bestTime, gameDuration)
          : gameDuration
      };

      await set(playerRef, updatedData);
      return true;
    } catch (error) {
      console.error('Error recording win:', error);
      return false;
    }
  };

  // Record a game (for players who didn't win)
  const recordGame = async (playerName) => {
    const sanitizedName = sanitizePlayerName(playerName);
    const playerKey = sanitizedName.toLowerCase().replace(/\s+/g, '_');
    const playerRef = ref(database, `leaderboard/${playerKey}`);

    try {
      const snapshot = await get(playerRef);
      const currentData = snapshot.val() || {
        name: sanitizedName,
        wins: 0,
        totalGames: 0
      };

      const updatedData = {
        ...currentData,
        name: sanitizedName,
        totalGames: currentData.totalGames + 1
      };

      await set(playerRef, updatedData);
      return true;
    } catch (error) {
      console.error('Error recording game:', error);
      return false;
    }
  };

  // Get player stats
  const getPlayerStats = async (playerName) => {
    const playerKey = playerName.toLowerCase().replace(/\s+/g, '_');
    const playerRef = ref(database, `leaderboard/${playerKey}`);

    try {
      const snapshot = await get(playerRef);
      return snapshot.val() || null;
    } catch (error) {
      console.error('Error getting player stats:', error);
      return null;
    }
  };

  return {
    leaderboard,
    loading,
    recordWin,
    recordGame,
    getPlayerStats
  };
}

