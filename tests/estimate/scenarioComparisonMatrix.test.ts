import { describe, expect, it } from 'vitest';

import {
  buildScenarioComparisonRows,
  type ComplianceSeverity,
} from '@/modules/estimate/components/scenarioMatrixUtils';
import type { ScenarioComputation, ScenarioPlan } from '@/modules/estimate/useEstimatorScenarios';

describe('buildScenarioComparisonRows', () => {
  const baseline = makeComputation(10000, 2500, []);

  it('derives deltas relative to the primary scenario', () => {
    const scenarios = [
      makeScenario('primary', 'Primary', baseline, true),
      makeScenario('value', 'Value', makeComputation(9000, 1800, [])),
      makeScenario('premium', 'Premium', makeComputation(12500, 3200, [])),
    ];

    const rows = buildScenarioComparisonRows(scenarios, baseline);

    expect(rows).toHaveLength(3);
    const value = rows.find((row) => row.id === 'value');
    const premium = rows.find((row) => row.id === 'premium');

    expect(value?.deltaAmount).toBe(-1000);
    expect(value?.deltaPercent).toBeCloseTo(-10);
    expect(premium?.deltaAmount).toBe(2500);
    expect(premium?.deltaPercent).toBeCloseTo(25);
  });

  it('falls back to baseline when no scenario computations exist', () => {
    const rows = buildScenarioComparisonRows([], baseline);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe('baseline');
    expect(rows[0]?.total).toBe(10000);
  });

  it('classifies compliance severities', () => {
    const warnScenario = makeScenario(
      'warn',
      'Warn scenario',
      makeComputation(10000, 2500, [{ status: 'warn' }]),
    );
    const failScenario = makeScenario(
      'fail',
      'Fail scenario',
      makeComputation(10000, 2500, [{ status: 'fail' }]),
    );

    const rows = buildScenarioComparisonRows([warnScenario, failScenario], baseline);

    const warnRow = rows.find((row) => row.id === 'warn')!;
    const failRow = rows.find((row) => row.id === 'fail')!;

    expect(warnRow.complianceSeverity).toBe<ComplianceSeverity>('warn');
    expect(failRow.complianceSeverity).toBe<ComplianceSeverity>('fail');
  });
});

function makeScenario(
  id: string,
  name: string,
  computation: ScenarioComputation,
  isPrimary = false,
): ScenarioPlan {
  return {
    id,
    name,
    description: `${name} description`,
    overrides: {},
    computation,
    status: 'idle',
    isPrimary,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function makeComputation(
  total: number,
  profit: number,
  compliance: Array<{ status: string }>,
): ScenarioComputation {
  return {
    inputs: {
      numCoats: 2,
      includeStriping: true,
      premiumPowerWashing: false,
      premiumEdgePushing: false,
      oilSpots: 0,
    } as ScenarioComputation['inputs'],
    business: {
      profitPercent: 25,
    } as ScenarioComputation['business'],
    costs: {
      total,
      profit,
      subtotal: total - profit,
      overhead: 0,
    } as ScenarioComputation['costs'],
    breakdown: [],
    compliance: {
      issues: compliance as ScenarioComputation['compliance']['issues'],
    } as ScenarioComputation['compliance'],
  };
}
