import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { isLovableHost } from '@/lib/routing/basePath';
import { cn } from '@/lib/utils';
import type { LovablePreviewHealthSnapshot } from '@/types/lovablePreview';

const defaultSnapshot: LovablePreviewHealthSnapshot = { status: 'unknown' };

export function LovablePreviewBanner() {
  const [snapshot, setSnapshot] = useState<LovablePreviewHealthSnapshot>(() => {
    if (typeof window === 'undefined') return defaultSnapshot;
    return (window as typeof window & { __PPS_PREVIEW_HEALTH?: LovablePreviewHealthSnapshot })
      .__PPS_PREVIEW_HEALTH ?? defaultSnapshot;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<LovablePreviewHealthSnapshot>).detail;
      if (detail) setSnapshot(detail);
    };
    window.addEventListener('lovable:previewHealth', handler as EventListener);
    return () => window.removeEventListener('lovable:previewHealth', handler as EventListener);
  }, []);

  const isVisible = useMemo(() => {
    if (!isLovableHost()) return false;
    return snapshot.status === 'warning' || snapshot.status === 'error';
  }, [snapshot.status]);

  if (!isVisible) {
    return null;
  }

  const toneClass =
    snapshot.status === 'error'
      ? 'border-rose-400/40 bg-rose-500/5 text-rose-50'
      : 'border-amber-400/40 bg-amber-500/5 text-amber-50';

  const retry = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event('lovable:previewHealth:ping'));
  };

  return (
    <output
      className={cn(
        'mx-4 mt-4 block flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs uppercase tracking-[0.3em]',
        toneClass,
      )}
      aria-live="polite"
    >
      <div className="flex flex-1 items-center gap-3">
        <AlertTriangle className="h-5 w-5" aria-hidden />
        <div className="flex flex-col gap-1 text-left">
          <span className="font-semibold">
            {snapshot.status === 'error'
              ? 'Lovable preview unreachable'
              : 'Lovable heartbeat degraded'}
          </span>
          <span className="text-[0.65rem] normal-case tracking-normal text-white/80">
            {snapshot.message ?? 'Preview proxy did not respond to /health in time.'}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={retry}
        className="inline-flex items-center gap-2 rounded-full border border-white/40 px-3 py-1 text-[0.65rem] normal-case tracking-normal text-white hover:bg-white/10"
      >
        <RefreshCw className="h-3 w-3" aria-hidden />
        Retry
      </button>
    </output>
  );
}

