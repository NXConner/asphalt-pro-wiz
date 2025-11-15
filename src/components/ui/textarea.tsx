import * as React from 'react';

import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  children?: React.ReactNode;
};

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps & {
    variant?: 'default' | 'tactical' | 'hud';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default:
      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    tactical:
      'flex min-h-[80px] w-full rounded-md border border-orange-400/30 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 ring-offset-slate-950 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-2 focus-visible:border-orange-400/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
    hud: 'flex min-h-[80px] w-full rounded-md border border-white/10 bg-slate-900/80 backdrop-blur-sm px-3 py-2 text-sm text-slate-100 ring-offset-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
  };

  return <textarea className={cn(variantClasses[variant], className)} ref={ref} {...props} />;
});
Textarea.displayName = 'Textarea';

export { Textarea };
