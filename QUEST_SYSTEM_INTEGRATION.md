# Quest System Integration Guide

## Overview
The Quest System adds daily quests and weekly challenges to improve player retention and engagement. Players complete objectives to earn coins, XP, and power-ups.

## Files Created
1. `src/hooks/useQuestSystem.js` - Quest tracking and management hook
2. `src/components/QuestPanel.jsx` - UI component for displaying quests

## Integration Steps

### 1. Add Quest System to Game Components

#### In `LocalGame.jsx`, `AIGame.jsx`, `OnlineGame.jsx`, `RPGGame.jsx`:

```javascript
import { useQuestSystem } from '../hooks/useQuestSystem';
import QuestPanel from '../components/QuestPanel';

// Inside component:
const questSystem = useQuestSystem();

// Track game events:
useEffect(() => {
  if (gameWon) {
    questSystem.trackGameEvent('game_won', { 
      difficulty,
      isOnline: gameMode === 'online' 
    });
  }
  
  if (gameStarted) {
    questSystem.trackGameEvent('game_played');
  }
}, [gameWon, gameStarted]);

// Track power-up usage (in power-up handler):
const handleUsePowerUp = (powerUpId) => {
  // ... existing power-up logic ...
  questSystem.trackGameEvent('powerup_used');
};

// Track checkpoint reached (in movePlayer or similar):
if (newCheckpoint > player.lastCheckpoint) {
  questSystem.trackGameEvent('checkpoint_reached', { 
    checkpoint: newCheckpoint 
  });
}

// Render QuestPanel:
return (
  <div>
    {/* ... existing game UI ... */}
    <QuestPanel />
  </div>
);
```

### 2. Track Three 6s in One Game

In `useGameLogic.js` or game component:

```javascript
const [sixesInGame, setSixesInGame] = useState(0);

// In rollDice function:
if (diceValue === 6) {
  const newSixes = sixesInGame + 1;
  setSixesInGame(newSixes);
  
  if (newSixes >= 3) {
    questSystem.trackThreeSixes();
  }
}

// Reset on game start:
const resetGame = () => {
  setSixesInGame(0);
  // ... other reset logic ...
};
```

### 3. Add Quest Panel to Main Menu (Optional)

In `GameModeSelector.jsx`:

```javascript
import QuestPanel from './QuestPanel';

// Show quest panel on main menu:
return (
  <div>
    {/* ... existing menu ... */}
    <QuestPanel />
  </div>
);
```

### 4. Integrate with Enhanced Game Wrapper

If using `EnhancedGameWrapper.jsx`, add quest system there:

```javascript
import { useQuestSystem } from '../hooks/useQuestSystem';
import QuestPanel from '../components/QuestPanel';

function EnhancedGameWrapper({ children, ...props }) {
  const questSystem = useQuestSystem();
  
  // Track events from wrapper level
  useEffect(() => {
    // Track game starts, wins, etc.
  }, [/* dependencies */]);
  
  return (
    <div>
      {children}
      <QuestPanel />
      {/* ... other UI ... */}
    </div>
  );
}
```

## Quest Types

### Daily Quests (Reset at Midnight)
- **Play 3 Games**: Complete 3 games → 50 coins + 25 XP
- **Win a Game**: Win any game → 75 coins + 50 XP
- **Power User**: Use 5 power-ups → 60 coins + 30 XP
- **Checkpoint Master**: Reach checkpoint 50+ → 100 coins + 40 XP
- **Lucky Roller**: Roll three 6s in one game → 80 coins + 35 XP

### Weekly Challenges (Reset on Monday)
- **Weekly Winner**: Win 5 games → 300 coins + 150 XP + Random Power-up
- **Active Player**: Play 15 games → 250 coins + 120 XP
- **Challenge Accepted**: Win 3 hard mode games → 500 coins + 200 XP + Epic Power-up

## Event Tracking

The quest system automatically tracks these events:
- `game_played` - Increments "Play X games" quests
- `game_won` - Completes "Win a game" quests
- `powerup_used` - Increments power-up usage quests
- `checkpoint_reached` - Checks for checkpoint milestones
- `dice_rolled` - Tracks dice values (for sixes tracking)

## Customization

### Adding New Quests

Edit `src/hooks/useLevelRewards.js`:

```javascript
export const DAILY_QUESTS = [
  // ... existing quests ...
  { 
    id: 'new_quest_id', 
    name: 'New Quest Name', 
    description: 'Quest description', 
    reward: { coins: 100, xp: 50 }, 
    target: 10 
  }
];
```

### Modifying Quest Rewards

Edit quest definitions in `useLevelRewards.js` to change rewards, targets, or add new quest types.

### Styling

Modify `QuestPanel.jsx` to customize:
- Colors (currently green/blue theme)
- Layout (currently fixed top-right)
- Animations
- Size/positioning

## Testing

1. **Test Daily Reset**: 
   - Complete some quests
   - Change system date to next day
   - Verify quests reset

2. **Test Weekly Reset**:
   - Complete weekly challenges
   - Change system date to next Monday
   - Verify challenges reset

3. **Test Quest Completion**:
   - Play games, use power-ups, etc.
   - Verify quest progress updates
   - Verify rewards can be claimed

4. **Test Reward Claiming**:
   - Complete a quest
   - Click "Claim Reward"
   - Verify coins/XP are added
   - Verify quest shows as claimed

## Performance Considerations

- Quest progress is stored in localStorage (lightweight)
- Quest panel can be minimized to reduce UI clutter
- Quest tracking is event-based (minimal performance impact)
- Consider lazy-loading quest panel if needed

## Future Enhancements

1. **Server-side Quest Storage**: Store quest progress in Supabase for cross-device sync
2. **Quest Notifications**: Show notifications when quests are completed
3. **Quest History**: Track completed quests over time
4. **Seasonal Quests**: Add time-limited event quests
5. **Quest Chains**: Sequential quests that unlock after completing previous ones
6. **Achievement Integration**: Link quest completion to achievements

## Troubleshooting

### Quests Not Updating
- Check that `trackGameEvent` is being called with correct event types
- Verify quest system hook is initialized in component
- Check browser console for errors

### Rewards Not Claiming
- Verify currency/progression hooks are available
- Check that quest is marked as completed
- Verify reward structure matches expected format

### Quests Not Resetting
- Check `lastDailyReset` and `lastWeeklyReset` dates
- Verify date comparison logic
- Check browser localStorage for stored dates

## Support

For issues or questions, check:
- `RETENTION_IMPROVEMENTS.md` for overall retention strategy
- `useQuestSystem.js` for implementation details
- `QuestPanel.jsx` for UI component details

