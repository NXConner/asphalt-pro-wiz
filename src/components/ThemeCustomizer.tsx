import { Palette, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ThemeAccessibilityPanel } from '@/components/theme/ThemeAccessibilityPanel';
import { ThemeDesignTokensPanel } from '@/components/theme/ThemeDesignTokensPanel';
import { ThemeFoundationShowcase } from '@/components/theme/ThemeFoundationShowcase';
import { ThemeHudControls } from '@/components/theme/ThemeHudControls';
import { ThemeHueControls } from '@/components/theme/ThemeHueControls';
import { ThemeMissionPresets } from '@/components/theme/ThemeMissionPresets';
import { ThemePreview } from '@/components/theme/ThemePreview';
import { ThemeShowcase } from '@/components/theme/ThemeShowcase';
import { ThemeWallpaperManager } from '@/components/theme/ThemeWallpaperManager';
import { ThemeWallpaperSynth } from '@/components/theme/ThemeWallpaperSynth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { blobToDataUrl } from '@/lib/blob';
import { DESIGN_SYSTEM, groupThemePresets } from '@/lib/designSystem';
import type { ThemeName } from '@/lib/theme';
import { useWallpaperLibrary } from '@/modules/layout/wallpaperLibrary';
import { DEFAULT_WALLPAPER } from '@/modules/layout/wallpapers';

