import { formatComplianceSummary } from '@/modules/estimate/useEstimatorScenarios';
import type { ScenarioManager, ScenarioPlan } from '@/modules/estimate/useEstimatorScenarios';

export type ComplianceSeverity = 'pass' | 'warn' | 'fail';

export interface ScenarioComparisonRow {
  id: string;
  name: string;
  description?: string;
  total: number;
  profit: number;
  margin: number;
  complianceSummary: string;
  complianceSeverity: ComplianceSeverity;
  deltaAmount: number;
  deltaPercent: number;
  isPrimary: boolean;
  updatedAt: string;
}

export function buildScenarioComparisonRows(
  scenarios: ScenarioPlan[],
  baseline: ScenarioManager['baseline'],
): ScenarioComparisonRow[] {
  const enriched = scenarios
    .filter((scenario) => scenario.computation)
    .map((scenario) => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      computation: scenario.computation!,
      isPrimary: scenario.isPrimary,
      updatedAt: scenario.updatedAt,
    }));

  if (enriched.length === 0) {
    enriched.push({
      id: 'baseline',
      name: 'Baseline',
      description: 'Baseline calculation snapshot',
      computation: baseline,
      isPrimary: true,
      updatedAt: new Date().toISOString(),
    });
  }

  const primary = enriched.find((scenario) => scenario.isPrimary) ??
    enriched[0] ?? {
      computation: baseline,
      id: 'baseline',
      name: 'Baseline',
      updatedAt: new Date().toISOString(),
    };
  const referenceTotal = primary.computation.costs.total;

  return enriched.map((scenario) => {
    const total = scenario.computation.costs.total;
    const profit = scenario.computation.costs.profit;
    const margin = total > 0 ? (profit / total) * 100 : 0;
    const deltaAmount = total - referenceTotal;
    const deltaPercent = referenceTotal > 0 ? (deltaAmount / referenceTotal) * 100 : 0;
    const complianceSeverity = deriveComplianceSeverity(scenario.computation.compliance.issues);

    return {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      total,
      profit,
      margin,
      complianceSummary: formatComplianceSummary(scenario.computation.compliance.issues),
      complianceSeverity,
      deltaAmount,
      deltaPercent,
      isPrimary: scenario.isPrimary,
      updatedAt: scenario.updatedAt,
    };
  });
}

export function deriveComplianceSeverity(
  issues: ScenarioManager['baseline']['compliance']['issues'],
): ComplianceSeverity {
  const fail = issues.filter((issue) => issue.status === 'fail').length;
  if (fail > 0) return 'fail';
  const warn = issues.filter((issue) => issue.status === 'warn').length;
  if (warn > 0) return 'warn';
  return 'pass';
}
