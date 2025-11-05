import { describe, expect, it } from 'vitest';

import { buttonVariants } from '@/components/ui/button';

describe('buttonVariants', () => {
  it('applies tactical variant styling', () => {
    const classes = buttonVariants({ variant: 'tactical' });
    expect(classes).toContain('border-orange-400/40');
    expect(classes).toContain('tracking-[0.35em]');
  });

  it('applies hud variant styling', () => {
    const classes = buttonVariants({ variant: 'hud' });
    expect(classes).toContain('bg-slate-900/80');
    expect(classes).toContain('border border-white/10');
  });

  it('supports pill size', () => {
    const classes = buttonVariants({ size: 'pill' });
    expect(classes).toContain('rounded-full');
  });
});
