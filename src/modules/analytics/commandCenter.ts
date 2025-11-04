import { differenceInCalendarDays, parseISO } from "date-fns";

export interface JobRecord {
  id: string;
  status: string;
  name?: string | null;
  quote_value?: number | null;
  total_area_sqft?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export interface EstimateRecord {
  id: string;
  job_id: string;
  amount: number;
  total?: number | null;
  created_at: string;
}

export interface CrewAssignmentRecord {
  id: string;
  job_id: string;
  shift_start: string;
  shift_end: string;
}

export interface CommandCenterMetrics {
  totals: {
    jobs: number;
    activeJobs: number;
    completedJobs: number;
    lostJobs: number;
    totalQuoteValue: number;
    totalRevenue: number;
    totalAreaSqft: number;
  };
  efficiency: {
    averageTurnaroundDays: number | null;
    scheduledJobs: number;
  };
  revenueByMonth: Array<{ month: string; total: number }>;
  jobStatusBreakdown: Array<{ status: string; count: number; ratio: number }>;
  recentJobs: Array<{
    id: string;
    name?: string | null;
    status: string;
    quoteValue: number;
    createdAt: string;
    updatedAt?: string | null;
  }>;
  upcomingAssignments: Array<{
    id: string;
    jobId: string;
    shiftStart: string;
    shiftEnd: string;
  }>;
  alerts: Array<{
    id: string;
    severity: "info" | "warning" | "critical";
    message: string;
    detail?: string;
  }>;
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
    totalAreaSqft: 0,
  };

  const statusMap = {
    active: new Set(["pending", "in_progress", "scheduled", "draft", "open", "need_estimate", "estimated"]),
    completed: new Set(["completed", "closed"]),
    lost: new Set(["lost", "cancelled"]),
  };
  const statusCounts = new Map<string, number>();

  for (const job of jobs) {
    const quoteValue = safeNumber(job.quote_value);
    totals.totalQuoteValue += quoteValue;
    totals.totalAreaSqft += safeNumber(job.total_area_sqft);
    const status = (job.status || "").toLowerCase();
    if (statusMap.active.has(status)) totals.activeJobs += 1;
    if (statusMap.completed.has(status)) totals.completedJobs += 1;
    if (statusMap.lost.has(status)) totals.lostJobs += 1;
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  for (const estimate of estimates) {
    const value = safeNumber(estimate.total ?? estimate.amount);
    totals.totalRevenue += value;
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
      const contribution = safeNumber(estimate.total ?? estimate.amount);
      revenueByMonthMap.set(key, (revenueByMonthMap.get(key) ?? 0) + contribution);
  }

  const revenueByMonth = Array.from(revenueByMonthMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, total]) => ({ month, total }));

  const scheduledJobs = Object.keys(assignmentsByJob).length;

  const averageTurnaround =
    turnaroundCount > 0 ? Number((turnaroundAccumulator / turnaroundCount).toFixed(1)) : null;

  const jobStatusBreakdown = Array.from(statusCounts.entries())
    .map(([status, count]) => ({
      status,
      count,
      ratio: totals.jobs > 0 ? Number((count / totals.jobs).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const recentJobs = [...jobs]
    .map((job) => ({
      id: job.id,
      name: job.name ?? null,
      status: job.status,
      quoteValue: safeNumber(job.quote_value),
      createdAt: job.created_at,
      updatedAt: job.updated_at ?? null,
    }))
    .sort((a, b) => {
      const dateA = a.updatedAt ?? a.createdAt;
      const dateB = b.updatedAt ?? b.createdAt;
      return dateB.localeCompare(dateA);
    })
    .slice(0, 6);

  const now = Date.now();
  const upcomingAssignments = crewAssignments
    .map((assignment) => ({
      id: assignment.id,
      jobId: assignment.job_id,
      shiftStart: assignment.shift_start,
      shiftEnd: assignment.shift_end,
    }))
    .filter((assignment) => {
      const startValue = Date.parse(assignment.shiftStart ?? "");
      if (Number.isNaN(startValue)) return true;
      return startValue >= now - 1000 * 60 * 60 * 6;
    })
    .sort((a, b) => a.shiftStart.localeCompare(b.shiftStart))
    .slice(0, 5);

  const alerts: CommandCenterMetrics['alerts'] = [];
  const lostRatio = totals.jobs > 0 ? totals.lostJobs / totals.jobs : 0;
  if (lostRatio >= 0.25) {
    alerts.push({
      id: "loss-rate",
      severity: "warning",
      message: "Elevated mission loss rate",
      detail: `${Math.round(lostRatio * 100)}% of jobs marked lost in current window`,
    });
  }
  if (averageTurnaround !== null && averageTurnaround > 3) {
    alerts.push({
      id: "turnaround",
      severity: "warning",
      message: "Turnaround lagging",
      detail: `Average turnaround at ${averageTurnaround} days`,
    });
  }
  if (totals.totalRevenue === 0) {
    alerts.push({
      id: "revenue-zero",
      severity: "info",
      message: "No revenue recorded yet",
      detail: "Record estimates to populate revenue analytics.",
    });
  }

  return {
    totals,
    efficiency: {
      averageTurnaroundDays: averageTurnaround,
      scheduledJobs,
    },
    revenueByMonth,
    jobStatusBreakdown,
    recentJobs,
    upcomingAssignments,
    alerts,
  };
}
