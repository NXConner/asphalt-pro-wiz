import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Layout, Save, Star, RefreshCcw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { logEvent } from "@/lib/logging";

export interface CardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  // Per-item layout controls (override global GridLayout props)
  isDraggable?: boolean;
  isResizable?: boolean;
  static?: boolean;
}

export interface LayoutPreset {
  name: string;
  layouts: CardLayout[];
  styles: Record<string, any>;
}

const DEFAULT_PRESETS: LayoutPreset[] = [
  {
    name: "Optimized",
    layouts: [
      // Prioritize location first, details alongside, then actions
      { i: "map", x: 0, y: 0, w: 8, h: 10, minW: 6, minH: 6 },
      { i: "details", x: 8, y: 0, w: 4, h: 18, minW: 4, minH: 8 },
      { i: "premium", x: 0, y: 10, w: 8, h: 10, minW: 3, minH: 4 },
      { i: "weather", x: 8, y: 18, w: 4, h: 6, minW: 3, minH: 4 },
    ],
    styles: {},
  },
  {
    name: "Standard",
    layouts: [
      { i: "map", x: 0, y: 0, w: 12, h: 8, minW: 6, minH: 6 },
      { i: "details", x: 0, y: 8, w: 8, h: 12, minW: 4, minH: 8 },
      { i: "weather", x: 8, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
      { i: "premium", x: 8, y: 14, w: 4, h: 6, minW: 3, minH: 4 },
    ],
    styles: {},
  },
  {
    name: "Compact",
    layouts: [
      { i: "map", x: 0, y: 0, w: 8, h: 6, minW: 6, minH: 6 },
      { i: "weather", x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
      { i: "details", x: 0, y: 6, w: 12, h: 10, minW: 4, minH: 8 },
      { i: "premium", x: 0, y: 16, w: 12, h: 6, minW: 3, minH: 4 },
    ],
    styles: {},
  },
  {
    name: "Split View",
    layouts: [
      { i: "map", x: 0, y: 0, w: 6, h: 10, minW: 6, minH: 6 },
      { i: "details", x: 6, y: 0, w: 6, h: 10, minW: 4, minH: 8 },
      { i: "weather", x: 0, y: 10, w: 6, h: 6, minW: 3, minH: 4 },
      { i: "premium", x: 6, y: 10, w: 6, h: 6, minW: 3, minH: 4 },
    ],
    styles: {},
  },
];

interface CardLayoutManagerProps {
  currentLayouts: CardLayout[];
  currentStyles: Record<string, any>;
  onLayoutChange: (layouts: CardLayout[]) => void;
  onStylesChange: (styles: Record<string, any>) => void;
  // Optional: manage visible cards and global lock from here
  availableCards?: { id: string; label: string }[];
  visibleCardIds?: string[];
  onVisibleCardsChange?: (ids: string[]) => void;
  globalLock?: boolean;
  onGlobalLockChange?: (locked: boolean) => void;
}

export function CardLayoutManager({
  currentLayouts,
  currentStyles,
  onLayoutChange,
  onStylesChange,
  availableCards,
  visibleCardIds,
  onVisibleCardsChange,
  globalLock = false,
  onGlobalLockChange,
}: CardLayoutManagerProps) {
  const [presets, setPresets] = useState<LayoutPreset[]>(DEFAULT_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState("Optimized");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [manageCardsOpen, setManageCardsOpen] = useState(false);

  useEffect(() => {
    // Load custom presets and apply default on first mount
    const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    let nextPresets: LayoutPreset[] = DEFAULT_PRESETS;

    if (isBrowser) {
      const saved = window.localStorage.getItem("layout-presets");
      if (saved) {
        try {
          const parsed: LayoutPreset[] = JSON.parse(saved);
          // Sanitize parsed presets to avoid malformed entries
          const sanitized = Array.isArray(parsed)
            ? parsed.filter(
                (p) =>
                  p &&
                  typeof p.name === "string" &&
                  Array.isArray(p.layouts) &&
                  typeof p.styles === "object",
              )
            : [];
          nextPresets = [...DEFAULT_PRESETS, ...sanitized];
        } catch (e) {
          console.error("Failed to load saved presets", e);
        }
      }

      setPresets(nextPresets);

      // Determine which preset to auto-load
      const defaultName = window.localStorage.getItem("layout-default-preset") || "Optimized";
      const fallbackName = nextPresets.find((p) => p.name === defaultName)
        ? defaultName
        : "Optimized";
      const preset = nextPresets.find((p) => p.name === fallbackName);
      if (preset) {
        onLayoutChange(preset.layouts);
        onStylesChange(preset.styles);
        setSelectedPreset(fallbackName);
        logEvent("loaded_default_preset", { preset: fallbackName });
      }
    } else {
      // Non-browser environment: keep defaults without touching storage
      setPresets(nextPresets);
      const preset = nextPresets.find((p) => p.name === "Optimized");
      if (preset) {
        onLayoutChange(preset.layouts);
        onStylesChange(preset.styles);
        setSelectedPreset("Optimized");
      }
    }
  }, [onLayoutChange, onStylesChange]);

  const handleLoadPreset = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (preset) {
      onLayoutChange(preset.layouts);
      onStylesChange(preset.styles);
      setSelectedPreset(presetName);
      logEvent("loaded_preset", { preset: presetName });
      toast.success(`Loaded "${presetName}" layout`);
    }
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }

    const trimmedName = newPresetName.trim();
    const defaultNames = new Set(DEFAULT_PRESETS.map((dp) => dp.name));
    if (defaultNames.has(trimmedName)) {
      toast.error("This preset name is reserved. Choose a different name.");
      return;
    }

    const newPreset: LayoutPreset = {
      name: trimmedName,
      layouts: currentLayouts,
      styles: currentStyles,
    };

    // Collect currently saved custom presets (exclude defaults)
    const customPresets = presets.filter((p) => !defaultNames.has(p.name));
    // Replace any existing custom preset with the same name instead of duplicating
    const withoutSameName = customPresets.filter((p) => p.name !== trimmedName);
    const updatedCustom = [...withoutSameName, newPreset];

    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        window.localStorage.setItem("layout-presets", JSON.stringify(updatedCustom));
      }
    } catch (e) {
      console.error("Failed to save presets", e);
      toast.error("Failed to save presets. Storage may be unavailable.");
      return;
    }

    setPresets([...DEFAULT_PRESETS, ...updatedCustom]);
    setSelectedPreset(trimmedName);
    setNewPresetName("");
    setSaveDialogOpen(false);

    if (saveAsDefault) {
      try {
        if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
          window.localStorage.setItem("layout-default-preset", newPreset.name);
        }
        logEvent("set_default_preset", { preset: newPreset.name, source: "save_preset" });
      } catch (e) {
        console.error("Failed to set default preset", e);
        toast.error("Failed to set default preset.");
      }
    }
    setSaveAsDefault(false);
    logEvent("saved_preset", { preset: newPreset.name });
    toast.success(`Saved layout as "${trimmedName}"`);
  };

  const handleSetDefault = () => {
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        window.localStorage.setItem("layout-default-preset", selectedPreset);
      }
      logEvent("set_default_preset", { preset: selectedPreset, source: "set_button" });
      toast.success(`Set "${selectedPreset}" as default`);
    } catch (e) {
      console.error("Failed to set default preset", e);
      toast.error("Failed to set default preset.");
    }
  };

  const handleResetDefault = () => {
    const fallback = "Optimized";
    try {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        window.localStorage.setItem("layout-default-preset", fallback);
      }
    } catch (e) {
      console.error("Failed to reset default preset", e);
      toast.error("Failed to reset default preset.");
    }
    handleLoadPreset(fallback);
    logEvent("reset_default_preset", { preset: fallback });
  };

  return (
    <div className="flex items-center gap-2">
      <Layout className="h-4 w-4" />
      <Select value={selectedPreset} onValueChange={handleLoadPreset}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Select layout" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.name} value={preset.name}>
              {preset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={handleSetDefault}>
        <Star className="h-4 w-4 mr-1" />
        Set Default
      </Button>
      <Button variant="ghost" size="icon" onClick={handleResetDefault} title="Reset to default">
        <RefreshCcw className="h-4 w-4" />
      </Button>

      {typeof onGlobalLockChange === "function" && (
        <div className="flex items-center gap-2 pl-2 border-l">
          <Label className="text-xs">Lock Layout</Label>
          <Switch checked={!!globalLock} onCheckedChange={(v) => onGlobalLockChange(Boolean(v))} />
        </div>
      )}

      {availableCards && onVisibleCardsChange && (
        <Dialog open={manageCardsOpen} onOpenChange={setManageCardsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-1" />
              Manage Cards
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Visible Cards</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {availableCards.map((card) => {
                const checked = !!visibleCardIds?.includes(card.id);
                return (
                  <div key={card.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`card-${card.id}`}
                      checked={checked}
                      onCheckedChange={(v) => {
                        const isChecked = Boolean(v);
                        const next = new Set(visibleCardIds || []);
                        if (isChecked) next.add(card.id);
                        else next.delete(card.id);
                        onVisibleCardsChange(Array.from(next));
                      }}
                    />
                    <Label htmlFor={`card-${card.id}`}>{card.label}</Label>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-1" />
            Save Layout
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Layout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="My Custom Layout"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="set-default"
                checked={saveAsDefault}
                onCheckedChange={(v) => setSaveAsDefault(Boolean(v))}
              />
              <Label htmlFor="set-default">Use as default after saving</Label>
            </div>
            <Button onClick={handleSavePreset} className="w-full">
              Save Preset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
