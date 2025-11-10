import { Beaker, Wand2, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { CanvasTone } from '@/modules/layout/CanvasPanel';

const GRADIENT_TYPES = [
  { value: 'linear', label: 'Linear Sweep' },
  { value: 'radial', label: 'Radial Bloom' },
  { value: 'conic', label: 'Conic Orbit' },
] as const;

const TONE_OPTIONS: CanvasTone[] = ['dusk', 'aurora', 'ember', 'lagoon'];

const defaultColorTriplet = ['#ff6f3c', '#d22779', '#1aa6b7'];

interface ThemeWallpaperSynthProps {
  onCreate: (payload: {
    name: string;
    gradient: string;
    tone: CanvasTone;
    description?: string;
  }) => Promise<void> | void;
}

export function ThemeWallpaperSynth({ onCreate }: ThemeWallpaperSynthProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState<CanvasTone>('aurora');
  const [gradientType, setGradientType] = useState<(typeof GRADIENT_TYPES)[number]['value']>('linear');
  const [angle, setAngle] = useState(128);
  const [focus, setFocus] = useState(52);
  const [colors, setColors] = useState<string[]>(defaultColorTriplet);
  const [isSaving, setIsSaving] = useState(false);
  const [nameSuggestion, setNameSuggestion] = useState(generateCallSign());

  const gradientPreview = useMemo(() => {
    const [first, second, third] = colors;

    if (gradientType === 'radial') {
      const focusX = Math.min(90, Math.max(10, focus));
      const focusY = 100 - focusX;
      return `radial-gradient(circle at ${focusX}% ${focusY}%, ${first} 0%, ${second} 48%, ${third} 100%)`;
    }

    if (gradientType === 'conic') {
      const sweep = 90 + Math.round(focus / 2);
      return `conic-gradient(from ${angle}deg at 50% 50%, ${first} 0deg, ${second} ${sweep}deg, ${third} 360deg)`;
    }

    return `linear-gradient(${angle}deg, ${first} 0%, ${second} 48%, ${third} 100%)`;
  }, [angle, colors, focus, gradientType]);

  const handleColorChange = (index: number, value: string) => {
    setColors((prev) => {
      const next = prev.slice();
      next[index] = value;
      return next;
    });
  };

  const handleRandomize = () => {
    const randomType = GRADIENT_TYPES[Math.floor(Math.random() * GRADIENT_TYPES.length)].value;
    const nextColors = Array.from({ length: 3 }, () => randomHex());
    setGradientType(randomType);
    setColors(nextColors);
    setAngle(Math.floor(Math.random() * 361));
    setFocus(Math.floor(Math.random() * 80) + 10);
    setTone(TONE_OPTIONS[Math.floor(Math.random() * TONE_OPTIONS.length)]);
    setNameSuggestion(generateCallSign());
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setGradientType('linear');
    setColors(defaultColorTriplet);
    setAngle(128);
    setFocus(52);
    setTone('aurora');
    setNameSuggestion(generateCallSign());
  };

  const handleCreate = async () => {
    if (isSaving) return;
    const resolvedName = name.trim() || nameSuggestion;
    const details =
      description.trim() ||
      `${capitalize(gradientType)} gradient generated in Theme Command Center (${tone} tone).`;

    setIsSaving(true);
    try {
      await onCreate({
        name: resolvedName,
        gradient: gradientPreview,
        tone,
        description: details,
      });
      setName('');
      setDescription('');
      setNameSuggestion(generateCallSign());
    } catch (error) {
      console.error('[ThemeWallpaperSynth] Failed to deploy wallpaper', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      aria-labelledby="wallpaper-synth-heading"
      className="space-y-4 rounded-xl border border-white/10 bg-slate-950/70 p-5"
    >
      <header className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h3
            id="wallpaper-synth-heading"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/70"
          >
            <Beaker className="h-4 w-4" aria-hidden="true" /> Wallpaper Synth Lab
          </h3>
          <p className="text-xs text-slate-300/60">
            Compose bespoke gradients, assign tones, and deploy them instantly across the HUD.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="border border-white/10 text-slate-200/70 hover:bg-white/10"
          onClick={handleRandomize}
          aria-label="Randomize gradient settings"
        >
          <Wand2 className="h-4 w-4" />
        </Button>
      </header>

      <div
        className="relative h-40 overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_80px_rgba(8,12,24,0.55)]"
        style={{ background: gradientPreview }}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-4 text-slate-100">
          <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.32em]">
            <span>{gradientType}</span>
            <span>{tone}</span>
          </div>
          <div className="rounded-full border border-white/20 bg-slate-950/60 px-3 py-1 text-[0.6rem] uppercase tracking-[0.32em] text-slate-100/90">
            {name.trim() || nameSuggestion}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="synth-name" className="text-xs uppercase tracking-[0.3em] text-slate-300/60">
            Call Sign
          </Label>
          <Input
            id="synth-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={nameSuggestion}
            className="border-white/10 bg-slate-900/70 text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="synth-tone"
            className="text-xs uppercase tracking-[0.3em] text-slate-300/60"
          >
            Accent Tone
          </Label>
          <Select value={tone} onValueChange={(value: CanvasTone) => setTone(value)}>
            <SelectTrigger id="synth-tone" className="border-white/10 bg-slate-900/70 text-xs uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option} className="capitalize">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="gradient-type"
          className="text-xs uppercase tracking-[0.3em] text-slate-300/60"
        >
          Gradient Type
        </Label>
        <Select
          value={gradientType}
          onValueChange={(value: (typeof GRADIENT_TYPES)[number]['value']) => setGradientType(value)}
        >
          <SelectTrigger
            id="gradient-type"
            className="border-white/10 bg-slate-900/70 text-xs uppercase tracking-[0.3em]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRADIENT_TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {colors.map((color, index) => (
          <div key={index} className="space-y-2">
            <Label
              htmlFor={`gradient-stop-${index}`}
              className="text-xs uppercase tracking-[0.3em] text-slate-300/60"
            >
              Stop {index + 1}
            </Label>
            <Input
              id={`gradient-stop-${index}`}
              type="color"
              value={color}
              onChange={(event) => handleColorChange(index, event.target.value)}
              className="h-10 w-full cursor-pointer border-white/10 bg-slate-900/70"
              aria-label={`Gradient color stop ${index + 1}`}
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {(gradientType === 'linear' || gradientType === 'conic') && (
          <div className="space-y-2">
            <Label className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60">
              <span>Angle</span>
              <span>{angle}°</span>
            </Label>
            <Slider
              value={[angle]}
              min={0}
              max={360}
              step={1}
              onValueChange={([value]) => setAngle(value)}
              aria-label="Gradient angle"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60">
            <span>{gradientType === 'radial' ? 'Focus Offset' : 'Blend Spread'}</span>
            <span>{focus}%</span>
          </Label>
          <Slider
            value={[focus]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => setFocus(value)}
            aria-label="Gradient focus"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="wallpaper-description"
          className="text-xs uppercase tracking-[0.3em] text-slate-300/60"
        >
          Mission Notes (optional)
        </Label>
        <Input
          id="wallpaper-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. Night audit visual for parking lot scans"
          className="border-white/10 bg-slate-900/70 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="border border-white/10 text-xs uppercase tracking-[0.32em] text-slate-200/70 hover:bg-white/10"
          onClick={handleReset}
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reset Lab
        </Button>
        <Button
          type="button"
          onClick={handleCreate}
          disabled={isSaving}
          className="bg-orange-500/90 text-xs uppercase tracking-[0.32em] text-slate-900 hover:bg-orange-500"
        >
          {isSaving ? 'Saving…' : 'Deploy Wallpaper'}
        </Button>
      </div>
    </section>
  );
}

function randomHex(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;
}

function generateCallSign(): string {
  const adjectives = [
    'Dawn',
    'Twilight',
    'Aerial',
    'Vanguard',
    'Ember',
    'Aurora',
    'Sentinel',
    'Harbor',
    'Summit',
    'Cathedral',
    'Beacon',
    'Revival',
    'Celestial',
    'Radiant',
    'Circuit',
  ];
  const nouns = [
    'Pulse',
    'Grid',
    'Harbor',
    'Vector',
    'Canvas',
    'Signal',
    'Lattice',
    'Halo',
    'Flux',
    'Outpost',
    'Spire',
    'Tempo',
    'Lumen',
    'Forge',
    'Array',
  ];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
