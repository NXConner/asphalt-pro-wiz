import { ReactNode, useRef, useState, type CSSProperties } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings2, Pin, PinOff, Trash2, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardStyle {
  // Backgrounds
  backgroundType?: "solid" | "gradient" | "image";
  backgroundColor?: string; // for solid
  gradientFrom?: string; // for gradient
  gradientTo?: string; // for gradient
  gradientAngle?: number; // deg
  backgroundImage?: string; // data URL
  backgroundSize?: "cover" | "contain" | "auto";

  // Effects
  blur?: number; // backdrop blur
  opacity?: number;
  shadowLevel?: number; // 0-5
  borderColor?: string;
  borderWidth?: number; // px
  borderRadius?: number; // px
  animation?: "none" | "pulse" | "float" | "glow" | "shimmer";
  hoverLift?: boolean;

  // Visual variants for future use
  layoutVariant?: "default" | "compact" | "padded" | "dense";
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
    const type = style.backgroundType || "solid";
    if (type === "gradient") {
      const from = style.gradientFrom || "hsl(var(--card))";
      const to = style.gradientTo || "hsl(var(--secondary) / 0.4)";
      const angle = style.gradientAngle ?? 135;
      return { backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})` } as CSSProperties;
    }
    if (type === "image" && style.backgroundImage) {
      return {
        backgroundImage: `url('${style.backgroundImage}')`,
        backgroundSize: style.backgroundSize || "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      } as CSSProperties;
    }
    return { backgroundColor: style.backgroundColor || "hsl(var(--card))" } as CSSProperties;
  };

  const boxShadow = (() => {
    const level = style.shadowLevel ?? 0;
    switch (level) {
      case 1:
        return "0 4px 10px rgba(0,0,0,0.08)";
      case 2:
        return "0 6px 16px rgba(0,0,0,0.12)";
      case 3:
        return "0 10px 24px rgba(0,0,0,0.16)";
      case 4:
        return "0 14px 30px rgba(0,0,0,0.22)";
      case 5:
        return "0 18px 40px rgba(0,0,0,0.28)";
      default:
        return undefined;
    }
  })();

  const animationClass = (() => {
    switch (style.animation) {
      case "float":
        return "pps-anim-float";
      case "glow":
        return "pps-anim-glow";
      case "shimmer":
        return "pps-anim-shimmer";
      case "pulse":
        return "pps-anim-pulse";
      default:
        return undefined;
    }
  })();

  const cardStyle = {
    ...computeBackground(),
    backdropFilter: style.blur ? `blur(${style.blur}px)` : undefined,
    opacity: style.opacity ?? 1,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
    borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
    boxShadow,
  } as CSSProperties;

  const variantClass = (() => {
    switch (style.layoutVariant) {
      case "compact":
        return "pps-variant-compact";
      case "dense":
        return "pps-variant-dense";
      case "padded":
        return "pps-variant-spacious";
      case "default":
      default:
        return undefined;
    }
  })();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await toDataUrl(file);
    onStyleChange?.({ ...style, backgroundType: "image", backgroundImage: dataUrl });
    if (fileRef.current) fileRef.current.value = "";
  };

  const clearImage = () => {
    onStyleChange?.({ ...style, backgroundImage: undefined, backgroundType: "solid" });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card
      className={cn(
        "relative transition-all duration-300",
        style.hoverLift && "pps-hover-lift",
        animationClass,
        variantClass,
        className,
      )}
      style={cardStyle}
    >
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {onMovementLockToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onMovementLockToggle(!isMovementLocked)}
            title={isMovementLocked ? "Unlock move/resize" : "Lock move/resize"}
          >
            {isMovementLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
        )}
        {onPin && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPin(!isPinned)}>
            {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </Button>
        )}
        {onCustomizationLockToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onCustomizationLockToggle(!isCustomizationLocked)}
            title={isCustomizationLocked ? "Unlock customization" : "Lock customization"}
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
              className="h-7 w-7"
              disabled={isCustomizationLocked}
              title={isCustomizationLocked ? "Customization locked" : "Customize card"}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Customize {title || "Card"}</h4>

              <div className="space-y-2">
                <Label className="text-xs">Background Type</Label>
                <Select
                  value={style.backgroundType || "solid"}
                  onValueChange={(v) =>
                    handleStyleChange("backgroundType", v as CardStyle["backgroundType"])
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

              {(style.backgroundType ?? "solid") === "solid" && (
                <div className="space-y-2">
                  <Label className="text-xs">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.backgroundColor || "#ffffff"}
                      onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
                      className="h-8 w-10 border rounded"
                      aria-label="Background color"
                    />
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        "hsl(var(--card))",
                        "hsl(var(--primary) / 0.08)",
                        "hsl(var(--secondary) / 0.18)",
                        "hsl(var(--accent) / 0.18)",
                        "transparent",
                        "hsl(var(--background) / 0.6)",
                      ].map((color) => (
                        <button
                          key={color}
                          className="h-8 rounded border"
                          style={{
                            background: color,
                            outline:
                              style.backgroundColor === color
                                ? "2px solid hsl(var(--primary))"
                                : "none",
                          }}
                          onClick={() => handleStyleChange("backgroundColor", color)}
                          aria-label={`Set color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {style.backgroundType === "gradient" && (
                <div className="space-y-2">
                  <Label className="text-xs">Gradient</Label>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">From</span>
                      <input
                        type="color"
                        value={style.gradientFrom || "#1f2937"}
                        onChange={(e) => handleStyleChange("gradientFrom", e.target.value)}
                        className="h-8 w-10 border rounded"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">To</span>
                      <input
                        type="color"
                        value={style.gradientTo || "#0ea5e9"}
                        onChange={(e) => handleStyleChange("gradientTo", e.target.value)}
                        className="h-8 w-10 border rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Angle: {style.gradientAngle ?? 135}°</Label>
                    <Slider
                      value={[style.gradientAngle ?? 135]}
                      onValueChange={([v]) => handleStyleChange("gradientAngle", v)}
                      min={0}
                      max={360}
                      step={5}
                    />
                  </div>
                </div>
              )}

              {style.backgroundType === "image" && (
                <div className="space-y-2">
                  <Label htmlFor="card-bg-image" className="text-xs">Background Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="card-bg-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                    {style.backgroundImage && (
                      <Button variant="ghost" size="sm" onClick={clearImage} title="Clear image">
                        <Trash2 className="h-4 w-4 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Image Fit</Label>
                    <Select
                      value={style.backgroundSize || "cover"}
                      onValueChange={(v) =>
                        handleStyleChange("backgroundSize", v as "cover" | "contain" | "auto")
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
                  onValueChange={([v]) => handleStyleChange("blur", v)}
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
                  onValueChange={([v]) => handleStyleChange("opacity", v / 100)}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Border Width: {style.borderWidth || 0}px</Label>
                <Slider
                  value={[style.borderWidth || 0]}
                  onValueChange={([v]) => handleStyleChange("borderWidth", v)}
                  max={8}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Border Color</Label>
                <input
                  type="color"
                  value={style.borderColor || "#000000"}
                  onChange={(e) => handleStyleChange("borderColor", e.target.value)}
                  className="h-8 w-10 border rounded"
                  aria-label="Border color"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Border Radius: {style.borderRadius || 0}px</Label>
                <Slider
                  value={[style.borderRadius || 0]}
                  onValueChange={([v]) => handleStyleChange("borderRadius", v)}
                  max={24}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Shadow Level: {style.shadowLevel ?? 0}</Label>
                <Slider
                  value={[style.shadowLevel ?? 0]}
                  onValueChange={([v]) => handleStyleChange("shadowLevel", v)}
                  max={5}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs">Animation</Label>
                  <Select
                    value={style.animation || "none"}
                    onValueChange={(v) =>
                      handleStyleChange("animation", v as CardStyle["animation"])
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
                    onCheckedChange={(checked) => handleStyleChange("hoverLift", checked)}
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
      {children}
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
