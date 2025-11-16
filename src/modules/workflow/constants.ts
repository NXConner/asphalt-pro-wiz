import type { WorkflowStageId } from './types';

export const WORKFLOW_STAGE_ORDER: WorkflowStageId[] = [
  'measure',
  'condition',
  'scope',
  'estimate',
  'outreach',
  'contract',
  'schedule',
  'closeout',
];

export const STAGE_LABELS: Record<WorkflowStageId, string> = {
  measure: 'Measure & Map',
  condition: 'Condition Intelligence',
  scope: 'Scope Builder',
  estimate: 'Estimate Fusion',
  outreach: 'Outreach & Approvals',
  contract: 'Contract & Invoice',
  schedule: 'Schedule & Deploy',
  closeout: 'Closeout & Insights',
};

export const STAGE_EYEBROWS: Record<WorkflowStageId, string> = {
  measure: 'Step 01',
  condition: 'Step 02',
  scope: 'Step 03',
  estimate: 'Step 04',
  outreach: 'Step 05',
  contract: 'Step 06',
  schedule: 'Step 07',
  closeout: 'Step 08',
};

export const STAGE_DESCRIPTIONS: Record<WorkflowStageId, string> = {
  measure: 'Capture square footage, crack footage, and GIS overlays either manually or via AI.',
  condition: 'Blend manual notes with AI crack severity models to prioritize remediation.',
  scope: 'Select treatments, premium services, and layout adjustments tailored to the campus.',
  estimate: 'Run cost scenarios, supplier telemetry, and compliance guardrails.',
  outreach: 'Coordinate pastors, boards, and congregational communications in one canvas.',
  contract: 'Generate proposals, collect signatures, and sync invoices to accounting.',
  schedule: 'Apply worship blackout windows, crew capacity, weather gates, and mission briefs.',
  closeout: 'Finalize QA, document deliverables, capture satisfaction, and feed analytics.',
};
