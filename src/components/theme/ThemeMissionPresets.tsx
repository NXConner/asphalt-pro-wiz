import { Sparkles } from 'lucide-react';

import { ThemeSwatch } from '@/components/ui/theme-swatch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ThemePresetMeta } from '@/lib/designSystem';
import type { ThemeMode } from '@/lib/theme';
import { cn } from '@/lib/utils';

const modeOptions: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export interface ThemeMissionPresetsProps {
  divisionPresets: ThemePresetMeta[];
  legacyPresets: ThemePresetMeta[];
  activeTheme: string;
  mode: ThemeMode;
  onModeChange: (value: ThemeMode) => void;
  onSelectPreset: (preset: ThemePresetMeta) => void;
}

export function ThemeMissionPresets({
  divisionPresets,
  legacyPresets,
  activeTheme,
  mode,
  onModeChange,
  onSelectPreset,
}: ThemeMissionPresetsProps) {
  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-slate-200/70">
            <Sparkles className="h-4 w-4" /> Mission Themes
          </h3>
          <p className="text-xs text-slate-300/60">
            Pick a preset or blend your own palette for crew briefings and campus walk-throughs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="theme-mode-select"
            className="text-xs uppercase tracking-[0.3em] text-slate-300/60"
          >
            Visual Mode
          </Label>
          <Select value={mode} onValueChange={(value: ThemeMode) => onModeChange(value)}>
            <SelectTrigger
              id="theme-mode-select"
              className="w-36 border-white/20 bg-slate-900/70"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <ThemeGroup
          title="Division Protocol"
          description="Immersive SHD-grade palettes with tactical contrast."
          presets={divisionPresets}
          activeTheme={activeTheme}
          onSelect={onSelectPreset}
        />
        <ThemeGroup
          title="Legacy Palettes"
          description="Classic contractor-friendly colorways."
          presets={legacyPresets}
          activeTheme={activeTheme}
          onSelect={onSelectPreset}
        />
      </div>
    </section>
  );
}

interface ThemeGroupProps {
  title: string;
  description: string;
  presets: ThemePresetMeta[];
  activeTheme: string;
  onSelect: (preset: ThemePresetMeta) => void;
}

function ThemeGroup({ title, description, presets, activeTheme, onSelect }: ThemeGroupProps) {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/70 p-4">
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/70">
          {title}
        </h4>
        <p className="text-xs text-slate-300/60">{description}</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {presets.map((preset) => (
          <ThemeSwatch
            key={preset.id}
            preset={preset}
            active={preset.id === activeTheme}
            onSelect={() => onSelect(preset)}
            className={cn('border-white/10 bg-slate-900/50', {
              'border-orange-400/70 shadow-[0_18px_40px_rgba(255,128,0,0.35)]': preset.id === activeTheme,
            })}
          />
        ))}
      </div>
    </div>
  );
}

