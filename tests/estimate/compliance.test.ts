import { describe, expect, it } from 'vitest';

import type { ProjectInputs } from '@/lib/calculations';
import { evaluateCompliance } from '@/modules/estimate/compliance';

const baseInputs = (overrides: Partial<ProjectInputs> = {}): ProjectInputs => ({
  jobName: 'Test Mission',
  customerAddress: '100 Test Lane',
  totalArea: 25000,
  numCoats: 2,
  sandAdded: true,
  polymerAdded: true,
  sealerType: 'PMM',
  sandType: 'Black Beauty',
  waterPercent: 10,
  crackLength: 120,
  crackWidth: 0.5,
  crackDepth: 0.5,
  stripingLines: 40,
  stripingHandicap: 3,
  stripingArrowsLarge: 4,
  stripingArrowsSmall: 2,
  stripingLettering: 6,
  stripingCurb: 14,
  stripingColors: ['White'],
  prepHours: 2,
  oilSpots: 1,
  propaneTanks: 2,
  jobDistanceMiles: 48,
  premiumEdgePushing: false,
  premiumWeedKiller: false,
  premiumCrackCleaning: false,
  premiumPowerWashing: true,
  premiumDebrisRemoval: false,
  includeCleaningRepair: true,
  includeSealcoating: true,
  includeStriping: true,
  crackFillerProduct: 'Test',
  customServices: [],
  ...overrides,
});

describe('evaluateCompliance', () => {
  it('passes baseline compliance expectations', () => {
    const evaluation = evaluateCompliance({
      inputs: baseInputs(),
      travelMiles: 48,
      premiumPowerWashing: true,
      polymerAdded: true,
      oilSpots: 1,
      prepHours: 2,
    });
    expect(evaluation.issues.every((issue) => issue.status === 'pass')).toBe(true);
    expect(evaluation.score).toBeGreaterThan(0.9);
  });

  it('flags insufficient handicap stalls and coat count', () => {
    const evaluation = evaluateCompliance({
      inputs: baseInputs({
        numCoats: 1,
        stripingHandicap: 0,
        premiumPowerWashing: false,
      }),
      travelMiles: 140,
      premiumPowerWashing: false,
      polymerAdded: false,
      oilSpots: 3,
      prepHours: 0,
    });

    const statuses = evaluation.issues.reduce<Record<string, string>>((acc, issue) => {
      acc[issue.id] = issue.status;
      return acc;
    }, {});

    expect(statuses['coat-count']).toBe('fail');
    expect(statuses['ada-stalls']).toBe('warn');
    expect(statuses['surface-prep']).toBe('fail');
    expect(statuses['travel-distance']).toBe('warn');
    expect(evaluation.score).toBeLessThan(0.7);
  });
});
