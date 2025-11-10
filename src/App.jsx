import { useState } from 'react';
import LocalGame from './components/LocalGame';
import OnlineGame from './components/OnlineGame';
import GameModeSelector from './components/GameModeSelector';

function App() {
  const [gameMode, setGameMode] = useState(null); // 'local' or 'online'

  if (!gameMode) {
    return <GameModeSelector onSelectMode={setGameMode} />;
  }

  return (
    <div className="fixed inset-0">
      {gameMode === 'local' ? (
        <LocalGame onBack={() => setGameMode(null)} />
      ) : (
        <OnlineGame onBack={() => setGameMode(null)} />
      )}
    </div>
  );
}

export default App;

