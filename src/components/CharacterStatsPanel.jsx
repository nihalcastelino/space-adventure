import { useState } from 'react';
import { ChevronDown, ChevronUp, User, Award, Package, Target } from 'lucide-react';

/**
 * Character Stats Panel Component
 * 
 * Displays RPG character information
 */
export default function CharacterStatsPanel({ character, isExpanded = false }) {
  const [expanded, setExpanded] = useState(isExpanded);

  if (!character) return null;

  const getStatModifier = (stat) => {
    return Math.floor((stat - 10) / 2);
  };

  const formatModifier = (mod) => {
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const xpForNextLevel = character.level < 10 
    ? (character.level === 1 ? 100 : [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000][character.level] - character.xp)
    : 'MAX';

  const xpProgress = character.level < 10
    ? (character.xp / [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000][character.level]) * 100
    : 100;

  return (
    <div className="bg-gray-900 bg-opacity-95 border-2 border-yellow-400 rounded-lg p-4 mb-4">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-2 gap-2"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <User className="w-5 h-5 text-yellow-300 flex-shrink-0" />
          <span className="text-white font-bold text-sm md:text-lg truncate">{character.name}</span>
          <span className="text-gray-400 text-xs md:text-sm whitespace-nowrap flex-shrink-0">
            Lv.{character.level} {character.class.name}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-yellow-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-yellow-300" />
        )}
      </button>

      {/* Quick Stats (Always Visible) */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="text-center">
          <div className="text-gray-400 text-xs">HP</div>
          <div className="text-green-400 font-bold">
            {character.hp} / {character.maxHp}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs">XP</div>
          <div className="text-blue-400 font-bold">{character.xp}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs">Kills</div>
          <div className="text-red-400 font-bold">{character.kills || 0}</div>
        </div>
      </div>

      {/* Expanded Stats */}
      {expanded && (
        <div className="mt-4 space-y-4 border-t border-gray-700 pt-4">
          {/* Race & Class */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="min-w-0 flex-1">
              <span className="text-gray-400">Race: </span>
              <span className="text-white break-words">{character.race.name} {character.race.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-gray-400">Class: </span>
              <span className="text-white break-words">{character.class.name} {character.class.icon}</span>
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="text-white font-semibold mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Attributes
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(character.stats).map(([stat, value]) => (
                <div key={stat} className="bg-gray-800 rounded p-2">
                  <div className="text-gray-400 text-xs">{stat}</div>
                  <div className="text-yellow-300 font-bold">{value}</div>
                  <div className="text-gray-500 text-xs">
                    {formatModifier(getStatModifier(value))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="text-white font-semibold mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {character.skills.map(skillId => (
                <span
                  key={skillId}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded break-words"
                >
                  {skillId}
                </span>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <div className="text-white font-semibold mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Equipment
            </div>
            <div className="space-y-1">
              {character.equipment.map((eq, idx) => (
                <div key={idx} className="text-xs sm:text-sm text-gray-300 break-words">
                  • {eq.name}
                </div>
              ))}
            </div>
          </div>

          {/* XP Progress */}
          {character.level < 10 && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>XP to Next Level: {xpForNextLevel}</span>
                <span>Level {character.level} → {character.level + 1}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

