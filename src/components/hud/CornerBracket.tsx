import { memo } from 'react';

import { cn } from '@/lib/utils';

type CornerPosition = 'tl' | 'tr' | 'bl' | 'br';

interface CornerBracketProps {
  size?: number;
  strokeWidth?: number;
  glow?: boolean;
  className?: string;
}

const Corner = ({ position, size, strokeWidth, glow }: {
  position: CornerPosition;
  size: number;
  strokeWidth: number;
  glow: boolean;
}) => {
  const base = `${size}px`;
  const border = `${strokeWidth}px`;
  const glowClass = glow ? 'shadow-[0_0_12px_rgba(255,128,0,0.45)]' : '';

  const cornerStyles: Record<CornerPosition, string> = {
    tl: `top:0;left:0;border-right:none;border-bottom:none;`,
    tr: `top:0;right:0;border-left:none;border-bottom:none;`,
    bl: `bottom:0;left:0;border-right:none;border-top:none;`,
    br: `bottom:0;right:0;border-left:none;border-top:none;`,
  };

  return (
    <span
      className={cn(
        'pointer-events-none absolute block rounded-none border border-orange-400/60',
        glowClass,
      )}
      style={{
        width: base,
        height: base,
        borderWidth: border,
        boxShadow: glow ? '0 0 18px rgba(255,128,0,0.42)' : undefined,
        ...Object.fromEntries(
          cornerStyles[position]
            .split(';')
            .filter(Boolean)
            .map((rule) => {
              const [key, value] = rule.split(':');
              return [key.trim(), value.trim()];
            }),
        ),
      }}
    />
  );
};

const CornerBracketComponent = ({
  size = 32,
  strokeWidth = 2,
  glow = true,
  className,
}: CornerBracketProps) => (
  <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden>
    <Corner position="tl" size={size} strokeWidth={strokeWidth} glow={glow} />
    <Corner position="tr" size={size} strokeWidth={strokeWidth} glow={glow} />
    <Corner position="bl" size={size} strokeWidth={strokeWidth} glow={glow} />
    <Corner position="br" size={size} strokeWidth={strokeWidth} glow={glow} />
  </div>
);

export const CornerBracket = memo(CornerBracketComponent);

