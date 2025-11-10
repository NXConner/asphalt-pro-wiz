import { motion } from 'framer-motion';
import { memo, type CSSProperties, type ReactNode } from 'react';

import { CanvasGrid } from './CanvasGrid';
import { CornerBrackets, type CornerBracketsProps } from './CornerBrackets';
import { ScanLines, type ScanLinesProps } from './ScanLines';

import { resolveTacticalTone, type TacticalTone } from '@/lib/tacticalTone';
import { cn } from '@/lib/utils';

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
  tone?: TacticalTone;
}

const withAlpha = (color: string, alpha: number): string => {
  const trimmed = color.trim();
  if (trimmed.startsWith('hsla(')) {
    if (trimmed.includes('/')) {
      return trimmed.replace(/\/\s*([^)]+)\)/, `/ ${alpha})`);
    }
    return trimmed.replace(/\)\s*$/, `, ${alpha})`);
  }
  if (trimmed.startsWith('hsl(')) {
    return trimmed.replace('hsl(', 'hsla(').replace(/\)\s*$/, `, ${alpha})`);
  }
  if (trimmed.startsWith('rgba(')) {
    return trimmed.replace(
      /rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/,
      (_match, r, g, b) => `rgba(${r.trim()},${g.trim()},${b.trim()},${alpha})`,
    );
  }
  if (trimmed.startsWith('rgb(')) {
    return trimmed.replace('rgb(', 'rgba(').replace(/\)\s*$/, `, ${alpha})`);
  }
  return `color-mix(in srgb, ${trimmed} ${Math.max(0, Math.min(1, alpha)) * 100}%, transparent)`;
};

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
  tone,
}: TacticalOverlayProps) => {
  const toneConfig = resolveTacticalTone({
    tone,
    accentOverride: accentColor,
    backgroundOverride: backgroundTint,
    gridOpacity,
    scanOpacity: scanLinesProps?.opacity,
  });

  const resolvedAccent = toneConfig.accent;
  const resolvedBackground = toneConfig.background;
  const resolvedGridOpacity = gridOpacity ?? toneConfig.gridOpacity;
  const resolvedScanOpacity = scanLinesProps?.opacity ?? toneConfig.scanOpacity;

  const scanAccent = withAlpha(resolvedAccent, resolvedScanOpacity);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 text-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.45)] backdrop-blur-lg',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/8 before:to-transparent before:opacity-60 before:mix-blend-overlay',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:border after:border-white/10 after:opacity-40',
        className,
      )}
      style={{
        backgroundColor: resolvedBackground,
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
              background: `radial-gradient(circle at 20% 20%, ${withAlpha(
                resolvedAccent,
                0.22,
              )}, transparent 60%), radial-gradient(circle at 80% 30%, ${withAlpha(
                resolvedAccent,
                0.18,
              )}, transparent 65%)`,
            }}
        />
      )}
      {showGrid && (
        <CanvasGrid
          opacity={resolvedGridOpacity}
          density={gridDensity}
          className="mix-blend-screen"
        />
      )}
      {showScanLines && (
        <ScanLines
          opacity={resolvedScanOpacity}
          density={72}
          speedMs={3400}
          accentColor={scanAccent}
          {...scanLinesProps}
        />
      )}
      <CornerBrackets accentColor={resolvedAccent} {...cornerProps} />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const TacticalOverlay = memo(TacticalOverlayComponent);
