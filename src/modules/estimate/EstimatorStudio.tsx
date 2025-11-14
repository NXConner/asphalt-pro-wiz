import { ClipboardList, Compass, FlaskConical, ThermometerSun } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { cn } from '@/lib/utils';
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
  const layout = useResponsiveLayout();

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

  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStep),
  );
  const progressPercent = ((activeIndex + 1) / steps.length) * 100;
  const isWizardFlow = layout.useWizardFlow;
  const isFirstStep = activeIndex === 0;
  const isLastStep = activeIndex === steps.length - 1;

  return (
    <CanvasPanel
      title="Estimator Studio"
      subtitle="Progressive wizard tailored to church campuses, from square footage capture to proposal-ready numbers."
      eyebrow="Scope + Pricing"
      tone="dusk"
      badge={
        <span className="text-xs font-mono uppercase tracking-widest text-orange-100/90">
          Step {activeIndex + 1} of {steps.length}
        </span>
      }
    >
      <div className={cn('w-full space-y-6', isWizardFlow && 'pb-24 sm:pb-0')}>
        {isWizardFlow ? (
          <MobileWizardStepper
            steps={steps}
            activeIndex={activeIndex}
            activeStep={activeStep}
            onStepChange={goToStep}
            progressPercent={progressPercent}
          />
        ) : null}
        <Tabs value={activeStep} onValueChange={goToStep} className="w-full space-y-6">
          <TabsList
            className={cn(
              'grid w-full grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1 sm:grid-cols-4',
              isWizardFlow && 'hidden sm:grid',
            )}
          >
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
        {isWizardFlow ? (
          <MobileWizardFooter
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            onBack={previousStep}
            onNext={nextStep}
          />
        ) : null}
      </div>
    </CanvasPanel>
  );
}

interface MobileWizardStepperProps {
  steps: Array<{ id: string; title: string; icon: ReactNode }>;
  activeIndex: number;
  activeStep: string;
  progressPercent: number;
  onStepChange: (stepId: string) => void;
}

function MobileWizardStepper({
  steps,
  activeIndex,
  activeStep,
  progressPercent,
  onStepChange,
}: MobileWizardStepperProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_60px_rgba(8,12,24,0.45)] sm:hidden">
      <div className="flex items-center justify-between text-[0.6rem] font-mono uppercase tracking-[0.45em] text-slate-200/70">
        <span>
          Step {activeIndex + 1}/{steps.length}
        </span>
        <span>{steps[activeIndex]?.title}</span>
      </div>
      <Progress
        value={progressPercent}
        className="h-2 rounded-full bg-white/10"
        indicatorClassName="bg-orange-400"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {steps.map((step, index) => {
          const selected = step.id === activeStep;
          return (
            <button
              type="button"
              key={step.id}
              onClick={() => onStepChange(step.id)}
              className={cn(
                'flex min-w-[140px] flex-col rounded-2xl border px-3 py-2 text-left transition',
                selected
                  ? 'border-orange-400/80 bg-orange-400/10 text-orange-50'
                  : 'border-white/10 bg-white/5 text-slate-200/80',
              )}
            >
              <span className="text-[0.55rem] uppercase tracking-[0.5em] text-white/50">
                0{index + 1}
              </span>
              <span className="text-sm font-semibold">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MobileWizardFooterProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
}

function MobileWizardFooter({ isFirstStep, isLastStep, onBack, onNext }: MobileWizardFooterProps) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-[0_25px_60px_rgba(8,12,24,0.6)] backdrop-blur sm:hidden">
      <div className="flex items-center justify-between text-[0.55rem] font-mono uppercase tracking-[0.45em] text-slate-200/70">
        <span>Mobile Wizard</span>
        <span>{isLastStep ? 'Review & Export' : 'Continue Build'}</span>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          className="flex-1 border border-white/20 text-slate-100 hover:bg-white/10"
          onClick={onBack}
          disabled={isFirstStep}
        >
          Back
        </Button>
        <Button
          type="button"
          className="flex-[1.5] bg-orange-500 text-white hover:bg-orange-500/90"
          onClick={onNext}
        >
          {isLastStep ? 'Review Summary' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
