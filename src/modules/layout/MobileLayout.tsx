import { memo, useState, type ReactNode } from 'react';
import { DollarSign, Layers } from 'lucide-react';

import { BottomSheet } from '@/modules/navigation/BottomSheet';
import { MobileNav } from '@/modules/navigation/MobileNav';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  header: ReactNode;
  estimator: ReactNode;
  missionControl: ReactNode;
  insights: ReactNode;
  engagement: ReactNode;
  hudOverlay?: ReactNode;
  summary: {
    totalCost: number | null;
    totalArea: number;
  };
}

export const MobileLayout = memo(function MobileLayout({
  header,
  estimator,
  missionControl,
  insights,
  engagement,
  summary,
}: MobileLayoutProps) {
  const [activePanel, setActivePanel] = useState<'map' | 'analytics' | 'schedule' | null>(null);

  const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const numberFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  });

  return (
    <div className="relative min-h-screen bg-background">
      {/* Hidden h1 for SEO */}
      <h1 className="sr-only">Pavement Performance Suite - Mobile Estimator</h1>

      {/* Compact Header */}
      <div className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-sm">
        {header}
      </div>

      {/* Quick Stats Bar */}
      <div className="sticky top-[64px] z-10 border-b border-border bg-primary/10 px-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-sm font-semibold text-foreground">
                {summary.totalCost ? currencyFormatter.format(summary.totalCost) : '$0'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Area</p>
              <p className="text-sm font-semibold text-foreground">
                {numberFormatter.format(summary.totalArea)} sq ft
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Estimator */}
      <main className="pb-20 px-4 pt-4">
        {estimator}
      </main>

      {/* Bottom Sheets */}
      <BottomSheet
        isOpen={activePanel === 'map'}
        onClose={() => setActivePanel(null)}
        title="Mission Map"
      >
        {missionControl}
      </BottomSheet>

      <BottomSheet
        isOpen={activePanel === 'analytics'}
        onClose={() => setActivePanel(null)}
        title="Analytics"
      >
        {insights}
      </BottomSheet>

      <BottomSheet
        isOpen={activePanel === 'schedule'}
        onClose={() => setActivePanel(null)}
        title="Schedule"
      >
        {engagement}
      </BottomSheet>

      {/* Bottom Navigation */}
      <MobileNav
        activePanel={activePanel ?? undefined}
        onMapClick={() => setActivePanel(activePanel === 'map' ? null : 'map')}
        onAnalyticsClick={() => setActivePanel(activePanel === 'analytics' ? null : 'analytics')}
        onScheduleClick={() => setActivePanel(activePanel === 'schedule' ? null : 'schedule')}
      />
    </div>
  );
});
