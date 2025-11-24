import { X } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';
import { SHIP_ABILITIES } from '../lib/abilities';

/**
 * Space Vehicle Icons
 */
export const VEHICLE_ICONS = [
  { id: 'rocket', icon: '🚀', name: 'Classic Rocket' },
  { id: 'shield', icon: '🛡️', name: 'Guardian' },
  { id: 'speedster', icon: '⚡', name: 'Speedster' },
  { id: 'explorer', icon: '🛸', name: 'Explorer' },
  { id: 'satellite', icon: '🛰️', name: 'Satellite' },
  { id: 'shooting_star', icon: '🌠', name: 'Shooting Star' },
];

/**
 * Icon Selector Modal
 */
export default function IconSelector({ isOpen, onClose, onSelectIcon, currentIcon, playerName }) {
  const { playSound } = useGameSounds();

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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VEHICLE_ICONS.map((iconData) => {
              const isSelected = currentIcon === iconData.icon;
              const ability = SHIP_ABILITIES[iconData.icon];

              return (
                <button
                  key={iconData.id}
                  onClick={() => handleSelect(iconData)}
                  className={`
                    glass rounded-lg p-3 border-2 text-center transition-all transform
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
                  <div className="text-4xl mb-2">{iconData.icon}</div>
                  <div className="text-white text-xs font-bold mb-1">{iconData.name}</div>
                  {ability && (
                    <div className="text-blue-300 text-[10px] leading-tight">
                      <p className="font-bold">{ability.name}</p>
                      <p>{ability.description}</p>
                    </div>
                  )}
                  {isSelected && (
                    <div className="text-yellow-300 text-xs text-center mt-2">
                      ✓ Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
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
