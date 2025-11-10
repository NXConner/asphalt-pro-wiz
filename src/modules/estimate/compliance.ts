import type { ProjectInputs } from '@/lib/calculations';

export type ComplianceIssueStatus = 'pass' | 'warn' | 'fail';

export interface ComplianceIssue {
  id: string;
  label: string;
  status: ComplianceIssueStatus;
  recommendation?: string;
  details?: string;
}

export interface ComplianceEvaluation {
  issues: ComplianceIssue[];
  score: number;
}

export interface ComplianceContext {
  inputs: ProjectInputs;
  travelMiles: number;
  premiumPowerWashing: boolean;
  polymerAdded: boolean;
  oilSpots: number;
  prepHours: number;
}

const PASS_SCORE = 1;
const WARN_SCORE = 0.5;

export function evaluateCompliance(context: ComplianceContext): ComplianceEvaluation {
  const { inputs, travelMiles, premiumPowerWashing, polymerAdded, oilSpots, prepHours } = context;
  const issues: ComplianceIssue[] = [];

  const handicapRequired = Math.max(1, Math.ceil(inputs.totalArea / 15000));
  const adaStatus =
    inputs.stripingHandicap >= handicapRequired && inputs.includeStriping ? 'pass' : 'warn';
  issues.push({
    id: 'ada-stalls',
    label: `ADA stalls (${inputs.stripingHandicap}/${handicapRequired})`,
    status: adaStatus,
    recommendation:
      adaStatus === 'warn'
        ? 'Increase handicap stall count or flag outreach team for compliance exception.'
        : undefined,
  });

  const coatStatus = inputs.numCoats >= 2 ? 'pass' : 'fail';
  issues.push({
    id: 'coat-count',
    label: `${inputs.numCoats} sealcoat passes`,
    status: coatStatus,
    recommendation:
      coatStatus === 'fail'
        ? 'Apply minimum two coats for church parking surfaces to meet ASTM D490 compliance.'
        : undefined,
  });

  const waterStatus = inputs.waterPercent <= 20 ? 'pass' : 'warn';
  issues.push({
    id: 'water-dilution',
    label: `Water dilution ${inputs.waterPercent}%`,
    status: waterStatus,
    recommendation:
      waterStatus === 'warn'
        ? 'Keep dilution below 20% to maintain mix solids and manufacturer warranty.'
        : undefined,
  });

  const powerWashStatus = oilSpots > 0 ? (premiumPowerWashing ? 'pass' : 'fail') : 'pass';
  issues.push({
    id: 'surface-prep',
    label: oilSpots > 0 ? 'Oil spot remediation planned' : 'Surface clean',
    status: powerWashStatus,
    recommendation:
      powerWashStatus === 'fail'
        ? 'Add power washing or degreaser service before sealcoat application.'
        : undefined,
  });

  const cureStatus = polymerAdded || prepHours >= 1 ? 'pass' : 'warn';
  issues.push({
    id: 'cure-time',
    label: polymerAdded ? 'Fast-dry polymer enabled' : 'Standard cure cycle',
    status: cureStatus,
    recommendation:
      cureStatus === 'warn'
        ? 'Allocate prep or add polymer additive for ministry weekend turnaround.'
        : undefined,
  });

  const travelStatus = travelMiles <= 120 ? 'pass' : 'warn';
  issues.push({
    id: 'travel-distance',
    label: `Round trip travel ${travelMiles.toFixed(1)} mi`,
    status: travelStatus,
    recommendation:
      travelStatus === 'warn'
        ? 'Review crew lodging or supplier staging to reduce travel fatigue.'
        : undefined,
  });

  const complianceScore =
    issues.reduce((score, issue) => {
      if (issue.status === 'pass') return score + PASS_SCORE;
      if (issue.status === 'warn') return score + WARN_SCORE;
      return score;
    }, 0) / issues.length;

  return {
    issues,
    score: Number.isFinite(complianceScore) ? complianceScore : 0,
  };
}
