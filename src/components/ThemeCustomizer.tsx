import { Palette, UploadCloud, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  applyThemePreferences,
  getDefaultPreferences,
  loadThemePreferences,
  saveThemePreferences,
  setPrimaryHue,
  setRadius,
  setThemeName,
  setWallpaper,
  setWallpaperBlur,
  setWallpaperOpacity,
  type ThemeName,
} from '@/lib/theme';
import { cn } from '@/lib/utils';
import { CANVAS_WALLPAPERS } from '@/modules/layout/wallpapers';

export function ThemeCustomizer() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [primaryHueLocal, setPrimaryHueLocal] = useState(210);
  const [themeName, setThemeNameLocal] = useState<ThemeName>('division-agent');
  const [radius, setRadiusLocal] = useState(8);
  const [opacity, setOpacityLocal] = useState(0.25);
  const [blur, setBlurLocal] = useState(0);
  const [hasWallpaper, setHasWallpaper] = useState(false);
  const [useHueOverride, setUseHueOverrideLocal] = useState(false);
  const [wallpaperPresetId, setWallpaperPresetId] = useState<string | null>(null);
  const wallpaperOptions = useMemo(() => CANVAS_WALLPAPERS, []);

  useEffect(() => {
    const prefs = loadThemePreferences();
    setPrimaryHueLocal(prefs.primaryHue);
    setThemeNameLocal(prefs.name);
    setRadiusLocal(prefs.radius);
    setOpacityLocal(prefs.wallpaperOpacity);
    setBlurLocal(prefs.wallpaperBlur);
    setHasWallpaper(!!prefs.wallpaperDataUrl);
    setUseHueOverrideLocal(!!prefs.useHueOverride);
    const presetMatch = wallpaperOptions.find((option) => option.gradient === prefs.wallpaperDataUrl);
    setWallpaperPresetId(presetMatch?.id ?? null);
    applyThemePreferences(prefs);
  }, [wallpaperOptions]);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await toDataUrl(file);
    setWallpaper(dataUrl);
    setHasWallpaper(true);
    setWallpaperPresetId(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const clearWallpaper = () => {
    setWallpaper('');
    setHasWallpaper(false);
    setWallpaperPresetId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customizer
        </CardTitle>
        <CardDescription>Advanced theming and wallpaper</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Theme</Label>
              <Select
                value={themeName}
                onValueChange={(v: ThemeName) => {
                  setThemeNameLocal(v);
                  setThemeName(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="division-agent">Division Agent — Signature</SelectItem>
                  <SelectItem value="division-rogue">Division Rogue — Hostile</SelectItem>
                  <SelectItem value="division-darkzone">Division Dark Zone — Alert</SelectItem>
                  <SelectItem value="division-tech">Division Tech — Specialist</SelectItem>
                  <SelectItem value="division-stealth">Division Stealth — Night Ops</SelectItem>
                  <SelectItem value="division-combat">Division Combat — Engagement</SelectItem>
                  <SelectItem value="division-tactical">Division Tactical — Command</SelectItem>
                  <SelectItem value="division-hunter">Division Hunter — Protocol</SelectItem>
                  <SelectItem value="default" disabled>
                    — Legacy Themes —
                  </SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="emerald">Emerald</SelectItem>
                  <SelectItem value="sunset">Sunset</SelectItem>
                  <SelectItem value="royal">Royal</SelectItem>
                  <SelectItem value="crimson">Crimson</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                  <SelectItem value="ocean">Ocean</SelectItem>
                  <SelectItem value="amber">Amber</SelectItem>
                  <SelectItem value="mono">Monochrome</SelectItem>
                  <SelectItem value="cyber">Cyber</SelectItem>
                </SelectContent>
              </Select>

            <div className="flex items-center justify-between">
              <Label htmlFor="override-hue">Use Hue Override</Label>
              <Switch
                id="override-hue"
                checked={useHueOverride}
                onCheckedChange={(checked) => {
                  setUseHueOverrideLocal(checked);
                  const prefs = loadThemePreferences();
                  prefs.useHueOverride = checked;
                  saveThemePreferences(prefs);
                  applyThemePreferences(prefs);
                }}
              />
            </div>

            <Label htmlFor="primary-hue">Primary Hue ({primaryHueLocal}°)</Label>
            <input
              id="primary-hue"
              type="range"
              min="0"
              max="360"
              value={primaryHueLocal}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setPrimaryHueLocal(v);
                setPrimaryHue(v);
              }}
              className="w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
            />

            <Label htmlFor="radius">Radius ({radius}px)</Label>
            <input
              id="radius"
              type="range"
              min="0"
              max="24"
              value={radius}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setRadiusLocal(v);
                setRadius(v);
              }}
              className="w-full"
            />
            </div>

            <div className="space-y-3">
              <Label>Preset Atmospheres</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {wallpaperOptions.map((option) => {
                  const active = wallpaperPresetId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setWallpaper(option.gradient);
                        setWallpaperPresetId(option.id);
                        setHasWallpaper(true);
                      }}
                      className={cn(
                        'relative overflow-hidden rounded-[var(--hud-radius-md)] border px-3 py-4 text-left shadow-md transition-transform duration-300 hover:-translate-y-1',
                        active
                          ? 'border-orange-400/60 shadow-[0_18px_35px_rgba(255,128,0,0.25)]'
                          : 'border-white/15 bg-white/5',
                      )}
                      style={{ background: option.gradient }}
                    >
                      <span className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" aria-hidden />
                      <span className="relative flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-100/80">
                          {option.name}
                        </span>
                        <span className="text-[0.65rem] text-slate-200/65">{option.description}</span>
                      </span>
                      {active ? (
                        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(255,128,0,0.6)]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <Label htmlFor="wallpaper-upload">Wallpaper</Label>
              <div className="flex items-center gap-2">
                <Input id="wallpaper-upload" ref={fileRef} type="file" accept="image/*" onChange={handleWallpaper} />
                <UploadCloud className="w-5 h-5" />
                {hasWallpaper && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearWallpaper}>
                    <X className="w-4 h-4 mr-1" /> Clear
                  </Button>
                )}
              </div>
              <Label htmlFor="opacity">Wallpaper Opacity ({Math.round(opacity * 100)}%)</Label>
              <input
                id="opacity"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setOpacityLocal(v);
                  setWallpaperOpacity(v);
                }}
                className="w-full"
              />
              <Label htmlFor="blur">Wallpaper Blur ({blur}px)</Label>
              <input
                id="blur"
                type="range"
                min="0"
                max="30"
                value={blur}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setBlurLocal(v);
                  setWallpaperBlur(v);
                }}
                className="w-full"
              />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
