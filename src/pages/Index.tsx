import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ComplianceResources, type ComplianceTopic } from '@/components/ComplianceResources';
import { HudWrapper } from '@/components/hud/HudWrapper';
import { type TacticalHudOverlayProps } from '@/components/hud/TacticalHudOverlay';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { ThemeCommandCenter } from '@/components/ThemeCommandCenter';
import { useTheme } from '@/contexts/ThemeContext';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { useMeasurementIntel } from '@/hooks/useMeasurementIntel';
import { blobToDataUrl } from '@/lib/blob';
import { logEvent } from '@/lib/logging';
import type { WorkflowThemeId } from '@/design/system';
import { MissionControlPanel } from '@/modules/mission-control/MissionControlPanel';
import { useEstimatorState } from '@/modules/estimate/useEstimatorState';
import { useWorkflowStages } from '@/modules/workflow/useWorkflowStages';
import type { WorkflowStageId } from '@/modules/workflow/types';
import { WorkflowShell } from '@/modules/workflow/WorkflowShell';
import { useWallpaperLibrary, getWallpaperAssetById } from '@/modules/layout/wallpaperLibrary';
import { DEFAULT_WALLPAPER, getNextWallpaper, getWallpaperById } from '@/modules/layout/wallpapers';
import { toast } from 'sonner';

const SAMPLE_JOB_ID =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_SAMPLE_JOB_ID) ?? null;

const THEME_BY_WALLPAPER: Record<string, WorkflowThemeId> = {
  'division-twilight-ops': 'sunrise',
  'division-sanctuary-grid': 'tech',
  'division-dark-zone': 'rogue',
  'division-stealth-insertion': 'stealth',
  'division-cathedral-briefing': 'executive',
  'division-youth-dynamo': 'youth',
  'division-sunrise-service': 'sunrise',
  'division-campus-heritage': 'heritage',
};

