import { useState, useEffect } from 'react';
import LocalGame from './components/LocalGame';
import OnlineGame from './components/OnlineGame';
import AIGame from './components/AIGame';
import MatchmakingGame from './components/MatchmakingGame';
import RPGGame from './components/RPGGame';
import GameModeSelector from './components/GameModeSelector';
import PremiumModal from './components/PremiumModal';
import InstallPrompt from './components/InstallPrompt';
import { supabase } from './lib/supabase';

function App() {
  const [gameMode, setGameMode] = useState(null); // 'local', 'online', 'ai', 'matchmaking', or 'rpg'
  const [difficulty, setDifficulty] = useState('normal');
  const [gameVariant, setGameVariant] = useState('classic');
  const [randomizationSeed, setRandomizationSeed] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Handle OAuth callback and Stripe checkout redirects
  useEffect(() => {
    if (supabase) {
      // Function to clean up URL (both hash and query params)
      const cleanUpURL = () => {
        // Remove hash fragments (OAuth tokens)
        if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('error'))) {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
        
        // Remove query parameters (OAuth code, errors, checkout)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('error') || urlParams.has('code') || urlParams.has('checkout')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      // Check for OAuth callback or Stripe checkout success
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // User is authenticated, clean up URL
          cleanUpURL();
          
          // If checkout success, reload premium status
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('checkout') === 'success') {
            // Premium status will be updated via webhook
            // But we can show a success message
            console.log('Checkout successful! Premium will be activated shortly.');
          }
        } else {
          // Even if no session, clean up hash fragments if present
          if (window.location.hash && window.location.hash.includes('error')) {
            cleanUpURL();
          }
        }
      });

      // Listen for auth state changes (handles OAuth redirects)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Clean up URL after successful sign-in
          // Use setTimeout to ensure session is fully processed
          setTimeout(() => {
            cleanUpURL();
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          cleanUpURL();
        }
      });

      // Also clean up immediately if hash contains tokens
      if (window.location.hash && window.location.hash.includes('access_token')) {
        // Wait a bit for Supabase to process the session
        setTimeout(() => {
          cleanUpURL();
        }, 500);
      }

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleSelectMode = (mode, selectedDifficulty, variant = 'classic', seed = null) => {
    setGameMode(mode);
    setDifficulty(selectedDifficulty);
    setGameVariant(variant);
    setRandomizationSeed(seed || Date.now() + Math.random());
  };

  const handleBack = () => {
    setGameMode(null);
  };

  if (!gameMode) {
    return (
      <>
        <GameModeSelector
          onSelectMode={handleSelectMode}
          onUpgrade={() => setShowPremiumModal(true)}
        />
        {showPremiumModal && (
          <PremiumModal onClose={() => setShowPremiumModal(false)} />
        )}
        <InstallPrompt />
      </>
    );
  }

  return (
    <div className="fixed inset-0">
      {gameMode === 'ai' ? (
        <AIGame
          onBack={handleBack}
          initialDifficulty={difficulty}
          aiDifficulty={difficulty}
          gameVariant={gameVariant}
          randomizationSeed={randomizationSeed}
        />
      ) : gameMode === 'local' ? (
        <LocalGame
          onBack={handleBack}
          initialDifficulty={difficulty}
          gameVariant={gameVariant}
          randomizationSeed={randomizationSeed}
        />
      ) : gameMode === 'matchmaking' ? (
        <MatchmakingGame
          onBack={handleBack}
          difficulty={difficulty}
          variant={gameVariant}
        />
      ) : gameMode === 'rpg' ? (
        <RPGGame
          onBack={handleBack}
          initialDifficulty={difficulty}
          gameVariant={gameVariant}
        />
      ) : (
        <OnlineGame
          onBack={handleBack}
          initialDifficulty={difficulty}
          gameVariant={gameVariant}
          randomizationSeed={randomizationSeed}
        />
      )}
      <InstallPrompt />
    </div>
  );
}

export default App;

