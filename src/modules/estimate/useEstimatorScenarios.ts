import { useCallback, useEffect, useMemo, useState } from 'react';

import type { BusinessData, CostBreakdown, Costs, ProjectInputs } from '@/lib/calculations';
import type { ComplianceEvaluation, ComplianceIssue } from '@/modules/estimate/compliance';

export interface ScenarioOverrides {
  project?: Partial<ProjectInputs>;
  business?: Partial<BusinessData>;
}

export interface ScenarioComputation {
  inputs: ProjectInputs;
  business: BusinessData;
  costs: Costs;
  breakdown: CostBreakdown[];
  compliance: ComplianceEvaluation;
}

export interface ScenarioPlan {
  id: string;
  name: string;
  description?: string;
  overrides: ScenarioOverrides;
  computation: ScenarioComputation | null;
  status: 'idle' | 'running' | 'error';
  error?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioManager {
  baseline: ScenarioComputation;
  scenarios: ScenarioPlan[];
  addScenario: (preset?: Partial<ScenarioPlan>) => void;
  updateScenario: (id: string, overrides: ScenarioOverrides) => void;
  runScenario: (id: string) => void;
  removeScenario: (id: string) => void;
  setPrimaryScenario: (id: string) => void;
  refreshBaseline: () => void;
}

export interface UseEstimatorScenariosOptions {
  simulate: (overrides?: ScenarioOverrides) => ScenarioComputation;
  baselineSignature: string;
}

export function useEstimatorScenarios(options: UseEstimatorScenariosOptions): ScenarioManager {
  const { simulate, baselineSignature } = options;
  const baseline = useMemo(() => simulate(), [simulate, baselineSignature]);

  const [scenarios, setScenarios] = useState<ScenarioPlan[]>(() =>
    seedDefaults(simulate, baseline),
  );

  useEffect(() => {
    setScenarios((prev) =>
      prev.map((scenario) =>
        scenario.isPrimary
          ? {
              ...scenario,
              computation: simulate(scenario.overrides),
              updatedAt: new Date().toISOString(),
              status: 'idle',
              error: undefined,
            }
          : scenario,
      ),
    );
  }, [simulate, baselineSignature]);

  const addScenario = useCallback(
    (preset?: Partial<ScenarioPlan>) => {
      setScenarios((prev) => [
        ...prev,
        createScenario(
          simulate,
          { overrides: {}, ...(preset ?? { name: 'Alt Quote' }) } as Partial<ScenarioPlan> & {
            overrides: ScenarioOverrides;
          },
        ),
      ]);
    },
    [simulate],
  );

  const updateScenario = useCallback((id: string, overrides: ScenarioOverrides) => {
    setScenarios((prev) =>
      prev.map((scenario) =>
        scenario.id === id
          ? {
              ...scenario,
              overrides: mergeOverrides(scenario.overrides, overrides),
              updatedAt: new Date().toISOString(),
              status: 'idle',
            }
          : scenario,
      ),
    );
  }, []);

  const runScenario = useCallback(
    (id: string) => {
      setScenarios((prev) =>
        prev.map((scenario) => {
          if (scenario.id !== id) return scenario;
          try {
            const computation = simulate(scenario.overrides);
            return {
              ...scenario,
              computation,
              updatedAt: new Date().toISOString(),
              status: 'idle',
              error: undefined,
            };
          } catch (error) {
            return {
              ...scenario,
              status: 'error',
              error: error instanceof Error ? error.message : 'Scenario simulation failed.',
            };
          }
        }),
      );
    },
    [simulate],
  );

  const removeScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
  }, []);

  const setPrimaryScenario = useCallback((id: string) => {
    setScenarios((prev) =>
      prev.map((scenario) => ({
        ...scenario,
        isPrimary: scenario.id === id,
      })),
    );
  }, []);

  const refreshBaseline = useCallback(() => {
    setScenarios((prev) =>
      prev.map((scenario) =>
        scenario.isPrimary
          ? {
              ...scenario,
              computation: simulate(scenario.overrides),
              updatedAt: new Date().toISOString(),
            }
          : scenario,
      ),
    );
  }, [simulate]);

  return {
    baseline,
    scenarios,
    addScenario,
    updateScenario,
    runScenario,
    removeScenario,
    setPrimaryScenario,
    refreshBaseline,
  };
}

function seedDefaults(
  simulate: (overrides?: ScenarioOverrides) => ScenarioComputation,
  baseline: ScenarioComputation,
): ScenarioPlan[] {
  const premiumOverrides: ScenarioOverrides = {
    project: {
      numCoats: Math.max(2, baseline.inputs.numCoats + 1),
      premiumPowerWashing: true,
      premiumEdgePushing: true,
      includeStriping: true,
    },
  };

  const economyOverrides: ScenarioOverrides = {
    project: {
      numCoats: Math.max(1, baseline.inputs.numCoats - 1),
      includeStriping: baseline.inputs.includeStriping,
      premiumPowerWashing:
        baseline.inputs.oilSpots > 0 ? baseline.inputs.premiumPowerWashing : false,
    },
    business: {
      profitPercent: Math.max(10, baseline.business.profitPercent - 5),
    },
  };

  return [
    createScenario(simulate, { name: 'Baseline', overrides: {}, isPrimary: true, description: 'Current configuration snapshot' }),
    createScenario(simulate, {
      name: 'Premium Weekend Blitz',
      overrides: premiumOverrides,
      description: 'Fast-dry polymer, power washing, and striping for Sunday turnover.',
    }),
    createScenario(simulate, {
      name: 'Value Stewardship',
      overrides: economyOverrides,
      description: 'Lean crew deployment for budget-sensitive ministries.',
    }),
  ];
}

function createScenario(
  simulate: (overrides?: ScenarioOverrides) => ScenarioComputation,
  preset: Partial<ScenarioPlan> & { overrides: ScenarioOverrides },
): ScenarioPlan {
  const computation = simulate(preset.overrides);
  return {
    id: preset.id ?? cryptoId(),
    name: preset.name ?? 'Scenario',
    description: preset.description,
    overrides: preset.overrides,
    computation,
    status: 'idle',
    isPrimary: Boolean(preset.isPrimary),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

function mergeOverrides(base: ScenarioOverrides, updates: ScenarioOverrides): ScenarioOverrides {
  return {
    project: { ...base.project, ...updates.project },
    business: { ...base.business, ...updates.business },
  };
}

export function formatComplianceSummary(issues: ComplianceIssue[]): string {
  const fail = issues.filter((issue) => issue.status === 'fail').length;
  const warn = issues.filter((issue) => issue.status === 'warn').length;
  if (fail > 0) return `${fail} fail · ${warn} warn`;
  if (warn > 0) return `${warn} warnings`;
  return 'All checks passed';
}
