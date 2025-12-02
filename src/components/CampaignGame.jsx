import { useState } from 'react';
import { ArrowLeft, Lock, Star, Map, Play, Trophy } from 'lucide-react';
import AIGame from './AIGame';
import { CAMPAIGN_LEVELS } from '../data/campaignLevels';
import { useGameSounds } from '../hooks/useGameSounds';
import { getScreenBackground } from '../utils/backgrounds';

export default function CampaignGame({ onBack }) {
    console.log('CampaignGame mounted!');
    const { playSound } = useGameSounds();
    const [selectedLevel, setSelectedLevel] = useState(null);

    // TODO: Integrate with progression system to check unlocked levels
    const unlockedLevels = ['level_1', 'level_2', 'level_3', 'level_4', 'level_5']; // Temporary: unlock first 5 levels

    const handleLevelSelect = (level) => {
        if (!unlockedLevels.includes(level.id)) {
            playSound('error');
            return;
        }
        playSound('click');
        setSelectedLevel(level);
    };

    const handleBackToMap = () => {
        playSound('click');
        setSelectedLevel(null);
    };

    if (selectedLevel) {
        return (
            <AIGame
                onBack={handleBackToMap}
                initialDifficulty={selectedLevel.difficulty}
                aiDifficulty={selectedLevel.difficulty === 'easy' ? 'easy' : selectedLevel.difficulty === 'hard' ? 'hard' : 'medium'}
                gameVariant="classic" // Campaign levels might override this internally via mechanics
                campaignLevelId={selectedLevel.id}
            />
        );
    }

    return (
        <div
            className="fixed inset-0 flex flex-col bg-black overflow-hidden"
            style={{
                backgroundImage: `url(/${getScreenBackground('menu')})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/70" />

            {/* Header */}
            <div className="relative z-10 p-4 flex items-center justify-between border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Map className="w-6 h-6 text-purple-400" />
                            Campaign Mode
                        </h1>
                        <p className="text-sm text-gray-400">Conquer the galaxy, one sector at a time</p>
                    </div>
                </div>
            </div>

            {/* Level Map / List */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CAMPAIGN_LEVELS.map((level, index) => {
                        const isUnlocked = unlockedLevels.includes(level.id);
                        const isNext = !isUnlocked && unlockedLevels.includes(CAMPAIGN_LEVELS[index - 1]?.id);

                        return (
                            <button
                                key={level.id}
                                onClick={() => handleLevelSelect(level)}
                                disabled={!isUnlocked}
                                className={`relative group text-left p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${isUnlocked
                                    ? 'bg-gray-800/80 border-purple-500/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20'
                                    : 'bg-gray-900/80 border-gray-700 opacity-75 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg ${isUnlocked ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                        {isUnlocked ? (
                                            <Star className="w-6 h-6 text-white fill-white" />
                                        ) : (
                                            <Lock className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                    {isUnlocked && (
                                        <div className="bg-black/50 px-2 py-1 rounded text-xs font-mono text-purple-300">
                                            LVL {index + 1}
                                        </div>
                                    )}
                                </div>

                                <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                    {level.name}
                                </h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                    {level.description}
                                </p>

                                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Trophy className="w-3 h-3" />
                                        {level.rewards?.coins || 0} Coins
                                    </span>
                                    <span className="uppercase px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                                        {level.difficulty}
                                    </span>
                                </div>

                                {/* Play Button Overlay (on hover) */}
                                {isUnlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[2px]">
                                        <div className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <Play className="w-4 h-4 fill-current" />
                                            PLAY
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
