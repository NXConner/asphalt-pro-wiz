import { Contrast, Droplet, Rainbow, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export interface ThemeHueControlsProps {
  useHueOverride: boolean;
  useAccentOverride: boolean;
  hue: number;
  accentHue: number;
  radius: number;
  highContrast: boolean;
  onToggleHueOverride: (value: boolean) => void;
  onHueChange: (value: number) => void;
  onToggleAccentOverride: (value: boolean) => void;
  onAccentHueChange: (value: number) => void;
  onRadiusChange: (value: number) => void;
  onToggleHighContrast: (value: boolean) => void;
  onRandomizePalette: () => void;
}

export function ThemeHueControls({
  useHueOverride,
  useAccentOverride,
  hue,
  accentHue,
  radius,
  highContrast,
  onToggleHueOverride,
  onHueChange,
  onToggleAccentOverride,
  onAccentHueChange,
  onRadiusChange,
  onToggleHighContrast,
  onRandomizePalette,
}: ThemeHueControlsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-slate-950/70 p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/60">
          <Rainbow className="h-4 w-4" /> Mission Palette
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRandomizePalette}
          className="border-white/20 bg-transparent text-xs uppercase tracking-[0.3em] text-slate-200 hover:bg-white/10"
        >
          <Sparkles className="mr-2 h-3.5 w-3.5" /> Randomize
        </Button>
      </header>

      <div className="space-y-3 rounded-lg border border-white/10 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-300/60">
            <Rainbow className="h-4 w-4" /> Primary Override
          </div>
          <Switch
            checked={useHueOverride}
            onCheckedChange={onToggleHueOverride}
            aria-label="Toggle primary hue override"
          />
        </div>

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
      </div>

      <div className="space-y-3 rounded-lg border border-white/10 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-300/60">
            <Droplet className="h-4 w-4" /> Accent Override
          </div>
          <Switch
            checked={useAccentOverride}
            onCheckedChange={onToggleAccentOverride}
            aria-label="Toggle accent hue override"
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="theme-accent-hue"
            className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60"
          >
            <span>Accent Hue</span>
            <span className="flex items-center gap-2">
              <span>{accentHue}°</span>
              <span
                aria-hidden
                className="h-4 w-4 rounded-full border border-white/20 shadow-inner"
                style={{ backgroundColor: `hsl(${accentHue}deg 90% 60%)` }}
              />
            </span>
          </Label>
          <input
            id="theme-accent-hue"
            type="range"
            min={0}
            max={360}
            value={accentHue}
            onChange={(event) => onAccentHueChange(Number.parseInt(event.target.value, 10))}
            disabled={!useAccentOverride}
            className="h-2 w-full cursor-pointer rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-sky-500"
          />
        {!useAccentOverride ? (
          <p className="text-xs text-slate-300/60">
            Enable accent override to tune secondary actions, badges, and navigation highlights.
          </p>
        ) : null}
      </div>
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

