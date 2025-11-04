import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { EstimatorState, StripingColor } from "@/modules/estimate/useEstimatorState";

const STRIPING_COLORS: StripingColor[] = ["White", "Yellow", "Blue", "Red", "Green"];

interface StripingStepProps {
  striping: EstimatorState["striping"];
  premium: EstimatorState["premium"];
  onNext: () => void;
  onBack: () => void;
}

export function StripingStep({ striping, premium, onNext, onBack }: StripingStepProps) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumericField label="Lines" value={striping.lines} onChange={striping.setLines} />
            <NumericField label="Handicap" value={striping.handicap} onChange={striping.setHandicap} />
            <NumericField
              label="Large Arrows"
              value={striping.arrowsLarge}
              onChange={striping.setArrowsLarge}
            />
            <NumericField
              label="Small Arrows"
              value={striping.arrowsSmall}
              onChange={striping.setArrowsSmall}
            />
            <NumericField label="Lettering" value={striping.lettering} onChange={striping.setLettering} />
            <NumericField label="Curb ft" value={striping.curb} onChange={striping.setCurb} />
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-50">Color Palette</h3>
          <div className="flex flex-wrap gap-2">
            {STRIPING_COLORS.map((color) => {
              const checked = striping.colors.includes(color);
              return (
                <Button
                  key={color}
                  type="button"
                  variant={checked ? "default" : "outline"}
                  className={
                    checked
                      ? "border-white/40 bg-white/20 text-slate-50"
                      : "border-white/20 bg-white/5 text-slate-100/80"
                  }
                  onClick={() => striping.toggleColor(color, !checked)}
                >
                  {color}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-slate-200/70">
            Combine colors to mirror sanctuary branding or parking ministry zones.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-50">Premium Enhancements</h3>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-200/60">
            Upsell margin guardrails
          </span>
        </header>
        <div className="grid gap-3 sm:grid-cols-2">
          <PremiumToggle
            label="Edge Pushing"
            description="Paired for sidewalk control near sanctuary entrances."
            checked={premium.edgePushing}
            onCheckedChange={(value) => premium.handlePremiumServiceChange("premiumEdgePushing", value)}
          />
          <PremiumToggle
            label="Weed Killer"
            description="Perimeter pre-treatment for gravel and island edges."
            checked={premium.weedKiller}
            onCheckedChange={(value) => premium.handlePremiumServiceChange("premiumWeedKiller", value)}
          />
          <PremiumToggle
            label="Crack Cleaning"
            description="Heat-lance cleaning for maximum crack sealing bond."
            checked={premium.crackCleaning}
            onCheckedChange={(value) => premium.handlePremiumServiceChange("premiumCrackCleaning", value)}
          />
          <PremiumToggle
            label="Power Washing"
            description="Sanctuary-facing facades and guest drop-offs."
            checked={premium.powerWashing}
            onCheckedChange={(value) => premium.handlePremiumServiceChange("premiumPowerWashing", value)}
          />
          <PremiumToggle
            label="Debris Removal"
            description="Parking islands and curbs cleared before seal."
            checked={premium.debrisRemoval}
            onCheckedChange={(value) => premium.handlePremiumServiceChange("premiumDebrisRemoval", value)}
          />
        </div>
      </section>

      <div className="flex items-center justify-between">
        <Button variant="ghost" className="text-slate-200" onClick={onBack}>
          Back to Materials
        </Button>
        <Button type="button" variant="ghost" className="group text-slate-50" onClick={onNext}>
          Continue to Review
        </Button>
      </div>
    </>
  );
}

interface NumericFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function NumericField({ label, value, onChange }: NumericFieldProps) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-slate-200/60">{label}</span>
      <Input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-1 bg-white/10 text-slate-50"
      />
    </label>
  );
}

interface PremiumToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

function PremiumToggle({ label, description, checked, onCheckedChange }: PremiumToggleProps) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4">
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-1" />
      <span className="space-y-1">
        <span className="block text-sm font-semibold text-slate-50">{label}</span>
        <span className="block text-xs text-slate-200/70">{description}</span>
      </span>
    </label>
  );
}
