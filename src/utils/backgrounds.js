/**
 * Background image mapping for different game modes and difficulties
 */

export const getBackgroundImage = (gameMode, difficulty = 'normal') => {
  // Game mode specific backgrounds
  const modeBackgrounds = {
    'local': 'retro-space-shooter-bg.png',      // Classic space shooter for local play
    'online': 'futuristic-retro.png',            // Futuristic feel for multiplayer
    'ai': 'retro-space-stattion-interior.png',  // Space station interior for AI games
    'menu': 'retro-bg.png'                      // General retro background for menu
  };

  // Difficulty-based overrides (for harder difficulties, use darker backgrounds)
  if (difficulty === 'hard' || difficulty === 'nightmare' || difficulty === 'insane') {
    return 'dark-space-retro.png';
  }

  // Return mode-specific background or fallback
  return modeBackgrounds[gameMode] || 'space-bg.jpg';
};

/**
 * Get background image for a specific screen/state
 */
export const getScreenBackground = (screen) => {
  const screenBackgrounds = {
    'menu': 'retro-bg.png',
    'local': 'retro-space-shooter-bg.png',
    'online': 'futuristic-retro.png',
    'ai': 'retro-space-stattion-interior.png',
    'reconnecting': 'futuristic-retro.png',
    'waiting': 'futuristic-retro.png'
  };

  return screenBackgrounds[screen] || 'space-bg.jpg';
};

