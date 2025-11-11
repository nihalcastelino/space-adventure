import { useState } from 'react';
import { User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';
import { useGameSounds } from '../hooks/useGameSounds';

/**
 * Authentication Button Component
 * 
 * Shows login button or user menu based on auth state
 */
export default function AuthButton() {
  const { playSound } = useGameSounds();
  const { user, isAuthenticated, signOut, getDisplayName, configured } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Don't show if Supabase not configured
  if (!configured) {
    return null;
  }

  const handleSignOut = async () => {
    playSound('click');
    await signOut();
    setShowMenu(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => {
            playSound('click');
            setShowAuthModal(true);
          }}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          playSound('click');
          setShowMenu(!showMenu);
        }}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
      >
        <User className="w-4 h-4" />
        <span>{getDisplayName()}</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border-2 border-gray-700 z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-sm text-gray-300 border-b border-gray-700">
                {user?.email}
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setShowMenu(false);
                  setShowProfile(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
              >
                <User className="w-4 h-4" />
                <span>View Profile</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* User Profile Modal */}
      <UserProfile
        isOpen={showProfile}
        onClose={() => {
          playSound('click');
          setShowProfile(false);
        }}
      />
    </div>
  );
}

