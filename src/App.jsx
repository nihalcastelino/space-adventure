import { useState, useEffect } from 'react';
import LocalGame from './components/LocalGame';
import OnlineGame from './components/OnlineGame';
import AIGame from './components/AIGame';
import GameModeSelector from './components/GameModeSelector';
import PremiumModal from './components/PremiumModal';
import { supabase } from './lib/supabase';

function App() {
  const [gameMode, setGameMode] = useState(null); // 'local', 'online', or 'ai'
  const [difficulty, setDifficulty] = useState('normal');
  const [gameVariant, setGameVariant] = useState('classic');
  const [randomizationSeed, setRandomizationSeed] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Handle OAuth callback and Stripe checkout redirects
  useEffect(() => {
    if (supabase) {
      // Check for OAuth callback or Stripe checkout success
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // User is authenticated, clean up URL params
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('error') || urlParams.has('code') || urlParams.has('checkout')) {
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // If checkout success, reload premium status
            if (urlParams.get('checkout') === 'success') {
              // Premium status will be updated via webhook
              // But we can show a success message
              console.log('Checkout successful! Premium will be activated shortly.');
            }
          }
        }
      });

      // Listen for auth state changes (handles OAuth redirects)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Clean up URL after successful sign-in
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('code') || urlParams.has('error') || urlParams.has('checkout')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      });

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
      ) : (
        <OnlineGame 
          onBack={handleBack} 
          initialDifficulty={difficulty}
          gameVariant={gameVariant}
          randomizationSeed={randomizationSeed}
        />
      )}
    </div>
  );
}

export default App;

