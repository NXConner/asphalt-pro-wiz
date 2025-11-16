import type { ScenarioComparisonRow } from '@/modules/estimate/components/ScenarioComparisonMatrix';

export interface CopilotPromptInput {
  jobName: string;
  customerAddress: string;
  totalAreaSqFt: number;
  userNotes?: string;
  rows: ScenarioComparisonRow[];
}

export function buildCopilotPrompt({
  jobName,
  customerAddress,
  totalAreaSqFt,
  userNotes,
  rows,
}: CopilotPromptInput): string {
  const header = `You are an asphalt estimation strategist advising a small church-focused contractor. Summarize actionable recommendations that balance ministry disruption, profitability, and compliance.`;

  const scopeSummary = `Job: ${jobName || 'Unnamed Campus'} @ ${customerAddress || 'Undisclosed address'} · Scope: ${totalAreaSqFt.toFixed(
    1,
  )} sq ft.`;

  const scenarioLines = rows
    .map(
      (row, index) =>
        `${index + 1}. ${row.name} → Total $${row.total.toFixed(2)}, Profit $${row.profit.toFixed(2)}, Margin ${row.margin.toFixed(1)}%, Delta vs primary ${row.deltaPercent >= 0 ? '+' : ''}${row.deltaPercent.toFixed(1)}%, Compliance: ${row.complianceSummary}`,
    )
    .join('\n');

  const notesSection = userNotes?.trim()
    ? `Estimator Notes: ${userNotes.trim()}`
    : 'Estimator Notes: None provided.';

  return `${header}

${scopeSummary}

Scenario Inventory:
${scenarioLines}

${notesSection}

Instructions:
1. Recommend the best scenario (or hybrid) with concrete reasoning referencing cost deltas, compliance risk, and ministry impact.
2. Highlight up to three risks or blockers (weather windows, crew constraints, ADA considerations, etc.).
3. Provide next actions for the crew lead and for the pastor/facility director.
4. Keep the response under 180 words and use bullet lists for clarity.`;
}
