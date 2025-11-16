import { formatDistanceToNow } from 'date-fns';
import { Calculator, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CustomServices } from '@/components/CustomServices';
import { Button } from '@/components/ui/button';
import { ComplianceChecklist } from '@/modules/estimate/components/ComplianceChecklist';
import { EstimatorCopilotPanel } from '@/modules/estimate/components/EstimatorCopilotPanel';
import { ProfitSensitivityChart } from '@/modules/estimate/components/ProfitSensitivityChart';
import { ScenarioComparisonMatrix } from '@/modules/estimate/components/ScenarioComparisonMatrix';
import { ScenarioPlanner } from '@/modules/estimate/components/ScenarioPlanner';
import { useEstimatorScenarios } from '@/modules/estimate/useEstimatorScenarios';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

interface ReviewStepProps {
  areas: EstimatorState['areas'];
  striping: EstimatorState['striping'];
  materials: EstimatorState['materials'];
  customServices: EstimatorState['customServices'];
  calculation: EstimatorState['calculation'];
  cracks: EstimatorState['cracks'];
  options: EstimatorState['options'];
  premium: EstimatorState['premium'];
  logistics: EstimatorState['logistics'];
  business: EstimatorState['business'];
  job: EstimatorState['job'];
  onBack: () => void;
  featureFlags: EstimatorState['featureFlags'];
}

export function ReviewStep({
  areas,
  striping,
  materials,
  customServices,
  calculation,
  cracks,
  options,
  premium,
  logistics,
  business,
  job,
  onBack,
  featureFlags,
}: ReviewStepProps) {
  const [isExporting, setIsExporting] = useState(false);
  const primaryScenarioSignature = useMemo(
    () =>
      JSON.stringify({
        totalArea: areas.total,
        numCoats: materials.numCoats,
        includeStriping: options.includeStriping,
        includeSealcoating: options.includeSealcoating,
        includeCleaningRepair: options.includeCleaningRepair,
        premiumPowerWashing: premium.powerWashing,
        profitPercent: business.data.profitPercent,
        overheadPercent: business.data.overheadPercent,
        oilSpots: logistics.oilSpots,
        prepHours: logistics.prepHours,
        polymerAdded: materials.polymerAdded,
      }),
    [
      areas.total,
      materials.numCoats,
      options.includeStriping,
      options.includeSealcoating,
      options.includeCleaningRepair,
      premium.powerWashing,
      business.data.profitPercent,
      business.data.overheadPercent,
      logistics.oilSpots,
      logistics.prepHours,
      materials.polymerAdded,
    ],
  );

  const scenarioManager = useEstimatorScenarios({
    simulate: calculation.simulate,
    baselineSignature: primaryScenarioSignature,
  });
  const copilotEnabled =
    featureFlags.isEnabled('aiAssistant') && featureFlags.isEnabled('estimatorCopilot');

  const primaryScenario =
    scenarioManager.scenarios.find((scenario) => scenario.isPrimary) ??
    scenarioManager.scenarios[0] ??
    null;

  const exportScenario = primaryScenario?.computation ?? scenarioManager.baseline;

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await calculation.exportPdf({
        scenarioName: primaryScenario?.name ?? 'Primary Scenario',
        computation: exportScenario,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-50">
              Custom Services &amp; Final Checks
            </h3>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-200/60">
              {customServices.items.length} custom line items | {areas.total.toFixed(1)} sq ft scope
            </p>
          </div>
        </header>
        <CustomServices
          totalArea={areas.total}
          crackLength={cracks.length}
          value={customServices.items}
          onChange={customServices.setItems}
        />
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-50">Readiness Summary</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-200/80">
              <li>
                • {areas.total.toFixed(1)} sq ft across {areas.items.length} area segments
              </li>
              <li>
                • {striping.lines} lines, {striping.handicap} handicap stalls,{' '}
                {striping.arrowsLarge + striping.arrowsSmall} arrow markings
              </li>
              <li>
                • {materials.numCoats} coat plan ·{' '}
                {materials.sandAdded ? 'Sand Additive' : 'No Sand'} ·{' '}
                {materials.polymerAdded ? 'Fast-dry polymer' : 'Standard dry time'}
              </li>
              <li>• Travel window {job.distance.toFixed(1)} miles round trip</li>
            </ul>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-200/60">
              Estimated Total
            </span>
            <span className="text-3xl font-semibold text-slate-50">
              {calculation.costs ? `$${calculation.costs.total.toFixed(2)}` : 'Pending'}
            </span>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-50">Generate Mission Estimate</h3>
            <p className="text-sm text-slate-200/80">
              This wraps up the calculation run and surfaces cost intelligence to the Insight Tower.
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            className="bg-orange-500/90 text-white shadow-lg shadow-orange-500/40 hover:bg-orange-500"
            onClick={() => void calculation.handleCalculate()}
            disabled={calculation.isSaving}
          >
            {calculation.isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="mr-2 h-4 w-4" />
            )}
            {calculation.isSaving ? 'Syncing Estimate…' : 'Generate Estimate'}
          </Button>
        </div>
        {calculation.showResults && calculation.costs ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-slate-100">
            <div className="flex flex-wrap justify-between gap-2">
              <span>Material &amp; Labor Subtotal</span>
              <span>${calculation.costs.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <span>Overhead</span>
              <span>${calculation.costs.overhead.toFixed(2)}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <span>Profit</span>
              <span>${calculation.costs.profit.toFixed(2)}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-2 font-semibold">
              <span>Total Quote</span>
              <span>${calculation.costs.total.toFixed(2)}</span>
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-1 text-xs text-slate-200/70">
          {calculation.lastSyncedAt ? (
            <span>
              Synced {formatDistanceToNow(new Date(calculation.lastSyncedAt), { addSuffix: true })}
              {calculation.lastSyncedEstimateId
                ? ` • Estimate ${calculation.lastSyncedEstimateId.slice(0, 8)}`
                : ''}
            </span>
          ) : calculation.showResults ? (
            <span>
              Sync the estimate to push totals into the Command Center and customer deliverables.
            </span>
          ) : null}
          {calculation.syncError ? (
            <span className="text-red-300">Sync error: {calculation.syncError}</span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScenarioPlanner manager={scenarioManager} />
        <ProfitSensitivityChart
          baselineId={primaryScenario?.id ?? scenarioManager.scenarios[0]?.id ?? 'baseline'}
          scenarios={scenarioManager.scenarios}
        />
      </div>

      {copilotEnabled ? <ScenarioComparisonMatrix manager={scenarioManager} /> : null}

      {copilotEnabled ? (
        <EstimatorCopilotPanel
          scenarioManager={scenarioManager}
          jobName={job.name}
          jobAddress={job.address}
          totalAreaSqFt={areas.total}
        />
      ) : null}

      <ComplianceChecklist issues={scenarioManager.baseline.compliance.issues} />

      <div className="flex items-center justify-between">
        <Button variant="ghost" className="text-slate-200" onClick={onBack}>
          Back to Striping
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/20 bg-white/10 text-slate-50 hover:bg-white/20"
          onClick={calculation.handlePrint}
          disabled={!calculation.showResults}
        >
          Print Proposal Snapshot
        </Button>
        <Button
          type="button"
          className="bg-emerald-500/90 text-white hover:bg-emerald-500"
          onClick={() => void handleExportPdf()}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Export Proposal PDF
        </Button>
      </div>
    </>
  );
}
