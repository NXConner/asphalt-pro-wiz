import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-md',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-sm',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline font-medium',
        success: 'bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md',
        info: 'bg-info text-info-foreground hover:bg-info/90 shadow-sm hover:shadow-md',
        tactical:
          'relative overflow-hidden border border-cyan-400/40 bg-slate-950/80 px-6 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-100 shadow-[0_18px_48px_rgba(14,116,144,0.35)] transition-all duration-300 before:absolute before:inset-0 before:-translate-y-full before:bg-gradient-to-b before:from-cyan-400/25 before:via-transparent before:to-transparent before:transition-transform before:duration-500 hover:border-cyan-300/80 hover:text-cyan-50 hover:shadow-[0_24px_64px_rgba(14,116,144,0.45)] hover:before:translate-y-0',
        hud: 'bg-slate-900/80 text-slate-100 shadow-[0_16px_40px_rgba(8,12,24,0.45)] border border-white/10 backdrop-blur hover:bg-slate-800/80 hover:text-cyan-200 focus-visible:ring-cyan-300/60',
        glass:
          'border border-white/20 bg-white/10 text-slate-50 shadow-[0_10px_32px_rgba(15,23,42,0.35)] backdrop-blur hover:bg-white/20 hover:text-white',
        command:
          'bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-500 text-slate-950 font-semibold shadow-[0_18px_48px_rgba(251,191,36,0.45)] hover:shadow-[0_22px_56px_rgba(251,191,36,0.55)]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8 text-base',
        xl: 'h-12 rounded-md px-10 text-lg',
        icon: 'h-10 w-10',
        pill: 'h-10 rounded-full px-6 text-sm font-semibold uppercase tracking-[0.2em]',
        compact: 'h-8 rounded-lg px-2.5 text-xs font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
