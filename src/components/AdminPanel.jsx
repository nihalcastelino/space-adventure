import { useState, useEffect } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { X, Search, Crown, User, Check, X as XIcon } from 'lucide-react';

export default function AdminPanel({ onClose }) {
  const { isAdmin, loading, updateUserPremium, getAllUsers, searchUsers } = useAdmin();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    const result = await getAllUsers(50);
    if (result.success) {
      setUsers(result.users);
    }
  };

  const handleSearch = async (term) => {
    if (!term.trim()) {
      loadUsers();
      return;
    }

    const result = await searchUsers(term);
    if (result.success) {
      setUsers(result.users);
    }
  };

  const handleUpdatePremium = async (userId, tier) => {
    setUpdating(true);
    setMessage(null);

    const result = await updateUserPremium(userId, tier, {
      clearStripeIds: true, // Clear Stripe IDs when manually setting premium
    });

    if (result.success) {
      setMessage({ type: 'success', text: `Updated user to ${tier} premium` });
      setSelectedUser(null);
      loadUsers(); // Refresh list
    } else {
      setMessage({ type: 'error', text: result.error });
    }

    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Access Denied</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600">You don't have admin access.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Admin Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mx-6 mt-4 p-3 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-6">
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No users found</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{user.display_name || user.email}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            user.premium_tier === 'free'
                              ? 'bg-gray-200 text-gray-700'
                              : user.premium_tier === 'monthly'
                              ? 'bg-blue-200 text-blue-700'
                              : 'bg-purple-200 text-purple-700'
                          }`}
                        >
                          {user.premium_tier || 'free'}
                        </span>
                        {user.is_admin && (
                          <span className="text-xs px-2 py-1 rounded bg-yellow-200 text-yellow-700">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.premium_tier !== 'free' && (
                      <button
                        onClick={() => handleUpdatePremium(user.id, 'free')}
                        disabled={updating}
                        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        Remove Premium
                      </button>
                    )}
                    {user.premium_tier !== 'monthly' && (
                      <button
                        onClick={() => handleUpdatePremium(user.id, 'monthly')}
                        disabled={updating}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        Set Monthly
                      </button>
                    )}
                    {user.premium_tier !== 'lifetime' && (
                      <button
                        onClick={() => handleUpdatePremium(user.id, 'lifetime')}
                        disabled={updating}
                        className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                      >
                        Set Lifetime
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
            {users.length} user{users.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>
    </div>
  );
}

