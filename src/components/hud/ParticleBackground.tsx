import { memo, useEffect, useMemo, useRef } from 'react';

import { PARTICLE_PRESETS, type ParticlePresetKey } from '@/design';
import { cn } from '@/lib/utils';

interface ParticleBackgroundProps {
  preset?: ParticlePresetKey;
  className?: string;
  densityMultiplier?: number;
}

const MAX_PARTICLES = 32; // Reduced from 64 for better performance

const ParticleBackgroundComponent = ({
  preset = 'ember',
  className,
  densityMultiplier = 1,
}: ParticleBackgroundProps) => {
  const { color, secondary, speed, density } = PARTICLE_PRESETS[preset];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  
  const particles = useMemo(() => {
    const count = Math.min(MAX_PARTICLES, Math.round(density * densityMultiplier * 0.5)); // Reduced density
    return Array.from({ length: count }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 2 + 0.5,
      v: (Math.random() * 0.3 + 0.2) * speed,
      hue: Math.random() > 0.5,
    }));
  }, [density, densityMultiplier, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }); // Optimize context
    if (!ctx) return;

    // Throttle animation to ~30fps for better performance
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    const render = (currentTime: number) => {
      // Throttle frames
      if (currentTime - lastFrameTimeRef.current < FRAME_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }
      lastFrameTimeRef.current = currentTime;

      // Pause animation when tab is not visible
      if (document.hidden) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      
      // Batch operations for better performance
      particles.forEach((particle) => {
        particle.y -= particle.v;
        if (particle.y < -0.1) {
          particle.y = 1.1;
          particle.x = Math.random();
        }
        const gradient = ctx.createRadialGradient(
          particle.x * width,
          particle.y * height,
          0,
          particle.x * width,
          particle.y * height,
          particle.r * 12,
        );
        gradient.addColorStop(0, particle.hue ? color : secondary);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x * width, particle.y * height, particle.r * 8, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameRef.current = requestAnimationFrame(render);
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    animationFrameRef.current = requestAnimationFrame(render);

    // Throttle resize handler
    let resizeTimeout: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 150);
    };

    window.addEventListener('resize', throttledResize);
    
    // Pause when tab is hidden
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('resize', throttledResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(resizeTimeout);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [color, secondary, particles]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 h-full w-full opacity-70', className)}
    />
  );
};

export const ParticleBackground = memo(ParticleBackgroundComponent);

