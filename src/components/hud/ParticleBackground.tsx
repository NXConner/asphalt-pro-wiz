import { memo, useEffect, useMemo, useRef } from 'react';

import { PARTICLE_PRESETS, type ParticlePresetKey } from '@/design';
import { cn } from '@/lib/utils';

interface ParticleBackgroundProps {
  preset?: ParticlePresetKey;
  className?: string;
  densityMultiplier?: number;
}

const MAX_PARTICLES = 64;

const ParticleBackgroundComponent = ({
  preset = 'ember',
  className,
  densityMultiplier = 1,
}: ParticleBackgroundProps) => {
  const { color, secondary, speed, density } = PARTICLE_PRESETS[preset];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useMemo(() => {
    const count = Math.min(MAX_PARTICLES, Math.round(density * densityMultiplier));
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
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
      animationFrame = requestAnimationFrame(render);
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    render();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
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

