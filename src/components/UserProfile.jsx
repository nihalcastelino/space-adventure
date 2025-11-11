import { useState, useEffect } from 'react';
import { X, Trophy, TrendingUp, Calendar, Award, Crown, Star, Coins, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProgression } from '../hooks/useProgression';
import { useCurrency } from '../hooks/useCurrency';
import { usePremium } from '../hooks/usePremium';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useGameHistory } from '../hooks/useGameHistory';
import { useUserData } from '../hooks/useUserData';
import { useGameSounds } from '../hooks/useGameSounds';
import AdSenseAd from './AdSenseAd';

/**
 * User Profile Modal
 * 
 * Shows user profile information, stats, and subscription status
 */
export default function UserProfile({ isOpen, onClose }) {
  const { playSound } = useGameSounds();
  const { user, getDisplayName, isAuthenticated } = useAuth();
  const progression = useProgression();
  const currency = useCurrency();
  const premium = usePremium();
  const leaderboard = useLeaderboard();
  const gameHistory = useGameHistory();
  const { loadUserData } = useUserData();
  const [userProfile, setUserProfile] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      loadProfileData();
    }
  }, [isOpen, isAuthenticated, user]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Load user profile from Supabase
      const profile = await loadUserData();
      setUserProfile(profile);

      // Get player stats from leaderboard
      const displayName = getDisplayName();
      if (displayName) {
        const stats = await leaderboard.getPlayerStats(displayName);
        setPlayerStats(stats);
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayName = getDisplayName();
  const userGames = gameHistory.getPlayerHistory(displayName || '');
  const wins = playerStats?.wins || progression.stats.totalWins || 0;
  const totalGames = playerStats?.totalGames || progression.stats.totalGames || 0;
  const losses = totalGames - wins;
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;
  
  // Find leaderboard position
  const leaderboardPosition = leaderboard.leaderboard.findIndex(
    entry => entry.name?.toLowerCase() === displayName?.toLowerCase()
  ) + 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => {
          playSound('click');
          onClose();
        }}
      />
      
      {/* Modal */}
      <div className="relative z-10 bg-gray-900 rounded-2xl border-2 border-yellow-400 shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            User Profile
          </h2>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading profile...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* User Info Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{displayName || 'Player'}</h3>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  {premium.isPremium && (
                    <div className="mt-2 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm font-semibold">
                        {premium.getCurrentTier().name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Level */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Level</span>
                </div>
                <div className="text-2xl font-bold text-white">{progression.level}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {progression.xp} XP
                </div>
              </div>

              {/* Coins */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Coins</span>
                </div>
                <div className="text-2xl font-bold text-white">{currency.coins || 0}</div>
              </div>

              {/* Games Played */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Games</span>
                </div>
                <div className="text-2xl font-bold text-white">{totalGames}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {userGames.length} recent
                </div>
              </div>

              {/* Win Rate */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400 text-sm">Win Rate</span>
                </div>
                <div className="text-2xl font-bold text-white">{winRate}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  {wins}W / {losses}L
                </div>
              </div>
            </div>

            {/* Game Stats Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Game Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Total Wins</div>
                  <div className="text-2xl font-bold text-green-400">{wins}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Total Losses</div>
                  <div className="text-2xl font-bold text-red-400">{losses}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Best Time</div>
                  <div className="text-xl font-bold text-white">
                    {playerStats?.bestTime 
                      ? `${Math.floor(playerStats.bestTime / 1000)}s`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Leaderboard Rank</div>
                  <div className="text-xl font-bold text-yellow-400">
                    {leaderboardPosition > 0 ? `#${leaderboardPosition}` : 'Unranked'}
                  </div>
                </div>
              </div>
            </div>

            {/* Progression Stats */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Progression Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Spaceports Used</div>
                  <div className="text-xl font-bold text-white">{progression.stats.spaceportsUsed || 0}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Aliens Hit</div>
                  <div className="text-xl font-bold text-white">{progression.stats.aliensHit || 0}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Fastest Win</div>
                  <div className="text-xl font-bold text-white">
                    {progression.stats.fastestWin > 0 
                      ? `${progression.stats.fastestWin} turns`
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Achievements</div>
                  <div className="text-xl font-bold text-white">
                    {progression.unlockedAchievements.length} unlocked
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            {premium.isPremium && (
              <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg p-6 border-2 border-yellow-400">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Premium Subscription
                </h3>
                <div className="text-white">
                  <div className="mb-2">
                    <span className="text-gray-300">Tier: </span>
                    <span className="font-bold">{premium.getCurrentTier().name}</span>
                  </div>
                  {premium.subscriptionStatus.expiresAt && (
                    <div>
                      <span className="text-gray-300">Expires: </span>
                      <span className="font-bold">
                        {new Date(premium.subscriptionStatus.expiresAt).toLocaleDateString()}
                      </span>
                      <span className="text-gray-300 ml-2">
                        ({premium.getDaysRemaining()} days remaining)
                      </span>
                    </div>
                  )}
                  {!premium.subscriptionStatus.expiresAt && (
                    <div className="text-yellow-300 font-semibold">Lifetime Premium ✨</div>
                  )}
                </div>
              </div>
            )}

            {/* AdSense Ad - Safe placement in profile (not during gameplay) */}
            <div className="mt-4">
              <AdSenseAd 
                adFormat="rectangle"
                style={{ 
                  minHeight: '250px',
                  width: '100%',
                  maxWidth: '100%'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

