import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  DivisionCard,
  DivisionCardHeader,
  DivisionCardMetric,
  DivisionCardDivider,
} from '@/components/division';

describe('DivisionCard', () => {
  it('renders header and metrics', () => {
    render(
      <DivisionCard variant="command">
        <DivisionCardHeader
          eyebrow="Mission Totals"
          title="Crew Readiness"
          subtitle="Live mission telemetry"
        />
        <DivisionCardDivider />
        <DivisionCardMetric label="Active Rate" value="62%" tone="positive" />
      </DivisionCard>,
    );

    expect(screen.getByText('Mission Totals')).toBeInTheDocument();
    expect(screen.getByText('Crew Readiness')).toBeInTheDocument();
    expect(screen.getByText('Live mission telemetry')).toBeInTheDocument();
    expect(screen.getByText('Active Rate')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
  });
});
