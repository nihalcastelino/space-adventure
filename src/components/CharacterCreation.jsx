import { useState } from 'react';
import { CHARACTER_CLASSES, CHARACTER_RACES } from '../hooks/useRPGSystem';

/**
 * Character Creation Component
 * 
 * Allows players to create their RPG character before starting the game
 */
export default function CharacterCreation({ onComplete, playerName }) {
  const [selectedClass, setSelectedClass] = useState('pilot');
  const [selectedRace, setSelectedRace] = useState('human');
  const [customName, setCustomName] = useState(playerName || '');

  const charClass = CHARACTER_CLASSES[selectedClass];
  const race = CHARACTER_RACES[selectedRace];

  // Calculate preview stats
  const previewStats = {
    STR: 8 + (charClass.statBonuses.STR || 0) + (race.statBonuses.STR || 0),
    DEX: 8 + (charClass.statBonuses.DEX || 0) + (race.statBonuses.DEX || 0),
    INT: 8 + (charClass.statBonuses.INT || 0) + (race.statBonuses.INT || 0),
    CON: 8 + (charClass.statBonuses.CON || 0) + (race.statBonuses.CON || 0),
    WIS: 8 + (charClass.statBonuses.WIS || 0) + (race.statBonuses.WIS || 0),
    CHA: 8 + (charClass.statBonuses.CHA || 0) + (race.statBonuses.CHA || 0)
  };

  const handleCreate = () => {
    if (!customName.trim()) {
      alert('Please enter a character name');
      return;
    }
    onComplete({
      className: selectedClass,
      raceName: selectedRace,
      characterName: customName.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-4 md:p-6 lg:p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-300 mb-4 md:mb-6 text-center break-words">
          Create Your Character
        </h2>

        {/* Character Name */}
        <div className="mb-4 md:mb-6">
          <label className="block text-white font-semibold text-sm md:text-base mb-2">Character Name</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full px-3 md:px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm md:text-base focus:outline-none focus:border-yellow-400"
            placeholder="Enter your character's name"
            maxLength={20}
          />
        </div>

        {/* Class Selection */}
        <div className="mb-4 md:mb-6">
          <label className="block text-white font-semibold text-sm md:text-base mb-2 md:mb-3">Choose Your Class</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(CHARACTER_CLASSES).map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                className={`p-3 md:p-4 rounded-lg border-2 transition-all min-w-0 ${
                  selectedClass === cls.id
                    ? 'border-yellow-400 bg-yellow-400/20'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl md:text-3xl mb-2">{cls.icon}</div>
                <div className="text-white font-semibold text-xs md:text-sm break-words">{cls.name}</div>
                <div className="text-gray-400 text-xs mt-1 break-words line-clamp-2">{cls.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Race Selection */}
        <div className="mb-4 md:mb-6">
          <label className="block text-white font-semibold text-sm md:text-base mb-2 md:mb-3">Choose Your Race</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(CHARACTER_RACES).map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRace(r.id)}
                className={`p-3 md:p-4 rounded-lg border-2 transition-all min-w-0 ${
                  selectedRace === r.id
                    ? 'border-yellow-400 bg-yellow-400/20'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl md:text-3xl mb-2">{r.icon}</div>
                <div className="text-white font-semibold text-xs md:text-sm break-words">{r.name}</div>
                <div className="text-gray-400 text-xs mt-1 break-words line-clamp-2">{r.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mb-4 md:mb-6 bg-gray-800 rounded-lg p-3 md:p-4">
          <h3 className="text-white font-semibold text-sm md:text-base mb-2 md:mb-3">Character Stats Preview</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {Object.entries(previewStats).map(([stat, value]) => (
              <div key={stat} className="text-center">
                <div className="text-gray-400 text-xs mb-1">{stat}</div>
                <div className="text-yellow-300 font-bold text-base md:text-lg">{value}</div>
                <div className="text-gray-500 text-xs">
                  {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}
                  {Math.floor((value - 10) / 2)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs sm:text-sm text-gray-400 break-words">
            <div>Starting Skills: {charClass.startingSkills.join(', ')}</div>
            <div>Racial Ability: {race.racialAbility}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 md:gap-4 justify-end">
          <button
            onClick={handleCreate}
            className="px-4 md:px-6 py-2 md:py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm md:text-base rounded-lg transition-all transform hover:scale-105"
          >
            Create Character
          </button>
        </div>
      </div>
    </div>
  );
}

