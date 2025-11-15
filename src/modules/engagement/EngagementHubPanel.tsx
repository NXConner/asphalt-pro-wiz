import { memo, useId } from 'react';

import { AIGemini } from '@/components/AIGemini';
import { BusinessSettings } from '@/components/BusinessSettings';
import { CustomerInvoice } from '@/components/CustomerInvoice';
import { DocumentGenerator } from '@/components/DocumentGenerator';
import { OwnerSettings } from '@/components/OwnerSettings';
import { PremiumServices } from '@/components/PremiumServices';
import { ReceiptsPanel } from '@/components/ReceiptsPanel';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UploadsPanel } from '@/components/UploadsPanel';
import type { FeatureFlag } from '@/lib/flags';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';
import { CanvasPanel } from '@/modules/layout/CanvasPanel';
import { MissionSchedulerPanel, MissionSchedulerProvider } from '@/modules/scheduler';

interface EngagementHubPanelProps {
  estimator: EstimatorState;
}

const FEATURE_FLAG_LABELS: Record<string, { title: string; description: string }> = {
  aiAssistant: {
    title: 'AI Copilot',
    description: 'Conversational support for quotes, risk alerts, and executive summaries.',
  },
  imageAreaAnalyzer: {
    title: 'Image Area Analyzer',
    description: 'Upload blueprint or drone imagery to auto-detect lot boundaries.',
  },
  receipts: {
    title: 'Receipts Ledger',
    description: 'Attach and categorize expenses for each job with indexed search.',
  },
  scheduler: {
    title: 'Scheduler',
    description: 'Crew blackout calendar, assignments, and weather-sensitive planning.',
  },
  optimizer: {
    title: 'Layout Optimizer',
    description: 'AI-powered layout suggestions to max parking count and flow.',
  },
  customerPortal: {
    title: 'Customer Portal',
    description: 'Share proposals, invoices, and progress visuals with church admins.',
  },
  observability: {
    title: 'Observability',
    description: 'Client-side telemetry + Supabase logging for reliability reporting.',
  },
  pwa: {
    title: 'Offline PWA',
    description: 'Enable installable experience for on-site crews with caching.',
  },
  i18n: {
    title: 'Internationalization',
    description: 'Expose translation tooling for multi-lingual faith communities.',
  },
  commandCenter: {
    title: 'Executive Command Center',
    description:
      'Unlock the analytics dashboard for revenue, utilization, and scheduling insights.',
  },
};

