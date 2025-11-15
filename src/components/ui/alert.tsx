import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        tactical:
          'border-orange-400/30 bg-slate-950/80 backdrop-blur-sm text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.4)] [&>svg]:text-orange-400',
        hud: 'border-white/10 bg-slate-900/90 backdrop-blur-md text-slate-100 shadow-[0_16px_40px_rgba(8,12,24,0.45)] [&>svg]:text-cyan-400',
        info: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100 [&>svg]:text-cyan-400',
        warning: 'border-amber-400/30 bg-amber-500/10 text-amber-100 [&>svg]:text-amber-400',
        success:
          'border-emerald-400/30 bg-emerald-500/10 text-emerald-100 [&>svg]:text-emerald-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  ),
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
