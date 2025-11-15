import { lazy, memo, Suspense, type ReactNode } from 'react';

import type { CommandLayoutMode } from './layoutModes';
import type { CanvasWallpaper } from './wallpapers';

import { TacticalLoader } from '@/components/hud';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const MobileLayout = lazy(() =>
  import('./MobileLayout').then((m) => ({ default: m.MobileLayout })),
);
const TabletLayout = lazy(() =>
  import('./TabletLayout').then((m) => ({ default: m.TabletLayout })),
);
const DesktopLayout = lazy(() =>
  import('./DesktopLayout').then((m) => ({ default: m.DesktopLayout })),
);

interface ResponsiveCanvasProps {
  wallpaper: CanvasWallpaper;
  layoutMode: CommandLayoutMode;
  header: ReactNode;
  missionControl: ReactNode;
  estimator: ReactNode;
  insights: ReactNode;
  engagement: ReactNode;
  hudOverlay?: ReactNode;
  summary: {
    totalCost: number | null;
    totalArea: number;
  };
}

export const ResponsiveCanvas = memo(function ResponsiveCanvas(props: ResponsiveCanvasProps) {
  const layout = useResponsiveLayout();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <TacticalLoader label="Initializing Command Center..." />
        </div>
      }
    >
      {layout.isMobile && (
        <MobileLayout
          layoutMode={props.layoutMode}
          header={props.header}
          estimator={props.estimator}
          missionControl={props.missionControl}
          insights={props.insights}
          engagement={props.engagement}
          summary={props.summary}
        />
      )}

      {layout.isTablet && (
        <TabletLayout
          wallpaper={props.wallpaper}
          layoutMode={props.layoutMode}
          header={props.header}
          missionControl={props.missionControl}
          estimator={props.estimator}
          insights={props.insights}
          engagement={props.engagement}
        />
      )}

      {layout.isDesktop && (
        <DesktopLayout
          wallpaper={props.wallpaper}
          layoutMode={props.layoutMode}
          header={props.header}
          missionControl={props.missionControl}
          estimator={props.estimator}
          insights={props.insights}
          engagement={props.engagement}
          hudOverlay={props.hudOverlay}
        />
      )}
    </Suspense>
  );
});
