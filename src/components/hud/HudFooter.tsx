import { memo } from 'react';

interface HudFooterProps {
  formattedCost: string;
  formattedArea: string;
  formattedTravel: string;
}

export const HudFooter = memo(function HudFooter({
  formattedCost,
  formattedArea,
  formattedTravel,
}: HudFooterProps) {
  return (
    <div className="grid grid-cols-3 gap-2 border-t border-border/30 px-4 py-2 text-xs">
      <div>
        <span className="text-muted-foreground">Budget</span>
        <p className="font-semibold text-foreground">{formattedCost}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Area</span>
        <p className="font-semibold text-foreground">{formattedArea}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Travel</span>
        <p className="font-semibold text-foreground">{formattedTravel}</p>
      </div>
    </div>
  );
});
