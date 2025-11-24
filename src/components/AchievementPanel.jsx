import { X, Lock, Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '../lib/achievements';
import { useAchievements } from '../hooks/useAchievements';
import { useGameSounds } from '../hooks/useGameSounds';

export default function AchievementPanel({ isOpen, onClose }) {
  const { unlockedAchievements, isUnlocked } = useAchievements();
  const { playSound } = useGameSounds();
  const allAchievements = Object.values(ACHIEVEMENTS);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass rounded-lg border-4 border-yellow-400 shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <header className="flex-shrink-0 p-4 border-b border-yellow-400/30 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Achievements
          </h2>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="glass rounded-lg p-2 border-2 border-gray-700 hover:border-red-400"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allAchievements.map((achievement) => {
              const unlocked = isUnlocked(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${
                    unlocked ? 'border-yellow-400 bg-yellow-500/10' : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl ${unlocked ? 'text-yellow-300' : 'text-gray-600'}`}>
                      {unlocked ? <Trophy /> : <Lock />}
                    </div>
                    <div>
                      <h3 className={`font-bold ${unlocked ? 'text-white' : 'text-gray-400'}`}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-yellow-400 font-bold mt-2">
                        Reward: {achievement.reward} Coins
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
