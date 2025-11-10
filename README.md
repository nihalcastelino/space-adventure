# 🚀 Space Adventure - Multiplayer Board Game

A space-themed multiplayer board game (like Snakes and Ladders) that works on multiple devices with real-time synchronization using Firebase.

## ✨ Features

- **Local Multiplayer**: Play with 2-4 players on the same device
- **Online Multiplayer**: Play with friends across different devices using Firebase Realtime Database
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Real-time Sync**: Game state synchronized in real-time across all devices
- **Beautiful UI**: Space-themed design with animations and effects

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Real-time Database**: Firebase Realtime Database
- **Deployment**: Netlify
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase project with Realtime Database enabled

### Installation

1. **Clone and install dependencies**
   ```bash
   cd space-adventure
   npm install
   ```

2. **Set up Firebase**

   - Create a Firebase project at https://console.firebase.google.com
   - Enable Realtime Database
   - Copy your Firebase config

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

4. **Deploy Firebase rules**
   ```bash
   firebase deploy --only database
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📦 Deployment

### Deploy to Netlify

1. **Push code to GitHub**

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Connect your repository

3. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Add environment variables**
   - Go to Site settings → Environment variables
   - Add all `VITE_FIREBASE_*` variables from your `.env` file

5. **Deploy!**
   - Netlify will automatically deploy on every push

### Firebase Setup

1. **Enable Realtime Database**
   - Go to Firebase Console → Realtime Database
   - Create database (start in test mode for development)

2. **Deploy security rules**
   ```bash
   firebase deploy --only database
   ```

3. **Update rules for production**
   - Review `database.rules.json`
   - Adjust rules based on your security needs

## 🎮 How to Play

### Local Mode
1. Select "Local Multiplayer"
2. Add/remove players (2-4 players)
3. Take turns rolling the dice
4. First to reach position 100 wins!

### Online Mode
1. Select "Online Multiplayer"
2. Enter your name
3. Create a new game or join with a room code
4. Share the room code with friends
5. Play together in real-time!

## 🎯 Game Rules

- **Spaceports** (🛸): Warp forward to a higher position
- **Aliens** (👾): Get eaten and return to your last checkpoint
- **Checkpoints** (🛡️): Safe spots - if eaten, return here
- **Win Condition**: Land exactly on position 100

## 📁 Project Structure

```
space-adventure/
├── src/
│   ├── components/
│   │   ├── GameBoard.jsx          # Game board rendering
│   │   ├── GameControls.jsx        # Dice and controls
│   │   ├── GameModeSelector.jsx    # Mode selection screen
│   │   ├── LocalGame.jsx           # Local multiplayer mode
│   │   ├── OnlineGame.jsx          # Online multiplayer mode
│   │   └── PlayerPanel.jsx         # Player info panel
│   ├── hooks/
│   │   ├── useGameLogic.js         # Local game logic
│   │   └── useFirebaseGame.js      # Firebase game logic
│   ├── lib/
│   │   └── firebase.js             # Firebase initialization
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── netlify.toml                    # Netlify configuration
├── firebase.json                    # Firebase configuration
├── database.rules.json             # Firebase Realtime Database rules
└── package.json
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

- Uses functional components with hooks
- Tailwind CSS for styling
- 2-space indentation
- Named exports preferred

## 🔒 Security

- Firebase security rules protect game data
- Environment variables for sensitive config
- No hardcoded secrets in code

## 🐛 Troubleshooting

### Firebase connection issues
- Verify all environment variables are set
- Check Firebase Realtime Database is enabled
- Ensure security rules allow read/write

### Game not syncing
- Check browser console for errors
- Verify Firebase connection status
- Check network connectivity

### Build errors
- Ensure Node.js 18+ is installed
- Run `npm install` to update dependencies
- Check Netlify build logs

## 📝 License

This project is open source and available for personal and educational use.

---

**Built with ❤️ for space adventurers everywhere!** 🚀✨

