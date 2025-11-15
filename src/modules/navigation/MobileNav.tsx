import { BarChart3, Calendar, Map } from 'lucide-react';
import { memo } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onMapClick: () => void;
  onAnalyticsClick: () => void;
  onScheduleClick: () => void;
  activePanel?: 'map' | 'analytics' | 'schedule';
}

export const MobileNav = memo(function MobileNav({
  onMapClick,
  onAnalyticsClick,
  onScheduleClick,
  activePanel,
}: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="grid grid-cols-3 gap-1 p-2">
        <Button
          variant={activePanel === 'map' ? 'default' : 'ghost'}
          size="sm"
          onClick={onMapClick}
          className={cn(
            'flex flex-col items-center gap-1 h-auto py-2',
            activePanel === 'map' && 'bg-primary text-primary-foreground',
          )}
        >
          <Map className="h-5 w-5" />
          <span className="text-xs">Map</span>
        </Button>
        <Button
          variant={activePanel === 'analytics' ? 'default' : 'ghost'}
          size="sm"
          onClick={onAnalyticsClick}
          className={cn(
            'flex flex-col items-center gap-1 h-auto py-2',
            activePanel === 'analytics' && 'bg-primary text-primary-foreground',
          )}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs">Analytics</span>
        </Button>
        <Button
          variant={activePanel === 'schedule' ? 'default' : 'ghost'}
          size="sm"
          onClick={onScheduleClick}
          className={cn(
            'flex flex-col items-center gap-1 h-auto py-2',
            activePanel === 'schedule' && 'bg-primary text-primary-foreground',
          )}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Schedule</span>
        </Button>
      </div>
    </div>
  );
});
