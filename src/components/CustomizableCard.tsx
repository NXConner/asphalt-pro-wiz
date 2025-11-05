import { Settings2, Pin, PinOff, Trash2, Lock, Unlock } from 'lucide-react';
import { ReactNode, useMemo, useRef, useState, type CSSProperties } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { TacticalOverlay } from '@/components/hud/TacticalOverlay';
import { cn } from '@/lib/utils';

export interface CardStyle {
  // Backgrounds
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string; // for solid
  gradientFrom?: string; // for gradient
  gradientTo?: string; // for gradient
  gradientAngle?: number; // deg
  backgroundImage?: string; // data URL
  backgroundSize?: 'cover' | 'contain' | 'auto';

  // Effects
  blur?: number; // backdrop blur
  opacity?: number;
  shadowLevel?: number; // 0-5
  borderColor?: string;
  borderWidth?: number; // px
  borderRadius?: number; // px
  animation?: 'none' | 'pulse' | 'float' | 'glow' | 'shimmer';
  hoverLift?: boolean;
  accentColor?: string;
  hexOpacity?: number;
  showScanLines?: boolean;
  showGrid?: boolean;
  gridDensity?: number;
  cornerScale?: number;

  // Visual variants for future use
  layoutVariant?: 'default' | 'compact' | 'padded' | 'dense';
}

interface CustomizableCardProps {
  children: ReactNode;
  title?: string;
  cardId: string;
  isPinned?: boolean;
  onPin?: (pinned: boolean) => void;
  style?: CardStyle;
  onStyleChange?: (style: CardStyle) => void;
  className?: string;
  // Layout helpers wired by parent grid
  onResizePreset?: (w: number, h: number) => void;
  onLayoutFlagsChange?: (flags: {
    isDraggable?: boolean;
    isResizable?: boolean;
    static?: boolean;
  }) => void;
  // Customization lock (separate from movement lock)
  isCustomizationLocked?: boolean;
  onCustomizationLockToggle?: (locked: boolean) => void;
  // Movement lock indicator and toggle (affects drag/resize)
  isMovementLocked?: boolean;
  onMovementLockToggle?: (locked: boolean) => void;
}

