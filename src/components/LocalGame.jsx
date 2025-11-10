import { useState, useEffect } from 'react';
import { Rocket, Zap, Plus, Minus, ArrowLeft } from 'lucide-react';
import GameBoard from './GameBoard';
import PlayerPanel from './PlayerPanel';
import GameControls from './GameControls';
import ParticleEffects from './ParticleEffects';
import { useGameLogic } from '../hooks/useGameLogic';
import { useGameSounds } from '../hooks/useGameSounds';

export default function LocalGame({ onBack }) {
  const { playSound } = useGameSounds();
  const {
    players,
    numPlayers,
    currentPlayerIndex,
    diceValue,
    isRolling,
    message,
    gameWon,
    winner,
    animatingPlayer,
    animationType,
    alienBlink,
    addPlayer,
    removePlayer,
    rollDice,
    resetGame
  } = useGameLogic();

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        backgroundImage: 'url(/space-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#000'
      }}
    >
      {/* Overlay to darken background if needed */}
      <div
        className="absolute inset-0 bg-black/20"
        style={{ backdropFilter: 'blur(1px)' }}
      />

      <ParticleEffects active={true} type="stars" />
      <style>{`
        @keyframes rocket-liftoff {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.2); }
          100% { transform: translateY(-60px) scale(0.5) rotate(45deg); opacity: 0; }
        }
        @keyframes rocket-landing {
          0% { transform: translateY(-60px) scale(0.5) rotate(-45deg); opacity: 0; }
          50% { transform: translateY(-30px) scale(1.2); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes rocket-blastoff {
          0% { transform: translateY(0) scale(1) rotate(0deg); filter: brightness(1); }
          10% { transform: translateY(-5px) scale(1.05) rotate(-2deg); filter: brightness(1.5); }
          20% { transform: translateY(-8px) scale(1.1) rotate(2deg); filter: brightness(2); }
          30% { transform: translateY(-15px) scale(1.2) rotate(-3deg); filter: brightness(2.5) drop-shadow(0 0 20px currentColor); }
          50% { transform: translateY(-40px) scale(1.5) rotate(5deg); filter: brightness(3) drop-shadow(0 0 30px currentColor); }
          70% { transform: translateY(-80px) scale(1.8) rotate(10deg); opacity: 1; filter: brightness(3.5) drop-shadow(0 0 40px currentColor); }
          100% { transform: translateY(-150px) scale(0.3) rotate(45deg); opacity: 0; filter: brightness(4) drop-shadow(0 0 50px currentColor); }
        }
        @keyframes victory-celebration {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(-5deg); }
          50% { transform: scale(1.3) rotate(5deg); }
          75% { transform: scale(1.2) rotate(-5deg); }
        }
        .animate-rocket-liftoff {
          animation: rocket-liftoff 0.8s ease-in-out;
        }
        .animate-rocket-landing {
          animation: rocket-landing 0.6s ease-in-out;
        }
        .animate-rocket-blastoff {
          animation: rocket-blastoff 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-victory-celebration {
          animation: victory-celebration 0.5s ease-in-out infinite;
        }
      `}</style>

      {/* Back button - mobile friendly */}
      <button
        onClick={() => {
          playSound('click');
          onBack();
        }}
        className="fixed top-2 left-2 z-50 glass rounded-lg p-2 shadow-lg border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-110 active:scale-95"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Title - responsive */}
      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-xl md:text-3xl font-bold text-center flex items-center justify-center gap-2 glass px-4 md:px-6 py-2 rounded-lg shadow-2xl border-2 border-yellow-400 border-opacity-30">
          <Rocket className="w-5 h-5 md:w-8 md:h-8 text-yellow-300 animate-float" />
          <span className="hidden sm:inline text-yellow-300">
            Space Race to 100!
          </span>
          <span className="sm:hidden text-yellow-300">
            Space Race!
          </span>
        </h1>
      </div>

      {/* Player Panels - responsive layout */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`fixed pointer-events-auto ${
              index === 0 ? 'top-16 md:top-4 left-2 md:left-4' :
              index === 1 ? 'top-16 md:top-4 right-2 md:right-4' :
              index === 2 ? 'bottom-20 md:bottom-4 left-2 md:left-4' :
              'bottom-20 md:bottom-4 right-2 md:right-4'
            }`}
          >
            <PlayerPanel
              player={player}
              isCurrentPlayer={currentPlayerIndex === index}
              onRollDice={rollDice}
              isRolling={isRolling}
              gameWon={gameWon}
              animatingPlayer={animatingPlayer}
              animationType={animationType}
            />
          </div>
        ))}
      </div>

      {/* Game Controls - responsive */}
      <div className="fixed bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-[calc(100%-1rem)] md:w-96">
        <GameControls
          diceValue={diceValue}
          message={message}
          onReset={resetGame}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          numPlayers={numPlayers}
        />
      </div>

      {/* Game Board Container - responsive */}
      <div
        className="fixed"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '600px',
          maxHeight: '90vh'
        }}
      >
        {/* Starting Area - Outside the square board */}
        {players.filter(p => p.position === 0).length > 0 && (
          <div
            style={{
              width: 'min(90vw, 600px)',
              minHeight: '60px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '3px solid rgba(16, 185, 129, 0.6)',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '8px',
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 'bold'
            }}>
              🚀 Starting Spaceport
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
              {players.filter(p => p.position === 0).map(player => {
                const isAnimating = animatingPlayer === player.id;
                const animationClass = isAnimating && animationType ? `animate-rocket-${animationType}` : '';
                return (
                  <div
                    key={player.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '6px',
                      border: `2px solid ${player.color.includes('yellow') ? 'rgba(253, 224, 71, 0.6)' :
                                player.color.includes('blue') ? 'rgba(147, 197, 253, 0.6)' :
                                player.color.includes('green') ? 'rgba(134, 239, 172, 0.6)' :
                                'rgba(249, 168, 212, 0.6)'}`
                    }}
                  >
                    <Rocket
                      className={`${player.color} ${animationClass}`}
                      style={{
                        width: '24px',
                        height: '24px',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 8px currentColor)',
                        animation: animationClass ? undefined : 'float 2s ease-in-out infinite'
                      }}
                    />
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>
                      {player.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Board - always square */}
        <div
          style={{
            width: 'min(90vw, 600px)',
            height: 'min(90vw, 600px)',
            maxWidth: '600px',
            maxHeight: '600px'
          }}
        >
          <GameBoard
            players={players}
            animatingPlayer={animatingPlayer}
            animationType={animationType}
            alienBlink={alienBlink}
          />
        </div>
      </div>
    </div>
  );
}

