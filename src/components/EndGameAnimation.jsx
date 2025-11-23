import { useEffect, useState, useRef } from 'react';

/**
 * End Game Animation Component
 * 
 * Shows dramatic end-game sequences:
 * - Victory: Celebration with fireworks and success
 * - Defeat: Alien armada descends and destroys the board
 */
export default function EndGameAnimation({ 
  type, // 'victory', 'defeat', or 'ai_victory'
  winner, // Winner object
  players = [], // Array of players with positions
  onComplete,
  boardSize = 100 // Board size to render destruction
}) {
  const canvasRef = useRef(null);
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let frameCount = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation particles/effects
    const effects = [];
    
    // Determine actual animation type based on winner if not explicitly set
    const animType = type || (winner?.isAI || winner?.name?.includes('AI') || winner?.name?.includes('Bot') ? 'ai_victory' : 'victory');

    // Reduced delay for immediate action
    const ATTACK_START = 30; 

    if (animType === 'defeat' || animType === 'ai_victory') {
      // Find and target actual player rocket DOM elements
      const rocketElements = document.querySelectorAll('.target-player-rocket');
      const playerTargets = [];

      rocketElements.forEach(el => {
          const isAI = el.getAttribute('data-is-ai') === 'true';
          const playerId = el.getAttribute('data-player-id');
          
          // Target non-AI players in AI victory, or everyone in defeat
          if ((animType === 'ai_victory' && !isAI) || animType === 'defeat') {
              const rect = el.getBoundingClientRect();
              const styles = window.getComputedStyle(el);
              
              playerTargets.push({
                  id: playerId,
                  originalElement: el,
                  // Initial coords
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                  width: rect.width,
                  height: rect.height,
                  // Visuals
                  color: styles.color || '#FFF',
                  fontSize: parseFloat(styles.fontSize) || 24,
                  icon: el.textContent || '🚀',
                  // State
                  destroyed: false,
                  destroyFrame: ATTACK_START + Math.random() * 30 + 20,
                  particles: []
              });
          }
      });

      // Find Spaceport
      const spaceportEl = document.querySelector('.starting-spaceport');
      if (spaceportEl) {
          const rect = spaceportEl.getBoundingClientRect();
          effects.push({
            type: 'spaceportTarget',
            originalElement: spaceportEl,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
            destroyed: false,
            destroyFrame: ATTACK_START + 60,
            particles: []
          });
      }

      // Add player targets to effects list
      playerTargets.forEach(target => {
          effects.push({
            type: 'playerTarget',
            ...target
          });
      });
      
      // Initialize Armada
      if (animType === 'defeat') {
          for (let i = 0; i < 20; i++) {
            effects.push({
                type: 'alien',
                x: Math.random() * canvas.width,
                y: -50 - Math.random() * 200,
                speed: Math.random() * 2 + 2, // Faster
                size: Math.random() * 20 + 15,
                rotation: Math.random() * Math.PI * 2,
                delay: ATTACK_START
            });
        }
      } else if (animType === 'ai_victory') {
        for (let i = 0; i < 30; i++) { // More ships
          effects.push({
            type: 'ai_ship',
            x: Math.random() * canvas.width,
            y: -50 - Math.random() * 250, // Start closer
            speed: Math.random() * 3 + 2, // Faster descent
            size: Math.random() * 25 + 20,
            rotation: Math.random() * Math.PI * 2,
            shipType: Math.floor(Math.random() * 3),
            fireCooldown: Math.random() * 30 + 10, // Fire sooner
            delay: 0 // No delay, start descending immediately
          });
        }
      }

    } else {
      // Victory Setup (Fireworks)
      for (let i = 0; i < 20; i++) {
        effects.push({
          type: 'firework',
          x: Math.random() * canvas.width,
          y: canvas.height + 50,
          targetY: Math.random() * canvas.height * 0.6 + canvas.height * 0.1,
          speed: Math.random() * 4 + 3,
          exploded: false,
          particles: []
        });
      }
      for (let i = 0; i < 60; i++) {
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
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;
      
      if (animType === 'defeat' || animType === 'ai_victory') {
        // Background dimming
        const darkenAlpha = Math.min(frameCount / 200, 0.6);
        ctx.fillStyle = `rgba(0, 0, 0, ${darkenAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- UPDATE TARGET POSITIONS (SYNC WITH DOM) ---
        // This prevents blinking by ensuring canvas draws exactly where DOM element is
        [...effects.filter(e => e.type === 'playerTarget'), ...effects.filter(e => e.type === 'spaceportTarget')].forEach(target => {
            if (!target.destroyed && target.originalElement) {
                const rect = target.originalElement.getBoundingClientRect();
                target.x = rect.left + rect.width / 2;
                target.y = rect.top + rect.height / 2;
                target.width = rect.width;
                target.height = rect.height;

                // Once attack starts, hide DOM element and rely on canvas draw
                if (frameCount > 5) { 
                    target.originalElement.style.opacity = '0'; 
                }
            }
        });

        // --- DRAW TARGETS ---
        // 1. Player Rockets
        effects.filter(e => e.type === 'playerTarget').forEach(target => {
            if (!target.destroyed) {
                // Shake effect
                const shakeX = frameCount > ATTACK_START ? (Math.random() - 0.5) * 6 : 0;
                const shakeY = frameCount > ATTACK_START ? (Math.random() - 0.5) * 6 : 0;

                ctx.save();
                ctx.translate(target.x + shakeX, target.y + shakeY);
                // Scale up in fear
                const scale = frameCount > ATTACK_START ? 1.0 + Math.sin(frameCount * 0.5) * 0.1 : 1.0;
                ctx.scale(scale, scale);
                
                // Draw text
                ctx.font = `${target.fontSize}px sans-serif`; // Ensure valid font string
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = target.color;
                ctx.shadowColor = target.color;
                ctx.shadowBlur = 10;
                ctx.fillText(target.icon, 0, 0);
                ctx.restore();
            } else {
                // Generate particles ONCE on destruction
                if (target.particles.length === 0) {
                    for (let i = 0; i < 40; i++) {
                        target.particles.push({
                            x: target.x,
                            y: target.y,
                            vx: (Math.random() - 0.5) * 15,
                            vy: (Math.random() - 0.5) * 15,
                            life: 100,
                            size: Math.random() * 6 + 4,
                            color: target.color === '#FFF' ? `hsl(${Math.random()*60 + 10}, 100%, 50%)` : target.color
                        });
                    }
                    // Add explosion flash
                    effects.push({
                        type: 'explosion',
                        x: target.x,
                        y: target.y,
                        vx: 0, vy: 0,
                        life: 20,
                        size: 60 // Big flash
                    });
                }
            }
            
            // Update/Draw Particles
            target.particles.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95; p.life--;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 100;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
                ctx.globalAlpha = 1;
            });
        });

        // 2. Spaceport
        effects.filter(e => e.type === 'spaceportTarget').forEach(target => {
             if (!target.destroyed) {
                 ctx.save();
                 ctx.translate(target.x, target.y);
                 // Match Spaceport style
                 ctx.fillStyle = 'rgba(16, 185, 129, 0.3)'; 
                 ctx.fillRect(-target.width/2, -target.height/2, target.width, target.height);
                 ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
                 ctx.lineWidth = 3;
                 ctx.strokeRect(-target.width/2, -target.height/2, target.width, target.height);
                 ctx.restore();
             } else if (target.particles.length === 0) {
                 // Explode
                 for (let i = 0; i < 60; i++) {
                    target.particles.push({
                        x: target.x + (Math.random()-0.5)*target.width,
                        y: target.y + (Math.random()-0.5)*target.height,
                        vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12,
                        life: 120, size: Math.random()*8+4,
                        color: `rgba(16, 185, 129, 1)`
                    });
                 }
             }
             // Particles
             target.particles.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95; p.life--;
                ctx.fillStyle = p.color; ctx.globalAlpha = p.life/120;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
                ctx.globalAlpha = 1;
             });
        });

        // --- ARMADA & WEAPONS ---
        if (animType === 'ai_victory') {
            // AI Ships
            effects.filter(e => e.type === 'ai_ship').forEach(ship => {
                ship.y += ship.speed;
                // Oscillate X slightly
                ship.x += Math.sin(frameCount * 0.05) * 1; 
                
                // Fire Logic
                if (frameCount > ATTACK_START && ship.fireCooldown-- <= 0) {
                    // Find a living target
                    const targets = [...effects.filter(e => e.type === 'playerTarget' && !e.destroyed),
                                     ...effects.filter(e => e.type === 'spaceportTarget' && !e.destroyed)];
                    
                    if (targets.length > 0) {
                        const t = targets[Math.floor(Math.random() * targets.length)];
                        effects.push({
                            type: 'laser',
                            x: ship.x, y: ship.y,
                            targetX: t.x + (Math.random()-0.5)*20,
                            targetY: t.y + (Math.random()-0.5)*20,
                            speed: 15,
                            hit: false, exploded: false,
                            color: '#FF0000',
                            isHeavy: false
                        });
                        ship.fireCooldown = Math.random() * 20 + 10;
                    }
                }

                // Draw Ship
                if (ship.y < canvas.height + 100) {
                    ctx.save();
                    ctx.translate(ship.x, ship.y);
                    ctx.rotate(ship.rotation + Math.PI); // Point down
                    ctx.fillStyle = ship.shipType === 0 ? '#A855F7' : ship.shipType === 1 ? '#22C55E' : '#EF4444';
                    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 15;
                    
                    ctx.beginPath();
                    if (ship.shipType === 0) { // Triangle
                        ctx.moveTo(0, 20); ctx.lineTo(-15, -15); ctx.lineTo(15, -15);
                    } else { // Diamond
                        ctx.moveTo(0, 25); ctx.lineTo(15, 0); ctx.lineTo(0, -25); ctx.lineTo(-15, 0);
                    }
                    ctx.closePath(); ctx.fill();
                    ctx.restore();
                }
            });
        }

        // --- PROJECTILES ---
        effects.filter(e => e.type === 'laser').forEach(proj => {
            if (!proj.hit) {
                const dx = proj.targetX - proj.x;
                const dy = proj.targetY - proj.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < 20) {
                    proj.hit = true;
                    proj.exploded = true;
                    // Create small explosion at impact
                    effects.push({
                        type: 'explosion',
                        x: proj.x, y: proj.y,
                        vx: 0, vy: 0, life: 30, size: 20
                    });

                    // CHECK COLLISIONS WITH TARGETS
                    [...effects.filter(e => e.type === 'playerTarget'), 
                     ...effects.filter(e => e.type === 'spaceportTarget')].forEach(t => {
                        if (!t.destroyed && Math.abs(t.x - proj.x) < 50 && Math.abs(t.y - proj.y) < 50) {
                            t.destroyed = true;
                            t.destroyFrame = frameCount; // Explode now
                        }
                     });

                } else {
                    proj.x += (dx/dist) * proj.speed;
                    proj.y += (dy/dist) * proj.speed;
                    
                    ctx.strokeStyle = proj.color;
                    ctx.lineWidth = 4;
                    ctx.shadowColor = proj.color; ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.moveTo(proj.x - (dx/dist)*20, proj.y - (dy/dist)*20);
                    ctx.lineTo(proj.x, proj.y);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            }
        });

        // --- EXPLOSIONS ---
        effects.filter(e => e.type === 'explosion').forEach(exp => {
            exp.life--;
            ctx.fillStyle = `rgba(255, ${100 + Math.random()*155}, 0, ${exp.life/30})`;
            ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.size * (exp.life/30), 0, Math.PI*2); ctx.fill();
        });
        // Remove dead explosions
        const deadExp = effects.filter(e => e.type === 'explosion' && e.life <= 0);
        deadExp.forEach(d => {
            const idx = effects.indexOf(d);
            if(idx > -1) effects.splice(idx, 1);
        });

        // Completion Check
        const allTargetsDestroyed = effects.filter(e => e.type === 'playerTarget' || e.type === 'spaceportTarget').every(t => t.destroyed);
        if ((frameCount > 600 || (allTargetsDestroyed && frameCount > ATTACK_START + 100)) && !showGameOver) {
            if (onComplete) {
                // Restore opacity before unmounting/resetting
                 effects.filter(e => e.type === 'playerTarget' || e.type === 'spaceportTarget').forEach(t => {
                   if (t.originalElement) t.originalElement.style.opacity = '1';
               });
               setTimeout(onComplete, 2000);
               setShowGameOver(true); // Prevent multi-trigger
            }
        }

      } else {
         // Victory Logic (unchanged)
         effects.filter(e => e.type === 'star').forEach(star => {
          star.y -= star.speed;
          if (star.y < -10) { star.y = canvas.height + 10; star.x = Math.random() * canvas.width; }
          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random()*0.5})`;
          ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        effects.filter(e => e.type === 'firework').forEach(fw => {
             if(!fw.exploded) {
                 fw.y -= fw.speed;
                 if(fw.y < fw.targetY) {
                     fw.exploded = true;
                     for(let k=0; k<30; k++) {
                         fw.particles.push({x: fw.x, y: fw.y, vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5, life: 60, color: `hsl(${Math.random()*360}, 100%, 50%)`});
                     }
                 } else {
                     ctx.fillStyle = '#FFF'; ctx.fillRect(fw.x, fw.y, 3, 3);
                 }
             } else {
                 fw.particles.forEach(p => {
                     p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
                     ctx.fillStyle = p.color; ctx.globalAlpha = p.life/60;
                     ctx.fillRect(p.x, p.y, 3, 3); ctx.globalAlpha = 1;
                 });
             }
        });
         if (frameCount > 300 && !showGameOver) {
            if(onComplete) setTimeout(onComplete, 2000);
            setShowGameOver(true);
         }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      // Safety cleanup
      const rockets = document.querySelectorAll('.target-player-rocket');
      rockets.forEach(el => el.style.opacity = '1');
      const spaceport = document.querySelector('.starting-spaceport');
      if (spaceport) spaceport.style.opacity = '1';
    };
  }, [type, winner, onComplete, boardSize, players]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
