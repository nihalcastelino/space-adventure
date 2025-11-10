import { useState, useEffect, useRef, useCallback } from 'react';

const SPACEPORTS = {
  4: 18, 9: 31, 15: 42, 21: 56, 28: 64,
  36: 70, 51: 77, 62: 85, 71: 91, 80: 96
};
const ALIENS = [14, 23, 29, 38, 45, 50, 54, 61, 68, 75, 82, 88, 94, 98];

export function useRocketAnimation() {
  const [animatedPositions, setAnimatedPositions] = useState({});
  const [animatingPlayer, setAnimatingPlayer] = useState(null);
  const [encounterType, setEncounterType] = useState(null); // 'spaceport', 'alien', null
  const animationQueueRef = useRef([]);
  const isAnimatingRef = useRef(false);

  const animateMovement = useCallback(async (playerId, fromPos, toPos, hasSpaceport, hasAlien, alienTarget) => {
    // Don't animate if already animating
    if (isAnimatingRef.current) {
      animationQueueRef.current.push({ playerId, fromPos, toPos, hasSpaceport, hasAlien, alienTarget });
      return;
    }

    isAnimatingRef.current = true;
    setAnimatingPlayer(playerId);

    // Step 1: Animate moving forward through each square
    const steps = toPos - fromPos;
    for (let i = 1; i <= steps; i++) {
      const currentPos = fromPos + i;
      setAnimatedPositions(prev => ({ ...prev, [playerId]: currentPos }));
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms per square
    }

    // Step 2: Show spaceport encounter if applicable
    if (hasSpaceport && SPACEPORTS[toPos]) {
      setEncounterType('spaceport');
      await new Promise(resolve => setTimeout(resolve, 800)); // Show warp effect
      
      const warpTarget = SPACEPORTS[toPos];
      // Quick warp animation
      setAnimatedPositions(prev => ({ ...prev, [playerId]: warpTarget }));
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Step 3: Show alien encounter if applicable
    if (hasAlien) {
      const finalPos = hasSpaceport ? SPACEPORTS[toPos] : toPos;
      if (ALIENS.includes(finalPos)) {
        setEncounterType('alien');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Show alien eating effect
        
        // Animate moving backwards
        if (alienTarget < finalPos) {
          for (let i = finalPos - 1; i >= alienTarget; i--) {
            setAnimatedPositions(prev => ({ ...prev, [playerId]: i }));
            await new Promise(resolve => setTimeout(resolve, 150)); // Faster backwards
          }
        }
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    // Reset
    setEncounterType(null);
    setAnimatingPlayer(null);
    isAnimatingRef.current = false;

    // Process next in queue
    if (animationQueueRef.current.length > 0) {
      const next = animationQueueRef.current.shift();
      animateMovement(next.playerId, next.fromPos, next.toPos, next.hasSpaceport, next.hasAlien, next.alienTarget);
    }
  }, []);

  return {
    animatedPositions,
    animatingPlayer,
    encounterType,
    animateMovement,
    setAnimatedPositions
  };
}
