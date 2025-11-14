import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

import AreaSection from '@/components/AreaSection';
import ImageAreaAnalyzer from '@/components/ImageAreaAnalyzer';
import { LayoutOptimizer } from '@/components/Optimizer/LayoutOptimizer';
import { ServiceCategories } from '@/components/ServiceCategories';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VirtualList } from '@/components/VirtualList/VirtualList';
import { generateChat } from '@/lib/gemini';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

interface ScopeStepProps {
  areas: EstimatorState['areas'];
  options: EstimatorState['options'];
  featureFlags: EstimatorState['featureFlags'];
  onNext: () => void;
}

const AREA_ROW_HEIGHT = 168;

export function ScopeStep({ areas, options, featureFlags, onNext }: ScopeStepProps) {
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiSuggest = async () => {
    if (!featureFlags.isEnabled('aiAssistant')) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const summaryLines = [
        `Segments: ${areas.items.length}`,
        `Total area: ${areas.total.toFixed(1)} sq ft`,
        `Services: ${[
          options.includeSealcoating ? 'sealcoating' : null,
          options.includeStriping ? 'striping' : null,
          options.includeCleaningRepair ? 'cleaning & repair' : null,
        ]
          .filter(Boolean)
          .join(', ') || 'none'}`,
      ];
      const prompt = `You are an estimator for church campus asphalt missions. Based on the following scope data suggest key quantity call-outs (coats, prep labor, premium add-ons) and risk watch-outs in 3 concise bullet points.\n${summaryLines.join('\n')}`;
      const response = await generateChat(prompt);
      setAiSuggestion(response?.trim() || 'No recommendation generated.');
    } catch (error) {
      setAiError(
        error instanceof Error ? error.message : 'Unable to generate AI recommendation right now.',
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <section className="space-y-4">
        <p className="text-sm text-slate-200/80">
          Choose the service pillars for this opportunity and capture square footage using quick-add
          shapes, map drawings, or imagery.
        </p>
        <ServiceCategories
          cleaningRepair={options.includeCleaningRepair}
          sealcoating={options.includeSealcoating}
          striping={options.includeStriping}
          onChange={(category, value) => {
            switch (category) {
              case 'includeCleaningRepair':
                options.setIncludeCleaningRepair(value);
                break;
              case 'includeSealcoating':
                options.setIncludeSealcoating(value);
                break;
              case 'includeStriping':
                options.setIncludeStriping(value);
                break;
              default:
                break;
            }
          }}
        />
      </section>

      <section className="space-y-4">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Area Capture</h2>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-200/80 font-medium">
              {areas.items.length} segments • {areas.total.toFixed(1)} sq ft
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={areas.shapeType} onValueChange={areas.setShapeType}>
              <SelectTrigger className="h-9 w-[160px] bg-white/10 text-slate-50" aria-label="Select shape type">
                <SelectValue placeholder="Select Shape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="triangle">Triangle</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="manual">Manual entry</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="h-9 border-white/30 bg-white/10 text-slate-50 hover:bg-white/20"
              onClick={areas.addEmpty}
              aria-label="Add new area shape"
            >
              Add Shape
            </Button>
              {featureFlags.isEnabled('aiAssistant') ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-white/40 bg-purple-500/10 text-slate-50 hover:bg-purple-500/20"
                  onClick={() => void handleAiSuggest()}
                  disabled={aiLoading}
                >
                  {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  AI Scope Assist
                </Button>
              ) : null}
          </div>
        </header>

          <div className="grid gap-3">
            <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="min-w-[180px] flex-1">
                <Label
                  htmlFor="manualArea"
                  className="text-xs uppercase tracking-widest text-slate-200/60"
                >
                  Quick Manual Area (sq ft)
                </Label>
                <Input
                  id="manualArea"
                  type="number"
                  value={areas.manualInput}
                  onChange={(event) => areas.setManualInput(event.target.value)}
                  placeholder="e.g. 1450"
                  className="mt-1 bg-white/10 text-slate-50"
                  aria-label="Enter area in square feet"
                />
              </div>
              <Button
                type="button"
                className="h-10 border border-white/20 bg-orange-500/80 px-4 font-semibold text-white hover:bg-orange-500"
                onClick={areas.addManual}
                aria-label="Add area segment"
              >
                Add Segment
              </Button>
            </div>

            {areas.items.length > 0 ? (
              <>
                {areas.items.length > 8 ? (
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-2">
                    <VirtualList
                      items={areas.items}
                      itemHeight={AREA_ROW_HEIGHT}
                      containerHeight={Math.min(areas.items.length, 6) * AREA_ROW_HEIGHT}
                      overscan={4}
                      className="max-h-[520px]"
                      renderItem={(item) => (
                        <div className="px-1 py-1.5">
                          <AreaSection
                            shape={item.shape}
                            initialArea={item.area}
                            onChange={(value) => areas.update(item.id, value)}
                            onRemove={() => areas.remove(item.id)}
                          />
                        </div>
                      )}
                    />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {areas.items.map((item) => (
                      <AreaSection
                        key={item.id}
                        shape={item.shape}
                        initialArea={item.area}
                        onChange={(value) => areas.update(item.id, value)}
                        onRemove={() => areas.remove(item.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-slate-200/80">
                No segments yet. Use the quick add controls above or trace directly on the Mission
                Control map.
              </div>
            )}
          </div>

          {aiSuggestion ? (
            <Alert className="border-purple-500/60 bg-purple-500/10 text-slate-100">
              <AlertTitle>AI Recommendation</AlertTitle>
              <AlertDescription>{aiSuggestion}</AlertDescription>
            </Alert>
          ) : null}
          {aiError ? (
            <Alert variant="destructive">
              <AlertTitle>Assistant Unavailable</AlertTitle>
              <AlertDescription>{aiError}</AlertDescription>
            </Alert>
          ) : null}

        {featureFlags.isEnabled('optimizer') && areas.total > 0 ? (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <LayoutOptimizer totalAreaSqft={areas.total} />
          </div>
        ) : null}

        {featureFlags.isEnabled('imageAreaAnalyzer') ? (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <ImageAreaAnalyzer onAreaDetected={areas.handleImageAreaDetected} />
          </div>
        ) : null}
      </section>

      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-200/60">
          {areas.items.length} segments logged
        </span>
        <Button type="button" variant="ghost" className="group text-slate-50" onClick={onNext}>
          Continue to Materials
        </Button>
      </div>
    </>
  );
}
