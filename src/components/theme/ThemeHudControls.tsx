import { Monitor } from 'lucide-react';
import { useState } from 'react';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface ThemeHudControlsProps {
  hudOpacity: number;
  hudBlur: number;
  showHud: boolean;
  onHudOpacityChange: (value: number) => void;
  onHudBlurChange: (value: number) => void;
  onShowHudChange: (enabled: boolean) => void;
}

export function ThemeHudControls({
  hudOpacity,
  hudBlur,
  showHud,
  onHudOpacityChange,
  onHudBlurChange,
  onShowHudChange,
}: ThemeHudControlsProps) {
  const [localOpacity, setLocalOpacity] = useState(hudOpacity);
  const [localBlur, setLocalBlur] = useState(hudBlur);

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
                }}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
