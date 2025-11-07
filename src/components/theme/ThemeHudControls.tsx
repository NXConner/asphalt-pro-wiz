import { Monitor, Zap, Pin, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { HudPresetMode, HudLayoutPreset, SavedHudLayout, HudSize, HudTransitionPreset, HudThemeVariant } from '@/lib/theme';
import { useToast } from '@/hooks/use-toast';
import { Kbd } from '@/components/common/Kbd';

interface ThemeHudControlsProps {
  hudOpacity: number;
  hudBlur: number;
  showHud: boolean;
  hudPreset: HudPresetMode;
  hudAnimationsEnabled: boolean;
  hudLayoutPreset: HudLayoutPreset;
  hudSize: HudSize;
  hudPinned: boolean;
  savedLayouts: SavedHudLayout[];
  onHudOpacityChange: (value: number) => void;
  onHudBlurChange: (value: number) => void;
  onShowHudChange: (enabled: boolean) => void;
  onHudPresetChange: (preset: HudPresetMode) => void;
  onHudAnimationsEnabledChange: (enabled: boolean) => void;
  onHudLayoutPresetChange: (preset: HudLayoutPreset) => void;
  onHudSizeChange: (size: HudSize) => void;
  onHudPinnedChange: (pinned: boolean) => void;
  onSaveLayout: (name: string) => void;
  onLoadLayout: (name: string) => void;
  onDeleteLayout: (name: string) => void;
  hudTransitionPreset: HudTransitionPreset;
  setHudTransitionPreset: (preset: HudTransitionPreset) => void;
  hudMiniMode: boolean;
  setHudMiniMode: (enabled: boolean) => void;
  hudAutoHide: boolean;
  setHudAutoHide: (enabled: boolean) => void;
  hudAutoHideDelay: number;
  setHudAutoHideDelay: (delay: number) => void;
  hudThemeVariant: HudThemeVariant;
  setHudThemeVariant: (variant: HudThemeVariant) => void;
}

export function ThemeHudControls({
  hudOpacity,
  hudBlur,
  showHud,
  hudPreset,
  hudAnimationsEnabled,
  hudLayoutPreset,
  hudSize,
  hudPinned,
  savedLayouts,
  onHudOpacityChange,
  onHudBlurChange,
  onShowHudChange,
  onHudPresetChange,
  onHudAnimationsEnabledChange,
  onHudLayoutPresetChange,
  onHudSizeChange,
  onHudPinnedChange,
  onSaveLayout,
  onLoadLayout,
  onDeleteLayout,
  hudTransitionPreset,
  setHudTransitionPreset,
  hudMiniMode,
  setHudMiniMode,
  hudAutoHide,
  setHudAutoHide,
  hudAutoHideDelay,
  setHudAutoHideDelay,
  hudThemeVariant,
  setHudThemeVariant,
}: ThemeHudControlsProps) {
  const [localOpacity, setLocalOpacity] = useState(hudOpacity);
  const [localBlur, setLocalBlur] = useState(hudBlur);
  const [localWidth, setLocalWidth] = useState(hudSize.width);
  const [localHeight, setLocalHeight] = useState(hudSize.height);
  const [layoutName, setLayoutName] = useState('');
  const { toast } = useToast();

  const presets: Array<{ mode: HudPresetMode; label: string }> = [
    { mode: 'minimal', label: 'Minimal' },
    { mode: 'standard', label: 'Standard' },
    { mode: 'full', label: 'Full' },
  ];

  const layoutPresets: Array<{ mode: HudLayoutPreset; label: string }> = [
    { mode: 'top-right', label: 'Top Right' },
    { mode: 'bottom-right', label: 'Bottom Right' },
    { mode: 'bottom-left', label: 'Bottom Left' },
    { mode: 'center', label: 'Center' },
  ];

  const handleSaveLayout = () => {
    if (!layoutName.trim()) {
      toast({ title: 'Enter a name', description: 'Please enter a name for the layout', variant: 'destructive' });
      return;
    }
    onSaveLayout(layoutName.trim());
    setLayoutName('');
    toast({ title: 'Layout saved', description: `"${layoutName}" saved successfully` });
  };

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
                Quick presets for HUD appearance. Keyboard: <Kbd>Ctrl+H</Kbd> to toggle.
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

            <div className="space-y-3 pt-3 border-t border-border/30">
              <Label className="text-sm font-medium text-foreground/90">Layout Position</Label>
              <div className="grid grid-cols-2 gap-2">
                {layoutPresets.map((preset, idx) => (
                  <Button
                    key={preset.mode}
                    type="button"
                    variant={hudLayoutPreset === preset.mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onHudLayoutPresetChange(preset.mode)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Shortcuts: <Kbd>Ctrl+1</Kbd> <Kbd>Ctrl+2</Kbd> <Kbd>Ctrl+3</Kbd> <Kbd>Ctrl+4</Kbd>
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/30">
              <Label className="text-sm font-medium text-foreground/90">Panel Size</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hud-width" className="text-sm text-muted-foreground">
                    Width
                  </Label>
                  <span className="font-mono text-xs text-muted-foreground">{localWidth}px</span>
                </div>
                <Slider
                  id="hud-width"
                  min={300}
                  max={800}
                  step={20}
                  value={[localWidth]}
                  onValueChange={([value]) => {
                    setLocalWidth(value);
                    onHudSizeChange({ width: value, height: localHeight });
                  }}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <Label htmlFor="hud-height" className="text-sm text-muted-foreground">
                    Height
                  </Label>
                  <span className="font-mono text-xs text-muted-foreground">{localHeight}px</span>
                </div>
                <Slider
                  id="hud-height"
                  min={400}
                  max={1000}
                  step={20}
                  value={[localHeight]}
                  onValueChange={([value]) => {
                    setLocalHeight(value);
                    onHudSizeChange({ width: localWidth, height: value });
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 p-3">
              <div className="flex items-center gap-2">
                <Pin className="h-4 w-4 text-primary" />
                <Label htmlFor="hud-pinned" className="text-sm font-medium text-foreground/90">
                  Pin Panel
                </Label>
              </div>
              <Switch 
                id="hud-pinned" 
                checked={hudPinned} 
                onCheckedChange={onHudPinnedChange} 
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-border/30">
              <Label className="text-sm font-medium text-foreground/90">Save Custom Layout</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Layout name..."
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveLayout()}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveLayout}
                  disabled={!layoutName.trim()}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {savedLayouts.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-border/30">
                <Label className="text-sm font-medium text-foreground/90">Saved Layouts</Label>
                <div className="space-y-2">
                  {savedLayouts.map((layout) => (
                    <div
                      key={layout.name}
                      className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 p-2"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onLoadLayout(layout.name)}
                        className="flex-1 justify-start"
                      >
                        {layout.name}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onDeleteLayout(layout.name);
                          toast({ title: 'Layout deleted', description: `"${layout.name}" removed` });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-3 border-t border-border/30">
              <Label className="text-sm font-medium text-foreground/90">Transition Preset</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['smooth', 'instant', 'bouncy', 'slow'] as const).map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={hudTransitionPreset === preset ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHudTransitionPreset(preset)}
                    className="capitalize"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/30">
              <Label className="text-sm font-medium text-foreground/90">Theme Variant</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['default', 'minimal', 'tactical', 'glass', 'solid'] as const).map((variant) => (
                  <Button
                    key={variant}
                    type="button"
                    variant={hudThemeVariant === variant ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHudThemeVariant(variant)}
                    className="capitalize"
                  >
                    {variant}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 p-3">
              <Label htmlFor="hud-mini-mode" className="text-sm font-medium text-foreground/90">
                Mini Mode
              </Label>
              <Switch
                id="hud-mini-mode"
                checked={hudMiniMode}
                onCheckedChange={setHudMiniMode}
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-border/30">
              <div className="flex items-center justify-between">
                <Label htmlFor="hud-auto-hide" className="text-sm font-medium text-foreground/90">
                  Auto-Hide
                </Label>
                <Switch
                  id="hud-auto-hide"
                  checked={hudAutoHide}
                  onCheckedChange={setHudAutoHide}
                />
              </div>
              {hudAutoHide && (
                <div className="space-y-2">
                  <Label htmlFor="hud-auto-hide-delay" className="text-sm font-medium text-muted-foreground">
                    Delay: {hudAutoHideDelay}ms
                  </Label>
                  <Slider
                    id="hud-auto-hide-delay"
                    min={1000}
                    max={10000}
                    step={500}
                    value={[hudAutoHideDelay]}
                    onValueChange={([value]) => setHudAutoHideDelay(value)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
