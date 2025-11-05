import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { useMissionSchedulerContext } from './MissionSchedulerContext';

const severityLabel: Record<'info' | 'warning' | 'critical', string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
};

const severityTone: Record<'info' | 'warning' | 'critical', string> = {
  info: 'text-cyan-200 border-cyan-400/50 bg-cyan-400/5',
  warning: 'text-amber-200 border-amber-400/50 bg-amber-400/10',
  critical: 'text-red-200 border-red-500/60 bg-red-500/10',
};

export function MissionAlerts() {
  const { conflicts, accessibilityInsights, suggestions } = useMissionSchedulerContext();

  const sortedConflicts = [...conflicts].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <Card className="h-full border-white/10 bg-slate-950/70">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-100">
          Mission Alerts & ADA Oversight
        </CardTitle>
        <p className="text-xs text-slate-300/80">
          We surface blackouts, overlapping crews, and accessibility considerations so Sunday services stay frictionless.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <section aria-label="Active conflicts" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
              Conflict Watch ({sortedConflicts.length})
            </h3>
            <Badge variant="outline" className="border-white/20 bg-white/5 text-[10px] uppercase tracking-[0.28em] text-slate-200">
              Live
            </Badge>
          </div>
          {sortedConflicts.length === 0 ? (
            <p className="rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-[11px] uppercase tracking-[0.25em] text-slate-300/70">
              No conflicts detected. Keep missions staged!
            </p>
          ) : (
            <ul className="space-y-3">
              {sortedConflicts.map((conflict) => (
                <li key={conflict.id} className={`rounded-xl border px-4 py-3 shadow-inner ${severityTone[conflict.severity]}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">
                      {severityLabel[conflict.severity]}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.25em] text-slate-100/80">
                      {conflict.type.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-50/90">{conflict.description}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-200/70">
                    {format(new Date(conflict.window.start), 'MMM d, h:mma')} → {format(new Date(conflict.window.end), 'h:mma')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Separator className="bg-white/10" />

        <section aria-label="Accessibility insights" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
              ADA & Congregation Safety ({accessibilityInsights.length})
            </h3>
          </div>
          {accessibilityInsights.length === 0 ? (
            <p className="rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-[11px] uppercase tracking-[0.25em] text-slate-300/70">
              All missions clear current ADA heuristics.
            </p>
          ) : (
            <ul className="space-y-3">
              {accessibilityInsights.map((insight) => (
                <li key={insight.id} className="rounded-xl border border-cyan-400/40 bg-cyan-400/5 px-4 py-3 text-xs text-cyan-100">
                  <p className="font-semibold uppercase tracking-[0.28em]">{insight.description}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100/80">{insight.recommendation}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Separator className="bg-white/10" />

        <section aria-label="Scheduler suggestions" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
              Scheduler Recommendations ({suggestions.length})
            </h3>
          </div>
          {suggestions.length === 0 ? (
            <p className="rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-[11px] uppercase tracking-[0.25em] text-slate-300/70">
              Timeline optimized — no actionable recommendations.
            </p>
          ) : (
            <ul className="space-y-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id} className="rounded-xl border border-orange-400/50 bg-orange-400/10 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-orange-100">
                  {suggestion.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