export const EngagementHubPanel = memo(function EngagementHubPanel({
  estimator,
}: EngagementHubPanelProps) {
  const { premium, customServices, calculation, job, business, featureFlags } = estimator;
  const ownerModeId = useId();

  return (
    <div className="space-y-6">
      <CanvasPanel
        id="premium-services-marketplace"
        title="Premium Services Marketplace"
        subtitle="Upsell enhancements tuned for church campuses — margin-positive, mission-aligned."
        eyebrow="Revenue"
        tone="ember"
        collapsible
        defaultCollapsed
        collapseId="premium-services-marketplace"
      >
        <PremiumServices
          edgePushing={premium.edgePushing}
          weedKiller={premium.weedKiller}
          crackCleaning={premium.crackCleaning}
          powerWashing={premium.powerWashing}
          debrisRemoval={premium.debrisRemoval}
          onChange={premium.handlePremiumServiceChange}
          onAddCustomService={customServices.addFromCatalog}
          addedServiceNames={customServices.addedNames}
        />
      </CanvasPanel>

      <CanvasPanel
        title="Client Deliverables"
        subtitle="Generate branded documents, attach receipts, and share field photos with the customer."
        eyebrow="Docs & Media"
        tone="dusk"
      >
        <section className="space-y-6">
          {calculation.showResults && calculation.costs ? (
            <CustomerInvoice
              jobName={job.name}
              customerAddress={job.address}
              costs={calculation.costs}
              breakdown={calculation.breakdown}
              onPrint={calculation.handlePrint}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-slate-200/80">
              Generate an estimate to unlock the branded invoice preview for this mission.
            </p>
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            <DocumentGenerator jobName={job.name} customerAddress={job.address} />
            <UploadsPanel jobName={job.name} customerAddress={job.address} />
          </div>
          {featureFlags.values.receipts ? (
            <ReceiptsPanel jobName={job.name} customerAddress={job.address} />
          ) : null}
        </section>
      </CanvasPanel>

      <CanvasPanel
        title="Operations Control Center"
        subtitle="Tune business defaults, theming, and experimental feature toggles for the team."
        eyebrow="Configuration"
        tone="lagoon"
      >
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <BusinessSettings data={business.data} onChange={business.setData} />
            <ThemeCustomizer />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-50">Feature Flags</h3>
            <div className="grid gap-3">
              {Object.entries(FEATURE_FLAG_LABELS).map(([flag, meta]) => (
                <FlagToggle
                  key={flag}
                  title={meta.title}
                  description={meta.description}
                  checked={Boolean(featureFlags.values[flag as keyof typeof featureFlags.values])}
                  onCheckedChange={(checked) =>
                    featureFlags.toggleFlag(flag as FeatureFlag, checked)
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
            <Switch
              id={ownerModeId}
              checked={featureFlags.ownerMode}
              onCheckedChange={featureFlags.setOwnerMode}
              aria-describedby={`${ownerModeId}-description`}
            />
            <div>
              <Label htmlFor={ownerModeId} className="text-sm font-semibold text-slate-50">
                Owner Mode
              </Label>
              <p id={`${ownerModeId}-description`} className="text-xs text-slate-200/70">
                Unlock owner-only controls like material blends, margin guardrails, and
                observability sampling.
              </p>
            </div>
          </div>
        </section>
      </CanvasPanel>

      {featureFlags.ownerMode ? (
        <CanvasPanel
          title="Owner Control Deck"
          subtitle="Fine-tune material blends and water percentages when the owner is in command."
          eyebrow="Advanced"
          tone="aurora"
        >
          <OwnerSettings
            waterPercent={estimator.materials.waterPercent}
            onWaterPercentChange={estimator.materials.setWaterPercent}
            sealerType={estimator.materials.sealerType}
            onSealerTypeChange={(value) =>
              estimator.materials.setSealerType(
                value as 'Acrylic' | 'Asphalt Emulsion' | 'Coal Tar' | 'PMM' | 'Other',
              )
            }
            sandType={estimator.materials.sandType}
            onSandTypeChange={(value) =>
              estimator.materials.setSandType(value as 'Black Beauty' | 'Black Diamond' | 'Other')
            }
          />
        </CanvasPanel>
      ) : null}

      {featureFlags.values.aiAssistant ? (
        <CanvasPanel
          title="AI Copilot"
          subtitle="Ask mission-critical questions, summarize proposals, or draft client communication."
          eyebrow="Intelligence"
          tone="dusk"
        >
          <AIGemini />
        </CanvasPanel>
      ) : null}

      {featureFlags.values.scheduler ? (
        <MissionSchedulerProvider>
          <CanvasPanel
            title="Crew Scheduler"
            subtitle="Align crews to blackout windows and weather advisories for minimal Sunday disruption."
            eyebrow="Operations"
            tone="lagoon"
          >
            <MissionSchedulerPanel coords={job.coords} />
          </CanvasPanel>
        </MissionSchedulerProvider>
      ) : null}
    </div>
  );
});

interface FlagToggleProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

function FlagToggle({ title, description, checked, onCheckedChange }: FlagToggleProps) {
  const switchId = useId();
  const descriptionId = `${switchId}-description`;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
      <Switch
        id={switchId}
        aria-describedby={descriptionId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
      <span className="space-y-1">
        <Label htmlFor={switchId} className="block text-sm font-semibold text-slate-50">
          {title}
        </Label>
        <span id={descriptionId} className="block text-xs text-slate-200/70">
          {description}
        </span>
      </span>
    </div>
  );
}
