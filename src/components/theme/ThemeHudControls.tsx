import { Monitor, Zap, Pin, Save, Trash2, Radio, Bell, Layers } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { HudPresetMode, HudLayoutPreset, SavedHudLayout, HudSize, HudTransitionPreset, HudThemeVariant, HudAlertAnimation, HudConfigurationProfile } from '@/lib/theme';
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
  hudProximityEffect: boolean;
  setHudProximityEffect: (enabled: boolean) => void;
  hudProximityDistance: number;
  setHudProximityDistance: (distance: number) => void;
  hudAlertAnimation: HudAlertAnimation;
  setHudAlertAnimation: (animation: HudAlertAnimation) => void;
  hudQuickShortcuts: boolean;
  setHudQuickShortcuts: (enabled: boolean) => void;
  hudProfiles: HudConfigurationProfile[];
  onSaveProfile: (name: string) => void;
  onLoadProfile: (name: string) => void;
  onDeleteProfile: (name: string) => void;
  hudGridSnap: boolean;
  setHudGridSnap: (enabled: boolean) => void;
  hudGridSize: number;
  setHudGridSize: (size: number) => void;
  hudCollisionDetection: boolean;
  setHudCollisionDetection: (enabled: boolean) => void;
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
  hudProximityEffect,
  setHudProximityEffect,
  hudProximityDistance,
  setHudProximityDistance,
  hudAlertAnimation,
  setHudAlertAnimation,
  hudQuickShortcuts,
  setHudQuickShortcuts,
  hudProfiles,
  onSaveProfile,
  onLoadProfile,
  onDeleteProfile,
  hudGridSnap,
  setHudGridSnap,
  hudGridSize,
  setHudGridSize,
  hudCollisionDetection,
  setHudCollisionDetection,
}: ThemeHudControlsProps) {
  const [localOpacity, setLocalOpacity] = useState(hudOpacity);
  const [localBlur, setLocalBlur] = useState(hudBlur);
  const [localWidth, setLocalWidth] = useState(hudSize.width);
  const [localHeight, setLocalHeight] = useState(hudSize.height);
  const [layoutName, setLayoutName] = useState('');
  const [profileName, setProfileName] = useState('');
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

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      toast({ title: 'Enter a name', description: 'Please enter a name for the profile', variant: 'destructive' });
      return;
    }
    onSaveProfile(profileName.trim());
    setProfileName('');
    toast({ title: 'Profile saved', description: `"${profileName}" saved successfully` });
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

            <div className="space-y-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-3">
                <Radio className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium text-foreground/90">Proximity Effect</Label>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 p-3">
                <Label htmlFor="hud-proximity" className="text-sm font-medium text-foreground/90">
                  Enable Proximity
                </Label>
                <Switch
                  id="hud-proximity"
                  checked={hudProximityEffect}
                  onCheckedChange={setHudProximityEffect}
                />
              </div>
              {hudProximityEffect && (
                <div className="space-y-2">
                  <Label htmlFor="hud-proximity-distance" className="text-sm font-medium text-muted-foreground">
                    Distance: {hudProximityDistance}px
                  </Label>
                  <Slider
                    id="hud-proximity-distance"
                    min={50}
                    max={300}
                    step={10}
                    value={[hudProximityDistance]}
                    onValueChange={([value]) => setHudProximityDistance(value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium text-foreground/90">Alert Animation</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['pulse', 'shake', 'slide', 'bounce', 'glow', 'none'] as const).map((anim) => (
                  <Button
                    key={anim}
                    type="button"
                    variant={hudAlertAnimation === anim ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHudAlertAnimation(anim)}
                    className="capitalize"
                  >
                    {anim}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 p-3">
              <Label htmlFor="hud-quick-shortcuts" className="text-sm font-medium text-foreground/90">
                Quick Shortcuts
              </Label>
              <Switch
                id="hud-quick-shortcuts"
                checked={hudQuickShortcuts}
                onCheckedChange={setHudQuickShortcuts}
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium text-foreground/90">Configuration Profiles</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Profile name..."
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                  className="flex-1"
                  aria-label="Profile name"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={!profileName.trim()}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              {hudProfiles.length > 0 && (
                <div className="space-y-2">
                  {hudProfiles.map((profile) => (
                    <div
                      key={profile.name}
                      className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 p-2"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onLoadProfile(profile.name)}
                        className="flex-1 justify-start"
                      >
                        {profile.name}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onDeleteProfile(profile.name);
                          toast({ title: 'Profile deleted', description: `"${profile.name}" removed` });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grid & Collision */}
            <div className="space-y-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium text-foreground/90">Grid & Collision</Label>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="hud-grid-snap" className="text-sm font-medium text-foreground/90">
                    Grid Snapping
                  </Label>
                  <p className="text-xs text-muted-foreground">Snap to grid when dragging</p>
                </div>
                <Switch
                  id="hud-grid-snap"
                  checked={hudGridSnap}
                  onCheckedChange={setHudGridSnap}
                />
              </div>
              
              {hudGridSnap && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hud-grid-size" className="text-sm font-medium text-foreground/90">
                      Grid Size: {hudGridSize}px
                    </Label>
                  </div>
                  <Slider
                    id="hud-grid-size"
                    value={[hudGridSize]}
                    onValueChange={([value]) => setHudGridSize(value)}
                    min={10}
                    max={50}
                    step={5}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="hud-collision" className="text-sm font-medium text-foreground/90">
                    Collision Detection
                  </Label>
                  <p className="text-xs text-muted-foreground">Prevent off-screen positioning</p>
                </div>
                <Switch
                  id="hud-collision"
                  checked={hudCollisionDetection}
                  onCheckedChange={setHudCollisionDetection}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
