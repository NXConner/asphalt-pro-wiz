import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

import { cn } from '@/lib/utils';

type Corner = 'tl' | 'tr' | 'bl' | 'br';

export interface CornerBracketsProps {
  size?: number;
  thickness?: number;
  glow?: boolean;
  animated?: boolean;
  accentColor?: string;
  offset?: number;
  className?: string;
  pulseDelayMs?: number;
}

const CORNERS: Corner[] = ['tl', 'tr', 'bl', 'br'];

const buildCornerStyle = (
  corner: Corner,
  size: number,
  thickness: number,
  offset: number,
  color: string,
) => {
  const base = {
    width: size,
    height: size,
    borderColor: color,
    borderWidth: thickness,
    position: 'absolute' as const,
  };

  const positions: Record<Corner, Partial<CSSStyleDeclaration>> = {
    tl: { top: offset, left: offset, borderRight: 'none', borderBottom: 'none' },
    tr: { top: offset, right: offset, borderLeft: 'none', borderBottom: 'none' },
    bl: { bottom: offset, left: offset, borderRight: 'none', borderTop: 'none' },
    br: { bottom: offset, right: offset, borderLeft: 'none', borderTop: 'none' },
  };

  return {
    ...base,
    ...positions[corner],
  } satisfies CSSStyleDeclaration;
};

const CornerElement = ({
  corner,
  size,
  thickness,
  offset,
  accent,
  glow,
  animated,
  pulseDelayMs,
}: {
  corner: Corner;
  size: number;
  thickness: number;
  offset: number;
  accent: string;
  glow: boolean;
  animated: boolean;
  pulseDelayMs: number;
}) => {
  const style = useMemo(
    () => buildCornerStyle(corner, size, thickness, offset, accent),
    [corner, size, thickness, offset, accent],
  );

  const shimmer = {
    boxShadow: glow ? `0 0 16px ${accent}` : undefined,
    filter: glow ? 'drop-shadow(0 0 10px rgba(255,128,0,0.55))' : undefined,
  } satisfies CSSStyleDeclaration;

  if (!animated) {
    return <span aria-hidden className="pointer-events-none rounded-none border absolute" style={{ ...style, ...shimmer }} />;
  }

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none rounded-none border absolute"
      style={{ ...style, ...shimmer }}
      initial={{ opacity: 0.35 }}
      animate={{ opacity: [0.35, 1, 0.35] }}
      transition={{
        duration: 3.6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: pulseDelayMs / 1000,
      }}
    />
  );
};

const CornerBracketsComponent = ({
  size = 36,
  thickness = 2,
  glow = true,
  animated = true,
  accentColor = 'rgba(255,140,0,0.78)',
  offset = 4,
  pulseDelayMs = 180,
  className,
}: CornerBracketsProps) => (
  <div
    aria-hidden
    className={cn('pointer-events-none absolute inset-0', className)}
    role="presentation"
  >
    {CORNERS.map((corner, index) => (
      <CornerElement
        key={corner}
        corner={corner}
        size={size}
        thickness={thickness}
        offset={offset}
        accent={accentColor}
        glow={glow}
        animated={animated}
        pulseDelayMs={pulseDelayMs + index * 90}
      />
    ))}
  </div>
);

export const CornerBrackets = memo(CornerBracketsComponent);

