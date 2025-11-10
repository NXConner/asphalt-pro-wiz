import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ComplianceIssue } from '@/modules/estimate/compliance';

interface ComplianceChecklistProps {
  issues: ComplianceIssue[];
}

export function ComplianceChecklist({ issues }: ComplianceChecklistProps) {
  return (
    <section className="rounded-2xl border border-white/15 bg-slate-950/60 p-5">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-50">Compliance Checklist</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-300/60">
          {issues.length} checkpoints
        </span>
      </header>
      <ul className="mt-4 space-y-3">
        {issues.map((issue) => (
          <li
            key={issue.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border px-3 py-2 text-sm',
              issue.status === 'pass' && 'border-emerald-400/40 bg-emerald-400/10 text-emerald-50',
              issue.status === 'warn' && 'border-amber-400/40 bg-amber-400/10 text-amber-50',
              issue.status === 'fail' && 'border-red-400/40 bg-red-400/10 text-red-50',
            )}
          >
            <StatusIcon status={issue.status} className="mt-1 h-4 w-4 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium leading-tight">{issue.label}</p>
              {issue.recommendation ? (
                <p className="text-xs opacity-80">{issue.recommendation}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusIcon({
  status,
  className,
}: {
  status: ComplianceIssue['status'];
  className?: string;
}) {
  if (status === 'pass') {
    return <CheckCircle2 className={cn('text-emerald-300', className)} />;
  }
  if (status === 'warn') {
    return <AlertTriangle className={cn('text-amber-300', className)} />;
  }
  return <XCircle className={cn('text-red-300', className)} />;
}
