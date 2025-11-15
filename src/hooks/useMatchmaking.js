import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { database } from '../lib/firebase';
import { ref, set, push } from 'firebase/database';
import { useGameSounds } from './useGameSounds';

/**
 * Matchmaking Hook for MMO-style game finding
 * Handles queue management, skill-based matching, and game creation
 */
export function useMatchmaking() {
  const { playSound } = useGameSounds();
  const [isQueued, setIsQueued] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [matchFound, setMatchFound] = useState(false);
  const [matchedGameId, setMatchedGameId] = useState(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
  const queueCheckInterval = useRef(null);
  const matchCheckInterval = useRef(null);
  const queueStartTime = useRef(null);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }, []);

  // Get user profile with MMR
  const getUserProfile = useCallback(async (userId) => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('space_adventure_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  }, []);

  // Join matchmaking queue
  const joinQueue = useCallback(async (options = {}) => {
    if (!supabase || !database) {
      console.error('Supabase or Firebase not configured');
      return { success: false, error: 'Services not configured' };
    }

    try {
      const user = await getCurrentUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Check if already in queue
      const { data: existingQueue } = await supabase
        .from('matchmaking_queue')
        .select('*')
        .eq('user_id', user.id)
        .eq('matched', false)
        .single();

      if (existingQueue) {
        return { success: false, error: 'Already in queue' };
      }

      // Get user profile for MMR
      const profile = await getUserProfile(user.id);
      const mmr = profile?.mmr || 1000;

      // Insert into queue
      const { data: queueEntry, error } = await supabase
        .from('matchmaking_queue')
        .insert({
          user_id: user.id,
          game_mode: options.gameMode || 'quick',
          variant: options.variant || 'classic',
          difficulty: options.difficulty || 'normal',
          mmr: mmr,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
        })
        .select()
        .single();

      if (error) {
        console.error('Error joining queue:', error);
        return { success: false, error: error.message };
      }

      setIsQueued(true);
      setQueueStatus('searching');
      queueStartTime.current = Date.now();
      playSound('click');

      // Start checking for matches
      startMatchmakingCheck(queueEntry.id, options);

      return { success: true, queueId: queueEntry.id };
    } catch (error) {
      console.error('Error in joinQueue:', error);
      return { success: false, error: error.message };
    }
  }, [getCurrentUser, getUserProfile, playSound]);

  // Leave matchmaking queue
  const leaveQueue = useCallback(async () => {
    if (!supabase) return { success: false };

    try {
      const user = await getCurrentUser();
      if (!user) return { success: false };

      // Remove from queue
      const { error } = await supabase
        .from('matchmaking_queue')
        .delete()
        .eq('user_id', user.id)
        .eq('matched', false);

      if (error) {
        console.error('Error leaving queue:', error);
        return { success: false, error: error.message };
      }

      // Cleanup intervals
      if (queueCheckInterval.current) {
        clearInterval(queueCheckInterval.current);
        queueCheckInterval.current = null;
      }
      if (matchCheckInterval.current) {
        clearInterval(matchCheckInterval.current);
        matchCheckInterval.current = null;
      }

      setIsQueued(false);
      setQueueStatus(null);
      setEstimatedWaitTime(null);
      playSound('click');

      return { success: true };
    } catch (error) {
      console.error('Error in leaveQueue:', error);
      return { success: false, error: error.message };
    }
  }, [getCurrentUser, playSound]);

  // Find potential matches
  const findMatches = useCallback(async (queueId, options) => {
    if (!supabase) return null;

    try {
      const user = await getCurrentUser();
      if (!user) return null;

      // Get current queue entry
      const { data: queueEntry } = await supabase
        .from('matchmaking_queue')
        .select('*')
        .eq('id', queueId)
        .single();

      if (!queueEntry || queueEntry.matched) return null;

      // Find players with similar MMR (±200 for quick, ±100 for ranked)
      const mmrRange = options.gameMode === 'ranked' ? 100 : 200;
      const minMMR = queueEntry.mmr - mmrRange;
      const maxMMR = queueEntry.mmr + mmrRange;

      // Find potential matches
      const { data: potentialMatches, error } = await supabase
        .from('matchmaking_queue')
        .select('*, profiles:user_id(*)')
        .eq('game_mode', queueEntry.game_mode)
        .eq('variant', queueEntry.variant)
        .eq('difficulty', queueEntry.difficulty)
        .eq('matched', false)
        .neq('user_id', user.id)
        .gte('mmr', minMMR)
        .lte('mmr', maxMMR)
        .order('mmr', { ascending: true })
        .limit(3); // Find up to 3 potential matches

      if (error) {
        console.error('Error finding matches:', error);
        return null;
      }

      // Need at least 1 other player for a match
      if (potentialMatches && potentialMatches.length >= 1) {
        // Create match with first available player
        return await createMatch(queueEntry, potentialMatches[0], options);
      }

      return null;
    } catch (error) {
      console.error('Error in findMatches:', error);
      return null;
    }
  }, [getCurrentUser]);

  // Create a match between two players
  const createMatch = useCallback(async (player1Queue, player2Queue, options) => {
    if (!supabase || !database) return null;

    try {
      // Mark both players as matched
      await supabase
        .from('matchmaking_queue')
        .update({ matched: true })
        .in('id', [player1Queue.id, player2Queue.id]);

      // Create Firebase game
      const gameId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const gameRef = ref(database, `games/${gameId}`);

      // Get player profiles
      const { data: profile1 } = await supabase
        .from('space_adventure_profiles')
        .select('username, display_name, avatar_url')
        .eq('id', player1Queue.user_id)
        .single();

      const { data: profile2 } = await supabase
        .from('space_adventure_profiles')
        .select('username, display_name, avatar_url')
        .eq('id', player2Queue.user_id)
        .single();

      const player1Name = profile1?.username || profile1?.display_name || 'Player 1';
      const player2Name = profile2?.username || profile2?.display_name || 'Player 2';

      // Create game state
      const gameState = {
        players: [
          {
            id: player1Queue.user_id,
            name: player1Name,
            position: 0,
            lastCheckpoint: 0,
            color: 'text-yellow-300',
            corner: 'top-left',
            icon: '🚀'
          },
          {
            id: player2Queue.user_id,
            name: player2Name,
            position: 0,
            lastCheckpoint: 0,
            color: 'text-blue-300',
            corner: 'top-right',
            icon: '🚀'
          }
        ],
        currentPlayerIndex: 0,
        diceValue: null,
        isRolling: false,
        gameWon: false,
        winner: null,
        message: `${player1Name}'s turn! Press SPIN to start!`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        gameMode: options.gameMode || 'quick',
        variant: options.variant || 'classic',
        difficulty: options.difficulty || 'normal',
        matchmaking: true
      };

      await set(gameRef, gameState);

      // Store match info for both players
      await supabase
        .from('matchmaking_queue')
        .update({ match_id: gameId })
        .in('id', [player1Queue.id, player2Queue.id]);

      return { gameId, player1Id: player1Queue.user_id, player2Id: player2Queue.user_id };
    } catch (error) {
      console.error('Error creating match:', error);
      return null;
    }
  }, [supabase, database]);

  // Start checking for matches
  const startMatchmakingCheck = useCallback((queueId, options) => {
    // Check every 2 seconds for matches
    queueCheckInterval.current = setInterval(async () => {
      const match = await findMatches(queueId, options);
      if (match) {
        // Match found!
        setMatchFound(true);
        setMatchedGameId(match.gameId);
        setIsQueued(false);
        setQueueStatus('matched');
        
        if (queueCheckInterval.current) {
          clearInterval(queueCheckInterval.current);
          queueCheckInterval.current = null;
        }
        
        playSound('spaceport');
      } else {
        // Update estimated wait time
        const waitTime = Math.floor((Date.now() - queueStartTime.current) / 1000);
        setEstimatedWaitTime(waitTime);
      }
    }, 2000);
  }, [findMatches, playSound]);

  // Check if user has a matched game
  const checkForMatch = useCallback(async () => {
    if (!supabase) return null;

    try {
      const user = await getCurrentUser();
      if (!user) return null;

      const { data: queueEntry } = await supabase
        .from('matchmaking_queue')
        .select('match_id')
        .eq('user_id', user.id)
        .eq('matched', true)
        .not('match_id', 'is', null)
        .order('queued_at', { ascending: false })
        .limit(1)
        .single();

      if (queueEntry && queueEntry.match_id) {
        setMatchFound(true);
        setMatchedGameId(queueEntry.match_id);
        return queueEntry.match_id;
      }

      return null;
    } catch (error) {
      return null;
    }
  }, [getCurrentUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (queueCheckInterval.current) {
        clearInterval(queueCheckInterval.current);
      }
      if (matchCheckInterval.current) {
        clearInterval(matchCheckInterval.current);
      }
    };
  }, []);

  return {
    isQueued,
    queueStatus,
    matchFound,
    matchedGameId,
    estimatedWaitTime,
    joinQueue,
    leaveQueue,
    checkForMatch
  };
}

