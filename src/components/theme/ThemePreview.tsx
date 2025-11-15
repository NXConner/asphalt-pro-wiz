import { Activity, CalendarRange, MapPin, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export function ThemePreview() {
  return (
    <Card className="border border-white/10 bg-slate-950/80 shadow-[0_40px_120px_rgba(8,12,24,0.55)]">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-white/10 text-xs uppercase tracking-[0.3em] text-slate-100">
            Chapel Ops
          </Badge>
          <Switch checked aria-label="Demo toggle" className="pointer-events-none" />
        </div>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold uppercase tracking-[0.35em]">
          <Sparkles className="h-4 w-4" /> Preview Mission
        </CardTitle>
        <CardDescription className="text-xs text-slate-300/70">
          Demonstrates how typography, badges, and telemetry surfaces respond to the active palette.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <PreviewMetric icon={<Activity className="h-4 w-4" />} label="Segments" value="12" caption="ADA ready" />
          <PreviewMetric icon={<CalendarRange className="h-4 w-4" />} label="Mission Window" value="Jun 14 – 16" caption="Fri night prep" />
          <PreviewMetric icon={<MapPin className="h-4 w-4" />} label="Campus" value="Riverbend Chapel" caption="Henrico, VA" />
        </div>
        <Separator className="bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-[1.5fr,1fr]">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/70">
              Progress Pulse
            </h4>
            <div className="space-y-2">
              <PreviewProgress label="Scope Authoring" value={78} />
              <PreviewProgress label="Crew Assignments" value={52} tone="warning" />
              <PreviewProgress label="Client Approvals" value={32} tone="info" />
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/70">
              Rapid Actions
            </h4>
            <div className="space-y-2">
              <Button variant="default" size="sm" className="w-full justify-start gap-2">
                <Sparkles className="h-4 w-4" /> Generate Field Brief
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 border-white/20 text-slate-50">
                <Activity className="h-4 w-4" /> Run Cost Optimizer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PreviewMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption: string;
}

function PreviewMetric({ icon, label, value, caption }: PreviewMetricProps) {
  return (
    <div className="space-y-1 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-200/70">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-display text-xl tracking-[0.2em] text-slate-50">{value}</p>
      <p className="text-[0.65rem] text-slate-300/60">{caption}</p>
    </div>
  );
}

interface PreviewProgressProps {
  label: string;
  value: number;
  tone?: 'default' | 'warning' | 'info';
}

function PreviewProgress({ label, value, tone = 'default' }: PreviewProgressProps) {
  const toneClass = {
    default: 'from-orange-400/70 to-orange-300/50',
    warning: 'from-amber-400/80 to-amber-300/50',
    info: 'from-sky-400/80 to-sky-300/50',
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/60">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <Progress
        value={value}
        className="h-2 overflow-hidden rounded-full bg-white/10"
        indicatorClassName={`bg-gradient-to-r ${toneClass}`}
      />
    </div>
  );
}

