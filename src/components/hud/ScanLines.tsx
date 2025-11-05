import { motion } from 'framer-motion';
import { memo, type CSSProperties } from 'react';

import { cn } from '@/lib/utils';

type Direction = 'horizontal' | 'vertical';

export interface ScanLinesProps {
  className?: string;
  accentColor?: string;
  density?: number;
  speedMs?: number;
  opacity?: number;
  direction?: Direction;
  blendMode?: CSSProperties['mixBlendMode'];
}

const buildGradient = (direction: Direction, accent: string, density: number) => {
  const size = `${density}px`;
  const gradient = direction === 'horizontal'
    ? `repeating-linear-gradient(to bottom, transparent 0, transparent ${density - 4}px, ${accent} ${density - 3}px, transparent ${density}px)`
    : `repeating-linear-gradient(to right, transparent 0, transparent ${density - 4}px, ${accent} ${density - 3}px, transparent ${density}px)`;

  return { gradient, size };
};

const ScanLinesComponent = ({
  className,
  accentColor = 'rgba(255,140,0,0.25)',
  density = 64,
  speedMs = 3800,
  opacity = 0.55,
  direction = 'horizontal',
  blendMode = 'screen',
}: ScanLinesProps) => {
  const { gradient, size } = buildGradient(direction, accentColor, density);

  const animation =
    direction === 'horizontal'
      ? { backgroundPositionY: ['0px', `${density}px`] }
      : { backgroundPositionX: ['0px', `${density}px`] };

  return (
    <motion.div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        mixBlendMode: blendMode,
      }}
      initial={animation}
      animate={animation}
      transition={{ duration: speedMs / 1000, repeat: Infinity, ease: 'linear' }}
    >
      <div
        className="absolute inset-0"
        style={{
          opacity,
          backgroundImage: gradient,
          backgroundSize: direction === 'horizontal' ? `100% ${size}` : `${size} 100%`,
        }}
      />
    </motion.div>
  );
};

export const ScanLines = memo(ScanLinesComponent);

