# Firebase Setup Guide

## Step 1: Create Realtime Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `space-adventure-board-game`
3. Click on **Realtime Database** in the left sidebar
4. Click **Create Database**
5. Select a location (choose closest to your users)
6. Start in **test mode** for now (we'll add security rules next)

## Step 2: Get Database URL

After creating the database, you'll see a URL like:
```
https://space-adventure-board-game-default-rtdb.firebaseio.com
```

This URL has been added to your `.env` file.

## Step 3: Set Database Rules

In the Firebase Console, go to **Realtime Database** → **Rules** tab.

Replace the default rules with these secure rules:

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['players', 'currentPlayerIndex', 'message'])"
      }
    },
    "leaderboard": {
      ".read": true,
      ".indexOn": ["wins", "totalGames"],
      "$playerId": {
        ".write": true,
        ".validate": "newData.hasChildren(['name', 'wins', 'totalGames'])"
      }
    },
    "gameHistory": {
      ".read": true,
      ".indexOn": ["completedAt"],
      "$gameId": {
        ".write": true,
        ".validate": "newData.hasChildren(['gameId', 'players', 'winner', 'completedAt'])"
      }
    }
  }
}
```

## Step 4: Environment Variables

Your `.env` file has been created with your Firebase config.

**IMPORTANT**: Never commit `.env` to git. It's already in `.gitignore`.

## Step 5: Restart Dev Server

After setting up Firebase, restart your dev server:

```bash
npm run dev
```

## Security Notes

### Current Security Model
- **Read**: Anyone can read game data (required for multiplayer)
- **Write**: Anyone can write (required for multiplayer without auth)
- **Validation**: Basic data structure validation

### Future Improvements
For production, consider:
1. **Firebase Authentication** - Add user login
2. **Security Rules** - Restrict writes to authenticated users
3. **Rate Limiting** - Prevent abuse
4. **Cloud Functions** - Server-side validation

## Database Structure

```
space-adventure-board-game/
├── games/
│   └── {gameId}/
│       ├── players: []
│       ├── currentPlayerIndex: number
│       ├── diceValue: number
│       ├── isRolling: boolean
│       ├── gameWon: boolean
│       ├── winner: object
│       ├── isPaused: boolean
│       ├── pausedBy: string
│       ├── pausedAt: timestamp
│       ├── totalMoves: number
│       └── message: string
│
├── leaderboard/
│   └── {playerKey}/
│       ├── name: string
│       ├── wins: number
│       ├── totalGames: number
│       ├── lastWin: timestamp
│       └── bestTime: number
│
└── gameHistory/
    └── {gameId}/
        ├── gameId: string
        ├── players: []
        ├── winner: object
        ├── completedAt: timestamp
        ├── gameDuration: number
        └── totalMoves: number
```

## Troubleshooting

### "Permission Denied" Error
- Make sure you've published the database rules
- Verify the database URL in `.env` matches your project

### "Database URL Missing" Error
- Check that `.env` file exists
- Verify `VITE_FIREBASE_DATABASE_URL` is set
- Restart the dev server after adding `.env`

### Games Not Syncing
- Check browser console for errors
- Verify you're online
- Check Firebase Console for data

## Testing

1. **Create a game** - Test game creation
2. **Join from another device** - Test multiplayer sync
3. **Play a full game** - Test leaderboard and history
4. **Pause/Resume** - Test pause functionality

## Next Steps

- [ ] Enable Realtime Database in Firebase Console
- [ ] Set database rules
- [ ] Restart dev server
- [ ] Test multiplayer functionality
- [ ] Deploy to production (Netlify)
