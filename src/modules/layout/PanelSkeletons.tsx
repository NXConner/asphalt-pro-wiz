import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function MissionControlSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_25px_60px_rgba(8,12,24,0.45)] backdrop-blur',
        className,
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-white/10" />
        <Skeleton className="h-7 w-64 bg-white/15" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`mission-stat-${index}`} className="h-16 rounded-2xl bg-white/10" />
        ))}
      </div>
      <Skeleton className="h-[320px] w-full rounded-2xl bg-white/10" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={`mission-info-${index}`} className="h-12 rounded-full bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export function EstimatorSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'space-y-4 rounded-[32px] border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-5',
        className,
      )}
    >
      <Skeleton className="h-6 w-48 bg-white/15" />
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`estimator-tab-${index}`} className="h-10 rounded-2xl bg-white/10" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={`estimator-row-${index}`} className="h-20 rounded-2xl bg-white/10" />
      ))}
      <Skeleton className="h-36 rounded-3xl bg-white/10" />
    </div>
  );
}

export function InsightsSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'space-y-4 rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_48px_rgba(8,12,24,0.5)]',
        className,
      )}
    >
      <Skeleton className="h-6 w-36 bg-white/15" />
      <Skeleton className="h-4 w-60 bg-white/10" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`insight-card-${index}`} className="h-28 rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export function EngagementSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'space-y-4 rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_48px_rgba(8,12,24,0.5)]',
        className,
      )}
    >
      <Skeleton className="h-6 w-40 bg-white/15" />
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={`engagement-card-${index}`} className="h-32 rounded-2xl bg-white/10" />
      ))}
      <Skeleton className="h-20 rounded-2xl bg-white/10" />
    </div>
  );
}
