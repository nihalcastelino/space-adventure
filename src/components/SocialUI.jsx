import { X, Users, UserPlus, Mail, Search, Check, XCircle, Send, Circle } from 'lucide-react';
import { useState } from 'react';

export function FriendListItem({ friend, onRemove, onInvite, showInvite = false }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        <div>
          <div className="text-white font-bold">{friend.name}</div>
          <div className="text-gray-400 text-xs">
            {friend.isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {showInvite && friend.isOnline && (
          <button
            onClick={() => onInvite(friend.id)}
            className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
            title="Invite to game"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        )}
        <button
          onClick={() => onRemove(friend.id)}
          className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
          title="Remove friend"
        >
          <XCircle className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

export function FriendRequestItem({ request, onAccept, onReject }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
      <div>
        <div className="text-white font-bold">{request.sender.name}</div>
        <div className="text-gray-400 text-xs">Sent you a friend request</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(request.id, request.from)}
          className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
          title="Accept"
        >
          <Check className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => onReject(request.id)}
          className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
          title="Reject"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

export function GameInviteItem({ invite, onAccept, onReject }) {
  return (
    <div className="flex items-center justify-between p-3 bg-blue-900 bg-opacity-40 rounded-lg border border-blue-400">
      <div>
        <div className="text-white font-bold">{invite.sender.name}</div>
        <div className="text-blue-400 text-sm">Invited you to play!</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(invite.id)}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-white font-bold"
        >
          Join
        </button>
        <button
          onClick={() => onReject(invite.id)}
          className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

export function SocialModal({
  friends,
  friendRequests,
  onlineFriends,
  onRemoveFriend,
  onAcceptRequest,
  onRejectRequest,
  onSearchPlayer,
  onSendRequest,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests, search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;

    setSearching(true);
    const result = await onSearchPlayer(searchQuery);
    if (result.success) {
      setSearchResults(result.players);
    }
    setSearching(false);
  };

  const handleSendRequest = async (playerId) => {
    const result = await onSendRequest(playerId);
    if (result.success) {
      alert('Friend request sent!');
      setSearchResults(prev => prev.filter(p => p.id !== playerId));
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-blue-400">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Friends
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {onlineFriends.length} online • {friends.length} total
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-4 border-b border-gray-700 flex gap-2">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'friends'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all relative ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Requests ({friendRequests.length})
            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Add Friends
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'friends' && (
            <div className="space-y-2">
              {friends.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No friends yet. Add some friends to get started!</p>
                </div>
              ) : (
                friends.map(friend => (
                  <FriendListItem
                    key={friend.id}
                    friend={friend}
                    onRemove={onRemoveFriend}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-2">
              {friendRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No pending friend requests</p>
                </div>
              ) : (
                friendRequests.map(request => (
                  <FriendRequestItem
                    key={request.id}
                    request={request}
                    onAccept={onAcceptRequest}
                    onReject={onRejectRequest}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by player name..."
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:border-blue-400 outline-none"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || searchQuery.length < 2}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-2">
                {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No players found</p>
                  </div>
                )}

                {searchResults.map(player => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Circle className={`w-3 h-3 ${player.isOnline ? 'text-green-500 fill-green-500' : 'text-gray-500 fill-gray-500'}`} />
                      <div>
                        <div className="text-white font-bold">{player.name}</div>
                        <div className="text-gray-400 text-xs">
                          {player.isOnline ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendRequest(player.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 text-white font-bold"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FriendInviteNotification({ invite, onAccept, onReject }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
      <div className="bg-gradient-to-br from-blue-900 to-gray-900 border-2 border-blue-400 rounded-lg p-4 shadow-2xl min-w-[300px]">
        <div className="flex items-start gap-3">
          <Users className="w-8 h-8 text-blue-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">Game Invite!</h3>
            <p className="text-gray-300 text-sm mb-3">
              {invite.sender.name} invited you to play
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onAccept(invite.id)}
                className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-white font-bold"
              >
                Join Game
              </button>
              <button
                onClick={() => onReject(invite.id)}
                className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuickFriendButton({ friendRequests, onClick, className = '' }) {
  const hasRequests = friendRequests.length > 0;

  return (
    <button
      onClick={onClick}
      className={`relative bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 ${className}`}
    >
      <Users className="w-5 h-5" />
      Friends
      {hasRequests && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs animate-pulse">
          {friendRequests.length}
        </span>
      )}
    </button>
  );
}
