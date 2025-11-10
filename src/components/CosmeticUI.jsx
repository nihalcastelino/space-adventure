import { X, Palette, Check, Lock, Crown, Coins } from 'lucide-react';
import { useState } from 'react';
import {
  ROCKET_SKINS,
  BOARD_THEMES,
  TRAIL_EFFECTS,
  DICE_SKINS
} from '../hooks/useCosmetics';

export function CosmeticCard({ cosmetic, owned, equipped, canUnlock, onEquip, onPurchase, coins, isPremium }) {
  const handleAction = () => {
    if (equipped) return; // Already equipped
    if (owned) {
      onEquip();
    } else if (canUnlock) {
      onPurchase();
    }
  };

  const buttonText = equipped ? 'Equipped' : owned ? 'Equip' : `Buy (${cosmetic.cost} coins)`;
  const isDisabled = equipped || (!owned && !canUnlock) || (!owned && coins < cosmetic.cost);

  return (
    <div className={`relative p-4 rounded-lg border-2 transition-all ${
      equipped
        ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-400 shadow-lg shadow-yellow-500/30'
        : owned
        ? 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600 hover:border-yellow-400'
        : canUnlock
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-400'
        : 'bg-gradient-to-br from-gray-900 to-black border-gray-800 opacity-60'
    }`}>
      {/* Premium badge */}
      {isPremium && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-1">
          <Crown className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Lock overlay */}
      {!owned && !canUnlock && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 text-xs font-bold">Level {cosmetic.unlockLevel}</p>
          </div>
        </div>
      )}

      <div className="text-center mb-3">
        <div className="text-4xl mb-2">{cosmetic.icon || '🎨'}</div>
        <h4 className="text-white font-bold">{cosmetic.name}</h4>
        <p className="text-gray-400 text-xs capitalize mt-1">{cosmetic.rarity}</p>
      </div>

      <button
        onClick={handleAction}
        disabled={isDisabled}
        className={`w-full py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
          equipped
            ? 'bg-green-600 text-white cursor-default'
            : owned
            ? 'bg-yellow-600 text-white hover:bg-yellow-500'
            : canUnlock && coins >= cosmetic.cost
            ? 'bg-blue-600 text-white hover:bg-blue-500'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {equipped && <Check className="w-4 h-4" />}
        {!owned && canUnlock && <Coins className="w-4 h-4" />}
        {buttonText}
      </button>
    </div>
  );
}

export function CustomizationModal({
  equippedCosmetics,
  ownedCosmetics,
  level,
  coins,
  onEquip,
  onPurchase,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('rocketSkin'); // rocketSkin, boardTheme, trailEffect, diceSkin

  const tabs = [
    { id: 'rocketSkin', label: 'Rocket Skins', items: ROCKET_SKINS },
    { id: 'boardTheme', label: 'Board Themes', items: BOARD_THEMES },
    { id: 'trailEffect', label: 'Trail Effects', items: TRAIL_EFFECTS },
    { id: 'diceSkin', label: 'Dice Skins', items: DICE_SKINS }
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);
  const items = Object.values(activeTabData.items);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col border-2 border-yellow-400">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Palette className="w-6 h-6 text-yellow-400" />
              Customization
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Personalize your game experience
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">{coins}</span>
            </div>
            <div className="bg-blue-600 px-4 py-2 rounded-lg">
              <span className="text-white font-bold text-lg">Level {level}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-4 border-b border-gray-700 flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => {
              const owned = ownedCosmetics[`${activeTab}s`]?.includes(item.id);
              const equipped = equippedCosmetics[activeTab] === item.id;
              const canUnlock = level >= item.unlockLevel;

              return (
                <CosmeticCard
                  key={item.id}
                  cosmetic={item}
                  owned={owned}
                  equipped={equipped}
                  canUnlock={canUnlock}
                  coins={coins}
                  isPremium={item.isPremium}
                  onEquip={() => onEquip(activeTab, item.id)}
                  onPurchase={() => onPurchase(activeTab, item.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <p className="text-gray-400 text-sm text-center">
            <Crown className="w-4 h-4 inline text-yellow-400" /> Premium items require the Premium Pass
          </p>
        </div>
      </div>
    </div>
  );
}

export function QuickCustomizeButton({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 shadow-lg ${className}`}
    >
      <Palette className="w-5 h-5" />
      Customize
    </button>
  );
}

// Preview component to show equipped cosmetics
export function CosmeticPreview({ equippedCosmetics, className = '' }) {
  const rocketSkin = Object.values(ROCKET_SKINS).find(s => s.id === equippedCosmetics.rocketSkin) || ROCKET_SKINS.DEFAULT;
  const boardTheme = Object.values(BOARD_THEMES).find(t => t.id === equippedCosmetics.boardTheme) || BOARD_THEMES.DEFAULT;
  const trailEffect = Object.values(TRAIL_EFFECTS).find(e => e.id === equippedCosmetics.trailEffect) || TRAIL_EFFECTS.NONE;
  const diceSkin = Object.values(DICE_SKINS).find(d => d.id === equippedCosmetics.diceSkin) || DICE_SKINS.DEFAULT;

  return (
    <div className={`bg-gray-900 bg-opacity-90 rounded-lg p-3 border-2 border-purple-400 border-opacity-30 ${className}`}>
      <h3 className="text-white font-bold mb-2 text-sm flex items-center gap-2">
        <Palette className="w-4 h-4 text-purple-400" />
        Equipped
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800 rounded p-2 text-center">
          <div className="text-2xl mb-1">{rocketSkin.icon}</div>
          <div className="text-white text-xs truncate">{rocketSkin.name}</div>
        </div>
        <div className="bg-gray-800 rounded p-2 text-center">
          <div className="text-2xl mb-1">{diceSkin.icon}</div>
          <div className="text-white text-xs truncate">{diceSkin.name}</div>
        </div>
      </div>
    </div>
  );
}
