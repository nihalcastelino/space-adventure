# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Space Adventure is a multiplayer space-themed board game (similar to Snakes and Ladders) built with React + Vite. It supports both **local multiplayer** (2-4 players on one device) and **online multiplayer** (real-time sync across devices via Firebase Realtime Database).

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy Firebase rules (requires Firebase CLI)
firebase deploy --only database
```

## Environment Setup

Create a `.env` file with Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Note**: All Firebase config is accessed via `import.meta.env.VITE_*` (Vite convention).

## Architecture

### Game Logic Separation

The codebase uses **custom hooks** to separate game logic from UI:

- **`useGameLogic.js`** - Local multiplayer game state and logic
  - Manages local player state, dice rolls, turn management
  - Handles game rules: spaceports (warp forward), aliens (send back), checkpoints
  - Pure client-side, no Firebase dependencies

- **`useFirebaseGame.js`** - Online multiplayer with Firebase sync
  - Real-time game state synchronization across devices
  - Room-based game system with unique room codes
  - Server-side dice rolling to prevent cheating
  - Uses Firebase Realtime Database listeners (`onValue`) for live updates

### Component Structure

```
src/
├── components/
│   ├── GameModeSelector.jsx    # Initial screen: Local vs Online
│   ├── LocalGame.jsx            # Local multiplayer container
│   ├── OnlineGame.jsx           # Online multiplayer container
│   ├── GameBoard.jsx            # Board rendering (shared by both modes)
│   ├── GameControls.jsx         # Dice and control buttons
│   ├── PlayerPanel.jsx          # Player info display
│   └── ParticleEffects.jsx      # Visual effects
├── hooks/
│   ├── useGameLogic.js          # Local game logic
│   └── useFirebaseGame.js       # Firebase/online game logic
├── lib/
│   └── firebase.js              # Firebase initialization
└── App.jsx                      # Root component (mode selection)
```

### Game Constants

These are defined in both `useGameLogic.js` and `useFirebaseGame.js`:

- `BOARD_SIZE`: 100 positions
- `SPACEPORTS`: Warp positions (e.g., 4→18, 9→31) - move player forward
- `ALIENS`: Hazard positions that send players back to last checkpoint
- `CHECKPOINTS`: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90] - safe positions

**Important**: If you modify game rules, update BOTH hooks to keep local/online modes consistent.

### Firebase Data Structure

Games are stored at `games/{gameId}` with this structure:

```javascript
{
  players: [
    {
      id: "uuid",
      name: "Player Name",
      position: 0,
      lastCheckpoint: 0,
      color: "text-yellow-300",
      corner: "top-left"
    }
  ],
  currentPlayerIndex: 0,
  diceValue: null,
  isRolling: false,
  gameWon: false,
  message: "Player 1's turn!",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Security**: Firebase rules in `database.rules.json` allow open read/write (suitable for public games). Tighten for production.

### State Management Pattern

- **Local mode**: React `useState` within `useGameLogic` hook
- **Online mode**: Firebase Realtime Database as source of truth
  - Components listen to Firebase changes via `onValue()`
  - State updates go through `set()` or `update()` to Firebase
  - Firebase automatically syncs to all connected clients

### Responsive Design

Uses Tailwind CSS with mobile-first breakpoints:

- **Mobile** (`< 768px`): Compact layout, smaller board (90vw)
- **Tablet** (`768px-1024px`): Medium layout
- **Desktop** (`> 1024px`): Full layout, max board size (600px)

Players are positioned at board corners based on `playerCorners` array: `['top-left', 'top-right', 'bottom-left', 'bottom-right']`

## Deployment

Configured for **Netlify** deployment:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: Set all `VITE_FIREBASE_*` vars in Netlify UI
- Security headers configured in `netlify.toml`

## Common Development Tasks

### Adding a New Game Feature

1. Update game constants in BOTH `useGameLogic.js` and `useFirebaseGame.js`
2. Modify move processing logic in both hooks
3. Update `GameBoard.jsx` if visual changes needed
4. Test in both local and online modes

### Modifying Player Count

- Default is 2-4 players
- Player colors defined in `playerColors` array (Yellow, Blue, Green, Pink)
- Player corners assigned from `playerCorners` array
- To add more players: extend both arrays and update initial state

### Changing Board Layout

Board is rendered as a 10x10 grid (100 positions) in `GameBoard.jsx`:
- Positions numbered 1-100
- Rendered in snake pattern (left-to-right on even rows, right-to-left on odd rows)
- Special positions marked with icons: 🛸 (spaceports), 👾 (aliens), 🛡️ (checkpoints)

## Tech Stack Notes

- **Vite**: Dev server runs on port 3000 (configured in `vite.config.js`)
- **Firebase SDK**: v10.7.1 - uses modular imports (`import { getDatabase } from 'firebase/database'`)
- **Tailwind**: Custom animations defined for rocket liftoff/landing in `tailwind.config.js`
- **React**: Functional components with hooks only (no class components)
- **Icons**: Lucide React for UI icons; emoji for game elements

## Recent Fixes

### Board Visibility Issue (Fixed)
The game board was initially invisible due to positioning issues:
- **Root cause**: Using `absolute` positioning on a container without explicit parent height
- **Solution**: Changed to `fixed` positioning with `top: 50%`, `left: 50%`, and `transform: translate(-50%, -50%)`
- **Implementation**: Applied to both `LocalGame.jsx:116` and `OnlineGame.jsx:320`

### Board Layout Fix
- Changed from nested flexbox to **CSS Grid** for 10x10 cell layout
- Using `gridTemplateColumns: 'repeat(10, 1fr)'` and `gridTemplateRows: 'repeat(10, 1fr)'`
- Ensures all 100 cells render with proper sizing

### Visual Improvements
- **Gradient backgrounds** on all cells (linear gradients for depth)
- **Glowing effects** on special cells (spaceports, aliens, checkpoints, finish)
- **Animations**: Float animation on spaceports/players, pulse on aliens, sparkles on special cells
- **Better shadows**: Box shadows for depth and inset shadows for dimension
- **Rounded corners** on cells (4px border-radius)

## Known Quirks

- `vite.config.js` has a Socket.IO proxy that's unused (legacy config)
- `googleapis` in dependencies is not actively used (added for potential MCP server integration)
- The game uses a simple UUID generator in `useFirebaseGame.js` instead of a library
