import { memo, useMemo } from 'react';

import { toCSSProperties } from '@/design';
import type { ThemePresetMeta } from '@/lib/designSystem';
import { cn } from '@/lib/utils';

interface ThemeSwatchProps {
  preset: ThemePresetMeta;
  active?: boolean;
  onSelect?: () => void;
}

export const ThemeSwatch = memo(function ThemeSwatch({ preset, active = false, onSelect }: ThemeSwatchProps) {
  const style = useMemo(() => toCSSProperties(preset.tokens), [preset.tokens]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative overflow-hidden rounded-xl border transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
        active
          ? 'border-orange-400/70 shadow-[0_20px_60px_rgba(255,128,0,0.35)]'
          : 'border-white/10 hover:-translate-y-1 hover:border-orange-300/50 hover:shadow-[0_18px_45px_rgba(255,128,0,0.25)]',
      )}
      style={style}
    >
      <span
        className="absolute inset-0 rounded-xl"
        style={{
          background:
            'linear-gradient(160deg, hsl(var(--background)) 0%, hsl(var(--card)) 48%, hsl(var(--background)) 100%)',
          boxShadow: 'var(--shadow-md)',
        }}
        aria-hidden
      />
      <span className="absolute inset-0 opacity-70" style={{ background: 'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.08) 0%, transparent 42%)' }} aria-hidden />
      {active ? (
        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(255,128,0,0.75)]" aria-hidden />
      ) : null}
      <div className="relative z-10 flex h-full flex-col justify-between gap-3 p-4 text-left text-slate-100/90">
        <div className="space-y-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.4em]">{preset.label}</span>
          <span className="block text-[0.65rem] text-slate-200/70">{preset.description}</span>
        </div>
        <div className="flex items-end gap-2 pt-2">
          <span className="h-6 flex-1 rounded-md bg-[hsl(var(--primary))] shadow-[0_0_18px_rgba(255,128,0,0.15)]" aria-hidden />
          <span className="h-5 flex-1 rounded-md bg-[hsl(var(--accent))] opacity-90" aria-hidden />
          <span className="h-4 flex-1 rounded-md bg-[hsl(var(--muted))] opacity-70" aria-hidden />
        </div>
      </div>
    </button>
  );
});
