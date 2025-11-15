import { useEffect, useState, useRef } from 'react';

/**
 * End Game Animation Component
 * 
 * Shows dramatic end-game sequences:
 * - Victory: Celebration with fireworks and success
 * - Defeat: Alien armada descends and destroys the board
 */
export default function EndGameAnimation({ 
  type, // 'victory' or 'defeat'
  onComplete,
  boardSize = 100 // Board size to render destruction
}) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(0); // 0: animation, 1: game over screen
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let frameCount = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation particles/effects
    const effects = [];

    if (type === 'defeat') {
      // Create board cells for destruction
      const cols = 10;
      const rows = Math.ceil(boardSize / cols);
      const padding = 40; // More padding for visibility
      const availableWidth = canvas.width - padding * 2;
      const availableHeight = canvas.height - padding * 2;
      const cellWidth = availableWidth / cols;
      const cellHeight = availableHeight / rows;
      
      // Ensure minimum cell size
      const minCellSize = 20;
      const actualCellWidth = Math.max(cellWidth - 4, minCellSize);
      const actualCellHeight = Math.max(cellHeight - 4, minCellSize);
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cellNumber = row * cols + col + 1;
          if (cellNumber > boardSize) continue;
          
          const isEvenRow = row % 2 === 0;
          const actualCol = isEvenRow ? col : (cols - 1 - col);
          const x = padding + (actualCol / cols) * availableWidth;
          const y = padding + ((rows - 1 - row) / rows) * availableHeight;
          
          effects.push({
            type: 'boardCell',
            cellNumber,
            x: x + actualCellWidth / 2,
            y: y + actualCellHeight / 2,
            width: actualCellWidth,
            height: actualCellHeight,
            destroyed: false,
            destroyFrame: Math.random() * 250 + 100, // Random destruction timing (100-350 frames)
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.15,
            vx: 0,
            vy: 0,
            particles: [],
            originalX: x + actualCellWidth / 2,
            originalY: y + actualCellHeight / 2
          });
        }
      }

      // Alien armada - create alien ships
      for (let i = 0; i < 20; i++) {
        effects.push({
          type: 'alien',
          x: Math.random() * canvas.width,
          y: -50 - Math.random() * 200,
          speed: Math.random() * 2 + 1,
          size: Math.random() * 20 + 15,
          rotation: Math.random() * Math.PI * 2
        });
      }

      // Missiles targeting board cells
      for (let i = 0; i < 40; i++) {
        const targetCell = effects.find(e => e.type === 'boardCell' && !e.destroyed);
        if (targetCell) {
          effects.push({
            type: 'missile',
            x: Math.random() * canvas.width,
            y: -10 - Math.random() * 100,
            speed: Math.random() * 3 + 2,
            targetX: targetCell.x + (Math.random() - 0.5) * targetCell.width,
            targetY: targetCell.y + (Math.random() - 0.5) * targetCell.height,
            exploded: false,
            targetCell: targetCell
          });
        }
      }

      // Energy beams
      for (let i = 0; i < 15; i++) {
        effects.push({
          type: 'beam',
          x: Math.random() * canvas.width,
          y: 0,
          width: Math.random() * 5 + 3,
          length: 0,
          maxLength: Math.random() * canvas.height * 0.8 + canvas.height * 0.2,
          speed: Math.random() * 10 + 5,
          color: `hsl(${Math.random() * 60 + 0}, 100%, 50%)`
        });
      }
    } else {
      // Victory - fireworks and celebration
      for (let i = 0; i < 15; i++) {
        effects.push({
          type: 'firework',
          x: Math.random() * canvas.width,
          y: canvas.height + 50,
          targetY: Math.random() * canvas.height * 0.6 + canvas.height * 0.1,
          speed: Math.random() * 3 + 2,
          exploded: false,
          particles: []
        });
      }

      // Stars/confetti
      for (let i = 0; i < 50; i++) {
        effects.push({
          type: 'star',
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 2 + 0.5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      if (type === 'defeat') {
        // Draw board background first (before darkening)
        const boardPadding = 40;
        ctx.fillStyle = 'rgba(15, 23, 42, 1)'; // Fully opaque
        ctx.fillRect(boardPadding, boardPadding, canvas.width - boardPadding * 2, canvas.height - boardPadding * 2);
        ctx.strokeStyle = 'rgba(251, 191, 36, 1)'; // Fully opaque gold border
        ctx.lineWidth = 5;
        ctx.strokeRect(boardPadding, boardPadding, canvas.width - boardPadding * 2, canvas.height - boardPadding * 2);

        // Draw and destroy board cells
        effects.filter(e => e.type === 'boardCell').forEach(cell => {
          if (!cell.destroyed && frameCount >= cell.destroyFrame) {
            cell.destroyed = true;
            cell.vx = (Math.random() - 0.5) * 3;
            cell.vy = (Math.random() - 0.5) * 3;
            
            // Create destruction particles
            for (let i = 0; i < 12; i++) {
              cell.particles.push({
                x: cell.x,
                y: cell.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 50,
                size: Math.random() * 4 + 2,
                color: `hsl(${Math.random() * 60 + 0}, 100%, ${50 + Math.random() * 50}%)`
              });
            }
          }
          
          if (!cell.destroyed) {
            // Draw intact cell with proper styling
            const timeUntilDestroy = cell.destroyFrame - frameCount;
            const pulseAlpha = timeUntilDestroy < 30 ? 0.7 + Math.sin(frameCount * 0.3) * 0.2 : 1;
            
            ctx.save();
            ctx.translate(cell.x, cell.y);
            ctx.globalAlpha = pulseAlpha;
            
            // Cell background - make it fully visible
            ctx.fillStyle = 'rgba(31, 41, 55, 1)'; // Fully opaque dark gray
            ctx.fillRect(-cell.width / 2, -cell.height / 2, cell.width, cell.height);
            
            // Cell border - thicker and more visible
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Bright white border
            ctx.lineWidth = 2;
            ctx.strokeRect(-cell.width / 2, -cell.height / 2, cell.width, cell.height);
            
            // Cell number - larger and more visible
            ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Fully opaque white
            const fontSize = Math.max(14, Math.min(cell.width * 0.4, cell.height * 0.4, 24));
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cell.cellNumber.toString(), 0, 0);
            
            ctx.restore();
          } else {
            // Draw destroyed cell fragments
            cell.x += cell.vx;
            cell.y += cell.vy;
            cell.rotation += cell.rotationSpeed;
            cell.vx *= 0.97;
            cell.vy *= 0.97;
            
            const timeSinceDestroy = frameCount - cell.destroyFrame;
            const alpha = Math.max(0, 1 - timeSinceDestroy / 120);
            
            ctx.save();
            ctx.translate(cell.x, cell.y);
            ctx.rotate(cell.rotation);
            ctx.globalAlpha = alpha * 0.4;
            
            // Draw broken cell fragment
            ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
            ctx.fillRect(-cell.width / 2, -cell.height / 2, cell.width, cell.height);
            
            // Crack lines
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-cell.width / 2, -cell.height / 2);
            ctx.lineTo(cell.width / 2, cell.height / 2);
            ctx.moveTo(cell.width / 2, -cell.height / 2);
            ctx.lineTo(-cell.width / 2, cell.height / 2);
            ctx.stroke();
            
            ctx.restore();
            
            // Draw destruction particles
            cell.particles.forEach(particle => {
              particle.x += particle.vx;
              particle.y += particle.vy;
              particle.vx *= 0.96;
              particle.vy *= 0.96;
              particle.life--;
              
              const pAlpha = particle.life / 50;
              ctx.fillStyle = particle.color.replace(')', `, ${pAlpha})`).replace('hsl', 'hsla');
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size * pAlpha, 0, Math.PI * 2);
              ctx.fill();
            });
            
            // Remove dead particles
            cell.particles = cell.particles.filter(p => p.life > 0);
          }
        });

        // Darken background over time (after board is drawn)
        const darkenAlpha = Math.min(frameCount / 400, 0.6);
        ctx.fillStyle = `rgba(0, 0, 0, ${darkenAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw alien ships (on top)
        effects.filter(e => e.type === 'alien').forEach(alien => {
          alien.y += alien.speed;
          alien.rotation += 0.02;

          ctx.save();
          ctx.translate(alien.x, alien.y);
          ctx.rotate(alien.rotation);
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
          ctx.beginPath();
          ctx.moveTo(0, -alien.size);
          ctx.lineTo(-alien.size * 0.5, alien.size * 0.5);
          ctx.lineTo(alien.size * 0.5, alien.size * 0.5);
          ctx.closePath();
          ctx.fill();
          
          // Glow
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
          ctx.fill();
          ctx.restore();
        });

        // Draw missiles
        effects.filter(e => e.type === 'missile').forEach(missile => {
          if (!missile.exploded) {
            // Move towards target
            const dx = missile.targetX - missile.x;
            const dy = missile.targetY - missile.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 5) {
              missile.exploded = true;
              // Destroy target cell if it exists
              if (missile.targetCell && !missile.targetCell.destroyed) {
                missile.targetCell.destroyed = true;
                missile.targetCell.destroyFrame = frameCount;
              }
              // Create explosion particles
              for (let i = 0; i < 15; i++) {
                effects.push({
                  type: 'explosion',
                  x: missile.x,
                  y: missile.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 30,
                  size: Math.random() * 5 + 3
                });
              }
            } else {
              missile.x += (dx / dist) * missile.speed;
              missile.y += (dy / dist) * missile.speed;
              
              ctx.fillStyle = 'rgba(255, 200, 0, 0.9)';
              ctx.beginPath();
              ctx.arc(missile.x, missile.y, 3, 0, Math.PI * 2);
              ctx.fill();
              
              // Trail
              ctx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(missile.x - dx / dist * 10, missile.y - dy / dist * 10);
              ctx.lineTo(missile.x, missile.y);
              ctx.stroke();
            }
          }
        });

        // Draw energy beams
        effects.filter(e => e.type === 'beam').forEach(beam => {
          if (beam.length < beam.maxLength) {
            beam.length += beam.speed;
          }
          
          const gradient = ctx.createLinearGradient(beam.x, 0, beam.x, beam.length);
          gradient.addColorStop(0, beam.color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(beam.x - beam.width / 2, 0, beam.width, beam.length);
          
          // Glow
          ctx.shadowBlur = 30;
          ctx.shadowColor = beam.color;
          ctx.fillRect(beam.x - beam.width / 2, 0, beam.width, beam.length);
          ctx.shadowBlur = 0;
        });

        // Draw explosions
        effects.filter(e => e.type === 'explosion').forEach(explosion => {
          explosion.x += explosion.vx;
          explosion.y += explosion.vy;
          explosion.life--;
          
          const alpha = explosion.life / 30;
          ctx.fillStyle = `rgba(255, ${100 + Math.random() * 155}, 0, ${alpha})`;
          ctx.beginPath();
          ctx.arc(explosion.x, explosion.y, explosion.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        });

        // Remove dead explosions
        const explosionIndex = effects.findIndex(e => e.type === 'explosion' && e.life <= 0);
        if (explosionIndex !== -1) {
          effects.splice(explosionIndex, 1);
        }

        // Show game over after animation (wait for board destruction)
        const allCellsDestroyed = effects.filter(e => e.type === 'boardCell').every(cell => cell.destroyed);
        if (frameCount > 500 || (allCellsDestroyed && frameCount > 300)) {
          setShowGameOver(true);
          if (onComplete) {
            setTimeout(() => onComplete(), 2000);
          }
        }
      } else {
        // Victory animation
        // Draw stars/confetti
        effects.filter(e => e.type === 'star').forEach(star => {
          star.y -= star.speed;
          star.rotation += star.rotationSpeed;
          
          if (star.y < -10) {
            star.y = canvas.height + 10;
            star.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(star.x, star.y);
          ctx.rotate(star.rotation);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(frameCount * 0.1) * 0.3})`;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5;
            const x = Math.cos(angle) * star.size;
            const y = Math.sin(angle) * star.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });

        // Draw fireworks
        effects.filter(e => e.type === 'firework').forEach(firework => {
          if (!firework.exploded) {
            firework.y -= firework.speed;
            
            if (firework.y <= firework.targetY) {
              firework.exploded = true;
              // Create firework particles
              for (let i = 0; i < 30; i++) {
                const angle = (Math.PI * 2 * i) / 30;
                const speed = Math.random() * 3 + 2;
                firework.particles.push({
                  x: firework.x,
                  y: firework.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  life: 60,
                  color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  size: Math.random() * 3 + 2
                });
              }
            } else {
              // Draw rocket
              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.beginPath();
              ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
              ctx.fill();
              
              // Trail
              ctx.strokeStyle = 'rgba(255, 200, 0, 0.7)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(firework.x, firework.y + 10);
              ctx.lineTo(firework.x, firework.y);
              ctx.stroke();
            }
          } else {
            // Draw particles
            firework.particles.forEach(particle => {
              particle.x += particle.vx;
              particle.y += particle.vy;
              particle.vx *= 0.98;
              particle.vy *= 0.98;
              particle.life--;

              const alpha = particle.life / 60;
              ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
              ctx.fill();
            });

            // Remove dead particles
            firework.particles = firework.particles.filter(p => p.life > 0);
          }
        });

        // Show game over after animation
        if (frameCount > 300) {
          setShowGameOver(true);
          if (onComplete) {
            setTimeout(() => onComplete(), 2000);
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, onComplete, boardSize]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {showGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
          <div className="text-center">
            <div className={`text-6xl md:text-8xl font-bold mb-4 ${
              type === 'victory' ? 'text-yellow-400' : 'text-red-500'
            }`} style={{
              textShadow: `0 0 20px ${type === 'victory' ? 'rgba(251, 191, 36, 0.8)' : 'rgba(239, 68, 68, 0.8)'}`,
              animation: 'pulse 1s ease-in-out infinite'
            }}>
              {type === 'victory' ? '🎉 VICTORY!' : '💀 GAME OVER'}
            </div>
            <div className="text-2xl md:text-3xl text-white font-semibold mb-8">
              {type === 'victory' 
                ? 'You have conquered the stars!' 
                : 'The alien armada has destroyed everything...'}
            </div>
            {onComplete && (
              <button
                onClick={onComplete}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105 border-2 border-gray-600"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

