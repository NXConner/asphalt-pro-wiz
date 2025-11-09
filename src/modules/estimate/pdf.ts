import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { BusinessData, CostBreakdown, Costs, ProjectInputs } from '@/lib/calculations';
import type { ComplianceIssue } from '@/modules/estimate/compliance';

export interface ExportEstimatePdfOptions {
  scenarioName?: string;
  inputs: ProjectInputs;
  costs: Costs;
  breakdown: CostBreakdown[];
  business: BusinessData;
  compliance: ComplianceIssue[];
}

export async function exportEstimatePdf(options: ExportEstimatePdfOptions): Promise<void> {
  const { scenarioName = 'Primary Scenario', inputs, costs, breakdown, business, compliance } =
    options;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const margin = 36;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Pavement Performance Suite — Proposal', margin, 56);
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Scenario: ${scenarioName}`, margin, 76);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 92);

  doc.setDrawColor(230);
  doc.line(margin, 108, doc.internal.pageSize.getWidth() - margin, 108);

  autoTable(doc, {
    startY: 124,
    theme: 'grid',
    headStyles: { fillColor: [31, 41, 55], textColor: 255 },
    bodyStyles: { fillColor: false },
    head: [['Estimate Summary', 'Value']],
    body: [
      ['Total Area', `${inputs.totalArea.toLocaleString()} sq ft`],
      ['Sealcoat Passes', inputs.numCoats.toString()],
      ['Crack Footage', `${inputs.crackLength.toFixed(1)} ft`],
      ['Travel Distance', `${inputs.jobDistanceMiles.toFixed(1)} miles`],
      ['Premium Services', premiumSummary(inputs)],
    ],
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 18,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68], textColor: 255 },
    head: [['Cost Component', 'Amount']],
    body: [
      ...breakdown.map((item) => [(item as any).label ?? 'Item', currency(Number((item as any).amount ?? 0))]),
      ['Overhead', currency(costs.overhead)],
      ['Profit', currency(costs.profit)],
      [{ content: 'Total', styles: { fontStyle: 'bold' } }, currency(costs.total)],
    ],
  });

  const complianceStart = (doc as any).lastAutoTable.finalY + 20;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Compliance Readiness', margin, complianceStart);
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'normal');

  const complianceBody =
    compliance.length > 0
      ? compliance.map((issue) => [
          issue.label,
          issue.status.toUpperCase(),
          issue.recommendation ?? '',
        ])
      : [['All checks passed', 'PASS', '']];

  autoTable(doc, {
    startY: complianceStart + 12,
    theme: 'plain',
    head: [['Checkpoint', 'Status', 'Recommendation']],
    headStyles: { fontStyle: 'bold', fillColor: [31, 41, 55], textColor: 255 },
    body: complianceBody,
    bodyStyles: { fillColor: false },
  });

  const footerY = doc.internal.pageSize.getHeight() - 48;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Business Overhead: ${business.overheadPercent.toFixed(1)}% · Profit Target: ${business.profitPercent.toFixed(1)}%`,
    margin,
    footerY,
  );
  doc.text(
    'Generated via Pavement Performance Suite — mission ready tooling for church campuses.',
    margin,
    footerY + 14,
  );

  doc.save(`pavement-estimate-${scenarioName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

function premiumSummary(inputs: ProjectInputs): string {
  const items: string[] = [];
  if (inputs.premiumEdgePushing) items.push('Edge Pushing');
  if (inputs.premiumWeedKiller) items.push('Vegetation Control');
  if (inputs.premiumCrackCleaning) items.push('Crack Cleaning');
  if (inputs.premiumPowerWashing) items.push('Power Washing');
  if (inputs.premiumDebrisRemoval) items.push('Debris Removal');
  return items.length > 0 ? items.join(', ') : 'Standard scope';
}

function currency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}
