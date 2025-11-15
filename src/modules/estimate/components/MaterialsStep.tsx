import { cloneElement, isValidElement, useMemo, type ReactElement, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logEvent } from '@/lib/logging';
import { SupplierIntelPanel } from '@/modules/estimate/components/SupplierIntelPanel';
import { useSupplierIntelligence } from '@/modules/estimate/supplier';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

interface MaterialsStepProps {
  materials: EstimatorState['materials'];
  options: EstimatorState['options'];
  cracks: EstimatorState['cracks'];
  logistics: EstimatorState['logistics'];
  job: EstimatorState['job'];
  featureFlags: EstimatorState['featureFlags'];
  onNext: () => void;
  onBack: () => void;
}

export function MaterialsStep({
  materials,
  options,
  cracks,
  logistics,
  job,
  featureFlags,
  onNext,
  onBack,
}: MaterialsStepProps) {
  const supplierIntelEnabled = featureFlags.isEnabled('aiAssistant');
  const requestedMaterials = useMemo(() => {
    const unique = new Set<string>();
    if (options.includeSealcoating && materials.sealerType) {
      unique.add(`${materials.sealerType} Sealer`);
    }
    if (materials.sandAdded && materials.sandType) {
      unique.add(`${materials.sandType} Sand`);
    }
    if (materials.polymerAdded) {
      unique.add('Fast-Dry Polymer');
    }
    if (options.includeCleaningRepair) {
      unique.add('Crack Filler');
    }
    return Array.from(unique);
  }, [
    materials.sealerType,
    materials.sandType,
    materials.sandAdded,
    materials.polymerAdded,
    options.includeSealcoating,
    options.includeCleaningRepair,
  ]);

  const supplierRadiusMiles = useMemo(() => {
    if (!job.supplierDistance || !Number.isFinite(job.supplierDistance)) {
      return undefined;
    }
    return Math.max(10, Math.round(job.supplierDistance / 2));
  }, [job.supplierDistance]);

  const jobLocation = useMemo(() => {
    if (!job.coords) return undefined;
    return { lat: job.coords[0], lng: job.coords[1] };
  }, [job.coords]);

  const supplierIntelQuery = useSupplierIntelligence({
    materials: requestedMaterials,
    radiusMiles: supplierRadiusMiles,
    jobLocation,
    enabled: supplierIntelEnabled,
  });

  const handleRefreshIntel = () => {
    logEvent('analytics.supplier_intel_refresh', {
      materialsTracked: requestedMaterials.length,
    });
    void supplierIntelQuery.refetch();
  };

  const showSupplierIntel = supplierIntelEnabled;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-50">Sealcoating Blend</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Coats">
              <Select value={materials.numCoats.toString()} onValueChange={(value) => materials.setNumCoats(parseInt(value, 10))}>
                <SelectTrigger className="mt-1 h-10 bg-white/10 text-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((coats) => (
                    <SelectItem key={coats} value={coats.toString()}>
                      {coats}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sand Additive">
              <Select value={materials.sandAdded ? "yes" : "no"} onValueChange={(value) => materials.setSandAdded(value === "yes")}>
                <SelectTrigger className="mt-1 h-10 bg-white/10 text-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fast-Dry Polymer">
              <Select value={materials.polymerAdded ? "yes" : "no"} onValueChange={(value) => materials.setPolymerAdded(value === "yes")}>
                <SelectTrigger className="mt-1 h-10 bg-white/10 text-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Water %">
              <Input
                type="number"
                value={materials.waterPercent}
                onChange={(event) => materials.setWaterPercent(Number(event.target.value) || 0)}
                className="mt-1 bg-white/10 text-slate-50"
                min={0}
                max={50}
              />
            </Field>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-50">Material Preferences</h2>
          <Field label="Sealer Type">
            <Select value={materials.sealerType} onValueChange={materials.setSealerType}>
              <SelectTrigger className="mt-1 h-10 bg-white/10 text-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Acrylic">Acrylic</SelectItem>
                <SelectItem value="Asphalt Emulsion">Asphalt Emulsion</SelectItem>
                <SelectItem value="Coal Tar">Coal Tar</SelectItem>
                <SelectItem value="PMM">PMM</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Sand Type">
            <Select value={materials.sandType} onValueChange={materials.setSandType}>
              <SelectTrigger className="mt-1 h-10 bg-white/10 text-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Black Beauty">Black Beauty</SelectItem>
                <SelectItem value="Black Diamond">Black Diamond</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>

        {showSupplierIntel ? (
          <SupplierIntelPanel
            data={supplierIntelQuery.data}
            error={supplierIntelQuery.error ?? null}
            isLoading={supplierIntelQuery.isLoading}
            isRefetching={supplierIntelQuery.isRefetching}
            onRefresh={handleRefreshIntel}
            showSetupHint={requestedMaterials.length === 0}
          />
        ) : null}

      {options.includeCleaningRepair ? (
        <section className="space-y-3">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-50">Crack Filling Profile</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-200/80 font-medium">{cracks.length.toFixed(1)} ft total</span>
          </header>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Length (ft)">
              <Input
                type="number"
                value={cracks.length}
                onChange={(event) => cracks.setLength(Number(event.target.value) || 0)}
                className="mt-1 bg-white/10 text-slate-50"
              />
            </Field>
            <Field label="Width (in)">
              <Input
                type="number"
                step="0.25"
                value={cracks.width}
                onChange={(event) => cracks.setWidth(Number(event.target.value) || 0)}
                className="mt-1 bg-white/10 text-slate-50"
              />
            </Field>
            <Field label="Depth (in)">
              <Input
                type="number"
                step="0.25"
                value={cracks.depth}
                onChange={(event) => cracks.setDepth(Number(event.target.value) || 0)}
                className="mt-1 bg-white/10 text-slate-50"
              />
            </Field>
          </div>
          <p className="text-xs text-slate-200/70">Material spec: {cracks.fillerProduct}</p>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <Field label="Prep Hours">
          <Input
            type="number"
            value={logistics.prepHours}
            onChange={(event) => logistics.setPrepHours(Number(event.target.value) || 0)}
            className="mt-1 bg-white/10 text-slate-50"
            min={0}
          />
        </Field>
        <Field label="Propane Tanks">
          <Input
            type="number"
            value={logistics.propaneTanks}
            onChange={(event) => logistics.setPropaneTanks(Number(event.target.value) || 0)}
            className="mt-1 bg-white/10 text-slate-50"
            min={0}
          />
        </Field>
        <Field label="Oil Spots">
          <Input
            type="number"
            value={logistics.oilSpots}
            onChange={(event) => logistics.setOilSpots(Number(event.target.value) || 0)}
            className="mt-1 bg-white/10 text-slate-50"
            min={0}
          />
        </Field>
      </section>

      <div className="flex items-center justify-between">
        <Button variant="ghost" className="text-slate-200" onClick={onBack}>
          Back to Scope
        </Button>
        <Button type="button" variant="ghost" className="group text-slate-50" onClick={onNext}>
          Continue to Striping
        </Button>
      </div>
    </>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
  htmlFor?: string;
}

function Field({ label, children, htmlFor }: FieldProps) {
  // Generate a unique ID if not provided
  const fieldId = htmlFor || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Clone child element and add id if it's a valid React element
  const childWithId = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, { id: fieldId })
    : children;
  
  return (
    <label className="block" htmlFor={fieldId}>
      <span className="text-xs uppercase tracking-widest text-slate-200/80 font-medium">{label}</span>
      {childWithId}
    </label>
  );
}
