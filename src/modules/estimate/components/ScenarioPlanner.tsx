import { AlertTriangle, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Fragment } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  ScenarioOverrides,
  useEstimatorScenarios,
  formatComplianceSummary,
} from '@/modules/estimate/useEstimatorScenarios';

interface ScenarioPlannerProps {
  manager: ReturnType<typeof useEstimatorScenarios>;
}

export function ScenarioPlanner({ manager }: ScenarioPlannerProps) {
  const { scenarios, addScenario, updateScenario, runScenario, removeScenario, setPrimaryScenario } =
    manager;

  return (
    <section className="rounded-2xl border border-white/15 bg-slate-950/60 p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-50">
            <Sparkles className="h-4 w-4 text-orange-300" /> Scenario Lab
          </h3>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300/60">
            Compare margin, total, and compliance across mission-ready quotes.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/20 bg-white/10 text-slate-50 hover:bg-white/20"
          onClick={() => addScenario()}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Scenario
        </Button>
      </header>

      <div className="mt-4 space-y-4">
        {scenarios.map((scenario) => {
          const computation = scenario.computation;
          return (
            <div
              key={scenario.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-50">{scenario.name}</h4>
                  {scenario.description ? (
                    <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-300/70">
                      {scenario.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`primary-${scenario.id}`}
                    checked={scenario.isPrimary}
                    onCheckedChange={() => setPrimaryScenario(scenario.id)}
                  />
                  <Label htmlFor={`primary-${scenario.id}`} className="text-xs text-slate-200/70">
                    Primary
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-300 hover:bg-red-500/10"
                    onClick={() => removeScenario(scenario.id)}
                    aria-label={`Remove ${scenario.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScenarioControls
                overrides={scenario.overrides}
                disabled={scenario.status === 'running'}
                onChange={(next) => updateScenario(scenario.id, next)}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-100">
                {computation ? (
                  <Fragment>
                    <span>Total: ${computation.costs.total.toFixed(2)}</span>
                    <span>Profit: ${computation.costs.profit.toFixed(2)}</span>
                    <span>
                      Margin:{' '}
                      {computation.costs.total > 0
                        ? `${((computation.costs.profit / computation.costs.total) * 100).toFixed(
                            2,
                          )}%`
                        : 'n/a'}
                    </span>
                    <span>Compliance: {formatComplianceSummary(computation.compliance.issues)}</span>
                  </Fragment>
                ) : scenario.status === 'running' ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Calculating…
                  </span>
                ) : (
                  <span>No calculation yet.</span>
                )}
              </div>

              {scenario.error ? (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-xs text-red-200">
                  <AlertTriangle className="h-4 w-4" /> {scenario.error}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-orange-500/80 text-white hover:bg-orange-500"
                  onClick={() => runScenario(scenario.id)}
                  disabled={scenario.status === 'running'}
                >
                  {scenario.status === 'running' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Recalculate
                </Button>
                <TagRow overrides={scenario.overrides} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ScenarioControls({
  overrides,
  disabled,
  onChange,
}: {
  overrides: ScenarioOverrides;
  disabled: boolean;
  onChange: (next: ScenarioOverrides) => void;
}) {
  const project = overrides.project ?? {};
  const business = overrides.business ?? {};
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1">
        <Label className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
          Sealcoat Passes
        </Label>
        <Input
          type="number"
          min={1}
          max={5}
          value={project.numCoats ?? ''}
          onChange={(event) =>
            onChange({
              project: { ...project, numCoats: Number(event.target.value || 0) },
            })
          }
          disabled={disabled}
          className="bg-white/10 text-slate-50"
        />
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
        <Label className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
          Striping Included
        </Label>
        <Switch
          checked={project.includeStriping ?? true}
          onCheckedChange={(value) =>
            onChange({
              project: { ...project, includeStriping: value },
            })
          }
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
        <Label className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
          Power Washing
        </Label>
        <Switch
          checked={project.premiumPowerWashing ?? false}
          onCheckedChange={(value) =>
            onChange({
              project: { ...project, premiumPowerWashing: value },
            })
          }
          disabled={disabled}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
          Profit Target %
        </Label>
        <Input
          type="number"
          min={5}
          max={75}
          value={business.profitPercent ?? ''}
          onChange={(event) =>
            onChange({
              business: { ...business, profitPercent: Number(event.target.value || 0) },
            })
          }
          disabled={disabled}
          className="bg-white/10 text-slate-50"
        />
      </div>
    </div>
  );
}

function TagRow({ overrides }: { overrides: ScenarioOverrides }) {
  const tags: string[] = [];
  if (overrides.project?.numCoats !== undefined) tags.push(`${overrides.project.numCoats} coats`);
  if (overrides.project?.premiumPowerWashing) tags.push('Power Wash');
  if (overrides.project?.includeStriping === false) tags.push('No Striping');
  if (overrides.business?.profitPercent !== undefined)
    tags.push(`Profit ${overrides.business.profitPercent}%`);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-200/80"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
