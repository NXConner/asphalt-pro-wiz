import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, UploadCloud, X } from "lucide-react";
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
} from "@/lib/theme";
import { Switch } from "@/components/ui/switch";

export function ThemeCustomizer() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [primaryHueLocal, setPrimaryHueLocal] = useState(210);
  const [themeName, setThemeNameLocal] = useState<ThemeName>("default");
  const [radius, setRadiusLocal] = useState(8);
  const [opacity, setOpacityLocal] = useState(0.25);
  const [blur, setBlurLocal] = useState(0);
  const [hasWallpaper, setHasWallpaper] = useState(false);
  const [useHueOverride, setUseHueOverrideLocal] = useState(false);

  useEffect(() => {
    const prefs = loadThemePreferences();
    setPrimaryHueLocal(prefs.primaryHue);
    setThemeNameLocal(prefs.name);
    setRadiusLocal(prefs.radius);
    setOpacityLocal(prefs.wallpaperOpacity);
    setBlurLocal(prefs.wallpaperBlur);
    setHasWallpaper(!!prefs.wallpaperDataUrl);
    setUseHueOverrideLocal(!!prefs.useHueOverride);
    applyThemePreferences(prefs);
  }, []);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await toDataUrl(file);
    setWallpaper(dataUrl);
    setHasWallpaper(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearWallpaper = () => {
    setWallpaper("");
    setHasWallpaper(false);
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
