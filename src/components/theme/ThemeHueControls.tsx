import { Contrast, Rainbow } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export interface ThemeHueControlsProps {
  useHueOverride: boolean;
  hue: number;
  radius: number;
  highContrast: boolean;
  onToggleHueOverride: (value: boolean) => void;
  onHueChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
  onToggleHighContrast: (value: boolean) => void;
}

export function ThemeHueControls({
  useHueOverride,
  hue,
  radius,
  highContrast,
  onToggleHueOverride,
  onHueChange,
  onRadiusChange,
  onToggleHighContrast,
}: ThemeHueControlsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-slate-950/70 p-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/60">
          <Rainbow className="h-4 w-4" /> Hue Override
        </div>
        <Switch
          checked={useHueOverride}
          onCheckedChange={onToggleHueOverride}
          aria-label="Toggle hue override"
        />
      </header>

      <div className="space-y-3">
        <Label
          htmlFor="theme-primary-hue"
          className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60"
        >
          <span>Primary Hue</span>
          <span>{hue}°</span>
        </Label>
        <input
          id="theme-primary-hue"
          type="range"
          min={0}
          max={360}
          value={hue}
          onChange={(event) => onHueChange(Number.parseInt(event.target.value, 10))}
          disabled={!useHueOverride}
          className="h-2 w-full cursor-pointer rounded-full bg-gradient-to-r from-rose-500 via-emerald-400 to-sky-500"
        />
        {!useHueOverride ? (
          <p className="text-xs text-slate-300/60">
            Enable hue override to align the Division palette with your church branding.
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="theme-radius"
          className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60"
        >
          <span>Corner Radius</span>
          <span>{radius}px</span>
        </Label>
        <input
          id="theme-radius"
          type="range"
          min={0}
          max={24}
          value={radius}
          onChange={(event) => onRadiusChange(Number.parseInt(event.target.value, 10))}
          className="h-2 w-full cursor-pointer rounded-full bg-slate-700/80"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/60 p-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-300/60">
          <Contrast className="h-4 w-4" /> High Contrast
        </div>
        <Switch
          checked={highContrast}
          onCheckedChange={onToggleHighContrast}
          aria-label="Toggle high contrast theme"
        />
      </div>
    </div>
  );
}

