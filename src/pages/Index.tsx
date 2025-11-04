import { Shield } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ComplianceResources, type ComplianceTopic } from '@/components/ComplianceResources';
import { Button } from '@/components/ui/button';
import { EngagementHubPanel } from '@/modules/engagement/EngagementHubPanel';
import { EstimatorStudio } from '@/modules/estimate/EstimatorStudio';
import { useEstimatorState } from '@/modules/estimate/useEstimatorState';
import { InsightTowerPanel } from '@/modules/insights/InsightTowerPanel';
import { CanvasPanel } from '@/modules/layout/CanvasPanel';
import { OperationsCanvas } from '@/modules/layout/OperationsCanvas';
import { OperationsHeader } from '@/modules/layout/OperationsHeader';
import { DEFAULT_WALLPAPER, getNextWallpaper, getWallpaperById } from '@/modules/layout/wallpapers';
import { MissionControlPanel } from '@/modules/mission-control/MissionControlPanel';

const Index = () => {
  const estimator = useEstimatorState();
  const [wallpaperId, setWallpaperId] = useState(DEFAULT_WALLPAPER.id);
  const wallpaper = useMemo(() => getWallpaperById(wallpaperId), [wallpaperId]);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [complianceTopic, setComplianceTopic] = useState<ComplianceTopic>('striping');

  const summary = useMemo(
    () => ({
      jobName: estimator.job.name,
      totalArea: estimator.areas.total,
      totalCost: estimator.calculation.costs?.total ?? null,
    }),
    [estimator.job.name, estimator.areas.total, estimator.calculation.costs?.total],
  );

  const cycleWallpaper = () => {
    const next = getNextWallpaper(wallpaperId);
    setWallpaperId(next.id);
  };

  const openCompliance = (topic: ComplianceTopic) => {
    setComplianceTopic(topic);
    setComplianceOpen(true);
  };

  return (
    <>
      <main id="main-content">
        <h1 className="sr-only">Pavement Performance Suite</h1>
        <OperationsCanvas
          wallpaper={wallpaper}
          header={
            <OperationsHeader
              wallpaper={wallpaper}
              onNextWallpaper={cycleWallpaper}
              summary={summary}
            />
          }
          missionControl={<MissionControlPanel estimator={estimator} />}
          estimatorStudio={<EstimatorStudio estimator={estimator} />}
          insightTower={<InsightTowerPanel estimator={estimator} />}
          engagementHub={
            <div className="space-y-6">
              <EngagementHubPanel estimator={estimator} />
              <CanvasPanel
                title="Regulatory Toolkit"
                subtitle="Jump into ADA, VDOT, and NC DOT resources before finalizing proposals."
                eyebrow="Compliance"
                tone="ember"
                action={
                  <Button
                    type="button"
                    variant="secondary"
                    className="border-white/20 bg-white/10 text-slate-50 hover:bg-white/20"
                    onClick={() => openCompliance(complianceTopic)}
                  >
                    <Shield className="mr-2 h-4 w-4" /> Open Library
                  </Button>
                }
              >
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-slate-100/90 hover:bg-white/15"
                    onClick={() => openCompliance('striping')}
                  >
                    ADA & Striping
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-slate-100/90 hover:bg-white/15"
                    onClick={() => openCompliance('sealcoating')}
                  >
                    Sealcoat Specs
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-slate-100/90 hover:bg-white/15"
                    onClick={() => openCompliance('crackfilling')}
                  >
                    Crack Filling SOP
                  </Button>
                </div>
              </CanvasPanel>
            </div>
          }
          footer={
            <span>
              Mission control tailored for small crews serving church campuses. Refresh your dev
              server if updates are missing.
            </span>
          }
        />
      </main>
      <ComplianceResources
        open={complianceOpen}
        onOpenChange={setComplianceOpen}
        activeTopic={complianceTopic}
      />
    </>
  );
};

export default Index;
