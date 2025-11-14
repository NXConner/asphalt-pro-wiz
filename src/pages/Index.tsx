import { Shield } from 'lucide-react';
import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { ComplianceResources, type ComplianceTopic } from '@/components/ComplianceResources';
import { HudWrapper } from '@/components/hud/HudWrapper';
import { type TacticalHudOverlayProps } from '@/components/hud/TacticalHudOverlay';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { Button } from '@/components/ui/button';
import { EngagementHubPanel } from '@/modules/engagement/EngagementHubPanel';
import { useEstimatorState } from '@/modules/estimate/useEstimatorState';
import { CanvasPanel } from '@/modules/layout/CanvasPanel';
import { ResponsiveCanvas } from '@/modules/layout/ResponsiveCanvas';
import { OperationsHeader } from '@/modules/layout/OperationsHeader';
import { DEFAULT_WALLPAPER, getNextWallpaper, getWallpaperById } from '@/modules/layout/wallpapers';
import { MissionControlPanel } from '@/modules/mission-control/MissionControlPanel';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

// Lazy load heavy components for better initial load performance
const EstimatorStudio = lazy(() => import('@/modules/estimate/EstimatorStudio').then(m => ({ default: m.EstimatorStudio })));
const InsightTowerPanel = lazy(() => import('@/modules/insights/InsightTowerPanel').then(m => ({ default: m.InsightTowerPanel })));

/**
 * Main Index page component - Optimized with memo and callbacks
 */
