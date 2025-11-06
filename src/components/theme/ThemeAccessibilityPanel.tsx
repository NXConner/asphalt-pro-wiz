import { AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { summarizeThemeAccessibility, type ThemeAccessibilitySummaryItem } from '@/lib/color';
import { getDesignTokens } from '@/lib/designSystem';
import { cn } from '@/lib/utils';

const levelTone: Record<string, string> = {
  AAA: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40',
  AA: 'bg-sky-500/15 text-sky-100 border-sky-400/35',
  FAIL: 'bg-rose-500/15 text-rose-100 border-rose-400/35',
};

const ratioFormatter = (value: number) => value.toFixed(2);

export function ThemeAccessibilityPanel() {
  const { preferences } = useTheme();

  const [summary, setSummary] = useState(() => summarizeThemeAccessibility(getDesignTokens()));

  useEffect(() => {
    setSummary(summarizeThemeAccessibility(getDesignTokens()));
  }, [
    preferences.name,
    preferences.primaryHue,
    preferences.mode,
    preferences.wallpaperId,
    preferences.wallpaperOpacity,
    preferences.wallpaperBlur,
    preferences.useHueOverride,
    preferences.highContrast,
  ]);

  return (
    <Card className="border border-white/10 bg-slate-950/70">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-100">
          <ShieldCheck className="h-4 w-4" /> Accessibility Readiness
        </CardTitle>
        <CardDescription className="text-xs text-slate-300/70">
          WCAG 2.1 contrast checks for primary surfaces, typography, and interactive elements. Use
          this heatmap to validate that custom palettes remain mission-ready for every campus user.
        </CardDescription>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'border-white/10 bg-white/10 text-[0.6rem] uppercase tracking-[0.28em] backdrop-blur',
              summary.aaaCompliant
                ? 'border-emerald-400/40 text-emerald-100'
                : summary.aaCompliant
                  ? 'border-sky-400/40 text-sky-100'
                  : 'border-rose-400/40 text-rose-100',
            )}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            {summary.aaaCompliant
              ? 'AAA baseline'
              : summary.aaCompliant
                ? 'AA baseline'
                : 'Contrast tuning required'}
          </Badge>
          {summary.weakest ? <LevelBadge item={summary.weakest} context="weakest" /> : null}
          {summary.strongest ? <LevelBadge item={summary.strongest} context="strongest" /> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {summary.items.map((item) => (
            <ContrastItem key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LevelBadge({
  item,
  context,
}: {
  item: ThemeAccessibilitySummaryItem;
  context: 'weakest' | 'strongest';
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-white/10 bg-white/10 text-[0.58rem] uppercase tracking-[0.26em] backdrop-blur',
        context === 'weakest'
          ? 'border-amber-400/40 text-amber-100'
          : 'border-emerald-400/40 text-emerald-100',
      )}
    >
      {context === 'weakest' ? 'Softest Surface: ' : 'Strongest Surface: '}
      {item.label}
    </Badge>
  );
}

function ContrastItem({ item }: { item: ThemeAccessibilitySummaryItem }) {
  const Icon = item.level === 'FAIL' ? AlertTriangle : ShieldCheck;
  return (
    <article className="space-y-3 rounded-xl border border-white/10 bg-slate-900/70 p-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-slate-400/80">
            {item.label}
          </p>
          <p className="text-xs text-slate-200/80">{ratioFormatter(item.ratio)} : 1</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'flex items-center gap-1 border text-[0.58rem] uppercase tracking-[0.28em]',
            levelTone[item.level],
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden /> {item.level}
        </Badge>
      </header>
      <p className="text-[0.65rem] text-slate-300/70">
        {item.level === 'FAIL'
          ? 'Increase contrast or enable high-contrast mode to meet AA requirements.'
          : item.level === 'AA'
            ? 'Meets AA baseline. Aim for AAA where critical text or HUD metrics appear.'
            : 'AAA contrast achieved; excellent for mission-critical telemetry and accessibility.'}
      </p>
      {!item.largeTextPass ? (
        <p className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.26em] text-rose-200/80">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Large text also fails AAA; consider
          alternate pairing.
        </p>
      ) : null}
    </article>
  );
}