export function ThemeCustomizer() {
  const {
    preferences,
    setMode,
    setTheme,
    setPrimaryHue,
    setAccentHue,
    setUseHueOverride,
    setUseAccentOverride,
    setRadius,
    setWallpaper,
    setWallpaperOpacity,
    setWallpaperBlur,
    setHighContrast,
    setHudOpacity,
    setHudBlur,
    setShowHud,
    setHudPreset,
    setHudAnimationsEnabled,
    setHudLayoutPreset,
    setHudSize,
    setHudPinned,
    saveCustomLayout,
    loadCustomLayout,
    deleteCustomLayout,
    setHudTransitionPreset,
    setHudMiniMode,
    setHudAutoHide,
    setHudAutoHideDelay,
    setHudThemeVariant,
    setHudProximityEffect,
    setHudProximityDistance,
    setHudAlertAnimation,
    setHudQuickShortcuts,
    saveHudProfile,
    loadHudProfile,
    deleteHudProfile,
    setHudGridSnap,
    setHudGridSize,
    setHudCollisionDetection,
    setHudAnimationPreset,
    setHudGestureSensitivity,
    setHudMultiMonitorStrategy,
    setHudKeyboardNavigation,
    randomizePalette,
    reset,
  } = useTheme();
  const { optimizeImage } = useImageOptimization();
  const { builtin, custom, addWallpaper, removeWallpaper, getById } = useWallpaperLibrary();

  const themeGroups = useMemo(() => groupThemePresets(), []);

  const [localHue, setLocalHue] = useState(preferences.primaryHue);
  const [localAccentHue, setLocalAccentHue] = useState(preferences.accentHue);
  const [localRadius, setLocalRadius] = useState(preferences.radius);
  const [localOpacity, setLocalOpacity] = useState(preferences.wallpaperOpacity);
  const [localBlur, setLocalBlur] = useState(preferences.wallpaperBlur);
  const [localHudOpacity, setLocalHudOpacity] = useState(preferences.hudOpacity);
  const [localHudBlur, setLocalHudBlur] = useState(preferences.hudBlur);
  const [activeWallpaperId, setActiveWallpaperId] = useState<string | null>(
    preferences.wallpaperId ?? DEFAULT_WALLPAPER.id,
  );

  useEffect(() => {
    setLocalHue(preferences.primaryHue);
    setLocalAccentHue(preferences.accentHue);
    setLocalRadius(preferences.radius);
    setLocalOpacity(preferences.wallpaperOpacity);
    setLocalBlur(preferences.wallpaperBlur);
    setLocalHudOpacity(preferences.hudOpacity);
    setLocalHudBlur(preferences.hudBlur);
    setActiveWallpaperId(preferences.wallpaperId ?? DEFAULT_WALLPAPER.id);
  }, [preferences]);

  const handlePresetSelect = useCallback(
    (presetId: ThemeName) => {
      setTheme(presetId);
    },
    [setTheme],
  );

  const handleWallpaperSelect = useCallback(
    (asset: Parameters<typeof setWallpaper>[0]) => {
      if (!asset) return;
      if (typeof asset === 'string') {
        setWallpaper(asset);
        return;
      }
      if ('id' in asset) {
        setActiveWallpaperId(asset.id ?? null);
      }
      setWallpaper(asset);
    },
    [setWallpaper],
  );

  const handleWallpaperUpload = useCallback(
    async ({
      file,
      name,
      tone,
    }: {
      file: File;
      name?: string;
      tone: Parameters<typeof addWallpaper>[0]['accentTone'];
    }) => {
      const optimizedBlob = await optimizeImage(file, {
        maxWidth: 2560,
        maxHeight: 1440,
        quality: 0.82,
        format: 'webp',
      });
      const dataUrl = await blobToDataUrl(optimizedBlob);
      const asset = addWallpaper({
        name: name ?? file.name,
        dataUrl,
        accentTone: tone,
        description: 'Custom wallpaper upload',
      });
      handleWallpaperSelect({
        id: asset.id,
        source: asset.source,
        name: asset.name,
        description: asset.description,
      });
    },
    [addWallpaper, handleWallpaperSelect, optimizeImage],
  );

  const handleWallpaperRemove = useCallback(
    (id: string) => {
      removeWallpaper(id);
      if (preferences.wallpaperId === id) {
        const fallback = getById(DEFAULT_WALLPAPER.id) ?? DEFAULT_WALLPAPER;
        handleWallpaperSelect({
          id: fallback.id,
          source: 'builtin',
          name: fallback.name,
          description: fallback.description,
        });
      }
    },
    [getById, handleWallpaperSelect, preferences.wallpaperId, removeWallpaper],
  );

  const handleWallpaperSynthesize = useCallback(
    async ({
      name,
      gradient,
      tone,
      description,
    }: {
      name: string;
      gradient: string;
      tone: Parameters<typeof addWallpaper>[0]['accentTone'];
      description?: string;
    }) => {
      const asset = addWallpaper({
        name,
        dataUrl: gradient,
        accentTone: tone,
        description:
          description ??
          `Command Center synthesized ${tone} gradient generated ${new Date().toLocaleDateString()}`,
      });
      handleWallpaperSelect({
        id: asset.id,
        source: asset.source,
        name: asset.name,
        description: asset.description,
      });
    },
    [addWallpaper, handleWallpaperSelect],
  );

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleHudOpacityChange = useCallback(
    (value: number) => {
      setLocalHudOpacity(value);
      setHudOpacity(value);
    },
    [setHudOpacity],
  );

  const handleHudBlurChange = useCallback(
    (value: number) => {
      setLocalHudBlur(value);
      setHudBlur(value);
    },
    [setHudBlur],
  );

  const handleAccentHueChange = useCallback(
    (value: number) => {
      setLocalAccentHue(value);
      setAccentHue(value);
    },
    [setAccentHue],
  );

  const handleRandomizePalette = useCallback(() => {
    randomizePalette();
  }, [randomizePalette]);

  return (
    <Card className="border border-white/10 bg-slate-950/60 shadow-[0_40px_120px_rgba(8,12,24,0.6)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold uppercase tracking-[0.35em]">
          <Palette className="h-5 w-5" /> Theme Command Center
        </CardTitle>
        <CardDescription className="text-slate-200/70">
          Craft mission-ready palettes, wallpapers, and accessibility baselines across the Pavement
          Performance Suite.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        <ThemePreview />

        <ThemeShowcase limitPerGroup={3} />

        <ThemeFoundationShowcase />

        <ThemeMissionPresets
          groups={themeGroups}
          activeTheme={preferences.name}
          mode={preferences.mode}
          onModeChange={setMode}
          onSelectPreset={handlePresetSelect}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ThemeHueControls
            useHueOverride={preferences.useHueOverride}
            useAccentOverride={Boolean(preferences.useAccentOverride)}
            hue={localHue}
            accentHue={localAccentHue}
            radius={localRadius}
            highContrast={Boolean(preferences.highContrast)}
            onToggleHueOverride={setUseHueOverride}
            onHueChange={(value) => {
              setLocalHue(value);
              setPrimaryHue(value);
            }}
            onToggleAccentOverride={setUseAccentOverride}
            onAccentHueChange={handleAccentHueChange}
            onRadiusChange={(value) => {
              setLocalRadius(value);
              setRadius(value);
            }}
            onToggleHighContrast={setHighContrast}
            onRandomizePalette={handleRandomizePalette}
          />
          <ThemeHudControls
            hudOpacity={localHudOpacity}
            hudBlur={localHudBlur}
            showHud={preferences.showHud}
            hudPreset={preferences.hudPreset}
            hudAnimationsEnabled={preferences.hudAnimationsEnabled}
            hudLayoutPreset={preferences.hudLayoutPreset}
            hudSize={preferences.hudSize}
            hudPinned={preferences.hudPinned}
            savedLayouts={preferences.savedLayouts}
            onHudOpacityChange={handleHudOpacityChange}
            onHudBlurChange={handleHudBlurChange}
            onShowHudChange={setShowHud}
            onHudPresetChange={setHudPreset}
            onHudAnimationsEnabledChange={setHudAnimationsEnabled}
            onHudLayoutPresetChange={setHudLayoutPreset}
            onHudSizeChange={setHudSize}
            onHudPinnedChange={setHudPinned}
            onSaveLayout={saveCustomLayout}
            onLoadLayout={loadCustomLayout}
            onDeleteLayout={deleteCustomLayout}
            hudTransitionPreset={preferences.hudTransitionPreset}
            setHudTransitionPreset={setHudTransitionPreset}
            hudMiniMode={preferences.hudMiniMode}
            setHudMiniMode={setHudMiniMode}
            hudAutoHide={preferences.hudAutoHide}
            setHudAutoHide={setHudAutoHide}
            hudAutoHideDelay={preferences.hudAutoHideDelay}
            setHudAutoHideDelay={setHudAutoHideDelay}
            hudThemeVariant={preferences.hudThemeVariant}
            setHudThemeVariant={setHudThemeVariant}
            hudProximityEffect={preferences.hudProximityEffect}
            setHudProximityEffect={setHudProximityEffect}
            hudProximityDistance={preferences.hudProximityDistance}
            setHudProximityDistance={setHudProximityDistance}
            hudAlertAnimation={preferences.hudAlertAnimation}
            setHudAlertAnimation={setHudAlertAnimation}
            hudQuickShortcuts={preferences.hudQuickShortcuts}
            setHudQuickShortcuts={setHudQuickShortcuts}
            hudProfiles={preferences.hudProfiles}
            onSaveProfile={saveHudProfile}
            onLoadProfile={loadHudProfile}
            onDeleteProfile={deleteHudProfile}
            hudGridSnap={preferences.hudGridSnap}
            setHudGridSnap={setHudGridSnap}
            hudGridSize={preferences.hudGridSize}
            setHudGridSize={setHudGridSize}
            hudCollisionDetection={preferences.hudCollisionDetection}
            setHudCollisionDetection={setHudCollisionDetection}
            hudAnimationPreset={preferences.hudAnimationPreset}
            setHudAnimationPreset={setHudAnimationPreset}
            hudGestureSensitivity={preferences.hudGestureSensitivity}
            setHudGestureSensitivity={setHudGestureSensitivity}
            hudMultiMonitorStrategy={preferences.hudMultiMonitorStrategy}
            setHudMultiMonitorStrategy={setHudMultiMonitorStrategy}
            hudKeyboardNavigation={preferences.hudKeyboardNavigation}
            setHudKeyboardNavigation={setHudKeyboardNavigation}
            hudDisplayLayouts={preferences.hudDisplayLayouts}
          />
          <ThemeWallpaperManager
            builtin={builtin}
            custom={custom}
            activeWallpaperId={activeWallpaperId}
            opacity={localOpacity}
            blur={localBlur}
            onSelect={(asset) =>
              handleWallpaperSelect({
                id: asset.id,
                source: asset.source,
                name: asset.name,
                description: asset.description,
              })
            }
            onUpload={handleWallpaperUpload}
            onRemove={handleWallpaperRemove}
            onOpacityChange={(value) => {
              setLocalOpacity(value);
              setWallpaperOpacity(value);
            }}
            onBlurChange={(value) => {
              setLocalBlur(value);
              setWallpaperBlur(value);
            }}
          />
          <ThemeWallpaperSynth onCreate={handleWallpaperSynthesize} />
        </div>

        <ThemeDesignTokensPanel
          spacing={Object.entries(DESIGN_SYSTEM.spacing)}
          typography={Object.entries(DESIGN_SYSTEM.typography)}
          shadows={Object.entries(DESIGN_SYSTEM.shadows)}
          colors={['--primary', '--accent', '--secondary', '--background', '--foreground'].map(
            (key) => [key, DESIGN_SYSTEM.colors[key as keyof typeof DESIGN_SYSTEM.colors]],
          )}
        />

        <ThemeAccessibilityPanel />

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/80 p-4">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/70">
              Quick Reset
            </h4>
            <p className="text-xs text-slate-300/60">
              Restore the default Division Agent theme, wallpaper, and radii.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-orange-400/60 text-orange-200 hover:bg-orange-500/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Reset Theme
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
