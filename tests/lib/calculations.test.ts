import { describe, it, expect } from 'vitest';
import { calculateProject, defaultBusinessData, type ProjectInputs } from '@/lib/calculations';

function baseInputs(overrides: Partial<ProjectInputs> = {}): ProjectInputs {
  return {
    jobName: 'Test',
    customerAddress: '123 Main',
    totalArea: 10000,
    numCoats: 2,
    sandAdded: false,
    polymerAdded: false,
    crackLength: 0,
    crackWidth: 0.5,
    crackDepth: 0.5,
    stripingLines: 0,
    stripingHandicap: 0,
    stripingArrowsLarge: 0,
    stripingArrowsSmall: 0,
    stripingLettering: 0,
    stripingCurb: 0,
    // prepHours removed: prep is auto-calculated per selected services
    oilSpots: 0,
    propaneTanks: 0,
    jobDistanceMiles: 10,
    premiumEdgePushing: false,
    premiumWeedKiller: false,
    premiumCrackCleaning: false,
    premiumPowerWashing: false,
    premiumDebrisRemoval: false,
    includeCleaningRepair: true,
    includeSealcoating: true,
    includeStriping: false,
    customServices: [],
    ...overrides,
  };
}

describe('calculateProject', () => {
  it('computes sealcoat cost for two coats', () => {
    const { costs } = calculateProject(baseInputs(), defaultBusinessData);
    expect(costs.sealcoat).toBeGreaterThan(0);
  });

  it('omits sealcoat cost when sealcoating disabled', () => {
    const { costs } = calculateProject(baseInputs({ includeSealcoating: false }), defaultBusinessData);
    expect(costs.sealcoat).toBe(0);
  });

  it('adds striping costs when enabled', () => {
    const { costs } = calculateProject(baseInputs({ includeStriping: true, stripingLines: 10 }), defaultBusinessData);
    expect(costs.striping).toBeGreaterThan(0);
  });

  it('includes overhead and profit in total', () => {
    const { costs } = calculateProject(baseInputs(), defaultBusinessData);
    expect(costs.total).toBeGreaterThan(costs.subtotal);
  });

  it('auto-adds prep for crack repair only', () => {
    const { costs, breakdown } = calculateProject(
      baseInputs({ includeSealcoating: false, crackLength: 600, includeStriping: false }),
      defaultBusinessData
    );
    const laborLine = breakdown.find(b => b.item.startsWith('Labor'))?.value || '';
    expect(laborLine).toMatch(/Prep: [1-9]/); // at least 1 hour prep
  });

  it('auto-adds prep for sealcoating only', () => {
    const { costs, breakdown } = calculateProject(
      baseInputs({ includeCleaningRepair: false, includeSealcoating: true, totalArea: 10000 }),
      defaultBusinessData
    );
    const laborLine = breakdown.find(b => b.item.startsWith('Labor'))?.value || '';
    expect(laborLine).toMatch(/Prep: [1-9]/);
  });

  it('auto-adds prep for striping when any items present', () => {
    const { breakdown } = calculateProject(
      baseInputs({ includeCleaningRepair: false, includeSealcoating: false, includeStriping: true, stripingLines: 1 }),
      defaultBusinessData
    );
    const laborLine = breakdown.find(b => b.item.startsWith('Labor'))?.value || '';
    expect(laborLine).toMatch(/L:1.0/);
  });
});
