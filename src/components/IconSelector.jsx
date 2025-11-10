import { useState } from 'react';
import { X } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';

/**
 * Space Vehicle Icons
 */
export const VEHICLE_ICONS = [
  { id: 'rocket', icon: '🚀', name: 'Classic Rocket', description: 'The original space explorer' },
  { id: 'ufo', icon: '🛸', name: 'UFO', description: 'Flying saucer from beyond' },
  { id: 'satellite', icon: '🛰️', name: 'Satellite', description: 'Orbital observer' },
  { id: 'shooting_star', icon: '🌠', name: 'Shooting Star', description: 'Blazing through space' },
  { id: 'star', icon: '⭐', name: 'Star Ship', description: 'Shine bright like a star' },
  { id: 'comet', icon: '💫', name: 'Comet', description: 'Speeding through the cosmos' },
  { id: 'sparkle', icon: '✨', name: 'Sparkle Ship', description: 'Dazzling and bright' },
  { id: 'fire', icon: '🔥', name: 'Fire Ship', description: 'Burning through space' },
  { id: 'lightning', icon: '⚡', name: 'Lightning Bolt', description: 'Fast as lightning' },
  { id: 'moon', icon: '🌙', name: 'Moon Ship', description: 'Lunar traveler' },
  { id: 'planet', icon: '🪐', name: 'Planet Hopper', description: 'Ring around the cosmos' },
  { id: 'sun', icon: '☀️', name: 'Solar Flyer', description: 'Bright as the sun' }
];

/**
 * Icon Selector Modal
 */
export default function IconSelector({ isOpen, onClose, onSelectIcon, currentIcon, playerName }) {
  const { playSound } = useGameSounds();
  const [hoveredIcon, setHoveredIcon] = useState(null);

  if (!isOpen) return null;

  const handleSelect = (iconData) => {
    playSound('click');
    onSelectIcon(iconData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="glass rounded-lg border-4 border-yellow-400 shadow-2xl overflow-hidden"
        style={{
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(40, 20, 60, 0.95))'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-yellow-400/30 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
              🚀 Choose Your Vehicle
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              Select your space vehicle for {playerName}
            </p>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="glass rounded-lg p-2 border-2 border-gray-700 hover:border-red-400 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Icon Grid */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {VEHICLE_ICONS.map((iconData) => {
              const isSelected = currentIcon === iconData.icon;
              const isHovered = hoveredIcon === iconData.id;

              return (
                <button
                  key={iconData.id}
                  onClick={() => handleSelect(iconData)}
                  onMouseEnter={() => setHoveredIcon(iconData.id)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className={`
                    glass rounded-lg p-3 border-2 transition-all transform
                    ${isSelected
                      ? 'border-yellow-400 scale-105 shadow-lg shadow-yellow-400/50'
                      : 'border-gray-700 hover:border-blue-400 hover:scale-105'
                    }
                  `}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 146, 60, 0.2))'
                      : 'rgba(31, 41, 55, 0.5)'
                  }}
                >
                  {/* Icon */}
                  <div className="text-4xl mb-2 flex items-center justify-center">
                    {iconData.icon}
                  </div>

                  {/* Name */}
                  <div className="text-white text-xs font-bold text-center mb-1">
                    {iconData.name}
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="text-yellow-300 text-xs text-center">
                      ✓ Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Description */}
          {hoveredIcon && (
            <div className="mt-4 p-3 glass rounded-lg border-2 border-blue-400/30">
              <p className="text-blue-300 text-sm text-center">
                {VEHICLE_ICONS.find(i => i.id === hoveredIcon)?.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-yellow-400/30 flex justify-end gap-2">
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-4 py-2 rounded-lg font-bold text-white bg-gray-700 hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Quick Icon Button (for player panels)
 */
export function QuickIconButton({ currentIcon, onOpenSelector, playerName }) {
  const { playSound } = useGameSounds();

  return (
    <button
      onClick={() => {
        playSound('click');
        onOpenSelector();
      }}
      className="glass rounded-lg px-3 py-1 border-2 border-gray-700 hover:border-yellow-400 transition-all flex items-center gap-2"
      title={`Change ${playerName}'s vehicle`}
    >
      <span className="text-2xl">{currentIcon}</span>
      <span className="text-white text-xs">Change</span>
    </button>
  );
}
