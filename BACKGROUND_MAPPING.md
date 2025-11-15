# Background Image Mapping

This document explains how different background images are used throughout the game.

## Background Files

The following background images are available in `/public/`:

- `retro-bg.png` - General retro background (Menu)
- `retro-space-shooter-bg.png` - Classic space shooter (Local Game)
- `futuristic-retro.png` - Futuristic feel (Online Game)
- `retro-space-stattion-interior.png` - Space station interior (AI Game)
- `dark-space-retro.png` - Dark, intense (Hard/Nightmare/Insane difficulties)
- `space-bg.jpg` - Original fallback background
- `space-bg-1.jpg` - Alternative background

## Background Mapping by Game Mode

### Menu Screen (`GameModeSelector`)
- **Background**: `retro-bg.png`
- **Usage**: Main menu where players select game mode
- **Function**: `getScreenBackground('menu')`

### Local Game (`LocalGame`)
- **Normal/Easy Difficulty**: `retro-space-shooter-bg.png`
- **Hard/Nightmare/Insane Difficulty**: `dark-space-retro.png`
- **Function**: `getBackgroundImage('local', difficulty)`

### Online Game (`OnlineGame`)
- **Normal/Easy Difficulty**: `futuristic-retro.png`
- **Hard/Nightmare/Insane Difficulty**: `dark-space-retro.png`
- **Waiting/Connecting Screens**: `futuristic-retro.png`
- **Function**: `getBackgroundImage('online', difficulty)`

### AI Game (`AIGame`)
- **Normal/Easy Difficulty**: `retro-space-stattion-interior.png`
- **Hard/Nightmare/Insane Difficulty**: `dark-space-retro.png`
- **Function**: `getBackgroundImage('ai', difficulty)`

## Special Screens

### Reconnecting Screen
- **Background**: `futuristic-retro.png`
- **Function**: `getScreenBackground('reconnecting')`

### Waiting/Connecting Screens
- **Background**: `futuristic-retro.png`
- **Function**: `getScreenBackground('waiting')`

## Implementation Details

### Utility Functions

Located in `src/utils/backgrounds.js`:

1. **`getBackgroundImage(gameMode, difficulty)`**
   - Returns appropriate background based on game mode and difficulty
   - Automatically uses dark background for hard difficulties
   - Parameters:
     - `gameMode`: 'local', 'online', 'ai', or 'menu'
     - `difficulty`: 'easy', 'normal', 'hard', 'nightmare', 'insane'

2. **`getScreenBackground(screen)`**
   - Returns background for specific screen states
   - Parameters:
     - `screen`: 'menu', 'reconnecting', 'waiting'

### Difficulty-Based Overrides

When difficulty is set to:
- `'hard'`
- `'nightmare'`
- `'insane'`

The system automatically uses `dark-space-retro.png` regardless of game mode, providing a more intense visual experience.

## Adding New Backgrounds

To add a new background:

1. **Add the image file** to `/public/` folder
2. **Update** `src/utils/backgrounds.js`:
   - Add to `modeBackgrounds` object for game mode specific
   - Or add to `screenBackgrounds` for screen-specific
3. **Test** in the appropriate game mode

## Fallback Behavior

If a background file is missing or not found:
- The system falls back to `space-bg.jpg`
- This ensures the game always has a background

## File Naming Convention

- Use descriptive names: `retro-space-shooter-bg.png`
- Include format: `.png` or `.jpg`
- Keep names lowercase with hyphens: `dark-space-retro.png`

## Performance Notes

- Backgrounds are loaded via CSS `backgroundImage`
- Images should be optimized (see `IMAGE_OPTIMIZATION_GUIDE.md`)
- Recommended size: Under 2MB per image
- Format: JPEG (85% quality) or PNG (optimized)

