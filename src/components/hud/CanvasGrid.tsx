import { memo } from 'react';

import { cn } from '@/lib/utils';

interface CanvasGridProps {
  className?: string;
  density?: number;
  opacity?: number;
}

const CanvasGridComponent = ({ className, density = 96, opacity = 0.18 }: CanvasGridProps) => {
  const backgroundSize = `${density}px ${density}px`;

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-500',
        className,
      )}
      style={{
        opacity,
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize,
      }}
    />
  );
};

export const CanvasGrid = memo(CanvasGridComponent);

