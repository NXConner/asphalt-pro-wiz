import { motion } from 'framer-motion';
import { memo } from 'react';

import { HUD_DURATIONS, HUD_EASING } from '@/design';
import { cn } from '@/lib/utils';

interface TacticalLoaderProps {
  className?: string;
  label?: string;
  size?: number;
}

const TacticalLoaderComponent = ({ className, label = 'Analyzing Data', size = 64 }: TacticalLoaderProps) => (
  <div className={cn('flex flex-col items-center gap-3 text-center', className)}>
    <div className="relative">
      <motion.span
        className="block rounded-full border border-orange-400/70"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ duration: HUD_DURATIONS.deliberate, repeat: Infinity, ease: HUD_EASING.tactical }}
      />
      <motion.span
        className="absolute inset-2 rounded-full border border-cyan-400/60"
        animate={{ rotate: -360 }}
        transition={{ duration: HUD_DURATIONS.standard, repeat: Infinity, ease: HUD_EASING.glide }}
      />
      <motion.span
        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400"
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
    <span className="font-mono text-xs uppercase tracking-[0.4em] text-slate-200/70">{label}</span>
  </div>
);

export const TacticalLoader = memo(TacticalLoaderComponent);

