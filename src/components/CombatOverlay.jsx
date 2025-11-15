import { useState, useEffect } from 'react';
import { Sword, Shield, Eye, MessageSquare, Zap } from 'lucide-react';

/**
 * Combat Overlay Component
 * 
 * Shows combat interface when player encounters an alien
 */
export default function CombatOverlay({
  character,
  combatState,
  onAttack,
  onSkillUse,
  onFlee
}) {
  const [selectedAction, setSelectedAction] = useState(null);

  // Reset selected action when combat state changes
  useEffect(() => {
    if (!combatState) {
      setSelectedAction(null);
    }
  }, [combatState]);

  if (!combatState || !character) return null;

  const alienHpPercent = (combatState.alienHp / combatState.alienMaxHp) * 100;
  const playerHpPercent = (combatState.playerHp / combatState.playerMaxHp) * 100;

  const availableSkills = character.skills.filter(skill => 
    ['combat', 'persuasion', 'diplomacy', 'stealth', 'evasion'].includes(skill)
  );

  const handleAction = (action, skill = null) => {
    setSelectedAction(action);
    if (action === 'attack') {
      onAttack(skill || 'combat');
    } else if (action === 'skill' && skill) {
      onSkillUse(skill);
    } else if (action === 'flee') {
      onFlee();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-4 md:p-6 lg:p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-red-400 mb-4 text-center break-words">
          👾 Alien Encounter!
        </h2>

        {/* Alien Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-2 gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-sm md:text-lg break-words">
                {combatState.alienName || `Level ${combatState.alienLevel} Alien`}
              </div>
              <div className="text-gray-400 text-xs md:text-sm mb-1 break-words">
                {combatState.alienDesc || `A dangerous creature at position ${combatState.alienPosition}`}
              </div>
              <div className="text-gray-500 text-xs whitespace-nowrap">Level {combatState.alienLevel} • Position {combatState.alienPosition}</div>
            </div>
            <div className="text-2xl md:text-4xl flex-shrink-0">👾</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
            <div
              className="bg-red-500 h-4 rounded-full transition-all"
              style={{ width: `${alienHpPercent}%` }}
            />
          </div>
          <div className="text-gray-300 text-sm">
            HP: {combatState.alienHp} / {combatState.alienMaxHp}
          </div>
        </div>

        {/* Player Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start mb-2 gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-white font-semibold text-sm md:text-lg break-words">{character.name}</div>
              <div className="text-gray-400 text-xs md:text-sm break-words">
                Level {character.level} {character.class.name}
              </div>
            </div>
            <div className="text-xl md:text-2xl flex-shrink-0">{character.class.icon}</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
            <div
              className="bg-green-500 h-4 rounded-full transition-all"
              style={{ width: `${playerHpPercent}%` }}
            />
          </div>
          <div className="text-gray-300 text-sm">
            HP: {combatState.playerHp} / {combatState.playerMaxHp}
          </div>
          {combatState.playerHp <= 0 && (
            <div className="text-red-400 text-sm font-semibold mt-2">
              ⚠️ You are knocked out!
            </div>
          )}
        </div>

        {/* Combat Actions */}
        {combatState.turn === 'player' && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-2">Choose Your Action:</h3>
            
            {/* Attack */}
            <button
              onClick={() => handleAction('attack')}
              disabled={selectedAction !== null}
              className="w-full flex items-center gap-3 p-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
            >
              <Sword className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm md:text-base break-words">Attack</span>
            </button>

            {/* Skills */}
            {availableSkills.map(skillId => {
              const skill = {
                combat: { name: 'Combat Strike', icon: Sword, desc: 'Deal extra damage' },
                persuasion: { name: 'Persuade', icon: MessageSquare, desc: 'Try to talk your way out' },
                diplomacy: { name: 'Diplomacy', icon: MessageSquare, desc: 'Negotiate peacefully' },
                stealth: { name: 'Sneak Past', icon: Eye, desc: 'Try to avoid combat' },
                evasion: { name: 'Dodge', icon: Zap, desc: 'Increase evasion chance' }
              }[skillId];

              if (!skill) return null;

              return (
                <button
                  key={skillId}
                  onClick={() => handleAction('skill', skillId)}
                  disabled={selectedAction !== null}
                  className="w-full flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                >
                  <skill.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="break-words">{skill.name}</div>
                    <div className="text-xs text-gray-300 break-words">{skill.desc}</div>
                  </div>
                </button>
              );
            })}

            {/* Flee */}
            <button
              onClick={() => handleAction('flee')}
              disabled={selectedAction !== null}
              className="w-full flex items-center gap-3 p-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className="break-words text-sm md:text-base">Flee (Return to Checkpoint)</span>
            </button>
          </div>
        )}

        {combatState.turn === 'alien' && (
          <div className="text-center py-4">
            <div className="text-yellow-400 text-lg font-semibold mb-2">
              👾 Alien's turn...
            </div>
            <div className="text-gray-400 text-sm">
              The alien is attacking!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

