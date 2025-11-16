import { Eye, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TacticalInput, TacticalModal } from '@/components/tactical';
import { ThemeWallpaperDropzone } from '@/components/theme/ThemeWallpaperDropzone';
import { Button } from '@/components/ui/button';
import { TacticalCard } from '@/components/ui/tactical-card';
import { DESIGN_SYSTEM_MANIFEST, type ThemeGalleryEntry } from '@/design/system';
import type { ThemeName, ThemeWallpaperSelection } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { CanvasTone } from '@/modules/layout/CanvasPanel';

interface ThemeGalleryProps {
  activeTheme: ThemeName;
  activeWallpaperId?: string | null;
  onSelectTheme: (theme: ThemeName) => void;
  onSelectWallpaper: (selection: ThemeWallpaperSelection) => void;
  onUploadWallpaper: (input: { file: File; tone: CanvasTone; name?: string }) => Promise<void>;
}

const uploadToneOptions: Array<{ id: CanvasTone; label: string }> = [
  { id: 'dusk', label: 'Dusk' },
  { id: 'ember', label: 'Ember' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'lagoon', label: 'Lagoon' },
];

const convertTone = (tone: CanvasTone): Parameters<typeof TacticalModal>[0]['tone'] => {
  switch (tone) {
    case 'aurora':
      return 'aurora';
    case 'lagoon':
      return 'lagoon';
    case 'ember':
      return 'ember';
    default:
      return 'rogue';
  }
};

export function ThemeGallery({
  activeTheme,
  activeWallpaperId,
  onSelectTheme,
  onSelectWallpaper,
  onUploadWallpaper,
}: ThemeGalleryProps) {
  const [preview, setPreview] = useState<ThemeGalleryEntry | null>(null);
  const [uploadTone, setUploadTone] = useState<CanvasTone>('dusk');
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);

  const collections = DESIGN_SYSTEM_MANIFEST.collections;

  const handleActivate = (entry: ThemeGalleryEntry) => {
    onSelectTheme(entry.themeName as ThemeName);
    onSelectWallpaper({
      id: entry.wallpaper.id,
      source: 'builtin',
      name: entry.wallpaper.name,
      description: entry.wallpaper.description,
    });
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      await onUploadWallpaper({
        file,
        tone: uploadTone,
        name: uploadName.trim() || undefined,
      });
      setUploadName('');
    } finally {
      setUploading(false);
    }
  };

  const previewBackground = useMemo(
    () =>
      preview
        ? {
            backgroundImage: preview.wallpaper.gradient,
          }
        : undefined,
    [preview],
  );

  return (
    <section className="space-y-8 rounded-3xl border border-white/5 bg-slate-950/70 p-6 shadow-[0_40px_120px_rgba(4,6,20,0.65)]">
      <header className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
          Theme Gallery
        </h3>
        <p className="text-xs text-white/60">
          Deploy curated palettes + wallpapers for liturgical seasons, field ops, and campus contexts.
        </p>
      </header>

      {collections.map((collection) => (
        <div key={collection.id} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.45em] text-white/60">
                {collection.id}
              </p>
              <h4 className="text-base font-semibold text-white">{collection.title}</h4>
              <p className="text-xs text-white/65">{collection.description}</p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {collection.entries.map((entry) => {
              const isActive = activeTheme === entry.themeName && activeWallpaperId === entry.wallpaper.id;
              return (
                <TacticalCard
                  key={entry.id}
                  tone={entry.accentTone === 'aurora' ? 'aurora' : entry.accentTone === 'lagoon' ? 'lagoon' : entry.accentTone === 'ember' ? 'ember' : 'dusk'}
                  title={entry.title}
                  eyebrow={entry.category.toUpperCase()}
                  description={entry.summary}
                  actions={
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={isActive ? 'tactical' : 'command'}
                        onClick={() => handleActivate(entry)}
                        className={cn(isActive && 'border-white/50')}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isActive ? 'Active' : 'Activate'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                        onClick={() => setPreview(entry)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  }
                >
                  <div
                    className="h-40 w-full rounded-2xl border border-white/10 bg-cover bg-center"
                    style={{ backgroundImage: entry.wallpaper.gradient }}
                  />
                  <div className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-white/70">
                    {entry.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[0.55rem]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </TacticalCard>
              );
            })}
          </div>
        </div>
      ))}

      <div className="grid gap-6 rounded-2xl border border-dashed border-white/20 p-5 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">Custom Upload</p>
          <h4 className="text-lg font-semibold text-white">Bring your campus photography</h4>
          <TacticalInput
            label="Label"
            placeholder="Sunrise lot, Advent lights..."
            value={uploadName}
            onChange={(event) => setUploadName(event.target.value)}
            hint="Optional label for gallery lists"
          />
          <div className="space-y-2">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/50">Tone</p>
            <div className="flex flex-wrap gap-2">
              {uploadToneOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setUploadTone(option.id)}
                  className={cn(
                    'rounded-full border px-4 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.35em] transition',
                    uploadTone === option.id
                      ? 'border-white/80 bg-white/20 text-white'
                      : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <ThemeWallpaperDropzone
              busy={uploading}
              onSelectFile={(file) => {
                void handleUpload(file);
              }}
              description="PNG, JPG, WebP • Drag & drop or browse. We auto-optimize and stay on-device."
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-4 text-xs text-white/80">
          <p className="font-semibold uppercase tracking-[0.35em] text-white/60">Tips</p>
          <ul className="mt-3 space-y-2">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400" />
              Use high-resolution landscape assets (2560x1440 recommended) for crisp HUD overlays.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Pick a tone to auto-map particle presets and accent glows.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
              Uploaded wallpapers stay local to your browser—safe for field devices.
            </li>
          </ul>
        </div>
      </div>

      <TacticalModal
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        tone={convertTone(preview?.accentTone ?? 'dusk')}
        title={preview?.title ?? 'Preview'}
        description={preview?.summary}
        actions={
          preview ? (
            <Button
              type="button"
              variant="command"
              onClick={() => {
                handleActivate(preview);
                setPreview(null);
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Apply Theme
            </Button>
          ) : null
        }
      >
        {preview ? (
          <>
            <div
              className="h-48 rounded-3xl border border-white/10 bg-cover bg-center"
              style={previewBackground}
            />
            <div className="space-y-2 text-xs uppercase tracking-[0.3em] text-white/70">
              <p>Wallpaper: {preview.wallpaper.name}</p>
              <p>Tags: {preview.tags.join(', ')}</p>
            </div>
          </>
        ) : null}
      </TacticalModal>
    </section>
  );
}

