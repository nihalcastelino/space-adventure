import { useEffect, useRef } from 'react';

export default function ParticleEffects({ active = true, type = 'stars' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const particles = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles based on type
    const createParticle = () => {
      if (type === 'stars') {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.5 + 0.5,
          twinkle: Math.random() * 0.02 + 0.01
        };
      } else if (type === 'nebula') {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          color: `hsl(${Math.random() * 60 + 240}, 70%, ${Math.random() * 30 + 50}%)`
        };
      }
      return null;
    };

    // Initialize particles
    const particleCount = type === 'stars' ? 100 : 30;
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        if (type === 'stars') {
          // Star twinkling
          particle.opacity += particle.twinkle;
          if (particle.opacity > 1 || particle.opacity < 0.3) {
            particle.twinkle = -particle.twinkle;
          }

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.fill();

          // Add glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (type === 'nebula') {
          // Nebula particles
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          if (particle.x < 0 || particle.x > canvas.width) particle.speedX = -particle.speedX;
          if (particle.y < 0 || particle.y > canvas.height) particle.speedY = -particle.speedY;

          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, type]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

