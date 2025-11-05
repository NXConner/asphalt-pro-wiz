import {
  Droplet,
  Palette,
  RefreshCw,
  Sparkles,
  Trash2,
  UploadCloud,
  MonitorCog,
  Rainbow,
  Contrast,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ThemeSwatch } from '@/components/ui/theme-swatch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { DESIGN_SYSTEM, listThemePresets, type ThemePresetMeta } from '@/lib/designSystem';
import type { ThemeMode } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useWallpaperLibrary, type WallpaperAsset } from '@/modules/layout/wallpaperLibrary';
import { DEFAULT_WALLPAPER } from '@/modules/layout/wallpapers';
import type { CanvasTone } from '@/modules/layout/CanvasPanel';

const toneOptions: CanvasTone[] = ['dusk', 'aurora', 'ember', 'lagoon'];
const modeOptions: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function ThemeCustomizer() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const {
    preferences,
    setMode,
    setTheme,
    setPrimaryHue,
    setUseHueOverride,
    setRadius,
    setWallpaper,
    setWallpaperOpacity,
    setWallpaperBlur,
    setHighContrast,
    reset,
  } = useTheme();
  const { builtin, custom, addWallpaper, removeWallpaper, getById } = useWallpaperLibrary();

  const divisionThemes = useMemo(() => listThemePresets('division'), []);
  const legacyThemes = useMemo(() => listThemePresets('legacy'), []);

  const [localHue, setLocalHue] = useState(preferences.primaryHue);
  const [localRadius, setLocalRadius] = useState(preferences.radius);
  const [localOpacity, setLocalOpacity] = useState(preferences.wallpaperOpacity);
  const [localBlur, setLocalBlur] = useState(preferences.wallpaperBlur);
  const [uploadTone, setUploadTone] = useState<CanvasTone>('dusk');
  const [uploadName, setUploadName] = useState('');
  const [activeWallpaperId, setActiveWallpaperId] = useState<string>(
    preferences.wallpaperId ?? DEFAULT_WALLPAPER.id,
  );

  useEffect(() => {
    setLocalHue(preferences.primaryHue);
    setLocalRadius(preferences.radius);
    setLocalOpacity(preferences.wallpaperOpacity);
    setLocalBlur(preferences.wallpaperBlur);
    setActiveWallpaperId(preferences.wallpaperId ?? DEFAULT_WALLPAPER.id);
  }, [preferences]);

  const handleThemeSelect = (preset: ThemePresetMeta) => {
    setTheme(preset.id);
  };

  const handleWallpaperSelect = (asset: WallpaperAsset) => {
    setActiveWallpaperId(asset.id);
    setWallpaper({ id: asset.id, source: asset.source, name: asset.name, description: asset.description });
  };

  const handleWallpaperUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await toDataUrl(file);
    const asset = addWallpaper({
      name: uploadName.trim() || file.name,
      dataUrl,
      accentTone: uploadTone,
      description: 'Custom wallpaper upload',
    });
    setUploadName('');
    if (fileRef.current) fileRef.current.value = '';
    handleWallpaperSelect(asset);
  };

  const handleWallpaperRemove = (id: string) => {
    removeWallpaper(id);
    const isActive = preferences.wallpaperId === id;
    if (isActive) {
      const fallback = getById(DEFAULT_WALLPAPER.id) ?? DEFAULT_WALLPAPER;
      handleWallpaperSelect({
        ...fallback,
        dataUrl: fallback.gradient,
        source: 'builtin',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleReset = () => {
    reset();
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Card className="border border-white/10 bg-slate-950/60 shadow-[0_40px_120px_rgba(8,12,24,0.6)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold uppercase tracking-[0.35em]">
          <Palette className="h-5 w-5" />
          Theme Command Center
        </CardTitle>
        <CardDescription className="text-slate-200/70">
          Tune mission-ready palettes, wallpapers, and accessibility baselines across the Pavement Performance Suite.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        <section className="space-y-5">
          <header className="flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-slate-200/70">
                <Sparkles className="h-4 w-4" /> Mission Themes
              </h3>
              <p className="text-xs text-slate-300/60">
                Pick a preset or craft your hue override for church-campus operations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="theme-mode" className="text-xs uppercase tracking-[0.3em] text-slate-300/60">
                Visual Mode
              </Label>
              <Select value={preferences.mode} onValueChange={(value: ThemeMode) => setMode(value)}>
                <SelectTrigger id="theme-mode" className="w-36 border-white/20 bg-slate-900/70">
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
            <ThemeGroup title="Division Protocol" description="Immersive SHD-grade palettes" presets={divisionThemes} activeTheme={preferences.name} onSelect={handleThemeSelect} />
            <ThemeGroup title="Legacy Palettes" description="Classic contractor themes" presets={legacyThemes} activeTheme={preferences.name} onSelect={handleThemeSelect} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-white/10 bg-slate-950/70 p-5">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/60">
                  <Rainbow className="h-4 w-4" /> Hue Override
                </div>
                <Switch
                  checked={preferences.useHueOverride}
                  onCheckedChange={setUseHueOverride}
                  aria-label="Toggle hue override"
                />
              </header>
              <div className="space-y-3">
                <Label htmlFor="primary-hue" className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60">
                  <span>Primary Hue</span>
                  <span>{localHue}°</span>
                </Label>
                <input
                  id="primary-hue"
                  type="range"
                  min={0}
                  max={360}
                  value={localHue}
                  onChange={(event) => {
                    const value = Number.parseInt(event.target.value, 10);
                    setLocalHue(value);
                    setPrimaryHue(value);
                  }}
                  disabled={!preferences.useHueOverride}
                  className="h-2 w-full cursor-pointer rounded-full bg-gradient-to-r from-rose-500 via-emerald-400 to-sky-500"
                />
                {!preferences.useHueOverride ? (
                  <p className="text-xs text-slate-300/60">
                    Enable hue override to blend the current theme with custom brand tones.
                  </p>
                ) : null}
              </div>

              <div className="space-y-3">
                <Label htmlFor="radius" className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60">
                  <span>Corner Radius</span>
                  <span>{localRadius}px</span>
                </Label>
                <input
                  id="radius"
                  type="range"
                  min={0}
                  max={24}
                  value={localRadius}
                  onChange={(event) => {
                    const value = Number.parseInt(event.target.value, 10);
                    setLocalRadius(value);
                    setRadius(value);
                  }}
                  className="h-2 w-full cursor-pointer rounded-full bg-slate-700/80"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/60 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-300/60">
                  <Contrast className="h-4 w-4" /> High Contrast
                </div>
                <Switch
                  checked={!!preferences.highContrast}
                  onCheckedChange={setHighContrast}
                  aria-label="Toggle high contrast theme"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-white/10 bg-slate-950/70 p-5">
              <header className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/60">
                <MonitorCog className="h-4 w-4" /> Wallpaper Atmospheres
              </header>

              <div className="grid gap-3 sm:grid-cols-2">
                {builtin.map((asset) => {
                  const active = activeWallpaperId === asset.id;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleWallpaperSelect(asset)}
                      className={cn(
                        'group relative overflow-hidden rounded-lg border p-3 text-left transition-transform duration-300 hover:-translate-y-1',
                        active
                          ? 'border-orange-400/70 shadow-[0_18px_40px_rgba(255,128,0,0.35)]'
                          : 'border-white/10 bg-white/5',
                      )}
                      style={{ background: asset.dataUrl }}
                    >
                      <span className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" aria-hidden />
                      <span className="relative flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-100/80">
                          {asset.name}
                        </span>
                        <span className="text-[0.65rem] text-slate-200/65">
                          {asset.description}
                        </span>
                      </span>
                      {active ? (
                        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(255,128,0,0.6)]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <Label htmlFor="wallpaper-upload" className="text-xs uppercase tracking-[0.3em] text-slate-300/60">
                  Upload custom wallpaper
                </Label>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <Input
                    value={uploadName}
                    onChange={(event) => setUploadName(event.target.value)}
                    placeholder="Call sign (optional)"
                    className="border-white/10 bg-slate-900/80 text-xs"
                  />
                  <Select value={uploadTone} onValueChange={(value: CanvasTone) => setUploadTone(value)}>
                    <SelectTrigger className="w-32 border-white/10 bg-slate-900/80 text-xs uppercase tracking-[0.3em]">
                      <SelectValue placeholder="Tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((tone) => (
                        <SelectItem key={tone} value={tone} className="capitalize">
                          {tone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="border border-white/10" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="wallpaper-upload"
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleWallpaperUpload}
                    className="border-white/10 bg-slate-900/80 text-xs"
                  />
                  <UploadCloud className="h-5 w-5 text-slate-200/70" />
                </div>

                {custom.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300/60">Custom uploads</p>
                    <div className="grid gap-2">
                      {custom.map((asset) => {
                        const active = asset.id === activeWallpaperId;
                        return (
                          <div
                            key={asset.id}
                            className={cn(
                              'flex items-center justify-between gap-3 rounded-lg border p-3 text-xs shadow-sm',
                              active ? 'border-orange-400/50 bg-orange-400/10' : 'border-white/10 bg-slate-900/60',
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => handleWallpaperSelect(asset)}
                              className="flex-1 text-left"
                            >
                              <span className="block font-semibold uppercase tracking-[0.3em] text-slate-100/80">
                                {asset.name}
                              </span>
                              <span className="block text-[0.65rem] text-slate-300/60">
                                {asset.description}
                              </span>
                            </button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-rose-300/80 hover:bg-rose-500/20"
                              onClick={() => handleWallpaperRemove(asset.id)}
                              aria-label={`Remove ${asset.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3 pt-2">
                  <Label htmlFor="wallpaper-opacity" className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60">
                    <span>Opacity</span>
                    <span>{Math.round(localOpacity * 100)}%</span>
                  </Label>
                  <input
                    id="wallpaper-opacity"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={localOpacity}
                    onChange={(event) => {
                      const value = Number.parseFloat(event.target.value);
                      setLocalOpacity(value);
                      setWallpaperOpacity(value);
                    }}
                    className="h-2 w-full cursor-pointer rounded-full bg-slate-700/80"
                  />
                  <Label htmlFor="wallpaper-blur" className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60">
                    <span>Atmosphere Blur</span>
                    <span>{localBlur}px</span>
                  </Label>
                  <input
                    id="wallpaper-blur"
                    type="range"
                    min={0}
                    max={30}
                    value={localBlur}
                    onChange={(event) => {
                      const value = Number.parseInt(event.target.value, 10);
                      setLocalBlur(value);
                      setWallpaperBlur(value);
                    }}
                    className="h-2 w-full cursor-pointer rounded-full bg-slate-700/80"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-white/10 bg-slate-950/70 p-5">
          <header className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/60">
            <Droplet className="h-4 w-4" /> Design System Snapshot
          </header>
          <div className="grid gap-4 sm:grid-cols-3">
            <TokenPanel title="Spacing" tokens={Object.entries(DESIGN_SYSTEM.spacing)} formatter={(value) => `${value}px`} />
            <TokenPanel title="Typography" tokens={Object.entries(DESIGN_SYSTEM.typography).slice(0, 6)} formatter={(value) => value} />
            <TokenPanel title="Shadows" tokens={Object.entries(DESIGN_SYSTEM.shadows)} formatter={(value) => value} />
          </div>
        </section>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/80 p-4">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/70">Quick Reset</h4>
            <p className="text-xs text-slate-300/60">Restore the default Division Agent theme, wallpaper, and radii.</p>
          </div>
          <Button variant="outline" onClick={handleReset} className="border-orange-400/60 text-orange-200 hover:bg-orange-500/10">
            <RefreshCw className="mr-2 h-4 w-4" /> Reset Theme
          </Button>
        </div>
      </CardContent>
    </Card>
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
        <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/70">{title}</h4>
        <p className="text-xs text-slate-300/60">{description}</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {presets.map((preset) => (
          <ThemeSwatch
            key={preset.id}
            preset={preset}
            active={preset.id === activeTheme}
            onSelect={() => onSelect(preset)}
          />
        ))}
      </div>
    </div>
  );
}

interface TokenPanelProps {
  title: string;
  tokens: Array<[string, number | string]>;
  formatter: (value: number | string) => string;
}

function TokenPanel({ title, tokens, formatter }: TokenPanelProps) {
  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-slate-900/70 p-3">
      <h5 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/70">
        {title}
      </h5>
      <ul className="space-y-1 text-[0.65rem] text-slate-300/60">
        {tokens.map(([key, value]) => (
          <li key={key} className="flex items-center justify-between gap-3">
            <span className="uppercase tracking-[0.3em] text-slate-400/70">{key}</span>
            <span className="font-mono text-[0.6rem] text-slate-200/70">{formatter(value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (event) => reject(event);
    reader.readAsDataURL(file);
  });
}
