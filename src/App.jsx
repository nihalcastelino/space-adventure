import { useState } from 'react';
import LocalGame from './components/LocalGame';
import OnlineGame from './components/OnlineGame';
import GameModeSelector from './components/GameModeSelector';

function App() {
  const [gameMode, setGameMode] = useState(null); // 'local' or 'online'
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
      {gameMode === 'local' ? (
        <LocalGame onBack={handleBack} initialDifficulty={difficulty} />
      ) : (
        <OnlineGame onBack={handleBack} initialDifficulty={difficulty} />
      )}
    </div>
  );
}

export default App;

