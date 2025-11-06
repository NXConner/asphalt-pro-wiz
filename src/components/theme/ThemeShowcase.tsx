import { Palette, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HoloCard,
  HoloCardDescription,
  HoloCardFooter,
  HoloCardHeader,
  HoloCardTitle,
  AccentSwatch,
  type HoloCardProps,
} from '@/components/ui/holo-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/contexts/ThemeContext';
import { groupThemePresets, type ThemeCategory, type ThemePresetMeta } from '@/lib/designSystem';
import { cn } from '@/lib/utils';

const toneByCategory: Record<ThemeCategory, HoloCardProps['tone']> = {
  division: 'aurora',
  legacy: 'citadel',
  liturgical: 'chapel',
  campus: 'ember',
  seasonal: 'lagoon',
};

interface ThemeShowcaseProps {
  limitPerGroup?: number;
}

export function ThemeShowcase({ limitPerGroup = 3 }: ThemeShowcaseProps) {
  const { preferences, setTheme } = useTheme();

  const groups = useMemo(() => groupThemePresets(), []);

  const handleApply = (preset: ThemePresetMeta) => {
    setTheme(preset.id);
  };

  return (
    <section aria-labelledby="theme-showcase-heading" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2
            id="theme-showcase-heading"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.36em] text-slate-200"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Live Theme Gallery
          </h2>
          <p className="text-xs text-slate-300/70">
            Explore curated Division, liturgical, and campus palettes. Apply instantly to preview
            mission dashboards with real data.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-white/20 bg-white/10 text-[0.65rem] uppercase tracking-[0.28em]"
        >
          <Palette className="mr-2 h-3.5 w-3.5" aria-hidden="true" /> {groups.length} theme families
        </Badge>
      </div>

      <ScrollArea className="h-[26rem] rounded-3xl border border-white/10 bg-white/5 p-1 pr-4">
        <div className="grid gap-5 xl:grid-cols-2">
          {groups.map((group) => (
            <ThemeGroupCard
              key={group.category}
              group={group.label}
              description={group.description}
              tone={toneByCategory[group.category] ?? 'aurora'}
              presets={group.presets.slice(0, limitPerGroup)}
              activeTheme={preferences.name}
              onApply={handleApply}
            />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}

interface ThemeGroupCardProps {
  group: string;
  description: string;
  tone: HoloCardProps['tone'];
  presets: ThemePresetMeta[];
  activeTheme: string;
  onApply: (preset: ThemePresetMeta) => void;
}

function ThemeGroupCard({
  group,
  description,
  tone,
  presets,
  activeTheme,
  onApply,
}: ThemeGroupCardProps) {
  return (
    <HoloCard tone={tone} className="min-h-[18rem]">
      <HoloCardHeader>
        <div className="space-y-1.5">
          <HoloCardTitle>{group}</HoloCardTitle>
          <HoloCardDescription>{description}</HoloCardDescription>
        </div>
      </HoloCardHeader>

      <ul className="grid gap-4 text-left">
        {presets.map((preset) => (
          <li key={preset.id}>
            <article className="rounded-2xl border border-white/10 bg-white/3 p-4">
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-400/90">
                    {preset.label}
                  </p>
                  <p className="text-xs text-slate-200/80">{preset.description}</p>
                </div>
                <Badge
                  variant={preset.id === activeTheme ? 'default' : 'outline'}
                  className={cn(
                    'border-white/20 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] shadow-[0_0_12px_rgba(148,163,184,0.25)]',
                    preset.id === activeTheme
                      ? 'bg-emerald-500/20 text-emerald-100'
                      : 'bg-black/20 text-slate-200/80',
                  )}
                >
                  {preset.id === activeTheme ? 'Active' : 'Preview'}
                </Badge>
              </header>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <AccentSwatch label="Primary" value={preset.tokens['--primary'] ?? '25 100% 55%'} />
                <AccentSwatch label="Accent" value={preset.tokens['--accent'] ?? '197 86% 48%'} />
              </div>

              <HoloCardFooter className="mt-4">
                <div className="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.24em] text-slate-300/70">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Hue {preset.accentHue.toString().padStart(3, '0')}°
                  </span>
                  {preset.recommendedWallpaperId ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Wallpaper {preset.recommendedWallpaperId.replace('division-', '')}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={preset.id === activeTheme ? 'outline' : 'secondary'}
                    className={cn(
                      'uppercase tracking-[0.3em]',
                      preset.id === activeTheme
                        ? 'border-emerald-300/60 text-emerald-200 hover:bg-emerald-400/10'
                        : 'bg-slate-100/90 text-slate-900 hover:bg-slate-100',
                    )}
                    onClick={() => onApply(preset)}
                  >
                    {preset.id === activeTheme ? 'Reapply' : 'Apply Theme'}
                  </Button>
                </div>
              </HoloCardFooter>
            </article>
          </li>
        ))}
      </ul>
    </HoloCard>
  );
}