const Index = memo(function Index() {
  const estimator = useEstimatorState();
  const jobId = SAMPLE_JOB_ID || ((estimator.job as { id?: string | null })?.id ?? null);
  const measurementIntel = useMeasurementIntel(estimator, jobId);
  const { setWallpaper } = useTheme();
  const { addWallpaper } = useWallpaperLibrary();
  const { optimizeImage, isProcessing: optimizingWallpaper } = useImageOptimization();
  const [wallpaperId, setWallpaperId] = useState(DEFAULT_WALLPAPER.id);
  const wallpaper = useMemo(() => getWallpaperById(wallpaperId), [wallpaperId]);
  const wallpaperAsset = useMemo(() => getWallpaperAssetById(wallpaperId), [wallpaperId]);
  const [uploadingWallpaper, setUploadingWallpaper] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [complianceTopic, setComplianceTopic] = useState<ComplianceTopic>('striping');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [lastUpdatedIso, setLastUpdatedIso] = useState(() => new Date().toISOString());
  const [activeStageId, setActiveStageId] = useState<WorkflowStageId>('measure');

  // Visibility instrumentation - will be updated after stages are defined

  useEffect(() => {
    const timeoutId = setTimeout(() => setLastUpdatedIso(new Date().toISOString()), 200);
    return () => clearTimeout(timeoutId);
  }, [
    estimator.job.mapRefreshKey,
    estimator.calculation.costs?.total,
    estimator.calculation.costs?.profit,
    estimator.areas.total,
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

  const missionMeta = useMemo(
    () => ({
      jobName: estimator.job.name || 'Untitled mission',
      campus: estimator.job.address || 'Pending campus address',
      contact: 'Facilities team',
      phaseLabel: missionPhase,
      totalArea: estimator.areas.total,
      crackFootage: estimator.cracks.length,
      status: estimator.job.status,
      lastUpdatedIso,
    }),
    [
      estimator.job.name,
      estimator.job.address,
      missionPhase,
      estimator.areas.total,
      estimator.cracks.length,
      estimator.job.status,
      lastUpdatedIso,
    ],
  );

  const missionControlPanel = useMemo(() => <MissionControlPanel estimator={estimator} />, [estimator]);

  const stages = useWorkflowStages({
    estimator,
    measurement: measurementIntel,
    missionControl: missionControlPanel,
    onOpenCompliance: () => setComplianceOpen(true),
    jobId,
  });

  // Visibility instrumentation
  useEffect(() => {
    const mainEl = document.getElementById('main-content');
    const workflowShell = mainEl?.querySelector('[data-workflow-shell]');
    if (mainEl) {
      const rect = mainEl.getBoundingClientRect();
      const computed = window.getComputedStyle(mainEl);
      console.log('[Index] Visibility check:', {
        exists: !!mainEl,
        visible: rect.width > 0 && rect.height > 0,
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        zIndex: computed.zIndex,
        position: computed.position,
        width: rect.width,
        height: rect.height,
        workflowShellExists: !!workflowShell,
        stagesCount: stages.length,
        activeStageId,
      });
    }
  }, [activeStageId, stages.length]);

  useEffect(() => {
    const firstUnlocked = stages.find((stage) => stage.status !== 'locked');
    if (firstUnlocked && firstUnlocked.id !== activeStageId) {
      setActiveStageId(firstUnlocked.id);
    }
  }, [stages, activeStageId]);

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

  const hudWatchers = useMemo<NonNullable<TacticalHudOverlayProps['watchers']>>(() => {
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
    watchers.push({
      label: 'Enhancements',
      value: (premiumSelections + customSelections).toString(),
      tone: premiumSelections + customSelections > 0 ? 'ok' : 'warn',
    });
    const projectedProfit = estimator.calculation.costs?.profit ?? null;
    if (projectedProfit !== null) {
      watchers.push({
        label: 'Projected Profit',
        value: `$${Math.round(projectedProfit).toLocaleString()}`,
        tone: projectedProfit > 0 ? 'ok' : 'critical',
      });
    }
    return watchers;
  }, [
    estimator.areas.items.length,
    estimator.cracks.length,
    estimator.customServices.items.length,
    estimator.premium.crackCleaning,
    estimator.premium.debrisRemoval,
    estimator.premium.edgePushing,
    estimator.premium.powerWashing,
    estimator.premium.weedKiller,
    estimator.calculation.costs?.profit,
  ]);

  const hudOverlay = (
    <HudWrapper
      missionName={missionMeta.jobName}
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
  );

  const cycleWallpaper = useCallback(() => {
    const next = getNextWallpaper(wallpaperId);
    setWallpaperId(next.id);
    logEvent('workflow.wallpaper.cycle', { next: next.id });
  }, [wallpaperId]);

  const handleWallpaperUpload = useCallback(
    async (file: File) => {
      setUploadingWallpaper(true);
      try {
        const optimizedBlob = await optimizeImage(file, {
          maxWidth: 2560,
          maxHeight: 1440,
          quality: 0.82,
          format: 'webp',
        });
        const dataUrl = await blobToDataUrl(optimizedBlob);
        const asset = addWallpaper({
          name: file.name,
          dataUrl,
          accentTone: wallpaper.accentTone,
          description: `${file.name} upload`,
        });
        setWallpaper({
          id: asset.id,
          source: asset.source,
          name: asset.name,
          description: asset.description,
        });
        toast.success('Wallpaper updated', { description: `${asset.name} applied to workflow shell.` });
      } catch (error) {
        console.error('[Index] Failed to upload wallpaper', error);
        toast.error('Unable to process wallpaper');
      } finally {
        setUploadingWallpaper(false);
      }
    },
    [addWallpaper, optimizeImage, setWallpaper, wallpaper.accentTone],
  );

  const openCompliance = useCallback((topic: ComplianceTopic) => {
    setComplianceTopic(topic);
    setComplianceOpen(true);
  }, []);

  useEffect(() => {
    const handler = () => setShortcutsOpen(true);
    window.addEventListener('openShortcuts', handler);
    return () => window.removeEventListener('openShortcuts', handler);
  }, []);

  const wallpaperUploadBusy = uploadingWallpaper || optimizingWallpaper;

  const workflowThemeId = THEME_BY_WALLPAPER[wallpaperId] ?? 'sunrise';

  // Log stages for debugging
  useEffect(() => {
    console.log('[Index] Stages state:', {
      stagesCount: stages.length,
      activeStageId,
      stages: stages.map((s) => ({ id: s.id, status: s.status })),
    });
  }, [stages, activeStageId]);

  return (
    <>
      <main id="main-content" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <h1 className="sr-only">Pavement Performance Suite</h1>
        <WorkflowShell
          stages={stages}
          activeStageId={activeStageId}
          onStageChange={setActiveStageId}
          wallpaper={{
            name: wallpaper.name,
            description: wallpaper.description,
            source: wallpaperAsset?.dataUrl || wallpaper.gradient,
          }}
          onNextWallpaper={cycleWallpaper}
          onUploadWallpaper={handleWallpaperUpload}
          uploadingWallpaper={wallpaperUploadBusy}
          toolbarSlot={<ThemeCommandCenter />}
          hudOverlay={hudOverlay}
          missionMeta={missionMeta}
          workflowThemeId={workflowThemeId}
          jobId={jobId}
        />
      </main>
      <ComplianceResources open={complianceOpen} onOpenChange={setComplianceOpen} activeTopic={complianceTopic} />
      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
});

export default Index;
