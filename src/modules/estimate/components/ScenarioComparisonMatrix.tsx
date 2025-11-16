import { Copy, RefreshCw, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  buildScenarioComparisonRows,
  type ComplianceSeverity,
  type ScenarioComparisonRow,
} from '@/modules/estimate/components/scenarioMatrixUtils';
import type { ScenarioManager } from '@/modules/estimate/useEstimatorScenarios';

export interface ScenarioComparisonMatrixProps {
  manager: ScenarioManager;
}

export function ScenarioComparisonMatrix({ manager }: ScenarioComparisonMatrixProps) {
  const rows = useMemo(
    () => buildScenarioComparisonRows(manager.scenarios, manager.baseline),
    [manager.scenarios, manager.baseline],
  );
  const [copied, setCopied] = useState(false);

  const primaryRow = rows.find((row) => row.isPrimary) ?? rows[0];
  const bestTotal = rows.reduce((best, row) => (row.total < best.total ? row : best), rows[0]);
  const bestMargin = rows.reduce((best, row) => (row.margin > best.margin ? row : best), rows[0]);

  const handleCopy = async () => {
    const summary = rows
      .map(
        (row) =>
          `${row.name}: $${row.total.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })} (${row.margin.toFixed(1)}% margin, ${row.complianceSummary})`,
      )
      .join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-white/15 bg-slate-950/60 p-6 shadow-[0_40px_120px_rgba(6,10,24,0.55)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-50">
            Scenario Comparison Matrix
            <Badge variant="outline" className="border-orange-300/40 text-[0.6rem] uppercase">
              Enhanced
            </Badge>
          </h3>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-300/70">
            Benchmarks total cost, profit, margin deltas, and compliance signals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10"
            onClick={() => manager.refreshBaseline()}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Primary
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/20 bg-white/5 text-slate-100 hover:bg-white/10"
            onClick={handleCopy}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copied ? 'Copied' : 'Copy Summary'}
          </Button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm text-slate-200/80">
          <thead>
            <tr className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-400/80">
              <th className="pb-2">Scenario</th>
              <th className="pb-2 text-right">Total</th>
              <th className="pb-2 text-right">Profit</th>
              <th className="pb-2 text-right">Margin</th>
              <th className="pb-2 text-right">Delta vs Primary</th>
              <th className="pb-2">Compliance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'border-t border-white/5 transition hover:bg-white/5',
                  row.id === bestTotal.id && 'bg-emerald-500/5',
                )}
              >
                <td className="py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-50">
                      {row.name}{' '}
                      {row.id === bestTotal.id ? (
                        <Badge className="ml-2 bg-emerald-500/90 text-emerald-900">Best Cost</Badge>
                      ) : null}
                      {row.id === bestMargin.id && row.id !== bestTotal.id ? (
                        <Badge className="ml-2 bg-cyan-500/80 text-cyan-900">Best Margin</Badge>
                      ) : null}
                      {row.isPrimary ? (
                        <Badge variant="secondary" className="ml-2 bg-white/10 text-slate-100">
                          Primary
                        </Badge>
                      ) : null}
                    </span>
                    {row.description ? (
                      <span className="text-[0.7rem] uppercase tracking-[0.35em] text-slate-400/80">
                        {row.description}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="py-3 text-right font-mono text-sm text-slate-50">
                  ${row.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 text-right font-mono text-sm">
                  ${row.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 text-right font-mono text-sm">{row.margin.toFixed(1)}%</td>
                <td
                  className={cn(
                    'py-3 text-right font-mono text-sm',
                    row.deltaAmount === 0
                      ? 'text-slate-200/70'
                      : row.deltaAmount < 0
                        ? 'text-emerald-300'
                        : 'text-rose-300',
                  )}
                >
                  {formatDelta(row.deltaAmount)} ({row.deltaPercent > 0 ? '+' : ''}
                  {row.deltaPercent.toFixed(1)}%)
                </td>
                <td className="py-3">
                  <ComplianceBadge
                    severity={row.complianceSeverity}
                    label={row.complianceSummary}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Separator className="border-white/5" />
      <p className="text-[0.7rem] uppercase tracking-[0.4em] text-slate-400/80">
        Matrix updated{' '}
        {new Date(primaryRow?.updatedAt ?? new Date().toISOString()).toLocaleTimeString()}
      </p>
    </section>
  );
}

function formatDelta(delta: number): string {
  if (delta === 0) return '$0';
  const formatted = `$${Math.abs(delta).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const direction = delta < 0 ? '↓' : '↑';
  return `${direction} ${formatted}`;
}

function ComplianceBadge({ severity, label }: { severity: ComplianceSeverity; label: string }) {
  const icon =
    severity === 'fail' ? (
      <ShieldX className="h-4 w-4 text-rose-300" />
    ) : severity === 'warn' ? (
      <ShieldAlert className="h-4 w-4 text-amber-300" />
    ) : (
      <ShieldCheck className="h-4 w-4 text-emerald-300" />
    );
  const styles =
    severity === 'fail'
      ? 'border-rose-400/40 bg-rose-500/10 text-rose-100'
      : severity === 'warn'
        ? 'border-amber-300/40 bg-amber-500/10 text-amber-100'
        : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100';
  return (
    <div
      className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs', styles)}
    >
      {icon}
      {label}
    </div>
  );
}
