import { useState, useEffect } from 'react';
import { User, LogOut, LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';
import { useGameSounds } from '../hooks/useGameSounds';

/**
 * Authentication Button Component
 * 
 * Responsive design:
 * - Mobile: Hamburger menu icon (compact)
 * - Desktop: Full button with text
 * - Slide-out drawer menu on mobile
 */
export default function AuthButton({ compact = false }) {
  const { playSound } = useGameSounds();
  const { user, isAuthenticated, signOut, getDisplayName, configured } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't show if Supabase not configured
  if (!configured) {
    return null;
  }

  const handleSignOut = async () => {
    playSound('click');
    await signOut();
    setShowMenu(false);
  };

  // Use compact mode on mobile or if explicitly set
  const useCompact = compact || isMobile;

  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => {
            playSound('click');
            setShowAuthModal(true);
          }}
          className={`flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 ${
            useCompact 
              ? 'p-2' // Icon only on mobile
              : 'py-2 px-4' // Full button on desktop
          }`}
          aria-label="Sign In"
        >
          <LogIn className="w-4 h-4 md:w-5 md:h-5" />
          {!useCompact && <span className="hidden sm:inline">Sign In</span>}
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
        className={`flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all ${
          useCompact 
            ? 'p-2' // Icon only on mobile
            : 'py-2 px-3 md:px-4' // Full button on desktop
        }`}
        aria-label="User Menu"
      >
        {useCompact ? (
          <Menu className="w-5 h-5" />
        ) : (
          <>
            <User className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline max-w-[120px] md:max-w-none truncate">
              {getDisplayName()}
            </span>
          </>
        )}
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu - Slide-out drawer on mobile, dropdown on desktop */}
          <div
            className={`bg-gray-800 rounded-lg shadow-xl border-2 border-gray-700 z-50 ${
              useCompact
                ? 'fixed top-0 right-0 h-full w-64 max-w-[80vw] transform transition-transform duration-300 ease-out'
                : 'absolute right-0 mt-2 w-48'
            }`}
            style={{
              animation: useCompact ? 'slideInRight 0.3s ease-out' : undefined
            }}
          >
            {/* Mobile header with close button */}
            {useCompact && (
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white">Menu</h3>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            )}

            <div className="p-2">
              <div className={`px-3 py-2 text-sm text-gray-300 border-b border-gray-700 ${useCompact ? 'mb-2' : ''}`}>
                <div className="font-semibold truncate">{getDisplayName()}</div>
                <div className="text-xs text-gray-400 truncate mt-1">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setShowMenu(false);
                  setShowProfile(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm text-white hover:bg-gray-700 rounded transition-colors"
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span>View Profile</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
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

