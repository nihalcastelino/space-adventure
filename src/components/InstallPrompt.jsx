import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show prompt if not standalone, not dismissed recently (7 days), and not iOS
    if (!standalone && (!dismissed || daysSinceDismissed > 7)) {
      // For iOS, show custom prompt
      if (iOS) {
        setShowPrompt(true);
      }
    }

    // Listen for beforeinstallprompt event (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after a short delay (better UX)
      setTimeout(() => {
        if (!dismissed || daysSinceDismissed > 7) {
          setShowPrompt(true);
        }
      }, 3000); // 3 second delay
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA installed successfully');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);

    if (outcome === 'dismissed') {
      // User dismissed, store timestamp
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or user doesn't want to see it
  if (isStandalone || !showPrompt) return null;

  // iOS Install Instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/30 p-5">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-yellow-400/20 p-3 rounded-xl">
              <Download className="w-6 h-6 text-yellow-300" />
            </div>

            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">
                Install Space Race
              </h3>
              <p className="text-white/80 text-sm mb-3">
                Install this app on your iPhone for a better experience:
              </p>

              <ol className="text-white/70 text-xs space-y-1 ml-4 list-decimal">
                <li>Tap the Share button <span className="inline-block">📤</span></li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top right corner</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/Chrome Install Button
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up sm:left-auto sm:right-4 sm:max-w-md">
        <div className="bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-purple-500/30 p-5">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-yellow-400/20 p-3 rounded-xl">
              <Download className="w-6 h-6 text-yellow-300" />
            </div>

            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">
                Install Space Race
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Install this app for quick access and offline play!
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-2 px-4 rounded-xl transition-all transform hover:scale-105"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPrompt;
