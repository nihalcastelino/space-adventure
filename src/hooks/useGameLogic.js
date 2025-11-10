import { useState, useEffect } from 'react';
import { useGameSounds } from './useGameSounds';
import { useDifficulty } from './useDifficulty';
import { useJeopardyMechanics } from './useJeopardyMechanics';
import { usePlayerAssistance } from './usePlayerAssistance';
import { useRoguePlayer } from './useRoguePlayer';

const BOARD_SIZE = 100;
const SPACEPORTS = {
  4: 18, 9: 31, 15: 42, 21: 56, 28: 64,
  36: 70, 51: 77, 62: 85, 71: 91, 80: 96
};

export function useGameLogic(initialDifficulty = 'normal') {
  const { playSound } = useGameSounds();
  const {
    difficulty,
    aliens: ALIENS,
    checkpoints: CHECKPOINTS,
    spawnedAliens,
    removedCheckpoints,
    processTurnEvents,
    resetDifficulty,
    changeDifficulty
  } = useDifficulty(initialDifficulty);

  // Initialize jeopardy mechanics (enabled by default for normal/hard)
  const jeopardy = useJeopardyMechanics(difficulty, true);

  // Initialize player assistance system
  const assistance = usePlayerAssistance();

  // Initialize rogue player system
  const rogue = useRoguePlayer(true);

  const playerColors = [
    'text-yellow-300',
    'text-blue-300',
    'text-green-300',
    'text-pink-300'
  ];

  const playerCorners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([
    { id: 1, position: 0, lastCheckpoint: 0, color: playerColors[0], name: 'Player 1', corner: playerCorners[0], icon: '🚀' },
    { id: 2, position: 0, lastCheckpoint: 0, color: playerColors[1], name: 'Player 2', corner: playerCorners[1], icon: '🚀' }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Initialize assistance for default players
  useEffect(() => {
    assistance.initializePlayer(1);
    assistance.initializePlayer(2);
  }, []);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState("Player 1's turn! Press SPIN to start!");
  const [gameWon, setGameWon] = useState(false);
  const [winner, setWinner] = useState(null);
  const [animatingPlayer, setAnimatingPlayer] = useState(null);
  const [animationType, setAnimationType] = useState(null);
  const [alienBlink, setAlienBlink] = useState({});
  const [difficultyEvents, setDifficultyEvents] = useState({ spawnedAlien: null, removedCheckpoint: null });
  const [turnCount, setTurnCount] = useState(0);
  const [lastRogueSpawnTurn, setLastRogueSpawnTurn] = useState(-20); // Start negative so first spawn happens early

  useEffect(() => {
    const interval = setInterval(() => {
      const newBlink = {};
      ALIENS.forEach(pos => {
        newBlink[pos] = Math.random() > 0.5;
      });
      setAlienBlink(newBlink);
    }, 500);
    return () => clearInterval(interval);
  }, [ALIENS]);

  const getLastCheckpoint = (position) => {
    for (let i = CHECKPOINTS.length - 1; i >= 0; i--) {
      if (CHECKPOINTS[i] <= position) {
        return CHECKPOINTS[i];
      }
    }
    return 0;
  };

  const addPlayer = () => {
    if (numPlayers < 4) {
      const newPlayerNum = numPlayers + 1;
      setNumPlayers(newPlayerNum);
      setPlayers([...players, {
        id: newPlayerNum,
        position: 0,
        lastCheckpoint: 0,
        color: playerColors[newPlayerNum - 1],
        name: `Player ${newPlayerNum}`,
        corner: playerCorners[newPlayerNum - 1],
        icon: '🚀'
      }]);
      // Initialize assistance for new player
      assistance.initializePlayer(newPlayerNum);
    }
  };

  const removePlayer = () => {
    if (numPlayers > 2) {
      setNumPlayers(numPlayers - 1);
      setPlayers(players.slice(0, -1));
      if (currentPlayerIndex >= numPlayers - 1) {
        setCurrentPlayerIndex(0);
      }
    }
  };

  const rollDice = () => {
    if (isRolling || gameWon) return;

    const currentPlayer = players[currentPlayerIndex];

    // Check if player is in jail
    const jailState = jeopardy.getJailState(currentPlayer.id);
    if (jailState.inJail) {
      // Roll dice to try for doubles
      playSound('click');
      setIsRolling(true);
      setMessage(`🎲 ${currentPlayer.name} rolling for DOUBLES to escape jail...`);
      playSound('dice');

      let rolls = 0;
      const rollInterval = setInterval(() => {
        setDiceValue(Math.floor(Math.random() * 6) + 1);
        rolls++;

        if (rolls > 15) {
          clearInterval(rollInterval);

          // Roll two dice to check for doubles
          const die1 = Math.floor(Math.random() * 6) + 1;
          const die2 = Math.floor(Math.random() * 6) + 1;
          const finalRoll = die1 + die2;
          const rolledDoubles = die1 === die2;

          setDiceValue(finalRoll);
          setMessage(`🎲 Rolled ${die1} and ${die2} ${rolledDoubles ? '(DOUBLES!)' : '(not doubles)'}`);

          setTimeout(() => {
            // Process jail turn
            const jailResult = jeopardy.processJailTurn(currentPlayer.id, rolledDoubles);

            setMessage(jailResult.message);

            if (jailResult.escaped) {
              // Return player to previous position
              const updatedPlayers = [...players];
              updatedPlayers[currentPlayerIndex].position = jailResult.returnPosition;
              setPlayers(updatedPlayers);

              setTimeout(() => {
                if (rolledDoubles) {
                  // Rolled doubles - can move!
                  movePlayer(finalRoll);
                } else {
                  // Auto-release but turn ends
                  nextPlayer();
                }
              }, 2000);
            } else {
              setTimeout(() => {
                nextPlayer();
              }, 2000);
            }
          }, 2000);
        }
      }, 150);
      return;
    }

    // Normal roll
    playSound('click');
    setIsRolling(true);
    setMessage(`🎲 ${currentPlayer.name} is rolling the dice...`);
    playSound('dice');

    let rolls = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;

      if (rolls > 15) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setMessage(`🎲 ${currentPlayer.name} rolled a ${finalRoll}!`);
        setTimeout(() => {
          movePlayer(finalRoll);
        }, 1000);
      }
    }, 150);
  };

  const movePlayer = async (steps) => {
    const currentPlayer = players[currentPlayerIndex];
    const isFirstMove = currentPlayer.position === 0;
    let newPosition = currentPlayer.position + steps;

    // If player is at position 0 (starting), they enter the board at position 1
    if (isFirstMove) {
      newPosition = steps; // Move directly to the rolled position
      setMessage(`🚀 ${currentPlayer.name} blasts off into space!`);
    }

    if (newPosition > BOARD_SIZE) {
      setMessage(`${currentPlayer.name} rolled ${steps} but needs exactly ${BOARD_SIZE - currentPlayer.position} to win! Turn passes.`);
      setTimeout(() => {
        nextPlayer();
      }, 2000);
      return;
    }

    setAnimatingPlayer(currentPlayer.id);

    // Clear message and prepare for move
    setMessage(`🎲 ${currentPlayer.name} rolled ${steps}. Moving...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Liftoff animation
    if (isFirstMove) {
      setAnimationType('blastoff');
      playSound('spaceport');
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      setAnimationType('liftoff');
      playSound('rocket');
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Animate movement square by square
    const updatedPlayers = [...players];
    const startPos = currentPlayer.position;
    const direction = newPosition > startPos ? 1 : -1;
    const totalSteps = Math.abs(newPosition - startPos);

    setAnimationType(null); // Clear animation for movement

    // Move square by square with smooth animation
    for (let step = 1; step <= totalSteps; step++) {
      const intermediatePos = startPos + (step * direction);
      updatedPlayers[currentPlayerIndex].position = intermediatePos;
      setPlayers([...updatedPlayers]);

      // Show progress message every few squares
      if (step % 3 === 0 || step === totalSteps) {
        setMessage(`→ ${currentPlayer.name} at position ${intermediatePos}...`);
      }

      // Delay between squares (faster = smoother but quicker overall)
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    setMessage(`📍 ${currentPlayer.name} reached position ${newPosition}`);

    // Landing animation
    setAnimationType('landing');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnimationType(null);

    // Pause to show landing
    await new Promise(resolve => setTimeout(resolve, 600));

    // Check for rogue encounter (direct hit or pass-through)
    const rogueEncounter = rogue.checkRogueEncounter(startPos, newPosition, currentPlayer.id);
    
    if (rogueEncounter && rogueEncounter.knocked) {
      setMessage(rogueEncounter.message);
      await new Promise(resolve => setTimeout(resolve, 2000));

      playSound('alien');
      setAnimationType('eaten');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate knockback position
      const knockbackPosition = Math.max(0, newPosition - rogueEncounter.knockbackDistance);
      const checkpoint = getLastCheckpoint(knockbackPosition);
      
      updatedPlayers[currentPlayerIndex].position = Math.max(checkpoint, knockbackPosition);
      updatedPlayers[currentPlayerIndex].lastCheckpoint = checkpoint;
      setPlayers(updatedPlayers);

      setMessage(`↩️ ${currentPlayer.name} knocked back to position ${updatedPlayers[currentPlayerIndex].position}!`);
      
      setAnimationType('landing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnimationType(null);
      setAnimatingPlayer(null);

      await new Promise(resolve => setTimeout(resolve, 2000));
      nextPlayer();
      return;
    }

    // Check for hazard collisions
    const hazardResult = jeopardy.checkHazardCollision(currentPlayer.id, newPosition);

    if (hazardResult.blackHole) {
      // Black hole!
      setMessage(`⚠️ ${currentPlayer.name} landed on a BLACK HOLE!`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage(hazardResult.message);
      await new Promise(resolve => setTimeout(resolve, 2000));

      playSound('alien'); // Use alien sound for sucking effect
      setAnimationType('eaten');
      await new Promise(resolve => setTimeout(resolve, 1500));

      updatedPlayers[currentPlayerIndex].position = hazardResult.newPosition;
      updatedPlayers[currentPlayerIndex].lastCheckpoint = getLastCheckpoint(hazardResult.newPosition);
      setPlayers(updatedPlayers);

      setMessage(`↩️ ${currentPlayer.name} warped back to position ${hazardResult.newPosition}`);

      setAnimationType('landing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnimationType(null);
      setAnimatingPlayer(null);

      await new Promise(resolve => setTimeout(resolve, 2000));
      nextPlayer();
      return;
    }

    if (hazardResult.patrol) {
      // Space Jail!
      setMessage(`🚨 ${currentPlayer.name} landed on a PATROL ZONE!`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage(hazardResult.message);
      await new Promise(resolve => setTimeout(resolve, 2000));

      playSound('error');
      setAnimationType(null);
      setAnimatingPlayer(null);
      setIsRolling(false);

      await new Promise(resolve => setTimeout(resolve, 2000));
      nextPlayer();
      return;
    }

    if (hazardResult.meteor) {
      // Meteor impact!
      setMessage(`🔥 ${currentPlayer.name} hit by METEOR!`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage(hazardResult.message);
      await new Promise(resolve => setTimeout(resolve, 2000));

      playSound('alien');
      setAnimationType('eaten');
      await new Promise(resolve => setTimeout(resolve, 1500));

      updatedPlayers[currentPlayerIndex].position = hazardResult.newPosition;
      setPlayers(updatedPlayers);

      setMessage(`↩️ ${currentPlayer.name} knocked back to position ${hazardResult.newPosition}`);

      setAnimationType('landing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnimationType(null);
      setAnimatingPlayer(null);

      await new Promise(resolve => setTimeout(resolve, 2000));
      nextPlayer();
      return;
    }

    if (newPosition === BOARD_SIZE) {
      setMessage(`🎉 ${currentPlayer.name} WINS! Reached the edge of the galaxy!`);
      setGameWon(true);
      setWinner(currentPlayer);
      setIsRolling(false);
      setAnimatingPlayer(null);
      playSound('victory');
      return;
    }
    
    if (SPACEPORTS[newPosition]) {
      const destination = SPACEPORTS[newPosition];
      setMessage(`🛸 ${currentPlayer.name} found a SPACEPORT at position ${newPosition}!`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage(`⚡ Warping to position ${destination}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      playSound('spaceport');
      setAnimationType('liftoff');
      await new Promise(resolve => setTimeout(resolve, 1500));

      updatedPlayers[currentPlayerIndex].position = destination;
      updatedPlayers[currentPlayerIndex].lastCheckpoint = getLastCheckpoint(destination);
      setPlayers(updatedPlayers);

      setAnimationType('landing');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMessage(`✅ ${currentPlayer.name} warped to position ${destination}!`);
      setAnimationType(null);
      setAnimatingPlayer(null);

      await new Promise(resolve => setTimeout(resolve, 2000));
      nextPlayer();
      return;
    }
    
    if (ALIENS.includes(newPosition)) {
      setMessage(`👾 ${currentPlayer.name} encountered an ALIEN at position ${newPosition}!`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check assistance - can knockback be prevented?
      const checkpoint = updatedPlayers[currentPlayerIndex].lastCheckpoint;
      const knockbackDistance = newPosition - checkpoint;
      const knockbackResult = assistance.processKnockback(currentPlayer.id, newPosition, knockbackDistance);

      if (!knockbackResult.allowed) {
        // Knockback prevented by assistance!
        setMessage(knockbackResult.message);
        await new Promise(resolve => setTimeout(resolve, 2000));

        setAnimationType(null);
        setAnimatingPlayer(null);

        // Check for safety net activation
        const safetyNet = assistance.shouldActivateSafetyNet(currentPlayer.id);
        if (safetyNet.activate) {
          assistance.grantImmunity(currentPlayer.id, safetyNet.immunityTurns);
          setMessage(safetyNet.message);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
        nextPlayer();
        return;
      }

      setMessage(`😱 The alien is attacking...`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      playSound('alien');
      setAnimationType('eaten');
      await new Promise(resolve => setTimeout(resolve, 1500));

      updatedPlayers[currentPlayerIndex].position = checkpoint;
      setPlayers(updatedPlayers);

      setAnimationType('landing');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMessage(`↩️ ${currentPlayer.name} sent back to checkpoint ${checkpoint}!`);
      setAnimationType(null);
      setAnimatingPlayer(null);

      // Check for safety net activation
      const safetyNet = assistance.shouldActivateSafetyNet(currentPlayer.id);
      if (safetyNet.activate) {
        assistance.grantImmunity(currentPlayer.id, safetyNet.immunityTurns);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setMessage(safetyNet.message);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      nextPlayer();
      return;
    }
    
    const newCheckpoint = getLastCheckpoint(newPosition);
    if (newCheckpoint > currentPlayer.lastCheckpoint) {
      updatedPlayers[currentPlayerIndex].lastCheckpoint = newCheckpoint;
      setPlayers(updatedPlayers);
      setMessage(`✅ ${currentPlayer.name} reached CHECKPOINT ${newCheckpoint}!`);
      playSound('checkpoint');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Grant checkpoint immunity if landed exactly on checkpoint
      if (assistance.landedOnCheckpoint(newPosition)) {
        assistance.grantImmunity(currentPlayer.id, 1);
        setMessage(`🛡️ Checkpoint Protection! Immunity for 1 turn`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      setMessage(`✓ ${currentPlayer.name} is now at position ${newPosition}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Track successful movement (not knocked back)
    const startPosition = currentPlayer.position;
    assistance.trackMovement(currentPlayer.id, startPosition, newPosition, false);

    // Check for comeback boosts
    const comebackBoost = assistance.shouldActivateComebackBoost(currentPlayer.id, players);
    if (comebackBoost.activate) {
      if (comebackBoost.type === 'teleport') {
        // Anti-stagnation teleport
        const teleportPosition = Math.min(newPosition + comebackBoost.distance, BOARD_SIZE);
        updatedPlayers[currentPlayerIndex].position = teleportPosition;
        setPlayers(updatedPlayers);
        setMessage(comebackBoost.message);
        playSound('spaceport');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else if (comebackBoost.type === 'roll_boost') {
        // Comeback boost message
        setMessage(comebackBoost.message);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else if (comebackBoost.type === 'free_powerup') {
        // Free power-up message
        setMessage(comebackBoost.message);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setAnimatingPlayer(null);

    await new Promise(resolve => setTimeout(resolve, 1500));
    nextPlayer();
  };

  const nextPlayer = () => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    
    // Increment turn counter
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);

    // Advance jeopardy turn (spawns hazards, updates timers)
    jeopardy.nextTurn();

    // Process difficulty events (alien spawning, checkpoint removal)
    const playerPositions = players.map(p => p.position);
    const events = processTurnEvents(playerPositions);
    setDifficultyEvents(events);

    // Rogue player logic
    let rogueSpawnMessage = null;
    
    // Check if rogue should despawn
    if (rogue.rogueState.active && rogue.shouldDespawn()) {
      rogue.despawnRogue();
    }
    
    // Check if any player reached position 90+ (despawn rogue)
    if (rogue.rogueState.active && playerPositions.some(pos => pos >= 90)) {
      rogue.despawnRogue();
    }
    
    // Move rogue if active (after despawn checks)
    if (rogue.rogueState.active) {
      rogue.moveRogue(playerPositions);
    }
    
    // Check if rogue should spawn (every 10-15 turns, but not if already active)
    if (!rogue.rogueState.active) {
      const turnsSinceLastSpawn = newTurnCount - lastRogueSpawnTurn;
      const shouldSpawn = turnsSinceLastSpawn >= 10 && (Math.random() < 0.3 || turnsSinceLastSpawn >= 15);
      
      if (shouldSpawn) {
        rogue.spawnRogue(playerPositions);
        // State update is async, so we'll check in next render cycle
        setTimeout(() => {
          if (rogue.rogueState.active) {
            setLastRogueSpawnTurn(newTurnCount);
          }
        }, 0);
        rogueSpawnMessage = `👽 Rogue Alien has appeared!`;
        playSound('alien');
      }
    }

    // Check if next player is in jail
    const nextPlayerJailState = jeopardy.getJailState(players[nextIndex].id);

    // Show difficulty event messages
    let turnMessage = `${players[nextIndex].name}'s turn! Press SPIN to roll!`;

    if (rogueSpawnMessage) {
      turnMessage = `${rogueSpawnMessage} ${players[nextIndex].name}'s turn!`;
    } else if (nextPlayerJailState.inJail) {
      turnMessage = `🚔 ${players[nextIndex].name} is in jail! Roll for doubles or wait ${nextPlayerJailState.turnsRemaining} turn${nextPlayerJailState.turnsRemaining > 1 ? 's' : ''}!`;
    } else if (events.spawnedAlien) {
      turnMessage = `⚠️ New alien spawned at position ${events.spawnedAlien}! ${players[nextIndex].name}'s turn!`;
      playSound('alien');
    }
    if (events.removedCheckpoint) {
      turnMessage = `💀 Checkpoint ${events.removedCheckpoint} disappeared! ${players[nextIndex].name}'s turn!`;
      if (!events.spawnedAlien && !rogueSpawnMessage) playSound('alien'); // Only play if not already played
    }

    setMessage(turnMessage);
    setIsRolling(false);
    playSound('turn');
  };

  const changePlayerIcon = (playerId, iconData) => {
    setPlayers(players.map(p =>
      p.id === playerId ? { ...p, icon: iconData.icon } : p
    ));
  };

  const resetGame = () => {
    playSound('click');
    setPlayers(players.map(p => ({ ...p, position: 0, lastCheckpoint: 0 })));
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setMessage("Player 1's turn! Press SPIN to start!");
    setGameWon(false);
    setWinner(null);
    setAnimatingPlayer(null);
    setAnimationType(null);
    setDifficultyEvents({ spawnedAlien: null, removedCheckpoint: null });
    setTurnCount(0);
    setLastRogueSpawnTurn(-20);
    resetDifficulty(); // Reset difficulty state
    jeopardy.resetHazards(); // Reset jeopardy hazards
    assistance.resetAll(); // Reset assistance state
    rogue.resetRogue(); // Reset rogue state
  };

  return {
    players,
    numPlayers,
    currentPlayerIndex,
    diceValue,
    isRolling,
    message,
    gameWon,
    winner,
    animatingPlayer,
    animationType,
    alienBlink,
    aliens: ALIENS,
    checkpoints: CHECKPOINTS,
    difficulty,
    difficultyEvents,
    spawnedAliens,
    removedCheckpoints,
    changeDifficulty,
    addPlayer,
    removePlayer,
    rollDice,
    resetGame,
    changePlayerIcon,
    // Jeopardy mechanics
    hazards: jeopardy.hazards,
    jailStates: jeopardy.getJailState, // Function to get jail state for any player
    payBail: jeopardy.payBail,
    // Player assistance
    assistanceStatus: assistance.getAssistanceStatus,
    // Rogue player
    rogueState: rogue.rogueState
  };
}

