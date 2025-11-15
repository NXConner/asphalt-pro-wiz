import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

import type { ScenarioPlan } from '@/modules/estimate/useEstimatorScenarios';

interface ProfitSensitivityChartProps {
  baselineId: string;
  scenarios: ScenarioPlan[];
}

export function ProfitSensitivityChart({
  baselineId,
  scenarios,
}: ProfitSensitivityChartProps) {
  const chartData = scenarios
    .filter((scenario) => scenario.computation)
    .map((scenario) => {
      const computation = scenario.computation!;
      const marginPct =
        computation.costs.total > 0
          ? (computation.costs.profit / computation.costs.total) * 100
          : 0;
      const unitCost =
        computation.inputs.totalArea > 0
          ? computation.costs.total / computation.inputs.totalArea
          : 0;
      return {
        id: scenario.id,
        name: scenario.name,
        total: Number(computation.costs.total.toFixed(2)),
        profit: Number(computation.costs.profit.toFixed(2)),
        marginPct: Number(marginPct.toFixed(2)),
        unitCost: Number(unitCost.toFixed(2)),
      };
    });

  const baselineScenario = chartData.find((row) => row.id === baselineId);
  const baselineMargin = baselineScenario?.marginPct ?? null;

  if (chartData.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/15 bg-slate-950/60 p-5">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-50">Profit Sensitivity</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-300/60">
          Total vs. Margin %
        </span>
      </header>
      <div className="mt-4 h-64">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 12, left: -24, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
            <XAxis
              dataKey="name"
              stroke="rgba(226,232,240,0.8)"
              tick={{ fontSize: 10, fill: 'rgba(226,232,240,0.8)' }}
            />
            <YAxis
              yAxisId="left"
              stroke="rgba(226,232,240,0.8)"
              tickFormatter={(value) => `$${value / 1000}k`}
              tick={{ fontSize: 10, fill: 'rgba(226,232,240,0.8)' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="rgba(248,250,252,0.6)"
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 10, fill: 'rgba(226,232,240,0.8)' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              formatter={(value: number, key: string) => {
                if (key === 'marginPct') {
                  const delta =
                    baselineMargin !== null ? Number((value - baselineMargin).toFixed(2)) : null;
                  const suffix =
                    delta === null
                      ? ''
                      : delta === 0
                        ? ' (baseline)'
                        : ` (${delta > 0 ? '+' : ''}${delta.toFixed(2)}%)`;
                  return [`${value.toFixed(2)}%${suffix}`, 'Margin'];
                }
                if (key === 'unitCost') return [`$${value.toFixed(2)}`, 'Unit Cost'];
                return [`$${value.toFixed(2)}`, key === 'profit' ? 'Profit' : 'Total'];
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="total"
              name="Total"
              fill="rgba(96,165,250,0.85)"
              radius={[6, 6, 0, 0]}
            />
            <Bar yAxisId="left" dataKey="profit" name="Profit" fill="rgba(34,197,94,0.85)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
