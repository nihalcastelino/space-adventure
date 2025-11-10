import { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, set, get, update, onValue, push, query, orderByChild, limitToFirst } from 'firebase/database';

// Tournament types
export const TOURNAMENT_TYPES = {
  DAILY: {
    id: 'daily',
    name: 'Daily Challenge',
    duration: 24 * 60 * 60 * 1000, // 24 hours
    entryFee: 0,
    prizes: [
      { place: 1, coins: 500, powerUps: 3, xp: 200 },
      { place: 2, coins: 300, powerUps: 2, xp: 150 },
      { place: 3, coins: 200, powerUps: 1, xp: 100 }
    ],
    icon: '🏅'
  },
  WEEKLY: {
    id: 'weekly',
    name: 'Weekly Championship',
    duration: 7 * 24 * 60 * 60 * 1000, // 7 days
    entryFee: 50,
    prizes: [
      { place: 1, coins: 2000, powerUps: 10, xp: 1000, cosmetic: 'golden' },
      { place: 2, coins: 1000, powerUps: 5, xp: 500 },
      { place: 3, coins: 500, powerUps: 3, xp: 250 }
    ],
    icon: '🏆'
  },
  SPECIAL: {
    id: 'special',
    name: 'Special Event',
    duration: 3 * 24 * 60 * 60 * 1000, // 3 days
    entryFee: 100,
    prizes: [
      { place: 1, coins: 5000, powerUps: 20, xp: 2000, cosmetic: 'rainbow' },
      { place: 2, coins: 2500, powerUps: 10, xp: 1000 },
      { place: 3, coins: 1000, powerUps: 5, xp: 500 }
    ],
    icon: '💎'
  }
};

