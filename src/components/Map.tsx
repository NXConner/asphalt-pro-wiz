import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import GoogleMap from "@/components/map/GoogleMap";
import { loadMapSettings, saveMapSettings, type BaseLayerId } from "@/lib/mapSettings";

interface MapProps {
  onAddressUpdate: (coords: [number, number], address: string) => void;
  onAreaDrawn: (area: number) => void;
  onCrackLengthDrawn: (length: number) => void;
  customerAddress: string;
  refreshKey?: number;
}

const baseLayers: { id: BaseLayerId; label: string }[] = [
  { id: "google_roadmap", label: "Google Roadmap" },
  { id: "google_satellite", label: "Google Satellite" },
  { id: "google_terrain", label: "Google Terrain" },
  { id: "google_hybrid", label: "Google Hybrid" },
];

const Map = ({
  onAddressUpdate,
  onAreaDrawn,
  onCrackLengthDrawn,
  customerAddress,
  refreshKey,
}: MapProps) => {
  const [settings, setSettings] = useState(loadMapSettings());
  const [settingsKey, setSettingsKey] = useState(0);
  const [newOverlay, setNewOverlay] = useState<{
    name: string;
    type: "tile" | "wms";
    url: string;
    layers: string;
    attribution: string;
  }>({ name: "", type: "tile", url: "", layers: "", attribution: "" });

  const persist = (
    mut: (s: ReturnType<typeof loadMapSettings>) => ReturnType<typeof loadMapSettings>,
  ) => {
    const next = mut({ ...settings });
    setSettings(next);
    saveMapSettings(next);
    setSettingsKey((k) => k + 1);
  };

  const handleBaseChange = (value: BaseLayerId) => {
    persist((s) => ({ ...s, baseLayer: value }));
  };

  const handleOverlayVisible = (id: string, visible: boolean) => {
    persist((s) => ({
      ...s,
      overlays: s.overlays.map((o) => (o.id === id ? { ...o, visible } : o)),
    }));
  };

  const handleOverlayOpacity = (id: string, opacity: number) => {
    persist((s) => ({
      ...s,
      overlays: s.overlays.map((o) => (o.id === id ? { ...o, opacity } : o)),
    }));
  };

  const toggleRadar = (enabled: boolean) => {
    persist((s) => ({ ...s, radar: { ...s.radar, enabled } }));
  };

  const setRadarAnimate = (animate: boolean) => {
    persist((s) => ({ ...s, radar: { ...s.radar, animate } }));
  };

  const setRadarOpacity = (opacity: number) => {
    persist((s) => ({ ...s, radar: { ...s.radar, opacity } }));
  };

  const setRadarSpeed = (delayMs: number) => {
    persist((s) => ({
      ...s,
      radar: { ...s.radar, frameDelayMs: Math.max(50, Math.min(1000, delayMs)) },
    }));
  };

  const handleGoogleKeyChange = (value: string) => {
    persist((s) => ({ ...s, googleApiKey: value }));
  };

  const handleOpenWeatherKeyChange = (value: string) => {
    persist((s) => ({ ...s, openWeatherApiKey: value }));
  };

  const handleAddressUpdateWrapped = (coords: [number, number], address: string) => {
    onAddressUpdate(coords, address);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          <div>
            <Label>Base Layer</Label>
            <Select value={settings.baseLayer} onValueChange={(v: any) => handleBaseChange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {baseLayers.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Radar</Label>
              <Switch checked={settings.radar.enabled} onCheckedChange={toggleRadar} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Animate</span>
              <Switch checked={settings.radar.animate} onCheckedChange={setRadarAnimate} />
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Radar Opacity</span>
              <Slider
                value={[Math.round((settings.radar.opacity ?? 0.7) * 100)]}
                onValueChange={(v) => setRadarOpacity((v?.[0] ?? 70) / 100)}
                max={100}
                step={5}
              />
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Animation Speed (ms/frame)</span>
              <Slider
                value={[settings.radar.frameDelayMs ?? 250]}
                onValueChange={(v) => setRadarSpeed(v?.[0] ?? 250)}
                max={1000}
                min={50}
                step={50}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Google Maps API Key</Label>
            <Input
              value={settings.googleApiKey ?? ""}
              onChange={(e) => handleGoogleKeyChange(e.target.value)}
              placeholder="Enter API key"
            />
            <Label>OpenWeather API Key (optional)</Label>
            <Input
              value={settings.openWeatherApiKey ?? ""}
              onChange={(e) => handleOpenWeatherKeyChange(e.target.value)}
              placeholder="For richer weather"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {settings.overlays.map((o) => (
              <div key={o.id} className="p-2 border rounded">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{o.name}</div>
                  <Switch
                    checked={!!o.visible}
                    onCheckedChange={(v) => handleOverlayVisible(o.id, v)}
                  />
                </div>
                {o.type !== "radar" && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Opacity</span>
                    <Slider
                      value={[Math.round((o.opacity ?? 1) * 100)]}
                      onValueChange={(v) => handleOverlayOpacity(o.id, (v?.[0] ?? 100) / 100)}
                      max={100}
                      step={5}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-3 grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
            <div>
              <Label>Overlay Name</Label>
              <Input
                value={newOverlay.name}
                onChange={(e) => setNewOverlay({ ...newOverlay, name: e.target.value })}
                placeholder="e.g., Patrick County Parcels"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newOverlay.type}
                onValueChange={(v: any) => setNewOverlay({ ...newOverlay, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tile">Tile (XYZ / WMTS)</SelectItem>
                  <SelectItem value="wms">WMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>URL Template</Label>
              <Input
                value={newOverlay.url}
                onChange={(e) => setNewOverlay({ ...newOverlay, url: e.target.value })}
                placeholder="https://host/tiles/{z}/{x}/{y}.png or WMS endpoint"
              />
            </div>
            <div>
              <Label>WMS Layers</Label>
              <Input
                value={newOverlay.layers}
                onChange={(e) => setNewOverlay({ ...newOverlay, layers: e.target.value })}
                placeholder="e.g., Parcels"
              />
            </div>
            <div className="md:col-span-4">
              <Label>Attribution</Label>
              <Input
                value={newOverlay.attribution}
                onChange={(e) => setNewOverlay({ ...newOverlay, attribution: e.target.value })}
                placeholder="Data © County GIS"
              />
            </div>
            <div>
              <button
                type="button"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                onClick={() => {
                  if (!newOverlay.name || !newOverlay.url) return;
                  const id = newOverlay.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  persist((s) => ({
                    ...s,
                    overlays: [
                      ...s.overlays,
                      newOverlay.type === "wms"
                        ? {
                            id,
                            name: newOverlay.name,
                            type: "wms",
                            urlTemplate: newOverlay.url,
                            attribution: newOverlay.attribution || undefined,
                            opacity: 1,
                            visible: true,
                            wmsParams: {
                              layers: newOverlay.layers || "",
                              transparent: true,
                              format: "image/png",
                            },
                          }
                        : {
                            id,
                            name: newOverlay.name,
                            type: "tile",
                            urlTemplate: newOverlay.url,
                            attribution: newOverlay.attribution || undefined,
                            opacity: 1,
                            visible: true,
                          },
                    ],
                  }));
                  setNewOverlay({ name: "", type: "tile", url: "", layers: "", attribution: "" });
                }}
              >
                Add Overlay
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <GoogleMap
        key={`google-${settingsKey}`}
        customerAddress={customerAddress}
        onAddressUpdate={handleAddressUpdateWrapped}
        onAreaDrawn={onAreaDrawn}
        onCrackLengthDrawn={onCrackLengthDrawn}
        refreshKey={refreshKey}
      />
    </div>
  );
};

export default Map;
