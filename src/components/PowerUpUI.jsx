import { X, Zap, ShoppingBag, Coins, Info, Star } from 'lucide-react';
import { POWERUPS, RARITY_COLORS } from '../hooks/usePowerUps';
import { useState } from 'react';

export function PowerUpCard({ powerUp, count, onUse, canUse = true, compact = false }) {
  const [showInfo, setShowInfo] = useState(false);

  const rarityColor = RARITY_COLORS[powerUp.rarity] || RARITY_COLORS.common;

  if (compact) {
    return (
      <div className={`relative p-2 rounded-lg border-2 bg-gradient-to-br ${rarityColor} transition-all ${
        canUse ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'
      }`}
      onClick={() => canUse && onUse && onUse(powerUp.id)}
      >
        <div className="text-center">
          <div className="text-3xl mb-1">{powerUp.icon}</div>
          <div className="text-white text-xs font-bold truncate">{powerUp.name}</div>
          {count !== undefined && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black border-2 border-white">
              {count}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative p-4 rounded-lg border-2 bg-gradient-to-br ${rarityColor} transition-all`}>
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
      >
        <Info className="w-4 h-4 text-white" />
      </button>

      <div className="text-center mb-3">
        <div className="text-5xl mb-2">{powerUp.icon}</div>
        <h3 className="text-white font-bold text-lg">{powerUp.name}</h3>
        <p className="text-gray-300 text-xs mt-1 capitalize">{powerUp.rarity}</p>
      </div>

      {showInfo && (
        <div className="mb-3 p-2 bg-black bg-opacity-40 rounded text-white text-sm">
          {powerUp.description}
        </div>
      )}

      {count !== undefined && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="bg-black bg-opacity-40 px-3 py-1 rounded-full">
            <span className="text-white font-bold">Owned: {count}</span>
          </div>
        </div>
      )}

      {onUse && (
        <button
          onClick={() => onUse(powerUp.id)}
          disabled={!canUse}
          className={`w-full py-2 rounded-lg font-bold transition-all ${
            canUse
              ? 'bg-white text-gray-900 hover:bg-gray-200'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Use Power-Up
        </button>
      )}
    </div>
  );
}

export function PowerUpInventory({ inventory, activeEffects, onUsePowerUp, className = '', gameActive = false }) {
  const [showAll, setShowAll] = useState(false);

  const powerUpsInInventory = Object.entries(inventory)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => {
      const powerUp = Object.values(POWERUPS).find(p => p.id === id);
      return { powerUp, count };
    })
    .filter(item => item.powerUp);

  const displayedPowerUps = showAll ? powerUpsInInventory : powerUpsInInventory.slice(0, 4);

  if (powerUpsInInventory.length === 0) {
    return (
      <div className={`bg-gray-900 bg-opacity-90 rounded-lg p-4 border-2 border-gray-700 ${className}`}>
        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Power-Ups
        </h3>
        <p className="text-gray-400 text-sm">No power-ups yet. Win games or visit the shop!</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 bg-opacity-90 rounded-lg p-4 border-2 border-yellow-400 border-opacity-30 ${className}`}>
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        Power-Ups ({powerUpsInInventory.length})
      </h3>

      {/* Active effects */}
      {Object.keys(activeEffects).length > 0 && (
        <div className="mb-3 p-2 bg-green-900 bg-opacity-40 rounded-lg border border-green-400">
          <p className="text-green-400 text-xs font-bold mb-1">Active Effects:</p>
          {Object.entries(activeEffects).map(([id, remaining]) => {
            const powerUp = Object.values(POWERUPS).find(p => p.id === id);
            if (!powerUp) return null;
            return (
              <div key={id} className="text-white text-xs flex items-center gap-1">
                <span>{powerUp.icon}</span>
                <span>{powerUp.name}</span>
                {powerUp.duration === 'turns' && (
                  <span className="text-green-400">({remaining} turns)</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {displayedPowerUps.map(({ powerUp, count }) => (
          <PowerUpCard
            key={powerUp.id}
            powerUp={powerUp}
            count={count}
            onUse={onUsePowerUp}
            canUse={gameActive}
            compact
          />
        ))}
      </div>

      {powerUpsInInventory.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2 py-1 text-yellow-400 hover:text-yellow-300 text-sm font-bold transition-colors"
        >
          {showAll ? 'Show Less' : `Show All (${powerUpsInInventory.length - 4} more)`}
        </button>
      )}
    </div>
  );
}

export function PowerUpShop({ coins, inventory, onPurchase, onClose }) {
  const [selectedPowerUp, setSelectedPowerUp] = useState(null);
  const [filter, setFilter] = useState('all'); // all, common, uncommon, rare, epic

  const powerUpsList = Object.values(POWERUPS);
  const filteredPowerUps = filter === 'all'
    ? powerUpsList
    : powerUpsList.filter(p => p.rarity === filter);

  const handlePurchase = (powerUpId) => {
    const result = onPurchase(powerUpId);
    if (result.success) {
      setSelectedPowerUp(null);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col border-2 border-yellow-400">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-yellow-400" />
                Power-Up Shop
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Purchase power-ups to gain an edge in your games
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">{coins}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="p-4 border-b border-gray-700 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({powerUpsList.length})
          </button>
          {['common', 'uncommon', 'rare', 'epic'].map(rarity => {
            const count = powerUpsList.filter(p => p.rarity === rarity).length;
            return (
              <button
                key={rarity}
                onClick={() => setFilter(rarity)}
                className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap capitalize transition-all ${
                  filter === rarity
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {rarity} ({count})
              </button>
            );
          })}
        </div>

        {/* Power-ups grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPowerUps.map(powerUp => {
              const owned = inventory[powerUp.id] || 0;
              const canAfford = coins >= powerUp.cost;
              const rarityColor = RARITY_COLORS[powerUp.rarity];

              return (
                <div
                  key={powerUp.id}
                  className={`p-4 rounded-lg border-2 bg-gradient-to-br ${rarityColor} transition-all`}
                >
                  <div className="text-center mb-3">
                    <div className="text-5xl mb-2">{powerUp.icon}</div>
                    <h3 className="text-white font-bold text-lg">{powerUp.name}</h3>
                    <p className="text-gray-300 text-xs mt-1 capitalize">{powerUp.rarity}</p>
                  </div>

                  <p className="text-white text-sm mb-3 text-center h-10">
                    {powerUp.description}
                  </p>

                  {owned > 0 && (
                    <div className="text-center mb-2">
                      <span className="bg-black bg-opacity-40 px-3 py-1 rounded-full text-white text-sm font-bold">
                        Owned: {owned}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => handlePurchase(powerUp.id)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-yellow-600 text-white hover:bg-yellow-500'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    {powerUp.cost}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer tip */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <p className="text-gray-400 text-sm text-center">
            💡 Tip: Earn coins by winning games, completing achievements, and watching ads!
          </p>
        </div>
      </div>
    </div>
  );
}

export function CoinDisplay({ coins = 0, className = '' }) {
  const coinsValue = typeof coins === 'number' ? coins : parseInt(coins) || 0;
  
  return (
    <div className={`bg-gradient-to-r from-yellow-600 to-yellow-500 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg border-2 border-yellow-400 ${className}`}>
      <Coins className="w-5 h-5 text-white flex-shrink-0" />
      <span className="text-white font-bold text-lg">{coinsValue.toLocaleString()}</span>
    </div>
  );
}

export function LevelDisplay({ level = 1, className = '' }) {
  return (
    <div className={`glass rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-lg border-2 border-purple-400 border-opacity-50 ${className}`}>
      <Star className="w-5 h-5 text-purple-300 flex-shrink-0" />
      <span className="text-white font-bold text-lg">{level}</span>
    </div>
  );
}
