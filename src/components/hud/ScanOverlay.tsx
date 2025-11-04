import { motion } from 'framer-motion';
import { memo } from 'react';

import { HUD_DURATIONS, HUD_EASING } from '@/design';
import { cn } from '@/lib/utils';

interface ScanOverlayProps {
  className?: string;
  color?: string;
  delay?: number;
}

const ScanOverlayComponent = ({ className, color = 'rgba(255,128,0,0.35)', delay = 0 }: ScanOverlayProps) => (
  <motion.div
    aria-hidden
    className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
  >
    <motion.span
      className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-[color:var(--scan-color)] to-transparent"
      style={{
        '--scan-color': color,
      }}
      initial={{ y: '-110%', opacity: 0 }}
      animate={{ y: '110%', opacity: [0, 0.6, 0] }}
      transition={{
        delay,
        duration: HUD_DURATIONS.deliberate,
        ease: HUD_EASING.glide,
        repeat: Infinity,
      }}
    />
  </motion.div>
);

export const ScanOverlay = memo(ScanOverlayComponent);

