export type CommandLayoutMode = 'grid' | 'timeline' | 'immersive';

export interface CommandLayoutMeta {
  id: CommandLayoutMode;
  label: string;
  description: string;
}

export const COMMAND_LAYOUT_MODES: CommandLayoutMeta[] = [
  {
    id: 'grid',
    label: 'Grid Ops',
    description: 'Classic 12-column operations grid optimized for estimation throughput.',
  },
  {
    id: 'timeline',
    label: 'Mission Timeline',
    description: 'Chronological flow that highlights upcoming services, alerts, and crew readiness.',
  },
  {
    id: 'immersive',
    label: 'Immersive HUD',
    description:
      'Full-bleed cinematic canvas that blends telemetry overlays with wallpaper storytelling.',
  },
];

export const COMMAND_LAYOUT_LABELS: Record<CommandLayoutMode, string> = COMMAND_LAYOUT_MODES.reduce(
  (acc, mode) => {
    acc[mode.id] = mode.label;
    return acc;
  },
  {} as Record<CommandLayoutMode, string>,
);

export function isCommandLayoutMode(value: string): value is CommandLayoutMode {
  return COMMAND_LAYOUT_MODES.some((mode) => mode.id === value);
}
