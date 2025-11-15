import { Droplet } from 'lucide-react';

export interface ThemeDesignTokensPanelProps {
  spacing: Array<[string, number]>;
  typography: Array<[string, string]>;
  shadows: Array<[string, string]>;
  colors: Array<[string, string]>;
}

export function ThemeDesignTokensPanel({ spacing, typography, shadows, colors }: ThemeDesignTokensPanelProps) {
  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-slate-950/70 p-5">
      <header className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/60">
        <Droplet className="h-4 w-4" /> Design System Snapshot
      </header>
      <div className="grid gap-4 lg:grid-cols-4">
        <ColorTokenPanel tokens={colors} />
        <TokenPanel title="Spacing" tokens={spacing} formatter={(value) => `${value}px`} />
        <TokenPanel title="Typography" tokens={typography.slice(0, 6)} formatter={(value) => value} />
        <TokenPanel title="Shadows" tokens={shadows} formatter={(value) => value} />
      </div>
    </section>
  );
}

interface TokenPanelProps<TValue> {
  title: string;
  tokens: Array<[string, TValue]>;
  formatter: (value: TValue) => string;
}

function TokenPanel<TValue>({ title, tokens, formatter }: TokenPanelProps<TValue>) {
  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/70 p-3">
      <h5 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/70">
        {title}
      </h5>
      <ul className="space-y-1 text-[0.65rem] text-slate-300/60">
        {tokens.map(([key, value]) => (
          <li key={key} className="flex items-center justify-between gap-3">
            <span className="uppercase tracking-[0.3em] text-slate-400/70">{key}</span>
            <span className="font-mono text-[0.6rem] text-slate-200/70">{formatter(value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ColorTokenPanel({ tokens }: { tokens: Array<[string, string]> }) {
  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/70 p-3">
      <h5 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/70">Core Colors</h5>
      <ul className="space-y-2 text-[0.65rem] text-slate-300/60">
        {tokens.map(([key, value]) => (
          <li key={key} className="flex items-center justify-between gap-3">
            <span className="uppercase tracking-[0.3em] text-slate-400/70">{key.replace(/^--/, '')}</span>
            <span className="flex items-center gap-2 font-mono text-[0.6rem] text-slate-200/80">
              <span
                className="inline-block h-4 w-4 rounded-full border border-white/20"
                style={{ backgroundColor: `hsl(${value})` }}
                aria-hidden
              />
              hsl({value})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

