import { divisionColors } from '@/design/tokens';

export type WorkflowThemeId =
  | 'sunrise'
  | 'vespers'
  | 'rogue'
  | 'tech'
  | 'stealth'
  | 'heritage'
  | 'youth'
  | 'executive';

export interface WorkflowThemeDefinition {
  id: WorkflowThemeId;
  name: string;
  description: string;
  tokens: {
    '--stage-measure': string;
    '--stage-condition': string;
    '--stage-scope': string;
    '--stage-estimate': string;
    '--stage-outreach': string;
    '--stage-contract': string;
    '--stage-schedule': string;
    '--stage-closeout': string;
    '--workflow-surface': string;
    '--workflow-surface-muted': string;
    '--workflow-border': string;
    '--workflow-foreground': string;
  };
}

const color = divisionColors;

const makeTheme = (
  id: WorkflowThemeId,
  name: string,
  description: string,
  palette: Partial<WorkflowThemeDefinition['tokens']>,
): WorkflowThemeDefinition => ({
  id,
  name,
  description,
  tokens: {
    '--stage-measure': palette['--stage-measure'] ?? color.tech[400],
    '--stage-condition': palette['--stage-condition'] ?? color.stealth[300],
    '--stage-scope': palette['--stage-scope'] ?? color.orange[400],
    '--stage-estimate': palette['--stage-estimate'] ?? color.orange[500],
    '--stage-outreach': palette['--stage-outreach'] ?? color.ember[300],
    '--stage-contract': palette['--stage-contract'] ?? color.sand[300],
    '--stage-schedule': palette['--stage-schedule'] ?? color.tech[500],
    '--stage-closeout': palette['--stage-closeout'] ?? color.hunter[400],
    '--workflow-surface': palette['--workflow-surface'] ?? color.bg.dark,
    '--workflow-surface-muted': palette['--workflow-surface-muted'] ?? color.bg.card,
    '--workflow-border': palette['--workflow-border'] ?? 'rgba(255,255,255,0.07)',
    '--workflow-foreground': palette['--workflow-foreground'] ?? color.text.primary,
  },
});

export const WORKFLOW_THEMES: WorkflowThemeDefinition[] = [
  makeTheme('sunrise', 'Sunrise Briefing', 'Amber + teal cues for morning parking lot walk-throughs.', {
    '--stage-measure': color.ember[300],
    '--stage-condition': color.tech[400],
    '--stage-estimate': color.orange[500],
    '--stage-contract': color.sand[200],
    '--stage-closeout': color.hunter[200],
    '--workflow-surface': 'rgba(9,14,24,0.96)',
  }),
  makeTheme('vespers', 'Vespers Halo', 'Evening purple gradients suited for board briefings.', {
    '--stage-measure': color.hunter[300],
    '--stage-condition': color.rogue[200],
    '--stage-outreach': color.coral[300],
    '--stage-schedule': color.tech[500],
    '--workflow-surface': 'rgba(15,12,32,0.96)',
  }),
  makeTheme('rogue', 'Rogue Ops', 'High-alert crimson for weather or emergency dispatch.', {
    '--stage-measure': color.rogue[500],
    '--stage-condition': color.rogue[400],
    '--stage-scope': color.orange[500],
    '--stage-contract': color.rogue[200],
    '--workflow-surface': 'rgba(12,3,6,0.95)',
  }),
  makeTheme('tech', 'Tech Specialist', 'Cyan grid for AI-assisted measurement sessions.', {
    '--stage-measure': color.tech[400],
    '--stage-condition': color.stealth[300],
    '--stage-schedule': color.tech[500],
    '--workflow-surface': 'rgba(3,8,20,0.96)',
  }),
  makeTheme('stealth', 'Stealth Missions', 'Night-vision greens for quiet-hour planning.', {
    '--stage-condition': color.stealth[400],
    '--stage-scope': color.stealth[300],
    '--stage-schedule': color.stealth[200],
    '--workflow-surface': 'rgba(6,18,12,0.96)',
  }),
  makeTheme('heritage', 'Heritage', 'Sandstone + brass palette for executive reviews.', {
    '--stage-contract': color.sand[300],
    '--stage-outreach': color.coral[200],
    '--stage-closeout': color.hunter[300],
    '--workflow-surface': 'rgba(16,12,6,0.95)',
  }),
  makeTheme('youth', 'Youth Dynamo', 'Electric violets for youth-event resurface programs.', {
    '--stage-measure': color.hunter[400],
    '--stage-scope': color.tech[400],
    '--stage-outreach': color.coral[400],
    '--workflow-surface': 'rgba(14,8,28,0.95)',
  }),
  makeTheme('executive', 'Executive', 'Polished indigo + chrome for capital campaign planning.', {
    '--stage-measure': color.tech[200],
    '--stage-estimate': color.sand[200],
    '--stage-contract': color.sand[300],
    '--workflow-surface': 'rgba(8,12,24,0.96)',
  }),
];

export const WORKFLOW_STAGE_COLORS: Record<string, string> = {
  measure: 'var(--stage-measure)',
  condition: 'var(--stage-condition)',
  scope: 'var(--stage-scope)',
  estimate: 'var(--stage-estimate)',
  outreach: 'var(--stage-outreach)',
  contract: 'var(--stage-contract)',
  schedule: 'var(--stage-schedule)',
  closeout: 'var(--stage-closeout)',
};

export const WORKFLOW_TYPOGRAPHY = {
  headline: 'clamp(1.75rem, 2vw, 2.5rem)',
  title: 'clamp(1.25rem, 1.6vw, 1.75rem)',
  eyebrow: '0.65rem',
  body: '1rem',
  mono: '0.85rem',
};

export const WORKFLOW_SPACING = {
  rail: '1.15rem',
  stageGap: '1.5rem',
  metricGap: '0.85rem',
};
