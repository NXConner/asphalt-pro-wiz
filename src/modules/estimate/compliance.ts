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
  overall: ComplianceIssueStatus;
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

function summarizeStatusCounts(issues: ComplianceIssue[]) {
  let pass = 0;
  let warn = 0;
  let fail = 0;
  issues.forEach((issue) => {
    if (issue.status === 'pass') pass += 1;
    else if (issue.status === 'warn') warn += 1;
    else fail += 1;
  });
  return { pass, warn, fail };
}

function determineOverallStatus(counts: { pass: number; warn: number; fail: number }): ComplianceIssueStatus {
  if (counts.fail > 0) return 'fail';
  if (counts.warn > 0) return 'warn';
  return 'pass';
}

export function evaluateCompliance(context: ComplianceContext): ComplianceEvaluation {
  const { inputs, travelMiles, premiumPowerWashing, polymerAdded, oilSpots, prepHours } = context;
  const issues: ComplianceIssue[] = [];

  const handicapRequired = Math.max(1, Math.ceil(inputs.totalArea / 15000));
  const adaCoverage = inputs.includeStriping ? inputs.stripingHandicap / handicapRequired : 0;
  const adaStatus =
    adaCoverage >= 1 ? 'pass' : adaCoverage >= 0.8 ? 'warn' : inputs.includeStriping ? 'fail' : 'warn';
  issues.push({
    id: 'ada-stalls',
    label: `ADA stalls (${inputs.stripingHandicap}/${handicapRequired})`,
    status: adaStatus,
    recommendation:
      adaStatus === 'warn'
        ? 'Increase handicap stall count or flag outreach team for compliance exception.'
        : undefined,
  });

  const coatStatus = inputs.includeSealcoating
    ? inputs.numCoats >= 2
      ? 'pass'
      : inputs.numCoats === 1
        ? 'warn'
        : 'fail'
    : 'pass';
  issues.push({
    id: 'coat-count',
    label: `${inputs.numCoats} sealcoat passes`,
    status: coatStatus,
    recommendation:
      coatStatus === 'fail'
        ? 'Apply minimum two coats for church parking surfaces to meet ASTM D490 compliance.'
        : undefined,
  });

  const waterPercent = Math.min(Math.max(inputs.waterPercent ?? 0, 0), 40);
  const waterStatus = waterPercent <= 20 ? 'pass' : waterPercent <= 30 ? 'warn' : 'fail';
  issues.push({
    id: 'water-dilution',
    label: `Water dilution ${waterPercent}%`,
    status: waterStatus,
    recommendation:
      waterStatus === 'warn'
        ? 'Keep dilution below 20% to maintain mix solids and manufacturer warranty.'
        : waterStatus === 'fail'
          ? 'Dilution above 30% violates spec; reduce water immediately.'
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

  const stripingDensity = inputs.includeStriping
    ? inputs.stripingLines / Math.max(inputs.totalArea / 10000, 1)
    : 0;
  const stripingStatus = !inputs.includeStriping
    ? 'warn'
    : stripingDensity >= 5
      ? 'pass'
      : stripingDensity >= 3
        ? 'warn'
        : 'fail';
  issues.push({
    id: 'striping-density',
    label: 'Striping density vs. lot size',
    status: stripingStatus,
    recommendation:
      stripingStatus !== 'pass'
        ? 'Add layout or confirm headcount to maintain parking flow and ADA routes.'
        : undefined,
  });

  const handicapPaintStatus =
    inputs.includeStriping && inputs.stripingHandicap > 0
      ? inputs.stripingColors?.includes('Blue') ?? false
        ? 'pass'
        : 'fail'
      : 'pass';
  issues.push({
    id: 'handicap-color',
    label: 'Blue ADA markings present',
    status: handicapPaintStatus,
    recommendation:
      handicapPaintStatus === 'fail'
        ? 'Add blue pigment / reflective glass beads for ADA stalls.'
        : undefined,
  });

  if (inputs.totalArea > 45000) {
    issues.push({
      id: 'edge-prep',
      label: 'Edge restoration plan',
      status: inputs.premiumEdgePushing ? 'pass' : 'warn',
      recommendation: !inputs.premiumEdgePushing
        ? 'Consider edge pushing to prevent unraveling along sanctuary drives.'
        : undefined,
    });
  }

  if (inputs.includeCleaningRepair && inputs.crackLength > 2000) {
    issues.push({
      id: 'vegetation-control',
      label: 'Vegetation mitigation in cracks',
      status: inputs.premiumWeedKiller ? 'pass' : 'warn',
      recommendation: !inputs.premiumWeedKiller
        ? 'Add weed killer to crack cleaning scope for longevity.'
        : undefined,
    });
  }

  const counts = summarizeStatusCounts(issues);
  const complianceScore =
    issues.reduce((score, issue) => {
      if (issue.status === 'pass') return score + PASS_SCORE;
      if (issue.status === 'warn') return score + WARN_SCORE;
      return score;
    }, 0) / issues.length;

  return {
    issues,
    score: Number.isFinite(complianceScore) ? complianceScore : 0,
    overall: determineOverallStatus(counts),
  };
}
