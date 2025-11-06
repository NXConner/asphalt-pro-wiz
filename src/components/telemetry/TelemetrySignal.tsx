import { RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TelemetrySignalProps {
  isConnected: boolean;
  lastEventAt?: string | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  label?: string;
  className?: string;
}

function formatRelativeLastUpdate(isoTimestamp?: string | null): string | null {
  if (!isoTimestamp) {
    return null;
  }

  const timestampValue = Date.parse(isoTimestamp);
  if (Number.isNaN(timestampValue)) {
    return null;
  }

  const diffMs = Date.now() - timestampValue;
  if (diffMs < 0) {
    return 'just now';
  }

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 45) {
    return `${Math.max(seconds, 1)}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 48) {
    return `${hours}h ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestampValue));
}

export function TelemetrySignal({
  className,
  isConnected,
  lastEventAt,
  isRefreshing = false,
  onRefresh,
  label = 'Telemetry',
}: TelemetrySignalProps) {
  const relativeLabel = formatRelativeLastUpdate(lastEventAt);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.65rem] uppercase tracking-[0.38em] text-slate-100 shadow-[0_12px_40px_rgba(4,8,24,0.35)] backdrop-blur',
        className,
      )}
      aria-live="polite"
    >
      <span className="flex items-center gap-2 font-semibold">
        <span
          className={cn('relative inline-flex h-2.5 w-2.5 items-center justify-center')}
          aria-hidden="true"
        >
          {isConnected ? (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300/60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.55)]" />
            </>
          ) : (
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(248,113,113,0.55)]" />
          )}
        </span>
        <span>{label}</span>
        <span
          className={cn(
            'font-mono text-[0.58rem] tracking-[0.28em]',
            isConnected ? 'text-emerald-200/85' : 'text-rose-200/85',
          )}
        >
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </span>

      <span className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-slate-200/60">
        {relativeLabel ?? (isConnected ? 'Awaiting events' : 'Reconnect required')}
      </span>

      {onRefresh ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto h-8 gap-2 px-3 text-[0.58rem] tracking-[0.36em] text-slate-100 hover:bg-white/10"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      ) : null}
    </div>
  );
}

export type { TelemetrySignalProps };
