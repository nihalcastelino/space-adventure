import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Alien Encounter Overlay
 * 
 * Shows a visible overlay when a player encounters an alien
 */
export default function AlienEncounterOverlay({ 
  playerName, 
  position, 
  isActive,
  onClose 
}) {
  const [show, setShow] = useState(isActive);

  useEffect(() => {
    setShow(isActive);
    if (isActive) {
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Dark backdrop for better visibility */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        style={{ zIndex: 50 }}
      />
      <div className="pointer-events-auto relative" style={{ zIndex: 51 }}>
        <div
          className="relative glass rounded-lg border-4 border-red-500 shadow-2xl overflow-hidden"
          style={{
            width: 'min(90vw, 400px)',
            minHeight: '180px',
            background: 'linear-gradient(135deg, rgba(60, 0, 0, 0.98), rgba(30, 30, 50, 0.98))',
            animation: 'pulse-red 2s infinite',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.8), inset 0 0 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Content */}
          <div className="relative p-6 flex flex-col items-center gap-4">
            {/* Alien Icon */}
            <div className="text-6xl animate-bounce" style={{ filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))' }}>
              👾
            </div>
            
            {/* Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-300 mb-2" style={{ textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
                ALIEN ENCOUNTER!
              </h2>
              <p className="text-white text-lg">
                {playerName} encountered an alien at position {position}!
              </p>
            </div>

            {/* Warning Message */}
            <div className="w-full glass rounded p-3 border-2 border-red-400/30">
              <div className="flex items-center gap-2 text-yellow-300">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm font-bold">
                  The alien is attacking! You'll be sent back to your last checkpoint!
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Warning Strip */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2"
            style={{
              background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, #fbbf24 10px, #fbbf24 20px)',
              animation: 'slide-warning 1s linear infinite'
            }}
          />
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.8); }
        }

        @keyframes slide-warning {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
}

