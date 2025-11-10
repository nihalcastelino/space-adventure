import { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, set, get, update, onValue, push, remove, serverTimestamp } from 'firebase/database';
import { v4 as uuidv4 } from '../utils/uuid';

// Generate a simple UUID (same as used in useFirebaseGame)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function useSocialFeatures(playerId, playerName) {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [friendInvites, setFriendInvites] = useState([]);
  const db = getDatabase();

  // Initialize player profile
  useEffect(() => {
    if (!playerId || !playerName) return;

    const playerRef = ref(db, `players/${playerId}`);
    set(playerRef, {
      id: playerId,
      name: playerName,
      lastOnline: serverTimestamp(),
      isOnline: true
    });

    // Set offline on disconnect
    const onDisconnectRef = ref(db, `players/${playerId}/isOnline`);
    set(onDisconnectRef, false);

    return () => {
      update(playerRef, { isOnline: false });
    };
  }, [playerId, playerName, db]);

  // Listen to friend list
  useEffect(() => {
    if (!playerId) return;

    const friendsRef = ref(db, `friends/${playerId}`);
    const unsubscribe = onValue(friendsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const friendIds = Object.keys(snapshot.val());

        // Fetch friend data
        const friendsData = await Promise.all(
          friendIds.map(async (friendId) => {
            const friendSnapshot = await get(ref(db, `players/${friendId}`));
            return friendSnapshot.exists() ? friendSnapshot.val() : null;
          })
        );

        setFriends(friendsData.filter(f => f !== null));
      } else {
        setFriends([]);
      }
    });

    return () => unsubscribe();
  }, [playerId, db]);

  // Listen to friend requests
  useEffect(() => {
    if (!playerId) return;

    const requestsRef = ref(db, `friendRequests/${playerId}`);
    const unsubscribe = onValue(requestsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const requests = [];
        const data = snapshot.val();

        for (const requestId in data) {
          const request = data[requestId];
          const senderSnapshot = await get(ref(db, `players/${request.from}`));
          if (senderSnapshot.exists()) {
            requests.push({
              id: requestId,
              from: request.from,
              sender: senderSnapshot.val(),
              timestamp: request.timestamp
            });
          }
        }

        setFriendRequests(requests);
      } else {
        setFriendRequests([]);
      }
    });

    return () => unsubscribe();
  }, [playerId, db]);

  // Listen to game invites
  useEffect(() => {
    if (!playerId) return;

    const invitesRef = ref(db, `gameInvites/${playerId}`);
    const unsubscribe = onValue(invitesRef, async (snapshot) => {
      if (snapshot.exists()) {
        const invites = [];
        const data = snapshot.val();

        for (const inviteId in data) {
          const invite = data[inviteId];
          const senderSnapshot = await get(ref(db, `players/${invite.from}`));
          if (senderSnapshot.exists()) {
            invites.push({
              id: inviteId,
              from: invite.from,
              sender: senderSnapshot.val(),
              gameId: invite.gameId,
              timestamp: invite.timestamp
            });
          }
        }

        setFriendInvites(invites);
      } else {
        setFriendInvites([]);
      }
    });

    return () => unsubscribe();
  }, [playerId, db]);

  // Update online friends
  useEffect(() => {
    setOnlineFriends(friends.filter(f => f.isOnline));
  }, [friends]);

  // Send friend request
  const sendFriendRequest = useCallback(async (targetPlayerId) => {
    if (!playerId || !targetPlayerId) {
      return { success: false, error: 'Invalid player ID' };
    }

    if (playerId === targetPlayerId) {
      return { success: false, error: 'Cannot add yourself as a friend' };
    }

    // Check if already friends
    const friendSnapshot = await get(ref(db, `friends/${playerId}/${targetPlayerId}`));
    if (friendSnapshot.exists()) {
      return { success: false, error: 'Already friends' };
    }

    // Check if request already sent
    const requestsSnapshot = await get(ref(db, `friendRequests/${targetPlayerId}`));
    if (requestsSnapshot.exists()) {
      const requests = requestsSnapshot.val();
      const existing = Object.values(requests).find(r => r.from === playerId);
      if (existing) {
        return { success: false, error: 'Request already sent' };
      }
    }

    // Check if target player exists
    const targetSnapshot = await get(ref(db, `players/${targetPlayerId}`));
    if (!targetSnapshot.exists()) {
      return { success: false, error: 'Player not found' };
    }

    // Send request
    const requestRef = push(ref(db, `friendRequests/${targetPlayerId}`));
    await set(requestRef, {
      from: playerId,
      timestamp: serverTimestamp()
    });

    return { success: true };
  }, [playerId, db]);

  // Accept friend request
  const acceptFriendRequest = useCallback(async (requestId, senderId) => {
    if (!playerId) return { success: false, error: 'Not logged in' };

    // Add to both friend lists
    await set(ref(db, `friends/${playerId}/${senderId}`), true);
    await set(ref(db, `friends/${senderId}/${playerId}`), true);

    // Remove request
    await remove(ref(db, `friendRequests/${playerId}/${requestId}`));

    return { success: true };
  }, [playerId, db]);

  // Reject friend request
  const rejectFriendRequest = useCallback(async (requestId) => {
    if (!playerId) return { success: false, error: 'Not logged in' };

    await remove(ref(db, `friendRequests/${playerId}/${requestId}`));
    return { success: true };
  }, [playerId, db]);

  // Remove friend
  const removeFriend = useCallback(async (friendId) => {
    if (!playerId) return { success: false, error: 'Not logged in' };

    // Remove from both friend lists
    await remove(ref(db, `friends/${playerId}/${friendId}`));
    await remove(ref(db, `friends/${friendId}/${playerId}`));

    return { success: true };
  }, [playerId, db]);

  // Send game invite
  const sendGameInvite = useCallback(async (friendId, gameId) => {
    if (!playerId || !friendId || !gameId) {
      return { success: false, error: 'Invalid parameters' };
    }

    const inviteRef = push(ref(db, `gameInvites/${friendId}`));
    await set(inviteRef, {
      from: playerId,
      gameId: gameId,
      timestamp: serverTimestamp()
    });

    return { success: true };
  }, [playerId, db]);

  // Accept game invite
  const acceptGameInvite = useCallback(async (inviteId) => {
    if (!playerId) return { success: false, error: 'Not logged in' };

    // Get invite data
    const inviteSnapshot = await get(ref(db, `gameInvites/${playerId}/${inviteId}`));
    if (!inviteSnapshot.exists()) {
      return { success: false, error: 'Invite not found' };
    }

    const invite = inviteSnapshot.val();

    // Remove invite
    await remove(ref(db, `gameInvites/${playerId}/${inviteId}`));

    return { success: true, gameId: invite.gameId };
  }, [playerId, db]);

  // Reject game invite
  const rejectGameInvite = useCallback(async (inviteId) => {
    if (!playerId) return { success: false, error: 'Not logged in' };

    await remove(ref(db, `gameInvites/${playerId}/${inviteId}`));
    return { success: true };
  }, [playerId, db]);

  // Find player by name (search)
  const searchPlayerByName = useCallback(async (searchName) => {
    if (!searchName || searchName.length < 2) {
      return { success: false, error: 'Search name too short' };
    }

    const playersRef = ref(db, 'players');
    const snapshot = await get(playersRef);

    if (!snapshot.exists()) {
      return { success: true, players: [] };
    }

    const allPlayers = snapshot.val();
    const matchingPlayers = Object.values(allPlayers)
      .filter(player =>
        player.name.toLowerCase().includes(searchName.toLowerCase()) &&
        player.id !== playerId
      )
      .slice(0, 10); // Limit to 10 results

    return { success: true, players: matchingPlayers };
  }, [playerId, db]);

  return {
    friends,
    friendRequests,
    onlineFriends,
    friendInvites,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    sendGameInvite,
    acceptGameInvite,
    rejectGameInvite,
    searchPlayerByName
  };
}
