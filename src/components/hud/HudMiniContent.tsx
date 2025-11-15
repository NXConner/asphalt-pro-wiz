import { memo } from 'react';

import { cn } from '@/lib/utils';

interface HudMiniContentProps {
  formattedCost: string;
  formattedArea: string;
  environment?: {
    tempF?: number;
    riskLevel?: 'low' | 'medium' | 'high';
  };
}

const riskTone: Record<'low' | 'medium' | 'high', string> = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-destructive',
};

export const HudMiniContent = memo(function HudMiniContent({
  formattedCost,
  formattedArea,
  environment,
}: HudMiniContentProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Budget</span>
          <p className="font-semibold text-foreground">{formattedCost}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Area</span>
          <p className="font-semibold text-foreground">{formattedArea}</p>
        </div>
      </div>
      {environment && (
        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-2 py-1 text-xs">
          {typeof environment.tempF === 'number' && (
            <span className="text-foreground/85">{environment.tempF.toFixed(0)}°F</span>
          )}
          {environment.riskLevel && (
            <span className={cn('uppercase text-[0.65rem]', riskTone[environment.riskLevel])}>
              {environment.riskLevel}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
