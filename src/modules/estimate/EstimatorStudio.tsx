import { ClipboardList, Compass, FlaskConical, ThermometerSun } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MaterialsStep } from '@/modules/estimate/components/MaterialsStep';
import { ReviewStep } from '@/modules/estimate/components/ReviewStep';
import { ScopeStep } from '@/modules/estimate/components/ScopeStep';
import { StripingStep } from '@/modules/estimate/components/StripingStep';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';
import { CanvasPanel } from '@/modules/layout/CanvasPanel';

interface EstimatorStudioProps {
  estimator: EstimatorState;
}

const STEP_DEFINITIONS = [
  { id: 'scope', title: 'Scope', icon: <Compass className="h-4 w-4" /> },
  { id: 'materials', title: 'Materials', icon: <FlaskConical className="h-4 w-4" /> },
  { id: 'striping', title: 'Striping', icon: <ThermometerSun className="h-4 w-4" /> },
  { id: 'review', title: 'Review', icon: <ClipboardList className="h-4 w-4" /> },
];

export function EstimatorStudio({ estimator }: EstimatorStudioProps) {
  const steps = useMemo(() => STEP_DEFINITIONS, []);
  const [activeStep, setActiveStep] = useState<string>(steps[0]?.id ?? 'scope');

  const goToStep = (stepId: string) => setActiveStep(stepId);
  const nextStep = () => {
    const index = steps.findIndex((step) => step.id === activeStep);
    const next = steps[Math.min(index + 1, steps.length - 1)].id;
    setActiveStep(next);
  };
  const previousStep = () => {
    const index = steps.findIndex((step) => step.id === activeStep);
    const prev = steps[Math.max(index - 1, 0)].id;
    setActiveStep(prev);
  };

  return (
    <CanvasPanel
      title="Estimator Studio"
      subtitle="Progressive wizard tailored to church campuses, from square footage capture to proposal-ready numbers."
      eyebrow="Scope + Pricing"
      tone="dusk"
      badge={
        <span className="text-xs font-mono uppercase tracking-widest text-orange-100/90">
          Step {steps.findIndex((step) => step.id === activeStep) + 1} of {steps.length}
        </span>
      }
    >
      <Tabs value={activeStep} onValueChange={goToStep} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1 sm:grid-cols-4">
          {steps.map((step) => (
            <TabsTrigger
              key={step.id}
              value={step.id}
              className="group flex items-center justify-center gap-2 rounded-2xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-widest text-slate-200/80 transition hover:border-white/20 hover:bg-white/10 data-[state=active]:border-white/30 data-[state=active]:bg-white/20 data-[state=active]:text-slate-50"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                {step.icon}
              </span>
              {step.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="scope" className="space-y-8">
          <ScopeStep
            areas={estimator.areas}
            options={estimator.options}
            featureFlags={estimator.featureFlags}
            onNext={nextStep}
          />
        </TabsContent>

        <TabsContent value="materials" className="space-y-8">
          <MaterialsStep
            materials={estimator.materials}
            options={estimator.options}
            cracks={estimator.cracks}
            logistics={estimator.logistics}
            job={estimator.job}
            featureFlags={estimator.featureFlags}
            onNext={nextStep}
            onBack={previousStep}
          />
        </TabsContent>

        <TabsContent value="striping" className="space-y-8">
          <StripingStep
            striping={estimator.striping}
            premium={estimator.premium}
            onNext={nextStep}
            onBack={previousStep}
          />
        </TabsContent>

        <TabsContent value="review" className="space-y-8">
          <ReviewStep
            areas={estimator.areas}
            striping={estimator.striping}
            materials={estimator.materials}
            customServices={estimator.customServices}
            calculation={estimator.calculation}
            cracks={estimator.cracks}
              options={estimator.options}
              premium={estimator.premium}
              logistics={estimator.logistics}
              business={estimator.business}
              job={estimator.job}
            onBack={previousStep}
          />
        </TabsContent>
      </Tabs>
    </CanvasPanel>
  );
}
