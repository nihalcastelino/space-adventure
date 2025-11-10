import { Rocket, Users, Wifi } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds';

export default function GameModeSelector({ onSelectMode }) {
  const { playSound } = useGameSounds();
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundImage: 'url(/space-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000'
      }}
    >
      <div className="text-center space-y-8 px-4 max-w-2xl">
        <div className="space-y-4">
          <Rocket className="w-20 h-20 text-yellow-300 mx-auto animate-bounce" />
          <h1 className="text-5xl md:text-6xl font-bold text-yellow-300 mb-2">
            Space Adventure
          </h1>
          <p className="text-xl text-gray-300">
            Race to the edge of the galaxy!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <button
            onClick={() => {
              playSound('click');
              onSelectMode('local');
            }}
            className="bg-gray-900 bg-opacity-95 rounded-lg p-8 shadow-2xl border-2 border-gray-700 hover:border-blue-400 transition-all transform hover:scale-105 group"
          >
            <Users className="w-16 h-16 text-blue-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold text-white mb-2">Local Multiplayer</h2>
            <p className="text-gray-400">
              Play with friends on the same device
            </p>
          </button>

          <button
            onClick={() => {
              playSound('click');
              onSelectMode('online');
            }}
            className="bg-gray-900 bg-opacity-95 rounded-lg p-8 shadow-2xl border-2 border-gray-700 hover:border-green-400 transition-all transform hover:scale-105 group"
          >
            <Wifi className="w-16 h-16 text-green-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold text-white mb-2">Online Multiplayer</h2>
            <p className="text-gray-400">
              Play with friends across different devices
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

