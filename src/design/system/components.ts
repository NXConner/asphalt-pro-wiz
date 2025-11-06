import type { DesignTokenMeta } from './config';

export type CoreComponentId =
  | 'button'
  | 'input'
  | 'textarea'
  | 'select'
  | 'card'
  | 'modal';

interface ComponentStyleDefinition {
  readonly id: CoreComponentId;
  readonly description: string;
  readonly baseClass: string;
  readonly tokens: string[];
  readonly docsLink?: string;
}

const withTokens = (tokens: string[]): string[] => Array.from(new Set(tokens)).sort();

export const CORE_COMPONENT_STYLES: Record<CoreComponentId, ComponentStyleDefinition> = {
  button: {
    id: 'button',
    description: 'Primary mission action control supporting multiple states.',
    baseClass:
      'group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition-[background,transform,box-shadow] duration-200 ease-out ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    tokens: withTokens(['--primary', '--primary-foreground', '--ring', '--radius']),
    docsLink: '#button',
  },
  input: {
    id: 'input',
    description: 'Text input field aligned to HUD typography and focus affordances.',
    baseClass:
      'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-[border-color,box-shadow] duration-150 ease-out ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    tokens: withTokens(['--input', '--foreground', '--muted-foreground', '--ring', '--radius']),
    docsLink: '#input',
  },
  textarea: {
    id: 'textarea',
    description: 'Multi-line text capture element inheriting input control semantics.',
    baseClass:
      'flex min-h-[92px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium leading-relaxed text-foreground shadow-sm transition-[border-color,box-shadow] duration-150 ease-out ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    tokens: withTokens(['--input', '--foreground', '--muted-foreground', '--ring', '--radius']),
    docsLink: '#textarea',
  },
  select: {
    id: 'select',
    description: 'Radix-driven select trigger styled with canonical tokens.',
    baseClass:
      'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-[border-color,box-shadow] duration-150 ease-out ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
    tokens: withTokens(['--input', '--foreground', '--ring', '--radius']),
    docsLink: '#select',
  },
  card: {
    id: 'card',
    description: 'Default surface container for mission panels and analytics.',
    baseClass:
      'rounded-xl border border-border/80 bg-card/80 text-card-foreground shadow-md backdrop-blur-sm transition-colors duration-200 ease-out',
    tokens: withTokens(['--card', '--card-foreground', '--border', '--shadow-md', '--radius']),
    docsLink: '#card',
  },
  modal: {
    id: 'modal',
    description: 'Application dialog overlay aligning with popover and card surfaces.',
    baseClass:
      'fixed left-1/2 top-1/2 z-50 grid max-h-[min(90vh,680px)] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-border/70 bg-popover/95 p-6 text-popover-foreground shadow-xl backdrop-blur-xl transition-[opacity,transform] duration-200 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    tokens: withTokens(['--popover', '--popover-foreground', '--border', '--shadow-xl', '--radius', '--ring']),
    docsLink: '#dialog',
  },
};

export const getComponentBaseClass = (id: CoreComponentId): string => CORE_COMPONENT_STYLES[id].baseClass;

export const getComponentTokens = (id: CoreComponentId): string[] => CORE_COMPONENT_STYLES[id].tokens.slice();

export const listCanonicalComponentTokens = (): Array<{
  id: CoreComponentId;
  description: string;
  tokens: string[];
  docsLink?: string;
}> => Object.values(CORE_COMPONENT_STYLES).map(({ id, description, tokens, docsLink }) => ({
  id,
  description,
  tokens: tokens.slice(),
  docsLink,
}));

export const flattenComponentTokenMeta = (tokens: DesignTokenMeta[]): Record<string, DesignTokenMeta> =>
  tokens.reduce<Record<string, DesignTokenMeta>>((acc, meta) => {
    acc[meta.cssVar] = meta;
    acc[meta.token] = meta;
    return acc;
  }, {});

