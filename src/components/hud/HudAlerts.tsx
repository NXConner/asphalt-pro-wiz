import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';

import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
}

interface HudAlertsProps {
  alerts: Alert[];
  alertAnimation: 'none' | 'slide' | 'pulse' | 'shake' | 'bounce' | 'glow';
  alertMotion: any;
  alertTransition: any;
}

export const HudAlerts = memo(function HudAlerts({
  alerts,
  alertAnimation,
  alertMotion,
  alertTransition,
}: HudAlertsProps) {
  return (
    <AnimatePresence>
      {alerts.map((alert) => (
        <motion.div
          key={alert.id}
          initial={{
            opacity: alertMotion.initial?.opacity ?? 0,
            y: (alertMotion.initial?.y as number) ?? -20,
            ...(alertMotion.initial ?? {}),
          } as any}
          animate={{
            ...(alertMotion.animate ?? {}),
            opacity: 1,
            y: 0,
            ...(alertAnimation === 'pulse' && {
              scale: [1, 1.05, 1],
              transition: { repeat: 2, duration: 0.5 }
            }),
            ...(alertAnimation === 'shake' && {
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.5 }
            }),
            ...(alertAnimation === 'bounce' && {
              y: [0, -10, 0],
              transition: { repeat: 2, duration: 0.3 }
            }),
            ...(alertAnimation === 'glow' && {
              boxShadow: [
                '0 0 0px hsl(var(--primary) / 0)',
                '0 0 20px hsl(var(--primary) / 0.5)',
                '0 0 0px hsl(var(--primary) / 0)'
              ],
              transition: { repeat: 2, duration: 0.5 }
            })
          }}
          exit={{
            opacity: alertMotion.exit?.opacity ?? 0,
            y: (alertMotion.exit?.y as number) ?? -20,
            ...(alertMotion.exit ?? {}),
          } as any}
          transition={alertTransition as any}
          className={cn(
            'absolute top-16 left-4 right-4 rounded-lg border p-3 text-sm backdrop-blur-sm z-50',
            alert.type === 'error' && 'border-destructive bg-destructive/20 text-destructive-foreground',
            alert.type === 'warning' && 'border-warning bg-warning/20 text-warning-foreground',
            alert.type === 'info' && 'border-primary bg-primary/20 text-primary-foreground'
          )}
        >
          {alert.message}
        </motion.div>
      ))}
    </AnimatePresence>
  );
});
