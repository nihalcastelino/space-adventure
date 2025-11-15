import { useState } from 'react';
import { Check, Clock, Gift, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuestSystem } from '../hooks/useQuestSystem';
import { useCurrency } from '../hooks/useCurrency';
import { useProgression } from '../hooks/useProgression';

export default function QuestPanel({ className = '' }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'weekly'
  
  const questSystem = useQuestSystem();
  const currency = useCurrency();
  const progression = useProgression();

  const handleClaimReward = (questId, questType) => {
    const quest = questType === 'daily' 
      ? questSystem.dailyQuests.find(q => q.id === questId)
      : questSystem.weeklyChallenges.find(c => c.id === questId);
    
    if (quest && quest.completed && !quest.claimed) {
      // Award rewards
      if (quest.reward.coins) {
        currency.addCoins(quest.reward.coins);
      }
      if (quest.reward.xp) {
        progression.addXP(quest.reward.xp);
      }
      if (quest.reward.powerUp) {
        // Handle power-up reward (would need power-up system integration)
        console.log('Power-up reward:', quest.reward.powerUp);
      }
      
      questSystem.claimQuestReward(questId, questType);
    }
  };

  const stats = questSystem.getQuestStats();
  const availableRewards = questSystem.getAvailableRewards();
  const timeUntilDailyReset = questSystem.getTimeUntilReset('daily');
  const timeUntilWeeklyReset = questSystem.getTimeUntilReset('weekly');

  if (isMinimized) {
    return (
      <div className={`fixed top-4 right-4 z-40 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gray-900 border-2 border-green-400 rounded-lg p-3 shadow-lg hover:bg-gray-800 transition-colors relative"
        >
          <Gift className="w-6 h-6 text-green-400" />
          {availableRewards.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {availableRewards.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] bg-gray-900 border-2 border-green-400 rounded-lg shadow-2xl ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-blue-900 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-bold text-lg">Quests & Challenges</h3>
        </div>
        <div className="flex items-center gap-2">
          {availableRewards.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
              {availableRewards.length}
            </span>
          )}
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'daily'
              ? 'bg-gray-800 text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Daily ({stats.daily.completed}/{stats.daily.total})
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'weekly'
              ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Weekly ({stats.weekly.completed}/{stats.weekly.total})
        </button>
      </div>

      {/* Quest List */}
      <div className="max-h-96 overflow-y-auto p-3 space-y-2">
        {activeTab === 'daily' ? (
          <>
            {questSystem.dailyQuests.map(quest => (
              <QuestItem
                key={quest.id}
                quest={quest}
                questType="daily"
                onClaim={() => handleClaimReward(quest.id, 'daily')}
              />
            ))}
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
              <Clock className="w-3 h-3 inline mr-1" />
              Resets in {timeUntilDailyReset}h
            </div>
          </>
        ) : (
          <>
            {questSystem.weeklyChallenges.map(challenge => (
              <QuestItem
                key={challenge.id}
                quest={challenge}
                questType="weekly"
                onClaim={() => handleClaimReward(challenge.id, 'weekly')}
              />
            ))}
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
              <Clock className="w-3 h-3 inline mr-1" />
              Resets in {timeUntilWeeklyReset}d
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuestItem({ quest, questType, onClaim }) {
  const progress = (quest.progress / quest.target) * 100;
  const isCompleted = quest.completed;
  const isClaimed = quest.claimed;

  return (
    <div className={`p-3 rounded-lg border-2 ${
      isCompleted && !isClaimed
        ? 'bg-green-900/30 border-green-500'
        : isClaimed
        ? 'bg-gray-800 border-gray-700 opacity-60'
        : 'bg-gray-800 border-gray-700'
    }`}>
      {/* Quest Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-white font-medium text-sm">{quest.name}</h4>
          <p className="text-gray-400 text-xs mt-1">{quest.description}</p>
        </div>
        {isClaimed && (
          <Check className="w-5 h-5 text-green-400 flex-shrink-0 ml-2" />
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{quest.progress} / {quest.target}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center gap-2 text-xs">
        {quest.reward.coins && (
          <span className="text-yellow-400 font-medium">
            🪙 {quest.reward.coins} coins
          </span>
        )}
        {quest.reward.xp && (
          <span className="text-blue-400 font-medium">
            ⭐ {quest.reward.xp} XP
          </span>
        )}
        {quest.reward.powerUp && (
          <span className="text-purple-400 font-medium">
            ⚡ Power-up
          </span>
        )}
      </div>

      {/* Claim Button */}
      {isCompleted && !isClaimed && (
        <button
          onClick={onClaim}
          className="w-full mt-2 py-1.5 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold text-xs rounded transition-all"
        >
          Claim Reward
        </button>
      )}
    </div>
  );
}