const Index = memo(() => {
  const estimator = useEstimatorState();
  const layout = useResponsiveLayout();
  const [wallpaperId, setWallpaperId] = useState(DEFAULT_WALLPAPER.id);
  const wallpaper = useMemo(() => getWallpaperById(wallpaperId), [wallpaperId]);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [complianceTopic, setComplianceTopic] = useState<ComplianceTopic>('striping');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const summary = useMemo(
    () => ({
      jobName: estimator.job.name,
      totalArea: estimator.areas.total,
      totalCost: estimator.calculation.costs?.total ?? null,
    }),
    [estimator.job.name, estimator.areas.total, estimator.calculation.costs?.total],
  );

  const hudFlags = useMemo(() => {
    const labelMap: Record<string, string> = {
      imageAreaAnalyzer: 'Image Analyzer',
      aiAssistant: 'AI Assistant',
      pwa: 'PWA Mode',
      i18n: 'Localization',
      receipts: 'Receipts',
      scheduler: 'Scheduler',
      optimizer: 'Optimizer',
      customerPortal: 'Customer Portal',
      observability: 'Observability',
      commandCenter: 'Command Center',
      ownerMode: 'Owner Mode',
    };
    return Object.entries(estimator.featureFlags.values).map(([id, active]) => ({
      id,
      label: labelMap[id] ?? id,
      active,
    }));
  }, [estimator.featureFlags.values]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [],
  );

  const hudWatchers = useMemo(() => {
    const watchers: NonNullable<TacticalHudOverlayProps['watchers']> = [];
    const segmentCount = estimator.areas.items.length;
    watchers.push({
      label: 'Segments',
      value: segmentCount.toString(),
      tone: segmentCount > 0 ? 'ok' : 'warn',
    });

    const crackLength = estimator.cracks.length;
    const crackTone = crackLength > 400 ? 'critical' : crackLength > 100 ? 'warn' : 'ok';
    watchers.push({
      label: 'Crack Footage',
      value: `${crackLength.toFixed(1)} ft`,
      tone: crackTone,
    });

    const premiumSelections = [
      estimator.premium.edgePushing,
      estimator.premium.weedKiller,
      estimator.premium.crackCleaning,
      estimator.premium.powerWashing,
      estimator.premium.debrisRemoval,
    ].filter(Boolean).length;
    const customSelections = estimator.customServices.items.length;
    const enhancementCount = premiumSelections + customSelections;
    watchers.push({
      label: 'Enhancements',
      value: enhancementCount.toString(),
      tone: enhancementCount > 0 ? 'ok' : 'warn',
    });

    const projectedProfit = estimator.calculation.costs?.profit ?? null;
    if (projectedProfit !== null) {
      watchers.push({
        label: 'Projected Profit',
        value: currencyFormatter.format(projectedProfit),
        tone: projectedProfit > 0 ? 'ok' : 'critical',
      });
    }

    return watchers;
  }, [
    currencyFormatter,
    estimator.areas.items.length,
    estimator.calculation.costs?.profit,
    estimator.cracks.length,
    estimator.customServices.items.length,
    estimator.premium.crackCleaning,
    estimator.premium.debrisRemoval,
    estimator.premium.edgePushing,
    estimator.premium.powerWashing,
    estimator.premium.weedKiller,
  ]);

  const missionPhase = useMemo(() => {
    switch (estimator.job.status) {
      case 'need_estimate':
        return 'Reconnaissance';
      case 'estimated':
        return 'Proposal Ready';
      case 'active':
        return 'Deployment Prep';
      case 'completed':
        return 'Mission Complete';
      case 'lost':
        return 'After Action';
      default:
        return 'Operations';
    }
  }, [estimator.job.status]);

  const [lastUpdatedIso, setLastUpdatedIso] = useState(() => new Date().toISOString());

  // Debounce lastUpdatedIso updates to reduce re-renders
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLastUpdatedIso(new Date().toISOString());
    }, 100); // Small delay to batch updates
    
    return () => clearTimeout(timeoutId);
  }, [
    estimator.job.mapRefreshKey,
    estimator.calculation.costs?.total,
    estimator.calculation.costs?.profit,
    estimator.areas.total,
  ]);

  const cycleWallpaper = useCallback(() => {
    const next = getNextWallpaper(wallpaperId);
    setWallpaperId(next.id);
  }, [wallpaperId]);

  const openCompliance = useCallback((topic: ComplianceTopic) => {
    setComplianceTopic(topic);
    setComplianceOpen(true);
  }, []);

  useEffect(() => {
    const handleOpenShortcuts = () => setShortcutsOpen(true);
    window.addEventListener('openShortcuts', handleOpenShortcuts);
    return () => window.removeEventListener('openShortcuts', handleOpenShortcuts);
  }, []);

  const hudOverlay = layout.showFullHud ? (
    <HudWrapper
      missionName={estimator.job.name || 'Pavement Mission'}
      missionStatus={estimator.job.status}
      missionPhase={missionPhase}
      totalAreaSqFt={estimator.areas.total}
      totalCost={estimator.calculation.costs?.total ?? null}
      travelMiles={estimator.job.distance}
      coordinates={estimator.job.coords}
      scheduleWindow={null}
      lastUpdatedIso={lastUpdatedIso}
      watchers={hudWatchers}
      flags={hudFlags}
    />
  ) : null;

  return (
    <>
      <main id="main-content">
        <h1 className="sr-only">Pavement Performance Suite</h1>
        <ResponsiveCanvas
          wallpaper={wallpaper}
          summary={{
            totalCost: summary.totalCost,
            totalArea: summary.totalArea,
          }}
          header={
            <OperationsHeader
              wallpaper={wallpaper}
              onNextWallpaper={cycleWallpaper}
              summary={summary}
            />
          }
          missionControl={<MissionControlPanel estimator={estimator} />}
          estimator={
            <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white/5" />}>
              <EstimatorStudio estimator={estimator} />
            </Suspense>
          }
          insights={
            <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-white/5" />}>
              <InsightTowerPanel estimator={estimator} />
            </Suspense>
          }
          engagement={
            <div className="space-y-5">
              <EngagementHubPanel estimator={estimator} />
              <CanvasPanel
                title="Regulatory Toolkit"
                subtitle="Jump into ADA, VDOT, and NC DOT resources before finalizing proposals."
                eyebrow="Compliance"
                tone="ember"
                action={
                  <Button type="button" variant="command" onClick={() => openCompliance(complianceTopic)}>
                    <Shield className="mr-2 h-4 w-4" /> Open Library
                  </Button>
                }
              >
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => openCompliance('striping')}>
                    ADA & Striping
                  </Button>
                  <Button type="button" variant="outline" onClick={() => openCompliance('sealcoating')}>
                    Sealcoat Specs
                  </Button>
                  <Button type="button" variant="outline" onClick={() => openCompliance('crackfilling')}>
                    Crack Filling SOP
                  </Button>
                </div>
              </CanvasPanel>
            </div>
          }
          hudOverlay={hudOverlay}
        />
      </main>
      <ComplianceResources
        open={complianceOpen}
        onOpenChange={setComplianceOpen}
        activeTopic={complianceTopic}
      />
      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
});

Index.displayName = 'Index';

export default Index;