export function CustomizableCard({
  children,
  title,
  cardId,
  isPinned = false,
  onPin,
  style = {},
  onStyleChange,
  className,
  onResizePreset,
  onLayoutFlagsChange,
  isCustomizationLocked = false,
  onCustomizationLockToggle,
  isMovementLocked = false,
  onMovementLockToggle,
}: CustomizableCardProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleStyleChange = (key: keyof CardStyle, value: any) => {
    onStyleChange?.({ ...style, [key]: value });
  };

  const computeBackground = () => {
    const type = style.backgroundType || 'solid';
    if (type === 'gradient') {
      const from = style.gradientFrom || 'hsl(var(--card))';
      const to = style.gradientTo || 'hsl(var(--secondary) / 0.4)';
      const angle = style.gradientAngle ?? 135;
      return { backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})` } as CSSProperties;
    }
    if (type === 'image' && style.backgroundImage) {
      return {
        backgroundImage: `url('${style.backgroundImage}')`,
        backgroundSize: style.backgroundSize || 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      } as CSSProperties;
    }
    return { backgroundColor: style.backgroundColor || 'hsl(var(--card))' } as CSSProperties;
  };

  const boxShadow = (() => {
    const level = style.shadowLevel ?? 0;
    switch (level) {
      case 1:
        return '0 4px 10px rgba(0,0,0,0.08)';
      case 2:
        return '0 6px 16px rgba(0,0,0,0.12)';
      case 3:
        return '0 10px 24px rgba(0,0,0,0.16)';
      case 4:
        return '0 14px 30px rgba(0,0,0,0.22)';
      case 5:
        return '0 18px 40px rgba(0,0,0,0.28)';
      default:
        return undefined;
    }
  })();

  const animationClass = (() => {
    switch (style.animation) {
      case 'float':
        return 'pps-anim-float';
      case 'glow':
        return 'pps-anim-glow';
      case 'shimmer':
        return 'pps-anim-shimmer';
      case 'pulse':
        return 'pps-anim-pulse';
      default:
        return undefined;
    }
  })();

  const accentColor = style.accentColor ?? 'rgba(255,145,0,0.82)';
  const computedBackground = useMemo(() => computeBackground(), [style.backgroundType, style.backgroundColor, style.gradientAngle, style.gradientFrom, style.gradientTo, style.backgroundImage, style.backgroundSize]);
  const backgroundTint =
    'backgroundColor' in computedBackground && computedBackground.backgroundColor
      ? computedBackground.backgroundColor
      : 'rgba(10,16,24,0.78)';

  const overlayStyle = useMemo(() => {
    const overlay: CSSProperties = {
      ...(computedBackground.backgroundImage ? computedBackground : {}),
      backdropFilter: style.blur ? `blur(${style.blur}px)` : undefined,
      opacity: style.opacity ?? 0.96,
      borderColor: style.borderColor ?? accentColor,
      borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
      borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
      boxShadow,
    };

    if (!computedBackground.backgroundImage && 'backgroundColor' in computedBackground) {
      // Preserve radial/gradient backgrounds handled by TacticalOverlay tint.
      delete (overlay as any).backgroundColor;
    }

    return overlay;
  }, [computedBackground, style.blur, style.opacity, style.borderColor, style.borderWidth, style.borderRadius, boxShadow, accentColor]);

  const hexPatternStyle = useMemo<CSSProperties | undefined>(() => {
    const opacity = style.hexOpacity ?? 0.18;
    if (opacity <= 0) return undefined;

    return {
      backgroundImage:
        `linear-gradient(120deg, transparent 12%, ${accentColor}16 12%, ${accentColor}16 15%, transparent 15%),` +
        `linear-gradient(240deg, transparent 12%, ${accentColor}12 12%, ${accentColor}12 15%, transparent 15%),` +
        `linear-gradient(0deg, transparent 12%, ${accentColor}10 12%, ${accentColor}10 15%, transparent 15%)`,
      backgroundSize: '28px 24px',
      backgroundPosition: '0 0, 0 0, 0 0',
      opacity,
    } satisfies CSSProperties;
  }, [accentColor, style.hexOpacity]);

  const showScanLines = style.showScanLines ?? true;
  const showGrid = style.showGrid ?? true;
  const gridDensity = style.gridDensity ?? 96;
  const cornerScale = style.cornerScale ?? 1;
  const cornerProps = useMemo(
    () => ({
      size: Math.max(28, Math.min(80, 42 * cornerScale)),
      thickness: Math.max(1.5, (style.borderWidth ?? 2) + 0.5),
      accentColor,
    }),
    [cornerScale, style.borderWidth, accentColor],
  );

  const contentLayoutClass = (() => {
    switch (style.layoutVariant) {
      case 'compact':
        return 'px-5 py-6 gap-4';
      case 'dense':
        return 'px-4 py-4 gap-3 text-sm';
      case 'padded':
        return 'px-9 py-10 gap-6';
      case 'default':
      default:
        return 'px-8 py-8 gap-5';
    }
  })();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await toDataUrl(file);
    onStyleChange?.({ ...style, backgroundType: 'image', backgroundImage: dataUrl });
    if (fileRef.current) fileRef.current.value = '';
  };

    const clearImage = () => {
      onStyleChange?.({ ...style, backgroundImage: undefined, backgroundType: 'solid' });
      if (fileRef.current) fileRef.current.value = '';
    };

    return (
      <TacticalOverlay
        className={cn(
          'pps-tactical-card relative min-h-[220px] transition-all duration-300',
          style.hoverLift &&
            'hover:-translate-y-1 hover:shadow-[0_32px_68px_rgba(255,145,0,0.22)]',
          animationClass,
          className,
        )}
        accentColor={accentColor}
        backgroundTint={backgroundTint}
        showGrid={showGrid}
        gridOpacity={showGrid ? 0.24 : 0}
        gridDensity={gridDensity}
        showScanLines={showScanLines}
        scanLinesProps={{
          opacity: showScanLines ? (style.animation === 'shimmer' ? 0.55 : 0.42) : 0,
          speedMs: style.animation === 'shimmer' ? 2600 : 3600,
        }}
        cornerProps={cornerProps}
        pulse={style.animation === 'glow' || style.animation === 'pulse'}
        style={overlayStyle}
      >
        {hexPatternStyle ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={hexPatternStyle}
          />
        ) : null}
        <div
          className="absolute inset-x-0 bottom-0 h-[120px] bg-gradient-to-t from-black/35 via-transparent to-transparent"
          aria-hidden
        />
        <div className="relative z-20 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {title ? (
                <h3 className="font-display text-xl uppercase tracking-[0.18em] text-slate-50">
                  {title}
                </h3>
              ) : null}
            </div>
            <div className="flex gap-1">
              {onMovementLockToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  onClick={() => onMovementLockToggle(!isMovementLocked)}
                  title={isMovementLocked ? 'Unlock move/resize' : 'Lock move/resize'}
                >
                  {isMovementLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
              )}
              {onPin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  onClick={() => onPin(!isPinned)}
                >
                  {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                </Button>
              )}
              {onCustomizationLockToggle && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  onClick={() => onCustomizationLockToggle(!isCustomizationLocked)}
                  title={isCustomizationLocked ? 'Unlock customization' : 'Lock customization'}
                >
                  {isCustomizationLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
              )}
                <Popover
                  open={isCustomizationLocked ? false : isCustomizing}
                  onOpenChange={(open) => !isCustomizationLocked && setIsCustomizing(open)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                      disabled={isCustomizationLocked}
                      title={isCustomizationLocked ? 'Customization locked' : 'Customize card'}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] bg-slate-950/95 text-slate-100" align="end">
                    <div className="space-y-4">
                      <header className="space-y-1">
                        <h4 className="font-semibold text-sm uppercase tracking-[0.2em] text-orange-300/80">
                          Customize {title || 'Card'}
                        </h4>
                        <p className="text-xs text-slate-300/70">
                          Fine-tune HUD presentation, textures, and motion.
                        </p>
                      </header>

                      <div className="space-y-2">
                        <Label className="text-xs">Background Type</Label>
                        <Select
                          value={style.backgroundType || 'solid'}
                          onValueChange={(v) =>
                            handleStyleChange('backgroundType', v as CardStyle['backgroundType'])
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">Solid</SelectItem>
                            <SelectItem value="gradient">Gradient</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(style.backgroundType ?? 'solid') === 'solid' && (
                        <div className="space-y-2">
                          <Label className="text-xs">Background Color</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={style.backgroundColor || '#101520'}
                              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                              className="h-8 w-10 border rounded"
                              aria-label="Background color"
                            />
                            <div className="grid grid-cols-6 gap-2">
                              {[
                                '#0f172a',
                                '#111827',
                                '#1e293b',
                                '#f97316',
                                'rgba(8,12,24,0.8)',
                                'transparent',
                              ].map((color) => (
                                <button
                                  key={color}
                                  className="h-8 rounded border border-white/10"
                                  style={{
                                    background: color,
                                    outline:
                                      style.backgroundColor === color
                                        ? '2px solid rgba(249,115,22,0.75)'
                                        : 'none',
                                  }}
                                  onClick={() => handleStyleChange('backgroundColor', color)}
                                  aria-label={`Set color ${color}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {style.backgroundType === 'gradient' && (
                        <div className="space-y-2">
                          <Label className="text-xs">Gradient</Label>
                          <div className="grid grid-cols-2 gap-2 items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">From</span>
                              <input
                                type="color"
                                value={style.gradientFrom || '#111827'}
                                onChange={(e) => handleStyleChange('gradientFrom', e.target.value)}
                                className="h-8 w-10 border rounded"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">To</span>
                              <input
                                type="color"
                                value={style.gradientTo || '#f97316'}
                                onChange={(e) => handleStyleChange('gradientTo', e.target.value)}
                                className="h-8 w-10 border rounded"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Angle: {style.gradientAngle ?? 135}°</Label>
                            <Slider
                              value={[style.gradientAngle ?? 135]}
                              onValueChange={([v]) => handleStyleChange('gradientAngle', v)}
                              min={0}
                              max={360}
                              step={5}
                            />
                          </div>
                        </div>
                      )}

                      {style.backgroundType === 'image' && (
                        <div className="space-y-2">
                          <Label htmlFor="card-bg-image" className="text-xs">
                            Background Image
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="card-bg-image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                            />
                            {style.backgroundImage && (
                              <Button variant="ghost" size="sm" onClick={clearImage} title="Clear image">
                                <Trash2 className="mr-1 h-4 w-4" /> Clear
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Image Fit</Label>
                            <Select
                              value={style.backgroundSize || 'cover'}
                              onValueChange={(v) =>
                                handleStyleChange('backgroundSize', v as 'cover' | 'contain' | 'auto')
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cover">Cover</SelectItem>
                                <SelectItem value="contain">Contain</SelectItem>
                                <SelectItem value="auto">Auto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-xs">Blur Effect: {style.blur || 0}px</Label>
                        <Slider
                          value={[style.blur || 0]}
                          onValueChange={([v]) => handleStyleChange('blur', v)}
                          max={20}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">
                          Opacity: {Math.round((style.opacity ?? 1) * 100)}%
                        </Label>
                        <Slider
                          value={[(style.opacity ?? 1) * 100]}
                          onValueChange={([v]) => handleStyleChange('opacity', v / 100)}
                          max={100}
                          step={5}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Border Width: {style.borderWidth || 0}px</Label>
                          <Slider
                            value={[style.borderWidth || 0]}
                            onValueChange={([v]) => handleStyleChange('borderWidth', v)}
                            max={8}
                            step={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Corner Scale: {cornerScale.toFixed(1)}×</Label>
                          <Slider
                            value={[cornerScale * 10]}
                            onValueChange={([v]) =>
                              handleStyleChange('cornerScale', Number((v / 10).toFixed(1)))
                            }
                            min={5}
                            max={18}
                            step={1}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Accent / Border Color</Label>
                          <input
                            type="color"
                            value={style.borderColor || accentColor}
                            onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                            className="h-8 w-full border rounded"
                            aria-label="Border color"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Glow Accent</Label>
                          <input
                            type="color"
                            value={style.accentColor || accentColor}
                            onChange={(e) => handleStyleChange('accentColor', e.target.value)}
                            className="h-8 w-full border rounded"
                            aria-label="Accent color"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Hex Mesh Opacity: {Math.round((style.hexOpacity ?? 0.18) * 100)}%</Label>
                        <Slider
                          value={[Math.round((style.hexOpacity ?? 0.18) * 100)]}
                          onValueChange={([v]) =>
                            handleStyleChange('hexOpacity', Number((v / 100).toFixed(2)))
                          }
                          min={0}
                          max={60}
                          step={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Border Radius: {style.borderRadius || 0}px</Label>
                        <Slider
                          value={[style.borderRadius || 0]}
                          onValueChange={([v]) => handleStyleChange('borderRadius', v)}
                          max={24}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Shadow Level: {style.shadowLevel ?? 0}</Label>
                        <Slider
                          value={[style.shadowLevel ?? 0]}
                          onValueChange={([v]) => handleStyleChange('shadowLevel', v)}
                          max={5}
                          step={1}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Show Grid</Label>
                          <Switch
                            checked={showGrid}
                            onCheckedChange={(checked) => handleStyleChange('showGrid', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Scan Lines</Label>
                          <Switch
                            checked={showScanLines}
                            onCheckedChange={(checked) =>
                              handleStyleChange('showScanLines', checked)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Grid Density: {gridDensity}px</Label>
                        <Slider
                          value={[gridDensity]}
                          onValueChange={([v]) => handleStyleChange('gridDensity', v)}
                          min={48}
                          max={160}
                          step={8}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Animation</Label>
                          <Select
                            value={style.animation || 'none'}
                            onValueChange={(v) =>
                              handleStyleChange('animation', v as CardStyle['animation'])
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="pulse">Pulse</SelectItem>
                              <SelectItem value="float">Float</SelectItem>
                              <SelectItem value="glow">Glow</SelectItem>
                              <SelectItem value="shimmer">Shimmer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between mt-6">
                          <Label className="text-xs">Hover Lift</Label>
                          <Switch
                            checked={!!style.hoverLift}
                            onCheckedChange={(checked) => handleStyleChange('hoverLift', checked)}
                          />
                        </div>
                      </div>

                      {(onResizePreset || onLayoutFlagsChange) && (
                        <div className="border-t pt-3 space-y-3">
                          {onResizePreset && (
                            <div className="space-y-2">
                              <Label className="text-xs">Quick Size</Label>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="secondary" onClick={() => onResizePreset(4, 6)}>
                                  Small
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => onResizePreset(6, 8)}>
                                  Medium
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => onResizePreset(8, 12)}>
                                  Large
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => onResizePreset(4, 12)}>
                                  Tall
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => onResizePreset(10, 6)}>
                                  Wide
                                </Button>
                              </div>
                            </div>
                          )}
                          {onLayoutFlagsChange && (
                            <div className="grid grid-cols-3 gap-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Draggable</Label>
                                <Switch
                                  onCheckedChange={(checked) =>
                                    onLayoutFlagsChange({ isDraggable: checked })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Resizable</Label>
                                <Switch
                                  onCheckedChange={(checked) =>
                                    onLayoutFlagsChange({ isResizable: checked })
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Lock</Label>
                                <Switch
                                  onCheckedChange={(checked) => onLayoutFlagsChange({ static: checked })}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    </PopoverContent>
                  </Popover>
              </div>
            </div>
            <div className={cn('flex flex-col text-slate-100/85', contentLayoutClass)}>
              {children}
            </div>
          </div>
        </TacticalOverlay>
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