export function useTournaments(playerId, playerName) {
  const [activeTournaments, setActiveTournaments] = useState([]);
  const [playerScores, setPlayerScores] = useState({});
  const [leaderboards, setLeaderboards] = useState({});
  const db = getDatabase();

  // Listen to active tournaments
  useEffect(() => {
    if (!db) return;

    const tournamentsRef = ref(db, 'tournaments');
    const unsubscribe = onValue(tournamentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const tournaments = [];
        const data = snapshot.val();

        for (const tournamentId in data) {
          const tournament = data[tournamentId];
          const now = Date.now();
          const endTime = tournament.startTime + tournament.duration;

          // Only show active tournaments
          if (now < endTime) {
            tournaments.push({
              id: tournamentId,
              ...tournament
            });
          }
        }

        setActiveTournaments(tournaments);
      } else {
        setActiveTournaments([]);
      }
    });

    return () => unsubscribe();
  }, [db]);

  // Listen to player's scores
  useEffect(() => {
    if (!playerId || !db) return;

    const scoresRef = ref(db, `tournamentScores/${playerId}`);
    const unsubscribe = onValue(scoresRef, (snapshot) => {
      if (snapshot.exists()) {
        setPlayerScores(snapshot.val());
      } else {
        setPlayerScores({});
      }
    });

    return () => unsubscribe();
  }, [playerId, db]);

  // Create tournament (admin function)
  const createTournament = useCallback(async (type) => {
    if (!db) return { success: false, error: 'Database not initialized' };

    const tournamentType = TOURNAMENT_TYPES[type.toUpperCase()];
    if (!tournamentType) {
      return { success: false, error: 'Invalid tournament type' };
    }

    const tournamentRef = push(ref(db, 'tournaments'));
    const tournamentId = tournamentRef.key;

    await set(tournamentRef, {
      type: tournamentType.id,
      name: tournamentType.name,
      startTime: Date.now(),
      duration: tournamentType.duration,
      entryFee: tournamentType.entryFee,
      prizes: tournamentType.prizes,
      participants: 0
    });

    return { success: true, tournamentId };
  }, [db]);

  // Join tournament
  const joinTournament = useCallback(async (tournamentId, coins) => {
    if (!playerId || !playerName) {
      return { success: false, error: 'Player not logged in' };
    }

    // Get tournament data
    const tournamentSnapshot = await get(ref(db, `tournaments/${tournamentId}`));
    if (!tournamentSnapshot.exists()) {
      return { success: false, error: 'Tournament not found' };
    }

    const tournament = tournamentSnapshot.val();

    // Check entry fee
    if (tournament.entryFee > 0 && coins < tournament.entryFee) {
      return { success: false, error: 'Not enough coins' };
    }

    // Check if already joined
    const scoreSnapshot = await get(ref(db, `tournamentScores/${playerId}/${tournamentId}`));
    if (scoreSnapshot.exists()) {
      return { success: false, error: 'Already joined this tournament' };
    }

    // Join tournament
    await set(ref(db, `tournamentScores/${playerId}/${tournamentId}`), {
      playerName,
      score: 0,
      games: 0,
      bestTime: Infinity,
      joinedAt: Date.now()
    });

    // Increment participants
    await update(ref(db, `tournaments/${tournamentId}`), {
      participants: (tournament.participants || 0) + 1
    });

    return {
      success: true,
      entryFee: tournament.entryFee
    };
  }, [playerId, playerName, db]);

  // Submit score to tournament
  const submitScore = useCallback(async (tournamentId, gameScore) => {
    if (!playerId) {
      return { success: false, error: 'Player not logged in' };
    }

    // Check if joined
    const scoreSnapshot = await get(ref(db, `tournamentScores/${playerId}/${tournamentId}`));
    if (!scoreSnapshot.exists()) {
      return { success: false, error: 'Not joined in this tournament' };
    }

    const currentData = scoreSnapshot.val();
    const newScore = currentData.score + gameScore.score;
    const newGames = currentData.games + 1;
    const newBestTime = Math.min(currentData.bestTime, gameScore.time || Infinity);

    // Update score
    await update(ref(db, `tournamentScores/${playerId}/${tournamentId}`), {
      score: newScore,
      games: newGames,
      bestTime: newBestTime,
      lastPlayed: Date.now()
    });

    return { success: true, newScore };
  }, [playerId, db]);

  // Get leaderboard for a tournament
  const getLeaderboard = useCallback(async (tournamentId, limit = 100) => {
    const leaderboardRef = query(
      ref(db, 'tournamentScores'),
      orderByChild(`${tournamentId}/score`),
      limitToFirst(limit)
    );

    const snapshot = await get(leaderboardRef);
    if (!snapshot.exists()) {
      return { success: true, leaderboard: [] };
    }

    const data = snapshot.val();
    const leaderboard = [];

    for (const pid in data) {
      if (data[pid][tournamentId]) {
        leaderboard.push({
          playerId: pid,
          ...data[pid][tournamentId]
        });
      }
    }

    // Sort by score descending, then by best time ascending
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.bestTime - b.bestTime;
    });

    return { success: true, leaderboard };
  }, [db]);

  // Get player rank in tournament
  const getPlayerRank = useCallback(async (tournamentId) => {
    const result = await getLeaderboard(tournamentId);
    if (!result.success) return null;

    const rank = result.leaderboard.findIndex(entry => entry.playerId === playerId);
    return rank >= 0 ? rank + 1 : null;
  }, [playerId, getLeaderboard]);

  // Check if tournament has ended
  const hasTournamentEnded = useCallback((tournament) => {
    const endTime = tournament.startTime + tournament.duration;
    return Date.now() >= endTime;
  }, []);

  // Get time remaining in tournament
  const getTimeRemaining = useCallback((tournament) => {
    const endTime = tournament.startTime + tournament.duration;
    const remaining = Math.max(0, endTime - Date.now());

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    return { days, hours, minutes, total: remaining };
  }, []);

  return {
    activeTournaments,
    playerScores,
    leaderboards,
    createTournament,
    joinTournament,
    submitScore,
    getLeaderboard,
    getPlayerRank,
    hasTournamentEnded,
    getTimeRemaining
  };
}
