import { forwardRef, type ReactNode } from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TacticalButtonProps extends ButtonProps {
  glow?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  badge?: string;
}

export const TacticalButton = forwardRef<HTMLButtonElement, TacticalButtonProps>(function TacticalButton(
  { className, glow = false, leadingIcon, trailingIcon, badge, children, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      {...props}
      className={cn(
        'relative overflow-hidden border border-white/15 bg-white/10 px-4 py-2 font-semibold uppercase tracking-[0.25em] text-[0.65rem]',
        'shadow-[0_18px_40px_rgba(8,12,24,0.45)] transition duration-200 hover:border-white/30 hover:bg-white/20',
        glow && 'before:absolute before:inset-0 before:bg-white/10 before:blur-2xl before:content-[""]',
        className,
      )}
    >
      <span className="relative z-10 flex items-center gap-2">
        {leadingIcon ? <span className="text-base text-white">{leadingIcon}</span> : null}
        <span className="text-white">{children}</span>
        {trailingIcon ? <span className="text-base text-white/80">{trailingIcon}</span> : null}
        {badge ? (
          <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[0.55rem] font-mono tracking-[0.35em] text-white/70">
            {badge}
          </span>
        ) : null}
      </span>
    </Button>
  );
});
