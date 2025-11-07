import { Monitor, Zap } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { HudPresetMode } from '@/lib/theme';

interface ThemeHudControlsProps {
  hudOpacity: number;
  hudBlur: number;
  showHud: boolean;
  hudPreset: HudPresetMode;
  hudAnimationsEnabled: boolean;
  onHudOpacityChange: (value: number) => void;
  onHudBlurChange: (value: number) => void;
  onShowHudChange: (enabled: boolean) => void;
  onHudPresetChange: (preset: HudPresetMode) => void;
  onHudAnimationsEnabledChange: (enabled: boolean) => void;
}

export function ThemeHudControls({
  hudOpacity,
  hudBlur,
  showHud,
  hudPreset,
  hudAnimationsEnabled,
  onHudOpacityChange,
  onHudBlurChange,
  onShowHudChange,
  onHudPresetChange,
  onHudAnimationsEnabledChange,
}: ThemeHudControlsProps) {
  const [localOpacity, setLocalOpacity] = useState(hudOpacity);
  const [localBlur, setLocalBlur] = useState(hudBlur);

  const presets: Array<{ mode: HudPresetMode; label: string }> = [
    { mode: 'minimal', label: 'Minimal' },
    { mode: 'standard', label: 'Standard' },
    { mode: 'full', label: 'Full' },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-border/40 bg-card/50 p-5 shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Monitor className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-foreground">
            HUD Display
          </h3>
          <p className="text-xs text-muted-foreground">Customize tactical overlay appearance</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-hud" className="text-sm font-medium text-foreground/90">
            Show HUD Overlay
          </Label>
          <Switch id="show-hud" checked={showHud} onCheckedChange={onShowHudChange} />
        </div>

        {showHud && (
          <>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground/90">HUD Presets</Label>
              <div className="flex gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.mode}
                    type="button"
                    variant={hudPreset === preset.mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onHudPresetChange(preset.mode)}
                    className="flex-1"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Quick presets for HUD appearance. Keyboard shortcut: <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs">Ctrl+H</kbd> to toggle.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="hud-opacity" className="text-sm font-medium text-foreground/90">
                  Panel Opacity
                </Label>
                <span className="font-mono text-xs text-muted-foreground">{Math.round(localOpacity * 100)}%</span>
              </div>
              <Slider
                id="hud-opacity"
                min={0.3}
                max={1}
                step={0.05}
                value={[localOpacity]}
                onValueChange={([value]) => {
                  setLocalOpacity(value);
                  onHudOpacityChange(value);
                  onHudPresetChange('custom');
                }}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="hud-blur" className="text-sm font-medium text-foreground/90">
                  Backdrop Blur
                </Label>
                <span className="font-mono text-xs text-muted-foreground">{Math.round(localBlur)}px</span>
              </div>
              <Slider
                id="hud-blur"
                min={0}
                max={24}
                step={2}
                value={[localBlur]}
                onValueChange={([value]) => {
                  setLocalBlur(value);
                  onHudBlurChange(value);
                  onHudPresetChange('custom');
                }}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <Label htmlFor="hud-animations" className="text-sm font-medium text-foreground/90">
                  Enable Animations
                </Label>
              </div>
              <Switch 
                id="hud-animations" 
                checked={hudAnimationsEnabled} 
                onCheckedChange={onHudAnimationsEnabledChange} 
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
