import { describe, expect, it } from 'vitest';

import { buildCopilotPrompt } from '@/modules/estimate/components/copilotPrompt';
import type { ScenarioComparisonRow } from '@/modules/estimate/components/ScenarioComparisonMatrix';

describe('buildCopilotPrompt', () => {
  const rows: ScenarioComparisonRow[] = [
    {
      id: 'baseline',
      name: 'Baseline',
      description: 'Baseline config',
      total: 10000,
      profit: 2500,
      margin: 25,
      complianceSummary: 'All checks passed',
      complianceSeverity: 'pass',
      deltaAmount: 0,
      deltaPercent: 0,
      isPrimary: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'premium',
      name: 'Premium Weekend Blitz',
      description: 'Faster turnaround',
      total: 12500,
      profit: 3200,
      margin: 25.6,
      complianceSummary: '1 warnings',
      complianceSeverity: 'warn',
      deltaAmount: 2500,
      deltaPercent: 25,
      isPrimary: false,
      updatedAt: new Date().toISOString(),
    },
  ];

  it('includes job metadata and scenario summaries', () => {
    const prompt = buildCopilotPrompt({
      jobName: 'Grace Fellowship',
      customerAddress: 'Roanoke, VA',
      totalAreaSqFt: 42000,
      userNotes: 'Need to finish before Sunday service.',
      rows,
    });

    expect(prompt).toContain('Grace Fellowship');
    expect(prompt).toContain('Roanoke, VA');
    expect(prompt).toContain('42000.0 sq ft');
    expect(prompt).toContain('Premium Weekend Blitz');
    expect(prompt).toContain('Need to finish before Sunday service');
    expect(prompt).toContain('Instructions');
  });
});
