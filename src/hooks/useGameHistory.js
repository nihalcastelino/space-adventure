import { useState, useEffect } from 'react';
import { database } from '../lib/firebase';
import { ref, set, onValue, query, orderByChild, limitToLast, get, push } from 'firebase/database';

const HISTORY_RETENTION_DAYS = 7;
const HISTORY_RETENTION_MS = HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function useGameHistory() {
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Clean up old games
  const cleanupOldGames = async () => {
    const historyRef = ref(database, 'gameHistory');
    const cutoffTime = Date.now() - HISTORY_RETENTION_MS;

    try {
      const snapshot = await get(historyRef);
      if (snapshot.exists()) {
        const games = snapshot.val();
        const updates = {};

        Object.entries(games).forEach(([gameId, game]) => {
          if (game.completedAt && game.completedAt < cutoffTime) {
            updates[gameId] = null; // Mark for deletion
          }
        });

        // Delete old games
        if (Object.keys(updates).length > 0) {
          await Promise.all(
            Object.keys(updates).map(gameId => {
              const gameRef = ref(database, `gameHistory/${gameId}`);
              return set(gameRef, null);
            })
          );
        }
      }
    } catch (error) {
      console.error('Error cleaning up old games:', error);
    }
  };

  // Load game history
  useEffect(() => {
    cleanupOldGames();
    
    const historyRef = query(
      ref(database, 'gameHistory'),
      orderByChild('completedAt'),
      limitToLast(100)
    );

    onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const games = Object.entries(data)
          .map(([id, game]) => ({ id, ...game }))
          .filter(game => {
            // Filter out games older than retention period
            if (!game.completedAt) return false;
            return game.completedAt > (Date.now() - HISTORY_RETENTION_MS);
          })
          .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
        setGameHistory(games);
      } else {
        setGameHistory([]);
      }
      setLoading(false);
    });

    // Cleanup old games periodically
    const cleanupInterval = setInterval(cleanupOldGames, 60 * 60 * 1000); // Every hour

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Save completed game to history
  const saveGameHistory = async (gameData) => {
    const {
      gameId,
      players,
      winner,
      startedAt,
      completedAt,
      totalMoves,
      gameMode
    } = gameData;

    if (!gameId || !winner) return false;

    const gameDuration = completedAt - startedAt;
    const historyRef = ref(database, `gameHistory/${gameId}`);

    try {
      await set(historyRef, {
        gameId,
        players: players.map(p => ({
          name: p.name,
          position: p.position,
          color: p.color
        })),
        winner: {
          name: winner.name,
          color: winner.color
        },
        startedAt,
        completedAt,
        gameDuration,
        totalMoves,
        gameMode: gameMode || 'online',
        createdAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error saving game history:', error);
      return false;
    }
  };

  // Get game history for a specific player
  const getPlayerHistory = (playerName) => {
    return gameHistory.filter(game => 
      game.players.some(p => p.name === playerName)
    );
  };

  return {
    gameHistory,
    loading,
    saveGameHistory,
    getPlayerHistory
  };
}

