import type { ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type TacticalTone = 'ember' | 'aurora' | 'lagoon' | 'rogue';

const toneAccent: Record<TacticalTone, string> = {
  ember: 'from-orange-400/40 via-transparent to-transparent border-orange-400/40',
  aurora: 'from-emerald-400/40 via-transparent to-transparent border-emerald-300/40',
  lagoon: 'from-sky-400/40 via-transparent to-transparent border-sky-300/40',
  rogue: 'from-rose-500/40 via-transparent to-transparent border-rose-400/40',
};

export interface TacticalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tone?: TacticalTone;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export function TacticalModal({
  open,
  onOpenChange,
  tone = 'ember',
  title,
  description,
  children,
  actions,
}: TacticalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'border-white/10 bg-slate-950/95 text-white shadow-[0_30px_120px_rgba(3,5,20,0.7)] backdrop-blur-3xl',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-70 before:content-[""]',
          toneAccent[tone],
        )}
      >
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="flex items-center gap-2 font-heading text-base uppercase tracking-[0.45em] text-white">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-[0.75rem] uppercase tracking-[0.25em] text-white/70">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="space-y-4 text-sm text-white/80">{children}</div>
        {actions ? <DialogFooter className="pt-4">{actions}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

