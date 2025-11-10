import { useState, useEffect } from 'react';
import { database } from '../lib/firebase';
import { ref, set, onValue, query, orderByChild, limitToLast, get, push } from 'firebase/database';

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
            // Sort by wins (desc), then by win rate, then by games played
            if (b.wins !== a.wins) return b.wins - a.wins;
            const aRate = a.gamesPlayed > 0 ? a.wins / a.gamesPlayed : 0;
            const bRate = b.gamesPlayed > 0 ? b.wins / b.gamesPlayed : 0;
            if (bRate !== aRate) return bRate - aRate;
            return b.gamesPlayed - a.gamesPlayed;
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
    const leaderboardRef = ref(database, 'leaderboard');
    const playerKey = playerName.toLowerCase().replace(/\s+/g, '_');
    const playerRef = ref(database, `leaderboard/${playerKey}`);

    try {
      const snapshot = await get(playerRef);
      const currentData = snapshot.val() || {
        name: playerName,
        wins: 0,
        gamesPlayed: 0,
        totalGames: 0,
        lastWin: null,
        bestTime: null
      };

      const updatedData = {
        ...currentData,
        name: playerName,
        wins: currentData.wins + 1,
        gamesPlayed: currentData.gamesPlayed + 1,
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
    const playerKey = playerName.toLowerCase().replace(/\s+/g, '_');
    const playerRef = ref(database, `leaderboard/${playerKey}`);

    try {
      const snapshot = await get(playerRef);
      const currentData = snapshot.val() || {
        name: playerName,
        wins: 0,
        gamesPlayed: 0,
        totalGames: 0
      };

      const updatedData = {
        ...currentData,
        name: playerName,
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

