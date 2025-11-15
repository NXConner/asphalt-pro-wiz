import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & {
    variant?: 'default' | 'tactical' | 'hud';
  }
>(({ className, type, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default:
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    tactical:
      'flex h-10 w-full rounded-md border border-orange-400/30 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-2 focus-visible:border-orange-400/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
    hud: 'flex h-10 w-full rounded-md border border-white/10 bg-slate-900/80 backdrop-blur-sm px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 ring-offset-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
  };

  return (
    <input type={type} className={cn(variantClasses[variant], className)} ref={ref} {...props} />
  );
});
Input.displayName = 'Input';

export { Input };
