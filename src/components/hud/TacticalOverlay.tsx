import { motion } from 'framer-motion';
import { memo, type CSSProperties, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { CanvasGrid } from './CanvasGrid';
import { CornerBrackets, type CornerBracketsProps } from './CornerBrackets';
import { ScanLines, type ScanLinesProps } from './ScanLines';

export interface TacticalOverlayProps {
  children?: ReactNode;
  accentColor?: string;
  backgroundTint?: string;
  blur?: number;
  showGrid?: boolean;
  gridOpacity?: number;
  gridDensity?: number;
  showScanLines?: boolean;
  scanLinesProps?: Partial<ScanLinesProps>;
  cornerProps?: Partial<CornerBracketsProps>;
  pulse?: boolean;
  className?: string;
  style?: CSSProperties;
}

const TacticalOverlayComponent = ({
  children,
  accentColor = 'rgba(255,140,0,0.85)',
  backgroundTint = 'rgba(5,10,20,0.72)',
  blur = 12,
  showGrid = true,
  gridOpacity = 0.28,
  gridDensity = 96,
  showScanLines = true,
  scanLinesProps,
  cornerProps,
  pulse = true,
  className,
  style,
}: TacticalOverlayProps) => {
  const scanAccent = accentColor.startsWith('rgba')
    ? accentColor.replace(
        /rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/,
        (_match, r, g, b) => `rgba(${r.trim()},${g.trim()},${b.trim()},0.35)`,
      )
    : accentColor;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 text-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.45)] backdrop-blur-lg',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/8 before:to-transparent before:opacity-60 before:mix-blend-overlay',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:border after:border-white/10 after:opacity-40',
        className,
      )}
      style={{
        backgroundColor: backgroundTint,
        backdropFilter: `blur(${blur}px)`,
        ...style,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-white/4 to-transparent opacity-10" />
      {pulse && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0.35 }}
          animate={{ opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(circle at 20% 20%, ${accentColor}22, transparent 60%), radial-gradient(circle at 80% 30%, ${accentColor}18, transparent 65%)`,
          }}
        />
      )}
      {showGrid && <CanvasGrid opacity={gridOpacity} density={gridDensity} className="mix-blend-screen" />}
      {showScanLines && (
        <ScanLines
          opacity={0.45}
          density={72}
          speedMs={3400}
          accentColor={scanAccent}
          {...scanLinesProps}
        />
      )}
      <CornerBrackets accentColor={accentColor} {...cornerProps} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const TacticalOverlay = memo(TacticalOverlayComponent);

