import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout, Save } from 'lucide-react';
import { toast } from 'sonner';

export interface CardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface LayoutPreset {
  name: string;
  layouts: CardLayout[];
  styles: Record<string, any>;
}

const DEFAULT_PRESETS: LayoutPreset[] = [
  {
    name: 'Standard',
    layouts: [
      { i: 'map', x: 0, y: 0, w: 12, h: 8, minW: 6, minH: 6 },
      { i: 'details', x: 0, y: 8, w: 8, h: 12, minW: 4, minH: 8 },
      { i: 'weather', x: 8, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
      { i: 'premium', x: 8, y: 14, w: 4, h: 6, minW: 3, minH: 4 },
    ],
    styles: {},
  },
  {
    name: 'Compact',
    layouts: [
      { i: 'map', x: 0, y: 0, w: 8, h: 6, minW: 6, minH: 6 },
      { i: 'weather', x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
      { i: 'details', x: 0, y: 6, w: 12, h: 10, minW: 4, minH: 8 },
      { i: 'premium', x: 0, y: 16, w: 12, h: 6, minW: 3, minH: 4 },
    ],
    styles: {},
  },
  {
    name: 'Split View',
    layouts: [
      { i: 'map', x: 0, y: 0, w: 6, h: 10, minW: 6, minH: 6 },
      { i: 'details', x: 6, y: 0, w: 6, h: 10, minW: 4, minH: 8 },
      { i: 'weather', x: 0, y: 10, w: 6, h: 6, minW: 3, minH: 4 },
      { i: 'premium', x: 6, y: 10, w: 6, h: 6, minW: 3, minH: 4 },
    ],
    styles: {},
  },
];

interface CardLayoutManagerProps {
  currentLayouts: CardLayout[];
  currentStyles: Record<string, any>;
  onLayoutChange: (layouts: CardLayout[]) => void;
  onStylesChange: (styles: Record<string, any>) => void;
}

export function CardLayoutManager({
  currentLayouts,
  currentStyles,
  onLayoutChange,
  onStylesChange,
}: CardLayoutManagerProps) {
  const [presets, setPresets] = useState<LayoutPreset[]>(DEFAULT_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState('Standard');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('layout-presets');
    if (saved) {
      try {
        setPresets([...DEFAULT_PRESETS, ...JSON.parse(saved)]);
      } catch (e) {
        console.error('Failed to load saved presets', e);
      }
    }
  }, []);

  const handleLoadPreset = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (preset) {
      onLayoutChange(preset.layouts);
      onStylesChange(preset.styles);
      setSelectedPreset(presetName);
      toast.success(`Loaded "${presetName}" layout`);
    }
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    const newPreset: LayoutPreset = {
      name: newPresetName,
      layouts: currentLayouts,
      styles: currentStyles,
    };

    const customPresets = presets.filter((p) => !DEFAULT_PRESETS.find((dp) => dp.name === p.name));
    const updatedCustom = [...customPresets, newPreset];
    
    localStorage.setItem('layout-presets', JSON.stringify(updatedCustom));
    setPresets([...DEFAULT_PRESETS, ...updatedCustom]);
    setSelectedPreset(newPresetName);
    setNewPresetName('');
    setSaveDialogOpen(false);
    toast.success(`Saved layout as "${newPresetName}"`);
  };

  return (
    <div className="flex items-center gap-2">
      <Layout className="h-4 w-4" />
      <Select value={selectedPreset} onValueChange={handleLoadPreset}>
        <SelectTrigger className="w-40">
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
            <Button onClick={handleSavePreset} className="w-full">
              Save Preset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}