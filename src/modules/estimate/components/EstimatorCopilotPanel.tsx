import { ClipboardCheck, Loader2, MessageCircleMore, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateChat } from '@/lib/gemini';
import { logEvent } from '@/lib/logging';
import { retrieveRelevantContext } from '@/lib/rag';
import { buildCopilotPrompt } from '@/modules/estimate/components/copilotPrompt';
import {
  buildScenarioComparisonRows,
  type ScenarioComparisonRow,
} from '@/modules/estimate/components/scenarioMatrixUtils';
import type { ScenarioManager } from '@/modules/estimate/useEstimatorScenarios';

export interface EstimatorCopilotPanelProps {
  scenarioManager: ScenarioManager;
  jobName: string;
  jobAddress: string;
  totalAreaSqFt: number;
}

type CopilotStatus = 'idle' | 'loading' | 'ready' | 'error';

export function EstimatorCopilotPanel({
  scenarioManager,
  jobName,
  jobAddress,
  totalAreaSqFt,
}: EstimatorCopilotPanelProps) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<CopilotStatus>('idle');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo<ScenarioComparisonRow[]>(
    () => buildScenarioComparisonRows(scenarioManager.scenarios, scenarioManager.baseline),
    [scenarioManager.scenarios, scenarioManager.baseline],
  );

  const handleGenerate = async () => {
    if (rows.length === 0) return;
    setStatus('loading');
    setError(null);
    logEvent('estimator.copilot_request', {
      jobName,
      scenarioCount: rows.length,
      totalAreaSqFt,
    });
    try {
      const prompt = buildCopilotPrompt({
        jobName,
        customerAddress: jobAddress,
        totalAreaSqFt,
        userNotes: notes,
        rows,
      });
      const ragContext = await retrieveRelevantContext(
        'church parking lot sealcoating best practices',
      );
      const result = await generateChat(
        prompt,
        ragContext ? `${ragContext}\n\nUse bullet responses.` : undefined,
      );
      setResponse(result.trim());
      setStatus('ready');
      logEvent('estimator.copilot_success', {
        jobName,
        scenarioCount: rows.length,
      });
    } catch (copilotError) {
      const message =
        copilotError instanceof Error
          ? copilotError.message
          : 'Copilot failed to generate recommendations.';
      setError(message);
      setStatus('error');
      logEvent('estimator.copilot_failure', {
        jobName,
        scenarioCount: rows.length,
        message,
      });
    }
  };

  const handleCopy = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      setStatus('ready');
    } catch {
      /* ignore clipboard errors */
    }
  };

  const disableGenerate = rows.length === 0 || status === 'loading';

  return (
    <Card className="border border-white/15 bg-slate-950/70 shadow-[0_40px_120px_rgba(8,12,24,0.55)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-50">
          <Sparkles className="h-5 w-5 text-orange-300" />
          Estimator Copilot
        </CardTitle>
        <CardDescription className="text-slate-300/80">
          AI-generated recommendations grounded in your scenario matrix, compliance posture, and
          mission notes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="copilot-notes"
            className="text-xs uppercase tracking-[0.35em] text-slate-400/80"
          >
            Additional context (optional)
          </Label>
          <Textarea
            id="copilot-notes"
            rows={3}
            placeholder="Add service windows, donor constraints, or other ministry requirements."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="bg-white/5 text-slate-100"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="flex-1 bg-orange-500/90 text-white hover:bg-orange-500"
            disabled={disableGenerate}
            onClick={() => void handleGenerate()}
          >
            {status === 'loading' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {status === 'loading' ? 'Calculating' : 'Generate Guidance'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-white/5 text-slate-100 hover:bg-white/10"
            disabled={!response}
            onClick={() => void handleCopy()}
          >
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Copy Output
          </Button>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {response ? (
          <div className="rounded-2xl border border-white/15 bg-slate-900/80 p-4 text-sm text-slate-100">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-400/80">
              <MessageCircleMore className="h-4 w-4" /> Copilot Summary
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">{response}</div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
