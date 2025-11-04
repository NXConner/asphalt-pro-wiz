import { differenceInCalendarDays, parseISO } from "date-fns";

export interface JobRecord {
  id: string;
  status: string;
  quote_value?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface EstimateRecord {
  id: string;
  job_id: string;
  amount: number;
  created_at: string;
}

export interface CrewAssignmentRecord {
  id: string;
  job_id: string;
  scheduled_start: string;
  scheduled_end: string;
}

export interface CommandCenterMetrics {
  totals: {
    jobs: number;
    activeJobs: number;
    completedJobs: number;
    lostJobs: number;
    totalQuoteValue: number;
    totalRevenue: number;
  };
  efficiency: {
    averageTurnaroundDays: number | null;
    scheduledJobs: number;
  };
  revenueByMonth: Array<{ month: string; total: number }>;
}

function safeNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toMonthKey(dateIso: string): string {
  const date = parseISO(dateIso);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function calculateCommandCenterMetrics(
  jobs: JobRecord[],
  estimates: EstimateRecord[],
  crewAssignments: CrewAssignmentRecord[],
): CommandCenterMetrics {
  const totals = {
    jobs: jobs.length,
    activeJobs: 0,
    completedJobs: 0,
    lostJobs: 0,
    totalQuoteValue: 0,
    totalRevenue: 0,
  };

  const statusMap = {
    active: new Set(["pending", "in_progress", "scheduled", "draft", "open"]),
    completed: new Set(["completed", "closed"]),
    lost: new Set(["lost", "cancelled"]),
  };

  for (const job of jobs) {
    const quoteValue = safeNumber(job.quote_value);
    totals.totalQuoteValue += quoteValue;
    const status = (job.status || "").toLowerCase();
    if (statusMap.active.has(status)) totals.activeJobs += 1;
    if (statusMap.completed.has(status)) totals.completedJobs += 1;
    if (statusMap.lost.has(status)) totals.lostJobs += 1;
  }

  for (const estimate of estimates) {
    totals.totalRevenue += safeNumber(estimate.amount);
  }

  const assignmentsByJob = crewAssignments.reduce<Record<string, number>>((acc, assignment) => {
    acc[assignment.job_id] = (acc[assignment.job_id] ?? 0) + 1;
    return acc;
  }, {});

  const earliestEstimateByJob = new Map<string, EstimateRecord>();
  for (const estimate of estimates) {
    const existing = earliestEstimateByJob.get(estimate.job_id);
    if (!existing || existing.created_at > estimate.created_at) {
      earliestEstimateByJob.set(estimate.job_id, estimate);
    }
  }

  let turnaroundAccumulator = 0;
  let turnaroundCount = 0;
  for (const job of jobs) {
    const estimate = earliestEstimateByJob.get(job.id);
    if (!estimate) continue;
    try {
      const jobCreated = parseISO(job.created_at);
      const estimateCreated = parseISO(estimate.created_at);
      const days = Math.max(differenceInCalendarDays(estimateCreated, jobCreated), 0);
      turnaroundAccumulator += days;
      turnaroundCount += 1;
    } catch {
      // ignore date parsing issues
    }
  }

  const revenueByMonthMap = new Map<string, number>();
  for (const estimate of estimates) {
    const key = toMonthKey(estimate.created_at);
    revenueByMonthMap.set(key, (revenueByMonthMap.get(key) ?? 0) + safeNumber(estimate.amount));
  }

  const revenueByMonth = Array.from(revenueByMonthMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, total]) => ({ month, total }));

  const scheduledJobs = Object.keys(assignmentsByJob).length;

  return {
    totals,
    efficiency: {
      averageTurnaroundDays:
        turnaroundCount > 0 ? Number((turnaroundAccumulator / turnaroundCount).toFixed(1)) : null,
      scheduledJobs,
    },
    revenueByMonth,
  };
}
