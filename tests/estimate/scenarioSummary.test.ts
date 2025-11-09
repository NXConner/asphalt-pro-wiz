import { describe, expect, it } from 'vitest';

import { formatComplianceSummary } from '@/modules/estimate/useEstimatorScenarios';

describe('formatComplianceSummary', () => {
  it('returns pass message when all pass', () => {
    const summary = formatComplianceSummary([
      { id: 'a', label: 'Test A', status: 'pass' },
      { id: 'b', label: 'Test B', status: 'pass' },
    ]);
    expect(summary).toBe('All checks passed');
  });

  it('summarises warn/fail counts', () => {
    const summary = formatComplianceSummary([
      { id: 'a', label: 'Test A', status: 'warn' },
      { id: 'b', label: 'Test B', status: 'fail' },
      { id: 'c', label: 'Test C', status: 'warn' },
    ]);
    expect(summary).toBe('1 fail · 2 warn');
  });
});
