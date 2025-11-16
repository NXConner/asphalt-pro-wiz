import { motion } from 'framer-motion';
import { Check, Lock, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { WorkflowStage, WorkflowStageId, WorkflowStageStatus } from '../types';

interface WorkflowTimelineProps {
  stages: WorkflowStage[];
  activeStageId: WorkflowStageId;
  onStageChange: (stageId: WorkflowStageId) => void;
}

const statusIcon = (status: WorkflowStageStatus) => {
  if (status === 'done') return <Check className="h-4 w-4" />;
  if (status === 'active') return <Play className="h-4 w-4" />;
  if (status === 'locked') return <Lock className="h-4 w-4" />;
  if (status === 'review') return <span className="h-2 w-2 rounded-full bg-amber-300" />;
  return <span className="h-2 w-2 rounded-full bg-white/50" />;
};

const statusClass = (status: WorkflowStageStatus) => {
  switch (status) {
    case 'done':
      return 'border-emerald-400/40 bg-emerald-400/5 text-emerald-200';
    case 'active':
      return 'border-white/40 bg-white/10 text-white';
    case 'blocked':
      return 'border-rose-500/40 bg-rose-500/10 text-rose-200';
    case 'review':
      return 'border-amber-400/40 bg-amber-400/10 text-amber-200';
    case 'locked':
      return 'border-white/5 bg-white/0 text-white/40';
    default:
      return 'border-white/10 bg-white/5 text-white/70';
  }
};

export function WorkflowTimeline({ stages, activeStageId, onStageChange }: WorkflowTimelineProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5/30 p-6 backdrop-blur-2xl">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-white/55">Workflow</p>
      <div className="mt-6 space-y-4">
        {stages.map((stage, index) => {
          const isActive = stage.id === activeStageId;
          return (
            <motion.div
              key={stage.id}
              className={cn(
                'relative flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition',
                statusClass(stage.status),
              )}
              layout
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30">
                  {statusIcon(stage.status)}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">{stage.eyebrow}</p>
                  <p className="text-base font-semibold">{stage.title}</p>
                  <p className="text-xs text-white/60">{stage.summary}</p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant={isActive ? 'default' : 'ghost'}
                disabled={stage.status === 'locked'}
                onClick={() => onStageChange(stage.id)}
              >
                {isActive ? 'In Progress' : 'Open'}
              </Button>
              {index < stages.length - 1 ? (
                <span className="absolute bottom-[-18px] left-[30px] h-8 w-px bg-white/10" />
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
