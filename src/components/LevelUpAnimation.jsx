import { useEffect, useState } from 'react';
import { Star, Trophy } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';

/**
 * Level Up Animation Overlay
 * 
 * Shows a celebratory animation when a player levels up
 */
export default function LevelUpAnimation({ 
  level, 
  isActive,
  onComplete 
}) {
  const { playSound } = useGameSounds();
  const [show, setShow] = useState(isActive);
  const [phase, setPhase] = useState('entrance'); // 'entrance', 'celebration', 'exit'

  useEffect(() => {
    if (isActive) {
      setShow(true);
      setPhase('entrance');
      playSound('victory'); // Play victory sound
      
      // Entrance phase (0.5s)
      setTimeout(() => {
        setPhase('celebration');
      }, 500);

      // Celebration phase (2.5s)
      setTimeout(() => {
        setPhase('exit');
      }, 3000);

      // Exit phase and hide (0.5s)
      setTimeout(() => {
        setShow(false);
        if (onComplete) onComplete();
      }, 3500);
    }
  }, [isActive, level, playSound, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Dark backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          phase === 'entrance' ? 'opacity-0' : phase === 'exit' ? 'opacity-0' : 'opacity-80'
        }`}
      />
      
      {/* Main animation container */}
      <div className={`relative z-10 transition-all duration-500 ${
        phase === 'entrance' 
          ? 'scale-0 opacity-0' 
          : phase === 'exit' 
          ? 'scale-110 opacity-0' 
          : 'scale-100 opacity-100'
      }`}>
        {/* Glowing background circle */}
        <div 
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 140, 0, 0.4) 50%, transparent 70%)',
            width: '400px',
            height: '400px',
            transform: 'translate(-50%, -50%)',
            top: '50%',
            left: '50%',
            animation: phase === 'celebration' ? 'pulse-glow 1s ease-in-out infinite' : 'none'
          }}
        />

        {/* Main content */}
        <div className="relative bg-gradient-to-br from-yellow-900 via-yellow-800 to-orange-900 rounded-3xl p-12 border-4 border-yellow-400 shadow-2xl min-w-[400px] text-center">
          {/* Sparkle effects */}
          {phase === 'celebration' && (
            <>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-yellow-300"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `sparkle-${i % 3} 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                    fontSize: '24px'
                  }}
                >
                  ✨
                </div>
              ))}
            </>
          )}

          {/* Level number with animation */}
          <div className="mb-6">
            <div 
              className={`text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-300 ${
                phase === 'celebration' ? 'animate-bounce' : ''
              }`}
              style={{
                textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                animation: phase === 'celebration' ? 'bounce 0.6s ease-in-out infinite' : 'none'
              }}
            >
              {level}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <h2 className="text-4xl font-bold text-yellow-300 mb-2 flex items-center justify-center gap-3">
              <Star className="w-10 h-10 text-yellow-400 animate-spin" style={{ animationDuration: '2s' }} />
              <span>LEVEL UP!</span>
              <Star className="w-10 h-10 text-yellow-400 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            </h2>
            <p className="text-yellow-200 text-xl mt-2">
              You've reached Level {level}!
            </p>
          </div>

          {/* Trophy icon */}
          <div className="mt-6 flex justify-center">
            <Trophy 
              className={`w-20 h-20 text-yellow-400 ${
                phase === 'celebration' ? 'animate-bounce' : ''
              }`}
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
                animation: phase === 'celebration' ? 'bounce 0.8s ease-in-out infinite' : 'none'
              }}
            />
          </div>

          {/* Confetti particles */}
          {phase === 'celebration' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00CED1'][i % 5],
                    left: `${(i * 13.33) % 100}%`,
                    top: '0%',
                    animation: `confetti-fall ${1 + Math.random() * 2}s linear forwards`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    opacity: 0.9
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes sparkle-0 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }

        @keyframes sparkle-1 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(90deg); }
          50% { opacity: 1; transform: scale(1) rotate(270deg); }
        }

        @keyframes sparkle-2 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(45deg); }
          50% { opacity: 1; transform: scale(1) rotate(225deg); }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

