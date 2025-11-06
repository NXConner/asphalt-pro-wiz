import { useRef, useState } from 'react';
import { MonitorCog, RefreshCw, Trash2, UploadCloud } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CanvasTone } from '@/modules/layout/CanvasPanel';
import type { WallpaperAsset } from '@/modules/layout/wallpaperLibrary';

const toneOptions: CanvasTone[] = ['dusk', 'aurora', 'ember', 'lagoon'];

export interface ThemeWallpaperManagerProps {
  builtin: WallpaperAsset[];
  custom: WallpaperAsset[];
  activeWallpaperId: string | null;
  opacity: number;
  blur: number;
  onSelect: (asset: WallpaperAsset) => void;
  onUpload: (payload: { file: File; name?: string; tone: CanvasTone }) => Promise<void>;
  onRemove: (id: string) => void;
  onOpacityChange: (value: number) => void;
  onBlurChange: (value: number) => void;
}

export function ThemeWallpaperManager({
  builtin,
  custom,
  activeWallpaperId,
  opacity,
  blur,
  onSelect,
  onUpload,
  onRemove,
  onOpacityChange,
  onBlurChange,
}: ThemeWallpaperManagerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadTone, setUploadTone] = useState<CanvasTone>('dusk');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await onUpload({ file, name: uploadName.trim() || undefined, tone: uploadTone });
      setUploadName('');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
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
              onClick={() => onSelect(asset)}
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
                <span className="text-[0.65rem] text-slate-200/65">{asset.description}</span>
              </span>
              {active ? (
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(255,128,0,0.6)]" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <Label htmlFor="theme-wallpaper-upload" className="text-xs uppercase tracking-[0.3em] text-slate-300/60">
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
          <Button
            variant="ghost"
            size="icon"
            className="border border-white/10"
            onClick={() => {
              setUploadName('');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            aria-label="Reset wallpaper upload form"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="theme-wallpaper-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
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
                    <button type="button" onClick={() => onSelect(asset)} className="flex-1 text-left">
                      <span className="block font-semibold uppercase tracking-[0.3em] text-slate-100/80">
                        {asset.name}
                      </span>
                      <span className="block text-[0.65rem] text-slate-300/60">{asset.description}</span>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-rose-300/80 hover:bg-rose-500/20"
                      onClick={() => onRemove(asset.id)}
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
          <Label
            htmlFor="theme-wallpaper-opacity"
            className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60"
          >
            <span>Opacity</span>
            <span>{Math.round(opacity * 100)}%</span>
          </Label>
          <input
            id="theme-wallpaper-opacity"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(event) => onOpacityChange(Number.parseFloat(event.target.value))}
            className="h-2 w-full cursor-pointer rounded-full bg-slate-700/80"
          />

          <Label
            htmlFor="theme-wallpaper-blur"
            className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-300/60"
          >
            <span>Atmosphere Blur</span>
            <span>{blur}px</span>
          </Label>
          <input
            id="theme-wallpaper-blur"
            type="range"
            min={0}
            max={30}
            value={blur}
            onChange={(event) => onBlurChange(Number.parseInt(event.target.value, 10))}
            className="h-2 w-full cursor-pointer rounded-full bg-slate-700/80"
          />
        </div>
      </div>
    </div>
  );
}

