import { Fragment, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SupplierIntelResponse, SupplierInsight } from '@/modules/estimate/supplier';

interface SupplierIntelPanelProps {
  data?: SupplierIntelResponse;
  error?: Error | null;
  isLoading: boolean;
  isRefetching?: boolean;
  onRefresh?: () => void;
  showSetupHint?: boolean;
}

const POSITIVE_COLOR = 'text-emerald-300';
const NEGATIVE_COLOR = 'text-rose-300';

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function renderTrend(insight: SupplierInsight): JSX.Element | null {
  if (insight.sevenDayChangePercent === null || Number.isNaN(insight.sevenDayChangePercent)) {
    return null;
  }
  const value = insight.sevenDayChangePercent;
  const tone = value > 0.75 ? NEGATIVE_COLOR : value < -0.75 ? POSITIVE_COLOR : 'text-slate-300';
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '■';
  return (
    <span className={`text-xs font-semibold ${tone}`}>
      {arrow} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function InsightRow({ insight }: { insight: SupplierInsight }) {
  const trailingAverage = insight.trailing30DayAverage
    ? formatCurrency(insight.trailing30DayAverage, insight.currency)
    : null;

  return (
    <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md md:grid-cols-12">
      <div className="md:col-span-3">
        <p className="text-sm font-semibold text-slate-50">{insight.supplierName}</p>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">{insight.materialType}</p>
      </div>
      <div className="space-y-1 md:col-span-3">
        <p className="text-sm text-slate-200">
          {formatCurrency(insight.unitPrice, insight.currency)}{' '}
          <span className="text-xs text-slate-400">/ {insight.unitOfMeasure}</span>
        </p>
        <p className="text-xs text-slate-400">Updated {new Date(insight.effectiveDate).toLocaleDateString()}</p>
        {trailingAverage ? (
          <p className="text-xs text-slate-400">30d avg {trailingAverage}</p>
        ) : null}
      </div>
      <div className="space-y-1 md:col-span-3">
        <p className="text-xs text-slate-300">Lead time: {insight.leadTimeDays ?? '—'} days</p>
        <p className="text-xs text-slate-300">Coverage radius: {insight.coverageRadiusMiles ?? '—'} miles</p>
        <p className="text-xs text-slate-300">Samples: {insight.sampleCount}</p>
      </div>
      <div className="flex flex-col justify-between gap-2 md:col-span-3">
        <div>{renderTrend(insight)}</div>
        {insight.confidence !== null ? (
          <p className="text-right text-xs text-slate-400">
            Confidence {Math.round(insight.confidence * 100)}%
          </p>
        ) : null}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full rounded-xl bg-white/10" />
      <Skeleton className="h-16 w-full rounded-xl bg-white/10" />
      <Skeleton className="h-16 w-full rounded-xl bg-white/10" />
    </div>
  );
}

function EmptyState({ showSetupHint }: { showSetupHint: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-white/20 p-6 text-center">
      <p className="text-sm font-medium text-slate-200">
        {showSetupHint ? 'Select materials above to load supplier intelligence.' : 'No supplier telemetry yet.'}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {showSetupHint
          ? 'Populate the blend, sand, or crack-filling options to query nearby suppliers.'
          : 'Sync supplier catalogs or log pricing snapshots to unlock intelligence.'}
      </p>
    </div>
  );
}

function ErrorState({ error, onRefresh }: { error: Error; onRefresh?: () => void }) {
  return (
    <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-6 text-center text-rose-100">
      <p className="text-sm font-semibold">Unable to load supplier intelligence</p>
      <p className="mt-1 text-xs opacity-80">{error.message}</p>
      {onRefresh ? (
        <Button variant="outline" size="sm" className="mt-3 border-rose-500/60 text-rose-100" onClick={onRefresh}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function SupplierIntelPanel({
  data,
  error,
  isLoading,
  isRefetching,
  onRefresh,
  showSetupHint,
}: SupplierIntelPanelProps) {
  const bestOffers = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.bestOffers).map(([material, offer]) => ({
      material,
      offer,
    }));
  }, [data]);

  const hasInsights = Boolean(data && data.insights.length > 0);

  return (
    <Card className="border-white/10 bg-slate-950/60 shadow-xl shadow-black/50">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl text-slate-50">Supplier Intelligence</CardTitle>
          <CardDescription className="max-w-xl text-slate-300/80">
            Pricing telemetry and lead-time insights from partner suppliers within your operating radius.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-white/20 bg-white/5 text-[0.65rem] uppercase tracking-[0.3em] text-slate-200">
            Signal
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="border border-white/10 bg-white/10 text-slate-50 hover:bg-white/20"
            onClick={onRefresh}
            disabled={isLoading || isRefetching}
          >
            {isRefetching ? 'Refreshing…' : 'Refresh Intel'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? <ErrorState error={error} onRefresh={onRefresh} /> : null}
          {!isLoading && !error && !hasInsights ? <EmptyState showSetupHint={Boolean(showSetupHint)} /> : null}

        {!isLoading && !error && hasInsights ? (
          <Fragment>
            {data?.aiSummary ? (
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 text-sm text-cyan-100 shadow-lg shadow-cyan-900/40">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Copilot Summary</p>
                <div className="mt-2 space-y-2 whitespace-pre-line leading-relaxed">
                  {data.aiSummary}
                </div>
              </div>
            ) : null}

            {bestOffers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {bestOffers.map(({ material, offer }) => (
                  <Badge
                    key={material}
                    variant="secondary"
                    className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-100 shadow-sm shadow-emerald-900/40"
                  >
                    {material}: {formatCurrency(offer.unitPrice, offer.currency)} · {offer.supplierName}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="space-y-3">
              {data?.insights.map((insight) => (
                <InsightRow key={`${insight.supplierId}-${insight.materialType}`} insight={insight} />
              ))}
            </div>
          </Fragment>
        ) : null}
      </CardContent>
    </Card>
  );
}
