import { useState } from 'react';
import LocalGame from './components/LocalGame';
import OnlineGame from './components/OnlineGame';
import AIGame from './components/AIGame';
import GameModeSelector from './components/GameModeSelector';

function App() {
  const [gameMode, setGameMode] = useState(null); // 'local', 'online', or 'ai'
  const [difficulty, setDifficulty] = useState('normal');

  const handleSelectMode = (mode, selectedDifficulty) => {
    setGameMode(mode);
    setDifficulty(selectedDifficulty);
  };

  const handleBack = () => {
    setGameMode(null);
  };

  if (!gameMode) {
    return <GameModeSelector onSelectMode={handleSelectMode} />;
  }

  return (
    <div className="fixed inset-0">
      {gameMode === 'ai' ? (
        <AIGame onBack={handleBack} initialDifficulty={difficulty} aiDifficulty={difficulty} />
      ) : gameMode === 'local' ? (
        <LocalGame onBack={handleBack} initialDifficulty={difficulty} />
      ) : (
        <OnlineGame onBack={handleBack} initialDifficulty={difficulty} />
      )}
    </div>
  );
}

export default App;

